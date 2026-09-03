import { NextResponse } from "next/server";

import { sessionFromRequest } from "@/lib/auth";
import { getBook } from "@/lib/books-data";
import { ingestBook } from "@/lib/ingest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Re-run the ingestion pipeline for a book (admin only).
 * Useful for re-indexing after fixes or backfilling documents that
 * predate the vector pipeline.
 */
export async function POST(request: Request) {
  const session = await sessionFromRequest(request.headers);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as { id?: string };
  const id = typeof body.id === "string" ? body.id.trim() : "";
  const book = id ? getBook(id) : undefined;
  if (!book) {
    return NextResponse.json({ error: "Buku tidak dijumpai" }, { status: 404 });
  }
  if (!book.objectKey) {
    return NextResponse.json(
      { error: "Buku ini tiada fail PDF untuk diproses." },
      { status: 400 }
    );
  }
  void ingestBook(id);
  return NextResponse.json({ ok: true, book: { id, status: "processed" } });
}
