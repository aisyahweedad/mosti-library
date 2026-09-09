import { chatCompletion } from "@/lib/ai";

export type ExtractedMetadata = {
  university: string;
  degree: string;
  faculty: string;
};

function clean(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/^[-•*.\s]+|[-•*.\s]+$/g, "")
    .trim();
}

const UNIVERSITY_NAMES = [
  "UNIVERSITI PUTRA MALAYSIA",
  "UNIVERSITI TEKNOLOGI MARA",
  "UNIVERSITI TEKNOLOGI MALAYSIA",
  "UNIVERSITI KEBANGSAAN MALAYSIA",
  "UNIVERSITI SAINS MALAYSIA",
  "UNIVERSITI MALAYSIA PAHANG",
  "UNIVERSITI MALAYSIA PERLIS",
  "UNIVERSITI MALAYSIA TERENGGANU",
  "UNIVERSITI MALAYSIA SABAH",
  "UNIVERSITI MALAYSIA SARAWAK",
  "UNIVERSITI UTARA MALAYSIA",
  "UNIVERSITI TUN HUSSEIN ONN MALAYSIA",
  "UNIVERSITI ISLAM ANTARABANGSA MALAYSIA",
  "UNIVERSITI SULTAN ZAINAL ABIDIN",
  "UNIVERSITI SULTAN IDRIS",
  "UNIVERSITI MALAYSIA KELANTAN",
  "UNIVERSITI PERTAHANAN NASIONAL MALAYSIA",
  "UNIVERSITI TEKNIKAL MALAYSIA MELAKA",
  "KOLEJ UNIVERSITI SAINS DAN TEKNOLOGI MALAYSIA",
  "UNIVERSITI MALAYA",
  "UNIVERSITY OF MALAYA",
  "MULTIMEDIA UNIVERSITY",
  "QUEEN'S UNIVERSITY BELFAST",
  "UNIVERSITY COLLEGE LONDON",
  "KING'S COLLEGE LONDON",
] as const;

/** Tokens that indicate the `UNIVERSITI/UNIVERSITY ...` phrase is not a school. */
const UNIVERSITY_STOPWORDS = new Set([
  "GRANT",
  "GRANTS",
  "RESEARCH",
  "SCHEME",
  "PRESS",
  "FUND",
  "FUNDS",
  "FUNDING",
  "FEDERAL",
  "BUDGET",
  "PROGRAM",
  "PROGRAMME",
  "PROJECT",
  "FELLOWSHIP",
  "NETWORK",
  "REPRESENTATIVE",
  "LECTURER",
]);

const DEGREE_PATTERNS = [
  /\b(DOCTOR\s+OF\s+PHILOSOPHY|DOKTOR\s+FALSAFAH)\b/i,
  /\b(MASTER\s+OF\s+(?:SCIENCE|ENGINEERING|ARTS|PHILOSOPHY|BUSINESS\s+ADMINISTRATION|MANAGEMENT|TECHNOLOGY|EDUCATION)|SARJANA\s+(?:SAINS|KEJURUTERAAN|PENGURUSAN|PENDIDIKAN))\b/i,
  /\b(BACHELOR\s+OF\s+[A-Z]+(?:\s+(?:OF|AND)\s+[A-Z]+)*|SARJANA\s+MUDA\s+[A-Z][A-Z ]*)\b/i,
];

function knownUniversity(text: string): string {
  const upper = text.toUpperCase();
  for (const name of UNIVERSITY_NAMES) {
    if (upper.includes(name)) return name;
  }
  return "";
}

