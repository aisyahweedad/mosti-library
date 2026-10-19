import { NextRequest, NextResponse } from "next/server";

import { advancedSearch } from "@/lib/advanced-search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query") ?? "";
  if (!query.trim()) {
    return NextResponse.json(
      { query: "", total: 0, results: [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
  const data = await advancedSearch(query);
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
