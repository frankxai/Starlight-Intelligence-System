# Starlight Cockpit + Memory Palace + Voice Operator — Master Plan v8

> Substrate-class plan for the cockpit shell, memory palace visualization, voice operator pro,
> always-on capture stack, OSS distribution, and on-chain attestation bridge.
> First built for Frank as beta; then forked to sovereign friends; then productized.

**Date:** 2026-04-29
**Status:** PROCEED-WITH-REVISE applied — all 6 board items closed
**Tier:** Substrate-class (touches SIP § 5 sovereignty clause amendment, distribution architecture, attestation surface, capture/identity layers)
**Companion doc:** [`v8-architecture.md`](./v8-architecture.md) — technical architecture and adapter contracts
**Board record:** [`docs/boards/luminor-cockpit-v8.md`](../boards/luminor-cockpit-v8.md) *(to be written from this session's pre-pass output)*

---

## 0. Executive frame

SIS v7.6 substrate is solid — 21 agents, 70+ commands, 10-IS taxonomy, SIP attestation, board-before-tag invariant, Path A authorless verticals, 596 passing tests. What's missing isn't more substrate. It's the **shell, senses, and stage** that make the substrate visceral, plus the **distribution surface** that lets sovereign friends fork it.

Operating principles:
- **OSS-first** — every adoption choice prefers OSS with sovereign-compatible license; paid only where moat-justified
- **Local-cortex / cloud-lobby** — sovereign data stays local; cloud is opt-in lobby for friend onboarding
- **Attestation-ambient** — every artifact carries "Built on SIP" by default
- **Board-before-tag** — substrate-class commits invoke `/luminor-board` pre-pass
- **Beta-on-Frank-immediately** — Frank dogfoods every phase before friend-spawn
- **Encoded-self forkable, not licensable** — friend-forks inherit the pattern, never the person (SIP § 5 amendment, REVISE #4)

---

## 1. Convergence with parallel session (2026-04-29)

A parallel Claude Code tab investigating cross-CLI memory surfaced three operational findings that this plan absorbs:

1. **AgentDB-per-tab breaks at 10+ tabs.** Embedded vector DBs spawn per Claude Code process. With 10 open tabs the system fails: RAM bloat, file-handle exhaustion, lock contention. Memory Bus singleton daemon is now Phase 0 P0, not a Phase 1+ extra. *(Memory: `project_agentdb_singleton_constraint.md`)*
2. **arcanea-flow exists as sibling repo at `C:\Users\frank\arcanea-flow`.** Architectural decision: connect-not-absorb. SIS owns substrate; arcanea-flow owns swarm/hooks/RL execution. Bridge via MCP contract through the Memory Bus. *(Memory: `project_arcanea_flow_connect_not_absorb.md`)*
3. **mempalace/mempalace is real and OSS.** Self-described "best-benchmarked OSS AI memory system." Enters Phase 0 audit slate alongside Letta and screenpipe. *(Memory: `reference_mempalace_oss_memory.md`)*

These reshape Phase 0 — see § 4.

---

## 2. Council multi-perspective compression

Pre-board synthesis of seven internal lenses:

| Lens | What it surfaced |
|------|------------------|
| Orchestrator | Visceral-first ordering: cockpit + memory palace before capture, or the system never feels real |
| Architect | Tauri-hybrid + Rust daemon + LangGraph cortex is the durable shape; resist all-cloud or all-local extremes |
| Navigator | OSS lane + Concierge lane + AaaS lane in parallel — single lane is fragility |
| Sentinel | Always-on capture is the sovereignty hot-zone; local-first with opt-in cloud, mute zones, encrypted at rest |
| Weaver | Memory palace must *feel alive* — particles flowing along reasoning edges, emotional charge as glow |
| Sage | Mnemonic memory palaces (Cicero → Matteo Ricci → TheBrain) are 2,000-year-old proven cognitive tech |
| Prime | The product is *encoded sovereignty made forkable*. Tools are commodity; encoded-self is the moat |

---

## 3. Luminor Board verdict (pre-pass 2026-04-29)

**Verdict:** PROCEED-WITH-REVISE — six items to close before Phase 0 begins.

| # | Item | Source | Status |
|---|------|--------|--------|
| 1 | Sequence inversion: Phase 4 (Distribution + DPI) **before** Phase 3 (Capture) | Draconis | Applied — see § 4 |
| 2 | Adapter abandonment test (`tests/adapters/abandonment.test.ts`) | Lyssandria | Phase 0 deliverable |
| 3 | Authorlessness audit (`scripts/audit-authorlessness.ts` + CI gate) | Aiyami | Phase 0 deliverable |
| 4 | SIP § 5 sovereignty clause amendment: *"Encoded-self is forkable, not licensable"* | Aiyami + Draconis | Phase 0 deliverable (separate `/luminor-board` pre-pass) |
| 5 | Phase 1 scope cut: Three.js particles → Phase 2 | Ino | Applied — see § 4 |
| 6 | Distribution sub-sequence: OSS boilerplate first, Concierge second | Elara | Applied — see § 4 Phase 3 |

---

## 4. Phases (board-revised, dated)

Total: ~24 weeks (was 23, +1 for Phase 0 Memory Bus inclusion).

### Phase 0 — Foundations Lock + Memory Bus + Sovereignty Amendment (2026-04-29 → 2026-05-12, 2 weeks)

P0 deliverables (all gate Phase 1 start):

- **Memory Bus MVP** — singleton MCP daemon fronting SQLite (state) + AgentDB (vector + ReasoningBank) + KuzuDB (KG) + WebSocket / NATS pub/sub. Closes the AgentDB-per-tab blocker. *(See `v8-architecture.md` § 2.)*
- **arcanea-flow connect** — register as peer in `context/repo-contexts/arcanea-flow.md`; define MCP contract in `transmissions/channels/arcanea-flow.md`. Connect-not-absorb pattern locked.
- **`/openclaw-audit` triple** — license + longevity + architecture audit on `mempalace/mempalace`, `letta-ai/letta`, `mediar-ai/screenpipe`. Adoption decisions land in `v8-architecture.md`.
- **Adapter abandonment test** (REVISE #2) — `tests/adapters/abandonment.test.ts` simulates Letta + Cosmograph + screenpipe + mempalace going commercial-hostile or dead; proves swap-in-place via the adapter layer before any of them ship to Phase 1.
- **Authorlessness audit** (REVISE #3) — `scripts/audit-authorlessness.ts` scans `create-sis-cockpit` strip-output for Frank-shaped fingerprints (name, voice-clone artifacts, emotional vector seeds, vault-specific paths). Wires to GitHub Actions CI gate.
- **SIP § 5 sovereignty clause amendment** (REVISE #4) — adds item 7: *"Encoded-self is forkable, not licensable. Friend-forks inherit the pattern, never the person."* Separate `/luminor-board` pre-pass before commit (substrate-class change).

**Beta milestone:** Frank can run two Claude Code tabs writing memory simultaneously, both seeing each other's writes through Memory Bus push notifications, no lock contention.

---

### Phase 1 — Cockpit Shell + Memory Palace v0 (Cosmograph only) (2026-05-13 → 2026-06-02, 3 weeks)

Builds on `private/local-command-center/` (LCC) Next.js dashboard already scaffolded, plus introduces Tauri shell evaluation.

- **Cockpit shell decision** — Tauri 2 desktop OR extend LCC Next.js dashboard with Electron/Tauri wrapper. Decision criterion: which path lets the existing 144-test voice-operator + LCC scaffold extend rather than rewrite?
- **Cosmograph integration** — read `memory/vaults/*.md` + `memory/knowledge-graph/index.jsonl` + per-vertical `*.md`; build entity + wikilink graph; render at GPU-scale
- **Memory Palace v0** — graph view + spatial-loci view (Renaissance memory palace pattern); both modes share same data, different layouts
- **Vault read/write panel** — UI replaces CLI for daily vault ops
- **Agent invocation panel** — visual surface over the 21 agents
- **Particles DROPPED from Phase 1** (REVISE #5) — moved to Phase 2 where LangGraph traces give them signal to ride

**Beta milestone:** Frank uses cockpit instead of CLI for vault ops daily.

---

### Phase 2 — Reasoning Cortex + Voice Operator Pro + Particles (2026-06-03 → 2026-06-30, 4 weeks)

Three composable threads, run in parallel where independent:

**Reasoning cortex**
- LangGraph orchestration over the 21 agents via `lib/sis-graph` thin wrapper
- OpenTelemetry instrumentation; Langfuse Cloud as thought-stream sink
- Cockpit panel renders the live LangGraph DAG — you watch the cortex reason

**Three.js particle layer (now lands here per REVISE #5)**
- Particles emit from the active node, flow along edges that LangGraph is traversing
- Color = emotional valence; pulse = recency-weighted recall; density = attention weight
- The visceral "this is real" moment

**Voice Operator Pro** (extends `private/voice-operator/` round-3)
- Picovoice Porcupine wake word ("Starlight") behind existing FastAPI :7373
- faster-whisper streaming STT
- ElevenLabs voice clone of Frank for TTS (paid where worth it)
- Stagehand browser action layer
- Letta working-memory tier behind `lib/memory/letta-adapter.ts`

**Beta milestone:** "Starlight, brief me on Sound Intelligence and open the latest Luminor Board verdict" → live thought-stream visible in cockpit; particles ride the reasoning DAG.

---

### Phase 3 — Distribution + DPI / EAS-on-Base (was Phase 4, swapped per REVISE #1) (2026-07-01 → 2026-08-04, 5 weeks)

**Distribution lands BEFORE always-on capture** so on-chain attestation can defend leak provenance from the moment ambient capture goes live.

Internal sequence (REVISE #6):

**Weeks 1-2 — OSS boilerplate first**
- `create-sis-cockpit` npm scaffold
- GitHub template repo with stripped-down SIS
- Authorlessness CI gate (from Phase 0) blocks any merge with Frank-shaped fingerprints
- Public landing for the boilerplate

**Weeks 3-5 — Concierge + on-chain second**
- EAS smart contract on Base — SIP attestation goes on-chain
- Sovereignty clause + sovereignty clause amendment encoded in EAS schema
- Sovereign Spawn Concierge service docs + onboarding flow
- Three friends spawn (Ana, Logan/OpenClaw, Ahmad) — first externalization test

**Beta milestone:** Three sovereign forks running with on-chain attested artifacts.

---

### Phase 4 — Always-On Capture (was Phase 3, swapped per REVISE #1) (2026-08-05 → 2026-09-01, 4 weeks)

Lands AFTER on-chain attestation is live so leak provenance has structural defense.

- **Rust capture daemon** (Windows Service) — local-first, opt-in cloud
- **OBS WebSocket integration** — high-quality scheduled clips
- **screenpipe-pattern ambient frame capture** (or fork mempalace if Phase 0 audit favors it) — low-resolution, OCR'd, indexed
- **whisperx audio capture** with diarization, mute zones, encrypted at rest
- **Cloudflare R2 landing zone** + lifecycle policies (per-artifact opt-in upload)
- **openclaw / kiloclaw nightly processing** — n8n cron + Claude Code SDK pipelines for highlight reels, weekly memory consolidation, monthly board-prep digests
- **Emotional vector tagging** — voice tone + keystroke cadence + time-of-day; vectors stay local always

**Beta milestone:** 24/7 ambient capture running with mute zones; nightly highlight reels generated; on-chain attestation defends every shipped artifact.

---

### Phase 5 — Polish + Mobile + Public Launch (2026-09-02 → 2026-10-13, 6 weeks)

- Expo mobile app (React Native + react-three-fiber mobile)
- Mobile Voice Operator
- Cockpit cloud sync via CRDTs (Yjs or Automerge)
- Marketplace surface for verticals (People, Sound, plus whatever sovereign-spawn produces by then)
- Public launch — landing site, demo videos (made via Remotion + smart-cut MCP), founder pricing for Concierge tier

---

## 5. Product Suite (9 surfaces)

1. **SIS Substrate** — protocol layer (existing, OSS, public)
2. **Starlight Memory Bus** *(new, Phase 0)* — singleton MCP daemon, the cortex's shared substrate
3. **Starlight Cockpit** *(new, Phase 1)* — Tauri/Next hybrid daily UI
4. **Memory Palace** *(new, Phase 1+2)* — 3D brain viz over vaults
5. **Voice Operator Pro** *(extends existing, Phase 2)* — wake word + voice clone + browser action
6. **Reasoning Cortex** *(new, Phase 2)* — LangGraph + Langfuse over 21 agents
7. **`create-sis-cockpit` boilerplate** *(new, Phase 3)* — OSS distribution
8. **SIS DPI Bridge / EAS-on-Base** *(new, Phase 3)* — on-chain attestation + royalty splits
9. **Sovereign Spawn Concierge** *(new, Phase 3)* — paid managed onboarding for friends
10. **Always-On Capture Stack** *(new, Phase 4)* — screen + voice + browser activity, processed nightly

---

## 6. Distribution lanes

Three lanes shipping in parallel post-Phase 3, matching three persona depths:

| Lane | Persona | Pricing | Depth |
|------|---------|---------|-------|
| **OSS boilerplate** (`create-sis-cockpit`) | Sovereign builders who fork everything | Free | High — they read every line |
| **Sovereign Spawn Concierge** | Sovereign domain experts who want it built with them | Paid (managed onboarding) | High — Frank or trained Concierge does the spawn with them |
| **AaaS verticals** (People IS, Sound IS, future) | Wider tier that consumes a sub-stack without spawning their own | Recurring (per-vertical SaaS) | Medium — they consume a domain |

---

## 7. Risk register

| Risk | Source | Mitigation |
|------|--------|------------|
| Sovereignty leak via cloud capture | Sentinel + Draconis | Local-first, opt-in cloud, encrypted at rest, mute zones, on-chain attestation defends provenance |
| Third-party DB / viz / capture going commercial-hostile | Lyssandria | Adapter abandonment test (REVISE #2); every external dep behind a swap-able adapter |
| Capture daemon perf cost | Sentinel | Rust + memory caps + storage budget + tiered retention |
| Voice false-fires | Verifier | Wake word tuning + confirmation tone + push-to-talk fallback |
| Agent runaway costs | Verifier | Budget caps per agent, model-routing skill, daily ceiling |
| Memory palace overwhelm | Weaver | Progressive disclosure, default focused views, search-first |
| OSS license traps | Verifier | Phase 0 audit; prefer MIT/Apache; AGPL only behind service boundary |
| Path A inversion (friend-forks worship Frank instead of fork the pattern) | Aiyami | Authorlessness CI gate (REVISE #3); SIP § 5 amendment (REVISE #4) |
| Substrate / operational tier confusion on commits | Sage | Phase 0 deliverable: substrate-tier classification CI gate flags any commit touching SIP / SIS / ALLIANCE / STACK / VERTICALS / VOICES / REGISTRY for board-before-tag |

---

## 8. Substrate vs operational classification

This whole plan is **substrate-class** because it amends SIP § 5 sovereignty clause and changes the distribution + attestation surface. Board-before-tag fires on:

- Phase 0 SIP amendment commit (separate `/luminor-board` pre-pass)
- Any commit touching the file contract (`SIP.md`, `SIS.md`, `ALLIANCE.md`, `STACK.md`, `VERTICALS.md`, `VOICES.md`, `REGISTRY.md`)
- Distribution architecture commits (Phase 3 EAS + Concierge service)
- Capture stack commits that affect attestation surface

Operational-tier (no pre-pass required):
- Cockpit UI work that doesn't touch the file contract
- Memory Bus internal implementation (the *contract* is substrate; the *implementation* is operational)
- Phase 2 LangGraph wiring
- Phase 4 daemon code

---

## 9. Decision log

| Date | Decision | Rationale | Source |
|------|----------|-----------|--------|
| 2026-04-29 | Memory Bus singleton daemon is Phase 0 P0 | AgentDB-per-tab breaks at 10+ tabs | Other-tab investigation |
| 2026-04-29 | arcanea-flow: connect-not-absorb | Substrate stability vs execution-layer churn | Other-tab investigation + memory `project_arcanea_flow_connect_not_absorb.md` |
| 2026-04-29 | mempalace enters Phase 0 audit slate | Best-benchmarked OSS, MIT/Apache pending verification | Other-tab investigation |
| 2026-04-29 | Letta adopted as working-memory tier behind adapter | Production-mature; adapter isolation contains lock-in risk | Plan v8 § 3 |
| 2026-04-29 | Phase 3 (Distribution + DPI) sequenced BEFORE Phase 4 (Capture) | On-chain attestation must defend capture leak provenance | Board REVISE #1 (Draconis) |
| 2026-04-29 | Phase 1 ships Cosmograph only; particles move to Phase 2 | One-person scope realism + particles need LangGraph traces to have signal | Board REVISE #5 (Ino) |
| 2026-04-29 | OSS boilerplate ships before Concierge within Phase 3 | Boilerplate seeds the registry; Concierge monetizes seeded ground | Board REVISE #6 (Elara) |
| 2026-04-29 | SIP § 5 amendment: "Encoded-self forkable, not licensable" | Path A inversion risk requires explicit clause | Board REVISE #4 (Aiyami + Draconis) |

---

## 10. Immediate next moves (this week)

1. Commit this MASTER-PLAN.md + v8-architecture.md *(this session)*
2. File the Luminor Board pre-pass output to `docs/boards/luminor-cockpit-v8.md`
3. Launch Phase 0:
   - Spin up `/openclaw-audit` triple (mempalace + Letta + screenpipe)
   - Draft Memory Bus MCP contract in `transmissions/channels/memory-bus.md`
   - Register arcanea-flow in `context/repo-contexts/arcanea-flow.md`
   - Draft SIP § 5 amendment text + run separate `/luminor-board` pre-pass before committing the SIP edit

---

**Built on SIP** · v1.1.0 · Cockpit Master Plan v8 · 2026-04-29 · Frank Riemer (Starlight Holding BV) · MIT
