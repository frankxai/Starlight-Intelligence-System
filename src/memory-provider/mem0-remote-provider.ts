import { DEFAULT_PROVIDER_CAPABILITIES } from "./resources.js";
import { TTLCache } from "./ttl-cache.js";
import type {
  ForgetRequest,
  MemoryProvider,
  ProviderCapabilities,
  RecallRequest,
  RecallResult,
  SISMemoryRecord,
} from "./types.js";

export interface Mem0Client {
  addMemory(input: { text: string; user_id?: string; agent_id?: string; metadata: Record<string, unknown> }): Promise<{ id: string }>;
  searchMemories(input: { query: string; user_id?: string; agent_id?: string; limit: number; metadata?: Record<string, unknown> }): Promise<Array<{ id: string; text: string; score?: number; metadata?: Record<string, unknown> }>>;
  deleteMemory(input: { id: string }): Promise<boolean>;
}

export interface Mem0RemoteProviderOptions {
  client: Mem0Client;
  flush_batch_size?: number;
  allow_regulated_external_mirror?: boolean;
  ttl_cache?: { maxEntries?: number; ttlMs?: number };
  retry_attempts?: number;
  auto_flush_size?: number;
}

interface PendingWrite {
  record: SISMemoryRecord;
  text: string;
  metadata: Record<string, unknown>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, attempts: number, baseDelayMs = 100): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        await sleep(baseDelayMs * Math.pow(2, i));
      }
    }
  }
  throw lastErr;
}

export class Mem0RemoteProvider implements MemoryProvider {
  readonly name = "mem0";
  readonly capabilities: ProviderCapabilities = DEFAULT_PROVIDER_CAPABILITIES.mem0;
  private readonly client: Mem0Client;
  private readonly flushBatchSize: number;
  private readonly allowRegulatedExternalMirror: boolean;
  private readonly retryAttempts: number;
  private readonly autoFlushSize: number;
  private readonly pending: PendingWrite[] = [];
  private readonly recallCache: TTLCache<string, RecallResult[]>;

  constructor(options: Mem0RemoteProviderOptions) {
    this.client = options.client;
    this.flushBatchSize = Math.max(1, options.flush_batch_size ?? 25);
    this.allowRegulatedExternalMirror = options.allow_regulated_external_mirror ?? false;
    this.retryAttempts = Math.max(1, options.retry_attempts ?? 3);
    this.autoFlushSize = options.auto_flush_size ?? 0;
    this.recallCache = new TTLCache(options.ttl_cache);
  }

  async remember(record: SISMemoryRecord): Promise<SISMemoryRecord> {
    if (this.isBlocked(record)) {
      return withMem0Ref(record, {
        provider_record_id: "blocked_by_policy",
        last_synced_at: new Date().toISOString(),
        sync_state: "failed",
      });
    }

    const text = record.normalized_fact ?? record.summary ?? "";
    if (!text.trim()) {
      return withMem0Ref(record, {
        provider_record_id: "missing_redacted_text",
        last_synced_at: new Date().toISOString(),
        sync_state: "failed",
      });
    }

    this.pending.push({ record, text, metadata: metadataFor(record) });

    if (this.autoFlushSize > 0 && this.pending.length >= this.autoFlushSize) {
      // fire-and-forget auto flush (non-blocking for hot path)
      void this.flush().catch(() => {});
    }

    return withMem0Ref(record, {
      provider_record_id: "pending",
      last_synced_at: new Date().toISOString(),
      sync_state: "pending",
    });
  }

  async recall(request: RecallRequest): Promise<RecallResult[]> {
    const cacheKey = `${request.tenant_id}:${request.query}:${request.limit ?? 10}:${request.min_score ?? 0}`;
    const cached = this.recallCache.get(cacheKey);
    if (cached) return cached;

    const rows = await withRetry(
      () =>
        this.client.searchMemories({
          query: request.query,
          limit: Math.max(1, request.limit ?? 10),
          metadata: { tenant_id: request.tenant_id },
        }),
      this.retryAttempts,
    );

    const minScore = request.min_score ?? 0;
    const results: RecallResult[] = rows
      .map((row) => {
        const score = row.score ?? 0;
        const sisId = typeof row.metadata?.sis_memory_id === "string" ? row.metadata.sis_memory_id : `mem0_shadow_${row.id}`;
        const record: SISMemoryRecord = {
          memory_id: sisId,
          tenant_id: request.tenant_id,
          source: { system: "mem0", event_id: row.id },
          modality: "text",
          memory_type: "semantic",
          normalized_fact: row.text,
          entities: [],
          relations: [],
          importance: score,
          confidence: score || 0.5,
          trust: 0.5,
          privacy_class: "private-shareable",
          retention_policy: "permanent",
          provenance: [{ event_id: row.id, transform: "provider_imported", at: new Date().toISOString() }],
          provider_shadow_refs: {
            mem0: {
              provider_record_id: row.id,
              last_synced_at: new Date().toISOString(),
              sync_state: "synced",
            },
          },
        };
        return { record, score, matched_terms: [] } satisfies RecallResult;
      })
      .filter((result) => result.score >= minScore);

    this.recallCache.set(cacheKey, results);
    return results;
  }

  async forget(request: ForgetRequest): Promise<boolean> {
    return withRetry(() => this.client.deleteMemory({ id: request.memory_id }), this.retryAttempts);
  }

  async flush(): Promise<{ attempted: number; written: number; failed: number }> {
    const batch = this.pending.splice(0, this.flushBatchSize);
    let written = 0;
    let failed = 0;

    for (const item of batch) {
      try {
        await withRetry(
          () =>
            this.client.addMemory({
              text: item.text,
              user_id: item.record.user_id,
              agent_id: item.record.agent_id,
              metadata: item.metadata,
            }),
          this.retryAttempts,
        );
        written++;
      } catch {
        failed++;
      }
    }
    // Invalidate recall cache on writes (simple policy)
    this.recallCache.clear();
    return { attempted: batch.length, written, failed };
  }

  pendingCount(): number {
    return this.pending.length;
  }

  cacheSize(): number {
    return this.recallCache.size();
  }

  private isBlocked(record: SISMemoryRecord): boolean {
    if (record.privacy_class === "secret") return true;
    if (record.privacy_class === "regulated" && !this.allowRegulatedExternalMirror) return true;
    return false;
  }
}

function metadataFor(record: SISMemoryRecord): Record<string, unknown> {
  return {
    sis_memory_id: record.memory_id,
    tenant_id: record.tenant_id,
    workspace_id: record.workspace_id,
    memory_type: record.memory_type,
    vault: record.vault,
    privacy_class: record.privacy_class,
    importance: record.importance,
    confidence: record.confidence,
    trust: record.trust,
  };
}

function withMem0Ref(record: SISMemoryRecord, ref: SISMemoryRecord["provider_shadow_refs"][string]): SISMemoryRecord {
  return {
    ...record,
    provider_shadow_refs: {
      ...record.provider_shadow_refs,
      mem0: ref,
    },
  };
}
