// ─────────────────────────────────────────────────────────────────────────────
// Starlight Knowledge Tree — Seed Graph Data
//
// Hand-authored for Stage 1. Content is derived from the four paths already
// defined in /knowledge-tree/page.tsx (AI Architect, Space Builder,
// Bio/Human Intelligence, Creator-Founder) and the progression loop
// (concept → skill → practice → artifact → evidence → contribution → quest).
//
// TODO(knowledge-tree-data): Replace or augment this seed data with a
// build-time loader that reads the frankxai/starlight-knowledge-tree repo's
// data/ directory (research maps, skill trees, open problems, contribution
// quests). Suggested approach:
//
//   Option A (static, zero-latency):
//     import graphJson from "frankxai/starlight-knowledge-tree/data/graph.json";
//     — fetch during `next build` via a custom plugin or fetch() with
//       `{ cache: "force-cache" }` in a Server Component.
//
//   Option B (thin API route):
//     GET /api/knowledge-tree → proxies the raw GitHub repo JSON.
//     Client fetches at mount; renderer degrades gracefully to the seed.
//
//   No database, no auth. The renderer (KnowledgeGraph.tsx) accepts GraphData
//   and works unchanged regardless of which option is used.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Domain,
  KnowledgeNode,
  KnowledgeEdge,
  KnowledgeGraph,
  NodesByDomain,
  NeighborMap,
} from "./schema";

// ── Domains ───────────────────────────────────────────────────────────────────

export const DOMAINS: Domain[] = [
  {
    id: "ai-architect",
    name: "AI Architect",
    accent: "cyan",
    blurb: "Design intelligence systems that compose without losing control.",
  },
  {
    id: "space-builder",
    name: "Space Builder",
    accent: "amber",
    blurb: "Move mass, energy, and information off the surface of a planet.",
  },
  {
    id: "bio-intelligence",
    name: "Bio / Human Intelligence",
    accent: "emerald",
    blurb: "Understand and extend the living, thinking substrate.",
  },
  {
    id: "creator-founder",
    name: "Creator-Founder",
    accent: "fuchsia",
    blurb: "Turn taste and systems into products people pay for.",
  },
];

// ── Nodes ─────────────────────────────────────────────────────────────────────
// Named as <domain-prefix>/<kind>/<short-slug> for legibility.
// Each domain covers the full progression loop where possible.

const AI_NODES: KnowledgeNode[] = [
  // Concepts
  {
    id: "ai/concept/information-theory",
    label: "Information Theory",
    kind: "concept",
    domainId: "ai-architect",
    summary: "Shannon entropy, compression, channel capacity — the math beneath all communication and cognition.",
  },
  {
    id: "ai/concept/distributed-systems",
    label: "Distributed Systems",
    kind: "concept",
    domainId: "ai-architect",
    summary: "Consensus, fault tolerance, CAP theorem — how components coordinate at scale.",
  },
  {
    id: "ai/concept/agent-orchestration",
    label: "Agent Orchestration",
    kind: "concept",
    domainId: "ai-architect",
    summary: "Multi-agent coordination, task routing, and emergent collective behavior.",
  },
  {
    id: "ai/concept/context-and-memory",
    label: "Context & Memory Design",
    kind: "concept",
    domainId: "ai-architect",
    summary: "Working memory, long-term vaults, retrieval-augmented generation, and state across sessions.",
  },
  // Skills
  {
    id: "ai/skill/system-decomposition",
    label: "System Decomposition",
    kind: "skill",
    domainId: "ai-architect",
    summary: "Break complex problems into composable, independently testable modules.",
  },
  {
    id: "ai/skill/prompt-and-tool-design",
    label: "Prompt & Tool Design",
    kind: "skill",
    domainId: "ai-architect",
    summary: "Craft system prompts, tool schemas, and MCP server contracts that are robust under adversarial inputs.",
  },
  {
    id: "ai/skill/evaluation-and-attestation",
    label: "Evaluation & Attestation",
    kind: "skill",
    domainId: "ai-architect",
    summary: "Design eval harnesses, red-team prompts, and attestation flows that verify claims automatically.",
  },
  {
    id: "ai/skill/retrieval-architecture",
    label: "Retrieval Architecture",
    kind: "skill",
    domainId: "ai-architect",
    summary: "Vector + graph stores, hybrid retrieval, re-ranking, and query decomposition.",
  },
  // Practice
  {
    id: "ai/practice/mcp-server-building",
    label: "Building MCP Servers",
    kind: "practice",
    domainId: "ai-architect",
    summary: "Regularly shipping Model Context Protocol servers that expose tools to agents.",
  },
  // Artifact
  {
    id: "ai/artifact/multi-agent-system",
    label: "Working Multi-Agent System",
    kind: "artifact",
    domainId: "ai-architect",
    summary: "A working multi-agent system with a memory layer and an eval suite — the Stage 1 build artifact.",
  },
  // Contribution
  {
    id: "ai/contribution/open-mcp-server",
    label: "Open-Source MCP Server",
    kind: "contribution",
    domainId: "ai-architect",
    summary: "An MCP server or reusable agent pattern published openly for others to build on.",
  },
  // Quest
  {
    id: "ai/quest/reliable-agent-autonomy",
    label: "Reliable Agent Autonomy",
    kind: "quest",
    domainId: "ai-architect",
    summary: "Open problem: how do agents maintain reliable, auditable autonomy over long horizons without drift?",
  },
];

