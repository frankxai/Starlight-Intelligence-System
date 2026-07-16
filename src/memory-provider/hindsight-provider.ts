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

export interface HindsightRetainInput {
  bank_id: string;
  content: string;
  document_id: string;
  timestamp?: string;
  metadata: Record<string, unknown>;
  tags: string[];
  update_mode: 'append';
}

export interface HindsightRecallInput {
  bank_id: string;
  query: string;
  top_k: number;
  filters?: Record<string, unknown>;
}

export interface HindsightRecallRow {
  id: string;
  text: string;
  score?: number;
  document_id?: string;
  metadata?: Record<string, unknown>;
}

/** Vendor SDK/wire adapter boundary. Keeps the SIS adapter independently testable. */
export interface HindsightClient {
  retain(input: HindsightRetainInput): Promise<{ id?: string; document_id?: string }>;
  recall(input: HindsightRecallInput): Promise<HindsightRecallRow[]>;
  deleteDocument(input: { bank_id: string; document_id: string }): Promise<boolean>;
  reflect?(input: { bank_id: string; query: string }): Promise<{ text: string }>;
}

export interface HindsightProviderOptions {
  client: HindsightClient;
  flush_batch_size?: number;
  bank_id_prefix?: string;
  allow_private_external_mirror?: boolean;
  allow_regulated_external_mirror?: boolean;
}

interface PendingWrite {
  record: SISMemoryRecord;
  text: string;
}

/**
 * Optional Hindsight projection. SIS remains canonical; Hindsight receives
 * only redacted facts/summaries and is addressed by a tenant-scoped bank.
 */
export class HindsightProvider implements FlushableMemoryProvider {
  readonly name = 'hindsight';
  readonly capabilities: ProviderCapabilities = DEFAULT_PROVIDER_CAPABILITIES.hindsight;
  private readonly client: HindsightClient;
  private readonly flushBatchSize: number;
  private readonly bankIdPrefix: string;
  private readonly allowPrivate: boolean;
  private readonly allowRegulated: boolean;
  private readonly pending: PendingWrite[] = [];

  constructor(options: HindsightProviderOptions) {
    this.client = options.client;
    this.flushBatchSize = Math.max(1, options.flush_batch_size ?? 25);
    this.bankIdPrefix = options.bank_id_prefix ?? 'sis';
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
    return withRef(record, record.memory_id, 'pending', this.bankId(record.tenant_id));
  }

  async flush(): Promise<{ attempted: number; written: number; failed: number }> {
    const batch = this.pending.splice(0, this.flushBatchSize);
    let written = 0;
    let failed = 0;

    for (const { record, text } of batch) {
      try {
        await this.client.retain({
          bank_id: this.bankId(record.tenant_id),
          content: text,
          document_id: record.memory_id,
          timestamp: record.time_range?.observed_at ?? record.provenance[record.provenance.length - 1]?.at,
          metadata: metadataFor(record),
          tags: providerTags(record),
          update_mode: 'append',
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

  async recall(request: RecallRequest): Promise<RecallResult[]> {
    const rows = await this.client.recall({
      bank_id: this.bankId(request.tenant_id),
      query: request.query,
      top_k: Math.max(1, request.limit ?? 10),
      filters: scopeFilters(request),
    });
    const minScore = request.min_score ?? 0;
    return rows
      .map(row => mapRecallRow(request, row))
      .filter(result => result.score >= minScore)
      .slice(0, Math.max(1, request.limit ?? 10));
  }

  async forget(request: ForgetRequest): Promise<boolean> {
    return this.client.deleteDocument({
      bank_id: this.bankId(request.tenant_id),
      document_id: request.provider_record_id ?? request.memory_id,
    });
  }

  async reflect(tenantId: string, query: string): Promise<string | null> {
    if (!this.client.reflect) return null;
    return (await this.client.reflect({ bank_id: this.bankId(tenantId), query })).text;
  }

  private bankId(tenantId: string): string {
    return stableScopedId(this.bankIdPrefix, tenantId);
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

function providerTags(record: SISMemoryRecord): string[] {
  return [record.memory_type, record.vault ? `vault:${record.vault}` : undefined]
    .filter((value): value is string => Boolean(value));
}

function scopeFilters(request: RecallRequest): Record<string, unknown> | undefined {
  const filters: Record<string, unknown> = {};
  if (request.workspace_id) filters.workspace_scope = externalScopeId('workspace', request.workspace_id);
  if (request.agent_id) filters.agent_scope = externalScopeId('agent', request.agent_id);
  if (request.user_id) filters.user_scope = externalScopeId('user', request.user_id);
  if (request.session_id) filters.session_scope = externalScopeId('session', request.session_id);
  return Object.keys(filters).length > 0 ? filters : undefined;
}

function mapRecallRow(request: RecallRequest, row: HindsightRecallRow): RecallResult {
  const sisId = typeof row.metadata?.sis_memory_id === 'string'
    ? row.metadata.sis_memory_id
    : row.document_id ?? `hindsight_shadow_${row.id}`;
  const score = row.score ?? 0;
  const now = new Date().toISOString();
  return {
    record: {
      memory_id: sisId,
      tenant_id: request.tenant_id,
      workspace_id: request.workspace_id,
      agent_id: request.agent_id,
      user_id: request.user_id,
      source: { system: 'hindsight', event_id: row.id, session_id: request.session_id },
      modality: 'text',
      memory_type: 'semantic',
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
        hindsight: {
          provider_record_id: row.document_id ?? row.id,
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
      hindsight: {
        provider_record_id: providerRecordId,
        container,
        last_synced_at: new Date().toISOString(),
        sync_state: syncState,
      },
    },
  };
}
