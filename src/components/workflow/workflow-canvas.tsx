"use client";

import { useCallback, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Play, Square, Trash2, Save, RotateCcw, Loader2, Workflow, MessageSquare } from "lucide-react";
import {
  TriggerNode,
  AINode,
  HumanNode,
  WebScrapingNode,
  TopicAnalysisNode,
  BenchmarkingNode,
  BrainstormingNode,
  OutputNode,
} from "./nodes/base-node";
import { WorkflowSidebar } from "./workflow-sidebar";
import { NodeConfigPanel } from "./node-config-panel";
import { OutputPanel, type ExecutionLog } from "./output-panel";
import { WorkflowChatPanel } from "./workflow-chat-panel";
import type { WorkflowNodeData, NodeTemplate } from "./types";

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  ai: AINode,
  human: HumanNode,
  web_scraping: WebScrapingNode,
  topic_analysis: TopicAnalysisNode,
  benchmarking: BenchmarkingNode,
  brainstorming: BrainstormingNode,
  output: OutputNode,
};

const defaultEdgeOptions = {
  animated: true,
  style: { stroke: "#6366f1", strokeWidth: 2 },
};

const initialNodes: Node[] = [
  {
    id: "trigger-1",
    type: "trigger",
    position: { x: 400, y: 50 },
    data: {
      label: "Start",
      type: "trigger",
      description: "Workflow trigger",
      config: { triggerType: "manual" },
      useAI: false,
      status: "idle",
    } satisfies WorkflowNodeData,
  },
];

