import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      workspaceName,
      workspaceDescription,
      loginMethod,
      notificationPreferences,
      tags,
      language,
      scheduleDays,
    } = body;

    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
        description: workspaceDescription || null,
        loginMethod: loginMethod || "email",
        notificationPreferences: notificationPreferences || [],
        tags: tags || [],
        language: language || null,
        scheduleDays: scheduleDays || [],
        userId: session.user.id,
      },
    });

    // Mark user as onboarded (safe: skip if column doesn't exist yet)
    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { onboarded: true },
      });
    } catch {
      // Column may not exist if migration hasn't been run yet
      console.warn("Could not update onboarded status - migration may be pending");
    }

    return NextResponse.json({ workspace, message: "Workspace created successfully" });
  } catch (error) {
    console.error("Workspace creation error:", error);
    return NextResponse.json({ error: "Failed to create workspace" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaces = await prisma.workspace.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error("Workspace fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch workspaces" }, { status: 500 });
  }
}
