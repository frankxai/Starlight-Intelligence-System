/**
 * v8.5 — Shipping-discipline substrate symmetry
 *
 * Companion to test/v76+v77+v78+v79+v80+v81+v82+v83+v84 (the substrate symmetry
 * cascade). Guards tooling quality so substrate-tier evolution cannot quietly
 * drift into ad-hoc one-off scripts that skip the [skip]/[fix]/[err] discipline,
 * idempotency, or the before/after measurement loop.
 *
 * Rules (all 4 must hold for every invocable tools/*.ps1):
 *   1. Declares a param block (with optional [CmdletBinding()] preamble)
 *   2. Sets $ErrorActionPreference (= 'Stop' or 'Continue' explicitly)
 *   3. Has an idempotent comment header (the words "Idempotent" or "Re-run = same")
 *      in the first 80 lines — signals the author considered re-runnability
 *   4. No hardcoded user-specific paths (C:\Users\frank\, /home/frank/, /c/Users/frank/)
 *      outside of param-block defaults
 *
 * SCOPE: tools/*.ps1 (top-level) + tools/git-hooks/*.ps1 (subdir invocables).
 * EXEMPT BY STRUCTURE (not by ledger): tools/lib/*.ps1 and tools/lib/*.psm1
 * are utility libraries (dot-sourced or Import-Module'd), not invocable scripts.
 *
 * Background: Starlight Board verdict 2026-05-14 (REVISE → ship with retrofit)
 * captured the Harmonizer concern that adding shipping-discipline retrofit AS
 * EXEMPT_LEGACY entries would reproduce the walker-fix-over-N-exemptions
 * anti-pattern (memory: feedback_walker_fix_over_n_exemptions). So zero exempt
 * entries by design. Failing files surface for upstream fix.
 *
 * Built on SIP — operational tier (test infrastructure)
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { repoRootFromTestFile } from "./_lib/repo.js";

const REPO_ROOT = repoRootFromTestFile(import.meta.url);
const TOOLS_DIR = join(REPO_ROOT, "tools");

// ---------- file discovery ----------

function listInvocablePs1(): string[] {
  const results: string[] = [];

  // Top-level tools/*.ps1
  try {
    for (const entry of readdirSync(TOOLS_DIR)) {
      const full = join(TOOLS_DIR, entry);
      if (entry.endsWith(".ps1") && statSync(full).isFile()) {
        results.push(full);
      }
    }
  } catch {
    /* tools/ may not exist in some clones; that's a different failure mode */
  }

  // tools/git-hooks/*.ps1 (subdir invocables, opt-in by known subdirectory name)
  const ghDir = join(TOOLS_DIR, "git-hooks");
  try {
    for (const entry of readdirSync(ghDir)) {
      const full = join(ghDir, entry);
      if (entry.endsWith(".ps1") && statSync(full).isFile()) {
        results.push(full);
      }
    }
  } catch {
    /* git-hooks/ may not exist; that's fine */
  }

  return results;
}

// ---------- rule helpers ----------

function rel(p: string): string {
  return p.replace(REPO_ROOT + "\\", "").replace(REPO_ROOT + "/", "").replace(/\\/g, "/");
}

/**
 * Find the (start, end) byte offsets of the param( ... ) block, including
 * any [CmdletBinding(...)] preamble. Uses a paren-depth counter to handle
 * nested parens in defaults like param([string]$x = (Get-Default)).
 *
 * Returns null if no param block is present.
 */
function findParamBlock(content: string): { start: number; end: number } | null {
  const m = /(?:\[CmdletBinding[^\]]*\]\s*\r?\n)?\s*param\s*\(/.exec(content);
  if (!m) return null;
  const start = m.index;
  // The matched string ends in '(' — that's the param block's opening paren.
  // Don't use content.indexOf("(", start) — it would grab '(' inside [CmdletBinding(...)] preamble.
  const openIdx = m.index + m[0].length - 1;
  let depth = 1;
  let i = openIdx + 1;
  while (i < content.length && depth > 0) {
    const c = content[i];
    if (c === "(") depth++;
    else if (c === ")") depth--;
    i++;
  }
  return { start, end: i };
}

