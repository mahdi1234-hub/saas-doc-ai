import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const INDEX_NAME = "saas-doc-ai";
const NAMESPACE = "pdf-chunks";

export async function ensureIndex() {
  const indexes = await pinecone.listIndexes();
  const existingIndex = indexes.indexes?.find((i) => i.name === INDEX_NAME);
  if (!existingIndex) {
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
}

export async function upsertVectors(
  vectors: { id: string; values: number[]; metadata: Record<string, string | number> }[]
) {
  const index = pinecone.Index(INDEX_NAME);
  await index.namespace(NAMESPACE).upsert({ records: vectors });
}

export async function queryVectors(queryVector: number[], topK = 5) {
  const index = pinecone.Index(INDEX_NAME);
  const results = await index.namespace(NAMESPACE).query({
    vector: queryVector,
    topK,
    includeMetadata: true,
  });
  return results.matches || [];
}

export async function deleteDocumentVectors(documentId: string) {
  const index = pinecone.Index(INDEX_NAME);
  try {
    await index.namespace(NAMESPACE).deleteMany({ filter: { documentId } });
  } catch {
    // Ignore errors during cleanup
  }
}

export { pinecone, INDEX_NAME, NAMESPACE };
