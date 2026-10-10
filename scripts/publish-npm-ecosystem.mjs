import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { targets, digest, readTar, validateEntries } from './verify-npm-ecosystem.mjs';

export function validateReceipt(receipt, sourceSha, directory) {
  if (receipt.schemaVersion !== 1 || receipt.sourceSha !== sourceSha || !/^[a-f0-9]{40}$/.test(sourceSha)
      || receipt.dirty !== false || receipt.packages?.length !== targets.length) throw new Error('Unreviewed source or incomplete artifact receipt');
  const packages = targets.map(([, name]) => {
    const row = receipt.packages.find(pkg => pkg.name === name);
    const file = name.replace('@', '').replace('/', '-') + '-' + row?.version + '.tgz';
    if (!row || row.file !== file || !/^[a-f0-9]{64}$/.test(row.sha256)) throw new Error('Invalid artifact identity');
    const bytes = readFileSync(join(directory, file));
    if (digest(bytes) !== row.sha256) throw new Error('Artifact digest mismatch');
    if (row.integrity !== 'sha512-' + createHash('sha512').update(bytes).digest('base64')) throw new Error('Artifact integrity mismatch');
    const info = validateEntries(readTar(bytes), name);
    if (info.version !== row.version) throw new Error('Artifact version mismatch');
    return row;
  });
  return packages;
}

export function publishEcosystem() {
  if (process.argv.slice(2).join(' ') !== '--execute' || process.env.GITHUB_ACTIONS !== 'true'
      || process.env.GITHUB_REF !== 'refs/heads/main' || !process.env.ACTIONS_ID_TOKEN_REQUEST_URL
      || !process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN || process.env.NPM_TOKEN || process.env.NODE_AUTH_TOKEN) {
    throw new Error('Publication requires the approved main-branch OIDC workflow without a publishing token');
  }
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const directory = join(root, 'artifacts', 'npm-ecosystem');
  const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', cwd: root }).trim();
  const receipt = JSON.parse(readFileSync(join(directory, 'manifest.json')));
  const packages = validateReceipt(receipt, sha, directory);
  const npmCli = process.env.NPM_CLI_PATH;
  if (!npmCli || !npmCli.endsWith('npm-cli.js')) throw new Error('An explicitly pinned npm CLI is required');
  const npm = args => execFileSync(process.execPath, [npmCli, ...args], { cwd: root, encoding: 'utf8', timeout: 120_000 });
  // Preflight every registry version before any publication; ambiguous failures stop the whole suite.
  const pending = [];
  for (const row of packages) {
    try {
      const existing = JSON.parse(npm(['view', `${row.name}@${row.version}`, 'dist.integrity', '--json', '--registry=https://registry.npmjs.org']));
      if (existing !== row.integrity) throw new Error('Published version has different bytes');
      console.log(`Already verified: ${row.name}@${row.version}`);
    } catch (error) {
      const stderr = error.stderr?.toString() ?? '';
      if (!/E404/.test(stderr)) throw new Error('Registry preflight failed or artifact identity differs');
      pending.push(row);
    }
  }
  for (const row of pending) {
    // No automatic retry after an ambiguous publish result. Rerun reconciles registry integrity first.
    npm(['publish', join(directory, row.file), '--access=public', '--provenance', '--ignore-scripts', '--registry=https://registry.npmjs.org']);
    const integrity = JSON.parse(npm(['view', `${row.name}@${row.version}`, 'dist.integrity', '--json', '--registry=https://registry.npmjs.org']));
    if (integrity !== row.integrity) throw new Error('Post-publication registry integrity differs');
    console.log(`Published and verified: ${row.name}@${row.version}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { publishEcosystem(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
