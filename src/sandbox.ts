/**
 * Empirical Sandbox (The Proving Ground)
 *
 * Validates technical patterns by actually executing them in an ephemeral
 * temp directory. Prevents "hallucination of patterns" by requiring empirical
 * grounding before a pattern is promoted to the Technical Vault.
 *
 * SAFETY SCOPE (board REVISE-A.4, 2026-05-11):
 *   - Isolation: temp directory only. Process inherits the parent's user, env,
 *     and network. There is NO process-level sandbox (no Docker, no chroot,
 *     no seccomp). The 10s execSync timeout is the only execution bound.
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
import { execSync } from "node:child_process";

export interface SandboxExecutionResult {
  success: boolean;
  output: string;
  durationMs: number;
}

export type SupportedLanguage = "javascript" | "typescript" | "python" | "bash";

export class EmpiricalSandbox {
  /**
   * Run a code snippet empirically in an isolated temp directory.
   * Used to validate technical patterns.
   */
  public static validatePattern(code: string, language: SupportedLanguage = "javascript"): SandboxExecutionResult {
    const start = Date.now();
    const sandboxDir = mkdtempSync(join(tmpdir(), "starlight-sandbox-"));
    let success = false;
    let output = "";

    try {
      let cmd = "";
      if (language === "javascript") {
        const file = join(sandboxDir, "index.js");
        writeFileSync(file, code, "utf-8");
        cmd = `node ${file}`;
      } else if (language === "typescript") {
        const file = join(sandboxDir, "index.ts");
        writeFileSync(file, code, "utf-8");
        cmd = `npx tsx ${file}`; 
      } else if (language === "python") {
        const file = join(sandboxDir, "main.py");
        writeFileSync(file, code, "utf-8");
        cmd = `python ${file}`;
      } else if (language === "bash") {
        const file = join(sandboxDir, "script.sh");
        writeFileSync(file, code, "utf-8");
        cmd = `bash ${file}`;
      }

      // 10 second timeout to prevent infinite loops in the sandbox
      output = execSync(cmd, { cwd: sandboxDir, timeout: 10000, encoding: "utf-8", stdio: "pipe" });
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
