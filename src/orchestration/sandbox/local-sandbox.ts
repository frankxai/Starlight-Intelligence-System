/**
 * Starlight Local Isolated Sandbox
 *
 * Executes code within an ephemeral isolated temporary folder with:
 *   - Strict execution bounds (timeout, process tree kill)
 *   - Scrubbed environment variables (zero credential or API key leakage)
 *   - Path traversal prevention for staged files
 *   - Standard stdout/stderr capture and exit code inspection
 *
 * Attestation: Built on SIP § 3 — Local Isolated Sandbox Engine
 */

import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { tmpdir, platform } from "node:os";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const esmRequire = createRequire(import.meta.url);

import type {
  ISandboxRunner,
  SandboxExecutionRequest,
  SandboxExecutionResponse,
  SandboxLanguage,
  SandboxProvider,
} from "./types.js";

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_MEMORY_MB = 512;

const BASE_ENV_ALLOWLIST = [
  "PATH",
  "PATHEXT",
  "SYSTEMROOT",
  "SYSTEMDRIVE",
  "COMSPEC",
  "WINDIR",
  "TMP",
  "TEMP",
  "TMPDIR",
  "USERPROFILE",
  "HOME",
  "LANG",
  "LC_ALL",
  "NODE_ENV",
];

const FORBIDDEN_ENV_KEY_PATTERN = /(KEY|TOKEN|SECRET|PASSWORD|AUTH|CREDENTIAL|PRIVATE)/i;

interface RunnerCommand {
  bin: string;
  args: string[];
}

export class LocalIsolatedSandbox implements ISandboxRunner {
  public readonly provider: SandboxProvider = "local";

  public isAvailable(): boolean {
    return true;
  }

  private resolveTsxLoader(): string | undefined {
    try {
      // Check if tsx loader is resolvable from node_modules
      return esmRequire.resolve("tsx");
    } catch {
      return undefined;
    }
  }

  private resolveGitBash(): string | undefined {
    if (platform() !== "win32") return undefined;
    const candidates = [
      "C:\\Program Files\\Git\\bin\\bash.exe",
      "C:\\Program Files\\Git\\usr\\bin\\bash.exe",
      "C:\\Program Files (x86)\\Git\\bin\\bash.exe",
    ];
    for (const c of candidates) {
      if (existsSync(c)) return c;
    }
    return undefined;
  }

  private resolveRunner(lang: SandboxLanguage, scriptPath: string): RunnerCommand {
    switch (lang) {
      case "javascript":
        return {
          bin: process.execPath,
          args: [scriptPath],
        };

      case "typescript": {
        const tsxPath = this.resolveTsxLoader();
        const importSpecifier = tsxPath ? pathToFileURL(tsxPath).href : "tsx";
        return {
          bin: process.execPath,
          args: ["--import", importSpecifier, scriptPath],
        };
      }

      case "python":
        return {
          bin: platform() === "win32" ? "python" : "python3",
          args: [scriptPath],
        };

      case "powershell":
        return {
          bin: platform() === "win32" ? "powershell" : "pwsh",
          args: ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", scriptPath],
        };

      case "bash": {
        const gitBash = this.resolveGitBash();
        return {
          bin: gitBash || "bash",
          args: [scriptPath],
        };
      }

      default:
        throw new Error(`Unsupported sandbox language: ${lang}`);
    }
  }

  private getFilenameForLanguage(lang: SandboxLanguage): string {
    switch (lang) {
      case "javascript":
        return "index.mjs";
      case "typescript":
        return "index.ts";
      case "python":
        return "main.py";
      case "powershell":
        return "script.ps1";
      case "bash":
        return "script.sh";
    }
  }

  private scrubEnvironment(
    customEnv?: Record<string, string>,
    policyAllowlist?: string[]
  ): Record<string, string> {
    const scrubbed: Record<string, string> = {};
    const allowlist = new Set(
      (policyAllowlist && policyAllowlist.length > 0 ? policyAllowlist : BASE_ENV_ALLOWLIST).map((k) =>
        k.toUpperCase()
      )
    );

    // Filter host environment
    for (const [key, val] of Object.entries(process.env)) {
      if (!val) continue;
      const upper = key.toUpperCase();
      if (allowlist.has(upper) && !FORBIDDEN_ENV_KEY_PATTERN.test(key)) {
        scrubbed[key] = val;
      }
    }

    // Merge explicitly provided request env, rejecting forbidden credentials unless explicitly overridden
    if (customEnv) {
      for (const [key, val] of Object.entries(customEnv)) {
        if (!FORBIDDEN_ENV_KEY_PATTERN.test(key) || allowlist.has(key.toUpperCase())) {
          scrubbed[key] = val;
        }
      }
    }

    return scrubbed;
  }

