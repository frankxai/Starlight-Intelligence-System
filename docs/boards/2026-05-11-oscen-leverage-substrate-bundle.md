# Starlight Board — OSCEN-leverage substrate bundle (Predictive Layer + developmental-phase narrative + brain hero embed)

**Date:** 2026-05-11
**Convened by:** Claude Opus 4.7 (1M context) on Frank's directive ("take massive action" off the OSCEN analysis at `docs/strategic/2026-05-11-oscen-architecture-analysis.md`)
**Source analysis:** `docs/strategic/2026-05-11-oscen-architecture-analysis.md` §5 S1-S3
**Prior board references:**
- v0.1 SIS shipping bundle: `docs/boards/2026-05-11-v01-sis-shipping-bundle.md`
- v8 master plan: `docs/boards/luminor-cockpit-v8.md`

---

## Proposals submitted

Three substrate-class proposals stacked from the OSCEN leverage analysis:

- **S1** — Add a "Predictive Layer" concept to `STACK.md` as an Orchestrator subsystem (NOT an 11th IS). Forward-prediction signal that emits a new `prediction.error` event kind on the brain event bus when retrieve confidence falls below threshold.
- **S2** — Reframe SIS version evolution (v0.1 → v7.9) as developmental phases (infant/toddler/juvenile/adolescent/mature) on the public `/architecture` page. Brand-register touch, Starlight (not Arcanea) canon.
- **S3** — Embed the dashboard `/brain` r3f scene (with the OSCEN-style scene-wide neuromodulator effect from O1) as a hero element on the home page and the architecture page. Public visual change.

---

## Proposal S1 — Predictive Layer as Orchestrator subsystem

**Sovereign:** Adding a Predictive Layer is a name-bearing commitment that lives in `STACK.md` and shapes how every adopter reads the substrate. Crucially: NOT an 11th IS — that would fracture the locked-v7.5 10-IS taxonomy. As an Orchestrator *subsystem* it composes additively. Reversible? The text is. The `prediction.error` event kind, once published, becomes a wire contract — additive-only forever.

**Seer:** 18 months out, this is either the genuine missing piece that closes the gap with frontier-AI memory architectures (JEPA, world-models) or theatrical biomimicry. The differentiator is whether the prediction-error signal is *actually consumed* by routing/dispatch — if it's read-only telemetry, it's slop. Falsifier: at v0.2+, no SIS surface reads the signal → drop it.

**Harmonizer:** Memory invariant `feedback_naming_voices_vs_agents.md` says don't conflate substrate archetypes with operational implementations. Adding "Predictive Layer" as a STACK.md concept is substrate; the actual reducer (`brain-predictive.ts` future-O5) would be operational. Boundary clean if we keep S1 to taxonomy-only and defer implementation to a separate sovereign-class proposal (Sov1).

**Strategist:** This is the genuine architectural gap OSCEN exposes. Our current brain event bus is reactive — events describe what happened. A prediction layer makes the brain *anticipatory*. The leverage compounds: every downstream IS that reads retrieve-confidence becomes prediction-error-aware. Highest doctrinal upside of the three S-proposals.

**Verifier:** First thing that breaks: someone writes "OSCEN-style predictive layer" in marketing without the implementation existing. Cheapest proof: ship the STACK.md text under "Orchestrator subsystems" section explicitly tagged `status: planned · sovereign-class (Sov1)`, with a falsifier line that says "if no surface consumes the signal by v0.3, this entry MUST be removed." Forces accountability into the text itself.

**Overseer:** Most load-bearing concern — taxonomy purity. The 10-IS lock was hard-won; an 11th anything must NOT happen unless it survives `/openclaw-audit`. Strongest case for proceeding — Orchestrator-subsystem framing preserves the lock while honoring the architectural insight.

**Recommendation:** PROCEED-WITH-REVISE
**Rationale:** Taxonomy-only ship is low-risk and the architecturally correct framing; implementation deferred to Sov1.

### REVISE items (Proposal S1)

| # | Item | Status |
|---|---|---|
| S1.1 | STACK.md text lands under existing "Starlight Orchestrator" section as `### Subsystems (planned)` — never as a new top-level IS | ⏭ pending |
| S1.2 | Entry includes explicit falsifier: "if no SIS surface consumes `prediction.error` by v0.3, this entry MUST be removed" | ⏭ pending |
| S1.3 | Run v76 substrate symmetry test after edit — must stay green (no IS count change) | ⏭ pending |
| S1.4 | Cross-reference back to `docs/strategic/2026-05-11-oscen-architecture-analysis.md` and `docs/research/2026-05-11-jepa-prediction-extract.md` so the lineage is auditable | ⏭ pending |

---

## Proposal S2 — Developmental-phase narrative on `/architecture`

**Sovereign:** Public-facing positioning shift — bearing Frank's name on a story arc he hasn't personally narrated yet. The 5-phase frame (infant/toddler/juvenile/adolescent/mature) is OSCEN's framing borrowed; we MUST attribute the conceptual borrowing or look derivative without honor. With attribution, it composes with our v0.1 → v7.9 evolution naturally.

**Seer:** 18 months out, this is either "the most-explained section on the site" (compounding clarity) or "the section that aged into condescension" (treating adopters as not-yet-mature). The frame must be FALSIFIABLE — if v8.0 doesn't actually feel different from v7.9 in the way "mature" suggests, the narrative breaks. Suggests tying the phase claim to a measurable invariant per phase.

