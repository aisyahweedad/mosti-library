import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, GraduationCap, ScanLine } from "lucide-react";

import { ChatPanel } from "@/components/chat-panel";
import { ThesisCard } from "@/components/thesis-card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { getRelatedTheses, getThesis } from "@/lib/search";
import { THESES } from "@/lib/theses-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return THESES.map((t) => ({ id: String(t.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const t = getThesis(Number(params.id));
  if (!t) return { title: "Tesis tidak dijumpai" };
  return {
    title: `${t.title} · ARKIB`,
    description: `${t.abstract.slice(0, 160)}…`,
    openGraph: {
      title: t.title,
      description: t.abstract,
      type: "article",
    },
  };
}

export default function ThesisPage({ params }: { params: { id: string } }) {
  const thesis = getThesis(Number(params.id));
  if (!thesis) notFound();

  const related = getRelatedTheses(thesis);
  const indexedPages = `${thesis.ocrPages}/${thesis.pages}`;

  return (
    <main className="container scroll-mt-24 py-10">
      <Link
        href="/#koleksi"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali kepada koleksi
      </Link>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs uppercase tracking-wider text-primary">
          {thesis.call}
        </span>
        <Badge variant="secondary">{thesis.faculty}</Badge>
        <Badge variant="success">
          <ScanLine className="h-3 w-3" />
          OCR {thesis.ocrAccuracy}
        </Badge>
      </div>

      <h1 className="mt-4 max-w-4xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        {thesis.title}
      </h1>

      <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
        <span className="font-medium text-foreground">{thesis.author}</span>
        <span>·</span>
        <span>{thesis.university}</span>
        <span>·</span>
        <span>{thesis.degree}</span>
      </p>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
        <span>Tahun {thesis.year}</span>
        <span>{thesis.pages} halaman</span>
        <span className="flex items-center gap-1">
          <GraduationCap className="h-3.5 w-3.5" />
          {indexedPages} muka surat di-OCR
        </span>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <Tabs defaultValue="ringkasan">
            <TabsList>
              <TabsTrigger value="ringkasan">Ringkasan AI</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>

            <TabsContent value="ringkasan" className="mt-5">
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="rounded-xl border-l-4 border-primary bg-muted/40 p-5">
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {thesis.abstract}
                  </p>
                </div>

                <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Kata kunci diekstrak AI
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {thesis.keywords.map((k) => (
                    <Badge key={k} variant="outline" className="font-normal">
                      {k}
                    </Badge>
                  ))}
                </div>

                <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
                  Ringkasan ini dijana berdasarkan teks penuh yang diproses OCR.
                  Untuk soalan spesifik, gunakan panel Tanya AI — jawapan
                  dijana terus daripada kandungan dokumen ini.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="metadata" className="mt-5">
              <dl className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
                {[
                  ["Nombor panggilan", thesis.call],
                  ["Fakulti", thesis.faculty],
                  ["Pengarang", thesis.author],
                  ["Universiti", thesis.university],
                  ["Tahun", String(thesis.year)],
                  ["Ijazah", thesis.degree],
                  ["Halaman", `${thesis.pages} (${indexedPages} di-OCR)`],
                  ["Ketepatan OCR", thesis.ocrAccuracy],
                ].map(([label, value]) => (
                  <div key={label} className="bg-card p-4">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-1 text-sm font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <ChatPanel thesisId={thesis.id} thesisTitle={thesis.title} />
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-xl font-bold tracking-tight">
            Tesis berkaitan
          </h2>
          <div className="mt-5 grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {related.map((t) => (
              <ThesisCard key={t.id} thesis={t} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
