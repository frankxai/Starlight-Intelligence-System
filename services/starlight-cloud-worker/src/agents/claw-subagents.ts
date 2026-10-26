/**
 * ArcaneaClaw Agent SDK Subagent Definitions & Maestro Event Router
 * Folded from archived `frankxai/arcanea-claw` into the canonical Starlight Edge Substrate.
 *
 * Maps the 5 Claw engines (`media`, `forge`, `herald`, `scout`, `scribe`) and 35 skills
 * into stateless Agent SDK subagents with Doctrine 0 human gates on spend/mint/publish actions.
 */

export type ClawRole = 'media' | 'forge' | 'herald' | 'scout' | 'scribe';

export type ModelTier = 'haiku' | 'sonnet' | 'opus';

export interface SubagentDefinition {
  name: string;
  role: ClawRole;
  description: string;
  modelTier: ModelTier;
  systemPrompt: string;
  skills: string[];
  humanGatedSkills: string[];
  emitsEvents: string[];
  subscribesEvents: string[];
}

export const CLAW_SUBAGENTS: Record<ClawRole, SubagentDefinition> = {
  media: {
    name: 'arcanea-media-claw',
    role: 'media',
    description:
      'Visual & audio media processing pipeline: scans, classifies, scores taste, processes images/video/audio, and stages CDN uploads.',
    modelTier: 'sonnet',
    systemPrompt: [
      'You are Arcanea Media Claw, a specialist subagent in the Starlight/Arcanea fleet.',
      'Execute media scanning, classification, taste scoring (0-100), WebP conversion, and staging.',
      'Enforce CANON_LOCKED visual rules and anti-slop filters on all assets.',
      'Stage approved assets (score >= 80) for upload; never execute paid API spend without an approved plan.',
    ].join(' '),
    skills: [
      'media-scan',
      'media-classify',
      'taste-score',
      'media-process',
      'media-dedup',
      'media-upload',
      'social-prep',
      'notify',
      'gemini-vision-taste',
      'video-reel-gen',
      'audio-synthesis',
    ],
    humanGatedSkills: [],
    emitsEvents: ['hero_generated', 'media_staged', 'taste_scored'],
    subscribesEvents: ['canon_character_updated', 'lore_chapter_published'],
  },

  forge: {
    name: 'arcanea-forge-claw',
    role: 'forge',
    description:
      'NFT & on-chain collection forge: generates trait metadata, renders PFP composites, validates rarity, and stages IPFS/mint payloads behind Doctrine 0 human gates.',
    modelTier: 'opus',
    systemPrompt: [
      'You are Arcanea Forge Claw, responsible for NFT collection forging and rarity validation.',
      'DOCTRINE 0 MANDATE: You may compose traits, validate rarity distributions, and stage IPFS bundles,',
      'but `nft-mint-batch` and any wallet/contract execution MUST halt in `staged_for_human_approval`.',
    ].join(' '),
    skills: [
      'nft-forge-Compose',
      'nft-rarity-audit',
      'ipfs-pin-bundle',
      'nft-mint-batch',
      'metadata-validate',
      'trait-sheet-gen',
    ],
    humanGatedSkills: ['nft-mint-batch'],
    emitsEvents: ['nft_forged', 'ipfs_bundle_staged'],
    subscribesEvents: ['hero_generated'],
  },

  herald: {
    name: 'arcanea-herald-claw',
    role: 'herald',
    description:
      'Social campaign drafter & cross-platform thread architect: prepares X threads, Farcaster casts, and Discord announcements for human approval.',
    modelTier: 'sonnet',
    systemPrompt: [
      'You are Arcanea Herald Claw.',
      'Draft platform-native campaigns, threads, and community dispatches using the registered brand voice.',
      'DOCTRINE 0 MANDATE: All external social publishing (`social-publish`, `campaign-schedule`, `discord-announce`)',
      'must be staged in the approval queue — never auto-published to public channels.',
    ].join(' '),
    skills: [
      'social-draft-thread',
      'social-publish',
      'discord-announce',
      'farcaster-cast-prep',
      'engagement-digest',
      'campaign-schedule',
    ],
    humanGatedSkills: ['social-publish', 'discord-announce', 'campaign-schedule'],
    emitsEvents: ['campaign_staged'],
    subscribesEvents: ['nft_forged', 'media_staged', 'intel_brief_ready'],
  },

  scout: {
    name: 'arcanea-scout-claw',
    role: 'scout',
    description:
      'Autonomous research & competitive intelligence scout: monitors AI releases, GitHub velocity, and ecosystem signals.',
    modelTier: 'haiku',
    systemPrompt: [
      'You are Arcanea Scout Claw.',
      'Scan target repositories, arXiv papers, model releases, and ecosystem benchmarks.',
      'Produce cited, factual intelligence briefs with zero fabricated metrics.',
    ].join(' '),
    skills: [
      'intel-arxiv-scan',
      'intel-github-trending',
      'competitor-watch',
      'model-release-radar',
      'sentiment-sweep',
      'signal-distill',
    ],
    humanGatedSkills: [],
    emitsEvents: ['intel_brief_ready'],
    subscribesEvents: [],
  },

  scribe: {
    name: 'arcanea-scribe-claw',
    role: 'scribe',
    description:
      'Canon lore & codex scribe: drafts chapters, validates against CANON_LOCKED.md, and synchronizes lore indices.',
    modelTier: 'opus',
    systemPrompt: [
      'You are Arcanea Scribe Claw.',
      'Draft and audit lore chapters, character sheets, and codex entries against CANON_LOCKED.md.',
      'Never mutate locked canon without an explicit `/lock-decision` human approval.',
    ].join(' '),
    skills: [
      'lore-chapter-draft',
      'canon-consistency-check',
      'codex-entry-gen',
      'dialogue-polish',
      'glossary-sync',
      'markdown-export',
    ],
    humanGatedSkills: [],
    emitsEvents: ['lore_chapter_published', 'canon_character_updated'],
    subscribesEvents: ['intel_brief_ready'],
  },
};

export interface MaestroEvent {
  eventType: string;
  sourceClaw: ClawRole;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface ExecutionStepPlan {
  skill: string;
  mode: 'autonomous' | 'human_gate_required';
}

export interface ClawExecutionPlan {
  subagent: string;
  role: ClawRole;
  modelTier: ModelTier;
  steps: ExecutionStepPlan[];
}

/**
 * Resolve which Claw subagents should be triggered when a cross-claw Maestro event fires.
 */
export function routeMaestroEvent(event: MaestroEvent): SubagentDefinition[] {
  return Object.values(CLAW_SUBAGENTS).filter((sub) =>
    sub.subscribesEvents.includes(event.eventType),
  );
}

/**
 * Partition a subagent's requested skills into autonomous vs Doctrine 0 human-gated steps.
 */
export function buildExecutionPlan(
  role: ClawRole,
  requestedSkills?: string[],
): ClawExecutionPlan {
  const def = CLAW_SUBAGENTS[role];
  if (!def) {
    throw new Error(`Unknown Claw role: ${String(role)}`);
  }
  const activeSkills = requestedSkills
    ? def.skills.filter((s) => requestedSkills.includes(s))
    : def.skills;

  const steps: ExecutionStepPlan[] = activeSkills.map((skill) => ({
    skill,
    mode: def.humanGatedSkills.includes(skill) ? 'human_gate_required' : 'autonomous',
  }));

  return {
    subagent: def.name,
    role: def.role,
    modelTier: def.modelTier,
    steps,
  };
}
