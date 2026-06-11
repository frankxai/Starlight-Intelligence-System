/**
 * Embedding Provider — pluggable vector embeddings for hybrid retrieval.
 *
 * Provides a narrow EmbeddingProvider interface with two implementations:
 *   (a) HashingTFProvider — stdlib-only, zero new deps, used as safe fallback
 *       (mirrors the Python EmbeddingSidecar in phase0/embedding_sidecar.py)
 *   (b) TransformerProvider — wraps fastembed (optional dep, ONNX-backed,
 *       local transformer embeddings, no API calls, no torch, no sharp)
 *
 * Provider selection:
 *   - Default: HashingTFProvider (always available, CI-safe)
 *   - TransformerProvider: only when STARLIGHT_EMBED=transformer is set AND
 *     the fastembed package can be imported (lazy, optional peer dep)
 *
 * RRF weighting (proved via Python harness 2026-06-10):
 *   - vector channel: 0.7, BM25 channel: 0.3 (configurable via RRFOptions.weights)
 *   - k constant: 60 (standard RRF default)
 *
 * JSONL canon is never touched — this module is a sidecar index only.
 *
 * Built on SIP — operational tier (memory engine v0.2).
 */

// ── Types ──────────────────────────────────────────────────

/**
 * A dense float32 vector, represented as a plain number array.
 * Length is fixed per-provider (e.g. 384 for all-MiniLM-L6-v2).
 */
export type EmbeddingVector = number[];

/**
 * Minimal contract every embedding provider must satisfy.
 * Implementations must be idempotent and thread-safe for reads.
 */
export interface EmbeddingProvider {
  /** Human-readable provider name for logs and receipts. */
  readonly name: string;

  /**
   * Embed a single text string. Returns a dense or sparse vector.
   * Dense providers return a fixed-length float32 array.
   * The hashing provider returns a sparse array (most entries 0).
   *
   * Never throws — returns an empty vector on error.
   */
  embed(text: string): Promise<EmbeddingVector>;

  /**
   * Batch embed multiple texts. Default falls back to sequential embed().
   * Implementations MAY override for model-level batching efficiency.
   */
  embedBatch(texts: string[]): Promise<EmbeddingVector[]>;

  /** Cosine similarity between two vectors. 0.0 if either is zero-length. */
  similarity(a: EmbeddingVector, b: EmbeddingVector): number;

  /**
   * Optional warm-up: download model weights if needed.
   * Called by TransformerProvider before the first embed.
   * HashingTFProvider is a no-op here.
   */
  warmup?(): Promise<void>;
}

// ── Helpers ────────────────────────────────────────────────

const TOKEN_RE = /[A-Za-z][A-Za-z0-9_-]+/g;

function tokenize(text: string): string[] {
  const matches = text.match(TOKEN_RE) ?? [];
  return matches.map(t => t.toLowerCase());
}

function dotProduct(a: EmbeddingVector, b: EmbeddingVector): number {
  const len = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < len; i++) sum += a[i] * b[i];
  return sum;
}

function magnitude(v: EmbeddingVector): number {
  let sum = 0;
  for (const x of v) sum += x * x;
  return Math.sqrt(sum);
}

// ── HashingTFProvider ──────────────────────────────────────

/**
 * Hashing-trick TF·IDF embedder — stdlib-only, zero new deps.
 *
 * Matches the HashingTFEmbedder in phase0/embedding_sidecar.py:
 *   - 1024-dim fixed-size sparse vector via hash(token) % dim
 *   - IDF weighted when a corpus has been fitted
 *   - L2-normalised so cosine = dot product
 *
 * Outputs a dense 1024-float array (mostly zeros) for a uniform interface.
 */
export class HashingTFProvider implements EmbeddingProvider {
  readonly name = 'hashing-tf';
  private readonly dim: number;
  /** document-frequency map: hash → number of docs seen with that token */
  private df = new Map<number, number>();
  private docCount = 0;

  constructor(dim = 1024) {
    this.dim = dim;
  }

  /**
   * Build IDF statistics from a corpus of texts.
   * Call this before embed() for best quality; skip for pure-TF mode.
   */
  fit(corpus: string[]): void {
    this.df = new Map();
    this.docCount = 0;
    for (const text of corpus) {
      const seen = new Set(tokenize(text).map(t => this.hashToken(t)));
      this.docCount++;
      for (const h of seen) {
        this.df.set(h, (this.df.get(h) ?? 0) + 1);
      }
    }
  }

