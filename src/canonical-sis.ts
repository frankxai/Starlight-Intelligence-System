import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const SIS_VAULT_NAMES = [
  "strategic",
  "technical",
  "creative",
  "operational",
  "wisdom",
  "horizon",
] as const;

export const SIS_CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;

export type SisVaultName = (typeof SIS_VAULT_NAMES)[number];
export type SisConfidenceLevel = (typeof SIS_CONFIDENCE_LEVELS)[number];

export interface SisEntryTypeDefinition {
  description: string;
  requiredMetadata: string[];
}

export const SIS_ENTRY_TYPES = {
  generic: {
    description: "Default freeform memory entry.",
    requiredMetadata: [],
  },
  project_learning: {
    description: "Reusable learning tied to a project or product surface.",
    requiredMetadata: ["project"],
  },
  routine_learning: {
    description: "Learning about a routine, habit, ritual, or workflow.",
    requiredMetadata: ["routine"],
  },
  state_learning: {
    description: "Learning about a state, energy mode, or flow condition.",
    requiredMetadata: ["state"],
  },
  prompt_pack: {
    description: "Reusable prompt or prompt pack memory.",
    requiredMetadata: ["packName"],
  },
  creative_asset: {
    description: "Creative asset, song, library artifact, or aesthetic pattern.",
    requiredMetadata: ["assetName"],
  },
} as const satisfies Record<string, SisEntryTypeDefinition>;

export type SisEntryTypeName = keyof typeof SIS_ENTRY_TYPES;

export interface SisWriteInput {
  vault: string;
  content: string;
  tags?: string[] | string;
  category?: string;
  source?: string;
  confidence?: string;
  author?: string;
  context?: string;
  entryType?: string;
  metadata?: Record<string, unknown> | string;
  project?: string;
  routine?: string;
  state?: string;
  packName?: string;
  assetName?: string;
}

export interface SisNormalizedWriteInput {
  vault: SisVaultName;
  content: string;
  tags: string[];
  category?: string;
  source?: string;
  confidence: SisConfidenceLevel;
  author?: string;
  context?: string;
  entryType: SisEntryTypeName;
  metadata: Record<string, unknown>;
}

export interface SisValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  normalized: SisNormalizedWriteInput;
}

export interface CanonicalSisEntry {
  id: string | null;
  vault: SisVaultName;
  createdAt: string | null;
  tags: string[];
  content: string;
  entryType: SisEntryTypeName;
  metadata: Record<string, unknown>;
  raw: Record<string, unknown>;
}

