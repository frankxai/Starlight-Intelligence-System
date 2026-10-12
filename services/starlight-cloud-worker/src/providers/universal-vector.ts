/**
 * Starlight Universal Vector Provider Adapter
 * Supports Cloudflare Vectorize (Native Zero-Egress), Pinecone Serverless (Enterprise),
 * and Qdrant (Open Source Hybrid).
 * 
 * Built on SIP v1.1.1
 */

export interface VectorMatch {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface VectorRecord {
  id: string;
  values: number[];
  metadata?: Record<string, unknown>;
}

export interface IVectorProvider {
  name: string;
  query(vector: number[], options: { limit?: number; namespace?: string; filter?: Record<string, unknown> }): Promise<VectorMatch[]>;
  upsert(records: VectorRecord[], options?: { namespace?: string }): Promise<{ count: number }>;
}

/**
 * 1. Cloudflare Vectorize Adapter (Default Native Edge Vector Store)
 */
export class CloudflareVectorizeProvider implements IVectorProvider {
  public readonly name = 'cloudflare_vectorize';
  private binding: any;

  constructor(binding?: any) {
    this.binding = binding;
  }

  async query(vector: number[], options: { limit?: number; namespace?: string; filter?: Record<string, unknown> } = {}): Promise<VectorMatch[]> {
    if (!this.binding) {
      // Mock edge search if binding not attached in local/testing environment
      return [];
    }
    const queryOptions: any = { topK: options.limit || 10 };
    if (options.namespace) queryOptions.namespace = options.namespace;
    if (options.filter) queryOptions.filter = options.filter;

    const res = await this.binding.query(vector, queryOptions);
    return (res.matches || []).map((m: any) => ({
      id: m.id,
      score: m.score,
      metadata: m.metadata,
    }));
  }

  async upsert(records: VectorRecord[], options: { namespace?: string } = {}): Promise<{ count: number }> {
    if (!this.binding) return { count: records.length };
    const vectors = records.map(r => ({
      id: r.id,
      values: r.values,
      metadata: r.metadata,
      namespace: options.namespace,
    }));
    await this.binding.upsert(vectors);
    return { count: vectors.length };
  }
}

/**
 * 2. Pinecone Serverless Adapter (BYO Enterprise Pinecone Index)
 */
export class PineconeVectorProvider implements IVectorProvider {
  public readonly name = 'pinecone';
  private apiKey: string;
  private hostUrl: string;

  constructor(apiKey: string, hostUrl: string) {
    this.apiKey = apiKey;
    this.hostUrl = hostUrl.replace(/\/+$/, '');
  }

  async query(vector: number[], options: { limit?: number; namespace?: string; filter?: Record<string, unknown> } = {}): Promise<VectorMatch[]> {
    const url = `${this.hostUrl}/query`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Api-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vector,
        topK: options.limit || 10,
        namespace: options.namespace || '',
        filter: options.filter,
        includeMetadata: true,
      }),
    });

    if (!res.ok) {
      throw new Error(`Pinecone query failed with status ${res.status}: ${await res.text()}`);
    }

    const data = await res.json() as any;
    return (data.matches || []).map((m: any) => ({
      id: m.id,
      score: m.score,
      metadata: m.metadata,
    }));
  }

  async upsert(records: VectorRecord[], options: { namespace?: string } = {}): Promise<{ count: number }> {
    const url = `${this.hostUrl}/vectors/upsert`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Api-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vectors: records.map(r => ({
          id: r.id,
          values: r.values,
          metadata: r.metadata,
        })),
        namespace: options.namespace || '',
      }),
    });

    if (!res.ok) {
      throw new Error(`Pinecone upsert failed with status ${res.status}: ${await res.text()}`);
    }

    return { count: records.length };
  }
}

/**
 * 3. Qdrant Hybrid Vector Adapter (BYO High-Performance Qdrant Cluster)
 */
export class QdrantVectorProvider implements IVectorProvider {
  public readonly name = 'qdrant';
  private clusterUrl: string;
  private apiKey?: string;
  private collectionName: string;

  constructor(clusterUrl: string, collectionName: string = 'starlight_memories', apiKey?: string) {
    this.clusterUrl = clusterUrl.replace(/\/+$/, '');
    this.collectionName = collectionName;
    this.apiKey = apiKey;
  }

  async query(vector: number[], options: { limit?: number; namespace?: string } = {}): Promise<VectorMatch[]> {
    const url = `${this.clusterUrl}/collections/${this.collectionName}/points/search`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) headers['api-key'] = this.apiKey;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        vector,
        limit: options.limit || 10,
        with_payload: true,
      }),
    });

    if (!res.ok) {
      throw new Error(`Qdrant search failed with status ${res.status}: ${await res.text()}`);
    }

    const data = await res.json() as any;
    return (data.result || []).map((m: any) => ({
      id: String(m.id),
      score: m.score,
      metadata: m.payload,
    }));
  }

  async upsert(records: VectorRecord[]): Promise<{ count: number }> {
    const url = `${this.clusterUrl}/collections/${this.collectionName}/points?wait=true`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) headers['api-key'] = this.apiKey;

    const res = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        points: records.map(r => ({
          id: r.id,
          vector: r.values,
          payload: r.metadata,
        })),
      }),
    });

    if (!res.ok) {
      throw new Error(`Qdrant upsert failed with status ${res.status}: ${await res.text()}`);
    }

    return { count: records.length };
  }
}

/**
 * Universal Vector Router: selects appropriate provider dynamically
 */
export class UniversalVectorRouter {
  public static resolveProvider(env: any, headers?: Headers): IVectorProvider {
    const requestedProvider = headers?.get('X-Starlight-Vector-Provider')?.toLowerCase();

    // 1. Check for explicit Pinecone BYO config
    const pineconeKey = headers?.get('X-Pinecone-Key') || env?.PINECONE_API_KEY;
    const pineconeHost = headers?.get('X-Pinecone-Host') || env?.PINECONE_HOST;
    if ((requestedProvider === 'pinecone' || !requestedProvider) && pineconeKey && pineconeHost) {
      return new PineconeVectorProvider(pineconeKey, pineconeHost);
    }

    // 2. Check for explicit Qdrant BYO config
    const qdrantUrl = headers?.get('X-Qdrant-Url') || env?.QDRANT_URL;
    const qdrantKey = headers?.get('X-Qdrant-Key') || env?.QDRANT_API_KEY;
    if ((requestedProvider === 'qdrant' || !requestedProvider) && qdrantUrl) {
      return new QdrantVectorProvider(qdrantUrl, 'starlight_memories', qdrantKey);
    }

    // 3. Default to Cloudflare Vectorize (Native Zero-Egress Edge Engine)
    return new CloudflareVectorizeProvider(env?.STARLIGHT_VECTORS);
  }
}