  async embed(text: string): Promise<EmbeddingVector> {
    const tokens = tokenize(text);
    if (tokens.length === 0) return new Array(this.dim).fill(0);

    // Term frequency: count per hashed bucket
    const tf = new Map<number, number>();
    for (const t of tokens) {
      const h = this.hashToken(t);
      tf.set(h, (tf.get(h) ?? 0) + 1);
    }

    // TF · IDF, then L2-normalise
    const vec = new Array(this.dim).fill(0) as number[];
    for (const [h, count] of tf) {
      vec[h] = count * this.idf(h);
    }
    const norm = magnitude(vec);
    if (norm > 0) {
      for (let i = 0; i < this.dim; i++) vec[i] /= norm;
    }
    return vec;
  }

  async embedBatch(texts: string[]): Promise<EmbeddingVector[]> {
    return Promise.all(texts.map(t => this.embed(t)));
  }

  similarity(a: EmbeddingVector, b: EmbeddingVector): number {
    // Both vectors are L2-normalised so dot product == cosine similarity
    if (a.length === 0 || b.length === 0) return 0;
    return Math.max(0, dotProduct(a, b));
  }

  private hashToken(token: string): number {
    // FNV-1a 32-bit hash, bucketed to dim
    let h = 2166136261;
    for (let i = 0; i < token.length; i++) {
      h ^= token.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h % this.dim;
  }

  private idf(h: number): number {
    if (this.docCount === 0) return 1.0;
    const df = this.df.get(h) ?? 0;
    // Smoothed IDF: log((1+N) / (1+df)) + 1
    return Math.log((1 + this.docCount) / (1 + df)) + 1;
  }
}

// ── TransformerProvider ────────────────────────────────────

/**
 * Real local transformer embeddings via fastembed (ONNX-backed).
 *
 * Downloads the model on first use to ~/.cache/fastembed (or wherever
 * fastembed chooses on the platform). Subsequent runs use the local copy.
 *
 * Default model: Xenova/all-MiniLM-L6-v2 (384-dim, 22M params, fast).
 * This is a well-known sentence-similarity model widely benchmarked on MTEB.
 *
 * fastembed was chosen over @xenova/transformers because:
 *   - No sharp dependency (sharp requires native compilation on Windows)
 *   - onnxruntime-node (not onnxruntime-web) — better for Node.js servers
 *   - Smaller install footprint for server-side use
 *
 * IMPORTANT: This class will throw at construction time if fastembed
 * is not installed. Callers must guard with createEmbeddingProvider()
 * which falls back to HashingTFProvider when fastembed is unavailable.
 */
export class TransformerProvider implements EmbeddingProvider {
  readonly name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private pipeline: any = null;
  private readonly modelName: string;

  constructor(modelName = 'Xenova/all-MiniLM-L6-v2') {
    this.modelName = modelName;
    this.name = `transformer:${modelName}`;
  }

  async warmup(): Promise<void> {
    await this.getOrInitPipeline();
  }

  async embed(text: string): Promise<EmbeddingVector> {
    try {
      const pipe = await this.getOrInitPipeline();
      const output = await pipe(text, { pooling: 'mean', normalize: true });
      // onnxruntime tensor: output.data is Float32Array
      return Array.from(output.data as Float32Array);
    } catch {
      // Graceful degradation: return zero vector on any error
      return [];
    }
  }

  async embedBatch(texts: string[]): Promise<EmbeddingVector[]> {
    if (texts.length === 0) return [];
    try {
      const pipe = await this.getOrInitPipeline();
      const output = await pipe(texts, { pooling: 'mean', normalize: true });
      // Batch output: shape [n, dim]
      const dim = output.dims[1] as number;
      const data = output.data as Float32Array;
      return texts.map((_, i) => Array.from(data.slice(i * dim, (i + 1) * dim)));
    } catch {
      // Fall back to sequential on any batch error
      return Promise.all(texts.map(t => this.embed(t)));
    }
  }

