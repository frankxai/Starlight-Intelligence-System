#!/usr/bin/env node
/**
 * Fail-closed checks for the four-layer graph-engineering contract
 * and the compiled SI admit-verify-ship loop.
 */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function mustExist(rel) {
  if (!existsSync(join(root, rel))) errors.push(`missing ${rel}`);
}

function mustContain(rel, needles) {
  const text = readFileSync(join(root, rel), "utf8");
  for (const needle of needles) {
    if (!text.includes(needle)) errors.push(`${rel} missing required text: ${needle}`);
  }
}

mustExist("docs/graph-engineering/CONTRACT.md");
mustExist("docs/graph-engineering/loops/si-admit-verify-ship.v1.json");
mustExist("docs/graph-engineering/loops/si-admit-verify-ship/ledger.md");
mustExist("docs/graph-engineering/loops/si-admit-verify-ship/supervisor.md");
mustExist("examples/work-graph/si-admit-verify-ship.jsonl");
mustExist("examples/work-graph/product-delivery.jsonl");
mustExist("src/work-graph.ts");
mustExist("src/loop-graph.ts");
mustExist("docs/graph-engineering/loops/diamond-review.v1.json");
mustExist("docs/graph-engineering/harness/features.v1.json");

mustContain("docs/graph-engineering/CONTRACT.md", [
  "starlight.graph-engineering.v1",
  "No graph per agent",
  "No GraphRAG as fleet memory",
  "No third orchestrator",
  "si-admit-verify-ship",
  "Implemented now",
  "src/loop-graph.ts",
]);

const loop = JSON.parse(
  readFileSync(join(root, "docs/graph-engineering/loops/si-admit-verify-ship.v1.json"), "utf8"),
);
if (loop.schema !== "starlight.loop-graph.v1") errors.push("loop schema drifted");
if (loop.executorRole === loop.supervisorRole) errors.push("executor and supervisor roles must differ");
if (loop.supervisorMustDifferFromExecutor !== true) errors.push("supervisorMustDifferFromExecutor must be true");
if (!Array.isArray(loop.nodes) || loop.nodes.length < 6) errors.push("loop must compile the SI chain");
if (loop.requirements?.deployment !== false) errors.push("this loop must not require deployment");
if (loop.requirements?.verification !== true) errors.push("this loop must require verification");

const kinds = new Set(loop.nodes.map((node) => node.workGraphKind));
for (const kind of ["intent.captured", "work.admitted", "artifact.produced", "verification.passed", "work.completed"]) {
  if (!kinds.has(kind)) errors.push(`loop missing work-graph kind ${kind}`);
}

function project(rel, expectOk) {
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", "src/work-graph-cli.ts", "project", rel],
    { cwd: root, encoding: "utf8" },
  );
  const ok = result.status === 0;
  if (ok !== expectOk) {
    errors.push(`project ${rel} expected ${expectOk ? "pass" : "fail"} (exit ${result.status}): ${result.stdout || result.stderr}`);
    return;
  }
  if (expectOk) {
    const output = JSON.parse(result.stdout);
    if (!output.workItems?.[0]?.completed) errors.push(`project ${rel} did not complete`);
    if ((output.issues || []).length > 0) errors.push(`project ${rel} issued ${output.issues.length} problem(s)`);
  }
}

project("examples/work-graph/product-delivery.jsonl", true);
project("examples/work-graph/si-admit-verify-ship.jsonl", true);

const incomplete = loop.nodes
  .filter((node) => node.workGraphKind !== "work.completed" && node.workGraphKind !== "verification.passed")
  .map((node, index) =>
    JSON.stringify({
      schemaVersion: "1.0",
      eventId: `evt_incomplete_${index}`,
      workId: "work_incomplete",
      correlationId: "corr_incomplete",
      projectId: "frankxai/Starlight-Intelligence-System",
      kind: node.workGraphKind,
      source: { system: "hermes", sourceId: "validator" },
      actorId: "agent:hermes",
      occurredAt: "2026-08-24T20:00:00.000Z",
      observedAt: "2026-08-24T20:00:00.000Z",
      evidenceRefs: [`evidence://incomplete/${node.id}`],
      visibility: "internal",
      retention: "ephemeral",
      summary: node.id,
      ...(node.workGraphKind === "work.admitted"
        ? { data: { requirements: loop.requirements } }
        : {}),
    }),
  )
  .concat([
    JSON.stringify({
      schemaVersion: "1.0",
      eventId: "evt_incomplete_complete",
      workId: "work_incomplete",
      correlationId: "corr_incomplete",
      projectId: "frankxai/Starlight-Intelligence-System",
      kind: "work.completed",
      source: { system: "hermes", sourceId: "validator" },
      actorId: "agent:hermes",
      occurredAt: "2026-08-24T20:01:00.000Z",
      observedAt: "2026-08-24T20:01:00.000Z",
      evidenceRefs: ["evidence://incomplete/complete"],
      visibility: "internal",
      retention: "ephemeral",
      summary: "premature complete",
    }),
  ])
  .join("\n");

const tmp = join(root, "examples/work-graph/.incomplete-validator.jsonl");
import("node:fs").then(async (fs) => {
  fs.writeFileSync(tmp, `${incomplete}\n`, "utf8");
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", "src/work-graph-cli.ts", "project", "examples/work-graph/.incomplete-validator.jsonl"],
    { cwd: root, encoding: "utf8" },
  );
  try {
    fs.unlinkSync(tmp);
  } catch {
    // ignore
  }
  if (result.status === 0) {
    errors.push("incomplete stream must not complete");
  }

  if (errors.length) {
    console.error("INVALID");
    for (const error of errors) console.error("-", error);
    process.exit(1);
  }
  console.log(
    JSON.stringify({
      ok: true,
      contract: "docs/graph-engineering/CONTRACT.md",
      loop: loop.id,
      nodes: loop.nodes.length,
    }),
  );
});
