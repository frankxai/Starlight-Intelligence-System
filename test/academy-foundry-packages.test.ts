import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { repoRootFromTestFile } from "./_lib/repo.js";
import { buildCapabilityGraph } from "../tools/foundry/lib/graph.mjs";
import { compilePackage } from "../tools/foundry/lib/compile.mjs";
import { parseFrontmatter } from "../tools/foundry/lib/frontmatter.mjs";
import { provePackage } from "../tools/foundry/lib/prove.mjs";
import {
  getContract,
  loadContractRegistry,
  validateValue,
} from "../tools/foundry/lib/schema.mjs";

const ROOT = repoRootFromTestFile(import.meta.url);
const EXAMPLES = join(ROOT, "foundry", "examples");
const CONTRACTS = join(ROOT, "foundry", "contracts");
const registry = loadContractRegistry(CONTRACTS);

const ACADEMY_SKILLS = [
  "capability-graph-architecture",
  "mission-graph-design",
  "execution-graph-engineering",
  "evidence-graph-evaluation",
  "passport-graph-projection",
  "agent-team-composition",
] as const;

const EXPERIMENTAL_AGENTS = [
  "academy-graph-steward",
  "learner-graph-navigator",
] as const;

const REQUIRED_AGENT_DENIALS = [
  "graph-merge",
  "public-release",
  "credential-write",
  "payment-write",
  "external-message",
  "permission-expansion",
  "destructive-action",
  "agent-activation",
] as const;

function json(path: string): any {
  return JSON.parse(readFileSync(path, "utf8"));
}

function example(name: string, kind: "skill" | "plugin" | "agent") {
  return {
    envelope: json(join(EXAMPLES, `${name}.task-envelope.json`)),
    pack: json(join(EXAMPLES, `${name}.${kind}-pack.json`)),
  };
}

function tempDirectory(): string {
  return mkdtempSync(join(tmpdir(), "academy-foundry-test-"));
}

function assertContract(value: any, contract: string, label: string): void {
  const result = validateValue(value, getContract(registry, contract), registry);
  assert.equal(result.valid, true, `${label}: ${JSON.stringify(result.errors)}`);
}

function compileExample(
  name: string,
  kind: "skill" | "plugin" | "agent",
  output: string,
) {
  const { envelope, pack } = example(name, kind);
  return {
    envelope,
    pack,
    compilation: compilePackage({
      root: ROOT,
      envelope,
      pack,
      output,
      graph: buildCapabilityGraph(ROOT),
      registry,
    }),
  };
}

