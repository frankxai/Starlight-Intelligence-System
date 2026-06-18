#!/usr/bin/env node
/**
 * Starlight Intelligence System — IS-Aware MCP Server (v1.0)
 *
 * Extends the vault MCP (mcp-server.ts) with Intelligence System routing,
 * Hermes swarm dispatch, and IS-specific tools.
 *
 * Exposes 14 tools beyond the base vault MCP:
 *   is_route            — route a task to IS domain(s)
 *   is_list             — list all 10 IS with status and workflow paths
 *   swarm_dispatch      — dispatch task to Hermes specialist profiles
 *   swarm_status        — check agent fleet status from cockpit registry
 *   swarm_boot_plan     — generate boot sequence for an IS's agent profiles
 *   workflow_load       — load WORKFLOW.md for an IS domain
 *   workflow_list       — list all workflow domains and their status
 *   claw_list           — list all Claws with their contracts
 *   claw_route          — route a task to the correct Claw
 *   agent_list          — list all 63+ agents with tier and domain
 *   genius_load         — load genius profile (frankx or per-IS)
 *   is_skill_suggest    — suggest relevant skills for an IS + task combo
 *   cross_is_plan       — build a cross-IS synthesis plan for a complex task
 *   hermes_skill_write  — emit a Hermes SKILL.md for a solved workflow
 *
 * Transport: stdio (JSON-RPC 2.0) — same as mcp-server.ts
 * Usage: node dist/mcp-is.js [--repo-root <path>] [--cockpit <path>]
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 */

import { createInterface } from 'node:readline';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { ISRouter, type RoutingDecision } from './is-router.js';
import { IS_DOMAINS, type ISDomain } from './adapters/hermes.js';

// ── Types ─────────────────────────────────────────────────────────────────────

interface JsonRpcRequest {
  jsonrpc?: string;
  method: string;
  params?: unknown;
  id?: number | string | null;
}
interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

// ── Config ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const repoRootIdx = args.indexOf('--repo-root');
const cockpitIdx = args.indexOf('--cockpit');

const REPO_ROOT = resolve(
  repoRootIdx >= 0 ? args[repoRootIdx + 1] : join(homedir(), 'starlight', 'repos', 'Starlight-Intelligence-System'),
);
const COCKPIT_PATH = resolve(
  cockpitIdx >= 0 ? args[cockpitIdx + 1] : join(homedir(), 'hermes-cockpit', 'registry.json'),
);

const router = new ISRouter({ repoRoot: REPO_ROOT });

// ── Helpers ───────────────────────────────────────────────────────────────────

function readJson<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try { return JSON.parse(readFileSync(path, 'utf-8')) as T; } catch { return null; }
}

function readMd(path: string): string | null {
  if (!existsSync(path)) return null;
  return readFileSync(path, 'utf-8');
}

function loadCockpitRegistry(): Record<string, unknown>[] {
  const reg = readJson<{ agents: Record<string, unknown>[] }>(COCKPIT_PATH);
  return reg?.agents ?? [];
}

