import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { hashPassword } from "@/lib/password";
import { migrateLegacyEmbeddings } from "@/lib/vectors";
import { LEGACY_CATEGORIES, SUBJECT_CATEGORY_NAMES } from "@/lib/categories";

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
      abstract TEXT NOT NULL DEFAULT '',
      keywords TEXT NOT NULL DEFAULT '[]',
      uploaded_at TEXT NOT NULL,
      collated_by TEXT NOT NULL
    );

    -- vector index: one row per embedded text chunk of a book
    -- (embeddings live in the vec0 table below once the index is ready)
    CREATE TABLE IF NOT EXISTS chunks (
      book_id TEXT NOT NULL,
      chunk_index INTEGER NOT NULL,
      page INTEGER,
      text TEXT NOT NULL,
      PRIMARY KEY (book_id, chunk_index)
    );

    -- book-agnostic key/value store, currently holds the embedding dimension
    CREATE TABLE IF NOT EXISTS vector_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS catalog_options (
      group_key TEXT NOT NULL,
      value TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (group_key, value)
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
    CREATE INDEX IF NOT EXISTS idx_books_uploaded_at ON books (uploaded_at DESC);
    CREATE INDEX IF NOT EXISTS idx_books_status ON books (status);
    CREATE INDEX IF NOT EXISTS idx_chunks_book_id ON chunks (book_id);
  `);

  // additive columns for books created by older schema versions
  ensureColumn(db, "books", "abstract", "TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, "books", "keywords", "TEXT NOT NULL DEFAULT '[]'");
  ensureColumn(db, "books", "university", "TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, "books", "degree", "TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, "books", "faculty", "TEXT NOT NULL DEFAULT ''");

  // one-time purge of the demo catalogue seeded in earlier versions.
  // Guarded by a meta key so real imports that reuse ids ark-0001..0012
  // (addBook numbers rows by COUNT + 1) are never deleted on later startups.
  const DEMO_PURGED_KEY = "demo_catalogue_purged";
  const demoPurged = db
    .prepare("SELECT value FROM vector_meta WHERE key = ?")
    .get(DEMO_PURGED_KEY) as { value: string } | undefined;
  if (!demoPurged) {
    db.exec(
      `DELETE FROM books WHERE id IN (
        'ark-0001','ark-0002','ark-0003','ark-0004','ark-0005','ark-0006',
        'ark-0007','ark-0008','ark-0009','ark-0010','ark-0011','ark-0012'
      )`
    );
    db.prepare(
      `INSERT OR REPLACE INTO vector_meta (key, value) VALUES (?, ?)`
    ).run(DEMO_PURGED_KEY, String(Date.now()));
  }

  // one-time migration of legacy JSON embeddings into the sqlite-vec index
  try {
    migrateLegacyEmbeddings(db);
  } catch (err) {
    console.error("[db] migrasi vektor lama gagal:", err);
  }
}

function ensureColumn(
  db: DatabaseSync,
  table: string,
  column: string,
  definition: string
) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{
    name: string;
  }>;
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
  }
}

function seedCatalogOptions(db: DatabaseSync) {
  const count = db
    .prepare("SELECT COUNT(*) AS n FROM catalog_options")
    .get() as DbRow;
  if (Number(count.n) > 0) return;

  const insert = db.prepare(
    "INSERT OR IGNORE INTO catalog_options (group_key, value, created_at) VALUES (?, ?, ?)"
  );
  const now = new Date().toISOString();
  const kinds = ["Buku", "Tesis"];
  for (const k of kinds) insert.run("kind", k, now);
  for (const c of SUBJECT_CATEGORY_NAMES) insert.run("category", c, now);
}

/** Replace the legacy tag taxonomy with the Senarai Subjek Utama Sains. */
function syncSubjectCategories(db: DatabaseSync) {
  const now = new Date().toISOString();
  const del = db.prepare("DELETE FROM catalog_options WHERE group_key = 'category' AND value = ?");
  for (const legacy of LEGACY_CATEGORIES) del.run(legacy);
  const insert = db.prepare(
    "INSERT OR IGNORE INTO catalog_options (group_key, value, created_at) VALUES (?, ?, ?)"
  );
  for (const name of SUBJECT_CATEGORY_NAMES) insert.run("category", name, now);
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

function init() {
  mkdirSync(DATA_DIR, { recursive: true });
  let db: DatabaseSync;
  try {
    db = new DatabaseSync(DB_PATH, { allowExtension: true });
  } catch {
    db = new DatabaseSync(DB_PATH);
  }
  runMigrations(db);
  seedCatalogOptions(db);
  syncSubjectCategories(db);
  seedUsers(db);
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
