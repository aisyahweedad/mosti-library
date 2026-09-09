"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  Files,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BOOK_STATUSES, type Book, type BookStatus } from "@/lib/book-types";
import { cn } from "@/lib/utils";

const STATUS_VARIANT: Record<
  BookStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Siap: "default",
  "Dimuat Naik": "secondary",
  "Sedang Diproses": "secondary",
  Menunggu: "outline",
  Gagal: "destructive",
};

const KIND_VARIANT: Record<string, "secondary" | "outline"> = {
  Buku: "secondary",
  Tesis: "outline",
};

function hasPending(data?: { items: Book[] }) {
  return !!data?.items.some(
    (b) => b.status === "Sedang Diproses" || b.status === "Menunggu"
  );
}

async function removeBookRow(
  queryClient: ReturnType<typeof useQueryClient>,
  book: Book
) {
  try {
    const res = await fetch(`/api/admin/books/${book.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast.error("Gagal memadam dokumen");
      return;
    }
    toast.success(`"${book.title}" dipadam`);
    queryClient.invalidateQueries({ queryKey: ["admin-books"] });
  } catch {
    toast.error("Ralat rangkaian");
  }
}

function RowActions({
  book,
  onRemove,
}: {
  book: Book;
  onRemove: (book: Book) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Tindakan">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {book.objectKey && (
          <DropdownMenuItem asChild>
            <a href={`/api/admin/books/${book.id}/file`} target="_blank" rel="noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Muat turun PDF
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onRemove(book)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Padam
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function BooksTable() {
  const queryClient = useQueryClient();
  const [q, setQ] = React.useState("");
  const [debouncedQ, setDebouncedQ] = React.useState("");
  const [kind, setKind] = React.useState<string>("all");
  const [status, setStatus] = React.useState<string>("all");

  const { data: kindOptions } = useQuery({
    queryKey: ["catalog-options"],
    queryFn: async () => {
      const res = await fetch("/api/admin/catalog");
      if (!res.ok) throw new Error("Gagal memuat pilihan katalog");
      return (await res.json()) as { kinds: string[] };
    },
  });

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const params = new URLSearchParams();
  if (debouncedQ) params.set("q", debouncedQ);
  if (kind !== "all") params.set("kind", kind);
  if (status !== "all") params.set("status", status);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin-books", params.toString()],
    queryFn: () =>
      fetch(`/api/admin/books?${params.toString()}`).then((r) => r.json()),
    refetchInterval: (query) => (hasPending(query.state.data) ? 1500 : false),
  });

  const rows = (data?.items ?? []) as Book[];

  const columns = React.useMemo<ColumnDef<Book>[]>(
    () => [
      {
        accessorKey: "call",
        header: "Nombor",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-primary">{row.original.call}</span>
        ),
        size: 120,
      },
      {
        accessorKey: "title",
        header: "Tajuk",
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-md text-sm font-medium">
            {row.original.title}
          </span>
        ),
      },
      {
        accessorKey: "author",
        header: "Pengarang",
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-[200px] text-sm text-muted-foreground">
            {row.original.author}
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
        accessorKey: "kind",
        header: "Jenis",
        cell: ({ row }) => (
          <Badge variant={KIND_VARIANT[row.original.kind] ?? "secondary"}>
            {row.original.kind}
          </Badge>
        ),
        size: 90,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex w-40 flex-col gap-1.5">
            <Badge variant={STATUS_VARIANT[row.original.status]}>
              {row.original.status}
            </Badge>
            {row.original.status === "Sedang Diproses" && (
              <Progress value={row.original.progress} className="h-1.5" />
            )}
          </div>
        ),
        size: 170,
      },
      {
        accessorKey: "sizeMB",
        header: "Saiz",
        cell: ({ row }) => (
          <span className="text-xs tabular-nums text-muted-foreground">
            {row.original.sizeMB.toFixed(1)} MB
          </span>
        ),
        size: 70,
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <RowActions book={row.original} onRemove={(b) => removeBookRow(queryClient, b)} />
        ),
        size: 50,
      },
    ],
    [queryClient]
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari tajuk, pengarang atau nombor panggilan…"
            className="pl-9"
          />
        </div>
        <Select value={kind} onValueChange={setKind}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Jenis</SelectItem>
            {(kindOptions?.kinds ?? []).map((k) => (
              <SelectItem key={k} value={k}>
                {k}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            {BOOK_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button asChild>
          <Link href="/admin/upload">
            <Plus className="mr-2 h-4 w-4" />
            Muat Naik
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">
            {isLoading ? "Memuatkan…" : (
              <>
                {data?.total ?? 0} dokumen
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {isFetching && "menyegarkan…"}
                </span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Files className="h-10 w-10 text-muted-foreground/60" />
              <p className="text-sm font-medium">Tiada dokumen dijumpai</p>
              <p className="text-xs text-muted-foreground">
                Cuba ubah kata kunci atau tapisan anda.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-sm">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className="border-b bg-muted/60"
                    >
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className={cn(
                            "px-4 py-3 text-left font-medium text-muted-foreground",
                            header.column.getCanSort() &&
                              "cursor-pointer select-none hover:text-foreground"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          style={{ width: `${header.column.getSize()}px` }}
                        >
                          {header.isPlaceholder ? null : (
                            <span className="inline-flex items-center gap-1">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {header.column.getCanSort() &&
                                ({
                                  asc: <ArrowUp className="h-3 w-3" />,
                                  desc: <ArrowDown className="h-3 w-3" />,
                                }[header.column.getIsSorted() as string] ?? (
                                  <ArrowUpDown className="h-3 w-3 opacity-40" />
                                ))}
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b transition-colors last:border-0 hover:bg-accent/40"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 align-middle">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
