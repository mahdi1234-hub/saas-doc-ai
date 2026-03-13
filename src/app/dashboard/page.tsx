"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  FileText, MessageSquare, Upload, Plus, Clock, CheckCircle2,
  AlertCircle, Loader2, BarChart3, FileUp, Trash2,
} from "lucide-react";
import { DocumentUpload } from "@/components/documents/document-upload";

interface Document {
  id: string;
  name: string;
  url: string;
  size: number;
  pageCount: number;
  status: string;
  createdAt: string;
  _count: { chunks: number };
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count: { messages: number };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [docsRes, convsRes] = await Promise.all([
        fetch("/api/documents"),
        fetch("/api/conversations"),
      ]);
      const docsData = await docsRes.json();
      const convsData = await convsRes.json();
      setDocuments(docsData.documents || []);
      setConversations(convsData.conversations || []);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated") {
      fetchData();
    }
  }, [status, router, fetchData]);

  const handleNewChat = async () => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      });
      const data = await res.json();
      router.push(`/chat?id=${data.conversation.id}`);
    } catch {
      toast.error("Failed to create conversation");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" />Ready</Badge>;
      case "processing":
      case "embedding":
        return <Badge variant="secondary" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" />Processing</Badge>;
      case "error":
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Load chatbar widget
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
      import { embedWidget } from "https://cdn.jsdelivr.net/npm/agent-embed-widget/dist/agent-embed-widget.es.js";
      embedWidget({
        type: "chatbar",
        url: "https://console.thesys.dev/app/EZYdBSAhPTkAmUbtutDob",
        theme: "light",
        hideLogin: true,
        options: {
          theme: {
            containerFills: "#fcf8ff",
            strokeDefault: "rgba(0, 0, 0, 0.06)",
            roundedL: "12px",
            primaryText: "#07070e",
            interactiveAccent: "#1B1A27",
            accentPrimaryText: "rgba(255, 255, 255, 1)",
            roundedS: "8px",
          },
        },
      });
    `;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto p-6">
          <div className="grid gap-6">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {session?.user?.name || session?.user?.email}</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 cursor-pointer">
                <Upload className="h-4 w-4" />Upload PDF
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                  <DialogDescription>Upload a PDF document to analyze with AI</DialogDescription>
                </DialogHeader>
                <DocumentUpload onSuccess={() => { setUploadOpen(false); fetchData(); }} />
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="gap-2" onClick={handleNewChat}>
              <Plus className="h-4 w-4" />New Chat
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
              <p className="text-xs text-muted-foreground">{documents.filter(d => d.status === "ready").length} ready</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversations.length}</div>
              <p className="text-xs text-muted-foreground">AI chat sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.reduce((sum, d) => sum + d.pageCount, 0)}</div>
              <p className="text-xs text-muted-foreground">pages processed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Chunks</CardTitle>
              <FileUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.reduce((sum, d) => sum + d._count.chunks, 0)}</div>
              <p className="text-xs text-muted-foreground">vector embeddings</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Documents Table */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Documents</CardTitle>
              <CardDescription>Your uploaded PDF documents</CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents yet. Upload your first PDF!</p>
                </div>
              ) : (
                <ScrollArea className="h-80">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Pages</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">
                            <Tooltip>
                              <TooltipTrigger className="truncate max-w-48 block">{doc.name}</TooltipTrigger>
                              <TooltipContent>{doc.name}</TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell>{formatSize(doc.size)}</TableCell>
                          <TableCell>{doc.pageCount}</TableCell>
                          <TableCell>{getStatusBadge(doc.status)}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Recent Conversations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />Recent Chats</CardTitle>
              <CardDescription>Your AI conversations</CardDescription>
            </CardHeader>
            <CardContent>
              {conversations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No conversations yet.</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={handleNewChat}>Start a Chat</Button>
                </div>
              ) : (
                <ScrollArea className="h-80">
                  <div className="space-y-2">
                    {conversations.map((conv) => (
                      <Link key={conv.id} href={`/chat?id=${conv.id}`}>
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                          <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{conv.title}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(conv.updatedAt).toLocaleDateString()}
                              <span className="ml-1">{conv._count.messages} msgs</span>
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
