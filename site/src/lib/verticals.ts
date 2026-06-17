// Built on SIP — structured data for the reference Domain Sub-Stack verticals.
// Source-of-truth for vertical metadata. Read by /verticals (index) and
// /verticals/[slug] (detail). Updates here ripple to both surfaces.

export type VerticalSlug =
  | "people-intelligence"
  | "sound-intelligence"
  | "music-is"
  | "health-intelligence";

export type Accent = "violet" | "cyan" | "fuchsia" | "emerald";

export type SubSystem = {
  name: string;
  purpose: string;
  primaryCommand: string;
};

export type VerticalAgent = {
  name: string;
  role: string;
};

export type Vertical = {
  slug: VerticalSlug;
  name: string;
  status: "live" | "live-frank-operated" | "preclinical-prerelease";
  accent: Accent;
  taglineShort: string;
  heroQuote: string;
  pillars: string[];
  counts: {
    subSystems: string;
    commands: string;
    agents: string;
  };
  subSystems: SubSystem[];
  agents: VerticalAgent[];
  quickStartSteps: string[];
  refusals: string[];
  githubBlobBase: string;
  releaseUrl?: string;
  downloadUrl?: string;
};

const VERTICAL_LIST: Vertical[] = [
  {
    slug: "health-intelligence",
    name: "Health Intelligence",
    status: "preclinical-prerelease",
    accent: "emerald",
    taglineShort:
      "Cancer detection prep, treatment discussion packets, privacy discipline, and clinician handoff. Decision support, not medical advice.",
    heroQuote:
      "Health decisions deserve organized memory, evidence freshness, privacy discipline, and clinical humility. The system prepares care conversations; clinicians make care decisions.",
    pillars: [
      "Risk",
      "Screening",
      "Diagnostics",
      "Treatment Prep",
      "Survivorship",
      "Evidence",
    ],
    counts: {
      subSystems: "6 sub-systems",
      commands: "5 commands",
      agents: "5 agents",
    },
    subSystems: [
      {
        name: "Prevention & Risk",
        purpose:
          "Family history, known risk factors, prior abnormal results, exposure inventory, and genetic-counseling questions without turning public guidance into personal advice.",
        primaryCommand: "/cancer-screening-plan",
      },
      {
        name: "Screening & Detection",
        purpose:
          "Average-risk screening checklist, gap list, follow-up ownership, and evidence-check date for clinician conversations.",
        primaryCommand: "/cancer-screening-plan",
      },
      {
        name: "Diagnostic Navigation",
        purpose:
          "Abnormal-result timeline, records request, appointment questions, and urgency handoff. No result interpretation.",
        primaryCommand: "/cancer-diagnostic-brief",
      },
      {
        name: "Treatment Planning",
        purpose:
          "Oncology discussion packet, options table, second-opinion records, clinical-trial questions, and logistics comparison.",
        primaryCommand: "/cancer-treatment-board-prep",
      },
      {
        name: "Supportive Care & Survivorship",
        purpose:
          "Side-effect tracking, follow-up questions, late-effect watch list, and treatment-summary recordkeeping.",
        primaryCommand: "/cancer-follow-up-plan",
      },
      {
        name: "Evidence & Clinician Interface",
        purpose:
          "Source ledger, validation checklist, privacy rule, safety boundary, and release review gate.",
        primaryCommand: "/cancer-second-opinion-packet",
      },
    ],
    agents: [
      {
        name: "cancer-screening-navigator",
        role: "Average-risk screening prep and gap lists; refuses personal screening orders.",
      },
      {
        name: "diagnostic-brief-builder",
        role: "Abnormal-result packets, timelines, and appointment questions; refuses result interpretation.",
      },
      {
        name: "oncology-decision-scribe",
        role: "Treatment discussion packets and second-opinion organization; refuses treatment recommendations.",
      },
      {
        name: "trial-question-builder",
        role: "Clinical trial logistics and eligibility questions; does not determine eligibility.",
      },
      {
        name: "survivorship-record-keeper",
        role: "Follow-up and late-effect recordkeeping; does not prescribe surveillance schedules.",
      },
    ],
    quickStartSteps: [
      "Read SAFETY.md before using the module; the pack is preclinical prerelease until review is logged.",
      "Pick one workflow: screening, abnormal-result brief, treatment-board prep, second-opinion packet, or follow-up plan.",
      "Copy the matching template into a private workspace; never commit real health data to public git.",
      "Add evidence-check date and clinician questions before sharing any artifact.",
      "Run VALIDATION.md before exporting or sending the summary to a care team.",
    ],
    refusals: [
      "Diagnosis or reassurance",
      "Pathology, imaging, lab, or genetic interpretation",
      "Treatment, medication, supplement, or delay recommendations",
      "Public storage of private health data",
    ],
    githubBlobBase:
      "https://github.com/frankxai/health-intelligence-system/blob/main",
    releaseUrl:
      "https://github.com/frankxai/health-intelligence-system/releases/tag/v0.1.1",
    downloadUrl:
      "https://github.com/frankxai/health-intelligence-system/releases/download/v0.1.1/health-intelligence-system-v0.1.1.zip",
  },
  {
    slug: "people-intelligence",
    name: "People Intelligence",
    status: "live",
    accent: "violet",
    taglineShort:
      "Psychologist · neuroscientist · MBA synthesis. Refuses HR theater. Every framework grounded in research.",
    heroQuote:
      "People-flourishing practiced as a science — every framework grounded in psychology and neuroscience, every system designed for sustainable excellence, every conversation honoring both the business and the person.",
    pillars: [
      "Hiring",
      "Performance",
      "Training",
      "Culture",
      "Talent",
      "Org",
    ],
    counts: {
      subSystems: "6 sub-systems",
      commands: "28 commands",
      agents: "6 agents",
    },
    subSystems: [
      {
        name: "Hiring",
        purpose:
          "Structured interview, calibration, culture-add assessment, 90-day onboarding — decision-making under uncertainty about future performance.",
        primaryCommand: "/hire-icp",
      },
      {
        name: "Performance",
        purpose:
          "Feedback rehearsal, review redesign, difficult conversations, coaching — behavior-change conversations grounded in SBI and solution-focus.",
        primaryCommand: "/perf-feedback-rehearsal",
      },
      {
        name: "Training",
        purpose:
          "Outcome-back curriculum, program design, train-the-trainer, transfer measurement — L3/L4 behavior and results as success metrics.",
        primaryCommand: "/training-curriculum",
      },
      {
        name: "Culture",
        purpose:
          "Values-ops matrix operationalizing declared culture into hire/promote/fire/reward decisions — Schein's three levels as audit engine.",
        primaryCommand: "/culture-values-ops",
      },
      {
        name: "Talent",
        purpose:
          "Burnout detection (Maslach), psychological safety (Edmondson), motivation mapping, retention architecture — team dynamics diagnostics.",
        primaryCommand: "/talent-burnout-detect",
      },
      {
        name: "Org",
        purpose:
          "Role design with decision rights, span-of-control audit, reorg trauma sequencing, succession readiness — structure as load-bearing.",
        primaryCommand: "/org-role-design",
      },
    ],
    agents: [
      {
        name: "starlight-hiring",
        role: "Structured-interview architect; calibration rigor; refusal of vibe-check and personality-assessment theater.",
      },
      {
        name: "starlight-performance",
        role: "Feedback craft and conversation voice; difficult-conversation protocol; review system redesign.",
      },
      {
        name: "starlight-training",
        role: "Outcome-back curriculum design; transfer measurement; behavior-change architecture.",
      },
      {
        name: "starlight-culture",
        role: "Systems design over slogans; values-ops as operational constraint across all five sub-systems.",
      },
      {
        name: "starlight-talent",
        role: "Clinical-depth team diagnostics; Maslach/Edmondson grounding; stay-interview cadence.",
      },
      {
        name: "starlight-org",
        role: "Structure design and reorg trauma awareness; 70%+ reorg-failure honesty in sequencing.",
      },
    ],
    quickStartSteps: [
      "Pick entry sub-system based on immediate pain (hiring new role, broken reviews, culture undefined, team strain, reorg pending).",
      "Run the daily-5 in sequence (hire-icp → perf-feedback → talent-burnout → culture-values-ops → org-role-design) to feel composition.",
      "Run one full sub-system flow end-to-end (e.g., hire-icp → hire-design → hire-calibrate → hire-debrief).",
      "Validate composition rule: culture-design + values-ops before hire-assess-fit; org-role-design before hire-icp.",
      "Log first attested artifact in MEMORY.md naming one refusal pattern the system refused to ship.",
    ],
    refusals: [
      "PIP-as-firing-cover",
      "Stack-rank performance",
      "Values-posters without ops",
      "Engagement survey as the only signal",
    ],
    githubBlobBase:
      "https://github.com/frankxai/Starlight-Intelligence-System/blob/main/verticals/people-intelligence",
  },
  {
    slug: "sound-intelligence",
    name: "Sound Intelligence",
    status: "live",
    accent: "cyan",
    taglineShort:
      "Architecture of sustained listening. Composition theory, mix physics, catalog discipline, fanbase sovereignty.",
    heroQuote:
      "Sound practiced as the architecture of sustained listening — every composition decision grounded in music theory and cognitive science, every production decision honoring the listener's nervous system, every release built so the catalog compounds rather than scatters.",
    pillars: [
      "Composition",
      "Production",
      "Catalog",
      "Performance",
      "Audience",
      "Sync",
    ],
    counts: {
      subSystems: "6 sub-systems",
      commands: "30 commands",
      agents: "6 agents",
    },
    subSystems: [
      {
        name: "Composition",
        purpose:
          "Songwriting with tension-and-release (Huron ITPRA), arrangement as architecture, lyric prosody, transition design.",
        primaryCommand: "/sound-composition-arrange",
      },
      {
        name: "Production",
        purpose:
          "Mix planning (frequency budget, gain-stage), mastering with dynamic-range preservation, vocal chain — refuses loudness war.",
        primaryCommand: "/sound-production-mix-plan",
      },
      {
        name: "Catalog",
        purpose:
          "ISRC/ISWC minting, metadata as load-bearing, version mapping, deplatform recovery — catalog as asset, not orphan singles.",
        primaryCommand: "/sound-catalog-metadata-pack",
      },
      {
        name: "Performance",
        purpose:
          "Set design (tension-and-release across 75 min), audience contract, live mix architecture, residency, broadcast prep.",
        primaryCommand: "/sound-performance-set-design",
      },
      {
        name: "Audience",
        purpose:
          "Cohort mapping (entry-point, depth, channel), list architecture, ritual design, fan stay-interviews, sovereign publishing.",
        primaryCommand: "/sound-audience-list-architecture",
      },
      {
        name: "Sync & Licensing",
        purpose:
          "Brief-fit gate (vision boundaries enforced), placement thesis, license economics, rights pack, stay-interview cadence.",
        primaryCommand: "/sound-sync-brief-fit",
      },
    ],
    agents: [
      {
        name: "starlight-sound-composition",
        role: "Composition architecture grounded in music theory and cognitive science; transitions as structure, not fade-outs.",
      },
      {
        name: "starlight-sound-production",
        role: "Mix and master as system design; loudness-war refusal; dynamic-range and transient preservation.",
      },
      {
        name: "starlight-sound-catalog",
        role: "Metadata discipline as sovereign infrastructure; ISRC architecture; version-map topology.",
      },
      {
        name: "starlight-sound-performance",
        role: "Set design as architecture; audience contract framing; broadcast-prep state management.",
      },
      {
        name: "starlight-sound-audience",
        role: "Fan relationships over algorithmic follower metrics; list architecture in practitioner voice.",
      },
      {
        name: "starlight-sound-sync",
        role: "Vision-boundary enforcement at brief-fit; rights-pack completeness; sync economics audit.",
      },
    ],
    quickStartSteps: [
      "Pick entry sub-system based on current work (writing song, mixing session, releasing track, touring, growing fanbase, pitching sync).",
      "Run the daily-5 in sequence (composition-arrange → production-mix-plan → catalog-metadata → audience-list-architecture → sync-brief-fit).",
      "Run one complete flow end-to-end (composition-score → arrange → demo for a new song; or catalog-release-plan → isrc-mint → metadata-pack for a release).",
      "Validate composition rule: arrangement before mix-plan; sample-clearance + AI-vocal-license before production-master.",
      "Log first artifact in MEMORY.md naming one refusal pattern (loudness-war, AI-impersonation, uncleared sample, sync-against-vision).",
    ],
    refusals: [
      "Loudness-war mastering",
      "AI-vocal impersonation without consent",
      "Uncleared samples shipped to release",
      "Sync placements that breach the artist's vision",
    ],
    githubBlobBase:
      "https://github.com/frankxai/Starlight-Intelligence-System/blob/main/verticals/sound-intelligence",
  },
  {
    slug: "music-is",
    name: "Music IS",
    status: "live-frank-operated",
    accent: "fuchsia",
    taglineShort:
      "Frank's operated Arcanea Records — four labels under one canon. Persona-gated green-light, royalty-cascade-at-spawn.",
    heroQuote:
      "Four labels under one canon — every release traceable to a persona, every persona traceable to a sovereign brand-graph, every green-light gated through A&R taste that refuses volume-without-canon.",
    pillars: [
      "Catalog",
      "Persona",
      "Asset",
      "Distribution",
      "Amplification",
      "Royalty",
      "A&R",
    ],
    counts: {
      subSystems: "6+1 sub-systems",
      commands: "8 commands",
      agents: "7 agents",
    },
    subSystems: [
      {
        name: "Catalog",
        purpose:
          "CSV master as source-of-truth; per-state folders (draft/released/archived); ISRC indexing; royalty-graph reference.",
        primaryCommand: "/music-song",
      },
      {
        name: "Persona",
        purpose:
          "Spawn persona with sound DNA + visual DNA + voice DNA + audience + monetization stack; canon defense; retirement.",
        primaryCommand: "/music-persona",
      },
      {
        name: "Asset",
        purpose:
          "Cover (Nano Banana), motion video (Seedance), cinematic (Higgsfield), Spotify Canvas (Remotion) — full bundle per release.",
        primaryCommand: "/music-canvas",
      },
      {
        name: "Distribution",
        purpose:
          "DistroKid (streaming), Bandcamp (direct), frankx.ai/music, Spotify Canvas, sync-library pitching per label routing.",
        primaryCommand: "/music-release",
      },
      {
        name: "Amplification",
        purpose:
          "OpenClaws agents (5 per persona: X, IG, TikTok, YT, Spotify) orchestrated via Blotato + n8n; voice-locked, frequency-capped.",
        primaryCommand: "/music-amplify",
      },
      {
        name: "Royalty Graph",
        purpose:
          "Attribution-cascade design at spawn, not retrofit; streaming, sync, NFT, fan-tier, direct revenue tracked per rail.",
        primaryCommand: "/music-release",
      },
      {
        name: "A&R Gate",
        purpose:
          "Non-waivable green-light authority. Canon-anchoring + asset-completeness check before any release ships.",
        primaryCommand: "/music-release",
      },
    ],
    agents: [
      {
        name: "music-curator",
        role: "A&R green-light gate (Opus); non-waivable over all releases; canon-anchoring and asset-completeness enforcer.",
      },
      {
        name: "music-archivist",
        role: "Catalog CRUD and hygiene (Haiku); source-of-truth maintenance; metadata tagging.",
      },
      {
        name: "persona-keeper",
        role: "One per persona (Opus); canon defense; voice-lock checks; spawn/retire discipline.",
      },
      {
        name: "music-producer",
        role: "Asset pipeline orchestration (Sonnet); cover + motion + Canvas rendering per persona/label DNA.",
      },
      {
        name: "music-distributor",
        role: "DistroKid + Bandcamp + frankx.ai/music sync (Sonnet); metadata lock; ISRC pull; sync-pitch generation.",
      },
      {
        name: "music-amplifier",
        role: "OpenClaws orchestration (Sonnet); per-platform voice-locked copy generation; frequency-cap enforcement.",
      },
      {
        name: "royalty-architect",
        role: "Royalty-cascade graph design at spawn (Sonnet); monetization-rail design; sync-deal economics.",
      },
    ],
    quickStartSteps: [
      "Lock Frank's Vibes persona name (Lumen / Aether / Dawn) and verify Spotify/Apple/YouTube availability.",
      "Begin catalog migration: run /music-song for the 46 pre-cataloged tracks from the FrankX archive.",
      "Queue first Frank Riemer release: Suno URL → catalog draft → asset bundle → /music-release gate.",
      "Draft first Alera release plan per label/persona CANON.md; plan 6 releases through gate by end of Phase 1.",
      "Run first weekly hygiene ritual (12-check Monday checklist); confirm Notion mirror setup complete.",
    ],
    refusals: [
      "Volume releases without canon anchoring",
      "Persona spawn without royalty-cascade design",
      "Voice drift from sound/visual/voice DNA",
      "Amplification posts that bypass voice-lock",
    ],
    githubBlobBase:
      "https://github.com/frankxai/Starlight-Intelligence-System/blob/main/verticals/music-is",
  },
];

export const VERTICALS = VERTICAL_LIST;

export const VERTICAL_BY_SLUG: Record<VerticalSlug, Vertical> =
  Object.fromEntries(VERTICAL_LIST.map((v) => [v.slug, v])) as Record<
    VerticalSlug,
    Vertical
  >;

export const VERTICAL_SLUGS: VerticalSlug[] = VERTICAL_LIST.map((v) => v.slug);
