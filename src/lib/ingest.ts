import { embedTexts, chatCompletion, llmConfigured, type ChatMessage } from "@/lib/ai";
import { getBook, markBookFailed, markBookReady, updateBookProcessing, updateBookCategory } from "@/lib/books-data";
import type { Book } from "@/lib/book-types";
import { LEGACY_CATEGORIES, classifyBookCategory } from "@/lib/categories";
import { extractBookMetadata } from "@/lib/metadata";
import { readObject } from "@/lib/object-store";
import { extractPdfPages } from "@/lib/pdf";
import { saveChunks, initVectorIndex } from "@/lib/vectors";

const MAX_CHUNK_CHARS = 2800; // ≈ 700 tokens
const OVERLAP_WORDS = 90; // ≈ 100 tokens of context overlap
const SKIP_SHORTER_THAN = 20; // drop noise like page numbers / lone headers

type SeedBlock = { text: string; page: number };

/** Split a page's text into semantic blocks (paragraphs), discarding noise. */
function pageBlocks(pages: string[]): SeedBlock[] {
  const blocks: SeedBlock[] = [];
  pages.forEach((pageText, i) => {
    const page = i + 1;
    const parts = pageText.replace(/\r/g, "").split(/\n{2,}/);
    for (const raw of parts) {
      const text = raw.replace(/\s+/g, " ").trim();
      if (text.length >= SKIP_SHORTER_THAN) blocks.push({ text, page });
    }
  });
  return blocks;
}

/** Hard-split an over-long string at sentence boundaries, then at whitespace. */
function splitLongText(text: string): string[] {
  const parts = text.split(/(?<=[.!?])\s+/);
  const out: string[] = [];
  let acc = "";
  for (const p of parts) {
    const piece = p.trim();
    if (!piece) continue;
    if (!acc) {
      acc = piece;
      if (acc.length > MAX_CHUNK_CHARS) {
        // still too long: fall back to whitespace splitting
        out.push(...cutAtWhitespace(acc));
        acc = "";
      }
      continue;
    }
    if ((acc + " " + piece).length > MAX_CHUNK_CHARS) {
      out.push(acc.trim());
      acc = piece;
    } else {
      acc += " " + piece;
    }
  }
  if (acc.trim()) out.push(acc.trim());
  return out.filter((p) => p);
}

function cutAtWhitespace(text: string): string[] {
  const out: string[] = [];
  const words = text.split(/\s+/);
  let acc = "";
  for (const w of words) {
    if (!acc) {
      acc = w;
      continue;
    }
    if ((acc + " " + w).length > MAX_CHUNK_CHARS) {
      out.push(acc);
      acc = w;
    } else {
      acc += " " + w;
    }
  }
  if (acc) out.push(acc);
  return out;
}

function tailWords(text: string, n: number): string {
  const words = text.split(/\s+/);
  return words.slice(-n).join(" ");
}

export function buildChunks(pages: string[]): Array<{ text: string; page: number }> {
  const blocks = pageBlocks(pages);
  const chunks: Array<{ text: string; page: number }> = [];
  let current = "";
  let currentPage = 1;

  function flush() {
    const t = current.trim();
    if (t) chunks.push({ text: t, page: currentPage });
    current = "";
  }

  for (const b of blocks) {
    if (b.text.length > MAX_CHUNK_CHARS) {
      flush();
      for (const piece of splitLongText(b.text)) {
        chunks.push({ text: piece, page: b.page });
      }
      continue;
    }

    if (!current) {
      current = b.text;
      currentPage = b.page;
      continue;
    }

    if ((current + " " + b.text).length > MAX_CHUNK_CHARS) {
      flush();
      const previous = chunks[chunks.length - 1];
      const overlap = tailWords(previous.text, OVERLAP_WORDS);
      const next = overlap ? overlap + " " + b.text : b.text;
      current = next.trim().length > MAX_CHUNK_CHARS ? b.text : next;
      currentPage = b.page;
    } else {
      current += " " + b.text;
    }
  }
  flush();
  return chunks;
}

function headText(pages: string[], maxChars: number): string {
  let out = "";
  for (const p of pages) {
    const block = p.replace(/\s+/g, " ").trim();
    if (out.length + block.length > maxChars) {
      out += " " + block.slice(0, maxChars - out.length);
      break;
    }
    out += " " + block;
  }
  return out.trim();
}

