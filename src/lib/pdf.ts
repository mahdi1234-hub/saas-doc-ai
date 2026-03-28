import { PDFParse } from "pdf-parse";

export interface PdfChunk {
  content: string;
  pageNumber: number;
}

export async function extractTextFromPdf(buffer: Buffer): Promise<{
  chunks: PdfChunk[];
  pageCount: number;
  fullText: string;
}> {
  // pdf-parse v2 requires Uint8Array instead of Buffer
  const uint8 = new Uint8Array(buffer);
  const parser = new PDFParse(uint8);
  const result = await parser.getText();

  const fullText = result.text;
  const pageCount = result.total;

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
