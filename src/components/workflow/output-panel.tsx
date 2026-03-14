"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X, CheckCircle2, AlertCircle, Clock, Copy, Download } from "lucide-react";
import { toast } from "sonner";

interface ExecutionLog {
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  status: "running" | "completed" | "error";
  result?: string;
  timestamp: Date;
  duration?: number;
}

interface OutputPanelProps {
  logs: ExecutionLog[];
  isRunning: boolean;
  onClose: () => void;
}

export function OutputPanel({ logs, isRunning, onClose }: OutputPanelProps) {
  const copyAllResults = () => {
    const text = logs
      .filter((l) => l.result)
      .map((l) => `## ${l.nodeLabel}\n${l.result}`)
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
    toast.success("Results copied to clipboard");
  };

  const downloadResults = () => {
    const text = logs
      .filter((l) => l.result)
      .map((l) => `## ${l.nodeLabel}\n${l.result}`)
      .join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-output-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-96 border-l border-border bg-background/95 backdrop-blur-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold">Execution Output</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {isRunning ? "Workflow running..." : `${logs.length} steps executed`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyAllResults} title="Copy all">
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={downloadResults} title="Download">
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {logs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Run the workflow to see output</p>
            </div>
          )}
          {logs.map((log, index) => (
            <div key={`${log.nodeId}-${index}`} className="rounded-lg border border-border/50 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-muted/30">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    #{index + 1}
                  </span>
                  <span className="text-xs font-medium">{log.nodeLabel}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {log.duration !== undefined && (
                    <span className="text-[10px] text-muted-foreground">
                      {(log.duration / 1000).toFixed(1)}s
                    </span>
                  )}
                  {log.status === "completed" ? (
                    <Badge variant="default" className="text-[9px] h-4 px-1.5 gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />Done
                    </Badge>
                  ) : log.status === "error" ? (
                    <Badge variant="destructive" className="text-[9px] h-4 px-1.5 gap-0.5">
                      <AlertCircle className="w-2.5 h-2.5" />Error
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[9px] h-4 px-1.5 animate-pulse">
                      Running...
                    </Badge>
                  )}
                </div>
              </div>
              {log.result && (
                <>
                  <Separator />
                  <div className="px-3 py-2 max-h-48 overflow-y-auto">
                    <p className="text-[11px] text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {log.result}
                    </p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export type { ExecutionLog };
