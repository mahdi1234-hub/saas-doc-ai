import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documents = await prisma.document.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { chunks: true } } },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Documents fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}
