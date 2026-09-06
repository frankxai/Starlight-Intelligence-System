import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { repoRootFromTestFile } from "./_lib/repo.js";
import {
  validateAgentPluginPackage,
  validateAgentPluginValue,
  verifyAgentPluginSchemaCache,
} from "../tools/foundry/lib/upstream-conformance.mjs";
import { validateOpenAIPluginPackage } from "../tools/foundry/lib/openai-preflight.mjs";
import { verifyFileDigestClosure } from "../tools/foundry/lib/io.mjs";
import { getContract, loadContractRegistry, validateValue } from "../tools/foundry/lib/schema.mjs";

const ROOT = repoRootFromTestFile(import.meta.url);
const PLUGIN = join(ROOT, "plugins", "starlight-foundry");
const VENDOR = join(ROOT, "foundry", "vendor", "agent-plugins", "1.0.0");
const CONTRACTS = join(ROOT, "foundry", "contracts");
const SUBMISSION_PROFILE = join(PLUGIN, "submission", "openai", "profile.json");
const TOOLCHAIN_LOCK = join(ROOT, "foundry", "validators", "toolchain.lock.v1.json");
const registry = loadContractRegistry(CONTRACTS);

function tempDirectory(): string {
  return mkdtempSync(join(tmpdir(), "starlight-conformance-test-"));
}

function portableManifest(): any {
  return JSON.parse(readFileSync(join(PLUGIN, "plugin.json"), "utf8"));
}

