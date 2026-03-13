"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Send, Plus, FileText, MessageSquare, Bot, User, Loader2,
  Upload, Clock, ChevronDown, Paperclip, Sparkles,
} from "lucide-react";
import { DocumentUpload } from "@/components/documents/document-upload";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  document?: { name: string } | null;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  _count: { messages: number };
}

function ChatContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("id");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch {
      // ignore
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const res = await fetch(`/api/chat?conversationId=${conversationId}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      toast.error("Failed to load messages");
    }
  }, [conversationId]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated") {
      fetchConversations().finally(() => setLoading(false));
    }
  }, [status, router, fetchConversations]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewChat = async () => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      });
      const data = await res.json();
      router.push(`/chat?id=${data.conversation.id}`);
      fetchConversations();
    } catch {
      toast.error("Failed to create conversation");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    let activeConvId = conversationId;

    if (!activeConvId) {
      try {
        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "New Chat" }),
        });
        const data = await res.json();
        activeConvId = data.conversation.id;
        router.push(`/chat?id=${activeConvId}`);
      } catch {
        toast.error("Failed to create conversation");
        return;
      }
    }

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: input,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          conversationId: activeConvId,
        }),
      });

      if (!res.ok) throw new Error("Chat failed");

      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      fetchConversations();
    } catch {
      toast.error("Failed to get response");
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex"><Skeleton className="flex-1 m-4" /></main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="flex">
          {sidebarOpen && (
            <div className="w-72 border-r border-border bg-muted/30 flex flex-col">
              <div className="p-4">
                <Button className="w-full gap-2" onClick={handleNewChat}>
                  <Plus className="h-4 w-4" />
                  New Chat
                </Button>
              </div>
              <Separator />
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => router.push(`/chat?id=${conv.id}`)}
                      className={`w-full text-left p-3 rounded-lg text-sm transition-colors hover:bg-muted ${
                        conv.id === conversationId ? "bg-muted border border-border" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate font-medium">{conv.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          <Button variant="ghost" size="sm" className="h-full rounded-none w-6 border-r" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <ChevronDown className={`h-4 w-4 transition-transform ${sidebarOpen ? "rotate-90" : "-rotate-90"}`} />
          </Button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="max-w-3xl mx-auto space-y-6">
              {!conversationId && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">DocAI Chat</h2>
                  <p className="text-muted-foreground max-w-md mb-6">
                    Upload documents and ask questions. I can analyze PDFs, extract insights, and help you understand complex documents.
                  </p>
                  <div className="flex gap-3">
                    <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                      <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 cursor-pointer">
                        <Upload className="h-4 w-4" />Upload PDF
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Upload Document</DialogTitle>
                          <DialogDescription>Upload a PDF to analyze with AI</DialogDescription>
                        </DialogHeader>
                        <DocumentUpload onSuccess={() => { setUploadOpen(false); toast.success("Document uploaded!"); }} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role !== "user" && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-2xl rounded-lg p-4 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}>
                    {msg.document && (
                      <Badge variant="outline" className="mb-2 text-xs gap-1">
                        <FileText className="h-3 w-3" />{msg.document.name}
                      </Badge>
                    )}
                    <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    <p className="text-xs opacity-60 mt-2">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  {msg.role === "user" && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-secondary text-xs">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {sending && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking...
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border p-4">
            <div className="max-w-3xl mx-auto flex gap-2 items-end">
              <Tooltip>
                <TooltipTrigger>
                  <Button variant="outline" size="icon" className="shrink-0" onClick={() => setUploadOpen(true)}>
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Upload PDF</TooltipContent>
              </Tooltip>
              <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>Upload a PDF to analyze</DialogDescription>
                  </DialogHeader>
                  <DocumentUpload onSuccess={() => { setUploadOpen(false); toast.success("Document uploaded!"); }} />
                </DialogContent>
              </Dialog>
              <Textarea
                placeholder="Ask about your documents..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-10 max-h-32 resize-none"
                rows={1}
                disabled={sending}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                size="icon"
                className="shrink-0"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <ChatContent />
    </Suspense>
  );
}
