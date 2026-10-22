import { NextRequest, NextResponse } from "next/server";

import { getStats, listCategories, searchTheses } from "@/lib/search";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const query = sp.get("query") ?? "";
  const requested =
    [...sp.getAll("faculty"), ...sp.getAll("faculties")]
      .flatMap((v) => v.split(","))
      .map((v) => v.trim())
      .filter((v) => v.length > 0 && v !== "Semua");
  const faculty: string | string[] | undefined =
    requested.length === 0 ? "Semua" : requested;
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(sp.get("pageSize")) || 12));

  const result = searchTheses({ query, faculty, page, pageSize });

  return NextResponse.json(
    {
      ...result,
      faculties: listCategories(),
      catalogue: { ocrPages: getStats().ocrPages },
      hydratedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