function sha256(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

describe("Foundry upstream Agent Plugins conformance", () => {
  it("verifies exact Agent Plugins 1.0.0 schema digests before compilation", () => {
    const cache = verifyAgentPluginSchemaCache();
    assert.equal(cache.specificationVersion, "1.0.0");
    assert.equal(cache.license, "Apache-2.0");
    assert.deepEqual(
      Object.fromEntries(cache.records.map((record: any) => [record.name, record.sha256])),
      {
        "plugin.schema.json": "0a4aad95ce337878ad38802ebf0daa3fde76abe3f65400c86bcbb1ec0b3ab883",
        "mcp.schema.json": "6539175bfcdf43085855183e86da40ea94b166547a72b47ae9a0a390516d3acb",
      },
    );
    assert.ok(cache.records.every((record: any) => record.cacheVerified));
  });

  it("keeps validator versions and package integrities synchronized with the npm lock", () => {
    const lock = JSON.parse(readFileSync(TOOLCHAIN_LOCK, "utf8"));
    const npmLock = JSON.parse(readFileSync(join(ROOT, "package-lock.json"), "utf8"));
    const nativeLock = JSON.parse(
      readFileSync(join(ROOT, "foundry", "validators", "native", "package-lock.json"), "utf8"),
    );
    const ajv = npmLock.packages["node_modules/ajv"];
    const codex = nativeLock.packages["node_modules/@openai/codex"];
    const claude = nativeLock.packages["node_modules/@anthropic-ai/claude-code"];
    assert.deepEqual(
      [lock.portable.validator.version, lock.portable.validator.integrity],
      [ajv.version, ajv.integrity],
    );
    assert.deepEqual(
      [lock.openai.codexLoader.version, lock.openai.codexLoader.integrity],
      [codex.version, codex.integrity],
    );
    assert.deepEqual(
      [lock.claude.strictValidator.version, lock.claude.strictValidator.integrity],
      [claude.version, claude.integrity],
    );
    for (const validator of [lock.openai.codexLoader, lock.claude.strictValidator]) {
      for (const expected of Object.values(validator.platformPackages) as any[]) {
        const actual = nativeLock.packages[`node_modules/${expected.package}`];
        assert.deepEqual(
          [actual?.version, actual?.integrity],
          [expected.version, expected.integrity],
          expected.package,
        );
      }
    }
    for (const [name, expected] of Object.entries(lock.openai.rules.implementation) as any[]) {
      const actual = npmLock.packages[`node_modules/${name}`];
      assert.deepEqual([actual?.version, actual?.integrity], [expected.version, expected.integrity], name);
    }
    assert.equal(JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).engines.node, ">=18.0.0");
    assert.equal(
      JSON.parse(readFileSync(join(ROOT, "foundry", "validators", "native", "package.json"), "utf8")).engines.node,
      ">=22.0.0",
    );
    assert.equal(
      lock.portable.provenanceSha256,
      sha256(join(VENDOR, "provenance.json")),
    );
    assert.equal(
      lock.openai.rules.sha256,
      sha256(join(ROOT, "foundry", "validators", "openai", "plugin-rules.v2026-09-01.json")),
    );
  });

  it("binds every validator to its complete reviewed local source and dependency closure", () => {
    const lock = JSON.parse(readFileSync(TOOLCHAIN_LOCK, "utf8"));
    const closures = [
      {
        label: "Portable Agent Plugins validator",
        value: lock.portable.validator.sourceClosure,
        paths: [
          "package-lock.json",
          "package.json",
          "tools/foundry/lib/io.mjs",
          "tools/foundry/lib/upstream-conformance.mjs",
        ],
      },
      {
        label: "OpenAI preflight validator",
        value: lock.openai.rules.validator.sourceClosure,
        paths: [
          "foundry/contracts/openai-submission-profile.schema.json",
          "package-lock.json",
          "package.json",
          "tools/foundry/lib/io.mjs",
          "tools/foundry/lib/openai-preflight.mjs",
          "tools/foundry/lib/package-payload.mjs",
          "tools/foundry/lib/schema.mjs",
        ],
      },
      {
        label: "Codex loader smoke",
        value: lock.openai.codexLoader.sourceClosure,
        paths: [
          "foundry/validators/native/package-lock.json",
          "foundry/validators/native/package.json",
          "tools/foundry/codex-loader-smoke.mjs",
          "tools/foundry/lib/io.mjs",
          "tools/foundry/lib/package-payload.mjs",
        ],
      },
      {
        label: "Claude strict validator smoke",
        value: lock.claude.strictValidator.sourceClosure,
        paths: [
          "foundry/validators/native/package-lock.json",
          "foundry/validators/native/package.json",
          "tools/foundry/claude-validator-smoke.mjs",
          "tools/foundry/lib/io.mjs",
          "tools/foundry/lib/package-payload.mjs",
        ],
      },
    ];

    for (const closure of closures) {
      const records = verifyFileDigestClosure(ROOT, closure.value, closure.paths, closure.label);
      assert.deepEqual(records.map((record: any) => record.path), [...closure.paths].sort());

      const changed = { ...closure.value, [closure.paths[0]]: "0".repeat(64) };
      assert.throws(
        () => verifyFileDigestClosure(ROOT, changed, closure.paths, closure.label),
        /source closure digest mismatch/,
      );

      const missing = { ...closure.value };
      delete missing[closure.paths[0]];
      assert.throws(
        () => verifyFileDigestClosure(ROOT, missing, closure.paths, closure.label),
        /source closure paths drifted/,
      );
    }
  });

  it("accepts the checked-in portable manifest and emits a bounded claim", () => {
    const result = validateAgentPluginPackage(PLUGIN);
    assert.equal(result.status, "pass", JSON.stringify(result.checks));
    assert.equal(result.validator.name, "agent-plugins-json-schema");
    assert.equal(result.validator.version, "8.20.0");
    assert.equal(result.validator.package, "ajv");
    assert.match(result.validator.integrity, /^sha512-/);
    assert.match(result.validator.implementationSha256, /^[a-f0-9]{64}$/);
    assert.deepEqual(result.invocation.argv.slice(0, 3), ["node", "tools/foundry/cli.mjs", "conformance"]);
    assert.equal(result.invocation.output.content, "this report");
    assert.match(result.claimBoundary, /not a host install, runtime, publication, or support claim/);
    assert.deepEqual(
      result.checks.map((check: any) => [check.file, check.present, check.valid]),
      [["plugin.json", true, true], ["mcp.json", false, true]],
    );
  });

  it("rejects unknown portable fields through the unmodified upstream schema", () => {
    const manifest = portableManifest();
    manifest.skills = "./skills";
    const result = validateAgentPluginValue({ kind: "plugin", value: manifest });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error: any) => error.keyword === "additionalProperties"));
  });

  it("accepts streamable HTTP and rejects a non-standard MCP transport", () => {
    const valid = {
      $schema: "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
      mcpServers: {
        creator: {
          type: "streamable-http",
          url: "https://creator-mcp-staging.starlightintelligence.org/mcp",
        },
      },
    };
    assert.equal(validateAgentPluginValue({ kind: "mcp", value: valid }).valid, true);

    const invalid = structuredClone(valid);
    invalid.mcpServers.creator.type = "http";
    const result = validateAgentPluginValue({ kind: "mcp", value: invalid });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error: any) => error.keyword === "oneOf"));
  });

  it("fails closed when a vendored schema is missing or has drifted", () => {
    const temp = tempDirectory();
    try {
      cpSync(VENDOR, temp, { recursive: true });
      writeFileSync(join(temp, "plugin.schema.json"), "{}\n", "utf8");
      assert.throws(
        () => verifyAgentPluginSchemaCache(temp),
        /schema digest mismatch for plugin\.schema\.json/,
      );

      const incomplete = join(temp, "incomplete");
      mkdirSync(incomplete);
      assert.throws(
        () => verifyAgentPluginSchemaCache(incomplete),
        /schema provenance is missing/,
      );
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("rejects a self-consistent schema and provenance rewrite against the independent lock", () => {
    const temp = tempDirectory();
    try {
      cpSync(VENDOR, temp, { recursive: true });
      const schemaPath = join(temp, "plugin.schema.json");
      writeFileSync(schemaPath, "{}\n", "utf8");
      const provenancePath = join(temp, "provenance.json");
      const provenance = JSON.parse(readFileSync(provenancePath, "utf8"));
      provenance.schemas["plugin.schema.json"].sha256 = sha256(schemaPath);
      provenance.schemas["plugin.schema.json"].bytes = readFileSync(schemaPath).byteLength;
      writeFileSync(provenancePath, `${JSON.stringify(provenance, null, 2)}\n`, "utf8");
      assert.throws(
        () => verifyAgentPluginSchemaCache(temp),
        /drifted from the reviewed toolchain lock|source commit drifted/,
      );
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("produces deterministic evidence for unchanged package bytes", () => {
    assert.deepEqual(validateAgentPluginPackage(PLUGIN), validateAgentPluginPackage(PLUGIN));
  });
});

describe("Foundry OpenAI docs-derived package preflight", () => {
  it("passes the current skills-only package without promoting an OpenAI claim", () => {
    const result = validateOpenAIPluginPackage(PLUGIN, { evaluationDate: "2026-09-01" });
    assert.equal(result.status, "pass", JSON.stringify(result.errors));
    assert.equal(result.rules.authority, "docs-derived-preflight");
    assert.equal(result.validator.name, "starlight-openai-docs-derived-preflight");
    assert.deepEqual(result.validator.packages.map((entry: any) => entry.name), [
      "fast-xml-parser",
      "semver",
      "yaml",
    ]);
    assert.equal(result.invocation.output.content, "this report");
    assert.equal(result.checks.find((check: any) => check.id === "short-description")?.status, "pass");
    assert.equal(result.checks.find((check: any) => check.id === "skills-structure")?.status, "pass");
    assert.equal(result.checks.find((check: any) => check.id === "skill-identities")?.status, "pass");
    assert.equal(result.checks.find((check: any) => check.id === "skill-openai-metadata")?.status, "pass");
    assert.equal(result.checks.find((check: any) => check.id === "submission-payload-binding")?.status, "pass");
    assert.match(result.subject.packagePayloadSha256, /^[a-f0-9]{64}$/);
    assert.match(result.claimBoundary, /cannot replace bundle upload, the OpenAI skill safety\/security scan/);
    assert.ok(result.externalGates.includes("developer-mode ChatGPT runtime"));
  });

  it("fails closed on missing skill payload and malformed optional OpenAI skill metadata", () => {
    const temp = tempDirectory();
    try {
      cpSync(PLUGIN, temp, { recursive: true });
      unlinkSync(join(temp, "skills", "skill-forge", "SKILL.md"));
      writeFileSync(
        join(temp, "skills", "agent-forge", "agents", "openai.yaml"),
        "interface: [not-a-mapping\n",
        "utf8",
      );
      const result = validateOpenAIPluginPackage(temp, { evaluationDate: "2026-09-01" });
      assert.equal(result.status, "fail");
      assert.equal(result.checks.find((check: any) => check.id === "skills-structure")?.status, "fail");
      assert.equal(result.checks.find((check: any) => check.id === "skill-openai-metadata")?.status, "fail");
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("rejects invalid UTF-8 manifests and non-immediate nested skill manifests", () => {
    const temp = tempDirectory();
    try {
      cpSync(PLUGIN, temp, { recursive: true });
      rmSync(join(temp, "submission"), { recursive: true, force: true });
      const manifestPath = join(temp, ".codex-plugin", "plugin.json");
      const bytes = Buffer.from(readFileSync(manifestPath));
      const marker = Buffer.from("Design portable skills");
      const markerIndex = bytes.indexOf(marker);
      assert.notEqual(markerIndex, -1);
      bytes[markerIndex] = 0x80;
      writeFileSync(manifestPath, bytes);
      assert.throws(
        () => validateOpenAIPluginPackage(temp, { evaluationDate: "2026-09-01" }),
        /Cannot read JSON.*Cannot decode UTF-8/,
      );

      cpSync(join(PLUGIN, ".codex-plugin", "plugin.json"), manifestPath);
      const nested = join(temp, "skills", "agent-forge", "nested");
      mkdirSync(nested, { recursive: true });
      writeFileSync(
        join(nested, "SKILL.md"),
        "---\nname: nested-agent-forge\ndescription: This nested manifest must be rejected.\n---\n\n# Nested\n",
        "utf8",
      );
      const nestedResult = validateOpenAIPluginPackage(temp, { evaluationDate: "2026-09-01" });
      assert.equal(nestedResult.status, "fail");
      const structure = nestedResult.checks.find((check: any) => check.id === "skills-structure");
      assert.equal(structure?.status, "fail");
      assert.ok(structure?.errors.some((error: string) => error.includes("not an immediate")));
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("enforces OpenAI skill metadata description bounds and skill-scoped prompts", () => {
    const temp = tempDirectory();
    try {
      cpSync(PLUGIN, temp, { recursive: true });
      rmSync(join(temp, "submission"), { recursive: true, force: true });
      const metadataPath = join(temp, "skills", "agent-forge", "agents", "openai.yaml");
      writeFileSync(
        metadataPath,
        `interface:\n  display_name: "Agent Forge"\n  short_description: "${"x".repeat(65)}"\n  default_prompt: "Use $different-skill for this task."\n`,
        "utf8",
      );
      const result = validateOpenAIPluginPackage(temp, { evaluationDate: "2026-09-01" });
      assert.equal(result.status, "fail");
      assert.equal(result.checks.find((check: any) => check.id === "skill-openai-metadata")?.status, "fail");

      writeFileSync(
        metadataPath,
        `interface:\n  display_name: "Agent Forge"\n  short_description: "Create a durable and bounded agent design."\n  default_prompt: "Use $agent-forge to design this actor."\ndependencies:\n  tools:\n    - type: "mcp"\n      value: "creator"\n      description: "Creator MCP server"\n      transport: "streamable_http"\n      url: "https://user:secret@example.com/mcp"\n`,
        "utf8",
      );
      const credentialResult = validateOpenAIPluginPackage(temp, { evaluationDate: "2026-09-01" });
      assert.equal(
        credentialResult.checks.find((check: any) => check.id === "skill-openai-metadata")?.status,
        "fail",
      );

      writeFileSync(
        metadataPath,
        `interface:\n  display_name: "Agent Forge"\n  short_description: "Create a durable and bounded agent design."\n  default_prompt: "Use $agent-forge to design this actor."\ndependencies:\n  tools:\n    - type: "mcp"\n      value: "creator"\n      description: "Creator MCP server"\n      transport: "streamable_http"\n      url: "https://example.com/mcp?api_key=secret#fragment"\n`,
        "utf8",
      );
      const queryResult = validateOpenAIPluginPackage(temp, { evaluationDate: "2026-09-01" });
      assert.equal(
        queryResult.checks.find((check: any) => check.id === "skill-openai-metadata")?.status,
        "fail",
      );
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("accepts multiline descriptions but rejects tabbed prompts after conservative normalization", () => {
    const temp = tempDirectory();
    try {
      cpSync(PLUGIN, temp, { recursive: true });
      rmSync(join(temp, "submission"), { recursive: true, force: true });
      const manifestPath = join(temp, ".codex-plugin", "plugin.json");
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      manifest.description = "Design portable capabilities.\nKeep external proof pending.";
      manifest.interface.longDescription = "Design the source contract.\nCompile only with a Foundry runtime.";
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
      let result = validateOpenAIPluginPackage(temp, { evaluationDate: "2026-09-01" });
      assert.equal(result.checks.find((check: any) => check.id === "package-description")?.status, "pass");
      assert.equal(result.checks.find((check: any) => check.id === "long-description")?.status, "pass");

      manifest.interface.defaultPrompt[0] = "Turn\tthis workflow into a skill.";
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
      result = validateOpenAIPluginPackage(temp, { evaluationDate: "2026-09-01" });
      assert.equal(result.checks.find((check: any) => check.id === "starter-prompts")?.status, "fail");

      manifest.interface.defaultPrompt[0] = "Turn this workflow into a \u202Eskill.";
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
      result = validateOpenAIPluginPackage(temp, { evaluationDate: "2026-09-01" });
      assert.equal(result.checks.find((check: any) => check.id === "starter-prompts")?.status, "fail");
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("rejects unsafe or incorrectly cased asset formats and fails closed on raster decoding", () => {
    const temp = tempDirectory();
    try {
      cpSync(PLUGIN, temp, { recursive: true });
      rmSync(join(temp, "submission"), { recursive: true, force: true });
      const logoPath = join(temp, "assets", "logo.svg");
      writeFileSync(logoPath, '<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"></SVG>\n', "utf8");
      let result = validateOpenAIPluginPackage(temp, { evaluationDate: "2026-09-01" });
      assert.equal(result.checks.find((check: any) => check.id === "logo")?.status, "fail");

      writeFileSync(logoPath, '<svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 48 48"></svg>\n', "utf8");
      result = validateOpenAIPluginPackage(temp, { evaluationDate: "2026-09-01" });
      assert.equal(result.checks.find((check: any) => check.id === "logo")?.status, "fail");

      for (const spoofedSvg of [
        '<svg-x xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"></svg-x>\n',
        '<svg:foo xmlns:svg="http://www.w3.org/2000/svg" viewBox="0 0 48 48"></svg:foo>\n',
        '<svg xmlns="http://www.w3.org/2000/svg" data-viewBox="0 0 48 48"></svg>\n',
        '<svg xmlns="http://www.w3.org/2000/svg" stroke-width="48" height="48"></svg>\n',
      ]) {
        writeFileSync(logoPath, spoofedSvg, "utf8");
        result = validateOpenAIPluginPackage(temp, { evaluationDate: "2026-09-01" });
        assert.equal(result.checks.find((check: any) => check.id === "logo")?.status, "fail");
      }

      const manifestPath = join(temp, ".codex-plugin", "plugin.json");
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      manifest.interface.logo = "./assets/logo.png";
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
      writeFileSync(join(temp, "assets", "logo.png"), Buffer.from("89504e470d0a1a0a", "hex"));
      result = validateOpenAIPluginPackage(temp, { evaluationDate: "2026-09-01" });
      assert.equal(result.checks.find((check: any) => check.id === "logo")?.status, "fail");
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("rejects a profile that drifts from duplicated manifest and listing fields", () => {
    const temp = tempDirectory();
    try {
      cpSync(PLUGIN, temp, { recursive: true });
      const profilePath = join(temp, "submission", "openai", "profile.json");
      const profile = JSON.parse(readFileSync(profilePath, "utf8"));
      profile.package.portableManifest = "different.json";
      profile.listing.displayName = "Different Listing";
      writeFileSync(profilePath, `${JSON.stringify(profile, null, 2)}\n`, "utf8");
      const result = validateOpenAIPluginPackage(temp, { evaluationDate: "2026-09-01" });
      assert.equal(result.checks.find((check: any) => check.id === "submission-payload-binding")?.status, "fail");
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("rejects a source profile that self-promotes to a strong external state", () => {
    const temp = tempDirectory();
    try {
      cpSync(PLUGIN, temp, { recursive: true });
      const profilePath = join(temp, "submission", "openai", "profile.json");
      const profile = JSON.parse(readFileSync(profilePath, "utf8"));
      profile.state = "published";
      writeFileSync(profilePath, `${JSON.stringify(profile, null, 2)}\n`, "utf8");
      const result = validateOpenAIPluginPackage(temp, { evaluationDate: "2026-09-01" });
      assert.equal(result.status, "fail");
      const check = result.checks.find((entry: any) => entry.id === "submission-profile-contract");
      assert.equal(check?.status, "fail");
      assert.ok(check?.errors.some((error: any) => error.code === "ENUM"));
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("rejects a toolchain lock with a deleted implementation pin", () => {
    const temp = tempDirectory();
    try {
      const toolchainPath = join(temp, "toolchain.json");
      const toolchain = JSON.parse(readFileSync(TOOLCHAIN_LOCK, "utf8"));
      delete toolchain.openai.rules.implementation.yaml;
      writeFileSync(toolchainPath, `${JSON.stringify(toolchain, null, 2)}\n`, "utf8");
      const result = validateOpenAIPluginPackage(PLUGIN, {
        evaluationDate: "2026-09-01",
        toolchainLockPath: toolchainPath,
      });
      assert.equal(result.checks.find((check: any) => check.id === "rules-lock")?.status, "fail");
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("rejects expired rules, overlong metadata, @mentions, and missing assets", () => {
    const temp = tempDirectory();
    try {
      cpSync(PLUGIN, temp, { recursive: true });
      const manifestPath = join(temp, ".codex-plugin", "plugin.json");
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      manifest.interface.shortDescription = "This subtitle is deliberately longer than thirty characters";
      manifest.interface.defaultPrompt[0] = "Ask @starlight to forge this workflow.";
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
      unlinkSync(join(temp, "assets", "logo.svg"));

      const result = validateOpenAIPluginPackage(temp, { evaluationDate: "2026-10-02" });
      assert.equal(result.status, "fail");
      for (const id of ["rules-freshness", "short-description", "starter-prompts", "logo"]) {
        assert.equal(result.checks.find((check: any) => check.id === id)?.status, "fail", id);
      }
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("validates a pending dossier and fails closed on premature submission claims", () => {
    const contract = getContract(registry, "openai-submission-profile");
    const profile = JSON.parse(readFileSync(SUBMISSION_PROFILE, "utf8"));
    assert.equal(validateValue(profile, contract, registry).valid, true);

    const falseSubmission = structuredClone(profile);
    falseSubmission.state = "submitted";
    falseSubmission.experience.customUi = false;
    falseSubmission.experience.screenshots = ["submission/screenshot.png"];
    falseSubmission.reviewTests.negative[0].id = falseSubmission.reviewTests.positive[0].id;
    const result = validateValue(falseSubmission, contract, registry);
    assert.equal(result.valid, false);
    for (const code of [
      "SCREENSHOTS_WITHOUT_UI",
      "DUPLICATE_ID",
      "SUBMISSION_IDENTITY_GATE",
      "SUBMISSION_LEGAL_GATE",
      "SUBMISSION_HUMAN_GATE",
      "SUBMISSION_EVIDENCE_GATE",
      "ATTESTATION_VERIFIER_REQUIRED",
    ]) {
      assert.ok(result.errors.some((error: any) => error.code === code), code);
    }
  });

  it("rejects a fully self-asserted published dossier without external verification", () => {
    const contract = getContract(registry, "openai-submission-profile");
    const forged = JSON.parse(readFileSync(SUBMISSION_PROFILE, "utf8"));
    forged.state = "published";
    forged.identity.publisherMode = "business";
    forged.identity.verificationState = "verified";
    forged.identity.appsManagementWrite = "confirmed";
    forged.policy.privacyUrl = "https://example.invalid/privacy";
    forged.policy.termsUrl = "https://example.invalid/terms";
    forged.policy.supportUrl = "https://example.invalid/support";
    forged.policy.controllerMatchesVerifiedPublisher = true;
    forged.humanGates = forged.humanGates.map((gate: any) => ({ ...gate, status: "complete" }));
    forged.evidence = {
      portableConformanceReport: "self-asserted",
      openaiPreflightReport: "self-asserted",
      skillsBundleScan: "self-asserted",
      chatgptRuntime: "self-asserted",
      codexRuntime: "self-asserted",
      reviewOutcome: "self-asserted",
    };

    const result = validateValue(forged, contract, registry);
    assert.equal(result.valid, false);
    assert.ok(
      result.errors.some((error: any) => error.code === "ATTESTATION_VERIFIER_REQUIRED"),
      JSON.stringify(result.errors),
    );
  });

  it("keeps the skills-only source profile no-UI and media-free", () => {
    const contract = getContract(registry, "openai-submission-profile");
    const profile = JSON.parse(readFileSync(SUBMISSION_PROFILE, "utf8"));
    profile.experience.customUi = true;
    profile.experience.screenshots = ["submission/screenshot.png"];
    profile.experience.reviewRecordingRequired = true;
    const result = validateValue(profile, contract, registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error: any) => error.code === "CONST"));
  });
});
