import { NextResponse } from "next/server";

import {
  SESSION_COOKIE,
  authenticate,
  cookieOptions,
  createSession,
} from "@/lib/auth";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = body.email?.trim();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "E-mel dan kata laluan diperlukan" },
      { status: 400 }
    );
  }

  const user = authenticate(email, password);
  if (!user) {
    return NextResponse.json(
      { error: "E-mel atau kata laluan salah" },
      { status: 401 }
    );
  }

  const token = await createSession(user);
  const response = NextResponse.json({ ok: true, user });
  response.cookies.set(
    SESSION_COOKIE,
    token,
    cookieOptions(60 * 60 * 24)
  );
  return response;
}
