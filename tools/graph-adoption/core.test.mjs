import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, symlinkSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { checkRepository, inspectRepository, renderMermaid, sourceFile, validateManifest } from './core.mjs';

const manifest = () => ({ schema: 'starlight.graph-adoption.v1', role: 'consumer', owner: 'Example maintainers', sources: ['AGENTS.md'], workflows: [{ id: 'review', graph: 'flow.json', maker: 'maker', checker: 'checker', mode: 'report-only', contextByteBudget: 1000, checks: ['node --test'], humanGates: ['publish', 'spend', 'credentials', 'destructive'] }] });

test('valid manifest and malformed input corpus', () => {
  assert.deepEqual(validateManifest(manifest()), []);
  for (const value of [null, [], {}, { ...manifest(), sources: 3 }, { ...manifest(), workflows: [null] }]) assert.ok(validateManifest(value).length);
  const bad = manifest(); bad.workflows[0].checker = 'maker';
  assert.match(validateManifest(bad).join(' '), /distinct/);
  bad.workflows[0].mode = 'publish';
  assert.match(validateManifest(bad).join(' '), /report-only/);
});

test('safe mermaid has stable IDs and rejects dangling or duplicate nodes', () => {
  const graph = { nodes: [{ id: 'a"<script>' }, { id: 'b', role: 'checker' }], edges: [{ from: 'a"<script>', to: 'b', contract: 'result' }] };
  assert.match(renderMermaid(graph), /n0 -->/);
  assert.ok(!renderMermaid(graph).includes('<script>'));
  assert.throws(() => renderMermaid({ nodes: [{ id: 'a' }, { id: 'a' }], edges: [] }));
  assert.throws(() => renderMermaid({ nodes: [], edges: [{ from: 'a', to: 'b' }] }));
});

test('local buyer journey: check, drift, hidden paths, no write and unsafe sources', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'graph-adoption-test-'));
  const env = { ...process.env }; for (const key of ['GIT_DIR', 'GIT_INDEX_FILE', 'GIT_WORK_TREE']) delete env[key];
  const git = (...args) => execFileSync('git', ['-C', fixture, ...args], { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    git('init', '--quiet');
    mkdirSync(join(fixture, '.claude'));
    writeFileSync(join(fixture, '.claude', 'SKILL.md'), 'Hidden tracked skill');
    writeFileSync(join(fixture, 'AGENTS.md'), 'Read selected sources fully.');
    writeFileSync(join(fixture, 'flow.json'), JSON.stringify({ nodes: [{ id: 'review' }], edges: [] }));
    writeFileSync(join(fixture, 'graph-adoption.json'), JSON.stringify(manifest()));
    git('add', '--', 'AGENTS.md', 'flow.json', 'graph-adoption.json', '.claude/SKILL.md');
    git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'core.hooksPath=/dev/null', 'commit', '--quiet', '-m', 'fixture');
    const before = git('status', '--porcelain');
    git('config', 'core.fsmonitor', 'this-hook-must-not-be-executed');
    const result = checkRepository(fixture);
    assert.equal(result.ok, true);
    assert.equal(inspectRepository(fixture).trackedInstructions['SKILL.md'], 1);
    assert.equal(git('-c', 'core.fsmonitor=false', 'status', '--porcelain'), before);
    const firstHash = result.boundSources.find((s) => s.path === 'AGENTS.md').sha256;
    writeFileSync(join(fixture, 'AGENTS.md'), 'Changed instructions');
    assert.notEqual(checkRepository(fixture).boundSources.find((s) => s.path === 'AGENTS.md').sha256, firstHash);
    assert.equal(inspectRepository(fixture).dirty, true);
    for (const path of ['../escape', '.env', '.git/config', '/absolute', 'C:/outside', 'a\\b', 'a/../b', 'missing']) assert.throws(() => sourceFile(fixture, path));
    mkdirSync(join(fixture, 'linked-target'));
    symlinkSync(join(fixture, 'linked-target'), join(fixture, 'linked'), 'junction');
    assert.throws(() => sourceFile(fixture, 'linked/file.md'));
    const budget = manifest(); budget.workflows[0].contextByteBudget = 1;
    writeFileSync(join(fixture, 'graph-adoption.json'), JSON.stringify(budget));
    assert.equal(checkRepository(fixture).ok, false);
    writeFileSync(join(fixture, 'graph-adoption.json'), readFileSync(join(fixture, 'flow.json')));
    assert.equal(checkRepository(fixture).ok, false);
  } finally {
    // Exact test-owned, mkdtemp-created path only; never a caller-provided root.
    rmSync(fixture, { recursive: true, force: true });
  }
});
