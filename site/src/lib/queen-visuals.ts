// Starlight Queen Visuals Registry
// Single place for curated excellence-tier images and sets.
// Source of truth for wiring in pages, components, and plans.
// Numbers refer to queen-premium/ (deploy) + mirrored in brand-assets/.

export const QUEEN_PREMIUM_PATH = "/assets/visuals/queen-premium";

// Core excellence tier we are shipping now (promoted 101-108 + strong classics)
export const EXCELLENCE_TIER = [101, 102, 103, 104, 105, 106, 107, 108] as const;

// Strong individual picks from the full library (hand-curated highest signal)
export const CORE_QUEEN_HEROES = [98, 95, 84, 78, 71, 67] as const;
export const CORE_SWARMS = [72, 88, 108, 92] as const;

// Research / blog hero assignments (kept in sync with VISUAL_CONTENT_PLAN + page logic)
export const RESEARCH_HEROES: Record<string, number> = {
  default: 101,
  "memory-foundations": 105,
  "premium-3d-memory-palace": 105,
  "proving-ground": 108,
  "model-arena": 104,
  "attestation-seal": 125,
  "memory-palace-schema": 126,
  "swarm-routing": 127,
  "system-architecture": 128,
};

// Brand lab / Codex studies (includes new excellence)
export const BRAND_STUDIES_BASE = [11, 12, 18, 19, 20, 21, 23, 26, 47, 48, 50, 52];
export const BRAND_STUDIES = [...BRAND_STUDIES_BASE, ...EXCELLENCE_TIER] as const;

// Star Guardian tier (promoted numeric 109-124, core + 2026-06-26 continuation)
export const STAR_GUARDIAN_TIER = [109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124] as const;

// Star Guardian tier surfaced separately for now (high-signal new aesthetic). Add to BRAND_STUDIES later after curation.
export const STAR_GUARDIAN_BRAND_STUDIES = [...STAR_GUARDIAN_TIER] as const;

// Technical / non-fiction assets (125-128)
export const TECHNICAL_ASSETS = [125, 126, 127, 128] as const;

// Chibi / character candidates (numbers that read well as approachable/agent icons)
export const CHIBI_CANDIDATES = [106, 71, 41, 44, 46, 69] as const; // 106 is promoted 71

// Core Omega Agent Codex assets (129-133)
export const CODEX_OMEGA_ASSETS = [129, 130, 131, 132, 133] as const;

// Omega Leadership & Foundation Assets (138-143)
export const CODEX_OMEGA_LEADERSHIP = [138, 139, 140, 141, 142, 143] as const;

// Sovereign System Infographics (144-146)
export const SYSTEM_INFOGRAPHICS = [144, 145, 146] as const;

// Social Media Strategy Kits (147-148)
export const SOCIAL_KITS = [147, 148] as const;

// Expansion Brand Assets (134-137)
export const EXPANSION_ASSETS = [134, 135, 136, 137] as const;

// Domain Sub-Stack Omega Agents (149-160)
export const DOMAIN_OMEGA_ASSETS = [149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160] as const;

// Expanded Swarm Fields (161-165)
export const EXPANDED_SWARM_FIELDS = [161, 162, 163, 164, 165] as const;

// Queen Narratives (166-170)
export const QUEEN_NARRATIVES = [166, 167, 168, 169, 170] as const;

// Advanced Infographics (171-174)
export const ADVANCED_INFOGRAPHICS = [171, 172, 173, 174] as const;

// Reasoning (for future agents and upper-coating systems):
// - Numbered flat library chosen for trivial consumption in React (arrays, maps, conditionals).
// - excellence-next is the staging gate; only curated bests get numeric promotion.
// - Dual tone: Sovereign (Queen + swarms) for authority. Chibi for Codex personality/likeability.
// - Always keep in sync with brand-assets/VISUALS_MANAGEMENT.md + DESIGN.md + VISUAL_CONTENT_PLAN.md.
// - When extending: define motif in DESIGN first, generate via prompts/, stage, curate, promote here, wire, deploy.

// Example usage in components:
// import { EXCELLENCE_TIER, RESEARCH_HEROES, CHIBI_CANDIDATES, QUEEN_PREMIUM_PATH } from "@/lib/queen-visuals";
// Then <img src={`${QUEEN_PREMIUM_PATH}/${id}.jpg`} />

// Star Guardian-inspired Starlight tier (2026-06-26 batch)
// Research-backed Riot splash polish (four-pointed stars, iridescent ribbons, magical girl cinematic)
// infused into Queen + swarm DNA. Staged in excellence-next/star-guardian/ as sg-*.jpg
// Curate 5-8 best → promote numeric (e.g. 109+) or keep thematic for targeted use.
// See brand-assets/prompts/visuals/STAR_GUARDIAN_STARLIGHT_PROMPTS.md
// (definition moved earlier for declaration order)

