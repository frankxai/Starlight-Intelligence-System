import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, utimesSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { acquireLock, inspectLock, breakStaleLock } from '../src/gateway/lock.js';
import { spawnSync } from 'node:child_process';
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

test('administrative recovery preserves a live owner even with its exact token', async () => {
  const root = mkdtempSync(join(tmpdir(),'sis-lock-')); const lock = join(root,'writer.lock');
  try {
    const release = await acquireLock(lock);
    const before = readFileSync(join(lock,'meta.json'),'utf8');
    const meta = inspectLock(lock).meta!;
    assert.throws(() => breakStaleLock(lock,meta.token),/owner.*alive/i);
    assert.equal(readFileSync(join(lock,'meta.json'),'utf8'),before);
    release();
  } finally { rmSync(root,{ recursive:true,force:true }); }
});

test('administrative recovery requires the inspected token and preserves incomplete evidence', async () => {
  const root = mkdtempSync(join(tmpdir(),'sis-lock-')); const lock = join(root,'writer.lock');
  try {
    const release = await acquireLock(lock);
    const before = readFileSync(join(lock,'meta.json'),'utf8');
    assert.throws(() => (breakStaleLock as (...args: unknown[]) => boolean)(lock),/token/i);
    assert.throws(() => breakStaleLock(lock,'another-owner'),/token/i);
    assert.equal(readFileSync(join(lock,'meta.json'),'utf8'),before);
    release();
    mkdirSync(lock);
    assert.deepEqual(inspectLock(lock),{ locked:true,lockPath:lock,corrupted:true });
    assert.throws(() => breakStaleLock(lock,'unverified'),/evidence|metadata|corrupt/i);
    assert.ok(existsSync(lock));
  } finally { rmSync(root,{ recursive:true,force:true }); }
});

test('administrative recovery releases only the unchanged lock of an exited process', () => {
  const root = mkdtempSync(join(tmpdir(),'sis-lock-')); const lock = join(root,'writer.lock');
  try {
    const moduleUrl = new URL('../src/gateway/lock.ts',import.meta.url).href;
    const child = spawnSync(process.execPath,['--import','tsx','--input-type=module','-e',
      `import { acquireLock } from ${JSON.stringify(moduleUrl)}; await acquireLock(${JSON.stringify(lock)}); console.log(process.pid);`],
      { encoding:'utf8',timeout:10000 });
    assert.equal(child.status,0,child.stderr);
    const meta = inspectLock(lock).meta!;
    assert.equal(meta.pid,Number(child.stdout.trim()));
    const before = readFileSync(join(lock,'meta.json'),'utf8');
    writeFileSync(join(lock,'unexpected'),'preserve');
    assert.throws(() => breakStaleLock(lock,meta.token),/evidence|contents|corrupt/i);
    assert.equal(readFileSync(join(lock,'meta.json'),'utf8'),before);
    rmSync(join(lock,'unexpected'));
    assert.equal(breakStaleLock(lock,meta.token),true);
    assert.equal(inspectLock(lock).locked,false);
    assert.equal(breakStaleLock(lock,meta.token),false);
  } finally { rmSync(root,{ recursive:true,force:true }); }
});

test('administrative recovery preserves remote, legacy and malformed ownership evidence', async () => {
  const root = mkdtempSync(join(tmpdir(),'sis-lock-')); const lock = join(root,'writer.lock');
  try {
    const release = await acquireLock(lock);
    const metaFile = join(lock,'meta.json');
    const original = readFileSync(metaFile,'utf8');
    const meta = JSON.parse(original);
    for (const host of [undefined,`${meta.host}-remote`]) {
      const evidence = JSON.stringify({ ...meta,host });
      writeFileSync(metaFile,evidence);
      assert.throws(() => breakStaleLock(lock,meta.token),/host.*unknown|remote/i);
      assert.equal(readFileSync(metaFile,'utf8'),evidence);
    }
    for (const evidence of ['{',JSON.stringify({ ...meta,pid:0 }),
      JSON.stringify({ ...meta,token:'invalid' }), ' '.repeat(4097)]) {
      writeFileSync(metaFile,evidence);
      assert.equal(inspectLock(lock).corrupted,true);
      assert.throws(() => breakStaleLock(lock,meta.token),/evidence|corrupt/i);
      assert.equal(readFileSync(metaFile,'utf8'),evidence);
    }
    writeFileSync(metaFile,original);
    release();
  } finally { rmSync(root,{ recursive:true,force:true }); }
});


test('an existing recovery guard prevents a second recoverer from deleting dead-owner evidence', () => {
  const root = mkdtempSync(join(tmpdir(),'sis-lock-')); const lock = join(root,'writer.lock');
  try {
    const moduleUrl = new URL('../src/gateway/lock.ts',import.meta.url).href;
    const child = spawnSync(process.execPath,['--import','tsx','--input-type=module','-e',
      `import { acquireLock } from ${JSON.stringify(moduleUrl)}; await acquireLock(${JSON.stringify(lock)});`],
      { encoding:'utf8',timeout:10000 });
    assert.equal(child.status,0,child.stderr);
    const before = readFileSync(join(lock,'meta.json'),'utf8');
    const meta = inspectLock(lock).meta!;
    mkdirSync(lock+'.recovery');
    assert.throws(() => breakStaleLock(lock,meta.token),/recovery.*active|recovery.*unverified/i);
    assert.equal(readFileSync(join(lock,'meta.json'),'utf8'),before);
    assert.ok(existsSync(lock+'.recovery'));
  } finally { rmSync(root,{ recursive:true,force:true }); }
});
