import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { validateBlueprint } from "../blueprints/validate.mjs";

const testDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(testDir, "..");
const examplePath = join(
  repoRoot,
  "blueprints",
  "examples",
  "starlight-agent-launchpad.blueprint.json",
);
const example = JSON.parse(readFileSync(examplePath, "utf8"));

function clone(value = example) {
  return JSON.parse(JSON.stringify(value));
}

function codes(errors) {
  return errors.map((error) => error.code);
}

describe("Architecture Blueprint Manifest v1", () => {
  it("validates the Starlight Agent Launchpad candidate", () => {
    assert.deepEqual(validateBlueprint(example), []);
    assert.equal(example.status, "candidate");
    assert.equal(example.verification.state, "contract-valid");
    assert.deepEqual(
      example.adapters.map(({ id, state, required }) => ({ id, state, required })),
      [
        { id: "hermes-reasoning-adapter", state: "planned", required: false },
        { id: "n8n-workflow-adapter", state: "planned", required: false },
      ],
    );
  });

  it("pins the cross-repository Launchpad interface names", () => {
    const [cockpit, operator] = example.surfaces;
    assert.equal(cockpit.runtime, "nextjs-16-node-24");
    assert.deepEqual(
      cockpit.environment.map(({ name }) => name),
      ["RAILWAY_API_URL", "RAILWAY_API_TOKEN", "COCKPIT_ACCESS_TOKEN", "APP_ORIGIN"],
    );
    assert.equal(operator.runtime, "node-24");
    assert.deepEqual(
      operator.environment.map(({ name }) => name),
      ["OPERATOR_API_KEY", "RECEIPT_SIGNING_SECRET", "RECEIPT_SIGNING_KEY_ID", "DATABASE_URL"],
    );
    assert.equal(operator.deployment.iacPath, ".railway/railway.ts");
    assert.equal(example.controls.observability.correlationHeader, "x-correlation-id");
  });

  it("returns deterministic failures for the same input", () => {
    const manifest = clone();
    manifest.connections[0].to = "missing-operator";
    assert.deepEqual(validateBlueprint(manifest), validateBlueprint(manifest));
  });

  it("rejects undeclared manifest fields", () => {
    const manifest = clone();
    manifest.affiliateId = "not-part-of-the-contract";
    assert.ok(codes(validateBlueprint(manifest)).includes("ADDITIONAL_PROPERTY"));
  });

  it("rejects browser carriage of an operator secret", () => {
    const manifest = clone();
    manifest.connections[0].client = "browser";
    assert.ok(codes(validateBlueprint(manifest)).includes("BROWSER_SECRET_FORBIDDEN"));
  });

  it("rejects an unauthenticated browser path from Vercel to Railway", () => {
    const manifest = clone();
    manifest.connections[0].client = "browser";
    manifest.connections[0].auth = {
      mode: "none",
      sourceSecretRef: null,
      targetSecretRef: null,
    };
    const failures = codes(validateBlueprint(manifest));
    assert.ok(failures.includes("VERCEL_RAILWAY_SERVER_BOUNDARY_REQUIRED"));
    assert.ok(failures.includes("VERCEL_RAILWAY_AUTH_REQUIRED"));
  });

  it("rejects an unauthenticated server path from Vercel to Railway", () => {
    const manifest = clone();
    manifest.connections[0].auth = {
      mode: "none",
      sourceSecretRef: null,
      targetSecretRef: null,
    };
    assert.ok(codes(validateBlueprint(manifest)).includes("VERCEL_RAILWAY_AUTH_REQUIRED"));
  });

  it("rejects private or non-HTTPS Vercel to Railway connections", () => {
    const manifest = clone();
    manifest.connections[0].protocol = "other";
    manifest.surfaces[1].exposure = "private";
    assert.ok(codes(validateBlueprint(manifest)).includes("VERCEL_RAILWAY_PUBLIC_HTTPS_REQUIRED"));
  });

  it("rejects a connection to an unknown surface", () => {
    const manifest = clone();
    manifest.connections[0].to = "missing-operator";
    assert.ok(codes(validateBlueprint(manifest)).includes("UNKNOWN_SURFACE"));
  });

  it("requires available source to be pinned", () => {
    const manifest = clone();
    manifest.surfaces[0].source.state = "available";
    manifest.surfaces[0].source.ref = null;
    assert.ok(codes(validateBlueprint(manifest)).includes("AVAILABLE_SOURCE_INCOMPLETE"));
  });

  it("requires a published deployment to identify its derived template", () => {
    const manifest = clone();
    manifest.surfaces[1].deployment.state = "published";
    assert.ok(codes(validateBlueprint(manifest)).includes("PUBLISHED_TEMPLATE_REF_REQUIRED"));
  });

  it("requires Railway project IaC at the canonical path", () => {
    const manifest = clone();
    manifest.surfaces[1].deployment.iacPath = "railway.toml";
    assert.ok(codes(validateBlueprint(manifest)).includes("RAILWAY_IAC_REQUIRED"));
  });

  it("does not permit a verified claim with planned required checks", () => {
    const manifest = clone();
    manifest.status = "verified";
    manifest.verification.state = "production-proven";
    assert.ok(codes(validateBlueprint(manifest)).includes("REQUIRED_CHECK_NOT_PROVEN"));
  });

  it("rejects production promotion with token evidence and missing proof lanes", () => {
    const manifest = clone();
    manifest.status = "verified";
    manifest.verification.state = "production-proven";
    manifest.surfaces.forEach((surface, index) => {
      surface.source = {
        state: "available",
        repository: "https://github.com/frankxai/starlight-agent-launchpad",
        rootDirectory: index === 0 ? "apps/cockpit" : "services/operator",
        ref: "deadbeef",
      };
      surface.deployment.state = "available";
    });
    manifest.verification.checks = [
      {
        id: "manifest-contract",
        target: "manifest",
        kind: "schema",
        command: "npm run blueprints:validate",
        expected: "The manifest passes validation.",
        required: true,
        status: "passed",
        evidence: "trust-me",
      },
    ];
    const failures = codes(validateBlueprint(manifest));
    assert.ok(failures.includes("PRODUCTION_EVIDENCE_REQUIRED"));
    assert.ok(failures.includes("PRODUCTION_CHECK_COVERAGE"));
  });

  it("runs the checked-in validator as a CLI", () => {
    const result = spawnSync(process.execPath, ["blueprints/validate.mjs"], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Blueprint valid: starlight-agent-launchpad@0\.1\.0/);
  });
});
