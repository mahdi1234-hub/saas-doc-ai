import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTPEmail(email: string, otp: string) {
  const mailOptions = {
    from: `"DocAI SaaS" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Your Login Code - DocAI",
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #18181b 0%, #27272a 100%); border-radius: 16px; padding: 40px; text-align: center;">
          <h1 style="color: #fafafa; font-size: 24px; margin-bottom: 8px;">DocAI</h1>
          <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 32px;">Your verification code</p>
          <div style="background: #09090b; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <span style="color: #fafafa; font-size: 36px; font-weight: 700; letter-spacing: 8px;">${otp}</span>
          </div>
          <p style="color: #71717a; font-size: 12px;">This code expires in 10 minutes.<br/>If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
