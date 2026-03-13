"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";

interface Stats {
  totalDocuments: number;
  totalConversations: number;
  totalMessages: number;
  readyDocuments: number;
  processingDocuments: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats>({
    totalDocuments: 0,
    totalConversations: 0,
    totalMessages: 0,
    readyDocuments: 0,
    processingDocuments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [docsRes, convsRes] = await Promise.all([
          fetch("/api/documents"),
          fetch("/api/conversations"),
        ]);
        const docs = await docsRes.json();
        const convs = await convsRes.json();

        const ready = docs.filter((d: { status: string }) => d.status === "ready").length;
        const processing = docs.filter((d: { status: string }) => d.status === "processing" || d.status === "embedding").length;
        const totalMsgs = convs.reduce((sum: number, c: { messages?: unknown[] }) => sum + (c.messages?.length || 0), 0);

        setStats({
          totalDocuments: docs.length,
          totalConversations: convs.length,
          totalMessages: totalMsgs,
          readyDocuments: ready,
          processingDocuments: processing,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Documents",
      value: stats.totalDocuments,
      icon: FileText,
      description: "PDFs uploaded",
      color: "text-blue-500",
    },
    {
      title: "Conversations",
      value: stats.totalConversations,
      icon: MessageSquare,
      description: "AI chat sessions",
      color: "text-green-500",
    },
    {
      title: "Messages",
      value: stats.totalMessages,
      icon: BarChart3,
      description: "Total messages sent",
      color: "text-purple-500",
    },
    {
      title: "Ready for Analysis",
      value: stats.readyDocuments,
      icon: Zap,
      description: "Documents indexed",
      color: "text-amber-500",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          Overview of your document processing and AI usage
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stat.value}
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Document Processing
                </CardTitle>
                <CardDescription>Status of document embeddings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Ready</span>
                    <span className="font-medium">{stats.readyDocuments}</span>
                  </div>
                  <Progress
                    value={
                      stats.totalDocuments > 0
                        ? (stats.readyDocuments / stats.totalDocuments) * 100
                        : 0
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing</span>
                    <span className="font-medium">{stats.processingDocuments}</span>
                  </div>
                  <Progress
                    value={
                      stats.totalDocuments > 0
                        ? (stats.processingDocuments / stats.totalDocuments) * 100
                        : 0
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  AI Model Info
                </CardTitle>
                <CardDescription>Current AI configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">LLM Provider</span>
                    <Badge>Groq</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Model</span>
                    <Badge variant="secondary">LLaMA 3.3 70B</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Vector DB</span>
                    <Badge variant="outline">Pinecone</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">File Storage</span>
                    <Badge variant="outline">EdgeStore</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Document FAQ</CardTitle>
              <CardDescription>Common questions about document processing</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What file types are supported?</AccordionTrigger>
                  <AccordionContent>
                    Currently, we support PDF files up to 10MB in size. The documents are automatically parsed, chunked, and embedded for AI analysis.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>How does document embedding work?</AccordionTrigger>
                  <AccordionContent>
                    When you upload a PDF, it&apos;s parsed into text, split into chunks, converted to vector embeddings, and stored in Pinecone. This allows the AI to search and reference specific parts of your documents.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>How accurate is the AI analysis?</AccordionTrigger>
                  <AccordionContent>
                    We use Groq&apos;s LLaMA 3.3 70B model which provides high-quality analysis. The AI retrieves relevant document chunks and uses them as context for accurate responses.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Is my data secure?</AccordionTrigger>
                  <AccordionContent>
                    Yes, all documents are stored securely in EdgeStore CDN, and your data is protected with authentication. Only you can access your documents and conversations.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Usage Summary</CardTitle>
              <CardDescription>Your activity on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <p className="text-3xl font-bold">{stats.totalDocuments}</p>
                    <p className="text-sm text-muted-foreground">Documents</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold">{stats.totalConversations}</p>
                    <p className="text-sm text-muted-foreground">Conversations</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold">{stats.totalMessages}</p>
                    <p className="text-sm text-muted-foreground">Messages</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
