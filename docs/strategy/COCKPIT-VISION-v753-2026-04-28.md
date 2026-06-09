# Cockpit + Second-Brain Vision (v7.5.3)

**Date:** 2026-04-28
**Author:** Cockpit Architect
**Tier:** Operational (strategic doc; not substrate; no `/luminor-board` pre-pass)

> Frank asked: who else has built cockpits and Jarvis-like systems, what's the
> tech stack, how do we sequence self-use → friends → boilerplate → OSS →
> products, what's the right architecture, and how do we ensure the whole stack
> (soul.md + agent.md + skill.md + connectors + dashboards + voice + second
> brain) is engineered as one coherent thing? This is the answer.

---

## 0. TL;DR

**What you're building:** a sovereignty-attested personal AGI substrate with 4
output surfaces (terminal cockpit, voice mic, local web app, phone) and 5
productization channels (self-use → alliance gifts → boilerplate → OSS →
attested products).

**What's already true (v7.5.3):**
- 21 agents + 70+ commands + 16 skills
- Voice operator with multi-tier cognition router (deterministic / OpenRouter /
  Anthropic-direct / Claude-CLI)
- Multi-CLI output dispatchers (claude / codex / gemini / opencode) with
  intent-based orchestrator router
- Zellij 4-pane cockpit + Windows-native PowerShell setup
- 245 tests passing, doctor green

**What's missing for "Jarvis-grade":**
1. Visual surface — Next.js dashboard at port 3007 (started this session)
2. Browser-use bridge — cockpit drives a real browser via Playwright
3. Memory palace + brain graph viz — second brain in 3D
4. Phone surface — Vercel-deployed Tailscale-protected mini-app
5. Agent swarm coordinator — for tasks needing parallel agents

**The 5 honest ships ahead:**
- Phase 2 (this session): operator dashboard + WebSocket live activity
- Phase 3: browser-use + screenshot-as-context
- Phase 4: brain graph visualization (3D, knowledge-graph backed)
- Phase 5: phone app (Vercel + Tailscale)
- Phase 6: productization (digital products + agentic-as-a-service + DPI ledger)

---

## 1. The lineage — who's already done this and what to learn from each

The personal-AGI-cockpit problem has 80 years of design history. Stand on it.

| Project / thinker | Year | Idea worth keeping |
|---|---|---|
| **Vannevar Bush — Memex** | 1945 | Associative trails through documents; the original second brain |
| **Doug Engelbart — NLS / Mother of All Demos** | 1968 | Augment human intellect; hypertext + collaborative cursors + mouse |
| **Alan Kay — Smalltalk / Dynabook** | 1972 | System as personal medium, every object inspectable + modifiable |
| **Ted Nelson — Xanadu / ZigZag** | 1965+ | Two-way links, deep transclusion, never lose context |
| **Plan 9 (Bell Labs)** | 1985 | Everything is a file; namespaces compose; resource transparency |
| **Emacs** | 1976+ | Buffer-as-tool; Lisp DSL; one substrate for code/email/IRC/notes |
| **Bret Victor — *Magic Ink*, *Inventing on Principle*** | 2006-12 | Direct manipulation, immediate feedback, principled tools |
| **Geoffrey Litt — *Malleable Software*** | 2020+ | End-user-modifiable apps; substrate-aware personal computing |
| **Ink & Switch — local-first papers** | 2019+ | CRDTs, sync-as-detail, ownership stays local |
| **Tiago Forte — *Building a Second Brain*** | 2022 | PARA system, capture/distill/express loop |
| **Andy Matuschak — evergreen notes** | 2020+ | Atomic notes, dense links, spaced repetition for understanding |
| **Conor White-Sullivan — Roam Research** | 2019 | Bidirectional links as primary affordance |
| **Mitchell Hashimoto — Ghostty / HashiCorp** | 2024 | GPU terminals, native UI, "calm tools" school |
| **George Hotz — tinygrad / comma.ai** | 2020+ | Terminal-native power; minimal substrate; build the OS |
| **Andrej Karpathy — nanoGPT / llm.c** | 2023+ | Reduce to first principles; teach by stripping |
| **Killian Lucas — Open Interpreter** | 2023 | LLM-as-shell; let the model run code on your machine |
| **Cognition AI — Devin / Cognition Lab** | 2024 | Autonomous SWE agent; commit-quality bar for AI work |
| **Daniel Miessler — Fabric** | 2024 | Curated prompt patterns + CLI; augmentation > automation |
| **Letta (formerly MemGPT)** | 2023 | LLMs with hierarchical memory + self-edit |
| **Mem0** | 2024 | Memory layer as service for agents |
| **OpenDevin / OpenHands** | 2024 | Open autonomous SWE; sandbox + tool use |
| **Aider** | 2023+ | Terminal-first AI pair programming; git-native |
| **Cursor / Zed / Windsurf** | 2023-25 | AI-native editors; agent-in-IDE pattern |
| **AutoGen / LangGraph / CrewAI** | 2023-24 | Multi-agent orchestration primitives |
| **Vapi / Retell / LiveKit / Pipecat** | 2024+ | Voice AI infra: TTS + STT + barge-in + interruption |
| **ElizaOS / AI16Z** | 2024 | AI agent + crypto coordination layer |
| **Bittensor (TAO)** | 2021+ | Decentralized AI inference subnets; tokenized agent economy |
| **Olas / Autonolas** | 2023+ | Autonomous agent services on-chain |
| **Virtuals Protocol** | 2024 | Tokenized AI agents; agent-as-asset |
| **Truth Terminal** | 2024 | Autonomous AI agent with crypto wallet — the existence proof |

