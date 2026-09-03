import { NextResponse } from "next/server";

import { sessionFromRequest } from "@/lib/auth";
import { removeBook } from "@/lib/books-data";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await sessionFromRequest(request.headers))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ok = removeBook(params.id);
  if (!ok) {
    return NextResponse.json({ error: "Dokumen tidak dijumpai" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
