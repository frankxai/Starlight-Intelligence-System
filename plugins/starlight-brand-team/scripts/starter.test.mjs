import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skill = join(root, 'skills/starlight-brand-team');
const text = path => readFileSync(path, 'utf8');
function files(dir) { return readdirSync(dir, { withFileTypes:true }).flatMap(x => x.isDirectory() ? files(join(dir,x.name)) : [join(dir,x.name)]); }
function install(host, target, packageRoot=root) { return spawnSync(process.execPath, [join(packageRoot,'install.mjs'),host,target], {encoding:'utf8'}); }
function sandbox(fn) { const dir=mkdtempSync(join(tmpdir(),'brand-team-test-')); try { fn(dir); } finally { rmSync(dir,{recursive:true,force:true}); } }
for (const [host, path] of Object.entries({claude:'.claude/skills',codex:'.agents/skills',antigravity:'.agents/skills',opencode:'.opencode/skills'})) {
  test(host+' installs full references in a path with spaces, preserves existing project files and refuses overwrite', () => sandbox(dir => {
    const target=join(dir,'private client workspace');mkdirSync(target);
    writeFileSync(join(target,'AGENTS.md'),'existing instructions');
    writeFileSync(join(target,'CLAUDE.md'),'existing Claude instructions');
    const result=install(host,target);assert.equal(result.status,0,result.stderr);
    const dest=join(target,path,'starlight-brand-team');
    for (const source of files(skill)) assert.deepEqual(readFileSync(join(dest,source.slice(skill.length+1))),readFileSync(source));
    assert.equal(text(join(target,'AGENTS.md')),'existing instructions');
    assert.equal(text(join(target,'CLAUDE.md')),'existing Claude instructions');
    writeFileSync(join(dest,'references/demo-sources.md'),'private local edits');
    assert.notEqual(install(host,target).status,0);
    assert.equal(text(join(dest,'references/demo-sources.md')),'private local edits');
  }));
}
test('invalid host writes nothing',()=>sandbox(dir=>{const target=join(dir,'absent');assert.notEqual(install('unknown',target).status,0);assert.equal(existsSync(target),false);}));
test('refuses symlink ancestors including a dangling symlink',()=>sandbox(dir=>{
  const external=join(dir,'external');mkdirSync(external);
  const target=join(dir,'private');mkdirSync(target);symlinkSync(external,join(target,'.agents'));
  assert.notEqual(install('codex',target).status,0);assert.equal(readdirSync(external).length,0);
  const dangling=join(dir,'dangling');symlinkSync(join(dir,'missing'),dangling);
  assert.notEqual(install('claude',dangling).status,0);assert.equal(existsSync(join(dir,'missing')),false);
}));
test('skill is self-contained, loadable frontmatter and every markdown relative link resolves',()=>{
  const main=text(join(skill,'SKILL.md'));
  assert.match(main,/^---\nname: starlight-brand-team\ndescription: .{50,1024}\n---/);
  for(const file of files(root).filter(x=>x.endsWith('.md'))) {
    for(const match of text(file).matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      if (/^(https?:|#)/.test(match[1])) continue;
      const target=resolve(dirname(file),match[1]);
      assert.ok(target.startsWith(root+'/'), 'escaped reference '+file);
      assert.ok(existsSync(target),'missing reference '+target);
    }
  }
  assert.ok(files(root).every(f=>!lstatSync(f).isSymbolicLink()));
});
test('portable and host manifests agree and declare no runtime or MCP integration',()=>{
  const base=JSON.parse(text(join(root,'plugin.json')));
  for(const file of ['.claude-plugin/plugin.json','.codex-plugin/plugin.json']) {
    const m=JSON.parse(text(join(root,file)));assert.equal(m.name,base.name);assert.equal(m.version,base.version);assert.equal(m.description,base.description);
  }
  assert.ok(base.extensions['com.openai'].interface.shortDescription.length<=30);
  assert.equal(base.mcpServers,undefined);assert.equal(existsSync(join(root,'mcp.json')),false);
  assert.equal(existsSync(join(root,'hooks')),false);
});
test('first-use prompt is reproducible from canonical files',()=>{
  const before=text(join(root,'START-HERE.md'));
  const run=spawnSync(process.execPath,[join(root,'scripts/build-first-use.mjs')],{encoding:'utf8'});assert.equal(run.status,0,run.stderr);
  assert.equal(text(join(root,'START-HERE.md')),before);
  for(const name of ['AGENTS.md','workflow.md','demo-sources.md']) assert.ok(before.includes(text(join(skill,'references',name))));
});
