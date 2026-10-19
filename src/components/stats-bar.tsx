"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText, Landmark, Layers, ScanLine } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

type Stats = {
  total: number;
  ocrPages: number;
  faculties: number;
  universities: number;
  asOf: string;
};

const ITEMS = [
  {
    key: "total" as const,
    label: "Terbitan Digital",
    icon: FileText,
  },
  {
    key: "ocrPages" as const,
    label: "Halaman didigitalkan",
    icon: ScanLine,
  },
  {
    key: "faculties" as const,
    label: "Jenis Koleksi",
    icon: Layers,
  },
  {
    key: "universities" as const,
    label: "Sumber Penerbitan",
    icon: Landmark,
  },
];

const fmt = (n: number) => n.toLocaleString("en-MY");

export function StatsBar() {
  const { data } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Gagal memuat statistik");
      const json = (await res.json()) as { stats: Stats };
      return json.stats;
    },
  });

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {ITEMS.map(({ key, label, icon: Icon }) => (
        <div
          key={key}
          className="group flex flex-col gap-2 rounded-2xl border border-border bg-card/60 p-5 transition-colors hover:border-primary/30"
        >
          <Icon className="h-4 w-4 text-primary/70" />
          <div className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[1.7rem]">
            {data ? (
              fmt(data[key])
            ) : (
              <Skeleton className="h-8 w-16" />
            )}
          </div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      ))}
    </div>
  );
}