const SPACE_NODES: KnowledgeNode[] = [
  // Concepts
  {
    id: "space/concept/orbital-mechanics",
    label: "Orbital Mechanics",
    kind: "concept",
    domainId: "space-builder",
    summary: "Kepler's laws, delta-v, Hohmann transfers — the geometry of getting from A to B in space.",
  },
  {
    id: "space/concept/propulsion-thermodynamics",
    label: "Propulsion & Thermodynamics",
    kind: "concept",
    domainId: "space-builder",
    summary: "Specific impulse, rocket equation, thermal management — the physics of thrust.",
  },
  {
    id: "space/concept/materials-science",
    label: "Materials Science",
    kind: "concept",
    domainId: "space-builder",
    summary: "Stress, fatigue, radiation hardening — choosing materials that survive the environment.",
  },
  {
    id: "space/concept/control-theory",
    label: "Control Theory",
    kind: "concept",
    domainId: "space-builder",
    summary: "PID controllers, state-space models, Kalman filters — keeping systems on trajectory.",
  },
  // Skills
  {
    id: "space/skill/trajectory-modeling",
    label: "Trajectory Modeling",
    kind: "skill",
    domainId: "space-builder",
    summary: "Model mission profiles, compute delta-v budgets, verify with simulation.",
  },
  {
    id: "space/skill/systems-engineering",
    label: "Systems Engineering",
    kind: "skill",
    domainId: "space-builder",
    summary: "Requirements flow-down, interface control, verification and validation across subsystems.",
  },
  {
    id: "space/skill/simulation-and-telemetry",
    label: "Simulation & Telemetry",
    kind: "skill",
    domainId: "space-builder",
    summary: "Build and run physics simulations; instrument systems to produce verifiable telemetry.",
  },
  // Artifact
  {
    id: "space/artifact/mission-profile",
    label: "Verified Mission Profile",
    kind: "artifact",
    domainId: "space-builder",
    summary: "A simulated mission profile with a verified delta-v budget — the Stage 1 build artifact.",
  },
  // Contribution
  {
    id: "space/contribution/open-simulation",
    label: "Open Simulation / Hardware Design",
    kind: "contribution",
    domainId: "space-builder",
    summary: "A reproducible simulation or open hardware design published for the community.",
  },
  // Quest
  {
    id: "space/quest/low-cost-launch",
    label: "Low-Cost Launch to Orbit",
    kind: "quest",
    domainId: "space-builder",
    summary: "Open problem: reach orbit reliably for under $1k/kg payload mass.",
  },
];

