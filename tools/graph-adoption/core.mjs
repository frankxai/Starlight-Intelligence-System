import { spawnSync } from 'node:child_process';
import { lstatSync, readFileSync, readdirSync, realpathSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { homedir } from 'node:os';

export const schema = 'starlight.graph-adoption.v1';
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const inside = (root, path) => { const rel = relative(root, path); return rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel); };
const git = (root, args) => {
  const env = { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0' };
  for (const key of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE']) delete env[key];
  const result = spawnSync('git', ['--no-pager', '-c', 'core.fsmonitor=false', '-c', 'submodule.recurse=false', '-C', root, ...args], { encoding: 'utf8', env, timeout: 15000, maxBuffer: 16 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error(`Git ${args[0]} failed (no repository data emitted)`);
  return result.stdout;
};

export function repositoryRoot(input) {
  const root = realpathSync(resolve(input));
  const top = realpathSync(git(root, ['rev-parse', '--show-toplevel']).trim());
  if (root !== top) throw new Error('Pass an exact Git root, not a parent or nested directory');
  return root;
}

// Reject linked/private paths at inspection time. This is not an atomic filesystem
// sandbox: a concurrent writer can replace a path between validation and reading.
export function sourceFile(root, path) {
  if (typeof path !== 'string' || !path || path.includes('\\') || isAbsolute(path) || /^[a-z]:/i.test(path) || path.split('/').some((part) => !part || part === '..' || part === '.')) {
    throw new Error('Source path must be a normalized repository-relative file');
  }
  if (path.split('/').some((part) => /^(\.git|\.env(?:\..*)?|node_modules|\.local|\.starlight|\.heart|\.machine)$/i.test(part))) throw new Error('Private or generated source path refused');
  let cursor = root;
  for (const part of path.split('/')) {
    cursor = join(cursor, part);
    if (lstatSync(cursor).isSymbolicLink()) throw new Error('Linked sources are not accepted');
  }
  if (!inside(root, realpathSync(cursor))) throw new Error('Source escapes repository');
  const stat = lstatSync(cursor);
  if (!stat.isFile() || stat.size > 256 * 1024) throw new Error('Source is not a bounded ordinary file');
  return cursor;
}

export function validateManifest(manifest) {
  const issues = [];
  const nonempty = (x) => typeof x === 'string' && x.trim().length > 0;
  const id = (x) => typeof x === 'string' && /^[a-z][a-z0-9-]{0,79}$/.test(x);
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) return ['Manifest must be an object'];
  if (manifest.schema !== schema) issues.push('Unsupported schema');
  if (!nonempty(manifest.owner)) issues.push('An accountable owner is required');
  if (!['reference', 'consumer', 'documentation'].includes(manifest.role)) issues.push('Unknown adoption role');
  if (!Array.isArray(manifest.sources) || !manifest.sources.length || manifest.sources.some((x) => !nonempty(x))) issues.push('Explicit instruction source paths are required');
  if (Array.isArray(manifest.sources) && new Set(manifest.sources).size !== manifest.sources.length) issues.push('Duplicate instruction sources');
  if (!Array.isArray(manifest.workflows) || !manifest.workflows.length) issues.push('At least one workflow is required');
  const ids = new Set();
  for (const flow of Array.isArray(manifest.workflows) ? manifest.workflows : []) {
    if (!flow || !id(flow.id) || ids.has(flow.id)) { issues.push('Workflow identifiers must be unique slugs'); continue; }
    ids.add(flow.id);
    if (!nonempty(flow.graph)) issues.push(`${flow.id}: graph source required`);
    if (!nonempty(flow.maker) || !nonempty(flow.checker) || flow.maker === flow.checker) issues.push(`${flow.id}: distinct maker and checker required`);
    if (flow.mode !== 'report-only') issues.push(`${flow.id}: starter supports report-only mode only`);
    if (!Number.isSafeInteger(flow.contextByteBudget) || flow.contextByteBudget <= 0) issues.push(`${flow.id}: positive integer contextByteBudget required`);
    if (!Array.isArray(flow.checks) || !flow.checks.length || flow.checks.some((x) => !nonempty(x))) issues.push(`${flow.id}: documented validation commands required`);
    if (!Array.isArray(flow.humanGates) || !['publish', 'spend', 'credentials', 'destructive'].every((x) => flow.humanGates.includes(x))) issues.push(`${flow.id}: starter human gates incomplete`);
  }
  return issues;
}

export function inspectRepository(input) {
  const root = repositoryRoot(input);
  const tracked = git(root, ['ls-files', '-z']).split('\0').filter(Boolean);
  // Inventory filenames only. Includes hidden tracked .claude/.agents directories; no ignored caches.
  const sources = tracked.filter((path) => /(^|\/)(AGENTS|CLAUDE|GEMINI|SKILL)\.md$/i.test(path));
  const counts = Object.fromEntries(['AGENTS.md', 'CLAUDE.md', 'GEMINI.md', 'SKILL.md'].map((name) => [name, sources.filter((path) => basename(path).toUpperCase() === name.toUpperCase()).length]));
  const mirrors = sources.filter((path) => /(^|\/)(compiled-dist|marketplace-dist|packages-dist|generated|vendor|fixtures)(\/|$)/i.test(path)).length;
  const dirty = Boolean(git(root, ['status', '--porcelain=v1', '--untracked-files=normal']).trim());
  return { repo: basename(root), head: git(root, ['rev-parse', 'HEAD']).trim(), branch: git(root, ['branch', '--show-current']).trim(), dirty, trackedInstructions: counts, sourceCandidates: sources.length - mirrors, generatedOrFixtureCandidates: mirrors, adoption: existsSync(join(root, 'graph-adoption.json')) ? 'declared-unchecked' : 'not-declared' };
}

export function checkRepository(input) {
  const root = repositoryRoot(input);
  const manifestPath = sourceFile(root, 'graph-adoption.json');
  const bytes = readFileSync(manifestPath);
  const manifest = JSON.parse(bytes);
  const issues = validateManifest(manifest);
  if (issues.length) return { ok: false, issues };
  const boundSources = [];
  for (const path of [...new Set([...manifest.sources, ...manifest.workflows.map((flow) => flow.graph)])].sort()) {
    try {
      const bytes = readFileSync(sourceFile(root, path));
      boundSources.push({ path, sha256: digest(bytes), bytes: bytes.length });
    } catch { issues.push(`Source missing, unsafe or over 256 KiB: ${String(path)}`); }
  }
  const contextBytes = boundSources.filter((source) => manifest.sources.includes(source.path)).reduce((sum, source) => sum + source.bytes, 0);
  for (const flow of manifest.workflows) {
    if (contextBytes > flow.contextByteBudget) issues.push(`${flow.id}: selected instruction bytes exceed contextByteBudget`);
    try { const graph = JSON.parse(readFileSync(sourceFile(root, flow.graph))); renderMermaid(graph); }
    catch { issues.push(`${flow.id}: graph must be readable JSON`); }
  }
  return { ok: issues.length === 0, schema, manifestSha256: digest(bytes), contextBytes, boundSources, issues, scope: 'Local file and manifest conformance only; does not execute checks, verify outcomes, authenticate actors or authorize actions.' };
}

export function inspectPortfolio(input) {
  const root = realpathSync(resolve(input));
  if (root === dirname(root) || root.toLowerCase() === realpathSync(homedir()).toLowerCase()) throw new Error('Home and drive-root discovery are forbidden');
  const repositories = [];
  const skipped = [];
  for (const entry of readdirSync(root, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory() || entry.isSymbolicLink() || entry.name.startsWith('.')) continue;
    const child = join(root, entry.name);
    if (!existsSync(join(child, '.git'))) { skipped.push({ repo: entry.name, reason: 'not-an-immediate-git-root' }); continue; }
    try { repositories.push(inspectRepository(child)); }
    catch { skipped.push({ repo: entry.name, reason: 'unreadable-or-noncanonical-git-root' }); }
  }
  return { schema: 'starlight.graph-adoption-coverage.v1', capturedAt: new Date().toISOString(), scope: 'Immediate local Git roots, tracked filenames only. Private instance report; not a public dataset.', repositories, skipped, totals: { inspected: repositories.length, skipped: skipped.length, declared: repositories.filter((r) => r.adoption === 'declared-unchecked').length, dirty: repositories.filter((r) => r.dirty).length } };
}

export function renderMermaid(graph) {
  if (!Array.isArray(graph?.nodes) || !graph.nodes.length || !Array.isArray(graph?.edges)) throw new Error('Graph needs nonempty nodes and edges');
  if (graph.nodes.some((node) => !node || typeof node.id !== 'string' || !node.id.trim())) throw new Error('Node identifiers are required');
  const ids = new Map(graph.nodes.map((node, i) => [node.id, `n${i}`]));
  if (ids.size !== graph.nodes.length) throw new Error('Duplicate graph identifiers');
  const text = (x) => String(x).replace(/[^a-zA-Z0-9 .:_/-]/g, ' ').slice(0, 100);
  return ['flowchart LR', ...graph.nodes.map((node) => `  ${ids.get(node.id)}["${text(node.id)} · ${text(node.role ?? 'step')}"]`), ...graph.edges.map((edge) => {
    if (!edge || !ids.has(edge.from) || !ids.has(edge.to)) throw new Error('Edge references missing node');
    return `  ${ids.get(edge.from)} -->|"${text(edge.contract ?? 'dependency')}"| ${ids.get(edge.to)}`;
  })].join('\n');
}
