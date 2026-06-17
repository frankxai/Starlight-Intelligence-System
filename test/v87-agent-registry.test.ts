/**
 * v8.7 Conformance Harness — agent-count symmetry across prompt surfaces
 *
 * Companion to:
 *   - test/v76.test.ts (agent registry symmetry, frontmatter completeness)
 *   - test/v78-skill-registry.test.ts (SKILL_REGISTRY.md ↔ skill-rules.json)
 *   - scripts/check-agent-harness.mjs (derive-and-assert guard for AGENTS.md)
 *
 * Walker-level fix for the 2026-06-10 audit finding: agent counts drifted in
 * 4 docs (AGENTS.md, CLAUDE.md, README.md, AGENT_REGISTRY.md headline) while
 * skill counts stayed accurate — because skill counts are covered by v77/v78
 * tests and agent counts were not. This test derives N from agents/**\/*.md
 * (the same derivation as listAgentFiles() in test/_lib/repo.ts and
 * deriveAgentCount() in scripts/check-agent-harness.mjs) and asserts every
 * doc surface publishes the derived count:
 *   - AGENTS.md: `**N named agents**`
 *   - CLAUDE.md: `**N Agents**` AND `N-agent registry`
 *   - README.md: `N agents`
 *   - agents/AGENT_REGISTRY.md headline: English word-form of N
 *   - every agent .md file is referenced by filename in AGENT_REGISTRY.md
 *     (catches unregistered agents — the Evaluator incident, 2026-06-10)
 *
 * SECURITY NOTE: per /openclaw-audit CRITICAL 2, NO assertion interpolates
 * raw fixture content into error messages. Trusted inputs only.
 *
 * ---
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 * - Substrate: starlightintelligence.org/protocol
 * - Layers used: [agent-registry, file-contract, attestation]
 * - Generated: 2026-06-10
 * ---
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { listAgentFiles, repoRootFromTestFile } from "./_lib/repo.js";

const REPO_ROOT = repoRootFromTestFile(import.meta.url);
const AGENTS_DIR = join(REPO_ROOT, "agents");
const REGISTRY_PATH = join(AGENTS_DIR, "AGENT_REGISTRY.md");

// ---------- helpers ----------

function readDoc(relPath: string): string {
  return readFileSync(join(REPO_ROOT, relPath), "utf8");
}

/**
 * English word-form for the derived agent count, capitalized as it appears
 * in the AGENT_REGISTRY.md headline (e.g., 48 -> "Forty-eight").
 * Covers 40-99 — the plausible drift window. If the count leaves this range,
 * extend TENS/ONES rather than weakening the assertion.
 */
function numberToHeadlineWord(n: number): string {
  const TENS: Record<number, string> = {
    40: "Forty",
    50: "Fifty",
    60: "Sixty",
    70: "Seventy",
    80: "Eighty",
    90: "Ninety",
  };
  const ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
  const tens = Math.floor(n / 10) * 10;
  const ones = n % 10;
  const tensWord = TENS[tens];
  assert.ok(
    tensWord !== undefined && n >= 40 && n <= 99,
    `agent count ${n} outside the 40-99 word-map range — extend numberToHeadlineWord() in test/v87-agent-registry.test.ts`,
  );
  return ones === 0 ? tensWord : `${tensWord}-${ONES[ones]}`;
}

/** Derived source-of-truth: agent .md files under agents/ (excl. AGENT_REGISTRY.md). */
const agentFiles = listAgentFiles(AGENTS_DIR);
const N = agentFiles.length;

// ---------- tests ----------

describe("v8.7 agent-count symmetry — derived count is sane", () => {
  it("derives a non-zero agent count from agents/**/*.md", () => {
    assert.ok(N > 0, "derived 0 agent files under agents/ — walker or directory layout broke");
  });
});

describe("v8.7 agent-count symmetry — doc surfaces publish the derived count", () => {
  it(`AGENTS.md claims **${N} named agents**`, () => {
    const text = readDoc("AGENTS.md");
    assert.ok(
      text.includes(`**${N} named agents**`),
      `AGENTS.md does not contain "**${N} named agents**" — update the agent-count claim to the derived count (${N})`,
    );
  });

  it(`CLAUDE.md claims **${N} Agents** and the ${N}-agent registry`, () => {
    const text = readDoc("CLAUDE.md");
    assert.ok(
      text.includes(`**${N} Agents**`),
      `CLAUDE.md does not contain "**${N} Agents**" — update the System Overview agent-count claim to the derived count (${N})`,
    );
    assert.ok(
      text.includes(`${N}-agent registry`),
      `CLAUDE.md does not contain "${N}-agent registry" — update the layer-routing registry reference to the derived count (${N})`,
    );
  });

  it(`README.md claims ${N} agents`, () => {
    const text = readDoc("README.md");
    assert.ok(
      text.includes(`${N} agents`),
      `README.md does not contain "${N} agents" — update the operational-layer agent-count claim to the derived count (${N})`,
    );
  });

  it(`agents/AGENT_REGISTRY.md headline carries the word-form of ${N}`, () => {
    const text = readFileSync(REGISTRY_PATH, "utf8");
    const headline = text.split(/\r?\n/).find((line) => line.startsWith("> "));
    assert.ok(headline, "AGENT_REGISTRY.md has no blockquote headline (line starting with '> ')");
    const wordForm = numberToHeadlineWord(N);
    assert.ok(
      headline.includes(wordForm),
      `AGENT_REGISTRY.md headline does not contain "${wordForm}" — derived agent count is ${N}; update the headline word-form (e.g., "${wordForm} minds.") to match`,
    );
  });
});

describe("v8.7 agent-count symmetry — every agent file is registered", () => {
  it("every agent .md under agents/ is referenced by filename in AGENT_REGISTRY.md", () => {
    const registry = readFileSync(REGISTRY_PATH, "utf8");
    const unregistered: string[] = [];
    for (const rel of agentFiles) {
      const basename = rel.includes("/") ? rel.slice(rel.lastIndexOf("/") + 1) : rel;
      if (!registry.includes(basename)) {
        unregistered.push(rel);
      }
    }
    assert.deepEqual(
      unregistered,
      [],
      `agent files with no filename reference in AGENT_REGISTRY.md (register them — Evaluator-incident class): ${unregistered.join(", ")}`,
    );
  });
});
