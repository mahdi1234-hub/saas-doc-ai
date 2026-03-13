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

export async function analyzeDocument(
  query: string,
  context: string
) {
  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    {
      role: "system",
      content: `You are an expert document analyst AI assistant. You analyze PDF documents and provide detailed, accurate answers based on the document content provided. Always cite relevant parts of the document in your responses. If the information isn't in the provided context, say so clearly.`,
    },
    {
      role: "user",
      content: `Based on the following document content:\n\n---\n${context}\n---\n\nPlease answer this question: ${query}`,
    },
  ];

  return queryGroq(messages);
}
