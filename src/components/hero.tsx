import { Sparkles } from "lucide-react";

import { SearchCommand } from "@/components/search-command";
import { StatsBar } from "@/components/stats-bar";
import { Badge } from "@/components/ui/badge";
import { AIShowcase } from "@/components/ai-showcase";

const CARDS = [
  {
    call: "SH/2020/0056",
    title: "Kajian Etnobotani Tumbuhan Ubatan Tradisional Masyarakat Orang Asli di Pahang",
    meta: "Universiti Malaya · 2020",
    rotate: "-rotate-2",
  },
  {
    call: "SK/2023/0304",
    title: "Pembangunan Sistem Pengesanan Penyakit Daun Padi Menggunakan Rangkaian Neural Konvolusi",
    meta: "Universiti Putra Malaysia · 2023",
    rotate: "rotate-1",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* soft backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_-10%,hsl(var(--primary)/0.10),transparent),radial-gradient(40%_40%_at_90%_20%,hsl(var(--accent)/0.5),transparent)]"
      />

      <div className="container grid gap-14 pb-20 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-24">
        <div>
          <Badge variant="secondary" className="px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Pustaka digital berkuasa AI
          </Badge>

          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            Setiap muka surat tesis,{" "}
            <span className="bg-gradient-to-r from-primary via-sky-600 to-emerald-600 bg-clip-text text-transparent">
              dibaca dan difahami
            </span>{" "}
            oleh AI.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Tesis dan disertasi dari universiti di seluruh negara — diimbas,
            diproses OCR, boleh dicari sehingga ke perenggan, dan boleh disoal
            terus dalam Bahasa Malaysia.
          </p>

          <div className="mt-8 max-w-xl">
            <SearchCommand />
          </div>

          <div className="mt-8">
            <StatsBar />
          </div>
        </div>

        {/* decorative catalogue cards */}
        <div className="relative hidden h-[380px] lg:block">
          {CARDS.map((c, i) => (
            <div
              key={c.call}
              className={`absolute left-1/2 top-6 w-[86%] -translate-x-1/2 ${c.rotate}`}
              style={{ top: `${i * 92}px`, zIndex: CARDS.length - i }}
            >
              <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/5">
                <span className="font-mono text-[11px] uppercase tracking-wider text-primary">
                  {c.call}
                </span>
                <h3 className="font-display text-lg font-semibold leading-snug">
                  {c.title}
                </h3>
                <span className="text-xs text-muted-foreground">{c.meta}</span>
              </div>
            </div>
          ))}
          <p className="absolute bottom-2 left-1/2 w-full -translate-x-1/2 text-center text-xs text-muted-foreground">
            Ringkasan, kata kunci &amp; jawapan dijana AI daripada teks OCR.
          </p>
        </div>
      </div>

      <AIShowcase />
    </section>
  );
}