function genericUniversity(text: string): string {
  const upper = text.toUpperCase();
  const re =
    /\b(?:[A-Z&.'’-]+\s+)?UNIVERSITY\s+(?:OF\s+)?[A-Z][A-Z&.'-]*(?:\s+[A-Z][A-Z&.'-]*){0,3}|\bUNIVERSITI\s+[A-Z][A-Z&.'-]*(?:\s+[A-Z][A-Z&.'-]*){0,4}/gi;
  let best = "";
  for (const m of upper.match(re) ?? []) {
    const phrase = clean(m.replace(/\./g, " ").replace(/\s+/g, " "));
    if (phrase.length < 10) continue;
    const last = phrase.split(/\s+/).pop() ?? "";
    if (UNIVERSITY_STOPWORDS.has(last.toUpperCase())) continue;
    if (phrase.length > best.length) best = phrase;
  }
  return best;
}

function heuristicDegree(text: string): string {
  for (const re of DEGREE_PATTERNS) {
    const m = text.match(re);
    if (m) return clean(m[1] ?? m[0]);
  }
  return "";
}

function heuristicFaculty(text: string): string {
  const re =
    /\b(?:FAKULTI|FACULTY)\s+(?:OF\s+)?([A-Z][A-Za-z0-9 &(),.'-]{3,80})|\b(?:PUSAT\s+PENGAJIAN|SCHOOL|INSTITUT|INSTITUTE|AKADEMI|JABATAN)\s+(?:OF\s+)?([A-Z][A-Za-z0-9 &(),.'-]{3,80})/i;
  const m = text.match(re);
  if (!m) return "";
  const raw = clean(m[1] ?? m[2] ?? "");
  if (!raw) return "";
  const cut = raw.split(/\s+(?:UNIVERSITI|UNIVERSITY|IJAZAH|DOKTOR|MASTER|BACHELOR|SARJANA)\b/i)[0];
  return clean(cut);
}

const NOISE_WORDS = new Set([
  "FAKULTI",
  "FACULTY",
  "SCHOOL",
  "INSTITUT",
  "INSTITUTE",
  "AKADEMI",
  "JABATAN",
  "PUSAT",
  "PENGAJIAN",
  "OF",
  "DEGREE",
  "IJAZAH",
  "UNIVERSITI",
  "UNIVERSITY",
  "ABSTRACT",
  "ACKNOWLEDGEMENT",
  "DEDICATION",
]);

/** Drop stray label prefixes and empty-ish noise from a parsed value. */
function cleanSection(value: string): string {
  let v = value;
  v = v
    .replace(/^NAMA\s+UNIVERSITI\s*[:：]?\s*/i, "")
    .replace(/^IJAZAH\s*[:：]?\s*/i, "")
    .replace(/^FAKULTI\s*[:：]?\s*/i, "")
    .replace(/^DEGREE\s*[:：]?\s*/i, "");
  const words = v.split(/\s+/).filter(Boolean);
  if (words.length <= 2 && words.every((w) => NOISE_WORDS.has(w.toUpperCase()))) {
    return "";
  }
  return clean(v);
}

function plausibleUniversity(s: string): boolean {
  if (!s || s.length < 5 || s.length > 45) return false;
  if (!/UNIVERSITI|UNIVERSITY|INSTITUT\b|COLLEGE|AKADEMI|ACADEMY/i.test(s)) return false;
  const p = ` ${s} `;
  if (/the\s|which\s|thesis\s|submitted\s|fulfil|for\s+the\s|based\s+on\s|such\s+as\s|in\s+fulfilment/i.test(p)) return false;
  return true;
}

function plausibleFaculty(s: string): boolean {
  if (!s || s.length < 4 || s.length > 80) return false;
  if (!/(?:FAKULTI|FACULTY|PUSAT\s+PENGAJIAN|SCHOOL|INSTITUT|INSTITUTE|AKADEMI|AKADEMY|JABATAN|DEPARTMENT|DIVISION|CENTRE|CENTER)/i.test(s)) return false;
  const p = ` ${s} `;
  if (/for\s+the\s|which\s|but\s+also\s|such\s+as\s|to\s+the\s|in\s+the\s/i.test(p)) return false;
  return true;
}

function plausibleDegree(s: string): boolean {
  if (!s || s.length < 3 || s.length > 60) return false;
  return /DOCTOR|DOKTOR|MASTER|SARJANA|BACHELOR|IJAZAH|PHD|\bMS\b|\bMSC\b|\bM\.PHIL\b|GRADUATE|DIPLOMA|LICENTIATE|FELLOWSHIP/i.test(s);
}

/** Drop trailing role/noise markers glued onto a school name. */
function trimSchoolNoise(s: string): string {
  return clean(
    s.split(
      /\s+(?:PRINCIPAL|MAIN\s+)?SUPERVISOR|PRINCIPAL|\bDECLARATION|\bABSTRACT|\bACKNOWLEDG(?:MENT)?\b|\bTHESIS\s+SUBMITTED\b/i
    )[0]
  );
}

const FIELD_LABELS: Array<{ key: keyof ExtractedMetadata; names: string[] }> = [
  { key: "university", names: ["NAMA_UNIVERSITI", "UNIVERSITI", "UNIVERSITY", "INSTITUSI"] },
  { key: "faculty", names: ["FAKULTI", "FACULTY"] },
  { key: "degree", names: ["IJAZAH", "DEGREE"] },
];

/**
 * Line-based parser for the labelled model answer. Tolerates values on the
 * same line as the label, nested labels, repeated sections, and extra prose.
 */
function parseSections(out: string): ExtractedMetadata {
  const result: ExtractedMetadata = { university: "", faculty: "", degree: "" };
  const match = (line: string): { field: (typeof FIELD_LABELS)[number]; tail: string } | null => {
    for (const field of FIELD_LABELS) {
      for (const name of field.names) {
        const m = line.match(new RegExp(`^\\s*${name}\\s*[:：]\\s*(.*)$`, "i"));
        if (m) return { field, tail: m[1].trim() };
      }
    }
    return null;
  };

  let active: (typeof FIELD_LABELS)[number] | null = null;
  const parts: Partial<Record<keyof ExtractedMetadata, string[]>> = {};

  for (const line of out.split(/\r?\n/)) {
    const hit = match(line);
    if (hit) {
      active = hit.field;
      if (hit.tail) {
        const prev = parts[hit.field.key];
        parts[hit.field.key] = prev ? [...prev.filter((x) => x !== hit.tail), hit.tail] : [hit.tail];
      }
      continue;
    }
    if (active && line.trim()) {
      const prev = parts[active.key];
      parts[active.key] = prev ? [...prev, line.trim()] : [line.trim()];
    }
  }

  for (const field of FIELD_LABELS) {
    result[field.key] = clean((parts[field.key] ?? []).join(" "));
  }
  return result;
}

/**
 * Extract university / faculty / degree from the front-matter text of a
 * thesis. Uses the LLM first, then falls back to cover-page heuristics so
 * formulaic Malaysian title pages are still resolvable even when the model
 * wanders off the requested output format.
 */
export async function extractBookMetadata(
  book: { title: string; author: string; year: number; category: string },
  frontPages: string[]
): Promise<ExtractedMetadata> {
  const sample = frontPages
    .map((p, i) => `--- Halaman ${i + 1} ---\n${p.replace(/\s+/g, " ").trim()}`)
    .join("\n\n")
    .slice(0, 5000);

  if (!sample.trim()) return { university: "", degree: "", faculty: "" };

  const system =
    "Anda seorang pustakawan arkib MOSTI. Hanya ekstrak apa yang jelas bertulis pada halaman muka depan dokumen. Jangan meneka atau mencipta maklumat. Jika sesuatu tidak jelas, biarkan kosong.";

  const user =
    `Tajuk: ${book.title}\n` +
    `Pengarang: ${book.author}\n` +
    `Tahun: ${book.year}\n\n` +
    `Teks dari halaman awal dokumen:\n\n${sample}\n\n` +
    "Berdasarkan teks di atas, kenal pasti dengan penuh dan rasmi:\n" +
    "1. NAMA_UNIVERSITI — nama universiti/institusi penganugerah (cth: UNIVERSITI PUTRA MALAYSIA).\n" +
    "2. FAKULTI — nama fakulti/pusat pengajian (cth: FAKULTI SAINS).\n" +
    "3. IJAZAH — jenis ijazah (cth: DOKTOR FALSAFAH, MASTER OF SCIENCE, IJAZAH SARJANA MUDA).\n\n" +
    "Balas tepat dalam format berikut, satu per baris, tanpa baris lain:\n" +
    "NAMA_UNIVERSITI:\n<teks>\n\nFAKULTI:\n<teks>\n\nIJAZAH:\n<teks>";

  let out = "";
  try {
    out = await chatCompletion(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { temperature: 0.1, maxTokens: 300 }
    );
  } catch (err) {
    console.warn("[metadata] percubaan LLM gagal, guna heuristik:", err);
  }

  const parsed = parseSections(out);
  const llm: ExtractedMetadata = {
    university: cleanSection(parsed.university),
    faculty: cleanSection(parsed.faculty),
    degree: cleanSection(parsed.degree),
  };

  const h: ExtractedMetadata = {
    university: knownUniversity(sample) || genericUniversity(sample),
    faculty: heuristicFaculty(sample),
    degree: heuristicDegree(sample),
  };

  const trim = (s: string) => (s ? trimSchoolNoise(s) : s);

  return {
    university: trim(knownUniversity(sample) || (plausibleUniversity(llm.university) ? llm.university : genericUniversity(sample))),
    faculty: plausibleFaculty(llm.faculty) ? llm.faculty : h.faculty,
    degree: plausibleDegree(llm.degree) ? llm.degree : h.degree,
  };
}
