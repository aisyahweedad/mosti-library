import { NextRequest, NextResponse } from "next/server";

import { getThesis } from "@/lib/search";
import type { Thesis } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatRequestBody = {
  messages: { role: "user" | "assistant"; content: string }[];
  thesis?: { id?: number } | Thesis;
};

const encoder = new TextEncoder();

function sse(parts: string[]): Uint8Array {
  return encoder.encode(parts.join("\n") + "\n");
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Mock of a RAG answer synthesised from the thesis record.
 * Swap this function for a real provider (e.g. `streamText` with
 * @ai-sdk/anthropic + vector retrieval) when the backend exists —
 * the streaming contract to the client stays the same.
 */
function buildAnswer(question: string, t: Thesis): string {
  const q = question.toLowerCase();
  const has = (...words: string[]) => words.some((w) => q.includes(w));

  const sentences: string[] = [];

  if (has("kaedah", "metodologi", "method", "bagaimana kajian", "reka bentuk")) {
    sentences.push(
      `Daripada abstrak dokumen ini, kajian ${t.title} menggunakan pendekatan yang dijelaskan dalam ringkasan berikut: ${t.abstract}`
    );
  } else if (has("dapatan", "hasil", "keputusan", "finding", "conclusion", "kesimpulan")) {
    sentences.push(`Berdasarkan dapatan awal yang diringkaskan: ${t.abstract}`);
  } else if (has("fakulti", "faculty", "bidang", "jabatan")) {
    sentences.push(
      `Tesis ini diklasifikasikan di bawah fakulti ${t.faculty}, selaras dengan kata kunci: ${t.keywords.join(", ")}.`
    );
  } else if (has("siapa", "siapakah", "pengarang", "author", "tahun", "bila", "where")) {
    sentences.push(
      `Rekod ini disediakan oleh ${t.author} (${t.university}, ${t.year}), di bawah nombor panggilan ${t.call}.`
    );
  } else {
    sentences.push(
      `Berdasarkan tesis "${t.title}" (${t.author}, ${t.university}, ${t.year}): ${t.abstract}`
    );
  }

  sentences.push(
    `Kata kunci yang diekstrak: ${t.keywords.join(", ")}.`,
    "Perincian lanjut, termasuk metodologi penuh dan dapatan per bab, akan dapat disediakan sebaik pemprosesan teks penuh dokumen diaktifkan."
  );

  return sentences.join("\n\n");
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ChatRequestBody;
  const lastUserMessage = [...(body.messages ?? [])]
    .reverse()
    .find((m) => m.role === "user");

  let thesis: Thesis | undefined;
  if (body.thesis && "id" in body.thesis && body.thesis.id) {
    thesis = getThesis(body.thesis.id);
  }

  if (!thesis) {
    return NextResponse.json(
      { error: "Maklumat tesis diperlukan untuk menjawab soalan." },
      { status: 400 }
    );
  }

  const answer = buildAnswer(lastUserMessage?.content ?? "", thesis);
  const words = answer.split(/(\s+)/);
  const totalWords = words.filter((w) => w.trim()).length;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        let idx = 0;
        while (idx < words.length) {
          // emit 2 chunks every ~30ms for a natural "typing" rhythm
          const take = Math.min(words.length - idx, idx % 6 === 0 ? 4 : 2);
          const chunk = sse(
            words.slice(idx, idx + take).map(
              (w) => `0:${JSON.stringify(w)}`
            )
          );
          controller.enqueue(chunk);
          idx += take;
          await delay(28);
        }
        controller.enqueue(
          sse([
            `d:${JSON.stringify({
              finishReason: "stop",
              usage: { promptTokens: 120, completionTokens: totalWords },
            })}`,
          ])
        );
        controller.close();
      } catch (err) {
        controller.enqueue(
          sse([`d:${JSON.stringify({ finishReason: "error", error: String(err) })}`])
        );
        controller.close();
      }
    },
    cancel() {},
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Vercel-AI-Data-Stream": "v1",
    },
  });
}
