import type { Metadata } from "next";

import { AdvancedSearch } from "@/components/advanced-search";

export const metadata: Metadata = {
  title: "Carian Lanjutan",
  description:
    "Carian kandungan penuh merentas semua terbitan digital dan perbandingan berasaskan AI.",
};

export default function AdvancedSearchPage() {
  return (
    <main className="container scroll-mt-24 py-16">
      <div className="max-w-3xl">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Carian Lanjutan
        </h1>
        <p className="mt-3 text-muted-foreground">
          Cari maklumat dalam keseluruhan kandungan dokumen, berserta fungsi
          perbandingan bahan rujukan.
        </p>
      </div>

      <div className="mt-10">
        <AdvancedSearch />
      </div>
    </main>
  );
}
