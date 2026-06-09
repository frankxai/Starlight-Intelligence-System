# SKILL — <Vertical Name>

> Substrate skill file for the vertical wrapper. Auto-loaded when any vertical-specific command activates. Ensures voice, refusal patterns, attestation, and composition rules apply uniformly across the sub-systems this vertical wraps.

---

## Activation rules

Loaded when:
- any `/<vertical-prefix>-*` command runs
- `/spawn-domain-stack` selects this vertical as the reference pattern
- A sub-system agent (`starlight-<sub-system>`) activates inside this vertical's namespace

---

## Invariants the wrapper enforces

The wrapper enforces five invariants. Three are **universal** (apply across every domain stack); two are **overlay-driven** (universal in posture, domain-specific in content — see `SOUL.md` overlay blocks).

1. **Voice composition.** *(Universal.)* Every human-facing artifact runs through the Genius layer first — no generic-domain-template tone leaks through. Every domain has its own generic tone (HR-tech-template, GitHub-README boilerplate, McKinsey-deck phrasing, academic-passive, etc.); the Genius composition step refuses all of them by default.

2. **Refusal patterns.** *(Universal posture, overlay content — `SOUL.md` § "Refuses theater".)* The vertical's named refusal patterns refuse-by-default; sub-systems do not unilaterally override. The specific theater patterns are declared in the SOUL.md `<!-- DOMAIN-OVERLAY:start theater-patterns -->` block. The wrapper enforces that named patterns are honored; what is named is the practitioner's call.

3. **Attestation footer.** *(Universal.)* Every shipped artifact carries "Built on SIP" + vertical identifier. Ambient attestation is non-waivable — the user does not run `/sip-attest` for forward-generated work; the artifact carries it by default.

4. **Cross-sub-system composition rules.** *(Universal.)* Sub-systems compose horizontally per the rules in `SUB-SYSTEMS.md` (or the equivalent map for this vertical); no sub-system rewrites another's domain unilaterally. Cross-system writes route through the vertical wrapper.

5. **Domain-sensitivity gating.** *(Universal posture, overlay content — `SOUL.md` § "Structural integrity discipline".)* Any sub-system touching the structural risks named in the SOUL overlay opens with the appropriate domain-specific framing. The *kind* of risk is overlay; the *posture* of refusing to soft-pedal is universal. Examples by domain shape:
   - Legal-sensitivity gating *(HR, Capital — disclaimer + counsel-routing)*
   - Clinical-scope gating *(Clinical — informed consent + IRB + scope-of-practice)*
   - Security-review gating *(Code — secrets + dependencies + threat model)*
   - Consent + clearance gating *(Sound — sample / sync / AI-voice / performer rights)*
   - Fiduciary-scope gating *(Capital — securities-law boundary + accreditation)*

   The forking practitioner declares which kind in `SOUL.md`. The wrapper enforces that artifacts touching the declared sensitivity carry the discipline; it does not assume HR's legal-disclaimer pattern as universal.

---

## Overlay-driven enforcement

The wrapper does **not** hard-code domain non-negotiables. It loads `SOUL.md` at activation and reads the overlay blocks (`<!-- DOMAIN-OVERLAY:start ... -->` ... `<!-- DOMAIN-OVERLAY:end ... -->`) to determine:

- Which evidence standards apply (SOUL §1)
- Which structural-integrity disciplines apply (SOUL §2)
- Which theater patterns to refuse (SOUL §3)
- Which both-and constraint must not collapse (SOUL §5)
- Which additional drift tests run at cycle close (SOUL § Tests for drift)

If an overlay block is empty, the wrapper logs a `SOUL-debt` warning and routes the next cycle close to `/luminor-board` for fill-in. Empty overlays are not breaches but they compound into drift if unfilled.

---

## Sub-system loading order

1. Sub-system agent loaded.
2. Sub-system skill loaded.
3. Vertical wrapper SKILL.md loaded — reads `SOUL.md` overlay blocks.
4. Universal-IS agents composed where the sub-system declares (Genius for voice, Brand for vision, Business for entity-level, etc.).
5. Vertical wrapper checks invariants 1–5 (with overlay content for 2 and 5) before output ships.

---

## What this skill does NOT own

- The underlying domain expertise (lives in the sub-system skills).
- The actual sub-system commands (live in `.claude/commands/`).
- The instance state (lives in the practitioner's private fork or the substrate's `private/`).
- The domain-specific non-negotiables (live in `SOUL.md` overlay blocks — owned by the practitioner, not the wrapper).

---

**Built on SIP** — vertical wrapper SKILL.md · v0.2 (overlay-aware) · SIP v1.1.0
