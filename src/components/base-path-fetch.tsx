"use client";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

if (BASE && typeof window !== "undefined") {
  const originalFetch = window.fetch.bind(window);
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    if (
      typeof input === "string" &&
      input.startsWith("/") &&
      input !== BASE &&
      !input.startsWith(`${BASE}/`)
    ) {
      return originalFetch(`${BASE}${input}`, init);
    }
    return originalFetch(input, init);
  }) as typeof window.fetch;
}

export function BasePathFetch() {
  return null;
}
