---
title: Predictive-cognition substrate analysis — leverage map for SIS brain + visual layer
date: 2026-05-11
status: research-synthesis
audience: substrate-tier
attestation: Built on SIP
related:
  - docs/ARCHITECTURE.md
  - docs/research/2026-05-11-jepa-prediction-extract.md
  - private/local-command-center/apps/dashboard/lib/brain-halos.ts
  - memory/vaults/strategic-vault.md
---

# Predictive-cognition substrate analysis

> Synthesis of computational-neuroscience primary literature plus Meta FAIR's public JEPA work, mapped against SIS's current brain + memory + dispatcher architecture. Goal: identify the smallest set of concept absorptions that would move SIS toward biologically-grounded predictive cognition without violating the locked 10-IS taxonomy.

## TL;DR

The substrate already implements **13 of 17** patterns from biologically-grounded cognition architectures as text/agent analogs (STDP-style weighting, eligibility traces, BCM-style pruning thresholds, synaptic scaling-style consolidation, reward-modulated learning, cross-modal binding, closed sensorimotor loop, sparse winner-take-all concept formation, etc.). **Four genuine gaps** remain:

1. **Forward prediction** — no Predictive Layer; the brain event bus is reactive
2. **Working-memory decay** — no explicit half-life on "current thought"
3. **Scene-wide neuromodulator state** — per-node halos exist, but no global four-channel signal shaping the whole visual
4. **Developmental-phase narrative** — the data exists (v0.1 → v7.9 evolution), the story does not

Three concrete leverage moves drop out of this analysis: (a) scene-wide neuromodulator state machine for the `/brain` dashboard (operational, shipped privately), (b) `prediction.error` event kind in the brain event bus (sovereign-class), (c) developmental-phase reframing on the public `/architecture` page (substrate, brand-register).

---

## 1. Primary research being absorbed

The patterns SIS is mapping come from established computational neuroscience. Source attribution stays at the primary-literature layer — no derivative-product framing.

| Pattern | Primary citation | What SIS borrows |
|---|---|---|
| Spike-Timing Dependent Plasticity (STDP) | Bi & Poo (1998), *J. Neurosci.*; Markram et al. (1997) | Pattern: earlier signals strengthen later associations, reverse order weakens. SIS analog: ReasoningBank pattern weighting |
| Eligibility traces (three-factor learning) | Gerstner et al. (2018), *Front. Neural Circuits*; Izhikevich (2007) | Pattern: a "tag" set by timing waits for a later reward signal to convert tag into change. SIS analog: brain halo trace_id lifetime (3000ms retrieve / 1500ms synthesis / 1000ms error) |
| BCM metaplasticity | Bienenstock, Cooper & Munro (1982), *J. Neurosci.* | Pattern: sliding threshold prevents runaway potentiation. SIS analog: memory-prune ≥3-occurrence threshold |
| Neuromodulation (DA / ACh / NE / 5-HT) | Schultz (1998), *J. Neurophysiol.*; Hasselmo (2006), *Curr. Opin. Neurobiol.* | Pattern: four global gain channels gating learning + attention + arousal + mood. SIS analog: see §4 visual refinement spec — not implemented at the signal level yet |
| Synaptic scaling | Turrigiano et al. (1998), *Nature* | Pattern: homeostatic multiplicative normalization. SIS analog: memory consolidation pipeline |
| Reward-modulated STDP (R-STDP) | Izhikevich (2007); Frémaux & Gerstner (2016) | Pattern: prediction error gates weight changes on action pathways. SIS analog: `/perf-feedback-rehearsal` Step-12 success-gate audit log |
| Critical periods (developmental plasticity) | Hensch (2005), *Nature Rev. Neurosci.*; Knudsen (2004), *J. Cogn. Neurosci.* | Pattern: experience-dependent windows of heightened plasticity, then consolidation. SIS analog: implicit in version evolution; never narrated publicly |
| Predictive coding / world models | Friston (2010), *Nature Rev. Neurosci.*; LeCun (2022), *A Path Towards Autonomous Machine Intelligence* | Pattern: a predictor emits expected next-state; deviation drives attention + learning. SIS analog: **MISSING** — see §3 gap |

This is the lineage SIS inherits. The substrate stays canon-free; the science is the science.

---

## 2. Public OSS surface relevant to SIS

SIS is a text + agent + memory substrate. SNN simulators don't drop into our stack. The genuinely leverageable open-source work is in **predictive world models** — specifically Meta FAIR's JEPA family.

