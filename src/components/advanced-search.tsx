"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowUpRight, FileSearch, Loader2, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { ThesisSummary } from "@/lib/types";

type AdvancedSnippet = { page: number | null; text: string; score: number };
type AdvancedResult = {
  thesis: ThesisSummary;
  score: number;
  snippets: AdvancedSnippet[];
};
type AdvancedResponse = {
  query: string;
  total: number;
  results: AdvancedResult[];
};

export function AdvancedSearch() {
  const [input, setInput] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);

  const { data, isFetching } = useQuery({
    queryKey: ["advanced-search", query],
    queryFn: async () => {
      const res = await fetch(
        `/api/search/advanced?query=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("Carian gagal");
      return (await res.json()) as AdvancedResponse;
    },
    enabled: query.length > 0,
  });

  const compare = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, ids: selected }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Gagal membandingkan");
      return json as { comparison: string; documents: number };
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const results = data?.results ?? [];

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    <div className="space-y-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSelected([]);
          compare.reset();
          setQuery(input.trim());
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="cth. kesan perubahan iklim terhadap hasil pertanian di Malaysia"
            className="h-12 pl-10"
          />
        </div>
        <Button type="submit" size="lg" disabled={!input.trim() || isFetching}>
          {isFetching ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileSearch className="mr-2 h-4 w-4" />
          )}
          Cari
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        Carian merangkumi keseluruhan teks dokumen. Pilih dua atau lebih dokumen
        untuk membuat analisis perbandingan.
      </p>

      {query && isFetching && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {query && !isFetching && results.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center">
          <p className="font-display text-lg font-semibold">
            Tiada dokumen sepadan.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Cuba kata kunci atau frasa lain.
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{data?.total}</span>{" "}
              dokumen sepadan · {selected.length} dipilih
            </p>
            <Button
              onClick={() => compare.mutate()}
              disabled={selected.length < 2 || compare.isPending}
            >
              {compare.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Bandingkan dengan AI
            </Button>
          </div>

          <div className="space-y-4">
            {results.map((r) => (
              <Card key={r.thesis.id}>
                <CardHeader className="flex-row items-start gap-3 space-y-0">
                  <Checkbox
                    checked={selected.includes(r.thesis.id)}
                    onCheckedChange={() => toggle(r.thesis.id)}
                    className="mt-1"
                    aria-label={`Pilih ${r.thesis.title}`}
                  />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="flex items-start justify-between gap-3 font-display text-base">
                      <Link
                        href={`/tesis/${r.thesis.id}`}
                        className="hover:text-primary"
                      >
                        {r.thesis.title}
                      </Link>
                      <Link
                        href={`/tesis/${r.thesis.id}`}
                        className="shrink-0 text-muted-foreground hover:text-primary"
                        aria-label="Buka dokumen"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {r.thesis.author}
                      {r.thesis.university ? ` · ${r.thesis.university}` : ""} ·{" "}
                      {r.thesis.year}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pl-12">
                  <Badge variant="secondary">{r.thesis.faculty}</Badge>
                  <ul className="space-y-2">
                    {r.snippets.map((s, i) => (
                      <li
                        key={i}
                        className="rounded-lg border-l-2 border-primary/40 bg-muted/40 px-3 py-2 text-sm text-foreground/90"
                      >
                        {s.page != null && (
                          <span className="mr-1 font-mono text-[11px] text-primary">
                            (hlm. {s.page})
                          </span>
                        )}
                        {s.text}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {compare.data?.comparison && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Sparkles className="h-5 w-5 text-primary" />
              Perbandingan AI ({compare.data.documents} dokumen)
            </CardTitle>
            <CardDescription>
              Dijana daripada kandungan dokumen yang dipilih.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Markdown
              content={compare.data.comparison}
              className="text-foreground/90"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
