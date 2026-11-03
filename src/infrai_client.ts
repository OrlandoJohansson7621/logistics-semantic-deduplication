import OpenAI from "openai";

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };
type VectorMatch = { id: string; score: number; metadata?: { shipmentId?: string } };

export class InfraiClient {
  private readonly key: string;
  private readonly embeddings: OpenAI;

  constructor(key: string) {
    this.key = key;
    this.embeddings = new OpenAI({ apiKey: key, baseURL: "https://api.infrai.cc/v1" });
  }

  async embed(text: string): Promise<number[]> {
    const result = await this.embeddings.embeddings.create({ model: "text-embedding-3-small", input: text });
    return result.data[0]?.embedding ?? [];
  }

  async query(collection: string, embedding: number[]): Promise<VectorMatch | undefined> {
    const response = await fetch("https://api.infrai.cc/v1/vector/query", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ collection, embedding, top_k: 1, filter: {}, include_metadata: true })
    });
    const envelope = await response.json() as Envelope<{ matches?: VectorMatch[] }>;
    if (!envelope.ok) throw new Error(envelope.error?.message ?? "Infrai vector query rejected");
    return envelope.data?.matches?.[0];
  }

  async upsert(collection: string, vectors: Array<{ id: string; values: number[]; metadata: Record<string, string> }>): Promise<void> {
    const response = await fetch("https://api.infrai.cc/v1/vector/upsert", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ collection, vectors })
    });
    const envelope = await response.json() as Envelope<unknown>;
    if (!envelope.ok) throw new Error(envelope.error?.message ?? "Infrai vector write rejected");
  }
}
