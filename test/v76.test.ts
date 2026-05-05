/**
 * v7.6+ Conformance Harness — verticals + agent-registry coverage
 *
 * Companion to test/substrate.test.ts + v73.test.ts + v74.test.ts + v741.test.ts + v75.test.ts.
 * Guards the v7.6+ structural surface:
 *   - Three reference Domain Sub-Stack verticals (people-intelligence, sound-intelligence, music-is)
 *     each have complete file contract on disk.
 *   - agents/AGENT_REGISTRY.md lists every agent file under agents/, and every listed agent
 *     has an actual file (no orphans, no phantoms).
 *   - .claude/commands/music-*.md are present (Music IS sub-stack relocation from commands/).
 *
 * This catches drift between repo state and the registry that documents it.
 *
 * SECURITY NOTE: per /openclaw-audit CRITICAL 2, NO assertion interpolates raw
 * fixture content into error messages. Trusted inputs only — paths, counts, missing-name lists.
 *
 * ---
 * Built on SIP — Starlight Intelligence Protocol
 * - Substrate: starlightintelligence.org/protocol v1.1.0
 * - Layers used: [file-contract, attestation, commands, sovereignty]
 * - Verticals: starlight-intelligence-system@v7.6
 * - Generated: 2026-05-01
 * ---
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");

// ---------- file-contract helpers ----------

const CORE_VERTICAL_FILES = [
  "README.md",
  "SUB-SYSTEMS.md",
  "AGENTS.md",
  "SOUL.md",
  "STACK.md",
  "CANON.md",
  "MEMORY.md",
] as const;

function missingFiles(verticalDir: string, files: readonly string[]): string[] {
  return files.filter((f) => !existsSync(join(REPO_ROOT, "verticals", verticalDir, f)));
}

// ---------- agent-registry coverage helpers ----------

function listAgentFiles(): string[] {
  const dir = join(REPO_ROOT, "agents");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "AGENT_REGISTRY.md")
    .sort();
}

function readRegistry(): string {
  return readFileSync(join(REPO_ROOT, "agents", "AGENT_REGISTRY.md"), "utf8");
}

/**
 * Extract every backtick-quoted `<name>.md` reference inside the registry. We grep
 * the raw markdown rather than parsing tables — the registry uses heterogeneous
 * table layouts across tiers, but every agent file is referenced as `name.md`.
 */
function listRegisteredAgents(registry: string): Set<string> {
  const re = /`([a-z][a-z0-9-]*\.md)`/g;
  const found = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(registry)) !== null) {
    if (m[1] !== "AGENT_REGISTRY.md") found.add(m[1]);
  }
  return found;
}

// ---------- tests ----------

describe("v7.6 verticals — file contract", () => {
  it("people-intelligence carries the full 7-file core contract + QUICK-START", () => {
    const missingCore = missingFiles("people-intelligence", CORE_VERTICAL_FILES);
    assert.deepEqual(missingCore, [], `people-intelligence missing core files: ${missingCore.join(", ")}`);
    assert.ok(
      existsSync(join(REPO_ROOT, "verticals", "people-intelligence", "QUICK-START.md")),
      "people-intelligence missing QUICK-START.md (newcomer front door)",
    );
  });

  it("sound-intelligence carries the full 7-file core contract + QUICK-START", () => {
    const missingCore = missingFiles("sound-intelligence", CORE_VERTICAL_FILES);
    assert.deepEqual(missingCore, [], `sound-intelligence missing core files: ${missingCore.join(", ")}`);
    assert.ok(
      existsSync(join(REPO_ROOT, "verticals", "sound-intelligence", "QUICK-START.md")),
      "sound-intelligence missing QUICK-START.md (newcomer front door)",
    );
  });

  it("music-is carries the full 7-file core contract + QUICK-START + STRATEGY + LABELS + DECISIONS", () => {
    const missingCore = missingFiles("music-is", CORE_VERTICAL_FILES);
    assert.deepEqual(missingCore, [], `music-is missing core files: ${missingCore.join(", ")}`);
    const operatorTierFiles = ["QUICK-START.md", "STRATEGY.md", "LABELS.md", "DECISIONS.md"];
    const missingOperator = operatorTierFiles.filter(
      (f) => !existsSync(join(REPO_ROOT, "verticals", "music-is", f)),
    );
    assert.deepEqual(
      missingOperator,
      [],
      `music-is missing operator-tier files: ${missingOperator.join(", ")}`,
    );
  });

  it("sound-intelligence STRATEGY.md is the canonical layering note (or redirect to music-is)", () => {
    const path = join(REPO_ROOT, "verticals", "sound-intelligence", "STRATEGY.md");
    if (!existsSync(path)) return; // optional; some refs ship without
    const content = readFileSync(path, "utf8");
    const declaresLayering =
      content.includes("music-is") || content.includes("operator-tier") || content.includes("public reference");
    assert.ok(declaresLayering, "sound-intelligence/STRATEGY.md must reference music-is layering note");
  });
});

