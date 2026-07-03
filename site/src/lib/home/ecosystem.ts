export type EcosystemTier = "hub" | "core" | "satellite";

export type EcosystemNode = {
  id: string;
  label: string;
  repo: string; // github.com/frankxai/<repo>
  desc: string;
  tier: EcosystemTier;
  accent: "violet" | "cyan" | "gold";
  /** Position in the constellation SVG viewBox (0-100). */
  x: number;
  y: number;
};

export const ECOSYSTEM_NODES: EcosystemNode[] = [
  {
    id: "sis",
    label: "Starlight Intelligence System",
    repo: "Starlight-Intelligence-System",
    desc: "Substrate hub — SIP protocol, 6 vaults, attestation, MCP server.",
    tier: "hub",
    accent: "violet",
    x: 50,
    y: 50,
  },
  {
    id: "acos",
    label: "Agentic Creator OS",
    repo: "Agentic-Creator-OS",
    desc: "Implementation layer — 90+ skills, 38 agents, swarm topologies.",
    tier: "core",
    accent: "cyan",
    x: 22,
    y: 30,
  },
  {
    id: "arcanea",
    label: "Arcanea",
    repo: "arcanea",
    desc: "Universe layer — Guardian agents, Ten Gates, creator-IP infra.",
    tier: "core",
    accent: "gold",
    x: 78,
    y: 30,
  },
  {
    id: "arcanea-flow",
    label: "arcanea-flow",
    repo: "arcanea-flow",
    desc: "Orchestration flows built on the substrate.",
    tier: "satellite",
    accent: "cyan",
    x: 10,
    y: 58,
  },
  {
    id: "library-os",
    label: "library-os",
    repo: "library-os",
    desc: "Narrative library and knowledge surfaces.",
    tier: "satellite",
    accent: "gold",
    x: 90,
    y: 58,
  },
  {
    id: "prompt-library",
    label: "prompt-library",
    repo: "prompt-library",
    desc: "Curated prompt systems, SIP-attested.",
    tier: "satellite",
    accent: "violet",
    x: 25,
    y: 78,
  },
  {
    id: "prompt-engine",
    label: "prompt-engine",
    repo: "prompt-engine",
    desc: "Programmatic prompt compilation.",
    tier: "satellite",
    accent: "cyan",
    x: 41,
    y: 88,
  },
  {
    id: "second-brain-os",
    label: "second-brain-os",
    repo: "second-brain-os",
    desc: "Capture and recall across sessions.",
    tier: "satellite",
    accent: "violet",
    x: 59,
    y: 88,
  },
  {
    id: "sentinel",
    label: "sentinel",
    repo: "sentinel",
    desc: "Governance and policy watch layer.",
    tier: "satellite",
    accent: "gold",
    x: 75,
    y: 78,
  },
  {
    id: "starlight-evals",
    label: "starlight-evals",
    repo: "starlight-evals",
    desc: "Traceable evals and proof packets.",
    tier: "satellite",
    accent: "cyan",
    x: 8,
    y: 14,
  },
  {
    id: "starlight-voice",
    label: "starlight-voice",
    repo: "starlight-voice",
    desc: "Multimodal voice capture with provenance.",
    tier: "satellite",
    accent: "violet",
    x: 92,
    y: 14,
  },
  {
    id: "horizon-dataset",
    label: "horizon-dataset",
    repo: "starlight-horizon-dataset",
    desc: "Horizon research dataset.",
    tier: "satellite",
    accent: "gold",
    x: 50,
    y: 8,
  },
];

/** Wires: every node connects back to the SIS hub; core tier cross-links. */
export const ECOSYSTEM_LINKS: Array<[string, string]> = [
  ["sis", "acos"],
  ["sis", "arcanea"],
  ["sis", "arcanea-flow"],
  ["sis", "library-os"],
  ["sis", "prompt-library"],
  ["sis", "prompt-engine"],
  ["sis", "second-brain-os"],
  ["sis", "sentinel"],
  ["sis", "starlight-evals"],
  ["sis", "starlight-voice"],
  ["sis", "horizon-dataset"],
  ["acos", "arcanea"],
  ["acos", "starlight-evals"],
  ["arcanea", "arcanea-flow"],
  ["arcanea", "library-os"],
];

export const ACCENT_HEX: Record<EcosystemNode["accent"], string> = {
  violet: "#a78bfa",
  cyan: "#67e8f9",
  gold: "#fbbf24",
};

export const GITHUB_ORG = "https://github.com/frankxai";
