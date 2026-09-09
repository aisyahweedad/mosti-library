import { existsSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { loadLocalEnv } from "./lib/load-env";
import { parseMasterlist, type MasterRow } from "./lib/xlsx";

loadLocalEnv();

async function walkPdfs(dir: string, prefix = ""): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const entries = await readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    const rel = prefix ? path.join(prefix, ent.name) : ent.name;
    if (ent.isDirectory()) {
      const sub = await walkPdfs(full, rel);
      for (const [k, v] of sub) out.set(k, v);
    } else if (ent.name.toLowerCase().endsWith(".pdf")) {
      if (out.has(ent.name)) {
        console.warn(`[warn] nama fail tidak unik: ${ent.name}`);
      }
      out.set(ent.name, rel);
    }
  }
  return out;
}

function resolveLocal(
  row: MasterRow,
  dest: string,
  byBasename: Map<string, string>
): string | null {
  const parts = row.fullPath.replace(/\\/g, "/").split("/").filter(Boolean);
  const i = parts.indexOf("TESIS");
  let rel = i >= 0 ? parts.slice(i).join("/") : "";
  if (!rel) rel = byBasename.get(parts[parts.length - 1] ?? "") ?? "";
  if (!rel) return null;
  const local = path.join(dest, rel);
  return existsSync(local) ? local : null;
}

const DEST = path.resolve(
  process.env.NC_DEST_DIR ?? path.join(os.homedir(), "Documents", "mosti-import")
);
const XLSX = path.join(DEST, "MASTERLIST_TESIS_PENDIGITALAN.xlsx");
const CONCURRENCY = Math.max(1, Number(process.env.IMPORT_CONCURRENCY ?? 6));
const TRIAL = process.env.IMPORT_TRIAL ? Math.max(0, Number(process.env.IMPORT_TRIAL)) : null;
const YEARS = process.env.IMPORT_YEARS
  ? new Set(process.env.IMPORT_YEARS.split(",").map((s) => s.trim()).filter(Boolean))
  : null;
const DRY = process.env.IMPORT_DRY === "1";
const KIND = process.env.IMPORT_KIND ?? "Tesis";
const CATEGORY = process.env.IMPORT_CATEGORY ?? "Umum";
const LANGUAGE = (["BM", "EN", "AR"].includes(process.env.IMPORT_LANGUAGE ?? "")
  ? process.env.IMPORT_LANGUAGE
  : "BM") as "BM" | "EN" | "AR";
const COLLATED_BY = process.env.IMPORT_COLLATED_BY ?? "Import Mosti (Nextcloud)";
const UNTIL_DONE = process.env.IMPORT_UNTIL_DONE === "1";
const EMBED = process.env.IMPORT_EMBED !== "0";
const RETRY_DELAY_MS = Math.max(1000, Number(process.env.IMPORT_RETRY_DELAY_MS ?? 60000));
const MAX_PASSES = Math.max(1, Number(process.env.IMPORT_MAX_PASSES ?? 500));

const rowKey = (r: MasterRow) => `${r.title}||${r.year}||${r.author}`;

let remainingPasses = MAX_PASSES;

