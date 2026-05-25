#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

function read(file) {
  try {
    return readFileSync(path.join(root, file), 'utf8');
  } catch {
    return '';
  }
}

function requireFile(file) {
  if (!existsSync(path.join(root, file))) failures.push(`${file}: missing`);
}

function requireText(file, pattern, description) {
  const text = read(file);
  if (!pattern.test(text)) failures.push(`${file}: missing ${description}`);
}

function listMarkdownFiles(dir, excludeNames = new Set()) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      for (const child of listMarkdownFiles(full, excludeNames)) out.push(child);
    } else if (entry.name.endsWith('.md') && !excludeNames.has(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function loadCanonical() {
  const agentCount = listMarkdownFiles(path.join(root, 'agents'), new Set(['AGENT_REGISTRY.md'])).length;
  const rules = JSON.parse(read('skills/skill-rules.json'));
  const skillCount = Array.isArray(rules.rules) ? rules.rules.length : 0;
  const vaultNames = new Set();
  const vaultDir = path.join(root, 'memory/vaults');
  if (existsSync(vaultDir)) {
    for (const entry of readdirSync(vaultDir)) {
      const full = path.join(vaultDir, entry);
      if (!statSync(full).isFile()) continue;
      const base = entry.replace(/\.(md|jsonl)$/, '').replace(/-vault$/, '');
      if (base) vaultNames.add(base);
    }
  }
  return { agentCount, skillCount, vaultCount: vaultNames.size };
}

function validateManifest() {
  const file = '.agent-harness.json';
  requireFile(file);
  if (failures.some((failure) => failure.startsWith(file))) return;
  let manifest;
  try {
    manifest = JSON.parse(read(file));
  } catch {
    failures.push(`${file}: invalid JSON`);
    return;
  }
  if (manifest.risk !== 'private') failures.push(`${file}: risk must be private`);
  if (manifest.health !== 'npm run verify') failures.push(`${file}: health must be npm run verify`);
  if (manifest.deployPolicy !== 'manual') failures.push(`${file}: deployPolicy must be manual`);
  if (manifest.globalHooksAllowed !== false) failures.push(`${file}: globalHooksAllowed must be false`);
  for (const expected of ['AGENTS.md', 'CLAUDE.md']) {
    if (!manifest.agentFiles?.includes(expected)) failures.push(`${file}: agentFiles missing ${expected}`);
  }
}

validateManifest();
for (const file of ['AGENTS.md', 'CLAUDE.md', 'README.md']) requireFile(file);
const canonical = loadCanonical();

requireText('README.md', /six vaults|6 semantic vaults/i, 'six-vault memory claim');
requireText('README.md', /MCP server|sis_\*/i, 'MCP server claim');
requireText('README.md', /Claude Code.*Cursor.*Codex.*Gemini.*OpenCode.*Antigravity/is, 'multi-platform adapter claim');
requireText('AGENTS.md', new RegExp(`${canonical.agentCount}\\s+named agents|${canonical.agentCount}\\s+Agents`, 'i'), 'current agent count claim');
requireText('AGENTS.md', new RegExp(`${canonical.skillCount}\\s+auto-activating skill rules|${canonical.skillCount}\\s+Skills`, 'i'), 'current skill count claim');
requireText('AGENTS.md', new RegExp(`${canonical.vaultCount}\\s+semantic memory vaults|${canonical.vaultCount}\\s+semantic vaults`, 'i'), 'current vault count claim');
requireText('CLAUDE.md', /Starlight Intelligence System v8\.0\.0/i, 'current SIS version claim');
requireText('CLAUDE.md', /Substrate-level|Operational-level/i, 'layer routing distinction');

if (failures.length > 0) {
  console.error('SIS agent harness check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('SIS agent harness check passed.');
