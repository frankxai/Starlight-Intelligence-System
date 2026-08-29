import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { join, relative } from "node:path";
import { repoRootFromTestFile } from "./_lib/repo.js";

const ROOT = repoRootFromTestFile(import.meta.url);
const ACADEMY_ROOT = join(ROOT, "skills", "academy");
const PLUGIN_ROOT = join(ROOT, "plugins", "starlight-graph-engineering");
const PLUGIN_SKILLS_ROOT = join(PLUGIN_ROOT, "skills");

const ACADEMY_SKILLS = [
  "capability-graph-architecture",
  "execution-graph-engineering",
  "mission-graph-design",
  "evidence-graph-evaluation",
  "passport-graph-projection",
  "agent-team-composition",
] as const;

const EXPECTED_RULE_IDS = ACADEMY_SKILLS.map((skill) => `academy-${skill}`).sort();
const EXPECTED_SKILL_KEYS = ACADEMY_SKILLS.map((skill) => `academy/${skill}`).sort();

function json(path: string): any {
  return JSON.parse(readFileSync(path, "utf8"));
}

function files(root: string): string[] {
  const output: string[] = [];
  function walk(current: string): void {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const absolute = join(current, entry.name);
      if (entry.isDirectory()) walk(absolute);
      if (entry.isFile()) output.push(relative(root, absolute).replaceAll("\\", "/"));
    }
  }
  walk(root);
  return output.sort();
}

interface RegistryRow {
  skill: string;
  ruleId: string;
  status: string;
}

