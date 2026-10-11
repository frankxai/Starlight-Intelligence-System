/** Controlled local process demonstration. No model API, spend, or cloud activation. */
import { mkdirSync, readFileSync, appendFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createQueenProcessRunner, queenDigest, runQueenSession, type QueenSessionLane, type QueenSessionMission } from "../../src/queen-session.js";

const root = fileURLToPath(new URL("../..", import.meta.url));
const mission: QueenSessionMission = {
  id: `process-proof-${Date.now()}`,
  objective: "Write a handoff for the next Starlight operator.",
  acceptance: ["Names the next action", "Labels runtime evidence honestly"],
  capabilities: ["read-scoped-context", "return-text"], assumptions: [],
  maxCostUsd: 0, timeoutMs: 2000, maxOutputBytes: 20_000, maxPromptBytes: 60_000,
};
const directory = join(root, "private", "queen-sessions", mission.id);
mkdirSync(directory, { recursive: true, mode: 0o700 });
const skillPath = "skills/orchestration/multi-agent-coordination/SKILL.md";
const content = readFileSync(join(root, skillPath), "utf8");
const program = `
let input=''; process.stdin.setEncoding('utf8'); process.stdin.on('data', c=>input+=c);
process.stdin.on('end',()=>{
 const task=JSON.parse(input);
 if(task.role==='maker') process.stdout.write(JSON.stringify({
   artifact:'# Starlight handoff\\n\\nNext action: connect an admitted provider runner.\\n\\nEvidence: this is a controlled process fixture. No model or cloud worker was activated.', dissent:[]
 }));
 else process.stdout.write(JSON.stringify({artifactSha256:task.artifact.sha256,
   decisions:task.acceptance.map((criterion,i)=>({criterion,
     verdict:(i===0?task.artifact.content.includes('Next action:'):task.artifact.content.includes('controlled process fixture'))?'pass':'fail',
     evidence:i===0?'The artifact names the next action.':'The artifact explicitly identifies a controlled process fixture.'})),dissent:[]}));
});`;
function lane(actorId: string): QueenSessionLane {
  return {
    actorId, executionIdentity: `controlled-process:${actorId}`, provider: "node-fixture", identityEvidenceRef: `fixture:${actorId}`,
    capabilities: [...mission.capabilities], maxCostUsd: 0,
    context: {
      packId: `pack-${actorId}`, taskId: mission.id, correlationId: mission.id, targetHarness: "node-fixture", repoRef: "local-repository", routeId: actorId, riskClass: "low", tokenBudget: 10_000,
      atoms: [{ id: "coordination", sourceRef: skillPath, sourceKind: "SKILL.md", owner: "starlight", scope: "mission", activation: "explicit", contentHash: queenDigest(content), tokenEstimate: Math.ceil(content.length / 3), lifecycle: "active", generated: false }],
      hostBindings: [{ atomId: "coordination", hostMessageRole: "untrusted-reference-data" }],
    },
    sources: [{ atomId: "coordination", content, allowedActors: [actorId] }],
    runner: createQueenProcessRunner({ command: process.execPath, args: ["-e", program], cwd: directory, env: {}, maxOutputBytes: 20_000 }),
  };
}
const result = await runQueenSession(mission, {
  maker: lane("starlight-architect"), checker: lane("starlight-sentinel"),
  // This fixture authorizes only the two fixed no-network Node programs above.
  async admit(request) {
    const allowed = request.maxCostUsd === 0 && request.executionIdentity.startsWith("controlled-process:");
    const receiptRef = `fixture-admission:${request.callId}`;
    appendFileSync(join(directory, "admissions.jsonl"), JSON.stringify({ ...request, allowed, receiptRef }) + "\n", { mode: 0o600 });
    return { allowed, receiptRef };
  },
  async record(receipt) { appendFileSync(join(directory, "receipts.jsonl"), JSON.stringify(receipt) + "\n", { mode: 0o600 }); },
});
writeFileSync(join(directory, "result.json"), JSON.stringify(result, null, 2), { mode: 0o600 });
if (result.artifact) writeFileSync(join(directory, "artifact.md"), result.artifact.content, { mode: 0o600 });
console.log(JSON.stringify({ mode: "controlled-process-fixture", status: result.status, receiptDirectory: directory, artifactSha256: result.artifact?.sha256, providerDiversity: result.providerDiversity, usage: result.usage }, null, 2));
if (result.status !== "verified") process.exitCode = 1;
