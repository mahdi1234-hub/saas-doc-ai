"use client";

import {
  Zap, Brain, User, Globe, Search, BarChart3, Lightbulb, FileOutput,
} from "lucide-react";
import { NODE_TEMPLATES, type NodeTemplate } from "./types";

const ICON_MAP: Record<string, React.ElementType> = {
  Zap, Brain, User, Globe, Search, BarChart3, Lightbulb, FileOutput,
};

function SidebarNode({ template }: { template: NodeTemplate }) {
  const Icon = ICON_MAP[template.icon] || Zap;

  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify(template));
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/50 bg-card/60 cursor-grab active:cursor-grabbing hover:border-border hover:bg-card transition-all duration-150 select-none"
      draggable
      onDragStart={onDragStart}
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
        style={{ background: `${template.color}20` }}
      >
        <Icon className="w-4 h-4" style={{ color: template.color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-foreground">{template.label}</p>
        <p className="text-[10px] text-muted-foreground truncate">{template.description}</p>
      </div>
    </div>
  );
}

export function WorkflowSidebar() {
  return (
    <div className="w-64 border-r border-border bg-background/95 backdrop-blur-sm flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Node Palette</h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Drag nodes onto the canvas
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1 mb-1">
          Flow Control
        </p>
        {NODE_TEMPLATES.filter((t) => t.type === "trigger" || t.type === "output").map(
          (template) => (
            <SidebarNode key={template.type} template={template} />
          )
        )}

        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1 mt-4 mb-1">
          Processing
        </p>
        {NODE_TEMPLATES.filter(
          (t) => t.type !== "trigger" && t.type !== "output"
        ).map((template) => (
          <SidebarNode key={template.type} template={template} />
        ))}
      </div>
    </div>
  );
}
