import type { Thesis } from "@/lib/types";

export function toSummary(t: Thesis) {
  return {
    id: t.id,
    call: t.call,
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

export function toFull(t: Thesis) {
  return {
    ...toSummary(t),
    degree: t.degree,
    ocrPages: t.ocrPages,
    abstract: t.abstract,
  };
}