**What this list says:** every primitive you need has been invented. Your
contribution is **the integration + the sovereignty attestation layer + the
genius-first framing.** Nobody else is binding all of this with a substrate
that carries provenance through every artifact.

---

## 2. Top GitHubs / repos to study and (optionally) consume

Tier 1 (study deeply, possibly fork patterns):
- `KillianLucas/open-interpreter` — local code execution loop
- `paul-gauthier/aider` — terminal AI pair programming
- `princeton-nlp/SWE-agent` — agent benchmarking
- `OpenInterpreter/01` — voice-first OS for AI
- `letta-ai/letta` — hierarchical agent memory
- `mem0ai/mem0` — memory service
- `microsoft/autogen` — multi-agent
- `langchain-ai/langgraph` — graph agent orchestration
- `joaomdmoura/crewAI` — role-based crews
- `OpenDevin/OpenDevin` (now `All-Hands-AI/OpenHands`) — autonomous SWE
- `simonw/llm` — Simon Willison's universal LLM CLI
- `danielmiessler/fabric` — pattern library
- `unclecode/crawl4ai` — LLM-friendly web scraping
- `microsoft/playwright` — browser automation foundation
- `browser-use/browser-use` — LLM-driven browser
- `BrowserOrchestra/agent-browser` — agent + browser
- `mikestaub/r2r` — RAG framework
- `apple/ml-mlx` — Mac-native inference
- `ggerganov/llama.cpp` — local inference
- `zellij-org/zellij` — already using
- `helix-editor/helix` — modal terminal editor
- `astral-sh/uv` — Python package manager
- `anthropics/anthropic-quickstarts` — official Anthropic patterns

Tier 2 (UI / dashboard inspiration):
- `tldraw/tldraw` — infinite canvas + AI integration
- `excalidraw/excalidraw` — sketching surface
- `pmndrs/react-three-fiber` — 3D in React (brain viz)
- `cytoscape/cytoscape.js` — graph rendering
- `refly-ai/refly` — knowledge canvas
- `infinite-canvas/infinite-canvas` — boundless workspace
- `vercel/ai` — Vercel AI SDK (streaming, tool use)
- `assistant-ui/assistant-ui` — chat UI primitives
- `mendableai/firecrawl` — web → markdown for LLMs

Tier 3 (productization / distribution):
- `vercel/next.js` — your dashboard runtime
- `tauri-apps/tauri` — native app from web (lighter than Electron)
- `pmtiles` — local-first mapping
- `automerge/automerge` — CRDTs for collaboration
- `oss-review-toolkit/ort` — license auditing for OSS
- `lockfile-lint` — supply-chain hygiene

---

## 3. Tech stack — what's paid vs free, what runs where

### Inference / models

