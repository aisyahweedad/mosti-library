import { embedTexts } from "@/lib/ai";
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
    const [embedding] = await embedTexts([query]);
    if (embedding) hits = searchChunksGlobal(embedding, 120);
  } catch (err) {
    console.error("[advanced] carian semantik gagal, guna padanan kata kunci:", err);
  }

  if (hits.length === 0) {
    hits = keywordHits(query).map((h) => ({ ...h, score: 0.5 }));
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
