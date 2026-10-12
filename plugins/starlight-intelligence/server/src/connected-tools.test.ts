import assert from "node:assert/strict";
import test from "node:test";
import { catalogInput, getCapabilityCatalog, prepareConnectedWorkflow, workflowInput } from "./connected-tools.js";

test("brand scope preserves distinct workflows and never invents connected accounts", () => {
  const arcanea = getCapabilityCatalog({ brand: "arcanea" });
  assert.deepEqual(arcanea.capabilities, []);
  assert.deepEqual(arcanea.workflows.map((item) => item.id), ["visual-release", "world-production"]);
  assert.ok(getCapabilityCatalog({ query: "practice" }).capabilities.some((item) => item.id === "learning"));
  assert.ok(getCapabilityCatalog().capabilities.find((item) => item.id === "portfolio")?.verification.includes("404"));
});

test("prepared packets retain missing evidence and reject cross-brand workflows", () => {
  const packet = prepareConnectedWorkflow({ workflow_id: "visual-release", brand: "frankx" });
  assert.equal(packet.executes, false);
  assert.equal(packet.state, "prepared");
  assert.equal(packet.evidence.commit_sha, null);
  assert.equal(packet.evidence.deployment_url, null);
  assert.equal(packet.title, packet.workflow.name);
  assert.ok(packet.source_receipts.every((item) => /^[a-f0-9]{40}$/.test(item.commit)));
  assert.throws(() => prepareConnectedWorkflow({ workflow_id: "world-production", brand: "starlight" }));
});

test("credentials, publication authority and arbitrary targets cannot enter preparation", () => {
  assert.equal(workflowInput.safeParse({ workflow_id: "visual-release", brand: "starlight", approved: true }).success, false);
  assert.equal(catalogInput.safeParse({ token: "secret" }).success, false);
  assert.equal(catalogInput.safeParse({ query: "x".repeat(201) }).success, false);
});
