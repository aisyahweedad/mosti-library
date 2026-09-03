import { NextResponse } from "next/server";

import { sessionFromRequest } from "@/lib/auth";
import { BOOK_KINDS, addBook, listBooks } from "@/lib/books-data";

export async function GET(request: Request) {
  if (!(await sessionFromRequest(request.headers))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const kind = url.searchParams.get("kind");
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q") ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const pageSize = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get("pageSize") ?? 20))
  );

  let items = listBooks();
  if (kind) items = items.filter((b) => b.kind === kind);
  if (status) items = items.filter((b) => b.status === status);
  if (q) {
    const needle = q.toLowerCase();
    items = items.filter(
      (b) =>
        b.title.toLowerCase().includes(needle) ||
        b.author.toLowerCase().includes(needle) ||
        b.call.toLowerCase().includes(needle)
    );
  }

  const total = items.length;
  const start = (page - 1) * pageSize;
  const rows = items.slice(start, start + pageSize);

  return NextResponse.json({ items: rows, total, page, pageSize });
}

export async function POST(request: Request) {
  if (!(await sessionFromRequest(request.headers))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  const author = String(body.author ?? "").trim();
  const year = Number(body.year);
  const kind = String(body.kind ?? "");
  const category = String(body.category ?? "").trim();
  const language = String(body.language ?? "BM");
  const pages = Number(body.pages ?? 0);
  const sizeMB = Number(body.sizeMB ?? 1);

  if (!title || !author || !Number.isFinite(year) || year < 1900 || year > 2100) {
    return NextResponse.json(
      { error: "Sila lengkapkan tajuk, pengarang, dan tahun yang sah" },
      { status: 400 }
    );
  }
  if (!BOOK_KINDS.includes(kind as (typeof BOOK_KINDS)[number])) {
    return NextResponse.json({ error: "Jenis dokumen tidak sah" }, { status: 400 });
  }

  const book = addBook({
    title,
    author,
    year,
    kind: kind as (typeof BOOK_KINDS)[number],
    category: category || "Umum",
    language: (["BM", "EN", "AR"] as const).includes(language as never)
      ? (language as "BM" | "EN" | "AR")
      : "BM",
    pages: Number.isFinite(pages) && pages > 0 ? pages : 0,
    sizeMB: Number.isFinite(sizeMB) && sizeMB > 0 ? sizeMB : 1,
  });

  return NextResponse.json({ ok: true, book }, { status: 201 });
}
