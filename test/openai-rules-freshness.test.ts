import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { validateOpenAIPluginPackage } from "../tools/foundry/lib/openai-preflight.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PLUGIN = join(ROOT, "plugins", "starlight-foundry");
const RULES = join(
  ROOT,
  "foundry",
  "validators",
  "openai",
  "plugin-rules.v2026-10-04.json",
);
const LOCK = join(ROOT, "foundry", "validators", "toolchain.lock.v1.json");

function check(report: ReturnType<typeof validateOpenAIPluginPackage>, id: string) {
  return report.checks.find((candidate) => candidate.id === id);
}

describe("OpenAI docs-derived rules freshness", () => {
  it("accepts reviewed rules during their review window, including the boundary", () => {
    for (const evaluationDate of ["2026-10-04", "2026-11-03"]) {
      const report = validateOpenAIPluginPackage(PLUGIN, { evaluationDate });
      assert.equal(report.status, "pass", JSON.stringify(report.errors));
      assert.equal(check(report, "rules-lock")?.status, "pass");
      assert.equal(check(report, "rules-freshness")?.status, "pass");
    }
  });

  it("rejects reviewed rules after the review boundary", () => {
    const report = validateOpenAIPluginPackage(PLUGIN, { evaluationDate: "2026-11-04" });
    assert.equal(report.status, "fail");
    assert.equal(check(report, "rules-lock")?.status, "pass");
    assert.equal(check(report, "rules-freshness")?.status, "fail");
    assert.deepEqual(report.errors.map((error) => error.code), ["RULES_FRESHNESS"]);
  });

  it("rejects tampered rules even while the review window is current", () => {
    const temp = mkdtempSync(join(tmpdir(), "openai-rules-tamper-"));
    try {
      const rules = JSON.parse(readFileSync(RULES, "utf8"));
      rules.listing.displayNameMaxLength = 31;
      const rulesPath = join(temp, "rules.json");
      writeFileSync(rulesPath, `${JSON.stringify(rules, null, 2)}\n`);

      const report = validateOpenAIPluginPackage(PLUGIN, {
        rulesPath,
        evaluationDate: "2026-10-04",
      });
      assert.equal(report.status, "fail");
      assert.equal(check(report, "rules-lock")?.status, "fail");
      assert.ok(report.errors.some((error) => error.code === "RULES_LOCK"));
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("rejects a tampered lock even when the rules digest is unchanged", () => {
    const temp = mkdtempSync(join(tmpdir(), "openai-lock-tamper-"));
    try {
      const lock = JSON.parse(readFileSync(LOCK, "utf8"));
      lock.openai.rules.sha256 = "0".repeat(64);
      const toolchainLockPath = join(temp, "toolchain-lock.json");
      writeFileSync(toolchainLockPath, `${JSON.stringify(lock, null, 2)}\n`);

      const report = validateOpenAIPluginPackage(PLUGIN, {
        toolchainLockPath,
        evaluationDate: "2026-10-04",
      });
      assert.equal(report.status, "fail");
      assert.equal(check(report, "rules-lock")?.status, "fail");
      assert.ok(report.errors.some((error) => error.code === "RULES_LOCK"));
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });
});
