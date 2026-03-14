"use client";

import { useCallback } from "react";
import type { Node } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  X, Sparkles, HandMetal, Trash2,
  Zap, Brain, User, Globe, Search, BarChart3, Lightbulb, FileOutput,
} from "lucide-react";
import type { WorkflowNodeData } from "./types";

const ICON_MAP: Record<string, React.ElementType> = {
  Zap, Brain, User, Globe, Search, BarChart3, Lightbulb, FileOutput,
};

const NODE_COLORS: Record<string, string> = {
  trigger: "#a855f7",
  ai: "#6366f1",
  human: "#10b981",
  web_scraping: "#f59e0b",
  topic_analysis: "#06b6d4",
  benchmarking: "#ec4899",
  brainstorming: "#f97316",
  output: "#22c55e",
};

const NODE_ICONS: Record<string, string> = {
  trigger: "Zap",
  ai: "Brain",
  human: "User",
  web_scraping: "Globe",
  topic_analysis: "Search",
  benchmarking: "BarChart3",
  brainstorming: "Lightbulb",
  output: "FileOutput",
};

interface NodeConfigPanelProps {
  node: Node;
  onUpdate: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  onClose: () => void;
  onDelete: (nodeId: string) => void;
}

export function NodeConfigPanel({ node, onUpdate, onClose, onDelete }: NodeConfigPanelProps) {
  const data = node.data as unknown as WorkflowNodeData;
  const color = NODE_COLORS[data.type] || "#6366f1";
  const iconName = NODE_ICONS[data.type] || "Zap";
  const Icon = ICON_MAP[iconName] || Zap;

  const updateConfig = useCallback(
    (key: string, value: string) => {
      onUpdate(node.id, {
        config: { ...data.config, [key]: value },
      });
    },
    [node.id, data.config, onUpdate]
  );

  const renderConfigFields = () => {
    switch (data.type) {
      case "trigger":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Trigger Type</Label>
              <Input
                value={data.config.triggerType || "manual"}
                onChange={(e) => updateConfig("triggerType", e.target.value)}
                placeholder="manual, scheduled, webhook..."
                className="mt-1 text-xs h-8"
              />
            </div>
          </div>
        );
      case "ai":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Prompt</Label>
              <Textarea
                value={data.config.prompt || ""}
                onChange={(e) => updateConfig("prompt", e.target.value)}
                placeholder="Enter AI prompt..."
                className="mt-1 text-xs min-h-[80px]"
              />
            </div>
            <div>
              <Label className="text-xs">Model</Label>
              <Input
                value={data.config.model || "llama-4-scout-17b-16e-instruct"}
                onChange={(e) => updateConfig("model", e.target.value)}
                className="mt-1 text-xs h-8"
              />
            </div>
          </div>
        );
      case "human":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Instructions</Label>
              <Textarea
                value={data.config.instruction || ""}
                onChange={(e) => updateConfig("instruction", e.target.value)}
                placeholder="What should the reviewer do..."
                className="mt-1 text-xs min-h-[80px]"
              />
            </div>
          </div>
        );
      case "web_scraping":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">URL</Label>
              <Input
                value={data.config.url || ""}
                onChange={(e) => updateConfig("url", e.target.value)}
                placeholder="https://example.com"
                className="mt-1 text-xs h-8"
              />
            </div>
            <div>
              <Label className="text-xs">CSS Selector (optional)</Label>
              <Input
                value={data.config.selector || ""}
                onChange={(e) => updateConfig("selector", e.target.value)}
                placeholder=".article-content, #main..."
                className="mt-1 text-xs h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Fields to Extract</Label>
              <Textarea
                value={data.config.fields || ""}
                onChange={(e) => updateConfig("fields", e.target.value)}
                placeholder="title, description, price..."
                className="mt-1 text-xs min-h-[60px]"
              />
            </div>
          </div>
        );
      case "topic_analysis":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Topic / Content</Label>
              <Textarea
                value={data.config.topic || ""}
                onChange={(e) => updateConfig("topic", e.target.value)}
                placeholder="Enter topic or content to analyze..."
                className="mt-1 text-xs min-h-[80px]"
              />
            </div>
            <div>
              <Label className="text-xs">Analysis Depth</Label>
              <Input
                value={data.config.depth || "detailed"}
                onChange={(e) => updateConfig("depth", e.target.value)}
                placeholder="brief, detailed, comprehensive"
                className="mt-1 text-xs h-8"
              />
            </div>
          </div>
        );
      case "benchmarking":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Subjects to Compare</Label>
              <Textarea
                value={data.config.subjects || ""}
                onChange={(e) => updateConfig("subjects", e.target.value)}
                placeholder="Enter items to benchmark..."
                className="mt-1 text-xs min-h-[60px]"
              />
            </div>
            <div>
              <Label className="text-xs">Criteria</Label>
              <Textarea
                value={data.config.criteria || ""}
                onChange={(e) => updateConfig("criteria", e.target.value)}
                placeholder="Performance, cost, features..."
                className="mt-1 text-xs min-h-[60px]"
              />
            </div>
          </div>
        );
      case "brainstorming":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Topic</Label>
              <Textarea
                value={data.config.topic || ""}
                onChange={(e) => updateConfig("topic", e.target.value)}
                placeholder="What do you want to brainstorm about?"
                className="mt-1 text-xs min-h-[80px]"
              />
            </div>
            <div>
              <Label className="text-xs">Constraints (optional)</Label>
              <Input
                value={data.config.constraints || ""}
                onChange={(e) => updateConfig("constraints", e.target.value)}
                placeholder="Budget, timeline, tech stack..."
                className="mt-1 text-xs h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Number of Ideas</Label>
              <Input
                value={data.config.ideaCount || "10"}
                onChange={(e) => updateConfig("ideaCount", e.target.value)}
                className="mt-1 text-xs h-8"
                type="number"
              />
            </div>
          </div>
        );
      case "output":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Output Format</Label>
              <Input
                value={data.config.format || "markdown"}
                onChange={(e) => updateConfig("format", e.target.value)}
                placeholder="markdown, json, text..."
                className="mt-1 text-xs h-8"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-80 border-l border-border bg-background/95 backdrop-blur-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-lg"
            style={{ background: `${color}20` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color }} />
          </div>
          <div>
            <p className="text-sm font-semibold">{data.label}</p>
            <p className="text-[10px] text-muted-foreground">{data.type}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Label */}
          <div>
            <Label className="text-xs">Node Label</Label>
            <Input
              value={data.label}
              onChange={(e) => onUpdate(node.id, { label: e.target.value })}
              className="mt-1 text-xs h-8"
            />
          </div>

          {/* AI / Human Toggle */}
          {data.type !== "trigger" && data.type !== "output" && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {data.useAI ? (
                    <Sparkles className="w-4 h-4 text-primary" />
                  ) : (
                    <HandMetal className="w-4 h-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-xs font-medium">
                      {data.useAI ? "AI Powered" : "Manual Mode"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {data.useAI ? "Cerebras AI processes this step" : "You handle this step"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={data.useAI}
                  onCheckedChange={(checked) => onUpdate(node.id, { useAI: checked })}
                />
              </div>
              <Separator />
            </>
          )}

          {/* Config Fields */}
          {renderConfigFields()}

          {/* Result */}
          {data.result && (
            <>
              <Separator />
              <div>
                <Label className="text-xs">Result</Label>
                <div className="mt-1 bg-muted/50 rounded-lg p-3 max-h-48 overflow-y-auto">
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {data.result}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Status */}
          <Separator />
          <div className="flex items-center justify-between">
            <Label className="text-xs">Status</Label>
            <Badge
              variant={
                data.status === "completed"
                  ? "default"
                  : data.status === "error"
                  ? "destructive"
                  : "secondary"
              }
              className="text-[10px]"
            >
              {data.status}
            </Badge>
          </div>

          {/* Delete */}
          {data.type !== "trigger" && (
            <>
              <Separator />
              <Button
                variant="destructive"
                size="sm"
                className="w-full text-xs gap-1.5"
                onClick={() => onDelete(node.id)}
              >
                <Trash2 className="w-3 h-3" />
                Delete Node
              </Button>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
