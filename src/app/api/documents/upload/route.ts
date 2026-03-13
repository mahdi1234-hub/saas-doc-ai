import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractTextFromPdf } from "@/lib/pdf";
import { getEmbedding } from "@/lib/groq";
import { ensureIndex, upsertVectors } from "@/lib/pinecone";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const fileUrl = formData.get("url") as string;

    if (!file && !fileUrl) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    let fileName = "document.pdf";
    let fileSize = 0;
    let pdfBuffer: Buffer;

    if (file) {
      fileName = file.name;
      fileSize = file.size;
      const arrayBuffer = await file.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);
    } else {
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);
      fileName = fileUrl.split("/").pop() || "document.pdf";
      fileSize = pdfBuffer.length;
    }

    // Create document record
    const document = await prisma.document.create({
      data: {
        name: fileName,
        url: fileUrl || "",
        size: fileSize,
        status: "processing",
        userId: session.user.id,
      },
    });

    // Process PDF in background
    processPdf(pdfBuffer, document.id, session.user.id).catch(console.error);

    return NextResponse.json({ document, message: "Document uploaded and processing" });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

async function processPdf(buffer: Buffer, documentId: string, userId: string) {
  try {
    const { chunks, pageCount } = await extractTextFromPdf(buffer);

    await prisma.document.update({
      where: { id: documentId },
      data: { pageCount, status: "embedding" },
    });

    // Ensure Pinecone index exists
    await ensureIndex();

    // Create chunks and embeddings
    const vectors = [];
    for (const chunk of chunks) {
      const dbChunk = await prisma.chunk.create({
        data: {
          content: chunk.content,
          pageNumber: chunk.pageNumber,
          documentId,
        },
      });

      const embedding = await getEmbedding(chunk.content);
      const vectorId = uuidv4();

      await prisma.chunk.update({
        where: { id: dbChunk.id },
        data: { vectorId },
      });

      vectors.push({
        id: vectorId,
        values: embedding,
        metadata: {
          chunkId: dbChunk.id,
          documentId,
          userId,
          pageNumber: chunk.pageNumber,
          content: chunk.content.substring(0, 1000),
        },
      });
    }

    // Upsert vectors in batches
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await upsertVectors(batch);
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { status: "ready" },
    });
  } catch (error) {
    console.error("PDF processing error:", error);
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "error" },
    });
  }
}
