"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  Download,
  FileText,
  FileType,
  File,
} from "lucide-react";
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

function getResultsMarkdown(logs: ExecutionLog[]): string {
  return logs
    .filter((l) => l.result)
    .map((l) => `## ${l.nodeLabel}\n${l.result}`)
    .join("\n\n---\n\n");
}

function getResultsPlainText(logs: ExecutionLog[]): string {
  return logs
    .filter((l) => l.result)
    .map((l) => `${l.nodeLabel}\n${"=".repeat(l.nodeLabel.length)}\n${l.result}`)
    .join("\n\n" + "-".repeat(40) + "\n\n");
}

export function OutputPanel({ logs, isRunning, onClose }: OutputPanelProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const copyAllResults = () => {
    const text = getResultsMarkdown(logs);
    navigator.clipboard.writeText(text);
    toast.success("Results copied to clipboard");
  };

  const downloadAsText = () => {
    const text = getResultsPlainText(logs);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-output-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded as Text file");
    setShowExportMenu(false);
  };

  const downloadAsMarkdown = () => {
    const text = getResultsMarkdown(logs);
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-output-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded as Markdown file");
    setShowExportMenu(false);
  };

  const downloadAsPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      let y = 20;

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Workflow Execution Output", margin, y);
      y += 10;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated on ${new Date().toLocaleString()}`, margin, y);
      y += 12;

      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      const completedLogs = logs.filter((l) => l.result);

      for (const log of completedLogs) {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50, 50, 50);
        doc.text(log.nodeLabel, margin, y);
        y += 6;

        if (log.duration !== undefined) {
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(128, 128, 128);
          doc.text(
            `Duration: ${(log.duration / 1000).toFixed(1)}s | Status: ${log.status}`,
            margin,
            y
          );
          y += 6;
        }

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);

        const resultLines = doc.splitTextToSize(log.result || "", maxWidth);
        for (const line of resultLines) {
          if (y > 275) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, margin, y);
          y += 5;
        }

        y += 6;
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
      }

      doc.save(`workflow-output-${Date.now()}.pdf`);
      toast.success("Downloaded as PDF");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
    setShowExportMenu(false);
  };

  const downloadAsWord = async () => {
    try {
      const docx = await import("docx");
      const { saveAs } = await import("file-saver");

      const children: (
        | InstanceType<typeof docx.Paragraph>
        | InstanceType<typeof docx.Table>
      )[] = [];

      children.push(
        new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: "Workflow Execution Output",
              bold: true,
              size: 36,
              font: "Calibri",
            }),
          ],
          spacing: { after: 200 },
        })
      );

      children.push(
        new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: `Generated on ${new Date().toLocaleString()}`,
              size: 18,
              color: "888888",
              font: "Calibri",
            }),
          ],
          spacing: { after: 300 },
        })
      );

      const completedLogs = logs.filter((l) => l.result);

      for (const log of completedLogs) {
        children.push(
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: log.nodeLabel,
                bold: true,
                size: 28,
                font: "Calibri",
              }),
            ],
            spacing: { before: 300, after: 100 },
            border: {
              bottom: {
                style: docx.BorderStyle.SINGLE,
                size: 1,
                color: "CCCCCC",
              },
            },
          })
        );

        if (log.duration !== undefined) {
          children.push(
            new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: `Duration: ${(log.duration / 1000).toFixed(1)}s | Status: ${log.status}`,
                  size: 16,
                  color: "888888",
                  italics: true,
                  font: "Calibri",
                }),
              ],
              spacing: { after: 100 },
            })
          );
        }

        const resultParagraphs = (log.result || "").split("\n");
        for (const para of resultParagraphs) {
          children.push(
            new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: para,
                  size: 22,
                  font: "Calibri",
                }),
              ],
              spacing: { after: 80 },
            })
          );
        }
      }

      const wordDoc = new docx.Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1440,
                  right: 1440,
                  bottom: 1440,
                  left: 1440,
                },
              },
            },
            children,
          },
        ],
      });

      const blob = await docx.Packer.toBlob(wordDoc);
      saveAs(blob, `workflow-output-${Date.now()}.docx`);
      toast.success("Downloaded as Word document");
    } catch (error) {
      console.error("Word generation error:", error);
      toast.error("Failed to generate Word document");
    }
    setShowExportMenu(false);
  };

  return (
    <div className="w-96 border-l border-border bg-background/95 backdrop-blur-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold">Execution Output</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {isRunning
              ? "Workflow running..."
              : `${logs.length} steps executed`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={copyAllResults}
            title="Copy all"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>

          {/* Export Dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowExportMenu(!showExportMenu)}
              title="Export as..."
            >
              <Download className="h-3.5 w-3.5" />
            </Button>

            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 top-8 z-50 w-48 rounded-lg border border-border bg-card shadow-xl py-1">
                  <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Export Format
                  </p>
                  <button
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs hover:bg-muted/50 transition-colors text-left"
                    onClick={downloadAsPDF}
                  >
                    <FileText className="h-3.5 w-3.5 text-red-500" />
                    <span>PDF Document</span>
                    <Badge
                      variant="secondary"
                      className="ml-auto text-[9px] h-4 px-1"
                    >
                      .pdf
                    </Badge>
                  </button>
                  <button
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs hover:bg-muted/50 transition-colors text-left"
                    onClick={downloadAsWord}
                  >
                    <FileType className="h-3.5 w-3.5 text-blue-500" />
                    <span>Word Document</span>
                    <Badge
                      variant="secondary"
                      className="ml-auto text-[9px] h-4 px-1"
                    >
                      .docx
                    </Badge>
                  </button>
                  <button
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs hover:bg-muted/50 transition-colors text-left"
                    onClick={downloadAsText}
                  >
                    <File className="h-3.5 w-3.5 text-gray-500" />
                    <span>Text File</span>
                    <Badge
                      variant="secondary"
                      className="ml-auto text-[9px] h-4 px-1"
                    >
                      .txt
                    </Badge>
                  </button>
                  <Separator className="my-1" />
                  <button
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs hover:bg-muted/50 transition-colors text-left"
                    onClick={downloadAsMarkdown}
                  >
                    <FileText className="h-3.5 w-3.5 text-purple-500" />
                    <span>Markdown</span>
                    <Badge
                      variant="secondary"
                      className="ml-auto text-[9px] h-4 px-1"
                    >
                      .md
                    </Badge>
                  </button>
                </div>
              </>
            )}
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
            <div
              key={`${log.nodeId}-${index}`}
              className="rounded-lg border border-border/50 overflow-hidden"
            >
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
                    <Badge
                      variant="default"
                      className="text-[9px] h-4 px-1.5 gap-0.5"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Done
                    </Badge>
                  ) : log.status === "error" ? (
                    <Badge
                      variant="destructive"
                      className="text-[9px] h-4 px-1.5 gap-0.5"
                    >
                      <AlertCircle className="w-2.5 h-2.5" />
                      Error
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="text-[9px] h-4 px-1.5 animate-pulse"
                    >
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
