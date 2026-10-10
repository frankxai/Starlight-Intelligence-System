import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, appendFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ContextBridge, type ContextRecord } from '../src/context-bridge.js';

const event = (id: string, extra: Partial<ContextRecord> = {}): ContextRecord => ({
  id, taskId:'mission',harness:'codex',sessionId:'session',kind:'checkpoint',text:'Resume after verification',
  repo:'github.com/frankxai/Starlight-Intelligence-System',revision:'a'.repeat(40),evidence:'observed',privacy:'internal',...extra,
});
test('BOM and CRLF retain byte offsets; rewriting consumed bytes is refused', async () => {
  const f = fixture();
  try {
    const first = '\uFEFF'+JSON.stringify(event('one'))+'\r\n';
    writeFileSync(f.input,first);
    assert.equal((await f.bridge.capture(f.opts)).offset,Buffer.byteLength(first));
    appendFileSync(f.input,JSON.stringify(event('two'))+'\n');
    assert.equal((await f.bridge.capture(f.opts)).captured,1);
    const before = readFileSync(f.journal,'utf8');
    writeFileSync(f.input,readFileSync(f.input,'utf8').replace('Resume','Change'));
    await assert.rejects(f.bridge.capture(f.opts),/prefix changed/);
    assert.equal(readFileSync(f.journal,'utf8'),before);
  } finally { rmSync(f.root,{ recursive:true,force:true }); }
});
function fixture() {
  const root = mkdtempSync(join(tmpdir(),'sis-capture-'));
  const input = join(root,'input.jsonl'); const journal = join(root,'journal.jsonl');
  return { root,input,journal,bridge:new ContextBridge(journal),opts:{ sourceId:'source',input } };
}
test('capture commits records with cursor; restart and duplicate delivery are idempotent', async () => {
  const f = fixture();
  try {
    writeFileSync(f.input,JSON.stringify(event('one'))+'\n');
    assert.equal((await f.bridge.capture(f.opts)).captured,1);
    const resumed = new ContextBridge(f.journal);
    assert.equal((await resumed.capture(f.opts)).captured,0);
    appendFileSync(f.input,JSON.stringify(event('one'))+'\n'+JSON.stringify(event('two'))+'\n');
    assert.equal((await resumed.capture(f.opts)).captured,1);
    const packet = resumed.packet('mission');
    assert.deepEqual(packet.records.map(r=>r.id),['one','two']);
    assert.equal(packet.records[0].authority,'untrusted-data');
    assert.equal(packet.records[0].sourceOffset,0);
    assert.match(packet.records[0].sourceDigest,/^[a-f0-9]{64}$/);
  } finally { rmSync(f.root,{ recursive:true,force:true }); }
});
test('incomplete UTF-8 source record is withheld and resumed at its byte boundary', async () => {
  const f = fixture();
  try {
    const line = Buffer.from(JSON.stringify(event('unicode',{ text:'café 🌍' }))+'\n');
    writeFileSync(f.input,line.subarray(0,line.length-3));
    assert.equal((await f.bridge.capture(f.opts)).offset,0);
    appendFileSync(f.input,line.subarray(line.length-3));
    assert.equal((await f.bridge.capture(f.opts)).offset,line.length);
    assert.equal(f.bridge.packet('mission').records[0].text,'café 🌍');
  } finally { rmSync(f.root,{ recursive:true,force:true }); }
});
test('private records and conflicting IDs are rejected; metadata is closed and secrets scrubbed', async () => {
  const f = fixture();
  try {
    writeFileSync(f.input,[event('secret',{ text:'token=example-secret contact me@example.com' }),
      event('private',{ privacy:'private' }),event('secret',{ text:'conflicting claim' }),
      { ...event('closed'),credentials:'unknown-field-secret' },{ invalid:true }].map(JSON.stringify).join('\n')+'\n');
    const result = await f.bridge.capture(f.opts);
    assert.equal(result.captured,2); assert.equal(result.rejected,3);
    const persisted = readFileSync(f.journal,'utf8');
    assert.ok(!persisted.includes('example-secret')); assert.ok(!persisted.includes('me@example.com'));
    assert.ok(!persisted.includes('unknown-field-secret')); assert.ok(!persisted.includes('conflicting claim'));
  } finally { rmSync(f.root,{ recursive:true,force:true }); }
});
test('source truncation and corrupted journal fail without changing committed state', async () => {
  const f = fixture();
  try {
    writeFileSync(f.input,JSON.stringify(event('one'))+'\n'); await f.bridge.capture(f.opts);
    const before = readFileSync(f.journal,'utf8'); writeFileSync(f.input,'');
    await assert.rejects(f.bridge.capture(f.opts),/truncated/);
    assert.equal(readFileSync(f.journal,'utf8'),before);
    writeFileSync(f.journal,'incomplete');
    await assert.rejects(f.bridge.capture(f.opts),/Incomplete journal/);
    assert.equal(readFileSync(f.journal,'utf8'),'incomplete');
  } finally { rmSync(f.root,{ recursive:true,force:true }); }
});
test('Codex and Claude native message adapters ignore tools and retain only observed claims', async () => {
  const f = fixture();
  try {
    writeFileSync(f.input,[{ type:'response_item',payload:{ type:'message',role:'assistant',content:[{ type:'output_text',text:'checkpoint' }] } },
      { type:'response_item',payload:{ type:'function_call',arguments:'private tool output' } }].map(JSON.stringify).join('\n')+'\n');
    const metadata = { ...f.opts,format:'codex-rollout' as const,taskId:'mission',harness:'codex',sessionId:'session',repo:'repo' };
    assert.equal((await f.bridge.capture(metadata)).captured,1);
    assert.equal(f.bridge.packet('mission').records[0].evidence,'observed');
    const other = join(f.root,'claude.jsonl');
    writeFileSync(other,JSON.stringify({ type:'assistant',message:{ role:'assistant',content:[{ type:'text',text:'second checkpoint' }] } })+'\n');
    assert.equal((await f.bridge.capture({ ...metadata,input:other,sourceId:'claude-source',format:'claude-jsonl',harness:'claude' })).captured,1);
    assert.equal(f.bridge.packet('mission').records.length,2);
  } finally { rmSync(f.root,{ recursive:true,force:true }); }
});
test('concurrent instances serialize capture and bounded packets report omissions', async () => {
  const f = fixture();
  try {
    writeFileSync(f.input,[event('one'),event('two')].map(JSON.stringify).join('\n')+'\n');
    const results = await Promise.all([f.bridge.capture(f.opts),new ContextBridge(f.journal).capture(f.opts)]);
    assert.equal(results.reduce((sum,r)=>sum+r.captured,0),2);
    assert.equal(f.bridge.packet('mission',1).omitted,1);
    assert.equal(f.bridge.packet('other').records.length,0);
  } finally { rmSync(f.root,{ recursive:true,force:true }); }
});
test('OpenCode sanitized exports preserve message identity across snapshots and reject mismatched sessions', async () => {
  const f = fixture();
  try {
    const message = { info:{ id:'msg-one',role:'assistant',time:{ completed:123 } },parts:[{ type:'text',text:'Checkpoint' },{ type:'tool',text:'do not capture' }] };
    const exported = { info:{ id:'session' },messages:[message] };
    writeFileSync(f.input,JSON.stringify(exported));
    const opts = { ...f.opts,format:'opencode-export' as const,taskId:'mission',harness:'opencode',sessionId:'session',repo:'repo' };
    assert.equal((await f.bridge.capture(opts)).captured,1);
    assert.equal((await new ContextBridge(f.journal).capture(opts)).captured,0);
    exported.messages.push({ ...message,info:{ ...message.info,id:'msg-two' } });
    writeFileSync(f.input,JSON.stringify(exported));
    assert.equal((await f.bridge.capture(opts)).captured,1);
    assert.equal(f.bridge.packet('mission').records.length,2);
    await assert.rejects(f.bridge.capture({ ...opts,sessionId:'wrong',sourceId:'wrong-source' }),/identity/);
    assert.ok(!readFileSync(f.journal,'utf8').includes('do not capture'));
  } finally { rmSync(f.root,{ recursive:true,force:true }); }
});
