/**
 * Starlight Queen — Terminal Agent Lifecycle Comprehensive Test Suite
 *
 * Covers:
 * - Multi-session inventory across providers (Codex, Claude, OpenCode, Grok, etc.)
 * - Provider capability matrix (visible, transcript readable, graceful stop, force kill)
 * - Safe process tree inspection & dynamic shielding of tool-plane (port 7317) & MCP daemons
 * - Stop safety: dry-run preview, explicit targeting requirement, protection of shared services
 * - Locked and missing transcript recovery (history.jsonl fallback)
 * - Secret redaction engine (PII & API token scrubbing without altering raw transcripts)
 * - Durable repo-aware handover generation and index idempotency
 * - Concrete acceptance case: 2026-10-12 Codex incident replay (01a13098 & 01a12fe8)
 * - Claude continuation prompt generation
 *
 * Built on SIP (Starlight Intelligence Protocol) v1.1.1
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  SecretRedactor,
  ProcessTreeManager,
  AgentDiscoveryRegistry,
  HandoverWriter,
  AgentLifecycleManager,
  CodexProvider,
  ClaudeProvider,
  GenericProvider,
  type ProcessNode,
  type CapturedPromptOutput,
  type TerminalSession,
} from '../src/queen/agent-lifecycle/index.js';

describe('Queen Terminal Agent Lifecycle', () => {
  describe('Secret Redaction Engine', () => {
    it('redacts all classes of API keys, tokens, and secrets', () => {
      const raw = `
Config:
  openai: sk-1234567890abcdef1234567890abcdef1234
  anthropic: sk-ant-api03-abcdefghijklmnopqrstuvwxyz123456789
  github: ghp_1234567890abcdefghijklmnopqrstuvwxyz12
  fine_pat: github_pat_11AABCDEF01234567890123456789012345678901234567890123456789012345678901234
  supabase: sb_secret_1234567890abcdef1234
  aws: AKIAIOSFODNN7EXAMPLE
  header: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
  password: password = "super_secret_master_password_99"
`;
      const res = SecretRedactor.redact(raw);
      assert.ok(res.matchCount >= 7);
      assert.ok(!res.redactedText.includes('sk-1234567890'));
      assert.ok(!res.redactedText.includes('sk-ant-api03'));
      assert.ok(!res.redactedText.includes('ghp_1234567890'));
      assert.ok(!res.redactedText.includes('github_pat_11AABCDEF'));
      assert.ok(!res.redactedText.includes('sb_secret_1234567890'));
      assert.ok(!res.redactedText.includes('AKIAIOSFODNN7EXAMPLE'));
      assert.ok(res.redactedText.includes('[REDACTED_OPENAI_KEY]'));
      assert.ok(res.redactedText.includes('[REDACTED_ANTHROPIC_KEY]'));
      assert.ok(res.redactedText.includes('[REDACTED_GITHUB_TOKEN]'));
      assert.ok(res.redactedText.includes('[REDACTED_SUPABASE_KEY]'));
    });

    it('deeply redacts nested JSON objects without mutating non-secret properties', () => {
      const payload = {
        sessionId: '01a13098-test',
        repo: 'C:/Users/frank/starlight/repos/test',
        authToken: 'sk-ant-testsecrettoken123456789012345',
        nested: {
          clientSecret: 'secret_value_1234567',
          publicPath: '/app/index.ts',
        },
      };

      const sanitized = SecretRedactor.redactDeep(payload);
      assert.equal(sanitized.sessionId, '01a13098-test');
      assert.equal(sanitized.repo, 'C:/Users/frank/starlight/repos/test');
      assert.equal(sanitized.authToken, '[REDACTED_KEY_VALUE]');
      assert.equal(sanitized.nested.clientSecret, '[REDACTED_KEY_VALUE]');
      assert.equal(sanitized.nested.publicPath, '/app/index.ts');
    });
  });

  describe('Process Tree & Safety Shielding', () => {
    it('shields tool-plane processes and their children from termination', () => {
      const processes = new Map<number, ProcessNode>();
      // Tool plane node on port 7317
      processes.set(14552, {
        pid: 14552,
        ppid: 15264,
        name: 'node.exe',
        commandLine: 'node.exe C:/Users/frank/starlight/toolplane/server.mjs',
        isProtected: true,
        protectionReason: 'Active Starlight tool-plane listener (port 7317)',
      });

      // Child MCP server of tool plane
      processes.set(22684, {
        pid: 22684,
        ppid: 14552,
        name: 'node.exe',
        commandLine: 'node.exe C:/Users/frank/starlight/repos/starlight-memory/bin/starlight-memory.mjs',
        isProtected: true,
        protectionReason: 'Child of protected process PID 14552',
      });

      // Session process (target)
      processes.set(8484, {
        pid: 8484,
        ppid: 35852, // parent terminal shell
        name: 'codex.exe',
        commandLine: 'codex.exe run',
        isProtected: false,
      });

      // Child worker of session
      processes.set(29660, {
        pid: 29660,
        ppid: 8484,
        name: 'codex-code-mode-host.exe',
        commandLine: 'codex-code-mode-host.exe --pipe',
        isProtected: false,
      });

      // Shell ancestor
      processes.set(35852, {
        pid: 35852,
        ppid: 1000,
        name: 'ao.exe',
        commandLine: 'ao.exe chat-host',
        isProtected: false,
      });

      // Link children
      processes.get(8484)!.children = [processes.get(29660)!];

      const protectedPids = new Set([14552, 22684]);

      // Refuse stopping a protected PID directly
      assert.throws(
        () => {
          ProcessTreeManager.createStopPlan('tool-plane-sess', 'codex', 14552, processes, protectedPids);
        },
        /SAFETY REFUSAL: Target PID 14552 is protected/
      );

      // Create stop plan for normal session 8484
      const plan = ProcessTreeManager.createStopPlan('sess-8484', 'codex', 8484, processes, protectedPids, {
        dryRun: true,
      });

      assert.deepEqual(plan.targetPids, [8484, 29660]); // Targets session and its child
      assert.ok(plan.ancestorPidsPreserved.includes(35852)); // Ancestor terminal/ao.exe preserved!
      assert.ok(!plan.targetPids.includes(14552)); // Tool plane never targeted
      assert.ok(!plan.targetPids.includes(22684)); // MCP child never targeted
      assert.equal(plan.isDryRun, true);
    });

    it('dry-run executeStop returns preview without sending OS signals', () => {
      const plan = {
        targetSessionId: 'test-session',
        provider: 'codex' as const,
        targetPids: [99998, 99999],
        protectedPidsShielded: [14552],
        ancestorPidsPreserved: [35852],
        commandLines: ['test cmd 1', 'test cmd 2'],
        gracefulMethod: 'wm_close' as const,
        forceRequired: false,
        isDryRun: true,
        authorized: true,
        rationale: 'Dry run test',
      };

      const result = ProcessTreeManager.executeStop(plan);
      assert.equal(result.success, true);
      assert.equal(result.methodUsed, 'dry_run_preview');
      assert.deepEqual(result.stoppedPids, []);
      assert.deepEqual(result.remainingPids, [99998, 99999]);
    });
  });

  describe('Discovery Registry & Provider Matrix', () => {
    it('registers all providers and correctly exposes capability matrix', () => {
      const registry = new AgentDiscoveryRegistry();
      const caps = registry.getProviderCapabilities();

      assert.ok(caps.codex);
      assert.equal(caps.codex.visible, true);
      assert.equal(caps.codex.transcriptReadable, true);
      assert.equal(caps.codex.gracefulStopSupported, true);

      assert.ok(caps.claude);
      assert.equal(caps.claude.visible, true);
      assert.equal(caps.claude.transcriptReadable, true);

      assert.ok(caps.opencode);
      assert.equal(caps.opencode.visible, true);
      assert.equal(caps.opencode.transcriptReadable, true);

      // Grok and Hermes honestly declare lack of local readable transcript
      assert.ok(caps.grok);
      assert.equal(caps.grok.transcriptReadable, false);
      assert.ok(caps.hermes);
      assert.equal(caps.hermes.transcriptReadable, false);
    });

    it('requires explicit targeting and rejects ambiguous prefixes', async () => {
      const registry = new AgentDiscoveryRegistry();
      const mockProvider: any = {
        providerId: 'generic',
        capabilities: { visible: true, transcriptReadable: false, gracefulStopSupported: true, forceTerminationSupported: true },
        discoverSessions: async () => [
          { id: 'alpha-session-001', provider: 'generic', status: 'idle', lastSeen: new Date().toISOString(), capabilities: {} as any },
          { id: 'alpha-session-002', provider: 'generic', status: 'idle', lastSeen: new Date().toISOString(), capabilities: {} as any },
          { id: 'beta-session-003', provider: 'generic', status: 'idle', lastSeen: new Date().toISOString(), capabilities: {} as any },
        ],
      };
      registry.registerProvider(mockProvider);

      // Ambiguous prefix 'alpha' matches 2 sessions -> must throw error
      await assert.rejects(
        async () => {
          await registry.findSession('alpha');
        },
        /AMBIGUOUS TARGETING: Multiple sessions match prefix "alpha"/
      );

      // Non-existent target -> must throw error
      await assert.rejects(
        async () => {
          await registry.findSession('gamma-nonexistent');
        },
        /No session found matching identifier or prefix/
      );

      // Exact target -> succeeds
      const { session } = await registry.findSession('beta-session-003');
      assert.equal(session.id, 'beta-session-003');
    });
  });

  describe('Locked Transcript Handling & History Fallback', () => {
    it('falls back to history.jsonl with explicit partial quality marking if rollout file is missing/locked', async () => {
      const testDir = join(tmpdir(), `starlight-codex-test-${Date.now()}`);
      mkdirSync(testDir, { recursive: true });

      // Create history.jsonl with user prompt
      const historyFile = join(testDir, 'history.jsonl');
      writeFileSync(
        historyFile,
        JSON.stringify({
          timestampEpoch: 1791816676,
          text: 'connect to all open codex sessions, stop them all, save all prompts',
        }) + '\n'
      );

      const provider = new CodexProvider(testDir);
      const capture = await provider.captureSession('non-existent-or-locked-rollout');

      assert.equal(capture.captureStatus, 'partial');
      assert.equal(capture.provenance.transcriptionQuality, 'history_fallback');
      assert.ok(capture.userPrompts.length >= 1);
      assert.equal(capture.userPrompts[0].text, 'connect to all open codex sessions, stop them all, save all prompts');
      assert.ok(capture.missingFields.some((f) => f.includes('Assistant responses unavailable')));

      rmSync(testDir, { recursive: true, force: true });
    });
  });

  describe('Concrete Acceptance Incident: 2026-10-12 Codex Handover Replay', () => {
    it('successfully extracts complete prompts, assistant turns, and tools for incident session 01a13098-24f1-7ec0-bd51-c0a8bf43ccd0', async (t) => {
      const mgr = new AgentLifecycleManager();
      const inventory = await mgr.inspect();
      const match = inventory.sessions.find((s) => s.id.startsWith('01a13098-24f1-7ec0'));
      if (!match) {
        t.skip('Incident session 01a13098-24f1-7ec0 not present in local ~/.codex/sessions environment');
        return;
      }
      const testOut = join(tmpdir(), `incident-01a13098-${Date.now()}`);

      const doc = await mgr.save('01a13098-24f1-7ec0', { out: testOut });

      assert.equal(doc.sessionId, '01a13098-24f1-7ec0-bd51-c0a8bf43ccd0');
      assert.equal(doc.provider, 'codex');
      assert.equal(doc.capture.captureStatus, 'complete');
      assert.equal(doc.capture.provenance.transcriptionQuality, 'native_full');

      // Prompts from incident
      assert.ok(doc.capture.userPrompts.length >= 3);
      const promptTexts = doc.capture.userPrompts.map((p) => p.text).join(' ');
      assert.ok(promptTexts.includes('connect to all open codex sessions, stop them all'));
      assert.ok(promptTexts.includes('why cant youu save all and do more'));
      assert.ok(promptTexts.includes('give prompt for more intelliogent agent'));

      // Assistant turns captured
      assert.ok(doc.capture.assistantResponses.length >= 10);

      // Verify written files
      assert.ok(existsSync(`${testOut}.json`));
      assert.ok(existsSync(`${testOut}.md`));

      const mdContent = readFileSync(`${testOut}.md`, 'utf8');
      assert.ok(mdContent.includes('Claude Continuation Prompt'));
      assert.ok(mdContent.includes('Executive Summary'));
      assert.ok(mdContent.includes('Provenance & Integrity'));

      rmSync(`${testOut}.json`, { force: true });
      rmSync(`${testOut}.md`, { force: true });
    });

    it('successfully extracts prompts and turns for incident session 01a12fe8-ed64-73a2-a83c-1a9539bda915', async (t) => {
      const mgr = new AgentLifecycleManager();
      const inventory = await mgr.inspect();
      const match = inventory.sessions.find((s) => s.id.startsWith('01a12fe8-ed64-73a2'));
      if (!match) {
        t.skip('Incident session 01a12fe8-ed64-73a2 not present in local ~/.codex/sessions environment');
        return;
      }
      const testOut = join(tmpdir(), `incident-01a12fe8-${Date.now()}`);

      const doc = await mgr.save('01a12fe8-ed64-73a2', { out: testOut });

      assert.equal(doc.sessionId, '01a12fe8-ed64-73a2-a83c-1a9539bda915');
      assert.equal(doc.provider, 'codex');
      assert.equal(doc.capture.captureStatus, 'complete');
      assert.ok(doc.capture.userPrompts.length >= 8);
      assert.ok(doc.capture.assistantResponses.length >= 20);

      rmSync(`${testOut}.json`, { force: true });
      rmSync(`${testOut}.md`, { force: true });
    });
  });

  describe('Handover Writer & Claude Continuation Prompt', () => {
    it('generates self-contained Claude continuation prompt without relying on hidden chat context', () => {
      const writer = new HandoverWriter();
      const session: TerminalSession = {
        id: '01a13098-continuation-test',
        provider: 'codex',
        title: 'Stop sessions and save handovers',
        repoRoot: 'C:/Users/frank/starlight/repos/Starlight-Intelligence-System',
        worktree: 'C:/Users/frank/starlight/repos/Starlight-Intelligence-System',
        branch: 'agent/antigravity/npm-ecosystem-alignment',
        status: 'active',
        lastSeen: new Date().toISOString(),
        capabilities: { visible: true, transcriptReadable: true, gracefulStopSupported: true, forceTerminationSupported: true },
      };

      const capture: CapturedPromptOutput = {
        sessionId: session.id,
        provider: 'codex',
        userPrompts: [
          { text: 'build queen capabilities to manage all terminal cli agents', source: 'test' },
        ],
        assistantResponses: [{ text: 'I am implementing the queen agent lifecycle' }],
        toolSummaries: [],
        changedFiles: ['src/queen/agent-lifecycle/types.ts', 'src/queen/agent-lifecycle/lifecycle-manager.ts'],
        testsBuildsRun: ['npm test'],
        pendingWork: [],
        blockers: [],
        resumeInstructions: 'Resume in Starlight repo',
        captureStatus: 'complete',
        missingFields: [],
        provenance: {
          provider: 'codex',
          sessionId: session.id,
          capturedAt: new Date().toISOString(),
          transcriptionQuality: 'native_full',
        },
      };

      const prompt = writer.generateClaudeContinuationPrompt(session, capture);
      assert.ok(prompt.includes('Continue work from CODEX session [01a13098-continuation-test]'));
      assert.ok(prompt.includes('C:/Users/frank/starlight/repos/Starlight-Intelligence-System'));
      assert.ok(prompt.includes('agent/antigravity/npm-ecosystem-alignment'));
      assert.ok(prompt.includes('build queen capabilities to manage all terminal cli agents'));
      assert.ok(prompt.includes('src/queen/agent-lifecycle/types.ts'));
    });

    it('is idempotent when repeatedly saving the same session', () => {
      const testDir = join(tmpdir(), `starlight-handover-test-${Date.now()}`);
      mkdirSync(testDir, { recursive: true });

      const writer = new HandoverWriter({ handoffsDir: testDir });
      const session: TerminalSession = {
        id: 'idempotent-test-01',
        provider: 'codex',
        title: 'Test Session',
        status: 'idle',
        lastSeen: new Date().toISOString(),
        capabilities: { visible: true, transcriptReadable: true, gracefulStopSupported: true, forceTerminationSupported: true },
      };

      const capture: CapturedPromptOutput = {
        sessionId: session.id,
        provider: 'codex',
        userPrompts: [{ text: 'Prompt 1', source: 'test' }],
        assistantResponses: [],
        toolSummaries: [],
        changedFiles: [],
        testsBuildsRun: [],
        pendingWork: [],
        blockers: [],
        resumeInstructions: 'Test instructions',
        captureStatus: 'complete',
        missingFields: [],
        provenance: {
          provider: 'codex',
          sessionId: session.id,
          capturedAt: new Date().toISOString(),
          transcriptionQuality: 'native_full',
        },
      };

      // Save twice
      writer.writeHandover(session, capture);
      writer.writeHandover(session, capture);

      const indexFile = join(testDir, 'HANDOVER-INDEX.json');
      assert.ok(existsSync(indexFile));
      const index = JSON.parse(readFileSync(indexFile, 'utf8'));

      // Must only have 1 entry for this session ID
      const matches = index.filter((e: any) => e.sessionId === session.id);
      assert.equal(matches.length, 1);

      rmSync(testDir, { recursive: true, force: true });
    });
  });
});
