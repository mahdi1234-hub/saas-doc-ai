"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FileText, MessageSquare, Brain, Upload, Search, BarChart3, Zap, Shield, ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const features = [
  { icon: Upload, title: "PDF Upload & Storage", description: "Upload PDFs securely with EdgeStore CDN." },
  { icon: Brain, title: "AI-Powered Analysis", description: "Groq LLM analyzes documents with fast inference." },
  { icon: Search, title: "Semantic Search", description: "Pinecone vector DB enables intelligent querying." },
  { icon: MessageSquare, title: "Chat with Documents", description: "Natural conversations about your documents." },
  { icon: BarChart3, title: "Document Analytics", description: "Track processing, pages, and usage stats." },
  { icon: Shield, title: "Secure Auth", description: "Email OTP login with encrypted sessions." },
];

const faqs = [
  { question: "What file formats are supported?", answer: "DocAI supports PDF documents up to 50MB." },
  { question: "How does AI chat work?", answer: "Groq LLM with Pinecone vector search provides context-aware responses." },
  { question: "Is my data secure?", answer: "Documents are stored on EdgeStore CDN with encrypted connections." },
  { question: "How fast is processing?", answer: "Most PDFs are processed within seconds." },
];

export default function HomePage() {
  const { data: session } = useSession();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <Badge variant="secondary" className="mb-4"><Zap className="h-3 w-3 mr-1" />Powered by Groq AI</Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Chat with Your <span className="text-primary">Documents</span><br />Using AI
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                Upload PDFs, get instant AI-powered analysis, and have natural conversations about your documents.
              </p>
              <div className="flex gap-4">
                <Link href={session ? "/dashboard" : "/auth/login"}>
                  <Button size="lg" className="gap-2">{session ? "Go to Dashboard" : "Get Started Free"}<ArrowRight className="h-4 w-4" /></Button>
                </Link>
                <Link href="#features"><Button size="lg" variant="outline">Learn More</Button></Link>
              </div>
            </div>
          </div>
        </section>
        <Separator />
        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
              <p className="text-muted-foreground">A complete document processing and AI chat platform</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => (
                <Card key={f.title} className="group hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2"><f.icon className="h-5 w-5 text-primary" /></div>
                    <CardTitle className="text-lg">{f.title}</CardTitle>
                    <CardDescription>{f.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
        <Separator />
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12"><h2 className="text-3xl font-bold mb-4">How It Works</h2></div>
            <Tabs defaultValue="upload" className="max-w-2xl mx-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upload">1. Upload</TabsTrigger>
                <TabsTrigger value="process">2. Process</TabsTrigger>
                <TabsTrigger value="chat">3. Chat</TabsTrigger>
              </TabsList>
              <TabsContent value="upload"><Card><CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" />Upload Your PDFs</CardTitle><CardDescription>Drag and drop or click to upload. Files stored on EdgeStore CDN.</CardDescription></CardHeader><CardContent><Progress value={33} className="h-2" /></CardContent></Card></TabsContent>
              <TabsContent value="process"><Card><CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" />AI Processing</CardTitle><CardDescription>Documents chunked, embedded, and stored in Pinecone vector DB.</CardDescription></CardHeader><CardContent><Progress value={66} className="h-2" /></CardContent></Card></TabsContent>
              <TabsContent value="chat"><Card><CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />Chat & Analyze</CardTitle><CardDescription>Ask questions and get AI answers with document context.</CardDescription></CardHeader><CardContent><Progress value={100} className="h-2" /></CardContent></Card></TabsContent>
            </Tabs>
          </div>
        </section>
        <Separator />
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-12"><h2 className="text-3xl font-bold mb-4">FAQ</h2></div>
            <Accordion className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">Join DocAI and start analyzing your documents with AI today.</p>
            <Link href={session ? "/dashboard" : "/auth/login"}><Button size="lg" className="gap-2"><FileText className="h-4 w-4" />{session ? "Go to Dashboard" : "Start Free"}</Button></Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
