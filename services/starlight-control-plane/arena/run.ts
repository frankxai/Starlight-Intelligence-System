// Reviewer arena runner. Plants each seed into a base diff, sends the mutated diff to every model
// through the exact cf-review call path (src/review.ts: chunkDiff, reviewChunks, streaming, retries,
// the 20 req/min per-model limiter and the strict verdict parser), and scores what came back.
//
// Pure apart from the injected AI binding, clock and sleep, so node --test drives it with a stub.
// It measures; it never signs and never edits config. See docs/control-plane/ARENA.md.

import {
  chunkDiff, combineReviews, knobsFor, parseUnifiedDiff, reviewChunks, MAX_CHUNK_BYTES,
  type AiBinding, type CallConfig, type Chunk, type Finding,
} from '../src/review.ts';
import { scoreCase, scoreRows, type ArenaRow, type ModelScore, type Mutation } from './score.ts';
import { matchesFiles, type Seed } from './seeds.ts';

export { SEEDS, SEED_CLASSES, selectSeeds, type Seed } from './seeds.ts';
export { recommendGateModels, readThresholds, scoreRows, type ArenaRow, type ModelScore } from './score.ts';

function inserted(before: string, after: string): string {
  let p = 0;
  while (p < before.length && p < after.length && before[p] === after[p]) p++;
  let s = 0;
  while (s < before.length - p && s < after.length - p && before[before.length - 1 - s] === after[after.length - 1 - s]) s++;
  return after.slice(p, after.length - s);
}

// Applies one seed to the first added line it matches, in diff order. Only lines inside a hunk that
// start with '+' are candidates: context (' '), removed ('-') and header lines ('+++ b/...') never
// change. Returns null when the seed finds no target (or would not change the line).
export function applySeed(diff: string, seed: Seed): { diff: string; mutation: Mutation } | null {
  if (seed.find === null) return null;
  const lines = diff.split('\n');
  let file: string | null = null;
  let inHunk = false;
  let newLine: number | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const head = /^diff --git a\/(.+?) b\/(.+)$/.exec(line);
    if (head) { file = head[2]; inHunk = false; newLine = null; continue; }
    const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
    if (hunk) { inHunk = true; newLine = Number(hunk[1]); continue; }
    if (!inHunk || file === null) continue;
    if (line.startsWith('-') || line.startsWith('\\')) continue;
    const here = newLine;
    if (newLine !== null) newLine++;
    if (!line.startsWith('+') || !matchesFiles(file, seed.files)) continue;
    const before = line.slice(1);
    let after: string;
    if (typeof seed.find === 'string') {
      const at = before.indexOf(seed.find);
      if (at < 0) continue;
      after = before.slice(0, at) + seed.replace + before.slice(at + seed.find.length);
    } else {
      const re = new RegExp(seed.find.source, seed.find.flags.replace('g', ''));
      if (!re.test(before)) continue;
      after = before.replace(re, seed.replace);
    }
    if (after === before) continue;
    const out = lines.slice();
    out[i] = `+${after}`;
    return { diff: out.join('\n'), mutation: { file, line: here, before, after, inserted: inserted(before, after) } };
  }
  return null;
}

export interface ArenaCase { seed: Seed; diff: string; mutation: Mutation | null; chunks: Chunk[] }

// Every applicable seed as a case, plus the clean controls; seeds with no target are listed as skipped.
export function prepareCases(baseDiff: string, seeds: Seed[], chunkBytes = MAX_CHUNK_BYTES): { cases: ArenaCase[]; skipped: { seed_id: string; reason: string }[] } {
  const cases: ArenaCase[] = [];
  const skipped: { seed_id: string; reason: string }[] = [];
  const chunk = (d: string) => chunkDiff(parseUnifiedDiff(d), chunkBytes);
  for (const seed of seeds) {
    if (seed.class === 'clean') { cases.push({ seed, diff: baseDiff, mutation: null, chunks: chunk(baseDiff) }); continue; }
    const applied = applySeed(baseDiff, seed);
    if (!applied) { skipped.push({ seed_id: seed.id, reason: 'no added line in the base diff matches this seed' }); continue; }
    cases.push({ seed, diff: applied.diff, mutation: applied.mutation, chunks: chunk(applied.diff) });
  }
  return { cases, skipped };
}

export interface ArenaInput {
  ai: AiBinding;
  models: string[];
  seeds: Seed[];
  baseDiff: string;
  // Where the base diff came from (e.g. "frankxai/starlight-estate#96@df48a91"); stored per row.
  baseRef: string;
  cfg: CallConfig;
  chunkBytes?: number;
  // Cases in flight per model. Each case also runs its chunks with cfg.concurrency; the shared
  // per-model limiter in callModel keeps the total at 20 request starts per minute either way.
  caseConcurrency?: number;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}

export interface ArenaCaseResult extends ArenaRow {
  verdict: 'pass' | 'block' | null;
  findings: Finding[];
  mutation: Mutation | null;
}

export interface ArenaResult {
  rows: ArenaCaseResult[];
  skipped: { seed_id: string; reason: string }[];
  scores: ModelScore[];
}

export const DEFAULT_CASE_CONCURRENCY = 2;

export async function runArena(input: ArenaInput): Promise<ArenaResult> {
  const now = input.now ?? Date.now;
  const { cases, skipped } = prepareCases(input.baseDiff, input.seeds, input.chunkBytes);
  const conc = Math.max(1, input.caseConcurrency ?? DEFAULT_CASE_CONCURRENCY);

  const perModel = await Promise.all(input.models.map(async (model) => {
    const starts: number[] = []; // one rate-limit window per model, across all its cases
    const knobs = JSON.stringify(knobsFor(model, input.cfg.knobs));
    const out: ArenaCaseResult[] = new Array(cases.length);
    let next = 0;
    const worker = async () => {
      while (next < cases.length) {
        const i = next++;
        const c = cases[i];
        const t0 = now();
        const results = await reviewChunks(input.ai, model, c.chunks, input.cfg, t0 + input.cfg.budgetMs, now, { sleep: input.sleep, starts });
        const latency = now() - t0;
        const errors = results.filter((r) => !r.ok).map((r) => (r as { error: string }).error);
        const reviews = results.flatMap((r) => (r.ok ? [r.review] : []));
        const combined = combineReviews(reviews);
        const verdict = errors.length ? null : combined.verdict;
        // A model error scores as not caught and no false alarm; the error is kept on the row.
        const s = errors.length ? { caught: false, falseAlarm: false, severity: null } : scoreCase(c.seed, c.mutation, combined.verdict, combined.findings);
        out[i] = {
          created_at: now(), model, knobs_json: knobs, seed_id: c.seed.id, seed_class: c.seed.class, base_ref: input.baseRef,
          caught: s.caught ? 1 : 0, false_alarm: s.falseAlarm ? 1 : 0, severity: s.severity, latency_ms: latency,
          tokens_out: results.reduce((n, r) => n + r.usage.tokensOut, 0), error: errors[0] ?? null,
          verdict, findings: combined.findings, mutation: c.mutation,
        };
      }
    };
    await Promise.all(Array.from({ length: Math.min(conc, Math.max(1, cases.length)) }, worker));
    return out;
  }));
  const rows = perModel.flat();
  return { rows, skipped, scores: scoreRows(rows) };
}
