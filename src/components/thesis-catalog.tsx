"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { LayoutGrid, List, Search, X } from "lucide-react";

import { ThesisCard } from "@/components/thesis-card";
import { ThesisTable } from "@/components/thesis-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounced } from "@/hooks/use-debounced";
import type { ThesisSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

type CatalogResponse = {
  items: ThesisSummary[];
  total: number;
  faculties: string[];
  catalogue: { ocrPages: number };
};

const PAGE_SIZE = 120;
const GRID_ROW_HEIGHT = 316;
const GRID_GAP = 18;

function useColumns<T extends HTMLElement>(
  containerRef: React.RefObject<T>
): number {
  const [columns, setColumns] = React.useState(3);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth;
      if (w < 640) setColumns(1);
      else if (w < 1024) setColumns(2);
      else setColumns(3);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  return columns;
}

export function ThesisCatalog() {
  const [faculty, setFaculty] = React.useState("Semua");
  const [query, setQuery] = React.useState("");
  const [view, setView] = React.useState<"grid" | "table">("grid");
  const debouncedQuery = useDebounced(query.trim(), 300);

  const gridRef = React.useRef<HTMLDivElement>(null);
  const columns = useColumns(gridRef);

  const { data, isPending, isFetching } = useQuery({
    queryKey: ["catalog", faculty, debouncedQuery, PAGE_SIZE],
    queryFn: async () => {
      const params = new URLSearchParams({
        faculty,
        pageSize: String(PAGE_SIZE),
      });
      if (debouncedQuery) params.set("query", debouncedQuery);
      const res = await fetch(`/api/theses?${params}`);
      if (!res.ok) throw new Error("Gagal memuat katalog");
      return (await res.json()) as CatalogResponse;
    },
    placeholderData: (prev) => prev,
  });

  const items = data?.items ?? [];
  const clearQuery = () => setQuery("");

  const rows = Math.ceil(items.length / columns);
  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => gridRef.current,
    estimateSize: () => GRID_ROW_HEIGHT + GRID_GAP,
    overscan: 3,
  });

  return (
    <section id="koleksi" className="container scroll-mt-24 py-20">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Koleksi tesis
        </h2>
        <p className="text-sm text-muted-foreground">
          {isPending ? (
            "Memuat…"
          ) : (
            <>
              <span className="font-semibold text-foreground">
                {data?.total}
              </span>{" "}
              keputusan · katalog teks penuh sebanyak{" "}
              {(data?.catalogue.ocrPages ?? 0).toLocaleString("en-MY")} muka
              surat di-OCR
            </>
          )}
        </p>
      </div>

      {/* toolbar */}
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {["Semua", ...(data?.faculties ?? [])].map((f) => (
            <button
              key={f}
              onClick={() => setFaculty(f)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                faculty === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {f}
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
              Tiada tesis sepadan.
            </p>
            <p className="text-sm text-muted-foreground">
              Cuba kata kunci lain atau padam carian semasa.
            </p>
            {(query.length > 0 || faculty !== "Semua") && (
              <Button variant="outline" onClick={clearQuery}>
                Padam penapis
              </Button>
            )}
          </div>
        ) : view === "table" ? (
          <ThesisTable items={items} query={debouncedQuery} />
        ) : (
          <div
            ref={gridRef}
            className="overflow-auto"
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          >
            <div
              className="relative w-full"
              style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const start = virtualRow.index * columns;
                const rowItems = items.slice(
                  start,
                  Math.min(start + columns, items.length)
                );
                return (
                  <div
                    key={virtualRow.key}
                    className="absolute inset-x-0 grid gap-[18px]"
                    style={{
                      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                      height: `${virtualRow.size - GRID_GAP}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {rowItems.map((t) => (
                      <ThesisCard key={t.id} thesis={t} query={debouncedQuery} />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {isFetching && !isPending && (
        <div className="mt-4 h-px animate-pulse bg-primary/20" />
      )}
    </section>
  );
}
