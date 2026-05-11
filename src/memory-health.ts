/**
 * Memory surface health inspector.
 *
 * Reads the repo-local memory surfaces directly and produces a compact report
 * that the CLI can print. This keeps the doctor command honest without
 * coupling it to any one runtime daemon.
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type MemorySurfaceStatus = "healthy" | "attention-needed" | "critical";

export interface VaultHealth {
  name: string;
  present: boolean;
  lastConsolidated?: string;
  ageDays?: number;
  stale: boolean;
}

export interface MemoryHealthReport {
  repoRoot: string;
  vaults: VaultHealth[];
  voiceSessions: {
    count: number;
    latest?: string;
  };
  knowledgeGraph: {
    indexRows: number;
    brainCachePresent: boolean;
  };
  consolidationLog: {
    entries: number;
    latestTimestamp?: string;
    stale: boolean;
    ageDays?: number;
  };
  mempalace: {
    atomsPresent: boolean;
    vectorsPresent: boolean;
    atomRows?: number;
  };
  status: MemorySurfaceStatus;
  notes: string[];
}

interface Frontmatter {
  [key: string]: string;
}

function parseFrontmatter(text: string): Frontmatter | null {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return null;

  const fm: Frontmatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf(":");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    value = value.replace(/^["']|["']$/g, "");
    fm[key] = value;
  }
  return fm;
}

function ageDaysFromISO(iso: string | undefined, now = new Date()): number | undefined {
  if (!iso) return undefined;
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return undefined;
  return Math.floor((now.getTime() - dt.getTime()) / 86_400_000);
}

function countJsonlRows(path: string): number {
  if (!existsSync(path)) return 0;
  const raw = readFileSync(path, "utf8");
  return raw.split(/\r?\n/).filter((line) => line.trim().length > 0).length;
}

function latestFileName(dir: string): string | undefined {
  if (!existsSync(dir)) return undefined;
  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort();
  return files.at(-1);
}

export function inspectMemoryHealth(repoRoot: string, now = new Date()): MemoryHealthReport {
  const memoryRoot = join(repoRoot, "memory");
  const vaultDir = join(memoryRoot, "vaults");
  const voiceSessionDir = join(memoryRoot, "voice-sessions");
  const kgDir = join(memoryRoot, "knowledge-graph");
  const mempalaceDir = join(memoryRoot, "mempalace");

  const vaultNames = [
    "strategic",
    "technical",
    "creative",
    "operational",
    "wisdom",
    "horizon",
  ];

  const vaults = vaultNames.map((name) => {
    const path = join(vaultDir, `${name}-vault.md`);
    if (!existsSync(path)) {
      return { name, present: false, stale: true } satisfies VaultHealth;
    }

    const content = readFileSync(path, "utf8");
    const fm = parseFrontmatter(content) ?? {};
    const lastConsolidated = fm.last_consolidated || fm.lastConsolidated;
    const ageDays = ageDaysFromISO(lastConsolidated, now);
    const stale = ageDays == null ? true : ageDays > 7;

    return {
      name,
      present: true,
      lastConsolidated,
      ageDays,
      stale,
    } satisfies VaultHealth;
  });

  const voiceSessions = {
    count: existsSync(voiceSessionDir)
      ? readdirSync(voiceSessionDir).filter((name) => name.endsWith(".md")).length
      : 0,
    latest: latestFileName(voiceSessionDir),
  };

  const indexPath = join(kgDir, "index.jsonl");
  const brainCachePath = join(kgDir, "_brain-cache.json");

  const consolidationLogPath = join(memoryRoot, "CONSOLIDATION_LOG.md");
  const consolidationLines = existsSync(consolidationLogPath)
    ? readFileSync(consolidationLogPath, "utf8").split(/\r?\n/).filter((line) => line.startsWith("- "))
    : [];
  const latestLogLine = consolidationLines.at(-1);
  const logIso = latestLogLine?.match(/^-\s+([0-9T:\-.Z]+)\s+·/)?.[1];
  const logAgeDays = ageDaysFromISO(logIso, now);

  const atomsPath = join(mempalaceDir, "atoms.jsonl");
  const vectorsPath = join(mempalaceDir, "vectors.npy");
  const atomRows = countJsonlRows(atomsPath);

  const notes: string[] = [];
  if (vaults.some((v) => !v.present)) {
    notes.push("one or more vault files are missing");
  }
  if (vaults.some((v) => v.stale)) {
    notes.push("vault consolidation is stale relative to the weekly target");
  }
  if (logAgeDays != null && logAgeDays > 7) {
    notes.push("consolidation log receipt is stale");
  }
  if (!voiceSessions.latest) {
    notes.push("no voice-session capture found");
  }

  const status: MemorySurfaceStatus =
    vaults.every((v) => v.present && !v.stale) &&
    voiceSessions.count > 0 &&
    existsSync(indexPath) &&
    existsSync(brainCachePath) &&
    existsSync(atomsPath) &&
    existsSync(vectorsPath) &&
    (logAgeDays == null || logAgeDays <= 7)
      ? "healthy"
      : notes.length > 0
        ? "attention-needed"
        : "critical";

  return {
    repoRoot,
    vaults,
    voiceSessions,
    knowledgeGraph: {
      indexRows: countJsonlRows(indexPath),
      brainCachePresent: existsSync(brainCachePath),
    },
    consolidationLog: {
      entries: consolidationLines.length,
      latestTimestamp: logIso,
      stale: logAgeDays == null ? true : logAgeDays > 7,
      ageDays: logAgeDays,
    },
    mempalace: {
      atomsPresent: existsSync(atomsPath),
      vectorsPresent: existsSync(vectorsPath),
      atomRows,
    },
    status,
    notes,
  };
}

export function updateVaultConsolidationStamps(repoRoot: string, date: string): string[] {
  const vaultDir = join(repoRoot, "memory", "vaults");
  const vaultNames = [
    "strategic",
    "technical",
    "creative",
    "operational",
    "wisdom",
    "horizon",
  ];
  const updated: string[] = [];

  for (const name of vaultNames) {
    const path = join(vaultDir, `${name}-vault.md`);
    if (!existsSync(path)) continue;

    const content = readFileSync(path, "utf8");
    const next = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/)
      ? content.replace(
          /(^---\r?\n[\s\S]*?^last_consolidated:\s*)['"]?[^'"\r\n]+['"]?(\r?\n[\s\S]*?^---\r?\n)/m,
          `$1'${date}'$2`,
        )
      : content;

    if (next !== content) {
      writeFileSync(path, next, "utf8");
      updated.push(path);
    }
  }

  return updated;
}
