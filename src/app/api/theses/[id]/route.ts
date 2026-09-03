import { NextRequest, NextResponse } from "next/server";

import { getRelatedTheses, getThesis } from "@/lib/search";
import { toSummary } from "@/lib/mappers";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const thesis = getThesis(params.id);
  if (!thesis) {
    return NextResponse.json({ error: "Tesis tidak dijumpai" }, { status: 404 });
  }
  return NextResponse.json({
    thesis: toSummary(thesis),
    related: getRelatedTheses(thesis).map(toSummary),
    hydratedAt: new Date().toISOString(),
  });
}
