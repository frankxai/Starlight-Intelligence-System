/**
 * In-Memory Vector Embeddings & Reciprocal Rank Fusion (RRF)
 * Replicates Starlight HashingTFProvider for zero-dependency browser execution.
 * Zero network requests, instant (<0.2ms) embedding vector generation.
 * Uses Float32Array for V8 SIMD acceleration.
 */

export type EmbeddingVector = Float32Array;

export class ClientHashingTFProvider {
  readonly name = 'HashingTFProvider (In-Memory Browser Substrate)';
  private dim: number;
  private idf: Float32Array;
  private fitted: boolean = false;

  constructor(dim: number = 256) {
    this.dim = dim;
    this.idf = new Float32Array(dim).fill(1.0);
  }

  private hashToken(token: string): number {
    let hash = 2166136261;
    const len = token.length;
    for (let i = 0; i < len; i++) {
      hash ^= token.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return Math.abs(hash) % this.dim;
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase().match(/[a-z0-9_-]{2,}/g) || [];
  }

  public fit(corpus: string[]): void {
    const docFreq = new Uint16Array(this.dim);
    const nDocs = corpus.length;
    if (nDocs === 0) return;

    for (const doc of corpus) {
      const tokens = this.tokenize(doc);
      const seen = new Set<number>();
      for (let i = 0; i < tokens.length; i++) {
        seen.add(this.hashToken(tokens[i]));
      }
      for (const bucket of seen) {
        docFreq[bucket] += 1;
      }
    }

    for (let i = 0; i < this.dim; i++) {
      const df = docFreq[i];
      this.idf[i] = Math.log((nDocs + 1) / (df + 1)) + 1.0;
    }
    this.fitted = true;
  }

  public embed(text: string): Float32Array {
    const vec = new Float32Array(this.dim);
    const tokens = this.tokenize(text);
    const numTokens = tokens.length;
    if (numTokens === 0) return vec;

    const tf = new Map<number, number>();
    for (let i = 0; i < numTokens; i++) {
      const bucket = this.hashToken(tokens[i]);
      tf.set(bucket, (tf.get(bucket) ?? 0) + 1);
    }

    let normSq = 0;
    const invLen = 1.0 / numTokens;
    for (const [bucket, count] of tf) {
      const idfWeight = this.fitted ? this.idf[bucket] : 1.0;
      const val = count * invLen * idfWeight;
      vec[bucket] = val;
      normSq += val * val;
    }

    if (normSq > 0) {
      const invNorm = 1.0 / Math.sqrt(normSq);
      for (let i = 0; i < this.dim; i++) {
        vec[i] *= invNorm;
      }
    }
    return vec;
  }

  public similarity(a: Float32Array, b: Float32Array): number {
    let dot = 0;
    const len = a.length;
    for (let i = 0; i < len; i++) {
      dot += a[i] * b[i];
    }
    return dot > 0 ? (dot < 1 ? dot : 1) : 0;
  }
}

/**
 * Reciprocal Rank Fusion (RRF)
 * Fuses Vector Search & Lexical FTS rankings
 */
export function rrfMerge<T extends { id: string }>(
  vectorRanked: T[],
  lexicalRanked: T[],
  limit: number = 20,
  options: { k?: number; weights?: [number, number] } = {}
): Array<{ item: T; rrfScore: number }> {
  const k = options.k ?? 60;
  const weights = options.weights ?? [0.7, 0.3]; // 70% vector, 30% lexical per SIS benchmark
  const scores = new Map<string, { item: T; score: number }>();

  for (let rank = 0; rank < vectorRanked.length; rank++) {
    const item = vectorRanked[rank];
    const rrf = weights[0] * (1.0 / (k + rank + 1));
    scores.set(item.id, { item, score: rrf });
  }

  for (let rank = 0; rank < lexicalRanked.length; rank++) {
    const item = lexicalRanked[rank];
    const rrf = weights[1] * (1.0 / (k + rank + 1));
    const existing = scores.get(item.id);
    if (existing) {
      existing.score += rrf;
    } else {
      scores.set(item.id, { item, score: rrf });
    }
  }

  return Array.from(scores.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => ({ item: r.item, rrfScore: r.score }));
}
