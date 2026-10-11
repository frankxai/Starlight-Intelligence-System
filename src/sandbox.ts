/**
 * Empirical Sandbox (The Proving Ground)
 *
 * Validates technical patterns by actually executing them in an ephemeral
 * temp directory. Prevents "hallucination of patterns" by requiring empirical
 * grounding before a pattern is promoted to the Technical Vault.
 *
 * DEFAULT: REFUSES TO EXECUTE (2026-09-08). `validatePattern` runs nothing unless the
 * caller passes `{ allowExecution: true }`. Before this, `VaultMemory.rememberInVault()`
 * auto-classified content into the technical vault by keyword and then executed every
 * fenced javascript/typescript/python/bash block inside it — and rememberInVault is
 * reachable from the MCP `remember` tool (src/mcp-server-v01.ts) and from the network
 * gateway (src/gateway/server.ts). Storing a memory was executing it, with content that
 * routinely originates outside the operator. The capability is preserved, opt-in only.
 *
 * SAFETY SCOPE (board REVISE-A.4, 2026-05-11):
 *   - Isolation: temp directory only. Process inherits the parent's user, env,
 *     and network. There is NO process-level sandbox (no Docker, no chroot,
 *     no seccomp). The 10s timeout is the only execution bound.
 *   - Network: NOT isolated. Code under test can reach any network the host
 *     can. Never pass untrusted code through this without an outer container.
 *   - Filesystem: NOT isolated outside the temp dir. Malicious code could
 *     write anywhere the parent user can write.
 *   - Phase-3+ rework target: full container-based sandbox before this is
 *     ever exposed to a multi-tenant or untrusted-input context.
 */

import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

export interface SandboxExecutionResult {
  success: boolean;
  output: string;
  durationMs: number;
  /** True when the sandbox declined to run at all. Never conflate with a failing test. */
  refused?: boolean;
}

export interface SandboxOptions {
  /**
   * Must be explicitly true for anything to execute. There is no default-on path and no
   * environment variable that flips it: the caller has to say so at the call site, so
   * "who decided to execute this?" is always answerable by reading the code.
   */
  allowExecution?: boolean;
  /** Execution bound in ms. */
  timeoutMs?: number;
}

export type SupportedLanguage = "javascript" | "typescript" | "python" | "bash";

/** argv per language. No shell, so no string is ever parsed for metacharacters. */
const RUNNERS: Record<SupportedLanguage, { file: string; bin: string; args: (f: string) => string[] }> = {
  javascript: { file: "index.js", bin: "node", args: (f) => [f] },
  typescript: { file: "index.ts", bin: "npx", args: (f) => ["tsx", f] },
  python: { file: "main.py", bin: "python", args: (f) => [f] },
  bash: { file: "script.sh", bin: "bash", args: (f) => [f] },
};

export class EmpiricalSandbox {
  /**
   * Run a code snippet empirically in an isolated temp directory.
   * Used to validate technical patterns.
   *
   * Refuses unless `opts.allowExecution === true`. That default is the security control:
   * this runs arbitrary code as the current user with full network and filesystem access
   * (see SAFETY SCOPE above), and its callers include paths fed by MCP tool input and the
   * network gateway. A refusal returns `{ refused: true, success: false }` rather than
   * throwing, so a caller that never opted in degrades to "pattern unverified" instead of
   * crashing the host process.
   */
  public static validatePattern(
    code: string,
    language: SupportedLanguage = "javascript",
    opts: SandboxOptions = {},
  ): SandboxExecutionResult {
    const start = Date.now();

    if (opts.allowExecution !== true) {
      return {
        success: false,
        refused: true,
        output:
          "sandbox refused: execution is disabled. Pass { allowExecution: true } only when every " +
          "caller of this instance is trusted or the process runs inside an outer container.",
        durationMs: Date.now() - start,
      };
    }

    const runner = RUNNERS[language];
    if (!runner) {
      return {
        success: false,
        refused: true,
        output: `sandbox refused: unsupported language "${language}"`,
        durationMs: Date.now() - start,
      };
    }

    const sandboxDir = mkdtempSync(join(tmpdir(), "starlight-sandbox-"));
    let success = false;
    let output = "";

    try {
      // execFileSync with an argv array, never execSync with a command string: no shell is
      // spawned, so a temp path containing spaces or metacharacters cannot split or inject.
      // This replaces the 2026-05-12 "quote the path" patch, which was defending a shell
      // that no longer exists here.
      const file = join(sandboxDir, runner.file);
      writeFileSync(file, code, "utf-8");
      output = execFileSync(runner.bin, runner.args(file), {
        cwd: sandboxDir,
        timeout: opts.timeoutMs ?? 10000,
        encoding: "utf-8",
        stdio: "pipe",
      });
      success = true;
    } catch (err: any) {
      success = false;
      output = (err.stdout?.toString() || "") + "\n" + (err.stderr?.toString() || "") + "\n" + err.message;
    } finally {
      try {
        rmSync(sandboxDir, { recursive: true, force: true });
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    return {
      success,
      output: output.trim(),
      durationMs: Date.now() - start,
    };
  }

  /**
   * Extract code blocks from markdown content for validation.
   */
  public static extractCodeBlocks(markdown: string): { language: SupportedLanguage, code: string }[] {
    const blocks: { language: SupportedLanguage, code: string }[] = [];
    const regex = /```(javascript|typescript|python|bash)\n([\s\S]*?)```/g;
    let match;

    while ((match = regex.exec(markdown)) !== null) {
      blocks.push({
        language: match[1] as SupportedLanguage,
        code: match[2].trim()
      });
    }

    return blocks;
  }
}
