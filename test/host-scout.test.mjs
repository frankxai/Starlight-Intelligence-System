import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, renameSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { collectHostSnapshot, findBinaries, SCHEMA_VERSION } from '../tools/fleet/host-scout.mjs';

function fixture(callback) {
  const dir = mkdtempSync(join(tmpdir(), 'starlight-scout-'));
  try {
    const home = join(dir, 'home');
    const projectRoot = join(dir, 'project');
    const bin = join(dir, 'bin');
    mkdirSync(home, { recursive: true }); mkdirSync(projectRoot); mkdirSync(bin);
    const skill = join(home, '.claude', 'skills', 'frontend-design');
    mkdirSync(skill, { recursive: true });
    writeFileSync(join(skill, 'SKILL.md'), '---\nname: frontend-design\n---\nread-only test fixture\n');
    mkdirSync(join(home, '.codex'), { recursive: true });
    writeFileSync(join(home, '.codex', 'config.toml'), '[mcp_servers.company-internal]\ncommand = "secret command"\ntoken = "secret-access-token-123"\n');
    writeFileSync(join(projectRoot, '.mcp.json'), JSON.stringify({mcpServers: {workspace: {env: {API_KEY:'sensitive123456789'}}, tools: {url:'https://internal.example'}}}));
    writeFileSync(join(projectRoot, 'package.json'), JSON.stringify({name:'demo',dependencies:{'react':'^18', '@example/private-lib':'https://token@example.invalid/code'},devDependencies:{typescript:'5.8'}}));
    writeFileSync(join(bin, 'claude'), 'fixture executable');
    return callback({home,projectRoot,bin,dir});
  } finally {rmSync(dir, { recursive: true, force: true });}
}

test('snapshot reports observed installations without claiming auth, sessions or dispatch', () => fixture(({home,projectRoot,bin}) => {
  const snapshot = collectHostSnapshot({machineId:'test-laptop', home,projectRoot,pathEnv:bin,platform:'linux',now:'2026-10-27T08:00:00.000Z'});
  assert.equal(snapshot.schemaVersion, SCHEMA_VERSION);
  assert.equal(snapshot.host.claimedMachineId,'test-laptop');
  assert.equal(snapshot.host.identity,'locally_observed_not_attested');
  assert.equal(snapshot.harnesses.find(x=>x.id==='claude').state,'installed_unverified');
  assert.equal(snapshot.harnesses.find(x=>x.id==='codex').state,'not_observed');
  assert.equal(snapshot.permission.remoteDispatch,'not_authorized');
  assert.equal(snapshot.sessions.state,'not_scanned');
  assert.equal(snapshot.skills[0].state,'manifest_present_unloaded');
  assert.equal(snapshot.skillsTruncated,false);
  assert.equal(snapshot.mcpServers.length,3);
  assert.deepEqual(snapshot.projectPackages.map(x=>x.id),['@example/private-lib','react','typescript']);
  const serialized=JSON.stringify(snapshot);
  for(const secret of ['sensitive123456789','secret-access-token-123','token@example.invalid','secret command']) assert.equal(serialized.includes(secret),false);
  assert.match(snapshot.observationSha256,/^[a-f0-9]{64}$/);
}));

test('id validation fails closed and path disclosure is explicitly optional', () => fixture(({home,projectRoot,bin}) => {
  assert.throws(()=>collectHostSnapshot({machineId:'../../unsafe',home,projectRoot,pathEnv:bin}),/invalid machine id/);
  const redacted=collectHostSnapshot({machineId:'test',home,projectRoot,pathEnv:bin});
  assert.equal(JSON.stringify(redacted).includes(projectRoot),false);
  const detailed=collectHostSnapshot({machineId:'test',home,projectRoot,pathEnv:bin,includePaths:true});
  assert.equal(detailed.privacy.exactPathsIncluded,true);
  assert.ok(detailed.skills[0].source.includes('SKILL.md'));
}));

test('symlinked SKILL.md is not followed or hashed', (t) => fixture(({home,projectRoot,bin}) => {
  const extra = join(home,'.agents','skills','link-skill');
  mkdirSync(extra,{recursive:true});
  try {
    symlinkSync(join(home,'.claude','skills','frontend-design','SKILL.md'),join(extra,'SKILL.md'));
  } catch (error) {
    if (error.code !== 'EPERM' && error.code !== 'EACCES') throw error;
    t.skip(`File symlink creation is not permitted (${error.code}); symlink privilege is required on Windows`);
    return;
  }
  const result=collectHostSnapshot({home,projectRoot,pathEnv:bin});
  assert.equal(result.skills.some(x=>x.id==='link-skill'),false);
}));

test('skills root junction or symlink is followed', () => fixture(({home,projectRoot,bin,dir}) => {
  const root = join(home,'.claude','skills');
  const target = join(dir,'shared-skills');
  renameSync(root,target);
  symlinkSync(target,root,process.platform === 'win32' ? 'junction' : 'dir');
  const result = collectHostSnapshot({home,projectRoot,pathEnv:bin});
  assert.equal(result.skills.length,1);
  assert.equal(result.skills[0].id,'frontend-design');
  assert.equal(result.skills[0].harness,'claude');
  assert.equal(result.skills[0].scope,'user');
  assert.equal(result.skillsTruncated,false);
}));

test('skill entry junction or symlink is not followed', () => fixture(({home,projectRoot,bin}) => {
  const root = join(home,'.claude','skills');
  symlinkSync(join(root,'frontend-design'),join(root,'linked-entry'),process.platform === 'win32' ? 'junction' : 'dir');
  const result = collectHostSnapshot({home,projectRoot,pathEnv:bin});
  assert.equal(result.skills.some(x=>x.id==='linked-entry'),false);
}));

test('skill cap reports truncation within a root and across roots', () => fixture(({home,projectRoot,bin}) => {
  const root = join(home,'.claude','skills');
  for (let i = 0; i < 249; i++) {
    const skill = join(root,`skill-${i}`);
    mkdirSync(skill);
    writeFileSync(join(skill,'SKILL.md'),'bounded fixture');
  }
  const complete = collectHostSnapshot({home,projectRoot,pathEnv:bin});
  assert.equal(complete.skills.length,250);
  assert.equal(complete.skillsTruncated,false);

  const later = join(home,'.codex','skills','later-skill');
  mkdirSync(later,{recursive:true});
  writeFileSync(join(later,'SKILL.md'),'later root');
  const crossRoot = collectHostSnapshot({home,projectRoot,pathEnv:bin});
  assert.equal(crossRoot.skills.length,250);
  assert.equal(crossRoot.skillsTruncated,true);

  rmSync(later,{recursive:true});
  mkdirSync(join(root,'overflow'));
  writeFileSync(join(root,'overflow','SKILL.md'),'overflow');
  const withinRoot = collectHostSnapshot({home,projectRoot,pathEnv:bin});
  assert.equal(withinRoot.skills.length,250);
  assert.equal(withinRoot.skillsTruncated,true);
}));

test('binary scan never starts a process and reports no inferred versions', () => fixture(({bin})=> {
  const found=findBinaries({pathEnv:bin,platform:'linux'}).find(x=>x.id==='claude');
  assert.equal(found.version,null);
  assert.equal(found.auth,'unknown');
  assert.equal(found.runtime,'unknown');
}));
