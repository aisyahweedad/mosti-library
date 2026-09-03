import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "arkib_session";

export type SessionUser = {
  email: string;
  name: string;
  role: "Pentadbir" | "Pengguna Berdaftar";
};

const MOCK_USERS = [
  {
    email: "admin@arkib.gov.my",
    password: "arkib2024",
    name: "Nurul Aina binti Ahmad",
    role: "Pentadbir" as const,
  },
];

function secretKey(): Uint8Array {
  return new TextEncoder().encode(
    process.env.JWT_SECRET ?? "dev-secret-arkib-change-in-production"
  );
}

export async function createSession(user: SessionUser): Promise<string> {
  return await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secretKey());
}

export async function verifySession(token: string | null | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export function authenticate(
  email: string,
  password: string
): SessionUser | null {
  const user = MOCK_USERS.find(
    (u) =>
      u.email.toLowerCase() === email.trim().toLowerCase() &&
      u.password === password
  );
  if (!user) return null;
  return { email: user.email, name: user.name, role: user.role };
}

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function sessionFromRequest(headers: Headers): Promise<SessionUser | null> {
  const cookie = headers.get("cookie") ?? "";
  const token = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`))
    ?.split("=")
    .slice(1)
    .join("=");
  return verifySession(token ? decodeURIComponent(token) : null);
}
