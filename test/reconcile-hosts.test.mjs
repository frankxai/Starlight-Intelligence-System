import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reconcileHostObservations } from '../tools/fleet/reconcile-hosts.mjs';
const machines=[{id:'laptop-one',expectedHostnames:['LaptopOne']},{id:'worker-two',expectedHostnames:['WorkerTwo']}];
const now='2026-10-27T12:00:00.000Z';
const report=(id,host,when=now)=>({schemaVersion:'starlight.host-observation.v0',observedAt:when,host:{claimedMachineId:id,osHostname:host},harnesses:[{id:'claude',state:'installed_unverified'}]});

test('configured machine identity and installed CLI alone never grants remote execution',()=>{
 const r=reconcileHostObservations({machines,observations:[report('laptop-one','LaptopOne')],now});
 assert.equal(r.machines[0].state,'unverified');
 assert.equal(r.machines[0].canDispatch,false);
 assert.deepEqual(r.machines[0].harnessesInstalledUnverified,['claude']);
 assert.equal(r.machines[1].state,'no_observation');
});
test('stale reports, wrong hostname, future clocks and unsupported schemas cannot appear verified',()=>{
 const old=reconcileHostObservations({machines,observations:[report('laptop-one','LaptopOne','2026-10-27T11:56:00.000Z')],now,verifyEnvelope:()=>true});
 assert.equal(old.machines[0].state,'stale');
 const wrong=reconcileHostObservations({machines,observations:[report('laptop-one','Imposter')],now,verifyEnvelope:()=>true});
 assert.equal(wrong.machines[0].state,'identity_mismatch');
 const future=reconcileHostObservations({machines,observations:[report('laptop-one','LaptopOne','2026-10-27T12:10:00.000Z')],now,verifyEnvelope:()=>true});
 assert.equal(future.machines[0].state,'invalid');
 const bad=report('laptop-one','LaptopOne');bad.schemaVersion='unknown';
 assert.equal(reconcileHostObservations({machines,observations:[bad],now,verifyEnvelope:()=>true}).machines[0].state,'invalid');
});
test('external signature verifier is only a reporting predicate, never a merge/run authorization',()=>{
 const r=reconcileHostObservations({machines,observations:[report('laptop-one','LaptopOne')],now,verifyEnvelope:()=>true});
 assert.equal(r.machines[0].state,'verified_fresh');
 assert.equal(r.machines[0].identityVerified,true);
 assert.equal(r.machines[0].canDispatch,false);
 assert.equal(r.machines[0].requiredNextGate,'capability_probe_and_queen_authority');
});
test('newer contradictory observation prevents fallback to older trusted observation',()=>{
 const r=reconcileHostObservations({machines,observations:[report('laptop-one','LaptopOne','2026-10-27T11:59:30.000Z'),report('laptop-one','Imposter','2026-10-27T11:59:50.000Z')],now,verifyEnvelope:r=>r.host.osHostname==='Imposter'});
 assert.equal(r.machines[0].state,'identity_mismatch');
});

test('newer unverified forged report does not shadow an older verified fresh report',()=>{
 const older=report('laptop-one','LaptopOne','2026-10-27T11:59:30.000Z');
 const forged=report('laptop-one','LaptopOne','2026-10-27T11:59:50.000Z');
 const r=reconcileHostObservations({machines,observations:[older,forged],now,verifyEnvelope:r=>r===older}).machines[0];
 assert.equal(r.state,'verified_fresh');
 assert.equal(r.observedAt,older.observedAt);
 assert.equal(r.identityVerified,true);
 assert.equal(r.canDispatch,false);
});

test('without a verifier all otherwise eligible reports remain unverified',()=>{
 const older=report('laptop-one','LaptopOne','2026-10-27T11:59:30.000Z');
 const newer=report('laptop-one','LaptopOne','2026-10-27T11:59:50.000Z');
 const r=reconcileHostObservations({machines,observations:[older,newer,report('worker-two','WorkerTwo')],now});
 for (const machine of r.machines) {
  assert.equal(machine.state,'unverified');
  assert.equal(machine.identityVerified,false);
  assert.equal(machine.canDispatch,false);
 }
 assert.equal(r.machines[0].observedAt,newer.observedAt);
});

