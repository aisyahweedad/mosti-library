import Link from "next/link";
import { ScanSearch } from "lucide-react";

const COLS = [
  {
    title: "Koleksi",
    links: [
      { href: "/#koleksi", label: "Katalog tesis" },
      { href: "/query-builder", label: "Query Builder" },
      { href: "/#ai", label: "Ciri AI" },
    ],
  },
  {
    title: "Sumber",
    links: [
      { href: "/#ai", label: "OCR & pemprosesan" },
      { href: "/#tentang", label: "Metodologi" },
      { href: "/openapi", label: "Dokumentasi API" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer id="tentang" className="border-t border-border/70 bg-muted/40">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-sky-600 text-primary-foreground">
                <ScanSearch className="h-[18px] w-[18px]" />
              </span>
              <span className="font-display text-lg font-bold tracking-tight">
                ARKIB
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Arkib tesis dan disertasi kebangsaan yang diimbas, diproses OCR dan
              difahami oleh AI — boleh dicari sehingga ke perenggan dan disoal
              terus dalam Bahasa Malaysia.
            </p>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <h3 className="text-sm font-semibold">{c.title}</h3>
              <ul className="mt-4 space-y-3">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2025 ARKIB — prototype antaramuka. Data tesis adalah rekaan untuk tunjuk cara.</p>
          <p className="font-mono">v0.2 · dibina dengan shadcn/ui</p>
        </div>
      </div>
    </footer>
  );
}
