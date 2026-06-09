// claw-attestation-pack — pure verifier
//
// Reads a file or directory, scans against patterns.json, returns a verdict.
// No writes, no network. Used by CI gates, pre-commit hooks, the audit-
// authorlessness substrate-level script, and the dashboard's "verify pack"
// surface.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface PatternEntry {
  id: string;
  regex: string;
  contexts: string[];
  description: string;
}

interface PatternTable {
  schema_version: string;
  spec_ref: string;
  patterns: PatternEntry[];
  context_required: Record<string, string[]>;
}

export interface VerifyResult {
  target: string;
  attested: boolean;
  patterns_matched: string[];
  evidence_refs: string[];
  missing_clauses: string[];
  verdict: "PASS" | "FAIL";
}

function loadPatterns(): PatternTable {
  return JSON.parse(
    readFileSync(join(__dirname, "patterns.json"), "utf-8"),
  ) as PatternTable;
}

function contextForFile(path: string): string {
  const ext = extname(path).toLowerCase();
  switch (ext) {
    case ".md":
    case ".mdx":
      return "markdown";
    case ".html":
    case ".xml":
    case ".rss":
      return "html";
    case ".yaml":
    case ".yml":
      return "yaml";
    case ".json":
      return "json";
    default:
      return "plaintext";
  }
}

function scanFile(path: string, table: PatternTable): VerifyResult {
  const text = readFileSync(path, "utf-8");
  const ctx = contextForFile(path);
  const matched: string[] = [];
  const evidence: string[] = [];

  for (const p of table.patterns) {
    const re = new RegExp(p.regex, "m");
    if (re.test(text)) {
      matched.push(p.id);
      const idx = text.search(re);
      const line = text.slice(0, idx).split("\n").length;
      evidence.push(`${path}:${line}`);
    }
  }

  const required = table.context_required[ctx] ?? [];
  const missing = required.filter((r) => !matched.includes(r));

  return {
    target: path,
    attested: matched.length > 0,
    patterns_matched: matched,
    evidence_refs: evidence,
    missing_clauses: missing,
    verdict: missing.length === 0 && matched.length > 0 ? "PASS" : "FAIL",
  };
}

export function verifyPath(path: string): VerifyResult {
  const table = loadPatterns();
  const st = statSync(path);
  if (st.isFile()) return scanFile(path, table);
  // Aggregate over a directory tree.
  const matched = new Set<string>();
  const evidence: string[] = [];
  const missing: string[] = [];
  walk(path, (f) => {
    if (![".md", ".json", ".html", ".yml", ".yaml"].includes(extname(f))) return;
    const r = scanFile(f, table);
    for (const m of r.patterns_matched) matched.add(m);
    evidence.push(...r.evidence_refs);
    if (r.verdict === "FAIL") missing.push(relative(path, f));
  });
  return {
    target: path,
    attested: matched.size > 0,
    patterns_matched: [...matched],
    evidence_refs: evidence,
    missing_clauses: missing,
    verdict: missing.length === 0 ? "PASS" : "FAIL",
  };
}

function walk(dir: string, fn: (path: string) => void): void {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === ".git" || entry === "dist") continue;
      walk(full, fn);
    } else {
      fn(full);
    }
  }
}
