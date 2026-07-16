/**
 * SIS MCP Server v0.1 — Track B
 *
 * 21 sis.* tools composing on top of Track A's contracts (src/types.ts) and
 * ledgers (src/ledgers.ts). The sis.* prefix avoids collision with the v6
 * vault-focused sis_* server and the substrate-registry starlight_* server.
 *
 * Tool surface:
 *   sis.memory.add            sis.memory.search        sis.memory.health
 *   sis.memory.eval
 *   sis.project.context       sis.repo.context
 *   sis.decision.log          sis.workpacket.create
 *   sis.agent.event           sis.artifact.register
 *   sis.graph.neighbors       sis.council.review
 *   sis.vault.record          sis.pack.list
 *   sis.pack.install          sis.pack.uninstall
 *   sis.events.tail           sis.workpacket.next
 *   sis.workpacket.complete   sis.memory.rebuild
 *   sis.module.list
 *
 * Invariants:
 *   • Risk-tiered approval gate (decision.log / workpacket.create at high/critical)
 *     opens a pending ApprovalGate row and refuses persistence of the underlying
 *     Decision / WorkPacket. There is no DEMO_MODE override.
 *   • sis.graph.neighbors REFUSES to return results if any matched row is
 *     missing/empty evidenceRef — substrate invariant.
 *   • sis.pack.install rejects when pack declares any Permission and
 *     permissions_acked != true.
 *   • sis.project.context output is sanitized via SanitizationGateway before
 *     return (PII + secrets).
 *
 * Built on SIP — operational tier
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import {
  AgentOpsLedger,
  appendAgentEvent,
  appendApprovalGate,
  appendArtifact,
  appendCouncilReview,
  appendDecision,
  appendWorkPacket,
  ensureDir,
  newId,
  nowIso,
  readRecentAgentEvents,
  readGraphEdges,
  vaultLoopLedgerPath,
} from './ledgers.js';
import { listModules } from './modules.js';
import { inspectMemoryHealth } from './memory-health.js';
import { runMemoryEval, type MemoryEvalResult } from './memory-eval.js';
import {
  installPack as runtimeInstallPack,
  listPacks as runtimeListPacks,
  uninstallPack as runtimeUninstallPack,
} from './pack-runtime.js';
import { SanitizationGateway } from './sanitization.js';
import { VaultMemory } from './vault-memory.js';
import { appendFileSync } from 'node:fs';
import type {
  AgentEvent,
  ApprovalGate,
  Artifact,
  AttestationStatus,
  CouncilReview,
  CouncilReviewPerspectives,
  Decision,
  Pack,
  PackKind,
  Permission,
  RiskLevel,
  VaultType,
  WorkPacket,
} from './types.js';

// ── MCP types ─────────────────────────────────────────────────

export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

type ToolHandler = (params: Record<string, unknown>) => unknown;

interface RegisteredTool {
  definition: McpTool;
  handler: ToolHandler;
}

// ── Validation ────────────────────────────────────────────────

interface MinimalSchema {
  type?: string;
  required?: string[];
  properties?: Record<string, MinimalSchema>;
  enum?: string[];
  items?: MinimalSchema;
}

/** Validate inputs against a minimal subset of JSON Schema. */
function validateInput(
  params: Record<string, unknown>,
  schema: MinimalSchema,
): string[] {
  const errors: string[] = [];
  for (const key of schema.required ?? []) {
    if (params[key] === undefined || params[key] === null) {
      errors.push(`missing required: ${key}`);
      continue;
    }
    const propSchema = schema.properties?.[key];
    if (!propSchema) continue;
    const value = params[key];
    const actual = Array.isArray(value) ? 'array' : typeof value;
    if (propSchema.type && actual !== propSchema.type) {
      errors.push(`invalid type for ${key}: expected ${propSchema.type}, got ${actual}`);
      continue;
    }
    if (propSchema.enum && typeof value === 'string' && !propSchema.enum.includes(value)) {
      errors.push(`invalid enum for ${key}: ${value}`);
    }
  }
  return errors;
}

// ── Constants ─────────────────────────────────────────────────

const RISK_LEVELS: RiskLevel[] = ['low', 'medium', 'high', 'critical'];
const PACK_KINDS: PackKind[] = ['prompt', 'skill', 'agent', 'knowledge', 'claw', 'white-label'];
const VAULT_TYPES_ENUM = ['strategic', 'technical', 'creative', 'operational', 'wisdom', 'horizon'];
const VAULT_LOOP_KINDS = [
  'desire', 'gratitude', 'visualization', 'surrender',
  'intuition', 'aligned_action', 'evidence', 'outcome', 'proof',
];

