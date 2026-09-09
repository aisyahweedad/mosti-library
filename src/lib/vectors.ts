import { DatabaseSync } from "node:sqlite";
import { getLoadablePath } from "sqlite-vec";

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

const VEC_TABLE = "chunk_vec";
const VEC_META_KEY = "embedding_dim";

let vecLoaded = false;
let chunkEmbeddingColumn: boolean | null = null;

function chunksHaveEmbedding(db: DatabaseSync): boolean {
  if (chunkEmbeddingColumn == null) {
    const cols = db.prepare("PRAGMA table_info(chunks)").all() as Array<{
      name: string;
    }>;
    chunkEmbeddingColumn = cols.some((c) => c.name === "embedding");
  }
  return chunkEmbeddingColumn;
}

/** Enable the sqlite-vec extension on the database handle. */
export function loadVectorExtension(db: DatabaseSync): boolean {
  if (vecLoaded) return true;
  try {
    const path = getLoadablePath().replace(/\.(so|dylib|dll)$/, "");
    (db as unknown as { loadExtension(path: string): void }).loadExtension(path); // node:sqlite re-appends the platform suffix
    vecLoaded = true;
    return true;
  } catch (err) {
    console.error("[vec] sqlite-vec tidak dapat dimuat:", err);
    return false;
  }
}

function createVecTable(db: DatabaseSync, dim: number) {
  db.exec(
    `CREATE VIRTUAL TABLE IF NOT EXISTS ${VEC_TABLE} USING vec0(
       embedding float[${dim}] distance_metric=cosine,
       partition_by text,
       chunk_index text
     )`
  );
}

function getVectorDim(db: DatabaseSync): number | null {
  const row = db
    .prepare("SELECT value FROM vector_meta WHERE key = ?")
    .get(VEC_META_KEY) as { value: string } | undefined;
  return row ? Number(row.value) : null;
}

