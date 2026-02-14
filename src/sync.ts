/**
 * Sync Bridge — ACOS Trajectory → SIS Memory
 *
 * Reads ACOS trajectory files and tool-sequence patterns,
 * classifies them into SIS memory categories, and stores them
 * in the MemoryManager. Tracks synced IDs to avoid duplicates.
 *
 * Classification logic:
 *   - High-success trajectories (≥0.85) → "pattern"
 *   - Architectural/config changes      → "decision"
 *   - Novel tool combinations           → "insight"
 *   - Low-success trajectories (≤0.50)  → "error"
 *   - Recurring preferences             → "preference"
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, basename } from "node:path";
import type { MemoryEntry } from "./types.js";
import { MemoryManager } from "./memory.js";

// ── ACOS Trajectory Types ──────────────────────────────────

export interface ACOSTrajectory {
  id: string;
  sessionId: string;
  source: string;
  startedAt: string;
  promptCount: number;
  toolCount: number;
  filesModified: string[];
  type: string;
  task: string | null;
  completedAt: string;
  duration: number;
  operationCount: number;
  successScore: number;
  toolBreakdown: Record<string, number>;
  critique: string;
}

export interface ACOSPattern {
  sequence: string;
  type: string;
  count: number;
  avgSuccess: number;
  isNgram: boolean;
  ngramSize: number;
  discoveredAt: string;
  lastSeen: string;
}

// ── Sync State ─────────────────────────────────────────────

export interface SyncState {
  lastSyncAt: string;
  syncedTrajectoryIds: string[];
  syncedPatternKeys: string[];
  totalSynced: number;
}

function loadSyncState(path: string): SyncState {
  if (!existsSync(path)) {
    return {
      lastSyncAt: "",
      syncedTrajectoryIds: [],
      syncedPatternKeys: [],
      totalSynced: 0,
    };
  }
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as SyncState;
  } catch {
    return {
      lastSyncAt: "",
      syncedTrajectoryIds: [],
      syncedPatternKeys: [],
      totalSynced: 0,
    };
  }
}

function saveSyncState(path: string, state: SyncState): void {
  const dir = path.replace(/\/[^/]+$/, "");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(path, JSON.stringify(state, null, 2), "utf-8");
}

// ── Classification Engine ──────────────────────────────────

type MemoryCategory = MemoryEntry["category"];

/**
 * Classify an ACOS trajectory into a SIS memory category.
 *
 * Rules:
 * 1. successScore ≤ 0.50 → "error" (learn from failures)
 * 2. successScore ≥ 0.85 → "pattern" (repeatable success)
 * 3. Files in .claude/, .claude-flow/ → "decision" (architectural)
 * 4. type = "skill_execution" with moderate score → "preference"
 * 5. Everything else → "insight"
 */
function classifyTrajectory(traj: ACOSTrajectory): MemoryCategory {
  // Failures first
  if (traj.successScore <= 0.5) return "error";

  // High success = proven pattern
  if (traj.successScore >= 0.85) return "pattern";

  // Config/architecture changes
  const hasConfigFiles = traj.filesModified.some(
    (f) => f.includes(".claude/") || f.includes(".claude-flow/") || f.includes("config")
  );
  if (hasConfigFiles) return "decision";

  // Skill execution = workflow preference
  if (traj.type === "skill_execution") return "preference";

  // Default: useful insight
  return "insight";
}

/**
 * Classify a tool-sequence pattern into a SIS memory category.
 */
function classifyPattern(pattern: ACOSPattern): MemoryCategory {
  if (pattern.avgSuccess >= 0.85 && pattern.count >= 3) return "pattern";
  if (pattern.avgSuccess <= 0.6) return "error";
  return "insight";
}

// ── Content Generation ─────────────────────────────────────

function trajectoryToContent(traj: ACOSTrajectory): string {
  const tools = Object.entries(traj.toolBreakdown)
    .map(([tool, count]) => `${tool}(${count})`)
    .join(", ");

  const filesSummary = traj.filesModified.length > 3
    ? `${traj.filesModified.length} files (${traj.filesModified.slice(0, 3).map((f) => basename(f)).join(", ")}...)`
    : traj.filesModified.map((f) => basename(f)).join(", ");

  const duration = traj.duration > 60000
    ? `${(traj.duration / 60000).toFixed(1)}min`
    : `${(traj.duration / 1000).toFixed(0)}s`;

  return `[${traj.type}] ${traj.operationCount} ops in ${duration}, score ${traj.successScore.toFixed(2)}. Tools: ${tools}. Files: ${filesSummary}`;
}

function trajectoryToTags(traj: ACOSTrajectory): string[] {
  const tags: string[] = [traj.type, "acos-trajectory"];

  // Add tool tags
  for (const tool of Object.keys(traj.toolBreakdown)) {
    tags.push(tool.toLowerCase());
  }

  // Add domain tags from file paths
  if (traj.filesModified.some((f) => f.includes("/blog/") || f.includes("/content/"))) {
    tags.push("content");
  }
  if (traj.filesModified.some((f) => f.includes("/components/") || f.includes("/app/"))) {
    tags.push("frontend");
  }
  if (traj.filesModified.some((f) => f.includes(".claude") || f.includes("hooks"))) {
    tags.push("acos-config");
  }
  if (traj.filesModified.some((f) => f.includes("/music") || f.includes("suno"))) {
    tags.push("music");
  }

  return [...new Set(tags)];
}

