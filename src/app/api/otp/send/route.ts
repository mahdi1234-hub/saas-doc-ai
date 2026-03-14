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

    // Find existing user (if any) to link the OTP token
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true },
      });
    } catch (dbError) {
      console.error("Database lookup error:", dbError);
      // Continue without linking to user - OTP can still be created with just email
    }

    try {
      await prisma.otpToken.create({
        data: {
          email,
          otp,
          expires,
          userId: user?.id || null,
        },
      });
    } catch (dbError) {
      console.error("Failed to store OTP in database:", dbError);
      return NextResponse.json(
        { error: "Database error. Please check your DATABASE_URL configuration." },
        { status: 500 }
      );
    }

    // Send email in the background (non-blocking) so the API responds fast
    sendOTPEmail(email, otp).catch((emailError) => {
      console.error("Failed to send OTP email:", emailError);
    });

    return NextResponse.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
