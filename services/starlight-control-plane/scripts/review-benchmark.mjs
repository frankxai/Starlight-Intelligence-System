#!/usr/bin/env node
// Benchmark cf-review models on a real diff over the Workers AI REST API, with the exact streaming,
// reasoning-knob, retry and verdict-parsing code the Worker uses (imported from src/review.ts).
//
//   CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_API_TOKEN=... \
//     node services/starlight-control-plane/scripts/review-benchmark.mjs \
//       --diff pr.diff --models @cf/deepseek-ai/deepseek-v4.1-flash-1017,@cf/zai-org/glm-5.3 \
//       --gateway starlight-review
//
// Reviewer arena (docs/control-plane/ARENA.md): add --arena --base-diff <file> [--seeds all|<class>]
// [--out results.json] to plant seeded defects and print catch %, false alarm %, p50 s and n per model.
//
// Prints per model: verdict, findings, completion tokens, reasoning chars, seconds, finish_reason.
// The API token is read from the environment and never printed. This is a measurement, not a
// sign-off: it skips the family and maker checks, so it can measure models the gate does not trust.
//
// Calls POST https://api.cloudflare.com/client/v4/accounts/<id>/ai/v1/chat/completions. --gateway is
// only recorded in the output: this REST endpoint is not known to route through AI Gateway, so the
// benchmark measures the models, not the gateway.

import { readFileSync, writeFileSync } from 'node:fs';
import {
  DEFAULT_BUDGET_MS, DEFAULT_CONCURRENCY, DEFAULT_GATEWAY, DEFAULT_MAX_TOKENS, DEFAULT_TIMEOUT_MS, MAX_CHUNK_BYTES,
  chunkDiff, combineReviews, parseKnobs, parseUnifiedDiff, reviewChunks, sanitizeInline,
} from '../src/review.ts';
import { recommendGateModels, readThresholds, runArena, selectSeeds } from '../arena/run.ts';

// Re-exported: the parser moved to src/review.ts so the reviewer arena shares it.
export { parseUnifiedDiff };

const USAGE = [
  'usage: review-benchmark.mjs --diff <file> --models a,b [--gateway starlight-review] [--chunk-bytes N] [--concurrency N] [--timeout-ms N] [--budget-ms N] [--max-tokens N]',
  '       review-benchmark.mjs --arena --base-diff <file> --models a,b [--seeds all|<class>] [--base-ref <label>] [--out results.json] [--case-concurrency N] [same tuning flags]',
].join('\n');
const FLAGS = new Set(['arena']);

export function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) throw new Error(`unexpected argument ${a}\n${USAGE}`);
    if (FLAGS.has(a.slice(2))) { out[a.slice(2)] = true; continue; }
    const v = argv[i + 1];
    if (v === undefined || v.startsWith('--')) throw new Error(`${a} needs a value\n${USAGE}`);
    out[a.slice(2)] = v;
    i++;
  }
  if (!out.models || (out.arena ? !out['base-diff'] : !out.diff)) throw new Error(USAGE);
  return out;
}

