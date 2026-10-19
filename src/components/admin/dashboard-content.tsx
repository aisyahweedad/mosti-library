"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Database,
  FileText,
  HardDrive,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MONTHLY_UPLOADS } from "@/lib/book-types";
import type { BookStatus } from "@/lib/book-types";

const STATUS_COLORS: Record<BookStatus, string> = {
  Siap: "#16a34a",
  "Dimuat Naik": "#0284c7",
  "Sedang Diproses": "#d97706",
  Menunggu: "#737373",
  Gagal: "#dc2626",
};

const STATUS_TO_KEY: Record<BookStatus, string> = {
  Siap: "ready",
  "Dimuat Naik": "uploaded",
  "Sedang Diproses": "processing",
  Menunggu: "waiting",
  Gagal: "failed",
};

const STATUS_BADGE: Record<
  BookStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Siap: "default",
  "Dimuat Naik": "secondary",
  "Sedang Diproses": "secondary",
  Menunggu: "outline",
  Gagal: "destructive",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ms-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function DashboardContent() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetch("/api/admin/stats").then((r) => r.json()),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-5">
          <Skeleton className="h-80 lg:col-span-3" />
          <Skeleton className="h-80 lg:col-span-2" />
        </div>
      </div>
    );
  }

  const { stats, recent } = data;

  const storagePercent = Math.min(100, (stats.storageGB / 50) * 100);

  const statCards = [
    {
      label: "Jumlah Dokumen",
      value: stats.total,
      icon: Database,
    },
    {
      label: "Buku Diterbit",
      value: stats.books,
      icon: BookOpen,
    },
    {
      label: "Terbitan Diterbit",
      value: stats.theses,
      icon: FileText,
    },
    {
      label: "Storan Digunakan",
      value: `${stats.storageGB} GB`,
      icon: HardDrive,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <p className="text-sm text-muted-foreground">
        Gambaran keseluruhan kandungan dan kualiti repositori Perpustakaan Digital MOSTI.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Muat Naik Bulanan</CardTitle>
            <CardDescription>
              Bilangan dokumen dimuat naik, Jun — Disember
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_UPLOADS} margin={{ left: -24 }}>
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <Tooltip
                  cursor={{ fill: "var(--accent)" }}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--popover)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Status Pemprosesan</CardTitle>
            <CardDescription>Edaran OCR semasa</CardDescription>
          </CardHeader>
          <CardContent className="flex h-64 flex-col items-center justify-center gap-2">
            <div className="h-44 w-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data=                    {Object.keys(STATUS_COLORS).map((status) => ({
                      name: status,
                      value: stats[STATUS_TO_KEY[status as BookStatus]],
                    }))}
                    dataKey="value"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {Object.entries(STATUS_COLORS).map(([k, color]) => (
                      <Cell key={k} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--popover)",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-xs">
              {Object.entries(STATUS_BADGE).map(([status, variant]) => (
                <Badge key={status} variant={variant}>
                  {status}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Muat Naik Terkini</CardTitle>
            <CardDescription>Dokumen paling baharu di repositori</CardDescription>
          </div>
          <Link
            href="/admin/books"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Lihat semua
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {recent.map((book: (typeof recent)[number]) => (
              <div
                key={book.id}
                className="flex flex-col gap-2 px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{book.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {book.author} · {book.year} · {book.kind}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(book.uploadedAt)}
                  </span>
                  <Badge variant={STATUS_BADGE[book.status as BookStatus]}>
                    {book.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kapasiti Storan</CardTitle>
          <CardDescription>
            {stats.storageGB} GB / 50 GB (~{storagePercent.toFixed(0)}% digunakan)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-3 w-full overflow-hidden rounded-full bg-primary/10">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${storagePercent}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
