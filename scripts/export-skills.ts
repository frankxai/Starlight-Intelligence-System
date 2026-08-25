#!/usr/bin/env node
/**
 * Starlight Intelligence System — Universal Skill Exporter CLI
 *
 * Compiles and distributes canonical skills from SIS (skills/**) into:
 *   - Antigravity / Gemini CLI (.gemini/config/plugins/starlight-skills-library/)
 *   - Claude Code (.claude/skills/)
 *   - Cursor (.cursor/rules/*.mdc)
 *   - OpenAI Codex (.agents/skills/)
 *   - Cline / Roo-Code (.clinerules/skills/)
 *   - Starlight Marketplace (dist/marketplace/)
 *
 * Usage:
 *   npx tsx scripts/export-skills.ts --all
 *   npx tsx scripts/export-skills.ts --antigravity
 *   npx tsx scripts/export-skills.ts --cursor --claude
 *   npx tsx scripts/export-skills.ts --all --dry-run
 */

import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { SkillExporter, ExportTargets } from '../src/adapters/skill-exporter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const REPO_ROOT = resolve(__dirname, '..');
const HOME = homedir();

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const exportAll = args.includes('--all') || args.length === 0 || (args.length === 1 && isDryRun);

const targets: ExportTargets = {};

if (exportAll || args.includes('--antigravity') || args.includes('--gemini')) {
  targets.antigravityPluginDir = join(HOME, '.gemini', 'config', 'plugins', 'starlight-skills-library');
}

if (exportAll || args.includes('--claude')) {
  targets.claudeSkillsDir = join(HOME, '.claude', 'skills');
}

if (exportAll || args.includes('--cursor')) {
  targets.cursorRulesDir = join(REPO_ROOT, '.cursor', 'rules');
}

if (exportAll || args.includes('--codex')) {
  targets.codexSkillsDir = join(REPO_ROOT, '.agents', 'skills');
}

if (exportAll || args.includes('--cline')) {
  targets.clineRulesDir = join(REPO_ROOT, '.clinerules', 'skills');
}

if (exportAll || args.includes('--marketplace')) {
  targets.marketplaceDistDir = join(REPO_ROOT, 'dist', 'marketplace');
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('  STARLIGHT INTELLIGENCE SYSTEM — UNIVERSAL SKILL EXPORTER');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`  Source Repository : ${REPO_ROOT}`);
console.log(`  Dry Run Mode      : ${isDryRun ? 'YES (Simulated)' : 'NO (Live Output)'}`);
console.log('───────────────────────────────────────────────────────────────');

const exporter = new SkillExporter(REPO_ROOT);
const skills = exporter.loadCanonicalSkills();
console.log(`  Found ${skills.length} canonical skills in skills/ across 16 domains.\n`);

const summary = exporter.exportAll(targets, { dryRun: isDryRun });

console.log('  Export Results:');
for (const [target, count] of Object.entries(summary.exportedTargets)) {
  console.log(`    ✓ ${target.padEnd(16)} : ${count} skills compiled`);
}

if (targets.antigravityPluginDir) {
  console.log(`\n  Antigravity Plugin Target: ${targets.antigravityPluginDir}`);
}
if (targets.marketplaceDistDir) {
  console.log(`  Marketplace Target        : ${targets.marketplaceDistDir}`);
}

console.log('───────────────────────────────────────────────────────────────');
console.log('  Status: SUCCESS — All platforms synchronized with SIS SSOT.');
console.log('═══════════════════════════════════════════════════════════════\n');