async function main(): Promise<void> {
  if (!existsSync(XLSX)) {
    console.error(`masterlist tidak dijumpai: ${XLSX}`);
    process.exit(1);
  }

  if (DRY) {
    const rows = parseMasterlist(XLSX);
    const byBasename = await walkPdfs(path.join(DEST, "TESIS"));
    let missing = 0;
    for (const r of rows) {
      if (!resolveLocal(r, DEST, byBasename)) {
        missing++;
        if (missing <= 20) console.log("TIDAK ADA setempat:", r.fullPath);
      }
    }
    console.log(
      `[dry-run] masterlist=${rows.length} ada_ditempat=${rows.length - missing} tiada=${missing}`
    );
    return;
  }

  const { addBook, listBooks } = await import("@/lib/books-data");
  const { putObject } = await import("@/lib/object-store");
  const { ingestBook } = await import("@/lib/ingest");

  const existing = new Map<string, { id: string; status: string }>();
  for (const b of listBooks()) {
    existing.set(`${b.title}||${b.year}||${b.author}`, { id: b.id, status: b.status });
  }

  let rows = parseMasterlist(XLSX);
  if (YEARS) rows = rows.filter((r) => YEARS.has(String(r.year)));
  if (TRIAL !== null) rows = rows.slice(0, TRIAL);

  const byBasename = await walkPdfs(path.join(DEST, "TESIS"));
  console.log(
    `[mula] fail=${rows.length} concurrency=${CONCURRENCY} kind=${KIND} category=${CATEGORY} bahasa=${LANGUAGE} embed=${EMBED} dry=${DRY}`
  );

  let siap = 0;
  let diproses = 0;
  let dimuatnaik = 0;
  let gagal = 0;
  let dilangkau = 0;
  const started = Date.now();

  const worker = async (row: MasterRow, i: number) => {
    const idx = i + 1;
    const label = `${row.fullPath.split(/[\\/]/).pop() ?? row.title}`;
    const local = resolveLocal(row, DEST, byBasename);
    if (!local) {
      gagal++;
      console.log(`[${idx}/${rows.length}] TIADA FILE: ${label}`);
      return;
    }
    const key = rowKey(row);
    const prior = existing.get(key);
    if (prior && prior.status === "Siap") {
      dilangkau++;
      console.log(`[${idx}/${rows.length}] langkau (sudah Siap): ${label}`);
      return;
    }
    if (prior && prior.status === "Dimuat Naik" && !EMBED) {
      dilangkau++;
      console.log(`[${idx}/${rows.length}] langkau (sudah dimuat naik): ${label}`);
      return;
    }
    try {
      const st = await stat(local);
      const pages = Number(row.pages) > 0 ? row.pages : 0;
      const sizeMB = Math.round((st.size / 1024 / 1024) * 100) / 100;
      let bookId = prior?.id;
      if (!bookId) {
        const book = addBook(
          {
            title: row.title,
            author: row.author,
            year: row.year,
            kind: KIND,
            category: CATEGORY,
            language: LANGUAGE,
            pages,
            sizeMB,
          },
          { collatedBy: COLLATED_BY, objectKey: null }
        );
        bookId = book.id;
        existing.set(key, { id: book.id, status: book.status });
      } else if (prior.status !== "Menunggu") {
        await import("@/lib/books-data").then(({ updateBookProcessing }) =>
          updateBookProcessing(bookId!, "Menunggu", 0)
        );
      }
      const objectKey = `books/${bookId}.pdf`;
      const bytes = await readFile(local);
      await putObject(objectKey, new Uint8Array(bytes));
      await import("@/lib/db").then(({ getDb }) =>
        getDb()
          .prepare("UPDATE books SET object_key = ? WHERE id = ?")
          .run(objectKey, bookId)
      );
      if (EMBED) {
        await ingestBook(bookId);
      } else {
        const { markBookUploaded } = await import("@/lib/books-data");
        markBookUploaded(bookId);
      }
      const final = (await import("@/lib/books-data")).getBook(bookId);
      const status = final?.status ?? "?";
      if (status === "Siap") siap++;
      else if (status === "Dimuat Naik") dimuatnaik++;
      else if (status === "Gagal") gagal++;
      else diproses++;
      existing.set(key, { id: bookId, status });
      const rate = ((idx / rows.length) * 100).toFixed(1);
      console.log(`[${idx}/${rows.length}] ${status} ${bookId} ... (${rate}%) ${label}`);
    } catch (err) {
      gagal++;
      console.error(`[${idx}/${rows.length}] GAGAL ${label}:`, err);
    }
  };

  let next = 0;
  const pool = Array.from({ length: CONCURRENCY }, async () => {
    while (next < rows.length) {
      const i = next++;
      await worker(rows[i] as MasterRow, i);
    }
  });
  await Promise.all(pool);

  const elapsed = ((Date.now() - started) / 1000).toFixed(0);
  console.log(
    `[selesai] masa=${elapsed}s siap=${siap} dimuat_naik=${dimuatnaik} diproses=${diproses} gagal=${gagal} langkau=${dilangkau}`
  );

  const done = siap + dilangkau + dimuatnaik;
  if (UNTIL_DONE && done < rows.length) {
    const remain = rows.length - done;
    if (remainingPasses <= 1) {
      console.log(`[habis] masih ${remain} buku belum Siap; henti selepas resort percubaan.`);
      return;
    }
    remainingPasses--;
    const wait = Math.max(1, Math.round(RETRY_DELAY_MS / 1000));
    console.log(
      `[ulang] masih ${remain} buku belum Siap; semula dalam ${wait}s (baki ${remainingPasses} pusingan)`
    );
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    await main();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
