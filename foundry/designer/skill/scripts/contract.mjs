import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { validateValue } from './schema.mjs';

const schema = JSON.parse(readFileSync(new URL('../assets/design-contract.schema.json', import.meta.url), 'utf8'));

export function checkContract(contract) {
  const result = validateValue(contract, schema, new Map());
  const errors = [...result.errors];
  const add = message => errors.push({ path: '$', code: 'DESIGN_INVARIANT', message });
  if (result.valid) {
    const names = contract.tools.map(t => t.name);
    if (new Set(names).size !== names.length) add('Tool names must be unique.');
    if (contract.authority === 'observe' && contract.tools.some(t => t.effect !== 'read')) add('Observe authority permits read effects only.');
    if (contract.authority === 'prepare' && contract.tools.some(t => !['read', 'prepare'].includes(t.effect))) add('Prepare authority cannot commit write or destructive effects.');
    if (contract.status === 'pilot') {
      if (!contract.owner?.trim()) add('Pilot requires an accountable owner.');
      if (contract.legal.status !== 'screened' || !contract.legal.reviewRef?.trim()) add('Pilot requires recorded preliminary legal screening.');
      if (['unknown', 'high', 'prohibited'].includes(contract.legal.riskClass)) add('Reference pilot cannot activate unresolved, high-risk or prohibited purposes.');
      if (contract.runtime.status !== 'reference') add('This release supports reference execution only.');
      if (contract.tools.some(t => !['read', 'prepare'].includes(t.effect))) add('Reference execution supports read and prepare effects only.');
    }
    if (contract.legal.status === 'prohibited' || contract.legal.riskClass === 'prohibited') add('Prohibited intended purpose cannot pass this contract.');
  }
  return { valid: errors.length === 0, readyForReference: errors.length === 0 && contract.status === 'pilot', errors };
}

export function assertReferenceContract(contract) {
  const result = checkContract(contract);
  if (!result.valid || !result.readyForReference) throw new Error(`Contract blocked: ${result.errors.map(e => e.message).join('; ') || 'draft requires completion before reference activation'}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = checkContract(JSON.parse(readFileSync(process.argv[2], 'utf8')));
    console.log(JSON.stringify(result, null, 2));
    if (!result.valid) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
