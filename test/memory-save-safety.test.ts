import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { MemoryManager } from '../src/memory.js';

const entry = (content: string) => ({ content, category: 'pattern' as const, tags: ['fixture'], confidence: 1 });

test('save replays current committed events instead of overwriting another writer with a stale snapshot', () => {
 const dir=mkdtempSync(join(tmpdir(),'sis-save-')),path=join(dir,'memory.json');
 try {
  const stale=new MemoryManager(path);stale.load();
  const writer=new MemoryManager(path);writer.load();const added=writer.add(entry('another writer'));
  stale.save();
  const events=readFileSync(path+'l','utf8').trim().split('\n').map(line=>JSON.parse(line));
  assert.ok(events.some(event=>event.payload?.id===added.id));
 } finally {rmSync(dir,{recursive:true,force:true});}
});

test('a legacy snapshot cannot resurrect an entry removed from the authoritative event log', () => {
 const dir=mkdtempSync(join(tmpdir(),'sis-save-')),path=join(dir,'memory.json');
 try {
  const manager=new MemoryManager(path);manager.load();const added=manager.add(entry('removed fixture'));manager.save();manager.remove(added.id);
  const restored=new MemoryManager(path);restored.load();assert.equal(restored.search({query:'removed fixture'}).length,0);
 } finally {rmSync(dir,{recursive:true,force:true});}
});

test('interruption before replacement preserves a complete authoritative log', () => {
 const dir=mkdtempSync(join(tmpdir(),'sis-save-')),path=join(dir,'memory.json');
 try {
  const manager=new MemoryManager(path);manager.load();manager.add(entry('committed fixture'));const before=readFileSync(path+'l','utf8');
  const moduleUrl=new URL('../src/memory.ts',import.meta.url).href;
  const script=`import fs from 'node:fs';import {syncBuiltinESMExports} from 'node:module';
   const target=${JSON.stringify(path+'l')};const write=fs.writeFileSync,rename=fs.renameSync;
   fs.writeFileSync=(file,data,...args)=>{if(file===target){write(file,String(data).slice(0,12),...args);process.exit(91);}return write(file,data,...args);};
   fs.renameSync=(from,to)=>{if(to===target)process.exit(91);return rename(from,to);};syncBuiltinESMExports();
   const {MemoryManager}=await import(${JSON.stringify(moduleUrl)});const manager=new MemoryManager(${JSON.stringify(path)});manager.load();manager.save();`;
  const child=spawnSync(process.execPath,['--import','tsx','--input-type=module','-e',script],{encoding:'utf8',timeout:10000});
  assert.equal(child.status,91,child.stderr);assert.equal(readFileSync(path+'l','utf8'),before);
 } finally {rmSync(dir,{recursive:true,force:true});}
});

test('malformed committed data stops save without overwriting the original bytes', () => {
 const dir=mkdtempSync(join(tmpdir(),'sis-save-')),path=join(dir,'memory.json');
 try {
  const manager=new MemoryManager(path);writeFileSync(path+'l','{broken\n');
  assert.throws(()=>manager.save());assert.equal(readFileSync(path+'l','utf8'),'{broken\n');
 } finally {rmSync(dir,{recursive:true,force:true});}
});
