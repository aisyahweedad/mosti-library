import type { Book } from "@/lib/book-types";
import type { Thesis, ThesisSummary } from "@/lib/types";

export function bookToSummary(b: Book): ThesisSummary {
  return {
    id: b.id,
    call: b.call,
    category: b.category,
    faculty: b.category,
    title: b.title,
    author: b.author,
    university: b.university,
    year: b.year,
    pages: b.pages,
    ocrAccuracy: "",
    keywords: b.keywords,
  };
}

export function bookToFull(b: Book): Thesis {
  return {
    ...bookToSummary(b),
    degree: b.degree,
    ocrPages: 0,
    abstract: b.abstract,
  };
}

export function toSummary(t: Thesis): ThesisSummary {
  return {
    id: t.id,
    call: t.call,
    category: t.category,
    faculty: t.faculty,
    title: t.title,
    author: t.author,
    university: t.university,
    year: t.year,
    pages: t.pages,
    ocrAccuracy: t.ocrAccuracy,
    keywords: t.keywords,
  };
}

export function toFull(t: Thesis): Thesis {
  return {
    ...toSummary(t),
    degree: t.degree,
    ocrPages: t.ocrPages,
    abstract: t.abstract,
  };
}
