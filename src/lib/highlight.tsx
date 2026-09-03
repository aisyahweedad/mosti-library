import type { ReactNode } from "react";

/** Escapes unneeded? No — we build React nodes directly, no innerHTML. */
export function Highlight({
  text,
  query,
  className = "bg-primary/15 font-semibold text-primary",
}: {
  text: string;
  query?: string;
  className?: string;
}): ReactNode {
  const q = query?.trim();
  if (!q) return text;
  const lower = text.toLowerCase();
  const needle = q.toLowerCase();
  const parts: ReactNode[] = [];
  let i = 0;
  let guard = 0;
  while (i < text.length && guard < 64) {
    const idx = lower.indexOf(needle, i);
    if (idx === -1) break;
    if (idx > i) parts.push(text.slice(i, idx));
    parts.push(
      <mark key={`${idx}-${guard}`} className={className}>
        {text.slice(idx, idx + q.length)}
      </mark>
    );
    i = idx + q.length;
    guard++;
  }
  if (i < text.length) parts.push(text.slice(i));
  return parts.length ? parts : text;
}
