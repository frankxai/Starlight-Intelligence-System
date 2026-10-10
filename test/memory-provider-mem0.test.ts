/**
 * Mem0 remote adapter tests.
 *
 * The adapter is intentionally client-injected and remote-only so using Mem0
 * cannot recreate the old failure mode: one heavyweight memory runtime per
 * terminal coding agent.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  Mem0RemoteProvider,
  type Mem0Client,
  type SISMemoryRecord,
} from "../src/memory-provider/index.js";

function record(id: string, privacy_class: SISMemoryRecord["privacy_class"] = "private-shareable"): SISMemoryRecord {
  return {
    memory_id: id,
    tenant_id: "tenant_frank",
    user_id: "frank",
    source: { system: "test", event_id: `evt_${id}` },
    modality: "text",
    memory_type: "semantic",
    raw_content: "Raw private text should not be required for Mem0 writes.",
    normalized_fact: "Mem0 adapter must batch remote writes and preserve SIS authority.",
    summary: "Mem0 batched remote write doctrine.",
    entities: [{ name: "Mem0" }],
    relations: [],
    importance: 0.8,
    confidence: 0.9,
    trust: 0.9,
    privacy_class,
    retention_policy: "permanent",
    provenance: [{ event_id: `evt_${id}`, transform: "raw", at: "2026-06-18T00:00:00.000Z" }],
    provider_shadow_refs: {},
  };
}

describe("Mem0RemoteProvider", () => {
  it("buffers writes and flushes them through an injected remote client", async () => {
    const added: Array<{ text: string; metadata: Record<string, unknown> }> = [];
    const client: Mem0Client = {
      async addMemory(input) {
        added.push(input);
        return { id: `mem0_${added.length}` };
      },
      async searchMemories() { return []; },
      async deleteMemory() { return true; },
    };
    const provider = new Mem0RemoteProvider({ client, flush_batch_size: 10 });

    const saved = await provider.remember(record("sis_1"));
    assert.equal(added.length, 0, "remember queues by default instead of sync network write");
    assert.equal(saved.provider_shadow_refs.mem0?.sync_state, "pending");

    const flushed = await provider.flush();
    assert.equal(flushed.written, 1);
    assert.equal(added.length, 1);
    assert.equal(added[0]?.text, "Mem0 adapter must batch remote writes and preserve SIS authority.");
    assert.equal(added[0]?.metadata.sis_memory_id, "sis_1");
    assert.equal(added[0]?.metadata.tenant_id, "tenant_frank");
  });

  it("blocks secret and regulated records unless explicitly allowed", async () => {
    let calls = 0;
    const client: Mem0Client = {
      async addMemory() { calls++; return { id: "mem0_forbidden" }; },
      async searchMemories() { return []; },
      async deleteMemory() { return true; },
    };
    const provider = new Mem0RemoteProvider({ client });

    const secret = await provider.remember(record("secret_1", "secret"));
    const regulated = await provider.remember(record("regulated_1", "regulated"));
    const flushed = await provider.flush();

    assert.equal(secret.provider_shadow_refs.mem0?.sync_state, "failed");
    assert.equal(regulated.provider_shadow_refs.mem0?.sync_state, "failed");
    assert.equal(flushed.written, 0);
    assert.equal(calls, 0);
  });

  it("recalls via remote search and maps provider refs without becoming canonical", async () => {
    const client: Mem0Client = {
      async addMemory() { return { id: "unused" }; },
      async searchMemories(input) {
        assert.equal(input.query, "batched remote");
        return [{ id: "mem0_1", text: "Batched remote memory", score: 0.77, metadata: { sis_memory_id: "sis_remote", tenant_id: 'tenant_frank', privacy_class: 'private-shareable' } }];
      },
      async deleteMemory() { return true; },
    };
    const provider = new Mem0RemoteProvider({ client });

    const results = await provider.recall({ tenant_id: "tenant_frank", query: "batched remote", limit: 3 });

    assert.equal(results[0]?.record.memory_id, "sis_remote");
    assert.equal(results[0]?.record.provider_shadow_refs.mem0?.provider_record_id, "mem0_1");
    assert.equal(results[0]?.score, 0.77);
  });

  it("declares remote-only resource capabilities", () => {
    const client: Mem0Client = {
      async addMemory() { return { id: "unused" }; },
      async searchMemories() { return []; },
      async deleteMemory() { return true; },
    };
    const provider = new Mem0RemoteProvider({ client });
    assert.equal(provider.capabilities.process_model, "remote_api");
    assert.equal(provider.capabilities.per_agent_instance_allowed, false);
  });

  it('filters tenant and workspace upstream, validates returned identity and preserves restrictive metadata', async () => {
    let request: Parameters<Mem0Client['searchMemories']>[0] | undefined;
    const metadata = { sis_memory_id: 'allowed', tenant_id: 'tenant_frank', workspace_id: 'workspace-a', privacy_class: 'private-shareable', retention_policy: 'rolling_90d', retention_until: '2099-01-01' };
    const base = { id: 'remote-1', text: 'scoped fixture', score: 1, metadata };
    const client: Mem0Client = {
      async addMemory() { return { id: 'unused' }; }, async deleteMemory() { return true; },
      async searchMemories(input) {
        request = input;
        return [base, ...[{ tenant_id: 'other' }, { workspace_id: 'workspace-b' }, { workspace_id: undefined },
          { privacy_class: 'unknown' }, { retention_until: 2099 }, { retention_policy: 'unknown' }]
          .map((change, i) => ({ ...base, id: 'denied-' + i, metadata: { ...metadata, ...change } })),
          { ...base, id: 'missing-scope', metadata: {} },
          { ...base, id: 'secret', metadata: { ...metadata, privacy_class: 'secret' } }];
      },
    };
    const provider = new Mem0RemoteProvider({ client });
    const controller = new AbortController();
    const results = await provider.recall({ tenant_id: 'tenant_frank', workspace_id: 'workspace-a', query: 'scope', signal: controller.signal });
    assert.deepEqual(request?.metadata, { tenant_id: 'tenant_frank', workspace_id: 'workspace-a' });
    assert.equal(request?.signal, controller.signal);
    assert.deepEqual(results.map(result => result.record.source.event_id), ['remote-1', 'secret']);
    assert.equal(results[0].record.workspace_id, 'workspace-a');
    assert.equal(results[0].record.retention_until, '2099-01-01');
    assert.equal(results[1].record.privacy_class, 'secret');
  });

  it('writes retention metadata to the remote mirror rather than turning deadlines permanent on recall', async () => {
    let metadata: Record<string, unknown> | undefined;
    const client: Mem0Client = { async addMemory(input) { metadata = input.metadata; return { id: 'remote' }; },
      async searchMemories() { return []; }, async deleteMemory() { return true; } };
    const provider = new Mem0RemoteProvider({ client });
    await provider.remember({ ...record('retained'), workspace_id: 'w', retention_policy: 'delete_by', retention_until: '2099-01-01' });
    await provider.flush();
    assert.equal(metadata?.workspace_id, 'w');
    assert.equal(metadata?.retention_policy, 'delete_by');
    assert.equal(metadata?.retention_until, '2099-01-01');
  });
});
