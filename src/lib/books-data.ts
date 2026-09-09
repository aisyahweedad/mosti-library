import { getDb } from "@/lib/db";
import type {
  Book,
  BookKind,
  BookLanguage,
  BookStatus,
  NewBookInput,
} from "@/lib/book-types";
export type {
  Book,
  BookKind,
  BookLanguage,
  BookStatus,
  NewBookInput,
} from "@/lib/book-types";
export { BOOK_STATUSES, BOOK_LANGUAGES, MONTHLY_UPLOADS } from "@/lib/book-types";

type BookRow = {
  id: string;
  call: string;
  title: string;
  author: string;
  year: number;
  kind: BookKind;
  category: string;
  language: BookLanguage;
  pages: number;
  size_mb: number;
  status: BookStatus;
  progress: number;
  object_key: string | null;
  abstract: string;
  keywords: string;
  university: string;
  degree: string;
  faculty: string;
  uploaded_at: string;
  collated_by: string;
};

function parseKeywords(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // fall through to comma-splitting below
  }
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function rowToBook(row: BookRow): Book {
  return {
    id: row.id,
    call: row.call,
    title: row.title,
    author: row.author,
    year: row.year,
    kind: row.kind,
    category: row.category,
    language: row.language,
    pages: row.pages,
    sizeMB: row.size_mb,
    status: row.status,
    progress: row.progress,
    uploadedAt: row.uploaded_at,
    collatedBy: row.collated_by,
    objectKey: row.object_key,
    abstract: row.abstract ?? "",
    keywords: parseKeywords(row.keywords ?? "[]"),
    university: row.university ?? "",
    degree: row.degree ?? "",
    faculty: row.faculty ?? "",
  };
}

function pad(n: number) {
  return String(n).padStart(4, "0");
}

export function updateBookProcessing(
  id: string,
  status: BookStatus,
  progress: number
) {
  getDb()
    .prepare("UPDATE books SET status = ?, progress = ? WHERE id = ?")
    .run(status, progress, id);
}

export function markBookReady(
  id: string,
  abstract: string,
  keywords: string[],
  extra: { university?: string; degree?: string; faculty?: string } = {}
) {
  getDb()
    .prepare(
      "UPDATE books SET status = 'Siap', progress = 100, abstract = ?, keywords = ?, university = ?, degree = ?, faculty = ? WHERE id = ?"
    )
    .run(
      abstract,
      JSON.stringify(keywords),
      extra.university ?? "",
      extra.degree ?? "",
      extra.faculty ?? "",
      id
    );
}

export function updateBookMetadata(
  id: string,
  meta: { university?: string; degree?: string; faculty?: string }
) {
  const sets: string[] = [];
  const values: string[] = [];
  for (const [col, val] of Object.entries(meta)) {
    if (val === undefined) continue;
    if (!["university", "degree", "faculty"].includes(col)) continue;
    sets.push(`${col} = ?`);
    values.push(String(val));
  }
  if (sets.length === 0) return;
  getDb().prepare(`UPDATE books SET ${sets.join(", ")} WHERE id = ?`).run(
    ...values,
    id
  );
}

export function updateBookCategory(id: string, category: string) {
  getDb()
    .prepare("UPDATE books SET category = ? WHERE id = ?")
    .run(category, id);
}

export function markBookUploaded(id: string) {
  getDb()
    .prepare("UPDATE books SET status = 'Dimuat Naik', progress = 100 WHERE id = ?")
    .run(id);
}

export function markBookFailed(id: string) {
  getDb()
    .prepare("UPDATE books SET status = 'Gagal', progress = 100 WHERE id = ?")
    .run(id);
}

export function listBooks(): Book[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT * FROM books ORDER BY uploaded_at DESC"
    )
    .all() as unknown as BookRow[];
  return rows.map(rowToBook);
}

export function getBook(id: string): Book | undefined {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM books WHERE id = ?")
    .get(id) as unknown as BookRow | undefined;
  return row ? rowToBook(row) : undefined;
}

export function addBook(
  input: NewBookInput,
  opts: { objectKey?: string | null; collatedBy?: string } = {}
): Book {
  const db = getDb();
  const uploadedAt = new Date().toISOString();
  const collatedBy = opts.collatedBy || "Anda";
  const nextNum = () =>
    (db
      .prepare("SELECT CAST(SUBSTR(id, 5) AS INTEGER) AS n FROM books")
      .all() as unknown as { n: number }[]).reduce(
      (m, r) => Math.max(m, r.n ?? 0),
      0
    ) + 1;

  for (let attempt = 0; attempt < 10; attempt++) {
    const num = pad(nextNum());
    const id = `ark-${num}`;
    const call = `${input.kind === "Tesis" ? "TESIS" : "BUKU"}.ARK-${input.year}-${num}`;
    try {
      db.prepare(
        `INSERT INTO books (id, call, title, author, year, kind, category, language, pages, size_mb, status, progress, object_key, uploaded_at, collated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu', 0, ?, ?, ?)`
      ).run(
        id,
        call,
        input.title,
        input.author,
        input.year,
        input.kind,
        input.category,
        input.language,
        input.pages,
        input.sizeMB,
        opts.objectKey ?? null,
        uploadedAt,
        collatedBy
      );
      return getBook(id)!;
    } catch (err) {
      if (
        !(err instanceof Error) ||
        !err.message.includes("UNIQUE constraint failed")
      ) {
        throw err;
      }
    }
  }
  throw new Error("Tidak dapat menjana id unik untuk buku");
}

export function removeBook(id: string): Book | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM books WHERE id = ?")
    .get(id) as unknown as BookRow | undefined;
  if (!row) return null;
  db.exec("BEGIN");
  db.prepare("DELETE FROM chunks WHERE book_id = ?").run(id);
  db.prepare("DELETE FROM books WHERE id = ?").run(id);
  db.exec("COMMIT");
  return rowToBook(row);
}

export function adminStats() {
  const db = getDb();
  const total = (db.prepare("SELECT COUNT(*) AS n FROM books").get() as { n: number }).n;
  const byKind = (k: BookKind) =>
    (db.prepare("SELECT COUNT(*) AS n FROM books WHERE kind = ?").get(k) as {
      n: number;
    }).n;
  const byStatus = (s: BookStatus) =>
    (db.prepare("SELECT COUNT(*) AS n FROM books WHERE status = ?").get(s) as {
      n: number;
    }).n;
  const totalMb = (
    db.prepare("SELECT COALESCE(SUM(size_mb), 0) AS s FROM books").get() as {
      s: number;
    }
  ).s;
  return {
    total,
    books: byKind("Buku"),
    theses: byKind("Tesis"),
    ready: byStatus("Siap"),
    uploaded: byStatus("Dimuat Naik"),
    processing: byStatus("Sedang Diproses"),
    waiting: byStatus("Menunggu"),
    failed: byStatus("Gagal"),
    storageGB: Math.round((totalMb / 1024) * 100) / 100,
  };
}