| Repo | What | SIS leverage |
|---|---|---|
| [`facebookresearch/ijepa`](https://github.com/facebookresearch/ijepa) | Joint-Embedding Predictive Architecture for images (Assran et al. 2023). Predicts target embeddings from context embeddings in representation space, never pixel space | **Highly relevant** — the prediction-error mechanism is event-bus-shaped. See `docs/research/2026-05-11-jepa-prediction-extract.md` |
| [`facebookresearch/jepa`](https://github.com/facebookresearch/jepa) | V-JEPA: same pattern for video patches | Same as I-JEPA; alternative reference implementation |
| [`facebookresearch/dinov2`](https://github.com/facebookresearch/dinov2) | Self-supervised image features via teacher/student distillation | Optional embedding source if SIS needs a non-text backbone for prediction-error |
| [`lava-nc/lava`](https://github.com/lava-nc/lava) | Intel's open neuromorphic framework | Not applicable — SIS doesn't deploy on neuromorphic hardware |
| [`BindsNET/bindsnet`](https://github.com/BindsNET/bindsnet) · [`norse/norse`](https://github.com/norse/norse) · [`jeshraghian/snntorch`](https://github.com/jeshraghian/snntorch) · [`nengo/nengo`](https://github.com/nengo/nengo) | Open-source spiking neural network simulators in PyTorch / JAX | Not applicable — same reason |
| [`EPFL-LCN/PublicPlosCompBio2018`](https://github.com/EPFL-LCN/PublicPlosCompBio2018) | Gerstner-lab three-factor eligibility-trace reference code | Useful for primary-source verification of the eligibility-trace mechanism we already mirror |

**Bottom line:** for SIS's substrate-level question ("how do we add forward prediction?"), the single most relevant public OSS work is JEPA. Everything else is conceptual prior art whose code base targets a different deployment layer.

---

## 3. Concept mapping — SIS vs biologically-grounded cognition

The architectures rhyme. Most patterns SIS already has, with the right textual framing.

| Pattern from primary literature | SIS analog | Parity | Gap |
|---|---|---|---|
| Multi-region brain (cortical + subcortical specialization) | 10-IS + Starlight Orchestrator | Parallel | None |
| Executive / meta-controller | Starlight Orchestrator (intent routing) | Parallel | None |
| Cross-modal association cortex | Cross-Repo Indexer + Memory Bus (520 atoms across 22 vaults) | Parallel (text not spike-timing) | None |
| Sparse concept formation (winner-take-all) | `/distill-insights` ≥3-occurrence threshold | Parallel | None |
| Working memory (sustained activity) | Active conversation context + vault working set | Partial | No explicit decay timer on "current thought" |
| **Predictive layer (forward prediction; error → attention)** | **MISSING in SIS** | ❌ Gap | We have reactive memory; no forward-prediction signal |
| Cognitive escalation on prediction failure | LCC dispatcher router (rule-based intent classification + JSONL audit) | Partial | Ours is rule-based, not learned; could accept prediction-error as input |
| Four-channel neuromodulation (DA / ACh / NE / 5-HT) | Voice modulation + halo color (retrieve / synthesis / error) | Partial | No scene-wide global state shaping whole visual |
| STDP-style timing-based weighting | ReasoningBank pattern weighting | Parallel | None |
| Eligibility-trace decay + reward gating | Brain halo decay + trace_id grouping | Parallel | None |
| BCM metaplasticity threshold | Memory-prune ≥3-occurrence | Parallel | None |
| Synaptic scaling (homeostatic) | Memory consolidation pipeline | Parallel | None |
| R-STDP | Audit-log success-gate feedback | Parallel | None |
| Critical periods (developmental plasticity) | SIS version evolution v0.1 → v7.9 | Implicit not codified | Not narrated publicly |
| Closed sensorimotor loop | Memory commit → recall → action → audit | Parallel | None |
| Message bus (e.g. NATS) | MCP transport | Parallel | None |
| External cognition bridge (LLM-as-tool) | Cognition router + multi-CLI dispatcher | Parallel | None |

**13 patterns parallel, 4 gaps (Predictive Layer, Working-memory decay, Scene-wide neuromodulator, Developmental-phase narrative).** §5 names the moves.

---

## 4. Visual refinement spec — scene-wide neuromodulator pattern

The dashboard `/brain` r3f scene currently has per-node halos (retrieve / synthesis / error) with intensity decay. The missing layer is a **global four-channel signal** that shapes scene-wide lighting, bloom, and ambient based on aggregate event flow — modeled on the neuromodulator pattern from Schultz (1998) + Hasselmo (2006).

### Pattern — four-channel scene state

```
synthesis.complete   → DA-equivalent (reward)     → warm key-light shift
retrieve.start burst → NE-equivalent (arousal)    → bloom strength boost
privacy.gate         → ACh-equivalent (attention) → tighter focus / sharper highlights
steady-state idle    → 5-HT-equivalent (mood)     → cool ambient
error                → NE spike + DA crash        → red shift + bloom
```

Each channel decays exponentially toward BASELINE=1.0 with per-channel tau:

```
NE  tau = 2000ms  (fast — short orienting burst)
DA  tau = 3000ms  (medium — afterglow of reward)
ACh tau = 4000ms  (slower — sustained focus)
5HT tau = 8000ms  (slow — long-term tone)
```

Per-event kicks: `retrieve.start → {ne: +0.4}`, `retrieve.topk → {ach: +0.2}`, `synthesis.complete → {da: +0.6, sht: +0.1}`, `privacy.gate → {ach: +0.3}`, `voice.turn → {da: +0.1}`, `error → {ne: +0.5, da: -0.4, sht: -0.2}`.

Implementation lives at `private/local-command-center/apps/dashboard/lib/brain-neuromod.ts` — pure reducer matching the contract style of `brain-halos.ts`. Visual layer reads smoothed levels per frame and shapes lights / bloom / ambient.

### HUD + label patterns also worth absorbing

| Pattern | SIS adaptation |
|---|---|
| Phase badge in HUD showing current developmental phase | Show current SIS version (v7.9) tagged as a developmental phase analog (see §5 S2) |
| Four mini-bar neuromodulator strip | Real-time signal bars for DA / NE / ACh / 5HT (driven by the brain-neuromod state) |
| Region labels with hover tooltip + auto-rotate pause | Project 10-IS labels from `site/src/app/architecture/page.tsx::LAYERS` data onto the r3f scene |
| `?embed=true&labels=false` URL params for clean iframe | Add these to dashboard `/brain` route so it can serve as both standalone + embedded hero |
| Status pill toggling SIMULATED ↔ LIVE | Mirror our SSE connection state (green=connected / amber=replaying ring buffer / red=down) |

---

## 5. Action queue (tagged by tier)

### Operational tier (no board needed)

**O1. Scene-wide neuromodulator state machine.** Pure reducer over `BrainEvent[]` → `{da, ne, ach, sht}` with exponential decay. Lives in `private/local-command-center/apps/dashboard/lib/brain-neuromod.ts`. Test contract mirrors `brain-halos.test.ts`. **STATUS: shipped privately, 5 test suites green, 197/197 dashboard tests pass.**

**O2. Phase badge + four-channel HUD strip.** Add HUD overlay to `/brain` showing SIS-current-version, vault count, retrieve TPS, four-channel bars. Risk: low. Time: ~60 min.

**O3. Region-label projection for 10-IS.** Wire `site/src/app/architecture/page.tsx::LAYERS` as label sources in the brain scene. Risk: low. Time: ~60 min.

**O4. JEPA prediction-error pseudocode extract.** Read-only research extract. **STATUS: shipped, see `docs/research/2026-05-11-jepa-prediction-extract.md` (185 lines).**

### Substrate tier (needs /starlight-board before commit — packet filed at `docs/boards/2026-05-11-predictive-cognition-substrate-bundle.md`)

**S1.** Add Predictive Layer concept to `STACK.md` as an Orchestrator subsystem (NOT an 11th IS — preserves the 10-IS lock).

**S2.** Reframe SIS version evolution as developmental phases (infant / toddler / juvenile / adolescent / mature analogs) on the public `/architecture` page, with explicit attribution to Hensch (2005) and Knudsen (2004).

**S3.** Embed the dashboard `/brain` r3f scene as a hero element on the home + architecture pages, with CWV budget + reduced-motion respect.

### Sovereign-class (Frank ack required even after board)

**Sov1. `prediction.error` event in the `BrainEvent` union.** New event kind published when retrieve confidence falls below threshold OR the planning layer's expected-embedding diverges from retrieved by more than threshold. Touches the brain-event-bus contract; once shipped, additive-forever.

---

## 6. What we are NOT doing

- Not adopting any framework's training-loop machinery. SIS has no differentiable parameters at the agent/text layer; we adopt **signals**, not gradient pipelines.
- Not building neuromorphic anything. Out of scope.
- Not adding an 11th IS. The 10-IS taxonomy is locked at v7.5; the Predictive Layer lands as an Orchestrator subsystem.
- Not making biological-literalism claims. SIS uses biological mechanisms as **structural analogs**; the public-facing language must always say "analog of X phase", never "currently in X phase."

---

## 7. Decision rights

Frank picks from §5. Operational items O1-O4 can drive without further input (O1 + O4 already shipped this session). Substrate items S1-S3 await board verdict in the bundled packet. Sovereign Sov1 awaits Frank ack even after board PROCEED.

Recommended sequence:
1. O1 + O4 (done)
2. `/starlight-board` pre-pass on S1+S2+S3 as a single bundled proposal (packet filed)
3. If PROCEED: S1 → S2 → S3 (text → prose → engineering)
4. Frank ack on Sov1 → implement

---

*Synthesis: 2026-05-11. Built on SIP.*
