# Starlight Board — Predictive-cognition substrate bundle (Predictive Layer + developmental-phase narrative + brain hero embed)

**Date:** 2026-05-11
**Convened by:** Claude Opus 4.7 (1M context) on Frank's directive ("take massive action" off the predictive-cognition substrate analysis at `docs/strategic/2026-05-11-predictive-cognition-substrate-analysis.md`)
**Source analysis:** `docs/strategic/2026-05-11-predictive-cognition-substrate-analysis.md` §5 S1-S3
**JEPA extract (for Sov1 follow-on):** `docs/research/2026-05-11-jepa-prediction-extract.md`
**Prior board references:**
- v0.1 SIS shipping bundle: `docs/boards/2026-05-11-v01-sis-shipping-bundle.md`
- v8 master plan: `docs/boards/luminor-cockpit-v8.md`

---

## Proposals submitted

Three substrate-class proposals stacked from the predictive-cognition substrate analysis:

- **S1** — Add a "Predictive Layer" concept to `STACK.md` as an Orchestrator subsystem (NOT an 11th IS). Forward-prediction signal that emits a new `prediction.error` event kind on the brain event bus when retrieve confidence falls below threshold. Lineage: Friston (2010) predictive coding + LeCun (2022) JEPA + Meta FAIR i-JEPA / V-JEPA public reference implementations.
- **S2** — Reframe SIS version evolution (v0.1 → v7.9) as developmental phases on the public `/architecture` page. Explicit attribution to Hensch (2005) and Knudsen (2004) for the critical-period framing. Brand-register touch, Starlight (not Arcanea) canon.
- **S3** — Embed the dashboard `/brain` r3f scene (with the scene-wide neuromodulator effect from O1, lineage: Schultz 1998 + Hasselmo 2006) as a hero element on the home page and the architecture page. Public visual change.

---

## Proposal S1 — Predictive Layer as Orchestrator subsystem

**Sovereign:** Adding a Predictive Layer is a name-bearing commitment that lives in `STACK.md` and shapes how every adopter reads the substrate. Crucially: NOT an 11th IS — that would fracture the locked-v7.5 10-IS taxonomy. As an Orchestrator *subsystem* it composes additively. Reversible? The text is. The `prediction.error` event kind, once published, becomes a wire contract — additive-only forever.

**Seer:** 18 months out, this is either the genuine missing piece that closes the gap with frontier predictive-coding work (JEPA, world-models) or theatrical biomimicry. The differentiator is whether the prediction-error signal is *actually consumed* by routing/dispatch — if it's read-only telemetry, it's slop. Falsifier: at v0.2+, no SIS surface reads the signal → drop it.

**Harmonizer:** Memory invariant `feedback_naming_voices_vs_agents.md` says don't conflate substrate archetypes with operational implementations. Adding "Predictive Layer" as a STACK.md concept is substrate; the actual reducer (future `brain-predictive.ts`) would be operational. Boundary clean if we keep S1 to taxonomy-only and defer implementation to a separate sovereign-class proposal (Sov1).

**Strategist:** This is the genuine architectural gap exposed by the substrate analysis. Our current brain event bus is reactive — events describe what happened. A prediction layer makes the brain *anticipatory*. The leverage compounds: every downstream IS that reads retrieve-confidence becomes prediction-error-aware. Highest doctrinal upside of the three S-proposals.

**Verifier:** First thing that breaks: someone writes "SIS has a predictive layer" in marketing without the implementation existing. Cheapest proof: ship the STACK.md text under "Orchestrator subsystems" section explicitly tagged `status: planned · sovereign-class (Sov1)`, with a falsifier line that says "if no surface consumes the signal by v0.3, this entry MUST be removed." Forces accountability into the text itself.

**Overseer:** Most load-bearing concern — taxonomy purity. The 10-IS lock was hard-won; an 11th anything must NOT happen unless it survives `/openclaw-audit`. Strongest case for proceeding — Orchestrator-subsystem framing preserves the lock while honoring the architectural insight.