function academyRegistryRows(): RegistryRow[] {
  const registry = readFileSync(join(ROOT, "skills", "SKILL_REGISTRY.md"), "utf8");
  const section = registry.match(/### academy \(6\)\n([\s\S]*?)(?=\n### )/);
  assert.ok(section, "expected an Academy registry section declaring exactly six skills");
  return section[1]
    .split(/\r?\n/)
    .filter((line) => line.startsWith("| academy/"))
    .map((line) => {
      const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
      assert.equal(cells.length, 5, "Academy registry rows must retain the five-column contract");
      return { skill: cells[0], ruleId: cells[1], status: cells[4] };
    });
}

describe("Academy Graph registry and plugin release gate", () => {
  it("registers exactly six Academy activation rules and six matching experimental registry rows", () => {
    const rules = json(join(ROOT, "skills", "skill-rules.json")).rules
      .filter((rule: any) => typeof rule.skill === "string" && rule.skill.startsWith("academy/"));
    assert.deepEqual(rules.map((rule: any) => rule.id).sort(), EXPECTED_RULE_IDS);
    assert.deepEqual(rules.map((rule: any) => rule.skill).sort(), EXPECTED_SKILL_KEYS);
    for (const rule of rules) {
      assert.ok(rule.triggers.keywords.length > 0, `${rule.id} must declare keyword triggers`);
      assert.ok(rule.triggers.agents.length > 0, `${rule.id} must declare eligible agents`);
      assert.ok(rule.triggers.intents.length > 0, `${rule.id} must declare typed intents`);
      assert.equal(rule.priority, "high");
      assert.equal(rule.load_level, "core");
    }

    const rows = academyRegistryRows();
    assert.deepEqual(rows.map((row) => row.skill).sort(), EXPECTED_SKILL_KEYS);
    assert.deepEqual(rows.map((row) => row.ruleId).sort(), EXPECTED_RULE_IDS);
    assert.ok(rows.every((row) => row.status === "experimental"));
  });

  it("keeps every canonical Academy skill byte-exact in the distributable plugin", () => {
    assert.deepEqual(
      readdirSync(ACADEMY_ROOT, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort(),
      [...ACADEMY_SKILLS].sort(),
    );
    assert.deepEqual(
      readdirSync(PLUGIN_SKILLS_ROOT, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort(),
      [...ACADEMY_SKILLS].sort(),
    );

    for (const skill of ACADEMY_SKILLS) {
      const source = join(ACADEMY_ROOT, skill);
      const plugin = join(PLUGIN_SKILLS_ROOT, skill);
      const sourceFiles = files(source);
      assert.deepEqual(files(plugin), sourceFiles, `${skill} plugin file set drifted`);
      for (const file of sourceFiles) {
        assert.deepEqual(
          readFileSync(join(plugin, file)),
          readFileSync(join(source, file)),
          `${skill}/${file} is not a byte-exact canonical copy`,
        );
      }
    }
  });

  it("validates a safe skills-only plugin manifest with no hidden runtime surface", () => {
    const manifest = json(join(PLUGIN_ROOT, ".codex-plugin", "plugin.json"));
    assert.equal(manifest.name, "starlight-graph-engineering");
    assert.match(manifest.version, /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/);
    assert.equal(manifest.skills, "./skills/");
    assert.equal(manifest.author.name, "Starlight Intelligence");
    assert.ok(manifest.description.length > 0);
    assert.ok(manifest.interface.displayName.length > 0);
    assert.ok(manifest.interface.shortDescription.length >= 25);
    assert.ok(manifest.interface.shortDescription.length <= 64);
    assert.equal(manifest.interface.capabilities.length, 6);
    assert.ok(manifest.interface.capabilities.includes("Execution graph engineering"));
    assert.ok(manifest.interface.defaultPrompt.length <= 3);
    assert.ok(manifest.interface.defaultPrompt.every((prompt: string) => prompt.length <= 128));

    for (const forbidden of ["mcpServers", "apps", "hooks", "agents"]) {
      assert.equal(Object.hasOwn(manifest, forbidden), false, `${forbidden} must remain absent`);
    }
    for (const forbiddenPath of [".mcp.json", ".app.json", "hooks.json", "agents"]) {
      assert.equal(existsSync(join(PLUGIN_ROOT, forbiddenPath)), false, `${forbiddenPath} must remain absent`);
    }
  });

  it("preserves the open and payment-independent learning invariants in canonical skill text", () => {
    const readme = readFileSync(join(PLUGIN_ROOT, "README.md"), "utf8");
    const mission = readFileSync(join(ACADEMY_ROOT, "mission-graph-design", "SKILL.md"), "utf8");
    const evidence = readFileSync(join(ACADEMY_ROOT, "evidence-graph-evaluation", "SKILL.md"), "utf8");
    const passport = readFileSync(join(ACADEMY_ROOT, "passport-graph-projection", "SKILL.md"), "utf8");

    assert.match(readme, /Knowledge, capability and portability stay free\./);
    assert.match(mission, /complete reference mission must be possible without payment/i);
    assert.match(evidence, /same assessment path regardless of payment tier/i);
    assert.match(passport, /one complete private\/self-hosted path remain free/i);
  });

  it("removes the paid Evidence Sprint from the Academy release surface", () => {
    const releaseFiles = [
      join(ROOT, "foundry", "contracts", "academy-fabric"),
      join(ROOT, "docs", "architecture"),
      PLUGIN_ROOT,
    ].flatMap((root) => files(root).map((file) => join(root, file)))
      .filter((file) => /\.(?:json|ya?ml|md|mjs)$/.test(file));
    const releaseText = releaseFiles.map((file) => readFileSync(file, "utf8")).join("\n");

    for (const forbidden of [/Evidence Sprint/i, /€5,000/, /€2,500/, /purchased or sponsored entitlement/i, /paid gate/i]) {
      assert.doesNotMatch(releaseText, forbidden);
    }

    const academyPack = json(join(
      ROOT,
      "foundry",
      "contracts",
      "academy-fabric",
      "fixtures",
      "valid",
      "academy-pack.json",
    ));
    assert.equal(academyPack.slug, "ai-architect-graph-engineering-commons");
    assert.equal(academyPack.openAccessContract.completePathWithoutPayment, true);
  });

  it("keeps agent-team composition experimental and persistent agents inactive by default", () => {
    const agentRows = academyRegistryRows().filter(
      (row) => row.skill === "academy/agent-team-composition",
    );
    assert.equal(agentRows.length, 1);
    assert.equal(agentRows[0].status, "experimental");

    const agentSkill = readFileSync(
      join(ACADEMY_ROOT, "agent-team-composition", "SKILL.md"),
      "utf8",
    );
    const readme = readFileSync(join(PLUGIN_ROOT, "README.md"), "utf8");
    assert.match(agentSkill, /Keep persistent agents inactive until behavioral, security, and drift lanes pass\./);
    assert.match(readme, /This release is skills-only\./);
    assert.match(readme, /Persistent agent packs are compiled separately and remain inactive/);
    assert.equal(existsSync(join(PLUGIN_ROOT, "agents")), false);
  });
});
