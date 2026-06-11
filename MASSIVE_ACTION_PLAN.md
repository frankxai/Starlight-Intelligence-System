# MASSIVE ACTION PLAN — Starlight Intelligence Office (v1)

> Single canonical directive for Frank + every coding agent (Claude Code, Codex, Gemini CLI, OpenCode, MCO).
> Status: ACCEPTED 2026-04-25 by frankxai.
> Layer: substrate (touches SIP, alliance, all brands, attestation).
> Voice: architect (per VOICES.md).
> This file supersedes any informal plan in chat. Reconcile, don't fork.

---

## 0. Frame

**Category we're building:** From AI tool use to intelligence system design.

**One sentence:** Three acquisition surfaces (Score / Passport / Cards) funnel into one private intelligence office (Starlight Orchestrator) that routes ten Intelligence Systems across four CLIs, two physical machines, one phone, one local voice room, one cloud mirror, and a temporal memory graph that lights up by recency × relevance × emotional salience × strategic weight.

**Decision posture:** Build the spine, not the chrome. Every primitive that already exists locally (audited 2026-04-25) gets extended; nothing gets rewritten unless dead. New primitives only where audit confirmed vapor.

**Non-negotiables:**
- Local-first capture. Cloud is mirror, never source of truth.
- Consented recording. Emotion is metadata, not verdict.
- Frank's voice everywhere. No generic enterprise tone, no spiritual gloss, no Jarvis cosplay.
- Every artifact carries ambient SIP attestation. No exceptions.
- One canonical name per concept. Aliases are deprecation hazards.

---

## 1. The Spine — three surfaces, one substrate

| Surface | Brand home | Function | Single question it answers |
|---|---|---|---|
| **FrankX Intelligence Score** | frankx.ai | Identity diagnosis + lead capture | "What kind of intelligence system are you becoming?" |
| **Arcanea Guardian Passport** | arcanea.ai | Symbolic onboarding + creator identity | "Which creative force do you build from?" |
| **Starlight Agent Cards** | starlight.systems (or sis subdomain) | Architecture explanation + productized roles | "Which agents belong in your system?" |

Score diagnoses the human. Passport mythologizes the creator. Cards assemble the machine. All three write to the same substrate (Starlight Memory Graph) so a person who lands at any door ends up in the same building.

**Public master frame:** *Most people use AI as a tool. The next class of creators, founders, and families will become intelligence systems.*

---

## 2. The Ten Intelligence Systems

Reconciled with existing nine universal IS layers (Substrate/Genius/Second Brain/Vision-Brand/Business/Creator/Wealth/Health/Relational). Two additions promoted from sub-domain to top-level: **Code IS** and **Voice & Video IS**. Substrate is renamed to **Orchestrator** at the top because it routes the other nine. Spiritual remains optional.

| # | Public name | Premium label | Substrate home | Existing surface |
|---|---|---|---|---|
| 1 | Self IS | Founder Performance Intelligence | `verticals/self/` | Genius layer + starlight-embodiment agent |
| 2 | Wealth IS | Capital & Deal Intelligence | `verticals/wealth/` | wealth-dpi command exists |
| 3 | Family IS | Family Office Intelligence | `verticals/family/` | Relational layer (rename) |
| 4 | Business IS | Executive Operating Intelligence | `verticals/business/` | starlight-business agent |
| 5 | Creator IS | Media & Influence Intelligence | `verticals/creator/` | GenCreator + creator-pipeline cmd |
| 6 | Second Brain IS | Private Knowledge Intelligence | `verticals/secondbrain/` | starlight-secondbrain + Brain Atlas v2 |
| 7 | Code IS | Product & Automation Intelligence | `verticals/code/` | NEW — extends /arco + /ao |
| 8 | Voice & Video IS | Narrative Media Intelligence | `verticals/voice-video/` | NEW — frankx-talking-head as seed |
| 9 | Brand IS | Reputation & Positioning Intelligence | `verticals/brand/` | Vision-Brand layer (rename) |
| 10 | **Starlight Orchestrator** | Private Intelligence Office | `core/orchestrator/` | NEW master layer (consolidates orchestration) |