**Recommendation:** PROCEED-WITH-REVISE
**Rationale:** Taxonomy-only ship is low-risk and the architecturally correct framing; implementation deferred to Sov1.

### REVISE items (Proposal S1)

| # | Item | Status |
|---|---|---|
| S1.1 | STACK.md text lands under existing "Starlight Orchestrator" section as `### Subsystems (planned)` — never as a new top-level IS | ⏭ pending |
| S1.2 | Entry includes explicit falsifier: "if no SIS surface consumes `prediction.error` by v0.3, this entry MUST be removed" | ⏭ pending |
| S1.3 | Run v76 substrate symmetry test after edit — must stay green (no IS count change) | ⏭ pending |
| S1.4 | Cross-reference back to `docs/strategic/2026-05-11-predictive-cognition-substrate-analysis.md` and `docs/research/2026-05-11-jepa-prediction-extract.md` so the lineage is auditable | ⏭ pending |

---

## Proposal S2 — Developmental-phase narrative on `/architecture`

**Sovereign:** Public-facing positioning shift — bearing Frank's name on a story arc he hasn't personally narrated yet. The five-phase developmental frame (infant / toddler / juvenile / adolescent / mature) is borrowed from the critical-period literature (Hensch 2005; Knudsen 2004) and must be attributed clearly. With proper citation, it composes with the SIS v0.1 → v7.9 evolution naturally.

**Seer:** 18 months out, this is either "the most-explained section on the site" (compounding clarity) or "the section that aged into condescension" (treating adopters as not-yet-mature). The frame must be FALSIFIABLE — if v8.0 doesn't actually feel different from v7.9 in the way "mature" suggests, the narrative breaks. Suggests tying the phase claim to a measurable invariant per phase.

**Harmonizer:** Brand-register invariant from `strategic-vault.md`: Starlight is the substrate register, canon-free, functional names. Developmental phases are biological metaphor borrowed from peer-reviewed neuroscience. As long as we don't claim biological literalness ("SIS is currently in juvenile phase") but instead claim *structural analog* ("v7.5 closed the 10-IS taxonomy lock, completing what could be called the juvenile-phase consolidation"), the brand-register stays clean.

**Strategist:** Massive perceived-sophistication win for very low engineering cost — it's prose on an existing page. The page is currently table-heavy and scientific-feeling; a developmental arc humanizes it without sacrificing rigor. Highest visible-motion-per-hour of the three proposals.

