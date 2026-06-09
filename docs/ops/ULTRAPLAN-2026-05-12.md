# ULTRAPLAN — From substrate-solid to billion-dollar surface
**Date:** 2026-05-12
**Authored by:** Claude Opus 4.7 (1M context) — orchestrator
**Research substrate:** 4 specialist subagents, ~13 minutes wall-clock, ~393K tokens consumed
**Audit substrate:** Live diagnostic of running processes, file:line code review, HTTP probes of all surfaces
**Trigger:** Frank's pushback "the whole work delivered is unsatisfying bad"

---

## TL;DR

The substrate is sovereign-grade. The surface is not. The gap is **architectural**, not cosmetic — and it's closable in 4–6 weeks with surgical changes, not a rewrite.

Five measured gaps. Six execution phases. Three things to rip out. Seven OSS repos to absorb. Four decisions Frank needs to make.

Phase 0 (1–3 days) is reversible and quick — it removes more bad than it adds new. Phases 1–5 are where the billion-dollar feel actually lands.

---

## The Real Question

Frank wrote: *"the whole work that has been delivered is unsatisfying bad."*

Surface read: "make it good."
Deeper read: **Close the gap between the sovereign substrate (genuinely solid — 13 schemas, Council doctrine, VaultLoop, attestation contract, 695 substrate tests green) and the operational surfaces (voice, brain viz, cockpit) that feel mediocre because of FIVE specific architectural decisions made before May 2026 SOTA was internalized.**

The substrate is not what to fix. The runtime layer between substrate and surfaces is.

---

## First-Principles Findings

1. **Voice latency is an architecture problem, not a model problem.** The pipeline is non-streaming at every layer. Even keeping Groq + llama-3.3-70b + Orpheus, streaming-end-to-end drops perceived latency 60–80%.
2. **/brain looks bad because data is starved, not because r3f is wrong.** Cache shows 40 nodes, 1 edge. Indexer corpus has 520. The viz is exposing the upstream pipeline failure faithfully.
3. **Mock fallbacks make every page lie about what's real.** Without a "live vs mock vs stale" badge, premium UI on fixture data feels worse than honest minimalism on real data.
4. **Three repos × three runtimes × three ports = schizophrenic UX.** SIS (Next.js + Python) + Arcanea (Node orb) + FastAPI cognition bridge fighting each other.
5. **Custom-built runtime crosses from sovereignty to wheel-reinvention when ≥10k-star OSS solves the same thing.** Memory blocks (Letta), durable workflows (Mastra/Inngest), browser autonomy (Browser Use), voice pipelines (Pipecat) all have battle-tested upstream solutions our system reinvents poorly.

---

## What Stays Sovereign — Don't Rebuild

| Layer | Why sovereign | Status |
|---|---|---|
| 13 JSON Schemas (WorkPacket / AgentRun / Decision / Council / VaultLoop / etc) | These encode our governance, not a generic agent ontology. | KEEP |
| SIP attestation, sovereignty clause, encoded-self amendment | The differentiator. No OSS has this. | KEEP |
| Council 7-archetype doctrine | Unique IP. No competitor framing. | KEEP |
| VaultLoop 9-stage | Unique IP. No competitor framing. | KEEP |
| `/yolo`, `/starlight-board`, `/process-inbox`, `/starlight`, `/superintelligence` | Top-tier sovereign commands. | KEEP |
| JSONL ledgers + SQLite shadowing | Right substrate for our scale (single sovereign + alliances). sqlite-vec is the upstream path. | KEEP |
| Vellum & Voltage design language | Right brand register; needs deeper application but not reinvention. | KEEP |

**Rule of thumb**: if it's named in VOICES.md / SIP.md / ALLIANCE.md, or shows up in a /starlight-board packet, build it sovereign. If it has >10k stars solving the same problem and a permissive license, adopt it.

---

## The Five Gaps — Measured, Cited, Reversible

### Gap 1 — Voice latency: 1.5–3.5s vs SOTA 500–900ms (3–5× slower than May 2026 frontier)

