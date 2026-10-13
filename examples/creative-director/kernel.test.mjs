import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateWorkflow,compileWorkflow,affectedNodes,applyDraftPatch,nodeKeys,compileContext,stableJSON,cloneJSON,VERSION,NODE_TYPES} from "./kernel.mjs";
const original=JSON.parse(readFileSync(new URL("./world-workflow.json",import.meta.url)));
const creator=JSON.parse(readFileSync(new URL("./creator-workflow.json",import.meta.url)));
const records=JSON.parse(readFileSync(new URL("./context-records.json",import.meta.url)));
const fresh=()=>cloneJSON(original);
const authority={workflowRevision:1,worldRevision:7,maxCostMinor:1200,currency:"USD",allowedProviders:["xai","gemini","higgsfield"]};
const scope={tenantId:"demo-studio",worldId:"glass-tide",worldRevision:7,namespaces:["Creative"],visibility:["private"],tokenBudget:300,requiredIds:["law","mara"],queryTerms:["coastal"]};
test("every parent precedes its dependent in the compiled workflow",()=>{
 const p=compileWorkflow(fresh(),authority);const index=new Map(p.order.map((x,i)=>[x,i]));
 for(const e of original.edges) assert.ok(index.get(e.from)<index.get(e.to));
 assert.equal(p.externalDispatchAuthorized,false);assert.equal(p.estimatedMinor,172);
});
test("creator voice invalidates every format and its release descendants",async()=>{
 const before=await nodeKeys(creator),next=applyDraftPatch(creator,{baseRevision:creator.revision,worldRevision:creator.worldRevision,operations:[{kind:"replace-data",nodeId:"identity",data:{voice:"precise",rule:"Source-backed claims only."}}]});
 const expected=["article","export","identity","review","script","social"];
 assert.deepEqual(next.affected.slice().sort(),expected);
 const after=await nodeKeys(next.workflow);assert.deepEqual(Object.keys(after).filter(id=>before[id]!==after[id]).sort(),expected);
 const unbound=cloneJSON(creator);unbound.edges=unbound.edges.filter(e=>e.id!=="identity-article");assert.throws(()=>validateWorkflow(unbound),/Missing input article.identity/);
});
test("rejects type mismatch",()=>{const w=fresh();w.edges[0].output="context";assert.throws(()=>validateWorkflow(w),/Unknown port/);});
test("rejects duplicate node identities",()=>{const w=fresh();w.nodes.push(w.nodes[0]);assert.throws(()=>validateWorkflow(w),/Duplicate node/);});
test("rejects dangling edges",()=>{const w=fresh();w.edges[0].from="missing";assert.throws(()=>validateWorkflow(w),/Dangling/);});
test("rejects missing required inputs",()=>{const w=fresh();w.edges.shift();assert.throws(()=>validateWorkflow(w),/Missing input/);});
test("rejects repeated input binding",()=>{const w=fresh();w.edges.push({...w.edges[0],id:"other-edge"});assert.throws(()=>validateWorkflow(w),/bound more/);});
test("rejects cycles with otherwise valid ports",()=>{
 const w={schema:VERSION,tenantId:"t",worldId:"w",revision:1,worldRevision:1,currency:"USD",
 nodes:[{id:"a",type:"transform",data:{}},{id:"b",type:"transform",data:{}}],
 edges:[{id:"ab",from:"a",output:"text",to:"b",input:"text"},{id:"ba",from:"b",output:"text",to:"a",input:"text"}]};
 assert.throws(()=>validateWorkflow(w),/cycle/);
});
test("rejects overspend before any dispatch is authorized",()=>assert.throws(()=>compileWorkflow(fresh(),{...authority,maxCostMinor:171}),/Budget exceeded/));
test("rejects unavailable provider and mixed quote currency",()=>{
 assert.throws(()=>compileWorkflow(fresh(),{...authority,allowedProviders:["xai"]}),/Unsupported provider/);
 const w=fresh();w.nodes.find(n=>n.id==="image-a").data.currency="EUR";assert.throws(()=>validateWorkflow(w),/currency/);
});
test("rejects negative and unsafe quotes",()=>{for(const quoteMinor of [-1,1.1,Number.MAX_SAFE_INTEGER+1]){
 const w=fresh();w.nodes.find(n=>n.id==="image-a").data.quoteMinor=quoteMinor;assert.throws(()=>validateWorkflow(w),/safe integer/);
}});
test("rejects stale world or draft revision",()=>{
 assert.throws(()=>compileWorkflow(fresh(),{...authority,worldRevision:8}),/Revision conflict/);
 assert.throws(()=>applyDraftPatch(fresh(),{baseRevision:2,worldRevision:7,operations:[]}),/Revision conflict/);
});
test("style invalidation retains independent source, world, storyboard and audio",()=>{
 const affected=affectedNodes(fresh(),["style"]);assert.ok(affected.includes("export"));
 for(const id of ["source","world","story","audio"]) assert.ok(!affected.includes(id));
});
test("draft patch is immutable and cannot promote canon",()=>{
 const w=fresh(),p=applyDraftPatch(w,{baseRevision:1,worldRevision:7,operations:[{kind:"replace-data",nodeId:"style",data:{lighting:"warm"}}]});
 assert.equal(w.revision,1);assert.equal(p.workflow.revision,2);assert.equal(p.canonChanged,false);assert.equal(p.state,"proposal");
 assert.equal(w.nodes.find(n=>n.id==="style").data.lighting,"cool coastal light");
});
test("semantic keys ignore viewport layout and configuration object order",async()=>{
 const w=fresh(),a=await nodeKeys(w);w.nodes[0].position={x:400,y:900};w.nodes[0].data={...w.nodes[0].data};
 assert.deepEqual(await nodeKeys(w),a);assert.equal(stableJSON({b:2,a:1}),stableJSON({a:1,b:2}));
});
test("changed semantic keys match dependency impact",async()=>{
 const w=fresh(),before=await nodeKeys(w),p=applyDraftPatch(w,{baseRevision:1,worldRevision:7,operations:[{kind:"replace-data",nodeId:"style",data:{lighting:"warm",snapshot:"style-3"}}]});
 const after=await nodeKeys(p.workflow);assert.deepEqual(Object.keys(after).filter(k=>after[k]!==before[k]).sort(),p.affected.slice().sort());
});
test("context excludes another tenant and generated proposals before ranking",()=>{
 const c=compileContext(records,scope);assert.deepEqual(c.sourceIds,["law","mara","coast"]);
 assert.ok(!c.records.some(r=>["other","candidate"].includes(r.id)));
});
test("context namespace prefix cannot read similarly named namespaces",()=>{
 const extras=[{...records[0],id:"prefix-leak",namespace:"CreativeOther",text:"coastal"}];
 assert.ok(!compileContext([...records,...extras],scope).sourceIds.includes("prefix-leak"));
});
test("required context is never silently truncated or substituted",()=>{
 assert.throws(()=>compileContext(records,{...scope,tokenBudget:29}),/exceeds budget/);
 assert.throws(()=>compileContext(records,{...scope,requiredIds:["candidate"]}),/unavailable/);
 assert.throws(()=>compileContext(records,{...scope,worldRevision:8}),/unavailable/);
});
test("rejects prototype-shaped JSON and invalid top-level node kinds",()=>{
 assert.throws(()=>stableJSON(JSON.parse('{"__proto__":{"polluted":true}}')),/Unsafe/);
 const w=fresh();w.nodes[0].type="constructor";assert.throws(()=>validateWorkflow(w),/Unknown node type/);
});
test("world revision changes invalidate semantic keys",async()=>{
 const w=fresh(),before=await nodeKeys(w);w.worldRevision++;const after=await nodeKeys(w);
 for(const id of Object.keys(before)) assert.notEqual(before[id],after[id]);
});
test("context ignores forged low token counts",()=>{
 const r={...records[0],text:"x".repeat(8000),tokens:1};
 assert.throws(()=>compileContext([r],{...scope,requiredIds:["law"],tokenBudget:1}),/exceeds budget/);
});
test("node configurations reject empty source, negative duration and missing storyboard shape",()=>{
 for(const [id,data] of [["source",{text:""}],["video",{...original.nodes.find(n=>n.id==="video").data,duration:-1}],["story",{}]]) {
  const w=fresh();w.nodes.find(n=>n.id===id).data=data;assert.throws(()=>validateWorkflow(w));
 }
});
test("port contracts cannot be changed by callers",()=>{
 assert.throws(()=>{NODE_TYPES.image.inputs.prompt="video";},TypeError);
 assert.throws(()=>{NODE_TYPES.image.outputs.image="text";},TypeError);
});
test("JSON is bounded and rejects sparse or decorated arrays",()=>{
 assert.throws(()=>stableJSON(Array(2)),/array/);
 const decorated=[1];decorated.extra=2;assert.throws(()=>stableJSON(decorated),/array/);
 let v={};for(let i=0;i<40;i++)v={a:v};assert.throws(()=>stableJSON(v),/depth/);
 assert.throws(()=>stableJSON("x".repeat(65537)),/string limit/);
});
test("node identifiers match safe key serialization",()=>{
 const w=fresh();w.nodes[0].id="constructor";assert.throws(()=>validateWorkflow(w),/reserved/);
});
