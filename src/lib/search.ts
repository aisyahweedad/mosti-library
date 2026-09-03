import type { Faculty, SearchResult, Thesis } from "@/lib/types";
import { STATS, THESES } from "@/lib/theses-data";

/**
 * Declarative query object used by the search abstraction.
 *
 * The mock implementation below filters the in-memory catalogue.
 * Swap this file's internals for a Meilisearch client (self-hosted)
 * without touching the route handlers or UI — the signature stays:
 *
 *   searchTheses({ query, faculty, page, pageSize })
 */

export type ThesisQuery = {
  query?: string;
  faculty?: Faculty | "Semua";
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

/**
 * Scores a thesis against a query. Returns null when it does not match.
 * Mirrors Meilisearch's typo-tolerance behaviour with a small tolerance
 * window (prefix match OR edit distance <= 1 per token).
 */
function scoreThesis(t: Thesis, query: string): number {
  const haystack = tokenize(
    [t.title, t.author, t.abstract, t.university, t.keywords.join(" ")].join(" ")
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
}: ThesisQuery = {}): SearchResult<Thesis> {
  const query = rawQuery?.trim() ?? "";

  const ranked = THESES.map((t) => {
    const score = scoreThesis(t, query);
    return { t, score };
  })
    .filter(({ score }) => score > 0)
    .filter(
      ({ t }) => faculty === undefined || faculty === "Semua" || t.faculty === faculty
    )
    .sort((a, b) => b.score - a.score || b.t.year - a.t.year)
    .map(({ t }) => t);

  const start = (page - 1) * pageSize;
  return {
    items: ranked.slice(start, start + pageSize),
    total: ranked.length,
    page,
    pageSize,
  };
}

export function getThesis(id: number): Thesis | undefined {
  return THESES.find((t) => t.id === id);
}

export function getThesisByCall(call: string): Thesis | undefined {
  return THESES.find((t) => t.call === call);
}

export function getRelatedTheses(t: Thesis, limit = 3): Thesis[] {
  const scored = THESES.filter((x) => x.id !== t.id)
    .map((x) => {
      const shared = x.keywords.filter((k) => t.keywords.includes(k)).length;
      return { x, shared };
    })
    .sort((a, b) => b.shared - a.shared)
    .slice(0, limit)
    .map(({ x }) => x);
  return scored;
}

export function getStats() {
  return STATS;
}
