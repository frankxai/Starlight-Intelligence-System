import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ReviewQueue, type ReviewJob } from '../src/review-queue.js';
import { RuntimeBridge } from '../src/runtime-bridge/bridge.js';
import { WORKER_PROTOCOL } from '../src/runtime-bridge/contracts.js';
const job: ReviewJob = { repo:'github.com/frankxai/SIS',head:'a'.repeat(40),policy:'review-v1',makerProvider:'openai',checkerProvider:'anthropic' };
test('deduplication survives restart and newer revisions supersede queued work', async () => {
  const root = mkdtempSync(join(tmpdir(),'sis-review-'));
  try {
    const path = join(root,'queue.jsonl'); const queue = new ReviewQueue(path);
    const first = await queue.enqueue(job);
    assert.equal((await new ReviewQueue(path).enqueue(job)).id,first.id);
    await queue.enqueue({ ...job,head:'b'.repeat(40) });
    assert.equal(queue.list().find(j=>j.id===first.id)?.state,'superseded');
    await assert.rejects(queue.transition(first.id,'running'),/Invalid/);
    await assert.rejects(queue.enqueue({ ...job,head:'c'.repeat(40),checkerProvider:'OPENAI' }),/independent/);
  } finally { rmSync(root,{ recursive:true,force:true }); }
});
test('pass needs matching evidence and retries obey a persistent budget', async () => {
  const root = mkdtempSync(join(tmpdir(),'sis-review-'));
  try {
    const queue = new ReviewQueue(join(root,'queue.jsonl')); const first = await queue.enqueue(job);
    await queue.transition(first.id,'running');
    await assert.rejects(queue.transition(first.id,'passed'),/evidence/);
    await assert.rejects(queue.transition(first.id,'passed',{ revision:'b'.repeat(40),commands:['tests'],findings:[],limitations:[] }),/evidence/);
    await queue.transition(first.id,'failed'); await queue.transition(first.id,'running'); await queue.transition(first.id,'failed');
    await assert.rejects(queue.transition(first.id,'running'),/Invalid/);
  } finally { rmSync(root,{ recursive:true,force:true }); }
});
test('running and unknown work reserve capacity across restart; exact revision can pass', async () => {
  const root = mkdtempSync(join(tmpdir(),'sis-review-'));
  try {
    const path = join(root,'queue.jsonl'); const queue = new ReviewQueue(path);
    const first = await queue.enqueue(job); await queue.transition(first.id,'running');
    const second = await queue.enqueue({ ...job,head:'b'.repeat(40) });
    await assert.rejects(new ReviewQueue(path).transition(second.id,'running'),/capacity/);
    await queue.transition(first.id,'passed',{ revision:job.head,commands:['node --test'],findings:[],limitations:['Provider identity supplied by host'] });
    await queue.transition(second.id,'running'); await queue.transition(second.id,'unknown');
    const third = await queue.enqueue({ ...job,head:'c'.repeat(40) });
    await assert.rejects(new ReviewQueue(path).transition(third.id,'running'),/capacity/);
    await assert.rejects(queue.reconcileStopped(second.id,''),/evidence/);
    await queue.reconcileStopped(second.id,'synthetic-provider-stop-receipt');
    assert.equal((await queue.transition(third.id,'running')).state,'running');
  } finally { rmSync(root,{ recursive:true,force:true }); }
});
test('host-bound runtime executes the review and malformed output remains unresolved', async () => {
  const root = mkdtempSync(join(tmpdir(),'sis-review-'));
  try {
    const queue = new ReviewQueue(join(root,'queue.jsonl')); const first = await queue.enqueue(job);
    const bridge = new RuntimeBridge({ runtimes:[{ id:'checker',async invoke(request) {
      return { protocol:WORKER_PROTOCOL,taskId:request.taskId,status:'completed',output:JSON.stringify({ verdict:'passed',receipt:{ revision:job.head,commands:['test'],findings:[],limitations:['Synthetic fixture'] } }) };
    } }],routes:{ review:'checker' },maxConcurrency:1,maxRuns:2,timeoutMs:1000 });
    assert.equal((await queue.run(first.id,bridge,'review')).state,'passed');
    const second = await queue.enqueue({ ...job,head:'b'.repeat(40) });
    assert.equal((await queue.run(second.id,bridge,'review')).state,'unknown');
    assert.equal(new ReviewQueue(join(root,'queue.jsonl')).list().find(j=>j.id===second.id)?.state,'unknown');
  } finally { rmSync(root,{ recursive:true,force:true }); }
});
