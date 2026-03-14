"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Send,
  Loader2,
  X,
  Sparkles,
  Bot,
  User,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import type { Node, Edge } from "@xyflow/react";
import type { WorkflowNodeData, WorkflowNodeType } from "./types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  workflow?: WorkflowDefinition | null;
}

interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  description: string;
  position: { x: number; y: number };
  config: Record<string, string>;
  useAI: boolean;
}

interface WorkflowDefinition {
  nodes: WorkflowNode[];
  edges: { source: string; target: string }[];
}

interface WorkflowChatPanelProps {
  onApplyWorkflow: (nodes: Node[], edges: Edge[]) => void;
  onClose: () => void;
}

export function WorkflowChatPanel({
  onApplyWorkflow,
  onClose,
}: WorkflowChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I can help you create workflows automatically. Describe what you need and I'll build it on the canvas for you.\n\nFor example:\n- \"Create a workflow that analyzes a website and generates a report\"\n- \"Build a brainstorming workflow for marketing ideas\"\n- \"Make a topic analysis pipeline with benchmarking\"",
      workflow: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const apiMessages = [...messages, userMessage]
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/workflow/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.message || "Here's your workflow!",
        workflow: data.workflow || null,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.workflow) {
        toast.success("Workflow generated! Click 'Apply to Canvas' to use it.");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          workflow: null,
        },
      ]);
      toast.error("Failed to process your request");
    } finally {
      setIsLoading(false);
    }
  };

  const applyWorkflow = (workflow: WorkflowDefinition) => {
    const nodes: Node[] = workflow.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: {
        label: n.label,
        type: n.type,
        description: n.description,
        config: n.config,
        useAI: n.useAI,
        status: "idle",
      } satisfies WorkflowNodeData,
    }));

    const edges: Edge[] = workflow.edges.map((e, i) => ({
      id: `edge-${e.source}-${e.target}-${i}`,
      source: e.source,
      target: e.target,
      animated: true,
      style: { stroke: "#6366f1", strokeWidth: 2 },
    }));

    onApplyWorkflow(nodes, edges);
    toast.success("Workflow applied to canvas!");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-96 border-l border-border bg-background/95 backdrop-blur-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">AI Workflow Builder</h3>
            <p className="text-[10px] text-muted-foreground">
              Describe your workflow in natural language
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="p-3 space-y-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 border border-border/50"
                }`}
              >
                <p className="text-xs whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>

                {msg.workflow && (
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Wand2 className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-semibold">
                        Workflow Generated
                      </span>
                    </div>
                    <div className="space-y-1 mb-2">
                      {msg.workflow.nodes.map((n) => (
                        <div
                          key={n.id}
                          className="flex items-center gap-1.5 text-[10px]"
                        >
                          <Badge
                            variant="secondary"
                            className="text-[9px] h-4 px-1"
                          >
                            {n.type}
                          </Badge>
                          <span className="truncate">{n.label}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      className="w-full h-7 text-[11px] gap-1.5"
                      onClick={() => applyWorkflow(msg.workflow!)}
                    >
                      <Wand2 className="w-3 h-3" />
                      Apply to Canvas
                    </Button>
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="bg-muted/50 border border-border/50 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Building your workflow...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the workflow you want..."
            className="flex-1 resize-none rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary min-h-[36px] max-h-[100px]"
            rows={1}
            disabled={isLoading}
          />
          <Button
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-[9px] text-muted-foreground mt-1.5 text-center">
          Powered by Cerebras AI - Press Enter to send
        </p>
      </div>
    </div>
  );
}
