import { loadLocalEnv } from "./lib/load-env";

loadLocalEnv();

/**
 * Backfill university / degree / faculty on every book that is missing them
 * by reading only the front pages of each PDF and asking the LLM to extract
 * the details. Skipped: books still being ingested (the running pipeline owns
 * those rows right now) and books already holding a value.
 *
 *   BACKFILL_TRIAL=n        process only the first n rows
 *   BACKFILL_CONCURRENCY=n  parallel workers (default 2)
 */
const TRIAL = process.env.BACKFILL_TRIAL ? Math.max(0, Number(process.env.BACKFILL_TRIAL)) : null;
const CONCURRENCY = Math.max(1, Number(process.env.BACKFILL_CONCURRENCY ?? 2));
const FORCE = process.env.BACKFILL_FORCE === "1";

async function main(): Promise<void> {
  const { listBooks, updateBookMetadata } = await import("@/lib/books-data");
  const { readObject } = await import("@/lib/object-store");
  const { extractPdfFrontMatter } = await import("@/lib/pdf");
  const { extractBookMetadata } = await import("@/lib/metadata");

  const pending = listBooks().filter(
    (b) =>
      b.objectKey &&
      (FORCE || !b.university) &&
      b.status !== "Sedang Diproses" &&
      b.status !== "Menunggu"
  );

  const rows = TRIAL !== null ? pending.slice(0, TRIAL) : pending;
  console.log(
    `[mula] perlu_diisi=${pending.length} jalankan=${rows.length} concurrency=${CONCURRENCY}`
  );

  let ok = 0;
  let gagal = 0;
  const started = Date.now();

  const worker = async (bookId: string, i: number) => {
    const idx = i + 1;
    const book = listBooks().find((b) => b.id === bookId);
    if (!book || !book.objectKey) return;
    try {
      const data = await readObject(book.objectKey);
      const { pages } = await extractPdfFrontMatter(data, 4);
      const meta = await extractBookMetadata(book, pages);
      const filled = meta.university || meta.degree || meta.faculty;
      if (filled) updateBookMetadata(book.id, meta);
      ok++;
      const rate = ((idx / rows.length) * 100).toFixed(1);
      const desc = [meta.university, meta.degree, meta.faculty].filter(Boolean).join(" | ") || "(kosong)";
      console.log(`[${idx}/${rows.length}] ${book.id} (${rate}%) ${desc}`);
    } catch (err) {
      gagal++;
      console.error(`[${idx}/${rows.length}] GAGAL ${book.id}:`, err);
    }
  };

  let next = 0;
  const pool = Array.from({ length: CONCURRENCY }, async () => {
    while (next < rows.length) {
      const i = next++;
      const book = rows[i];
      if (!book) continue;
      await worker(book.id, i);
    }
  });
  await Promise.all(pool);

  const elapsed = ((Date.now() - started) / 1000).toFixed(0);
  console.log(`[selesai] masa=${elapsed}s diisi=${ok} gagal=${gagal}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
