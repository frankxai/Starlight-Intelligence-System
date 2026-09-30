import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {checkPacket, validateRegistry} from './records-control.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const registry = JSON.parse(fs.readFileSync(path.join(here,'registry.json'),'utf8'));
const names = JSON.parse(fs.readFileSync(path.join(here,'name-research.json'),'utf8'));
const H = c => c.repeat(64);
function fixture() {
  return {schema_version:1,release_id:'TEST-RELEASE',work_id:'TEST-WORK',recording_id:'TEST-RECORDING',
    artist_id:'ar:artist:frank-x',label_id:'ar:label:arcanea-records',packet_revision:1,packet_sha256:H('a'),
    metadata:{title:'Test only',artist_display_name:'Frank X',ai_disclosure:'Fixture declaration, not a real release'},
    master:{sha256:H('b'),evidence_ref:'fixture:master'},artwork:{sha256:H('c'),evidence_ref:'fixture:artwork'},
    artist_admission:{decision:'approved',evidence_ref:'fixture:artist'},
    name_review:{status:'reviewed_for_scope',territories:['test'],evidence_ref:'fixture:name'},
    rights:{status:'reviewed_for_scope',component_evidence_refs:['fixture:rights']},canon:{status:'not_applicable'},
    human_approval:{approved_by:'Test reviewer',evidence_ref:'fixture:approval',packet_sha256:H('a'),
      packet_revision:1,master_sha256:H('b'),artwork_sha256:H('c'),scope:['prepare_distribution']},
    delivery:{status:'not_submitted'}};
}
test('real registry binds founder direction and every name row',()=>assert.deepEqual(validateRegistry(registry,names),[]));
test('duplicate identity IDs and orphan evidence are rejected',()=>{
  const r=structuredClone(registry);r.identities.push(r.identities[0]);
  const n=structuredClone(names);n.records[0].identity_id='missing';
  assert.ok(validateRegistry(r,n).length>=2);
});
test('preliminary name evidence cannot claim legal clearance',()=>{
  const n=structuredClone(names);n.records[0].legal_clearance='Cleared';
  assert.ok(validateRegistry(registry,n).length);
});
test('complete fixture remains unauthenticated and never publication-authorized',()=>{
  const out=checkPacket(fixture(),registry);assert.equal(out.structurally_complete,true);
  assert.equal(out.publication_authorized,false);assert.equal(out.evidence_authenticated,false);
});
test('A&R review cannot replace component rights evidence',()=>{
  const p=fixture();p.rights.status='unknown';assert.equal(checkPacket(p,registry).structurally_complete,false);
});
test('master and artwork changes invalidate review independently',()=>{
  for(const key of ['master','artwork']){const p=fixture();p[key].sha256=H('d');assert.equal(checkPacket(p,registry).structurally_complete,false);}
});
test('packet revision or hash changes invalidate review',()=>{
  for(const key of ['packet_revision','packet_sha256']){const p=fixture();p[key]=key==='packet_revision'?2:H('e');
    assert.equal(checkPacket(p,registry).structurally_complete,false);}
});
test('series cannot consume a primary performer identity',()=>{
  const p=fixture();p.artist_id='ar:series:starlight';p.metadata.artist_display_name='Starlight';
  assert.equal(checkPacket(p,registry).structurally_complete,false);
});
test('submitted/live claims require receipts and correct-profile checks',()=>{
  const p=fixture();p.delivery.status='submitted';assert.equal(checkPacket(p,registry).structurally_complete,false);
  p.delivery={status:'live_verified',receipt_ref:'fixture:receipt',provider_release_id:'fixture:id',
    live_checks:[{url:'https://example.test/track',artist_id:'wrong',verified_by:'test',checked_at:'2026-09-30'}]};
  assert.equal(checkPacket(p,registry).structurally_complete,false);
});
test('uncertain provider effect blocks a retry-ready packet',()=>{
  const p=fixture();p.delivery.status='uncertain';assert.equal(checkPacket(p,registry).structurally_complete,false);
});
test('legacy release command exits without changing catalog or creating delivery claims',()=>{
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'records-control-'));
  try {
    const wf=path.join(tmp,'workflows');const cat=path.join(tmp,'catalog');fs.mkdirSync(wf);fs.mkdirSync(cat);
    for(const file of ['music-cli.js','catalog-coprocessor.js'])fs.copyFileSync(path.join(here,'../workflows',file),path.join(wf,file));
    fs.writeFileSync(path.join(tmp,'package.json'),'{"type":"module"}\n');
    const before='song_id,title,status\nTEST,Test,draft\n';fs.writeFileSync(path.join(cat,'master.csv'),before);
    const result=spawnSync(process.execPath,[path.join(wf,'music-cli.js'),'release','TEST'],{encoding:'utf8'});
    assert.equal(result.status,1);assert.equal(fs.readFileSync(path.join(cat,'master.csv'),'utf8'),before);
    assert.match(result.stderr,/cannot verify/);assert.doesNotMatch(result.stdout,/COMPLETE|GATE PASS/);
  } finally {fs.rmSync(tmp,{recursive:true,force:true});}
});

test('legacy intake keeps unobserved metadata and rights unknown',()=>{
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'records-intake-'));
  try {
    const wf=path.join(tmp,'workflows');const cat=path.join(tmp,'catalog');fs.mkdirSync(wf);fs.mkdirSync(cat);
    for(const file of ['music-cli.js','catalog-coprocessor.js'])fs.copyFileSync(path.join(here,'../workflows',file),path.join(wf,file));
    fs.writeFileSync(path.join(tmp,'package.json'),'{"type":"module"}\n');
    const headers=['song_id','title','status','engine','suno_prompt','bpm','key','duration_seconds','structure_tags','created_date','royalty_graph_id','attestation_hash','ai_disclosure_metadata'];
    fs.writeFileSync(path.join(cat,'master.csv'),headers.join(',')+'\n');
    const result=spawnSync(process.execPath,[path.join(wf,'music-cli.js'),'song','https://suno.com/song/test-fixture','frank-x','arcanea-records'],{encoding:'utf8'});
    assert.equal(result.status,0);
    const cells=fs.readFileSync(path.join(cat,'master.csv'),'utf8').trim().split('\n')[1].split(',');
    const row=Object.fromEntries(headers.map((h,i)=>[h,cells[i]]));
    assert.equal(row.engine,'unknown');
    for(const key of ['suno_prompt','bpm','key','duration_seconds','structure_tags','created_date','royalty_graph_id','attestation_hash'])assert.equal(row[key],'');
    assert.match(row.ai_disclosure_metadata,/rights require review/);
    assert.doesNotMatch(row.ai_disclosure_metadata,/CC-BY|licensed/);
  } finally {fs.rmSync(tmp,{recursive:true,force:true});}
});
