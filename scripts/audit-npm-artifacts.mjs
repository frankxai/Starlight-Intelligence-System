import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readTar } from './verify-npm-ecosystem.mjs';

const registry = 'https://registry.npmjs.org';
const validName = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/;
const validVersion = /^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?(?:\+[a-z0-9.-]+)?$/i;

export function registryUrl(value) {
  const url = new URL(value);
  if (url.origin !== registry || url.username || url.password || url.search || url.hash) throw new Error('registry-url-denied');
  return url;
}

async function fetchBytes(url, fetchImpl, budget) {
  if (budget.remaining <= 0) throw new Error('estate-transfer-budget-exceeded');
  const response = await fetchImpl(registryUrl(url).href, { redirect: 'error', signal: AbortSignal.timeout(20_000) });
  if (!response.ok || !response.body) {
    await response.body?.cancel().catch(() => {});
    throw new Error('registry-request-failed');
  }
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      const exceedsRemaining = value.byteLength > budget.remaining;
      budget.remaining = Math.max(0, budget.remaining - value.byteLength);
      if (exceedsRemaining) throw new Error('estate-transfer-budget-exceeded');
      if (size > 2_000_000) throw new Error('archive-budget-exceeded');
      chunks.push(value);
    }
  } finally { await reader.cancel(); reader.releaseLock(); }
  return Buffer.concat(chunks);
}

export function checkIntegrity(bytes, integrity) {
  if (typeof integrity !== 'string' || !/^(?:sha512|sha256)-[A-Za-z0-9+/]+={0,2}$/.test(integrity)) throw new Error('integrity-unsupported');
  const [algorithm, expected] = integrity.split('-');
  if (createHash(algorithm).update(bytes).digest('base64') !== expected) throw new Error('integrity-mismatch');
}

