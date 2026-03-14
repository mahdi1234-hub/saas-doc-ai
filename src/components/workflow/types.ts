export type WorkflowNodeType =
  | "trigger"
  | "ai"
  | "human"
  | "web_scraping"
  | "topic_analysis"
  | "benchmarking"
  | "brainstorming"
  | "output";

export interface WorkflowNodeData {
  label: string;
  type: WorkflowNodeType;
  description: string;
  config: Record<string, string>;
  useAI: boolean;
  status: "idle" | "running" | "completed" | "error";
  result?: string;
}

export interface NodeTemplate {
  type: WorkflowNodeType;
  label: string;
  description: string;
  icon: string;
  color: string;
  defaultConfig: Record<string, string>;
}

export const NODE_TEMPLATES: NodeTemplate[] = [
  {
    type: "trigger",
    label: "Trigger",
    description: "Start point of the workflow",
    icon: "Zap",
    color: "#a855f7",
    defaultConfig: { triggerType: "manual" },
  },
  {
    type: "ai",
    label: "AI Processing",
    description: "Process with Cerebras AI",
    icon: "Brain",
    color: "#6366f1",
    defaultConfig: { prompt: "", model: "llama-4-scout-17b-16e-instruct" },
  },
  {
    type: "human",
    label: "Human Review",
    description: "Manual human intervention step",
    icon: "User",
    color: "#10b981",
    defaultConfig: { instruction: "", requireApproval: "true" },
  },
  {
    type: "web_scraping",
    label: "Web Scraping",
    description: "Extract data from websites",
    icon: "Globe",
    color: "#f59e0b",
    defaultConfig: { url: "", selector: "", fields: "" },
  },
  {
    type: "topic_analysis",
    label: "Topic Analysis",
    description: "Analyze and understand topics",
    icon: "Search",
    color: "#06b6d4",
    defaultConfig: { topic: "", depth: "detailed" },
  },
  {
    type: "benchmarking",
    label: "Benchmarking",
    description: "Compare and benchmark data",
    icon: "BarChart3",
    color: "#ec4899",
    defaultConfig: { subjects: "", criteria: "" },
  },
  {
    type: "brainstorming",
    label: "Brainstorming",
    description: "Generate creative ideas",
    icon: "Lightbulb",
    color: "#f97316",
    defaultConfig: { topic: "", constraints: "", ideaCount: "10" },
  },
  {
    type: "output",
    label: "Output",
    description: "Final output and results",
    icon: "FileOutput",
    color: "#22c55e",
    defaultConfig: { format: "markdown" },
  },
];
