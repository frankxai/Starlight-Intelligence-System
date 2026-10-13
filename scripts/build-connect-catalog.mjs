import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = JSON.parse(await readFile(resolve(root, 'plugins/starlight-intelligence/server/src/agent-interfaces.json'), 'utf8'));
const destination = resolve(root, 'site/src/app/connect/catalog.json');
const expected = JSON.stringify(source, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (await readFile(destination, 'utf8') !== expected) throw new Error('Connect catalog drift; run node scripts/build-connect-catalog.mjs');
  console.log('Public connect catalog matches its plugin owner.');
} else {
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, expected);
}
