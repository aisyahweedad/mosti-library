import { NextResponse } from "next/server";

import { sessionFromRequest } from "@/lib/auth";
import { getBook } from "@/lib/books-data";
import { storageBackend, createPresignedUrl, hasLocalObject, localFileStream } from "@/lib/object-store";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await sessionFromRequest(request.headers))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const book = getBook(params.id);
  if (!book || !book.objectKey) {
    return NextResponse.json(
      { error: "Fail tidak dijumpai" },
      { status: 404 }
    );
  }

  const filename = `${book.id}-${book.title.replace(/[^\w-]+/g, "-").toLowerCase().slice(0, 60)}.pdf`;

  if (storageBackend() === "s3") {
    const url = await createPresignedUrl(book.objectKey, filename);
    return NextResponse.redirect(url);
  }

  if (!hasLocalObject(book.objectKey)) {
    return NextResponse.json({ error: "Fail tidak dijumpai" }, { status: 404 });
  }

  const stream = localFileStream(book.objectKey);
  return new NextResponse(stream as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  });
}
