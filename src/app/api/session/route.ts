import { NextResponse } from "next/server";

import { sessionFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await sessionFromRequest(request.headers);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ user });
}
