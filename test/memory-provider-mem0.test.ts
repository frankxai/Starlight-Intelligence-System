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
    assert.equal(typeof added[0]?.metadata.tenant_scope, "string");
    assert.equal(added[0]?.metadata.tenant_id, undefined, "raw tenant id crossed provider boundary");
  });

  it("blocks private, secret, and regulated records unless explicitly allowed", async () => {
    let calls = 0;
    const client: Mem0Client = {
      async addMemory() { calls++; return { id: "mem0_forbidden" }; },
      async searchMemories() { return []; },
      async deleteMemory() { return true; },
    };
    const provider = new Mem0RemoteProvider({ client });

    const privateRecord = await provider.remember(record("private_1", "private"));
    const secret = await provider.remember(record("secret_1", "secret"));
    const regulated = await provider.remember(record("regulated_1", "regulated"));
    const flushed = await provider.flush();

    assert.equal(privateRecord.provider_shadow_refs.mem0?.sync_state, "failed");
    assert.equal(secret.provider_shadow_refs.mem0?.sync_state, "failed");
    assert.equal(regulated.provider_shadow_refs.mem0?.sync_state, "failed");
    assert.equal(flushed.written, 0);
    assert.equal(calls, 0);
  });

  it("deletes by provider shadow id rather than assuming SIS ids match", async () => {
    const deleted: string[] = [];
    const client: Mem0Client = {
      async addMemory() { return { id: "mem0_provider_42" }; },
      async searchMemories() { return []; },
      async deleteMemory({ id }) { deleted.push(id); return true; },
    };
    const provider = new Mem0RemoteProvider({ client });
    await provider.remember(record("sis_42"));
    await provider.flush();

    assert.equal(await provider.forget({ tenant_id: "tenant_frank", memory_id: "sis_42" }), true);
    assert.deepEqual(deleted, ["mem0_provider_42"]);
  });

  it("recalls via remote search and maps provider refs without becoming canonical", async () => {
    const client: Mem0Client = {
      async addMemory() { return { id: "unused" }; },
      async searchMemories(input) {
        assert.equal(input.query, "batched remote");
        return [{ id: "mem0_1", text: "Batched remote memory", score: 0.77, metadata: { sis_memory_id: "sis_remote" } }];
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
});
