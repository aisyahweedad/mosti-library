import { NextResponse } from "next/server";

import {
  SESSION_COOKIE,
  cookieOptions,
  sessionFromRequest,
} from "@/lib/auth";

export async function POST(request: Request) {
  await sessionFromRequest(request.headers);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    SESSION_COOKIE,
    "",
    { ...cookieOptions(0), expires: new Date(0) }
  );
  return response;
}
