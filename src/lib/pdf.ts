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
