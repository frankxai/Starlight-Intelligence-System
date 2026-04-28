# Starlight Cockpit v8 — Technical Architecture

> Companion to [`MASTER-PLAN.md`](./MASTER-PLAN.md). Pins tech choices, adapter contracts,
> license posture, and integration surfaces. Every external dependency is wrapped in a
> swap-able adapter and gated by Phase 0 abandonment-test (REVISE #2).

**Date:** 2026-04-29
**Authority:** Master Plan v8 board-revised (PROCEED-WITH-REVISE applied)

---

## 0. Architecture overview

```
                 ┌──────────────────────────────────────────────────────────┐
                 │                    SIS Substrate                          │
                 │   SIP.md · VOICES.md · STACK.md · VERTICALS.md · canon    │
                 └─────────────────────┬────────────────────────────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
       ┌──────▼──────┐         ┌───────▼────────┐       ┌───────▼────────┐
       │   COCKPIT   │         │  MEMORY BUS    │       │  REASONING     │
       │             │         │  (singleton)   │       │  CORTEX        │
       │ Tauri/Next  │ ◄─MCP─► │  MCP daemon    │ ◄───► │  LangGraph +   │
       │ Cosmograph  │         │  SQLite + KG + │       │  Langfuse      │
       │ Particles   │         │  AgentDB +     │       │  thought-stream│
       │ (Phase 2)   │         │  pub/sub       │       │                │
       └──────┬──────┘         └───────┬────────┘       └───────┬────────┘
              │                        │                        │
              │           ┌────────────┼────────────┐           │
              │           │            │            │           │
       ┌──────▼──────┐  ┌─▼─────┐ ┌────▼────┐ ┌────▼────┐ ┌────▼────┐
       │   VOICE     │  │ Letta │ │ mempal- │ │ KuzuDB  │ │ arcanea-│
       │  OPERATOR   │  │ adptr │ │  ace    │ │ embedded│ │ flow    │
       │   PRO       │  └───────┘ │ adptr   │ │ adapter │ │ (peer)  │
       │ (extends    │            └─────────┘ └─────────┘ └─────────┘
       │  v1 round-3)│
       └─────────────┘

                 ┌──────────────────────────────────────────────┐
                 │  CAPTURE STACK (Phase 4 — after on-chain)    │
                 │  Rust daemon · OBS · screenpipe · whisperx   │
                 │  Cloudflare R2 (opt-in) · openclaw nightly   │
                 └──────────────────────────────────────────────┘

                 ┌──────────────────────────────────────────────┐
                 │  DISTRIBUTION + DPI (Phase 3 — first)        │
                 │  create-sis-cockpit · EAS on Base · Concierge│
                 └──────────────────────────────────────────────┘
```

---

## 1. Languages

| Language | Where | Why |
|----------|-------|-----|
| **TypeScript** | Cockpit frontend, MCP servers, adapters, dashboards | Ecosystem maturity, MCP SDK, shadcn/ui, Cosmograph bindings |
| **Python** | Voice operator (existing), agent runtime, capture pipeline ML | whisperx, faster-whisper, ML libs, existing FastAPI :7373 |
| **Rust** | Tauri shell, capture daemon, Memory Bus core | Performance, sovereignty, Tauri's native shell, Windows Service binary |
| **Go** | Optional log shipper, future high-throughput pieces | Single-binary deployability when needed |
| **Bun** | Where it earns its place | Fast TS dev cycles, drop-in for tools that benefit |

Tooling: Nx monorepo, Turborepo, pnpm, Docker Compose, GitHub Actions.

---

## 2. Memory Bus (Phase 0 P0)

**Problem solved:** AgentDB-per-tab breaks at 10+ tabs (RAM/file-handle/lock contention). *(See memory `project_agentdb_singleton_constraint.md`.)*

**Architecture:**
- Singleton local daemon (Windows Service on Frank's machine; launchd plist for Mac friends; systemd unit for Linux)
- Exposes **MCP server** that all CLIs (Claude Code, Codex, Cursor, Cline, voice operator) connect to
- Internally fronts:
  - **SQLite** — structured state, transactional writes
  - **AgentDB** — vector + ReasoningBank adaptive learning loop (HNSW)
  - **KuzuDB embedded graph** — knowledge graph traversal
  - **Pub/sub layer** — NATS JetStream OR plain WebSocket bus (decision in Phase 0; WebSocket if NATS adds too much weight)

**MCP tools exposed:**
- `memory.write` — namespaced write
- `memory.query` — structured query
- `memory.search` — vector search
- `memory.graph` — KG traversal
- `memory.subscribe` — push-channel subscription (the real-time joint)

**Cross-CLI real-time:** On any write, event publishes to pub/sub subject (`memory.write.<namespace>`). Subscribed CLIs get MCP notification → surface into context on next turn. This is the *true* real-time push that file-based vaults cannot offer.

**File location:** `private/memory-bus/` (instance state, sovereign, not shared) with public contract spec at `transmissions/channels/memory-bus.md`.

**Effort:** 2-3 days for MVP (SQLite + WebSocket + MCP subscribe + Chroma or AgentDB vector layer + KG bridge). Per other-tab estimate.

---

## 3. Memory backend slate (Phase 0 audit gates)

All three audited via `/openclaw-audit` triple before Phase 1. Adapter pattern means swap is cheap.

| Backend | Role | License | Status |
|---------|------|---------|--------|
| **AgentDB** | Substrate vector tier (HNSW + ReasoningBank) | TBD — verify in audit | Adopted behind singleton daemon |
| **KuzuDB** | Embedded graph tier | MIT | Adopted |
| **Letta (ex-MemGPT)** | Working-memory tier (active agent context, summarization) | Apache 2.0 | Adopted behind `lib/memory/letta-adapter.ts` |
| **mempalace** | Candidate alternative for vector + memory palace heritage | TBD — verify in audit | Audit gating |
| **Mem0** | Considered + skipped | — | SaaS-shaped, sovereignty leak |
| **Zep** | Optional cloud temporal KG | Apache 2.0 | Considered for Phase 4 if local KG insufficient |
| **Cognee** | Considered alt | Apache 2.0 | Held in reserve |

Substrate vault canon (`memory/vaults/*.md`) stays canonical. None of the above own the canonical state — all are derived caches and indices over the vault files.

---

## 4. Cockpit shell

Decision criterion: which path lets `private/local-command-center/` Next.js dashboard + `private/voice-operator/` FastAPI :7373 *extend* rather than rewrite?

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Tauri 2 desktop wrapping LCC frontend** | Sovereign + fast + native shell + Rust daemon ecosystem | Some integration work to bridge LCC's Next.js to Tauri | **Likely choice** |
| **Pure Next.js + Vercel** | Trivial deploy + share | Sovereignty leak unless paired with local agent | Lobby-only role, not the daily UI |
| **Electron** | Mature, ubiquitous | Heavier than Tauri, less Rust-native | Skip |
| **Hybrid: Tauri local + Next/Vercel lobby** | Local sovereign + cloud onboarding surface | Two builds | **Adopt** — Tauri for daily UI, Next/Vercel for friend onboarding |

Frontend stack:
- **Next.js 15** + React 19 (when stable)
- **shadcn/ui** for primitives
- **Tailwind CSS**
- **Framer Motion** for UI animation
- **Cosmograph** for the GPU graph (Phase 1)
- **react-three-fiber + drei** for particle layer (Phase 2)
- **Cmd+K palette** (cmdk lib)

---

## 5. Reasoning cortex (Phase 2)

- **LangGraph** for DAG orchestration over the 21 agents
- Thin SIS-native wrapper at `lib/sis-graph/` so prompts stay sovereign and the wrapper is swap-able if LangGraph goes commercial-hostile
- **OpenTelemetry** instrumentation
- **Langfuse Cloud** as thought-stream sink (optional self-host: Langfuse OSS image)
- Cockpit panel renders live LangGraph DAG; particles in the viz layer ride the trace edges

---

## 6. Voice + sense layer

Builds on `private/voice-operator/` round-3 (144 tests, FastAPI :7373, 13 workflows).

| Component | Choice | License | Why |
|-----------|--------|---------|-----|
| Wake word | **Picovoice Porcupine** | Free tier OK | `.ppn` model already in scaffold path |
| Streaming STT | **faster-whisper** + whisper.cpp fallback | MIT / MIT | Local, sovereign |
| Diarization | **whisperx** | BSD-4 | Production-quality |
| TTS / voice clone | **ElevenLabs** | Paid | Voice clone of Frank — moat-justified |
| Browser action | **Stagehand** (Browserbase, TS) | Apache 2.0 | More reliable than browser-use |
| Browser fallback | **browser-use** | MIT | Python alt |
| QA browser | **Playwright** | Apache 2.0 | Existing |
| Computer use | **Anthropic CUA in e2b sandbox** | Per Anthropic terms | Never on bare metal until trusted |

---

## 7. Visualization layer

| Layer | Tool | Phase | Why |
|-------|------|-------|-----|
| Graph (millions of nodes) | **Cosmograph** | 1 | GPU graph, OSS license verified in Phase 0 |
| Particles | **react-three-fiber + drei + Three.js** | 2 (per REVISE #5) | Particles ride LangGraph DAG edges |
| Layout fallback | **d3-force** | 1 | If Cosmograph license breaks |
| Alt graph | **Sigma.js / Cytoscape** | held | Backup path if Cosmograph swap needed |
| Memory palace 3D loci | r3f scene with mnemonic icon library | 1+2 | Renaissance memory palace pattern |

---

## 8. Capture stack (Phase 4)

Lands AFTER Phase 3 (on-chain attestation) per board REVISE #1.

| Component | Choice | Why |
|-----------|--------|-----|
| Always-on daemon | **Custom Rust** Windows Service | Sovereignty + perf |
| HQ scheduled clips | **OBS WebSocket** | Free, scriptable, plays well with Remotion |
| Ambient passive frames | **screenpipe pattern** (or fork mempalace if Phase 0 audit favors) | OSS, on-device, indexed |
| Audio | **whisperx** + diarization + mute zones | Local sovereignty |
| Editing | **Remotion** + existing `smart-cut` MCP + ffmpeg | Programmatic + manual hybrid |
| Cloud landing (opt-in) | **Cloudflare R2** + lifecycle policies | Cheap, sovereign-compatible |
| Nightly processing | **n8n** + **Claude Code SDK** + openclaw / kiloclaw | Frank's existing infra |
| Emotional vector | Custom (voice tone + keystroke cadence + time-of-day) | Local only, never cloud |

Skipped: Logi Capture (vendor-lock), Motiv Mix (production-only), Windows Game Bar (inflexible), Rewind.ai (Mac-only + sovereignty leak).

---

## 9. Distribution + DPI (Phase 3)

| Component | Choice | License |
|-----------|--------|---------|
| OSS boilerplate | **`create-sis-cockpit`** npm scaffold | MIT |
| Strip script | `scripts/strip-private.ts` | MIT |
| Authorlessness CI gate | `scripts/audit-authorlessness.ts` (Phase 0 deliverable) | MIT |
| On-chain attestation | **EAS (Ethereum Attestation Service) on Base** | Open |
| Sovereign identity | **ENS** (optional) + DID via EAS | Open |
| Access control | **Lit Protocol** (optional, for gated artifacts) | Open |
| Concierge service | Hosted onboarding flow on Vercel | — |

EAS schema: SIP attestation block (built-on-SIP, version, signer, timestamp, content-hash, sovereignty-clause-version including the v8 amendment).

---

## 10. arcanea-flow integration contract

Sibling repo at `C:\Users\frank\arcanea-flow`. Connect-not-absorb. *(Memory: `project_arcanea_flow_connect_not_absorb.md`.)*

| SIS owns | arcanea-flow owns |
|---|---|
| Substrate (SIP, voices, attestation, contracts) | Swarm topologies, agent spawning, hooks |
| Memory Bus daemon + MCP contract | SPARC, neural training, RL pieces |
| Vault canon, Voice canon | ReasoningBank execution loop (writes results into Memory Bus) |
| The bus contract itself | Hive-mind blackboard patterns |

Integration:
- Register at `context/repo-contexts/arcanea-flow.md` (mirror of acos / arcanea / ai-ops)
- MCP contract at `transmissions/channels/arcanea-flow.md`
- arcanea-flow becomes a registered consumer in `REGISTRY.md`
- Both repos read/write through the same Memory Bus singleton — no duplication
- arcanea-flow attests forward when producing SIS-substrate-affecting work

---

## 11. Adapter contracts (Phase 0 abandonment test, REVISE #2)

Every external dependency wrapped in a swap-able adapter. The Phase 0 deliverable `tests/adapters/abandonment.test.ts` simulates each going dead/commercial-hostile and verifies in-place swap.

| External dep | Adapter location | Swap fallback |
|--------------|------------------|---------------|
| Letta | `lib/memory/letta-adapter.ts` | Mem0 → Zep → native SQLite + AgentDB |
| Cosmograph | `lib/viz/graph-adapter.ts` | Sigma.js → Cytoscape → react-force-graph |
| screenpipe | `lib/capture/ambient-adapter.ts` | mempalace fork → custom Rust daemon |
| mempalace (if adopted) | `lib/memory/mempalace-adapter.ts` | AgentDB-only fallback |
| ElevenLabs | `lib/voice/tts-adapter.ts` | Coqui-TTS → Piper TTS (local) |
| Stagehand | `lib/browser/action-adapter.ts` | browser-use → Playwright |
| Anthropic CUA | `lib/compute/cua-adapter.ts` | Open Interpreter (sandboxed) |
| EAS | `lib/dpi/attest-adapter.ts` | Ceramic → IPFS+signature |

**Test contract:** Each adapter ships with a black-box swap-test. CI fails if any adapter cannot swap to its declared fallback within one release cycle.

---

## 12. CI gates

Wired in Phase 0, enforced through Phase 5:

1. **Authorlessness gate** (REVISE #3) — `scripts/audit-authorlessness.ts` blocks merges that ship Frank-shaped fingerprints in `create-sis-cockpit` strip-output
2. **Adapter abandonment gate** (REVISE #2) — `tests/adapters/abandonment.test.ts` must pass for every external dep
3. **Substrate-class gate** — any commit touching SIP / SIS / ALLIANCE / STACK / VERTICALS / VOICES / REGISTRY requires `/luminor-board` pre-pass artifact in `docs/boards/`
4. **Attestation gate** — every shipped artifact (site, npm publish, GHA deploy) carries "Built on SIP" footer
5. **Memory Bus health gate** — daemon-must-be-singleton check; CI fails if any repo code path opens an embedded vector DB outside the daemon

---

## 13. Free vs paid posture

| Tier | Items |
|------|-------|
| **Free / local / OSS** | Whisper.cpp, faster-whisper, AgentDB, KuzuDB, Cosmograph, browser-use, Porcupine free tier, ntfy.sh, Three.js, OBS, screenpipe, mempalace (pending audit), Letta self-host, Langfuse self-host, NATS, Tauri, Next.js, Cloudflare Workers free tier |
| **Cheap** | Vercel hobby, Cloudflare R2, Supabase free, Railway, Base chain (sub-cent attestations), Langfuse Cloud entry tier |
| **Premium where moat-justified** | Claude API (the moat), ElevenLabs voice clone, Stagehand/Browserbase reliability, e2b sandbox, Deepgram fallback if Whisper too slow |
| **Avoid** | Rewind.ai (sovereignty leak), Mem0 (SaaS-shaped), most hosted-everything platforms |

---

## 14. Versioning + governance

- Plan versions follow SIS substrate SemVer
- Substrate-class commits: `/luminor-board` pre-pass (board-before-tag invariant)
- Operational commits: standard CI gates only
- Adapter swaps: minor bump if API-compatible, major bump otherwise
- Sovereignty clause amendments: major bump on `SIP.md` (per § 7 of SIP itself)

---

**Built on SIP** · v1.1.0 · Cockpit v8 Architecture · 2026-04-29 · Frank Riemer (Starlight Holding BV) · MIT
