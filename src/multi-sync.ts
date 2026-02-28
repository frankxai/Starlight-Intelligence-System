/**
 * Multi-Project Sync — Federated Intelligence Across Repos
 *
 * Extends the base sync to handle multiple project sources.
 * Each project (FrankX, ACOS, Arcanea) pushes trajectories to SIS,
 * and SIS generates per-project guidance from cross-project intelligence.
 *
 * Project registry lives in .starlight/projects.json
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { MemoryManager } from "./memory.js";
import { syncACOSToSIS, type SyncResult } from "./sync.js";

// ── Types ────────────────────────────────────────────────────

export interface ProjectRegistration {
  name: string;
  acosPath: string;
  lastSyncAt?: string;
  trajectoriesTotal?: number;
  patternCount?: number;
}

export interface ProjectRegistry {
  projects: ProjectRegistration[];
  lastUpdated: string;
}

export interface MultiSyncResult {
  projectResults: Array<{
    project: string;
    result: SyncResult;
  }>;
  totalSynced: number;
}

// ── Registry Management ──────────────────────────────────────

function getRegistryPath(): string {
  return join(process.cwd(), ".starlight", "projects.json");
}

export function loadRegistry(): ProjectRegistry {
  const path = getRegistryPath();
  if (!existsSync(path)) {
    return { projects: [], lastUpdated: new Date().toISOString() };
  }
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as ProjectRegistry;
  } catch {
    return { projects: [], lastUpdated: new Date().toISOString() };
  }
}

export function saveRegistry(registry: ProjectRegistry): void {
  const path = getRegistryPath();
  const dir = dirname(path);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  registry.lastUpdated = new Date().toISOString();
  writeFileSync(path, JSON.stringify(registry, null, 2), "utf-8");
}

export function registerProject(name: string, acosPath: string): ProjectRegistration {
  const registry = loadRegistry();

  const existing = registry.projects.find((p) => p.name === name);
  if (existing) {
    existing.acosPath = acosPath;
  } else {
    registry.projects.push({ name, acosPath });
  }

  saveRegistry(registry);
  return registry.projects.find((p) => p.name === name)!;
}

export function listProjects(): ProjectRegistration[] {
  return loadRegistry().projects;
}

// ── Multi-Project Sync ───────────────────────────────────────

/**
 * Sync trajectories from all registered projects into SIS memory.
 * Each entry gets tagged with its source project.
 */
export function syncAllProjects(
  memory: MemoryManager,
  options?: { dryRun?: boolean; minScore?: number }
): MultiSyncResult {
  const registry = loadRegistry();
  const results: MultiSyncResult = {
    projectResults: [],
    totalSynced: 0,
  };

  for (const project of registry.projects) {
    if (!existsSync(project.acosPath)) {
      continue;
    }

    const result = syncACOSToSIS(memory, {
      acosPath: project.acosPath,
      dryRun: options?.dryRun ?? false,
      minScore: options?.minScore ?? 0,
      projectName: project.name,
    });

    // Update project stats
    project.lastSyncAt = new Date().toISOString();
    project.trajectoriesTotal = (project.trajectoriesTotal ?? 0) + result.trajectoriesSynced;
    project.patternCount = result.patternsSynced;

    results.projectResults.push({
      project: project.name,
      result,
    });

    results.totalSynced += result.trajectoriesSynced + result.patternsSynced;
  }

  if (!options?.dryRun) {
    saveRegistry(registry);
  }

  return results;
}

/**
 * Sync a single named project.
 */
export function syncProject(
  memory: MemoryManager,
  projectName: string,
  options?: { dryRun?: boolean; minScore?: number; acosPath?: string }
): SyncResult | null {
  // Auto-register if path provided and not yet registered
  if (options?.acosPath) {
    registerProject(projectName, options.acosPath);
  }

  // Always load fresh registry (after potential registration above)
  const registry = loadRegistry();
  const project = registry.projects.find((p) => p.name === projectName);

  if (!project) {
    return null;
  }

  const acosPath = options?.acosPath ?? project.acosPath;
  if (!existsSync(acosPath)) {
    return null;
  }

  const result = syncACOSToSIS(memory, {
    acosPath,
    dryRun: options?.dryRun ?? false,
    minScore: options?.minScore ?? 0,
    projectName,
  });

  if (!options?.dryRun) {
    project.lastSyncAt = new Date().toISOString();
    project.trajectoriesTotal = (project.trajectoriesTotal ?? 0) + result.trajectoriesSynced;
    project.patternCount = result.patternsSynced;
    saveRegistry(registry);
  }

  return result;
}
