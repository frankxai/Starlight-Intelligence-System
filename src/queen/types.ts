/**
 * Starlight Queen — Meta-Harness & Autonomous Swarm Orchestrator Types
 * Built on SIP (Starlight Intelligence Protocol) v1.1.1
 */

export type HarnessId =
  | 'claude-code'
  | 'codex'
  | 'grok'
  | 'hermes'
  | 'antigravity'
  | 'gemini-cli'
  | 'opencode'
  | 'kilo'
  | 'cursor'
  | 'qwen-code';

export type SwarmRole =
  | 'architect'
  | 'phd_researcher'
  | 'staff_engineer'
  | 'art_director'
  | 'copy_master'
  | 'sentinel_auditor'
  | 'revenue_operator';

export type LoopEngineType =
  | 'santa_adversarial'
  | 'sparc_methodology'
  | 'ooda_continuous'
  | 'sage_self_healing';

export type BrandAestheticStandard =
  | 'apple_minimalist' // Ultra-clean, zero-slop, effortless hierarchy, impeccable taste
  | 'rituals_sensory_luxury' // Contemplative warmth, sensual refinement, high-status prose
  | 'tesla_relentless_speed'; // High-throughput parallel execution, first-principles physics, mass velocity

export interface HarnessProfile {
  id: HarnessId;
  name: string;
  vendor: string;
  preferredWorkloads: string[];
  maxConcurrency: number;
  activeSessions: number;
  health: 'healthy' | 'degraded' | 'offline';
  capabilities: {
    browserAutomation: boolean;
    desktopControl: boolean;
    localShell: boolean;
    streamingEdits: boolean;
    mcpStdio: boolean;
  };
}

export interface ToolConnectorSpec {
  name: string;
  protocol: 'mcp_stdio' | 'mcp_sse' | 'cli_exec' | 'cdp_browser' | 'native_call';
  endpointOrCommand: string;
  description: string;
  permissions: Array<'read_fs' | 'write_fs' | 'exec_cmd' | 'network_read' | 'network_write'>;
}

export type SwarmTopologyType =
  | 'phd_research_deep'
  | 'staff_eng_hyper'
  | 'luxury_creative_cinema'
  | 'autonomous_revenue_ops';

export interface SwarmAgentSpec {
  name: string;
  role: SwarmRole;
  harness: HarnessId;
  modelTier: string;
  specialization: string;
  skills: string[];
}

export interface SwarmTopologySpec {
  id: string;
  name: string;
  mission: string;
  roles: SwarmRole[];
  topology?: SwarmTopologyType | string;
  leadAgent?: string;
  agents?: SwarmAgentSpec[];
  santaConvergenceRequired?: boolean;
  harnessPreferences: Partial<Record<SwarmRole, HarnessId>>;
  memoryNamespace: string;
  dynamicToolConnectors: ToolConnectorSpec[];
  loopEngine: LoopEngineType;
  failClosedGates: string[];
  aestheticStandard: BrandAestheticStandard;
}

export interface SantaLoopFinding {
  gate: string;
  issue: string;
  severity: 'blocker' | 'warning' | 'info';
  resolved: boolean;
}

export interface SantaLoopSummary {
  converged: boolean;
  rounds: number;
  finalScore: number;
  findings: SantaLoopFinding[];
}

export interface SwarmExecutionResult {
  swarmId: string;
  mission: string;
  status: 'converged_passed' | 'review_blocked' | 'in_progress' | 'failed';
  generatorOutput: string;
  output?: string;
  reviewerCritique?: string;
  iterations: number;
  artifactsProduced: string[];
  verifiedGates: string[];
  durationMs: number;
  santaLoop?: SantaLoopSummary;
}
