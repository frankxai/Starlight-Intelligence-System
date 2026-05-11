---
title: OSCEN architecture analysis — leverage map for SIS brain + visual layer
date: 2026-05-11
status: research-synthesis
audience: substrate-tier
attestation: Built on SIP
related:
  - docs/ARCHITECTURE.md
  - private/local-command-center/apps/dashboard/lib/brain-halos.ts
  - memory/vaults/strategic-vault.md
---

# OSCEN architecture analysis

> Source: oscen.ai (homepage, /architecture, /research, /invest, /contact, /brain-viz/index.html, /brain-viz/brain-scene.js). Pulled 2026-05-11.

## TL;DR

OSCEN (Rio Bold, single founder) is a **patent-protected spiking neural network brain** for embodied robotics — 1M neurons, 1.19B synapses, 11 brain regions, 6 simultaneous learning rules, 5 developmental phases, hybrid SNN-LLM cognitive action channel. Closed source. Patent Pending US 63/986,737 (filed 2026-02-20, 6 core claims, 20 continuations planned).

**Three findings for SIS:**

1. **No OSCEN GitHub.** We cannot fork. The IP moat is the architecture itself.
2. **Related OSS exists** in the SNN / neuromorphic / world-model adjacent space — useful for conceptual study, less useful for direct code reuse since SIS is a text-memory-agent substrate, not an embodied SNN.
3. **Conceptual parallel with SIS is striking** and yields three concrete leverage moves: (a) scene-wide neuromodulator visual idiom for our `/brain` dashboard, (b) predictive-error signal as a new event kind in our brain event bus, (c) developmental-phase metaphor for our version evolution narrative on `/architecture`.

---

## 1. What OSCEN actually is

### Architecture (from /architecture)

**11 brain regions** (1,001,800 neurons total):

| Region | Neurons | Role |
|---|---|---|
| Brainstem | 2K | Survival drives, encodes raw sensor → spikes |
| Reflex Arc | 1K | Sub-10ms sensory→motor bypass |
| Sensory Cortex | 200K | Multimodal input encoding |
| Motor Cortex | 100K | 6 sub-ranges incl. speech + cognitive action |
| Cerebellum | 50K | Timing + coordination via error correction |
| Association Cortex | 500K | Cross-modal binding (largest region) |
| Predictive Layer | 100K | Forward prediction; high error → attention spike |
| Working Memory | 20K | Sustained firing across time steps |
| Feature Layer | 20K | Edges/textures/phonemes via STDP |
| Concept Layer | 5K | Sparse winner-take-all abstractions |
| Meta Controller | 3K | Executive gating, attention, global state |

