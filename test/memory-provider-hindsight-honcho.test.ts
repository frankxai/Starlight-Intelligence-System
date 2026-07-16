import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  HindsightProvider,
  HonchoProvider,
  type HindsightClient,
  type HindsightRecallRow,
  type HonchoClient,
  type HonchoSearchRow,
  type SISMemoryRecord,
} from '../src/memory-provider/index.js';

const RAW_SENTINEL = 'RAW-SECRET-MUST-NEVER-LEAVE-SIS';

function record(id: string, overrides: Partial<SISMemoryRecord> = {}): SISMemoryRecord {
  return {
    memory_id: id,
    tenant_id: 'tenant_frank',
    workspace_id: 'sis-memory-eval',
    agent_id: 'architect',
    user_id: 'frank',
    source: { system: 'test', event_id: `evt_${id}`, session_id: 'session-a' },
    modality: 'text',
    memory_type: 'semantic',
    raw_content: RAW_SENTINEL,
    normalized_fact: `SIS redacted fact for ${id} about orchid memory routing`,
    entities: [{ name: 'SIS' }],
    relations: [],
    importance: 0.8,
    confidence: 0.9,
    trust: 0.9,
    privacy_class: 'private-shareable',
    retention_policy: 'permanent',
    provenance: [{ event_id: `evt_${id}`, transform: 'raw', at: '2026-07-12T00:00:00.000Z' }],
    provider_shadow_refs: {},
    ...overrides,
  };
}

describe('HindsightProvider', () => {
  it('projects redacted facts into tenant banks and supports stable document deletion', async () => {
    const rows: Array<{ bank: string; content: string; documentId: string; metadata: Record<string, unknown> }> = [];
    const deleted: string[] = [];
    const client: HindsightClient = {
      async retain(input) {
        rows.push({ bank: input.bank_id, content: input.content, documentId: input.document_id, metadata: input.metadata });
        return { id: `hs_${rows.length}`, document_id: input.document_id };
      },
      async recall(input) {
        return rows
          .filter(row => row.bank === input.bank_id && row.content.toLowerCase().includes(input.query.toLowerCase()))
          .map((row, index): HindsightRecallRow => ({
            id: `hs_${index + 1}`,
            text: row.content,
            score: 0.91,
            document_id: row.documentId,
            metadata: row.metadata,
          }));
      },
      async deleteDocument(input) { deleted.push(input.document_id); return true; },
    };
    const provider = new HindsightProvider({ client });

    const pending = await provider.remember(record('sis_hs_1'));
    assert.equal(pending.provider_shadow_refs.hindsight?.sync_state, 'pending');
    assert.deepEqual(await provider.flush(), { attempted: 1, written: 1, failed: 0 });
    assert.equal(rows[0]?.content.includes(RAW_SENTINEL), false, 'raw content crossed provider boundary');
    assert.equal(rows[0]?.documentId, 'sis_hs_1');
    assert.equal(rows[0]?.metadata.tenant_id, undefined, 'raw tenant id crossed provider boundary');
    assert.equal(typeof rows[0]?.metadata.tenant_scope, 'string');

    const recalled = await provider.recall({ tenant_id: 'tenant_frank', query: 'orchid memory', limit: 3 });
    assert.equal(recalled[0]?.record.memory_id, 'sis_hs_1');
    assert.equal(await provider.forget({ tenant_id: 'tenant_frank', memory_id: 'sis_hs_1' }), true);
    assert.deepEqual(deleted, ['sis_hs_1']);
  });

  it('fails closed for private records by default', async () => {
    let retains = 0;
    const client: HindsightClient = {
      async retain() { retains++; return {}; },
      async recall() { return []; },
      async deleteDocument() { return true; },
    };
    const provider = new HindsightProvider({ client });
    const saved = await provider.remember(record('private-hs', { privacy_class: 'private' }));
    assert.equal(saved.provider_shadow_refs.hindsight?.sync_state, 'failed');
    assert.equal((await provider.flush()).attempted, 0);
    assert.equal(retains, 0);
  });
});

describe('HonchoProvider', () => {
  it('maps tenant/workspace/peer/session scopes and never sends raw content', async () => {
    const rows: Array<{
      workspace: string;
      peer: string;
      session: string;
      content: string;
      metadata: Record<string, unknown>;
      id: string;
    }> = [];
    const client: HonchoClient = {
      async addObservation(input) {
        const id = `honcho_${rows.length + 1}`;
        rows.push({
          workspace: input.workspace_id,
          peer: input.peer_id,
          session: input.session_id,
          content: input.content,
          metadata: input.metadata,
          id,
        });
        return { id };
      },
      async searchObservations(input) {
        return rows
          .filter(row => row.workspace === input.workspace_id && row.peer === input.peer_id)
          .filter(row => input.session_id == null || row.session === input.session_id)
          .filter(row => row.content.toLowerCase().includes(input.query.toLowerCase()))
          .map((row): HonchoSearchRow => ({ id: row.id, text: row.content, score: 0.88, metadata: row.metadata }));
      },
    };
    const provider = new HonchoProvider({ client });

    await provider.remember(record('sis_honcho_1'));
    assert.deepEqual(await provider.flush(), { attempted: 1, written: 1, failed: 0 });
    assert.equal(rows[0]?.content.includes(RAW_SENTINEL), false, 'raw content crossed provider boundary');
    assert.notEqual(rows[0]?.workspace, 'sis-memory-eval', 'external container id should be scoped/hashed');
    assert.notEqual(rows[0]?.peer, 'frank', 'external peer id should be scoped/hashed');
    assert.equal(rows[0]?.metadata.user_id, undefined, 'raw user id crossed provider boundary');
    assert.equal(typeof rows[0]?.metadata.user_scope, 'string');

    const recalled = await provider.recall({
      tenant_id: 'tenant_frank',
      workspace_id: 'sis-memory-eval',
      user_id: 'frank',
      session_id: 'session-a',
      query: 'orchid memory',
      limit: 3,
    });
    assert.equal(recalled[0]?.record.memory_id, 'sis_honcho_1');
    assert.equal(
      await provider.forget({ tenant_id: 'tenant_frank', memory_id: 'sis_honcho_1' }),
      false,
      'forget must fail explicitly when the provider client exposes no deletion contract',
    );
  });
});