**Evidence**:
- `client.mjs:329` — VAD silence wait is a hard 900ms timer, nothing adaptive
- `transcribe.mjs:33-39` — STT shells out to `spawnSync('curl', ...)` per utterance (50-100ms Windows cold-spawn cost wasted)
- `server.mjs:551-577` — STT → LLM → TTS strictly sequential, no streaming
- `client.mjs:465` — Browser awaits `r.blob()` before playing, re-buffering the entire MP3
- `server.mjs:119` — The code itself contains the comment "voice UX feels broken past ~800 ms total round-trip" — and ships ~2500ms
- `start-cockpit.ps1:303` — Cognition bridge re-enabled, routes through `:7373/api/utterance` which has no tool executor (memory `project_voice_operator_bridge_off.md` says keep it off until executor lands)

**SOTA May 2026 target**: 500–900ms end-to-end with streaming pipeline + Cartesia/Orpheus TTS + Deepgram Nova-3 STT (cascade) OR <800ms with OpenAI Realtime API (S2S).

**Pattern shift needed**: streaming-everywhere + Silero VAD + transformer turn detection + tool-call-while-speaking (filler phrase during function call).

### Gap 2 — Brain depth: 40 nodes / 1 edge vs 520 atoms available (13× data starvation)

**Evidence**:
- `_brain-cache.json`: `node_count: 40, edge_count: 1, cluster_count: 4`
- Brand distribution: `unbranded 36 / sis 4`
- Intent distribution: 75% `capture`
- Cross-repo indexer (per `project_cross_repo_indexer_v01.md`) lit 520 atoms 2026-05-03 — never fed `memory/knowledge-graph/index.jsonl`
- `brain_graph.py:154`: `nx.spring_layout(g, dim=3, seed=42)` — fixed-seed force layout ignores brand/intent/time
- `BrainScene.tsx:208`: `autoRotate` 0.4 rad/s makes the eye unable to lock onto anything

**SOTA May 2026 target**: embedding-driven semantic layout (Voyage-3-large or local nomic-embed-text-v2 → UMAP-3D), HDBSCAN clusters + LLM-named cluster labels at centroids, Structure↔Semantics slider (Cosmograph-pattern, no PKM ships this in open source).

**Pattern shift needed**: enrich data BEFORE polishing visuals. KG feeder + classifier daemon. Then layer six craft moves (selective bloom, MeshPhysicalMaterial, SDF typography, OKLCH palette, fitToBox choreography, focus+context dim).

### Gap 3 — Health-check fragmentation: 3 paths, none aligned

**Evidence**:
- `:7373` exposes `/healthz` (returns `200 {"status":"ok"}`)
- `:7373/health` returns 404 (no alias)
- `CockpitOrbFrame.tsx:21` pings `http://127.0.0.1:7777/api/health` → "Orb offline" tile shows whenever path doesn't match
- No unified service health dashboard with one truth for all 3 services

**SOTA May 2026 target**: one canonical `/healthz` per service (industry convention — Kubernetes, Knative, Dapr all use `/healthz`). One service health tile in cockpit that pings all three.

### Gap 4 — Persona drift: two disconnected persona systems

**Evidence**:
- Orb iframe wires 7 *Arcanea Guardian* personas (Lumina/Draconia/Lyria/Alera/Shinkami/Nero/Jarvis — CC-BY-NC canon) in `CockpitOrbFrame.tsx:5-13`
- Council subagents I shipped 2026-05-11 are 7 *archetype* roles (Elder Father/Mother/Sage/Builder-Elder/Shadow Witness/Divine Neutral Witness/Future Self at 90)
- No voice routing wires Council archetypes to TTS voices
- The brand-register rule in `memory/vaults/strategic-vault.md` says Arcanea = mythic / Starlight = substrate, but the operational orb is still Arcanea-canonical only

**SOTA May 2026 target**: Council 7 archetypes accessible via voice, each with a distinct TTS voice ID. Arcanea Guardians remain in the Arcanea-canonical Orb. Brand register honored at the surface level, not just in commits.

### Gap 5 — Mock saturation: 9 of 10 dashboard routes fall back to fixtures

**Evidence** (from `lib/sis-client.ts` audit):
- `/api/sis/agents` → 404 → mockAgents (10 hardcoded)
- `/api/sis/decisions` → 404 → mockDecisions (4 hardcoded)
- `/api/sis/council/pending` → 404 → mock 2 pending
- `/api/sis/vault-loop/list` → "no entries" → mock "Ship the demo" loop
- `/api/sis/packs` → REAL DATA (3 packs) ✓ — the one bright spot
- `/api/fleet/health` → all gates report `"state":"unknown"`
- `/api/agent-events` SSE has no producer on most pages — backfill empty

