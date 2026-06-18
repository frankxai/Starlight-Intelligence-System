/**
 * Starlight Intelligence System — Intelligence System Router
 *
 * Maps any incoming task to its primary IS domain(s) and returns the appropriate
 * Hermes agent profile(s) to dispatch to. Sits between the Starlight Orchestrator
 * and the Hermes swarm — translating intent into fleet routing decisions.
 *
 * Design:
 *   - Signal-based routing: keyword vectors per IS domain, scored against task text
 *   - Confidence threshold: tasks below 0.3 → escalate to Orchestrator IS
 *   - Multi-IS: tasks can route to multiple domains (cross-IS synthesis mode)
 *   - Topology selection: score determines single-is / cross-is / portfolio-sweep
 *
 * Built on SIP — Starlight Intelligence Protocol v1.1.1
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ISDomain } from './adapters/hermes.js';

// ── Routing table ─────────────────────────────────────────────────────────────

/**
 * Keyword signal vectors per IS domain.
 * Higher-specificity keywords score more heavily (longer match = higher weight).
 */
const IS_SIGNALS: Record<ISDomain, string[]> = {
  self: [
    'energy', 'performance', 'focus', 'morning', 'ritual', 'meditation', 'cold plunge',
    'gym', 'health', 'recovery', 'sleep', 'journal', 'genius', 'freedom path',
    'KEEP delegate automate kill', 'founder', 'personal', 'self', 'lumina',
    'dispenza', 'identity', 'belief', 'sovereign self',
  ],
  wealth: [
    'wealth', 'capital', 'deal', 'DPI', 'investment', 'income', 'passive income',
    'revenue', 'portfolio', 'asset', 'return', 'thesis', 'gate ladder',
    'financial', 'money', 'budget', 'property', 'houseboat', 'villa', 'marbella',
    'fuerteventura', 'crypto', 'token', 'yield', 'ROI', 'exit',
  ],
  family: [
    'family', 'brother', 'croatia', 'parent', 'relative', 'relationship',
    'family office', 'private', 'personal life',
  ],
  business: [
    'business', 'company', 'entity', 'revenue model', 'offer', 'client',
    'sales', 'operations', 'sprint', 'decision', 'stakeholder', 'CEO', 'CTO',
    'product launch', 'pricing', 'contract', 'B2B', 'enterprise', 'Oracle',
    'FrankX', 'Arcanea', 'Starlight Intelligence Systems',
  ],
  creator: [
    'creator', 'content', 'YouTube', 'TikTok', 'Instagram', 'post', 'video',
    'newsletter', 'audience', 'superfan', 'ACOS', 'Blotato', 'Postiz',
    'editorial', 'hook', 'caption', 'script', 'creative hub', 'influencer',
    'brand deal', 'collab', 'series', 'lo-fi', 'anime',
  ],
  secondbrain: [
    'note', 'vault', 'Obsidian', 'recall', 'capture', 'second brain', 'PKM',
    'knowledge', 'memory', 'search vault', 'find in memory', 'what do we know',
    'atom', 'daily note', 'inbox', 'zettelkasten',
  ],
  code: [
    'code', 'repo', 'GitHub', 'PR', 'commit', 'bug', 'deploy', 'Next.js',
    'TypeScript', 'MCP server', 'API', 'refactor', 'test', 'CI', 'build',
    'scaffold', 'implement', 'agent SDK', 'Claude Code', 'Vercel', 'Supabase',
    'pnpm', 'npm', 'Python', 'uv', 'function', 'schema', 'database',
  ],
  'voice-video': [
    'video', 'podcast', 'voice', 'audio', 'recording', 'script', 'teleprompter',
    'YouTube', 'shorts', 'reel', 'thumbnail', 'descript', 'editing',
    'narrative', 'interview', 'episode', 'channel', 'vlog', 'b-roll',
  ],
  brand: [
    'brand', 'positioning', 'reputation', 'public surface', 'frankx.ai',
    'arcanea.ai', 'starlightintelligence.org', 'SEO', 'press', 'visibility',
    'PR', 'thought leader', 'personal brand', 'bio', 'profile', 'logo',
    'design system', 'visual identity', 'tone of voice',
  ],
  orchestrator: [
    'orchestrate', 'coordinate', 'all systems', 'portfolio sweep', 'cross-IS',
    'multi-IS', 'synthesize everything', 'full picture', 'all intelligence',
    'route', 'dispatch', 'workflow', 'plan everything', 'starlight board',
    'superintelligence', 'council',
  ],
};

// ── Routing result types ─────────────────────────────────────────────────────

export type SwarmTopology = 'single-is' | 'cross-is' | 'portfolio-sweep';

export interface ISRouteScore {
  domain: ISDomain;
  score: number;         // 0–1 relevance score
  matchedSignals: string[];
  hermesSpecialist: string;   // agent id in cockpit registry
  hermesExecutor: string;
}

export interface RoutingDecision {
  topology: SwarmTopology;
  primaryDomain: ISDomain;
  routes: ISRouteScore[];     // sorted by score desc
  confidence: number;          // score of primary domain
  workflowPath: string;        // path to workflow WORKFLOW.md
  swarmConfigPath: string;     // path to swarm-config.json
  reasoning: string;
}

// ── IS Router ─────────────────────────────────────────────────────────────────

export class ISRouter {
  private readonly repoRoot: string;
  private readonly confidenceThreshold: number;
  private readonly crossIsThreshold: number;

