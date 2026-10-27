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
 const r=reconcileHostObservations({machines,observations:[report('laptop-one','LaptopOne','2026-10-27T11:59:30.000Z'),report('laptop-one','Imposter','2026-10-27T11:59:50.000Z')],now,verifyEnvelope:()=>true});
 assert.equal(r.machines[0].state,'identity_mismatch');
});
