import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOTP, sendOTPEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });

    await prisma.otpToken.create({
      data: {
        email,
        otp,
        expires,
        userId: user?.id || null,
      },
    });

    await sendOTPEmail(email, otp);

    return NextResponse.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
