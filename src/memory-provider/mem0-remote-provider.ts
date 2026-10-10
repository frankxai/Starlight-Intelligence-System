import { DEFAULT_PROVIDER_CAPABILITIES } from "./resources.js";
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
  searchMemories(input: { query: string; user_id?: string; agent_id?: string; limit: number; metadata?: Record<string, unknown>; signal?: AbortSignal }): Promise<Array<{ id: string; text: string; score?: number; metadata?: Record<string, unknown> }>>;
  deleteMemory(input: { id: string }): Promise<boolean>;
  /** Resolve a SIS identity through the host's authoritative tenant-scoped index.
   * Search ranking or a caller-supplied remote ID is not sufficient authority.
   * Clients without this capability support recall/writes but cannot delete.
   */
  resolveMemory?(input: { tenant_id: string; memory_id: string }): Promise<{ id: string; metadata: Record<string, unknown> } | null>;
}

export interface Mem0RemoteProviderOptions {
  client: Mem0Client;
  flush_batch_size?: number;
  allow_regulated_external_mirror?: boolean;
  provider_name?: string;
}

interface PendingWrite {
  record: SISMemoryRecord;
  text: string;
  metadata: Record<string, unknown>;
}

export class Mem0RemoteProvider implements MemoryProvider {
  readonly name = "mem0";
  readonly capabilities: ProviderCapabilities = DEFAULT_PROVIDER_CAPABILITIES.mem0;
  private readonly client: Mem0Client;
  private readonly flushBatchSize: number;
  private readonly allowRegulatedExternalMirror: boolean;
  private readonly pending: PendingWrite[] = [];

  constructor(options: Mem0RemoteProviderOptions) {
    this.client = options.client;
    this.flushBatchSize = Math.max(1, options.flush_batch_size ?? 25);
    this.allowRegulatedExternalMirror = options.allow_regulated_external_mirror ?? false;
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
    return withMem0Ref(record, {
      provider_record_id: "pending",
      last_synced_at: new Date().toISOString(),
      sync_state: "pending",
    });
  }

  async recall(request: RecallRequest): Promise<RecallResult[]> {
    if (!request.tenant_id.trim() || (request.workspace_id !== undefined && !request.workspace_id.trim())) throw new Error('Invalid Mem0 scope');
    if (request.signal?.aborted) throw new DOMException('Memory recall cancelled', 'AbortError');
    const rows = await this.client.searchMemories({
      query: request.query,
      limit: Math.max(1, request.limit ?? 10),
      metadata: { tenant_id: request.tenant_id, ...(request.workspace_id !== undefined ? { workspace_id: request.workspace_id } : {}) },
      signal: request.signal,
    });

    const minScore = request.min_score ?? 0;
    return rows.slice(0, 1_000)
      // Enforce returned identity as well as requesting the upstream filter.
      // Missing legacy scope metadata requires migration, never request relabeling.
      .filter(row => row.metadata?.tenant_id === request.tenant_id
        && (request.workspace_id === undefined || row.metadata.workspace_id === request.workspace_id)
        && (row.metadata.workspace_id === undefined || (typeof row.metadata.workspace_id === 'string' && !!row.metadata.workspace_id.trim()))
        && typeof row.metadata.privacy_class === 'string' && ['public', 'private-shareable', 'private', 'secret', 'regulated'].includes(row.metadata.privacy_class)
        && (row.metadata.retention_policy === undefined || (typeof row.metadata.retention_policy === 'string' && ['ephemeral', 'rolling_90d', 'permanent', 'append_only', 'delete_by'].includes(row.metadata.retention_policy)))
        && (row.metadata.retention_until === undefined || (typeof row.metadata.retention_until === 'string' && Number.isFinite(Date.parse(row.metadata.retention_until))))
        && (row.metadata.retention_policy !== 'delete_by' || row.metadata.retention_until !== undefined)
        && typeof row.id === 'string' && row.id.length > 0 && row.id.length <= 256
        && typeof row.text === 'string' && row.text.length <= 100_000
        && Number.isFinite(row.score ?? 0))
      .map((row) => {
        const score = row.score ?? 0;
        const sisId = typeof row.metadata?.sis_memory_id === "string" ? row.metadata.sis_memory_id : `mem0_shadow_${row.id}`;
        const record: SISMemoryRecord = {
          memory_id: sisId,
          tenant_id: row.metadata!.tenant_id as string,
          ...(typeof row.metadata?.workspace_id === 'string' ? { workspace_id: row.metadata.workspace_id } : {}),
          source: { system: "mem0", event_id: row.id },
          modality: "text",
          memory_type: "semantic",
          normalized_fact: row.text,
          entities: [],
          relations: [],
          importance: score,
          confidence: score || 0.5,
          trust: 0.5,
          privacy_class: row.metadata!.privacy_class as SISMemoryRecord['privacy_class'],
          // Older SIS mirror entries omitted retention; retain the older policy
          // only when there is no explicit deadline or restrictive retention value.
          retention_policy: (row.metadata?.retention_policy ?? 'permanent') as SISMemoryRecord['retention_policy'],
          ...(typeof row.metadata?.retention_until === 'string' ? { retention_until: row.metadata.retention_until } : {}),
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
  }

  async forget(request: ForgetRequest): Promise<boolean> {
    if (typeof request.tenant_id !== 'string' || !request.tenant_id.trim()
      || typeof request.memory_id !== 'string' || !request.memory_id.trim() || request.memory_id.length > 256) {
      throw new Error('Invalid Mem0 deletion scope');
    }
    if (!this.client.resolveMemory) throw new Error('Mem0 deletion requires an authoritative scoped identity resolver');
    const resolved = await this.client.resolveMemory({ tenant_id: request.tenant_id, memory_id: request.memory_id });
    if (resolved === null) return false;
    if (typeof resolved.id !== 'string' || !resolved.id.trim() || resolved.id.length > 256
      || resolved.metadata?.tenant_id !== request.tenant_id || resolved.metadata?.sis_memory_id !== request.memory_id) {
      throw new Error('Mem0 deletion identity could not be verified');
    }
    return this.client.deleteMemory({ id: resolved.id });
  }

  async flush(): Promise<{ attempted: number; written: number; failed: number }> {
    const batch = this.pending.splice(0, this.flushBatchSize);
    let written = 0;
    let failed = 0;
    for (const item of batch) {
      try {
        await this.client.addMemory({
          text: item.text,
          user_id: item.record.user_id,
          agent_id: item.record.agent_id,
          metadata: item.metadata,
        });
        written++;
      } catch {
        failed++;
      }
    }
    return { attempted: batch.length, written, failed };
  }

  pendingCount(): number {
    return this.pending.length;
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
    retention_policy: record.retention_policy,
    ...(record.retention_until !== undefined ? { retention_until: record.retention_until } : {}),
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
