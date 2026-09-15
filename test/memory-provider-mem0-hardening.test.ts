/**
 * Hardening tests for Mem0RemoteProvider.
 * Covers: TTL cache, retry, auto-flush, cache invalidation on write, error paths.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Mem0RemoteProvider, type Mem0Client } from "../src/memory-provider/mem0-remote-provider.js";
import type { SISMemoryRecord } from "../src/types.js";

function record(id: string): SISMemoryRecord {
  return {
    memory_id: id,
    tenant_id: "tenant_frank",
    user_id: "frank",
    source: { system: "harden-test", event_id: `evt_${id}` },
    modality: "text",
    memory_type: "semantic",
    normalized_fact: `Hardened fact ${id}`,
    entities: [],
    relations: [],
    importance: 0.7,
    confidence: 0.8,
    trust: 0.75,
    privacy_class: "private-shareable",
    retention_policy: "permanent",
    provenance: [{ event_id: `evt_${id}`, transform: "test", at: new Date().toISOString() }],
    provider_shadow_refs: {},
  };
}

describe("Mem0RemoteProvider hardening", () => {
  it("uses TTL recall cache and invalidates on flush/write", async () => {
    let searchCalls = 0;
    const client: Mem0Client = {
      async addMemory() { return { id: "m1" }; },
      async searchMemories() {
        searchCalls++;
        return [{ id: "m1", text: "cached result", score: 0.9, metadata: { sis_memory_id: "sis_cached" } }];
      },
      async deleteMemory() { return true; },
    };
    const provider = new Mem0RemoteProvider({ client, ttl_cache: { ttlMs: 60_000 } });

    const r1 = await provider.recall({ tenant_id: "tenant_frank", query: "cached", limit: 3 });
    const r2 = await provider.recall({ tenant_id: "tenant_frank", query: "cached", limit: 3 });
    assert.equal(searchCalls, 1, "second recall should hit cache");
    assert.equal(r1.length, 1);
    assert.equal(r2.length, 1);

    // Write triggers cache clear
    await provider.remember(record("write1"));
    await provider.flush();

    const r3 = await provider.recall({ tenant_id: "tenant_frank", query: "cached", limit: 3 });
    assert.equal(searchCalls, 2, "write should have invalidated cache");
  });

  it("retries on transient client failure", async () => {
    let attempts = 0;
    const client: Mem0Client = {
      async addMemory() {
        attempts++;
        if (attempts < 3) throw new Error("transient");
        return { id: "retry_ok" };
      },
      async searchMemories() { return []; },
      async deleteMemory() { return true; },
    };
    const provider = new Mem0RemoteProvider({ client, retry_attempts: 3 });

    await provider.remember(record("retry_test"));
    const result = await provider.flush();
    assert.equal(result.written, 1);
    assert.equal(attempts, 3);
  });

  it("supports auto-flush on size threshold", async () => {
    const flushed: number[] = [];
    const client: Mem0Client = {
      async addMemory() {
        flushed.push(1);
        return { id: "auto" };
      },
      async searchMemories() { return []; },
      async deleteMemory() { return true; },
    };
    const provider = new Mem0RemoteProvider({ client, auto_flush_size: 2 });

    await provider.remember(record("a1"));
    await provider.remember(record("a2")); // should trigger auto flush

    // Give microtask time
    await new Promise((r) => setTimeout(r, 10));
    assert.ok(flushed.length >= 1, "auto-flush should have fired");
  });
});
