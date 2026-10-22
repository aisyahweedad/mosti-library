import { NextRequest, NextResponse } from "next/server";

import { chatCompletion, embedQuery, llmConfigured } from "@/lib/ai";
import { getBook } from "@/lib/books-data";
import { keywordSearchChunks, searchChunks } from "@/lib/vectors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CompareBody = {
  query?: unknown;
  ids?: unknown;
};

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as CompareBody | null;
  const query = typeof body?.query === "string" ? body.query.trim() : "";
  const ids = Array.isArray(body?.ids)
    ? body.ids.filter((id): id is string => typeof id === "string")
    : [];

  if (!query) {
    return NextResponse.json(
      { error: "Sila masukkan pertanyaan carian terlebih dahulu." },
      { status: 400 }
    );
  }
  if (ids.length < 2) {
    return NextResponse.json(
      { error: "Pilih sekurang-kurangnya dua dokumen untuk dibandingkan." },
      { status: 400 }
    );
  }
  if (!llmConfigured()) {
    return NextResponse.json(
      { error: "Saluran AI belum dikonfigurasi." },
      { status: 503 }
    );
  }

  let embedding: number[] | undefined;
  try {
    embedding = await embedQuery(query);
  } catch (err) {
    console.error("[compare] gagal menjana embedding:", err);
  }

  const sections: string[] = [];
  for (const id of ids.slice(0, 6)) {
    const book = getBook(id);
    if (!book) continue;

    let excerpt = "";
    try {
      const hits = embedding
        ? searchChunks(book.id, embedding, 4)
        : keywordSearchChunks(book.id, query, 4);
      excerpt = hits
        .map(
          (h) =>
            `[hlm. ${h.page ?? "?"}] ${h.text.replace(/\s+/g, " ").trim()}`
        )
        .join("\n");
    } catch {
      excerpt = "";
    }

    sections.push(
      `### ${book.title}\n` +
        `Pengarang: ${book.author} · Tahun: ${book.year} · Jenis: ${book.kind}\n` +
        `Subjek: ${book.category}\n` +
        (book.abstract ? `Abstrak: ${book.abstract.slice(0, 600)}\n` : "") +
        (excerpt ? `Petikan relevan:\n${excerpt}` : "Tiada petikan relevan dijumpai.")
    );
  }

  if (sections.length < 2) {
    return NextResponse.json(
      { error: "Dokumen yang dipilih tidak mencukupi." },
      { status: 400 }
    );
  }

  const system =
    "Anda penganalisis penyelidikan di Perpustakaan Digital MOSTI. " +
    "Bandingkan dokumen yang diberi berdasarkan pertanyaan pengguna. " +
    "Balas dalam Bahasa Melayu dengan format: persamaan, perbezaan, dan " +
    "kesimpulan. Sertakan rujukan dokumen (tajuk) dan nombor halaman jika ada. " +
    "Jangan mencipta fakta di luar konteks. " +
    "Gaya jawapan mesti ringkas dan terus kepada poin utama; elakkan ayat " +
    "pembuka yang tidak perlu atau mengulang soalan. Gunakan perenggan pendek " +
    "atau senarai berbulet jika sesuai, dan jangan gunakan simbol tajuk " +
    "Markdown seperti '#' atau '##'.";
  const user =
    `Pertanyaan pengguna: ${query}\n\n` +
    `Dokumen untuk dibandingkan:\n\n${sections.join("\n\n")}`;

  try {
    const comparison = await chatCompletion(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { temperature: 0.3, maxTokens: 4096 }
    );
    if (!comparison.trim()) {
      return NextResponse.json(
        { error: "AI tidak menghasilkan jawapan. Sila cuba lagi." },
        { status: 502 }
      );
    }
    return NextResponse.json({ comparison, documents: sections.length });
  } catch (err) {
    console.error("[compare] gagal menjana perbandingan:", err);
    return NextResponse.json(
      { error: "Gagal menjana perbandingan AI. Sila cuba lagi." },
      { status: 502 }
    );
  }
}