| Provider | Best for | Cost | When to use |
|---|---|---|---|
| **Cerebras** (via OpenRouter) | Hottest path (50ms TTFT) | $0.18/M | Voice intent classification, snappy reply |
| **Groq** (via OpenRouter) | Kimi K2 quality + speed | $0.60/M | Packet construction, search synthesis |
| **Anthropic Sonnet / Opus** (direct or via OpenRouter) | Substrate judgment, halt rejudge | $3-15/M | Tier C halts, governance, council |
| **Claude Code CLI (Max plan)** | Deep code work | **$0 marginal** | Most work — has Max anyway |
| **Codex CLI** | Mechanical refactors | varies | Multi-file rename, migration |
| **Gemini CLI** | 1M context window | $0-15/M | Long-context summary, repo-wide analysis |
| **OpenCode CLI** | Speed scratchpad | $0 free tier | Quick exploratory |
| **Ollama / llama.cpp local** | Offline, private | $0 (electricity) | Capture classify, when offline |
| **Modal / Replicate / Together** | Custom model hosting | varies | Specialty models (vision, embeddings) |

### Voice infra

| Component | Free option | Paid option |
|---|---|---|
| Wake-word | Picovoice Porcupine (free for personal) | already using |
| STT | faster-whisper local (large-v3) | Deepgram cloud (~$0.0043/min) — fallback only |
| TTS | Coqui XTTS local | **ElevenLabs** ($5-99/mo) — already using |
| Voice agent infra | LiveKit OSS | Vapi ($/min), Retell |

### Storage / state

| Need | Choice | Why |
|---|---|---|
| Vector DB | **Qdrant local** (Docker) → Pinecone if cloud | local-first, strong perf |
| Graph DB | **SQLite + simple JSON** for now → Memgraph if needed | start small |
| KV cache | filesystem for first 1k items → Redis if hot | YAGNI |
| Capture log | append-only JSONL files | already using |
| Knowledge graph | already in `memory/knowledge-graph/` | keep |

### Frontend / dashboards

| Surface | Stack | Hosting |
|---|---|---|
| Localhost cockpit | Zellij + 4 CLIs | local |
| Local web dashboard | **Next.js 14 + Tailwind + shadcn/ui** at :3007 | local Node |
| Phone app | Same Next.js, Vercel-deployed | **Vercel** (free → Pro $20/mo) |
| Phone tunnel | **Cloudflare Tunnel** (free) or Tailscale | free |
| Brain graph viz | react-three-fiber + d3-force-3d | local |

### Languages / runtimes

| Language | Where | Why |
|---|---|---|
| **Python 3.11+** | Voice operator, dispatchers, cognition | Anthropic SDK, ML ecosystem |
| **TypeScript** | Dashboard, MCP servers, browser-use | Type safety, Vercel-ready |
| **Rust** | Future high-perf bits (audio pipeline?) | When Python is the bottleneck |
| **PowerShell** | Setup scripts (Windows-native) | already using; `setup-cockpit.ps1` |

### Daemons / always-on

- **FastAPI :7373** — voice operator service (running)
- **Picovoice wake-word** (when audio installed)
- **Knowledge-graph watcher** (watchdog)
- **Tailscale daemon** (for phone access)
- **Cloudflared tunnel** (alternative to Tailscale)
- **Future: Next.js dashboard at :3007**
- **Future: Browser-use sidecar (Chromium + Playwright server)**

---

## 4. Architecture — the complete cockpit (target state v7.6+)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         INPUT SURFACES                                   │
│                                                                          │
│   Mic           Keyboard          Phone           Browser                │
│   (wake)        (Zellij +         (Vercel +        (extension /          │
│                  hotkey)           Tailscale)      bookmarklet)          │
│      │              │                 │               │                  │
└──────┼──────────────┼─────────────────┼───────────────┼──────────────────┘
       │              │                 │               │
       ▼              ▼                 ▼               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    COGNITION LAYER (input → packet/reply)                │
