import { NextResponse } from "next/server";

import { sessionFromRequest } from "@/lib/auth";
import { removeBook } from "@/lib/books-data";
import { deleteObject } from "@/lib/object-store";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await sessionFromRequest(request.headers))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const book = removeBook(params.id);
  if (!book) {
    return NextResponse.json({ error: "Dokumen tidak dijumpai" }, { status: 404 });
  }
  await deleteObject(book.objectKey);
  return NextResponse.json({ ok: true });
}
