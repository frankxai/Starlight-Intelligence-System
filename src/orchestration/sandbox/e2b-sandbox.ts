/**
 * Starlight E2B MicroVM Sandbox
 *
 * Interfaces with E2B Cloud MicroVM execution environments.
 * Provides remote kernel isolation, dedicated rootfs, and memory bounds.
 * Reads E2B_API_KEY when available with fail-safe error handling and router fallback.
 *
 * Attestation: Built on SIP § 3 — Cloud MicroVM Sandbox Adapter
 */

import { randomUUID } from "node:crypto";
import type {
  ISandboxRunner,
  SandboxExecutionRequest,
  SandboxExecutionResponse,
  SandboxProvider,
} from "./types.js";

export class E2BMicroVmSandbox implements ISandboxRunner {
  public readonly provider: SandboxProvider = "e2b";

  private getApiKey(): string | undefined {
    return process.env.E2B_API_KEY?.trim();
  }

  public isAvailable(): boolean {
    const key = this.getApiKey();
    return typeof key === "string" && key.length > 0;
  }

  public async execute(request: SandboxExecutionRequest): Promise<SandboxExecutionResponse> {
    const startTime = Date.now();
    const execId = `sbx-e2b-${randomUUID().slice(0, 8)}`;
    const apiKey = this.getApiKey();

    if (!apiKey) {
      return {
        id: execId,
        success: false,
        stdout: "",
        stderr: "E2B MicroVM runtime unavailable: E2B_API_KEY environment variable is not configured.",
        output: "E2B MicroVM runtime unavailable: E2B_API_KEY environment variable is not configured.",
        exitCode: 1,
        durationMs: Date.now() - startTime,
        provider: "e2b",
        timedOut: false,
        error: "E2B_API_KEY_MISSING",
        timestamp: new Date().toISOString(),
      };
    }

    const timeoutMs = request.policy?.timeoutMs ?? 15_000;

    try {
      // Connect to E2B Cloud Sandbox REST endpoint
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const payload = {
        code: request.code,
        language: request.language,
        envVars: request.env,
        files: request.files,
        timeoutMs,
      };

      const response = await fetch("https://api.e2b.dev/sandboxes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
          "User-Agent": "Starlight-Intelligence-System/8.5.2",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      }).finally(() => clearTimeout(timer));

      const durationMs = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        return {
          id: execId,
          success: false,
          stdout: "",
          stderr: `E2B MicroVM error (${response.status}): ${errorText}`,
          output: `E2B MicroVM error (${response.status}): ${errorText}`,
          exitCode: response.status,
          durationMs,
          provider: "e2b",
          timedOut: false,
          error: `HTTP_${response.status}`,
          timestamp: new Date().toISOString(),
        };
      }

      const result = (await response.json()) as {
        stdout?: string;
        stderr?: string;
        exitCode?: number;
        memoryUsedMb?: number;
      };

      const stdout = result.stdout || "";
      const stderr = result.stderr || "";
      const exitCode = result.exitCode ?? 0;
      const success = exitCode === 0;

      return {
        id: execId,
        success,
        stdout,
        stderr,
        output: stdout + (stderr ? (stdout ? "\n" : "") + stderr : ""),
        exitCode,
        durationMs,
        provider: "e2b",
        timedOut: false,
        memoryUsedMb: result.memoryUsedMb,
        timestamp: new Date().toISOString(),
      };
    } catch (err: unknown) {
      const durationMs = Date.now() - startTime;
      const isAbort = (err as { name?: string })?.name === "AbortError";
      const message = err instanceof Error ? err.message : String(err);

      return {
        id: execId,
        success: false,
        stdout: "",
        stderr: isAbort ? `E2B execution timed out after ${timeoutMs}ms` : message,
        output: isAbort ? `E2B execution timed out after ${timeoutMs}ms` : message,
        exitCode: isAbort ? null : 1,
        durationMs,
        provider: "e2b",
        timedOut: isAbort,
        error: isAbort ? "TIMEOUT" : message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
