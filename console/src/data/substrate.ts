/**
 * Substrate data — the things to visualize in the Console.
 *
 * Sources of truth:
 *   - vaults: ../../memory/vaults/*.md (six canonical vaults)
 *   - verticals: ../../VERTICALS.md (sovereign verticals registry)
 *
 * Positions are computed in the scene component (orbital rings); the
 * optional `position` field is reserved for future hand-placed overrides.
 */

export type Vec3 = [number, number, number];

export interface VaultNode {
  id: string;
  name: string;
  /** Hex color used for emissive material + label */
  color: string;
  /** Single-glyph label, used as a glyph badge in 3D */
  glyph: string;
  /** One-line description, surfaced on hover in later versions */
  desc: string;
  position?: Vec3;
}

export interface VerticalNode {
  id: string;
  name: string;
  color: string;
  glyph: string;
  desc: string;
  /** Private verticals render dimmed and never label publicly */
  private?: boolean;
  position?: Vec3;
}

/**
 * Six vaults — strategic, technical, creative, operational, wisdom, horizon.
 * Colors form an iridescent ring (violet → cyan → emerald → gold → magenta → indigo).
 */
export const vaults: VaultNode[] = [
  {
    id: "strategic",
    name: "Strategic",
    color: "#a78bfa", // violet
    glyph: "S",
    desc: "Past decisions and their outcomes.",
  },
  {
    id: "technical",
    name: "Technical",
    color: "#67e8f9", // cyan
    glyph: "T",
    desc: "Proven patterns and architectures.",
  },
  {
    id: "creative",
    name: "Creative",
    color: "#f0abfc", // magenta
    glyph: "C",
    desc: "Ideas, inspirations, creative insights.",
  },
  {
    id: "operational",
    name: "Operational",
    color: "#34d399", // emerald
    glyph: "O",
    desc: "Current system state and metrics.",
  },
  {
    id: "wisdom",
    name: "Wisdom",
    color: "#fbbf24", // gold
    glyph: "W",
    desc: "Timeless principles and meta-knowledge.",
  },
  {
    id: "horizon",
    name: "Horizon",
    color: "#818cf8", // indigo
    glyph: "H",
    desc: "Human hopes and AGI alignment vision.",
  },
];

/**
 * Ten sovereign verticals from VERTICALS.md.
 * Family IS and Spiritual IS are marked private — visible as dimmed nodes
 * without public-facing labels, honoring the substrate's sovereignty clause.
 */
export const verticals: VerticalNode[] = [
  {
    id: "arcanea",
    name: "Arcanea",
    color: "#c084fc",
    glyph: "A",
    desc: "Fiction, game, world-building. Canon-defining.",
  },
  {
    id: "frankx",
    name: "FrankX",
    color: "#f0abfc",
    glyph: "F",
    desc: "Personal architect brand, protocol thought leadership.",
  },
  {
    id: "anime-legends",
    name: "Anime Legends",
    color: "#fb7185",
    glyph: "N",
    desc: "Anime-aesthetic fiction + character design.",
  },
  {
    id: "gencreator",
    name: "GenCreator",
    color: "#fbbf24",
    glyph: "G",
    desc: "Community + movement layer for SIP-adopting creators.",
  },
  {
    id: "creator-is",
    name: "Creator IS",
    color: "#facc15",
    glyph: "K",
    desc: "Creator economics playbook, distribution, catalog.",
  },
  {
    id: "wealth-is",
    name: "Wealth IS",
    color: "#34d399",
    glyph: "$",
    desc: "Disruptive Passive Income, capital architecture.",
  },
  {
    id: "music-is",
    name: "Music IS",
    color: "#22d3ee",
    glyph: "M",
    desc: "Catalog compounding, sync licensing, artist stack.",
  },
  {
    id: "vibe-os",
    name: "Vibe OS",
    color: "#67e8f9",
    glyph: "V",
    desc: "State engineering, ritual stack, chronotype architecture.",
  },
  {
    id: "family-is",
    name: "Family IS",
    color: "#94a3b8",
    glyph: "·",
    desc: "Multi-generational infrastructure (private).",
    private: true,
  },
  {
    id: "spiritual-is",
    name: "Spiritual IS",
    color: "#94a3b8",
    glyph: "·",
    desc: "Consciousness practice integration (private).",
    private: true,
  },
];
