#!/usr/bin/env node
/**
 * Fetch a public Nextcloud share (document library) into a local directory.
 *
 * - Lists files via the public WebDAV endpoint (PROPFIND).
 * - Downloads each file with curl (`-C -` resume), throttled concurrency,
 *   and a size check against the server's `getcontentlength`.
 * - Safe to re-run: already-complete files are skipped.
 *
 * Env:
 *   NC_SHARE_URL      e.g. https://nas.example/s/TOKEN   (default: MOSTI share)
 *   NC_SHARE_TOKEN    share token that appears after /s/   (default inferred)
 *   NC_DEST_DIR       target folder (default ~/Documents/mosti-import)
 *   NC_CONCURRENCY    parallel downloads (default 4)
 *   NC_YEARS          optional comma-separated year subfolders only, e.g. "2000,2001"
 *   NC_MASTERLIST_ONLY=1   only download the master spreadsheet
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";

const execFileP = promisify(execFile);

const SHARE_URL = process.env.NC_SHARE_URL || "https://nas.vrs-global.co/s/HLpegFdsQ2pjNm4";
const TOKEN =
  process.env.NC_SHARE_TOKEN ||
  (new URL(SHARE_URL).pathname.match(/\/s\/([^/]+)/) || [])[1];
const DAV_ROOT = `${new URL(SHARE_URL).origin}/public.php/dav/files/${TOKEN}`;
const DEST = path.resolve(
  process.env.NC_DEST_DIR || path.join(process.env.HOME ?? ".", "Documents", "mosti-import")
);
const CONCURRENCY = Math.max(1, Number(process.env.NC_CONCURRENCY || 4));
const MASTERLIST = "MASTERLIST_TESIS_PENDIGITALAN.xlsx";

async function propfind(dirPath) {
  const url = `${DAV_ROOT}/${dirPath}/`;
  const res = await fetch(url, {
    method: "PROPFIND",
    headers: { Depth: "1", "Content-Type": "application/xml" },
  });
  if (!res.ok) throw new Error(`PROPFIND ${url} → ${res.status}`);
  const xml = await res.text();
  const blocks = xml.match(/<d:response>(.*?)<\/d:response>/gs) ?? [];
  const entries = [];
  for (const block of blocks) {
    const href = block.match(/<d:href>([^<]+)<\/d:href>/)?.[1];
    if (!href) continue;
    const isDir = block.includes("<d:collection/>");
    const size = Number(block.match(/<d:getcontentlength>(\d+)<\/d:getcontentlength>/)?.[1] ?? 0);
    entries.push({ href, isDir, size });
  }
  return entries;
}

async function listYears() {
  const entries = await propfind("TESIS");
  const years = entries
    .filter((e) => e.isDir)
    .map((e) => path.basename(decodeURIComponent(e.href)));
  years.sort();
  return years.filter((y) => /^\d{4}$/.test(y));
}

async function listPdfs(year) {
  const entries = await propfind(`TESIS/${year}`);
  return entries
    .filter((e) => !e.isDir && e.href.toLowerCase().endsWith(".pdf"))
    .map((e) => ({
      name: path.basename(decodeURIComponent(e.href)),
      size: e.size,
    }));
}

async function download(url, dest, expectedSize) {
  const dir = path.dirname(dest);
  await mkdir(dir, { recursive: true });
  try {
    const st = await stat(dest);
    if (st.size === expectedSize) return { dest, skipped: true, ok: true };
  } catch {
    // not present yet — proceed
  }
  const out = await execFileP("curl", [
    "-sS",
    "--retry", "8",
    "--retry-all-errors",
    "--retry-delay", "3",
    "--connect-timeout", "30",
    "--max-time", String(process.env.NC_CURL_MAX_TIME || 3600),
    "-C", "-",
    "-o", dest,
    url,
  ], { timeout: Number(process.env.NC_CURL_MAX_TIME || 3600) * 1000 + 60000 })
    .then(() => ({ ok: true }))
    .catch(() => ({ ok: false }));
  let sizeOk = false;
  try {
    const st = await stat(dest);
    sizeOk = expectedSize > 0 && st.size === expectedSize;
  } catch {
    sizeOk = false;
  }
  return { dest, skipped: false, ok: out.ok && sizeOk };
}

async function runPool(tasks, concurrency) {
  const results = [];
  let next = 0;
  async function worker() {
    while (next < tasks.length) {
      const index = next++;
      results.push(await tasks[index]());
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker));
  return results;
}

async function main() {
  console.log(`Sumber: ${DAV_ROOT}`);
  console.log(`Destinasi: ${DEST}`);
  await mkdir(DEST, { recursive: true });

  // 1) master spreadsheet (size looked up from the root listing)
  const rootEntries = await propfind("");
  const master = rootEntries.find(
    (e) => !e.isDir && path.basename(decodeURIComponent(e.href)) === MASTERLIST
  );
  const masterUrl = `${DAV_ROOT}/${encodeURIComponent(MASTERLIST)}`;
  const masterDest = path.join(DEST, MASTERLIST);
  const r = await download(masterUrl, masterDest, master?.size ?? 0);
  console.log(`${r.skipped ? "skipped" : "downloaded"} ${MASTERLIST} ${r.ok ? "ok" : "FAILED"}`);

  if (process.env.NC_MASTERLIST_ONLY === "1") return;

  // 2) year folders → PDFs
  let years = await listYears();
  if (process.env.NC_YEARS) {
    const want = new Set(process.env.NC_YEARS.split(",").map((s) => s.trim()));
    years = years.filter((y) => want.has(y));
  }
  console.log(`Tahun: ${years.join(", ")}`);

  let totalFiles = 0;
  const tasks = [];
  for (const year of years) {
    const pdfs = await listPdfs(year);
    for (const pdf of pdfs) {
      totalFiles++;
      const dest = path.join(DEST, "TESIS", year, pdf.name);
      const href = `TESIS/${year}/${encodeURIComponent(pdf.name)}`;
      tasks.push(() =>
        download(`${DAV_ROOT}/${href}`, dest, pdf.size).then((res) => {
          if (!res.skipped && !res.ok) console.error(`FAIL ${year}/${pdf.name}`);
          return res;
        })
      );
    }
  }

  console.log(`Fail: ${totalFiles}`);
  const start = performance.now();
  const results = await runPool(tasks, CONCURRENCY);

  const ok = results.filter((r) => r.ok).length;
  const skipped = results.filter((r) => r.skipped).length;
  const failed = results.length - ok - skipped;
  const secs = ((performance.now() - start) / 1000).toFixed(0);
  console.log(`Selesai: ${ok} baru, ${skipped} sedia ada, ${failed} gagal (${secs}s).`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
