export type BookStatus = "Siap" | "Sedang Diproses" | "Menunggu" | "Gagal";

export type BookKind = "Buku" | "Tesis";

export const BOOK_KINDS: BookKind[] = ["Buku", "Tesis"];

export const BOOK_STATUSES: BookStatus[] = [
  "Siap",
  "Sedang Diproses",
  "Menunggu",
  "Gagal",
];

export type Book = {
  id: string;
  call: string;
  title: string;
  author: string;
  year: number;
  kind: BookKind;
  category: string;
  language: "BM" | "EN" | "AR";
  pages: number;
  sizeMB: number;
  status: BookStatus;
  progress: number;
  uploadedAt: string;
  collatedBy: string;
};

export type NewBookInput = {
  title: string;
  author: string;
  year: number;
  kind: BookKind;
  category: string;
  language: Book["language"];
  pages: number;
  sizeMB: number;
};

let books: Book[] = [
  {
    id: "ark-0001",
    call: "MST523.9009595",
    title: "Kesan Aplikasi Nanoteknologi dalam Pertanian Lestari",
    author: "Dr. Sallehuddin bin Mat Nor",
    year: 2023,
    kind: "Buku",
    category: "Sains & Teknologi",
    language: "BM",
    pages: 312,
    sizeMB: 8.4,
    status: "Siap",
    progress: 100,
    uploadedAt: "2024-11-28T09:12:00+08:00",
    collatedBy: "Puan Aisyah",
  },
  {
    id: "ark-0002",
    call: "Tesis PIX 2023/04",
    title: "Pengoptimuman Tenaga Suria untuk Bangunan Pintar di KL",
    author: "Tan Kee How",
    year: 2023,
    kind: "Tesis",
    category: "Kejuruteraan",
    language: "EN",
    pages: 148,
    sizeMB: 6.1,
    status: "Sedang Diproses",
    progress: 62,
    uploadedAt: "2024-12-02T10:30:00+08:00",
    collatedBy: "En. Farid",
  },
  {
    id: "ark-0003",
    call: "MST630.1",
    title: "Ekonomi Kitaran: Model Rantaian Nilai Plastik di Malaysia",
    author: "Dr. Devi a/p Krishnan",
    year: 2022,
    kind: "Buku",
    category: "Sains Sosial",
    language: "BM",
    pages: 268,
    sizeMB: 5.9,
    status: "Siap",
    progress: 100,
    uploadedAt: "2024-11-15T14:05:00+08:00",
    collatedBy: "Puan Aisyah",
  },
  {
    id: "ark-0004",
    call: "Tesis FSK 2022/11",
    title: "Keselamatan Siber dalam Internet Perkara (IoT) Industri 4.0",
    author: "Muhammad Iqbal bin Zakaria",
    year: 2022,
    kind: "Tesis",
    category: "Teknologi Maklumat",
    language: "BM",
    pages: 176,
    sizeMB: 7.2,
    status: "Gagal",
    progress: 34,
    uploadedAt: "2024-10-20T08:45:00+08:00",
    collatedBy: "En. Farid",
  },
  {
    id: "ark-0005",
    call: "MST577.3",
    title: "Bioteknologi Kefarmasian: Kaedah dan Amalan Makmal",
    author: "Prof. Madya Dr. Rahimah binti Yusof",
    year: 2021,
    kind: "Buku",
    category: "Perubatan & Kesihatan",
    language: "BM",
    pages: 404,
    sizeMB: 11.3,
    status: "Siap",
    progress: 100,
    uploadedAt: "2024-09-08T15:20:00+08:00",
    collatedBy: "Puan Aisyah",
  },
  {
    id: "ark-0006",
    call: "Tesis FST 2021/02",
    title: "Analisis Prestasi Pam Haba Geoterma di Sabah",
    author: "Siti Norlela binti Hassan",
    year: 2021,
    kind: "Tesis",
    category: "Kejuruteraan",
    language: "BM",
    pages: 132,
    sizeMB: 5.4,
    status: "Siap",
    progress: 100,
    uploadedAt: "2024-08-19T11:00:00+08:00",
    collatedBy: "En. Farid",
  },
  {
    id: "ark-0007",
    call: "MST510.1",
    title: "Sains Data untuk Polisi Awam di ERA Digital",
    author: "Dr. Ahmad Zulhaimi bin Abdullah",
    year: 2024,
    kind: "Buku",
    category: "Teknologi Maklumat",
    language: "BM",
    pages: 288,
    sizeMB: 9.7,
    status: "Siap",
    progress: 100,
    uploadedAt: "2024-11-30T09:40:00+08:00",
    collatedBy: "Puan Aisyah",
  },
  {
    id: "ark-0008",
    call: "Tesis FKJ 2020/09",
    title: "Modal Bahasa: Pelantar AI Berbahasa Melayu Untuk Pendidikan",
    author: "Lim Wei Sheng",
    year: 2020,
    kind: "Tesis",
    category: "Sains Sosial",
    language: "EN",
    pages: 158,
    sizeMB: 6.8,
    status: "Siap",
    progress: 100,
    uploadedAt: "2024-07-12T13:15:00+08:00",
    collatedBy: "En. Farid",
  },
  {
    id: "ark-0009",
    call: "MST662.7",
    title: "Logistik Hijau: Pengangkutan Mampan di Koridor Ekonomi",
    author: "Dr. Norazman bin Daud",
    year: 2023,
    kind: "Buku",
    category: "Sains Sosial",
    language: "BM",
    pages: 244,
    sizeMB: 7.6,
    status: "Siap",
    progress: 100,
    uploadedAt: "2024-11-05T10:10:00+08:00",
    collatedBy: "Puan Aisyah",
  },
  {
    id: "ark-0010",
    call: "Tesis FKE 2023/15",
    title: "Mikroled Berasaskan Perovskit untuk Paparan Fleksibel",
    author: "Chong Mei Ling",
    year: 2023,
    kind: "Tesis",
    category: "Kejuruteraan",
    language: "EN",
    pages: 121,
    sizeMB: 4.9,
    status: "Menunggu",
    progress: 0,
    uploadedAt: "2024-12-03T16:50:00+08:00",
    collatedBy: "En. Farid",
  },
  {
    id: "ark-0011",
    call: "MST363.7",
    title: "Perbandingan Kopoli Karbon Bawah Tanah di Dataran Kapur",
    author: "Dr. Marlina binti Osman",
    year: 2022,
    kind: "Buku",
    category: "Sains & Teknologi",
    language: "BM",
    pages: 356,
    sizeMB: 10.2,
    status: "Siap",
    progress: 100,
    uploadedAt: "2024-06-25T09:05:00+08:00",
    collatedBy: "Puan Aisyah",
  },
  {
    id: "ark-0012",
    call: "Tesis FSK 2024/01",
    title: "Pengukuhan Identiti Digital untuk Gerbang Kerajaan Persekutuan",
    author: "Nik Nurul Huda binti Nik Ismail",
    year: 2024,
    kind: "Tesis",
    category: "Teknologi Maklumat",
    language: "BM",
    pages: 189,
    sizeMB: 8.0,
    status: "Sedang Diproses",
    progress: 88,
    uploadedAt: "2024-12-01T08:30:00+08:00",
    collatedBy: "En. Farid",
  },
];

