import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,mkdirSync,symlinkSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {SCHEMA,VERSION,CAPABILITIES,sha256,seal,verify,parseJson,memoryProjection,merge,packFromSpec,main} from './handoff.mjs';
const scope={projectId:'demo-project',tenantId:'demo-tenant',brandId:'demo-brand',environment:'local'};
const original=Buffer.from('# Draft\n\n星光 · retain source bytes.\n');
const artifact={id:'draft',jobId:'job',name:'draft.md',mediaType:'text/markdown',source:{host:'local',uri:'urn:example:draft',revision:'example-1',rights:'owned',visibility:'private',exportAllowed:true},sha256:sha256(original),bytes:original.length,bodyBase64:original.toString('base64')};
function body(){return {schema:SCHEMA,version:VERSION,scope:{...scope},objective:'Carry a reviewable result between specialists.',nextAction:'Review the original before continuing.',jobs:[{id:'job',capability:'architecture',summary:'Synthetic architecture draft.'}],artifacts:[structuredClone(artifact)],checks:[{id:'human-review',status:'not-run',method:'Read the original for usefulness.',artifactIds:['draft'],evidenceArtifactIds:[]}],cost:{currency:'EUR',amountMinor:null,basis:'unknown'}};}
const packet=()=>seal(body(),scope);
test('original Unicode and source metadata survive seal and reopen',()=>{const p=verify(parseJson(JSON.stringify(packet())),scope);assert.deepEqual(Buffer.from(p.artifacts[0].bodyBase64,'base64'),original);assert.equal(p.artifacts[0].source.revision,'example-1');});
test('all declared specialist capabilities carry the same envelope',()=>{for(const capability of CAPABILITIES){const b=body();b.jobs[0].capability=capability;assert.equal(verify(seal(b,scope),scope).jobs[0].capability,capability);}});
test('tenant, brand, project and environment mismatches fail closed',()=>{for(const key of Object.keys(scope))assert.throws(()=>verify(packet(),{...scope,[key]:key==='environment'?'production':'other'}),/differs/);});
test('tampered original fails even with its old outer digest',()=>{const p=packet();p.artifacts[0].bodyBase64=Buffer.from('different').toString('base64');assert.throws(()=>verify(p,scope),/hash/);});
test('tampered objective fails the envelope digest',()=>{const p=packet();p.objective='Changed';assert.throws(()=>verify(p,scope),/digest differs/);});
test('duplicate and escaped duplicate JSON keys are rejected',()=>{for(const value of ['{"schema":1,"schema":2}','{"brand":1,"br\\u0061nd":2}'])assert.throws(()=>parseJson(value),/Duplicate/);});
test('JSON key scopes and quoted JSON are preserved',()=>{assert.deepEqual(parseJson('{"a":{"id":1},"b":{"id":2},"text":"{\\\"id\\\":0}"}'),{a:{id:1},b:{id:2},text:'{"id":0}'});});
test('prototype keys and excessive nesting are rejected',()=>{assert.throws(()=>parseJson('{"__proto__":{}}'),/Unsupported/);assert.throws(()=>parseJson('['.repeat(50)+'0'+']'.repeat(50)),/deep/);});
test('unknown fields and unsupported versions are rejected',()=>{const b=body();b.extra=true;assert.throws(()=>seal(b,scope));const c=body();c.version='99.0.0';assert.throws(()=>seal(c,scope),/version/);});
test('unknown and repeated job or artifact IDs are rejected',()=>{const b=body();b.artifacts[0].jobId='missing';assert.throws(()=>seal(b,scope));const c=body();c.jobs.push({...c.jobs[0]});assert.throws(()=>seal(c,scope));const d=body();d.artifacts.push({...d.artifacts[0]});assert.throws(()=>seal(d,scope));});
test('unknown rights and denied export do not carry original bytes',()=>{for(const change of [{rights:'unknown'},{exportAllowed:false}]){const b=body();Object.assign(b.artifacts[0].source,change);assert.throws(()=>seal(b,scope),/permission/);}});
test('a passed check needs evidence bytes and valid subject references',()=>{const b=body();b.checks[0].status='passed';assert.throws(()=>seal(b,scope),/evidence originals/);b.checks[0].evidenceArtifactIds=['missing'];assert.throws(()=>seal(b,scope),/Unknown/);b.checks[0].evidenceArtifactIds=['draft'];assert.doesNotThrow(()=>seal(b,scope));});
test('unknown spend remains null and cents cannot be fractional or negative',()=>{for(const amountMinor of [0,-1,1.5,Number.MAX_SAFE_INTEGER+1]){const b=body();b.cost.amountMinor=amountMinor;assert.throws(()=>seal(b,scope));}const b=body();b.cost={currency:'EUR',amountMinor:0,basis:'measured'};assert.doesNotThrow(()=>seal(b,scope));});
test('merge is idempotent for originals and never sums overlapping spend',()=>{const p=packet(),result=merge([p,p],scope);assert.equal(result.artifacts.length,1);assert.equal(result.jobs.length,1);assert.equal(result.cost.amountMinor,null);});
test('merge rejects conflicting IDs, objectives and currencies',()=>{const p=packet();for(const change of [b=>b.jobs[0].summary='Changed',b=>b.objective='Changed',b=>b.cost.currency='USD']){const b=body();change(b);assert.throws(()=>merge([p,seal(b,scope)],scope));}});
test('the platform projection has five bounded text files and no original body',()=>{const p=packet(),projection=memoryProjection(p,scope);assert.equal(projection.schema,'starlight.memory.v1');assert.deepEqual(Object.keys(projection.files),['context.md','soul.md','starlight.md','memory.md','evidence.md']);assert.ok(Object.values(projection.files).every(v=>v.length<=12000));assert.ok(!projection.files['evidence.md'].includes(artifact.bodyBase64));assert.match(projection.files['evidence.md'],/producer declarations/);});
test('projection refuses overflow instead of truncating provenance',()=>{const b=body();b.artifacts=[];b.checks=[];for(let i=0;i<32;i++)b.artifacts.push({...structuredClone(artifact),id:'a'+i,source:{...artifact.source,uri:'u'.repeat(1400)}});assert.throws(()=>memoryProjection(seal(b,scope),scope),/split/);});
test('noncanonical base64 and path-shaped original names are rejected',()=>{for(const patch of [{bodyBase64:'YQ='},{name:'../draft.md'},{name:'folder/draft.md'}]){const b=body();Object.assign(b.artifacts[0],patch);assert.throws(()=>seal(b,scope));}});
test('CLI packs, verifies and reopens actual originals; an existing destination is retained',()=>{
 const root=mkdtempSync(join(tmpdir(),'starlight-handoff-'));
 try{
  writeFileSync(join(root,'draft.md'),original);writeFileSync(join(root,'scope.json'),JSON.stringify(scope));
  const {schema,version,...spec}=body();const {sha256:hash,bytes:size,bodyBase64,...meta}=spec.artifacts[0];spec.artifacts=[{...meta,file:'draft.md'}];
  writeFileSync(join(root,'job.json'),JSON.stringify(spec));
  const args=['pack',join(root,'scope.json'),join(root,'job.json'),join(root,'out')];main(args);
  assert.deepEqual(readFileSync(join(root,'out/originals/draft')),original);
  assert.equal(main(['verify',join(root,'scope.json'),join(root,'out/handoff.json')]).dispatchAllowed,false);
  assert.throws(()=>main(args),/EEXIST/);assert.deepEqual(readFileSync(join(root,'out/originals/draft')),original);
  main(['export',join(root,'scope.json'),join(root,'out/handoff.json'),join(root,'reopened')]);assert.deepEqual(readFileSync(join(root,'reopened/originals/draft')),original);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('path traversal, symlink originals and invalid output fail before export',()=>{
 const root=mkdtempSync(join(tmpdir(),'starlight-handoff-'));
 try{
  writeFileSync(join(root,'draft.md'),original);symlinkSync(join(root,'draft.md'),join(root,'link.md'));
  const {schema,version,...spec}=body();const {sha256:hash,bytes:size,bodyBase64,...meta}=spec.artifacts[0];
  for(const file of ['../draft.md','/etc/passwd','link.md']){spec.artifacts=[{...meta,file}];assert.throws(()=>packFromSpec(spec,scope,root));}
  assert.equal(existsSync(join(root,'out')),false);
 }finally{rmSync(root,{recursive:true,force:true});}
});
