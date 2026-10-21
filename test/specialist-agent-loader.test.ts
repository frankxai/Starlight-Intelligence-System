import assert from "node:assert/strict";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import { AgentRouter, loadSpecialistAgents } from "../src/agents.js";
import { compileLoopGraph, evaluateLoopGraph } from "../src/loop-graph.js";
import { buildLoopEngine, runLoopEngine, type LoopStepInput } from "../src/loop-engine.js";

const root = resolve(import.meta.dirname, "..");
const catalog = JSON.parse(readFileSync(join(root, "agents/catalog/specialists.json"), "utf8"));

test("runtime uses descriptive labels, exact skill keys, original identities, and distinct council seats", () => {
  const agents = loadSpecialistAgents(root);
  assert.ok(agents);
  assert.equal(agents.length, catalog.count);
  const router = new AgentRouter(agents);
  assert.equal(router.getAgent("starlight-navigator")?.name, "Strategy and roadmap planner");
  assert.ok(router.getAgent("starlight-navigator")?.skills.includes("intelligence/strategic-reasoning"));
  assert.equal(router.getAgent("starlight-crewai-orchestrator")?.id, "starlight-adapter-crewai");
  assert.equal(router.getAgent("starlight-sage-seat")?.id, "sage");
  assert.equal(router.getAgent("starlight-sage")?.id, "starlight-sage");
  assert.ok(router.route("navigator").some((match) => match.agent.id === "starlight-navigator"));
  assert.ok(!agents.some((agent) => agent.id === "AGENT_REGISTRY"));
});

test("runtime refuses stale or added source files instead of accepting an outdated catalog", () => {
  const dir = mkdtempSync(join(tmpdir(), "sis-catalog-runtime-"));
  try {
    for (const path of [...catalog.sources.map((source: { path: string }) => source.path), "agents/catalog/specialists.json"]) {
      mkdirSync(dirname(join(dir, path)), { recursive: true });
      copyFileSync(join(root, path), join(dir, path));
    }
    assert.equal(loadSpecialistAgents(dir)?.length, catalog.count);
    const added = join(dir, "agents/extra.md");
    writeFileSync(added, "---\nname: extra\ntier: core\ndomain: research\n---\n# Extra\n");
    assert.equal(loadSpecialistAgents(dir), null);
    rmSync(added);
    writeFileSync(join(dir, catalog.agents[0].source.path), "Altered profile");
    assert.equal(loadSpecialistAgents(dir), null);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("ambiguous custom aliases do not change stable-ID behavior", () => {
  const router = new AgentRouter(["first", "second"].map((id) => ({ id, name: id, aliases: ["shared"], type: "specialist", description: id, skills: [], triggers: { keywords: [id] } })));
  assert.equal(router.getAgent("shared"), undefined);
  assert.equal(router.getAgent("first")?.id, "first");
  router.addAgent({ id: "third", name: "Third", type: "specialist", description: "Custom agent", skills: [], triggers: { keywords: ["custom"] } });
  assert.equal(router.route("custom")[0]?.agent.id, "third");
});

test("host wrapper references unchanged Foundry task schema and shared loop still compiles", () => {
  const ajv = new Ajv2020({ strict: true });
  const foundry = JSON.parse(readFileSync(join(root, "foundry/contracts/task-envelope.schema.json"), "utf8"));
  const wrapper = JSON.parse(readFileSync(join(root, "agents/catalog/run-envelope.schema.json"), "utf8"));
  ajv.addSchema(foundry);
  const validate = ajv.compile(wrapper);
  assert.equal(validate({ schemaVersion: "starlight.specialist-run.v1" }), false);
  assert.ok(validate.errors?.some((error) => error.keyword === "required"));
  assert.equal(foundry.additionalProperties, false);
  assert.equal(wrapper.properties.task.$ref, foundry.$id);
  assert.equal(foundry.properties.tenantId, undefined);
  const envelope = {
    schemaVersion: "starlight.specialist-run.v1", agentId: "starlight-hermes", profileName: "starlight-hermes",
    sourceDigest: catalog.sourceDigest, tenantId: "tenant:test", projectId: "project:test", runId: "run:test", instanceId: "instance:test",
    parentTaskId: null, goalAncestry: ["goal:test"], verifierId: "checker:test",
    lease: { workItemId: "work:test", ownerId: "maker:test", token: "test-lease", expiresAt: "2026-10-18T06:00:00Z", idempotencyKey: "test-key" },
    runtime: { harness: "test-fixture", version: "1.0.0", model: "no-model-called", adapterEvidenceRef: "test://fixture" },
    task: JSON.parse(readFileSync(join(root, "foundry/designer/examples/research-agent.task-envelope.json"), "utf8")),
  };
  assert.equal(validate(envelope), true, JSON.stringify(validate.errors));
  assert.equal(validate({ ...envelope, task: { ...envelope.task, tenantId: "wrong-layer" } }), false);
  const graph = JSON.parse(readFileSync(join(root, "agents/catalog/specialist-review-loop.json"), "utf8"));
  assert.equal(compileLoopGraph(graph).ok, true);
});

test("shared specialist loop completes only with evidence and a different checker", () => {
  const graph = JSON.parse(readFileSync(join(root, "agents/catalog/specialist-review-loop.json"), "utf8"));
  const config = {
    graph, workId: "specialist-test", attemptId: "first", correlationId: "test-correlation", projectId: "test-project",
    executorActorId: "maker:test", verifierActorId: "checker:test", now: () => "2026-10-18T04:00:00Z",
  };
  assert.equal(buildLoopEngine({ ...config, verifierActorId: config.executorActorId }).ok, false);
  const steps: LoopStepInput[] = [
    { node: "admit", actor: "system:test", writeback: "test://admission" },
    { node: "make", actor: "maker:test", writeback: "test://artifact" },
    { node: "checks", actor: "system:test", writeback: "test://checks" },
    { node: "verify", actor: "checker:test", writeback: "test://verdict", verdict: "pass" },
  ];
  const state = (inputs: LoopStepInput[]) => JSON.parse(runLoopEngine(buildLoopEngine(config), inputs).at(-1)!);
  assert.equal(state(steps).completed, true);
  assert.equal(state(steps.map((step) => step.node === "verify" ? { ...step, actor: "maker:test" } : step)).completed, false);
  assert.equal(state(steps.map((step) => step.node === "make" ? { ...step, writeback: undefined } : step)).haltReason, "writeback");
  assert.equal(state(steps.map((step) => step.node === "make" ? { ...step, proposedAction: "external-send" } : step)).haltReason, "silence");
  assert.equal(evaluateLoopGraph(graph, { facts: { emptyRounds: 2 }, actorId: "maker:test", verifierActorId: "checker:test", turnsUsed: 0, costUsed: 0 }).haltReason, "empty-rounds");
});
