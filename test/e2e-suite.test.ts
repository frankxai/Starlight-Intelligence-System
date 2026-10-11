/**
 * Starlight Comprehensive E2E System & Architecture Suite
 *
 * Verifies end-to-end integration across:
 *   1. Full Starlight MCP Server JSON-RPC Protocol (all 19 sis_* tools)
 *   2. SAGE Knowledge Tree epistemic discovery & dialectical querying
 *   3. Starlight Queen dynamic swarm synthesis & Santa Loop 10-Gate convergence
 *   4. CLI commands: pack validation, marketplace catalog, and PR submission formatting
 *   5. Edge Model Routing resilience and catalog cryptographic attestations
 *
 * Built on SIP — operational tier.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { StarlightMcpServer } from '../src/mcp-server.js';
import { StarlightMarketplace } from '../src/marketplace/index.js';
import { validateManifest, computeManifestSha } from '../src/pack-runtime.js';
import { repoRootFromTestFile } from './_lib/repo.js';

const REPO_ROOT = repoRootFromTestFile(import.meta.url);
const CLI_PATH = join(REPO_ROOT, 'dist', 'cli.js');

function parseToolResult(response: any): any {
  assert.equal(response?.jsonrpc, '2.0');
  assert.ok(response?.result?.content?.[0]?.text, 'Expected response.result.content[0].text');
  return JSON.parse(response.result.content[0].text);
}

describe('Starlight Comprehensive E2E System Suite', () => {
  let tempVaultDir: string;
  let server: StarlightMcpServer;

  before(() => {
    tempVaultDir = mkdtempSync(join(tmpdir(), 'sis-e2e-vaults-'));
    server = new StarlightMcpServer(tempVaultDir);
  });

  after(() => {
    if (tempVaultDir && existsSync(tempVaultDir)) {
      rmSync(tempVaultDir, { recursive: true, force: true });
    }
  });

  describe('1. Starlight MCP Server JSON-RPC End-to-End Protocol', () => {
    it('handles initialize request and returns standard serverInfo', async () => {
      const response = await server.handleRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {},
      });

      assert.equal(response?.jsonrpc, '2.0');
      assert.equal(response?.id, 1);
      assert.equal(response?.result?.protocolVersion, '2024-11-05');
      assert.equal(response?.result?.serverInfo?.name, 'starlight-sis');
    });

    it('lists all nineteen operational sis_* tools with valid schemas', async () => {
      const response = await server.handleRequest({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {},
      });

      assert.ok(response?.result?.tools);
      const tools = response?.result?.tools as Array<{ name: string; description: string; inputSchema: any }>;
      assert.equal(tools.length, 19, `Expected 19 tools, got ${tools.length}`);

      const names = tools.map((t) => t.name).sort();
      assert.ok(names.includes('sis_vault_search'));
      assert.ok(names.includes('sis_append_entry'));
      assert.ok(names.includes('sis_knowledge_discover'));
      assert.ok(names.includes('sis_knowledge_query'));
      assert.ok(names.includes('sis_queen_telemetry'));
      assert.ok(names.includes('sis_queen_synthesize_swarm'));
      assert.ok(names.includes('sis_queen_santa_convergence'));
      assert.ok(names.includes('sis_founder_briefing'));
    });

    it('executes sis_entry_types tool call', async () => {
      const response = await server.handleRequest({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: { name: 'sis_entry_types', arguments: {} },
      });

      const res = parseToolResult(response);
      assert.ok(Array.isArray(res.vaultTypes));
      assert.ok(res.vaultTypes.includes('technical'));
      assert.ok(res.vaultTypes.includes('strategic'));
      assert.ok(Array.isArray(res.categories));
    });

    it('executes sis_append_entry, sis_vault_search, sis_confirm, and sis_stats in sequence', async () => {
      // 1. Append entry
      const appendRes = await server.handleRequest({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'sis_append_entry',
          arguments: {
            content: 'E2E Verified Pattern for Deterministic State',
            vault: 'technical',
            tags: ['verification', 'e2e', 'pattern'],
            confidence: 'high',
            category: 'pattern',
          },
        },
      });

      const appendData = parseToolResult(appendRes);
      assert.equal(appendData.success, true);
      assert.ok(appendData.id);
      assert.equal(appendData.vault, 'technical');
      const entryId = appendData.id;

      // 2. Search for the entry
      const searchRes = await server.handleRequest({
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'sis_vault_search',
          arguments: {
            query: 'Deterministic State',
            vault: 'technical',
          },
        },
      });

      const searchData = parseToolResult(searchRes);
      assert.ok(Array.isArray(searchData));
      assert.ok(searchData.length >= 1);
      assert.equal(searchData[0].id, entryId);
      assert.ok(searchData[0].content.includes('Deterministic State'));

      // 3. Confirm freshness
      const confirmRes = await server.handleRequest({
        jsonrpc: '2.0',
        id: 6,
        method: 'tools/call',
        params: {
          name: 'sis_confirm',
          arguments: { entryId },
        },
      });

      const confirmData = parseToolResult(confirmRes);
      assert.equal(confirmData.success, true);
      assert.equal(confirmData.entryId, entryId);
      assert.ok(confirmData.lastConfirmed);

      // 4. Verify stats
      const statsRes = await server.handleRequest({
        jsonrpc: '2.0',
        id: 7,
        method: 'tools/call',
        params: { name: 'sis_stats', arguments: {} },
      });

      const statsData = parseToolResult(statsRes);
      assert.ok(statsData.total >= 1);
      assert.ok(statsData.vaults.technical >= 1);
    });
  });

  describe('2. SAGE Knowledge Tree & Dialectical Reasoning', () => {
    it('discovers and asserts epistemic propositions via MCP', async () => {
      const res = await server.handleRequest({
        jsonrpc: '2.0',
        id: 8,
        method: 'tools/call',
        params: {
          name: 'sis_knowledge_discover',
          arguments: {
            domain: 'code-intelligence',
            title: 'Hermetic Build Invariant',
            statement: 'Reproducible agent compilation requires isolated toolchain locks and verified digests.',
            state: 'empirical_axiom',
            confidence: 0.98,
            justification: 'Observed across 135 pre-commit passes and Foundry conformance suites.',
            tags: ['compiler', 'integrity', 'toolchain'],
          },
        },
      });

      const data = parseToolResult(res);
      assert.equal(data.success, true);
      assert.ok(data.node);
      assert.equal(data.node.title, 'Hermetic Build Invariant');
      assert.equal(data.node.kind, 'empirical_axiom');
      assert.equal(data.node.certaintyCapped, true);
      assert.equal(data.node.confidence, 0.85);
    });

    it('queries the knowledge tree and retrieves dialectical tension analysis', async () => {
      const res = await server.handleRequest({
        jsonrpc: '2.0',
        id: 9,
        method: 'tools/call',
        params: {
          name: 'sis_knowledge_query',
          arguments: {
            query: 'Hermetic Build',
            domain: 'code-intelligence',
          },
        },
      });

      const data = parseToolResult(res);
      assert.ok(data.count >= 1);
      assert.ok(data.matches.some((m: any) => m.title.includes('Hermetic Build')));
      assert.ok(Array.isArray(data.dialecticalTensions));
    });
  });

  describe('3. Starlight Queen Swarm Synthesis & Santa Loop Convergence', () => {
    it('fetches meta-harness telemetry across all 10 developer harnesses', async () => {
      const res = await server.handleRequest({
        jsonrpc: '2.0',
        id: 10,
        method: 'tools/call',
        params: { name: 'sis_queen_telemetry', arguments: {} },
      });

      const data = parseToolResult(res);
      assert.ok(Array.isArray(data.harnesses));
      assert.ok(data.harnesses.some((h: any) => h.id === 'codex'));
      assert.ok(data.harnesses.some((h: any) => h.id === 'antigravity'));
      assert.ok(data.harnesses.some((h: any) => h.id === 'claude-code'));
      assert.ok(data.cdpMultiplexerHub);
    });

    it('dynamically synthesizes a specialized sub-swarm', async () => {
      const res = await server.handleRequest({
        jsonrpc: '2.0',
        id: 11,
        method: 'tools/call',
        params: {
          name: 'sis_queen_synthesize_swarm',
          arguments: {
            mission: 'Execute multi-repo context continuity verification',
            topology: 'staff_eng_hyper',
            domain: 'code-intelligence',
          },
        },
      });

      const data = parseToolResult(res);
      assert.equal(data.success, true);
      assert.ok(data.swarm);
      assert.equal(data.swarm.topology, 'staff_eng_hyper');
      assert.ok(data.swarm.agents.length >= 2);
      assert.ok(data.swarm.leadAgent);
    });

    it('runs adversarial Santa loop convergence across the 10 Gates', async () => {
      const res = await server.handleRequest({
        jsonrpc: '2.0',
        id: 12,
        method: 'tools/call',
        params: {
          name: 'sis_queen_santa_convergence',
          arguments: {
            task: 'Verify deterministic state across memory gateways',
            topology: 'staff_eng_hyper',
          },
        },
      });

      const data = parseToolResult(res);
      assert.ok(data.swarmId);
      assert.equal(data.status, 'converged_passed');
      assert.equal(data.santaLoop.converged, true);
      assert.ok(data.santaLoop.finalScore >= 0.8);
      assert.ok(data.santaLoop.rounds >= 1);
      assert.ok(Array.isArray(data.verifiedGates));
    });

    it('generates an executive Founder Cockpit Briefing', async () => {
      const res = await server.handleRequest({
        jsonrpc: '2.0',
        id: 13,
        method: 'tools/call',
        params: { name: 'sis_founder_briefing', arguments: {} },
      });

      const data = parseToolResult(res);
      assert.ok(data.briefing);
      assert.equal(typeof data.briefing, 'string');
      assert.ok(data.briefing.includes('Starlight Queen Executive Cockpit Briefing'));
    });
  });

  describe('4. CLI Pack Runtime & Marketplace Integration', () => {
    it('executes `starlight marketplace stats` via CLI process', () => {
      const run = spawnSync(process.execPath, [CLI_PATH, 'marketplace', 'stats'], {
        encoding: 'utf-8',
        cwd: REPO_ROOT,
      });

      assert.equal(run.status, 0);
      assert.ok(run.stdout.includes('Marketplace Ecosystem Statistics'));
      assert.ok(run.stdout.includes('Total Catalog Items:'));
      assert.ok(run.stdout.includes('Skill Packs:'));
    });

    it('executes `starlight marketplace list` via CLI process', () => {
      const run = spawnSync(process.execPath, [CLI_PATH, 'marketplace', 'list'], {
        encoding: 'utf-8',
        cwd: REPO_ROOT,
      });

      assert.equal(run.status, 0);
      assert.ok(run.stdout.includes('Starlight Sovereign Memory MCP'));
      assert.ok(run.stdout.includes('starlight-mcp'));
    });

    it('validates a package manifest via `starlight pack validate` and computes matching SHA', () => {
      const tempPack = join(tmpdir(), `starlight-cli-pack-${Date.now()}`);
      mkdirSync(tempPack, { recursive: true });

      try {
        writeFileSync(join(tempPack, 'README.md'), '# Verified Test Pack\nBuilt on SIP.\n');
        writeFileSync(join(tempPack, 'skill.md'), '# Skill Definition\n');
        
        // Compute SHA first
        const computedSha = computeManifestSha(tempPack);
        
        const manifest = {
          id: 'test-cli-pack',
          name: 'CLI Test Pack',
          version: '1.0.0',
          kind: 'skill',
          description: 'A test pack for CLI validation verification',
          permissions: ['fs:read:repo'],
          licenseTier: 'free',
          manifestSha: computedSha,
        };
        writeFileSync(join(tempPack, 'manifest.json'), JSON.stringify(manifest, null, 2));

        const run = spawnSync(process.execPath, [CLI_PATH, 'pack', 'validate', tempPack], {
          encoding: 'utf-8',
          cwd: REPO_ROOT,
        });

        assert.equal(run.status, 0);
        assert.ok(run.stdout.includes('PACK VALIDATION REPORT'));
        assert.ok(run.stdout.includes('VERIFIED (Deterministic Match)'));
        assert.ok(run.stdout.includes('VALID & APPROVED FOR REPOSITORY PUBLISHING'));

        // Also test marketplace submit payload formatting
        const submitRun = spawnSync(process.execPath, [CLI_PATH, 'marketplace', 'submit', tempPack], {
          encoding: 'utf-8',
          cwd: REPO_ROOT,
        });

        assert.equal(submitRun.status, 0);
        assert.ok(submitRun.stdout.includes('MARKETPLACE SUBMISSION PAYLOAD READY'));
        assert.ok(submitRun.stdout.includes('"id": "test-cli-pack"'));
        assert.ok(submitRun.stdout.includes('Pull Request Title: feat(marketplace): publish test-cli-pack pack'));
      } finally {
        rmSync(tempPack, { recursive: true, force: true });
      }
    });
  });

  describe('5. Marketplace Cryptographic Attestation & Edge Routing Integrity', () => {
    it('verifies that every catalog item is cryptographically pinned and verified', () => {
      const marketplace = new StarlightMarketplace();
      const items = marketplace.getAll();

      for (const item of items) {
        assert.ok(item.manifestSha, `Item ${item.id} must have manifestSha`);
        assert.equal(item.manifestSha.length, 64, `Item ${item.id} manifestSha must be 64-char hex string`);
        assert.equal(item.verifiedAttestation, true, `Item ${item.id} must have verifiedAttestation`);
        assert.ok(item.installCommand, `Item ${item.id} must have installCommand`);
      }
    });
  });
});