function pad(n: number) {
  return String(n).padStart(4, "0");
}

function runOcrLifecycle(id: string) {
  const book = books.find((b) => b.id === id);
  if (!book) return;
  book.status = "Sedang Diproses";
  const tick = () => {
    const current = books.find((b) => b.id === id);
    if (!current || current.status === "Gagal") return;
    const next = Math.min(100, current.progress + 11 + Math.round(Math.random() * 14));
    current.progress = next;
    if (next >= 100) {
      current.status = "Siap";
    } else {
      setTimeout(tick, 900);
    }
  };
  setTimeout(tick, 700);
}

export function listBooks(): Book[] {
  return [...books].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export function getBook(id: string): Book | undefined {
  return books.find((b) => b.id === id);
}

export function addBook(input: NewBookInput): Book {
  const num = pad(books.length + 1);
  const id = `ark-${num}`;
  const book: Book = {
    ...input,
    id,
    call: `${input.kind === "Tesis" ? "TESIS" : "BUKU"}.ARK-${input.year}-${num}`,
    status: "Menunggu",
    progress: 0,
    uploadedAt: new Date().toISOString(),
    collatedBy: "Anda",
  };
  books = [book, ...books];
  runOcrLifecycle(id);
  return book;
}

export function removeBook(id: string): boolean {
  const before = books.length;
  books = books.filter((b) => b.id !== id);
  return books.length < before;
}

export function adminStats() {
  const total = books.length;
  const byKind = (k: BookKind) => books.filter((b) => b.kind === k).length;
  const byStatus = (s: BookStatus) => books.filter((b) => b.status === s).length;
  const totalMb = books.reduce((sum, b) => sum + b.sizeMB, 0);
  return {
    total,
    books: byKind("Buku"),
    theses: byKind("Tesis"),
    ready: byStatus("Siap"),
    processing: byStatus("Sedang Diproses"),
    waiting: byStatus("Menunggu"),
    failed: byStatus("Gagal"),
    storageGB: Math.round((totalMb / 1024) * 100) / 100,
  };
}

export const MONTHLY_UPLOADS = [
  { month: "Jun", value: 8 },
  { month: "Jul", value: 11 },
  { month: "Ogos", value: 15 },
  { month: "Sep", value: 10 },
  { month: "Okt", value: 17 },
  { month: "Nov", value: 22 },
  { month: "Dis", value: 14 },
];
