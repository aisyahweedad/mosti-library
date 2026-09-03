import { getDb } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import type { SessionUser } from "@/lib/auth";

type UserRow = {
  email: string;
  name: string;
  role: SessionUser["role"];
  password_salt: string;
  password_hash: string;
  active: number;
};

export function authenticate(
  email: string,
  password: string
): SessionUser | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM users WHERE email = ? AND active = 1")
    .get(email.trim().toLowerCase()) as unknown as UserRow | undefined;
  if (!row) return null;
  if (!verifyPassword(password, row.password_salt, row.password_hash)) {
    return null;
  }
  return { email: row.email, name: row.name, role: row.role };
}
