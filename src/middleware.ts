import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { BASE_PATH, withBasePath } from "@/lib/base-path";

export async function middleware(request: NextRequest) {
  const token =
    request.cookies.get(SESSION_COOKIE)?.value ?? null;
  const user = await verifySession(token);

  if (!user) {
    const from =
      request.nextUrl.pathname.replace(BASE_PATH, "") || "/admin/dashboard";
    const host =
      request.headers.get("x-forwarded-host") ??
      request.headers.get("host") ??
      request.nextUrl.host;
    const proto =
      request.headers.get("x-forwarded-proto") ??
      request.nextUrl.protocol.replace(/:$/, "");
    const url = new URL(`${proto}://${host}${withBasePath("/login")}`);
    url.searchParams.set("from", from);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
