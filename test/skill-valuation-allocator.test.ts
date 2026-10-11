/**
 * Starlight Skill Economy: Valuation, Allocation & Bridge Tests
 *
 * Covers:
 *   1. Skill markdown parsing and schema extraction
 *   2. Deterministic valuation formula and pricing tier recommendations
 *   3. Multi-agent skill allocation with necessity-gate enforcement
 *   4. Cross-marketplace distribution manifest generation (Starlight, Smithery, Glama, Cursor)
 *
 * Built on SIP — operational tier.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseSkillMarkdown,
  evaluateSkill,
  allocateSkillsForAgent,
  generateCrossMarketplaceManifests,
  type SkillDefinition,
} from '../src/skills/index.js';

describe('Skill Economy Subsystem', () => {
  describe('Skill Markdown Parser', () => {
    it('parses valid SKILL.md with frontmatter, mission, instructions and workflows', () => {
      const raw = `---
name: custom-db-optimizer
version: 1.2.0
title: Database Optimizer
description: Autonomous index tuning and slow-query refactoring
author: Starlight Labs
pricingTier: pro
pricingMonthlyUsd: 49
---

# Database Optimizer

## Mission
Analyze slow queries and recommend composite indexes for high-throughput PostgreSQL.

## Instructions
Never execute destructive DROP TABLE or ALTER TABLE operations without approval.
Always explain the query planner cost delta before and after index creation.

## Workflows
1. Inspect pg_stat_statements.
2. Run EXPLAIN (ANALYZE, BUFFERS).
3. Generate minimal index migrations.

## Verification
1. Verify query cost is reduced by at least 40%.
2. Confirm zero tablespace lock during CONCURRENT index builds.
`;

      const skill = parseSkillMarkdown(raw, 'custom-db-optimizer');
      assert.equal(skill.id, 'custom-db-optimizer');
      assert.equal(skill.title, 'Database Optimizer');
      assert.equal(skill.pricingTier, 'pro');
      assert.equal(skill.pricingMonthlyUsd, 49);
      assert.ok(skill.mission?.includes('slow queries'));
      assert.ok(skill.instructions?.includes('destructive DROP'));
      assert.equal(skill.workflows?.length, 3);
      assert.equal(skill.verificationRubric?.length, 2);
    });
  });

  describe('Skill Valuation & Pricing Engine', () => {
    it('evaluates a high-quality, complex skill into pro/enterprise tier', () => {
      const complexSkill: SkillDefinition = {
        id: 'ast-compiler-optimizer',
        name: 'ast-compiler-optimizer',
        version: '1.0.0',
        title: 'AST Compiler Optimizer',
        description: 'Transforms high-level TypeScript ASTs into optimized zero-allocation WebAssembly bytecode.',
        author: 'Systems Architect',
        license: 'Commercial',
        pricingTier: 'pro',
        tags: ['compiler', 'ast', 'wasm'],
        permissions: ['fs:read:repo', 'fs:write:build'],
        tools: ['fs:read', 'fs:write', 'gpu:invoke'],
        harnessTargets: ['claude-code', 'cursor'],
        mission: 'Provide autonomous AST optimization and bytecode generation.',
        instructions: 'Follow strict type safety, never emit untyped any, verify memory bounds.',
        workflows: ['Step 1: Parse AST', 'Step 2: Tree-shake unused nodes', 'Step 3: Emit bytecode'],
        verificationRubric: ['Passes all test assertions', 'Zero memory leaks in Valgrind'],
        rawMarkdown: 'AST compiler with database and gpu integration for Starlight sovereign mesh.',
      };

      const report = evaluateSkill(complexSkill);
      assert.ok(report.qualityScore >= 70, `Quality score ${report.qualityScore} should be >= 70`);
      assert.ok(report.complexityScore >= 50, `Complexity score ${report.complexityScore} should be >= 50`);
      assert.ok(report.overallScore >= 60, `Overall score ${report.overallScore} should be >= 60`);
      assert.ok(report.suggestedMonthlyUsd > 0, 'Should suggest non-zero monthly price');
      assert.ok(report.rationale.length > 0, 'Should provide rationale points');
    });

    it('identifies improvement gaps on an incomplete skill draft', () => {
      const draftSkill: SkillDefinition = {
        id: 'quick-draft',
        name: 'quick-draft',
        version: '0.1.0',
        title: 'Quick Draft',
        description: 'Draft',
        author: 'Anonymous',
        license: 'MIT',
        pricingTier: 'free',
        tags: ['draft'],
        permissions: [],
        tools: [],
        harnessTargets: ['claude-code'],
        rawMarkdown: 'Just a short note.',
      };

      const report = evaluateSkill(draftSkill);
      assert.equal(report.recommendedTier, 'free');
      assert.equal(report.suggestedMonthlyUsd, 0);
      assert.ok(report.improvementGaps.length >= 3, 'Must flag missing sections as improvement gaps');
    });
  });

  describe('Multi-Agent Skill Allocation Engine', () => {
    it('allocates skills to leadership tier agents while enforcing capacity ceiling', () => {
      const res = allocateSkillsForAgent('orchestrator', { maxSkills: 3 });
      assert.equal(res.agentId, 'orchestrator');
      assert.equal(res.tier, 'leadership');
      assert.equal(res.allocatedSkills.length, 3, 'Must respect maxSkills limit of 3');
      assert.ok(res.excludedSkills.length >= 1, 'Should exclude overflow skills to prevent context bloat');
      assert.ok(res.totalEstimatedTokens > 0, 'Should estimate token overhead');
      assert.ok(res.harnessConfigSnippet.includes('activeSkills'), 'Should output valid config snippet');
    });

    it('tailors harness configuration snippet based on target harness parameter', () => {
      const claudeRes = allocateSkillsForAgent('sentinel', { targetHarness: 'claude-code' });
      assert.ok(claudeRes.harnessConfigSnippet.includes('.claude/config.json'));

      const cursorRes = allocateSkillsForAgent('sentinel', { targetHarness: 'cursor' });
      assert.ok(cursorRes.harnessConfigSnippet.includes('.cursorrules'));

      const codexRes = allocateSkillsForAgent('sentinel', { targetHarness: 'codex' });
      assert.ok(codexRes.harnessConfigSnippet.includes('CODEX.md'));
    });
  });

  describe('Cross-Marketplace Bridge', () => {
    it('generates compliant manifests across Starlight, Smithery, Glama, and Cursor', () => {
      const skill: SkillDefinition = {
        id: 'voice-transcriber',
        name: 'voice-transcriber',
        version: '2.0.0',
        title: 'Voice Transcriber',
        description: 'Transcribes multi-speaker audio into timestamped markdown notes.',
        author: 'Arcanea Media',
        license: 'MIT',
        pricingTier: 'free',
        tags: ['audio', 'whisper'],
        permissions: ['fs:read:audio'],
        tools: ['audio:transcribe'],
        harnessTargets: ['claude-code', 'cursor'],
      };

      const manifests = generateCrossMarketplaceManifests(skill);

      // Starlight catalog entry
      assert.equal(manifests.starlightCatalogEntry.id, 'voice-transcriber');
      assert.equal(manifests.starlightCatalogEntry.kind, 'skill_pack');

      // Smithery YAML
      assert.ok(manifests.smitheryYaml.includes('name: voice-transcriber'));
      assert.ok(manifests.smitheryYaml.includes('audio:transcribe'));

      // Glama JSON
      assert.equal(manifests.glamaJson.id, 'voice-transcriber');
      assert.ok(manifests.glamaJson.transport);

      // Cursor rule
      assert.ok(manifests.cursorRuleSnippet.includes('Voice Transcriber'));
      assert.ok(manifests.cursorRuleSnippet.includes('fs:read:audio'));
    });
  });
});
