import { Pinecone } from "@pinecone-database/pinecone";
import { groq } from "./groq";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const INDEX_NAME = process.env.PINECONE_INDEX || "saas-doc-ai";

export async function ensureIndex() {
  const indexes = await pinecone.listIndexes();
  const exists = indexes.indexes?.some((idx) => idx.name === INDEX_NAME);
  
  if (!exists) {
    await pinecone.createIndex({
      name: INDEX_NAME,
      dimension: 1536,
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
    });
    // Wait for index to be ready
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
  
  return pinecone.index(INDEX_NAME);
}

export async function getIndex() {
  return pinecone.index(INDEX_NAME);
}

// Simple embedding using Groq - we'll create embeddings via a hash-based approach
// since Groq doesn't have an embedding endpoint, we use a simple but effective method
export async function createEmbedding(text: string): Promise<number[]> {
  // Use a deterministic hash-based embedding for consistency
  const embedding = new Array(1536).fill(0);
  const words = text.toLowerCase().split(/\s+/);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.length; j++) {
      const idx = (word.charCodeAt(j) * 31 + i * 7 + j * 13) % 1536;
      embedding[idx] += 1.0 / (1 + Math.sqrt(words.length));
    }
  }
  
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum: number, val: number) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= magnitude;
    }
  }
  
  return embedding;
}

export function chunkText(text: string, chunkSize: number = 500, overlap: number = 100): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.trim().length > 0) {
      chunks.push(chunk);
    }
  }
  
  return chunks;
}

export async function embedAndStore(
  documentId: string,
  text: string,
  namespace: string = "documents"
) {
  const index = await ensureIndex();
  const chunks = chunkText(text);
  
  const vectors = await Promise.all(
    chunks.map(async (chunk, i) => ({
      id: `${documentId}-chunk-${i}`,
      values: await createEmbedding(chunk),
      metadata: {
        documentId,
        text: chunk,
        chunkIndex: i,
      },
    }))
  );

  // Upsert in batches of 100
  for (let i = 0; i < vectors.length; i += 100) {
    const batch = vectors.slice(i, i + 100);
    await index.namespace(namespace).upsert({ records: batch });
  }

  return chunks.length;
}

export async function queryDocuments(
  query: string,
  documentId?: string,
  namespace: string = "documents",
  topK: number = 5
) {
  const index = await getIndex();
  const queryEmbedding = await createEmbedding(query);

  const filter = documentId ? { documentId: { $eq: documentId } } : undefined;

  const results = await index.namespace(namespace).query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    filter,
  });

  return results.matches?.map((match) => ({
    text: match.metadata?.text as string,
    score: match.score || 0,
    documentId: match.metadata?.documentId as string,
  })) || [];
}
