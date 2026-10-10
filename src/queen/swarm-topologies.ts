/**
 * Starlight Queen — Pre-configured Elite Swarm Topologies
 * Built on SIP (Starlight Intelligence Protocol) v1.1.1
 */

import type { SwarmTopologySpec } from './types.js';

export const ELITE_SWARM_TOPOLOGIES: Record<string, SwarmTopologySpec> = {
  phd_research_deep: {
    id: 'phd_research_deep',
    name: 'PhD R&D & Scientific Proving Ground Swarm',
    mission: 'Decompose complex research topics, formulate testable hypotheses, verify falsification criteria, and validate in isolated proving grounds.',
    roles: ['architect', 'phd_researcher', 'sentinel_auditor'],
    harnessPreferences: {
      architect: 'antigravity',
      phd_researcher: 'codex',
      sentinel_auditor: 'claude-code',
    },
    memoryNamespace: 'swarms/phd_research',
    dynamicToolConnectors: [
      {
        name: 'starlight_knowledge_tree',
        protocol: 'native_call',
        endpointOrCommand: 'src/knowledge/knowledge-tree.ts',
        description: 'Traverse and query the 10 Universal Knowledge Domains and emit scientific discoveries.',
        permissions: ['read_fs', 'write_fs'],
      },
      {
        name: 'reality_diffusion_engine',
        protocol: 'mcp_stdio',
        endpointOrCommand: 'npx @reality-architect/cli --mcp',
        description: 'Empirical confidence scoring, failure mode checks, and certainty capping.',
        permissions: ['exec_cmd'],
      },
    ],
    loopEngine: 'santa_adversarial',
    failClosedGates: ['falsification_criteria_required', 'certainty_capping_enforced', 'peer_adversarial_pass'],
    aestheticStandard: 'apple_minimalist',
  },

  staff_eng_hyper: {
    id: 'staff_eng_hyper',
    name: 'Staff Software Engineering & Systems Swarm',
    mission: 'Ship world-class production code with zero external baggage, 100% test pass rates, formal schemas, and zero-defect deployment.',
    roles: ['architect', 'staff_engineer', 'sentinel_auditor'],
    harnessPreferences: {
      architect: 'claude-code',
      staff_engineer: 'codex',
      sentinel_auditor: 'antigravity',
    },
    memoryNamespace: 'swarms/staff_eng',
    dynamicToolConnectors: [
      {
        name: 'git_worktree_manager',
        protocol: 'cli_exec',
        endpointOrCommand: 'git worktree',
        description: 'Isolate agent work in dedicated worktrees to prevent branch collisions.',
        permissions: ['read_fs', 'write_fs', 'exec_cmd'],
      },
      {
        name: 'starlight_security_scanner',
        protocol: 'cli_exec',
        endpointOrCommand: 'starlight security',
        description: 'Pre-commit scan ensuring zero secret leaks and clean commit integrity.',
        permissions: ['read_fs', 'exec_cmd'],
      },
    ],
    loopEngine: 'sparc_methodology',
    failClosedGates: ['zero_worktree_conflict', 'lint_typecheck_pass', 'secret_leak_zero'],
    aestheticStandard: 'apple_minimalist',
  },

  luxury_creative_cinema: {
    id: 'luxury_creative_cinema',
    name: 'Luxury Brand & Generative Cinema Swarm',
    mission: 'Direct high-status brand narratives, magazine-grade visual artifacts, mascot invariants, and cinematic video scenes with zero-slop excellence.',
    roles: ['art_director', 'copy_master', 'sentinel_auditor'],
    harnessPreferences: {
      art_director: 'antigravity',
      copy_master: 'claude-code',
      sentinel_auditor: 'grok',
    },
    memoryNamespace: 'swarms/creative_cinema',
    dynamicToolConnectors: [
      {
        name: 'anime_legends_cli',
        protocol: 'mcp_stdio',
        endpointOrCommand: 'npx @anime-legends/cli --mcp',
        description: 'Mascot trinity invariants, legal copyright firewall, and anime shot breakdowns.',
        permissions: ['exec_cmd'],
      },
      {
        name: 'gencreator_media_engine',
        protocol: 'mcp_stdio',
        endpointOrCommand: 'npx @gencreator/cli --mcp',
        description: 'Multi-model prompt adapters, model routing, and cost projection.',
        permissions: ['exec_cmd'],
      },
    ],
    loopEngine: 'santa_adversarial',
    failClosedGates: ['anime_legal_firewall_pass', 'humanizer_prose_audit', 'visual_qa_gate_pass'],
    aestheticStandard: 'rituals_sensory_luxury',
  },

  autonomous_revenue_ops: {
    id: 'autonomous_revenue_ops',
    name: 'Autonomous Revenue & Operations Swarm',
    mission: 'Manage monetization catalogs, edge affiliate redirects, customer lifecycle intelligence, and regulatory FTC disclosures.',
    roles: ['architect', 'revenue_operator', 'sentinel_auditor'],
    harnessPreferences: {
      architect: 'claude-code',
      revenue_operator: 'codex',
      sentinel_auditor: 'hermes',
    },
    memoryNamespace: 'swarms/revenue_ops',
    dynamicToolConnectors: [
      {
        name: 'agentic_income_cli',
        protocol: 'mcp_stdio',
        endpointOrCommand: 'npx @agentic-income/cli --mcp',
        description: 'Monetization catalog routing, dead-end alternative resolution, and disclosure validation.',
        permissions: ['exec_cmd'],
      },
    ],
    loopEngine: 'ooda_continuous',
    failClosedGates: ['ftc_eu_disclosure_verified', 'financial_action_gated', 'dead_end_rerouted'],
    aestheticStandard: 'tesla_relentless_speed',
  },
};
