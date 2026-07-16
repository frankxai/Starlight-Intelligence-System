/**
 * Memory provider router tests.
 *
 * These lock the resource-aware SIS memory-provider contract: SIS stays
 * canonical, cloud providers are routed/mirrored only when policy allows, and
 * provider adapters declare singleton/shared-daemon requirements so dozens of
 * terminal agents do not spawn dozens of heavyweight memory runtimes.
 *
 * Built on SIP — sovereign memory provider router.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_PROVIDER_CAPABILITIES,
  estimateProviderResourcePlan,
  routeMemoryRecord,
  type SISMemoryRecord,
  type TenantMemoryPolicy,
} from "../src/memory-provider/index.js";

function record(overrides: Partial<SISMemoryRecord> = {}): SISMemoryRecord {
  return {
    memory_id: "mem_test_1",
    tenant_id: "tenant_frank",
    source: { system: "sis", event_id: "evt_1" },
    modality: "text",
    memory_type: "semantic",
    raw_content: "Frank prefers singleton memory services for dozens of agents.",
    normalized_fact: "Memory services must avoid per-agent heavyweight runtimes.",
    entities: [],
    relations: [],
    importance: 0.8,
    confidence: 0.9,
    trust: 0.9,
    privacy_class: "private",
    retention_policy: "permanent",
    provenance: [{ event_id: "evt_1", transform: "raw", at: "2026-06-18T00:00:00.000Z" }],
    provider_shadow_refs: {},
    ...overrides,
  };
}

describe("SIS memory-provider router", () => {
  it("always writes SIS local_core first and blocks external mirrors for secret records", () => {
    const routes = routeMemoryRecord(
      record({ privacy_class: "secret" }),
      { tenant_id: "tenant_frank", default_cloud_memory: "mem0", graph_memory: true, enterprise_connectors: true },
    );

    assert.deepEqual(routes, [
      {
        provider: "local_core",
        mode: "canonical_write",
        reason: "SIS canonical event log and vaults are always authoritative",
      },
    ]);
  });

  it("keeps private records local unless external mirroring is explicitly approved", () => {
    const blocked = routeMemoryRecord(
      record({ privacy_class: "private" }),
      { tenant_id: "tenant_frank", default_cloud_memory: "mem0", graph_memory: true, peer_modeling: true },
    );
    assert.deepEqual(blocked.map(route => route.provider), ["local_core"]);

    const approved = routeMemoryRecord(
      record({ privacy_class: "private" }),
      {
        tenant_id: "tenant_frank",
        default_cloud_memory: "mem0",
        graph_memory: true,
        peer_modeling: true,
        allow_private_external_mirror: true,
      },
    );
    assert.ok(approved.some(route => route.provider === "mem0"));
    assert.ok(approved.some(route => route.provider === "hindsight"));
    assert.ok(approved.some(route => route.provider === "honcho"));
  });

  it("routes graph-heavy records to Hindsight and general cloud memory to Mem0 without making either authoritative", () => {
    const routes = routeMemoryRecord(
      record({
        entities: [{ name: "SIS", type: "system", confidence: 0.95 }],
        relations: [{ subject: "SIS", predicate: "routes", object: "providers", confidence: 0.9 }],
        privacy_class: "private-shareable",
      }),
      { tenant_id: "tenant_frank", default_cloud_memory: "mem0", graph_memory: true },
    );

    assert.equal(routes[0]?.provider, "local_core");
    assert.equal(routes[0]?.mode, "canonical_write");
    assert.ok(routes.some((r) => r.provider === "mem0" && r.mode === "redacted_fact_write"));
    assert.ok(routes.some((r) => r.provider === "hindsight" && r.mode === "graph_projection"));
    assert.ok(routes.every((r) => r.mode !== "canonical_write" || r.provider === "local_core"));
  });

  it("uses local-only routing for privacy-sensitive tenants", () => {
    const routes = routeMemoryRecord(
      record({ privacy_class: "private" }),
      { tenant_id: "tenant_frank", local_only: true, local_provider: "holographic", default_cloud_memory: "mem0" },
    );

    assert.deepEqual(routes.map((r) => r.provider), ["local_core", "holographic"]);
    assert.equal(routes[1]?.mode, "derived_local_write");
  });

  it("marks heavyweight providers as shared-daemon/singleton so dozens of agents do not multiply RAM", () => {
    assert.equal(DEFAULT_PROVIDER_CAPABILITIES.mem0.process_model, "remote_api");
    assert.equal(DEFAULT_PROVIDER_CAPABILITIES.hindsight.process_model, "shared_daemon_or_remote_api");
    assert.equal(DEFAULT_PROVIDER_CAPABILITIES.openviking.process_model, "shared_daemon");
    assert.equal(DEFAULT_PROVIDER_CAPABILITIES.local_core.process_model, "embedded_lightweight");

    const plan = estimateProviderResourcePlan(["local_core", "mem0", "hindsight", "openviking"]);
    assert.equal(plan.max_embedded_heavy_processes_per_machine, 0);
    assert.ok(plan.notes.some((note) => note.includes("Never spawn per terminal agent")));
  });
});
