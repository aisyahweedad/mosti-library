import { Plus } from "lucide-react";

const FAQ = [
  {
    q: "Apakah Perpustakaan Digital MOSTI?",
    a: "Perpustakaan Digital MOSTI ialah himpunan dokumen dan bahan penyelidikan digital MOSTI yang diimbas, diproses OCR dan boleh dicari sehingga ke perenggan.",
  },
  {
    q: "Bagaimanakah carian berfungsi?",
    a: "Taip kata kunci atau frasa pada kotak carian. Carian merangkumi keseluruhan teks dokumen, bukan sekadar tajuk dan pengarang.",
  },
  {
    q: "Bolehkah saya membandingkan dokumen?",
    a: "Ya. Gunakan Carian Lanjutan untuk memilih dua atau lebih dokumen, kemudian minta AI membuat analisis perbandingan.",
  },
  {
    q: "Adakah jawapan AI tepat?",
    a: "Jawapan dijana berdasarkan teks sebenar dokumen dan disertakan rujukan halaman. Sila semak halaman yang dirujuk untuk pengesahan.",
  },
  {
    q: "Siapa yang boleh mengakses?",
    a: "Carian dan bacaan terbuka kepada umum. Panel pentadbiran untuk pengurusan kandungan memerlukan log masuk kakitangan berdaftar MOSTI.",
  },
];

export function Faq() {
  return (
    <section id="soalan-lazim" className="container scroll-mt-24 py-16">
      <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
        Soalan Lazim
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Jawapan ringkas kepada soalan yang sering ditanya tentang penggunaan
        Perpustakaan Digital MOSTI.
      </p>

      <div className="mt-8 grid gap-3">
        {FAQ.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-border bg-card p-5"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-display text-base font-semibold">
              {item.q}
              <Plus className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
