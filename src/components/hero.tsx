import { Sparkles } from "lucide-react";

import { SearchCommand } from "@/components/search-command";
import { StatsBar } from "@/components/stats-bar";
import { Badge } from "@/components/ui/badge";
import { AIShowcase } from "@/components/ai-showcase";
import { searchTheses } from "@/lib/search";

export function Hero() {
  const { items } = searchTheses({ page: 1, pageSize: 2 });

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
            Perpustakaan Digital MOSTI
          </Badge>

          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            Carian maklumat menerusi{" "}
            <span className="bg-gradient-to-r from-primary via-sky-600 to-emerald-600 bg-clip-text text-transparent">
              setiap halaman dokumen
            </span>
            .
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Himpunan dokumen dan bahan penyelidikan digital menerusi keupayaan
            AI, dilengkapi fungsi carian dan soal jawab dalam Bahasa Melayu.
          </p>

          <div className="mt-8 max-w-xl">
            <SearchCommand />
          </div>

          <div className="mt-8">
            <StatsBar />
          </div>
        </div>

        {/* decorative catalogue cards */}
        {items.length > 0 && (
          <div className="relative hidden h-[380px] lg:block">
            {items.map((c, i) => (
              <div
                key={c.id}
                className={`absolute left-1/2 top-6 w-[86%] -translate-x-1/2 ${
                  i === 0 ? "-rotate-2" : "rotate-1"
                }`}
                style={{ top: `${i * 92}px`, zIndex: items.length - i }}
              >
                <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/5">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-primary">
                    {c.call}
                  </span>
                  <h3 className="line-clamp-3 font-display text-lg font-semibold leading-snug">
                    {c.title}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {c.author} · {c.year}
                  </span>
                </div>
              </div>
            ))}
            <p className="absolute bottom-2 left-1/2 w-full -translate-x-1/2 text-center text-xs text-muted-foreground">
              Ringkasan, kata kunci &amp; jawapan dijana AI daripada teks OCR.
            </p>
          </div>
        )}
      </div>

      <AIShowcase />
    </section>
  );
}