function bodyOutsideParamBlock(content: string): string {
  const block = findParamBlock(content);
  if (!block) return content;
  return content.slice(0, block.start) + content.slice(block.end);
}

/**
 * Strip PS comments so rule 4 checks executable code only.
 * Block comments `<# ... #>` carry documentation (the comment may legitimately
 * reference a user-specific path as context — "source of truth: C:\..."); the
 * rule is about portability of executable behavior, not doc literalness.
 *
 * Strips:
 *   - `<# ... #>` block comments (multi-line)
 *   - Lines whose first non-whitespace char is `#`
 *
 * Does NOT strip inline `#` comments (rare in PS; aggressive stripping risks
 * mangling strings like "abc#def"). If a file relies on inline comments to
 * launder hardcoded paths, the rule should still catch it.
 */
function stripComments(content: string): string {
  let out = content.replace(/<#[\s\S]*?#>/g, "");
  out = out
    .split(/\r?\n/)
    .map((line) => (/^\s*#/.test(line) ? "" : line))
    .join("\n");
  return out;
}

const USER_PATH_RE = /(C:\\Users\\frank\\|\/home\/frank\/|\/c\/Users\/frank\/)/;

// ---------- tests ----------

describe("v8.5 — invocable tools/*.ps1 shipping discipline", () => {
  it("every invocable PS script declares a param block", () => {
    const failures: string[] = [];
    for (const path of listInvocablePs1()) {
      const content = readFileSync(path, "utf8");
      if (!findParamBlock(content)) {
        failures.push(rel(path));
      }
    }
    assert.deepEqual(
      failures,
      [],
      `PS scripts missing param block: ${failures.join(", ")}`,
    );
  });

  it("every invocable PS script sets $ErrorActionPreference explicitly", () => {
    const failures: string[] = [];
    for (const path of listInvocablePs1()) {
      const content = readFileSync(path, "utf8");
      if (!/\$ErrorActionPreference\s*=\s*['"](?:Stop|Continue|SilentlyContinue|Inquire)['"]/.test(content)) {
        failures.push(rel(path));
      }
    }
    assert.deepEqual(
      failures,
      [],
      `PS scripts missing $ErrorActionPreference: ${failures.join(", ")}`,
    );
  });

  it("every invocable PS script has an idempotent comment header (first 80 lines)", () => {
    const failures: string[] = [];
    for (const path of listInvocablePs1()) {
      const content = readFileSync(path, "utf8");
      const head = content.split(/\r?\n/).slice(0, 80).join("\n");
      if (!/[Ii]dempotent|[Rr]e-?run\s*=\s*same/.test(head)) {
        failures.push(rel(path));
      }
    }
    assert.deepEqual(
      failures,
      [],
      `PS scripts missing idempotent header comment: ${failures.join(", ")}`,
    );
  });

  it("no invocable PS script hardcodes a user-specific path outside param defaults", () => {
    const failures: string[] = [];
    for (const path of listInvocablePs1()) {
      const content = readFileSync(path, "utf8");
      const body = bodyOutsideParamBlock(content);
      const codeOnly = stripComments(body);
      if (USER_PATH_RE.test(codeOnly)) {
        failures.push(rel(path));
      }
    }
    assert.deepEqual(
      failures,
      [],
      `PS scripts hardcoding user paths outside param defaults: ${failures.join(", ")}`,
    );
  });
});

describe("v8.5 — scope sanity", () => {
  it("discovers at least one invocable PS script (test is wired correctly)", () => {
    const all = listInvocablePs1();
    assert.ok(
      all.length >= 1,
      `expected to find at least 1 tools/*.ps1; found ${all.length} — scope or repo layout drifted`,
    );
  });

  it("tools/lib/*.ps1 are exempt by structure (not in scope)", () => {
    const all = listInvocablePs1();
    const libLeak = all.filter((p) => p.includes(`${TOOLS_DIR}\\lib\\`) || p.includes(`${TOOLS_DIR}/lib/`));
    assert.deepEqual(
      libLeak,
      [],
      `tools/lib/ entries leaked into v85 scope: ${libLeak.map(rel).join(", ")}`,
    );
  });
});
