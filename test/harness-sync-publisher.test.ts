/**
 * Starlight Universal 10-Harness Sync, Dual Monetization Publisher & Queen Micro-Lane Tests
 *
 * Tests:
 *   1. Harness auto-discovery across all 10 workstation platforms
 *   2. Harness configuration projection, formatting, dry-run, and backup mechanics
 *   3. Progressive disclosure auditing (Levels 1, 2, 3)
 *   4. Dual monetization engine (Stripe + Polar) pricing, benefits, and checkout parameters
 *   5. SIP SHA-256 cryptographic attestation sealing
 *   6. Queen Adaptive Micro-Lane RAM tier assessment and held card auto-repair
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  discoverInstalledHarnesses,
  syncHarnessConfigs,
  publishSkill,
  auditProgressiveDisclosure,
  SUPPORTED_HARNESS_REGISTRY,
} from '../dist/skills/index.js';
import {
  QueenAdaptiveScheduler,
} from '../dist/queen/index.js';

describe('Universal 10-Harness Sync Engine', () => {
  it('identifies all 10 supported workstation harnesses in the registry', () => {
    assert.equal(SUPPORTED_HARNESS_REGISTRY.length, 10);
    const ids = SUPPORTED_HARNESS_REGISTRY.map((h) => h.id);
    assert.ok(ids.includes('claude-code'));
    assert.ok(ids.includes('codex'));
    assert.ok(ids.includes('antigravity'));
    assert.ok(ids.includes('grok'));
    assert.ok(ids.includes('hermes'));
    assert.ok(ids.includes('gemini-cli'));
    assert.ok(ids.includes('opencode'));
    assert.ok(ids.includes('kilo'));
    assert.ok(ids.includes('cursor'));
    assert.ok(ids.includes('windsurf'));
  });

  it('runs discovery on a workspace without throwing and returns accurate descriptor objects', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'harness-disc-'));
    try {
      const results = discoverInstalledHarnesses(tempDir);
      assert.equal(results.length, 10);
      for (const r of results) {
        assert.ok(r.id);
        assert.ok(r.name);
        assert.ok(r.vendor);
        assert.ok(typeof r.detected === 'boolean');
      }
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('performs dry-run configuration projection without writing files to disk', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'harness-dry-'));
    try {
      const report = syncHarnessConfigs({
        workspaceRoot: tempDir,
        dryRun: true,
        harnesses: ['claude-code', 'cursor', 'gemini-cli'],
      });

      assert.ok(report.projectedFiles.length >= 3);
      assert.equal(report.backupFiles.length, 0);

      // Verify files were NOT written
      for (const pf of report.projectedFiles) {
        assert.equal(existsSync(pf.absolutePath), false);
      }
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('performs live projection, creating formatted files and preserving existing ones as .bak', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'harness-live-'));
    try {
      // 1. First sync - creates fresh config
      const report1 = syncHarnessConfigs({
        workspaceRoot: tempDir,
        dryRun: false,
        harnesses: ['cursor'],
      });

      assert.ok(report1.projectedFiles.length > 0);
      const cursorFile = report1.projectedFiles[0].absolutePath;
      assert.ok(existsSync(cursorFile));

      const initialContent = readFileSync(cursorFile, 'utf8');
      assert.ok(initialContent.includes('Cursor Rules'));

      // 2. Modify file to simulate user edits
      writeFileSync(cursorFile, '{"custom": true}\n', 'utf8');

      // 3. Second sync - must backup previous content
      const report2 = syncHarnessConfigs({
        workspaceRoot: tempDir,
        dryRun: false,
        harnesses: ['cursor'],
      });

      assert.equal(report2.backupFiles.length, 1);
      assert.ok(existsSync(report2.backupFiles[0]));
      assert.ok(readFileSync(report2.backupFiles[0], 'utf8').includes('"custom": true'));
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

describe('Sovereign Skill Publisher & Dual Monetization (Stripe + Polar)', () => {
  it('correctly audits progressive disclosure levels', () => {
    const level1 = auditProgressiveDisclosure('# Test\nShort content without instructions.');
    assert.equal(level1.level, 1);

    const level2Content = `# Test
## Mission
Short mission.
## Instructions
${'Step instruction line.\n'.repeat(30)}
`;
    const level2 = auditProgressiveDisclosure(level2Content);
    assert.equal(level2.level, 2);

    const level3Content = `# Test
## Mission
Complex multi-agent mission.
## Workflows
Step 1 to N.
## Verification
Evidence checklist.
${'Detailed procedural instructions line.\n'.repeat(120)}
`;
    const level3 = auditProgressiveDisclosure(level3Content);
    assert.equal(level3.level, 3);
  });

  it('publishes a skill package with dual Stripe and Polar monetization configs', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'skill-pub-'));
    try {
      const result = publishSkill(
        {
          name: 'sovereign-db-optimizer',
          version: '2.1.0',
          title: 'Sovereign Database Optimizer',
          description: 'Autonomous index tuning and slow-query refactoring',
          domain: 'code-intelligence',
          license: 'Commercial',
          pricingTier: 'pro',
          content: `---
name: sovereign-db-optimizer
version: 2.1.0
pricingTier: pro
---
# Sovereign Database Optimizer

## Mission
Optimize distributed databases.

## Instructions
Analyze queries and generate non-blocking migrations.
`,
        },
        {
          outDir: tempDir,
          monetization: 'both',
          tier: 'pro',
        }
      );

      assert.equal(result.success, true);
      assert.equal(result.pricingTier, 'pro');
      assert.ok(result.attestationSha.length === 64);

      // Verify Stripe configuration
      assert.equal(result.monetizationConfig.stripe.suggestedPriceUSD, 79);
      assert.equal(result.monetizationConfig.stripe.currency, 'usd');
      assert.equal(result.monetizationConfig.stripe.mode, 'payment');
      assert.ok(result.monetizationConfig.stripe.meteredUsage);

      // Verify Polar configuration
      assert.equal(result.monetizationConfig.polar.tierName, 'Pro Builder');
      assert.equal(result.monetizationConfig.polar.monthlyUSD, 79);
      assert.ok(result.monetizationConfig.polar.benefits.length >= 4);

      // Verify generated files on disk
      assert.ok(existsSync(join(tempDir, 'manifest.json')));
      assert.ok(existsSync(join(tempDir, 'monetization.json')));
      assert.ok(existsSync(join(tempDir, 'SKILL.md')));

      const monetizationJson = JSON.parse(readFileSync(join(tempDir, 'monetization.json'), 'utf8'));
      assert.equal(monetizationJson.tier, 'pro');
      assert.equal(monetizationJson.stripe.suggestedPriceUSD, 79);
      assert.equal(monetizationJson.polar.monthlyUSD, 79);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

describe('Queen Adaptive Micro-Lane Scheduler & Auto-Repair', () => {
  it('correctly maps memory readings to the 3 adaptive lanes', () => {
    const scheduler = new QueenAdaptiveScheduler();
    const status = scheduler.getLaneStatus();

    assert.ok(status.freeRamGiB >= 0);
    assert.ok(status.totalRamGiB > 0);
    assert.ok(['micro', 'medium', 'high'].includes(status.currentLane));

    if (status.freeRamGiB >= 4.0) {
      assert.equal(status.currentLane, 'high');
      assert.equal(status.allowsParallelSwarm, true);
    } else if (status.freeRamGiB >= 1.8) {
      assert.equal(status.currentLane, 'medium');
      assert.equal(status.allowsParallelSwarm, false);
    } else {
      assert.equal(status.currentLane, 'micro');
      assert.equal(status.allowsParallelSwarm, false);
    }
  });

  it('auto-repairs card lacking prompt field by synthesizing what, why, and do', () => {
    const scheduler = new QueenAdaptiveScheduler();
    const rawCard = {
      id: 'test-held-card',
      what: 'Prune stale build caches',
      why: 'Workstation disk usage is nearing threshold',
      do: 'Run npm cache clean and pnpm store prune safely',
      evidence: 'reports/disk.md',
    };

    const result = scheduler.repairCardContent(rawCard);
    assert.equal(result.repaired, true);
    assert.ok((rawCard as any).prompt);
    assert.ok((rawCard as any).prompt.includes('Task: Prune stale build caches'));
    assert.ok((rawCard as any).prompt.includes('Context:'));
    assert.ok((rawCard as any).prompt.includes('Execution:'));
    assert.ok((rawCard as any).agent);
    assert.ok((rawCard as any).repo);
  });
});
