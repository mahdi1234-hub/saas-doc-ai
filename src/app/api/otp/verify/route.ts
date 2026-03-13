import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const result = await signIn("credentials", {
      email,
      otp,
      redirect: false,
    });

    if (result?.error) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Verification failed";
    if (errorMessage.includes("NEXT_REDIRECT")) {
      return NextResponse.json({ success: true });
    }
    console.error("OTP verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
