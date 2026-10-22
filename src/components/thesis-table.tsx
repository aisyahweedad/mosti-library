"use client";

import * as React from "react";
import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { Highlight } from "@/lib/highlight";
import type { ThesisSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

const columns = (query: string): ColumnDef<ThesisSummary>[] => [
  {
    accessorKey: "call",
    header: "Nombor",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-primary">{row.original.call}</span>
    ),
    size: 110,
  },
  {
    accessorKey: "title",
    header: "Tajuk",
    cell: ({ row }) => (
      <span className="line-clamp-1 text-sm font-medium">
        <Highlight text={row.original.title} query={query} />
      </span>
    ),
  },
  {
    accessorKey: "author",
    header: "Pengarang",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.author}</span>
    ),
    size: 190,
  },
  {
    accessorKey: "university",
    header: "Sumber Penerbitan",
    cell: ({ row }) => (
      <span className="line-clamp-1 text-sm text-muted-foreground">
        {row.original.university}
      </span>
    ),
    size: 220,
  },
  {
    accessorKey: "year",
    header: "Tahun",
    cell: ({ row }) => <span className="text-sm">{row.original.year}</span>,
    size: 70,
  },
  {
    accessorKey: "faculty",
    header: "Jenis Subjek",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.faculty}</span>
    ),
    size: 180,
  },
];

const ROW_HEIGHT = 56;

export function ThesisTable({
  items,
  query = "",
}: {
  items: ThesisSummary[];
  query?: string;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const table = useReactTable({
    data: items,
    columns: columns(query),
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  return (
    <div
      ref={scrollRef}
      className="overflow-auto rounded-2xl border border-border bg-card"
      style={{ height: Math.min(rows.length * ROW_HEIGHT, 620) }}
    >
      <div
        className="relative w-full min-w-[900px]"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        <div
          className="sticky top-0 z-10 grid items-center border-b border-border bg-muted/80 px-4 backdrop-blur"
          style={{
            gridTemplateColumns: "110px 1fr 190px 220px 70px 180px",
            height: `${ROW_HEIGHT}px`,
          }}
        >
          {table.getFlatHeaders().map((header) => {
            const canSort = header.column.getCanSort();
            const sorted = header.column.getIsSorted();
            return (
              <button
                key={header.id}
                disabled={!canSort}
                onClick={header.column.getToggleSortingHandler()}
                className={cn(
                  "flex items-center gap-1 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                  canSort && "hover:text-foreground"
                )}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
                {sorted === "asc" ? (
                  <ArrowUp className="h-3 w-3" />
                ) : sorted === "desc" ? (
                  <ArrowDown className="h-3 w-3" />
                ) : canSort ? (
                  <ArrowUpDown className="h-3 w-3 opacity-40" />
                ) : null}
              </button>
            );
          })}
        </div>

        {virtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          return (
            <Link
              key={row.id}
              href={`/tesis/${row.original.id}`}
              className="group absolute inset-x-0 grid items-center border-b border-border/60 px-4 text-left transition-colors hover:bg-accent/50"
              style={{
                gridTemplateColumns: "110px 1fr 190px 220px 70px 180px",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {row.getAllCells().map((cell) => (
                <div key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
