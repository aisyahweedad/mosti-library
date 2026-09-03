import { getDb } from "@/lib/db";

type ChunkRow = {
  book_id: string;
  chunk_index: number;
  page: number | null;
  text: string;
  embedding: string;
};

export type StoredChunk = {
  bookId: string;
  chunkIndex: number;
  page: number | null;
  text: string;
  embedding: number[];
};

function rowToChunk(row: ChunkRow): StoredChunk {
  let embedding: number[] = [];
  try {
    embedding = JSON.parse(row.embedding) as number[];
  } catch {
    embedding = [];
  }
  return {
    bookId: row.book_id,
    chunkIndex: row.chunk_index,
    page: row.page,
    text: row.text,
    embedding,
  };
}

export function getChunks(bookId: string): StoredChunk[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM chunks WHERE book_id = ? ORDER BY chunk_index ASC")
    .all(bookId) as unknown as ChunkRow[];
  return rows.map(rowToChunk);
}

export function saveChunks(
  bookId: string,
  chunks: Array<{ chunkIndex: number; page: number | null; text: string; embedding: number[] }>
) {
  const db = getDb();
  const del = db.prepare("DELETE FROM chunks WHERE book_id = ?");
  const ins = db.prepare(
    "INSERT OR REPLACE INTO chunks (book_id, chunk_index, page, text, embedding) VALUES (?, ?, ?, ?, ?)"
  );
  db.exec("BEGIN");
  del.run(bookId);
  for (const c of chunks) {
    ins.run(bookId, c.chunkIndex, c.page, c.text, JSON.stringify(c.embedding));
  }
  db.exec("COMMIT");
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

export type ChunkHit = { text: string; page: number | null; score: number };

/** Semantic search scoped to a single book (in-memory cosine over its chunks). */
export function searchChunks(
  bookId: string,
  queryEmbedding: number[],
  topK = 6
): ChunkHit[] {
  return getChunks(bookId)
    .map((c) => ({ text: c.text, page: c.page, score: cosine(queryEmbedding, c.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/** Number of distinct pages that have at least one chunk for a book. */
export function countIndexedPages(bookId: string): number {
  const db = getDb();
  const row = db
    .prepare("SELECT COUNT(DISTINCT page) AS n FROM chunks WHERE book_id = ? AND page IS NOT NULL")
    .get(bookId) as { n: number };
  return Number(row.n);
}
