import { execFileSync } from "node:child_process";

export type MasterRow = {
  bil: string;
  title: string;
  author: string;
  year: number;
  noBorang: string;
  noKotak: string;
  fileName: string;
  fullPath: string;
  pages: number;
  sizeMb: number;
};

function decodeXml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\r/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function colsToLetters(col: string): number {
  let n = 0;
  for (const ch of col) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

/**
 * Parses MASTERLIST_TESIS_PENDIGITALAN.xlsx without any third-party
 * dependency, using the system `unzip` binary and two XML members
 * (sharedStrings + first worksheet). Columns are resolved by header
 * text so reordering is tolerated.
 */
export function parseMasterlist(xlsxPath: string): MasterRow[] {
  const read = (entry: string): string =>
    execFileSync("unzip", ["-p", xlsxPath, entry], {
      encoding: "utf8",
      maxBuffer: 200 * 1024 * 1024,
    });

  const sharedStrings = [...read("xl/sharedStrings.xml").matchAll(/<si>([\s\S]*?)<\/si>/g)]
    .map((m) =>
      [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)]
        .map((t) => t[1])
        .join("")
    )
    .map(decodeXml);

  const sheetXml = read("xl/worksheets/sheet1.xml");
  const rows = [...sheetXml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)];

  const grid: string[][] = rows.map((mrow) => {
    const cells: string[] = [];
    const cellMatches = [...mrow[1].matchAll(/<c[^>]*>([\s\S]*?)<\/c>/g)];
    for (const c of cellMatches) {
      const open = c[0];
      const ref = open.match(/r="([A-Z]+\d+)"/)?.[1];
      if (!ref) continue;
      const col = colsToLetters(ref.replace(/[0-9]/g, ""));
      const type = open.match(/t="([^"]+)"/)?.[1];
      const rawValue = c[1].match(/<v>([\s\S]*?)<\/v>/)?.[1];
      let value = "";
      if (type === "s" && rawValue !== undefined) {
        value = sharedStrings[Number(rawValue)] ?? rawValue;
      } else if (rawValue !== undefined) {
        value = decodeXml(rawValue);
      } else {
        const inline = c[1].match(/<is>([\s\S]*?)<\/is>/)?.[1];
        if (inline) {
          value = decodeXml(
            [...inline.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join("")
          );
        }
      }
      cells[col] = value;
    }
    return cells;
  });

  if (grid.length === 0) return [];

  const header = grid[0];
  const find = (label: string): number =>
    header.findIndex((h) => h && h.toUpperCase().includes(label));
  const idx = {
    bil: find("BIL"),
    title: find("TAJUK"),
    author: find("PENULIS"),
    year: find("PUBLICATION YEAR"),
    noBorang: find("NO. BORANG"),
    noKotak: find("NO. KOTAK"),
    fileName: find("FILE NAME"),
    fullPath: find("FULL PATH"),
    pages: find("PAGE COUNT"),
    sizeMb: find("FILE SIZE"),
  };

  const out: MasterRow[] = [];
  for (const row of grid.slice(1)) {
    const get = (i: number): string =>
      i >= 0 && i < row.length ? (row[i] ?? "").trim() : "";
    const title = get(idx.title);
    if (!title) continue;
    out.push({
      bil: get(idx.bil),
      title,
      author: get(idx.author),
      year: Number(get(idx.year)) || 0,
      noBorang: get(idx.noBorang),
      noKotak: get(idx.noKotak),
      fileName: get(idx.fileName),
      fullPath: get(idx.fullPath),
      pages: Number(get(idx.pages)) || 0,
      sizeMb: Number(get(idx.sizeMb)) || 0,
    });
  }
  return out;
}
