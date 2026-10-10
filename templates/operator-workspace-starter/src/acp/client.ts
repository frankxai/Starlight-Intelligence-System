import { spawn, type ChildProcess } from "node:child_process";
import * as path from "node:path";
import * as fs from "node:fs";

export interface AgentLaunchSpec {
  command: string;
  resolvedPath?: string;
  args: string[];
  workingDirectory: string;
  allowedRoots?: string[];
  scopedCredentials?: Record<string, string>;
  extraEnv?: Record<string, string>;
}

export interface SanitizedEnvOptions {
  scopedCredentials?: Record<string, string>;
  extraEnv?: Record<string, string>;
}

/**
 * Builds a strict, minimal environment for spawned agent processes.
 * NEVER spreads raw process.env into child processes.
 * Strips all ambient API keys, personal tokens, and owner credentials.
 */
export function buildSanitizedEnvironment(options: SanitizedEnvOptions = {}): NodeJS.ProcessEnv {
  const safeSystemKeys = [
    "PATH",
    "Path",
    "PATHEXT",
    "SYSTEMROOT",
    "SystemRoot",
    "TEMP",
    "TMP",
    "USERPROFILE",
    "HOME",
    "APPDATA",
    "LOCALAPPDATA",
    "LANG",
    "LC_ALL",
    "TERM",
    "COMSPEC",
  ];

  const sanitized: NodeJS.ProcessEnv = {
    NODE_ENV: process.env.NODE_ENV || "production",
    STARLIGHT_OPERATOR_CONTAINED: "1",
  };

  // Retain only safe OS pathing & user configuration
  for (const key of safeSystemKeys) {
    if (process.env[key]) {
      sanitized[key] = process.env[key];
    }
  }

  // Inject only explicitly authorized, scoped credentials
  if (options.scopedCredentials) {
    for (const [key, val] of Object.entries(options.scopedCredentials)) {
      if (val && typeof val === "string") {
        sanitized[key] = val;
      }
    }
  }

  // Inject non-sensitive extra env vars
  if (options.extraEnv) {
    for (const [key, val] of Object.entries(options.extraEnv)) {
      // Reject any accidentally supplied sensitive tokens
      if (/TOKEN|KEY|SECRET|PASSWORD|AUTH|CREDENTIAL/i.test(key) && !options.scopedCredentials?.[key]) {
        continue;
      }
      sanitized[key] = val;
    }
  }

  return sanitized;
}

/**
 * Validates that a requested working directory resides within configured allowed roots.
 * Resolves symlinks to prevent directory traversal escapes.
 */
export function validateWorkingDirectory(targetDir: string, allowedRoots: string[]): string {
  const resolved = path.resolve(targetDir);
  const realTarget = fs.existsSync(resolved) ? fs.realpathSync(resolved) : resolved;

  if (allowedRoots.length === 0) {
    // If no roots specified, default to process.cwd() as boundary
    const root = fs.realpathSync(process.cwd());
    if (!realTarget.startsWith(root)) {
      throw new Error(`Directory ${realTarget} is outside permissible default root: ${root}`);
    }
    return realTarget;
  }

  const matchesAllowed = allowedRoots.some(root => {
    const realRoot = fs.existsSync(root) ? fs.realpathSync(root) : path.resolve(root);
    return realTarget.startsWith(realRoot);
  });

  if (!matchesAllowed) {
    throw new Error(`Directory ${realTarget} does not match any configured allowed roots.`);
  }

  return realTarget;
}

/**
 * Spawns an agent child process using validated command paths and isolated environment.
 */
export function spawnContainedAgent(spec: AgentLaunchSpec): ChildProcess {
  const executable = spec.resolvedPath || spec.command;
  const validatedCwd = validateWorkingDirectory(spec.workingDirectory, spec.allowedRoots || []);
  const sanitizedEnv = buildSanitizedEnvironment({
    scopedCredentials: spec.scopedCredentials,
    extraEnv: spec.extraEnv,
  });

  return spawn(executable, spec.args, {
    cwd: validatedCwd,
    env: sanitizedEnv,
    stdio: ["pipe", "pipe", "pipe"],
    shell: false,
  });
}
