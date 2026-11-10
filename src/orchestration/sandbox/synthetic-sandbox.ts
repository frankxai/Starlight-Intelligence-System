/**
 * Starlight Synthetic Sandbox
 *
 * Deterministic offline and unit test simulation of isolated code execution.
 * Evaluates simulated code patterns (prints, exits, timeouts, syntax errors)
 * without spawning host processes or making network requests.
 *
 * Attestation: Built on SIP § 3 — Synthetic Sandbox Simulator
 */

import { randomUUID } from "node:crypto";
import type {
  ISandboxRunner,
  SandboxExecutionRequest,
  SandboxExecutionResponse,
  SandboxProvider,
} from "./types.js";

export class SyntheticSandbox implements ISandboxRunner {
  public readonly provider: SandboxProvider = "synthetic";

  public isAvailable(): boolean {
    return true;
  }

  public async execute(request: SandboxExecutionRequest): Promise<SandboxExecutionResponse> {
    const startTime = Date.now();
    const execId = `sbx-syn-${randomUUID().slice(0, 8)}`;
    const code = request.code;

    // Check for simulated timeout triggers
    if (/while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)|time\.sleep\(999\)|Start-Sleep\s+999/i.test(code)) {
      const timeoutMs = request.policy?.timeoutMs ?? 5_000;
      return {
        id: execId,
        success: false,
        stdout: "",
        stderr: `Execution timed out after ${timeoutMs}ms (synthetic simulation)`,
        output: `Execution timed out after ${timeoutMs}ms (synthetic simulation)`,
        exitCode: null,
        durationMs: 45,
        provider: "synthetic",
        timedOut: true,
        synthetic: true,
        error: `Execution timed out after ${timeoutMs}ms`,
        timestamp: new Date().toISOString(),
      };
    }

    // Check for simulated errors and exceptions
    if (/throw\s+new\s+Error|raise\s+Exception|exit\s+1|process\.exit\(1\)|assert\.fail/i.test(code)) {
      const errorMatch = code.match(/(?:throw\s+new\s+Error|raise\s+Exception)\(["']([^"']+)["']\)/);
      const errorMessage = errorMatch ? errorMatch[1] : "Synthetic execution error: process exited with code 1";
      return {
        id: execId,
        success: false,
        stdout: "",
        stderr: errorMessage,
        output: errorMessage,
        exitCode: 1,
        durationMs: 25,
        provider: "synthetic",
        timedOut: false,
        synthetic: true,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }

    // Extract logged statements if present
    const outputs: string[] = [];
    const jsPrintRegex = /console\.log\(["'`](.*?)["'`]\)/g;
    let match: RegExpExecArray | null;
    while ((match = jsPrintRegex.exec(code)) !== null) {
      outputs.push(match[1]);
    }

    const pyPrintRegex = /print\(["'](.*?)["']\)/g;
    while ((match = pyPrintRegex.exec(code)) !== null) {
      outputs.push(match[1]);
    }

    const psPrintRegex = /(?:Write-Output|echo)\s+["'](.*?)["']/g;
    while ((match = psPrintRegex.exec(code)) !== null) {
      outputs.push(match[1]);
    }

    const stdout = outputs.length > 0
      ? outputs.join("\n")
      : `Synthetic execution completed for ${request.language} (${code.length} bytes).`;

    return {
      id: execId,
      success: true,
      stdout,
      stderr: "",
      output: stdout,
      exitCode: 0,
      durationMs: Math.max(12, Date.now() - startTime),
      provider: "synthetic",
      timedOut: false,
      memoryUsedMb: 32,
      synthetic: true,
      timestamp: new Date().toISOString(),
    };
  }
}
