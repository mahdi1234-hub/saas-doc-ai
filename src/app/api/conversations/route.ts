import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: { take: 1, orderBy: { createdAt: "desc" } },
        _count: { select: { messages: true } },
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Conversations fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title } = await req.json();

    const conversation = await prisma.conversation.create({
      data: {
        title: title || "New Chat",
        userId: session.user.id,
      },
    });

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Conversation create error:", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
