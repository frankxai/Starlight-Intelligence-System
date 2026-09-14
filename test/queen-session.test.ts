import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createQueenProcessRunner, queenDigest, runQueenSession, type QueenSessionHost, type QueenSessionLane, type QueenSessionMission } from "../src/queen-session.js";
import type { AgentRunner } from "../src/swarm.js";

const fixtureProgram = `
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => input += c);
process.stdin.on('end', () => {
  const task = JSON.parse(input);
  if (task.role === 'maker') {
    process.stdout.write(JSON.stringify({ artifact: 'A working Starlight artifact with an explicit handoff.', dissent: [] }));
  } else {
    process.stdout.write(JSON.stringify({ artifactSha256: task.artifact.sha256,
      decisions: task.acceptance.map(criterion => ({ criterion, verdict: 'pass', evidence: 'The supplied artifact contains an explicit handoff.' })), dissent: [] }));
  }
});`;

function setup(): { mission: QueenSessionMission; host: QueenSessionHost; admissions: string[] } {
  const mission: QueenSessionMission = {
    id: "queen-session-fixture", objective: "Produce a useful handoff artifact.", acceptance: ["Includes an explicit handoff"],
    capabilities: ["read-scoped-context", "return-text"], assumptions: [{ statement: "The artifact is intended for a technical reader.", disposition: "reversible" }],
    maxCostUsd: 0, timeoutMs: 2000, maxOutputBytes: 30_000, maxPromptBytes: 60_000,
  };
  const skillPath = "skills/orchestration/multi-agent-coordination/SKILL.md";
  const content = readFileSync(new URL(`../${skillPath}`, import.meta.url), "utf8");
  const lane = (actorId: string): QueenSessionLane => ({
    actorId, executionIdentity: `fixture-process:${actorId}`, provider: "controlled-node-fixture", identityEvidenceRef: `fixture:${actorId}`,
    capabilities: [...mission.capabilities], maxCostUsd: 0,
    context: { packId: `pack-${actorId}`, taskId: mission.id, correlationId: mission.id, targetHarness: "node-fixture", repoRef: "fixture:main", routeId: actorId, riskClass: "low", tokenBudget: 12_000,
      atoms: [{ id: "coordination-skill", sourceRef: skillPath, sourceKind: "SKILL.md", owner: "starlight", scope: "mission", activation: "manual", contentHash: queenDigest(content), tokenEstimate: Math.ceil(content.length / 3), lifecycle: "active", generated: false }],
      hostBindings: [{ atomId: "coordination-skill", hostMessageRole: "untrusted-reference-data" }],
    },
    sources: [{ atomId: "coordination-skill", content, allowedActors: [actorId] }],
    runner: createQueenProcessRunner({ command: process.execPath, args: ["-e", fixtureProgram], cwd: fileURLToPath(new URL("..", import.meta.url)), env: {}, maxOutputBytes: 30_000 }),
  });
  const admissions: string[] = [];
  return { mission, admissions, host: {
    maker: lane("starlight-architect"), checker: lane("starlight-sentinel"),
    async admit(request) { admissions.push(request.role); return { allowed: true, receiptRef: `fixture-admission:${request.callId}` }; },
    async record() {},
  } };
}

function reviewer(change: (review: Record<string, unknown>) => void): AgentRunner {
  return async (task) => {
    const input = JSON.parse(task.prompt);
    const review = { artifactSha256: input.artifact.sha256, decisions: input.acceptance.map((criterion: string) => ({ criterion, verdict: "pass", evidence: "Observed in artifact" })), dissent: [] };
    change(review);
    return { output: JSON.stringify(review), exitCode: 0 };
  };
}