// ── Tool definitions ──────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'is_route',
    description: 'Route a natural language task to the correct Intelligence System domain(s) and Hermes agent profiles. Returns topology, primary domain, confidence, and full route table.',
    inputSchema: {
      type: 'object',
      properties: {
        task: { type: 'string', description: 'The task or question to route' },
        force_domain: { type: 'string', enum: [...IS_DOMAINS], description: 'Force routing to a specific IS domain (optional)' },
      },
      required: ['task'],
    },
  },
  {
    name: 'is_list',
    description: 'List all 10 Intelligence Systems with their domain, premium label, workflow path, and swarm-config status.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'swarm_dispatch',
    description: 'Generate a swarm dispatch plan for a task — returns the ordered agent invocation sequence with prompts, ports, and topology.',
    inputSchema: {
      type: 'object',
      properties: {
        task: { type: 'string', description: 'Task to dispatch to the swarm' },
        domains: { type: 'array', items: { type: 'string', enum: [...IS_DOMAINS] }, description: 'IS domains to engage (auto-detect if omitted)' },
        concurrency: { type: 'number', description: 'Max parallel agents (default 4)' },
      },
      required: ['task'],
    },
  },
  {
    name: 'swarm_status',
    description: 'Check the status of Hermes agent fleet from the cockpit registry. Returns online/offline/starting counts per role.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'swarm_boot_plan',
    description: 'Generate the PowerShell boot sequence to start Hermes agent profiles for a given IS domain.',
    inputSchema: {
      type: 'object',
      properties: {
        domain: { type: 'string', enum: [...IS_DOMAINS], description: 'IS domain to boot agents for' },
        include_infra: { type: 'boolean', description: 'Include conductor/vault-writer/sentinel (default true)' },
      },
      required: ['domain'],
    },
  },
  {
    name: 'workflow_load',
    description: 'Load the WORKFLOW.md for a specific IS domain.',
    inputSchema: {
      type: 'object',
      properties: {
        domain: { type: 'string', enum: [...IS_DOMAINS] },
      },
      required: ['domain'],
    },
  },
  {
    name: 'workflow_list',
    description: 'List all IS workflow domains and whether their WORKFLOW.md and swarm-config.json exist.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'claw_list',
    description: 'List all SIS Claws (OpenClaw layer) with their purpose and phase.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'claw_route',
    description: 'Route a task to the correct Claw based on intent.',
    inputSchema: {
      type: 'object',
      properties: {
        task: { type: 'string' },
        intent: { type: 'string', enum: ['search', 'write', 'excavate', 'attest', 'sentinel', 'bootstrap', 'reclaim', 'architect', 'workflow', 'hermes-swarm'] },
      },
      required: ['task'],
    },
  },
  {
    name: 'agent_list',
    description: 'List Starlight agents from the agent registry with their tier and domain.',
    inputSchema: {
      type: 'object',
      properties: {
        tier: { type: 'string', enum: ['leadership', 'specialist', 'foundation', 'excavation', 'council-archetype', 'all'] },
      },
    },
  },
  {
    name: 'genius_load',
    description: 'Load a genius profile — either the master FrankX profile or a per-IS Hermes agent profile.',
    inputSchema: {
      type: 'object',
      properties: {
        scope: { type: 'string', enum: ['frankx', ...IS_DOMAINS] },
      },
      required: ['scope'],
    },
  },
  {
    name: 'is_skill_suggest',
    description: 'Suggest relevant SIS skills for a given IS domain and task. Returns ranked skill paths with activation reasoning.',
    inputSchema: {
      type: 'object',
      properties: {
        domain: { type: 'string', enum: [...IS_DOMAINS] },
        task: { type: 'string' },
      },
      required: ['domain'],
    },
  },
  {
    name: 'cross_is_plan',
    description: 'Build a cross-IS synthesis plan for a complex task touching multiple Intelligence Systems. Returns ordered dispatch sequence with per-IS prompts.',
    inputSchema: {
      type: 'object',
      properties: {
        task: { type: 'string', description: 'Complex task requiring multiple IS' },
        domains: { type: 'array', items: { type: 'string', enum: [...IS_DOMAINS] }, description: 'Override auto-detected domains' },
      },
      required: ['task'],
    },
  },
  {
    name: 'hermes_skill_write',
    description: 'Emit a Hermes-format SKILL.md for a solved workflow so the agent can reuse it. Part of the Hermes self-improving loop.',
    inputSchema: {
      type: 'object',
      properties: {
        skill_name: { type: 'string' },
        description: { type: 'string' },
        steps: { type: 'array', items: { type: 'string' } },
        triggers: { type: 'array', items: { type: 'string' } },
        domain: { type: 'string', enum: [...IS_DOMAINS] },
      },
      required: ['skill_name', 'description', 'steps', 'triggers'],
    },
  },
];

