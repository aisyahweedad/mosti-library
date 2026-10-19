"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  FileText,
  Loader2,
  Plus,
  ScrollText,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(5, "Tajuk sekurang-kurangnya 5 aksara"),
  author: z.string().min(3, "Nama pengarang diperlukan"),
  year: z.coerce
    .number()
    .int()
    .min(1900, "Tahun tidak sah")
    .max(new Date().getFullYear(), "Tahun pada masa hadapan?"),
  kind: z.string().min(1, "Sila pilih jenis dokumen"),
  category: z.string().min(1, "Pilih subjek"),
  language: z.enum(["BM", "EN", "AR"], { message: "Pilih bahasa" }),
  pages: z.coerce.number().int().min(1, "Bilangan muka surat sah").max(5000),
});

type FormValues = z.infer<typeof schema>;

type Phase = "form" | "uploading" | "done";

type CatalogResponse = {
  kinds: string[];
  categories: string[];
};

export function UploadBookForm() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<Phase>("form");
  const [progress, setProgress] = useState(0);
  const [newSubject, setNewSubject] = useState("");

  const { data: catalog } = useQuery({
    queryKey: ["catalog-options"],
    queryFn: async () => {
      const res = await fetch("/api/admin/catalog");
      if (!res.ok) throw new Error("Gagal memuat pilihan katalog");
      return (await res.json()) as CatalogResponse;
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      kind: "",
      category: "",
      language: "BM",
      year: new Date().getFullYear(),
    },
  });

  const addSubject = useMutation({
    mutationFn: async (value: string) => {
      const res = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group: "category", value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Gagal menambah subjek");
    },
    onSuccess: (_data, value) => {
      setValue("category", value, { shouldValidate: true });
      setNewSubject("");
      queryClient.invalidateQueries({ queryKey: ["catalog-options"] });
      toast.success("Subjek baharu ditambah");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function pickFile(f: File | null) {
    if (!f) return;
    if (!/\.(pdf|djvu)$/i.test(f.name)) {
      toast.error("Hanya fail PDF atau DjVu dibenarkan");
      return;
    }
    setFile(f);
  }

  async function onSubmit(values: FormValues) {
    if (!file) {
      toast.error("Sila pilih fail PDF terlebih dahulu");
      return;
    }

    setPhase("uploading");
    setProgress(5);
    const timer = setInterval(
      () => setProgress((p) => Math.min(95, p + 6 + Math.random() * 12)),
      320
    );

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("title", values.title);
      form.append("author", values.author);
      form.append("year", String(values.year));
      form.append("kind", values.kind);
      form.append("category", values.category);
      form.append("language", values.language);
      form.append("pages", String(values.pages));

      const res = await fetch("/api/admin/books", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      clearInterval(timer);

      if (!res.ok) {
        setProgress(0);
        setPhase("form");
        toast.error(data.error ?? "Gagal muat naik dokumen");
        return;
      }

      setProgress(100);
      setPhase("done");
      toast.success("Dokumen berjaya dimuat naik dan dihantar untuk OCR");
      reset();
      setFile(null);
    } catch {
      clearInterval(timer);
      setProgress(0);
      setPhase("form");
      toast.error("Ralat rangkaian semasa memuat naik");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {phase === "done" ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
              <ScrollText className="h-7 w-7" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">
                Muat naik berjaya
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Dokumen sedang melalui saluran OCR dan akan muncul dalam senarai
                buku sebaik sahaja siap.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setPhase("form");
                  setProgress(0);
                }}
              >
                Muat naik lagi
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/books">Pergi ke Senarai Buku</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Maklumat Dokumen</CardTitle>
            <CardDescription>
              Muat naik buku atau terbitan digital baharu untuk diterbitkan dalam repositori.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  pickFile(e.dataTransfer.files?.[0] ?? null);
                }}
                onClick={() =>
                  document.getElementById("book-file")?.click()
                }
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
                  dragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/60 hover:bg-accent/50"
                )}
              >
                {file ? (
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB · klik untuk
                        menukar
                      </p>
                    </div>
                    <button
                      type="button"
                      className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      aria-label="Buang fail"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="h-10 w-10 text-primary" />
                    <div>
                      <p className="text-sm font-medium">
                        Seret fail ke sini atau klik untuk pilih
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        PDF atau DjVu sehingga 100 MB
                      </p>
                    </div>
                  </>
                )}
              </div>
              <input
                id="book-file"
                type="file"
                accept=".pdf,.djvu,application/pdf"
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="title">Tajuk</Label>
                  <Input
                    id="title"
                    placeholder="cth. Kesan Aplikasi Nanoteknologi dalam Pertanian"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-xs text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Pengarang</Label>
                  <Input
                    id="author"
                    placeholder="cth. Dr. Sallehuddin bin Mat Nor"
                    {...register("author")}
                  />
                  {errors.author && (
                    <p className="text-xs text-destructive">{errors.author.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Tahun Terbitan</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="2024"
                    {...register("year")}
                  />
                  {errors.year && (
                    <p className="text-xs text-destructive">{errors.year.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kind">Jenis Dokumen</Label>
                  <Select
                    value={watch("kind")}
                    onValueChange={(v) => setValue("kind", v, { shouldValidate: true })}
                  >
                    <SelectTrigger id="kind">
                      <SelectValue placeholder="Pilih jenis dokumen" />
                    </SelectTrigger>
                    <SelectContent>
                      {(catalog?.kinds ?? []).map((k) => (
                        <SelectItem key={k} value={k}>
                          {k}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.kind && (
                    <p className="text-xs text-destructive">{errors.kind.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Subjek</Label>
                  <Select
                    value={watch("category")}
                    onValueChange={(v) => setValue("category", v, { shouldValidate: true })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Pilih subjek" />
                    </SelectTrigger>
                    <SelectContent>
                      {(catalog?.categories ?? []).map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-xs text-destructive">
                      {errors.category.message}
                    </p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Input
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="Tambah subjek baharu…"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!newSubject.trim() || addSubject.isPending}
                      onClick={() => {
                        const value = newSubject.trim();
                        if (value) addSubject.mutate(value);
                      }}
                    >
                      {addSubject.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                      Tambah
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Bahasa</Label>
                  <Select value={watch("language")} onValueChange={(v) => setValue("language", v as FormValues["language"])}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BM">Bahasa Melayu</SelectItem>
                      <SelectItem value="EN">English</SelectItem>
                      <SelectItem value="AR">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pages">Bilangan Muka Surat</Label>
                  <Input
                    id="pages"
                    type="number"
                    placeholder="cth. 250"
                    {...register("pages")}
                  />
                  {errors.pages && (
                    <p className="text-xs text-destructive">{errors.pages.message}</p>
                  )}
                </div>
              </div>

              {phase === "uploading" && (
                <div className="space-y-2 rounded-md border bg-muted/40 p-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Memuat naik dan menghantar ke mesin OCR…
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setFile(null);
                  }}
                >
                  Kosongkan
                </Button>
                <Button type="submit" disabled={phase === "uploading"}>
                  {phase === "uploading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memuat naik…
                    </>
                  ) : (
                    "Terbitkan Dokumen"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
