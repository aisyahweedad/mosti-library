"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FileSearch, Search } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounced } from "@/hooks/use-debounced";
import type { ThesisSummary } from "@/lib/types";

export function SearchCommand() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group flex h-14 w-full items-center gap-3 rounded-xl border border-input bg-card px-4 text-left shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
      >
        <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-muted-foreground">
          Taip tajuk, pengarang atau kandungan dokumen…
        </span>
        <kbd className="pointer-events-none hidden select-none items-center gap-1 rounded border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground sm:flex">
          ⌘ K
        </kbd>
      </button>

      <SearchDialog
        open={open}
        setOpen={setOpen}
        value={value}
        setValue={setValue}
        onSelect={(id) => {
          setOpen(false);
          router.push(`/tesis/${id}`);
        }}
      />
    </>
  );
}

type ContentResult = {
  query: string;
  total: number;
  results: Array<{
    thesis: ThesisSummary;
    score: number;
    snippets: Array<{ page: number | null; text: string; score: number }>;
  }>;
};

function SearchDialog({
  open,
  setOpen,
  value,
  setValue,
  onSelect,
}: {
  open: boolean;
  setOpen: (o: boolean) => void;
  value: string;
  setValue: (v: string) => void;
  onSelect: (id: string) => void;
}) {
  const query = useDebounced(value.trim(), 350);
  const enabled = query.length >= 1;

  const { data, isFetching } = useQuery({
    queryKey: ["instant-meta", query, enabled],
    queryFn: async () => {
      const res = await fetch(
        `/api/theses?query=${encodeURIComponent(query)}&pageSize=6`
      );
      if (!res.ok) throw new Error("Carian gagal");
      return (await res.json()) as { items: ThesisSummary[]; total: number };
    },
    enabled,
    placeholderData: (prev) => prev,
  });

  // full-page content search (every document page is indexed)
  const { data: content, isFetching: contentFetching } = useQuery({
    queryKey: ["instant-content", query, enabled],
    queryFn: async () => {
      const res = await fetch(
        `/api/search/advanced?query=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("Carian gagal");
      return (await res.json()) as ContentResult;
    },
    enabled,
    placeholderData: (prev) => prev,
  });

  const metaResults = data?.items ?? [];
  const metaIds = new Set(metaResults.map((t) => t.id));
  const contentResults = (content?.results ?? [])
    .filter((r) => !metaIds.has(r.thesis.id))
    .slice(0, 6);
  const empty =
    enabled &&
    !isFetching &&
    !contentFetching &&
    metaResults.length === 0 &&
    contentResults.length === 0;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        value={value}
        onValueChange={setValue}
        placeholder="Cari tajuk, pengarang atau kandungan dokumen…"
        autoFocus
      />

      <CommandList>
        {enabled && (isFetching || contentFetching) && (
          <div className="flex flex-col gap-2 p-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        )}

        {!enabled && (
          <div className="p-3 text-sm text-muted-foreground">
            Taip untuk mencari melalui metadata dan kandungan penuh setiap
            dokumen.
          </div>
        )}

        {empty && <CommandEmpty>Tiada hasil untuk “{value}”.</CommandEmpty>}

        {metaResults.length > 0 && (
          <CommandGroup heading={`Tajuk & pengarang · ${data?.total ?? 0} keputusan`}>
            {metaResults.map((t) => (
              <CommandItem key={`meta-${t.id}`} onSelect={() => onSelect(t.id)}>
                <FileSearch className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm">{t.title}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {t.author} · {t.university}, {t.year}
                  </span>
                </div>
                <Badge variant="outline" className="ml-2 shrink-0">
                  {t.faculty}
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {contentResults.length > 0 && (
          <CommandGroup heading="Padanan dalam kandungan dokumen">
            {contentResults.map((r) => {
              const snippet = r.snippets[0];
              return (
                <CommandItem
                  key={`content-${r.thesis.id}`}
                  onSelect={() => onSelect(r.thesis.id)}
                >
                  <FileSearch className="mr-2 h-4 w-4 shrink-0 text-emerald-600" />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm">{r.thesis.title}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {snippet?.page ? `Halaman ${snippet.page} · ` : ""}
                      {snippet?.text}
                    </span>
                  </div>
                  <Badge variant="outline" className="ml-2 shrink-0">
                    {r.thesis.faculty}
                  </Badge>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