**6 learning rules running simultaneously every step** (Patent Claim #1):
STDP (Bi & Poo 1998) · Eligibility Traces (Gerstner 2018) · BCM Metaplasticity (1982) · Neuromodulation (4-channel: DA/ACh/NE/5HT) · Synaptic Scaling (Turrigiano 1998) · R-STDP.

**5 developmental phases** (Patent Claim #2): infant (1.0× plasticity) → toddler (0.7×) → juvenile (0.48×) → adolescent (1.5×, pruning + myelination + identity-tagging) → mature (0.3×). Phase transitions are **experience-dependent, not hardcoded**.

**Cognitive Action Channel** (Patent Claim #3): when prediction error stays high on an unknown input, motor neurons in the cognitive sub-range fire via STDP → NATS publishes to Ollama bridge → LLM response re-enters sensory pipeline → STDP learning. **The decision to query is emergent, not hardcoded.**

**Multi-compartment dendrites** (Patent Claim #5): 4 compartments per neuron (apical distal/proximal, basal, perisomatic) with independent dynamics + supralinear dendritic spikes (2.5× amplification).

### Positioning (from / and /research)

- Competes on **continual learning + energy efficiency + real-time adaptation**, not language benchmarks.
- Energy: ~45W on CPU sim now, <5W target on custom neuromorphic silicon (73–109× advantage on Loihi benchmarks).
- Honest about limits: best SNN ImageNet 82.39% vs ANN 91%; SNN LLMs cap at ~1.5B params.
- Frames competitors via **VLA-ceiling thesis**: AMI/Figure/Google/Physical Intelligence all use frozen Vision-Language-Action models with 4 flaws (frozen at birth, GPU-hungry, cloud-tethered, catastrophic forgetting). OSCEN's claim: SNN solves all four.

### Business (from /invest, /contact)

- One founder (Rio Bold), ~10 years neuroscience research, 7 months focused build, 3,500+ hours R&D.
- Patent: US 63/986,737, 258 prior art searched, 0 overlap claimed.
- Funding ask: neuromorphic silicon + robot body + 3-person team + benchmarks/papers.
- Hosted on Netlify (404 page confirmed). No public GitHub, no docs site, no API.

---

## 2. GitHub leverage analysis

### OSCEN itself
**Zero public repos.** The codebase is protected by the patent. We cannot fork.

### Related OSS in the SNN / neuromorphic / world-model space

The architecture page references researchers and frameworks. Where their work has public code:

| Repo | What | SIS leverage |
|---|---|---|
| [`lava-nc/lava`](https://github.com/lava-nc/lava) | Intel's open neuromorphic framework for Loihi | Tangential — we're not deploying on neuromorphic silicon |
| [`BindsNET/bindsnet`](https://github.com/BindsNET/bindsnet) | PyTorch SNN simulation | Tangential |
| [`norse/norse`](https://github.com/norse/norse) | PyTorch-native SNN training | Tangential |
| [`jeshraghian/snntorch`](https://github.com/jeshraghian/snntorch) | Differentiable SNNs in PyTorch | Tangential |
| [`nengo/nengo`](https://github.com/nengo/nengo) | Neural Engineering Framework | Tangential |
| [`facebookresearch/ijepa`](https://github.com/facebookresearch/ijepa) | LeCun's Image-JEPA world model | **Conceptual** — prediction-error world models are directly relevant to our memory bus prediction gap |
| [`facebookresearch/jepa`](https://github.com/facebookresearch/jepa) | V-JEPA (video world model) | **Conceptual** — same |
| [`nats-io/nats-server`](https://github.com/nats-io/nats-server) | NATS message bus (OSCEN's internal transport) | Already part of our infrastructure vocabulary; we use MCP instead |
| [`ollama/ollama`](https://github.com/ollama/ollama) | Local LLM runtime (OSCEN's cognitive action target) | Already integrated via our LCC dispatcher cognition router |
| [`EPFL-LCN/PublicPlosCompBio2018`](https://github.com/EPFL-LCN/PublicPlosCompBio2018) | Three-factor eligibility-trace learning code (Gerstner lab) | Tangential — academic reference implementation |

**Bottom line:** SIS is a text/agent/memory substrate. SNN code from these repos doesn't drop into our stack. The leverage is **conceptual** — these are intellectual ancestors of patterns we already have partial implementations of.

The two repos with non-trivial SIS-relevance: **JEPA** and **i-JEPA** — they're prediction-error world models, and prediction error is exactly the missing signal in our current brain event bus.

---

## 3. OSCEN ↔ SIS concept mapping

This is where the value is. The architectures rhyme strongly.

| OSCEN | SIS analog | State of parity | Gap |
|---|---|---|---|
| 11 brain regions | 10-IS + Orchestrator | **Already parallel** (11 ≈ 10+1) | None |
| Meta Controller (executive gating) | Starlight Orchestrator (intent routing) | **Already parallel** | None |
| Association Cortex (cross-modal binding, 500K) | Cross-Repo Indexer + Memory Bus (520 atoms across 22 vaults) | **Already parallel** | Ours is text-only; theirs is spike-timing |
| Concept Layer (sparse WTA, 5K) | Distilled framework atoms from `/distill-insights` (≥3-occurrence threshold) | **Already parallel** | None |
| Working Memory (sustained firing) | Active conversation context + vault working set | **Partial** | We don't have an explicit decay timer on "current thought" |
| Predictive Layer (forward prediction, error → attention) | **Missing in SIS** | ❌ Gap | We have reactive memory; no forward-prediction signal |
| Cognitive Action Channel (emergent LLM query when prediction fails) | LCC dispatcher router (rule-based intent classification + JSONL audit) | **Partial** | Ours is rule-based; theirs is *learned*. We can't match the learned version without their patent, but we can add prediction-error as a routing input |
| Neuromodulation 4-channel (DA reward, ACh attention, NE arousal, 5HT mood) | Voice modulation (architect/Frank-DNA/personas) + halo color (retrieve/synthesis/error) | **Partial** | We don't have *scene-wide* neuromodulator state shaping the whole visual layer |
| STDP (spike-timing weight update) | ReasoningBank pattern weighting | **Already parallel** | None |
| Eligibility Traces (decay 1000ms, neuromodulator gates) | Brain halo decay (retrieve 3000ms, synthesis 1500ms, error 1000ms) + trace_id grouping | **Already parallel** | None |
| BCM Metaplasticity (sliding threshold prevents runaway) | Memory pruning (`/memory-prune`, ≥3-occurrence threshold) | **Already parallel** | None |
| Synaptic Scaling (homeostatic normalization) | Memory consolidation pipeline | **Already parallel** | None |
| R-STDP (reward-modulated learning) | `/perf-feedback-rehearsal` Step 12 success-gate proof, audit log | **Already parallel** | None |
| Critical Periods (developmental phases) | SIS version evolution v0.1 → v7.9 | **Implicit not codified** | We don't tell this story on the `/architecture` page |
| Closed sensorimotor loop | Memory commit → recall → action → audit log → improved recall | **Already parallel** | None |
| NATS bus | MCP transport | **Already parallel** | None |
| Ollama bridge (LLM as tool) | Cognition router (cognition-bridge, dispatcher CLI, multi-CLI fan-out) | **Already parallel** | None |

**The map says:** SIS already has 13 of OSCEN's 17 patterns implemented as text/agent analogs. The four genuine gaps are:

1. **Forward prediction** — no Predictive Layer
2. **Working memory decay** — no explicit half-life on "current thought"
3. **Scene-wide neuromodulator** — halos exist per-node, but no global DA/NE/5HT state shaping the whole visual
4. **Developmental-phase narrative** — we have the data (version evolution), we don't story it

---

## 4. Visual refinement spec

OSCEN's `/brain-viz/index.html` (Three.js + EffectComposer + UnrealBloomPass) is the strongest visual reference. Code patterns worth absorbing into our dashboard `/brain`:

### Pattern 1 — Neuromodulator-driven scene effects (from `brain-scene.js::_updateNeuromodEffects`)

```js
// DA warm shift on key light (high DA = more orange/yellow)
const daWarm = Math.max(0, (nm.da - 0.8) * 0.3);
this.keyLight.color.setRGB(0.27 + daWarm*0.4, 0.53 - daWarm*0.1, 0.8 - daWarm*0.3);

// NE increase bloom strength (arousal = more glow)
const neBoost = Math.max(0, (nm.ne - 0.8) * 0.15);
this.bloomPass.strength = 0.8 + neBoost;

// 5-HT cool ambient shift (high serotonin = calmer, bluer)
const shtCalm = Math.max(0, (nm.serotonin - 0.5) * 0.15);
this.ambientLight.color.setRGB(0.1 - shtCalm*0.03, 0.16 + shtCalm*0.02, 0.29 + shtCalm*0.05);
```

**SIS adaptation:** Map our brain-event kinds onto a synthetic "neuromodulator" vector that drives scene-wide lighting:

| SIS event | SIS "neuromodulator" | Visual effect |
|---|---|---|
| `synthesis.complete` (success) | DA-equivalent | Warm key light shift |
| `retrieve.start` burst (multi-trace) | NE-equivalent (arousal) | Bloom strength boost |
| `privacy.gate` (Guardian block) | ACh-equivalent (attention) | Tightened depth-of-field, sharper highlights |
| Steady-state idle | 5HT-equivalent (mood) | Cool ambient |
| `error` | NE spike + DA crash | Bloom + red key shift |

Implementation lives in `private/local-command-center/apps/dashboard/lib/brain-halos.ts` adjacent file — new `brain-neuromod.ts` with the same purity contract (events + time → state).

### Pattern 2 — HUD with phase badge + neuromodulator bars (from index.html HUD)

The HUD shows: neurons, synapses, step, rate, **current developmental phase**, **4-channel neuromodulator track**. Pure HTML overlay, no React.

**SIS adaptation:** Add a HUD strip to `/brain` showing: vault atoms, retrieve TPS, **current SIS version (v7.9 → infant/juvenile/adolescent/mature)**, **4-channel signal bars** (retrievals · syntheses · privacy-gates · errors per-minute). Cleanly maps existing event types to OSCEN's visual idiom without inventing new infrastructure.

### Pattern 3 — Region labels with hover tooltips + auto-rotate pause

Each region has an HTML label projected from 3D position, with hover tooltip showing description + connections, and auto-rotate pauses on hover. The pattern is **HTML-overlay-driven-by-three.js** rather than canvas-rendered labels — keeps accessibility intact.

**SIS adaptation:** Our 10-IS layers should have the same treatment in `/brain` — projected labels, tooltips with vault paths and purpose strings (we already have the data in `site/src/app/architecture/page.tsx::LAYERS`).

### Pattern 4 — `embed=true&labels=false` URL params for clean iframe

OSCEN embeds the brain on the homepage via `<iframe src="/brain-viz/index.html?embed=true&labels=false">` — hides HUD + status button, leaves the brain. Lets the same artifact serve both the standalone `/brain-viz` page and embeds elsewhere.

**SIS adaptation:** Our `/brain` route already exists. Add `?embed=true` to hide chrome, and embed it as a hero element on `site/src/app/page.tsx` and `/architecture`. Currently the architecture page has zero visual brain — it's a table-heavy spec page. **One iframe = massive perceived sophistication.**

### Pattern 5 — SIMULATED ↔ LIVE WebSocket toggle

Status button shows current data source with color-coded dot (green=LIVE, amber=SIMULATED, blue=CONNECTING, red=DISCONNECTED). Click toggles. URL param `?live=true` forces live.

**SIS adaptation:** We already have a Memory Bus SSE endpoint. Add the same status pill — green when SSE connected, amber when replaying ring buffer, red when down. Already half-implemented in `brain-event-bus.ts`; just needs the UI affordance.

---

## 5. Action queue (proposed, tagged by tier)

### Operational tier (no board needed, drive end-to-end)

**O1. Scene-wide neuromodulator state machine.** Add `private/local-command-center/apps/dashboard/lib/brain-neuromod.ts` — pure reducer over `BrainEvent[]` → `{da, ne, ach, sht}` ∈ [0,1]⁴ with exponential decay. Test contract mirrors `brain-halos.test.ts`. Visual wiring in the existing r3f scene reads the smoothed values per frame. **No public-facing change.** Risk: low (private/, additive). Time: ~90 min.

**O2. Phase badge + 4-channel HUD strip.** Add the OSCEN-style HUD overlay to `/brain` dashboard route, showing SIS-current-version, vault count, retrieve TPS, 4-channel bars. Pure addition. Risk: low. Time: ~60 min.

**O3. Region label projection for 10-IS.** Wire `site/src/app/architecture/page.tsx::LAYERS` data as label sources in the brain scene (currently the architecture page has the data, the brain scene has the geometry, they're not connected). Risk: low. Time: ~60 min.

**O4. JEPA scan + extraction.** Read `facebookresearch/jepa` README + paper, extract the prediction-error signal mechanism in pseudocode, file as `docs/research/2026-05-11-jepa-prediction-extract.md`. No commitment to implement. Risk: zero. Time: ~30 min.

### Substrate tier (needs /starlight-board before commit)

**S1. Add Predictive Layer concept to STACK.md as 11th IS or Orchestrator subsystem.** This is the genuine architectural gap OSCEN exposes. Decision rights: needs board because it touches the locked 10-IS taxonomy. Falsifier: board verdict BLOCK → drop. Time: 1-2h including board pass.

**S2. Developmental-phase narrative on `/architecture` page.** Reframe SIS version evolution (v0.1 alpha → v7.9 mature) as developmental phases analogous to OSCEN's infant/toddler/juvenile/adolescent/mature. Brand-register substrate touch (Starlight, not Arcanea-canon). Needs board because it's public-facing positioning. Time: 1-2h including board pass.

**S3. Embed `/brain` as hero on home + architecture pages.** Public visual change. Brand-register touch. Needs board because it's the first impression on the public site. Time: 1h including board pass + smoke test.

### Sovereign-class (Frank ack required even after board)

**Sov1. JEPA-style predictive-error event in `BrainEvent` union.** New event kind `prediction.error` published when retrieve confidence falls below threshold. Touches the brain-event-bus contract. After board PROCEED, still requires Frank's explicit ack per /yolo Hive REVISE-1 doctrine. Time: 3-4h.

---

## 6. What we are NOT doing

- **Not forking OSCEN.** Closed source. Patent-protected. We respect the IP.
- **Not absorbing SNN code.** SIS is text/agent substrate, not embodied neural simulation. Wrong layer.
- **Not building neuromorphic anything.** Out of scope.
- **Not making public claims of OSCEN-equivalence.** They're 1M-neuron SNN with biological grounding; we're a memory + agent substrate. Different problems, parallel solutions in their respective domains. Honest framing only.

---

## 7. Decision rights

Frank picks from §5. Operational items O1-O4 can drive without further input. Substrate items S1-S3 and sovereign Sov1 await ack.

Recommended sequence if Frank greenlights everything:
1. O4 (JEPA extract) — read-only, foundation for Sov1
2. O1 + O2 + O3 in parallel — operational visual win
3. /starlight-board pre-pass on S1+S2+S3 as a single proposal
4. If PROCEED: S2 → S3 (positioning before embed)
5. Frank ack on Sov1 → implement

**Falsifiers per item are in §5. Loop closes when the action either ships, fails its falsifier, or is explicitly killed.**

---

*Synthesis: 2026-05-11. Source pages cached in conversation. Built on SIP.*