│                                                                          │
│  Tier 0: Deterministic  ($0, 10ms)                                       │
│  Tier 1: Hot LLM (OpenRouter→Cerebras llama-4-scout, 50ms)               │
│  Tier 2: Warm LLM (OpenRouter→Sonnet or Kimi-K2, 500ms)                  │
│  Tier 3: Cold subprocess (Claude CLI, 2-5s, $0 marginal)                 │
│                                                                          │
│  Halt re-judge: Sonnet for Tier C substrate-edit gating                  │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
                         Packet (v1 schema, Built on SIP)
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│              ORCHESTRATOR ROUTER (packet → dispatcher)                   │
│                                                                          │
│  classify_intent: substrate / refactor / long-context / voice /          │
│                    scratchpad / default                                  │
│                                                                          │
│  ~/.starlight/routing.toml:                                              │
│    refactor      → codex                                                 │
│    long-context  → gemini                                                │
│    substrate     → claude  (always — safety first)                       │
│    scratchpad    → opencode                                              │
│    voice         → claude                                                │
│    default       → claude                                                │
│                                                                          │
│  Logs every decision to logs/routing.jsonl (audit trail)                 │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
       ┌───────────┬─────────────┼─────────────┬───────────┐
       ▼           ▼             ▼             ▼           ▼
   ┌────────┐  ┌────────┐  ┌────────┐  ┌──────────┐  ┌─────────┐
   │ Claude │  │ Codex  │  │ Gemini │  │ OpenCode │  │ Browser │
   │  CLI   │  │  CLI   │  │  CLI   │  │   CLI    │  │  -use   │
   │        │  │        │  │        │  │          │  │  agent  │
   │ deep   │  │refactor│  │ long-  │  │ speed +  │  │ web auto│
   │ work   │  │        │  │context │  │ Cerebras │  │ mation  │
   └────────┘  └────────┘  └────────┘  └──────────┘  └─────────┘
       │           │             │             │           │
       └───────────┴─────────────┼─────────────┴───────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│              MEMORY + KNOWLEDGE LAYER (writes from anywhere)             │
