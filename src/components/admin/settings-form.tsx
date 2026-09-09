"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Files, Layers, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type CatalogResponse = {
  kinds: string[];
  categories: string[];
};

type GroupKey = keyof CatalogResponse;

const GROUP_TO_API = { kinds: "kind", categories: "category" } as const;

async function addOption(group: string, value: string) {
  const res = await fetch("/api/admin/catalog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ group, value }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Gagal menambah pilihan");
}

async function deleteOption(group: string, value: string) {
  const res = await fetch(
    `/api/admin/catalog?group=${encodeURIComponent(group)}&value=${encodeURIComponent(value)}`,
    { method: "DELETE" }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Gagal memadam pilihan");
}

function OptionGroupCard({
  group,
  title,
  description,
  icon: Icon,
}: {
  group: GroupKey;
  title: string;
  description: string;
  icon: typeof Files;
}) {
  const queryClient = useQueryClient();
  const [value, setValue] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["catalog-options"],
    queryFn: async () => {
      const res = await fetch("/api/admin/catalog");
      if (!res.ok) throw new Error("Gagal memuat pilihan katalog");
      return (await res.json()) as CatalogResponse;
    },
  });

  const options = (data?.[group] ?? []) as string[];

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["catalog-options"] });

  const add = useMutation({
    mutationFn: () => addOption(GROUP_TO_API[group], value.trim()),
    onSuccess: () => {
      toast.success(`${title} baharu ditambah`);
      setValue("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (option: string) => deleteOption(GROUP_TO_API[group], option),
    onSuccess: () => {
      toast.success(`${title} dipadam`);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-28 rounded-full" />
              ))}
            </div>
          ) : options.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tiada pilihan lagi.</p>
          ) : (
            options.map((option) => (
              <div
                key={option}
                className="group flex items-center gap-1 rounded-full border bg-card py-0.5 pl-3 pr-1 text-sm"
              >
                {option}
                <button
                  type="button"
                  aria-label={`Padam ${option}`}
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(option)}
                  className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) add.mutate();
          }}
        >
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Tambah ${title.toLowerCase()} baharu…`}
            className="flex-1"
          />
          <Button type="submit" disabled={!value.trim() || add.isPending}>
            {add.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Tambah
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function SettingsForm() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">
            Tetapan Katalog
          </CardTitle>
          <CardDescription>
            Urus pilihan yang tersedia pada borang muat naik dokumen. Perubahan
            terpakai serta-merta tanpa mengubah kod.
          </CardDescription>
        </CardHeader>
      </Card>

      <OptionGroupCard
        group="kinds"
        title="Jenis Dokumen"
        description="Contoh: Buku, Tesis, Jurnal, Laporan Teknikal."
        icon={Layers}
      />

      <OptionGroupCard
        group="categories"
        title="Kategori"
        description="Contoh: Sains & Teknologi, Kejuruteraan, Sains Sosial."
        icon={Files}
      />

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Trash2 className="h-3.5 w-3.5" />
        Memadam pilihan tidak memadam dokumen sedia ada yang menggunakan nilai
        tersebut.
      </div>
    </div>
  );
}
