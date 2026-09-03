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
| Form             | react-hook-form + zod validasi                          |
| Carta dashboard  | recharts                                                 |

## Mulakan

```bash
npm install
npm run dev        # http://localhost:3000
```

Kredensial demo (prototaip):

```
E-mel:   admin@arkib.gov.my
Laluan:  arkib2024
```

## Cara ia berfungsi sekarang

* **Data**: 56 tesis contoh dalam `src/lib/theses-data.ts`. Disediakan melalui
  API mock—`/api/theses`, `/api/theses/[id]`, `/api/stats`.
* **Carian**: `src/lib/search.ts` menjalankan penilaian padanan setempat dengan
  toleransi ejaan (Levenshtein ≤ 3 aksara) untuk meniru kelakuan Meilisearch.
  Tukar probe dalaman kepada client Meilisearch tanpa menyentuh UI.
* **Chat**: `/api/chat` aktif menstrim jawapan ("menaip" macam ChatGPT)
  menggunakan format data-stream v1 Vercel AI SDK. Untuk jana jawapan sebenar,
  ganti fungsi `buildAnswer` dengan `streamText` + model (cth. `@ai-sdk/anthropic`)
  dan masukkan semula semantik daripada teks OCR.
* **Pentadbiran**: `/login` → `/admin` dilindungi oleh middleware JWS dan
  semakan lapisan pelayan. Buku & tesis disimpan dalam memori
  (`src/lib/books-data.ts`) dengan kitaran hidup OCR simulasi (Menunggu →
  Sedang Diproses → Siap). Ganti `addBook`/`listBooks` dengan panggilan DB/sebenar.

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