  constructor(options: {
    repoRoot: string;
    /** Min score to consider a domain relevant. Default 0.15 */
    confidenceThreshold?: number;
    /** If 2+ domains score above this, use cross-IS topology. Default 0.3 */
    crossIsThreshold?: number;
  }) {
    this.repoRoot = options.repoRoot;
    this.confidenceThreshold = options.confidenceThreshold ?? 0.15;
    this.crossIsThreshold = options.crossIsThreshold ?? 0.30;
  }

  /**
   * Route a natural language task to IS domain(s) and Hermes agent profiles.
   */
  route(task: string): RoutingDecision {
    const scores = this.scoreAll(task);
    const relevant = scores.filter(s => s.score >= this.confidenceThreshold);

    if (relevant.length === 0) {
      // Nothing scored — fall through to orchestrator
      return this.buildDecision(task, [scores.find(s => s.domain === 'orchestrator') ?? scores[0]], 'single-is');
    }

    const aboveHigh = relevant.filter(s => s.score >= this.crossIsThreshold);

    let topology: SwarmTopology;
    if (aboveHigh.length >= 4) topology = 'portfolio-sweep';
    else if (aboveHigh.length >= 2) topology = 'cross-is';
    else topology = 'single-is';

    return this.buildDecision(task, relevant.slice(0, 5), topology);
  }

  /**
   * Force a specific IS domain (e.g. from an explicit command like /self).
   */
  routeToIS(domain: ISDomain): RoutingDecision {
    const scores = this.scoreAll('');
    const target = scores.find(s => s.domain === domain);
    return this.buildDecision(`Explicit ${domain} IS task`, target ? [target] : [], 'single-is');
  }

  private scoreAll(task: string): ISRouteScore[] {
    const lower = task.toLowerCase();
    const scores: ISRouteScore[] = [];

    for (const [domain, signals] of Object.entries(IS_SIGNALS) as [ISDomain, string[]][]) {
      const matched: string[] = [];
      let rawScore = 0;

      for (const signal of signals) {
        if (lower.includes(signal.toLowerCase())) {
          matched.push(signal);
          // Weight by signal length — longer, more specific signals score more
          rawScore += 0.05 + (signal.length / 300);
        }
      }

      scores.push({
        domain,
        score: Math.min(1, rawScore),
        matchedSignals: matched,
        hermesSpecialist: `hermes-${domain}-specialist`,
        hermesExecutor: `hermes-${domain}-executor`,
      });
    }

    return scores.sort((a, b) => b.score - a.score);
  }

  private buildDecision(
    _task: string,
    routes: ISRouteScore[],
    topology: SwarmTopology,
  ): RoutingDecision {
    const primary = routes[0]?.domain ?? 'orchestrator';
    const confidence = routes[0]?.score ?? 0;

    const workflowPath = join(this.repoRoot, 'workflows', primary, 'WORKFLOW.md');
    const swarmConfigPath = join(this.repoRoot, 'workflows', primary, 'swarm-config.json');

    const topologyLabel = {
      'single-is': `Single-IS: routing to ${primary} specialist`,
      'cross-is': `Cross-IS: ${routes.slice(0, 3).map(r => r.domain).join(' + ')} synthesis`,
      'portfolio-sweep': `Portfolio sweep: full 10-IS orchestrator pass`,
    }[topology];

    const matched = routes.flatMap(r => r.matchedSignals).slice(0, 8);
    const reasoning = [
      topologyLabel,
      `Confidence: ${(confidence * 100).toFixed(0)}%`,
      matched.length ? `Matched signals: ${matched.join(', ')}` : 'No signal match — defaulting to orchestrator',
      existsSync(workflowPath) ? `Workflow: workflows/${primary}/WORKFLOW.md ✓` : `Workflow: not found (fallback to orchestrator)`,
    ].join(' | ');

    return {
      topology,
      primaryDomain: primary,
      routes,
      confidence,
      workflowPath,
      swarmConfigPath,
      reasoning,
    };
  }

  /**
   * Load the swarm config JSON for a given IS domain.
   * Returns null if the workflow hasn't been generated yet.
   */
  loadSwarmConfig(domain: ISDomain): Record<string, unknown> | null {
    const configPath = join(this.repoRoot, 'workflows', domain, 'swarm-config.json');
    if (!existsSync(configPath)) return null;
    try {
      return JSON.parse(readFileSync(configPath, 'utf-8')) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  /**
   * Describe routing decision in human-readable form (for vault writes + logs).
   */
  describe(decision: RoutingDecision): string {
    return [
      `## IS Routing Decision`,
      `**Topology:** ${decision.topology}`,
      `**Primary Domain:** ${decision.primaryDomain}`,
      `**Confidence:** ${(decision.confidence * 100).toFixed(0)}%`,
      `**Reasoning:** ${decision.reasoning}`,
      '',
      '**Route table:**',
      ...decision.routes.map(r =>
        `- ${r.domain}: ${(r.score * 100).toFixed(0)}% (${r.matchedSignals.slice(0, 3).join(', ')}${r.matchedSignals.length > 3 ? '…' : ''})`
      ),
    ].join('\n');
  }
}

// ── Convenience singleton factory ─────────────────────────────────────────────

let _router: ISRouter | null = null;

export function getISRouter(repoRoot: string): ISRouter {
  if (!_router) _router = new ISRouter({ repoRoot });
  return _router;
}
