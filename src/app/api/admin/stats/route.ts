import { NextResponse } from "next/server";

import { sessionFromRequest } from "@/lib/auth";
import { adminStats, listBooks } from "@/lib/books-data";

export async function GET(request: Request) {
  if (!(await sessionFromRequest(request.headers))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = adminStats();
  const recent = listBooks()
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
    .slice(0, 5);

  return NextResponse.json({ stats, recent });
}