**Verifier:** First thing that breaks: an adopter reads "we're in adolescent phase" and reasonably asks "what's the test that we're not actually in juvenile?" Cheapest proof: tie each phase to a concrete shipped invariant — infant=SIP.md, toddler=10-IS lock, juvenile=board-before-tag, adolescent=encoded-self forkable, mature=??? (must be honest about what's NOT yet shipped).

**Overseer:** Most load-bearing concern — sloppy biological metaphor. If we use the developmental frame without explicit primary-source attribution (Hensch 2005; Knudsen 2004), readers reasonably suspect we lifted it from a competitor's marketing. Strongest case for proceeding — with explicit citation in the page text AND per-phase invariant grounding, this is genuinely strong positioning.

**Recommendation:** PROCEED-WITH-REVISE
**Rationale:** Three REVISE items, all about honest framing.

### REVISE items (Proposal S2)

| # | Item | Status |
|---|---|---|
| S2.1 | New section on `/architecture` page titled "Developmental phases" with explicit attribution: "Structural analog to developmental-plasticity research (Hensch 2005, *Nature Rev. Neurosci.*; Knudsen 2004, *J. Cogn. Neurosci.*)." | ⏭ pending |
| S2.2 | Each phase tied to a concrete shipped invariant — not vibes. Mature phase MUST honestly say what's not-yet-shipped if anything. | ⏭ pending |
| S2.3 | No biological-literalism claims. SIS is "currently completing the analog of X phase" — *analog* word is required to keep brand-register clean. | ⏭ pending |

---

## Proposal S3 — Brain hero embed on home + architecture pages

**Sovereign:** Visual brand-register change on the public site's two most-trafficked pages. Worth Frank's name only if (a) the brain scene actually conveys SIS doctrine (not just decoration), and (b) the embed degrades gracefully (no JS, slow networks, etc.) — first impressions compound. Reversible: yes, the embed is a single iframe.

**Seer:** 18 months out, this is either the signature visual that signals "this is a real intelligence system" or a Three.js spinner everyone scrolls past. Activation depends on whether the scene shows REAL data or simulated. We should ship LIVE by default on these public pages (read-only public KG snapshot, not Frank's private vault).

**Harmonizer:** Memory invariant: the dashboard `/brain` route reads from the local KG cache + Memory Bus SSE. On the *public* site, we can't access local KG. Resolution: ship a pre-baked KG snapshot (sanitized, no private nodes) as a static JSON that the public-facing brain reads. The dashboard reads live; the public site reads frozen. Different artifacts, same visual idiom.

**Strategist:** Largest perceived-sophistication uplift per hour of any operational item in the queue. The architecture page is currently a table — replacing the hero with a live brain visualization transforms first-impression. Unlocks "wow, this is serious" without changing any substrate content.

**Verifier:** First thing that breaks: the iframe is heavy, blocks initial paint, lighthouse score craters on mobile. Cheapest proof: ship with `loading="lazy"` + `opacity:0 → fade-in`, measure CWV before/after, hold to existing thresholds. Falsifier: if LCP regresses by >500ms, revert the embed.

**Overseer:** Most load-bearing concern — Core Web Vitals regression. Public site is the front door. Strongest case for proceeding — with lazy-load + perf budget, this is structural-not-discretionary visual leverage.

**Recommendation:** PROCEED-WITH-REVISE
**Rationale:** Five REVISE items; CWV thresholds are non-negotiable.

### REVISE items (Proposal S3)

| # | Item | Status |
|---|---|---|
| S3.1 | Public-facing brain artifact reads a pre-baked sanitized KG snapshot (no private vault content), NOT the local dashboard | ⏭ pending |
| S3.2 | `loading="lazy"` + opacity fade-in pattern for embed | ⏭ pending |
| S3.3 | Lighthouse / CWV measured before + after; LCP regression budget ≤200ms; if >500ms, revert | ⏭ pending |
| S3.4 | Embed query params support `?embed=true&labels=false` for clean hero | ⏭ pending |
| S3.5 | Reduced-motion respected — `prefers-reduced-motion: reduce` disables auto-rotate + bloom animation | ⏭ pending |

---

## Composite verdict

| Proposal | Recommendation | Same-day REVISE | Critical-path? |
|---|---|---|---|
| S1 — Predictive Layer in STACK.md | PROCEED-WITH-REVISE | S1.1–S1.4 (~30 min text + 5 min test re-run) | No — text-only |
| S2 — Developmental-phase narrative | PROCEED-WITH-REVISE | S2.1–S2.3 (~60 min prose + attribution) | No — page-only |
| S3 — Brain hero embed | PROCEED-WITH-REVISE | S3.1–S3.5 (~3h incl perf budget) | YES on perf gate — revert if CWV blows |

**Aggregate verdict:** All three PROCEED with REVISE. Cumulative remediation ~4-5h. S1 + S2 land same-day with low risk; S3 is the engineering-heavy item and gates on Core Web Vitals measurement.

**Recommended sequence:**
1. S1 first (text-only, lowest risk, unblocks lineage in STACK.md)
2. S2 in parallel (prose-only, also low risk)
3. S3 last (engineering + perf budget), behind a feature flag if needed

**Sovereign-class follow-on:** Sov1 (prediction-error implementation) needs explicit Frank ack per /yolo Hive REVISE-1 doctrine even after this board passes. Not in this bundle.

---

**Built on SIP** · Starlight Board · 2026-05-11
