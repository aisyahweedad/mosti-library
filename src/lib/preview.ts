const MAX_PREVIEW_PAGES = 10;

/**
 * Slice a PDF buffer down to its first {@link MAX_PREVIEW_PAGES} pages so a
 * public preview can never expose the whole document. Returns the original
 * data unchanged when the document is already small enough.
 */
export async function buildPreviewPdf(
  data: Uint8Array,
  maxPages: number = MAX_PREVIEW_PAGES
): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");

  const doc = await PDFDocument.load(data, {
    ignoreEncryption: true,
    updateMetadata: false,
  });

  if (doc.getPageCount() <= maxPages) return data;

  const out = await PDFDocument.create();
  const copied = await out.copyPages(
    doc,
    Array.from({ length: maxPages }, (_, i) => i)
  );
  for (const page of copied) out.addPage(page);

  const bytes = await out.save({ useObjectStreams: false });
  if (bytes.byteLength >= data.byteLength) return data;
  return bytes;
}
