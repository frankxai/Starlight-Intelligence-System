/**
 * memory.mjs — Sovereign Vault Search & Append Engine for Starlight Meta-Harness
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { C } from './status.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const VAULTS_DIR = path.join(REPO_ROOT, 'memory', 'vaults');

export const VAULT_NAMES = [
  'strategic',
  'technical',
  'creative',
  'operational',
  'wisdom',
  'horizon'
];

export function parseVaultEntries(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split('\n');
  const entries = [];
  let currentEntry = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.match(/^###\s+\[(.*?)\]\s+(.*)/);
    if (headerMatch) {
      if (currentEntry) entries.push(currentEntry);
      currentEntry = {
        date: headerMatch[1],
        title: headerMatch[2],
        category: '',
        confidence: '1.0',
        content: [],
        startLine: i + 1,
      };
      continue;
    }

    if (currentEntry) {
      if (line.startsWith('**Category:**')) {
        currentEntry.category = line.replace('**Category:**', '').trim();
      } else if (line.startsWith('**Confidence:**')) {
        currentEntry.confidence = line.replace('**Confidence:**', '').trim();
      }
      currentEntry.content.push(line);
    }
  }

  if (currentEntry) entries.push(currentEntry);
  return entries;
}

export function searchVaults(query, options = {}) {
  const targetVault = options.vault ? options.vault.toLowerCase().replace('-vault', '') : null;
  const vaultsToSearch = targetVault ? [targetVault] : VAULT_NAMES;
  const q = query.toLowerCase();

  console.log(`\n${C.cyan}${C.bold}╔══════════════════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.cyan}${C.bold}║          STARLIGHT SOVEREIGN MEMORY: VAULT SEARCH                    ║${C.reset}`);
  console.log(`${C.cyan}${C.bold}╚══════════════════════════════════════════════════════════════════════╝${C.reset}\n`);
  console.log(`• Query: ${C.bold}"${query}"${C.reset} across ${vaultsToSearch.join(', ')}\n`);

  const results = [];

  for (const v of vaultsToSearch) {
    const filePath = path.join(VAULTS_DIR, `${v}-vault.md`);
    if (!fs.existsSync(filePath)) continue;

    const entries = parseVaultEntries(filePath);
    for (const e of entries) {
      const fullText = `${e.title} ${e.category} ${e.content.join(' ')}`.toLowerCase();
      if (fullText.includes(q)) {
        let score = 0;
        if (e.title.toLowerCase().includes(q)) score += 10;
        if (e.category.toLowerCase().includes(q)) score += 5;
        score += (fullText.split(q).length - 1);

        results.push({
          vault: v,
          date: e.date,
          title: e.title,
          category: e.category,
          confidence: e.confidence,
          preview: e.content.filter(l => l.trim().length > 0).slice(0, 3).join(' ').slice(0, 160),
          score
        });
      }
    }
  }

  results.sort((a, b) => b.score - a.score);

  if (results.length === 0) {
    console.log(`  ${C.yellow}No matching vault entries found.${C.reset}\n`);
    return [];
  }

  console.log(`Found ${C.green}${results.length} matching entries${C.reset}:\n`);
  for (const r of results.slice(0, 10)) {
    console.log(`  [${C.cyan}${r.vault.toUpperCase()}${C.reset}] ${C.bold}[${r.date}] ${r.title}${C.reset}`);
    if (r.category) console.log(`    Category: ${C.dim}${r.category}${C.reset} | Confidence: ${r.confidence}`);
    console.log(`    ${C.dim}${r.preview}...${C.reset}\n`);
  }

  return results;
}

export function appendVault(vaultName, title, content, options = {}) {
  const v = vaultName.toLowerCase().replace('-vault', '');
  const filePath = path.join(VAULTS_DIR, `${v}-vault.md`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Vault file does not exist: ${filePath}`);
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const category = options.category || 'architecture-pattern';
  const confidence = options.confidence || '0.95';
  const source = options.source || 'Starlight Meta-Harness / Autonomous Execution';

  const entryBlock = `
### [${dateStr}] ${title}

**Category:** ${category}
**Confidence:** ${confidence}
**Source:** ${source}

${content}

**SIP Attestation:** Built on SIP v1.1.1 — Sovereign Substrate
`;

  fs.appendFileSync(filePath, entryBlock, 'utf8');
  console.log(`\n${C.green}${C.bold}✓ ENTRY APPENDED TO ${v.toUpperCase()} VAULT${C.reset}`);
  console.log(`Title: ${title}`);
  console.log(`File:  ${filePath}\n`);
  return { ok: true, filePath };
}
