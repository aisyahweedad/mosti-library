import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export type PasswordHash = { salt: string; hash: string };

export function hashPassword(password: string): PasswordHash {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

export function verifyPassword(
  password: string,
  salt: string,
  expected: string
): boolean {
  const actual = scryptSync(password, salt, 64);
  const expectedBuf = Buffer.from(expected, "hex");
  return (
    expectedBuf.length === actual.length && timingSafeEqual(actual, expectedBuf)
  );
}
