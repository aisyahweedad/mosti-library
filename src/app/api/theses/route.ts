import { NextRequest, NextResponse } from "next/server";

import { getStats, searchTheses } from "@/lib/search";
import type { Faculty } from "@/lib/types";
import { FACULTIES } from "@/lib/theses-data";

/**
 * GET /api/theses?query=&faculty=&page=&pageSize=
 *
 * Mock catalogue endpoint. When Meilisearch is wired up, this handler
 * delegates to it — the response shape stays identical.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const query = sp.get("query") ?? "";
  const facultyParam = sp.get("faculty") ?? "Semua";
  const faculty: Faculty | "Semua" | undefined = FACULTIES.includes(
    facultyParam as Faculty
  )
    ? (facultyParam as Faculty)
    : facultyParam === "Semua"
      ? "Semua"
      : undefined;
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(sp.get("pageSize")) || 12));

  const result = searchTheses({ query, faculty, page, pageSize });

  return NextResponse.json(
    {
      ...result,
      catalogue: { ocrPages: getStats().ocrPages },
      hydratedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
