import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { queryGroq } from "@/lib/groq";
import { queryDocuments } from "@/lib/pinecone";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { message, conversationId, documentId } = body;

    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId, userId: session.user.id },
      });
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
          userId: session.user.id,
        },
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        role: "user",
        content: message,
        conversationId: conversation.id,
        documentId,
        userId: session.user.id,
      },
    });

    // Get document context from Pinecone if relevant
    let context = "";
    if (documentId) {
      const results = await queryDocuments(message, documentId);
      context = results.map((r) => r.text).join("\n\n");
    } else {
      // Search across all user's documents
      const results = await queryDocuments(message);
      if (results.length > 0 && results[0].score > 0.3) {
        context = results.map((r) => r.text).join("\n\n");
      }
    }

    // Get conversation history
    const history = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      {
        role: "system",
        content: `You are DocAI, an intelligent document analysis assistant. You help users understand, analyze, and extract insights from their PDF documents. Be helpful, accurate, and thorough in your responses. When document context is available, base your answers on it and cite relevant sections.${
          context ? `\n\nRelevant document context:\n${context}` : ""
        }`,
      },
      ...history.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ];

    const aiResponse = await queryGroq(messages);

    // Save assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        role: "assistant",
        content: aiResponse,
        conversationId: conversation.id,
        documentId,
        userId: session.user.id,
      },
    });

    // Update conversation title if it's the first message
    if (history.length <= 1) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      message: assistantMessage,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      conversation: { userId: session.user.id },
    },
    orderBy: { createdAt: "asc" },
    include: { document: true },
  });

  return NextResponse.json(messages);
}
