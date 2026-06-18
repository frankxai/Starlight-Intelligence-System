/**
 * v8.0 Conformance Harness — platform-prompt symmetry
 *
 * Companion to v76 (agent registry), v77 (skill rules), v78 (skill registry),
 * v79 (vertical coverage). Closes the last undefended SIP § 1 file-contract
 * surface: cross-platform system prompts.
 *
 * Guards: every platform-prompt surface (AGENTS.md, CLAUDE.md, .cursor/rules/*,
 * .clinerules/*, .gemini/GEMINI.md, .antigravity/* (instructions + swarm-protocol), GROK.md if present) must reference
 * the SAME load-bearing facts as the operational source-of-truth files.
 *
 * Facts asserted:
 *   - agent count   → matches `agents/AGENT_REGISTRY.md` table row count
 *   - skill count   → matches `skills/skill-rules.json` rules array length
 *   - vault count   → matches `memory/vaults/` unique vault file count (= 6)
 *   - SIP version   → matches `SIP.md` `Version:` line
 *   - SIS version   → matches `package.json::version` (instance-tier, italic-footer-anchored)
 *                     Added 2026-05-11 after substrate audit found CLAUDE.md
 *                     footer drifted to v2.0.0 while AGENTS.md was v8.0.0 —
 *                     same drift class as v77 audit (q1, 2026-05-07).
 *
 * Scope (operational tier):
 *   This is a defense layer for THIS reference build. It is NOT a SIP § 1
 *   protocol mandate — forks adopting SIP are not required to implement v80.
 *   Per /starlight-board verdict 2026-05-07-q2-v80-platform-prompt-symmetry:
 *   substrate spec docs (SIP.md, SIS.md) MUST NOT mention v80.
 *
 * Background: 2026-05-07 end-to-end excellence audit found AGENTS.md publishing
 * v2.0.0 / 7-personas / 16-skills lies for ~18 months while reality is v7.6.0 /
 * 35 / 63. Q1 (4d34e03) reconciled AGENTS.md; this test prevents recurrence.
 *
 * Performance budget: ≤1s cold (per board condition 1). Pure file-read +
 * regex match, no subprocess, no glob, no SQL.
 *
 * EXEMPT_DRIFT pattern (matches v77/v78/v79):
 *   Map<"file:claim-context", { reason, unpark_trigger }>. Goal: empty.
 *   Each entry must justify exemption with a specific un-park trigger.
 *
 * SECURITY NOTE: per /openclaw-audit CRITICAL 2 (v77 line 19), no assertion
 * interpolates raw fixture content into error messages. Trusted inputs only.
 *
 * ---
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 * - Substrate: starlightintelligence.org/protocol v1.1.1
 * - Layers used: [file-contract, attestation]
 * - Generated: 2026-05-07
 * ---
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { repoRootFromTestFile, listAgentFiles } from "./_lib/repo.js";

const REPO_ROOT = repoRootFromTestFile(import.meta.url);

// ---------- platform prompt inventory ----------
//
// Files checked. Missing files are skipped silently (a platform may not be
// in use); only PRESENT files are asserted. CLAUDE.md is canonical and
// always present. Grok (GROK.md) integrated 2026-06-02 via src/adapters/grok.ts
// + harnesses/grok/ + v80 excellence hook update for subagent/MCP/excellence symmetry.

const CANONICAL_PROMPTS = [
  "CLAUDE.md",
  "AGENTS.md",
] as const;

const PLATFORM_PROMPTS = [
  ".cursor/rules/starlight-agents.mdc",
  ".cursor/rules/starlight-core.mdc",
  ".cursor/rules/starlight-memory.mdc",
  ".clinerules/starlight.md",
  ".gemini/GEMINI.md",
  "GROK.md",  // Grok high-context adapter surface (src/adapters/grok.ts generateMemoryFile) — integrated per 2026-06-02 Grok addition + excellence hook mandate
  ".antigravity/instructions.md",  // Antigravity full instructions (the agent swarm, swarm, excellence) — 2026-06-02 enhancement
  ".antigravity/swarm-protocol.md",  // Executable multi-agent orchestration protocol + excellence patterns
] as const;

// ---------- exempt drift (technical-debt ledger) ----------
//
// Format: "<filepath>:<fact-kind>:<claimed-value>" → { reason, unpark_trigger }.
// Goal: empty Map. Adding an entry parks a known drift with explicit
// justification + a falsifiable un-park trigger.
//
// Example:
//   ["docs/legacy.md:agents:7", {
//     reason: "v2-era doc kept for historical reference",
//     unpark_trigger: "after deprecation pass 2026-Q3",
//   }],

const EXEMPT_DRIFT = new Map<
  string,
  { reason: string; unpark_trigger: string }
>([
  // Goal state. All canonical prompts reconciled to current truth in Q1
  // (commit 4d34e03, 2026-05-07).
]);

const EXEMPT_DRIFT_CEILING = 5;

// ---------- canonical truth ----------

interface Canonical {
  agentCount: number;
  skillCount: number;
  vaultCount: number;
  sipVersion: string;
  sisVersion: string;
}

function loadCanonical(): Canonical {
  // Agent count: count agent .md files (excluding AGENT_REGISTRY.md itself)
  const agentFiles = listAgentFiles(join(REPO_ROOT, "agents"));
  const agentCount = agentFiles.length;

  // Skill count: rules array length in skill-rules.json
  const rulesText = readFileSync(
    join(REPO_ROOT, "skills/skill-rules.json"),
    "utf8",
  );
  const rules = JSON.parse(rulesText);
  if (!Array.isArray(rules.rules)) {
    throw new Error("skill-rules.json missing 'rules' array");
  }
  const skillCount = rules.rules.length;

  // Vault count: count unique vault files in memory/vaults/
  const vaultsDir = join(REPO_ROOT, "memory/vaults");
  let vaultCount = 0;
  if (existsSync(vaultsDir)) {
    const entries = readdirSync(vaultsDir).filter((f) =>
      statSync(join(vaultsDir, f)).isFile(),
    );
    const vaultNames = new Set<string>();
    for (const f of entries) {
      // Normalize: strategic-vault.md → strategic; strategic.jsonl → strategic
      const base = f
        .replace(/\.(md|jsonl)$/, "")
        .replace(/-vault$/, "");
      if (base) vaultNames.add(base);
    }
    vaultCount = vaultNames.size;
  }

  // SIP version: Version: `v1.1.1` line in SIP.md
  const sipText = readFileSync(join(REPO_ROOT, "SIP.md"), "utf8");
  const sipMatch = sipText.match(/^Version:\s*`(v[\d.]+)`/m);
  if (!sipMatch) {
    throw new Error("SIP.md missing canonical 'Version: `vX.Y.Z`' line");
  }
  const sipVersion = sipMatch[1]!;

  // SIS version: package.json::version is the canonical instance-tier source.
  // Format normalized to "vX.Y.Z" to match the footer-italic claim shape.
  const pkgText = readFileSync(join(REPO_ROOT, "package.json"), "utf8");
  const pkg = JSON.parse(pkgText);
  if (typeof pkg.version !== "string" || !/^\d+\.\d+\.\d+/.test(pkg.version)) {
    throw new Error("package.json missing canonical 'version' field (X.Y.Z)");
  }
  const sisVersion = `v${pkg.version}`;

  return { agentCount, skillCount, vaultCount, sipVersion, sisVersion };
}

// ---------- claim extraction ----------

interface Claim {
  kind: "agents" | "skills" | "vaults" | "sipVersion" | "sisVersion";
  value: string; // numeric as string for agents/skills/vaults; "v1.1.1" / "v8.0.0" for versions
  context: string; // surrounding ~30 chars for diagnostic
}

// Patterns deliberately narrow to avoid false-positives. Only match a numeric
// or version claim immediately followed by the fact noun (agents/skills/etc.)
// or, for SIP version, "SIP" preceding "v1.1.1".
//
// Per /starlight-board verdict 2026-05-07: only match within fact-context.

const PATTERNS: Array<{ kind: Claim["kind"]; re: RegExp }> = [
  // "<n> agents" / "<n> named agents" / "<n> specialized intelligence personas/agents"
  { kind: "agents", re: /\b(\d+)\s+(?:specialized\s+(?:intelligence\s+)?)?(?:named\s+)?(?:intelligence\s+)?(?:agents?|personas?)\b/gi },
  // "<n> skills" / "<n> auto-activating skills" / "<n> skill rules"
  { kind: "skills", re: /\b(\d+)\s+(?:auto-activating\s+)?skill(?:\s+rules?)?s?\b/gi },
  // "<n> vaults" / "<n> semantic vaults" / "<n> persistent memory vaults"
  { kind: "vaults", re: /\b(\d+)\s+(?:semantic\s+|persistent\s+memory\s+|memory\s+)?vaults?\b/gi },
  // "SIP v1.1.1" / "SIP version 1.1.1" / "SIP-compliant"
  { kind: "sipVersion", re: /SIP\s+v(\d+\.\d+\.\d+)/g },
  // "*Starlight Intelligence System v8.0.0*" — anchored to italic-asterisk
  // footer/header context per Board verdict 2026-05-11 (Verifier REVISE).
  // The leading `\*` and trailing ` —` discriminate footer claims from
  // historical body mentions like "v7.4 alpha shipped" or "the v2.0 era".
  // EXEMPT_DRIFT covers any legitimate historical italic mention that should
  // not be reconciled.
  { kind: "sisVersion", re: /\*Starlight Intelligence System v(\d+\.\d+\.\d+)/g },
];

// Context patterns that mark a claim as LOCAL (sub-stack / tier-specific)
// rather than a GLOBAL substrate claim. These claims are legitimate localized
// counts (Sound IS = 6 agents, Music IS = 7 agents, Front-Door tier = 3) and
// should NOT be compared against the global canonical count.
const LOCAL_CONTEXT_BLACKLIST: RegExp[] = [
  /sub-stack/i,
  /\bTier\b/i,
  /Front-Door|Excavation|Leadership|Specialist|Foundation/i,
  /\bTier:\s/i,
  /Blueprint/i,
];

function extractClaims(text: string): Claim[] {
  const claims: Claim[] = [];
  for (const { kind, re } of PATTERNS) {
    for (const m of text.matchAll(re)) {
      const value =
        kind === "sipVersion" || kind === "sisVersion"
          ? `v${m[1]}`
          : m[1]!;
      const start = Math.max(0, m.index! - 50);
      const end = Math.min(text.length, m.index! + m[0].length + 50);
      const context = text
        .slice(start, end)
        .replace(/\s+/g, " ")
        .trim();
      // Skip local-scope claims (sub-stack / tier-specific localized counts)
      if (LOCAL_CONTEXT_BLACKLIST.some((pat) => pat.test(context))) continue;
      claims.push({ kind, value, context });
    }
  }
  return claims;
}

function exemptKey(file: string, kind: string, value: string): string {
  return `${file}:${kind}:${value}`;
}

// ---------- tests ----------

describe("v8.0 platform-prompt symmetry — canonical prompts match operational truth", () => {
  it("AGENTS.md + CLAUDE.md numeric claims match canonical agent/skill/vault counts", () => {
    const canon = loadCanonical();
    const expected = {
      agents: String(canon.agentCount),
      skills: String(canon.skillCount),
      vaults: String(canon.vaultCount),
      sipVersion: canon.sipVersion,
      sisVersion: canon.sisVersion,
    };

    const violations: string[] = [];

    for (const file of CANONICAL_PROMPTS) {
      const path = join(REPO_ROOT, file);
      if (!existsSync(path)) {
        violations.push(`MISSING canonical prompt: ${file}`);
        continue;
      }
      const text = readFileSync(path, "utf8");
      const claims = extractClaims(text);

      for (const claim of claims) {
        const expectedValue = expected[claim.kind];
        if (claim.value !== expectedValue) {
          const key = exemptKey(file, claim.kind, claim.value);
          if (EXEMPT_DRIFT.has(key)) continue;
          violations.push(
            `${file}: claims ${claim.kind}=${claim.value}, canonical=${expectedValue} (context: "${claim.context}")`,
          );
        }
      }
    }

    assert.deepEqual(
      violations,
      [],
      `Platform-prompt drift detected (${violations.length} violations). ` +
        `Either reconcile the prompt to canonical truth, or add an EXEMPT_DRIFT entry with reason + unpark_trigger.\n` +
        violations.join("\n"),
    );
  });

  it("present platform-adapter prompts (.cursor/.clinerules/.gemini/.antigravity + grok) match canonical", () => {
    const canon = loadCanonical();
    const expected = {
      agents: String(canon.agentCount),
      skills: String(canon.skillCount),
      vaults: String(canon.vaultCount),
      sipVersion: canon.sipVersion,
      sisVersion: canon.sisVersion,
    };

    const violations: string[] = [];

    for (const file of PLATFORM_PROMPTS) {
      const path = join(REPO_ROOT, file);
      if (!existsSync(path)) continue; // missing platform prompt = not in use; skip

      const text = readFileSync(path, "utf8");
      const claims = extractClaims(text);

      for (const claim of claims) {
        const expectedValue = expected[claim.kind];
        if (claim.value !== expectedValue) {
          const key = exemptKey(file, claim.kind, claim.value);
          if (EXEMPT_DRIFT.has(key)) continue;
          violations.push(
            `${file}: claims ${claim.kind}=${claim.value}, canonical=${expectedValue} (context: "${claim.context}")`,
          );
        }
      }
    }

    assert.deepEqual(
      violations,
      [],
      `Platform-adapter drift detected (${violations.length} violations).\n` +
        violations.join("\n"),
    );
  });
});

describe("v8.0 platform-prompt symmetry — debt-ledger guardrails", () => {
  it(`EXEMPT_DRIFT size <= ${EXEMPT_DRIFT_CEILING} (drift-ledger ceiling)`, () => {
    assert.ok(
      EXEMPT_DRIFT.size <= EXEMPT_DRIFT_CEILING,
      `EXEMPT_DRIFT has ${EXEMPT_DRIFT.size} entries; ceiling is ${EXEMPT_DRIFT_CEILING}. Reconcile drift or raise ceiling with justification.`,
    );
  });

  it("every EXEMPT_DRIFT entry has non-empty reason + unpark_trigger", () => {
    const malformed: string[] = [];
    for (const [key, meta] of EXEMPT_DRIFT.entries()) {
      if (!meta.reason || !meta.reason.trim()) {
        malformed.push(`${key}: empty reason`);
      }
      if (!meta.unpark_trigger || !meta.unpark_trigger.trim()) {
        malformed.push(`${key}: empty unpark_trigger`);
      }
    }
    assert.deepEqual(
      malformed,
      [],
      `EXEMPT_DRIFT entries missing reason or unpark_trigger:\n${malformed.join("\n")}`,
    );
  });
});

describe("v8.0 platform-prompt symmetry — performance gate", () => {
  it("entire test suite runs under 1000ms (board condition 1)", () => {
    const start = process.hrtime.bigint();
    loadCanonical();
    for (const file of [...CANONICAL_PROMPTS, ...PLATFORM_PROMPTS]) {
      const path = join(REPO_ROOT, file);
      if (!existsSync(path)) continue;
      extractClaims(readFileSync(path, "utf8"));
    }
    const elapsedMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    assert.ok(
      elapsedMs < 1000,
      `v80 took ${elapsedMs.toFixed(1)}ms; budget is 1000ms (board condition 1)`,
    );
  });
});