describe("Academy Foundry source packs", () => {
  it("keeps all six Skill Packs contract-valid and aligned with their canonical source skills", () => {
    for (const skill of ACADEMY_SKILLS) {
      const { envelope, pack } = example(skill, "skill");
      assertContract(envelope, "task-envelope", `${skill} Task Envelope`);
      assertContract(pack, "skill-pack", `${skill} Skill Pack`);
      assert.equal(envelope.id, skill);
      assert.equal(pack.id, skill);
      assert.equal(envelope.kind, "skill");
      assert.equal(pack.kind, "skill");
      assert.equal(envelope.permissions.externalWrites, false);
      assert.equal(envelope.permissions.destructiveActions, false);
      assert.ok(pack.toolPolicy.deny.includes("credential-write"));
      assert.ok(pack.toolPolicy.deny.includes("payment-write"));
      assert.ok(pack.toolPolicy.deny.includes("public-release"));

      const canonical = readFileSync(
        join(ROOT, "skills", "academy", skill, "SKILL.md"),
        "utf8",
      );
      const { fields } = parseFrontmatter(canonical);
      assert.equal(fields.name, skill);
      assert.equal(fields.description, pack.description);
    }
  });

  it("compiles and proves every Academy skill without undeclared runtime evidence", () => {
    const temp = tempDirectory();
    try {
      for (const skill of ACADEMY_SKILLS) {
        const output = join(temp, skill);
        const { compilation } = compileExample(skill, "skill", output);
        assert.equal(compilation.manifest.kind, "skill");
        assertContract(compilation.manifest, "foundry-manifest", `${skill} manifest`);

        const { receipt } = provePackage({ packageDirectory: output, registry });
        assert.equal(receipt.status, "validated", `${skill}: ${receipt.unresolved.join("; ")}`);
        assert.equal(receipt.summary.failed, 0);
        assert.equal(receipt.summary.pending, 0);
        assert.equal(receipt.laneCoverage.static, "passed");
        assert.equal(receipt.laneCoverage.behavioral, "passed");
        assert.equal(receipt.laneCoverage.artifact, "passed");
      }
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("compiles and proves one authentication-free skills-only graph plugin", () => {
    const temp = tempDirectory();
    try {
      const output = join(temp, "starlight-graph-engineering");
      const { envelope, pack, compilation } = compileExample(
        "starlight-graph-engineering",
        "plugin",
        output,
      );
      assertContract(envelope, "task-envelope", "graph plugin Task Envelope");
      assertContract(pack, "plugin-pack", "graph Plugin Pack");
      assert.equal(pack.authentication, "none");
      assert.equal(Object.hasOwn(pack, "mcpServerUrl"), false);
      assert.equal(compilation.manifest.kind, "plugin");

      const manifest = json(join(output, "plugin", ".codex-plugin", "plugin.json"));
      assert.equal(manifest.name, "starlight-graph-engineering");
      assert.equal(manifest.skills, "./skills/");
      assert.equal(Object.hasOwn(manifest, "mcpServers"), false);
      assert.equal(Object.hasOwn(manifest, "apps"), false);
      assert.equal(Object.hasOwn(manifest, "hooks"), false);

      for (const skill of ACADEMY_SKILLS) {
        for (const file of ["SKILL.md", join("agents", "openai.yaml")]) {
          assert.deepEqual(
            readFileSync(join(output, "plugin", "skills", skill, file)),
            readFileSync(join(ROOT, "skills", "academy", skill, file)),
            `${skill}/${file} did not compile byte-exactly`,
          );
        }
      }

      const { receipt } = provePackage({ packageDirectory: output, registry });
      assert.equal(receipt.status, "validated", receipt.unresolved.join("; "));
      assert.equal(receipt.summary.failed, 0);
      assert.equal(receipt.summary.pending, 0);
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("compiles both Agent Packs but keeps them inactive and experimental without independent proof", () => {
    const temp = tempDirectory();
    try {
      const graph = buildCapabilityGraph(ROOT);
      for (const agent of EXPERIMENTAL_AGENTS) {
        assert.equal(
          graph.nodes.some((node: any) => node.id === `agent:${agent}`),
          false,
          `${agent} must remain absent from the active agent graph`,
        );

        const output = join(temp, agent);
        const { envelope, pack, compilation } = compileExample(agent, "agent", output);
        assertContract(envelope, "task-envelope", `${agent} Task Envelope`);
        assertContract(pack, "agent-pack", `${agent} Agent Pack`);
        assert.equal(compilation.manifest.kind, "agent");
        assert.equal(envelope.permissions.externalWrites, false);
        assert.equal(envelope.permissions.destructiveActions, false);
        assert.equal(envelope.autonomy.level, "draft");
        assert.deepEqual(
          [...envelope.autonomy.approvalRequiredBefore].sort(),
          [
            "destructive-action",
            "external-write",
            "financial-commitment",
            "permission-expansion",
            "public-release",
            "substrate-change",
          ],
        );
        for (const denial of REQUIRED_AGENT_DENIALS) {
          assert.ok(pack.toolPolicy.deny.includes(denial), `${agent} must deny ${denial}`);
        }
        assert.ok(
          Object.entries(pack.necessity)
            .filter(([key]) => key !== "rationale")
            .some(([, value]) => value === true),
          `${agent} must prove a durable agent boundary`,
        );

        const policy = json(join(output, "agent", "policy.json"));
        assert.deepEqual(policy.toolPolicy.deny, pack.toolPolicy.deny);
        assert.deepEqual(policy.memoryContract, pack.memoryContract);

        const { receipt } = provePackage({ packageDirectory: output, registry });
        assert.equal(receipt.status, "experimental");
        assert.equal(receipt.summary.failed, 0);
        assert.ok(receipt.summary.pending >= 3);
        assert.equal(receipt.laneCoverage.behavioral, "pending");
        assert.equal(receipt.laneCoverage.security, "pending");
        assert.equal(receipt.laneCoverage.drift, "pending");
        assert.ok(receipt.unresolved.some((entry: string) => entry.startsWith("human-activation-decision:")));
        assert.ok(receipt.unresolved.some((entry: string) => entry.startsWith("independent-security-review:")));
        assert.ok(receipt.unresolved.some((entry: string) => entry.startsWith("independent-drift-review:")));
      }
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });
});