// ── Tool handlers ─────────────────────────────────────────────────────────────

function handleTool(name: string, params: Record<string, unknown>): unknown {
  switch (name) {

    case 'is_route': {
      const task = String(params.task ?? '');
      const forceDomain = params.force_domain as ISDomain | undefined;
      const decision: RoutingDecision = forceDomain
        ? router.routeToIS(forceDomain)
        : router.route(task);
      return {
        topology: decision.topology,
        primaryDomain: decision.primaryDomain,
        confidence: decision.confidence,
        reasoning: decision.reasoning,
        routes: decision.routes.slice(0, 5).map(r => ({
          domain: r.domain,
          score: Math.round(r.score * 100),
          hermesSpecialist: r.hermesSpecialist,
          hermesExecutor: r.hermesExecutor,
          signals: r.matchedSignals.slice(0, 5),
        })),
        workflowExists: existsSync(decision.workflowPath),
        swarmConfigExists: existsSync(decision.swarmConfigPath),
      };
    }

    case 'is_list': {
      const IS_META: Record<ISDomain, { label: string; premiumLabel: string }> = {
        self:         { label: 'Self IS', premiumLabel: 'Founder Performance Intelligence' },
        wealth:       { label: 'Wealth IS', premiumLabel: 'Capital & Deal Intelligence' },
        family:       { label: 'Family IS', premiumLabel: 'Family Office Intelligence' },
        business:     { label: 'Business IS', premiumLabel: 'Executive Operating Intelligence' },
        creator:      { label: 'Creator IS', premiumLabel: 'Media & Influence Intelligence' },
        secondbrain:  { label: 'Second Brain IS', premiumLabel: 'Private Knowledge Intelligence' },
        code:         { label: 'Code IS', premiumLabel: 'Product & Automation Intelligence' },
        'voice-video':{ label: 'Voice & Video IS', premiumLabel: 'Narrative Media Intelligence' },
        brand:        { label: 'Brand IS', premiumLabel: 'Reputation & Positioning Intelligence' },
        orchestrator: { label: 'Starlight Orchestrator', premiumLabel: 'Private Intelligence Office' },
      };
      return IS_DOMAINS.map((domain, i) => ({
        rank: i + 1,
        domain,
        ...IS_META[domain],
        workflowPath: `workflows/${domain}/WORKFLOW.md`,
        workflowExists: existsSync(join(REPO_ROOT, 'workflows', domain, 'WORKFLOW.md')),
        swarmConfigExists: existsSync(join(REPO_ROOT, 'workflows', domain, 'swarm-config.json')),
        hermesSpecialist: `hermes-${domain}-specialist`,
      }));
    }

    case 'swarm_dispatch': {
      const task = String(params.task ?? '');
      const forceDomains = (params.domains as ISDomain[] | undefined);
      const concurrency = Number(params.concurrency ?? 4);
      const decision = router.route(task);
      const targetDomains = forceDomains ?? decision.routes.slice(0, concurrency).map(r => r.domain);

      const steps = [
        { step: 0, agent: 'hermes-swarm-conductor', port: 8112, role: 'conductor', prompt: `TASK: ${task}\nROUTING: ${decision.topology}\nDOMAINS: ${targetDomains.join(', ')}` },
        ...targetDomains.map((domain, i) => ({
          step: i + 1,
          agent: `hermes-${domain}-specialist`,
          port: 8083 + IS_DOMAINS.indexOf(domain),
          role: 'specialist',
          prompt: `IS SCOPE: ${domain.toUpperCase()}\nTASK: ${task}\nRETURN: synthesis + vault atoms`,
        })),
        { step: targetDomains.length + 1, agent: 'hermes-vault-writer', port: 8110, role: 'vault-writer', prompt: 'COLLECT all specialist results → synthesize → write to strategic vault' },
        { step: targetDomains.length + 2, agent: 'hermes-sentinel-monitor', port: 8111, role: 'sentinel', prompt: 'AUDIT swarm results for quality gates, privacy, secrets' },
      ];

      return { topology: decision.topology, concurrency, steps, cockpitEndpoint: 'http://localhost:8000' };
    }

    case 'swarm_status': {
      const agents = loadCockpitRegistry();
      const byRole: Record<string, { online: number; offline: number; total: number }> = {};
      for (const agent of agents) {
        const role = String((agent as Record<string, unknown>).swarmRole ?? 'unknown');
        if (!byRole[role]) byRole[role] = { online: 0, offline: 0, total: 0 };
        byRole[role].total++;
        if ((agent as Record<string, unknown>).status === 'online') byRole[role].online++;
        else byRole[role].offline++;
      }
      return {
        totalAgents: agents.length,
        byRole,
        cockpitRegistry: COCKPIT_PATH,
        cockpitUrl: 'http://localhost:8000',
        lastUpdated: (readJson<{ lastUpdated: string }>(COCKPIT_PATH))?.lastUpdated ?? 'unknown',
      };
    }

    case 'swarm_boot_plan': {
      const domain = params.domain as ISDomain;
      const includeInfra = params.include_infra !== false;
      const lines = [
        `# Boot plan: ${domain} IS swarm`,
        `# Run from PowerShell in WSL2`,
        '',
        `# 1. Specialist (405B)`,
        `hermes profile ${domain} --port ${8083 + IS_DOMAINS.indexOf(domain)} &`,
        `# 2. Executor (70B)`,
        `hermes profile ${domain}-executor --port ${8093 + IS_DOMAINS.indexOf(domain)} &`,
      ];
      if (includeInfra) {
        lines.push('', '# Infrastructure (if not already running)');
        lines.push('hermes profile conductor --port 8112 &');
        lines.push('hermes profile vault-writer --port 8110 &');
        lines.push('hermes profile sentinel --port 8111 &');
      }
      lines.push('', '# Verify');
      lines.push('hermes status');
      return { domain, bootScript: lines.join('\n') };
    }

    case 'workflow_load': {
      const domain = params.domain as ISDomain;
      const wfPath = join(REPO_ROOT, 'workflows', domain, 'WORKFLOW.md');
      const content = readMd(wfPath);
      return content
        ? { domain, content, path: `workflows/${domain}/WORKFLOW.md` }
        : { error: `Workflow not found for domain: ${domain}`, path: wfPath };
    }

    case 'workflow_list': {
      return IS_DOMAINS.map(domain => ({
        domain,
        workflowExists: existsSync(join(REPO_ROOT, 'workflows', domain, 'WORKFLOW.md')),
        swarmConfigExists: existsSync(join(REPO_ROOT, 'workflows', domain, 'swarm-config.json')),
      }));
    }

    case 'claw_list': {
      const clawsDir = join(REPO_ROOT, 'claws');
      if (!existsSync(clawsDir)) return { error: 'claws/ directory not found' };
      const claws = readdirSync(clawsDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => {
          const clawPath = join(clawsDir, d.name, 'CLAW.md');
          const content = existsSync(clawPath) ? readFileSync(clawPath, 'utf-8') : null;
          const purposeMatch = content?.match(/purpose:\s*(.+)/);
          const phaseMatch = content?.match(/phase:\s*(\d+)/);
          return {
            name: d.name,
            purpose: purposeMatch?.[1]?.trim() ?? 'unknown',
            phase: phaseMatch ? Number(phaseMatch[1]) : null,
            hasClaw: !!content,
          };
        });
      return claws;
    }

    case 'claw_route': {
      const task = String(params.task ?? '');
      const intentHints: Record<string, string> = {
        search: 'hermes', write: 'memory', excavate: 'genius', attest: 'attestation',
        sentinel: 'sentinel', bootstrap: 'bootstrap', reclaim: 'reclamation',
        architect: 'architect', workflow: 'workflow', 'hermes-swarm': 'hermes',
      };
      const detectedIntent = params.intent as string | undefined;
      const lower = task.toLowerCase();
      let claw = 'hermes';
      if (!detectedIntent) {
        if (lower.includes('remember') || lower.includes('vault write')) claw = 'memory';
        else if (lower.includes('genius') || lower.includes('excavat')) claw = 'genius';
        else if (lower.includes('attest') || lower.includes('sip-attest')) claw = 'attestation';
        else if (lower.includes('security') || lower.includes('audit')) claw = 'sentinel';
        else if (lower.includes('duplicate') || lower.includes('reclaim')) claw = 'reclamation';
        else if (lower.includes('workflow') || lower.includes('run workflow')) claw = 'workflow';
        else if (lower.includes('architecture') || lower.includes('design')) claw = 'architect';
        else if (lower.includes('install') || lower.includes('bootstrap')) claw = 'bootstrap';
      } else {
        claw = intentHints[detectedIntent] ?? 'hermes';
      }
      return { task, recommendedClaw: claw, clawPath: `claws/${claw}/CLAW.md` };
    }

    case 'agent_list': {
      const agentsDir = join(REPO_ROOT, 'agents');
      if (!existsSync(agentsDir)) return { error: 'agents/ directory not found' };
      const files = readdirSync(agentsDir).filter(f => f.endsWith('.md') && f !== 'AGENT_REGISTRY.md');
      return files.slice(0, 30).map(f => ({ file: f, name: f.replace('.md', '') }));
    }

    case 'genius_load': {
      const scope = String(params.scope ?? 'frankx');
      let geniusPath: string;
      if (scope === 'frankx') {
        geniusPath = join(REPO_ROOT, 'genius', 'profile-frankx.md');
      } else {
        geniusPath = join(REPO_ROOT, 'genius', 'per-agent', `hermes-${scope}-genius.md`);
      }
      const content = readMd(geniusPath);
      return content ? { scope, content } : { error: `Genius profile not found: ${scope}`, path: geniusPath };
    }

    case 'is_skill_suggest': {
      const domain = params.domain as ISDomain;
      const DOMAIN_SKILLS: Record<ISDomain, string[]> = {
        self: ['intelligence/strategic-reasoning', 'intelligence/decision-framework', 'intelligence/genius-excavation', 'health/body-substrate', 'memory/capture-discipline'],
        wealth: ['business/revenue-modeling', 'intelligence/strategic-reasoning', 'crypto-intelligence/SKILL', 'intelligence/decision-framework', 'intelligence/pattern-recognition'],
        family: ['memory/vault-management', 'intelligence/decision-framework', 'memory/context-preservation', 'relational/network-architecture'],
        business: ['business/entity-architecture', 'business/revenue-modeling', 'intelligence/strategic-reasoning', 'orchestration/workflow-design', 'people-intelligence/org-architecture'],
        creator: ['orchestration/gencreator-stack', 'integration/creator-path', 'music-is/distribution-flow', 'vision/design-coherence', 'integration/idea-triage'],
        secondbrain: ['memory/vault-management', 'memory/knowledge-synthesis', 'memory/insight-distillation', 'memory/capture-discipline', 'intelligence/hermes-search'],
        code: ['orchestration/workflow-design', 'orchestration/parallel-execution', 'integration/repo-bridge', 'memory/context-preservation'],
        'voice-video': ['sound-intelligence/production-systems', 'music-is/song-intake', 'vision/design-coherence', 'orchestration/gencreator-stack'],
        brand: ['vision/design-coherence', 'vision/voice-anti-slop', 'intelligence/pattern-recognition', 'integration/ecosystem-sync'],
        orchestrator: ['orchestration/multi-agent-coordination', 'orchestration/hermes-swarm', 'orchestration/parallel-execution', 'intelligence/systems-thinking', 'orchestration/workflow-design'],
      };
      return { domain, skills: DOMAIN_SKILLS[domain] ?? [], task: params.task };
    }

    case 'cross_is_plan': {
      const task = String(params.task ?? '');
      const forceDomains = params.domains as ISDomain[] | undefined;
      const decision = router.route(task);
      const domains = forceDomains ?? decision.routes.slice(0, 4).map(r => r.domain);

      return {
        task,
        topology: 'cross-is',
        domains,
        description: router.describe(decision),
        executionPlan: [
          { phase: 1, action: 'Conductor decomposes task into IS-scoped sub-tasks', agent: 'hermes-swarm-conductor' },
          ...domains.map(d => ({
            phase: 2,
            action: `${d.toUpperCase()} IS specialist analyzes domain-specific dimensions`,
            agent: `hermes-${d}-specialist`,
            parallel: true,
          })),
          { phase: 3, action: 'Conductor synthesizes all specialist outputs', agent: 'hermes-swarm-conductor' },
          { phase: 4, action: 'Vault Writer writes synthesis to strategic vault', agent: 'hermes-vault-writer' },
          { phase: 5, action: 'Sentinel audits output for quality gates', agent: 'hermes-sentinel-monitor' },
        ],
      };
    }

    case 'hermes_skill_write': {
      const skillName = String(params.skill_name ?? '');
      const description = String(params.description ?? '');
      const steps = (params.steps as string[]) ?? [];
      const triggers = (params.triggers as string[]) ?? [];
      const domain = (params.domain as ISDomain | undefined) ?? 'orchestrator';

      const skillDoc = [
        `# ${skillName}`,
        '',
        `## Description`,
        description,
        '',
        `## Domain`,
        domain,
        '',
        `## Triggers`,
        ...triggers.map(t => `- ${t}`),
        '',
        `## Steps`,
        ...steps.map((s, i) => `${i + 1}. ${s}`),
        '',
        `## Version`,
        `0.1.0 — auto-generated by Hermes self-improving loop`,
        `Generated: ${new Date().toISOString()}`,
        '',
        `*Built on SIP — Starlight Intelligence Protocol v1.1.1*`,
      ].join('\n');

      return { skillName, domain, skillDoc, path: `.hermes/skills/${domain}/${skillName.toLowerCase().replace(/\s+/g, '-')}.md` };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ── JSON-RPC server loop (stdio) ──────────────────────────────────────────────

function respond(response: JsonRpcResponse): void {
  process.stdout.write(JSON.stringify(response) + '\n');
}

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });

rl.on('line', (line: string) => {
  if (!line.trim()) return;
  let req: JsonRpcRequest;
  try { req = JSON.parse(line) as JsonRpcRequest; } catch {
    respond({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } });
    return;
  }
  const id = req.id ?? null;
  const params = (req.params ?? {}) as Record<string, unknown>;

  try {
    switch (req.method) {
      case 'initialize':
        respond({ jsonrpc: '2.0', id, result: { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'starlight-is-mcp', version: '1.0.0' } } });
        break;

      case 'tools/list':
        respond({ jsonrpc: '2.0', id, result: { tools: TOOLS } });
        break;

      case 'tools/call': {
        const toolName = String((params as Record<string, unknown>).name ?? '');
        const toolArgs = ((params as Record<string, unknown>).arguments ?? {}) as Record<string, unknown>;
        const result = handleTool(toolName, toolArgs);
        respond({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] } });
        break;
      }

      default:
        respond({ jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${req.method}` } });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    respond({ jsonrpc: '2.0', id, error: { code: -32603, message: msg } });
  }
});

process.stderr.write('Starlight IS MCP Server v1.0.0 — 14 IS-aware tools — stdio ready\n');