function setVectorDim(db: DatabaseSync, dim: number) {
  db.prepare(
    `INSERT INTO vector_meta (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(VEC_META_KEY, String(dim));
}

/** Largest embedding dimension still present in the legacy JSON column. */
export function getEmbeddingDimFromChunks(db: DatabaseSync): number | null {
  const rows = db
    .prepare("SELECT embedding FROM chunks WHERE embedding IS NOT NULL LIMIT 200")
    .all() as Array<{ embedding: string | null }>;
  for (const row of rows) {
    if (!row.embedding) continue;
    try {
      const arr = JSON.parse(row.embedding) as unknown;
      if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === "number") {
        return arr.length;
      }
    } catch {
      // skip malformed rows
    }
  }
  return null;
}

/** Copy legacy JSON embeddings into the vector index (used by the one-time migration). */
export function backfillVecFromChunks(db: DatabaseSync, dim: number): boolean {
  const rows = db
    .prepare("SELECT book_id, chunk_index, embedding FROM chunks")
    .all() as Array<{ book_id: string; chunk_index: number; embedding: string }>;
  const insert = db.prepare(
    `INSERT INTO ${VEC_TABLE} (embedding, partition_by, chunk_index) VALUES (?, ?, ?)`
  );
  db.exec("BEGIN");
  try {
    let inserted = 0;
    for (const row of rows) {
      let arr: number[];
      try {
        arr = JSON.parse(row.embedding) as number[];
      } catch {
        continue;
      }
      if (!Array.isArray(arr) || arr.length !== dim) continue;
      insert.run(JSON.stringify(arr), row.book_id, String(row.chunk_index));
      inserted++;
    }
    db.exec("COMMIT");
    return inserted > 0;
  } catch (err) {
    db.exec("ROLLBACK");
    console.error("[vec] backfill gagal:", err);
    return false;
  }
}

/**
 * One-time migration for databases created before the vector index:
 * moves the JSON `chunks.embedding` data into a `chunk_vec` vec0 table and
 * drops the redundant column. No-op on modern schemas.
 */
export function migrateLegacyEmbeddings(db: DatabaseSync): boolean {
  if (!chunksHaveEmbedding(db)) return false;
  if (getVectorDim(db) != null) return false;

  const dim = getEmbeddingDimFromChunks(db);
  if (dim == null || dim <= 0) return false;
  if (!loadVectorExtension(db)) return false;

  createVecTable(db, dim);
  if (!backfillVecFromChunks(db, dim)) {
    console.error(
      "[vec] migrasi dibatalkan: backfill gagal; lajur embedding kekal sebagai sandaran."
    );
    return false;
  }
  setVectorDim(db, dim);
  db.exec("ALTER TABLE chunks DROP COLUMN embedding");
  chunkEmbeddingColumn = false;
  console.log(`[vec] legasi embeddings dimigrasikan (dimensi ${dim}).`);
  return true;
}

/**
 * Guarantee the vector index exists for the given embedding dimension.
 * If the model dimension changed, the old index is rebuilt (stale vectors
 * are dropped; affected books must be re-indexed).
 */
export function initVectorIndex(dim: number): boolean {
  if (!Number.isFinite(dim) || dim <= 0) return false;
  const db = getDb();
  if (!loadVectorExtension(db)) return false;

  const current = getVectorDim(db);
  if (current === dim) {
    createVecTable(db, dim);
    return true;
  }
  if (current != null) {
    console.warn(
      `[vec] dimensi embedding berubah ${current} → ${dim}; indeks dibina semula. Sila imbas semula buku.`
    );
    db.exec(`DROP TABLE IF EXISTS ${VEC_TABLE}`);
    createVecTable(db, dim);
    if (chunksHaveEmbedding(db)) backfillVecFromChunks(db, dim);
  } else {
    createVecTable(db, dim);
  }
  setVectorDim(db, dim);
  return true;
}

export function saveChunks(
  bookId: string,
  chunks: Array<{ chunkIndex: number; page: number | null; text: string; embedding: number[] }>
) {
  const db = getDb();
  const dim = getVectorDim(db);
  const vecReady =
    dim != null &&
    dim === (chunks[0]?.embedding.length ?? -1) &&
    loadVectorExtension(db);
  const storeJson = chunksHaveEmbedding(db);

  const del = db.prepare("DELETE FROM chunks WHERE book_id = ?");
  const colSql = storeJson ? ", embedding" : "";
  const valSql = storeJson ? ", ?" : "";
  const ins = db.prepare(
    `INSERT OR REPLACE INTO chunks (book_id, chunk_index, page, text${colSql}) VALUES (?, ?, ?, ?${valSql})`
  );
  const vecDel = vecReady
    ? db.prepare(`DELETE FROM ${VEC_TABLE} WHERE partition_by = ?`)
    : null;
  const vecIns = vecReady
    ? db.prepare(
        `INSERT INTO ${VEC_TABLE} (embedding, partition_by, chunk_index) VALUES (?, ?, ?)`
      )
    : null;

  db.exec("BEGIN");
  try {
    del.run(bookId);
    if (vecReady) vecDel!.run(bookId);
    for (const c of chunks) {
      const json = JSON.stringify(c.embedding);
      if (storeJson) {
        ins.run(bookId, c.chunkIndex, c.page, c.text, json);
      } else {
        ins.run(bookId, c.chunkIndex, c.page, c.text);
      }
      if (vecReady) vecIns!.run(json, bookId, String(c.chunkIndex));
    }
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
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

/** Semantic search scoped to a single book via the sqlite-vec KNN index. */
export function searchChunks(
  bookId: string,
  queryEmbedding: number[],
  topK = 6
): ChunkHit[] {
  const db = getDb();
  const dim = getVectorDim(db);
  if (dim != null && queryEmbedding.length === dim && loadVectorExtension(db)) {
    try {
      const rows = db
        .prepare(
          `SELECT chunk_index, distance FROM ${VEC_TABLE}
           WHERE embedding MATCH ? AND partition_by = ? AND k = ?`
        )
        .all(JSON.stringify(queryEmbedding), bookId, topK) as Array<{
        chunk_index: string;
        distance: number;
      }>;
      if (rows.length > 0) {
        const indexes = rows.map((r) => Number(r.chunk_index));
        const placeholders = indexes.map(() => "?").join(",");
        const textRows = db
          .prepare(
            `SELECT chunk_index, page, text FROM chunks
             WHERE book_id = ? AND chunk_index IN (${placeholders})`
          )
          .all(bookId, ...indexes) as Array<{
          chunk_index: number;
          page: number | null;
          text: string;
        }>;
        const byIndex = new Map(textRows.map((r) => [Number(r.chunk_index), r]));
        return rows.map((r) => ({
          text: byIndex.get(Number(r.chunk_index))?.text ?? "",
          page: byIndex.get(Number(r.chunk_index))?.page ?? null,
          score: 1 - r.distance,
        }));
      }
    } catch (err) {
      console.error("[vec] KNN gagal, guna semula imbasan kosinus:", err);
    }
  }
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