const BIO_NODES: KnowledgeNode[] = [
  // Concepts
  {
    id: "bio/concept/molecular-biology",
    label: "Molecular Biology",
    kind: "concept",
    domainId: "bio-intelligence",
    summary: "DNA, RNA, proteins — the central dogma and the molecular machinery of life.",
  },
  {
    id: "bio/concept/genetics-and-genome",
    label: "Genetics & the Genome",
    kind: "concept",
    domainId: "bio-intelligence",
    summary: "Inheritance, variation, CRISPR, pangenomes — reading and editing the blueprint.",
  },
  {
    id: "bio/concept/neuroscience",
    label: "Neuroscience",
    kind: "concept",
    domainId: "bio-intelligence",
    summary: "Neural circuits, synaptic plasticity, cognition — how the brain computes.",
  },
  {
    id: "bio/concept/systems-physiology",
    label: "Systems Physiology",
    kind: "concept",
    domainId: "bio-intelligence",
    summary: "Feedback loops, homeostasis, organ systems — the body as a control system.",
  },
  // Skills
  {
    id: "bio/skill/experimental-design",
    label: "Experimental Design",
    kind: "skill",
    domainId: "bio-intelligence",
    summary: "Controls, power analysis, blinding, pre-registration — how to generate trustworthy evidence.",
  },
  {
    id: "bio/skill/bioinformatics",
    label: "Bioinformatics",
    kind: "skill",
    domainId: "bio-intelligence",
    summary: "Sequence alignment, variant calling, single-cell analysis — computational biology in practice.",
  },
  {
    id: "bio/skill/statistical-inference",
    label: "Statistical Inference",
    kind: "skill",
    domainId: "bio-intelligence",
    summary: "Bayesian and frequentist methods, multiple testing correction, effect size estimation.",
  },
  // Artifact
  {
    id: "bio/artifact/analysis-notebook",
    label: "Reproducible Analysis Notebook",
    kind: "artifact",
    domainId: "bio-intelligence",
    summary: "A fully reproducible analysis notebook over an open dataset — the Stage 1 build artifact.",
  },
  // Contribution
  {
    id: "bio/contribution/open-dataset-or-method",
    label: "Open Dataset or Validated Method",
    kind: "contribution",
    domainId: "bio-intelligence",
    summary: "A shared dataset, method, or validated visual explainer others can build on.",
  },
  // Quest
  {
    id: "bio/quest/longevity-escape-velocity",
    label: "Longevity Escape Velocity",
    kind: "quest",
    domainId: "bio-intelligence",
    summary: "Open problem: extend healthy lifespan faster than aging progresses. What's the critical path?",
  },
];

const CREATOR_NODES: KnowledgeNode[] = [
  // Concepts
  {
    id: "creator/concept/audience-and-distribution",
    label: "Audience & Distribution",
    kind: "concept",
    domainId: "creator-founder",
    summary: "Algorithms, platforms, network effects — how content reaches and compounds an audience.",
  },
  {
    id: "creator/concept/product-and-pricing",
    label: "Product & Pricing",
    kind: "concept",
    domainId: "creator-founder",
    summary: "Value capture, willingness to pay, tiering — turning capability into something people buy.",
  },
  {
    id: "creator/concept/narrative-and-brand",
    label: "Narrative & Brand",
    kind: "concept",
    domainId: "creator-founder",
    summary: "Positioning, voice, signal vs. noise — the difference between content and a body of work.",
  },
  {
    id: "creator/concept/unit-economics",
    label: "Unit Economics",
    kind: "concept",
    domainId: "creator-founder",
    summary: "CAC, LTV, contribution margin — the math that determines if the business can scale.",
  },
  // Skills
  {
    id: "creator/skill/content-engineering",
    label: "Content Engineering",
    kind: "skill",
    domainId: "creator-founder",
    summary: "Systematic content production: hooks, structure, cadence, repurposing across platforms.",
  },
  {
    id: "creator/skill/offer-design",
    label: "Offer Design",
    kind: "skill",
    domainId: "creator-founder",
    summary: "Package value into offers people feel compelled to buy — positioning, framing, pricing.",
  },
  {
    id: "creator/skill/funnel-and-analytics",
    label: "Funnel & Analytics",
    kind: "skill",
    domainId: "creator-founder",
    summary: "Build measurement systems that show where the funnel leaks and what to fix.",
  },
  {
    id: "creator/skill/shipping-cadence",
    label: "Shipping Cadence",
    kind: "skill",
    domainId: "creator-founder",
    summary: "The discipline of consistent, fast iteration — weekly shipping beats monthly planning.",
  },
  // Practice
  {
    id: "creator/practice/daily-content-loop",
    label: "Daily Content Loop",
    kind: "practice",
    domainId: "creator-founder",
    summary: "Creating, publishing, and analyzing content as a daily practice — not a campaign.",
  },
  // Artifact
  {
    id: "creator/artifact/shipped-product",
    label: "Shipped Product with Revenue",
    kind: "artifact",
    domainId: "creator-founder",
    summary: "A shipped product with its first real revenue — the Stage 1 build artifact.",
  },
  // Contribution
  {
    id: "creator/contribution/open-template-or-playbook",
    label: "Open Template or Playbook",
    kind: "contribution",
    domainId: "creator-founder",
    summary: "A template, playbook, or teardown published openly for others to adapt.",
  },
  // Quest
  {
    id: "creator/quest/ai-native-product",
    label: "AI-Native Product Category",
    kind: "quest",
    domainId: "creator-founder",
    summary: "Open problem: what product categories become possible only with AI — and how do you build the first one?",
  },
];

