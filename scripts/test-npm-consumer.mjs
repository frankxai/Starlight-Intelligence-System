import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { targets, digest, readTar, validateEntries } from './verify-npm-ecosystem.mjs';

// Install actual release bytes outside workspace resolution. Leave bounded evidence in ignored artifacts.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const directory = join(root, 'artifacts', 'npm-ecosystem');
const receipt = JSON.parse(readFileSync(join(directory, 'manifest.json')));
if (receipt.packages?.length !== targets.length) throw new Error('Incomplete release receipt');
const tarballs = targets.map(([, name]) => {
  const row = receipt.packages.find(item => item.name === name);
  if (!row || row.file !== name.replace('@', '').replace('/', '-') + '-' + row.version + '.tgz') throw new Error('Invalid consumer artifact');
  const path = join(directory, row.file);
  const bytes = readFileSync(path);
  if (digest(bytes) !== row.sha256) throw new Error('Consumer artifact digest mismatch');
  validateEntries(readTar(bytes), name);
  return path;
});
mkdirSync(join(root, 'artifacts', 'npm-consumers'), { recursive: true });
const cwd = mkdtempSync(join(root, 'artifacts', 'npm-consumers', 'run-'));
const npmCli = process.env.NPM_CLI_PATH ?? join(dirname(process.execPath),
  process.platform === 'win32' ? 'node_modules' : '../lib/node_modules', 'npm', 'bin', 'npm-cli.js');
writeFileSync(join(cwd, 'package.json'), JSON.stringify({ name: 'starlight-artifact-consumer', private: true, type: 'module' }));
execFileSync(process.execPath, [npmCli, 'install', '--ignore-scripts', '--no-audit', '--no-fund',
  ...tarballs, 'ai@7.0.130', 'zod@4.6.5', '@modelcontextprotocol/client@2.3.1', 'typescript@5.9.3', '@types/node@24.0.0'],
{ cwd, stdio: 'inherit', timeout: 180_000 });
for (const [folder, name] of targets) {
  const file = folder === 'core' ? 'core.test.mjs' : folder === 'ai-sdk-adapter' ? 'adapter.test.mjs' : 'server.test.mjs';
  let test = readFileSync(join(root, 'packages', folder, 'test', file), 'utf8');
  test = test.replaceAll("'../dist/index.js'", JSON.stringify(name))
    .replaceAll("'../dist/gateway.js'", JSON.stringify(name + '/gateway'));
  if (folder === 'core') test = test.replace("new URL('../package.json', import.meta.url)", "new URL('./node_modules/@starlight-intelligence/core/package.json', import.meta.url)");
  if (folder === 'mcp-server') test = test.replace("new URL('../dist/cli.js', import.meta.url)", "new URL('./cli.js', import.meta.resolve('@starlight-intelligence/mcp'))");
  writeFileSync(join(cwd, folder + '.test.mjs'), test);
}
writeFileSync(join(cwd, 'consumer.ts'), `import type { VaultEntry, VaultType, MemoryEvent, SIPAttestation, HarnessContract, VeilSanitizer, MemoryProvider } from '@starlight-intelligence/core';
import { withStarlightMemory } from '@starlight-intelligence/ai-sdk';
import { createStarlightMcpServer } from '@starlight-intelligence/mcp';
import { createGatewayReader } from '@starlight-intelligence/mcp/gateway';
const sanitizer: VeilSanitizer = { sanitize: value => value };
const reader: Pick<MemoryProvider, 'recall'> = { recall: async () => [] };
createStarlightMcpServer({ memory: reader, tenantId: 'consumer', sanitizer });
void withStarlightMemory; void createGatewayReader;
type PublicContracts = VaultEntry | VaultType | MemoryEvent | SIPAttestation | HarnessContract;
`);
execFileSync(process.execPath, [join(cwd, 'node_modules', 'typescript', 'bin', 'tsc'), '--noEmit', '--strict',
  '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--target', 'ES2022', 'consumer.ts'],
{ cwd, stdio: 'inherit', timeout: 60_000 });
execFileSync(process.execPath, ['--test', ...targets.map(([folder]) => folder + '.test.mjs')],
{ cwd, stdio: 'inherit', timeout: 60_000 });
console.log('Tarball consumer imports, declarations and protocol tests passed');
