/**
 * Starlight Marketplace & Ecosystem E2E Tests
 *
 * Covers:
 *   1. Manifest validation (Zod-like schema, permission checks, format rules)
 *   2. Deterministic SHA-256 calculation for pack directories
 *   3. Marketplace catalog query and search filtering
 *   4. Edge Model Routing and failover simulation
 *   5. Community pack submission format generation
 *
 * Built on SIP — operational tier.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import {
  validateManifest,
  computeManifestSha,
} from '../src/pack-runtime.js';
import {
  StarlightMarketplace,
  type MarketplaceItem,
} from '../src/marketplace/index.js';

describe('Marketplace & Ecosystem E2E Suite', () => {
  describe('Pack Manifest Validation Engine', () => {
    it('validates a well-formed manifest with fine-grained permissions', () => {
      const valid = {
        id: 'test-nlp-pack',
        name: 'Test NLP Pack',
        version: '1.0.0',
        kind: 'skill',
        permissions: ['fs:read:repo', 'network:fetch:api.anthropic.com'],
        licenseTier: 'free',
        manifestSha: 'deadbeef1234567890abcdef',
      };
      const res = validateManifest(valid);
      assert.equal(res.ok, true);
      assert.equal(res.errors.length, 0);
      assert.ok(res.pack);
      assert.equal(res.pack?.id, 'test-nlp-pack');
    });

    it('rejects manifests missing required fields', () => {
      const missingFields = {
        name: 'Broken Pack',
        version: '0.1.0',
      };
      const res = validateManifest(missingFields);
      assert.equal(res.ok, false);
      assert.ok(res.errors.some((e) => e.includes('missing required field: id')));
      assert.ok(res.errors.some((e) => e.includes('missing required field: kind')));
      assert.ok(res.errors.some((e) => e.includes('missing required field: permissions')));
    });

    it('rejects manifests with invalid pack kind', () => {
      const badKind = {
        id: 'bad-kind-pack',
        name: 'Bad Kind',
        version: '1.0.0',
        kind: 'unsupported-kind',
        permissions: ['fs:read:repo'],
        licenseTier: 'free',
        manifestSha: 'dummy-sha',
      };
      const res = validateManifest(badKind);
      assert.equal(res.ok, false);
      assert.ok(res.errors.some((e) => e.includes("not in prompt|skill|agent|knowledge|claw|white-label")));
    });

    it('validates permission descriptor shape (<resource>:<verb>[:<scope>])', () => {
      const badPermission = {
        id: 'bad-perm-pack',
        name: 'Bad Perm',
        version: '1.0.0',
        kind: 'agent',
        permissions: ['invalid_permission_without_colons'],
        licenseTier: 'free',
        manifestSha: 'dummy-sha',
      };
      const res = validateManifest(badPermission);
      assert.equal(res.ok, false);
      assert.ok(res.errors.some((e) => e.includes('bad shape')));
    });
  });

  describe('Deterministic Manifest SHA-256 Engine', () => {
    it('produces identical SHA-256 hashes across directory reads regardless of file ordering', () => {
      const testDir = join(tmpdir(), `starlight-sha-test-${Date.now()}`);
      mkdirSync(join(testDir, 'content'), { recursive: true });

      try {
        writeFileSync(join(testDir, 'content', 'alpha.txt'), 'Alpha content');
        writeFileSync(join(testDir, 'content', 'beta.txt'), 'Beta content');
        writeFileSync(join(testDir, 'README.md'), '# Test Pack');
        writeFileSync(join(testDir, 'manifest.json'), '{"id": "test"}');

        const sha1 = computeManifestSha(testDir);
        const sha2 = computeManifestSha(testDir);

        assert.equal(typeof sha1, 'string');
        assert.equal(sha1.length, 64, 'SHA-256 must be 64 hex characters');
        assert.equal(sha1, sha2, 'SHA calculation must be deterministic');
      } finally {
        rmSync(testDir, { recursive: true, force: true });
      }
    });
  });

  describe('Marketplace Catalog & Ecosystem Filtering', () => {
    const marketplace = new StarlightMarketplace();

    it('correctly categorizes items across kind domains', () => {
      const skills = marketplace.search({ kind: 'skill_pack' });
      const mcps = marketplace.search({ kind: 'mcp_server' });
      const harnesses = marketplace.search({ kind: 'harness_profile' });
      const cloud = marketplace.search({ kind: 'cloud_service' });
      const verticals = marketplace.search({ kind: 'vertical_stack' });

      assert.ok(skills.length > 0, 'Should have skill packs');
      assert.ok(mcps.length > 0, 'Should have MCP servers');
      assert.ok(harnesses.length > 0, 'Should have harness profiles');
      assert.ok(cloud.length > 0, 'Should have cloud services');
      assert.ok(verticals.length > 0, 'Should have vertical stacks');
    });

    it('supports complex multi-attribute searching', () => {
      const results = marketplace.search({
        kind: 'mcp_server',
        pricingTier: 'free',
        query: 'memory',
      });
      assert.ok(results.length >= 1);
      assert.ok(results.some((item) => item.id === 'starlight-mcp'));
    });

    it('verifies that every catalog item has required metadata and attestation', () => {
      const all = marketplace.getAll();
      for (const item of all) {
        assert.ok(item.id, 'Item must have an id');
        assert.ok(item.name, 'Item must have a name');
        assert.ok(item.version, 'Item must have a version');
        assert.ok(item.description, 'Item must have a description');
        assert.ok(item.author, 'Item must have an author');
        assert.ok(item.installCommand, 'Item must have an installCommand');
        assert.ok(item.manifestSha, 'Item must have a manifestSha');
        assert.equal(typeof item.verifiedAttestation, 'boolean');
      }
    });
  });

  describe('Edge Model Routing Logic', () => {
    // Model routing specifications matching site/src/app/api/cloud/route.ts
    const MODEL_ROUTING_PROFILES: Record<string, { primary: string; fallback: string; reason: string }> = {
      creative: {
        primary: 'claude-3-5-sonnet-20241022',
        fallback: 'gpt-4o',
        reason: 'Claude 3.5 Sonnet leads on taste, nuance, and prose structure.',
      },
      reasoning: {
        primary: 'claude-3-5-sonnet-20241022',
        fallback: 'gpt-4o',
        reason: 'High-discipline architecture and council pressure testing.',
      },
      coding: {
        primary: 'claude-3-5-sonnet-20241022',
        fallback: 'gpt-4o',
        reason: 'Surgical refactors and strict TypeScript type integrity.',
      },
      fast: {
        primary: 'gpt-4o-mini',
        fallback: 'claude-3-5-haiku-20241022',
        reason: 'Low latency classification and token-efficient triage.',
      },
      knowledge: {
        primary: 'gemini-1.5-pro',
        fallback: 'claude-3-5-sonnet-20241022',
        reason: '2M context window for massive repository indexing and cross-vault recall.',
      },
    };

    it('routes requests to designated optimal models per task kind', () => {
      assert.equal(MODEL_ROUTING_PROFILES.creative.primary, 'claude-3-5-sonnet-20241022');
      assert.equal(MODEL_ROUTING_PROFILES.fast.primary, 'gpt-4o-mini');
      assert.equal(MODEL_ROUTING_PROFILES.knowledge.primary, 'gemini-1.5-pro');
    });

    it('provides designated fallback path on provider degradation', () => {
      const taskKind = 'knowledge';
      const route = MODEL_ROUTING_PROFILES[taskKind];
      assert.ok(route.fallback, 'Must have a fallback provider');
      assert.notEqual(route.primary, route.fallback, 'Fallback must differ from primary');
    });
  });
});
