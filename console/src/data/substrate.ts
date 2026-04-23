/**
 * Substrate data — render-agnostic graph of the Starlight substrate.
 *
 * Sources of truth:
 *   - vaults: ../../memory/vaults/*.md (six canonical vaults)
 *   - verticals: ../../VERTICALS.md (sovereign verticals registry)
 *
 * v7.2 — dual view refactor
 * Positions are NO LONGER stored here. Each render layer (3D scene, 2D
 * force-graph) computes its own layout from this graph. The data layer
 * exposes nodes and edges only — single source of truth, two render forms.
 */

export type NodeKind = "core" | "vault" | "vertical";

export interface Node {
  id: string;
  name: string;
  /** Hex color used for emissive material + label */
  color: string;
  /** Single-glyph label, used as a glyph badge */
  glyph: string;
  /** One-line description, surfaced on hover */
  desc: string;
  /** Discriminator for render layers (size, ring, behavior) */
  kind: NodeKind;
  /** Private nodes render dimmed and never label publicly */
  private?: boolean;
}

export interface Edge {
  source: string;
  target: string;
  /** Optional kind: "membership" (vault/vertical → core), "compose" (vertical ↔ vertical) */
  kind?: "membership" | "compose";
}

/**
 * Synthetic core node — represents the substrate itself. Both vaults and
 * verticals connect to it. In the 3D view this is the central icosahedron;
 * in the 2D view this is the gravitational anchor of the force layout.
 */
export const core: Node = {
  id: "core",
  name: "Substrate",
  color: "#a78bfa",
  glyph: "*",
  desc: "Starlight Intelligence System — the substrate itself.",
  kind: "core",
};

/**
 * Six vaults — strategic, technical, creative, operational, wisdom, horizon.
 * Colors form an iridescent ring (violet → cyan → emerald → gold → magenta → indigo).
 */
export const vaults: Node[] = [
  {
    id: "strategic",
    name: "Strategic",
    color: "#a78bfa", // violet
    glyph: "S",
    desc: "Past decisions and their outcomes.",
    kind: "vault",
  },
  {
    id: "technical",
    name: "Technical",
    color: "#67e8f9", // cyan
    glyph: "T",
    desc: "Proven patterns and architectures.",
    kind: "vault",
  },
  {
    id: "creative",
    name: "Creative",
    color: "#f0abfc", // magenta
    glyph: "C",
    desc: "Ideas, inspirations, creative insights.",
    kind: "vault",
  },
  {
    id: "operational",
    name: "Operational",
    color: "#34d399", // emerald
    glyph: "O",
    desc: "Current system state and metrics.",
    kind: "vault",
  },
  {
    id: "wisdom",
    name: "Wisdom",
    color: "#fbbf24", // gold
    glyph: "W",
    desc: "Timeless principles and meta-knowledge.",
    kind: "vault",
  },
  {
    id: "horizon",
    name: "Horizon",
    color: "#818cf8", // indigo
    glyph: "H",
    desc: "Human hopes and AGI alignment vision.",
    kind: "vault",
  },
];

/**
 * Ten sovereign verticals from VERTICALS.md.
 * Family IS and Spiritual IS are marked private — visible as dimmed nodes
 * without public-facing labels, honoring the substrate's sovereignty clause.
 */
export const verticals: Node[] = [
  {
    id: "arcanea",
    name: "Arcanea",
    color: "#c084fc",
    glyph: "A",
    desc: "Fiction, game, world-building. Canon-defining.",
    kind: "vertical",
  },
  {
    id: "frankx",
    name: "FrankX",
    color: "#f0abfc",
    glyph: "F",
    desc: "Personal architect brand, protocol thought leadership.",
    kind: "vertical",
  },
  {
    id: "anime-legends",
    name: "Anime Legends",
    color: "#fb7185",
    glyph: "N",
    desc: "Anime-aesthetic fiction + character design.",
    kind: "vertical",
  },
  {
    id: "gencreator",
    name: "GenCreator",
    color: "#fbbf24",
    glyph: "G",
    desc: "Community + movement layer for SIP-adopting creators.",
    kind: "vertical",
  },
  {
    id: "creator-is",
    name: "Creator IS",
    color: "#facc15",
    glyph: "K",
    desc: "Creator economics playbook, distribution, catalog.",
    kind: "vertical",
  },
  {
    id: "wealth-is",
    name: "Wealth IS",
    color: "#34d399",
    glyph: "$",
    desc: "Disruptive Passive Income, capital architecture.",
    kind: "vertical",
  },
  {
    id: "music-is",
    name: "Music IS",
    color: "#22d3ee",
    glyph: "M",
    desc: "Catalog compounding, sync licensing, artist stack.",
    kind: "vertical",
  },
  {
    id: "vibe-os",
    name: "Vibe OS",
    color: "#67e8f9",
    glyph: "V",
    desc: "State engineering, ritual stack, chronotype architecture.",
    kind: "vertical",
  },
  {
    id: "family-is",
    name: "Family IS",
    color: "#94a3b8",
    glyph: "·",
    desc: "Multi-generational infrastructure (private).",
    kind: "vertical",
    private: true,
  },
  {
    id: "spiritual-is",
    name: "Spiritual IS",
    color: "#94a3b8",
    glyph: "·",
    desc: "Consciousness practice integration (private).",
    kind: "vertical",
    private: true,
  },
];

/**
 * Edges — relationships in the graph.
 *
 * Membership edges: every vault and every vertical connects to the core.
 * Compose edges: verticals that compose with each other (canon dependencies,
 * cross-IP, shared catalog). Drawn as cross-edges in 2D, suggested as faint
 * arc lines in future 3D revisions.
 */
const membershipEdges: Edge[] = [
  ...vaults.map<Edge>((v) => ({ source: v.id, target: "core", kind: "membership" })),
  ...verticals.map<Edge>((v) => ({ source: v.id, target: "core", kind: "membership" })),
];

const composeEdges: Edge[] = [
  // Anime Legends is canon-adjacent to Arcanea (shared world layer)
  { source: "anime-legends", target: "arcanea", kind: "compose" },
  // Music IS feeds Arcanea's soundtrack + canon vibrational layer
  { source: "music-is", target: "arcanea", kind: "compose" },
  // GenCreator distributes Creator IS playbooks
  { source: "gencreator", target: "creator-is", kind: "compose" },
  // FrankX is the public face of GenCreator + Creator IS
  { source: "frankx", target: "gencreator", kind: "compose" },
  // Vibe OS underpins all creative output (state architecture)
  { source: "vibe-os", target: "creator-is", kind: "compose" },
  // Wealth IS funds the long-horizon Horizon vault work
  { source: "wealth-is", target: "horizon", kind: "compose" },
];

export const edges: Edge[] = [...membershipEdges, ...composeEdges];

/** Convenience: every node in the graph (core + vaults + verticals). */
export const allNodes: Node[] = [core, ...vaults, ...verticals];

/* ------------------------------------------------------------------ */
/* Back-compat type aliases for the existing 3D scene.                */
/* The 3D scene was written against VaultNode / VerticalNode shapes;   */
/* keeping these aliases means SubstrateScene.tsx needs only minimal   */
/* changes to consume the new render-agnostic Node shape.              */
/* ------------------------------------------------------------------ */
export type VaultNode = Node;
export type VerticalNode = Node;
export type Vec3 = [number, number, number];
