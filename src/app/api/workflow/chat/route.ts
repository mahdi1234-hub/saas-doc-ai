import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const cerebras = new OpenAI({
  baseURL: "https://api.cerebras.ai/v1",
  apiKey: process.env.CEREBRAS_API_KEY,
});

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const WORKFLOW_SYSTEM_PROMPT = `You are an AI workflow builder assistant. The user will describe what workflow they want to create, and you must generate a JSON workflow definition that can be rendered on a canvas.

Available node types:
- "trigger": Start point of the workflow. Config: { triggerType: "manual" | "scheduled" | "webhook" }
- "ai": AI processing step using Cerebras. Config: { prompt: string, model: "llama-4-scout-17b-16e-instruct" }
- "human": Manual human review step. Config: { instruction: string, requireApproval: "true" | "false" }
- "web_scraping": Extract data from websites. Config: { url: string, selector: string, fields: string }
- "topic_analysis": Analyze topics. Config: { topic: string, depth: "brief" | "detailed" | "comprehensive" }
- "benchmarking": Compare and benchmark data. Config: { subjects: string, criteria: string }
- "brainstorming": Generate creative ideas. Config: { topic: string, constraints: string, ideaCount: string }
- "output": Final output and results. Config: { format: "markdown" | "json" | "text" }

Rules:
1. Always start with a "trigger" node
2. Always end with an "output" node
3. Place nodes vertically with ~150px spacing
4. Connect nodes sequentially from top to bottom
5. Each node needs: id, type, label, description, position {x, y}, config, useAI (true for AI-powered nodes)
6. Generate edges connecting each node to the next

When the user asks you to create a workflow, respond with ONLY a JSON object (no markdown code blocks, no explanation before or after) with this exact structure:
{
  "message": "Brief description of what the workflow does",
  "workflow": {
    "nodes": [
      {
        "id": "unique-id",
        "type": "trigger|ai|human|web_scraping|topic_analysis|benchmarking|brainstorming|output",
        "label": "Node Label",
        "description": "What this node does",
        "position": { "x": 400, "y": 50 },
        "config": { ... },
        "useAI": true/false
      }
    ],
    "edges": [
      { "source": "node-id-1", "target": "node-id-2" }
    ]
  }
}

If the user is just chatting or asking questions (not requesting a workflow), respond with:
{
  "message": "Your helpful response here",
  "workflow": null
}

IMPORTANT: Always respond with valid JSON only. No markdown formatting, no code blocks, just raw JSON.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body as { messages: ChatMessage[] };

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    const apiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: WORKFLOW_SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const completion = await cerebras.chat.completions.create({
      model: "llama-4-scout-17b-16e-instruct",
      messages: apiMessages,
      temperature: 0.3,
      max_tokens: 4096,
    });

    const rawContent = completion.choices[0]?.message?.content || "";

    let parsed: { message: string; workflow: unknown } | null = null;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      parsed = { message: rawContent, workflow: null };
    }

    return NextResponse.json({
      message: parsed?.message || rawContent,
      workflow: parsed?.workflow || null,
      model: completion.model,
      usage: completion.usage,
    });
  } catch (error) {
    console.error("Workflow chat error:", error);
    return NextResponse.json(
      {
        error:
          "AI chat processing failed. Please check your API key and try again.",
      },
      { status: 500 }
    );
  }
}
