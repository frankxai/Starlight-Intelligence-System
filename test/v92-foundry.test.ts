import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { repoRootFromTestFile } from "./_lib/repo.js";
import { buildCapabilityGraph, resolveCapabilities } from "../tools/foundry/lib/graph.mjs";
import { compilePackage } from "../tools/foundry/lib/compile.mjs";
import { provePackage } from "../tools/foundry/lib/prove.mjs";
import { proposeEvolution } from "../tools/foundry/lib/evolve.mjs";
import {
  getContract,
  loadContractRegistry,
  validateValue,
} from "../tools/foundry/lib/schema.mjs";

const ROOT = repoRootFromTestFile(import.meta.url);
const CONTRACTS = join(ROOT, "foundry", "contracts");
const EXAMPLES = join(ROOT, "foundry", "examples");
const registry = loadContractRegistry(CONTRACTS);

function json(path: string): any {
  return JSON.parse(readFileSync(path, "utf8"));
}

function demoInputs() {
  return {
    envelope: json(join(EXAMPLES, "research-brief.task-envelope.json")),
    pack: json(join(EXAMPLES, "research-brief.skill-pack.json")),
  };
}

function tempDirectory(): string {
  return mkdtempSync(join(tmpdir(), "starlight-foundry-test-"));
}

function compileDemo(output: string, envelopeOverride?: any, force = false) {
  const { envelope, pack } = demoInputs();
  const effectiveEnvelope = envelopeOverride ?? envelope;
  const graph = buildCapabilityGraph(ROOT);
  return compilePackage({
    root: ROOT,
    envelope: effectiveEnvelope,
    pack,
    output,
    graph,
    registry,
    force,
  });
}

function projectionEnvelope(
  kind: string,
  id: string,
  targets: string[],
  required: string[],
  artifactPath: string,
) {
  const { envelope } = demoInputs();
  envelope.id = id;
  envelope.kind = kind;
  envelope.objective = `Compile and prove the ${kind} projection without relying on undeclared runtime behavior.`;
  envelope.deliverables = [{
    id: `compiled-${kind}`,
    description: `A contract-valid compiled ${kind} package and evidence receipt.`,
    artifactType: `${kind}-package`,
    required: true,
  }];
  envelope.evidencePolicy = {
    freshness: "stable",
    requirePrimarySources: false,
    requiredLanes: ["static", "artifact"],
    minimumIndependentJudges: 0,
  };
  envelope.capabilitySelection = {
    required,
    preferred: [],
    forbidden: [],
    allowCreation: false,
  };
  envelope.completionTests = [{
    id: `${kind}-artifact-present`,
    lane: "static",
    type: "file-exists",
    required: true,
    path: artifactPath,
  }];
  envelope.deployment.targets = targets;
  return envelope;
}

describe("v9.2 Foundry contracts", () => {
  it("validates the canonical Task Envelope, Skill Pack, and Taste Profile examples", () => {
    const fixtures = [
      ["task-envelope", "research-brief.task-envelope.json"],
      ["skill-pack", "research-brief.skill-pack.json"],
      ["taste-profile", "decision-brief.taste-profile.json"],
      ["vertical-pack", "community-intelligence.vertical-pack.json"],
    ] as const;
    for (const [contract, file] of fixtures) {
      const result = validateValue(json(join(EXAMPLES, file)), getContract(registry, contract), registry);
      assert.equal(result.valid, true, `${file}: ${JSON.stringify(result.errors)}`);
    }
  });

  it("fails closed on unknown Task Envelope fields", () => {
    const { envelope } = demoInputs();
    envelope.unboundedAuthority = true;
    const result = validateValue(envelope, getContract(registry, "task-envelope"), registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error: any) => error.code === "ADDITIONAL_PROPERTY"));
  });

  it("rejects Taste Profiles with non-normalized weights or duplicate dimension ids", () => {
    const profile = json(join(EXAMPLES, "decision-brief.taste-profile.json"));
    profile.dimensions[0].weight = 0.5;
    profile.dimensions[1].id = profile.dimensions[0].id;
    const result = validateValue(profile, getContract(registry, "taste-profile"), registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error: any) => error.code === "WEIGHT_TOTAL"));
    assert.ok(result.errors.some((error: any) => error.code === "DUPLICATE_ID"));
  });

  it("rejects an Agent Pack with no persistent policy boundary", () => {
    const invalidAgent = {
      schemaVersion: "1.0.0",
      kind: "agent",
      id: "decorative-agent",
      version: "0.1.0",
      description: "A named persona without any durable operational boundary.",
      necessity: {
        rationale: "The request only asks for a personality and supplies no persistent boundary.",
        persistentDecisionRights: false,
        distinctMemoryScope: false,
        constrainedToolBoundary: false,
        ownershipTransfer: false,
        ongoingTrigger: false,
      },
      decisionRights: ["Offer advice"],
      skills: ["intelligence/strategic-reasoning"],
      toolPolicy: { allow: [], deny: ["external-write"] },
      memoryContract: { read: [], write: [], retention: "turn" },
      handoffs: [],
      termination: { conditions: ["Advice delivered"], maxTurns: 2 },
      deployment: { targets: ["codex"] },
    };
    const result = validateValue(invalidAgent, getContract(registry, "agent-pack"), registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error: any) => error.code === "ANY_OF"));
  });
});

