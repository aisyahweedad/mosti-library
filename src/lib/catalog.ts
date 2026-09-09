import { getDb } from "@/lib/db";

export type CatalogGroup = "kind" | "category";

function rows(group: CatalogGroup): string[] {
  const db = getDb();
  const found = db
    .prepare(
      "SELECT value FROM catalog_options WHERE group_key = ? ORDER BY created_at ASC, value ASC"
    )
    .all(group) as unknown as Array<{ value: string }>;
  return found.map((r) => r.value);
}

export function listKinds(): string[] {
  return rows("kind");
}

export function listCatalogCategories(): string[] {
  return rows("category");
}

export function addOption(group: CatalogGroup, value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const db = getDb();
  db.prepare(
    "INSERT OR IGNORE INTO catalog_options (group_key, value, created_at) VALUES (?, ?, ?)"
  ).run(group, trimmed, new Date().toISOString());
  return true;
}

export function removeOption(group: CatalogGroup, value: string): boolean {
  const db = getDb();
  const result = db
    .prepare("DELETE FROM catalog_options WHERE group_key = ? AND value = ?")
    .run(group, value);
  return result.changes > 0;
}
