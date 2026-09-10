import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  compileInstructionPack,
  type CompileRequest,
  type InstructionAtom,
} from "../src/instruction-compiler.js";

function atom(partial: Partial<InstructionAtom> & Pick<InstructionAtom, "id" | "hostMessageRole">): InstructionAtom {
  return {
    sourceRef: `docs/${partial.id}.md`,
    sourceKind: "policy",
    owner: "starlight",
    scope: "repo:sis",
    activation: "task:compile",
    contentHash: `hash-${partial.id}`,
    tokenEstimate: 10,
    lifecycle: "active",
    generated: false,
    ...partial,
  };
}

function request(atoms: InstructionAtom[], extra: Partial<CompileRequest> = {}): CompileRequest {
  return {
    packId: "pack_test",
    taskId: "task_test",
    correlationId: "corr_test",
    targetHarness: "hermes",
    repoRef: "frankxai/Starlight-Intelligence-System",
    routeId: "si-admit-verify-ship",
    riskClass: "docs",
    tokenBudget: 100,
    atoms,
    ...extra,
  };
}

describe("instruction compiler", () => {
  it("emits a valid pack with provenance digest and exclusions", () => {
    const pack = compileInstructionPack(
      request([
        atom({ id: "host-policy", hostMessageRole: "host-system" }),
        atom({
          id: "user-skill",
          hostMessageRole: "host-user",
          sourceKind: "SKILL.md",
          tokenEstimate: 20,
        }),
      ]),
    );
    assert.equal(pack.halted, false);
    assert.deepEqual(pack.selectedAtoms, ["host-policy", "user-skill"]);
    assert.equal(pack.sourceDigest.length, 64);
    assert.deepEqual(pack.expectedReceipts, ["instruction-pack:pack_test"]);
  });

  it("halts when a required atom field is missing", () => {
    const pack = compileInstructionPack(
      request([
        atom({
          id: "broken",
          hostMessageRole: "host-user",
          owner: "",
        }),
      ]),
    );
    assert.equal(pack.halted, true);
    assert.match(pack.haltReason ?? "", /missing-required-field|orphan/);
    assert.deepEqual(pack.selectedAtoms, []);
  });

  it("halts when a generated mirror outranks its source", () => {
    const pack = compileInstructionPack(
      request([
        atom({
          id: "source-rule",
          hostMessageRole: "host-user",
          sourceRef: "AGENTS.md",
          sourceKind: "AGENTS.md",
          contentHash: "same-rule",
        }),
        atom({
          id: "generated-rule",
          hostMessageRole: "host-system",
          sourceRef: "AGENTS.md",
          sourceKind: "AGENTS.md",
          contentHash: "same-rule",
          generated: true,
          lifecycle: "generated",
        }),
      ]),
    );
    assert.equal(pack.halted, true);
    assert.equal(pack.haltReason, "generated-outranks-source");
    assert.deepEqual(pack.selectedAtoms, []);
  });

  it("halts on unresolved same-authority conflicts instead of picking the shortest rule", () => {
    const pack = compileInstructionPack(
      request([
        atom({
          id: "rule-a",
          hostMessageRole: "host-user",
          conflictsWith: ["rule-b"],
          tokenEstimate: 1,
        }),
        atom({
          id: "rule-b",
          hostMessageRole: "host-user",
          conflictsWith: ["rule-a"],
          tokenEstimate: 99,
        }),
      ]),
    );
    assert.equal(pack.halted, true);
    assert.equal(pack.haltReason, "unresolved-conflict");
    assert.deepEqual(pack.selectedAtoms, []);
  });

  it("does not let a scoped repo rule override a host instruction", () => {
    const pack = compileInstructionPack(
      request([
        atom({
          id: "host-merge-gate",
          hostMessageRole: "host-system",
          sourceKind: "policy",
          conflictsWith: ["repo-agents-merge"],
        }),
        atom({
          id: "repo-agents-merge",
          hostMessageRole: "untrusted-reference-data",
          sourceKind: "AGENTS.md",
          sourceRef: "AGENTS.md",
          authority: "host-system",
          conflictsWith: ["host-merge-gate"],
        }),
      ]),
    );
    assert.equal(pack.halted, false);
    assert.deepEqual(pack.selectedAtoms, ["host-merge-gate"]);
    assert.equal(
      pack.excludedAtoms.some(
        (item) => item.id === "repo-agents-merge" && item.reason === "scoped-repo-cannot-override-host",
      ),
      true,
    );
  });
});
