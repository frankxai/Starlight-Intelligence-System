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

function starlightPublisher() {
  return {
    name: "Starlight Intelligence",
    homepage: "https://starlightintelligence.org",
    repository: "https://github.com/frankxai/Starlight-Intelligence-System",
    license: "MIT",
    keywords: ["starlight", "foundry", "skills", "agents"],
  };
}

function validPlatformReceipt() {
  return {
    $schema: "https://starlightintelligence.org/schemas/foundry/platform-release-receipt.schema.json",
    schemaVersion: "1.0.0",
    receiptId: "release-openai-001",
    createdAt: "2026-08-31T12:03:00Z",
    expiresAt: "2026-10-15T12:03:00Z",
    subject: {
      name: "starlight-foundry",
      version: "0.1.0",
      gitSha: "abcdef1234567",
      artifactSha256: "a".repeat(64),
    },
    host: {
      registryId: "openai-chatgpt-codex",
      surface: "codex-cli",
      version: "1.0.0",
      channel: "stable",
      os: "linux",
      arch: "x64",
      plan: "test",
      locale: "en-US",
    },
    adapter: {
      tier: "native",
      format: "codex-plugin",
      version: "1.0.0",
      transport: "not-applicable",
    },
    distribution: {
      mode: "git",
      listingUrl: null,
      listingId: null,
      reviewState: "not-applicable",
      installedVersion: "0.1.0",
    },
    run: {
      mode: "headless",
      suiteVersion: "1.0.0",
      workflowRunUrl: "https://github.com/frankxai/Starlight-Intelligence-System/actions/runs/1",
      startedAt: "2026-08-31T12:00:00Z",
      completedAt: "2026-08-31T12:02:00Z",
    },
    checks: [{
      id: "discover-skills",
      capability: "skills.discovery",
      status: "pass",
      evidenceRefs: ["transcript-1"],
    }],
    evidence: [{
      id: "transcript-1",
      type: "transcript",
      uri: "https://evidence.example/releases/001/transcript.ndjson",
      sha256: "b".repeat(64),
      capturedAt: "2026-08-31T12:02:00Z",
      redacted: true,
    }],
    claims: [{
      capability: "skills.discovery",
      surface: "codex-cli",
      state: "compatible",
      owner: null,
      verifiedAt: "2026-08-31T12:02:00Z",
      expiresAt: "2026-10-15T12:00:00Z",
      limitations: [],
      evidenceRefs: ["transcript-1"],
    }],
    officialSourceUrls: ["https://developers.openai.com/plugins/build/plugins"],
    attestation: {
      actor: "github-actions:test",
      method: "human-review",
      signature: "review-record-c".repeat(4),
      artifactSha256: "a".repeat(64),
      verificationUrl: "https://github.com/frankxai/Starlight-Intelligence-System/actions/runs/1",
    },
    waiver: null,
  };
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

  it("validates the cross-host registry without turning documented compatibility into support", () => {
    const registryValue = json(join(ROOT, "foundry", "platforms", "host-capabilities.v1.json"));
    const result = validateValue(
      registryValue,
      getContract(registry, "host-capability-registry"),
      registry,
    );
    assert.equal(result.valid, true, JSON.stringify(result.errors));
    const ids = registryValue.surfaces.map((surface: any) => surface.id);
    assert.equal(new Set(ids).size, ids.length);
    const receiptContract = getContract(registry, "platform-release-receipt") as any;
    const receiptHostIds = receiptContract.properties.host.properties.registryId.enum;
    assert.deepEqual([...ids].sort(), [...receiptHostIds].sort());
    for (const id of [
      "anthropic-claude",
      "xai-grok-build",
      "google-gemini-spark",
      "manus-skills-mcp",
      "hermes-agent-plugins",
    ]) {
      assert.ok(ids.includes(id), `missing host registry surface: ${id}`);
    }
  });

  it("fails closed on unsupported, blocked, unowned, unevidenced, or unattested platform claims", () => {
    const contract = getContract(registry, "platform-release-receipt");
    const receipt: any = validPlatformReceipt();
    const receiptValidation = validateValue(receipt, contract, registry);
    assert.equal(receiptValidation.valid, true, JSON.stringify(receiptValidation.errors));

    const unverifiedStrongClaim = structuredClone(receipt);
    unverifiedStrongClaim.claims[0].state = "verified";
    assert.ok(
      validateValue(unverifiedStrongClaim, contract, registry).errors.some(
        (error: any) => error.code === "ATTESTATION_VERIFIER_REQUIRED",
      ),
    );

    const dangling = structuredClone(receipt);
    dangling.claims[0].evidenceRefs = [];
    dangling.checks[0].evidenceRefs = ["missing-artifact"];
    const danglingResult = validateValue(dangling, contract, registry);
    assert.equal(danglingResult.valid, false);
    assert.ok(danglingResult.errors.some((error: any) => error.code === "CLAIM_EVIDENCE"));
    assert.ok(danglingResult.errors.some((error: any) => error.code === "DANGLING_EVIDENCE"));

    const falseSupport = structuredClone(receipt);
    falseSupport.claims[0].state = "supported";
    falseSupport.claims[0].owner = "";
    falseSupport.adapter.tier = "unsupported";
    falseSupport.distribution.reviewState = "blocked";
    falseSupport.checks[0].status = "fail";
    const supportResult = validateValue(falseSupport, contract, registry);
    assert.equal(supportResult.valid, false);
    for (const code of [
      "CLAIM_PASS",
      "ATTESTATION_VERIFIER_REQUIRED",
      "UNSUPPORTED_ADAPTER_CLAIM",
      "BLOCKED_DISTRIBUTION_CLAIM",
      "LISTING_REQUIRED",
      "SUPPORT_OWNER",
      "FAILING_SUPPORT_CHECK",
    ]) {
      assert.ok(supportResult.errors.some((error: any) => error.code === code), code);
    }

    const unknownHost = structuredClone(receipt);
    unknownHost.host.registryId = "invented-host";
    assert.ok(
      validateValue(unknownHost, contract, registry).errors.some(
        (error: any) => error.code === "ENUM",
      ),
    );

    const unattachedAttestation = structuredClone(receipt);
    unattachedAttestation.attestation.artifactSha256 = "d".repeat(64);
    assert.ok(
      validateValue(unattachedAttestation, contract, registry).errors.some(
        (error: any) => error.code === "ATTESTATION_SUBJECT",
      ),
    );

    const pendingMarketplace = structuredClone(receipt);
    pendingMarketplace.claims[0].state = "published";
    pendingMarketplace.distribution = {
      mode: "public-marketplace",
      listingUrl: "https://example.com/listing/starlight-foundry",
      listingId: "starlight-foundry",
      reviewState: "pending",
      installedVersion: "0.1.0",
    };
    assert.ok(
      validateValue(pendingMarketplace, contract, registry).errors.some(
        (error: any) => error.code === "MARKETPLACE_APPROVAL",
      ),
    );
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
            "plugin/plugin.json",
          ),
          pack: {
            schemaVersion: "1.0.0",
            kind: "plugin",
            id: "foundry-projection",
            version: "0.1.0",
            description: "Package the four validated Foundry skills into one ChatGPT Work and Codex distribution surface.",
            displayName: "Foundry Projection",
            publisher: starlightPublisher(),
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

describe("v9.2 Foundry portable plugin compiler", () => {
  it("emits portable core plus only declared OpenAI and Claude overlays", () => {
    const temp = tempDirectory();
    try {
      const targets = ["agent-plugin", "openai-plugin", "codex", "claude-code"];
      const envelope = projectionEnvelope(
        "plugin",
        "foundry-remote",
        targets,
        ["foundry/skill-forge"],
        "plugin/plugin.json",
      );
      const pack: any = {
        schemaVersion: "1.0.0",
        kind: "plugin",
        id: "foundry-remote",
        version: "0.1.0",
        description: "Package a validated Foundry skill with a remote MCP endpoint for portable and native host testing.",
        displayName: "Foundry Remote",
        publisher: {
          name: "Example Publisher",
          email: "release@example.com",
          homepage: "https://example.com",
          repository: "https://github.com/example/foundry-remote",
          license: "Apache-2.0",
          keywords: ["example", "foundry"],
        },
        skills: ["foundry/skill-forge"],
        mcpServerUrl: "https://example.com/mcp",
        authentication: "oauth2",
        deployment: { targets },
      };
      const output = join(temp, pack.id);
      compilePackage({
        root: ROOT,
        envelope,
        pack,
        output,
        graph: buildCapabilityGraph(ROOT),
        registry,
      });

      const portable = json(join(output, "plugin", "plugin.json"));
      assert.equal(
        portable.$schema,
        "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
      );
      assert.equal(portable.name, pack.id);
      assert.equal(portable.author.name, "Example Publisher");
      assert.equal(portable.license, "Apache-2.0");
      assert.equal(Object.hasOwn(portable, "skills"), false);
      assert.equal(Object.hasOwn(portable, "mcpServers"), false);
      assert.equal(Object.hasOwn(portable, "interface"), false);
      assert.ok(
        Object.keys(portable).every((key) => [
          "$schema",
          "name",
          "version",
          "description",
          "author",
          "homepage",
          "repository",
          "license",
          "keywords",
          "extensions",
        ].includes(key)),
      );

      const portableMcp = json(join(output, "plugin", "mcp.json"));
      assert.equal(
        portableMcp.$schema,
        "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
      );
      assert.deepEqual(portableMcp.mcpServers.foundry, {
        type: "streamable-http",
        url: "https://example.com/mcp",
      });

      const codex = json(join(output, "plugin", ".codex-plugin", "plugin.json"));
      assert.equal(codex.mcpServers, "./.mcp.json");
      assert.equal(codex.author.name, "Example Publisher");
      assert.deepEqual(json(join(output, "plugin", ".mcp.json")), {
        foundry: { type: "http", url: "https://example.com/mcp" },
      });

      const claude = json(join(output, "plugin", ".claude-plugin", "plugin.json"));
      assert.equal(claude.mcpServers, "./.claude-mcp.json");
      assert.equal(claude.author.name, "Example Publisher");
      assert.deepEqual(json(join(output, "plugin", ".claude-mcp.json")), {
        mcpServers: {
          foundry: { type: "http", url: "https://example.com/mcp" },
        },
      });
      assert.equal(
        provePackage({ packageDirectory: output, registry }).receipt.status,
        "validated",
      );

      for (const unsafeUrl of [
        "https://example.com/mcp?api_key=placeholder",
        "https://user:secret@example.com/mcp#fragment",
      ]) {
        const unsafePack = structuredClone(pack);
        unsafePack.id = unsafeUrl.includes("api_key") ? "unsafe-query" : "unsafe-userinfo";
        unsafePack.mcpServerUrl = unsafeUrl;
        const unsafeEnvelope = projectionEnvelope(
          "plugin",
          unsafePack.id,
          targets,
          ["foundry/skill-forge"],
          "plugin/plugin.json",
        );
        assert.throws(
          () => compilePackage({
            root: ROOT,
            envelope: unsafeEnvelope,
            pack: unsafePack,
            output: join(temp, unsafePack.id),
            graph: buildCapabilityGraph(ROOT),
            registry,
          }),
          /must use HTTPS and must not contain user information, a query, or a fragment/,
        );
      }
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("keeps host overlays target-scoped and rejects nonconformant portable ids", () => {
    const temp = tempDirectory();
    try {
      const targets = ["agent-plugin"];
      const envelope = projectionEnvelope(
        "plugin",
        "portable-only",
        targets,
        ["foundry/skill-forge"],
        "plugin/plugin.json",
      );
      const pack: any = {
        schemaVersion: "1.0.0",
        kind: "plugin",
        id: "portable-only",
        version: "0.1.0",
        description: "Exercise portable-only package emission without undeclared host-specific overlays.",
        displayName: "Portable Only",
        publisher: starlightPublisher(),
        skills: ["foundry/skill-forge"],
        mcpServerUrl: "https://example.com/mcp",
        authentication: "none",
        deployment: { targets },
      };
      const output = join(temp, pack.id);
      compilePackage({
        root: ROOT,
        envelope,
        pack,
        output,
        graph: buildCapabilityGraph(ROOT),
        registry,
      });
      assert.equal(existsSync(join(output, "plugin", "plugin.json")), true);
      assert.equal(existsSync(join(output, "plugin", "mcp.json")), true);
      assert.equal(existsSync(join(output, "plugin", ".codex-plugin")), false);
      assert.equal(existsSync(join(output, "plugin", ".mcp.json")), false);
      assert.equal(existsSync(join(output, "plugin", ".claude-plugin")), false);
      assert.equal(existsSync(join(output, "plugin", ".claude-mcp.json")), false);

      const invalidPack = structuredClone(pack);
      invalidPack.id = "foundry--projection";
      delete invalidPack.mcpServerUrl;
      const invalidEnvelope = projectionEnvelope(
        "plugin",
        invalidPack.id,
        targets,
        ["foundry/skill-forge"],
        "plugin/plugin.json",
      );
      assert.throws(
        () => compilePackage({
          root: ROOT,
          envelope: invalidEnvelope,
          pack: invalidPack,
          output: join(temp, invalidPack.id),
          graph: buildCapabilityGraph(ROOT),
          registry,
        }),
        /not Agent Plugins v1 conformant/,
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
        publisher: starlightPublisher(),
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

  it("ships synchronized skills-only portable, OpenAI, and Claude manifests", () => {
    const manifest = json(join(ROOT, "plugins", "starlight-foundry", ".codex-plugin", "plugin.json"));
    const portable = json(join(ROOT, "plugins", "starlight-foundry", "plugin.json"));
    const claude = json(join(ROOT, "plugins", "starlight-foundry", ".claude-plugin", "plugin.json"));
    assert.equal(manifest.name, "starlight-foundry");
    assert.equal(portable.name, manifest.name);
    assert.equal(portable.version, manifest.version);
    assert.equal(claude.name, manifest.name);
    assert.equal(claude.version, manifest.version);
    assert.equal(
      portable.$schema,
      "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
    );
    assert.equal(Object.hasOwn(portable, "skills"), false);
    assert.equal(Object.hasOwn(portable, "mcpServers"), false);
    assert.equal(manifest.skills, "./skills/");
    assert.equal(Object.hasOwn(manifest, "mcpServers"), false);
    assert.equal(claude.skills, "./skills/");
    assert.equal(Object.hasOwn(claude, "mcpServers"), false);
    assert.equal(existsSync(join(ROOT, "plugins", "starlight-foundry", "mcp.json")), false);
    assert.equal(existsSync(join(ROOT, "plugins", "starlight-foundry", ".mcp.json")), false);
    assert.ok(Array.isArray(manifest.interface.defaultPrompt));
    assert.ok(
      manifest.interface.defaultPrompt.some((prompt: string) => prompt.includes("$skill-forge")),
    );
  });
});
