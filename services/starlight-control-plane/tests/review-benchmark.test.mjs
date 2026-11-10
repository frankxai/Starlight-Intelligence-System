import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { main, parseUnifiedDiff } from '../scripts/review-benchmark.mjs';

const TOKEN = 'cf_secret_token_value_do_not_print';
const DIFF = [
  'diff --git a/src/a.ts b/src/a.ts',
  'index 1..2 100644',
  '--- a/src/a.ts',
  '+++ b/src/a.ts',
  '@@ -1,2 +1,2 @@',
  ' keep',
  '-old',
  '+new',
  'diff --git a/src/b.ts b/src/b.ts',
  'new file mode 100644',
  '--- /dev/null',
  '+++ b/src/b.ts',
  '@@ -0,0 +1 @@',
  '+added',
  '',
].join('\n');

function sseResponse(content, reasoning) {
  const ev = [
    { choices: [{ delta: { reasoning_content: reasoning }, finish_reason: null }] },
    { choices: [{ delta: { content }, finish_reason: null }] },
    { choices: [{ delta: {}, finish_reason: 'stop' }], usage: { prompt_tokens: 50, completion_tokens: 42 } },
  ];
  const body = ev.map((e) => `data: ${JSON.stringify(e)}\n\n`).join('') + 'data: [DONE]\n\n';
  return new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } });
}

test('parseUnifiedDiff yields the PatchFile list chunkDiff reads', () => {
  const files = parseUnifiedDiff(DIFF);
  assert.deepEqual(files.map((f) => [f.filename, f.status, f.changes]), [['src/a.ts', 'modified', 2], ['src/b.ts', 'added', 1]]);
  assert.ok(files[0].patch.startsWith('@@ -1,2 +1,2 @@'));
});

test('review-benchmark streams through the REST endpoint, prints the metrics and never the token', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'bench-'));
  const diff = join(dir, 'pr.diff');
  writeFileSync(diff, DIFF);
  const calls = [];
  const fetchImpl = async (url, init) => {
    const body = JSON.parse(init.body);
    calls.push({ url, init, body });
    if (body.model.includes('glm')) return new Response(JSON.stringify({ errors: [{ code: 5007, message: `bad ${TOKEN}` }] }), { status: 400 });
    return sseResponse(`thinking done\n{"verdict":"block","findings":[{"severity":"high","file":"src/a.ts","line":2,"summary":"seeded defect"}]}`, 'r'.repeat(300));
  };
  const lines = [];
  const rows = await main(
    ['--diff', diff, '--models', '@cf/deepseek-ai/deepseek-v4.1-flash-1017,@cf/zai-org/glm-5.3', '--gateway', 'starlight-review'],
    { env: { CLOUDFLARE_ACCOUNT_ID: 'acct123', CLOUDFLARE_API_TOKEN: TOKEN }, fetchImpl, log: (s) => lines.push(s) },
  );
  const out = lines.join('\n');
  assert.equal(calls[0].url, 'https://api.cloudflare.com/client/v4/accounts/acct123/ai/v1/chat/completions');
  assert.equal(calls[0].init.headers.authorization, `Bearer ${TOKEN}`);
  const ds = calls.find((c) => c.body.model.includes('deepseek')).body;
  assert.equal(ds.stream, true);
  assert.equal(ds.reasoning_effort, 'low');
  assert.equal(ds.max_completion_tokens, 32000);
  assert.equal('response_format' in ds, false);
  assert.equal(rows[0].verdict, 'block');
  assert.equal(rows[0].findings[0].summary, 'seeded defect');
  assert.match(out, /verdict=block findings=1 completion_tokens=42 reasoning_chars=300 seconds=\d+\.\d finish_reason=stop/);
  // A 400 is not retryable: one call, a block, and the token in the error body is redacted.
  assert.equal(calls.filter((c) => c.body.model.includes('glm')).length, 1);
  assert.equal(rows[1].verdict, 'block');
  assert.match(out, /HTTP 400: 5007 bad \[redacted\]/);
  assert.equal(out.includes(TOKEN), false);
  await assert.rejects(main(['--diff', diff, '--models', 'x'], { env: {} }), /CLOUDFLARE_ACCOUNT_ID/);
});
