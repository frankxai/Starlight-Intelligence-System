/**
 * Starlight Intelligence System — Vault seeding.
 *
 * A fresh install has no `~/.starlight/vaults` directory, so the README's #1
 * install path (point an MCP client at `--vault-dir ~/.starlight/vaults`) used
 * to surface an empty, broken-looking system: `sis_vault_search` returned
 * nothing and there was no signal whether the wiring was wrong or the vault was
 * simply empty.
 *
 * This module makes the empty state self-explaining. For each of the six
 * canonical vaults it writes a JSONL file seeded with:
 *   1. a `welcome` meta entry that names the vault, its purpose, and how to add
 *      your own memories, and
 *   2. the public example entries from `public-vault/<name>.jsonl` when that
 *      starter content ships with the package (it is listed in package.json
 *      `files`).
 *
 * JSONL remains the source of truth (mirrors `src/retrieval.ts` and
 * `src/mcp-server.ts`). Seeding never overwrites an existing vault file unless
 * `force` is set, so re-running `starlight init --vaults` or rebooting the MCP
 * server is safe and idempotent.
 *
 * Built on SIP — operational tier (first-run experience).
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { getPackageRoot } from "./version.js";

/** The six canonical vaults, in their documented order. */
export const VAULT_NAMES = [
  "strategic",
  "technical",
  "creative",
  "operational",
  "wisdom",
  "horizon",
] as const;

export type VaultName = (typeof VAULT_NAMES)[number];

/** One-line description of what each vault is for, used in welcome entries. */
const VAULT_PURPOSE: Record<VaultName, string> = {
  strategic: "Business insights, architecture decisions, competitive moats.",
  technical: "Implementation learnings, stack decisions, patterns.",
  creative: "Design preferences, aesthetic rules, voice, lore.",
  operational: "Workflow patterns, execution lessons, process rules.",
  wisdom: "Deep principles, truths, cross-domain insights.",
  horizon: "Vision statements — an append-only ledger of human intentions.",
};

export interface SeedResult {
  vaultDir: string;
  /** Vault names whose JSONL file was created (or overwritten with force). */
  created: VaultName[];
  /** Vault names that already existed and were left untouched. */
  skipped: VaultName[];
  /** Whether public example starter content was found and copied. */
  usedExamples: boolean;
}

/** Strip a leading UTF-8 BOM so the first JSONL line parses. */
function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/**
 * Locate the bundled `public-vault/` starter directory. Present both in the
 * repo (development) and in the published package (it is in package.json
 * `files`). Returns null if not found.
 */
export function findSeedDir(): string | null {
  const candidates = [
    join(getPackageRoot(), "public-vault"),
    join(process.cwd(), "public-vault"),
  ];
  for (const dir of candidates) {
    if (existsSync(dir)) return dir;
  }
  return null;
}

/** A self-explaining welcome entry written as the first line of each vault. */
function welcomeEntry(name: VaultName): string {
  const entry = {
    id: `sis_welcome_${name}`,
    content:
      `Welcome to your ${name} vault — ${VAULT_PURPOSE[name]} ` +
      `This file is JSONL: one memory per line, human-readable and git-versionable. ` +
      `Add memories with the sis_append_entry MCP tool or \`starlight vault set\`. ` +
      `Delete this line whenever you like.`,
    vault: name,
    category: "meta",
    confidence: "high",
    source: "seed",
    tags: ["welcome", "getting-started"],
    createdAt: new Date().toISOString(),
  };
  return JSON.stringify(entry);
}

/** Read the public example lines for a vault, BOM-stripped and trimmed.
 *  Blank lines are skipped (JSONL has no blank records); content lines are
 *  copied verbatim, mirroring the source file. */
function exampleLines(seedDir: string | null, name: VaultName): string[] {
  if (!seedDir) return [];
  const file = join(seedDir, `${name}.jsonl`);
  if (!existsSync(file)) return [];
  return stripBom(readFileSync(file, "utf-8"))
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * True when `vaultDir` is missing, empty, or contains only empty `.jsonl`
 * files — i.e. a fresh install that should be seeded.
 */
export function vaultsAreEmpty(vaultDir: string): boolean {
  if (!existsSync(vaultDir)) return true;
  const files = readdirSync(vaultDir).filter((f) => f.endsWith(".jsonl"));
  if (files.length === 0) return true;
  return files.every((f) => readFileSync(join(vaultDir, f), "utf-8").trim() === "");
}

/**
 * Create the six canonical vault JSONL files in `vaultDir`, seeded with a
 * welcome entry plus bundled public examples when available.
 *
 * Idempotent: existing vault files are skipped unless `force` is set.
 */
export function seedVaults(
  vaultDir: string,
  opts: { force?: boolean } = {},
): SeedResult {
  if (!existsSync(vaultDir)) mkdirSync(vaultDir, { recursive: true });

  const seedDir = findSeedDir();
  const result: SeedResult = {
    vaultDir,
    created: [],
    skipped: [],
    usedExamples: false,
  };

  for (const name of VAULT_NAMES) {
    const target = join(vaultDir, `${name}.jsonl`);
    if (existsSync(target) && readFileSync(target, "utf-8").trim() !== "" && !opts.force) {
      result.skipped.push(name);
      continue;
    }
    const examples = exampleLines(seedDir, name);
    if (examples.length > 0) result.usedExamples = true;
    const lines = [welcomeEntry(name), ...examples];
    writeFileSync(target, lines.join("\n") + "\n", "utf-8");
    result.created.push(name);
  }

  return result;
}