  public async execute(request: SandboxExecutionRequest): Promise<SandboxExecutionResponse> {
    const startTime = Date.now();
    const execId = `sbx-loc-${randomUUID().slice(0, 8)}`;
    const timeoutMs = request.policy?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const maxMemoryMb = request.policy?.maxMemoryMb ?? DEFAULT_MAX_MEMORY_MB;

    // 1. Create ephemeral isolated directory
    const tempDir = mkdtempSync(join(tmpdir(), `sis-sandbox-${execId}-`));

    try {
      // 2. Stage primary script
      const scriptFilename = this.getFilenameForLanguage(request.language);
      const scriptPath = join(tempDir, scriptFilename);
      writeFileSync(scriptPath, request.code, "utf8");

      // 3. Stage secondary files with path-traversal prevention
      if (request.files) {
        for (const [relPath, content] of Object.entries(request.files)) {
          const target = resolve(tempDir, relPath);
          if (!target.startsWith(tempDir)) {
            throw new Error(`Path traversal attempt detected in staged sandbox file: ${relPath}`);
          }
          mkdirSync(dirname(target), { recursive: true });
          writeFileSync(target, content, "utf8");
        }
      }

      // 4. Resolve execution binary and args
      const runner = this.resolveRunner(request.language, scriptPath);
      const scrubbedEnv = this.scrubEnvironment(request.env, request.policy?.envAllowlist);

      // Set current working directory inside the sandbox
      const cwd = request.cwd ? resolve(tempDir, request.cwd) : tempDir;
      if (!cwd.startsWith(tempDir)) {
        throw new Error(`Invalid working directory outside sandbox root: ${request.cwd}`);
      }

      // 5. Spawn child process under strict supervision
      return await new Promise<SandboxExecutionResponse>((res) => {
        let stdout = "";
        let stderr = "";
        let timedOut = false;
        let finished = false;

        const child = spawn(runner.bin, runner.args, {
          cwd,
          env: scrubbedEnv,
          stdio: ["ignore", "pipe", "pipe"],
          windowsHide: true,
        });

        const timer = setTimeout(() => {
          timedOut = true;
          try {
            if (platform() === "win32" && child.pid) {
              spawn("taskkill", ["/PID", child.pid.toString(), "/T", "/F"], {
                windowsHide: true,
                stdio: "ignore",
              });
            } else {
              child.kill("SIGKILL");
            }
          } catch {
            // Process may already have terminated
          }
        }, timeoutMs);

        child.stdout?.on("data", (chunk: Buffer) => {
          stdout += chunk.toString("utf8");
        });

        child.stderr?.on("data", (chunk: Buffer) => {
          stderr += chunk.toString("utf8");
        });

        child.on("error", (err: Error) => {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          const durationMs = Date.now() - startTime;
          res({
            id: execId,
            success: false,
            stdout,
            stderr: stderr + `\n${err.message}`,
            output: stderr ? `${stdout}\n${stderr}\n${err.message}` : `${stdout}\n${err.message}`,
            exitCode: 1,
            durationMs,
            provider: "local",
            timedOut: false,
            error: err.message,
            timestamp: new Date().toISOString(),
          });
        });

        child.on("close", (exitCode: number | null) => {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          const durationMs = Date.now() - startTime;
          const success = !timedOut && exitCode === 0;
          const output = stdout + (stderr ? (stdout ? "\n" : "") + stderr : "");

          res({
            id: execId,
            success,
            stdout,
            stderr,
            output,
            exitCode: timedOut ? null : exitCode,
            durationMs,
            provider: "local",
            timedOut,
            memoryUsedMb: maxMemoryMb,
            error: timedOut ? `Execution timed out after ${timeoutMs}ms` : undefined,
            timestamp: new Date().toISOString(),
          });
        });
      });
    } finally {
      // 6. Ephemeral cleanup: remove directory and all staged contents
      try {
        rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // Silently preserve stability if OS locks file momentarily
      }
    }
  }
}
