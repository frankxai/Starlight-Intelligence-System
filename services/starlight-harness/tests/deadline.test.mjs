import assert from 'node:assert/strict';
import test from 'node:test';
import { before, within } from '../src/run.ts';

test('no GitHub call starts with less than its own timeout left on the lease', () => {
  assert.throws(() => before(Date.now() + 10_000), /lease would expire/);
  assert.doesNotThrow(() => before(Date.now() + 60_000));
});

test('a slow lookup is cut off while there is still time for the write', async () => {
  const started = Date.now();
  // 20 s are kept for the write itself, so a lookup gets about 50 ms here.
  await assert.rejects(within(Date.now() + 20_050, new Promise(() => {})), /before the check finished/);
  assert.ok(Date.now() - started < 2_000);
  assert.equal(await within(Date.now() + 60_000, Promise.resolve('found')), 'found');
});
