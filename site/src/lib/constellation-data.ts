import rawPortfolio from "@/data/constellation-portfolio.public.json";

export type PublicVisualWorld = {
  palette: string[];
  materials: string[];
  lighting: string;
  setting: string;
  negative_cues: string[];
};

export type AgentVisualDNA = {
  archetype: string;
  signature: string;
  silhouette: string;
  accent: string;
  portrait_brief: string;
};

export type AgentVisualAsset = {
  id: string;
  href: string;
  sha256: string;
  width: number;
  height: number;
  inspection_status: string;
  rights_status: string;
};

export type PublicAgent = {
  id: string;
  display_name: string;
  role_title: string;
  role_kind: "conductor" | "specialist";
  version: string;
  status: string;
  purpose: string;
  outcomes: string[];
  public_profile: string;
  voice: string;
  method: string;
  skill_refs: string[];
  capabilities: string[];
  non_capabilities: string[];
  stop_conditions: string[];
  escalation_conditions: string[];
  graph: {
    depends_on: string[];
    routes_to: string[];
  };
  visual_dna: AgentVisualDNA;
  visual_asset: AgentVisualAsset;
  profile_href: string;
  prompt_contract: {
    markdown: string;
    sha256: string;
    authority_statement: string;
  };
};

export type PublicSwarm = {
  id: string;
  name: string;
  domain: string;
  purpose: string;
  outcomes: string[];
  lead_agent_id: string;
  shared_stop_conditions: string[];
  shared_escalation_conditions: string[];
  visual_world: PublicVisualWorld;
  agents: PublicAgent[];
};

export type PublicPortfolio = {
  schema_version: string;
  portfolio_id: string;
  portfolio_version: string;
  status: string;
  swarms: PublicSwarm[];
};

export const CONSTELLATION_PORTFOLIO: PublicPortfolio = rawPortfolio as unknown as PublicPortfolio;

export const ALL_AGENTS: PublicAgent[] = CONSTELLATION_PORTFOLIO.swarms.flatMap((s) => s.agents);

export const SWARM_HOUSES = CONSTELLATION_PORTFOLIO.swarms.map((swarm) => ({
  id: swarm.id,
  name: swarm.name,
  domain: swarm.domain,
  purpose: swarm.purpose,
  leadAgentId: swarm.lead_agent_id,
  agentCount: swarm.agents.length,
  palette: swarm.visual_world.palette,
}));

export type VisualBatch = {
  id: number;
  title: string;
  focus: string;
  folder: string;
  sampleImages: {
    title: string;
    src: string;
    desc: string;
  }[];
};

