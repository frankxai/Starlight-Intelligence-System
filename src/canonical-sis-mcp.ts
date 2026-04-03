import {
  SIS_ENTRY_TYPES,
  SIS_VAULT_NAMES,
  appendCanonicalSisEntry,
  parseJsonl,
  readCanonicalSisVault,
  resolveCanonicalSisHome,
  type CanonicalSisEntry,
  type SisVaultName,
  type SisWriteInput,
} from "./canonical-sis.js";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface CanonicalSisMcpToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface CanonicalSisMcpResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface CanonicalSisResourcePayload extends CanonicalSisMcpResourceDefinition {
  text: string;
}

function scoreMatch(entry: CanonicalSisEntry, query: string): number {
  const haystack = `${entry.content} ${entry.tags.join(" ")} ${JSON.stringify(entry.raw)}`.toLowerCase();
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  return tokens.reduce((acc, token) => acc + (haystack.includes(token) ? 1 : 0), 0);
}

function safeRead(path: string): string {
  if (!existsSync(path)) return "";
  return readFileSync(path, "utf8");
}

function latestSessionResource(sisRoot: string): CanonicalSisResourcePayload | null {
  const sessionsDir = join(sisRoot, "evals", "sessions");
  if (!existsSync(sessionsDir)) return null;
  const files = readdirSync(sessionsDir).filter((name) => name.endsWith(".json")).sort();
  if (files.length === 0) return null;
  const latest = files[files.length - 1];
  return {
    uri: "starlight://evals/latest-session",
    name: "SIS latest eval session",
    description: `Latest eval session from ${sisRoot}`,
    mimeType: "application/json",
    text: safeRead(join(sessionsDir, latest)),
  };
}

function patternResource(sisRoot: string): CanonicalSisResourcePayload {
  return {
    uri: "starlight://evals/patterns",
    name: "SIS pattern learnings",
    description: `Pattern learnings from ${sisRoot}`,
    mimeType: "application/json",
    text: JSON.stringify(parseJsonl(join(sisRoot, "evals", "patterns.jsonl")), null, 2),
  };
}

function vaultResource(vault: SisVaultName, sisRoot: string): CanonicalSisResourcePayload {
  return {
    uri: `starlight://vaults/${vault}`,
    name: `SIS ${vault} vault`,
    description: `Canonical SIS vault from ${sisRoot}`,
    mimeType: "application/json",
    text: JSON.stringify({ vault, entries: readCanonicalSisVault(vault, sisRoot) }, null, 2),
  };
}

export function getCanonicalSisMcpTools(): CanonicalSisMcpToolDefinition[] {
  return [
    {
      name: "sis_vault_search",
      description: "Search canonical SIS vaults by free-text query.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          vault: { type: "string", enum: [...SIS_VAULT_NAMES, "all"] },
          limit: { type: "number" },
        },
        required: ["query"],
      },
    },
    {
      name: "sis_recent_entries",
      description: "Get the most recent entries from SIS vaults.",
      inputSchema: {
        type: "object",
        properties: {
          vault: { type: "string", enum: [...SIS_VAULT_NAMES, "all"] },
          limit: { type: "number" },
        },
      },
    },
    {
      name: "sis_stats",
      description: "Get canonical SIS vault counts and eval counts.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "sis_append_entry",
      description: "Append a structured entry into a canonical SIS vault.",
      inputSchema: {
        type: "object",
        properties: {
          vault: { type: "string", enum: SIS_VAULT_NAMES },
          content: { type: "string" },
          entryType: { type: "string", enum: Object.keys(SIS_ENTRY_TYPES) },
          tags: {
            oneOf: [
              { type: "array", items: { type: "string" } },
              { type: "string" },
            ],
          },
          category: { type: "string" },
          source: { type: "string" },
          confidence: { type: "string", enum: ["low", "medium", "high"] },
          author: { type: "string" },
          context: { type: "string" },
          metadata: { type: "object" },
          project: { type: "string" },
          routine: { type: "string" },
          state: { type: "string" },
          packName: { type: "string" },
          assetName: { type: "string" },
        },
        required: ["vault", "content"],
      },
    },
    {
      name: "sis_entry_types",
      description: "List supported SIS entry types and required metadata fields.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
  ];
}

