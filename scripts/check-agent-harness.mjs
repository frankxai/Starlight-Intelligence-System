#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
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
  if (manifest.health !== 'pnpm test') failures.push(`${file}: health must be pnpm test`);
  if (manifest.deployPolicy !== 'manual') failures.push(`${file}: deployPolicy must be manual`);
  if (manifest.globalHooksAllowed !== false) failures.push(`${file}: globalHooksAllowed must be false`);
  for (const expected of ['AGENTS.md', 'CLAUDE.md']) {
    if (!manifest.agentFiles?.includes(expected)) failures.push(`${file}: agentFiles missing ${expected}`);
  }
}

validateManifest();
for (const file of ['AGENTS.md', 'CLAUDE.md', 'README.md']) requireFile(file);

requireText('README.md', /six vaults|6 semantic vaults/i, 'six-vault memory claim');
requireText('README.md', /MCP server|sis_\*/i, 'MCP server claim');
requireText('README.md', /Claude Code.*Cursor.*Codex.*Gemini.*OpenCode/is, 'multi-platform adapter claim');
requireText('AGENTS.md', /42 named agents|42 Agents/i, 'current agent count claim');
requireText('AGENTS.md', /68 auto-activating skill rules|68 Skills/i, 'current skill count claim');
requireText('CLAUDE.md', /Starlight Intelligence System v8\.0\.0/i, 'current SIS version claim');
requireText('CLAUDE.md', /Substrate-level|Operational-level/i, 'layer routing distinction');

if (failures.length > 0) {
  console.error('SIS agent harness check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('SIS agent harness check passed.');
