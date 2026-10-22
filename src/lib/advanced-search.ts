import { embedQuery } from "@/lib/ai";
import { listBooks } from "@/lib/books-data";
import { getDb } from "@/lib/db";
import { bookToSummary } from "@/lib/mappers";
import { searchChunksGlobal } from "@/lib/vectors";
import type { ThesisSummary } from "@/lib/types";

export type AdvancedSnippet = {
  page: number | null;
  text: string;
  score: number;
};

export type AdvancedResult = {
  thesis: ThesisSummary;
  score: number;
  snippets: AdvancedSnippet[];
};

export type AdvancedSearchResponse = {
  query: string;
  total: number;
  results: AdvancedResult[];
};

const MAX_SNIPPETS = 3;
const SNIPPET_CHARS = 320;

/**
 * OCR noise guard: indexes contain many tiny fragments torn from table cells,
 * page numbers, code listings and headlines ("= True Then", "201", "o,00").
 * These fragments embed close to almost any query and pollute the top list.
 */
function looksLikeNoise(text: string): boolean {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length < 24) return true;

  const stripped = clean.replace(/[^A-Za-zÀ-ž]/g, "");
  if (stripped.length < 12) return true;

  // chunks dominated by digits/punctuation (table data, references tail, code)
  const tokens = clean
    .split(/\s+/)
    .map((w) => w.replace(/^[^A-Za-zÀ-ž0-9]+|[^A-Za-zÀ-ž0-9]+$/g, ""))
    .filter((w) => /[\dA-Za-zÀ-ž]/.test(w) && w.length >= 3);
  if (tokens.length >= 4) {
    const wordLike = tokens.filter((w) => /[A-Za-zÀ-ž]{3,}/.test(w)).length;
    if (wordLike / tokens.length < 0.5) return true;
  }
  return false;
}

function clip(text: string, max = SNIPPET_CHARS) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

function keywordHits(query: string, limit = 400) {
  const db = getDb();
  const like = `%${query.toLowerCase()}%`;
  return db
    .prepare(
      `SELECT c.book_id AS bookId, c.page AS page, c.text AS text
       FROM chunks c JOIN books b ON b.id = c.book_id
       WHERE b.status = 'Siap' AND lower(c.text) LIKE ?
       LIMIT ?`
    )
    .all(like, limit) as Array<{
    bookId: string;
    page: number | null;
    text: string;
  }>;
}

/**
 * Full-document (content) search across every published document.
 *
 * Uses semantic vector search over the indexed chunks when the LLM/embedding
 * gateway is available, and falls back to a keyword scan of the chunk text
 * otherwise. Results are grouped per document with the best matching snippets.
 */
export async function advancedSearch(
  rawQuery: string,
  limit = 20
): Promise<AdvancedSearchResponse> {
  const query = rawQuery.trim();
  if (!query) return { query, total: 0, results: [] };

  const books = listBooks().filter((b) => b.status === "Siap");
  const byId = new Map(books.map((b) => [b.id, b]));

  let hits: Array<{
    bookId: string;
    text: string;
    page: number | null;
    score: number;
  }> = [];

  try {
    const embedding = await embedQuery(query);
    if (embedding) hits = searchChunksGlobal(embedding, 200);
  } catch (err) {
    console.error("[advanced] carian semantik gagal, guna padanan kata kunci:", err);
  }

  // drop OCR noise fragments; fall back to lexical scan when nothing survives
  const usable = hits.filter((h) => !looksLikeNoise(h.text));
  if (usable.length > 0) {
    hits = usable;
  } else {
    hits = keywordHits(query)
      .filter((h) => !looksLikeNoise(h.text))
      .map((h) => ({ ...h, score: 0.5 }));
  }

  const grouped = new Map<string, AdvancedResult>();
  for (const hit of hits) {
    const book = byId.get(hit.bookId);
    if (!book) continue;
    const entry =
      grouped.get(hit.bookId) ??
      ({
        thesis: bookToSummary(book),
        score: hit.score,
        snippets: [],
      } satisfies AdvancedResult);
    if (entry.snippets.length < MAX_SNIPPETS) {
      entry.snippets.push({
        page: hit.page,
        text: clip(hit.text),
        score: hit.score,
      });
    }
    entry.score = Math.max(entry.score, hit.score);
    grouped.set(hit.bookId, entry);
  }

  const results = Array.from(grouped.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return { query, total: results.length, results };
}

// small in-process cache: the KNN scan over 150k+ document pages is expensive
const CACHE_TTL_MS = 5 * 60 * 1000;
const responseCache = new Map<string, { at: number; data: AdvancedSearchResponse }>();

export async function cachedAdvancedSearch(query: string): Promise<AdvancedSearchResponse> {
  const key = query.trim().toLowerCase();
  if (!key) return { query: key, total: 0, results: [] };
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.data;
  const data = await advancedSearch(query);
  responseCache.set(key, { at: Date.now(), data });
  if (responseCache.size > 100) {
    const oldest = responseCache.keys().next().value;
    if (oldest) responseCache.delete(oldest);
  }
  return data;
}