test('newest eligible report wins across every candidate despite malformed timestamps',()=>{
 const older=report('laptop-one','LaptopOne','2026-10-27T11:59:10.000Z');
 const newest=report('laptop-one','LaptopOne','2026-10-27T11:59:50.000Z');
 const middle=report('laptop-one','LaptopOne','2026-10-27T11:59:30.000Z');
 const malformed=report('laptop-one','LaptopOne','bad timestamp');
 const seen=[];
 const r=reconcileHostObservations({machines,observations:[older,malformed,newest,middle],now,verifyEnvelope:(candidate,machine)=>{seen.push(candidate);assert.equal(machine,machines[0]);return true;}}).machines[0];
 assert.equal(r.state,'verified_fresh');
 assert.equal(r.observedAt,newest.observedAt);
 assert.deepEqual(seen,[older,newest,middle]);
 assert.equal(r.canDispatch,false);
});

test('throwing verifier counts as unverified and cannot shadow an eligible report',()=>{
 const older=report('laptop-one','LaptopOne','2026-10-27T11:59:30.000Z');
 const newer=report('laptop-one','LaptopOne','2026-10-27T11:59:50.000Z');
 const verifyEnvelope=r=>{if(r===newer) throw new Error('bad envelope'); return true;};
 const fresh=reconcileHostObservations({machines,observations:[older,newer],now,verifyEnvelope}).machines[0];
 assert.equal(fresh.state,'verified_fresh');
 assert.equal(fresh.observedAt,older.observedAt);
 const rejected=reconcileHostObservations({machines,observations:[newer],now,verifyEnvelope}).machines[0];
 assert.equal(rejected.state,'unverified');
 assert.equal(rejected.identityVerified,false);
 assert.equal(rejected.canDispatch,false);
});

for (const lifecycle of ['proposed','enrolled','suspended','revoked','retired']) {
 test(`machine lifecycle ${lifecycle} controls enrollment and verification`,()=>{
  let calls=0;
  const machine={...machines[0],lifecycle};
  const result=reconcileHostObservations({machines:[machine],observations:[report(machine.id,'LaptopOne')],now,verifyEnvelope:()=>{calls++;return true;}}).machines[0];
  assert.equal(result.canDispatch,false);
  if (['suspended','revoked','retired'].includes(lifecycle)) {
   assert.equal(result.state,'not_enrolled');
   assert.ok(result.reason.includes(lifecycle));
   assert.equal(result.identityVerified,false);
   assert.equal(result.requiredNextGate,'authenticated_device_enrollment');
   assert.equal(calls,0);
   const absent=reconcileHostObservations({machines:[machine],observations:[],now,verifyEnvelope:()=>{throw new Error('must not verify');}}).machines[0];
   assert.equal(absent.state,'not_enrolled');
   assert.ok(absent.reason.includes(lifecycle));
   assert.equal(absent.identityVerified,false);
  } else if (lifecycle==='proposed') {
   assert.equal(result.state,'unverified');
   assert.equal(result.identityVerified,false);
   assert.equal(result.requiredNextGate,'authenticated_device_enrollment');
   assert.equal(result.observedAt,now);
  } else {
   assert.equal(result.state,'verified_fresh');
   assert.equal(result.identityVerified,true);
   assert.equal(result.requiredNextGate,'capability_probe_and_queen_authority');
   assert.equal(calls,1);
  }
 });
}
test('a malformed timestamp never outranks a well-formed report',()=>{
 const bad=report('laptop-one','LaptopOne','not-a-date');
 const r=reconcileHostObservations({machines,observations:[bad,report('laptop-one','LaptopOne')],now,verifyEnvelope:(x)=>x.observedAt===now});
 assert.equal(r.machines[0].state,'verified_fresh');
 const only=reconcileHostObservations({machines,observations:[bad],now,verifyEnvelope:()=>true});
 assert.equal(only.machines[0].state,'invalid');
});
