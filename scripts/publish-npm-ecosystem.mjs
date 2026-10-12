import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join, isAbsolute, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { targets, digest, readTar, validateEntries } from './verify-npm-ecosystem.mjs';

export function validateReceipt(receipt, sourceSha, directory, requireClean = true) {
  if (receipt.schemaVersion !== 1 || receipt.sourceSha !== sourceSha || !/^[a-f0-9]{40}$/.test(sourceSha)
      || (requireClean && receipt.dirty !== false) || !Array.isArray(receipt.packages) || receipt.packages.length !== targets.length) throw new Error('Unreviewed source or incomplete artifact receipt');
  const packages = targets.map(([, name]) => {
    const row = receipt.packages.find(pkg => pkg.name === name);
    const file = name.replace('@', '').replace('/', '-') + '-' + row?.version + '.tgz';
    if (!row || !/^\d+\.\d+\.\d+$/.test(row.version) || row.file !== file || !/^[a-f0-9]{64}$/.test(row.sha256)) throw new Error('Invalid artifact identity');
    const bytes = readFileSync(join(directory, file));
    if (digest(bytes) !== row.sha256) throw new Error('Artifact digest mismatch');
    if (row.integrity !== 'sha512-' + createHash('sha512').update(bytes).digest('base64')) throw new Error('Artifact integrity mismatch');
    const info = validateEntries(readTar(bytes), name);
    if (info.version !== row.version) throw new Error('Artifact version mismatch');
    return row;
  });
  return packages;
}

export const consumerChecks = ['actual-tarball-install', 'strict-public-declarations', 'core-integration',
  'ai-sdk-generation-and-streaming', 'official-mcp-client-and-stdio'];

export function validateConsumerReceipt(consumer, manifestBytes, sourceSha) {
  if (consumer?.schemaVersion !== 1 || consumer.sourceSha !== sourceSha || consumer.passed !== true
      || consumer.manifestSha256 !== digest(manifestBytes)
      || JSON.stringify(consumer.checks) !== JSON.stringify(consumerChecks)) {
    throw new Error('Installed consumer evidence does not match publication artifacts');
  }
}

export function assertPublishingContext(env, sourceSha, args) {
  if (args.length !== 1 || args[0] !== '--execute' || env.GITHUB_ACTIONS !== 'true'
      || env.GITHUB_REPOSITORY !== 'frankxai/Starlight-Intelligence-System'
      || env.GITHUB_REF !== 'refs/heads/main' || env.GITHUB_SHA !== sourceSha || !/^[a-f0-9]{40}$/.test(sourceSha)
      || env.GITHUB_EVENT_NAME !== 'workflow_dispatch'
      || env.GITHUB_WORKFLOW_REF !== 'frankxai/Starlight-Intelligence-System/.github/workflows/npm-ecosystem-release.yml@refs/heads/main'
      || !env.ACTIONS_ID_TOKEN_REQUEST_URL || !env.ACTIONS_ID_TOKEN_REQUEST_TOKEN || env.NPM_TOKEN || env.NODE_AUTH_TOKEN) {
    throw new Error('Publication requires the approved main-branch OIDC workflow without a publishing token');
  }
}

// npm also reads project, user and global rc files. A private cwd stops project-prefix discovery.
export function createNpmRuntime(root, npmCli, env) {
  if (!isAbsolute(npmCli ?? '') || basename(npmCli) !== 'npm-cli.js') throw new Error('An explicitly pinned npm CLI is required');
  const cwd = mkdtempSync(join(root, 'artifacts', 'npm-oidc-'));
  writeFileSync(join(cwd, 'package.json'), JSON.stringify({ name: 'starlight-oidc-release-runtime', private: true }));
  for (const file of ['.npmrc', 'user.npmrc', 'global.npmrc']) writeFileSync(join(cwd, file), '', { mode: 0o600 });
  const allowed = ['PATH', 'Path', 'SystemRoot', 'TEMP', 'TMP', 'HOME', 'USERPROFILE', 'CI',
    'GITHUB_ACTIONS', 'GITHUB_REPOSITORY', 'GITHUB_REPOSITORY_ID', 'GITHUB_REPOSITORY_OWNER', 'GITHUB_REPOSITORY_OWNER_ID',
    'GITHUB_SERVER_URL', 'GITHUB_SHA', 'GITHUB_WORKFLOW_REF', 'GITHUB_WORKFLOW_SHA', 'GITHUB_WORKFLOW',
    'GITHUB_RUN_ID', 'GITHUB_RUN_ATTEMPT', 'GITHUB_EVENT_NAME', 'GITHUB_ACTOR', 'GITHUB_ACTOR_ID', 'GITHUB_REF', 'RUNNER_ENVIRONMENT',
    'ACTIONS_ID_TOKEN_REQUEST_URL', 'ACTIONS_ID_TOKEN_REQUEST_TOKEN'];
  return { command: process.execPath, prefix: [npmCli, '--userconfig=' + join(cwd, 'user.npmrc'),
    '--globalconfig=' + join(cwd, 'global.npmrc')], options: { cwd, encoding: 'utf8', timeout: 120_000,
    env: Object.fromEntries(allowed.filter(key => typeof env[key] === 'string').map(key => [key, env[key]])) } };
}

export function publishEcosystem() {
  // Refuse local calls before reading any artifact or creating a runtime directory.
  assertPublishingContext(process.env, process.env.GITHUB_SHA, process.argv.slice(2));
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const directory = join(root, 'artifacts', 'npm-ecosystem');
  const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', cwd: root }).trim();
  assertPublishingContext(process.env, sha, process.argv.slice(2));
  if (execFileSync('git', ['status', '--porcelain', '--untracked-files=normal'], { cwd: root, encoding: 'utf8' }).trim()) throw new Error('Publication checkout is dirty');
  const manifestBytes = readFileSync(join(directory, 'manifest.json'));
  const receipt = JSON.parse(manifestBytes);
  const packages = validateReceipt(receipt, sha, directory);
  validateConsumerReceipt(JSON.parse(readFileSync(join(directory, 'consumer.json'))), manifestBytes, sha);
  const runtime = createNpmRuntime(root, process.env.NPM_CLI_PATH, process.env);
  const npm = args => execFileSync(runtime.command, [...runtime.prefix, ...args], runtime.options);
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