// Named references to the source staged files (for traceability and future edits)
export const STAR_GUARDIAN_SOURCES = {
  109: "sg-01-ahri-leader",
  110: "sg-02-lux-optimistic",
  111: "sg-03-jinx-chaotic",
  112: "sg-04-kaisa-tactical",
  113: "sg-05-ezreal-playful",
  114: "sg-06-team-group",
  115: "sg-07-action-battle",
  116: "sg-08-prestige-luxurious",
  117: "sg-09-chibi-codex",
  118: "sg-10-dark-prestige",
  119: "queen-weaver-memory-orbs",
  120: "queen-ledger-refined",
  121: "queen-resting-refined",
  122: "chibi-orchestrator-sg",
  123: "chibi-genius-excavator",
  124: "swarm-defensive-shield",
  125: "starlight-attestation-seal",
  126: "starlight-memory-palace-schema",
  127: "starlight-swarm-routing",
  128: "starlight-system-architecture",
  129: "omega-orchestrator",
  130: "omega-genius",
  131: "omega-hermes",
  132: "omega-sentinel",
  133: "omega-weaver",
  134: "contemplative-queen",
  135: "ledger-proving-ground",
  136: "exploratory-swarm-field",
  137: "defensive-swarm-mesh",
  138: "omega-prime",
  139: "omega-architect",
  140: "omega-navigator",
  141: "omega-envoy",
  142: "omega-sage",
  143: "omega-social-strategist",
  144: "infographic-hierarchy",
  145: "infographic-sip-layers",
  146: "infographic-memory-orbs",
  147: "social-queens-edict",
  148: "social-swarm-heart",
  149: "omega-bio-architect",
  150: "omega-longevity-sage",
  151: "omega-metabolic-sentinel",
  152: "omega-neural-weaver",
  153: "omega-sound-composer",
  154: "omega-audio-producer",
  155: "omega-sync-strategist",
  156: "omega-resonance-analyst",
  157: "omega-culture-strategist",
  158: "omega-talent-scout",
  159: "omega-performance-coach",
  160: "omega-org-architect",
  161: "creative-swarm-matrix",
  162: "measure-swarm-grid",
  163: "healing-swarm-lattice",
  164: "resonance-swarm-wave",
  165: "ledger-swarm-archive",
  166: "the-queen-conducting",
  167: "the-queen-weaving",
  168: "the-queen-resting",
  169: "the-queen-archiving",
  170: "the-queen-healing",
  171: "domain-sub-stack-topology",
  172: "the-proving-ground-flow",
  173: "the-veil-gateway",
  174: "the-144-agent-blueprint",
} as const;

export const STAR_GUARDIAN_EDITS = ["sg-edit-01-ahri-on-98", "sg-edit-02-chibi-on-71-84"] as const;

export const STAR_GUARDIAN_BATCH2 = [119,120,121,122,123,124,125,126,127,128] as const; // Batch-2: resting Queen, Genius chibi, swarm defensive, battle Queen, Hermes chibi, hierarchy infographic, social chibi, team group, weaving Queen, dark Nemesis. See batch-2/ prompts.

// Future: Add per-agent visual metadata, domain motifs, or full VisualAsset type when scale demands it.
// For now this light registry prevents magic numbers and makes the system understandable end-to-end.

export const ALL_EXCELLENCE_RECOMMENDED = [...EXCELLENCE_TIER, ...CORE_QUEEN_HEROES, ...CORE_SWARMS, ...STAR_GUARDIAN_TIER, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174] as const;

/**
 * Resolve research hero ID from slug or key.
 * Handles full slugs, aliases, and partial matches for flexibility.
 * Source of truth for research wiring (see research/[slug]/page.tsx).
 */
export function getResearchHeroId(slugOrKey: string): number {
  const normalized = slugOrKey.toLowerCase();
  for (const [key, id] of Object.entries(RESEARCH_HEROES)) {
    if (normalized.includes(key.toLowerCase())) {
      return id;
    }
  }
  return RESEARCH_HEROES.default || 101;
}

// Full current numeric range available in queen-premium (for reference / future grids)
export const ALL_AVAILABLE = Array.from({ length: 92 - 11 + 1 }, (_, i) => 11 + i)
  .filter(n => ![29,30,31,32,33,96].includes(n)) // known gaps
  .concat(EXCELLENCE_TIER as unknown as number[])
  .concat([...STAR_GUARDIAN_TIER])
  .concat([125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174]);

// Note: Star Guardian batch currently lives as thematic sg- files in excellence-next/star-guardian/
// until specific winners are promoted to new numeric IDs and mirrored to queen-premium/.

// Usage notes:
// - Prefer EXCELLENCE_TIER + CORE_* for new work.
// - Research heroes use the map above (updated in research/[slug]/page.tsx).
// - Brand studies / grids use BRAND_STUDIES or CHIBI_CANDIDATES as appropriate.
// - When adding more: generate → drop in excellence-next/ → curate → promote to numeric + add here.

// Star Guardian tier usage example:
// import { STAR_GUARDIAN_TIER, STAR_GUARDIAN_BRAND_STUDIES, QUEEN_PREMIUM_PATH } from "@/lib/queen-visuals";
// Then map over STAR_GUARDIAN_TIER for grids or dedicated galleries.

export type QueenVisualId = number;