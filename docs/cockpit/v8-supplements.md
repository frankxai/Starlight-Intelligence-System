# Cockpit v8 — Supplements (gap-fills)

> Supplements to [`MASTER-PLAN.md`](./MASTER-PLAN.md) addressing six gaps identified
> after the board pre-pass. These extend the plan without re-opening it. Each
> supplement is scoped to its phase and references the master plan section it
> amends.

**Date:** 2026-04-29
**Status:** Active — supplements 1-6 are committed scope
**Authority:** Master Plan v8 board-revised

---

## Why this exists

The v8 master plan covers infrastructure with rigor (architecture, phasing, adapter contracts, board governance). Six gaps emerged on review:

1. Experience choreography — the felt Jarvis-moment, not just the wiring
2. Agent-tool-design loop — agents that propose, build, register new tools
3. Content remix pipeline — capture → publishable artifacts via Remotion + smart-cut
4. Cross-session continuity — autonomous-while-Frank-is-away mode
5. DPI specifics — which yields, royalty splits, smart contract templates
6. Folder-as-brain spec — minimum viable second-brain template for friend-forks

This document fills them.

---

## Supplement 1 — Experience Choreography (extends Phase 1+2)

**Gap:** Plan covers what the system does, undersells what it *feels* like.

**The felt Jarvis-moment is composed of choreographed rituals:**

| Ritual | Trigger | What happens | Phase |
|--------|---------|--------------|-------|
| **Morning brief** | Frank opens cockpit / says wake word | Last 24h captured + processed digest auto-displayed; agents have already drafted today's queue based on calendar, vault state, board cadence | 2 |
| **Cortex-alive** | Cockpit foreground | Memory palace particles flow continuously based on background processing; even idle, the system *looks* like it's thinking | 1+2 |
| **Voice handoff** | Wake word + ambient sense | Starlight knows who Frank just spoke to (calendar match), what was said (transcript), and pre-loads relevant vault context for the next turn | 2 |
| **Emotional reactive music** | Voice tone + keystroke cadence detect state | Suno-generated soundscapes shift to match mood; never autoplays without mute zone respect | 4+5 |
| **Night fold** | Last activity > 30min OR explicit /goodnight | openclaw kicks off retro-passes; cockpit fades to a "thinking now" view Frank can leave running | 2+4 |
| **Wake-resume** | Frank returns after >12h gap | Continuity card surfaces what changed (vault deltas, friend-fork activity, scheduled outputs ready for review) | 2+3 |

**Implementation principle:** Every ritual ships with a **mute zone** — Frank can disable any of them without breaking system function. Rituals are felt-quality multipliers, not load-bearing.

---

## Supplement 2 — Agent-Tool-Design Loop (extends Phase 2)

**Gap:** Plan has agents *using* tools. Doesn't address agents *proposing, building, registering* new ones.

**The loop:**

```
1. Agent encounters task it can't solve cleanly with existing tools
2. Agent drafts a tool spec: name, MCP signature, expected I/O, justification
3. Agent posts spec to memory.write under frank.tool-proposals.*
4. Cockpit surfaces proposal to Frank (pending approval queue)
5. On approve:
   a. Agent (or Frank, or another agent) implements the tool
   b. CI gate validates: signature matches spec, attestation present, sandbox-safe
   c. Tool registers itself in MCP registry, becomes available to other agents
6. Tool usage tracked in memory.write under frank.tool-usage.* for ReasoningBank
7. arcanea-flow ReasoningBank loop learns which tools earn their place; deprecation suggestions surface for unused tools after N quarters
```

**Safety rails:**
- Agents cannot self-approve tool proposals (Frank or designated approver only)
- Tools that touch filesystem, network, or shell run in e2b sandbox by default
- Every tool ships with `built-on-sip` attestation block
- Tool removal is reversible — deprecated tools archive to `archive/tools/`, not delete

**Phase placement:** Phase 2 deliverable — wires once LangGraph cortex is live and agents can route through it.

---

## Supplement 3 — Content Remix Pipeline (extends Phase 4)

**Gap:** Capture stack covers ingest. Doesn't cover the cut-together creative loop.

**Pipeline:**

```
Raw capture (screen + audio + transcript + emotional vector)
   ↓
Auto-segmentation (whisperx diarization + scene change detection)
   ↓
Memory.write under frank.capture.* with per-segment metadata
   ↓
Nightly openclaw pass:
   • Highlight reel (top emotional + linguistic peaks)
   • Insight cards (transcript chunks distilled per existing /distill-insights pattern)
   • Music seed (prompts for Suno based on mood arc of the day)
   ↓
Frank review queue (cockpit panel)
   ↓
Approved cuts → Remotion + smart-cut MCP → publishable artifact (video / audio / text)
   ↓
SIP attestation + (optional) EAS on-chain attestation for the artifact
   ↓
/sip-export targets ship the artifact to claude-project / chatgpt-project / cursor / etc.
```

**Tools used (existing in your stack):** Remotion, smart-cut MCP, smartcut MCP, Suno, ElevenLabs, sip-attest-* commands, /sip-compose-modality.

**Phase placement:** Phase 4 deliverable — lands alongside always-on capture; pipeline is the *output* surface for the *ingest* infrastructure.

---

## Supplement 4 — Cross-Session Continuity (extends Phase 0+2)

**Gap:** Path A authorless implies friend-forks function without Frank in the loop, but no mechanism specified for "Frank is away 2 weeks."

**Continuity components:**