describe("v9.2 Foundry capability graph and routing", () => {
  it("derives every registered skill and source-counted agent", () => {
    const graph = buildCapabilityGraph(ROOT);
    assert.equal(graph.nodes.filter((node: any) => node.kind === "skill").length, 88);
    assert.equal(graph.nodes.filter((node: any) => node.kind === "agent").length, 144);
    const nodeIds = new Set(graph.nodes.map((node: any) => node.id));
    assert.equal(nodeIds.size, graph.nodes.length);
    assert.ok(graph.edges.every((edge: any) => nodeIds.has(edge.from) && nodeIds.has(edge.to)));
    const validation = validateValue(graph, getContract(registry, "capability-graph"), registry);
    assert.equal(validation.valid, true, JSON.stringify(validation.errors));
  });

  it("rejects duplicate nodes, alias collisions, and dangling graph edges", () => {
    const graph = buildCapabilityGraph(ROOT);
    graph.nodes.push(structuredClone(graph.nodes[0]));
    graph.nodes[1].aliases = [graph.nodes[0].id];
    graph.edges.push({
      from: "agent:not-registered",
      to: graph.nodes[0].id,
      relation: "activates",
    });
    const validation = validateValue(graph, getContract(registry, "capability-graph"), registry);
    assert.equal(validation.valid, false);
    assert.ok(validation.errors.some((error: any) => error.code === "DUPLICATE_NODE"));
    assert.ok(validation.errors.some((error: any) => error.code === "ALIAS_COLLISION"));
    assert.ok(validation.errors.some((error: any) => error.code === "DANGLING_EDGE"));
  });

  it("selects explicit capabilities and labels lexical suggestions as non-binding", () => {
    const { envelope } = demoInputs();
    const resolution = resolveCapabilities(envelope, buildCapabilityGraph(ROOT));
    assert.deepEqual(resolution.selected, [
      "skill:intelligence/hermes-search",
      "skill:intelligence/strategic-reasoning",
    ]);
    assert.ok(resolution.suggestions.every((entry: any) => entry.reason.includes("confirmation required")));
  });

  it("resolves explicit agent capabilities, including source-file aliases", () => {
    const { envelope } = demoInputs();
    envelope.capabilitySelection.required = ["agent:starlight-culture"];
    envelope.capabilitySelection.preferred = [];
    const resolution = resolveCapabilities(envelope, buildCapabilityGraph(ROOT));
    assert.deepEqual(resolution.selected, ["agent:starlight-culture-architect"]);
    assert.equal(resolution.decisions[0].requestedAs, "agent:starlight-culture");
  });

  it("refuses missing required capabilities", () => {
    const { envelope } = demoInputs();
    envelope.capabilitySelection.required = ["not/registered"];
    assert.throws(
      () => resolveCapabilities(envelope, buildCapabilityGraph(ROOT)),
      /not registered/,
    );
  });

  it("routes typed envelopes through the Queen without mutating state by default", () => {
    const statePath = join(ROOT, "tools", "queen", "state.json");
    const before = readFileSync(statePath);
    for (const [subcommand, extraArgs] of [
      ["route-envelope", [join(EXAMPLES, "research-brief.task-envelope.json")]],
      ["status", []],
      ["help", []],
    ] as const) {
      const execution = spawnSync(
        process.execPath,
        [join(ROOT, "tools", "queen", "driver.mjs"), subcommand, ...extraArgs],
        { cwd: ROOT, encoding: "utf8", shell: false },
      );
      assert.equal(execution.status, 0, execution.stderr);
      if (subcommand === "route-envelope") {
        assert.match(execution.stdout, /"routingMode": "typed-task-envelope"/);
      }
    }
    assert.deepEqual(readFileSync(statePath), before);
  });
});