// ── Error envelope ────────────────────────────────────────────

interface ErrorResult {
  ok: false;
  error: string;
}

function errorResult(message: string): ErrorResult {
  return { ok: false, error: message };
}

// ── Server ────────────────────────────────────────────────────

export interface SisMcpServerOptions {
  /** Repo root for ledger writes — defaults to process.cwd(). */
  repoRoot?: string;
  /** Vault directory for sis.memory.* tools. */
  vaultStoragePath?: string;
  /** Sanitization gateway override (mostly for tests). */
  sanitizer?: SanitizationGateway;
}

export class SisMcpServerV01 {
  private tools = new Map<string, RegisteredTool>();
  private readonly repoRoot: string;
  private readonly sanitizer: SanitizationGateway;
  private readonly vault: VaultMemory;

  constructor(options: SisMcpServerOptions = {}) {
    this.repoRoot = options.repoRoot ?? process.cwd();
    this.sanitizer = options.sanitizer ?? new SanitizationGateway();
    this.vault = new VaultMemory({
      storagePath: options.vaultStoragePath ?? join(this.repoRoot, '.starlight'),
    });
    this.vault.load();
    ensureDir(join(this.repoRoot, 'memory', '_audit'));
    this.registerTools();
  }

  /** Expose registered tool definitions (for tools/list + tests). */
  listTools(): McpTool[] {
    return Array.from(this.tools.values()).map((t) => t.definition);
  }