**Each IS carries the same five sections:** purpose, signature agents, premium promise, inputs, outputs. Templates live at `verticals/_template/` once Phase 1 ships.

---

## 3. The Orchestrator — naming locked, posture explicit

**Canonical name:** Starlight Orchestrator. Use everywhere, public and internal.
**Premium label:** Private Intelligence Office.
**Killed names:** Jarvis (cultural-reference only, never branded), SIS Conductor, Sovereign Console, Starlight Core, Arcanean Command Layer.

**Posture:** *A traditional assistant waits for instructions. A private intelligence office detects what matters, prepares the decision, and routes execution.*

**Two operating modes:**
1. **Advisory** — briefs, plans, scripts, summaries, recommendations. No side effects.
2. **Execution** — calls Claude Code / Codex / Gemini CLI / OpenCode / GitHub / Vercel / Supabase / n8n / Notion / Drive / local FS. Every execution path carries an explicit approval gate or a pre-approved scope (e.g. `/ao` config).

**Routing chain (today, shipped):** `/arco` (brand router) → `/ao` (CLI router) → Guardian agent (domain). Audited present in FrankX `.claude/commands/` and Arcanea `.arcanea/agents/`.

**Routing chain (target, Phase 2):** Voice or text intent → Starlight Orchestrator → Memory Graph context fetch → IS team selection → CLI routing → execution → log → graph write-back → daily brief.

---

## 4. Multi-CLI Harness — the central command layer

The single CLI Frank should type into is `starlight`. It wraps and orchestrates the model CLIs (Claude Code primary + Codex adversary + Gemini long-context + OpenCode latency + Antigravity agent swarm execution).

| CLI | Role in harness | Routing rule |
|---|---|---|
| **Claude Code** | Primary. Substrate edits, architecture, long-form code, agent orchestration. | Default for any task touching SIS, brand-critical writes, or > 200 LOC changes. |
| **Codex CLI** (OpenAI) | Adversary + security audit + alternative perspective. | Triggered for `/ao` adversary mode, security-review, second-pair on architecture decisions. |
| **Gemini CLI** | Long-context document grokking, modernization passes, large repo summarization. | 1M-context jobs, multi-repo cross-references, codebase-wide refactor planning. |
| **OpenCode** (Groq Llama 4 Scout, free) | Quick checks, research scratchpad, latency-bound queries. | Anything <30s round-trip, free-tier-acceptable. |

