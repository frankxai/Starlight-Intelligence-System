/**
 * Memory surface health inspector.
 *
 * Reads the repo-local memory surfaces directly and produces a compact report
 * that the CLI can print. This keeps the doctor command honest without
 * coupling it to any one runtime daemon.
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
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
  architecture: {
    canonical: string;
    primaryRuntime: string;
    derived: string[];
    decision: string;
  };
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
  corpora: {
    sovereign: MemoryCorpusHealth;
    frozenMempalace: MemoryCorpusHealth;
    chromaFallback: {
      path: string;
      present: boolean;
      bytes?: number;
    };
  };
  memoryBus: {
    expected: boolean;
    privatePath: string;
    privatePathPresent: boolean;
    launcherPath: string;
    launcherPresent: boolean;
    registeredInHarnesses: string[];
    status: "connected-surface-present" | "declared-but-private-missing" | "not-declared";
  };
  evals: {
    eval50Path: string;
    eval50Present: boolean;
    eval50Rows: number;
    concurrencyGatePresent: boolean;
    retrievalEvalPresent: boolean;
  };
  drift: {
    status: "ok" | "attention-needed" | "unknown";
    sovereignRows: number;
    frozenRows: number;
    coverageRatio: number | null;
    recommendation: string;
  };
  privacy: {
    defaultMcpSearchIncludesPrivate: false;
    privateOverrideParameter: "include_private";
    policy: string;
  };
  status: MemorySurfaceStatus;
  notes: string[];
}

export interface MemoryCorpusHealth {
  path: string;
  present: boolean;
  rows: number;
  bytes?: number;
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

function fileBytes(path: string): number | undefined {
  if (!existsSync(path)) return undefined;
  try {
    return statSync(path).size;
  } catch {
    return undefined;
  }
}

function corpusHealth(path: string): MemoryCorpusHealth {
  return {
    path,
    present: existsSync(path),
    rows: countJsonlRows(path),
    bytes: fileBytes(path),
  };
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
  const sovereignPath = join(memoryRoot, "mempalace_sovereign", "atoms.jsonl");
  const frozenMempalacePath = join(memoryRoot, "mempalace", "atoms.jsonl");
  const chromaFallbackPath = join(memoryRoot, "mempalace_upstream", "chroma.sqlite3");
  const eval50Path = join(repoRoot, "docs", "research", "_factory", "memory-foundations-phase0", "eval-50.jsonl");
  const concurrencyGatePath = join(repoRoot, "test", "phase0-concurrent-write-smoke.test.ts");
  const retrievalEvalPath = join(repoRoot, "test", "retrieval-eval.test.ts");
  const memoryBusPrivatePath = join(repoRoot, "private", "memory-bus");
  const memoryBusLauncherPath = join(repoRoot, "scripts", "start-memory-bus.ps1");

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
  const sovereign = corpusHealth(sovereignPath);
  const frozenMempalace = corpusHealth(frozenMempalacePath);
  const coverageRatio = frozenMempalace.rows > 0
    ? Math.round((sovereign.rows / frozenMempalace.rows) * 1000) / 1000
    : null;
  const driftStatus = coverageRatio == null
    ? "unknown"
    : coverageRatio >= 0.95
      ? "ok"
      : "attention-needed";

  const harnesses = [
    join(repoRoot, "core", "orchestrator", "harnesses", "claude", "mcp-config.json"),
    join(repoRoot, "core", "orchestrator", "harnesses", "codex", "mcp-config.json"),
    join(repoRoot, "core", "orchestrator", "harnesses", "gemini", "mcp-config.json"),
    join(repoRoot, "core", "orchestrator", "harnesses", "opencode", "mcp-config.json"),
  ];
  const registeredInHarnesses = harnesses
    .filter((path) => existsSync(path) && readFileSync(path, "utf8").includes("memory-bus"))
    .map((path) => path.replace(repoRoot, "").replace(/^[/\\]/, ""));
  const memoryBusExpected = existsSync(memoryBusLauncherPath) || registeredInHarnesses.length > 0;
  const memoryBusStatus = memoryBusExpected
    ? existsSync(memoryBusPrivatePath)
      ? "connected-surface-present"
      : "declared-but-private-missing"
    : "not-declared";

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
  if (driftStatus === "attention-needed") {
    notes.push(`sovereign corpus covers ${sovereign.rows}/${frozenMempalace.rows} frozen rows; re-ingest or mark frozen corpus retired`);
  }
  if (memoryBusStatus === "declared-but-private-missing") {
    notes.push("memory-bus is documented/launchable, but private/memory-bus is absent in this checkout");
  }
  if (!existsSync(eval50Path)) {
    notes.push("memory eval-50 ground truth is missing");
  }

  const status: MemorySurfaceStatus =
    vaults.every((v) => v.present && !v.stale) &&
    voiceSessions.count > 0 &&
    existsSync(indexPath) &&
    existsSync(brainCachePath) &&
    existsSync(atomsPath) &&
    existsSync(vectorsPath) &&
    driftStatus !== "attention-needed" &&
    existsSync(eval50Path) &&
    (logAgeDays == null || logAgeDays <= 7)
      ? "healthy"
      : notes.length > 0
        ? "attention-needed"
        : "critical";

  return {
    repoRoot,
    architecture: {
      canonical: "markdown vaults + append-only JSONL ledgers",
      primaryRuntime: "SIS sovereign memory; external systems remain derived/optional",
      derived: ["mempalace frozen corpus", "mempalace_upstream Chroma fallback", "future mem0/Graphiti projections"],
      decision: "Keep SIS as primary. Harvest MemPalace/mem0/Graphiti patterns behind SIS contracts, do not replace canon.",
    },
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
    corpora: {
      sovereign,
      frozenMempalace,
      chromaFallback: {
        path: chromaFallbackPath,
        present: existsSync(chromaFallbackPath),
        bytes: fileBytes(chromaFallbackPath),
      },
    },
    memoryBus: {
      expected: memoryBusExpected,
      privatePath: memoryBusPrivatePath,
      privatePathPresent: existsSync(memoryBusPrivatePath),
      launcherPath: memoryBusLauncherPath,
      launcherPresent: existsSync(memoryBusLauncherPath),
      registeredInHarnesses,
      status: memoryBusStatus,
    },
    evals: {
      eval50Path,
      eval50Present: existsSync(eval50Path),
      eval50Rows: countJsonlRows(eval50Path),
      concurrencyGatePresent: existsSync(concurrencyGatePath),
      retrievalEvalPresent: existsSync(retrievalEvalPath),
    },
    drift: {
      status: driftStatus,
      sovereignRows: sovereign.rows,
      frozenRows: frozenMempalace.rows,
      coverageRatio,
      recommendation: driftStatus === "ok"
        ? "live sovereign corpus is broadly aligned with frozen corpus"
        : "before claiming benchmark quality, re-ingest frozen/canonical memory into the sovereign store or retire the frozen corpus explicitly",
    },
    privacy: {
      defaultMcpSearchIncludesPrivate: false,
      privateOverrideParameter: "include_private",
      policy: "private memory is hidden by default; external MCP access must opt in explicitly and should remain local-first",
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