  /** Invoke a tool by name; never throws — returns error envelope instead. */
  call(name: string, params: Record<string, unknown> = {}): unknown {
    const tool = this.tools.get(name);
    if (!tool) return errorResult(`Unknown tool: ${name}`);
    const errors = validateInput(params, tool.definition.inputSchema as MinimalSchema);
    if (errors.length > 0) {
      return errorResult(`Invalid input: ${errors.join('; ')}`);
    }
    try {
      return tool.handler(params);
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err));
    }
  }

  /**
   * Alias for `call()` — preserves the Track D / Stretch E test API.
   * Both `server.call('tool', params)` and `server.callTool('tool', params)` work.
   */
  callTool(name: string, params: Record<string, unknown> = {}): unknown {
    return this.call(name, params);
  }

  private reg(def: McpTool, handler: ToolHandler): void {
    this.tools.set(def.name, { definition: def, handler });
  }

  private registerTools(): void {
    this.regMemoryAdd();
    this.regMemorySearch();
    this.regMemoryHealth();
    this.regMemoryEval();
    this.regProjectContext();
    this.regRepoContext();
    this.regDecisionLog();
    this.regAgentEvent();
    this.regArtifactRegister();
    this.regGraphNeighbors();
    this.regWorkPacketCreate();
    this.regCouncilReview();
    this.regVaultRecord();
    this.regPackList();
    this.regPackInstall();
    this.regPackUninstall();
    this.regEventsTail();
    this.regWorkPacketNext();
    this.regWorkPacketComplete();
    this.regMemoryRebuild();
    this.regModuleList();
  }

  // 1 ── sis.memory.add ──────────────────────────────────────

  private regMemoryAdd(): void {
    this.reg(
      {
        name: 'sis.memory.add',
        description: 'Add an entry to a Starlight vault (auto-classified if no vault given)',
        inputSchema: {
          type: 'object',
          required: ['content'],
          properties: {
            content: { type: 'string' },
            vault: { type: 'string', enum: VAULT_TYPES_ENUM },
            tags: { type: 'array' },
            confidence: { type: 'number' },
            source: { type: 'string' },
          },
        },
      },
      (p) => {
        const content = String(p.content);
        const vault = p.vault ? (String(p.vault) as VaultType) : undefined;
        const tags = Array.isArray(p.tags) ? p.tags.map(String) : [];
        const confidence = typeof p.confidence === 'number' ? p.confidence : 0.5;
        const source = p.source ? String(p.source) : undefined;
        const entry = this.vault.rememberInVault(content, vault, tags, confidence, source);
        return { ok: true as const, entry };
      },
    );
  }

  // 2 ── sis.memory.search ───────────────────────────────────

  private regMemorySearch(): void {
    this.reg(
      {
        name: 'sis.memory.search',
        description: 'Search Starlight vaults with optional vault-type filter',
        inputSchema: {
          type: 'object',
          required: ['query'],
          properties: {
            query: { type: 'string' },
            vaults: { type: 'array' },
            limit: { type: 'number' },
            minConfidence: { type: 'number' },
            include_private: { type: 'boolean' },
            retrieval_mode: { type: 'string', enum: ['lexical', 'hybrid'] },
          },
        },
      },
      (p) => {
        const query = String(p.query);
        const vaults = Array.isArray(p.vaults) ? (p.vaults.map(String) as VaultType[]) : undefined;
        const limit = typeof p.limit === 'number' ? p.limit : 10;
        const minConfidence = typeof p.minConfidence === 'number' ? p.minConfidence : 0;
        const includePrivate = p.include_private === true;
        const retrievalMode = p.retrieval_mode === 'lexical' ? 'lexical' : 'hybrid';
        const results = this.vault.searchVaults({
          query,
          vaults,
          limit,
          minConfidence,
          includePrivate,
          retrievalMode,
        });
        return { ok: true as const, retrievalMode, results };
      },
    );
  }

  // 3 ── sis.memory.health ─────────────────────────────────

  private regMemoryHealth(): void {
    this.reg(
      {
        name: 'sis.memory.health',
        description: 'Report SIS memory corpus, vault, and substrate health',
        inputSchema: { type: 'object', properties: {} },
      },
      () => ({ ok: true as const, health: this.memoryHealth() }),
    );
  }

  // 4 ── sis.memory.eval ───────────────────────────────────

  private regMemoryEval(): void {
    this.reg(
      {
        name: 'sis.memory.eval',
        description: 'Run a lightweight memory retrieval eval against the live sovereign corpus',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number' },
          },
        },
      },
      (p) => {
        const limit = typeof p.limit === 'number' ? p.limit : 50;
        return { ok: true as const, eval: this.memoryEval(limit) };
      },
    );
  }

  // 3 ── sis.project.context ─────────────────────────────────

  private regProjectContext(): void {
    this.reg(
      {
        name: 'sis.project.context',
        description: 'Capture git repo context (branch, HEAD, status, recent commits) — sanitized',
        inputSchema: {
          type: 'object',
          required: ['project_root'],
          properties: {
            project_root: { type: 'string' },
          },
        },
      },
      (p) => {
        const projectRoot = String(p.project_root);
        if (!existsSync(projectRoot)) {
          return errorResult(`project_root does not exist: ${projectRoot}`);
        }
        const context = this.captureGitContext(projectRoot);
        const raw = JSON.stringify(context);
        const sanitized = this.sanitizer.sanitize(raw);
        return { ok: true as const, context: JSON.parse(sanitized) as typeof context };
      },
    );
  }

  // 4 ── sis.repo.context ────────────────────────────────────

  private regRepoContext(): void {
    this.reg(
      {
        name: 'sis.repo.context',
        description: 'Like sis.project.context but accepts an optional remote_url (recorded, not fetched)',
        inputSchema: {
          type: 'object',
          required: ['project_root'],
          properties: {
            project_root: { type: 'string' },
            remote_url: { type: 'string' },
          },
        },
      },
      (p) => {
        const projectRoot = String(p.project_root);
        const remoteUrl = p.remote_url ? String(p.remote_url) : null;
        if (!existsSync(projectRoot)) {
          return errorResult(`project_root does not exist: ${projectRoot}`);
        }
        const context = this.captureGitContext(projectRoot);
        const raw = JSON.stringify({ ...context, remote_url: remoteUrl });
        const sanitized = this.sanitizer.sanitize(raw);
        return { ok: true as const, context: JSON.parse(sanitized) as Record<string, unknown> };
      },
    );
  }

  private captureGitContext(projectRoot: string): {
    repo: string;
    branch: string;
    head: string;
    status_summary: string;
    recent_commits: string[];
  } {
    const gitArgs = (args: string[]): string => {
      try {
        return execFileSync('git', args, {
          cwd: projectRoot,
          encoding: 'utf-8',
          stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
      } catch {
        return '';
      }
    };
    const branch = gitArgs(['rev-parse', '--abbrev-ref', 'HEAD']) || 'unknown';
    const head = gitArgs(['rev-parse', 'HEAD']) || 'unknown';
    const status = gitArgs(['status', '--porcelain']);
    const statusSummary = status
      ? `${status.split('\n').filter(Boolean).length} changed`
      : 'clean';
    const log = gitArgs(['log', '--oneline', '-n', '5']);
    const recentCommits = log ? log.split('\n').filter(Boolean) : [];
    return {
      repo: projectRoot,
      branch,
      head,
      status_summary: statusSummary,
      recent_commits: recentCommits,
    };
  }

  // 5 ── sis.decision.log ────────────────────────────────────

  private regDecisionLog(): void {
    this.reg(
      {
        name: 'sis.decision.log',
        description: 'Log a Decision; risk≥high opens an ApprovalGate and refuses persistence',
        inputSchema: {
          type: 'object',
          required: ['title', 'context', 'options', 'chosen', 'rationale', 'risk_level'],
          properties: {
            title: { type: 'string' },
            context: { type: 'string' },
            options: { type: 'array' },
            chosen: { type: 'string' },
            rationale: { type: 'string' },
            risk_level: { type: 'string', enum: RISK_LEVELS },
          },
        },
      },
      (p) => {
        const riskLevel = String(p.risk_level) as RiskLevel;
        if (riskLevel === 'high' || riskLevel === 'critical') {
          // H3: capture the full Decision payload as pendingContext so the audit
          // trail shows what was asked, even though no Decision row was persisted.
          const gate = this.openApprovalGate(
            riskLevel,
            'Decision log gated at high/critical risk',
            { kind: 'decision', payload: { ...p } }
          );
          return {
            status: 'approval_required' as const,
            approvalGateId: gate.id,
            riskLevel,
            reason: 'Decision log refused at high/critical risk; approval gate opened',
          };
        }
        const decision: Decision = {
          id: newId('dec'),
          title: String(p.title),
          context: String(p.context),
          options: Array.isArray(p.options) ? p.options.map(String) : [],
          chosen: String(p.chosen),
          rationale: String(p.rationale),
          riskLevel,
          createdAt: nowIso(),
          createdBy: 'sis-mcp-v01',
        };
        const write = appendDecision(this.repoRoot, decision);
        if (!write.ok) return errorResult(write.error ?? 'Decision append failed');
        return { ok: true as const, decision };
      },
    );
  }

  // 6 ── sis.agent.event ─────────────────────────────────────

  private regAgentEvent(): void {
    this.reg(
      {
        name: 'sis.agent.event',
        description: 'Append an AgentEvent to today\'s agent-events ledger',
        inputSchema: {
          type: 'object',
          required: ['run_id', 'agent_id', 'event_type'],
          properties: {
            run_id: { type: 'string' },
            agent_id: { type: 'string' },
            event_type: { type: 'string' },
            summary: { type: 'string' },
            tools_used: { type: 'array' },
            input_refs: { type: 'array' },
            output_refs: { type: 'array' },
            decisions_created: { type: 'array' },
            artifacts_created: { type: 'array' },
            risk_level: { type: 'string', enum: RISK_LEVELS },
            cost_estimate: { type: 'number' },
          },
        },
      },
      (p) => {
        const event: AgentEvent = {
          id: newId('evt'),
          runId: String(p.run_id),
          agentId: String(p.agent_id),
          eventType: String(p.event_type),
          summary: p.summary ? String(p.summary) : '',
          toolsUsed: Array.isArray(p.tools_used) ? p.tools_used.map(String) : [],
          inputRefs: Array.isArray(p.input_refs) ? p.input_refs.map(String) : [],
          outputRefs: Array.isArray(p.output_refs) ? p.output_refs.map(String) : [],
          decisionsCreated: Array.isArray(p.decisions_created) ? p.decisions_created.map(String) : [],
          artifactsCreated: Array.isArray(p.artifacts_created) ? p.artifacts_created.map(String) : [],
          riskLevel: (p.risk_level as RiskLevel | undefined) ?? 'low',
          costEstimate: typeof p.cost_estimate === 'number' ? p.cost_estimate : 0,
          timestamp: nowIso(),
        };
        const write = appendAgentEvent(this.repoRoot, event);
        if (!write.ok) return errorResult(write.error ?? 'AgentEvent append failed');
        return { ok: true as const, event };
      },
    );
  }

  // 7 ── sis.artifact.register ───────────────────────────────

  private regArtifactRegister(): void {
    this.reg(
      {
        name: 'sis.artifact.register',
        description: 'Register an Artifact with attestation status (local files checked for "Built on SIP")',
        inputSchema: {
          type: 'object',
          required: ['kind', 'uri', 'sha256', 'created_by'],
          properties: {
            kind: { type: 'string' },
            uri: { type: 'string' },
            sha256: { type: 'string' },
            created_by: { type: 'string' },
          },
        },
      },
      (p) => {
        const uri = String(p.uri);
        const attestation = this.checkAttestation(uri);
        const artifact: Artifact = {
          id: newId('art'),
          kind: String(p.kind),
          uri,
          sha256: String(p.sha256),
          createdBy: String(p.created_by),
          createdAt: nowIso(),
          attestation,
        };
        const write = appendArtifact(this.repoRoot, artifact);
        if (!write.ok) return errorResult(write.error ?? 'Artifact append failed');
        return { ok: true as const, artifact };
      },
    );
  }

  private checkAttestation(uri: string): AttestationStatus {
    const isRemote = /^[a-z]+:\/\//i.test(uri) && !uri.startsWith('file://');
    if (isRemote) return 'unattested';
    const localPath = uri.startsWith('file://') ? uri.slice(7) : uri;
    try {
      if (!existsSync(localPath)) return 'unattested';
      if (!statSync(localPath).isFile()) return 'unattested';
      const contents = readFileSync(localPath, 'utf-8');
      return contents.includes('Built on SIP') ? 'sip-attested' : 'unattested';
    } catch {
      return 'unattested';
    }
  }

  // 8 ── sis.graph.neighbors ─────────────────────────────────

  private regGraphNeighbors(): void {
    this.reg(
      {
        name: 'sis.graph.neighbors',
        description: 'List graph edges touching an entity; REFUSES if any matched row lacks evidenceRef',
        inputSchema: {
          type: 'object',
          required: ['entity_id'],
          properties: {
            entity_id: { type: 'string' },
            edge_type: { type: 'string' },
            depth: { type: 'number' },
            limit: { type: 'number' },
          },
        },
      },
      (p) => {
        const entityId = String(p.entity_id);
        const edgeType = p.edge_type ? String(p.edge_type) : null;
        const limit = typeof p.limit === 'number' ? p.limit : 50;
        const all = readGraphEdges(this.repoRoot);

        // Build candidate set BEFORE filtering for malformed.
        const candidates = all.filter((e) => {
          if (!e || typeof e !== 'object') return false;
          if (e.source !== entityId && e.target !== entityId) return false;
          if (edgeType && e.edgeType !== edgeType) return false;
          return true;
        });

        // Substrate invariant: REFUSE the entire result if any matched row is malformed.
        for (const edge of candidates) {
          if (
            !edge.evidenceRef ||
            typeof edge.evidenceRef !== 'string' ||
            !edge.evidenceRef.trim()
          ) {
            return errorResult(
              'Refusing graph.neighbors: at least one matched edge is missing evidenceRef (substrate invariant)',
            );
          }
        }

        const edges = candidates.slice(0, limit);
        return { ok: true as const, edges };
      },
    );
  }

  // 9 ── sis.workpacket.create ───────────────────────────────

  private regWorkPacketCreate(): void {
    this.reg(
      {
        name: 'sis.workpacket.create',
        description: 'Create a WorkPacket; risk≥high opens an ApprovalGate and refuses persistence',
        inputSchema: {
          type: 'object',
          required: ['title', 'mission', 'allowed_tools', 'allowed_paths', 'risk_level'],
          properties: {
            title: { type: 'string' },
            mission: { type: 'string' },
            allowed_tools: { type: 'array' },
            allowed_paths: { type: 'array' },
            risk_level: { type: 'string', enum: RISK_LEVELS },
          },
        },
      },
      (p) => {
        const riskLevel = String(p.risk_level) as RiskLevel;
        if (riskLevel === 'high' || riskLevel === 'critical') {
          // H3: capture the full WorkPacket payload as pendingContext so the
          // audit trail shows what was asked, even though no WorkPacket row
          // was persisted.
          const gate = this.openApprovalGate(
            riskLevel,
            'WorkPacket gated at high/critical risk',
            { kind: 'workpacket', payload: { ...p } }
          );
          return {
            status: 'approval_required' as const,
            approvalGateId: gate.id,
            riskLevel,
            reason: 'WorkPacket creation refused at high/critical risk; approval gate opened',
          };
        }
        const packet: WorkPacket = {
          id: newId('wp'),
          title: String(p.title),
          mission: String(p.mission),
          contextRefs: [],
          requiredOutputs: [],
          allowedTools: Array.isArray(p.allowed_tools) ? p.allowed_tools.map(String) : [],
          allowedPaths: Array.isArray(p.allowed_paths) ? p.allowed_paths.map(String) : [],
          forbiddenActions: [],
          riskLevel,
          approvalRequired: false,
          assignedAgent: 'unassigned',
          status: 'pending',
          events: [],
          artifacts: [],
          costEstimate: 0,
          createdAt: nowIso(),
        };
        const write = appendWorkPacket(this.repoRoot, packet);
        if (!write.ok) return errorResult(write.error ?? 'WorkPacket append failed');
        return { ok: true as const, workPacket: packet };
      },
    );
  }

  /**
   * Open a pending ApprovalGate for a refused high/critical action.
   *
   * H3 fix (2026-05-12): persist `reason` (was silently discarded as `_reason`)
   * + `pendingContext` so the audit trail answers "what was being approved?"
   * without needing the (refused) Decision/WorkPacket row.
   */
  private openApprovalGate(
    riskLevel: RiskLevel,
    reason: string,
    pendingContext?: ApprovalGate['pendingContext']
  ): ApprovalGate {
    // For workpacket gates, encode a short title hint into workPacketId so the
    // ledger row is greppable without needing to read pendingContext.
    const titleHint =
      pendingContext?.kind === 'workpacket' && typeof pendingContext.payload.title === 'string'
        ? String(pendingContext.payload.title).slice(0, 60).replace(/[^a-zA-Z0-9 _-]/g, '')
        : null;

    const gate: ApprovalGate = {
      id: newId('gate'),
      workPacketId: titleHint ? `<pending:${titleHint}>` : '',
      requestedAt: nowIso(),
      status: 'pending',
      riskLevel,
      reason,
      pendingContext,
    };
    appendApprovalGate(this.repoRoot, gate);
    return gate;
  }

  // 10 ── sis.council.review ─────────────────────────────────

  private regCouncilReview(): void {
    this.reg(
      {
        name: 'sis.council.review',
        description: 'Persist a 7-perspective council review; returns an empty template if no perspectives given',
        inputSchema: {
          type: 'object',
          required: ['decision_id_or_workpacket_id'],
          properties: {
            decision_id_or_workpacket_id: { type: 'string' },
            perspectives_input: { type: 'object' },
          },
        },
      },
      (p) => {
        const targetId = String(p.decision_id_or_workpacket_id);
        if (!p.perspectives_input) {
          const empty: CouncilReviewPerspectives = {
            elderFather: '',
            elderMother: '',
            sage: '',
            builderElder: '',
            shadowWitness: '',
            divineNeutralWitness: '',
            futureSelf90: '',
          };
          return {
            ok: true as const,
            template: true as const,
            perspectives: empty,
            convergence: '',
            conflict: '',
            redLines: [] as string[],
            cleanestPath: '',
            oneNextMove: '',
            reviewDate: '',
          };
        }
        const persp = p.perspectives_input as Record<string, unknown>;
        const review: CouncilReview = {
          id: newId('cr'),
          workPacketId: targetId.startsWith('wp_') ? targetId : undefined,
          decisionId: targetId.startsWith('dec_') ? targetId : undefined,
          decision: String(persp.decision ?? ''),
          context: String(persp.context ?? ''),
          perspectives: {
            elderFather: String(persp.elderFather ?? ''),
            elderMother: String(persp.elderMother ?? ''),
            sage: String(persp.sage ?? ''),
            builderElder: String(persp.builderElder ?? ''),
            shadowWitness: String(persp.shadowWitness ?? ''),
            divineNeutralWitness: String(persp.divineNeutralWitness ?? ''),
            futureSelf90: String(persp.futureSelf90 ?? ''),
          },
          convergence: String(persp.convergence ?? ''),
          conflict: String(persp.conflict ?? ''),
          redLines: Array.isArray(persp.redLines) ? persp.redLines.map(String) : [],
          cleanestPath: String(persp.cleanestPath ?? ''),
          oneNextMove: String(persp.oneNextMove ?? ''),
          reviewDate: String(persp.reviewDate ?? nowIso()),
          createdAt: nowIso(),
        };
        const write = appendCouncilReview(this.repoRoot, review);
        if (!write.ok) return errorResult(write.error ?? 'CouncilReview append failed');
        return { ok: true as const, review };
      },
    );
  }

  // 11 ── sis.vault.record ───────────────────────────────────

  private regVaultRecord(): void {
    this.reg(
      {
        name: 'sis.vault.record',
        description: 'Append a vault-loop entry (desire/gratitude/.../proof) to vault-loop.jsonl',
        inputSchema: {
          type: 'object',
          required: ['vault_entry_kind', 'payload', 'privacy_status'],
          properties: {
            vault_entry_kind: { type: 'string', enum: VAULT_LOOP_KINDS },
            payload: { type: 'object' },
            privacy_status: { type: 'string' },
          },
        },
      },
      (p) => {
        const record = {
          id: newId('vl'),
          kind: String(p.vault_entry_kind),
          payload: p.payload as Record<string, unknown>,
          privacyStatus: String(p.privacy_status),
          createdAt: nowIso(),
        };
        try {
          const path = vaultLoopLedgerPath(this.repoRoot);
          ensureDir(join(this.repoRoot, 'memory', '_audit'));
          appendFileSync(path, JSON.stringify(record) + '\n', 'utf-8');
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
        return { ok: true as const, record };
      },
    );
  }

  // 12 ── sis.pack.list ──────────────────────────────────────
  //
  // Track E upgrade: reads packs/registry.json via pack-runtime, returns
  // BOTH buckets. Back-compat: top-level `packs` field is the union of
  // installed + available (existing Track B test asserts empty array when
  // registry is missing, which still holds).

  private regPackList(): void {
    this.reg(
      {
        name: 'sis.pack.list',
        description: 'List packs from packs/registry.json (installed + available)',
        inputSchema: { type: 'object', properties: {} },
      },
      () => {
        try {
          const { installed, available } = runtimeListPacks(this.repoRoot);
          return {
            ok: true as const,
            packs: [...installed, ...available],
            installed,
            available,
          };
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
    );
  }

  // 13 ── sis.pack.install ───────────────────────────────────
  //
  // Track E upgrade: dual-mode.
  //
  //   • pack_id  — installs from packs/available/<id>/ via pack-runtime
  //                (atomic copy, manifest validation, registry update,
  //                AgentEvent recorded). The canonical demo path.
  //
  //   • pack_uri — back-compat with the Track B stub: validates a manifest
  //                file at the URI, computes its sha, returns a Pack record
  //                WITHOUT touching disk. Used for ad-hoc / remote packs.
  //
  // Both modes enforce the permissions_acked gate identically.

  private regPackInstall(): void {
    this.reg(
      {
        name: 'sis.pack.install',
        description: 'Install a pack from registry (pack_id) or from a manifest URI (pack_uri); permissions_acked=true required if pack declares permissions',
        inputSchema: {
          type: 'object',
          required: ['permissions_acked'],
          properties: {
            pack_id: { type: 'string' },
            pack_uri: { type: 'string' },
            signature: { type: 'string' },
            permissions_acked: { type: 'boolean' },
          },
        },
      },
      (p) => {
        const permissionsAcked = p.permissions_acked === true;
        const signature = p.signature ? String(p.signature) : null;
        const packId = typeof p.pack_id === 'string' ? p.pack_id : null;
        const packUri = typeof p.pack_uri === 'string' ? p.pack_uri : null;

        if (!packId && !packUri) {
          return errorResult('one of pack_id (registry install) or pack_uri (manifest install) required');
        }

        // ── Mode A: registry-backed install via pack-runtime ──
        if (packId) {
          const result = runtimeInstallPack(this.repoRoot, packId, {
            permissions_acked: permissionsAcked,
          });
          if (!result.ok) return errorResult(result.error ?? 'install failed');
          return { ok: true as const, pack: result.pack };
        }

        // ── Mode B: ad-hoc manifest install (back-compat stub) ──
        const manifest = this.loadPackManifest(packUri!);
        if (!manifest.ok) return errorResult(manifest.error);

        const permissions: Permission[] = Array.isArray(manifest.value.permissions)
          ? manifest.value.permissions
          : [];

        if (permissions.length > 0 && !permissionsAcked) {
          return errorResult(
            `Pack declares ${permissions.length} permission(s); permissions_acked must be true (non-negotiable)`,
          );
        }

        const manifestSha = createHash('sha256').update(JSON.stringify(manifest.value)).digest('hex');
        const pack: Pack = {
          id: String(manifest.value.id ?? newId('pack')),
          name: String(manifest.value.name ?? 'unnamed'),
          version: String(manifest.value.version ?? '0.0.0'),
          kind: (PACK_KINDS.includes(manifest.value.kind as PackKind)
            ? (manifest.value.kind as PackKind)
            : 'prompt'),
          permissions,
          licenseTier: String(manifest.value.licenseTier ?? 'community'),
          signatureRef: signature ?? undefined,
          installedAt: nowIso(),
          manifestSha,
        };
        return { ok: true as const, pack };
      },
    );
  }

  // 14 ── sis.pack.uninstall ─────────────────────────────────
  //
  // Track E addition. Removes packs/installed/<id>/ and flips the registry
  // record back to `available`. Symmetric to install (registry mode).

  private regPackUninstall(): void {
    this.reg(
      {
        name: 'sis.pack.uninstall',
        description: 'Uninstall a pack: remove packs/installed/<id>/ + flip registry',
        inputSchema: {
          type: 'object',
          required: ['pack_id'],
          properties: { pack_id: { type: 'string' } },
        },
      },
      (p) => {
        const packId = String(p.pack_id);
        const r = runtimeUninstallPack(this.repoRoot, packId);
        if (!r.ok) return errorResult(r.error ?? 'uninstall failed');
        return { ok: true as const, pack: r.pack };
      },
    );
  }

  // 15 ── sis.events.tail ───────────────────────────────────

  private regEventsTail(): void {
    this.reg(
      {
        name: 'sis.events.tail',
        description: 'Return recent AgentEvents from the append-only event ledger',
        inputSchema: {
          type: 'object',
          properties: {
            date: { type: 'string' },
            limit: { type: 'number' },
          },
        },
      },
      (p) => {
        const events = readRecentAgentEvents(this.repoRoot, {
          date: typeof p.date === 'string' ? p.date : undefined,
          limit: typeof p.limit === 'number' ? p.limit : 20,
        });
        return { ok: true as const, events };
      },
    );
  }

  // 16 ── sis.workpacket.next ───────────────────────────────

  private regWorkPacketNext(): void {
    this.reg(
      {
        name: 'sis.workpacket.next',
        description: 'Return the oldest pending WorkPacket from the SQLite shadow index',
        inputSchema: { type: 'object', properties: {} },
      },
      () => {
        const ledger = new AgentOpsLedger(this.repoRoot);
        try {
          const workPacket = ledger.nextPendingWorkPacket();
          return { ok: true as const, workPacket };
        } finally {
          ledger.close();
        }
      },
    );
  }

  // 17 ── sis.workpacket.complete ───────────────────────────

  private regWorkPacketComplete(): void {
    this.reg(
      {
        name: 'sis.workpacket.complete',
        description: 'Mark a WorkPacket completed and append the lifecycle AgentEvent',
        inputSchema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
            agent_id: { type: 'string' },
            summary: { type: 'string' },
          },
        },
      },
      (p) => {
        const ledger = new AgentOpsLedger(this.repoRoot);
        try {
          const result = ledger.transitionWorkPacket({
            id: String(p.id),
            status: 'completed',
            agentId: typeof p.agent_id === 'string' ? p.agent_id : undefined,
            summary: typeof p.summary === 'string' ? p.summary : undefined,
            toolsUsed: ['sis.workpacket.complete'],
          });
          return { ok: true as const, ...result };
        } finally {
          ledger.close();
        }
      },
    );
  }

  // 18 ── sis.memory.rebuild ────────────────────────────────

  private regMemoryRebuild(): void {
    this.reg(
      {
        name: 'sis.memory.rebuild',
        description: 'Rebuild SQLite shadow indices from canonical JSONL ledgers',
        inputSchema: { type: 'object', properties: {} },
      },
      () => {
        const ledger = new AgentOpsLedger(this.repoRoot);
        try {
          const stats = ledger.rebuildFromLedgers();
          return { ok: true as const, sqlitePath: ledger.getSqlitePath(), stats };
        } finally {
          ledger.close();
        }
      },
    );
  }

  // 19 ── sis.module.list ───────────────────────────────────

  private regModuleList(): void {
    this.reg(
      {
        name: 'sis.module.list',
        description: 'List Intelligence System modules and local enablement state',
        inputSchema: { type: 'object', properties: {} },
      },
      () => ({ ok: true as const, modules: listModules(this.repoRoot) }),
    );
  }

  private memoryHealth(): Record<string, unknown> {
    return {
      ...inspectMemoryHealth(this.repoRoot),
      retrievalDefault: 'hybrid-rrf',
      zeroDependencySubstrate: true,
      vaultStats: this.vault.getVaultStats(),
    };
  }

  private memoryEval(limit: number): MemoryEvalResult {
    return runMemoryEval(this.repoRoot, { limit });
  }

  private loadPackManifest(
    packUri: string,
  ): { ok: true; value: Record<string, unknown> } | { ok: false; error: string } {
    // Treat pack_uri as a local path for v0.1. Remote fetch is out of scope.
    const localPath = packUri.startsWith('file://') ? packUri.slice(7) : packUri;
    if (!existsSync(localPath)) {
      return { ok: false, error: `pack_uri not found: ${packUri}` };
    }
    try {
      const raw = readFileSync(localPath, 'utf-8');
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return { ok: true, value: parsed };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }
}