export function WorkflowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showOutput, setShowOutput] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const abortRef = useRef(false);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: "#6366f1", strokeWidth: 2 } }, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      setShowOutput(false);
      setShowChat(false);
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const templateStr = event.dataTransfer.getData("application/reactflow");
      if (!templateStr) return;

      const template: NodeTemplate = JSON.parse(templateStr);
      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;

      const position = {
        x: event.clientX - bounds.left - 110,
        y: event.clientY - bounds.top - 30,
      };

      const newNode: Node = {
        id: `${template.type}-${Date.now()}`,
        type: template.type,
        position,
        data: {
          label: template.label,
          type: template.type,
          description: template.description,
          config: { ...template.defaultConfig },
          useAI: template.type !== "trigger" && template.type !== "output" && template.type !== "human",
          status: "idle",
        } satisfies WorkflowNodeData,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const updateNodeData = useCallback(
    (nodeId: string, newData: Partial<WorkflowNodeData>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, ...newData } }
            : n
        )
      );
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode((prev) =>
          prev ? { ...prev, data: { ...prev.data, ...newData } } : null
        );
      }
    },
    [setNodes, selectedNode]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
      );
      setSelectedNode(null);
    },
    [setNodes, setEdges]
  );

  const getExecutionOrder = useCallback((): Node[] => {
    const triggerNode = nodes.find(
      (n) => (n.data as unknown as WorkflowNodeData).type === "trigger"
    );
    if (!triggerNode) return [];

    const order: Node[] = [];
    const visited = new Set<string>();

    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        order.push(node);
        const outgoing = edges.filter((e) => e.source === nodeId);
        for (const edge of outgoing) {
          traverse(edge.target);
        }
      }
    };

    traverse(triggerNode.id);
    return order;
  }, [nodes, edges]);

  const buildPromptForNode = (data: WorkflowNodeData, context: string): string => {
    switch (data.type) {
      case "ai":
        return data.config.prompt || "Process the following context and provide insights.";
      case "web_scraping":
        return `Analyze this web scraping task:\nURL: ${data.config.url || "not specified"}\nSelector: ${data.config.selector || "auto-detect"}\nFields to extract: ${data.config.fields || "all relevant data"}\n\nProvide a detailed scraping strategy and expected output structure.`;
      case "topic_analysis":
        return `Analyze the following topic in ${data.config.depth || "detailed"} depth:\n${data.config.topic || "Analyze the context provided."}`;
      case "benchmarking":
        return `Benchmark and compare the following:\nSubjects: ${data.config.subjects || "from context"}\nCriteria: ${data.config.criteria || "overall quality and performance"}`;
      case "brainstorming":
        return `Brainstorm ${data.config.ideaCount || "10"} ideas about:\n${data.config.topic || "the given context"}\nConstraints: ${data.config.constraints || "none"}`;
      case "output":
        return `Format the following results as ${data.config.format || "markdown"}:\n${context}`;
      default:
        return data.config.prompt || "Process this step.";
    }
  };

  const executeWorkflow = useCallback(async () => {
    const order = getExecutionOrder();
    if (order.length === 0) {
      toast.error("No workflow to execute. Add a Trigger node and connect nodes.");
      return;
    }

    setIsRunning(true);
    setShowOutput(true);
    setSelectedNode(null);
    setExecutionLogs([]);
    abortRef.current = false;

    let accumulatedContext = "";

    for (const node of order) {
      if (abortRef.current) break;

      const data = node.data as unknown as WorkflowNodeData;

      updateNodeData(node.id, { status: "running", result: undefined });

      const logEntry: ExecutionLog = {
        nodeId: node.id,
        nodeLabel: data.label,
        nodeType: data.type,
        status: "running",
        timestamp: new Date(),
      };
      setExecutionLogs((prev) => [...prev, logEntry]);

      const startTime = Date.now();

      try {
        let result = "";

        if (data.type === "trigger") {
          result = "Workflow started.";
        } else if (data.type === "human" || !data.useAI) {
          result = data.config.instruction
            ? `[Manual Step] ${data.config.instruction}\n\nContext available:\n${accumulatedContext.substring(0, 500)}`
            : `[Manual Step] Review the current context and proceed.\n\nContext:\n${accumulatedContext.substring(0, 500)}`;
        } else {
          const prompt = buildPromptForNode(data, accumulatedContext);

          const response = await fetch("/api/workflow/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nodeType: data.type,
              prompt,
              context: accumulatedContext,
              model: data.config.model,
            }),
          });

          if (!response.ok) {
            throw new Error("AI processing failed");
          }

          const aiResult = await response.json();
          result = aiResult.result || "No result returned.";
        }

        const duration = Date.now() - startTime;
        accumulatedContext += `\n\n--- ${data.label} ---\n${result}`;

        updateNodeData(node.id, { status: "completed", result });

        setExecutionLogs((prev) =>
          prev.map((l) =>
            l.nodeId === node.id && l.status === "running"
              ? { ...l, status: "completed", result, duration }
              : l
          )
        );
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMsg = error instanceof Error ? error.message : "Unknown error";

        updateNodeData(node.id, { status: "error", result: errorMsg });

        setExecutionLogs((prev) =>
          prev.map((l) =>
            l.nodeId === node.id && l.status === "running"
              ? { ...l, status: "error", result: errorMsg, duration }
              : l
          )
        );

        toast.error(`Error in "${data.label}": ${errorMsg}`);
        break;
      }
    }

    setIsRunning(false);
    if (!abortRef.current) {
      toast.success("Workflow execution completed!");
    }
  }, [getExecutionOrder, updateNodeData]);

  const stopWorkflow = useCallback(() => {
    abortRef.current = true;
    setIsRunning(false);
    toast.info("Workflow stopped.");
  }, []);

  const resetWorkflow = useCallback(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, status: "idle", result: undefined },
      }))
    );
    setExecutionLogs([]);
    setShowOutput(false);
  }, [setNodes]);

  const clearCanvas = useCallback(() => {
    setNodes(initialNodes);
    setEdges([]);
    setSelectedNode(null);
    setExecutionLogs([]);
    setShowOutput(false);
    toast.info("Canvas cleared.");
  }, [setNodes, setEdges]);

  const saveWorkflow = useCallback(() => {
    const workflow = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
      })),
    };
    localStorage.setItem("workflow-draft", JSON.stringify(workflow));
    toast.success("Workflow saved to drafts.");
  }, [nodes, edges]);

  return (
    <div className="flex h-full w-full">
      <WorkflowSidebar />

      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          className="bg-background"
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="rgba(255,255,255,0.05)"
          />
          <Controls className="!bg-card !border-border !rounded-lg !shadow-lg [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted" />
          <MiniMap
            className="!bg-card !border-border !rounded-lg !shadow-lg"
            nodeColor={(n) => {
              const colors: Record<string, string> = {
                trigger: "#a855f7",
                ai: "#6366f1",
                human: "#10b981",
                web_scraping: "#f59e0b",
                topic_analysis: "#06b6d4",
                benchmarking: "#ec4899",
                brainstorming: "#f97316",
                output: "#22c55e",
              };
              return colors[n.type || ""] || "#6366f1";
            }}
            maskColor="rgba(0,0,0,0.7)"
          />

          {/* Top Toolbar */}
          <Panel position="top-center">
            <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm border border-border rounded-xl px-4 py-2 shadow-lg">
              <Workflow className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground mr-2">
                Workflow Editor
              </span>

              <div className="w-px h-5 bg-border" />

              {!isRunning ? (
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1.5 bg-green-600 hover:bg-green-700"
                  onClick={executeWorkflow}
                >
                  <Play className="w-3 h-3" />
                  Run
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 text-xs gap-1.5"
                  onClick={stopWorkflow}
                >
                  <Square className="w-3 h-3" />
                  Stop
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1.5"
                onClick={resetWorkflow}
                disabled={isRunning}
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1.5"
                onClick={saveWorkflow}
                disabled={isRunning}
              >
                <Save className="w-3 h-3" />
                Save
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs gap-1.5 text-muted-foreground"
                onClick={clearCanvas}
                disabled={isRunning}
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </Button>

              <div className="w-px h-5 bg-border" />

              <Button
                size="sm"
                variant={showChat ? "default" : "outline"}
                className="h-7 text-xs gap-1.5"
                onClick={() => {
                  setShowChat(!showChat);
                  setShowOutput(false);
                  setSelectedNode(null);
                }}
                disabled={isRunning}
              >
                <MessageSquare className="w-3 h-3" />
                AI Chat
              </Button>

              <div className="w-px h-5 bg-border" />

              <Badge variant="secondary" className="text-[10px] h-5">
                {nodes.length} nodes
              </Badge>
              <Badge variant="secondary" className="text-[10px] h-5">
                {edges.length} connections
              </Badge>

              {isRunning && (
                <Badge className="text-[10px] h-5 gap-1 bg-blue-600 animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Running
                </Badge>
              )}
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Right Panel - Config or Output */}
      {selectedNode && !showOutput && (
        <NodeConfigPanel
          node={selectedNode}
          onUpdate={updateNodeData}
          onClose={() => setSelectedNode(null)}
          onDelete={deleteNode}
        />
      )}

      {showOutput && !showChat && (
        <OutputPanel
          logs={executionLogs}
          isRunning={isRunning}
          onClose={() => setShowOutput(false)}
        />
      )}

      {showChat && (
        <WorkflowChatPanel
          onApplyWorkflow={(newNodes, newEdges) => {
            setNodes(newNodes);
            setEdges(newEdges);
            setSelectedNode(null);
            setExecutionLogs([]);
            setShowOutput(false);
          }}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
