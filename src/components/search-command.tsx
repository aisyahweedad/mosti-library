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
          Taip tajuk, pengarang atau kata kunci…
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
  const query = useDebounced(value.trim(), 250);
  const enabled = query.length >= 1;

  const { data, isFetching } = useQuery({
    queryKey: ["instant-search", query, enabled],
    queryFn: async () => {
      const res = await fetch(
        `/api/theses?query=${encodeURIComponent(query)}&pageSize=8`
      );
      if (!res.ok) throw new Error("Carian gagal");
      return (await res.json()) as { items: ThesisSummary[]; total: number };
    },
    enabled,
    placeholderData: (prev) => prev,
  });

  const results = data?.items ?? [];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        value={value}
        onValueChange={setValue}
        placeholder="Cari tajuk, pengarang atau kata kunci…"
        autoFocus
      />

      <CommandList>
        {enabled && isFetching && !results.length && (
          <div className="flex flex-col gap-2 p-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        )}

        <CommandEmpty>Tiada hasil untuk “{value}”.</CommandEmpty>

        {results.length > 0 && (
          <CommandGroup heading={`${data?.total ?? 0} keputusan`}>
            {results.map((t) => (
              <CommandItem key={t.id} onSelect={() => onSelect(t.id)}>
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
      </CommandList>
    </CommandDialog>
  );
}
