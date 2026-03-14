"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  Zap, Brain, User, Globe, Search, BarChart3, Lightbulb, FileOutput,
  Loader2, CheckCircle2, AlertCircle, Sparkles, HandMetal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { WorkflowNodeData } from "../types";

const ICON_MAP: Record<string, React.ElementType> = {
  Zap, Brain, User, Globe, Search, BarChart3, Lightbulb, FileOutput,
};

const STATUS_CONFIG = {
  idle: { icon: null, label: "", className: "" },
  running: { icon: Loader2, label: "Running", className: "animate-spin text-blue-400" },
  completed: { icon: CheckCircle2, label: "Done", className: "text-green-400" },
  error: { icon: AlertCircle, label: "Error", className: "text-red-400" },
};

interface BaseNodeComponentProps {
  data: WorkflowNodeData;
  selected?: boolean;
  iconName: string;
  color: string;
}

function BaseNodeComponent({ data, iconName, color, selected }: BaseNodeComponentProps) {
  const Icon = ICON_MAP[iconName] || Zap;
  const statusConfig = STATUS_CONFIG[data.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={`
        relative rounded-xl border bg-card/90 backdrop-blur-sm shadow-lg
        min-w-[220px] max-w-[260px] transition-all duration-200
        ${selected ? "ring-2 ring-primary shadow-xl scale-[1.02]" : "hover:shadow-xl"}
      `}
      style={{ borderColor: selected ? color : `${color}40` }}
    >
      {data.type !== "trigger" && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !border-2 !border-background !bg-muted-foreground"
        />
      )}

      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-t-xl"
        style={{ background: `linear-gradient(135deg, ${color}15, ${color}08)` }}
      >
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
          style={{ background: `${color}20` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{data.label}</p>
          <p className="text-[10px] text-muted-foreground truncate">{data.description}</p>
        </div>
        {StatusIcon && (
          <StatusIcon className={`w-4 h-4 shrink-0 ${statusConfig.className}`} />
        )}
      </div>

      {/* AI/Human Toggle Badge */}
      {data.type !== "trigger" && data.type !== "output" && (
        <div className="px-3.5 pt-2 pb-1">
          <Badge
            variant={data.useAI ? "default" : "secondary"}
            className="text-[10px] gap-1 cursor-default"
          >
            {data.useAI ? (
              <><Sparkles className="w-3 h-3" />AI Powered</>
            ) : (
              <><HandMetal className="w-3 h-3" />Manual</>
            )}
          </Badge>
        </div>
      )}

      {/* Config Preview */}
      {data.config && Object.keys(data.config).length > 0 && (
        <div className="px-3.5 py-2">
          {Object.entries(data.config).slice(0, 2).map(([key, value]) =>
            value ? (
              <p key={key} className="text-[10px] text-muted-foreground truncate">
                <span className="text-muted-foreground/60">{key}:</span>{" "}
                {value.substring(0, 40)}
              </p>
            ) : null
          )}
        </div>
      )}

      {/* Result Preview */}
      {data.result && (
        <div className="px-3.5 pb-2.5">
          <div className="bg-muted/50 rounded-md px-2 py-1.5 max-h-16 overflow-hidden">
            <p className="text-[10px] text-muted-foreground leading-tight line-clamp-3">
              {data.result}
            </p>
          </div>
        </div>
      )}

      {data.type !== "output" && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !border-2 !border-background !bg-muted-foreground"
        />
      )}
    </div>
  );
}

function toWorkflowData(data: Record<string, unknown>): WorkflowNodeData {
  return data as unknown as WorkflowNodeData;
}

export const TriggerNode = memo(({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) => (
  <BaseNodeComponent data={toWorkflowData(data)} selected={selected} iconName="Zap" color="#a855f7" />
));
TriggerNode.displayName = "TriggerNode";

export const AINode = memo(({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) => (
  <BaseNodeComponent data={toWorkflowData(data)} selected={selected} iconName="Brain" color="#6366f1" />
));
AINode.displayName = "AINode";

export const HumanNode = memo(({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) => (
  <BaseNodeComponent data={toWorkflowData(data)} selected={selected} iconName="User" color="#10b981" />
));
HumanNode.displayName = "HumanNode";

export const WebScrapingNode = memo(({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) => (
  <BaseNodeComponent data={toWorkflowData(data)} selected={selected} iconName="Globe" color="#f59e0b" />
));
WebScrapingNode.displayName = "WebScrapingNode";

export const TopicAnalysisNode = memo(({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) => (
  <BaseNodeComponent data={toWorkflowData(data)} selected={selected} iconName="Search" color="#06b6d4" />
));
TopicAnalysisNode.displayName = "TopicAnalysisNode";

export const BenchmarkingNode = memo(({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) => (
  <BaseNodeComponent data={toWorkflowData(data)} selected={selected} iconName="BarChart3" color="#ec4899" />
));
BenchmarkingNode.displayName = "BenchmarkingNode";

export const BrainstormingNode = memo(({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) => (
  <BaseNodeComponent data={toWorkflowData(data)} selected={selected} iconName="Lightbulb" color="#f97316" />
));
BrainstormingNode.displayName = "BrainstormingNode";

export const OutputNode = memo(({ data, selected }: { data: Record<string, unknown>; selected?: boolean }) => (
  <BaseNodeComponent data={toWorkflowData(data)} selected={selected} iconName="FileOutput" color="#22c55e" />
));
OutputNode.displayName = "OutputNode";
