import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { StarlightError, StarlightStore } from "./store.js";
import { JsonFileWorkspaceAdapter } from "./store-file.js";

const pluginRoot = resolve(import.meta.dirname, "../..");

test("blank search never enumerates the operating graph", async () => {
  await withStore(async store => {
    for (const query of ["", "   ", "\n\t"]) {
      await assert.rejects(() => store.search({ query }),
        (error: unknown) => error instanceof StarlightError && error.code === "VALIDATION");
    }
    assert((await store.search({ query: "Starlight" })).length > 0);
  });
});

test("render ignores forged and stale caller snapshots and preserves explicit scope", async () => {
  await withStore(async store => {
    const forged = { snapshot_id: 'fake', revision: 9999, workspace: { name: 'Forged' }, summary: { ventures: 9999 } };
    const rendered = await store.getRenderSnapshot({ snapshot: forged, venture_ids: ['venture_arcanea'] });
    assert.notEqual(rendered.revision, 9999);
    assert.equal(rendered.ventures.length, 1);
    assert.equal(rendered.ventures[0].id, 'venture_arcanea');
    assert.equal(rendered.summary.ventures, 1);
  });
});

async function withStore(run: (store: StarlightStore) => Promise<void>): Promise<void> {
  const dataDir = await mkdtemp(join(tmpdir(), "starlight-store-test-"));
  const adapter = new JsonFileWorkspaceAdapter({
    dataDir,
    seedFile: join(pluginRoot, "server", "seed", "workspace.json"),
  });
  const store = new StarlightStore({ adapter });
  try {
    await run(store);
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
}

test("creates accountable work and increments the portfolio revision", async () => {
  await withStore(async (store) => {
    const before = await store.getSnapshot();
    const result = await store.createWorkItem({
      venture_id: "venture_starlight",
      objective_id: "objective_plugin_v1",
      title: "Exercise the reference tool contracts",
      owner: "Architecture",
      priority: "high",
      dependencies: ["work_plugin_contract"],
    });
    assert.equal(result.work_item.status, "backlog");
    assert.equal(result.work_item.version, 1);
    assert.equal(result.revision, before.revision + 1);
    const fetched = await store.getRecord(result.work_item.id);
    assert.equal(fetched.type, "work_item");
  });
});

test("requires confirmation for terminal work transitions", async () => {
  await withStore(async (store) => {
    await assert.rejects(
      () =>
        store.transitionWorkItem({
          work_item_id: "work_plugin_contract",
          expected_version: 1,
          status: "done",
          rationale: "All checks passed",
        }),
      (error: unknown) => error instanceof StarlightError && error.code === "CONFIRMATION_REQUIRED",
    );
    const result = await store.transitionWorkItem({
      work_item_id: "work_plugin_contract",
      expected_version: 1,
      status: "done",
      rationale: "The user confirmed all checks passed",
      user_confirmed: true,
    });
    assert.equal(result.work_item.status, "done");
    assert.equal(result.work_item.version, 2);
  });
});

test("rejects stale writes instead of overwriting a newer record", async () => {
  await withStore(async (store) => {
    await store.transitionWorkItem({
      work_item_id: "work_plugin_contract",
      expected_version: 1,
      status: "blocked",
      rationale: "Awaiting a production identity boundary",
    });
    await assert.rejects(
      () =>
        store.transitionWorkItem({
          work_item_id: "work_plugin_contract",
          expected_version: 1,
          status: "in_progress",
          rationale: "Continue from the stale client state",
        }),
      (error: unknown) => error instanceof StarlightError && error.code === "CONFLICT",
    );
  });
});

test("requires confirmation for approved decisions and preserves linked evidence", async () => {
  await withStore(async (store) => {
    await assert.rejects(
      () =>
        store.recordDecision({
          venture_id: "venture_starlight",
          title: "Adopt the production boundary",
          context: "The endpoint needs tenant authorization.",
          decision: "Use OAuth 2.1 and a tenant-scoped storage adapter.",
          owner: "Founder",
          status: "approved",
        }),
      (error: unknown) => error instanceof StarlightError && error.code === "CONFIRMATION_REQUIRED",
    );
    const proposed = await store.recordDecision({
      venture_id: "venture_starlight",
      title: "Adopt the production boundary",
      context: "The endpoint needs tenant authorization.",
      decision: "Use OAuth 2.1 and a tenant-scoped storage adapter.",
      owner: "Founder",
      status: "proposed",
    });
    const evidence = await store.registerEvidence({
      venture_id: "venture_starlight",
      title: "Authorization design note",
      source_type: "document",
      note: "Every request resolves actor, tenant, and permitted action server-side.",
      supports_decision_ids: [proposed.decision.id],
    });
    const fetched = await store.getRecord(proposed.decision.id);
    const decision = fetched.record as { evidence_ids: string[]; version: number };
    assert.deepEqual(decision.evidence_ids, [evidence.evidence.id]);
    assert.equal(decision.version, 2);
  });
});

test("filters snapshots without mutating authoritative state", async () => {
  await withStore(async (store) => {
    const snapshot = await store.getSnapshot({ venture_ids: ["venture_arcanea"] });
    assert.equal(snapshot.ventures.length, 1);
    assert.equal(snapshot.ventures[0].id, "venture_arcanea");
    assert(snapshot.work_items.every((item) => item.venture_id === "venture_arcanea"));
    const full = await store.getSnapshot();
    assert.equal(full.ventures.length, 3);
  });
});
