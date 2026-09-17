import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Resolve through package exports, not a source path or TypeScript loader.
const { FederatedRuntime, createFederationTool, createProcessRunner } =
  await import("@arcanea/starlight-intelligence-system/federation");
const { RuntimeBridge, WORKER_PROTOCOL } =
  await import("@arcanea/starlight-intelligence-system/runtime-bridge");
assert.equal(typeof RuntimeBridge, "function");
assert.equal(WORKER_PROTOCOL, "starlight.worker.v1");
assert.equal(typeof createProcessRunner, "function");

let calls = 0;
const runtime = new FederatedRuntime([{ id: "fixture", transport: "custom", capabilities: ["verify"],
  runner: async () => { calls++; return { output: "package import verified", exitCode: 0 }; },
}], { maxRuns: 1 });
const task = { id: "package-smoke", capability: "verify", prompt: "Verify exports" };
const tool = createFederationTool(runtime);
assert.equal((await tool.handle({ operation: "plan", tasks: [task] })).isError, false);
assert.equal(calls, 0);
for (let attempt = 0; attempt < 2; attempt++) {
  assert.equal((await tool.handle({ operation: "run", tasks: [task] })).isError, false);
}
assert.equal(calls, 1);
const snapshot = runtime.snapshot();
assert.equal(snapshot.submitted, 1);
assert.equal(snapshot.reservedCalls, 0);
assert.ok(!JSON.stringify(snapshot).includes(task.prompt));

const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
for (const entry of ["./federation", "./runtime-bridge"]) {
  assert.ok((await readFile(new URL(`../${pkg.exports[entry].types}`, import.meta.url), "utf8")).length > 0);
}
console.log("Federation package exports, declarations, MCP execution and deduplication verified.");