export const NODES: KnowledgeNode[] = [
  ...AI_NODES,
  ...SPACE_NODES,
  ...BIO_NODES,
  ...CREATOR_NODES,
];

// ── Edges ─────────────────────────────────────────────────────────────────────
// Relations within and across domains. Cross-domain edges show where knowledge
// compounds across disciplines (e.g., control theory + agent orchestration).

export const EDGES: KnowledgeEdge[] = [
  // AI Architect — internal progression
  { source: "ai/concept/information-theory",      target: "ai/concept/distributed-systems",      relation: "unlocks" },
  { source: "ai/concept/distributed-systems",     target: "ai/concept/agent-orchestration",      relation: "unlocks" },
  { source: "ai/concept/agent-orchestration",     target: "ai/skill/system-decomposition",       relation: "unlocks" },
  { source: "ai/concept/context-and-memory",      target: "ai/skill/retrieval-architecture",     relation: "unlocks" },
  { source: "ai/skill/system-decomposition",      target: "ai/skill/prompt-and-tool-design",     relation: "unlocks" },
  { source: "ai/skill/prompt-and-tool-design",    target: "ai/skill/evaluation-and-attestation", relation: "unlocks" },
  { source: "ai/skill/retrieval-architecture",    target: "ai/practice/mcp-server-building",     relation: "unlocks" },
  { source: "ai/skill/evaluation-and-attestation",target: "ai/artifact/multi-agent-system",      relation: "contributes-to" },
  { source: "ai/practice/mcp-server-building",    target: "ai/artifact/multi-agent-system",      relation: "contributes-to" },
  { source: "ai/artifact/multi-agent-system",     target: "ai/contribution/open-mcp-server",     relation: "contributes-to" },
  { source: "ai/contribution/open-mcp-server",    target: "ai/quest/reliable-agent-autonomy",    relation: "contributes-to" },
  { source: "ai/concept/information-theory",      target: "ai/concept/context-and-memory",       relation: "part-of" },

  // Space Builder — internal progression
  { source: "space/concept/orbital-mechanics",        target: "space/skill/trajectory-modeling",       relation: "unlocks" },
  { source: "space/concept/propulsion-thermodynamics",target: "space/skill/systems-engineering",       relation: "unlocks" },
  { source: "space/concept/control-theory",           target: "space/skill/simulation-and-telemetry",  relation: "unlocks" },
  { source: "space/concept/materials-science",        target: "space/skill/systems-engineering",       relation: "unlocks" },
  { source: "space/skill/trajectory-modeling",        target: "space/artifact/mission-profile",        relation: "contributes-to" },
  { source: "space/skill/simulation-and-telemetry",   target: "space/artifact/mission-profile",        relation: "contributes-to" },
  { source: "space/skill/systems-engineering",        target: "space/artifact/mission-profile",        relation: "contributes-to" },
  { source: "space/artifact/mission-profile",         target: "space/contribution/open-simulation",    relation: "contributes-to" },
  { source: "space/contribution/open-simulation",     target: "space/quest/low-cost-launch",           relation: "contributes-to" },
  { source: "space/concept/orbital-mechanics",        target: "space/concept/control-theory",          relation: "part-of" },

  // Bio / Human Intelligence — internal progression
  { source: "bio/concept/molecular-biology",    target: "bio/concept/genetics-and-genome",        relation: "unlocks" },
  { source: "bio/concept/genetics-and-genome",  target: "bio/skill/bioinformatics",               relation: "unlocks" },
  { source: "bio/concept/neuroscience",         target: "bio/concept/systems-physiology",         relation: "part-of" },
  { source: "bio/concept/systems-physiology",   target: "bio/skill/experimental-design",          relation: "unlocks" },
  { source: "bio/skill/experimental-design",    target: "bio/skill/statistical-inference",        relation: "unlocks" },
  { source: "bio/skill/bioinformatics",         target: "bio/artifact/analysis-notebook",         relation: "contributes-to" },
  { source: "bio/skill/statistical-inference",  target: "bio/artifact/analysis-notebook",         relation: "contributes-to" },
  { source: "bio/artifact/analysis-notebook",   target: "bio/contribution/open-dataset-or-method",relation: "contributes-to" },
  { source: "bio/contribution/open-dataset-or-method", target: "bio/quest/longevity-escape-velocity", relation: "contributes-to" },

  // Creator-Founder — internal progression
  { source: "creator/concept/audience-and-distribution", target: "creator/skill/content-engineering",     relation: "unlocks" },
  { source: "creator/concept/product-and-pricing",       target: "creator/skill/offer-design",            relation: "unlocks" },
  { source: "creator/concept/narrative-and-brand",       target: "creator/skill/content-engineering",     relation: "unlocks" },
  { source: "creator/concept/unit-economics",            target: "creator/skill/funnel-and-analytics",    relation: "unlocks" },
  { source: "creator/skill/content-engineering",         target: "creator/practice/daily-content-loop",   relation: "unlocks" },
  { source: "creator/skill/shipping-cadence",            target: "creator/artifact/shipped-product",      relation: "contributes-to" },
  { source: "creator/skill/offer-design",                target: "creator/artifact/shipped-product",      relation: "contributes-to" },
  { source: "creator/practice/daily-content-loop",       target: "creator/artifact/shipped-product",      relation: "contributes-to" },
  { source: "creator/artifact/shipped-product",          target: "creator/contribution/open-template-or-playbook", relation: "contributes-to" },
  { source: "creator/contribution/open-template-or-playbook", target: "creator/quest/ai-native-product",  relation: "contributes-to" },
  { source: "creator/concept/audience-and-distribution", target: "creator/concept/narrative-and-brand",   relation: "part-of" },

  // Cross-domain edges — knowledge that compounds across disciplines
  { source: "ai/concept/agent-orchestration",   target: "space/skill/systems-engineering",     relation: "contributes-to" },
  { source: "space/concept/control-theory",     target: "ai/concept/agent-orchestration",      relation: "contributes-to" },
  { source: "bio/concept/systems-physiology",   target: "ai/concept/context-and-memory",       relation: "contributes-to" },
  { source: "ai/skill/evaluation-and-attestation", target: "bio/skill/experimental-design",   relation: "contributes-to" },
  { source: "creator/skill/content-engineering",   target: "ai/skill/prompt-and-tool-design", relation: "contributes-to" },
  { source: "ai/artifact/multi-agent-system",   target: "creator/artifact/shipped-product",   relation: "contributes-to" },
];

