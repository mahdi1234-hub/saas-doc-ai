import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { queryGroq, getEmbedding } from "@/lib/groq";
import { queryVectors } from "@/lib/pinecone";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, conversationId, documentId } = await req.json();

    if (!message || !conversationId) {
      return NextResponse.json({ error: "Message and conversationId are required" }, { status: 400 });
    }

    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId: session.user.id },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Save user message
    await prisma.message.create({
      data: {
        role: "user",
        content: message,
        conversationId,
        documentId: documentId || null,
      },
    });

    // Get relevant context from Pinecone if documents are available
    let context = "";
    try {
      const embedding = await getEmbedding(message);
      const results = await queryVectors(embedding, 5);

      if (results.length > 0) {
        const relevantChunks = results
          .filter((r) => r.score && r.score > 0.3)
          .map((r) => r.metadata?.content || "")
          .filter(Boolean);

        if (relevantChunks.length > 0) {
          context = `\n\nRelevant document context:\n${relevantChunks.join("\n\n")}`;
        }
      }
    } catch (error) {
      console.error("Vector search error:", error);
    }

    // Get conversation history
    const history = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      {
        role: "system",
        content: `You are DocAI, an intelligent document analysis assistant. You help users understand, analyze, and extract insights from their PDF documents. Be concise, accurate, and helpful. When referencing document content, cite specific details.${context}`,
      },
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const aiResponse = await queryGroq(messages);

    // Save assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        role: "assistant",
        content: aiResponse,
        conversationId,
      },
    });

    // Update conversation title if it's the first message
    if (history.length <= 1) {
      const titleResponse = await queryGroq([
        {
          role: "system",
          content: "Generate a short 3-5 word title for this conversation. Only return the title, nothing else.",
        },
        { role: "user", content: message },
      ]);
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { title: titleResponse.substring(0, 100) },
      });
    }

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: { document: { select: { name: true } } },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Messages fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