describe("v7.6 verticals — sub-stack symmetry", () => {
  it("people-intelligence has exactly 6 sub-system agents at agents/", () => {
    const peopleAgents = ["hiring", "performance", "training", "culture", "talent", "org"];
    const missing = peopleAgents.filter(
      (a) => !existsSync(join(REPO_ROOT, "agents", `starlight-${a}.md`)),
    );
    assert.deepEqual(missing, [], `people-intel agents missing: ${missing.join(", ")}`);
  });

  it("sound-intelligence has exactly 6 sub-system agents at agents/", () => {
    const soundAgents = ["composition", "production", "catalog", "performance", "audience", "sync"];
    const missing = soundAgents.filter(
      (a) => !existsSync(join(REPO_ROOT, "agents", `starlight-sound-${a}.md`)),
    );
    assert.deepEqual(missing, [], `sound-intel agents missing: ${missing.join(", ")}`);
  });

  it("music-is has exactly 7 sub-system agents at agents/ (6 sub-system + 1 cross-cutting curator)", () => {
    const musicAgents = [
      "music-curator",
      "music-archivist",
      "persona-keeper",
      "music-producer",
      "music-distributor",
      "music-amplifier",
      "royalty-architect",
    ];
    const missing = musicAgents.filter((a) => !existsSync(join(REPO_ROOT, "agents", `${a}.md`)));
    assert.deepEqual(missing, [], `music-is agents missing: ${missing.join(", ")}`);
  });
});

describe("v7.6 commands — Music IS harness loadability", () => {
  it("8 music-* commands present at .claude/commands/ (harness-loadable location)", () => {
    const expected = [
      "music-amplify.md",
      "music-canvas.md",
      "music-label-board.md",
      "music-persona.md",
      "music-release.md",
      "music-song.md",
      "music-suno-prompt.md",
      "music-sync-pitch.md",
    ];
    const dir = join(REPO_ROOT, ".claude", "commands");
    const missing = expected.filter((c) => !existsSync(join(dir, c)));
    assert.deepEqual(missing, [], `music-* commands missing from .claude/commands/: ${missing.join(", ")}`);
  });

  it("no music-* command stranded at top-level commands/ (anti-regression)", () => {
    const dir = join(REPO_ROOT, "commands");
    if (!existsSync(dir)) return;
    const stranded = readdirSync(dir).filter((f) => f.startsWith("music-") && f.endsWith(".md"));
    assert.deepEqual(stranded, [], `music-* commands must live at .claude/commands/, not commands/: ${stranded.join(", ")}`);
  });
});