**SOTA May 2026 target**: every page either shows real data or carries a visible `data: live | mock | stale (Nm ago)` badge. No silent fallback. Honesty is premium; deception is school-project.

---

## The May 2026 SOTA Stack to Adopt

### Voice — Pipecat + streaming cascade (primary) OR OpenAI Realtime (S2S, premium)

**Primary path: Pipecat (12k stars, v1.1.0 Apr 27 2026, Python, vendor-neutral)**
- Wrap our existing Groq + Orpheus + Deepgram choices
- Streaming-everywhere by default
- Built-in plugin for Silero VAD + transformer turn detection
- Supports tool-call-while-speaking pattern out of the box
- Keeps cost predictable + text audit trail intact
- Expected: 500–900ms end-to-end, sub-800ms with optimization

**Premium path: Pipecat + OpenAI Realtime (gpt-realtime-2)**
- Native S2S, WebRTC, sub-800ms typical
- Tool calls stream over data channel alongside audio
- Cost: $0.05–$0.10/min cached, $0.18–$0.46/min uncached
- Drawback: vendor lock, no intermediate text audit trail (unless you pay extra)

**TTS replacement**: Cartesia Sonic-3 (40ms TTFA) OR keep Groq Orpheus (95ms P50, $22/1M chars — already validated by Frank). ElevenLabs Flash only as fallback.

**STT replacement**: Deepgram Nova-3 streaming partials. Drops STT cost from 300–800ms → 100–200ms.

### Agent runtime — Mastra DurableAgent (TS) wrapping the orchestrator router

**Why**: Mastra (23.8k stars, v1.32.0 May 6 2026) shipped `DurableAgent` April 2026 — resume after crash or client disconnect via `observe(runId, {offset})`. Backed by Inngest. TS-native, matches our cognition router's primary language.

**What this fixes**: today, if the cognition bridge crashes mid-tool-loop, we lose state. Cross-tab / cross-session continuity is the missing primitive.

**Alternative**: Inngest workflows directly (Temporal-compatible, shipped Feb 2026) wrapping the existing `OrchestratorRouter`.

### Memory — Letta blocks via MCP (working memory) + sqlite-vec (vector substrate) + Voyage-3-large (embeddings)

**Why**: Letta (22.6k stars, Apache) ships the strongest "agent self-edits memory" primitive — typed memory blocks (Core / Recall / Archival) with sleep-time refinement daemon. Our `dreaming` cron is already the seam for this.

**MemPalace** stays as raw-capture substrate (96.6% LongMemEval, already in our intake corpus). Letta sits on top for working-memory blocks.

**Voyage-3-large**: 9.7% retrieval improvement vs OpenAI text-embedding-3-large at $0.18/M. Drop-in replacement.

**sqlite-vec** (asg017): 30MB RAM, KNN + SIMD, perfect for our scale. Don't migrate to pgvector or Qdrant unless we cross 50M vectors.

### Browser autonomy — Browser Use via MCP (single biggest Jarvis capability gap)

**Why**: Browser Use (93k stars, 89.1% WebVoyager, Apache) is the canonical browser-autonomy primitive. Every serious personal-AI stack composes it. **Closing this single gap is the largest Jarvis-grade lift available.**

**How**: wire as MCP server. The 7-archetype Council gains a "Browser Witness" tool, not a new agent.

### Graph viz — Keep r3f. Layer six craft moves. Add semantic slider in Phase 2.

**Why keep r3f**: at our scale (target 500–5k nodes after data fix), r3f gives more craft surface than Cosmograph. Cosmograph is the right answer at 50k+ nodes.

**Reference repo to absorb**: `ChristopherLyon/graphrag-workbench` (607 stars, MIT, Next.js 15 + r3f + Three + Tailwind + shadcn). Closest existing implementation to our /brain done with premium craft.

**Six craft moves** (see Phase 2 below).

---

## 6-Phase Execution Plan

### Phase 0 — Emergency fixes (1–3 days, reversible)
**Goal**: Remove more bad than we add new. Highest perceived-quality improvement per hour.

