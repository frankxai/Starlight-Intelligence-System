import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { compilePlaybook, projectExecution, RECEIPT_SCHEMA } from '../dist/index.js';

const outputDirectory = process.argv[2];
if (!outputDirectory) throw new Error('Pass an output directory: node examples/run.mjs /path/to/drafts');
const manifestText = await readFile(new URL('./founder-launch.playbook.json', import.meta.url), 'utf8');
const manifest = JSON.parse(manifestText);
const files = { 'draft-skill': 'launch-drafting.md', 'draft-tool': 'draft-tool.mjs', 'document-schema': 'document.schema.json', 'founder-context': 'founder-brief.json' };
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const verifiedBytes = new Map();
for (const pin of manifest.resources) {
  if (!Object.hasOwn(files, pin.id)) throw new Error('Unrecognized example resource.');
  const bytes = await readFile(new URL(files[pin.id], import.meta.url));
  if (pin.sha256 !== hash(bytes)) throw new Error('Pinned example resource changed. Recompile its reviewed manifest.');
  verifiedBytes.set(pin.id, bytes);
}
const plan = await compilePlaybook(manifestText);
if (Object.keys(files).some((id) => !verifiedBytes.has(id))) throw new Error('Pinned example resource is missing.');
// Import only the exact bytes verified above, after every resource and manifest
// check. This fixed trusted fixture is not a loader for arbitrary plugin code.
const { draftStep } = await import(`data:text/javascript;base64,${verifiedBytes.get('draft-tool').toString('base64')}`);
const brief = JSON.parse(verifiedBytes.get('founder-context').toString('utf8'));
const receipts = []; const issued = new Map(); const documents = new Map();
const host = { runId: 'local-founder-example', verifyReceipt: (receipt) => issued.get(receipt.id) === JSON.stringify(receipt) };
function append(nodeId, status, extra = {}) {
  const receipt = { schema: RECEIPT_SCHEMA, id: `${nodeId}:${status}`, runId: host.runId, planDigest: plan.digest, nodeId, status, ...extra };
  issued.set(receipt.id, JSON.stringify(receipt)); receipts.push(receipt);
}
let projection;
for (let round = 0; round <= plan.nodes.length; round++) {
  projection = await projectExecution(plan, JSON.stringify(receipts), host);
  const work = projection.ready.filter((id) => plan.nodes.find((node) => node.id === id).kind !== 'approval');
  if (!work.length || projection.status === 'blocked') break;
  for (const id of work) {
    const node = plan.nodes.find((candidate) => candidate.id === id);
    append(id, 'started');
    const result = draftStep(id, brief, documents);
    if (typeof result.markdown !== 'string' || !result.markdown.length || result.markdown.length > 40000) throw new Error('Example adapter returned an invalid document.');
    documents.set(id, { markdown: result.markdown });
    append(id, 'completed', { outputDigest: hash(result.markdown), ...(result.route ? { route: result.route } : {}), ...(result.verdict ? { verdict: result.verdict, subjectDigest: hash(documents.get(node.subject).markdown) } : {}) });
  }
}
const target = resolve(outputDirectory); await mkdir(target, { recursive: true });
for (const [id, document] of documents) await writeFile(resolve(target, `${id}.md`), document.markdown);
await writeFile(resolve(target, 'plan.json'), JSON.stringify(plan, null, 2) + '\n');
await writeFile(resolve(target, 'receipts.json'), JSON.stringify(receipts, null, 2) + '\n');
await writeFile(resolve(target, 'progress.json'), JSON.stringify(projection, null, 2) + '\n');
console.log(JSON.stringify({ status: projection.status, ready: projection.ready, documents: documents.size, planDigest: plan.digest, note: 'Deterministic local draft example. No model, network, publication or fabricated human approval. Journal authenticity is local to this process.' }, null, 2));
