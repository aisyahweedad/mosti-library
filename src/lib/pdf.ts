import { PDFParse } from "pdf-parse";

/** Extract per-page plain text from a PDF buffer. */
export async function extractPdfPages(data: Uint8Array): Promise<{
  pages: string[];
  total: number;
}> {
  const parser = new PDFParse({ data });
  try {
    const result = await parser.getText({
      pageJoiner: "",
      lineEnforce: true,
    });
    return {
      pages: result.pages.map((p) => p.text ?? ""),
      total: result.total,
    };
  } finally {
    await parser.destroy().catch(() => {});
  }
}

/**
 * Extract plain text from only the first {@link count} pages (front
 * matter / title page), without parsing the whole document. Returns fewer
 * pages when the document is shorter.
 */
export async function extractPdfFrontMatter(
  data: Uint8Array,
  count = 4
): Promise<{ pages: string[]; total: number }> {
  const parser = new PDFParse({ data });
  try {
    const result = await parser.getText({
      partial: Array.from({ length: count }, (_, i) => i + 1),
      pageJoiner: "",
      lineEnforce: true,
    });
    return {
      pages: result.pages.map((p) => p.text ?? ""),
      total: result.total,
    };
  } finally {
    await parser.destroy().catch(() => {});
  }
}
