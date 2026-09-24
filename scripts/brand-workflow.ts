import { readFile, stat } from 'node:fs/promises';
import { compileBrandWorkflow, inspectBrandWorkflow } from '../src/brand-workflow.js';

async function json(path: string): Promise<unknown> {
  if ((await stat(path)).size > 65536) throw new Error('Input exceeds 64 KiB');
  const raw = await readFile(path, 'utf8');
  if (Buffer.byteLength(raw) > 65536) throw new Error('Input exceeds 64 KiB');
  return JSON.parse(raw);
}

try {
  const [command, contractFile, journalFile, artifactDigest, ...extra] = process.argv.slice(2);
  if (!contractFile || extra.length || !['plan', 'inspect'].includes(command) ||
    (command === 'plan' && journalFile) || (command === 'inspect' && (!journalFile || !artifactDigest))) {
    throw new Error('Usage: brand-workflow plan <contract.json> | inspect <contract.json> <journal.json> <current-artifact-sha256>');
  }
  const contract = await json(contractFile);
  if (command === 'plan') {
    const compiled = compileBrandWorkflow(contract);
    console.log(JSON.stringify({ status: 'planned', contractDigest: compiled.contractDigest,
      contextChars: JSON.stringify(compiled.contract).length, stages: compiled.graph.nodes.map((n) => n.id),
      criteria: compiled.contract.criteria.map((c) => ({ id: c.id, kind: c.kind })), execution: 'requires an authenticated host' }, null, 2));
  } else {
    const result = inspectBrandWorkflow(contract, await json(journalFile), artifactDigest);
    console.log(JSON.stringify({ ...result, status: result.status === 'complete' ? 'structurally-complete' : result.status,
      authentication: 'not-checked', events: undefined }, null, 2));
    if (result.status === 'blocked') process.exitCode = 2;
  }
} catch (error) {
  console.error(JSON.stringify({ status: 'blocked', reason: error instanceof Error ? error.message : 'invalid input' }));
  process.exitCode = 2;
}