export const VISUAL_BATCHES: VisualBatch[] = [
  {
    id: 1,
    title: "Identity Control & Core Agents",
    focus: "Porcelain & basalt figures defining Aster, Quill, Mote, Veyra, Luma, Kite, and Bastion.",
    folder: "batch-01-identity-control",
    sampleImages: [
      {
        title: "Aster · Synthesis Architect",
        src: "/assets/gallery/batch-01-identity-control/b01-001-aster-synthesis-profile.png",
        desc: "Neutral obsidian frame with luminescent synthesis core.",
      },
      {
        title: "Quill · Lore & Provenance",
        src: "/assets/gallery/batch-01-identity-control/b01-003-quill-source-profile.png",
        desc: "Attribution quill and citation record keeper.",
      },
      {
        title: "Bastion · Governance Sentinel",
        src: "/assets/gallery/batch-01-identity-control/b01-009-bastion-consent-front.png",
        desc: "Consent boundary controller and human gatekeeper.",
      },
      {
        title: "Luma · Memory Curator",
        src: "/assets/gallery/batch-01-identity-control/b01-007-luma-folio-sorting.png",
        desc: "Semantic folio organizer across memory vaults.",
      },
    ],
  },
  {
    id: 2,
    title: "Six Semantic Memory Vaults",
    focus: "Physicalized architectural chambers for Strategic, Technical, Operational, Creative, Wisdom, and Horizon memory.",
    folder: "batch-02-memory-architecture",
    sampleImages: [
      {
        title: "Strategic Vault ◆",
        src: "/assets/gallery/batch-02-memory-architecture/b02-011-strategic-vault.png",
        desc: "Decisions, trade-offs, and long-horizon stakes.",
      },
      {
        title: "Technical Vault ⬡",
        src: "/assets/gallery/batch-02-memory-architecture/b02-012-technical-vault.png",
        desc: "Proven patterns, schemas, and sandbox receipts.",
      },
      {
        title: "Operational Vault ▸",
        src: "/assets/gallery/batch-02-memory-architecture/b02-013-operational-vault.png",
        desc: "Execution workflows, active run states, and runbooks.",
      },
      {
        title: "Creative Vault ✧",
        src: "/assets/gallery/batch-02-memory-architecture/b02-014-creative-vault.png",
        desc: "Aesthetic tokens, lore, and voice calibrations.",
      },
      {
        title: "Wisdom Vault ◎",
        src: "/assets/gallery/batch-02-memory-architecture/b02-015-wisdom-vault.png",
        desc: "Cross-domain synthesis and dreaming distillations.",
      },
      {
        title: "Horizon Vault ↗",
        src: "/assets/gallery/batch-02-memory-architecture/b02-016-horizon-vault.png",
        desc: "Append-only future ledger and emerging signals.",
      },
    ],
  },
  {
    id: 3,
    title: "Human Authority & Governance Gates",
    focus: "Tangible physical controls for consent levers, irreversible actions, and visible refusals.",
    folder: "batch-03-human-authority",
    sampleImages: [
      {
        title: "Consent Lever",
        src: "/assets/gallery/batch-03-human-authority/b03-021-consent-lever.png",
        desc: "Explicit operator permission before external dispatch.",
      },
      {
        title: "Reversible Release",
        src: "/assets/gallery/batch-03-human-authority/b03-023-reversible-release.png",
        desc: "Safe state checkpointing before risky mutations.",
      },
      {
        title: "Human Override",
        src: "/assets/gallery/batch-03-human-authority/b03-026-human-override.png",
        desc: "Unconditional operator veto across the fleet.",
      },
      {
        title: "Refusal as a Function",
        src: "/assets/gallery/batch-03-human-authority/b03-027-refusal-is-a-function.png",
        desc: "Transparent boundaries where models decline out-of-scope tasks.",
      },
    ],
  },
  {
    id: 4,
    title: "Evidence Lab & Empirical Evals",
    focus: "Scientific measurement trays, regression corridors, and verifiable proof before promotion.",
    folder: "batch-04-evidence-lab",
    sampleImages: [
      {
        title: "Measurement Before Claim",
        src: "/assets/gallery/batch-04-evidence-lab/b04-031-measurement-before-claim.png",
        desc: "Empirical benchmark before capability upgrades.",
      },
      {
        title: "Falsifier Tray",
        src: "/assets/gallery/batch-04-evidence-lab/b04-032-falsifier-tray.png",
        desc: "Testing assumptions against edge failure conditions.",
      },
      {
        title: "Evidence Receipt",
        src: "/assets/gallery/batch-04-evidence-lab/b04-034-evidence-receipt.png",
        desc: "Immutable JSON receipt of agent actions and outcomes.",
      },
    ],
  },
  {
    id: 6,
    title: "Ten Intelligence Systems (10-IS)",
    focus: "Modular intelligence domains: Self, Wealth, Family, Business, Creator, Second Brain, Code, Voice/Video, Brand, Health.",
    folder: "batch-06-intelligence-systems",
    sampleImages: [
      {
        title: "Self / Genius IS",
        src: "/assets/gallery/batch-06-intelligence-systems/b06-051-self-is-seed.png",
        desc: "Core identity, zone of genius, and unique operator judgment.",
      },
      {
        title: "Second Brain IS",
        src: "/assets/gallery/batch-06-intelligence-systems/b06-056-second-brain-is-harvest.png",
        desc: "Capture and recall system that compounds across sessions.",
      },
      {
        title: "Business IS",
        src: "/assets/gallery/batch-06-intelligence-systems/b06-054-business-is-loop.png",
        desc: "Autonomous revenue modeling and operational governance.",
      },
      {
        title: "Code IS",
        src: "/assets/gallery/batch-06-intelligence-systems/b06-057-code-is-proof.png",
        desc: "Self-healing harnesses, MCP bridges, and automated verification.",
      },
    ],
  },
  {
    id: 7,
    title: "Command Tiers & Sovereignty",
    focus: "Hierarchical council structure: Front-Door, Excavation, Leadership, Specialist, Foundation, Alliance.",
    folder: "batch-07-command-tiers",
    sampleImages: [
      {
        title: "Front-Door Intake Tier",
        src: "/assets/gallery/batch-07-command-tiers/b07-061-front-door-tier.png",
        desc: "First-contact routing and zero-terminal handoff.",
      },
      {
        title: "Leadership Council Tier",
        src: "/assets/gallery/batch-07-command-tiers/b07-063-leadership-tier.png",
        desc: "Prime, Orchestrator, and Architect council consensus.",
      },
      {
        title: "Sovereignty Layer",
        src: "/assets/gallery/batch-07-command-tiers/b07-067-sovereignty-layer.png",
        desc: "Unrevokable cryptographic attestation and local data sovereignty.",
      },
    ],
  },
];

export const VAULT_PLATES: Record<string, { plateUrl: string; name: string; symbol: string; accent: string; description: string }> = {
  strategic: {
    plateUrl: "/assets/gallery/batch-02-memory-architecture/b02-011-strategic-vault.png",
    name: "Strategic Vault",
    symbol: "◆",
    accent: "#a78bfa",
    description: "Decisions made, architectural forks, timing rationale, and post-outcome reviews.",
  },
  technical: {
    plateUrl: "/assets/gallery/batch-02-memory-architecture/b02-012-technical-vault.png",
    name: "Technical Vault",
    symbol: "⬡",
    accent: "#22d3ee",
    description: "Empirically verified code patterns, schema standards, and sandbox test fixtures.",
  },
  operational: {
    plateUrl: "/assets/gallery/batch-02-memory-architecture/b02-013-operational-vault.png",
    name: "Operational Vault",
    symbol: "▸",
    accent: "#34d399",
    description: "Fleet runbooks, session handoff receipts, and active swarm execution logs.",
  },
  creative: {
    plateUrl: "/assets/gallery/batch-02-memory-architecture/b02-014-creative-vault.png",
    name: "Creative Vault",
    symbol: "✧",
    accent: "#f472b6",
    description: "Voice invariants, anti-slop guidelines, aesthetic tokens, and visual canon.",
  },
  wisdom: {
    plateUrl: "/assets/gallery/batch-02-memory-architecture/b02-015-wisdom-vault.png",
    name: "Wisdom Vault",
    symbol: "◎",
    accent: "#fbbf24",
    description: "Cross-domain analogies, deep mental models, and background dreaming synthesis.",
  },
  horizon: {
    plateUrl: "/assets/gallery/batch-02-memory-architecture/b02-016-horizon-vault.png",
    name: "Horizon Vault",
    symbol: "↗",
    accent: "#fb7185",
    description: "Append-only 100-year vision ledger, emerging signals, and moonshot opportunities.",
  },
};