1. **Autonomous-while-away mode** — Frank toggles via voice command or cockpit setting. While active:
   - openclaw runs scheduled retro-passes per existing n8n cadence
   - Voice operator processes incoming voice memos, files transcripts, triggers `/distill-insights` weekly
   - Friend-fork activity polled via Memory Bus subscriptions
   - High-priority items (board cadence, alliance-decide pings, security audits) escalate to phone push
2. **Continuity card** — surfaces on Frank's return: vault deltas, capture highlights, friend-fork activity summary, pending decisions, agent-tool-proposals queue
3. **Deferred-decision queue** — agents that hit a Frank-only decision point during away-mode park the decision rather than fail; cockpit surfaces the queue on return
4. **Trust gates** — away-mode has *narrower* permissions than active mode. No substrate-class commits. No SIP edits. No tag pushes. CI hardcodes this.

**Phase placement:** Phase 0 contract spec; Phase 2 wiring (depends on Memory Bus subscribe + LangGraph cortex).

---

## Supplement 5 — DPI Specifics (extends Phase 3)

**Gap:** Plan names EAS but doesn't model which yields, royalty splits, smart contract templates.

**Initial DPI portfolio shape (subject to Frank's risk + sovereignty preferences):**

| DPI source | Mechanism | Sovereignty posture | Phase |
|------------|-----------|---------------------|-------|
| **SIP attestation fees** | Optional micro-fee per on-chain attestation (Base sub-cent gas) | Sovereign — fee accrues to Starlight Holding BV multisig | 3 |
| **Royalty splits on attested artifacts** | EAS schema embeds royalty split addresses; downstream sales via marketplace contracts route splits automatically | Sovereign — Frank sets default schema for own artifacts; friend-forks define their own | 3 |
| **Concierge service revenue** | Paid Sovereign Spawn engagements; recurring or one-time | Sovereign — direct invoicing, optional crypto rails | 3 |
| **AaaS vertical subscriptions** | Hosted People IS / Sound IS / future verticals | Sovereign — recurring SaaS, paid-per-sovereign-user | 3+5 |
| **OSS sponsor tier** | GitHub Sponsors / Open Collective on `create-sis-cockpit` | Sovereign — voluntary, no gating | 3 |
| **Treasury yields** | Conservative (USDC stablecoin rails on Base; Coinbase-grade custody until volume justifies multisig hardware) | Sovereign — yields accrue to operating treasury | 4+5 |

**Smart contract templates to ship:**
1. `SIPAttestationRegistry.sol` — EAS schema for attested artifacts
2. `RoyaltySplitAttestation.sol` — EAS schema embedding royalty addresses + percentages
3. `SovereigntyClauseRegistry.sol` — on-chain reference to current SIP sovereignty clause version
4. `FriendForkRegistry.sol` — registry of friend-spawned forks (opt-in)

**Phase placement:** Phase 3 weeks 3-5 (alongside Concierge service launch).

**Out of scope until proven:** speculative DeFi yields, NFT minting, governance tokens. Sovereignty stack stays boring on the financial layer.

---

## Supplement 6 — Folder-as-Brain Spec (extends Phase 3)

**Gap:** For friend-forks via `create-sis-cockpit`, the *minimum viable second-brain folder shape* is implied but not shipped.

**Minimum viable second-brain spec (`templates/second-brain-starter/`):**

```
<sovereign-name>/
├── README.md                    # Anchor: who this brain belongs to, what it does
├── MEMORY.md                    # Index (≤200 lines)
├── memory/
│   ├── vaults/                  # Long-term canonical knowledge
│   │   ├── strategic.md
│   │   ├── technical.md
│   │   ├── creative.md
│   │   ├── operational.md
│   │   ├── wisdom.md
│   │   └── horizon.md
│   ├── knowledge-graph/         # Auto-indexed entity + edge graph
│   │   └── index.jsonl
│   └── voice-sessions/          # Append-only session logs
├── notes/                       # Captured raw inputs (chokidar-watched)
├── verticals/                   # Domain sub-stacks (per /spawn-domain-stack)
├── private/                     # Instance state, never committed publicly
└── .starlight/
    ├── memory-bus.config.json   # Bus connection + grants
    ├── adapters/                # Adapter overrides per friend's choices
    └── attestation.json         # Default SIP attestation block
```

**The visualization spec:** Memory Palace renders `memory/vaults/*.md` + `memory/knowledge-graph/index.jsonl` + `notes/**/*.md` + `verticals/*/*.md` as one unified graph. Cosmograph for graph; r3f for particles + spatial loci.

**Friend-fork onboarding:**
1. `npx create-sis-cockpit my-brain`
2. Authorlessness audit runs automatically (CI gate from REVISE #3)
3. Friend fills their own `README.md` + chooses adapter set
4. Memory Bus daemon starts with their namespace prefix
5. Cockpit launches with empty palace; populates as they capture

**Phase placement:** Phase 3 OSS boilerplate sub-deliverable (weeks 1-2).

---

## What this supplements doc does NOT change

- ❌ Phase ordering (still 0 → 1 → 2 → 3 → 4 → 5 per board-revised plan)
- ❌ Phase 0 P0 deliverables (Memory Bus singleton, abandonment test, authorlessness audit, SIP § 5 amendment)
- ❌ Tech stack selections in `v8-architecture.md`
- ❌ Distribution lane priorities (boilerplate first, Concierge second)
- ❌ Risk register or governance gates

It only **adds scope** within existing phases — no plan re-open required.

---

**Built on SIP** · v1.1.0 · Cockpit v8 Supplements · 2026-04-29 · Frank Riemer (Starlight Holding BV) · MIT