// The REST endpoint as an AiBinding, so reviewChunks drives it exactly like env.AI.
export function restBinding({ accountId, token, fetchImpl = fetch }) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/v1/chat/completions`;
  return {
    url,
    async run(model, input) {
      const res = await fetchImpl(url, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ model, ...input }),
      });
      if (!res.ok) {
        const raw = await res.text().catch(() => '');
        let detail = raw.slice(0, 300);
        try {
          const j = JSON.parse(raw);
          const errs = j.errors ?? (j.error ? [j.error] : []);
          if (errs.length) detail = errs.map((e) => (typeof e === 'string' ? e : `${e.code ?? ''} ${e.message ?? ''}`.trim())).join('; ');
        } catch { /* not JSON; keep the text */ }
        throw new Error(`HTTP ${res.status}: ${detail}`);
      }
      if (!res.body) throw new Error('empty response body');
      return res.body;
    },
  };
}

const posInt = (v, d, name) => {
  if (v === undefined || v === '') return d;
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`${name} must be a positive integer`);
  return n;
};

const pctCell = (x) => (x === null ? 'n/a' : `${(x * 100).toFixed(1)}%`);
const pad = (s, n) => String(s).padEnd(n);
// Terminal text from our own inputs (model ids, file paths, reasons): one line, no GitHub defusing.
const flat = (s, n) => String(s ?? '').replace(/[\r\n\u2028\u2029]+/g, ' ').slice(0, n);

// --arena: plant every selected seed into the base diff, review each mutated diff (and the clean
// controls) with every model, and print catch %, false alarm %, p50 seconds and n per model.
export async function arena(args, { env, cfg, chunkBytes, models, ai, say, redact = (x) => x, now }) {
  const seeds = selectSeeds(args.seeds ?? 'all');
  const baseRef = args['base-ref'] || args['base-diff'];
  const caseConcurrency = posInt(args['case-concurrency'], undefined, 'case-concurrency');
  const result = await runArena({ ai, models, seeds, baseDiff: readFileSync(args['base-diff'], 'utf8'), baseRef, cfg, chunkBytes, caseConcurrency, now });
  const recommendation = recommendGateModels(result.scores, readThresholds(env));
  say(`reviewer arena: ${seeds.length} seed(s) selected, ${seeds.length - result.skipped.length} applied, base=${flat(baseRef, 200)}`);
  for (const k of result.skipped) say(`  skipped ${k.seed_id}: ${k.reason}`);
  say('');
  say(`${pad('model', 48)} ${pad('catch %', 9)} ${pad('false alarm %', 14)} ${pad('p50 s', 7)} n`);
  for (const s of result.scores) {
    const p50 = s.p50_latency_ms === null ? 'n/a' : (s.p50_latency_ms / 1000).toFixed(1);
    say(`${pad(flat(s.model, 80), 48)} ${pad(pctCell(s.catch_rate), 9)} ${pad(pctCell(s.false_alarm_rate), 14)} ${pad(p50, 7)} ${s.n} (${s.n_seeded} seeded, ${s.n_clean} clean)`);
  }
  for (const r of result.rows.filter((x) => x.error)) say(`  ! ${flat(r.model, 80)} ${r.seed_id}: ${sanitizeInline(r.error, 300)}`);
  say('');
  say(`recommended for STARLIGHT_GATE_MODELS (not applied): ${recommendation.recommended.length ? recommendation.recommended.join(', ') : '(none)'}`);
  for (const m of recommendation.models) say(`  ${m.qualifies ? '+' : '-'} ${flat(m.model, 80)}: ${m.reasons.map((x) => flat(x, 400)).join('; ')}`);
  const out = { base_ref: baseRef, rows: result.rows, skipped: result.skipped, scores: result.scores, recommendation };
  if (args.out) {
    // Model errors can echo request details; the token is scrubbed from the file as from the console.
    writeFileSync(args.out, `${redact(JSON.stringify(out, null, 2))}\n`);
    say(`wrote ${args.out}`);
  }
  return out;
}

export async function main(argv, { env = process.env, fetchImpl = fetch, log = console.log, now = Date.now } = {}) {
  const args = parseArgs(argv);
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const token = env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !token) throw new Error('set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in the environment');
  const redact = (s) => String(s).split(token).join('[redacted]');
  const say = (s) => log(redact(s));

  const models = [...new Set(args.models.split(',').map((m) => m.trim()).filter(Boolean))];
  const cfg = {
    gatewayId: args.gateway || env.STARLIGHT_REVIEW_GATEWAY || DEFAULT_GATEWAY,
    timeoutMs: posInt(args['timeout-ms'] ?? env.STARLIGHT_REVIEW_TIMEOUT_MS, DEFAULT_TIMEOUT_MS, 'timeout-ms'),
    budgetMs: posInt(args['budget-ms'] ?? env.STARLIGHT_REVIEW_BUDGET_MS, DEFAULT_BUDGET_MS, 'budget-ms'),
    maxTokens: posInt(args['max-tokens'] ?? env.STARLIGHT_REVIEW_MAX_TOKENS, DEFAULT_MAX_TOKENS, 'max-tokens'),
    concurrency: posInt(args.concurrency ?? env.STARLIGHT_REVIEW_CONCURRENCY, DEFAULT_CONCURRENCY, 'concurrency'),
    knobs: parseKnobs(env.STARLIGHT_REVIEW_KNOBS),
  };
  const chunkBytes = posInt(args['chunk-bytes'] ?? env.STARLIGHT_REVIEW_CHUNK_BYTES, MAX_CHUNK_BYTES, 'chunk-bytes');
  if (args.arena) return arena(args, { env, cfg, chunkBytes, models, ai: restBinding({ accountId, token, fetchImpl }), say, redact, now });
  const chunks = chunkDiff(parseUnifiedDiff(readFileSync(args.diff, 'utf8')), chunkBytes);
  const ai = restBinding({ accountId, token, fetchImpl });

  say(`cf-review benchmark: ${chunks.length} chunk(s) of at most ${chunkBytes} bytes, gateway=${cfg.gatewayId}, max_completion_tokens=${cfg.maxTokens}, concurrency=${cfg.concurrency}`);
  const rows = await Promise.all(models.map(async (model) => {
    const t0 = now();
    const results = await reviewChunks(ai, model, chunks, cfg, t0 + cfg.budgetMs, now);
    const seconds = (now() - t0) / 1000;
    const reviews = results.filter((r) => r.ok).map((r) => r.review);
    const errors = results.filter((r) => !r.ok).map((r) => r.error);
    const combined = combineReviews(reviews);
    return {
      model,
      verdict: errors.length ? 'block' : combined.verdict,
      findings: combined.findings,
      errors,
      completionTokens: results.reduce((s, r) => s + r.usage.tokensOut, 0),
      reasoningChars: results.reduce((s, r) => s + r.reasoningChars, 0),
      seconds,
      finishReasons: results.map((r) => r.finishReason ?? 'none'),
      attempts: results.reduce((s, r) => s + r.attempts, 0),
    };
  }));
  for (const r of rows) {
    say('');
    say(`${r.model}`);
    say(`  verdict=${r.verdict} findings=${r.findings.length} completion_tokens=${r.completionTokens} reasoning_chars=${r.reasoningChars} seconds=${r.seconds.toFixed(1)} finish_reason=${r.finishReasons.join(',')} attempts=${r.attempts}`);
    for (const f of r.findings) say(`  - ${f.severity} ${sanitizeInline(f.file, 200)}${f.line != null ? `:${f.line}` : ''}: ${sanitizeInline(f.summary, 300)}`);
    for (const e of r.errors) say(`  ! ${sanitizeInline(e, 400)}`);
  }
  return rows;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main(process.argv.slice(2)).catch((e) => {
    const token = process.env.CLOUDFLARE_API_TOKEN;
    const msg = String(e?.message ?? e);
    console.error(token ? msg.split(token).join('[redacted]') : msg);
    process.exit(2);
  });
}