function entryExists(entries, target, legacy = false) {
  if (typeof target !== 'string' || target.includes('\\') || target.split('/').includes('..') || target.startsWith('/') || target.includes(':')) return false;
  const path = 'package/' + target.replace(/^\.\//, '');
  if (path.includes('*')) {
    const pattern = new RegExp('^' + path.split('*').map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$');
    return [...entries.keys()].some(name => pattern.test(name));
  }
  return entries.has(path) || (legacy && ['.js', '.cjs', '.mjs', '/index.js'].some(suffix => entries.has(path + suffix)));
}

/** Static artifact observations never establish installation, execution or licensing rights. */
export function inspectArtifact(bytes, expected, scan = scanSecrets) {
  checkIntegrity(bytes, expected.integrity);
  const entries = readTar(bytes); // Existing fail-closed 2 MB decoded / 200 member parser.
  const manifest = JSON.parse(entries.get('package/package.json')?.toString() ?? 'null');
  if (!manifest || manifest.name !== expected.name || manifest.version !== expected.version) throw new Error('artifact-identity-mismatch');
  const findings = [];
  const advertised = [];
  const walkExports = value => {
    if (typeof value === 'string') advertised.push({ field: 'exports', target: value, legacy: false });
    else if (value && typeof value === 'object') Object.values(value).forEach(walkExports);
  };
  walkExports(manifest.exports);
  for (const field of ['main', 'types', 'typings', 'module']) {
    if (manifest[field]) advertised.push({ field, target: manifest[field], legacy: field === 'main' });
  }
  for (const target of typeof manifest.bin === 'string' ? [manifest.bin] : Object.values(manifest.bin ?? {})) advertised.push({ field: 'bin', target, legacy: false });
  const missingEntries = advertised.filter(({ target, legacy }) => !entryExists(entries, target, legacy));
  if (missingEntries.length) findings.push('advertised-entry-missing');
  if (!advertised.length && !entryExists(entries, 'index.js', true)) findings.push('entrypoint-unadvertised');
  const localDependencies = [];
  for (const field of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
    for (const [name, version] of Object.entries(manifest[field] ?? {})) {
      if (typeof version !== 'string' || /^(?:workspace:|file:|link:)/.test(version)) localDependencies.push({ field, name });
    }
  }
  if (localDependencies.length) findings.push('published-local-dependency');
  const statePaths = [...entries.keys()].filter(path => /(?:^|\/)(?:\.env(?:\.[^/]*)?|\.npmrc|auth\.json|credentials(?:\.json)?|private|_audit)(?:\/|$)/i.test(path));
  if (statePaths.length) findings.push('state-path-needs-review');
  const scanResult = scan(Buffer.concat([...entries.values()]));
  if (scanResult !== 'clear' && scanResult !== 'findings') throw new Error('secret-scan-unavailable');
  if (scanResult === 'findings') findings.push('secret-scan-findings');
  const installLifecycleScripts = ['preinstall', 'install', 'postinstall'].filter(name => manifest.scripts?.[name]);
  if (installLifecycleScripts.length) findings.push('install-lifecycle-needs-review');
  return { name: manifest.name, version: manifest.version, status: 'inspected', findings, missingEntries, localDependencies, statePaths,
    memberCount: entries.size, compressedBytes: bytes.length, unpackedBytes: [...entries.values()].reduce((n, value) => n + value.length, 0),
    sha256: createHash('sha256').update(bytes).digest('hex'), integrity: expected.integrity,
    secretScan: scanResult, installLifecycleScripts };
}

function scanSecrets(bytes) {
  try {
    execFileSync('gitleaks', ['stdin', '--redact', '--no-banner'], { input: bytes, stdio: ['pipe', 'pipe', 'pipe'], timeout: 60_000 });
    return 'clear';
  } catch (error) {
    if (error.status === 1) return 'findings';
    throw new Error('secret-scan-unavailable');
  }
}

export async function auditArtifacts(inventory, fetchImpl = fetch, scan = scanSecrets, maxTransferBytes = 64_000_000) {
  if (!Number.isSafeInteger(maxTransferBytes) || maxTransferBytes < 1 || maxTransferBytes > 64_000_000) throw new Error('transfer-budget-invalid');
  const budget = { remaining: maxTransferBytes };
  if (inventory.complete !== true || !Array.isArray(inventory.packages) || inventory.packages.length > 250) throw new Error('inventory-incomplete');
  const identities = inventory.packages.map(row => row.name + '@' + row.version);
  if (new Set(identities).size !== identities.length || inventory.packages.some(row => !validName.test(row.name ?? '') || !validVersion.test(row.version ?? ''))) throw new Error('inventory-identity-invalid');
  const packages = [];
  for (const row of inventory.packages) {
    try {
      const metadata = JSON.parse((await fetchBytes(`${registry}/${encodeURIComponent(row.name)}/${encodeURIComponent(row.version)}`, fetchImpl, budget)).toString());
      if (metadata.name !== row.name || metadata.version !== row.version || metadata.dist?.integrity !== row.integrity) throw new Error('registry-identity-or-integrity-changed');
      const bytes = await fetchBytes(metadata.dist.tarball, fetchImpl, budget);
      const result = inspectArtifact(bytes, row, scan);
      packages.push(result);
      console.log(JSON.stringify({ name: row.name, status: result.status, findings: result.findings }));
    } catch (error) {
      const known = ['registry-url-denied', 'registry-request-failed', 'archive-budget-exceeded', 'estate-transfer-budget-exceeded', 'registry-identity-or-integrity-changed', 'integrity-unsupported', 'integrity-mismatch', 'artifact-identity-mismatch', 'secret-scan-unavailable'];
      // Parser and other exceptions may include untrusted archive data; keep details private.
      const reason = known.includes(error.message) ? error.message : 'archive-or-metadata-needs-review';
      packages.push({ name: row.name, version: row.version, status: 'not-inspected', reason });
      console.log(JSON.stringify({ name: row.name, status: 'not-inspected', reason }));
    }
  }
  return { schemaVersion: 1, observedAt: new Date().toISOString(), inventoryObservedAt: inventory.observedAt,
    inventorySha256: createHash('sha256').update(JSON.stringify(inventory)).digest('hex'), transferredBytes: maxTransferBytes - budget.remaining,
    coverage: 'exact published tarball integrity, bounded static entry/dependency/state-path observations and redacted Gitleaks; installation and runtime excluded', packages };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  try {
    const inventory = JSON.parse(readFileSync(join(root, 'artifacts', 'npm-estate', 'registry-latest.json')));
    const report = await auditArtifacts(inventory);
    writeFileSync(join(root, 'artifacts', 'npm-estate', 'artifact-audit.json'), JSON.stringify(report, null, 2) + '\n');
    const inspected = report.packages.filter(row => row.status === 'inspected');
    const rows = report.packages.map(row => `| ${row.name} | ${row.version} | ${row.status} | ${(row.findings ?? [row.reason]).join(', ') || 'No static flags'} |`);
    mkdirSync(join(root, 'docs', 'architecture'), { recursive: true });
    writeFileSync(join(root, 'docs', 'architecture', 'NPM_ARTIFACT_AUDIT.md'), `# Published npm artifact observations\n\nObserved ${report.observedAt}; inventory observed ${report.inventoryObservedAt}. ${inspected.length}/${report.packages.length} archives inspected within the parser budgets. This is bounded static evidence, not installation, runtime, rights or release approval. Uninspected archives require separate review; scanner findings may include synthetic fixtures and require triage. No tarball content or secret match is stored in this report.\n\nLimits: 2 MB transfer per response, 2 MB decoded tar, 200 regular members, registry-only HTTPS without redirects, 64 MB aggregate retained response bytes, including metadata and failed requests, sequential processing. No lifecycle or package code executes. Raw tarballs remain in memory only.\n\n| Package | Version | Static audit | Follow-up |\n| --- | --- | --- | --- |\n${rows.join('\n')}\n\nDetailed sanitized evidence is in ignored artifacts/npm-estate/artifact-audit.json. Static flags do not authorize changing or republishing another repository.\n`);
  } catch { console.error('Artifact audit failed; no complete coverage claim.'); process.exitCode = 1; }
}