**Harmonizer:** Brand-register invariant from `strategic-vault.md`: Starlight is the substrate register, canon-free, functional names. Developmental phases are biological metaphor borrowed from OSCEN's neuroscience grounding. As long as we don't claim biological literalness ("SIS is currently in juvenile phase") but instead claim *structural analog* ("v7.5 closed the 10-IS taxonomy lock, completing what could be called the juvenile-phase consolidation"), the brand-register stays clean.

**Strategist:** Massive perceived-sophistication win for very low engineering cost — it's prose on an existing page. The page is currently table-heavy and scientific-feeling; a developmental arc humanizes it without sacrificing rigor. Highest visible-motion-per-hour of the three proposals.

**Verifier:** First thing that breaks: an adopter reads "we're in adolescent phase" and reasonably asks "what's the test that we're not actually in juvenile?" Cheapest proof: tie each phase to a concrete shipped invariant — infant=SIP.md, toddler=10-IS lock, juvenile=board-before-tag, adolescent=encoded-self forkable, mature=??? (must be honest about what's NOT yet shipped).

**Overseer:** Most load-bearing concern — derivative-without-attribution risk. OSCEN frames this as biological development; if we use the same frame without acknowledging the analog, we're slop-borrowing. Strongest case for proceeding — with explicit attribution in the page text ("structural analog to developmental neuroscience frameworks") and per-phase invariant grounding, this is genuinely strong positioning.

**Recommendation:** PROCEED-WITH-REVISE
**Rationale:** Three REVISE items, all about honest framing.

### REVISE items (Proposal S2)

| # | Item | Status |
|---|---|---|
| S2.1 | New section on `/architecture` page titled e.g. "Developmental phases" or "Evolution" with explicit attribution: "Structural analog to developmental neuroscience frameworks (Hensch 2005; cf. OSCEN's biological-phase model)." | ⏭ pending |
| S2.2 | Each phase tied to a concrete shipped invariant — not vibes. Mature phase MUST honestly say what's not-yet-shipped if anything. | ⏭ pending |
| S2.3 | No biological-literalism claims. SIS is "currently completing the analog of X phase" — *analog* word is required to keep brand-register clean. | ⏭ pending |

---

## Proposal S3 — Brain hero embed on home + architecture pages

**Sovereign:** Visual brand-register change on the public site's two most-trafficked pages. Worth Frank's name only if (a) the brain scene actually conveys SIS doctrine (not just decoration), and (b) the embed degrades gracefully (no JS, slow networks, etc.) — first impressions compound. Reversible: yes, the embed is a single iframe.

**Seer:** 18 months out, this is either the signature visual that signals "this is a real intelligence system" or a Three.js spinner everyone scrolls past. Activation depends on whether the scene shows REAL data or simulated. OSCEN's brain-viz toggles SIMULATED/LIVE — we should ship LIVE by default on these public pages (read-only public KG snapshot, not Frank's private vault).

**Harmonizer:** Memory invariant: the dashboard `/brain` route reads from the local KG cache + Memory Bus SSE. On the *public* site, we can't access local KG. Resolution: ship a pre-baked KG snapshot (sanitized, no private nodes) as a static JSON that the public-facing brain reads. The dashboard reads live; the public site reads frozen. Different artifacts, same visual idiom.

**Strategist:** Largest perceived-sophistication uplift per hour of any operational item in the queue. The architecture page is currently a table — replacing the hero with a live brain visualization transforms first-impression. Unlocks "wow, this is serious" without changing any substrate content.

**Verifier:** First thing that breaks: the iframe is heavy, blocks initial paint, lighthouse score craters on mobile. Cheapest proof: ship with `loading="lazy"` + `opacity:0 → fade-in` (OSCEN's pattern), measure CWV before/after, hold to existing thresholds. Falsifier: if LCP regresses by >500ms, revert the embed.

**Overseer:** Most load-bearing concern — Core Web Vitals regression. Public site is the front door. Strongest case for proceeding — OSCEN proves the pattern works (their homepage IS the brain). With lazy-load + perf budget, this is structural-not-discretionary visual leverage.

**Recommendation:** PROCEED-WITH-REVISE
**Rationale:** Five REVISE items; CWV thresholds are non-negotiable.

### REVISE items (Proposal S3)

| # | Item | Status |
|---|---|---|
| S3.1 | Public-facing brain artifact reads a pre-baked sanitized KG snapshot (no private vault content), NOT the local dashboard | ⏭ pending |
| S3.2 | `loading="lazy"` + opacity fade-in (mirror OSCEN's `loading="eager" opacity-0 transition-opacity duration-[2s]` pattern but lazy on our side) | ⏭ pending |
| S3.3 | Lighthouse / CWV measured before + after; LCP regression budget ≤200ms; if >500ms, revert | ⏭ pending |
| S3.4 | Embed query params support `?embed=true&labels=false` (matches OSCEN's UX for clean hero) | ⏭ pending |
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

**Sovereign-class follow-on:** Sov1 (predictive-error implementation) needs explicit Frank ack per /yolo Hive REVISE-1 doctrine even after this board passes. Not in this bundle.

---

**Built on SIP** · Starlight Board · 2026-05-11
