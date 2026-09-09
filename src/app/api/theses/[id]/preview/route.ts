import { NextResponse } from "next/server";

import { getBook } from "@/lib/books-data";
import { readObject } from "@/lib/object-store";
import { buildPreviewPdf } from "@/lib/preview";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const book = getBook(params.id);
  if (!book || !book.objectKey) {
    return NextResponse.json({ error: "Fail tidak dijumpai" }, { status: 404 });
  }

  try {
    const data = await readObject(book.objectKey);
    const preview = await buildPreviewPdf(data);
    const filename = `${book.id}-pratonton.pdf`;

    return new NextResponse(preview as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(filename)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error(`[/api/theses/${params.id}/preview]`, err);
    return NextResponse.json(
      { error: "Pratonton tidak tersedia untuk dokumen ini." },
      { status: 500 }
    );
  }
}