export function getCanonicalSisMcpResources(sisRoot = resolveCanonicalSisHome()): CanonicalSisMcpResourceDefinition[] {
  return [
    ...SIS_VAULT_NAMES.map((vault) => ({
      uri: `starlight://vaults/${vault}`,
      name: `SIS ${vault} vault`,
      description: `Canonical SIS vault from ${sisRoot}`,
      mimeType: "application/json",
    })),
    {
      uri: "starlight://evals/patterns",
      name: "SIS pattern learnings",
      description: `Pattern learnings from ${sisRoot}`,
      mimeType: "application/json",
    },
    {
      uri: "starlight://evals/latest-session",
      name: "SIS latest eval session",
      description: `Latest eval session from ${sisRoot}`,
      mimeType: "application/json",
    },
  ];
}

export function readCanonicalSisMcpResource(uri: string, sisRoot = resolveCanonicalSisHome()): CanonicalSisResourcePayload {
  if (uri.startsWith("starlight://vaults/")) {
    const vault = uri.split("/").pop() as SisVaultName;
    return vaultResource(vault, sisRoot);
  }
  if (uri === "starlight://evals/patterns") {
    return patternResource(sisRoot);
  }
  if (uri === "starlight://evals/latest-session") {
    return latestSessionResource(sisRoot) || patternResource(sisRoot);
  }
  throw new Error(`Unknown resource: ${uri}`);
}

export async function callCanonicalSisMcpTool(
  name: string,
  args: Record<string, unknown> = {},
  sisRoot = resolveCanonicalSisHome(),
): Promise<Record<string, unknown>> {
  if (name === "sis_vault_search") {
    const query = String(args.query || "").trim();
    const limit = Number(args.limit || 10);
    const chosenVault = String(args.vault || "all");
    const targets = chosenVault === "all" ? SIS_VAULT_NAMES : [chosenVault as SisVaultName];
    const results = targets
      .flatMap((vault) => readCanonicalSisVault(vault, sisRoot))
      .map((entry) => ({ entry, score: scoreMatch(entry, query) }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ entry, score }) => ({
        vault: entry.vault,
        id: entry.id,
        createdAt: entry.createdAt,
        tags: entry.tags,
        score,
        content: entry.content,
      }));
    return { query, count: results.length, results };
  }

  if (name === "sis_recent_entries") {
    const limit = Number(args.limit || 10);
    const chosenVault = String(args.vault || "all");
    const targets = chosenVault === "all" ? SIS_VAULT_NAMES : [chosenVault as SisVaultName];
    const entries = targets
      .flatMap((vault) => readCanonicalSisVault(vault, sisRoot))
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
      .slice(0, limit)
      .map((entry) => ({
        vault: entry.vault,
        id: entry.id,
        createdAt: entry.createdAt,
        tags: entry.tags,
        content: entry.content,
      }));
    return { count: entries.length, entries };
  }

  if (name === "sis_stats") {
    const vaults = Object.fromEntries(SIS_VAULT_NAMES.map((vault) => [vault, readCanonicalSisVault(vault, sisRoot).length]));
    const patternCount = parseJsonl(join(sisRoot, "evals", "patterns.jsonl")).length;
    const sessionsDir = join(sisRoot, "evals", "sessions");
    const sessionCount = existsSync(sessionsDir) ? readdirSync(sessionsDir).filter((entry) => entry.endsWith(".json")).length : 0;
    return { sisRoot, vaults, patternCount, sessionCount };
  }

  if (name === "sis_append_entry") {
    const result = appendCanonicalSisEntry(args as unknown as SisWriteInput, sisRoot);
    const vault = String(args.vault || "");
    return { ok: true, sisRoot, vault, path: result.path, warnings: result.warnings, entry: result.entry };
  }

  if (name === "sis_entry_types") {
    return {
      entryTypes: Object.entries(SIS_ENTRY_TYPES).map(([entryType, definition]) => ({
        name: entryType,
        description: definition.description,
        requiredMetadata: definition.requiredMetadata,
      })),
    };
  }

  throw new Error(`Unknown tool: ${name}`);
}
