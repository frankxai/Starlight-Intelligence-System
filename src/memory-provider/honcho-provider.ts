import { createHash } from 'node:crypto';
import { DEFAULT_PROVIDER_CAPABILITIES } from './resources.js';
import { externalMemoryText, externalScopeId, isExternalMirrorBlocked } from './privacy.js';
import type {
  FlushableMemoryProvider,
  ForgetRequest,
  ProviderCapabilities,
  RecallRequest,
  RecallResult,
  SISMemoryRecord,
} from './types.js';

export interface HonchoObservationInput {
  workspace_id: string;
  peer_id: string;
  session_id: string;
  message_id: string;
  content: string;
  metadata: Record<string, unknown>;
}

export interface HonchoSearchInput {
  workspace_id: string;
  peer_id: string;
  session_id?: string;
  query: string;
  limit: number;
}

export interface HonchoSearchRow {
  id: string;
  text: string;
  score?: number;
  metadata?: Record<string, unknown>;
}

/** Vendor SDK/wire adapter boundary. */
export interface HonchoClient {
  addObservation(input: HonchoObservationInput): Promise<{ id: string }>;
  searchObservations(input: HonchoSearchInput): Promise<HonchoSearchRow[]>;
  deleteObservation?(input: { workspace_id: string; observation_id: string }): Promise<boolean>;
  dialectic?(input: { workspace_id: string; peer_id: string; query: string }): Promise<{ text: string }>;
}

export interface HonchoProviderOptions {
  client: HonchoClient;
  flush_batch_size?: number;
  namespace_prefix?: string;
  allow_private_external_mirror?: boolean;
  allow_regulated_external_mirror?: boolean;
}

interface PendingWrite {
  record: SISMemoryRecord;
  text: string;
}

/** Optional peer-model projection; never the SIS canonical memory store. */
export class HonchoProvider implements FlushableMemoryProvider {
  readonly name = 'honcho';
  readonly capabilities: ProviderCapabilities = DEFAULT_PROVIDER_CAPABILITIES.honcho;
  private readonly client: HonchoClient;
  private readonly flushBatchSize: number;
  private readonly prefix: string;
  private readonly allowPrivate: boolean;
  private readonly allowRegulated: boolean;
  private readonly pending: PendingWrite[] = [];
  private readonly providerIds = new Map<string, string>();

  constructor(options: HonchoProviderOptions) {
    this.client = options.client;
    this.flushBatchSize = Math.max(1, options.flush_batch_size ?? 25);
    this.prefix = options.namespace_prefix ?? 'sis';
    this.allowPrivate = options.allow_private_external_mirror ?? false;
    this.allowRegulated = options.allow_regulated_external_mirror ?? false;
  }

  async remember(record: SISMemoryRecord): Promise<SISMemoryRecord> {
    if (isExternalMirrorBlocked(record, {
      allow_private_external_mirror: this.allowPrivate,
      allow_regulated_external_mirror: this.allowRegulated,
    })) {
      return withRef(record, 'blocked_by_policy', 'failed');
    }
    const text = externalMemoryText(record);
    if (!text) return withRef(record, 'missing_redacted_text', 'failed');
    this.pending.push({ record, text });
    return withRef(record, 'pending', 'pending', this.workspaceId(record.tenant_id, record.workspace_id));
  }

  async flush(): Promise<{ attempted: number; written: number; failed: number }> {
    const batch = this.pending.splice(0, this.flushBatchSize);
    let written = 0;
    let failed = 0;
    for (const { record, text } of batch) {
      try {
        const row = await this.client.addObservation({
          workspace_id: this.workspaceId(record.tenant_id, record.workspace_id),
          peer_id: this.peerId(record.user_id ?? record.agent_id ?? record.tenant_id),
          session_id: this.sessionId(record.source.session_id),
          message_id: record.memory_id,
          content: text,
          metadata: metadataFor(record),
        });
        this.providerIds.set(record.memory_id, row.id);
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

  async recall(request: RecallRequest): Promise<RecallResult[]> {
    const peer = request.user_id ?? request.agent_id ?? request.tenant_id;
    const rows = await this.client.searchObservations({
      workspace_id: this.workspaceId(request.tenant_id, request.workspace_id),
      peer_id: this.peerId(peer),
      session_id: request.session_id ? this.sessionId(request.session_id) : undefined,
      query: request.query,
      limit: Math.max(1, request.limit ?? 10),
    });
    const minScore = request.min_score ?? 0;
    return rows
      .map(row => mapRecallRow(request, row))
      .filter(result => result.score >= minScore)
      .slice(0, Math.max(1, request.limit ?? 10));
  }

  async forget(request: ForgetRequest): Promise<boolean> {
    if (!this.client.deleteObservation) return false;
    const providerId = request.provider_record_id ?? this.providerIds.get(request.memory_id);
    if (!providerId) return false;
    const deleted = await this.client.deleteObservation({
      workspace_id: this.workspaceId(request.tenant_id, request.workspace_id),
      observation_id: providerId,
    });
    if (deleted) this.providerIds.delete(request.memory_id);
    return deleted;
  }

  async dialectic(tenantId: string, peerId: string, query: string, workspaceId?: string): Promise<string | null> {
    if (!this.client.dialectic) return null;
    return (await this.client.dialectic({
      workspace_id: this.workspaceId(tenantId, workspaceId),
      peer_id: this.peerId(peerId),
      query,
    })).text;
  }

  private workspaceId(tenantId: string, workspaceId?: string): string {
    return stableScopedId(`${this.prefix}-workspace`, `${tenantId}:${workspaceId ?? 'default'}`);
  }

  private peerId(peerId: string): string {
    return stableScopedId(`${this.prefix}-peer`, peerId);
  }

  private sessionId(sessionId?: string): string {
    return stableScopedId(`${this.prefix}-session`, sessionId ?? 'sis-import');
  }
}

function stableScopedId(prefix: string, value: string): string {
  const hash = createHash('sha256').update(value).digest('hex').slice(0, 12);
  return `${prefix}-${hash}`;
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

function mapRecallRow(request: RecallRequest, row: HonchoSearchRow): RecallResult {
  const sisId = typeof row.metadata?.sis_memory_id === 'string'
    ? row.metadata.sis_memory_id
    : `honcho_shadow_${row.id}`;
  const score = row.score ?? 0;
  const now = new Date().toISOString();
  return {
    record: {
      memory_id: sisId,
      tenant_id: request.tenant_id,
      workspace_id: request.workspace_id,
      agent_id: request.agent_id,
      user_id: request.user_id,
      source: { system: 'honcho', event_id: row.id, session_id: request.session_id },
      modality: 'text',
      memory_type: 'profile',
      normalized_fact: row.text,
      entities: [],
      relations: [],
      importance: score,
      confidence: score || 0.5,
      trust: 0.5,
      privacy_class: 'private-shareable',
      retention_policy: 'permanent',
      provenance: [{ event_id: row.id, transform: 'provider_imported', at: now }],
      provider_shadow_refs: {
        honcho: {
          provider_record_id: row.id,
          last_synced_at: now,
          sync_state: 'synced',
        },
      },
    },
    score,
    matched_terms: [],
  };
}

function withRef(
  record: SISMemoryRecord,
  providerRecordId: string,
  syncState: 'pending' | 'failed',
  container?: string,
): SISMemoryRecord {
  return {
    ...record,
    provider_shadow_refs: {
      ...record.provider_shadow_refs,
      honcho: {
        provider_record_id: providerRecordId,
        container,
        last_synced_at: new Date().toISOString(),
        sync_state: syncState,
      },
    },
  };
}
