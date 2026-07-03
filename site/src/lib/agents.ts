// Reads the repo-root agent registry at build/request time. Source of truth:
// agents/*.md (+ agents/council/*.md) for the file list, agents/AGENT_REGISTRY.md
// for names + descriptions. site/ lives one directory below the repo root, so
// process.cwd() + ".." resolves to the repo root on both Vercel and local builds
// (mirrors the pattern in lib/sip.ts).

import { promises as fs } from "fs";
import path from "path";

export type AgentFamily =
  | "core"
  | "council"
  | "adapter"
  | "asset"
  | "crypto"
  | "dist"
  | "energy"
  | "health"
  | "legal"
  | "marine"
  | "ops"
  | "research"
  | "social"
  | "sound"
  | "space";

export interface AgentEntry {
  /** Relative path without .md, e.g. "council/elder-father" or "starlight-hiring" */
  slug: string;
  /** Relative path with .md, matches the path used in AGENT_REGISTRY.md tables */
  file: string;
  name: string;
  description: string;
  family: AgentFamily;
}

// Registry docs living alongside real agent definitions — excluded from the count.
const NON_AGENT_FILES = new Set([
  "AGENT_REGISTRY.md",
  "AGENT_TEMPLATE.md",
  "CODING_AGENTS_REGISTRY.md",
]);

const KNOWN_FAMILIES: AgentFamily[] = [
  "adapter",
  "asset",
  "crypto",
  "dist",
  "energy",
  "health",
  "legal",
  "marine",
  "ops",
  "research",
  "sound",
  "space",
  "social",
];

export const FAMILY_LABELS: Record<AgentFamily, string> = {
  core: "Core & Leadership",
  council: "Council Archetypes",
  adapter: "Partner Adapters",
  asset: "Asset & Production",
  crypto: "Crypto Intelligence",
  dist: "Content & Distribution",
  energy: "Energy Intelligence",
  health: "Health & Longevity",
  legal: "Legal & Compliance",
  marine: "Marine & Oceanographic",
  ops: "Infrastructure & Ops",
  research: "Research & Publications",
  social: "Social",
  sound: "Sound Intelligence",
  space: "Space & Cosmos",
};

export const FAMILY_ORDER: AgentFamily[] = [
  "core",
  "council",
  "adapter",
  "asset",
  "crypto",
  "dist",
  "energy",
  "health",
  "legal",
  "marine",
  "ops",
  "research",
  "social",
  "sound",
  "space",
];

function familyFromPath(relPath: string): AgentFamily {
  if (relPath.startsWith("council/")) return "council";
  const base = path.basename(relPath, ".md");
  const m = base.match(/^starlight-([a-z]+)-/);
  if (m && (KNOWN_FAMILIES as string[]).includes(m[1])) {
    return m[1] as AgentFamily;
  }
  return "core";
}

function titleFromFilename(relPath: string): string {
  const base = path.basename(relPath, ".md");
  return base
    .replace(/^starlight-/, "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function walkAgentsDir(dir: string, baseDir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkAgentsDir(full, baseDir)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      const rel = path.relative(baseDir, full).split(path.sep).join("/");
      if (!NON_AGENT_FILES.has(rel)) files.push(rel);
    }
  }
  return files;
}

interface RegistryRow {
  name: string;
  description: string;
}

/** Matches `| **Name** | \`file.md\` | Description | ...` rows across every
 * table in AGENT_REGISTRY.md — the shape is consistent across all tiers. */
function parseRegistryRows(markdown: string): Map<string, RegistryRow> {
  const map = new Map<string, RegistryRow>();
  const rowRe = /^\|\s*\*\*(.+?)\*\*\s*\|\s*`([^`\n]+\.md)`\s*\|\s*([^|]+?)\s*\|/gm;
  let match: RegExpExecArray | null;
  while ((match = rowRe.exec(markdown)) !== null) {
    const [, name, file, description] = match;
    map.set(file.trim(), { name: name.trim(), description: description.trim() });
  }
  return map;
}

export async function getAgentRegistry(): Promise<{
  agents: AgentEntry[];
  total: number;
}> {
  const repoRoot = path.join(process.cwd(), "..");
  const agentsDir = path.join(repoRoot, "agents");

  let files: string[] = [];
  try {
    files = await walkAgentsDir(agentsDir, agentsDir);
  } catch {
    return { agents: [], total: 0 };
  }

  let registryRows = new Map<string, RegistryRow>();
  try {
    const registryPath = path.join(agentsDir, "AGENT_REGISTRY.md");
    const raw = await fs.readFile(registryPath, "utf8");
    registryRows = parseRegistryRows(raw);
  } catch {
    // Registry unreadable — fall back to filename-derived names below.
  }

  const agents: AgentEntry[] = files
    .sort()
    .map((file) => {
      const row = registryRows.get(file);
      return {
        slug: file.replace(/\.md$/, ""),
        file,
        name: row?.name ?? titleFromFilename(file),
        description: row?.description ?? "",
        family: familyFromPath(file),
      };
    });

  return { agents, total: agents.length };
}
