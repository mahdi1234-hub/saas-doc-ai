import Groq from "groq-sdk";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function queryGroq(
  messages: { role: "system" | "user" | "assistant"; content: string }[]
) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.7,
    max_tokens: 4096,
  });

  return response.choices[0]?.message?.content || "";
}

export async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-ada-002",
      input: text,
    }),
  });

  if (!response.ok) {
    // Fallback: simple hash-based embedding for demo
    return simpleEmbedding(text);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

function simpleEmbedding(text: string): number[] {
  const embedding = new Array(1536).fill(0);
  const words = text.toLowerCase().split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.length; j++) {
      const idx = (word.charCodeAt(j) * (i + 1) * (j + 1)) % 1536;
      embedding[idx] += 1 / words.length;
    }
  }
  const magnitude = Math.sqrt(
    embedding.reduce((sum: number, val: number) => sum + val * val, 0)
  );
  return magnitude > 0
    ? embedding.map((v: number) => v / magnitude)
    : embedding;
}
