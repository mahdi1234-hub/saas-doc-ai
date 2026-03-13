"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FileText, Sparkles, ArrowRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn("email", { email, redirect: false, callbackUrl: "/chat" });
      setSent(true);
    } catch {
      console.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We sent a verification link and OTP code to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Click the link in the email or enter the OTP code to sign in. The code expires in 10 minutes.
            </p>
            <Button variant="outline" onClick={() => setSent(false)}>
              Try a different email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <FileText className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">DocAI SaaS</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered document processing & analytics
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>
              Enter your email to receive a one-time verification code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !email}>
                {loading ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                {loading ? "Sending code..." : "Continue with Email"}
              </Button>
            </form>

            <Separator className="my-6" />

            <p className="text-xs text-center text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