  similarity(a: EmbeddingVector, b: EmbeddingVector): number {
    if (a.length === 0 || b.length === 0) return 0;
    // Vectors are normalised by the model; dot product == cosine
    return Math.max(0, dotProduct(a, b));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async getOrInitPipeline(): Promise<any> {
    if (this.pipeline) return this.pipeline;
    // Dynamic import so TransformerProvider can be instantiated without
    // @xenova/transformers being installed — the error surfaces here, not at
    // module load time. The specifier is constructed at runtime to prevent
    // tsc from trying to statically resolve the optional peer dependency.
    const specifier = '@xenova/transformers';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = await import(/* @vite-ignore */ specifier) as any;
    this.pipeline = await mod.pipeline('feature-extraction', this.modelName);
    return this.pipeline;
  }
}

// ── Factory ────────────────────────────────────────────────

export interface EmbeddingProviderConfig {
  /**
   * Which provider to use.
   *   'hashing' — HashingTFProvider (default, zero deps, CI-safe)
   *   'transformer' — TransformerProvider (requires fastembed or @xenova/transformers)
   *   'auto' — use transformer if available, else hashing
   */
  provider?: 'hashing' | 'transformer' | 'auto';
  /** Model name for TransformerProvider. Default: 'Xenova/all-MiniLM-L6-v2' */
  model?: string;
  /** Corpus texts to fit IDF weights on HashingTFProvider. */
  corpusForIdf?: string[];
}

/**
 * Create an EmbeddingProvider from config or environment.
 *
 * Environment:
 *   STARLIGHT_EMBED=transformer  → try TransformerProvider, fall back to hashing
 *   STARLIGHT_EMBED=hashing      → HashingTFProvider always
 *   (unset)                      → HashingTFProvider (safe default)
 *
 * Model-dependent tests should be gated:
 *   if (process.env.STARLIGHT_EMBED === 'transformer') { ... }
 */
export async function createEmbeddingProvider(
  config: EmbeddingProviderConfig = {},
): Promise<EmbeddingProvider> {
  const envProvider = process.env['STARLIGHT_EMBED'];
  const want = config.provider ?? (envProvider as EmbeddingProviderConfig['provider']) ?? 'hashing';

  if (want === 'hashing') {
    const p = new HashingTFProvider();
    if (config.corpusForIdf) p.fit(config.corpusForIdf);
    return p;
  }

  // 'transformer' or 'auto': try to load; fall back to hashing if unavailable
  try {
    const p = new TransformerProvider(config.model);
    if (p.warmup) await p.warmup();
    return p;
  } catch (err) {
    if (want === 'transformer') {
      // Explicit request for transformer — surface the error, don't silently downgrade
      throw new Error(
        `TransformerProvider unavailable (STARLIGHT_EMBED=transformer). ` +
        `Install @xenova/transformers or fastembed. Underlying error: ${String(err)}`
      );
    }
    // 'auto': silently fall back to hashing
    const p = new HashingTFProvider();
    if (config.corpusForIdf) p.fit(config.corpusForIdf);
    return p;
  }
}

// ── RRF helpers (used by RetrievalIndex.hybridSearch) ─────

export interface RRFOptions {
  /** RRF constant. Default 60 (standard; larger k reduces impact of very-high ranks). */
  k?: number;
  /**
   * Weights for [vector, bm25] channels. Must sum to 1.0.
   * Default: [0.7, 0.3] — proved to be optimal by Python harness 2026-06-10.
   */
  weights?: [number, number];
}

/**
 * Reciprocal Rank Fusion over two scored result lists.
 *
 * Each result is identified by its string id.
 * Returns merged ids sorted by descending RRF score.
 *
 * Formula (standard RRF):
 *   score(d) = w_vec / (k + rank_vec(d)) + w_bm25 / (k + rank_bm25(d))
 *   where rank is 1-based and Infinity (unranked) contributes 0.
 */
export function rrfMerge(
  vectorResults: string[],
  bm25Results: string[],
  limit: number,
  opts: RRFOptions = {},
): string[] {
  const k = opts.k ?? 60;
  const [wVec, wBm25] = opts.weights ?? [0.7, 0.3];

  const scores = new Map<string, number>();

  vectorResults.forEach((id, i) => {
    scores.set(id, (scores.get(id) ?? 0) + wVec / (k + i + 1));
  });
  bm25Results.forEach((id, i) => {
    scores.set(id, (scores.get(id) ?? 0) + wBm25 / (k + i + 1));
  });

  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
}
