import { ArrowDown, MessageCircleQuestion, ScanLine, Sparkles } from "lucide-react";

const STEPS = [
  {
    icon: ScanLine,
    n: "01",
    title: "Imbasan → teks tepat",
    body: "Setiap muka surat diimbas dan ditranskripsikan — termasuk jadual, benda nota dan tulisan tangan pada helaian pengesahan.",
  },
  {
    icon: Sparkles,
    n: "02",
    title: "Ringkasan & pengelasan",
    body: "Abstrak, kata kunci dan fakulti dijana automatik supaya carian dan penapisan lebih pantas serta tepat.",
  },
  {
    icon: MessageCircleQuestion,
    n: "03",
    title: "Tanya AI dengan dokumen",
    body: "Soal tentang metodologi atau dapatan, dan AI menjawab berdasarkan teks sebenar tesis — bukannya andaian umum.",
  },
];

export function AIShowcase() {
  return (
    <section id="ai" className="border-y border-border/70 bg-muted/40">
      <div className="container py-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-lg font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Bukan sekadar simpanan fail — setiap dokumen difahami.
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Tiga lapisan AI berjalan pada setiap tesis yang dimuat naik, dari
            imbasan mentah hingga sedia untuk disoal.
          </p>
        </div>

        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {STEPS.map(({ icon: Icon, n, title, body }) => (
            <div key={n} className="flex flex-col gap-3 bg-background p-7">
              <span className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {n}
                </span>
              </span>
              <h3 className="font-display text-lg font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center pb-6">
        <ArrowDown className="h-4 w-4 animate-bounce text-muted-foreground/60" />
      </div>
    </section>
  );
}
