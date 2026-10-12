import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, utimesSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { acquireLock } from '../src/gateway/lock.js';
test('old locks remain intact even when legacy takeover threshold is supplied', async () => {
  const root = mkdtempSync(join(tmpdir(),'sis-lock-')); const lock = join(root,'writer.lock');
  try {
    mkdirSync(lock); writeFileSync(join(lock,'meta.json'),'owner-evidence'); utimesSync(lock,new Date(0),new Date(0));
    await assert.rejects(acquireLock(lock,{ timeoutMs:15,retryMs:2,staleAfterMs:1 }));
    assert.equal(readFileSync(join(lock,'meta.json'),'utf8'),'owner-evidence');
  } finally { rmSync(root,{ recursive:true,force:true }); }
});
test('release is idempotent and refuses changed ownership', async () => {
  const root = mkdtempSync(join(tmpdir(),'sis-lock-')); const lock = join(root,'writer.lock');
  try {
    const release = await acquireLock(lock); release(); release(); assert.ok(!existsSync(lock));
    const other = await acquireLock(lock); writeFileSync(join(lock,'meta.json'),JSON.stringify({ token:'another-owner' }));
    assert.throws(other,/ownership/); assert.ok(existsSync(lock));
  } finally { rmSync(root,{ recursive:true,force:true }); }
});
test('unexpected lock contents preserve the metadata needed for recovery', async () => {
  const root = mkdtempSync(join(tmpdir(),'sis-lock-')); const lock = join(root,'writer.lock');
  try {
    const release = await acquireLock(lock); const before = readFileSync(join(lock,'meta.json'),'utf8');
    writeFileSync(join(lock,'external-evidence'),'preserve');
    assert.throws(release,/Unexpected/);
    assert.equal(readFileSync(join(lock,'meta.json'),'utf8'),before);
  } finally { rmSync(root,{ recursive:true,force:true }); }
});
