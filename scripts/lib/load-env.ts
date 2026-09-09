import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Loads a Next.js-style .env.local file into process.env.
 * Must be called before importing app modules so that env-driven
 * configuration (e.g. RUSTFS_*) is visible at module-init time.
 * Existing values in process.env are never overwritten.
 */
export function loadLocalEnv(file = ".env.local"): void {
  const abs = path.resolve(process.cwd(), file);
  if (!existsSync(abs)) return;
  const text = readFileSync(abs, "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    if (!key) continue;
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}