│                                                                          │
│  memory/vaults/{strategic,technical,creative,operational,wisdom,horizon} │
│  memory/voice-sessions/  (daily capture logs, JSONL append)              │
│  memory/knowledge-graph/ (entries indexed by brand × intent_class)       │
│  memory/intake/          (concierge handoffs)                            │
│  Vector DB (Qdrant local)                                                │
│  Knowledge graph (SQLite/JSON)                                           │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     OUTPUT SURFACES (status + recall)                    │
│                                                                          │
│  Zellij      Dashboard      Phone           Brain graph                  │
│  cockpit     :3007          (Vercel)        (3D viz, Phase 4)            │
└──────────────────────────────────────────────────────────────────────────┘
```

### Coherence — how soul / agents / skills / connectors bind

The substrate enforces these contracts:

| File | Role | Binds to |
|---|---|---|
| `SIP.md` | Soul + sovereignty + attestation rules | Every artifact carries `Built on SIP` |
| `STACK.md` | 10-IS taxonomy | Every IS layer registers here |
| `VERTICALS.md` | Domain sub-stack pattern | Each spawnable vertical (people, sound, ...) |
| `VOICES.md` | Archetype voices (Lyssandria, Draconis, Ino, Caelan, Lumina, ...) | Agents inherit voice braids |
| `agents/<name>.md` | Operational implementation of one or more voices | Loaded as system prompt |
| `skills/<domain>/<skill>.md` | Auto-activating capability | Picked by skill-rules.json |
| `commands/<name>.md` | Slash command invocation | Routes through cognition layer |
| `MEMORY.md` (auto) | Persistent context across sessions | Loaded at session start |
| `cognition.toml` | Hot/warm/halt LLM routing | Read by cognition router |
| `routing.toml` | Output dispatcher routing | Read by orchestrator router |

Every layer is **declaratively configured** — change a TOML, change behavior;
no code edit required for routing changes. This is the **"one mind, four
bodies"** pattern.

---

## 5. The phasing — self → friends → boilerplate → OSS → products

Frank operates at 5 distance levels. The system should naturally tier from
intimate to public.

### Level 0 — self (you, daily)

What you have: voice operator + cockpit + cognition router + 21 agents.
What's missing: the dashboard window, browser-use, brain viz.

**Ship next:** Phase 2 dashboard (this session), Phase 3 browser-use, Phase 4
brain viz.

### Level 1 — alliances (friends Frank helps free)

Per memory: Frank helps alliances freely. The right surface is **a 1-line
spawn**:

```bash
pwsh -c "iwr https://starlight.frankx.io/spawn | iex; spawn-friend ana"
```

Generates a friend's `private/voice-operator/` + `private/local-command-center/`
+ their personalized agent registry + skill scoping. Ana's was the first;
Sound Intelligence + People Intelligence verticals prove the pattern works.

**Ship:** `/spawn-friend <name>` command (~v7.6).

### Level 2 — boilerplate (paid, $99-499 one-time)

Curated starter kits for specific personas:

| Persona | Pack name | Includes | Price |
|---|---|---|---|
| Solo founder | **Founder Cockpit** | voice operator + 5 commands + 1 vertical | $99 |
| AI architect | **Architect Cockpit** | + multi-CLI router + brain graph | $249 |
| Creator | **Creator Cockpit** | + content factory + brand kit + Suno + Vercel | $399 |
| Vertical operator | **Vertical Cockpit** | + spawn-domain-stack + 6-sub-system pattern | $499 |

Already have most of the pieces. Pack curation + landing page + Stripe.

### Level 3 — OSS (free, brand build)

Public the substrate (already public — `frankxai/starlight-intelligence`,
`frankxai/sip-substrate`, `frankxai/vibe-os-substrate`). The cockpit + voice
operator could open up too at v8.0 with proper licensing.

**Wisdom:** keep the genius-extraction layer (excavate-genius, etc.) as paid
tier 2. The substrate goes free; the personalized productization stays paid.

### Level 4 — agentic-as-a-service (recurring)

Hosted version of the voice operator + cockpit at `cockpit.starlight.dev`.
Customers pay $29-299/mo for managed instance + their data attested.

This is where DPI thesis comes in: each cockpit instance generates predictable
revenue, the substrate generates compounding value, the network of attested
artifacts creates a moat.

### Level 5 — smart contracts + on-chain attestation

For specific high-stakes use cases (creator IP, DPI ledger, alliance proof of
contribution): mint SIP attestations as on-chain artifacts. Bittensor/Olas-style
agents that pay each other in TAO/OLAS for cognition cycles.

This is **Phase 7+ territory**. Not for v7.x.

---

## 6. Productization — the 5 channels

| Channel | Format | Audience | Price | Lead time |
|---|---|---|---|---|
| **Digital products** | PDF / Notion / Claude Project pack | Builders | $29-99 | 2 weeks |
| **Boilerplate** | Forkable starter | Devs | $99-499 | 1 month |
| **Agentic-as-a-service** | Hosted cockpit | Power users | $29-299/mo | 3 months |
| **DPI ledger** | Attested asset registry | Sovereigns | revenue share | 6 months |
| **Smart contract attestation** | On-chain Built on SIP | Crypto-native | gas + protocol fee | 12 months |

**Frank-specific DPI hooks** (from your wealth-dpi command):
- Each agent invocation could mint a micro-attestation (proof of cognition use)
- Subscription revenue to cockpit.starlight.dev compounds
- Boilerplate buyers become alliance graph nodes; their spawn produces more attestations
- Long-tail: Bittensor-style subnet for "Starlight Cognition" — agents pay each other

---

## 7. Persona — who is "Frank-like"

The user this system serves:

- Senior IC or solo founder, 30-50 years old
- Already pays for Claude Max + Cursor + ElevenLabs + Perplexity ($100-200/mo)
- Reads Karpathy / Litt / Hashimoto; lurks Hacker News
- Has built side projects in 3+ stacks; comfortable in terminal
- Wants tools that respect intelligence — no chatbot infantilization
- Cares about provenance; wants to know what the AI actually did
- Will pay for boilerplate that saves 100 hours; won't pay for chat wrappers

**The pitch:** "your second brain + your code shop + your voice cockpit, all
attested, all yours. Boilerplate-and-go in 30 minutes."

---

## 8. Competitor matrix

| Competitor | Strength | Where Starlight wins |
|---|---|---|
| **Cursor** | AI-native IDE | Code-only; no voice, no second brain, no governance |
| **Devin / OpenHands** | Autonomous SWE | No personal substrate; no sovereignty layer |
| **Open Interpreter / 01** | LLM-as-shell, voice | No multi-CLI router; no provenance |
| **Aider** | Terminal AI pair | Code-only; no agent registry |
| **Vapi / Retell** | Voice AI infra | No tools, no agents, no second brain |
| **LangChain / LangGraph** | Agent orchestration | DSL-heavy; no opinionated cockpit; no sovereignty |
| **Notion + AI** | PKM + chatbot | No agents, no voice, no governance, no spawn |
| **Heptabase / Tana** | Visual PKM | No AI substrate; no agent integration |
| **ElizaOS / AI16Z** | Crypto-AI agent | No personal cockpit; no governance gate |

**Starlight's genuine moat:** the only system that braids (a) personal voice
cockpit + (b) multi-CLI agent router + (c) sovereignty-attested second brain +
(d) productization template + (e) genius-first framing.

---

## 9. Voice operator → Jarvis-grade — the gap

What "Jarvis-grade" requires:

1. **Always listening** — Picovoice ✓ (when keys + .ppn installed)
2. **Snappy reply** — Cerebras 50ms TTFT ✓
3. **Tool use** — packet → CLI ✓ (4 dispatchers)
4. **Browser use** — gap. Phase 3.
5. **Screen awareness** — gap. Phase 3 (screenshot → vision LLM).
6. **Long memory** — knowledge-graph ✓; brain viz Phase 4.
7. **Multi-agent** — agent registry ✓; swarm coordinator gap (Phase 5+).
8. **Honest provenance** — attestation ✓
9. **Reversibility** — packet log ✓; undo gap (Phase 6).
10. **Phone surface** — gap. Phase 5 (Vercel + Tailscale).
11. **Aesthetic** — Zellij is honest but not "magical". Phase 4 brain viz fixes.

Frank's mention of "browser use, do anything, through you" = Phase 3.

---

## 10. Second brain — folder + graph + viz + memory palace

### What's there

- `memory/vaults/*.md` — 6 vaults (strategic / technical / creative /
  operational / wisdom / horizon)
- `memory/voice-sessions/*.md` — daily capture logs
- `memory/knowledge-graph/` — JSONL entries, indexed by brand × intent_class
- `memory/intake/` — concierge handoffs

### What "looks like a brain" actually means

The metaphor maps cleanly:
- **Cortex layers** ↔ vault categories (strategic/wisdom/etc.)
- **Synaptic links** ↔ knowledge-graph cross-refs
- **Memory palace** ↔ 3D spatial layout (what you asked for)
- **Particle flow** ↔ live activity (capture happening, packets routing)
- **Hippocampus** ↔ recent voice-sessions
- **Default mode network** ↔ idle consolidation (already have `consolidate`)

### How to render this

Stack:
- **Three.js + react-three-fiber** for the 3D scene
- **d3-force-3d** for graph layout (millions of particles is unrealistic for
  Three.js; 10k-100k is the comfortable range with instanced meshes)
- **WebGL instanced rendering** for capture-points-as-particles
- **Force-directed clustering** colored by brand
- **Time-warp slider** to see how the brain grew over time
- **Click-into-pane** zoom: cluster → individual capture → markdown source

This is **Phase 4 work**. Maybe 1-2 weeks of focused build. Heavy aesthetic
payoff but lower utility than Phases 2-3. Sequence: ship dashboard first.

### Memory palace specifically

Different from brain graph: memory palace is **spatial mnemonic** — rooms with
named objects representing ideas, you walk through to recall.

Implementation: a small Three.js scene with N rooms (one per vault) and
clickable objects (one per evergreen note). Hand-curated, not auto-generated.
Useful for **deliberate recall practice** more than for browse.

Could ship as a separate side-app at `palace.starlight.dev`, free, brand-build.

---

## 11. Reasoning cortex + agent swarms

### What "reasoning cortex" means here

The cognition layer is the *thalamus* (input gating). The agent registry is
the *cortex* (specialist regions). The orchestrator router is the *prefrontal
cortex* (executive routing). What's missing is the **basal ganglia** —
something that *learns from past routing decisions and adjusts*.

**The play:** add a feedback loop. After each packet executes, log:
- Was the routing choice correct (heuristic check or human label)?
- Did the chosen CLI complete the task?
- Did the user approve / reject?

Use this to build a small classifier (gradient boosted tree on packet
features → dispatcher choice) that augments routing.toml. Phase 5+.

### Agent swarm tooling

For tasks that genuinely need parallelism (e.g. research across 50 docs,
multi-file refactor across 100 files): we need a **swarm coordinator**.

Existing primitives in voice-operator:
- `service/council.py` — already exists for council fan-out
- Agent registry of 21 agents
- Packet schema supports parent_packet_id (children inherit)

What's missing:
- A `service/swarm.py` that decomposes a parent packet into N children,
  dispatches in parallel, aggregates results
- Per-agent tool kits (how does `starlight-architect` differ in *toolset*
  from `starlight-weaver`?)

**Decision:** before building swarm tooling, prove the value with a single
real use case. Don't build a general framework before you have 3 concrete
swarm tasks you'd run weekly.

### Tools the agents could design + use

The radical move: agents that **write their own tools** (Voyager-style skill
acquisition). They notice a recurring pattern, generate a Python module,
test it, commit it as a new skill.

This is achievable and would be a genuinely novel contribution. Phase 6+.

---

## 12. The decision log — what we're choosing tonight + going forward

| Decision | Choice | Reason |
|---|---|---|
| Cognition hot path | OpenRouter HTTP for now; CLI cognition backends later | TTFT for voice mode |
| Output dispatch | 4 CLI subprocess dispatchers + orchestrator router | done this session |
| Dashboard stack | Next.js 14 + Tailwind + shadcn/ui at :3007 | Vercel-ready |
| Phone surface | Same dashboard repo, Tailscale-protected | one codebase |
| Browser use | `browser-use/browser-use` (Python) wrapped as a packet target | best maintained |
| Brain viz | react-three-fiber + d3-force-3d, instanced particles | proven stack |
| Memory palace | separate small app, hand-curated rooms | different UX |
| Vector DB | Qdrant local Docker (when needed) | local-first |
| Productization | digital products → boilerplate → SaaS, in that order | revenue ramp |
| Smart contracts | defer to Phase 7+ | substrate not ready |
| WSL | NEVER | Windows-native ✓ |

---

## 13. The next 5 ships (sequenced)

| Phase | Ships | Effort | When |
|---|---|---|---|
| **2** (this session) | Dashboard scaffold at :3007, live routing.jsonl tail | 2h | now |
| **3** | Browser-use as packet target (`agent:browser`) | 1 week | next |
| **4** | Brain graph viz (3D) at dashboard route `/brain` | 2 weeks | after Phase 3 |
| **5** | Phone app (Vercel + Tailscale + push notifications) | 1 week | after Phase 4 |
| **6** | Productization (digital products + boilerplate landing) | 2 weeks | after Phase 5 |

**Don't build Phase 7+** (smart contracts, swarm framework, agent self-tooling)
until 2-5 are battle-tested in daily use.

---

## 14. Open questions for Frank

1. **OpenRouter spend** — how much per month is acceptable? Affects whether
   we keep Sonnet-via-OpenRouter as default warm or switch to Kimi-K2/Groq.
2. **Phone surface auth** — Tailscale (free, sovereign) or Cloudflare
   Access (free, more accessible)? Recommendation: Tailscale.
3. **Brain viz aesthetic** — abstract particle cloud (Karpathy / Manim
   vibe) or organic neuron-shape (more Jarvis-cinematic)? Recommendation:
   abstract — ages better.
4. **Productization timing** — pre-sell Founder Cockpit at $99 to validate
   demand before building full automation, or build first then sell?
   Recommendation: pre-sell to 5 people you trust, build for them.
5. **OSS license** — the substrate is already public; cockpit code stays
   private until v8.0? Or open it earlier? Recommendation: keep cockpit
   private through v7.x; open at v8.0 with explicit "use freely, attribution
   required" license.

---

## 15. The ship-it summary

**Tonight (continuing this session):** Phase 2 dashboard scaffold at
`private/local-command-center/apps/dashboard/`. Next.js 14 + Tailwind +
WebSocket client to FastAPI :7373. Single route showing live routing
decisions + capture queue + agent activity. Verified via `npm run dev`.

**Next session:** Phase 3 browser-use bridge.

**The headline:** you're 60% of the way to Jarvis-grade. The remaining 40% is
3 things — visual dashboard, browser autonomy, brain viz. Each is 1-2 weeks.
Total time-to-Jarvis: ~6 weeks of focused build at current pace.
