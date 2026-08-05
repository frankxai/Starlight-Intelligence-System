import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, relative, resolve } from "node:path";
import { hashTree, readJson, resolveInside, writeJson } from "./io.mjs";
import { assertValid, getContract } from "./schema.mjs";
import { inspectCompiledPackage } from "./compile.mjs";

function result(test, status, detail, startedAt) {
  return {
    id: test.id,
    lane: test.lane,
    type: test.type,
    required: test.required,
    status,
    durationMs: Date.now() - startedAt,
    detail,
  };
}

function executeCompletionTest(test, context) {
  const startedAt = Date.now();
  const { packageRoot, executeCommands, allowedTools, evidence } = context;
  const supplied = evidence?.tests?.[test.id];

  if (test.type === "manual" || test.type === "judge") {
    if (!supplied) return result(test, "pending", "Independent evidence has not been supplied.", startedAt);
    if (test.type === "judge" && supplied.producerIndependent !== true) {
      return result(test, "failed", "Judge evidence is not marked producer-independent.", startedAt);
    }
    const status = ["passed", "failed"].includes(supplied.status) ? supplied.status : "pending";
    return result(test, status, supplied.detail ?? "Evidence supplied.", startedAt);
  }

  if (test.type === "file-exists") {
    if (!test.path) return result(test, "failed", "file-exists test is missing path.", startedAt);
    const path = resolveInside(packageRoot, test.path);
    return existsSync(path)
      ? result(test, "passed", `${test.path} exists.`, startedAt)
      : result(test, "failed", `${test.path} does not exist.`, startedAt);
  }

  if (test.type === "json-valid") {
    if (!test.path) return result(test, "failed", "json-valid test is missing path.", startedAt);
    const path = resolveInside(packageRoot, test.path);
    try {
      JSON.parse(readFileSync(path, "utf8"));
      return result(test, "passed", `${test.path} contains valid JSON.`, startedAt);
    } catch {
      return result(test, "failed", `${test.path} is missing or invalid JSON.`, startedAt);
    }
  }

  if (test.type === "contains") {
    if (!test.path || test.value === undefined) {
      return result(test, "failed", "contains test requires path and value.", startedAt);
    }
    const path = resolveInside(packageRoot, test.path);
    if (!existsSync(path)) return result(test, "failed", `${test.path} does not exist.`, startedAt);
    const matched = readFileSync(path, "utf8").includes(test.value);
    return result(test, matched ? "passed" : "failed", matched ? "Expected content found." : "Expected content not found.", startedAt);
  }

  if (test.type === "command") {
    if (!Array.isArray(test.command) || test.command.length === 0) {
      return result(test, "failed", "command test has no argv.", startedAt);
    }
    if (!executeCommands) {
      return result(test, test.required ? "pending" : "skipped", "Command execution requires --execute-commands.", startedAt);
    }
    const [program, ...args] = test.command;
    if (!allowedTools.has("*") && !allowedTools.has(program)) {
      return result(test, "failed", `Executable "${program}" is not permitted by the Task Envelope.`, startedAt);
    }
    const execution = spawnSync(program, args, {
      cwd: packageRoot,
      encoding: "utf8",
      shell: false,
      timeout: test.timeoutMs ?? 120000,
      maxBuffer: 1024 * 1024,
    });
    const detail = execution.error
      ? execution.error.message
      : `exit=${execution.status}; stdout=${(execution.stdout ?? "").slice(0, 1000)}; stderr=${(execution.stderr ?? "").slice(0, 1000)}`;
    return result(test, execution.status === 0 ? "passed" : "failed", detail, startedAt);
  }

  return result(test, "failed", `Unsupported test type: ${test.type}`, startedAt);
}

function coverageForLane(lane, tests, requiredLanes) {
  if (!requiredLanes.includes(lane)) return "not-required";
  const relevant = tests.filter((test) => test.lane === lane);
  if (relevant.some((test) => test.status === "failed")) return "failed";
  if (relevant.some((test) => test.status === "pending" || test.status === "skipped")) return "pending";
  if (relevant.some((test) => test.status === "passed")) return "passed";
  return "pending";
}

function deriveStatus(tests, laneCoverage) {
  const requiredFailures = tests.filter((test) => test.required && test.status === "failed");
  if (requiredFailures.some((test) => test.lane === "security")) return "rejected";
  if (requiredFailures.length > 0 || Object.values(laneCoverage).includes("failed")) return "revise";
  if (
    tests.some((test) => test.required && ["pending", "skipped"].includes(test.status)) ||
    Object.values(laneCoverage).includes("pending")
  ) {
    return "experimental";
  }
  return "validated";
}

