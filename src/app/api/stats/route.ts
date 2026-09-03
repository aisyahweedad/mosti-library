import { NextResponse } from "next/server";

import { getStats } from "@/lib/search";

export async function GET() {
  return NextResponse.json({ stats: getStats() });
}
