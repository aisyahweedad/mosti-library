import { NextRequest, NextResponse } from "next/server";

import { streamChatCompletion, embedTexts, llmConfigured, type ChatMessage } from "@/lib/ai";
import { getBook } from "@/lib/books-data";
import { searchChunks } from "@/lib/vectors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatRequestBody = {
  messages: { role: "user" | "assistant"; content: string }[];
  thesis?: { id?: string };
};

const encoder = new TextEncoder();

function sse(parts: string[]): Uint8Array {
  return encoder.encode(parts.join("\n") + "\n");
}

function emit(controller: ReadableStreamDefaultController<Uint8Array>, parts: string[]) {
  try {
    controller.enqueue(sse(parts));
  } catch {
    // stream was aborted by the client
  }
}

function done(controller: ReadableStreamDefaultController<Uint8Array>, finishReason: string, error = "") {
  emit(controller, [
    `d:${JSON.stringify({
      finishReason,
      usage: { promptTokens: 0, completionTokens: 0 },
      error: error || undefined,
    })}`,
  ]);
}

const MAX_HISTORY = 8;

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as ChatRequestBody | null;
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const thesisId =
    body?.thesis && typeof body.thesis.id === "string" ? body.thesis.id : "";

  const book = thesisId ? getBook(thesisId) : undefined;
  if (!book) {
    return NextResponse.json(
      { error: "Dokumen tidak dijumpai." },
      { status: 404 }
    );
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");

  let aborted = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (!lastUser?.content.trim()) {
          emit(controller, [`0:${JSON.stringify("Sila tanya sesuatu tentang dokumen ini.")}`]);
          done(controller, "stop");
          controller.close();
          return;
        }

        if (book.status !== "Siap" || !llmConfigured()) {
          const note =
            book.status !== "Siap"
              ? `Dokumen ini masih berstatus "${book.status}". Soalan kandungan boleh dijawab sebaik sahaja pemprosesan indeks selesai.`
              : "Saluran jawapan AI belum dikonfigurasi (semak pemboleh ubah persekitaran LLM).";
          emit(controller, [`0:${JSON.stringify(note)}`]);
          done(controller, "stop");
          controller.close();
          return;
        }

        const [queryEmbedding] = await embedTexts([lastUser.content]);
        const hits = searchChunks(book.id, queryEmbedding, 6);

        const modelMessages: ChatMessage[] = [
          {
            role: "system",
            content:
              `Anda adalah pembantu penyelidikan untuk dokumen arkib "${book.title}" ` +
              `oleh ${book.author} (${book.year}), nombor panggilan ${book.call}. ` +
              "Balas dalam Bahasa Melayu. Jawab hanya berdasarkan KONTEKS yang diberikan; " +
              "sebut nombor halaman seperti (hlm. 12) apabila merujuk kepadanya. " +
              "Jika maklumat itu tiada dalam KONTEKS, nyatakan \"Maklumat ini tidak terdapat dalam dokumen.\" " +
              "Jangan mencipta fakta atau meneka.",
          },
          hits.length > 0
            ? {
                role: "user" as const,
                content:
                  "KONTEKS DOKUMEN (petikan berindeks beserta halaman):\n" +
                  hits
                    .map((h) => `[hlm. ${h.page ?? "?"}]\n${h.text}`)
                    .join("\n\n---\n\n") +
                  `\n\nSoalan saya:\n${lastUser.content}`,
              }
            : {
                role: "user" as const,
                content:
                  "KONTEKS DOKUMEN: (tiada petikan berindeks tersedia untuk soalan ini).\n" +
                  "Jawab berdasarkan metadata dokumen yang anda tahu sahaja, atau nyatakan bahawa maklumat tidak terdapat dalam dokumen.\n\n" +
                  `Soalan saya:\n${lastUser.content}`,
              },
          ...messages.slice(-MAX_HISTORY).map((m) => ({
            role: m.role === "assistant" ? "assistant" as const : "user" as const,
            content: m.content,
          })),
        ];

        for await (const delta of streamChatCompletion(modelMessages, {
          temperature: 0.4,
        })) {
          if (aborted) return;
          emit(controller, [`0:${JSON.stringify(delta)}`]);
        }
        if (aborted) return;
        done(controller, "stop");
        controller.close();
      } catch (err) {
        console.error("[/api/chat] RAG error:", err);
        if (aborted) return;
        emit(controller, [
          `0:${JSON.stringify("Maaf, berlaku ralat semasa menjana jawapan. Sila cuba lagi.")}`,
        ]);
        done(controller, "error", String(err));
        controller.close();
      }
    },
    cancel() {
      aborted = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
