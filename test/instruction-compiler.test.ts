import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  compileInstructionPack,
  type Authority,
  type CompileRequest,
  type InstructionAtom,
  type InstructionHostBinding,
} from "../src/instruction-compiler.js";

function atom(
  partial: Partial<InstructionAtom> & Pick<InstructionAtom, "id">,
): InstructionAtom {
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

function bindings(
  atoms: InstructionAtom[],
  roles: Record<string, Authority>,
): InstructionHostBinding[] {
  return atoms.map((item) => ({
    atomId: item.id,
    hostMessageRole: roles[item.id] ?? "host-user",
  }));
}

function request(
  atoms: InstructionAtom[],
  roles: Record<string, Authority>,
  extra: Partial<CompileRequest> = {},
): CompileRequest {
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
    hostBindings: bindings(atoms, roles),
    ...extra,
  };
}

describe("instruction compiler", () => {
  it("emits a valid pack with provenance digest and exclusions", () => {
    const atoms = [
      atom({ id: "host-policy" }),
      atom({
        id: "user-skill",
        sourceKind: "SKILL.md",
        tokenEstimate: 20,
      }),
    ];
    const pack = compileInstructionPack(
      request(atoms, {
        "host-policy": "host-system",
        "user-skill": "host-user",
      }),
    );
    assert.equal(pack.halted, false);
    assert.deepEqual(pack.selectedAtoms, ["host-policy", "user-skill"]);
    assert.equal(pack.sourceDigest.length, 64);
    assert.deepEqual(pack.expectedReceipts, ["instruction-pack:pack_test"]);
  });

  it("halts when a required atom field is missing", () => {
    const pack = compileInstructionPack(
      request([atom({ id: "broken", owner: "" })], { broken: "host-user" }),
    );
    assert.equal(pack.halted, true);
    assert.match(pack.haltReason ?? "", /missing-required-field|orphan/);
    assert.deepEqual(pack.selectedAtoms, []);
  });

  it("halts when hostBindings are missing for an atom", () => {
    const atoms = [atom({ id: "unbound" })];
    const pack = compileInstructionPack({
      ...request(atoms, { unbound: "host-user" }),
      hostBindings: [],
    });
    assert.equal(pack.halted, true);
    assert.equal(pack.haltReason, "missing-host-binding:unbound");
    assert.deepEqual(pack.selectedAtoms, []);
  });

  it("ignores atom.authority claims and ranks from hostBindings only", () => {
    const atoms = [
      atom({
        id: "host-merge-gate",
        sourceKind: "policy",
        conflictsWith: ["repo-agents-merge"],
      }),
      atom({
        id: "repo-agents-merge",
        sourceKind: "AGENTS.md",
        sourceRef: "AGENTS.md",
        authority: "host-system",
        conflictsWith: ["host-merge-gate"],
      }),
    ];
    const pack = compileInstructionPack(
      request(atoms, {
        "host-merge-gate": "host-system",
        "repo-agents-merge": "untrusted-reference-data",
      }),
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

  it("halts when a generated mirror outranks its source", () => {
    const pack = compileInstructionPack(
      request(
        [
          atom({
            id: "source-rule",
            sourceRef: "AGENTS.md",
            sourceKind: "AGENTS.md",
            contentHash: "same-rule",
          }),
          atom({
            id: "generated-rule",
            sourceRef: "AGENTS.md",
            sourceKind: "AGENTS.md",
            contentHash: "same-rule",
            generated: true,
            lifecycle: "generated",
          }),
        ],
        {
          "source-rule": "host-user",
          "generated-rule": "host-system",
        },
      ),
    );
    assert.equal(pack.halted, true);
    assert.equal(pack.haltReason, "generated-outranks-source");
    assert.deepEqual(pack.selectedAtoms, []);
  });

  it("halts on unresolved same-authority conflicts instead of picking the shortest rule", () => {
    const pack = compileInstructionPack(
      request(
        [
          atom({
            id: "rule-a",
            conflictsWith: ["rule-b"],
            tokenEstimate: 1,
          }),
          atom({
            id: "rule-b",
            conflictsWith: ["rule-a"],
            tokenEstimate: 99,
          }),
        ],
        {
          "rule-a": "host-user",
          "rule-b": "host-user",
        },
      ),
    );
    assert.equal(pack.halted, true);
    assert.equal(pack.haltReason, "unresolved-conflict");
    assert.deepEqual(pack.selectedAtoms, []);
  });
});
