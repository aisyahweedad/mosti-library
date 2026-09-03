import { NextResponse } from "next/server";

import { sessionFromRequest } from "@/lib/auth";
import { BOOK_KINDS, addBook, listBooks, removeBook } from "@/lib/books-data";
import { getDb } from "@/lib/db";
import { putObject } from "@/lib/object-store";
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
  const session = await sessionFromRequest(request.headers);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fields: Record<string, string> = {};
  let file: { bytes: Uint8Array; name: string; contentType: string } | null =
    null;

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    try {
      const form = await request.formData();
      for (const key of [
        "title",
        "author",
        "year",
        "kind",
        "category",
        "language",
        "pages",
      ]) {
        const v = form.get(key);
        if (typeof v === "string") fields[key] = v;
      }
      const raw = form.get("file");
      if (raw && typeof raw !== "string") {
        file = {
          bytes: new Uint8Array(await raw.arrayBuffer()),
          name: raw.name,
          contentType: raw.type || "application/pdf",
        };
      }
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
  } else {
    try {
      const body = (await request.json()) as Record<string, unknown>;
      for (const key of [
        "title",
        "author",
        "year",
        "kind",
        "category",
        "language",
        "pages",
      ]) {
        const v = body[key];
        if (v !== undefined && v !== null) fields[key] = String(v);
      }
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
  }

  const title = (fields.title ?? "").trim();
  const author = (fields.author ?? "").trim();
  const year = Number(fields.year);
  const kind = fields.kind ?? "";
  const category = (fields.category ?? "").trim();
  const language = (fields.language ?? "BM").trim();
  const pages = Number(fields.pages ?? 0);

  if (!title || !author || !Number.isFinite(year) || year < 1900 || year > 2100) {
    return NextResponse.json(
      { error: "Sila lengkapkan tajuk, pengarang, dan tahun yang sah" },
      { status: 400 }
    );
  }
  if (!BOOK_KINDS.includes(kind as (typeof BOOK_KINDS)[number])) {
    return NextResponse.json({ error: "Jenis dokumen tidak sah" }, { status: 400 });
  }

  const sizeMB =
    file && file.bytes.length > 0
      ? Math.round((file.bytes.length / 1024 / 1024) * 100) / 100
      : 1;

  const book = addBook(
    {
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
    },
    { collatedBy: session.name }
  );

  let objectKey: string | null = null;
  if (file && file.bytes.length > 0) {
    objectKey = `books/${book.id}.pdf`;
    try {
      await putObject(objectKey, file.bytes, file.contentType || "application/pdf");
    } catch {
      removeBook(book.id);
      return NextResponse.json(
        {
          error:
            "Gagal menyimpan fail ke storan objek. Sila semak RustFS dan cuba lagi.",
        },
        { status: 502 }
      );
    }
    getDb()
      .prepare("UPDATE books SET object_key = ? WHERE id = ?")
      .run(objectKey, book.id);
  }

  return NextResponse.json({ ok: true, book }, { status: 201 });
}