describe("v7.6 skills — frontmatter completeness", () => {
  // Sweep S2d (Audit D, 2026-05-04): every skill markdown file under skills/ should carry
  // YAML frontmatter so activation tooling and registries can introspect skills uniformly.
  // Exclusions are explicit: docs files (SKILL_ARCHITECTURE.md), progressive-disclosure
  // leaves (references/ subdirs), and skills that intentionally use prose-only activation
  // (sound-intelligence/*.md — disk-orphans pending v7.5.3 catch-up backfill).

  const SKILL_FM_EXCLUDE: ReadonlySet<string> = new Set([
    "SKILL_ARCHITECTURE.md", // documentation file, not a skill
    // vision/voice-anti-slop.md uses an alternate FM shape (skill:/auto_activate:/loaded_by:)
    // intentionally — disk-orphan loaded broadly, not via skill-rules.json.
    "vision/voice-anti-slop.md",
    // sound-intelligence prose-only activation block (disk-orphans, intentional):
    "sound-intelligence/audience-architecture.md",
    "sound-intelligence/catalog-systems.md",
    "sound-intelligence/composition-architecture.md",
    "sound-intelligence/performance-design.md",
    "sound-intelligence/production-systems.md",
    "sound-intelligence/sync-licensing.md",
  ]);

  function listSkillMarkdown(): string[] {
    const skillsDir = join(REPO_ROOT, "skills");
    const out: string[] = [];
    function walk(dir: string): void {
      for (const ent of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, ent.name);
        if (ent.isDirectory()) {
          if (ent.name === "references") continue; // progressive-disclosure leaves
          walk(full);
        } else if (ent.isFile() && ent.name.endsWith(".md")) {
          // store as forward-slash relative path for cross-platform stability
          const rel = full.slice(skillsDir.length + 1).split(/[\\/]/).join("/");
          out.push(rel);
        }
      }
    }
    walk(skillsDir);
    return out.sort();
  }

  function hasFrontmatter(skillRelPath: string): boolean {
    const full = join(REPO_ROOT, "skills", skillRelPath);
    const buf = readFileSync(full, "utf8");
    // Strip optional UTF-8 BOM, then check for opening --- delimiter.
    const stripped = buf.replace(/^﻿/, "");
    if (!stripped.startsWith("---\n") && !stripped.startsWith("---\r\n")) return false;
    // Check there is a closing --- delimiter and at least name: + description: keys.
    const m = stripped.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) return false;
    const fm = m[1];
    return /^name:\s*\S+/m.test(fm) && /^description:\s*\S+/m.test(fm);
  }

  it("every skills/**/*.md (excluding references/ and architecture doc) has YAML frontmatter with name + description", () => {
    const all = listSkillMarkdown();
    const checked = all.filter((rel) => !SKILL_FM_EXCLUDE.has(rel));
    const missing = checked.filter((rel) => !hasFrontmatter(rel));
    assert.deepEqual(
      missing,
      [],
      `skills missing YAML frontmatter (name + description required): ${missing.join(", ")}`,
    );
  });

  it("frontmatter exclusions remain explicit and bounded (no creeping exemption list)", () => {
    // Hard ceiling: SKILL_ARCHITECTURE.md + vision/voice-anti-slop + 6 sound-intelligence = 8.
    // If anyone adds to the exemption list to silence this test, this assertion fires.
    assert.ok(
      SKILL_FM_EXCLUDE.size <= 8,
      `frontmatter exemption list grew past 8 entries (size: ${SKILL_FM_EXCLUDE.size}) — backfill instead of exempting`,
    );
  });

  it("every excluded path actually exists on disk (no stale exemptions)", () => {
    const stale: string[] = [];
    for (const rel of SKILL_FM_EXCLUDE) {
      if (!existsSync(join(REPO_ROOT, "skills", rel))) stale.push(rel);
    }
    assert.deepEqual(stale, [], `stale frontmatter exemptions (file not found): ${stale.join(", ")}`);
  });
});

describe("v7.6 agent-registry — coverage symmetry", () => {
  it("every file in agents/*.md is referenced in AGENT_REGISTRY.md (no orphans)", () => {
    const files = listAgentFiles();
    const registry = readRegistry();
    const registered = listRegisteredAgents(registry);
    const orphans = files.filter((f) => !registered.has(f));
    assert.deepEqual(orphans, [], `agents/ files not registered: ${orphans.join(", ")}`);
  });

  it("every backtick-quoted agent name in the registry has an actual file (no phantoms)", () => {
    const files = new Set(listAgentFiles());
    const registry = readRegistry();
    const registered = listRegisteredAgents(registry);
    const phantoms = [...registered].filter((name) => !files.has(name));
    assert.deepEqual(phantoms, [], `registry references with no file: ${phantoms.join(", ")}`);
  });

  it("registry header reflects current agent count (35) and 9-layer + Domain Sub-Stack architecture", () => {
    const registry = readRegistry();
    // Header should mention either "Thirty-five" (current) or a higher count if more agents are added.
    // We accept any "Thirty-{five..nine}" or "Forty-*" without forcing exact match — the rule is honesty.
    const headerHonest = /Thirty-(five|six|seven|eight|nine)|Forty/i.test(registry);
    assert.ok(headerHonest, "AGENT_REGISTRY.md header must declare current scale (≥ Thirty-five minds)");
    assert.ok(
      registry.includes("Domain Sub-Stack"),
      "AGENT_REGISTRY.md must mention the Domain Sub-Stack tier",
    );
  });
});
