/**
 * /yolo scope helper — loads and mutates yolo-scope.json with schema validation.
 *
 * yolo-scope.json is the registry of active sovereign repos + phase-in state +
 * budget thresholds. This module gives the conductor deterministic IO for the
 * three operations it cares about: load, increment session count, unlock phase-in.
 *
 * Atomic-write pattern: write to temp file, then rename. Prevents partial writes
 * if the process is killed mid-write.
 */

import { readFileSync, writeFileSync, existsSync, renameSync } from "node:fs";
import { join } from "node:path";

export interface YoloRepo {
  name: string;
  path: string;
  alliance_touched: boolean;
  tier: "active" | "stale" | "dormant";
}

export interface YoloPhaseIn {
  phase_in_repo: string;
  session_count: number;
  unlock_status: "closed" | "open";
  unlock_review_passed: boolean;
  notes: string;
}

export interface YoloBudget {
  session_threshold_usd: number;
  action_threshold_usd: number;
}

export interface YoloScope {
  version: string;
  schema: string;
  budget: YoloBudget;
  phase_in: YoloPhaseIn;
  repos: YoloRepo[];
}

export class YoloScopeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "YoloScopeError";
  }
}

/**
 * Load and validate yolo-scope.json from the given repo root.
 * Throws YoloScopeError if file is missing or schema-invalid.
 */
export function loadScope(repoRoot: string): YoloScope {
  const path = join(repoRoot, "yolo-scope.json");
  if (!existsSync(path)) {
    throw new YoloScopeError(`yolo-scope.json not found at ${path}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    throw new YoloScopeError(`yolo-scope.json is not valid JSON: ${(err as Error).message}`);
  }

  validate(parsed);
  return parsed as YoloScope;
}

/**
 * Atomic write — temp file then rename, so partial writes are impossible.
 */
function atomicWrite(targetPath: string, content: string): void {
  const tempPath = `${targetPath}.tmp-${Date.now()}`;
  writeFileSync(tempPath, content, "utf8");
  renameSync(tempPath, targetPath);
}

/**
 * Increment session_count and persist atomically. Returns the new count.
 */
export function incrementSessionCount(repoRoot: string): number {
  const scope = loadScope(repoRoot);
  scope.phase_in.session_count += 1;
  const path = join(repoRoot, "yolo-scope.json");
  atomicWrite(path, JSON.stringify(scope, null, 2) + "\n");
  return scope.phase_in.session_count;
}

/**
 * Check whether scope is currently locked to phase_in_repo only.
 * Returns the active repo list — either [phase_in_repo] or all repos.
 */
export function activeRepos(scope: YoloScope): string[] {
  if (scope.phase_in.unlock_status === "closed") {
    return [scope.phase_in.phase_in_repo];
  }
  return scope.repos.filter((r) => !r.alliance_touched).map((r) => r.name);
}

/**
 * Phase-in review trigger — has session_count reached the unlock threshold?
 */
export function shouldRunPhaseInReview(scope: YoloScope): boolean {
  return (
    scope.phase_in.session_count >= 3 &&
    !scope.phase_in.unlock_review_passed &&
    scope.phase_in.unlock_status === "closed"
  );
}

/**
 * Flip phase-in to open. Should only be called after Frank's explicit unlock_review pass.
 */
export function unlockPhaseIn(repoRoot: string): YoloScope {
  const scope = loadScope(repoRoot);
  scope.phase_in.unlock_status = "open";
  scope.phase_in.unlock_review_passed = true;
  const path = join(repoRoot, "yolo-scope.json");
  atomicWrite(path, JSON.stringify(scope, null, 2) + "\n");
  return scope;
}

function validate(parsed: unknown): asserts parsed is YoloScope {
  if (typeof parsed !== "object" || parsed === null) {
    throw new YoloScopeError("yolo-scope.json must be an object");
  }
  const s = parsed as Record<string, unknown>;
  if (typeof s.version !== "string") throw new YoloScopeError("version must be string");
  if (!Array.isArray(s.repos)) throw new YoloScopeError("repos must be array");
  if (s.repos.length === 0) throw new YoloScopeError("repos must have at least one entry");

  const b = s.budget as Record<string, unknown>;
  if (!b || typeof b !== "object") throw new YoloScopeError("budget object required");
  if (typeof b.session_threshold_usd !== "number") throw new YoloScopeError("budget.session_threshold_usd must be number");
  if (typeof b.action_threshold_usd !== "number") throw new YoloScopeError("budget.action_threshold_usd must be number");

  const p = s.phase_in as Record<string, unknown>;
  if (!p || typeof p !== "object") throw new YoloScopeError("phase_in object required");
  if (typeof p.phase_in_repo !== "string") throw new YoloScopeError("phase_in.phase_in_repo must be string");
  if (typeof p.session_count !== "number") throw new YoloScopeError("phase_in.session_count must be number");
  if (p.unlock_status !== "closed" && p.unlock_status !== "open") {
    throw new YoloScopeError("phase_in.unlock_status must be 'closed' or 'open'");
  }
  if (typeof p.unlock_review_passed !== "boolean") throw new YoloScopeError("phase_in.unlock_review_passed must be boolean");

  for (const repo of s.repos as Array<Record<string, unknown>>) {
    if (typeof repo.name !== "string") throw new YoloScopeError("every repo needs a name");
    if (typeof repo.path !== "string") throw new YoloScopeError("every repo needs a path");
    if (typeof repo.alliance_touched !== "boolean") throw new YoloScopeError("every repo needs alliance_touched boolean");
  }

  // Sovereignty hygiene: alliance-touched must be excluded from scope
  const alliance = (s.repos as Array<{ alliance_touched: boolean }>).filter((r) => r.alliance_touched);
  if (alliance.length > 0) {
    throw new YoloScopeError(`alliance-touched repos must be excluded from yolo-scope (found ${alliance.length})`);
  }

  // Phase-in repo must exist in repos list
  const phaseInRepo = p.phase_in_repo as string;
  const found = (s.repos as Array<{ name: string }>).find((r) => r.name === phaseInRepo);
  if (!found) {
    throw new YoloScopeError(`phase_in_repo "${phaseInRepo}" not found in repos list`);
  }
}