function patternToContent(pattern: ACOSPattern): string {
  return `Tool sequence "${pattern.sequence}" (${pattern.type}): ${pattern.count} occurrences, ${(pattern.avgSuccess * 100).toFixed(0)}% avg success. ${pattern.ngramSize}-gram.`;
}

function patternToTags(pattern: ACOSPattern): string[] {
  const tags = ["acos-pattern", pattern.type];
  const tools = pattern.sequence.split(" > ").map((t) => t.toLowerCase());
  return [...new Set([...tags, ...tools])];
}

// ── Sync Engine ────────────────────────────────────────────

export interface SyncOptions {
  /** Path to ACOS trajectories directory */
  acosPath: string;
  /** Minimum success score to sync (skip noisy low-value entries) */
  minScore?: number;
  /** Maximum entries to sync per run */
  maxEntries?: number;
  /** Dry run — classify but don't write */
  dryRun?: boolean;
}

export interface SyncResult {
  trajectoriesSynced: number;
  patternsSynced: number;
  skippedDuplicate: number;
  skippedLowValue: number;
  byCategory: Record<string, number>;
  dryRun: boolean;
}

/**
 * Sync ACOS trajectories and patterns into SIS memory.
 */
export function syncACOSToSIS(
  memory: MemoryManager,
  options: SyncOptions
): SyncResult {
  const {
    acosPath,
    minScore = 0,
    maxEntries = 200,
    dryRun = false,
  } = options;

  const stateFile = join(
    memory.path.replace(/\/[^/]+$/, ""),
    "sync-state.json"
  );
  const state = loadSyncState(stateFile);

  const result: SyncResult = {
    trajectoriesSynced: 0,
    patternsSynced: 0,
    skippedDuplicate: 0,
    skippedLowValue: 0,
    byCategory: {},
    dryRun,
  };

  let totalAdded = 0;

  // ── Sync Trajectories ──────────────────────────────────
  const trajDir = acosPath;
  if (existsSync(trajDir)) {
    const files = readdirSync(trajDir).filter(
      (f) => f.endsWith(".json") && f.includes("_traj_") && !f.startsWith("_") && f !== "patterns.json"
    );

    for (const file of files) {
      if (totalAdded >= maxEntries) break;

      try {
        const traj = JSON.parse(
          readFileSync(join(trajDir, file), "utf-8")
        ) as ACOSTrajectory;

        // Skip duplicates
        if (state.syncedTrajectoryIds.includes(traj.id)) {
          result.skippedDuplicate++;
          continue;
        }

        // Skip below minimum score threshold
        if (traj.successScore < minScore) {
          result.skippedLowValue++;
          continue;
        }

        // Skip empty trajectories
        if (traj.operationCount === 0 && traj.filesModified.length === 0) {
          result.skippedLowValue++;
          continue;
        }

        const category = classifyTrajectory(traj);
        const content = trajectoryToContent(traj);
        const tags = trajectoryToTags(traj);

        if (!dryRun) {
          memory.add({
            content,
            category,
            tags,
            confidence: traj.successScore,
            source: `acos:trajectory:${traj.id}`,
          });
          state.syncedTrajectoryIds.push(traj.id);
        }

        result.trajectoriesSynced++;
        result.byCategory[category] = (result.byCategory[category] ?? 0) + 1;
        totalAdded++;
      } catch {
        // Skip malformed files
      }
    }
  }

  // ── Sync Patterns ──────────────────────────────────────
  const patternsFile = join(acosPath, "patterns.json");
  if (existsSync(patternsFile)) {
    try {
      const patterns = JSON.parse(
        readFileSync(patternsFile, "utf-8")
      ) as ACOSPattern[];

      for (const pattern of patterns) {
        if (totalAdded >= maxEntries) break;

        const key = `${pattern.sequence}::${pattern.type}`;

        // Skip duplicates
        if (state.syncedPatternKeys.includes(key)) {
          result.skippedDuplicate++;
          continue;
        }

        // Only sync patterns with enough occurrences
        if (pattern.count < 2) {
          result.skippedLowValue++;
          continue;
        }

        const category = classifyPattern(pattern);
        const content = patternToContent(pattern);
        const tags = patternToTags(pattern);

        if (!dryRun) {
          memory.add({
            content,
            category,
            tags,
            confidence: pattern.avgSuccess,
            source: `acos:pattern:${key}`,
          });
          state.syncedPatternKeys.push(key);
        }

        result.patternsSynced++;
        result.byCategory[category] = (result.byCategory[category] ?? 0) + 1;
        totalAdded++;
      }
    } catch {
      // Skip malformed patterns file
    }
  }

  // ── Persist ────────────────────────────────────────────
  if (!dryRun) {
    state.lastSyncAt = new Date().toISOString();
    state.totalSynced += totalAdded;
    saveSyncState(stateFile, state);
    memory.save();
  }

  return result;
}
