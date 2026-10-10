import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const registry = 'https://registry.npmjs.org';
const validName = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/;
const validVersion = /^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?(?:\+[a-z0-9.-]+)?$/i;

async function readJson(url, fetchImpl) {
  const response = await fetchImpl(url, { redirect: 'error', signal: AbortSignal.timeout(20_000), headers: { accept: 'application/json' } });
  if (!response.ok || !response.body) {
    await response.body?.cancel().catch(() => {});
    throw new Error(`Registry request failed (${response.status})`);
  }
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 2_000_000) throw new Error('Registry response exceeds audit budget');
      chunks.push(value);
    }
  } finally { await reader.cancel(); reader.releaseLock(); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function repositoryUrl(value) {
  const raw = typeof value === 'string' ? value : value?.url;
  if (typeof raw !== 'string') return null;
  const match = raw.match(/^(?:git\+)?https:\/\/github\.com\/([a-z0-9_.-]+)\/([a-z0-9_.-]+?)(?:\.git)?\/?$/i);
  return match ? `https://github.com/${match[1]}/${match[2]}` : null;
}

/** Registry metadata is an inventory, not proof of builds, rights, demand or artifact safety. */
export function summarizePackage(pkg) {
  if (!validName.test(pkg.name ?? '') || !validVersion.test(pkg.version ?? '')) throw new Error('Invalid registry package identity');
  const repository = repositoryUrl(pkg.repository);
  const findings = [];
  if (!repository) findings.push('source-unresolved');
  if (!pkg.dist?.integrity) findings.push('integrity-unadvertised');
  if (!pkg.dist?.attestations) findings.push('provenance-unadvertised');
  if (!pkg.license) findings.push('license-unadvertised');
  if (!pkg.engines?.node) findings.push('node-range-unadvertised');
  if (pkg.deprecated) findings.push('deprecated-latest');
  const internalDependencies = Object.entries(pkg.dependencies ?? {}).filter(([name]) => /^(?:@arcanea\/|@starlight(?:-intelligence|-cosmos)?\/|@frankx(?:ai|-ai)?\/)/.test(name));
  if (internalDependencies.some(([name]) => /^@(?:starlight|starlight-cosmos|frankx|frankx-ai)\//.test(name))) findings.push('legacy-scope-dependency');
  const metadata = JSON.stringify(pkg);
  return {
    name: pkg.name, version: pkg.version, scope: pkg.name.startsWith('@') ? pkg.name.split('/')[0] : 'unscoped',
    repository, repositoryDirectory: typeof pkg.repository?.directory === 'string' ? pkg.repository.directory : null,
    declarationsAdvertised: Boolean(pkg.types || pkg.typings || JSON.stringify(pkg.exports ?? {}).includes('"types"')),
    provenanceAdvertised: Boolean(pkg.dist?.attestations), integrity: pkg.dist?.integrity ?? null,
    unpackedBytes: pkg.dist?.unpackedSize ?? null, license: typeof pkg.license === 'string' ? pkg.license : null,
    nodeRange: pkg.engines?.node ?? null, dependencies: pkg.dependencies ?? {}, peerDependencies: pkg.peerDependencies ?? {},
    internalDependencies: Object.fromEntries(internalDependencies), findings,
    source: `${registry}/${encodeURIComponent(pkg.name)}/${encodeURIComponent(pkg.version)}`,
    metadataSha256: createHash('sha256').update(metadata).digest('hex'),
  };
}

export async function auditEstate(fetchImpl = fetch) {
  const searchUrl = `${registry}/-/v1/search?text=maintainer%3Afrankxai&size=250`;
  const search = await readJson(searchUrl, fetchImpl);
  if (!Array.isArray(search.objects) || search.total !== search.objects.length || search.total > 250) {
    throw new Error('Incomplete maintainer search; refuse a partial estate claim');
  }
  const names = search.objects.map(row => row.package?.name).sort();
  if (new Set(names).size !== names.length || names.some(name => !validName.test(name ?? ''))) throw new Error('Invalid maintainer index');
  const packages = [];
  for (const name of names) {
    const pkg = await readJson(`${registry}/${encodeURIComponent(name)}/latest`, fetchImpl);
    if (pkg.name !== name) throw new Error('Registry identity differs from maintainer search');
    packages.push(summarizePackage(pkg));
  }
  return { schemaVersion: 1, observedAt: new Date().toISOString(), maintainer: 'frankxai', searchUrl,
    coverage: 'maintainer index and latest-version metadata; local repos and installed artifacts excluded', complete: true, packages };
}

export function catalogMarkdown(audit) {
  const scopes = {};
  for (const pkg of audit.packages) scopes[pkg.scope] = (scopes[pkg.scope] ?? 0) + 1;
  const rows = audit.packages.map(pkg => `| [${pkg.name}](https://www.npmjs.com/package/${pkg.name}) | ${pkg.version} | ${pkg.repository ? `[repo](${pkg.repository})` : 'Unresolved'} | ${pkg.declarationsAdvertised ? 'Yes' : 'Unadvertised'} | ${pkg.provenanceAdvertised ? 'Yes' : 'Unadvertised'} | ${pkg.findings.join(', ') || 'No metadata flags'} |`);
  return `# Npm release catalog\n\nObserved: ${audit.observedAt}. Source: [public maintainer index](${audit.searchUrl}) plus each exact-version registry document recorded in the JSON receipt.\n\nCoverage: ${audit.packages.length} latest-version records; ${Object.entries(scopes).map(([scope, count]) => `${scope}: ${count}`).join(', ')}. This is registry metadata coverage, not a local-repository or installed-package audit.\n\nMetadata flags locate follow-up work. Unadvertised fields do not prove a missing capability. No metadata row establishes artifact safety, compatibility, licensing rights, demand, revenue, or release readiness. Three new SIS packages remain separate unpublished candidates until registry readback proves publication.\n\n| Package | Latest | Source | Types advertised | Provenance advertised | Follow-up flags |\n| --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}\n\nFull evidence: ignored artifacts/npm-estate/registry-latest.json, including exact metadata URLs, hashes, dependency edges, engine ranges, licenses, and unpacked sizes. Source repositories require ownership/instruction checks before changes.\n`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  try {
    const audit = await auditEstate();
    const directory = join(root, 'artifacts', 'npm-estate'); mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, 'registry-latest.json'), JSON.stringify(audit, null, 2) + '\n');
    writeFileSync(join(root, 'docs', 'architecture', 'NPM_RELEASE_CATALOG.md'), catalogMarkdown(audit));
    console.log(JSON.stringify({ complete: audit.complete, packages: audit.packages.length, flagged: audit.packages.filter(pkg => pkg.findings.length).length }));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