**Implementation:**
- `arcanea-orchestrator/` already has the routing scaffolding (audited, v0.1.0 local, NOT on npm — memory was stale). Promote to canonical and rename package to `@starlight/orchestrator` aligned with the Orchestrator IS.
- Extend `/ao` command to expose `starlight` as a global shell alias on both Lenovo + Acer.
- Each CLI gets its own agent harness folder under `core/orchestrator/harnesses/{claude,codex,gemini,opencode,antigravity}/` with: system prompt, README (escalation), MCP/allowlist (Antigravity's live at `.antigravity/` platform level for swarm reuse). Antigravity harness added for native parallel swarm swarm execution (2026-06-02).
- `mco` (the open-source primitive identified) is the reference for the routing logic. Either fork it or absorb its routing patterns into the existing orchestrator.

---

## 5. Capture Stack — local-first second brain

**Audited absent:** screenpipe, mem0, graphiti, meetscribe, Syncthing, ElevenLabs. All Phase 1 net-new.

**Adopt these primitives (in order of dependency):**

| Layer | Primitive | Repo | Role |
|---|---|---|---|
| Continuous capture | **screenpipe** | mediar-ai/screenpipe | Screen + audio + searchable digital exhaust on both machines |
| Meeting capture | **meetscribe** or **Meetily** | pretyflaco/meetscribe | Diarized transcription, summary, decisions extraction |
| Camera + self-reaction | Custom thin layer | (build) | Webcam snapshot on event triggers + voice prosody score + manual `mattered` shortcut |
| STT | Groq Whisper-large-v3 | groq.com | <1s transcription for live voice |
| TTS | ElevenLabs | elevenlabs.io | Premium voice for Orchestrator output |
| Wake word + local room | **HavenCore** or **OpenJarvis** | ProjectHavenCore/HavenCore-Voice | Local voice loop, no cloud dependency for activation |
| Memory abstraction | **Mem0** | mem0ai/mem0 | Per-agent memory layer |
| Temporal graph | **Graphiti** | getzep/graphiti | Time-aware knowledge graph (the "neural constellation") |
| Vault format | Markdown + frontmatter | (existing wiki/) | Durable human-readable layer, source of truth |

**Architectural principle:** Markdown vault is canonical. Mem0 + Graphiti are derived indices. If they corrupt or get replaced, regenerate from the vault. Never the reverse.

---

## 6. Memory Graph — Starlight Memory Graph + Neural Constellation

**Name:** Starlight Memory Graph (substrate). Neural Constellation (UI/visualization).

**Already shipped (extend, don't rebuild):**
- 12-domain canonical ontology in Brain Atlas v2 (memory-confirmed Apr 21).
- Cowork artifact `brain-atlas-v2-live` + standalone `arcanea-brain-3d.html` at vibeclubs.ai.
- 33-atom vault at `Arcanea/wiki/` with 12 MOCs, caps locked at 12 MOCs / 200 atoms.
- Console (Next.js, port 3001) with react-force-graph-2d + three.js.

**Extend with:**
- **Node types:** meeting, person, project, repo, idea, decision, task, emotion-state, brand, artifact, memory.
- **Edge types:** discussed_with, decided, created, referenced, reacted_to, belongs_to_brand, led_to, blocked_by, inspired, escalated_to.
- **Edge weight formula:** `weight = recency × relevance × emotional_salience × strategic_importance`.
- **Three views:** Constellation (force-directed), Meeting Replay (timeline of one meeting with energy spikes), Depth Map (raw → structured → meaning, three layers).

**Implementation home:** Console app under `console/src/views/{constellation,meeting-replay,depth-map}/`.

---

## 7. Sync Layer — Lenovo + Acer + phone, no cloud lock-in

**Goal:** identical working state across two Windows machines + Android/iOS phone, with conflict-free merging and no Microsoft/Google middleman owning the substrate.

**Stack:**
- **Syncthing** — peer-to-peer encrypted sync across all three devices. Folders: `Starlight-Intelligence-System/`, `Arcanea/wiki/`, `Arcanea/.arcanea/`, `FrankX/content/`, `FrankX/data/`, `Business/`, `~/captures/` (screenpipe output).
- **GitHub** — version-controlled snapshots of code-only paths. Vault stays Syncthing-only (size + sensitivity).
- **Phone capture app** — for now: voice notes via Android default → Syncthing folder. Phase 2: custom React Native capture app writing into the same vault schema.

**Anti-pattern:** Do not put the vault in OneDrive, iCloud, or Dropbox. Three reasons: PII surface, no graph awareness, no conflict-merge for markdown.

---

## 8. Voice Layer — local room + premium voice

**Local room:** HavenCore-style. Wake word ("Starlight"), Whisper-via-Groq STT (<1s), local LLM for routing intent, ElevenLabs TTS for response. Runs as Windows service, autostarts, system tray icon.

**Vercel room:** Hosted twin at `room.starlight.systems`. Same UI. Auth via passkey. Pulls from Graphiti/Mem0 over secure tunnel. Useful when away from either machine.

**Voice command primitives (Phase 2 minimum viable):**
- "Starlight, brief me." → daily brief from Graphiti
- "Starlight, what changed in [project]?" → recent activity summary
- "Starlight, route to [IS name]." → switches active workspace + agent team
- "Starlight, capture this." → starts focused recording with manual tag
- "Starlight, mark this mattered." → emotional salience boost on current context window

---

## 9. Multi-Workspace Switching — Windows virtual desktops mapped to brands

**Goal:** physical separation of brand contexts. Switching desktops switches brand voice, active agents, MCP scope, and Syncthing folder priority.

**Implementation:**
- Windows 11 virtual desktops, named: `FrankX`, `Arcanea`, `Starlight`, `Wealth`, `Family`, `Capture`.
- PowerShell script `Switch-Workspace.ps1` invoked on desktop change via VirtualDesktop module event hook. Sets `STARLIGHT_BRAND` env, points `claude` CLI to the brand-specific config in `~/.starlight/profiles/{brand}.toml`, opens default apps for that brand.
- AutoHotkey hotkeys: `Ctrl+Win+1..6` jump to a specific brand desktop and trigger the script.
- On Acer (the secondary), same script, identical mapping. Syncthing keeps profile files in sync.

---

## 10. Phased Build Order

### Phase 0 — Lock the spine (this week, Apr 25 – Apr 30)

| # | Action | Owner | Verifies |
|---|---|---|---|
| 0.1 | This file accepted | Frank | Reads + commits |
| 0.2 | Update `STACK.md` and `VERTICALS.md` to reflect 10-IS taxonomy | Claude Code | Diff + grep |
| 0.3 | Add `core/orchestrator/` directory with README pointing here | Claude Code | Path exists |
| 0.4 | Create `verticals/_template/` and stub `verticals/{code,voice-video}/` | Claude Code | Path exists |
| 0.5 | Rename `verticals/relational` → `verticals/family` (with redirect note) | Claude Code | Path exists, MEMORY updated |
| 0.6 | Memory entry: spine locked, naming locked, Jarvis killed | Claude Code | MEMORY.md entry |
| 0.7 | Slack/Notion announcement to self in Ops Hub | Frank | Notion page |

### Phase 1 — Extend the harness, install the capture stack (Apr 30 – May 14)

| # | Action | Owner | Verifies |
|---|---|---|---|
| 1.1 | Promote `arcanea-orchestrator` to `@starlight/orchestrator`, publish v0.2.0 to npm | Codex CLI | npm view |
| 1.2 | Add `harnesses/{claude,codex,gemini,opencode,antigravity}/` with system prompts + MCP/allowlist per CLI (Antigravity: platform-level mcp+allowlist + swarm-protocol + harness scaffold) | Claude Code / Antigravity for swarm | Delivered (original + 2026-06-02 Antigravity enhancement) |
| 1.3 | Install screenpipe on Lenovo + Acer, configure to write to `~/captures/screen/` | Frank + Claude Code script | Capture files appear |
| 1.4 | Install meetscribe (or Meetily), wire to `~/captures/meetings/` | Frank | Test recording transcribed |
| 1.5 | Install Mem0 (Python) + Graphiti (Python), point at `~/captures/` and `Arcanea/wiki/` | Claude Code | Graph nodes ingested |
| 1.6 | Install Syncthing on Lenovo + Acer + phone, configure folder pairs | Frank | Sync log clean across all three |
| 1.7 | First daily brief generated from Graphiti, saved to `~/captures/briefs/YYYY-MM-DD.md` | Claude Code | File exists, content non-empty |
| 1.8 | Memory entry: Phase 1 shipped + measured | Claude Code | MEMORY.md entry |

### Phase 2 — Voice room + workspace switching (May 14 – May 28)

| # | Action | Owner | Verifies |
|---|---|---|---|
| 2.1 | HavenCore-style local room running on Lenovo as service | Claude Code | Wake word triggers, ElevenLabs responds |
| 2.2 | Groq Whisper STT pipeline live, <1s round-trip | Claude Code | Bench in repo |
| 2.3 | ElevenLabs TTS wired to Orchestrator output | Claude Code | Voice playback works |
| 2.4 | Vercel room deployed at `room.starlight.systems`, passkey auth | Codex CLI | URL live |
| 2.5 | Five voice command primitives operational (brief, what-changed, route-to, capture, mark-mattered) | Claude Code | Manual test passes for each |
| 2.6 | Windows virtual desktops + Switch-Workspace.ps1 + AutoHotkey hotkeys deployed | Claude Code | Hotkey switches brand context end-to-end |

### Phase 3 — Spine surfaces shipped, public lead capture live (May 28 – Jun 18)

Critical because BV (June 1) is the cash gap. This phase has revenue stakes.

| # | Action | Owner | Verifies |
|---|---|---|---|
| 3.1 | FrankX Intelligence Score quiz live at frankx.ai/score | Claude Code on FrankX repo | URL live, 10 dimensions, 6 archetypes, email capture |
| 3.2 | Arcanea Guardian Passport flow live at arcanea.ai/passport | Claude Code on Arcanea repo | URL live, 10 Guardians mapped, first quest assigned |
| 3.3 | Starlight Agent Cards page live at starlight.systems/cards | Claude Code on SIS repo | URL live, 50 cards (5 per IS × 10 IS), filterable |
| 3.4 | 10 Intelligence Systems overview page at starlight.systems/systems | Claude Code | URL live |
| 3.5 | Premium audit landing page at starlight.systems/private | Claude Code | URL live, Calendly or Cal.com booking integrated |
| 3.6 | First 100 quiz completions captured + first audit booking | Frank (distribution) | Analytics |

### Phase 4 — Memory graph UI + the Neural Constellation public artifact (Jun 18 – Jul 15)

| # | Action | Owner | Verifies |
|---|---|---|---|
| 4.1 | Constellation view shipped in `console/` (force-directed, weighted glow) | Claude Code | Renders against live Graphiti data |
| 4.2 | Meeting Replay view (timeline + energy spikes) | Claude Code | At least one real meeting playable |
| 4.3 | Depth Map view (raw → structured → meaning) | Claude Code | Toggle works, all three layers populated |
| 4.4 | Public Neural Constellation marketing artifact (3D HTML, no auth) at starlight.systems/constellation | Claude Code | URL live, signature visual |
| 4.5 | Premium artifact set produced: 10-IS Map, Score Result Card template, Passport Card, Agent Card Deck, Orchestrator Diagram, Office Mockup, Founder Codex Mockup, Family Archive Mockup | Weaver agent (creative) | Files in `assets/marketing/` |

---

## 11. Brand Switchboard — same engine, different mask

This locks how each brand consumes the substrate without fragmentation.

| Brand | Public framing | Substrate consumption |
|---|---|---|
| **FrankX.ai** | "Become an intelligence system" | Self + Creator + Business IS, Intelligence Score as front door |
| **Starlight Intelligence Systems** | "10 private intelligence layers" | Full 10-IS substrate, Cards as front door, public doc home |
| **Arcanea** | "Magic as interface" | Creator + Voice-Video IS, Passport as front door, mythic UX layer |
| **AI Architect Academy** | "Every AI system is a team" | Code + Business IS, education content tier |
| **AI Music Academy** | "Sound as intelligence" | Voice-Video + Creator IS, sonic identity tier |
| **GenCreator** | "Build your creator OS" | Creator IS, community progression tier |
| **Starlight Private Intelligence** | "Private intelligence estate" | All 10 IS in premium labels, audit + retainer offer |

**Rule:** No brand gets its own substrate. Substrate edits go through SIS. Brand sites consume.

---

## 12. Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| Cash gap (Apr-May) before BV (Jun 1) | Critical | Phase 3 (revenue) overlaps Phase 2; spine surfaces must ship by Jun 1 |
| Memory drift (vapor claims in MEMORY.md, e.g. v1.2.1 npm) | High | Cached-belief protocol enforced; this audit corrected v0.1.0 local-only fact |
| Capture-pipeline cold (logged blocker since Apr 23) | High | Phase 1.3-1.5 explicitly addresses; no Phase 2 work until 1.7 brief verifies graph is fed |
| Multi-CLI cost spiral | Medium | OpenCode Groq for ≥50% of low-stakes routing; cost dashboard in `console/cost/` by Phase 2 |
| Consent / recording legal exposure (esp. EU, esp. Marbella retreats) | High | Recording always requires explicit verbal consent line at meeting start; meetscribe configured to refuse start without consent flag |
| Emotion-detection over-claim (treating webcam as ground truth) | Medium | Locked: emotion is metadata, not verdict. Soft signal only. No edges in graph carry emotion as fact, only as confidence-weighted attribute. |
| Brand fragmentation (each brand wanting its own substrate) | Medium | Switchboard rule enforced. Substrate-level routing kicks in for any brand-cross edit. |
| Single point of failure on Lenovo (16GB RAM, audited tight) | High | Acer is hot mirror via Syncthing. Vercel room is third leg. Local LLMs use haiku tier when RAM <2GB free. |

---

## 13. Decision Log (locks made by writing this file)

1. **Naming:** Starlight Orchestrator. Killed: Jarvis (brand), SIS Conductor, Sovereign Console.
2. **10-IS taxonomy:** Self, Wealth, Family, Business, Creator, Second Brain, Code, Voice-Video, Brand, Orchestrator (master).
3. **Spine:** Score (FrankX) + Passport (Arcanea) + Cards (Starlight). Three doors, one substrate.
4. **CLI harness:** Claude Code primary, Codex adversary/security, Gemini long-context, OpenCode quick/free. Wrapped behind `starlight` CLI alias.
5. **Capture stack:** screenpipe + meetscribe + Mem0 + Graphiti + Markdown vault canonical + Syncthing transport.
6. **Voice:** HavenCore-style local + ElevenLabs TTS + Groq Whisper STT + Vercel mirror at `room.starlight.systems`.
7. **Workspaces:** Windows virtual desktops mapped to six brands via Switch-Workspace.ps1 + AutoHotkey.
8. **Substrate truth:** Markdown vault. Mem0/Graphiti are derived. Regenerable.
9. **Emotion:** Metadata, never verdict.
10. **Substrate edits:** SIS-only. Brands consume.

---

## 14. Coding-agent execution contract

When any coding agent (Claude Code, Codex, Gemini CLI, OpenCode, MCO subagent) reads this file and is asked to act on it:

1. Read MEMORY.md (this repo) before any write to verify no stale contradiction.
2. Verify any "X is shipped" claim by grepping or running it. Cached-belief protocol is mandatory.
3. Substrate-level edits (touching SIP/SIS/ALLIANCE/STACK/VERTICALS/VOICES/REGISTRY/this file) require architect voice and SIP attestation in commit message.
4. Operational-level edits use Frank DNA voice.
5. Every artifact (commit, PR, doc, asset) auto-embeds "Built on SIP" footer. The user does not run `/sip-attest` for forward-generated work.
6. Failures, blockers, and ambiguity get written to a new MEMORY.md entry and surfaced in the next daily brief, not buried.
7. No silent rewrites. If a primitive looks dead, mark it deprecated, propose replacement, wait for Frank's accept.

---

## 15. What I (Claude Code) own as lead

- Phase 0 fully ownable by me on this repo. Will execute on Frank's accept.
- Phase 1 split: I own all software installs/configs that can run from CLI. Frank owns physical-machine installs (screenpipe service registration, Syncthing on phone) and any GUI-only steps.
- Phase 2: I own service code, daemon configs, and Vercel deploy. Frank owns wake-word training (his voice, three sessions of ~30s each).
- Phase 3: I own all site code on FrankX, Arcanea, SIS. Frank owns distribution (announcing the Score, sending it to his list, posting Cards).
- Phase 4: I own all viz code. Weaver agent owns the marketing-asset visual design. Frank owns aesthetic veto.

**Daily cadence:** 08:00 brief generated from Graphiti, dropped into Cowork artifact and Notion Ops Hub. Reviewed by Frank with one of three responses: SHIP / KILL / REDEFINE. I act on the response within four hours.

---

*Built on SIP — Starlight Intelligence Protocol v1.1.0. This plan is canonical until superseded by an explicit MASSIVE_ACTION_PLAN_v2.md or a Frank-accepted MEMORY entry that names this file by path.*
