#!/usr/bin/env node
// Benchmark cf-review models on a real diff over the Workers AI REST API, with the exact streaming,
// reasoning-knob, retry and verdict-parsing code the Worker uses (imported from src/review.ts).
//
//   CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_API_TOKEN=... \
//     node services/starlight-control-plane/scripts/review-benchmark.mjs \
//       --diff pr.diff --models @cf/deepseek-ai/deepseek-v4.1-flash-1017,@cf/zai-org/glm-5.3 \
//       --gateway starlight-review
//
// Prints per model: verdict, findings, completion tokens, reasoning chars, seconds, finish_reason.
// The API token is read from the environment and never printed. This is a measurement, not a
// sign-off: it skips the family and maker checks, so it can measure models the gate does not trust.
//
// Calls POST https://api.cloudflare.com/client/v4/accounts/<id>/ai/v1/chat/completions. --gateway is
// only recorded in the output: this REST endpoint is not known to route through AI Gateway, so the
// benchmark measures the models, not the gateway.

import { readFileSync } from 'node:fs';
import {
  DEFAULT_BUDGET_MS, DEFAULT_CONCURRENCY, DEFAULT_GATEWAY, DEFAULT_MAX_TOKENS, DEFAULT_TIMEOUT_MS, MAX_CHUNK_BYTES,
  chunkDiff, combineReviews, parseKnobs, reviewChunks, sanitizeInline,
} from '../src/review.ts';

const USAGE = 'usage: review-benchmark.mjs --diff <file> --models a,b [--gateway starlight-review] [--chunk-bytes N] [--concurrency N] [--timeout-ms N] [--budget-ms N] [--max-tokens N]';

export function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) throw new Error(`unexpected argument ${a}\n${USAGE}`);
    const v = argv[i + 1];
    if (v === undefined || v.startsWith('--')) throw new Error(`${a} needs a value\n${USAGE}`);
    out[a.slice(2)] = v;
    i++;
  }
  if (!out.diff || !out.models) throw new Error(USAGE);
  return out;
}

// A unified diff (git diff / gh pr diff) as the PatchFile list chunkDiff expects.
export function parseUnifiedDiff(text) {
  const files = [];
  let cur = null;
  let inHunks = false;
  for (const line of text.split('\n')) {
    const m = /^diff --git a\/(.+?) b\/(.+)$/.exec(line);
    if (m) {
      cur = { filename: m[2], status: 'modified', changes: 0, patch: '' };
      if (m[1] !== m[2]) cur.previous_filename = m[1];
      files.push(cur);
      inHunks = false;
      continue;
    }
    if (!cur) continue;
    if (!inHunks) {
      if (line.startsWith('new file mode')) cur.status = 'added';
      else if (line.startsWith('deleted file mode')) cur.status = 'removed';
      else if (line.startsWith('rename from')) cur.status = 'renamed';
      else if (line.startsWith('Binary files')) cur.changes = 1; // no patch, so chunkDiff fails closed
      if (!line.startsWith('@@')) continue;
      inHunks = true;
    }
    cur.patch += `${cur.patch ? '\n' : ''}${line}`;
    if ((line.startsWith('+') || line.startsWith('-')) && !line.startsWith('+++') && !line.startsWith('---')) cur.changes++;
  }
  for (const f of files) f.patch = f.patch.replace(/\n+$/, '');
  return files;
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
