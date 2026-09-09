import { loadLocalEnv } from "./lib/load-env";

loadLocalEnv();

/**
 * Klasifikasikan setiap tesis yang masih memakai kategori warisan (atau semua
 * buku jika CATEGORY_FORCE=1) ke dalam Senarai Subjek Utama Sains (25 kategori)
 * menggunakan LLM dengan front-page PDF sebagai konteks.
 *
 *   CATEGORY_TRIAL=n        proses hanya n buku pertama
 *   CATEGORY_CONCURRENCY=n  pekerja selari (lalai 2)
 *   CATEGORY_FORCE=1        proses semula buku walaupun sudah diklasifikasi
 */
const TRIAL = process.env.CATEGORY_TRIAL ? Math.max(0, Number(process.env.CATEGORY_TRIAL)) : null;
const CONCURRENCY = Math.max(1, Number(process.env.CATEGORY_CONCURRENCY ?? 2));
const FORCE = process.env.CATEGORY_FORCE === "1";

async function main(): Promise<void> {
  const { listBooks, updateBookCategory } = await import("@/lib/books-data");
  const { readObject } = await import("@/lib/object-store");
  const { extractPdfFrontMatter } = await import("@/lib/pdf");
  const { LEGACY_CATEGORIES, classifyBookCategory } = await import("@/lib/categories");

  const isLegacy = (b: { category: string }) =>
    (LEGACY_CATEGORIES as readonly string[]).includes(b.category);

  const pending = listBooks().filter(
    (b) =>
      b.objectKey &&
      (FORCE || isLegacy(b)) &&
      b.status !== "Sedang Diproses" &&
      b.status !== "Menunggu"
  );

  const rows = TRIAL !== null ? pending.slice(0, TRIAL) : pending;
  console.log(
    `[mula] perlu_diklasifikasi=${pending.length} jalankan=${rows.length} concurrency=${CONCURRENCY}`
  );

  let ok = 0;
  let gagal = 0;
  const started = Date.now();

  const worker = async (bookId: string, i: number) => {
    const idx = i + 1;
    const book = listBooks().find((b) => b.id === bookId);
    if (!book || !book.objectKey) return;
    try {
      const context = [book.abstract, book.keywords.join(" ")].filter(Boolean).join(" ");
      let pages: string[] = [];
      try {
        const data = await readObject(book.objectKey);
        ({ pages } = await extractPdfFrontMatter(data, 3));
      } catch (err) {
        if (String(err).includes("NoSuchKey")) {
          console.warn(`[${idx}/${rows.length}] ${book.id} PDF tiada, klasifikasi tanpa halaman depan`);
        } else {
          throw err;
        }
      }
      const category = await classifyBookCategory(book, pages, context);
      updateBookCategory(book.id, category);
      ok++;
      const rate = ((idx / rows.length) * 100).toFixed(1);
      console.log(`[${idx}/${rows.length}] ${book.id} (${rate}%) -> ${category}`);
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
  console.log(`[selesai] masa=${elapsed}s dilabel=${ok} gagal=${gagal}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
