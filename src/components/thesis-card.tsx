import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Highlight } from "@/lib/highlight";
import type { ThesisSummary } from "@/lib/types";

export function ThesisCard({
  thesis,
  query = "",
}: {
  thesis: ThesisSummary;
  query?: string;
}) {
  return (
    <Link
      href={`/tesis/${thesis.id}`}
      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-primary">
          {thesis.call}
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground/60 transition-colors group-hover:text-primary" />
      </div>

      <h3 className="mt-3 line-clamp-3 font-display text-[1.05rem] font-semibold leading-snug text-foreground">
        <Highlight text={thesis.title} query={query} />
      </h3>

      <p className="mt-2 text-sm text-muted-foreground">
        {thesis.author}
        {thesis.university ? ` · ${thesis.university}` : ""}
      </p>

      <div className="mt-auto flex items-center justify-between gap-2 pt-5">
        <Badge variant="secondary" className="font-medium">
          {thesis.faculty}
        </Badge>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          {thesis.year} · {thesis.pages} ms
        </span>
      </div>
    </Link>
  );
}
