/**
 * Starlight Sandbox & MicroVM Runtime: Core Types & Interfaces
 *
 * Defines unified contracts for isolated code execution, microVM sandboxes (E2B),
 * local isolated environments, and deterministic synthetic fallbacks.
 *
 * Attestation: Built on SIP § 3 — Sandbox & MicroVM Runtime Engine
 */

export type SandboxProvider = "local" | "e2b" | "synthetic";

export type SandboxLanguage = "typescript" | "javascript" | "python" | "bash" | "powershell";

export interface SandboxSecurityPolicy {
  /** Maximum execution time allowed before the process/VM is killed (in ms) */
  timeoutMs: number;
  /** Maximum resident memory allowed (in MB) */
  maxMemoryMb?: number;
  /** Whether outbound network access is permitted */
  allowNetwork?: boolean;
  /** Environment variable names permitted to pass through */
  envAllowlist?: string[];
  /** Whether the filesystem should be mounted read-only outside temp dir */
  readOnlyRoot?: boolean;
}

export interface SandboxExecutionRequest {
  /** Code content to execute */
  code: string;
  /** Programming language or shell */
  language: SandboxLanguage;
  /** Preferred or mandated sandbox provider */
  provider?: SandboxProvider;
  /** Security and resource constraints */
  policy?: Partial<SandboxSecurityPolicy>;
  /** Calling teammate ID if invoked within teammates engine */
  teammateId?: string;
  /** Optional custom command line override */
  command?: string;
  /** Ephemeral files to stage into the sandbox workspace { relativePath: content } */
  files?: Record<string, string>;
  /** Explicit environment variables (subject to security scrubbing) */
  env?: Record<string, string>;
  /** Working directory relative to sandbox root */
  cwd?: string;
}

export interface SandboxExecutionResponse {
  /** Unique execution identifier */
  id: string;
  /** Whether execution finished with exit code 0 and within bounds */
  success: boolean;
  /** Captured standard output */
  stdout: string;
  /** Captured standard error */
  stderr: string;
  /** Consolidated output string */
  output: string;
  /** Process exit code (null if killed by signal or timeout) */
  exitCode: number | null;
  /** Total wall clock execution time in milliseconds */
  durationMs: number;
  /** The provider that ran the code */
  provider: SandboxProvider;
  /** True if execution was halted due to timeout */
  timedOut: boolean;
  /** Memory consumed in MB (if reported by runtime) */
  memoryUsedMb?: number;
  /** Error message if an infrastructure or timeout failure occurred */
  error?: string;
  /** True if executed deterministically via synthetic simulator */
  synthetic?: boolean;
  /** ISO timestamp of completion */
  timestamp: string;
}

export interface ISandboxRunner {
  readonly provider: SandboxProvider;
  /** Returns true if prerequisites (binaries, API keys, daemons) are available */
  isAvailable(): boolean;
  /** Executes code within the sandbox boundaries */
  execute(request: SandboxExecutionRequest): Promise<SandboxExecutionResponse>;
}
