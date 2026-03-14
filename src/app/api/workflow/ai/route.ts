import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getCerebrasClient() {
  return new OpenAI({
    baseURL: "https://api.cerebras.ai/v1",
    apiKey: process.env.CEREBRAS_API_KEY || "placeholder",
  });
}

interface WorkflowAIRequest {
  nodeType: string;
  prompt: string;
  context?: string;
  model?: string;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  ai: "You are a helpful AI assistant. Process the user's request and provide a clear, structured response.",
  web_scraping:
    "You are a web scraping expert. Given a URL or topic, describe what data to extract, suggest CSS selectors, and outline a scraping strategy. Provide structured output with field names and expected data types.",
  topic_analysis:
    "You are a topic analysis expert. Analyze the given content or topic deeply. Identify key themes, subtopics, sentiment, entities, and provide a comprehensive understanding breakdown.",
  benchmarking:
    "You are a benchmarking and competitive analysis expert. Compare and evaluate the given subjects against relevant criteria. Provide scores, rankings, pros/cons, and actionable insights in a structured format.",
  brainstorming:
    "You are a creative brainstorming facilitator. Generate diverse, innovative ideas related to the given topic. Organize ideas by category, feasibility, and impact. Think outside the box and provide at least 10 unique ideas.",
  output:
    "You are a data formatting expert. Take the input data and format it into a clean, readable output. Summarize key findings and present them clearly.",
};

export async function POST(request: NextRequest) {
  try {
    const body: WorkflowAIRequest = await request.json();
    const { nodeType, prompt, context, model } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const systemPrompt =
      SYSTEM_PROMPTS[nodeType] || SYSTEM_PROMPTS.ai;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
    ];

    if (context) {
      messages.push({
        role: "user",
        content: `Context from previous steps:\n${context}`,
      });
    }

    messages.push({ role: "user", content: prompt });

    const cerebras = getCerebrasClient();
    const completion = await cerebras.chat.completions.create({
      model: model || "llama-4-scout-17b-16e-instruct",
      messages,
      temperature: nodeType === "brainstorming" ? 0.9 : 0.7,
      max_tokens: 2048,
    });

    const result = completion.choices[0]?.message?.content || "";

    return NextResponse.json({
      result,
      model: completion.model,
      usage: completion.usage,
    });
  } catch (error) {
    console.error("Workflow AI error:", error);
    return NextResponse.json(
      { error: "AI processing failed. Please check your API key and try again." },
      { status: 500 }
    );
  }
}