export interface CanonicalSisValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CanonicalSisVaultStats {
  sisRoot: string;
  vaultCounts: Record<SisVaultName, number>;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function resolveCanonicalSisHome(root?: string): string {
  return root || process.env.STARLIGHT_HOME || join(homedir(), ".starlight");
}

export function ensureCanonicalSisLayout(root = resolveCanonicalSisHome()): string {
  mkdirSync(join(root, "vaults"), { recursive: true });
  mkdirSync(join(root, "evals", "sessions"), { recursive: true });
  mkdirSync(join(root, "graph"), { recursive: true });
  return root;
}

export function parseTagsValue(value?: string[] | string): string[] {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }
  if (!value) return [];
  return String(value)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function parseMetadataValue(value?: Record<string, unknown> | string): Record<string, unknown> {
  if (!value) return {};
  if (isPlainObject(value)) return value;
  try {
    const parsed = JSON.parse(String(value));
    return isPlainObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function buildTypedMetadata(input: SisWriteInput): Record<string, unknown> {
  const metadata = {
    ...parseMetadataValue(input.metadata),
  };

  if (input.project && !metadata.project) metadata.project = String(input.project).trim();
  if (input.routine && !metadata.routine) metadata.routine = String(input.routine).trim();
  if (input.state && !metadata.state) metadata.state = String(input.state).trim();
  if (input.packName && !metadata.packName) metadata.packName = String(input.packName).trim();
  if (input.assetName && !metadata.assetName) metadata.assetName = String(input.assetName).trim();

  return metadata;
}

export function validateSisWriteInput(input: SisWriteInput): SisValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const vault = String(input.vault || "").trim().toLowerCase();
  const content = String(input.content || "").trim();
  const confidence = input.confidence ? String(input.confidence).trim().toLowerCase() : "medium";
  const entryType = input.entryType ? String(input.entryType).trim() : "generic";
  const tags = parseTagsValue(input.tags);
  const metadata = buildTypedMetadata(input);

  if (!SIS_VAULT_NAMES.includes(vault as SisVaultName)) {
    errors.push(`Invalid vault: ${vault}`);
  }

  if (!content) {
    errors.push("content is required");
  }

  if (!SIS_CONFIDENCE_LEVELS.includes(confidence as SisConfidenceLevel)) {
    errors.push(`Invalid confidence: ${confidence}`);
  }

  if (!(entryType in SIS_ENTRY_TYPES)) {
    errors.push(`Invalid entryType: ${entryType}`);
  } else {
    for (const key of SIS_ENTRY_TYPES[entryType as SisEntryTypeName].requiredMetadata) {
      if (!metadata[key]) {
        errors.push(`entryType ${entryType} requires metadata.${key}`);
      }
    }
  }

  if (vault === "horizon" && input.context == null) {
    warnings.push("Horizon entry without context is allowed but discouraged.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalized: {
      vault: vault as SisVaultName,
      content,
      confidence: confidence as SisConfidenceLevel,
      entryType: entryType as SisEntryTypeName,
      tags,
      metadata,
      category: input.category ? String(input.category).trim() : undefined,
      source: input.source ? String(input.source).trim() : undefined,
      author: input.author ? String(input.author).trim() : undefined,
      context: input.context ? String(input.context).trim() : undefined,
    },
  };
}

export function normalizeSisReadEntry(vault: SisVaultName, entry: Record<string, unknown>): CanonicalSisEntry {
  const content =
    entry.content ??
    entry.insight ??
    entry.learning ??
    entry.text ??
    entry.value ??
    entry.wish ??
    entry.pattern ??
    entry.summary ??
    JSON.stringify(entry);
  const createdAt =
    entry.createdAt ??
    entry.created_at ??
    entry.timestamp ??
    entry.date ??
    null;
  const tags = Array.isArray(entry.tags) ? entry.tags.map((tag) => String(tag)) : [];
  const metadata = isPlainObject(entry.metadata) ? entry.metadata : {};
  const entryType = (entry.entryType ?? metadata.entryType ?? "generic") as SisEntryTypeName;

  return {
    vault,
    id: entry.id ? String(entry.id) : null,
    createdAt: createdAt ? String(createdAt) : null,
    tags,
    content: String(content),
    entryType,
    metadata,
    raw: entry,
  };
}

export function validateCanonicalSisEntry(vault: SisVaultName, entry: Record<string, unknown>): CanonicalSisValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!entry || typeof entry !== "object") {
    return { valid: false, errors: ["entry must be an object"], warnings };
  }

  if (!entry.id) errors.push("missing id");
  if (!entry.createdAt) warnings.push("missing createdAt");

  if (vault === "horizon") {
    if (!entry.wish && !entry.content) errors.push("horizon entry missing wish");
    return { valid: errors.length === 0, errors, warnings };
  }

  if (!entry.insight && !entry.content) errors.push("entry missing insight/content");
  if (entry.confidence && !SIS_CONFIDENCE_LEVELS.includes(String(entry.confidence) as SisConfidenceLevel)) {
    errors.push(`invalid confidence ${String(entry.confidence)}`);
  }

