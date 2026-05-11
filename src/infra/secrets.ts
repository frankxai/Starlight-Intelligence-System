/**
 * Infisical CLI wrapper — central secret access for cost-plane source instrumenters.
 *
 * Per Board REVISE-2, this is the keystone with explicit exit strategy. The wrapper
 * shells out to the `infisical` CLI for production access; falls back to process.env
 * in dev/test or if the CLI is unavailable.
 *
 * Exit path: see docs/superpowers/specs/2026-05-11-cost-plane-design.md §3.4.1
 * (periodic export + alternative-store provisioning).
 */

import { spawnSync } from "node:child_process";

export interface SecretsClient {
  get(key: string): string | undefined;
  list(): string[];
}

export type InfisicalEnv = "dev" | "staging" | "prod";

export class InfisicalSecretsClient implements SecretsClient {
  constructor(
    private readonly project: string,
    private readonly env: InfisicalEnv = "prod",
  ) {}

  get(key: string): string | undefined {
    const result = spawnSync(
      "infisical",
      ["secrets", "get", key, "--projectId", this.project, "--env", this.env, "--silent"],
      { encoding: "utf8" },
    );
    if (result.status === 0 && result.stdout) {
      return result.stdout.trim();
    }
    // Dev fallback — process.env path; production should always have Infisical
    return process.env[key];
  }

  list(): string[] {
    const result = spawnSync(
      "infisical",
      ["secrets", "--projectId", this.project, "--env", this.env, "--silent"],
      { encoding: "utf8" },
    );
    if (result.status === 0) {
      return result.stdout.split("\n").filter((l) => l.length > 0);
    }
    return Object.keys(process.env).filter((k) => /API_KEY|TOKEN|SECRET/.test(k));
  }
}

/**
 * Env-only client — for tests and dev environments where Infisical isn't installed.
 * Production code should use InfisicalSecretsClient; tests inject EnvSecretsClient.
 */
export class EnvSecretsClient implements SecretsClient {
  constructor(private readonly env: Record<string, string | undefined> = process.env) {}

  get(key: string): string | undefined {
    return this.env[key];
  }

  list(): string[] {
    return Object.keys(this.env).filter((k) => /API_KEY|TOKEN|SECRET/.test(k));
  }
}
