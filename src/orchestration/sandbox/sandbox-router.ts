/**
 * Starlight Sandbox Router
 *
 * Routes isolated code execution across:
 *   1. E2B MicroVM: For cloud microVM isolation or when outbound network is needed.
 *   2. Local Isolated Sandbox: For high-speed local ephemeral validation.
 *   3. Synthetic Sandbox: Offline deterministic simulation and unit testing.
 *
 * Attestation: Built on SIP § 3 — Sandbox Provider Router
 */

import type {
  ISandboxRunner,
  SandboxExecutionRequest,
  SandboxExecutionResponse,
  SandboxProvider,
} from "./types.js";
import { LocalIsolatedSandbox } from "./local-sandbox.js";
import { E2BMicroVmSandbox } from "./e2b-sandbox.js";
import { SyntheticSandbox } from "./synthetic-sandbox.js";

export class SandboxRouter {
  private runners: Map<SandboxProvider, ISandboxRunner> = new Map();

  constructor() {
    this.registerProvider("local", new LocalIsolatedSandbox());
    this.registerProvider("e2b", new E2BMicroVmSandbox());
    this.registerProvider("synthetic", new SyntheticSandbox());
  }

  public registerProvider(provider: SandboxProvider, runner: ISandboxRunner): void {
    this.runners.set(provider, runner);
  }

  public getProvider(provider: SandboxProvider): ISandboxRunner {
    const runner = this.runners.get(provider);
    if (!runner) {
      throw new Error(`Sandbox provider '${provider}' is not registered.`);
    }
    return runner;
  }

  /**
   * Resolves the most suitable sandbox provider given the request parameters,
   * security policy, and runtime environment credentials.
   */
  public resolveProvider(request: SandboxExecutionRequest): SandboxProvider {
    // Explicit provider requested
    if (request.provider) {
      if (request.provider === "e2b") {
        const e2bRunner = this.runners.get("e2b");
        if (e2bRunner && e2bRunner.isAvailable()) {
          return "e2b";
        }
        // Graceful fallback if E2B is unavailable
        const localRunner = this.runners.get("local");
        return localRunner && localRunner.isAvailable() ? "local" : "synthetic";
      }
      return request.provider;
    }

    // Network requested or untrusted remote workload requested
    if (request.policy?.allowNetwork) {
      const e2bRunner = this.runners.get("e2b");
      if (e2bRunner && e2bRunner.isAvailable()) {
        return "e2b";
      }
    }

    // Default to local isolated sandbox
    const local = this.runners.get("local");
    if (local && local.isAvailable()) {
      return "local";
    }

    // Fallback to deterministic synthetic simulation
    return "synthetic";
  }

  /**
   * Executes code through the resolved sandbox provider, with fail-safe fallback
   * to synthetic execution if an infrastructure fault occurs.
   */
  public async execute(request: SandboxExecutionRequest): Promise<SandboxExecutionResponse> {
    const targetProvider = this.resolveProvider(request);
    const runner = this.getProvider(targetProvider);

    try {
      const response = await runner.execute(request);
      return response;
    } catch (err: unknown) {
      // If an unhandled failure occurred in local/e2b, provide graceful fallback to synthetic
      if (targetProvider !== "synthetic") {
        const synthetic = this.getProvider("synthetic");
        const fallback = await synthetic.execute(request);
        const reason = err instanceof Error ? err.message : String(err);
        return {
          ...fallback,
          error: `Provider '${targetProvider}' execution failed (${reason}). Fell back to synthetic simulation.`,
        };
      }
      throw err;
    }
  }
}

export const sandboxRouter = new SandboxRouter();
