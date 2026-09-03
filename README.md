# ARKIB — Pustaka Digital Kebangsaan

Prototaip antaramuka untuk arkib tesis &amp; disertasi kebangsaan berkuasa AI.
Dibina dengan Next.js 14 (App Router), Tailwind CSS + shadcn/ui, TanStack
Query/Table/Virtual, dengan gaya tema MOSTI.

## Stack

| Lapisan          | Teknologi                                                |
| ---------------- | -------------------------------------------------------- |
| Frontend         | Next.js 14 · React 18 · TypeScript                       |
| UI               | Tailwind CSS v3 · shadcn/ui (Radix primitives)           |
| State & data     | TanStack Query 5 · TanStack Table 8 · TanStack Virtual 3 |
| Carian instant   | Slot `src/lib/search.ts` — sedia untuk Meilisearch       |
| Chat (streaming) | Vercel AI SDK v3 (`useChat`)                             |
| Auth             | JWS token (`jose`) + cookie sesi httpOnly                |
| App DB           | SQLite (`node:sqlite`, fail `data/arkib.db`, WAL)        |
| Storan objek     | RustFS (S3-compatible) untuk fail buku; fallback cakera  |
| Form             | react-hook-form + zod validasi                          |
| Carta dashboard  | recharts                                                 |

## Mulakan

```bash
npm install
npm run dev        # http://localhost:3000
```

RustFS (storan objek, S3-compatible) — jalankan sekali sebagai servis dev:

```bash
docker run -d --name rustfs -p 9000:9000 -p 9001:9001 \
  -v rustfs-data:/data -v rustfs-logs:/logs rustfs/rustfs:latest
```

Konsol RustFS: `http://localhost:9001` (kredensial lalai `rustfsadmin`/`rustfsadmin`).
Bucket `arkib` dicipta automatik pada muat naik pertama. Seterusnya salin
nilai `RUSTFS_*` di bawah ke dalam `.env.local`.

Pemboleh ubah persekitaran dalam `.env.local`:

```
JWT_SECRET=...                          # kunci sesi (tukar untuk produksi)
RUSTFS_ENDPOINT=http://localhost:9000   # alamat RustFS (S3 API)
RUSTFS_ACCESS_KEY=rustfsadmin
RUSTFS_SECRET_KEY=rustfsadmin
RUSTFS_BUCKET=arkib
ARKIB_DB_PATH=                          # pilihan; lalai data/arkib.db
```

Jika `RUSTFS_ENDPOINT` tiada, fail muat naik jatuh ke cakera tempatan
(`data/uploads/`) supaya pembangunan tanpa RustFS tetap berfungsi.

Kredensial demo (prototaip):

```
E-mel:   admin@arkib.gov.my
Laluan:  arkib2024
```

## Cara ia berfungsi sekarang

* **Data**: 56 tesis contoh dalam `src/lib/theses-data.ts`. Disediakan melalui
  API mock—`/api/theses`, `/api/theses/[id]`, `/api/stats`.
* **App DB**: SQLite (`node:sqlite`, sedia ada dalam Node 22.5+). Jadual
  `users` (pentadbir demo di-seed dengan scrypt hash) dan `books` (metadata
  dokumen + `object_key`). Disimpan dalam `data/arkib.db` (WAL) — kekal
  selepas mulakan semula. Skema di-migrasi automatik dalam `src/lib/db.ts`.
* **Storan objek**: fail PDF/DjVu dimuat naik disimpan ke RustFS melalui
  S3 API (`@aws-sdk/client-s3`, path-style) dengan kunci `books/<id>.pdf`.
  Muat turun melalui URL pra-tandatangan 5 minit; padam juga membuang objek.
  Lapisan abstraksi dalam `src/lib/object-store.ts` — tukar ke MinIO/S3 lain
  hanya dengan mengubah env.
* **Carian**: `src/lib/search.ts` menjalankan penilaian padanan setempat dengan
  toleransi ejaan (Levenshtein ≤ 3 aksara) untuk meniru kelakuan Meilisearch.
  Tukar probe dalaman kepada client Meilisearch tanpa menyentuh UI.
* **Chat**: `/api/chat` aktif menstrim jawapan ("menaip" macam ChatGPT)
  menggunakan format data-stream v1 Vercel AI SDK. Untuk jana jawapan sebenar,
  ganti fungsi `buildAnswer` dengan `streamText` + model (cth. `@ai-sdk/anthropic`)
  dan masukkan semula semantik daripada teks OCR.
* **Pentadbiran**: `/login` → `/admin` dilindungi oleh middleware JWS dan
  semakan lapisan pelayan. Kredensial disahkan terhadap jadual `users` dalam
  SQLite (scrypt). Buku disimpan dalam SQLite dengan kitaran hidup OCR simulasi
  (Menunggu → Sedang Diproses → Siap) menulis balik ke DB; kitaran sedia ada
  disambung semula selepas mulakan semula. Ganti logik simulasi dalam
  `src/lib/books-data.ts` dengan barisan kerja OCR sebenar.

## Seni bina laluan

```
/                    Laman utama — hero, carian ⌘K, statistik, katalog
/tesis/[id]          Halaman tesis statik (SEO) — ringkasan AI + chat
/login               Log masuk pentadbir (react-hook-form + zod)
/admin/dashboard     Statistik, carta muat naik & status OCR
/admin/upload        Muat naik buku/tesis baharu (drag-drop)
/admin/books         Senarai buku — carian, tapisan, status OCR, padam
/admin/users         Pengguna berdaftar institusi penyumbang
/api/login|logout|session   Auth mock (JWS token 24 jam)
/api/admin/*         Endpoint pentadbiran (disahkan sesi)
/api/admin/books/[id]/file   Muat turun PDF (redirect URL pra-tandatangan RustFS)
/api/theses          Carian/tapisan katalog (query, faculty, page, pageSize)
/api/theses/[id]     Satu tesis + tesis berkaitan
/api/chat            POST stream — chat berasaskan dokumen
```

## Nota keluaran

* Next.js di-pin ke `14.2.35` (tambalan isu keselamatan terkini untuk v14).
* Tema boleh dilaras melalui pembolehubah CSS dalam `src/app/globals.css`
  (warna utama MOSTI biru · accent biru/emerald).
* Kunci sesi taraf pembangunan di `JWT_SECRET` dalam `.env.local` — gantikan
  dengan kunci rawak dalam pengeluaran.