// ── Assembled graph ───────────────────────────────────────────────────────────

export const KNOWLEDGE_GRAPH: KnowledgeGraph = {
  domains: DOMAINS,
  nodes: NODES,
  edges: EDGES,
};

// ── Selectors ─────────────────────────────────────────────────────────────────

/** Group nodes by their domainId. */
export function nodesByDomain(): NodesByDomain {
  const result: NodesByDomain = {};
  for (const node of NODES) {
    if (!result[node.domainId]) result[node.domainId] = [];
    result[node.domainId].push(node);
  }
  return result;
}

/** Get direct neighbor node ids for a given node (both directions). */
export function neighbors(nodeId: string): string[] {
  const ids = new Set<string>();
  for (const edge of EDGES) {
    if (edge.source === nodeId) ids.add(edge.target);
    if (edge.target === nodeId) ids.add(edge.source);
  }
  return Array.from(ids);
}

/** Build a full neighbor map (adjacency list) for all nodes. */
export function buildNeighborMap(): NeighborMap {
  const map: NeighborMap = {};
  for (const node of NODES) {
    map[node.id] = [];
  }
  for (const edge of EDGES) {
    map[edge.source]?.push(edge.target);
    map[edge.target]?.push(edge.source);
  }
  return map;
}

/** Get a Domain by id. */
export function getDomain(domainId: string): Domain | undefined {
  return DOMAINS.find((d) => d.id === domainId);
}

/** Get a KnowledgeNode by id. */
export function getNode(nodeId: string): KnowledgeNode | undefined {
  return NODES.find((n) => n.id === nodeId);
}
