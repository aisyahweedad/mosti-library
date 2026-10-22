"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { ThesisCard } from "@/components/thesis-card";
import { ThesisTable } from "@/components/thesis-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounced } from "@/hooks/use-debounced";
import type { ThesisSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

type CatalogResponse = {
  items: ThesisSummary[];
  total: number;
  page: number;
  pageSize: number;
  faculties: string[];
  catalogue: { ocrPages: number };
};

const PAGE_SIZE = 12;

function pageList(current: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const wanted = new Set(
    [1, total].concat(
      current === 1 ? [2, 3] : [],
      current === total ? [total - 2, total - 1] : [current - 1, current, current + 1]
    )
  );
  const sorted = [...wanted].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: Array<number | "…"> = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

function toggleItem(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function ThesisCatalog() {
  const [selected, setSelected] = React.useState<string[]>([]);
  const [query, setQuery] = React.useState("");
  const [view, setView] = React.useState<"grid" | "table">("grid");
  const [page, setPage] = React.useState(1);
  const [open, setOpen] = React.useState(false);
  const debouncedQuery = useDebounced(query.trim(), 300);

  const selectedKey = selected.join("|");
  React.useEffect(() => {
    setPage(1);
  }, [selectedKey, debouncedQuery]);

  const { data, isPending, isFetching } = useQuery({
    queryKey: ["catalog", selectedKey, debouncedQuery, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      for (const f of selected) params.append("faculty", f);
      params.set("pageSize", String(PAGE_SIZE));
      params.set("page", String(page));
      if (debouncedQuery) params.set("query", debouncedQuery);
      const res = await fetch(`/api/theses?${params}`);
      if (!res.ok) throw new Error("Gagal memuat katalog");
      return (await res.json()) as CatalogResponse;
    },
    placeholderData: (prev) => prev,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // clamp when the filter narrows results below the current page
  React.useEffect(() => {
    if (!isPending && total > 0 && page > totalPages) setPage(totalPages);
  }, [isPending, total, page, totalPages]);

  const goPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    document
      .getElementById("koleksi")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const clearQuery = () => setQuery("");

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <section id="koleksi" className="container scroll-mt-24 py-20">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Koleksi Terbitan Digital
        </h2>
        <p className="text-sm text-muted-foreground">
          {isPending ? (
            "Memuat…"
          ) : (
            <>
              <span className="font-semibold text-foreground">{total}</span>{" "}
              keputusan · katalog teks penuh sebanyak{" "}
              {(data?.catalogue.ocrPages ?? 0).toLocaleString("en-MY")} muka
              surat di-OCR
            </>
          )}
        </p>
      </div>

      {/* toolbar */}
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                Kategori
                {selected.length > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                    {selected.length}
                  </span>
                )}
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80 p-0">
              <div className="max-h-72 overflow-auto p-1">
                {(data?.faculties ?? []).map((f) => (
                  <label
                    key={f}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-accent/60"
                  >
                    <Checkbox
                      checked={selected.includes(f)}
                      onCheckedChange={(v) =>
                        setSelected((prev) =>
                          v === true
                            ? [...prev, f]
                            : prev.filter((x) => x !== f)
                        )
                      }
                    />
                    <span className="flex-1">{f}</span>
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-border p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected([])}
                >
                  Semua
                </Button>
                <Button size="sm" onClick={() => setOpen(false)}>
                  Selesai
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {selected.map((f) => (
            <button
              key={f}
              aria-label={`Buang ${f}`}
              onClick={() => setSelected((prev) => toggleItem(prev, f))}
              className="inline-flex max-w-52 items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-primary/20"
            >
              <span className="truncate">{f}</span>
              <X className="h-3 w-3 shrink-0 opacity-60" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tapis dalam koleksi…"
              className="pl-9 pr-8"
            />
            {query && (
              <button
                onClick={clearQuery}
                aria-label="Padam carian"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex rounded-lg border border-border bg-card p-0.5">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9"
              aria-label="Paparan grid"
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "table" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9"
              aria-label="Paparan jadual"
              onClick={() => setView("table")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* content */}
      <div className="mt-8">
        {isPending ? (
          <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[316px] rounded-2xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-24 text-center">
            <p className="font-display text-lg font-semibold">
              Tiada terbitan sepadan.
            </p>
            <p className="text-sm text-muted-foreground">
              Cuba kata kunci lain atau padam carian semasa.
            </p>
            {(query.length > 0 || selected.length > 0) && (
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setSelected([]);
                }}
              >
                Padam penapis
              </Button>
            )}
          </div>
        ) : view === "table" ? (
          <ThesisTable items={items} query={debouncedQuery} />
        ) : (
          <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <ThesisCard key={t.id} thesis={t} query={debouncedQuery} />
            ))}
          </div>
        )}
      </div>

      {/* pagination */}
      {!isPending && total > 0 && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-xs text-muted-foreground">
            Memaparkan {from}–{to} daripada {total} terbitan
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              aria-label="Halaman sebelumnya"
              disabled={page <= 1 || isFetching}
              onClick={() => goPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {pageList(page, totalPages).map((p, i) =>
              p === "…" ? (
                <span
                  key={`gap-${i}`}
                  className="px-1 text-sm text-muted-foreground"
                >
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  className={cn("h-9 min-w-9 px-2")}
                  disabled={isFetching}
                  onClick={() => goPage(p)}
                >
                  {p}
                </Button>
              )
            )}

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              aria-label="Halaman seterusnya"
              disabled={page >= totalPages || isFetching}
              onClick={() => goPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {isFetching && !isPending && (
        <div className="mt-4 h-px animate-pulse bg-primary/20" />
      )}
    </section>
  );
}
