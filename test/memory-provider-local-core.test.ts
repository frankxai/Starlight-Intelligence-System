/**
 * Provider adapter contract tests.
 *
 * These prove the first concrete local_core adapter can serve as the fast,
 * low-RAM hot path behind SIS while preserving provider-neutral semantics.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { InMemoryLocalCoreProvider, type SISMemoryRecord } from "../src/memory-provider/index.js";

function record(id: string, content: string, tags: string[] = []): SISMemoryRecord {
  return {
    memory_id: id,
    tenant_id: "tenant_frank",
    source: { system: "test", event_id: `evt_${id}` },
    modality: "text",
    memory_type: "semantic",
    raw_content: content,
    normalized_fact: content,
    entities: tags.map((name) => ({ name })),
    relations: [],
    importance: 0.7,
    confidence: 0.9,
    trust: 0.9,
    privacy_class: "private",
    retention_policy: "permanent",
    provenance: [{ event_id: `evt_${id}`, transform: "raw", at: "2026-06-18T00:00:00.000Z" }],
    provider_shadow_refs: {},
  };
}

describe("InMemoryLocalCoreProvider", () => {
  it("stores and recalls records without external provider state", async () => {
    const provider = new InMemoryLocalCoreProvider();
    await provider.remember(record("m1", "SIS memory gateway batches writes for dozens of agents", ["SIS"]));
    await provider.remember(record("m2", "Mem0 must be remote or batched, never per terminal runtime", ["Mem0"]));

    const results = await provider.recall({ tenant_id: "tenant_frank", query: "mem0 terminal runtime", limit: 5 });

    assert.equal(results[0]?.record.memory_id, "m2");
    assert.ok(results[0]?.score && results[0].score > 0);
  });

  it("enforces tenant isolation and explicit forget", async () => {
    const provider = new InMemoryLocalCoreProvider();
    await provider.remember(record("m1", "Frank memory"));
    await provider.remember({ ...record("m2", "Other tenant memory"), tenant_id: "tenant_other" });

    assert.deepEqual(
      (await provider.recall({ tenant_id: "tenant_frank", query: "memory", limit: 10 })).map((r) => r.record.memory_id),
      ["m1"],
    );

    await provider.forget({ tenant_id: "tenant_frank", memory_id: "m1" });
    assert.deepEqual(await provider.recall({ tenant_id: "tenant_frank", query: "Frank", limit: 10 }), []);
  });

  it("reports low-resource local_core capabilities", () => {
    const provider = new InMemoryLocalCoreProvider();
    assert.equal(provider.name, "local_core");
    assert.equal(provider.capabilities.process_model, "embedded_lightweight");
    assert.equal(provider.capabilities.per_agent_instance_allowed, true);
  });
});
