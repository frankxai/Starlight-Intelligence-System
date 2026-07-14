import { DEFAULT_PROVIDER_CAPABILITIES } from "./resources.js";
import type {
  ForgetRequest,
  MemoryProvider,
  ProviderCapabilities,
  RecallRequest,
  RecallResult,
  SISMemoryRecord,
} from "./types.js";
import { externalMemoryText, externalScopeId, isExternalMirrorBlocked } from './privacy.js';

export interface Mem0Client {
  addMemory(input: { text: string; user_id?: string; agent_id?: string; metadata: Record<string, unknown> }): Promise<{ id: string }>;
  searchMemories(input: { query: string; user_id?: string; agent_id?: string; limit: number; metadata?: Record<string, unknown> }): Promise<Array<{ id: string; text: string; score?: number; metadata?: Record<string, unknown> }>>;
  deleteMemory(input: { id: string }): Promise<boolean>;
}

export interface Mem0RemoteProviderOptions {
  client: Mem0Client;
  flush_batch_size?: number;
  allow_regulated_external_mirror?: boolean;
  allow_private_external_mirror?: boolean;
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
  private readonly allowPrivateExternalMirror: boolean;
  private readonly pending: PendingWrite[] = [];
  private readonly providerIds = new Map<string, string>();

  constructor(options: Mem0RemoteProviderOptions) {
    this.client = options.client;
    this.flushBatchSize = Math.max(1, options.flush_batch_size ?? 25);
    this.allowRegulatedExternalMirror = options.allow_regulated_external_mirror ?? false;
    this.allowPrivateExternalMirror = options.allow_private_external_mirror ?? false;
  }

  async remember(record: SISMemoryRecord): Promise<SISMemoryRecord> {
    if (this.isBlocked(record)) {
      return withMem0Ref(record, {
        provider_record_id: "blocked_by_policy",
        last_synced_at: new Date().toISOString(),
        sync_state: "failed",
      });
    }

    const text = externalMemoryText(record);
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
    const rows = await this.client.searchMemories({
      query: request.query,
      user_id: externalScopeId('user', request.user_id),
      agent_id: externalScopeId('agent', request.agent_id),
      limit: Math.max(1, request.limit ?? 10),
      metadata: {
        tenant_scope: externalScopeId('tenant', request.tenant_id),
        workspace_scope: externalScopeId('workspace', request.workspace_id),
        session_scope: externalScopeId('session', request.session_id),
      },
    });

    const minScore = request.min_score ?? 0;
    return rows
      .map((row) => {
        const score = row.score ?? 0;
        const sisId = typeof row.metadata?.sis_memory_id === "string" ? row.metadata.sis_memory_id : `mem0_shadow_${row.id}`;
        this.providerIds.set(sisId, row.id);
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
  }

  async forget(request: ForgetRequest): Promise<boolean> {
    const providerId = request.provider_record_id ?? this.providerIds.get(request.memory_id);
    if (!providerId) return false;
    const deleted = await this.client.deleteMemory({ id: providerId });
    if (deleted) this.providerIds.delete(request.memory_id);
    return deleted;
  }

  async flush(): Promise<{ attempted: number; written: number; failed: number }> {
    const batch = this.pending.splice(0, this.flushBatchSize);
    let written = 0;
    let failed = 0;
    for (const item of batch) {
      try {
        const writtenRow = await this.client.addMemory({
          text: item.text,
          user_id: externalScopeId('user', item.record.user_id),
          agent_id: externalScopeId('agent', item.record.agent_id),
          metadata: item.metadata,
        });
        this.providerIds.set(item.record.memory_id, writtenRow.id);
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
    return isExternalMirrorBlocked(record, {
      allow_private_external_mirror: this.allowPrivateExternalMirror,
      allow_regulated_external_mirror: this.allowRegulatedExternalMirror,
    });
  }
}

function metadataFor(record: SISMemoryRecord): Record<string, unknown> {
  return {
    sis_memory_id: record.memory_id,
    tenant_scope: externalScopeId('tenant', record.tenant_id),
    workspace_scope: externalScopeId('workspace', record.workspace_id),
    agent_scope: externalScopeId('agent', record.agent_id),
    user_scope: externalScopeId('user', record.user_id),
    session_scope: externalScopeId('session', record.source.session_id),
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