describe("v9.2 Foundry compilation and proof", () => {
  it("compiles a portable skill and validates every declared required lane", () => {
    const temp = tempDirectory();
    try {
      const output = join(temp, "package");
      const compilation = compileDemo(output);
      const manifestValidation = validateValue(
        compilation.manifest,
        getContract(registry, "foundry-manifest"),
        registry,
      );
      assert.equal(manifestValidation.valid, true, JSON.stringify(manifestValidation.errors));
      const { receipt } = provePackage({ packageDirectory: output, registry });
      assert.equal(receipt.status, "validated");
      assert.equal(receipt.summary.failed, 0);
      assert.equal(receipt.laneCoverage.static, "passed");
      assert.equal(receipt.laneCoverage.behavioral, "passed");
      assert.equal(receipt.laneCoverage.artifact, "passed");
      assert.equal(receipt.laneCoverage.taste, "not-required");
      assert.match(readFileSync(join(output, "skill", "SKILL.md"), "utf8"), /facts, inferences, unknowns/);
      assert.match(readFileSync(join(output, "skill", "SKILL.md"), "utf8"), /^description: ".+"$/m);
      assert.match(readFileSync(join(output, "skill", "agents", "openai.yaml"), "utf8"), /\$research-brief-forge/);
      const shortDescription = readFileSync(
        join(output, "skill", "agents", "openai.yaml"),
        "utf8",
      ).match(/short_description: "(.*)"/)?.[1] ?? "";
      assert.ok(shortDescription.length >= 25 && shortDescription.length <= 64);
      const externalReceipt = provePackage({
        packageDirectory: output,
        output: join(temp, "external-evidence-receipt.json"),
        registry,
      }).receipt;
      assert.equal(externalReceipt.status, "validated");
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("compiles and proves agent, swarm, vertical, and plugin projections", () => {
    const temp = tempDirectory();
    try {
      const projections = [
        {
          envelope: projectionEnvelope(
            "agent",
            "decision-brief-agent",
            ["workspace-agent", "agents-sdk"],
            ["intelligence/strategic-reasoning"],
            "agent/AGENT.md",
          ),
          pack: {
            schemaVersion: "1.0.0",
            kind: "agent",
            id: "decision-brief-agent",
            version: "0.1.0",
            description: "Own a durable, least-privilege decision-brief review boundary with explicit termination.",
            necessity: {
              rationale: "A persistent constrained-tool boundary is required for recurring review runs and durable ownership.",
              persistentDecisionRights: false,
              distinctMemoryScope: false,
              constrainedToolBoundary: true,
              ownershipTransfer: true,
              ongoingTrigger: false,
            },
            decisionRights: ["Accept or return a draft against declared evidence gates"],
            skills: ["intelligence/strategic-reasoning"],
            toolPolicy: { allow: ["node"], deny: ["external-write"] },
            memoryContract: {
              read: ["strategic-vault"],
              write: [],
              retention: "durable",
            },
            handoffs: [{ when: "A required claim is unsupported", target: "operator" }],
            termination: { conditions: ["A receipt is issued"], maxTurns: 8 },
            deployment: { targets: ["workspace-agent", "agents-sdk"] },
          },
        },
        {
          envelope: projectionEnvelope(
            "swarm",
            "decision-brief-swarm",
            ["agents-sdk", "codex"],
            ["intelligence/strategic-reasoning", "agent:starlight-sentinel"],
            "swarm/task-graph.json",
          ),
          pack: {
            schemaVersion: "1.0.0",
            kind: "swarm",
            id: "decision-brief-swarm",
            version: "0.1.0",
            description: "Separate brief construction and adversarial verification under a bounded manager-worker topology.",
            topology: "manager-workers",
            roles: [
              {
                id: "builder",
                capabilities: ["intelligence/strategic-reasoning"],
                decisionRights: ["Draft the evidence-backed brief"],
                produces: ["candidate brief"],
              },
              {
                id: "verifier",
                capabilities: ["agent:starlight-sentinel"],
                decisionRights: ["Reject unsupported or permission-expanding claims"],
                produces: ["verification verdict"],
              },
            ],
            sharedState: {
              schema: "foundry/contracts/evidence-receipt.schema.json",
              writePolicy: "append-only",
            },
            conflictResolution: {
              owner: "operator",
              method: "evidence-weighted",
            },
            termination: {
              successConditions: ["All required evidence gates pass"],
              stopConditions: ["Maximum rounds or permission boundary reached"],
              maxRounds: 3,
            },
            deployment: { targets: ["agents-sdk", "codex"] },
          },
        },
        {
          envelope: projectionEnvelope(
            "vertical",
            "decision-intelligence",
            ["chatgpt-work", "codex"],
            ["intelligence/hermes-search", "intelligence/strategic-reasoning"],
            "vertical/vertical-pack.json",
          ),
          pack: {
            schemaVersion: "1.0.0",
            kind: "vertical",
            id: "decision-intelligence",
            version: "0.1.0",
            status: "experimental",
            description: "A reusable decision-intelligence vertical for source-grounded operator briefs and reviews.",
            audiences: ["Product and business operators"],
            domainConstraints: [
              "Separate facts, inferences, unknowns, and recommendations.",
              "Use current primary sources for unstable claims.",
            ],
            ontology: {
              entities: ["claim", "source", "decision", "recommendation"],
              decisions: ["accept-vs-revise", "act-vs-defer"],
            },
            canonicalSources: {
              policy: "current-primary-sources",
              required: ["Official documentation", "Primary research"],
            },
            userJobs: ["produce-decision-brief", "audit-decision-brief"],
            artifactTaxonomy: ["decision-brief", "evidence-receipt"],
            capabilities: [
              "intelligence/hermes-search",
              "intelligence/strategic-reasoning",
            ],
            tasteProfile: "decision-brief",
            riskPolicy: {
              irreversible: ["Public release of an unsupported recommendation"],
              approvalRequired: ["external-write", "public-release"],
            },
            evaluation: {
              requiredLanes: ["static", "artifact", "factual", "taste"],
              minimumPassRate: 0.9,
            },
            deployment: { targets: ["chatgpt-work", "codex"] },
          },
        },
        {
          envelope: projectionEnvelope(
            "plugin",
            "foundry-projection",
            ["chatgpt-work", "codex"],
            [
              "foundry/skill-forge",
              "foundry/agent-forge",
              "foundry/system-forge",
              "foundry/taste-engine",
            ],
            "plugin/.codex-plugin/plugin.json",
          ),
          pack: {
            schemaVersion: "1.0.0",
            kind: "plugin",
            id: "foundry-projection",
            version: "0.1.0",
            description: "Package the four validated Foundry skills into one ChatGPT Work and Codex distribution surface.",
            displayName: "Foundry Projection",
            skills: [
              "foundry/skill-forge",
              "foundry/agent-forge",
              "foundry/system-forge",
              "foundry/taste-engine",
            ],
            authentication: "none",
            deployment: { targets: ["chatgpt-work", "codex"] },
          },
        },
      ];

      const graph = buildCapabilityGraph(ROOT);
      for (const { envelope, pack } of projections) {
        const output = join(temp, pack.id);
        const result = compilePackage({
          root: ROOT,
          envelope,
          pack,
          output,
          graph,
          registry,
        });
        assert.equal(result.manifest.kind, pack.kind);
        assert.equal(provePackage({ packageDirectory: output, registry }).receipt.status, "validated");
      }
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("refuses forced replacement of unmanaged output and preserves its contents", () => {
    const temp = tempDirectory();
    try {
      const output = join(temp, "unmanaged");
      mkdirSync(output);
      const sentinel = join(output, "operator-notes.txt");
      writeFileSync(sentinel, "preserve me\n");
      assert.throws(
        () => compileDemo(output, undefined, true),
        /Refusing --force for unmanaged output directory/,
      );
      assert.equal(readFileSync(sentinel, "utf8"), "preserve me\n");
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("refuses pack permissions that exceed the Task Envelope", () => {
    const temp = tempDirectory();
    try {
      const { envelope, pack } = demoInputs();
      envelope.permissions.tools.allow = ["node"];
      const graph = buildCapabilityGraph(ROOT);
      assert.throws(
        () => compilePackage({
          root: ROOT,
          envelope,
          pack,
          output: join(temp, "package"),
          graph,
          registry,
        }),
        /Tool permission exceeds the Task Envelope/,
      );
      assert.equal(existsSync(join(temp, "package")), false);
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("refuses registered pack dependencies that were not explicitly selected", () => {
    const temp = tempDirectory();
    try {
      const { envelope, pack } = demoInputs();
      pack.dependencies.push("intelligence/pattern-recognition");
      const graph = buildCapabilityGraph(ROOT);
      assert.throws(
        () => compilePackage({
          root: ROOT,
          envelope,
          pack,
          output: join(temp, "package"),
          graph,
          registry,
        }),
        /not explicitly selected by the Task Envelope/,
      );
      assert.equal(existsSync(join(temp, "package")), false);
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("refuses a repository root as a compilation output", () => {
    const { envelope, pack } = demoInputs();
    const graph = buildCapabilityGraph(ROOT);
    assert.throws(
      () => compilePackage({
        root: ROOT,
        envelope,
        pack,
        output: ROOT,
        graph,
        registry,
      }),
      /Refusing broad or repository-root output directory/,
    );
  });

  it("safely replaces only a managed package with the same package id", () => {
    const temp = tempDirectory();
    try {
      const output = join(temp, "package");
      compileDemo(output);
      writeFileSync(join(output, "stale-generated-file.txt"), "stale\n");
      compileDemo(output, undefined, true);
      assert.equal(existsSync(join(output, "stale-generated-file.txt")), false);
      assert.equal(provePackage({ packageDirectory: output, registry }).receipt.status, "validated");
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("keeps a required taste lane pending without independent judge evidence", () => {
    const temp = tempDirectory();
    try {
      const { envelope } = demoInputs();
      envelope.evidencePolicy.requiredLanes.push("taste");
      envelope.evidencePolicy.minimumIndependentJudges = 1;
      envelope.completionTests.find((test: any) => test.type === "judge").required = true;
      const output = join(temp, "package");
      compileDemo(output, envelope);
      const { receipt } = provePackage({ packageDirectory: output, registry });
      assert.equal(receipt.status, "experimental");
      assert.equal(receipt.laneCoverage.taste, "pending");
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("detects changed artifacts and proposes the smallest responsible evolution layer", () => {
    const temp = tempDirectory();
    try {
      const output = join(temp, "package");
      compileDemo(output);
      const skillPath = join(output, "skill", "SKILL.md");
      writeFileSync(skillPath, `${readFileSync(skillPath, "utf8")}\nTampered.\n`);
      const { receipt, output: receiptPath } = provePackage({ packageDirectory: output, registry });
      assert.equal(receipt.status, "revise");
      assert.match(receipt.tests.find((test: any) => test.id === "artifact-digests").detail, /changed/);
      const evolutionPath = join(temp, "evolution.json");
      const { proposal } = proposeEvolution({ receiptPath, output: evolutionPath, registry });
      assert.equal(proposal.apply, false);
      assert.ok(proposal.patches.some((patch: any) => patch.layer === "renderer-or-packaging"));
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("blocks path traversal in artifact tests", () => {
    const temp = tempDirectory();
    try {
      const { envelope } = demoInputs();
      envelope.completionTests.push({
        id: "escape-attempt",
        lane: "security",
        type: "file-exists",
        required: true,
        path: "../../outside.txt",
      });
      envelope.evidencePolicy.requiredLanes.push("security");
      const output = join(temp, "package");
      compileDemo(output, envelope);
      assert.throws(
        () => provePackage({ packageDirectory: output, registry }),
        /Path escapes allowed root/,
      );
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("requires both an execution flag and an explicit executable allow-list entry", () => {
    const temp = tempDirectory();
    try {
      const { envelope } = demoInputs();
      envelope.completionTests.push({
        id: "node-command",
        lane: "behavioral",
        type: "command",
        required: true,
        command: ["node", "-e", "process.exit(0)"],
        timeoutMs: 5000,
      });
      const output = join(temp, "package");
      compileDemo(output, envelope);
      const pending = provePackage({ packageDirectory: output, registry }).receipt;
      assert.equal(pending.status, "experimental");
      const passed = provePackage({
        packageDirectory: output,
        registry,
        executeCommands: true,
      }).receipt;
      assert.equal(passed.status, "validated");

      const disallowedEnvelope = structuredClone(envelope);
      disallowedEnvelope.completionTests.find((test: any) => test.id === "node-command").command = [
        "bash",
        "-c",
        "exit 0",
      ];
      const disallowedOutput = join(temp, "disallowed");
      compileDemo(disallowedOutput, disallowedEnvelope);
      const blocked = provePackage({
        packageDirectory: disallowedOutput,
        registry,
        executeCommands: true,
      }).receipt;
      assert.equal(blocked.status, "revise");
      assert.match(
        blocked.tests.find((test: any) => test.id === "node-command").detail,
        /not permitted/,
      );
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });
});

describe("v9.2 Foundry plugin distribution", () => {
  it("refuses plugin skill-name collisions before writing output", () => {
    const temp = tempDirectory();
    try {
      const { envelope } = demoInputs();
      envelope.id = "collision-plugin";
      envelope.kind = "plugin";
      envelope.objective = "Package two independently registered skills without silently overwriting either source.";
      envelope.capabilitySelection.required = [
        "music-is/catalog-systems",
        "sound-intelligence/catalog-systems",
      ];
      envelope.capabilitySelection.preferred = [];
      envelope.deployment.targets = ["chatgpt-work", "codex"];
      const pack = {
        schemaVersion: "1.0.0",
        kind: "plugin",
        id: "collision-plugin",
        version: "0.1.0",
        description: "A collision fixture that proves plugin packaging fails closed on duplicate skill directory names.",
        displayName: "Collision Fixture",
        skills: [
          "music-is/catalog-systems",
          "sound-intelligence/catalog-systems",
        ],
        authentication: "none",
        deployment: { targets: ["chatgpt-work", "codex"] },
      };
      const graph = buildCapabilityGraph(ROOT);
      assert.throws(
        () => compilePackage({
          root: ROOT,
          envelope,
          pack,
          output: join(temp, "plugin"),
          graph,
          registry,
        }),
        /Plugin packaging collision/,
      );
      assert.equal(existsSync(join(temp, "plugin")), false);
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("keeps plugin skills byte-identical to canonical skill sources", () => {
    const skills = ["skill-forge", "agent-forge", "system-forge", "taste-engine"];
    for (const skill of skills) {
      for (const file of ["SKILL.md", join("agents", "openai.yaml")]) {
        const canonical = readFileSync(join(ROOT, "skills", "foundry", skill, file));
        const bundled = readFileSync(join(ROOT, "plugins", "starlight-foundry", "skills", skill, file));
        assert.deepEqual(bundled, canonical, `${skill}/${file} drifted`);
      }
    }
  });

  it("ships a skills-only plugin manifest with current starter prompts", () => {
    const manifest = json(join(ROOT, "plugins", "starlight-foundry", ".codex-plugin", "plugin.json"));
    assert.equal(manifest.name, "starlight-foundry");
    assert.equal(manifest.skills, "./skills/");
    assert.equal(Object.hasOwn(manifest, "mcpServers"), false);
    assert.ok(Array.isArray(manifest.interface.defaultPrompt));
    assert.ok(manifest.interface.defaultPrompt.some((prompt: string) => prompt.includes("$skill-forge")));
  });
});
