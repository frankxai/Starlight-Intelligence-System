/** Starlight creative workflow kernel. Pure draft operations; no external execution authority. */
export const VERSION = "starlight.creative-draft.v1";
const spec = (inputs, outputs, paid = false) => Object.freeze({ inputs:Object.freeze(inputs), outputs:Object.freeze(outputs), paid });
export const NODE_TYPES = Object.freeze({
  source: spec({}, { text: "text" }),
  context: spec({}, { context: "context" }),
  storyboard: spec({ brief: "text", world: "context" }, { text: "text" }),
  visual: spec({ story: "text", world: "context", style: "context" }, { prompt: "prompt" }),
  image: spec({ prompt: "prompt" }, { image: "image" }, true),
  compare: spec({ first: "image", second: "image" }, { selection: "selection" }),
  select: spec({ selection: "selection" }, { image: "image" }),
  video: spec({ image: "image", prompt: "prompt" }, { video: "video" }, true),
  audio: spec({}, { audio: "audio" }),
  review: spec({ video: "video", audio: "audio", world: "context" }, { release: "release" }),
  export: spec({ release: "release" }, { manifest: "manifest" }),
  textreview: spec({ article:"text", social:"text", script:"text", identity:"context" }, { release:"release" }),
  transform: spec({ text: "text" }, { text: "text" })
});
const fail = (message) => { throw new Error(message); };
const integer = (value, name, min = 0) => {
  if (!Number.isSafeInteger(value) || value < min) fail(name + " must be a safe integer >= " + min);
};
const identifier = (value, name) => {
  if (typeof value !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9:._/-]{0,159}$/.test(value)) fail(name + " is invalid");
  if (["constructor","prototype"].includes(value)) fail(name + " is reserved");
};
export function stableJSON(value) {
  let items=0;
  const encode=(v,depth)=>{
    if (depth>32 || ++items>16384) fail("JSON depth/item limit");
    if (v===null || typeof v==="boolean") return JSON.stringify(v);
    if (typeof v==="string") {if(v.length>65536) fail("JSON string limit"); return JSON.stringify(v);}
    if (typeof v==="number") {integer(v,"JSON number",-Number.MAX_SAFE_INTEGER);return JSON.stringify(v);}
    if (Array.isArray(v)) {
      if (v.length>4096 || Object.keys(v).length!==v.length || Array.from({length:v.length},(_,i)=>Object.hasOwn(v,i)).some(x=>!x)) fail("Invalid JSON array");
      return "["+v.map(x=>encode(x,depth+1)).join(",")+"]";
    }
    if (typeof v!=="object" || Object.getPrototypeOf(v)!==Object.prototype) fail("Only plain JSON is supported");
    const keys=Object.keys(v).sort();
    if (keys.some(k=>["__proto__","constructor","prototype"].includes(k))) fail("Unsafe JSON key");
    return "{"+keys.map(k=>JSON.stringify(k)+":"+encode(v[k],depth+1)).join(",")+"}";
  };
  const encoded=encode(value,0);
  if (encoded.length>262144) fail("JSON size limit");
  return encoded;
}
export const cloneJSON = value => JSON.parse(stableJSON(value));
/** Deterministic, bounded JSON encoding for drafts; not the Arcanea Gateway receipt/JCS verifier. */
export async function sha256(value) {
  const bytes = new TextEncoder().encode(typeof value === "string" ? value : stableJSON(value));
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return "sha256:" + Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, "0")).join("");
}
export function validateWorkflow(workflow) {
  stableJSON(workflow);
  if (workflow.schema !== VERSION) fail("Unsupported draft schema");
  identifier(workflow.tenantId, "tenantId"); identifier(workflow.worldId, "worldId");
  integer(workflow.revision, "revision", 1); integer(workflow.worldRevision, "worldRevision", 1);
  if (!Array.isArray(workflow.nodes) || workflow.nodes.length < 1 || workflow.nodes.length > 256) fail("Node limit");
  if (!Array.isArray(workflow.edges) || workflow.edges.length > 2048) fail("Edge limit");
  const byId = new Map(), incoming = new Map(), outgoing = new Map();
  for (const node of workflow.nodes) {
    identifier(node.id, "node ID");
    if (byId.has(node.id)) fail("Duplicate node " + node.id);
    if (!Object.hasOwn(NODE_TYPES, node.type)) fail("Unknown node type " + node.type);
    if (!node.data || typeof node.data !== "object" || Array.isArray(node.data)) fail("Invalid node data");
    if (node.label!==undefined && (typeof node.label!=="string" || node.label.length>120)) fail("Invalid node label");
    if (node.type==="source" && (typeof node.data.text!=="string" || !node.data.text.trim() || node.data.text.length>16000)) fail("Source text is required and bounded");
    if (node.type==="context" && !Object.keys(node.data).length) fail("Context data is required");
    if (node.type==="video") {integer(node.data.duration,"video duration",1);if(node.data.duration>60) fail("Video duration limit");}
    if (node.type==="storyboard") {integer(node.data.shots,"storyboard shots",1);integer(node.data.secondsPerShot,"shot duration",1);if(node.data.shots>32 || node.data.secondsPerShot>60) fail("Storyboard duration limit");}
    if (NODE_TYPES[node.type].paid) {
      identifier(node.data.provider, "provider"); identifier(node.data.model, "model");
      integer(node.data.quoteMinor, "quoteMinor");
      if (node.data.currency !== workflow.currency) fail("Quote currency mismatch");
    }
    byId.set(node.id, node); incoming.set(node.id, []); outgoing.set(node.id, []);
  }
  if (!/^[A-Z]{3}$/.test(workflow.currency)) fail("Invalid currency");
  const edgeIds = new Set(), bound = new Set();
  for (const edge of workflow.edges) {
    identifier(edge.id, "edge ID");
    if (edgeIds.has(edge.id)) fail("Duplicate edge ID");
    edgeIds.add(edge.id);
    const from = byId.get(edge.from), to = byId.get(edge.to);
    if (!from || !to) fail("Dangling edge");
    if (from.id === to.id) fail("Workflow cycle");
    const fromPorts = NODE_TYPES[from.type].outputs, toPorts = NODE_TYPES[to.type].inputs;
    if (!Object.hasOwn(fromPorts, edge.output) || !Object.hasOwn(toPorts, edge.input)) fail("Unknown port");
    if (fromPorts[edge.output] !== toPorts[edge.input]) fail("Port type mismatch");
    const binding = edge.to + "\u0000" + edge.input;
    if (bound.has(binding)) fail("Input bound more than once");
    bound.add(binding); incoming.get(edge.to).push(edge); outgoing.get(edge.from).push(edge);
  }
  for (const node of workflow.nodes) {
    for (const port of Object.keys(NODE_TYPES[node.type].inputs)) {
      if (!bound.has(node.id + "\u0000" + port)) fail("Missing input " + node.id + "." + port);
    }
  }
  const degree = new Map(workflow.nodes.map(n => [n.id, incoming.get(n.id).length]));
  let ready = [...degree].filter(([,d]) => d === 0).map(([id]) => id).sort();
  const waves = [], order = [];
  while (ready.length) {
    const wave = ready; waves.push(wave); order.push(...wave); const next = [];
    for (const id of wave) for (const edge of outgoing.get(id)) {
      const d = degree.get(edge.to) - 1; degree.set(edge.to, d); if (d === 0) next.push(edge.to);
    }
    ready = next.sort();
  }
  if (order.length !== workflow.nodes.length) fail("Workflow cycle");
  return { byId, incoming, outgoing, waves, order };
}
export function compileWorkflow(workflow, authority) {
  const graph = validateWorkflow(workflow);
  if (!authority || !Array.isArray(authority.allowedProviders) || authority.allowedProviders.length>32) fail("Invalid fixture provider policy");
  for(const provider of authority.allowedProviders) identifier(provider,"Allowed provider");
  if (workflow.revision !== authority.workflowRevision || workflow.worldRevision !== authority.worldRevision) fail("Revision conflict");
  integer(authority.maxCostMinor, "maxCostMinor");
  if (authority.currency !== workflow.currency) fail("Budget currency mismatch");
  const paid = workflow.nodes.filter(n => NODE_TYPES[n.type].paid);
  for (const n of paid) if (!authority.allowedProviders.includes(n.data.provider)) fail("Unsupported provider " + n.data.provider);
  let estimatedMinor = 0;
  for (const n of paid) { estimatedMinor += n.data.quoteMinor; integer(estimatedMinor, "Total quote"); }
  if (estimatedMinor > authority.maxCostMinor) fail("Budget exceeded");
  return { schema: VERSION, mode: "draft-only", worldRevision: workflow.worldRevision, workflowRevision: workflow.revision,
    waves: graph.waves, order: graph.order, estimatedMinor, currency: workflow.currency,
    paidNodes: paid.map(n => n.id), externalDispatchAuthorized: false };
}
export function affectedNodes(workflow, changedIds) {
  const graph = validateWorkflow(workflow), found = new Set();
  for (const id of changedIds) { if (!graph.byId.has(id)) fail("Unknown changed node"); found.add(id); }
  const queue = [...found];
  for (let i=0; i<queue.length; i++) for (const edge of graph.outgoing.get(queue[i])) {
    if (!found.has(edge.to)) { found.add(edge.to); queue.push(edge.to); }
  }
  return graph.order.filter(id => found.has(id));
}
export function applyDraftPatch(workflow, patch) {
  if (patch.baseRevision !== workflow.revision || patch.worldRevision !== workflow.worldRevision) fail("Revision conflict");
  if (!Array.isArray(patch.operations) || patch.operations.length < 1 || patch.operations.length > 64) fail("Patch limit");
  const next = cloneJSON(workflow), changed = [];
  for (const op of patch.operations) {
    if (op.kind !== "replace-data") fail("Unsupported draft operation");
    const node = next.nodes.find(n => n.id === op.nodeId);
    if (!node) fail("Unknown patch node");
    node.data = cloneJSON(op.data); changed.push(node.id);
  }
  next.revision += 1; integer(next.revision, "revision"); validateWorkflow(next);
  return { workflow: next, affected: affectedNodes(next, changed), canonChanged: false, state: "proposal" };
}
export async function nodeKeys(workflow) {
  const graph = validateWorkflow(workflow), keys = {};
  for (const id of graph.order) {
    const n = graph.byId.get(id);
    const inputs = graph.incoming.get(id).map(e => ({ input:e.input, output:e.output, upstream:keys[e.from] }))
      .sort((a,b) => a.input < b.input ? -1 : a.input > b.input ? 1 : 0);
    keys[id] = await sha256({schema:VERSION,tenantId:workflow.tenantId,worldId:workflow.worldId,
      worldRevision:workflow.worldRevision,type:n.type,data:n.data,inputs});
  }
  return keys;
}
export function compileContext(records, scope) {
  stableJSON(records);stableJSON(scope);
  identifier(scope.tenantId,"context tenant");identifier(scope.worldId,"context world");integer(scope.worldRevision,"context revision",1);
  integer(scope.tokenBudget, "tokenBudget");
  if (!Array.isArray(records) || records.length>1024 || !Array.isArray(scope.visibility) || !Array.isArray(scope.namespaces) || !scope.namespaces.length) fail("Invalid context scope");
  if (!Array.isArray(scope.requiredIds) || new Set(scope.requiredIds).size !== scope.requiredIds.length) fail("Invalid required context");
  const permitted = records.filter(r => r.tenantId === scope.tenantId && r.worldId === scope.worldId
    && r.worldRevision === scope.worldRevision && ["accepted","source"].includes(r.state)
    && !r.revoked && scope.visibility.includes(r.visibility)
    && scope.namespaces.some(ns => r.namespace === ns || r.namespace.startsWith(ns + "/")));
  const seen = new Set();
  const count=new Map();
  for (const r of permitted) {
    identifier(r.id,"context ID");
    if(typeof r.text!=="string" || !r.text.trim()) fail("Context text required");
    if(seen.has(r.id)) fail("Duplicate context ID"); seen.add(r.id);
    // Conservative byte accounting for this offline planner; never trust supplied counts.
    // Production must tokenize the complete prompt with the selected model's tokenizer.
    count.set(r.id,new TextEncoder().encode(r.text).length+16);
  }
  const required = scope.requiredIds.map(id => permitted.find(r => r.id === id) || fail("Required context unavailable: " + id));
  let used = required.reduce((sum,r) => sum + count.get(r.id),0); integer(used,"context tokens");
  if (used > scope.tokenBudget) fail("Required context exceeds budget");
  const optional = permitted.filter(r => !scope.requiredIds.includes(r.id)).map(r => ({
    r, score:(scope.queryTerms||[]).reduce((sum,t) => sum + (r.text.toLowerCase().includes(t.toLowerCase())?1:0),0)
  })).sort((a,b) => b.score-a.score || (a.r.id < b.r.id ? -1 : 1));
  const selected = [...required];
  for (const {r,score} of optional) if (score > 0 && used + count.get(r.id) <= scope.tokenBudget) {selected.push(r);used += count.get(r.id);}
  return {schema:"starlight.context-draft.v1",tenantId:scope.tenantId,worldId:scope.worldId,worldRevision:scope.worldRevision,
    tokens:used,budgetMethod:"utf8-bytes-plus-framing-estimate",records:selected.map(r=>({...cloneJSON(r),tokens:count.get(r.id)})),excludedCount:records.length-selected.length,sourceIds:selected.map(r=>r.id),
    authority:"fixture-scope-only; production membership must be verified server-side"};
}
