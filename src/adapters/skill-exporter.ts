/**
 * Starlight Intelligence System — Universal Skill Exporter & Multi-Platform Compiler
 *
 * Compiles canonical skills from SIS (skills/**) into platform-native formats:
 *   1. Antigravity & Gemini CLI plugins (.gemini/config/plugins/starlight-skills-library/)
 *   2. Claude Code skills & plugins (.claude/skills/, .claude-plugin/)
 *   3. Cursor Rules (.cursor/rules/*.mdc) with YAML frontmatter + glob matching
 *   4. OpenAI Codex (.agents/skills/, AGENTS.md indices)
 *   5. Cline / Roo-Code (.clinerules/skills/)
 *   6. Starlight Marketplace (JSON manifests & product bundles for web marketplace)
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';

export interface SkillRule {
  id: string;
  skill: string;
  triggers?: {
    keywords?: string[];
    agents?: string[];
    intents?: string[];
    files?: string[];
  };
  priority?: string;
  load_level?: string;
}

export interface SkillRulesFile {
  version: string;
  description: string;
  rules: SkillRule[];
}

export interface ParsedSkill {
  key: string;
  domain: string;
  name: string;
  description: string;
  frontmatter: Record<string, string>;
  body: string;
  rawContent: string;
  sourceRelPath: string;
  rule?: SkillRule;
}

export interface ExportTargets {
  antigravityPluginDir?: string;
  claudeSkillsDir?: string;
  claudePluginDir?: string;
  cursorRulesDir?: string;
  codexSkillsDir?: string;
  clineRulesDir?: string;
  marketplaceDistDir?: string;
}

export interface ExportSummary {
  totalSkillsParsed: number;
  exportedTargets: Record<string, number>;
  errors: string[];
}

export class SkillExporter {
  private repoRoot: string;
  private skillsDir: string;
  private rulesPath: string;

  constructor(repoRoot: string) {
    this.repoRoot = resolve(repoRoot);
    this.skillsDir = join(this.repoRoot, 'skills');
    this.rulesPath = join(this.skillsDir, 'skill-rules.json');
  }

  /**
   * Load and parse all canonical skills in SIS
   */
  public loadCanonicalSkills(): ParsedSkill[] {
    const rulesMap = this.loadRulesMap();
    const skillFiles = this.walkSkills(this.skillsDir);
    const parsedSkills: ParsedSkill[] = [];

    for (const rel of skillFiles) {
      if (rel === 'SKILL_ARCHITECTURE.md' || rel === 'SKILL_REGISTRY.md') continue;
      const absPath = join(this.skillsDir, rel);
      const content = readFileSync(absPath, 'utf8');
      const parsed = this.parseSkillContent(rel, content, rulesMap);
      if (parsed) {
        parsedSkills.push(parsed);
      }
    }

    return parsedSkills;
  }

  /**
   * Export to all configured platforms
   */
  public exportAll(targets: ExportTargets, options: { dryRun?: boolean } = {}): ExportSummary {
    const skills = this.loadCanonicalSkills();
    const summary: ExportSummary = {
      totalSkillsParsed: skills.length,
      exportedTargets: {},
      errors: [],
    };

    if (targets.antigravityPluginDir) {
      const count = this.exportToAntigravityPlugin(skills, targets.antigravityPluginDir, options.dryRun);
      summary.exportedTargets.antigravity = count;
    }

    if (targets.claudeSkillsDir) {
      const count = this.exportToClaudeSkills(skills, targets.claudeSkillsDir, options.dryRun);
      summary.exportedTargets.claudeCode = count;
    }

    if (targets.cursorRulesDir) {
      const count = this.exportToCursorMdc(skills, targets.cursorRulesDir, options.dryRun);
      summary.exportedTargets.cursor = count;
    }

    if (targets.codexSkillsDir) {
      const count = this.exportToCodex(skills, targets.codexSkillsDir, options.dryRun);
      summary.exportedTargets.codex = count;
    }

    if (targets.clineRulesDir) {
      const count = this.exportToCline(skills, targets.clineRulesDir, options.dryRun);
      summary.exportedTargets.cline = count;
    }

    if (targets.marketplaceDistDir) {
      const count = this.exportToMarketplaceManifest(skills, targets.marketplaceDistDir, options.dryRun);
      summary.exportedTargets.marketplace = count;
    }

    return summary;
  }

  /**
   * Export to Antigravity / Gemini CLI plugin structure (.gemini/config/plugins/...)
   */
  public exportToAntigravityPlugin(skills: ParsedSkill[], destDir: string, dryRun = false): number {
    const pluginSkillsDir = join(destDir, 'skills');
    if (!dryRun) {
      mkdirSync(pluginSkillsDir, { recursive: true });
    }

    let count = 0;
    for (const skill of skills) {
      const skillSlug = skill.name.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const targetDir = join(pluginSkillsDir, skillSlug);
      const targetFile = join(targetDir, 'SKILL.md');

      const content = [
        '---',
        `name: ${skillSlug}`,
        `description: >-`,
        `  ${skill.description.replace(/\n/g, ' ')}`,
        '---',
        '',
        skill.body.trim(),
        '',
      ].join('\n');

      if (!dryRun) {
        mkdirSync(targetDir, { recursive: true });
        writeFileSync(targetFile, content, 'utf8');
      }
      count++;
    }

    // Write plugin.json
    const manifest = {
      name: 'starlight-skills-library',
      version: '3.0.0',
      description: 'Comprehensive Starlight Intelligence Skills Library: Frontier Reasoning, Orchestration, Memory, Design, Media, and Sovereign Systems',
      skillCount: count,
      updatedAt: new Date().toISOString(),
    };

    if (!dryRun) {
      writeFileSync(join(destDir, 'plugin.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    }

    return count;
  }

  /**
   * Export to Claude Code (.claude/skills/)
   */
  public exportToClaudeSkills(skills: ParsedSkill[], destDir: string, dryRun = false): number {
    if (!dryRun) {
      mkdirSync(destDir, { recursive: true });
    }

    let count = 0;
    for (const skill of skills) {
      const skillSlug = skill.name.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const targetDir = join(destDir, skillSlug);
      const targetFile = join(targetDir, 'SKILL.md');

      const content = [
        '---',
        `name: ${skillSlug}`,
        `description: >-`,
        `  ${skill.description.replace(/\n/g, ' ')}`,
        '---',
        '',
        skill.body.trim(),
        '',
      ].join('\n');

      if (!dryRun) {
        mkdirSync(targetDir, { recursive: true });
        writeFileSync(targetFile, content, 'utf8');
      }
      count++;
    }
    return count;
  }

  /**
   * Export to Cursor Rules (.cursor/rules/*.mdc)
   */
  public exportToCursorMdc(skills: ParsedSkill[], destDir: string, dryRun = false): number {
    if (!dryRun) {
      mkdirSync(destDir, { recursive: true });
    }

    let count = 0;
    for (const skill of skills) {
      const skillSlug = skill.name.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const targetFile = join(destDir, `starlight-${skillSlug}.mdc`);

      const globs = skill.rule?.triggers?.files ?? ['**/*'];
      const mdcContent = [
        '---',
        `description: "${skill.description.replace(/"/g, '\\"')}"`,
        `globs: ${JSON.stringify(globs.length > 0 ? globs.join(', ') : '*')}`,
        `alwaysApply: false`,
        '---',
        '',
        `# Starlight Skill: ${skill.name}`,
        '',
        skill.body.trim(),
        '',
      ].join('\n');

      if (!dryRun) {
        writeFileSync(targetFile, mdcContent, 'utf8');
      }
      count++;
    }
    return count;
  }

  /**
   * Export to OpenAI Codex (.agents/skills/)
   */
  public exportToCodex(skills: ParsedSkill[], destDir: string, dryRun = false): number {
    if (!dryRun) {
      mkdirSync(destDir, { recursive: true });
    }

    let count = 0;
    for (const skill of skills) {
      const skillSlug = skill.name.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const targetDir = join(destDir, skillSlug);
      const targetFile = join(targetDir, 'SKILL.md');

      const content = [
        '---',
        `name: ${skillSlug}`,
        `description: "${skill.description.replace(/"/g, '\\"')}"`,
        '---',
        '',
        skill.body.trim(),
        '',
      ].join('\n');

      if (!dryRun) {
        mkdirSync(targetDir, { recursive: true });
        writeFileSync(targetFile, content, 'utf8');
      }
      count++;
    }
    return count;
  }

  /**
   * Export to Cline (.clinerules/skills/)
   */
  public exportToCline(skills: ParsedSkill[], destDir: string, dryRun = false): number {
    if (!dryRun) {
      mkdirSync(destDir, { recursive: true });
    }

    let count = 0;
    for (const skill of skills) {
      const skillSlug = skill.name.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const targetFile = join(destDir, `${skillSlug}.md`);

      const content = [
        `# Skill: ${skill.name}`,
        `> ${skill.description}`,
        '',
        skill.body.trim(),
        '',
      ].join('\n');

      if (!dryRun) {
        writeFileSync(targetFile, content, 'utf8');
      }
      count++;
    }
    return count;
  }

  /**
   * Export to Starlight Marketplace JSON bundle
   */
  public exportToMarketplaceManifest(skills: ParsedSkill[], destDir: string, dryRun = false): number {
    if (!dryRun) {
      mkdirSync(destDir, { recursive: true });
    }

    const manifest = {
      schemaVersion: '1.0.0',
      generatedAt: new Date().toISOString(),
      source: 'Starlight Intelligence System (SIS SSOT)',
      totalSkills: skills.length,
      domains: [...new Set(skills.map(s => s.domain))].sort(),
      skills: skills.map(s => ({
        id: s.key,
        domain: s.domain,
        name: s.name,
        description: s.description,
        triggers: s.rule?.triggers ?? {},
        priority: s.rule?.priority ?? 'medium',
        loadLevel: s.rule?.load_level ?? 'core',
        contentLength: s.body.length,
      })),
    };

    if (!dryRun) {
      writeFileSync(join(destDir, 'starlight-skills-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    }

    return skills.length;
  }

  private loadRulesMap(): Map<string, SkillRule> {
    const map = new Map<string, SkillRule>();
    if (!existsSync(this.rulesPath)) return map;

    try {
      const raw = JSON.parse(readFileSync(this.rulesPath, 'utf8')) as SkillRulesFile;
      if (Array.isArray(raw.rules)) {
        for (const rule of raw.rules) {
          map.set(rule.skill, rule);
        }
      }
    } catch {
      // Ignore parse error
    }
    return map;
  }

  private parseSkillContent(rel: string, content: string, rulesMap: Map<string, SkillRule>): ParsedSkill | null {
    if (!content.startsWith('---')) return null;
    const end = content.indexOf('\n---', 3);
    if (end === -1) return null;

    const rawFm = content.slice(3, end);
    const body = content.slice(end + 4).trim();
    const fm: Record<string, string> = {};

    for (const line of rawFm.split('\n')) {
      const match = line.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.*)/);
      if (match) {
        fm[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
      }
    }

    let key = rel.endsWith('/SKILL.md') ? rel.slice(0, -'/SKILL.md'.length) : rel.replace(/\.md$/, '');
    key = key.split('\\').join('/');

    const domain = key.includes('/') ? key.split('/')[0] : 'general';
    const name = fm.name || key;
    const description = fm.description || '';
    const rule = rulesMap.get(key);

    return {
      key,
      domain,
      name,
      description,
      frontmatter: fm,
      body,
      rawContent: content,
      sourceRelPath: rel,
      rule,
    };
  }

  private walkSkills(dir: string, prefix = ''): string[] {
    const results: string[] = [];
    if (!existsSync(dir)) return results;

    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const rel = prefix ? `${prefix}/${entry}` : entry;
      const stat = statSync(full);
      if (stat.isDirectory()) {
        if (entry === 'references' || entry === 'assets' || entry === 'node_modules') continue;
        results.push(...this.walkSkills(full, rel));
      } else if (entry.endsWith('.md')) {
        results.push(rel);
      }
    }
    return results;
  }
}
