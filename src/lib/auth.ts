import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
  },
  providers: [
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      maxAge: 10 * 60,
      async sendVerificationRequest({ identifier: email, url }) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        const callbackUrl = new URL(url);
        callbackUrl.searchParams.set("otp", otp);

        await transporter.sendMail({
          from: `"DocAI SaaS" <${process.env.EMAIL_FROM}>`,
          to: email,
          subject: `Your DocAI Login Code: ${otp}`,
          html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="color: #18181b; font-size: 24px; margin-bottom: 8px;">DocAI SaaS</h1>
              <p style="color: #71717a; margin-bottom: 24px;">Your verification code</p>
              <div style="background: #f4f4f5; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #18181b;">${otp}</span>
              </div>
              <p style="color: #71717a; font-size: 14px;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
              <p style="color: #a1a1aa; font-size: 12px;">Or click this link to sign in: <a href="${url}" style="color: #3b82f6;">${url}</a></p>
            </div>
          `,
        });
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
