import * as pdfParseModule from "pdf-parse";

// Handle both ESM and CJS exports
const pdfParse = (pdfParseModule as unknown as { default?: typeof pdfParseModule }).default || pdfParseModule;

export interface PdfChunk {
  content: string;
  pageNumber: number;
}

export async function extractTextFromPdf(buffer: Buffer): Promise<{
  chunks: PdfChunk[];
  pageCount: number;
  fullText: string;
}> {
  const parseFn = pdfParse as unknown as (buf: Buffer) => Promise<{ text: string; numpages: number }>;
  const data = await parseFn(buffer);
  const fullText = data.text;
  const pageCount = data.numpages;

  // Split text into chunks of ~500 words
  const words = fullText.split(/\s+/);
  const chunkSize = 500;
  const chunks: PdfChunk[] = [];

  for (let i = 0; i < words.length; i += chunkSize) {
    const chunkWords = words.slice(i, i + chunkSize);
    const content = chunkWords.join(" ").trim();
    if (content.length > 0) {
      const estimatedPage = Math.min(
        Math.ceil(((i / words.length) * pageCount) + 1),
        pageCount
      );
      chunks.push({
        content,
        pageNumber: estimatedPage,
      });
    }
  }

  return { chunks, pageCount, fullText };
}
