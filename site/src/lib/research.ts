// Built on SIP — structured registry for SIS research artifacts.
// Source-of-truth for research metadata. Read by /research (index) and
// /research/[slug] (detail). Updates here ripple to both surfaces.
//
// Adding new research: append entry, run `node scripts/sync-research.mjs`,
// commit site/content/research/{slug}.md alongside the registry change.

export type ResearchSlug =
  | "premium-3d-memory-palace-2026-05-17"
  | "memory-foundations-2026-05";

export type ResearchTier = "substrate" | "operational" | "reference";
export type ResearchStatus = "published" | "in-progress" | "chartered";

export type Research = {
  slug: ResearchSlug;
  title: string;
  publishedAt: string; // ISO date
  tier: ResearchTier;
  status: ResearchStatus;
  /** Single-sentence summary for AEO + index cards. ~150-180 chars. */
  tldr: string;
  /** Source markdown filename under site/content/research/. */
  contentFile: string;
  /** AEO seed terms — discoverability scaffolding. */
  tags: string[];
  /** Optional accent for visual differentiation in the index. */
  accent?: "violet" | "cyan" | "fuchsia";
  /** Optional list of inline source URLs surfaced on detail page footer. */
  primarySources?: { label: string; url: string }[];
};

const RESEARCH_LIST: Research[] = [
  {
    slug: "memory-foundations-2026-05",
    title: "Memory Foundations for SIS",
    publishedAt: "2026-05-20",
    tier: "substrate",
    status: "published",
    tldr:
      "Seven memory architectures scored against a 5-axiom 10-dimension rubric. Letta MemFS and LangGraph + LangMem emerge as the head-to-head Phase 0 dog-food candidates. Anthropic Memory API rejected on model lock-in. The incumbent currently fails its own filesystem-native axiom.",
    contentFile: "memory-foundations-2026-05.md",
    tags: [
      "memory architecture",
      "mem0",
      "Letta",
      "LangGraph",
      "Cognee",
      "Zep",
      "mempalace",
      "Anthropic Memory API",
      "SIP attestation",
      "agent memory",
    ],
    accent: "violet",
    primarySources: [
      { label: "Letta MemFS docs", url: "https://docs.letta.com/letta-code/memfs" },
      { label: "LangGraph long-term memory", url: "https://docs.langchain.com/oss/python/langchain/long-term-memory" },
      { label: "Cognee", url: "https://github.com/topoteretes/cognee" },
      { label: "Zep / Graphiti", url: "https://github.com/getzep/graphiti" },
      { label: "mem0", url: "https://github.com/mem0ai/mem0" },
      { label: "Anthropic Memory tool", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool" },
    ],
  },
  {
    slug: "premium-3d-memory-palace-2026-05-17",
    title: "Premium 3D + Memory Palace Design",
    publishedAt: "2026-05-17",
    tier: "reference",
    status: "published",
    tldr:
      "Benchmark survey for SIS 3D substrate scene — Apple Liquid Glass, Linear, Bruno Simon, Active Theory, NASA Eyes, Heptabase. Twelve references, seven principles, three code-level techniques.",
    contentFile: "premium-3d-memory-palace-2026-05-17.md",
    tags: [
      "3D",
      "memory palace",
      "React Three Fiber",
      "drei",
      "MeshTransmissionMaterial",
      "Apple Liquid Glass",
      "Linear",
      "Bruno Simon",
    ],
    accent: "cyan",
  },
];

export const RESEARCH_SLUGS = RESEARCH_LIST.map((r) => r.slug);

export const RESEARCH_BY_SLUG: Record<ResearchSlug, Research> = Object.fromEntries(
  RESEARCH_LIST.map((r) => [r.slug, r])
) as Record<ResearchSlug, Research>;

/**
 * Short-slug aliases — short-form URLs that resolve to canonical dated slugs.
 * Use when sharing a research artifact externally where the dated suffix
 * would be friction (badges, QR codes, verbal references). Keep aliases stable
 * once published — they become external references.
 */
export const RESEARCH_SLUG_ALIASES: Record<string, ResearchSlug> = {
  "memory-foundations": "memory-foundations-2026-05",
};

/** All public slugs including aliases — used by generateStaticParams. */
export const RESEARCH_PUBLIC_SLUGS: string[] = [
  ...RESEARCH_SLUGS,
  ...Object.keys(RESEARCH_SLUG_ALIASES),
];

/** Resolve a public slug (canonical OR alias) to the Research entry, or undefined. */
export function resolveResearchSlug(slug: string): Research | undefined {
  if (slug in RESEARCH_BY_SLUG) {
    return RESEARCH_BY_SLUG[slug as ResearchSlug];
  }
  const canonical = RESEARCH_SLUG_ALIASES[slug];
  if (canonical) {
    return RESEARCH_BY_SLUG[canonical];
  }
  return undefined;
}

/** Index sort: most-recent first, then chartered/in-progress last. */
export function getResearchForIndex(): Research[] {
  return [...RESEARCH_LIST].sort((a, b) => {
    const statusWeight = (s: ResearchStatus) =>
      s === "published" ? 0 : s === "in-progress" ? 1 : 2;
    const sw = statusWeight(a.status) - statusWeight(b.status);
    if (sw !== 0) return sw;
    return b.publishedAt.localeCompare(a.publishedAt);
  });
}
