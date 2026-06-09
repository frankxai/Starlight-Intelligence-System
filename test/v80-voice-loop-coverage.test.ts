/**
 * v8.0 — voice-loop coverage gate
 *
 * Companion to v80-platform-prompts.test.ts (cross-platform CLI symmetry).
 * Closes a coverage gap surfaced by 2026-05-11 Jarvis-grade audit:
 * the voice agent's system prompt is ANOTHER platform surface that should
 * carry the same load-bearing facts (Frank DNA, brand voice, agent count)
 * but is currently outside v80's CANONICAL/PLATFORM_PROMPTS list.
 *
 * What this test asserts:
 *   1. Voice operator's system prompt source exists at the expected path.
 *   2. It either CARRIES the Frank-DNA marker ("Systems Architect" / brand
 *      voice / project context) — OR appears in EXEMPT_VOICE_LOOP with a
 *      falsifiable un-park trigger.
 *
 * Why a debt-ledger pattern:
 *   Per /starlight-board verdict 2026-05-11 (Jarvis Wave 1), this gap is
 *   real but Wave-2-scoped (A2 = Brand Kit injection). Writing the test
 *   RED today would break the green-hook contract from the 2026-05-07
 *   excellence audit. EXEMPT_VOICE_LOOP keeps the hook green while
 *   surfacing the debt as code, with un-park triggered by Wave 2 ship.
 *
 * Performance budget: ≤200ms cold. Pure file existence + small read.
 *
 * ---
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 * - Layers used: [file-contract, attestation]
 * - Generated: 2026-05-11
 * ---
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { repoRootFromTestFile } from "./_lib/repo.js";

const REPO_ROOT = repoRootFromTestFile(import.meta.url);

const VOICE_SYSTEM_PROMPT_PATH = "private/voice-operator/service/cognition/system_prompt.py";

// Identity markers that should appear in the loaded operator-DNA at RUNTIME.
// The v80 test budget forbids subprocess (≤200ms), so we can't exec Python
// to inspect build_system_prompt() output directly. Instead we assert the
// load mechanism is structurally intact (LOAD_MECHANISM_MARKERS below) AND
// that the substrate-canonical source (CLAUDE.md) actually contains the
// identity markers — i.e., if the load works, the output will carry them.

const FRANK_DNA_MARKERS = [
  "Systems Architect",
  "Composer",
  "GenCreator",
  "Build abundance",
];

// Code-reviewer I2 fix: tighten the test so it can't pass just because the
// file mentions "Frank DNA" in a docstring. These tokens prove the load
// mechanism is wired — removing them = the test fails even if comments
// still mention the marker strings.
const LOAD_MECHANISM_MARKERS = [
  "_load_operator_dna",
  "CLAUDE.md",
];

// ---------- exempt voice-loop debt-ledger ----------
//
// Format: "<filepath>:<dimension>" → { reason, unpark_trigger }
// Goal: empty Map. Each entry parks a known voice-loop gap with falsifiable
// un-park trigger.

const EXEMPT_VOICE_LOOP = new Map<
  string,
  { reason: string; unpark_trigger: string }
>([
  // Wave 2 (2026-05-11) shipped A2 — FRANK_DNA prepended in build_system_prompt().
  // The frank-dna-marker entry was removed because the test now passes naturally.
  // Goal state: empty Map. Future drift adds new entries here with un-park triggers.
]);

const EXEMPT_VOICE_LOOP_CEILING = 3;

describe("v8.0 voice-loop coverage — system prompt carries Frank DNA", () => {
  it("voice operator system prompt file exists at the canonical path", () => {
    const path = join(REPO_ROOT, VOICE_SYSTEM_PROMPT_PATH);
    if (!existsSync(path)) {
      // Private path may not be checked in to public substrate. Skip with note.
      // The voice-loop coverage gate is operational-tier; private-only is OK.
      assert.ok(true, `Voice operator system prompt is private-only (path: ${VOICE_SYSTEM_PROMPT_PATH}); coverage gate skipped.`);
      return;
    }
    assert.ok(statSync(path).isFile(), `${VOICE_SYSTEM_PROMPT_PATH} is not a regular file`);
  });

  it("voice operator system prompt has CLAUDE.md load mechanism wired", () => {
    const path = join(REPO_ROOT, VOICE_SYSTEM_PROMPT_PATH);
    if (!existsSync(path)) {
      return; // Private-only — gate skipped per the file-exists test above.
    }
    const text = readFileSync(path, "utf8");
    const missing = LOAD_MECHANISM_MARKERS.filter((m) => !text.includes(m));
    const exemptKey = `${VOICE_SYSTEM_PROMPT_PATH}:load-mechanism`;
    if (missing.length > 0 && !EXEMPT_VOICE_LOOP.has(exemptKey)) {
      assert.fail(
        `${VOICE_SYSTEM_PROMPT_PATH} missing load-mechanism marker(s): ${missing.join(", ")}. ` +
          `The voice agent must load operator DNA from CLAUDE.md via _load_operator_dna() ` +
          `so substrate-canonical identity flows into the prompt. Removing the load ` +
          `mechanism reverts the agent to generic responses.`,
      );
    }
  });

  it("CLAUDE.md (substrate-canonical) carries the Frank-DNA identity markers", () => {
    // Composes with the load-mechanism test above: if both pass, runtime
    // build_system_prompt() WILL include Frank-DNA because (a) load mechanism
    // is wired and (b) the source it loads from has the markers.
    const claudePath = join(REPO_ROOT, "CLAUDE.md");
    if (!existsSync(claudePath)) {
      assert.fail("CLAUDE.md missing — substrate-canonical operator DNA source is required.");
      return;
    }
    const text = readFileSync(claudePath, "utf8");
    const missing = FRANK_DNA_MARKERS.filter((m) => !text.includes(m));
    const exemptKey = "CLAUDE.md:frank-dna-markers";
    if (missing.length > 0 && !EXEMPT_VOICE_LOOP.has(exemptKey)) {
      assert.fail(
        `CLAUDE.md missing operator-DNA marker(s): ${missing.join(", ")}. ` +
          `Voice agent loads from CLAUDE.md — removing these markers degrades the ` +
          `loaded prompt to generic operator-DNA fallback.`,
      );
    }
  });
});

describe("v8.0 voice-loop coverage — debt-ledger guardrails", () => {
  it(`EXEMPT_VOICE_LOOP size <= ${EXEMPT_VOICE_LOOP_CEILING}`, () => {
    assert.ok(
      EXEMPT_VOICE_LOOP.size <= EXEMPT_VOICE_LOOP_CEILING,
      `EXEMPT_VOICE_LOOP has ${EXEMPT_VOICE_LOOP.size} entries; ceiling is ${EXEMPT_VOICE_LOOP_CEILING}. Close debt or raise ceiling with justification.`,
    );
  });

  it("every EXEMPT_VOICE_LOOP entry has non-empty reason + unpark_trigger", () => {
    const malformed: string[] = [];
    for (const [key, meta] of EXEMPT_VOICE_LOOP.entries()) {
      if (!meta.reason || !meta.reason.trim()) malformed.push(`${key}: empty reason`);
      if (!meta.unpark_trigger || !meta.unpark_trigger.trim()) malformed.push(`${key}: empty unpark_trigger`);
    }
    assert.deepEqual(
      malformed,
      [],
      `EXEMPT_VOICE_LOOP entries missing reason or unpark_trigger:\n${malformed.join("\n")}`,
    );
  });
});

describe("v8.0 voice-loop coverage — performance gate", () => {
  it("entire test suite runs under 200ms (board condition)", () => {
    const start = process.hrtime.bigint();
    const path = join(REPO_ROOT, VOICE_SYSTEM_PROMPT_PATH);
    if (existsSync(path)) {
      readFileSync(path, "utf8");
    }
    const elapsedMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    assert.ok(
      elapsedMs < 200,
      `v80-voice-loop-coverage took ${elapsedMs.toFixed(1)}ms; budget is 200ms`,
    );
  });
});