test("executes two real isolated Node processes with current repository skill content", async () => {
  const { mission, host, admissions } = setup();
  const seen: unknown[] = []; host.record = async (receipt) => { seen.push(receipt); };
  const result = await runQueenSession(mission, host);
  assert.equal(result.status, "verified");
  assert.match(result.artifact!.content, /explicit handoff/);
  assert.equal(result.artifact!.sha256, queenDigest(result.artifact!.content));
  assert.deepEqual(admissions, ["maker", "checker"]);
  assert.equal(result.usage.status, "unknown");
  assert.equal(result.providerDiversity, false);
  assert.deepEqual(result.receipts.map((r) => r.sequence), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(seen.length, 8);
  assert.ok(!JSON.stringify(seen).includes(result.artifact!.content));
  assert.ok(!JSON.stringify(seen).includes(host.maker.sources[0].content));
});

test("refuses a missing runner without launching another runtime", async () => {
  const { mission, host, admissions } = setup(); host.maker.runner = undefined as unknown as AgentRunner;
  assert.equal((await runQueenSession(mission, host)).status, "blocked"); assert.deepEqual(admissions, []);
});

test("same execution identity cannot review itself under a new name", async () => {
  const { mission, host, admissions } = setup(); host.checker.executionIdentity = host.maker.executionIdentity;
  assert.equal((await runQueenSession(mission, host)).status, "blocked"); assert.deepEqual(admissions, []);
});

test("resolves reversible assumptions but stops for material missing evidence", async () => {
  const { mission, host, admissions } = setup(); mission.assumptions[0].disposition = "needs-evidence";
  assert.match((await runQueenSession(mission, host)).reason, /material ambiguity/); assert.deepEqual(admissions, []);
});

test("the two reservations must fit the finite mission ceiling", async () => {
  const { mission, host, admissions } = setup(); host.maker.maxCostUsd = 1;
  assert.match((await runQueenSession(mission, host)).reason, /budget/); assert.deepEqual(admissions, []);
  mission.maxCostUsd = NaN;
  assert.equal((await runQueenSession(mission, host)).status, "blocked");
});

test("changed skill bytes and denied memory ACLs block before admission", async () => {
  const first = setup(); first.host.maker.sources[0].content += "corrupted";
  assert.match((await runQueenSession(first.mission, first.host)).reason, /hash mismatch/); assert.deepEqual(first.admissions, []);
  const second = setup(); second.host.maker.sources[0].allowedActors = ["another-agent"];
  assert.match((await runQueenSession(second.mission, second.host)).reason, /access denied/); assert.deepEqual(second.admissions, []);
});

test("context conflicts and token overrides cannot pass into execution", async () => {
  const first = setup(); first.host.maker.context.tokenBudget = 0;
  assert.match((await runQueenSession(first.mission, first.host)).reason, /over-token-budget/);
  first.host.maker.context.admissionOverride = true;
  assert.match((await runQueenSession(first.mission, first.host)).reason, /cannot be overridden/);
  assert.deepEqual(first.admissions, []);
});

test("host admission is required again before the checker starts", async () => {
  const { mission, host } = setup(); let calls = 0;
  host.admit = async () => ({ allowed: ++calls === 1, receiptRef: "fixture:admission" });
  const result = await runQueenSession(mission, host);
  assert.equal(result.status, "blocked"); assert.equal(calls, 2); assert.ok(result.artifact);
  assert.equal(result.receipts.filter((r) => r.event === "started").length, 1);
});

test("ignored abort settles unresolved, preserves reservation and never starts checker", async () => {
  const { mission, host, admissions } = setup(); mission.timeoutMs = 20; mission.maxCostUsd = 1; host.maker.maxCostUsd = 1;
  host.maker.runner = async () => new Promise(() => {});
  const result = await runQueenSession(mission, host);
  assert.equal(result.status, "unresolved"); assert.equal(result.usage.reservedCeilingUsd, 1); assert.deepEqual(admissions, ["maker"]);
});

test("forged artifact hash cannot be promoted", async () => {
  const { mission, host } = setup(); host.checker.runner = reviewer((r) => { r.artifactSha256 = "0".repeat(64); });
  assert.equal((await runQueenSession(mission, host)).status, "review-failed");
});

test("missing and duplicate criterion verdicts cannot be promoted", async () => {
  const { mission, host } = setup(); mission.acceptance.push("Contains no invented measurements");
  host.checker.runner = reviewer((r) => { const rows = r.decisions as unknown[]; r.decisions = [rows[0], rows[0]]; });
  assert.equal((await runQueenSession(mission, host)).status, "review-failed");
});

test("Queen preserves checker dissent and refuses false consensus", async () => {
  const { mission, host } = setup(); host.checker.runner = reviewer((r) => { r.dissent = ["The artifact needs an example before release."]; });
  const result = await runQueenSession(mission, host);
  assert.equal(result.status, "review-failed"); assert.deepEqual(result.dissent, ["The artifact needs an example before release."]);
});

test("process failures do not leak stderr or count as verified work", async () => {
  const { mission, host } = setup();
  host.maker.runner = createQueenProcessRunner({ command: process.execPath, args: ["-e", "process.stderr.write('private-error-marker'); process.exit(7)"], cwd: process.cwd(), env: {}, maxOutputBytes: 100 });
  const result = await runQueenSession(mission, host);
  assert.equal(result.status, "failed"); assert.ok(!JSON.stringify(result).includes("private-error-marker"));
});

test("output and prompt byte ceilings stop oversized work", async () => {
  const first = setup(); first.host.maker.runner = async () => ({ output: "x".repeat(31_000), exitCode: 0 });
  assert.equal((await runQueenSession(first.mission, first.host)).status, "failed");
  const second = setup(); second.mission.maxPromptBytes = 1;
  assert.equal((await runQueenSession(second.mission, second.host)).status, "blocked"); assert.deepEqual(second.admissions, []);
});

test("a persistence failure prevents the next external effect", async () => {
  const { mission, host, admissions } = setup(); host.record = async () => { throw new Error("store offline"); };
  await assert.rejects(runQueenSession(mission, host), /store offline/); assert.deepEqual(admissions, []);
});
