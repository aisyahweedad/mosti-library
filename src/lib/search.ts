import { getBook, listBooks } from "@/lib/books-data";
import { bookToFull, toSummary } from "@/lib/mappers";
import type { SearchResult, Thesis, ThesisSummary } from "@/lib/types";
import { countIndexedPages } from "@/lib/vectors";

/**
 * Declarative query object used by the search abstraction.
 *
 * The implementation searches the real catalogue stored in SQLite
 * (`books` table) — only records that finished processing (status "Siap")
 * are made public. Swap the internals for a Meilisearch client when
 * the index exists — the signature stays:
 *
 *   searchTheses({ query, faculty, page, pageSize })
 */

export type ThesisQuery = {
  query?: string;
  faculty?: string | string[];
  page?: number;
  pageSize?: number;
};

/** Levenshtein distance, capped at `threshold`. Used for typo tolerance. */
export function editDistance(a: string, b: string, threshold = 1): number {
  const canUse = Math.abs(a.length - b.length) <= threshold;
  if (!canUse) return threshold + 1;
  if (a === b) return 0;
  if (threshold <= 0) return a === b ? 0 : 1;

  let [row, prev] = [Array(b.length + 1).fill(0), [] as number[]];
  for (let j = 0; j <= b.length; j++) row[j] = j;

  for (let i = 1; i <= a.length; i++) {
    prev = row;
    row = [i, ...new Array(b.length).fill(0)];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    if (Math.min(...row) > threshold) break;
  }
  return row[b.length];
}

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

function tokenize(s: string): string[] {
  return normalizeText(s).split(/\s+/).filter(Boolean);
}

function publicBooks() {
  return listBooks()
    .filter((b) => b.status === "Siap")
    .map(bookToFull);
}

/**
 * Scores a thesis against a query. Returns null when it does not match.
 * Mirrors Meilisearch's typo-tolerance behaviour with a small tolerance
 * window (prefix match OR edit distance <= 1 per token).
 */
function scoreThesis(t: Thesis, query: string): number {
  const haystack = tokenize(
    [t.title, t.author, t.call, t.faculty, t.keywords.join(" "), t.abstract].join(
      " "
    )
  );
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return 1;

  const hay = haystack.join(" ");
  let matched = 0;

  for (const q of qTokens) {
    if (hay.includes(q)) {
      matched++;
      continue;
    }
    const close = haystack.find((word) => {
      if (q.length <= 3) return word.startsWith(q);
      return (
        word.startsWith(q) ||
        editDistance(word.slice(0, q.length), q, 1) <= 1
      );
    });
    if (close) matched++;
  }

  if (matched === 0) return 0;
  const similarity = matched / qTokens.length;
  return Math.max(similarity, 0.35);
}

export function searchTheses({
  query: rawQuery,
  faculty,
  page = 1,
  pageSize = 12,
}: ThesisQuery = {}): SearchResult<ThesisSummary> {
  const query = rawQuery?.trim() ?? "";

  const selected =
    faculty === undefined || faculty === "Semua"
      ? []
      : (Array.isArray(faculty) ? faculty : [faculty])
          .map((f) => f.trim())
          .filter((f) => f.length > 0 && f !== "Semua");

  const ranked = publicBooks()
    .map((t) => {
      const score = scoreThesis(t, query);
      return { t, score };
    })
    .filter(({ score }) => score > 0)
    .filter(({ t }) => selected.length === 0 || selected.includes(t.category))
    .sort(
      (a, b) => b.score - a.score || b.t.year - a.t.year || a.t.title.localeCompare(b.t.title)
    )
    .map(({ t }) => toSummary({ ...t, faculty: t.category }));

  const start = (page - 1) * pageSize;
  return {
    items: ranked.slice(start, start + pageSize),
    total: ranked.length,
    page,
    pageSize,
  };
}

export function getThesis(id: string): Thesis | undefined {
  const book = getBook(id);
  if (!book || (book.status !== "Siap" && book.status !== "Dimuat Naik"))
    return undefined;
  return { ...bookToFull(book), ocrPages: countIndexedPages(id) };
}

export function getRelatedTheses(t: Thesis, limit = 3): Thesis[] {
  return publicBooks()
    .filter((x) => x.id !== t.id)
    .sort(
      (a, b) =>
        (b.faculty === t.faculty ? 1 : 0) - (a.faculty === t.faculty ? 1 : 0) ||
        b.year - a.year ||
        a.title.localeCompare(b.title)
    )
    .slice(0, limit);
}

export function listCategories(): string[] {
  return Array.from(
    new Set(publicBooks().map((b) => b.category))
  ).sort((a, b) => a.localeCompare(b));
}

export function getStats() {
  const books = publicBooks();
  const categories = new Set(books.map((b) => b.category));
  const universities = new Set(
    books.map((b) => b.university.trim()).filter(Boolean)
  );
  const latestYear = books.reduce((max, b) => Math.max(max, b.year), 0);
  return {
    total: books.length,
    ocrPages: books.reduce((sum, b) => sum + countIndexedPages(b.id), 0),
    faculties: categories.size,
    universities: universities.size,
    asOf: String(latestYear || new Date().getFullYear()),
  };
}