| # | Action | File | Effort | Risk | ROI |
|---|---|---|---|---|---|
| 0.1 | Rip cognition bridge default-on | `private/local-command-center/scripts/start-cockpit.ps1:303` | 1 min | None (memory-validated decision) | Voice instantly faster + smarter |
| 0.2 | Add `/health` alias on FastAPI (mirror of `/healthz`) | `private/voice-operator/service/main.py` | 5 min | None | Dashboard "service tile" goes green |
| 0.3 | Add `DataSourceBadge` component + wire to all 10 dashboard routes | `private/local-command-center/apps/dashboard/components/DataSourceBadge.tsx` (new) + 10 surfaces | 2-4h | None | Premium honesty — every page tells truth about its data |
| 0.4 | Replace `spawnSync('curl')` with `fetch` in STT | `C:\Users\frank\Arcanea\packages\arcanea-voice\src\transcribe.mjs:33-39` (separate repo — needs Frank's nod) | 1h | Low (verify Groq response shape on Windows) | -50-100ms/turn + drop curl.exe dependency |
| 0.5 | Investigate why KG indexer 520-atom corpus isn't feeding `memory/knowledge-graph/index.jsonl` | `private/voice-operator/service/brain_watchdog.py` + indexer scripts | 2h | None | Unlocks Phase 2; brain goes from 40→500+ nodes |
| 0.6 | Remove `autoRotate` on `/brain` (or make it an off-by-default "showcase mode") | `BrainScene.tsx:204-211` | 5 min | None | Eye can lock onto nodes |
| 0.7 | Fix CockpitOrbFrame path `/api/health` → `/healthz` and confirm port (7373 vs 7777) | `CockpitOrbFrame.tsx:21,74` | 10 min | Low | Orb tile turns green |

**Acceptance**: voice feels measurably snappier; brain shows real cluster structure; every page tells the truth about its data.

### Phase 1 — Voice streaming end-to-end (1 week)
**Goal**: <800ms end-to-end P50 for the voice loop, without changing the LLM.

| Sub-phase | Action | Files / approach |
|---|---|---|
| 1.1 | Switch Groq chat to `stream: true` | `server.mjs:225-280` |
| 1.2 | Stream TTS chunks → `MediaSource.appendBuffer` in browser (kill the `r.blob()` await) | `server.mjs:601-615` + `client.mjs:465` |
| 1.3 | Replace ElevenLabs Flash with Cartesia Sonic-3 streaming (40ms TTFA) — keep Orpheus as fallback | `server.mjs:451-515` |
| 1.4 | Add Silero VAD via `silero-vad` Node binding — replace fixed 900ms hysteresis | `client.mjs:307-338` |
| 1.5 | Add transformer turn detector (port LiveKit Agents' pattern) | new module |
| 1.6 | Implement "tool-call-while-speaking" — stream filler phrase (e.g. "let me check…") while function runs | `server.mjs:295-412` |
| 1.7 | Telemetry: log STT-TTFB / LLM-TTFB / TTS-TTFB / total per turn to a JSONL roll-up | `server.mjs:551-577` |

**Acceptance**:
- P50 end-to-end first audio: <800ms
- P95: <1500ms
- Barge-in latency: <300ms
- Tools execute concurrent with TTS, never silence the speaker
- Per-turn telemetry in `~/.starlight/voice-telemetry/YYYY-MM-DD.jsonl`

**Reference**: `pipecat-ai/pipecat` `examples/foundational/19-openai-realtime-beta.py` and `examples/realtime/realtime-openai.py`.

### Phase 2 — Brain depth + premium craft (1 week)
**Goal**: /brain reads as NYT/Stripe/Linear graphics-grade.

| Sub-phase | Action | Files |
|---|---|---|
| 2.1 | Wire cross-repo indexer 520-atom corpus → `memory/knowledge-graph/index.jsonl` | `brain_watchdog.py` + indexer feed config |
| 2.2 | Add Groq Haiku-class brand+intent classifier daemon (one-shot per atom, cached) | new `service/kg_classifier.py` |
| 2.3 | Embed every atom with Voyage-3-large (or local `nomic-embed-text-v2` for sovereignty) | new `service/kg_embedder.py` |
| 2.4 | UMAP-3D → store as `semantic_xyz` alongside existing `structural_xyz` | `brain_graph.py:149-200` |
| 2.5 | HDBSCAN clusters + LLM cluster naming (Haiku, top-5 nearest titles per cluster → 2-3 word theme) | `brain_graph.py` |
| 2.6 | **Structure↔Semantics slider** — lerp node positions in HUD | `BrainScene.tsx`, `BrainHud.tsx` |
| 2.7 | Selective bloom via layer mask (only nodes above centrality OR currently selected) | `BrainScene.tsx` + EffectComposer |
| 2.8 | `MeshPhysicalMaterial` (clearcoat 0.3, transmission 0.05, emissive tied to centrality) + drei `<Environment preset="city" />` | `BrainParticles.tsx` |
| 2.9 | drei `<Text>` SDF labels in Inter Variable, three sizes via semantic zoom, 2px outline | new component |
| 2.10 | drei `<CameraControls>` with damping 0.08, `fitToBox` on selection (800ms ease-out cubic), idle scene drift 0.0002 rad/frame | `BrainScene.tsx` |
| 2.11 | OKLCH palette (6 cluster hues + 1 selection accent #B388FF), non-neighbor opacity 0.12 on selection | `lib/brain-colors.ts` |
| 2.12 | Cmd-K fuzzy search → camera fly + bloom pulse on result | `BrainHud.tsx` |

**Acceptance**:
- ≥500 nodes, ≥1000 edges, ≥5 named clusters
- Structure↔Semantics slider smoothly lerps in <500ms
- Hover dims non-neighbors to 0.12 opacity in <200ms
- Selection fits-to-box camera in 800ms with ease-out cubic
- Bloom only on centrality-significant or selected nodes
- All labels Inter Variable, never Helvetica

**Reference**: `ChristopherLyon/graphrag-workbench`, `nomic-ai/deepscatter`, `getzep/graphiti`.

### Phase 3 — Surface unification + real data (1 week)
**Goal**: Every dashboard route serves real data OR carries a `mock` badge. No silent fallbacks.

| Sub-phase | Action | Files |
|---|---|---|
| 3.1 | Ship `/api/sis/agents` route — read from `agents/AGENT_REGISTRY.md` + `agents/**/*.md` frontmatter | new `app/api/sis/agents/route.ts` |
| 3.2 | Ship `/api/sis/decisions` route — read from `memory/_audit/decisions.jsonl` | new route |
| 3.3 | Ship `/api/sis/council/pending` route — read from `memory/_audit/council-reviews.jsonl` | new route |
| 3.4 | Ship `/api/sis/vault-loop/list` real — read from `memory/_audit/vault-loops.jsonl` | already routed; fix the empty response |
| 3.5 | Fix `/api/fleet/health` — actually probe each service's `/healthz`, return `{state: "ok"\|"unknown"\|"error", latency_ms, last_seen}` | `app/api/fleet/health/route.ts` |
| 3.6 | Decide: lift orb into LCC as a real React component OR full-screen it (kill the iframe-in-a-frame UX dead-end) | `CockpitOrbFrame.tsx` |
| 3.7 | Decommission legacy `:7373/` HTML cockpit — delete `service/templates/*.html` + `service/static/dashboard/app.js` — FastAPI becomes API-only | `voice-operator/service/main.py` (remove templates mount) |

**Acceptance**:
- 0 silent mock fallbacks (every page either serves real data or shows the badge)
- Single canonical cockpit on :3007 (no parallel HTML cockpit on :7373)
- `/fleet/health` returns honest service state

### Phase 4 — Agent runtime upgrade (2-4 weeks)
**Goal**: Durable, resumable, intelligent agent loops.

| Sub-phase | Action |
|---|---|
| 4.1 | Wrap `OrchestratorRouter` with Mastra `DurableAgent` (TS) OR Inngest workflows |
| 4.2 | Add Letta memory blocks via MCP for working memory (persona, goals, current context — always in context window) |
| 4.3 | Add Browser Use via MCP — single biggest capability primitive |
| 4.4 | Add Voyage-3-large embeddings via API for all memory writes (or local `nomic-embed-text-v2` for sovereignty) |
| 4.5 | Wire sqlite-vec under existing JSONL ledgers as vector substrate |
| 4.6 | Extend `dreaming` cron to do Letta-style sleep-time refinement on memory blocks |

**Acceptance**:
- Crashed tool loops resume from journal, not from scratch
- Memory blocks visible + agent-editable + sleep-time-refined nightly
- Browser autonomy callable from any voice/text command

### Phase 5 — Council voice integration (1 week)
**Goal**: 7-archetype Council reachable through voice with distinct voices per archetype.

| Sub-phase | Action |
|---|---|
| 5.1 | Map each Council archetype to a distinct Orpheus/ElevenLabs voice ID |
| 5.2 | Add intent → archetype routing in cognition layer (Shadow Witness fires on risk; Future Self fires on long-term decisions; etc.) |
| 5.3 | "Council mode" toggle in orb — instead of one orchestrator voice, the Council deliberates aloud |
| 5.4 | Preserve Arcanea Guardian personas in `arcanea-voice` repo — they remain Arcanea-canonical |

**Acceptance**:
- Voice command "convene the Council" produces multi-voice deliberation
- Risk-class decisions auto-route to Shadow Witness voice before action
- Brand register honored: Arcanea = mythic Guardians; Starlight = substrate archetypes

---

## What to RIP OUT (3)

1. **Legacy `:7373/` HTML cockpit** — `private/voice-operator/service/templates/*.html` + `private/voice-operator/service/static/dashboard/*`. Next.js LCC on :3007 supersedes it. Keep FastAPI as `/api/*` + `/healthz` only.
2. **Cognition bridge default-on** — remove env line from `start-cockpit.ps1:303`. The orb is faster + smarter native. Re-enable only after `CognitionRouter` has a tool executor (per the un-park trigger in `memory/benchmarks/DECISIONS.md`).
3. **`transcribe.mjs` curl-shell-out + Python-whisper fallback** — `C:\Users\frank\Arcanea\packages\arcanea-voice\src\transcribe.mjs:33-39, 50-71`. Replace with one `fetch` + `FormData` to Groq. Drops curl.exe dependency, ~50-100ms latency, and 100 lines of dead code.

---

## OSS Repos to ABSORB — read first, then port patterns

| Rank | Repo | Stars | What to absorb |
|---|---|---|---|
| 1 | [`pipecat-ai/pipecat`](https://github.com/pipecat-ai/pipecat) | 12k | Voice pipeline reference — `examples/foundational/19-openai-realtime-beta.py` + `examples/realtime/realtime-openai.py` |
| 2 | [`livekit/agents`](https://github.com/livekit/agents) | 10.4k | WebRTC + transformer turn detection + `AgentSession` primitive |
| 3 | [`ChristopherLyon/graphrag-workbench`](https://github.com/ChristopherLyon/graphrag-workbench) | 607 | Closest /brain reference: Next.js 15 + r3f + Three + Tailwind + shadcn + selective bloom + community hierarchy |
| 4 | [`kortix-ai/suna`](https://github.com/kortix-ai/suna) | (rising) | Closest full-stack personal Jarvis reference: Python/FastAPI + Next.js + isolated Playwright browser per agent + LiteLLM multi-provider |
| 5 | [`browser-use/browser-use`](https://github.com/browser-use/browser-use) | 93.4k | Browser autonomy primitive — 89.1% WebVoyager |
| 6 | [`letta-ai/letta`](https://github.com/letta-ai/letta) | 22.6k | Memory blocks + sleep-time refinement |
| 7 | [`mastra-ai/mastra`](https://github.com/mastra-ai/mastra) | 23.8k | TS-first durable agent runtime — `DurableAgent` resume-after-crash |

**Honorable**: `kyutai-labs/unmute` (zero-API-dependency STT+TTS for sovereignty path), `nomic-ai/deepscatter` (billion-scale embedding viz pattern), `getzep/graphiti` (hybrid semantic+keyword+graph search substrate).

---

## Success Criteria Per Surface

| Surface | Today | Target after full ultraplan |
|---|---|---|
| Voice (end-to-end first audio P50) | 1.5–3.5s | <800ms |
| Voice (P95) | unknown, likely >5s | <1500ms |
| Barge-in latency | impossible during 1.5s "Thinking" silence | <300ms |
| /brain (nodes) | 40 | ≥500 |
| /brain (edges) | 1 | ≥1000 |
| /brain (named clusters) | 4 unnamed | ≥5 LLM-named |
| /brain (interaction modes) | autoRotate only | Structure↔Semantics slider, hover dim, fitToBox, Cmd-K |
| Dashboard surfaces with real data | 1 of 10 (/packs only) | 10 of 10 OR explicit `mock` badge |
| Service health endpoints | 3 different paths, 1 working tile | One canonical `/healthz` per service, unified tile |
| Persona systems | 2 disconnected (Council substrate, Guardians orb) | Council voice-routable; Guardians remain Arcanea-canonical |
| Browser autonomy | None | Browser Use via MCP, voice-callable |
| Memory blocks | Ad-hoc vault writes | Letta-style typed, agent-editable, nightly-refined |
| Durable resume | Lost on crash | Resume via journal (Mastra DurableAgent or Inngest) |

---

## Decisions Frank Owns (right now)

1. **Voice stack — managed (OpenAI Realtime, $0.05–$0.46/min) or self-hosted Pipecat cascade ($0.03/min, more code, full sovereignty)?**
   - Recommendation: Pipecat cascade for sovereignty + audit trail. OpenAI Realtime as Phase 4 stretch.

2. **Privacy — keep `faster-whisper` local STT as fallback (offline sovereignty), or cloud-only Deepgram Nova-3?**
   - Recommendation: Deepgram primary, faster-whisper fallback. Belt + suspenders, marginal storage cost.

3. **Browser autonomy — Browser Use via MCP in Phase 4, or skip for now and revisit post-Friday demo?**
   - Recommendation: Phase 4 — it's the single biggest "Jarvis-grade lift" available. But it can wait if Phase 0–3 wins are enough.

4. **Time budget — full 6-phase ultraplan (4–6 weeks) or Phase 0 + Phase 1 + Phase 2 only (2–3 weeks)?**
   - Recommendation: Phase 0 this week (3 days reversible). Then pick Phase 1 or Phase 2 to go deep on first based on which feels worse to Frank — voice latency or brain shallowness.

---

## The Karpathy Checks

- Did I state assumptions? Yes — voice is non-streaming (verified), brain data is starved (verified), bridge is re-enabled (verified `start-cockpit.ps1:303`).
- Did I push back where the request was contradictory? Yes — "build everything in-house" crosses into wheel-reinvention when 10k+ star OSS solves the same. Adopt Letta blocks, Mastra DurableAgent, Browser Use, Pipecat. Stay sovereign on substrate (schemas, doctrine, attestation).
- Did I verify against real files / running output rather than memory? Yes — netstat + HTTP probes + file:line in `BrainScene.tsx`, `server.mjs`, `pipeline.py`, `brain_graph.py`, `transcribe.mjs`, `client.mjs`, `start-cockpit.ps1`, `sis-client.ts`, `CockpitOrbFrame.tsx`.
- Did I keep substrate sovereign and runtime adoptable? Yes — see "What Stays Sovereign" table.
- Did I check confidence vs reality? Yes — Frank's claim ":7373 offline" was falsified (it's running, just `/health` 404 because actual route is `/healthz`). The orb is on :7777 (Arcanea-owned), not a port I'd initially scoped.

---

## What Could Still Be Wrong

- Cartesia Sonic-3 P99 under sustained Windows-native load is unverified (vendor numbers are P50/lab) — test before committing.
- Mastra DurableAgent on Windows is less battle-tested than Linux — Inngest is the safer fallback if we hit platform issues.
- Letta via MCP under heavy concurrent load has not been independently benchmarked — start with single-tab usage.
- Browser Use's 89.1% WebVoyager is the benchmark; real-world success rate on long-tail sites is lower.
- The KG-feeder fix (Gap 2) might reveal *another* upstream pipeline issue once we look at why the indexer's 520 atoms aren't reaching the brain — could be a 1-hour fix or a 1-day investigation.

---

## Confidence Level

**High** on the diagnosis. Three independent research streams + a code audit converged on the same five gaps with file:line citations. The path forward is well-trodden in May 2026 OSS.

**Medium-high** on the time estimates. Phase 0 is reliable (1–3 days). Phases 1–3 are 1 week each if executed sequentially with no surprises; longer if Frank wants to absorb the OSS deeply before porting patterns.

**Medium** on Phase 4 (agent runtime) — the Mastra/Letta/Browser Use adoption is more architectural and depends on how cleanly they slot under our schemas. Could be 2 weeks or 4.

---

## Built on SIP · ULTRAPLAN 2026-05-12 · Operational Tier
