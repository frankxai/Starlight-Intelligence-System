/**
 * Memory eval harness.
 *
 * Scores the live SIS sovereign corpus against eval-50 using a local,
 * deterministic hybrid retriever. This is intentionally dependency-free:
 * the harness is a scoreboard for substrate changes, not another substrate.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { performance } from "node:perf_hooks";

export interface MemoryEvalOptions {
  limit?: number;
  atomsPath?: string;
  evalPath?: string;
}

export interface MemoryEvalQuery {
  id: string;
  queryText: string;
  expectedMatch: string;
  queryClass?: string;
  vault?: string;
  seedMemory?: string;
}

export interface MemoryEvalAtom {
  id: string;
  text: string;
  namespace?: string;
  source?: string;
}

export interface MemoryEvalResult {
  available: boolean;
  reason?: string;
  corpus: {
    atomsPath: string;
    evalPath: string;
    atoms: number;
    queries: number;
  };
  retrieval: {
    mode: "hybrid-rrf";
    channels: string[];
    judge: string;
    weakness: string;
  };
  metrics?: {
    hit10: number;
    recall5: number;
    precision10: number;
    mrr10: number;
    latencyMs: {
      p50: number;
      p95: number;
      max: number;
    };
  };
  byClass?: Record<string, {
    queries: number;
    hit10: number;
    recall5: number;
    precision10: number;
  }>;
  samples?: Array<{
    id: string;
    queryClass?: string;
    topRank: number | null;
    precision10: number;
    latencyMs: number;
    topIds: string[];
  }>;
}

interface RankedAtom {
  atom: MemoryEvalAtom;
  score: number;
  lexicalRank?: number;
  semanticRank?: number;
}

export function runMemoryEval(repoRoot: string, options: MemoryEvalOptions = {}): MemoryEvalResult {
  const atomsPath = options.atomsPath ?? join(repoRoot, "memory", "mempalace_sovereign", "atoms.jsonl");
  const evalPath = options.evalPath ?? join(repoRoot, "docs", "research", "_factory", "memory-foundations-phase0", "eval-50.jsonl");
  const atoms = readSovereignAtoms(atomsPath);
  const limit = Math.max(1, options.limit ?? 50);
  const queries = readEvalQueries(evalPath).slice(0, limit);
  const base: Pick<MemoryEvalResult, "corpus" | "retrieval"> = {
    corpus: {
      atomsPath,
      evalPath,
      atoms: atoms.length,
      queries: queries.length,
    },
    retrieval: {
      mode: "hybrid-rrf",
      channels: ["lexical-token-overlap", "semantic-token-ngram"],
      judge: "expected-match-token-overlap",
      weakness: "Ground truth is lexical-overlap based; add human/LLM relevance labels before public benchmark claims.",
    },
  };

  if (!atoms.length || !queries.length) {
    return {
      available: false,
      reason: "Missing live sovereign atoms or eval-50 query set",
      ...base,
    };
  }

  let hit10 = 0;
  let recall5 = 0;
  let precision10Total = 0;
  let reciprocalRankTotal = 0;
  const latencies: number[] = [];
  const samples: NonNullable<MemoryEvalResult["samples"]> = [];
  const byClass = new Map<string, { queries: number; hit10: number; recall5: number; precision10: number }>();

  for (const q of queries) {
    const start = performance.now();
    const ranked = rankAtoms(q.queryText, atoms).slice(0, 10);
    const latencyMs = performance.now() - start;
    latencies.push(latencyMs);

    const expected = tokenSet(q.expectedMatch);
    let firstRelevant: number | null = null;
    let relevantCount = 0;
    ranked.forEach(({ atom }, idx) => {
      if (relevance(expected, atom.text) >= 0.2) {
        relevantCount++;
        if (firstRelevant == null) firstRelevant = idx + 1;
      }
    });

    if (firstRelevant != null && firstRelevant <= 10) hit10++;
    if (firstRelevant != null && firstRelevant <= 5) recall5++;
    if (firstRelevant != null && firstRelevant <= 10) reciprocalRankTotal += 1 / firstRelevant;
    const precision10 = relevantCount / 10;
    precision10Total += precision10;

    const key = q.queryClass ?? "unknown";
    const bucket = byClass.get(key) ?? { queries: 0, hit10: 0, recall5: 0, precision10: 0 };
    bucket.queries++;
    if (firstRelevant != null && firstRelevant <= 10) bucket.hit10++;
    if (firstRelevant != null && firstRelevant <= 5) bucket.recall5++;
    bucket.precision10 += precision10;
    byClass.set(key, bucket);

    samples.push({
      id: q.id,
      queryClass: q.queryClass,
      topRank: firstRelevant,
      precision10: round3(precision10),
      latencyMs: round3(latencyMs),
      topIds: ranked.slice(0, 3).map((r) => r.atom.id),
    });
  }

  const n = queries.length;
  return {
    available: true,
    ...base,
    metrics: {
      hit10: round3(hit10 / n),
      recall5: round3(recall5 / n),
      precision10: round3(precision10Total / n),
      mrr10: round3(reciprocalRankTotal / n),
      latencyMs: {
        p50: round3(percentile(latencies, 0.5)),
        p95: round3(percentile(latencies, 0.95)),
        max: round3(Math.max(...latencies)),
      },
    },
    byClass: Object.fromEntries(
      Array.from(byClass.entries()).map(([key, value]) => [
        key,
        {
          queries: value.queries,
          hit10: round3(value.hit10 / value.queries),
          recall5: round3(value.recall5 / value.queries),
          precision10: round3(value.precision10 / value.queries),
        },
      ]),
    ),
    samples: samples.slice(0, 10),
  };
}

export function readSovereignAtoms(path: string): MemoryEvalAtom[] {
  if (!existsSync(path)) return [];
  const out: MemoryEvalAtom[] = [];
  for (const line of readFileSync(path, "utf-8").split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const row = JSON.parse(line) as Record<string, unknown>;
      const atom = row.atom && typeof row.atom === "object"
        ? row.atom as Record<string, unknown>
        : row;
      const text = String(atom.text ?? atom.content ?? "");
      if (!text) continue;
      out.push({
        id: String(atom.id ?? `atom_${out.length}`),
        text,
        namespace: atom.namespace ? String(atom.namespace) : undefined,
        source: atom.source ? String(atom.source) : undefined,
      });
    } catch {
      // Historical rows can be malformed; eval reports parsed corpus size.
    }
  }
  return out;
}

export function readEvalQueries(path: string): MemoryEvalQuery[] {
  if (!existsSync(path)) return [];
  const out: MemoryEvalQuery[] = [];
  for (const line of readFileSync(path, "utf-8").split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const row = JSON.parse(line) as Record<string, unknown>;
      if (!row.id || !row.query_text || !row.expected_match) continue;
      out.push({
        id: String(row.id),
        queryText: String(row.query_text),
        expectedMatch: String(row.expected_match),
        queryClass: row.query_class ? String(row.query_class) : undefined,
        vault: row.vault ? String(row.vault) : undefined,
        seedMemory: row.seed_memory ? String(row.seed_memory) : undefined,
      });
    } catch {
      // Keep the harness runnable even if one query row is malformed.
    }
  }
  return out;
}

function rankAtoms(query: string, atoms: MemoryEvalAtom[]): RankedAtom[] {
  const lexical = atoms
    .map((atom) => ({ atom, score: lexicalScore(query, atom.text) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
  const semantic = atoms
    .map((atom) => ({ atom, score: semanticScore(query, atom.text) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const byId = new Map<string, RankedAtom>();
  lexical.forEach((r, idx) => {
    byId.set(r.atom.id, {
      atom: r.atom,
      lexicalRank: idx + 1,
      score: rrf(idx + 1),
    });
  });
  semantic.forEach((r, idx) => {
    const existing = byId.get(r.atom.id);
    if (existing) {
      existing.semanticRank = idx + 1;
      existing.score += rrf(idx + 1);
    } else {
      byId.set(r.atom.id, {
        atom: r.atom,
        semanticRank: idx + 1,
        score: rrf(idx + 1),
      });
    }
  });

  return Array.from(byId.values()).sort((a, b) => b.score - a.score);
}

function lexicalScore(query: string, text: string): number {
  const queryTokens = tokenSet(query);
  const textTokens = tokenSet(text);
  if (!queryTokens.size || !textTokens.size) return 0;
  let overlap = 0;
  for (const token of queryTokens) {
    if (textTokens.has(token)) overlap++;
  }
  return overlap / queryTokens.size;
}

function semanticScore(query: string, text: string): number {
  const queryFeatures = featureSet(query);
  const textFeatures = featureSet(text);
  if (!queryFeatures.size || !textFeatures.size) return 0;
  let overlap = 0;
  for (const feature of queryFeatures) {
    if (textFeatures.has(feature)) overlap++;
  }
  return overlap / Math.sqrt(queryFeatures.size * textFeatures.size);
}

function featureSet(text: string): Set<string> {
  const tokens = Array.from(tokenSet(text));
  const features = new Set(tokens);
  for (let i = 0; i < tokens.length - 1; i++) {
    features.add(`${tokens[i]}_${tokens[i + 1]}`);
  }
  for (const token of tokens) {
    if (token.length >= 5) features.add(token.slice(0, 5));
  }
  return features;
}

function relevance(expected: Set<string>, text: string): number {
  const textTokens = tokenSet(text);
  if (!expected.size || !textTokens.size) return 0;
  let overlap = 0;
  for (const token of expected) {
    if (textTokens.has(token)) overlap++;
  }
  return overlap / expected.size;
}

function tokenSet(text: string): Set<string> {
  return new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2),
  );
}

function rrf(rank: number): number {
  return 1 / (60 + rank);
}

function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * p) - 1));
  return sorted[idx];
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
