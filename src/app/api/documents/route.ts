import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { embedAndStore } from "@/lib/pinecone";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(documents);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, url, size } = body;

    const document = await prisma.document.create({
      data: {
        name,
        url,
        size,
        userId: session.user.id,
        status: "processing",
      },
    });

    // Process PDF in background
    processPdf(document.id, url).catch(console.error);

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}

async function processPdf(documentId: string, url: string) {
  try {
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    // Dynamic require to avoid build-time DOMMatrix error
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ numpages: number; text: string }>;
    const data = await pdfParse(buffer);

    await prisma.document.update({
      where: { id: documentId },
      data: {
        pageCount: data.numpages,
        status: "embedding",
      },
    });

    // Embed and store in Pinecone
    await embedAndStore(documentId, data.text);

    await prisma.document.update({
      where: { id: documentId },
      data: { status: "ready" },
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "error" },
    });
  }
}