async function generateSummary(book: Book, pages: string[]): Promise<{ summary: string; keywords: string[] }> {
  const sample = headText(pages, 8000);
  const system: ChatMessage =
    book.language === "EN"
      ? {
          role: "system",
          content:
            "You are a research librarian at the Perpustakaan Digital MOSTI. Summaries and keywords must be written in MALAY (Bahasa Melayu) regardless of the source language.",
        }
      : {
          role: "system",
          content:
            "Anda seorang pustakawan di Perpustakaan Digital MOSTI. Jawab dalam Bahasa Melayu walaupun dokumen sumber dalam bahasa lain.",
        };

  const user: ChatMessage = {
    role: "user",
    content:
      `Tajuk: ${book.title}\n` +
      `Pengarang: ${book.author}\n` +
      `Tahun: ${book.year}\n` +
      `Subjek: ${book.category}\n\n` +
      `Terjemahan awal kandungan dokumen (permulaan teks):\n\n${sample}\n\n` +
      "Berdasarkan kandungan di atas, hasilkan:\n" +
      "1. RINGKASAN — ringkasan padat dalam Bahasa Melayu, 3-5 ayat ringkas yang merangkumi tujuan, kaedah, dan dapatan utama kajian.\n" +
      "2. KATA_KUNCI — 5-8 kata kunci pendek dalam Bahasa Melayu/inggeris teknikal.\n\n" +
      "Format jawapan tepat seperti berikut (tanpa baris lain):\n" +
      "RINGKASAN:\n<teks ringkasan>\n\nKATA_KUNCI:\n<k1, k2, k3, ...>",
  };

  const out = await chatCompletion([system, user], { temperature: 0.4, maxTokens: 800 });

  const summaryMatch = out.match(/RINGKASAN:\s*([\s\S]*?)\s*KATA_KUNCI:\s*([\s\S]*)$/);
  if (summaryMatch) {
    const summary = summaryMatch[1].trim();
    const keywords = summaryMatch[2]
      .split(",")
      .map((s) => s.trim().replace(/^[-•*.\s]+|[-•*.\s]+$/g, ""))
      .filter(Boolean)
      .slice(0, 8);
    if (summary) return { summary, keywords };
  }
  // fallback: treat the whole response as a summary
  const cleaned = out.replace(/^[^\n]*RINGKASAN[:\n]*/i, "").trim();
  const words = cleaned.split(/\s+/);
  return { summary: cleaned || "Ringkasan belum tersedia.", keywords: words.slice(0, 6) };
}

const EMBED_BATCH = Math.max(1, Number(process.env.EMBED_BATCH ?? 8));

/**
 * Full ingestion pipeline for a book: extract text → chunk → embed →
 * store vectors → generate summary/keywords → mark Siap.
 * Progress is pushed to the `books` row so the admin UI reflects real work.
 */
export async function ingestBook(bookId: string): Promise<void> {
  const book = getBook(bookId);
  if (!book) return;
  if (!book.objectKey) return;

  let pages: string[] = [];
  try {
    updateBookProcessing(bookId, "Sedang Diproses", 3);

    if (!llmConfigured()) {
      throw new Error("Pintu gerbang LLM belum dikonfigurasi penuh.");
    }

    const data = await readObject(book.objectKey);
    const extract = await extractPdfPages(new Uint8Array(data));
    pages = extract.pages;
    if (pages.length === 0) throw new Error("Tiada teks diekstrak daripada fail PDF.");

    updateBookProcessing(bookId, "Sedang Diproses", 10);

    const chunks = buildChunks(pages);
    if (chunks.length === 0) throw new Error("Tiada teks bermakna selepas chunking.");

    const embeddings: number[][] = [];
    for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
      const batch = chunks.slice(i, i + EMBED_BATCH);
      const embs = await embedTexts(batch.map((c) => `[hlm. ${c.page}]\n${c.text}`));
      embeddings.push(...embs);
      const progress = 10 + Math.round(((i + EMBED_BATCH) / chunks.length) * 74);
      updateBookProcessing(bookId, "Sedang Diproses", Math.min(84, progress));
    }

    const dim = embeddings[0]?.length ?? 0;
    if (dim > 0) initVectorIndex(dim);

    saveChunks(
      bookId,
      chunks.map((c, index) => ({
        chunkIndex: index,
        page: c.page,
        text: c.text,
        embedding: embeddings[index] ?? [],
      }))
    );

    updateBookProcessing(bookId, "Sedang Diproses", 90);

    const { summary, keywords } = await generateSummary(book, pages);
    const meta = await extractBookMetadata(book, pages.slice(0, 4));
    markBookReady(bookId, summary, keywords, meta);

    if (LEGACY_CATEGORIES.includes(book.category as (typeof LEGACY_CATEGORIES)[number])) {
      try {
        const category = await classifyBookCategory(
          book,
          pages.slice(0, 3),
          keywords.join(" ")
        );
        updateBookCategory(bookId, category);
      } catch (err) {
        console.warn(`[ingest] ${bookId} klasifikasi kategori gagal, kekal '${book.category}':`, err);
      }
    }
  } catch (err) {
    console.error(`[ingest] ${bookId} failed:`, err);
    markBookFailed(bookId);
  }
}