export function provePackage({
  packageDirectory,
  output,
  registry,
  executeCommands = false,
  evidencePath,
}) {
  const { root: packageRoot, manifest } = inspectCompiledPackage(packageDirectory);
  assertValid(
    manifest,
    getContract(registry, "foundry-manifest"),
    registry,
    "Foundry Manifest",
  );
  const envelope = readJson(resolveInside(packageRoot, manifest.sources.envelope));
  const pack = readJson(resolveInside(packageRoot, manifest.sources.pack));
  assertValid(envelope, getContract(registry, "task-envelope"), registry, "Task Envelope");
  assertValid(pack, getContract(registry, `${manifest.kind}-pack`), registry, `${manifest.kind} pack`);

  const evidence = evidencePath ? readJson(resolve(evidencePath)) : null;
  const builtIns = [
    {
      id: "foundry-manifest-valid",
      lane: "static",
      type: "json-valid",
      required: true,
      path: "foundry-manifest.json",
    },
    {
      id: "task-envelope-valid",
      lane: "static",
      type: "json-valid",
      required: true,
      path: "task-envelope.json",
    },
    {
      id: "artifact-digests",
      lane: "artifact",
      type: "artifact-integrity",
      required: true,
      instructions: "Recomputed by the Foundry prover.",
    },
  ];

  const testResults = [];
  for (const test of builtIns.slice(0, 2)) {
    testResults.push(executeCompletionTest(test, {
      packageRoot,
      executeCommands,
      allowedTools: new Set(envelope.permissions.tools.allow),
      evidence,
    }));
  }

  const receiptRelativePath = output
    ? relative(packageRoot, resolve(output)).replaceAll("\\", "/")
    : "evidence-receipt.json";
  const artifacts = hashTree(packageRoot, {
    exclude: ["evidence-receipt.json", receiptRelativePath],
  });
  const expected = new Map((manifest.artifacts ?? []).map((entry) => [entry.path, entry.sha256]));
  const current = new Map(
    artifacts
      .filter((entry) => entry.path !== "foundry-manifest.json")
      .map((entry) => [entry.path, entry.sha256]),
  );
  const digestMismatches = [
    ...[...expected.entries()]
      .filter(([path, sha256]) => current.get(path) !== sha256)
      .map(([path]) => path),
    ...[...current.keys()].filter((path) => !expected.has(path)),
  ];
  testResults.push({
    id: "artifact-digests",
    lane: "artifact",
    type: "artifact-integrity",
    required: true,
    status: digestMismatches.length === 0 ? "passed" : "failed",
    durationMs: 0,
    detail: digestMismatches.length === 0
      ? "All compiler-recorded artifact digests match."
      : `Missing, changed, or unexpected artifacts: ${digestMismatches.join(", ")}`,
  });

  for (const test of envelope.completionTests) {
    testResults.push(executeCompletionTest(test, {
      packageRoot,
      executeCommands,
      allowedTools: new Set(envelope.permissions.tools.allow),
      evidence,
    }));
  }

  const lanes = ["static", "behavioral", "factual", "artifact", "taste", "security", "economic", "drift"];
  const laneCoverage = Object.fromEntries(
    lanes.map((lane) => [lane, coverageForLane(lane, testResults, envelope.evidencePolicy.requiredLanes)]),
  );
  if (envelope.evidencePolicy.requiredLanes.includes("taste")) {
    const minimumJudges = envelope.evidencePolicy.minimumIndependentJudges ?? 1;
    const passedJudges = testResults.filter(
      (test) => test.lane === "taste" && test.type === "judge" && test.status === "passed",
    ).length;
    if (minimumJudges < 1 || passedJudges < minimumJudges) laneCoverage.taste = "pending";
  }
  const status = deriveStatus(testResults, laneCoverage);
  const summary = {
    passed: testResults.filter((test) => test.status === "passed").length,
    failed: testResults.filter((test) => test.status === "failed").length,
    pending: testResults.filter((test) => test.status === "pending").length,
    skipped: testResults.filter((test) => test.status === "skipped").length,
  };
  const unresolved = testResults
    .filter((test) => test.required && test.status !== "passed")
    .map((test) => `${test.id}: ${test.detail}`);
  const receipt = {
    $schema: "https://starlightintelligence.org/schemas/foundry/evidence-receipt.schema.json",
    schemaVersion: "1.0.0",
    receiptId: `${manifest.packageId}-${Date.now()}`,
    packageId: manifest.packageId,
    packageVersion: manifest.packageVersion,
    createdAt: new Date().toISOString(),
    status,
    summary,
    tests: testResults,
    laneCoverage,
    artifacts,
    unresolved,
  };
  assertValid(receipt, getContract(registry, "evidence-receipt"), registry, "Evidence Receipt");
  const receiptPath = output ? resolve(output) : join(packageRoot, "evidence-receipt.json");
  writeJson(receiptPath, receipt);
  return { receipt, output: receiptPath };
}
