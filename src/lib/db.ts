import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { hashPassword } from "@/lib/password";

export const DATA_DIR = path.join(process.cwd(), "data");

const DB_PATH =
  process.env.ARKIB_DB_PATH ?? path.join(DATA_DIR, "arkib.db");

type DbRow = Record<string, unknown>;

const ADMIN_SEED = {
  email: "admin@arkib.gov.my",
  password: "arkib2024",
  name: "Nurul Aina binti Ahmad",
  role: "Pentadbir",
  institution: "MASTIC, Kementerian Sains, Teknologi dan Inovasi (MOSTI)",
};

function getUserStmt(db: DatabaseSync, email: string): DbRow {
  return (
    (db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email.toLowerCase()) as DbRow) ?? {}
  );
}

type SeedBook = {
  id: string;
  call: string;
  title: string;
  author: string;
  year: number;
  kind: "Buku" | "Tesis";
  category: string;
  language: "BM" | "EN" | "AR";
  pages: number;
  sizeMB: number;
  status: string;
  progress: number;
  uploadedAt: string;
  collatedBy: string;
};

const SEED_BOOKS: SeedBook[] = [
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
    status: "Siap",
    progress: 100,
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
    status: "Siap",
    progress: 100,
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
    status: "Siap",
    progress: 100,
    uploadedAt: "2024-12-01T08:30:00+08:00",
    collatedBy: "En. Farid",
  },
];

function runMigrations(db: DatabaseSync) {
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA busy_timeout = 10000;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Pengguna Berdaftar',
      institution TEXT,
      password_salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      call TEXT NOT NULL,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      year INTEGER NOT NULL,
      kind TEXT NOT NULL,
      category TEXT NOT NULL,
      language TEXT NOT NULL,
      pages INTEGER NOT NULL DEFAULT 0,
      size_mb REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Menunggu',
      progress INTEGER NOT NULL DEFAULT 0,
      object_key TEXT,
      uploaded_at TEXT NOT NULL,
      collated_by TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
    CREATE INDEX IF NOT EXISTS idx_books_uploaded_at ON books (uploaded_at DESC);
    CREATE INDEX IF NOT EXISTS idx_books_status ON books (status);
  `);
}

function seedUsers(db: DatabaseSync) {
  const count = db.prepare("SELECT COUNT(*) AS n FROM users").get() as DbRow;
  if (Number(count.n) > 0) return;

  const insert = db.prepare(`
    INSERT OR IGNORE INTO users (id, email, name, role, institution, password_salt, password_hash, active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `);
  const { salt, hash } = hashPassword(ADMIN_SEED.password);
  const now = new Date().toISOString();
  insert.run(
    "u-admin-0001",
    ADMIN_SEED.email.toLowerCase(),
    ADMIN_SEED.name,
    ADMIN_SEED.role,
    ADMIN_SEED.institution,
    salt,
    hash,
    now,
    now
  );
}

function seedBooks(db: DatabaseSync) {
  const count = db.prepare("SELECT COUNT(*) AS n FROM books").get() as DbRow;
  if (Number(count.n) > 0) return;

  const insert = db.prepare(`
    INSERT OR IGNORE INTO books (id, call, title, author, year, kind, category, language, pages, size_mb, status, progress, object_key, uploaded_at, collated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)
  `);
  for (const b of SEED_BOOKS) {
    insert.run(
      b.id,
      b.call,
      b.title,
      b.author,
      b.year,
      b.kind,
      b.category,
      b.language,
      b.pages,
      b.sizeMB,
      b.status,
      b.progress,
      b.uploadedAt,
      b.collatedBy
    );
  }
}

function init() {
  mkdirSync(DATA_DIR, { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  runMigrations(db);
  seedUsers(db);
  seedBooks(db);
  return db;
}

function getDb(): DatabaseSync {
  const g = globalThis as unknown as { __arkibDb?: DatabaseSync };
  if (!g.__arkibDb) g.__arkibDb = init();
  return g.__arkibDb;
}

export { getDb };

export function getAdminUser() {
  return getUserStmt(getDb(), ADMIN_SEED.email);
}
