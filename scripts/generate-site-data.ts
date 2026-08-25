/**
 * Starlight Intelligence System — Site Data Generator
 *
 * Extracts all 87 canonical skills and 146 agents into rich JSON datasets
 * for the starlightintelligence.org web portal.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SkillExporter } from '../src/adapters/skill-exporter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const REPO_ROOT = resolve(__dirname, '..');

const SITE_DATA_DIR = join(REPO_ROOT, 'site', 'src', 'data');
mkdirSync(SITE_DATA_DIR, { recursive: true });

// 1. Generate Skills Data
console.log('Extracting skills for site...');
const exporter = new SkillExporter(REPO_ROOT);
const canonicalSkills = exporter.loadCanonicalSkills();

const siteSkills = canonicalSkills.map((s) => ({
  id: s.key,
  domain: s.domain,
  name: s.name,
  description: s.description,
  priority: s.rule?.priority ?? 'medium',
  loadLevel: s.rule?.load_level ?? 'core',
  triggers: s.rule?.triggers ?? {},
  body: s.body,
  tokenEstimate: Math.round(s.body.length / 4),
}));

writeFileSync(
  join(SITE_DATA_DIR, 'skills.json'),
  JSON.stringify(siteSkills, null, 2) + '\n',
  'utf8'
);
console.log(`✓ Wrote ${siteSkills.length} skills to site/src/data/skills.json`);

// 2. Generate Agents Data
console.log('Extracting agents for site...');
const AGENTS_DIR = join(REPO_ROOT, 'agents');

interface AgentData {
  id: string;
  name: string;
  tier: string;
  domain: string;
  voice: string;
  tagline: string;
  mission: string;
  activeSkills: string[];
  triggers: string[];
  content: string;
}

const siteAgents: AgentData[] = [];

function parseAgentFile(filePath: string, filename: string): AgentData | null {
  const content = readFileSync(filePath, 'utf8');
  if (!content.startsWith('---')) return null;
  const endFm = content.indexOf('\n---', 3);
  if (endFm === -1) return null;

  const rawFm = content.slice(3, endFm);
  const body = content.slice(endFm + 4).trim();
  const fm: Record<string, string> = {};

  for (const line of rawFm.split('\n')) {
    const match = line.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.*)/);
    if (match) {
      fm[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  }

  // Extract tagline from blockquote
  const taglineMatch = body.match(/^>\s*(.+)$/m);
  const tagline = taglineMatch ? taglineMatch[1].trim() : '';

  // Extract mission
  const missionMatch = body.match(/##\s*Mission\s*\n+([^#]+)/i);
  const mission = missionMatch ? missionMatch[1].trim() : tagline;

  // Extract active skills
  const skillsList: string[] = [];
  const skillsBlock = body.match(/##\s*Active Skills\s*\n+([\s\S]*?)(?=\n##|$)/i);
  if (skillsBlock) {
    const lines = skillsBlock[1].split('\n');
    for (const l of lines) {
      const m = l.match(/`([^`]+)`/);
      if (m) skillsList.push(m[1]);
    }
  }

  const id = filename.replace(/\.md$/, '');
  const name = fm.name || id;
  const tier = fm.tier || 'specialist';
  const domain = fm.domain || 'general';
  const voice = fm.voice || 'direct, technical, warm';

  return {
    id,
    name,
    tier,
    domain,
    voice,
    tagline,
    mission,
    activeSkills: skillsList,
    triggers: [],
    content: body,
  };
}

for (const entry of readdirSync(AGENTS_DIR, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'AGENT_REGISTRY.md' && entry.name !== 'CODING_AGENTS_REGISTRY.md') {
    const parsed = parseAgentFile(join(AGENTS_DIR, entry.name), entry.name);
    if (parsed) siteAgents.push(parsed);
  } else if (entry.isDirectory()) {
    const subDir = join(AGENTS_DIR, entry.name);
    for (const sub of readdirSync(subDir, { withFileTypes: true })) {
      if (sub.isFile() && sub.name.endsWith('.md')) {
        const parsed = parseAgentFile(join(subDir, sub.name), `${entry.name}/${sub.name}`);
        if (parsed) siteAgents.push(parsed);
      }
    }
  }
}

writeFileSync(
  join(SITE_DATA_DIR, 'agents.json'),
  JSON.stringify(siteAgents, null, 2) + '\n',
  'utf8'
);
console.log(`✓ Wrote ${siteAgents.length} agents to site/src/data/agents.json`);
console.log('Site data generation complete.');