  const metadata = isPlainObject(entry.metadata) ? entry.metadata : {};
  const entryType = (entry.entryType ?? metadata.entryType ?? "generic") as SisEntryTypeName;
  if (!(entryType in SIS_ENTRY_TYPES)) {
    errors.push(`invalid entryType ${entryType}`);
  } else {
    for (const key of SIS_ENTRY_TYPES[entryType].requiredMetadata) {
      if (!metadata[key]) {
        warnings.push(`entryType ${entryType} missing metadata.${key}`);
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateCanonicalSisVaultRows(
  vault: SisVaultName,
  entries: Record<string, unknown>[],
): CanonicalSisValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seenIds = new Map<string, number>();

  entries.forEach((entry, index) => {
    const result = validateCanonicalSisEntry(vault, entry);
    for (const error of result.errors) {
      errors.push(`line ${index + 1}: ${error}`);
    }
    for (const warning of result.warnings) {
      warnings.push(`line ${index + 1}: ${warning}`);
    }

    const id = entry.id ? String(entry.id) : null;
    if (id) {
      const firstLine = seenIds.get(id);
      if (firstLine) {
        errors.push(`line ${index + 1}: duplicate id ${id} (first seen at line ${firstLine})`);
      } else {
        seenIds.set(id, index + 1);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function safeRead(path: string): string {
  if (!existsSync(path)) return "";
  return readFileSync(path, "utf8");
}

export function parseJsonl(path: string): Record<string, unknown>[] {
  const raw = safeRead(path).trim();
  if (!raw) return [];
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line) as Record<string, unknown>;
      } catch {
        return null;
      }
    })
    .filter((entry): entry is Record<string, unknown> => !!entry);
}

export function getCanonicalSisVaultPath(vault: SisVaultName, root = resolveCanonicalSisHome()): string {
  return join(root, "vaults", `${vault}.jsonl`);
}

function slugPart(value: string, fallback = "entry"): string {
  return String(value || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || fallback;
}

export function buildCanonicalSisEntry(input: SisNormalizedWriteInput): Record<string, unknown> {
  const timestamp = new Date().toISOString();
  const prefix = input.vault === "operational" ? "ops" : input.vault.slice(0, 5);
  const stamp = timestamp.replace(/[-:TZ.]/g, "");
  const unique = `${stamp.slice(0, 17)}_${Math.random().toString(36).slice(2, 6)}`;
  const id = `${prefix}_${unique}_${slugPart(input.category || input.content, "entry").slice(0, 12)}`;

  if (input.vault === "horizon") {
    return {
      id,
      wish: input.content,
      context: input.context || null,
      author: input.author || "Frank",
      coAuthored: false,
      tags: input.tags,
      entryType: input.entryType,
      metadata: {
        ...input.metadata,
        entryType: input.entryType,
      },
      createdAt: timestamp,
    };
  }

  return {
    id,
    insight: input.content,
    category: input.category || "general",
    confidence: input.confidence,
    source: input.source || "manual",
    tags: input.tags,
    entryType: input.entryType,
    metadata: {
      ...input.metadata,
      entryType: input.entryType,
    },
    createdAt: timestamp,
  };
}

export function appendJsonl(path: string, entry: Record<string, unknown>): void {
  const line = `${JSON.stringify(entry)}\n`;
  if (!existsSync(path)) {
    writeFileSync(path, line, "utf8");
    return;
  }
  const existing = readFileSync(path, "utf8");
  const prefix = existing.endsWith("\n") ? "" : "\n";
  writeFileSync(path, `${existing}${prefix}${line}`, "utf8");
}

export function appendCanonicalSisEntry(
  input: SisWriteInput,
  root = resolveCanonicalSisHome(),
): { entry: Record<string, unknown>; path: string; warnings: string[] } {
  const validation = validateSisWriteInput(input);
  if (!validation.valid) {
    throw new Error(validation.errors.join("; "));
  }

  ensureCanonicalSisLayout(root);
  const path = getCanonicalSisVaultPath(validation.normalized.vault, root);
  const entry = buildCanonicalSisEntry(validation.normalized);
  appendJsonl(path, entry);
  return { entry, path, warnings: validation.warnings };
}

export function readCanonicalSisVault(
  vault: SisVaultName,
  root = resolveCanonicalSisHome(),
): CanonicalSisEntry[] {
  return parseJsonl(getCanonicalSisVaultPath(vault, root)).map((entry) =>
    normalizeSisReadEntry(vault, entry),
  );
}

export function getCanonicalSisStats(root = resolveCanonicalSisHome()): CanonicalSisVaultStats {
  const vaultCounts = Object.fromEntries(
    SIS_VAULT_NAMES.map((vault) => [vault, readCanonicalSisVault(vault, root).length]),
  ) as Record<SisVaultName, number>;

  return {
    sisRoot: root,
    vaultCounts,
  };
}
