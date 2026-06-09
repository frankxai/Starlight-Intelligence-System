# Spec — /board route on starlightintelligence.org

**Date:** 2026-05-18 (W21 Monday)
**Status:** spec — **Board pre-pass required BEFORE implementation** (substrate governance going public is a brand-register evolution)
**Tier:** substrate-adjacent (this surface publishes governance verdicts; novelty warrants pressure-test)
**Estimated effort:** 1-2h implementation (post-Board)

---

## Premise

`docs/boards/` holds 12+ Board verdicts and OpenClaw audits (e.g., `2026-05-17-crypto-investment-spawn.md`, `openclaw-2026-05-17-audit.md`, `luminor-v75-ship.md`, etc.). These are substrate-quality artifacts — five-vector pressure tests, REVISE close-outs, defect rankings, sovereignty preservation. They demonstrate governance discipline that distinguishes SIS from generic agent-framework projects.

Currently they're only visible to anyone who clones the repo. A public surface that indexes + renders them would:

- Surface substrate-governance discipline as a credibility signal
- Let alliance partners verify that "board-before-tag" is a real practice, not doctrine theater
- Compose with `/architecture` + `/explainer` + `/changelog` as a trust-stack
- Document the v7.5.1 same-session-REVISE-close-out precedent in public form

## Frame — and the load-bearing tension

**Pro:** Trust surface. Publishing the Board's actual verdicts (including the REVISE items + close-out conditions) demonstrates that the substrate corrects itself in public. This is rare in any governance system. It composes with the sovereignty clause and the attestation discipline.

**Con:** Adversarial surface. Publishing verdicts that include "what got flagged + how we fixed it" gives adversaries (or competitive forks) a roadmap to known weaknesses. The MEDIUM defect from yesterday's OpenClaw audit (`/discover-genius` default-public path) is now in `docs/boards/openclaw-2026-05-17-audit.md` — publishing this without context could be misread.

**Resolution proposal:** Publish **verdicts** + **REVISE close-out conditions** + **PROCEED status**. Do NOT publish raw defect details verbatim — replace with summary that names the defect class without disclosing the exact attack vector. This matches OpenClaw's own "real public artifact" discipline.

## Scope

### In-scope (Phase 1)

- `site/src/app/board/page.tsx` — index page listing all `docs/boards/*.md` files with: date, title, verdict (PROCEED / REVISE / STOP), REVISE-item count, close-out status
- `site/src/app/board/[slug]/page.tsx` — per-verdict rendered detail page with redaction filter applied
- `site/scripts/sync-board.mjs` — build-time copy of `docs/boards/*.md` → `site/content/board/` with redaction filter applied
- `docs/boards/PUBLISHING-POLICY.md` — declares the redaction protocol (what publishes verbatim, what gets summarized, what stays private)
- Header nav addition: "Board" link in desktop + mobile

### Out-of-scope (Phase 2+)

- Live notifications when new Board verdicts land
- Public Board verdict comment system / discussion
- Cross-repo board verdict aggregation (other sovereign verticals run their own boards)

## Board pre-pass questions (MUST run BEFORE implementation)

1. **Sovereign:** Is the trust-signal-vs-attack-surface tradeoff worth it? Most sovereign systems keep governance private. What changes for SIS?
2. **Seer:** 18 months out, this surface either matures into the canonical trust artifact (substrate adopters cite our /board) OR becomes a public lessons-learned blog that drifts away from substrate. Which?
3. **Harmonizer:** Does this break the privacy framework (`feedback_privacy_split`: "Public substrate, private/ for instance state")? Verdicts ARE about substrate, not instance state — so arguably this is the right surface tier. Confirm.
4. **Strategist:** What's the highest-leverage adopter for this surface? Alliance partners considering composition with SIP? Anthropic Partner Program due-diligence? OSS adopters auditing the practice quality? Different audiences = different framing.
5. **Verifier:** What's the simplest experiment? Ship ONE verdict (the v8.1.0 Crypto IS one) as a single-page proof and measure inbound traffic / referrer composition for 30 days before scaffolding the index.

### Recommended Board verdict ahead of implementation

REVISE — likely close-outs:
- (R1) Publishing policy declared and committed BEFORE first verdict ships publicly
- (R2) Per-verdict redaction review by Frank before merge (no auto-publish of new Board verdicts; opt-in only)
- (R3) Spec the audience and the simplest experiment (V's note) — pilot with ONE verdict for 30 days before full index

## Implementation steps (POST-Board PROCEED)

1. Write `docs/boards/PUBLISHING-POLICY.md` — the redaction protocol
2. Frank does a manual redaction-review pass on existing 12 board verdicts, marks each `public: yes / no / partial` in frontmatter
3. Write `site/scripts/sync-board.mjs` — copies + applies redaction
4. Write `site/src/app/board/page.tsx` (index) + `site/src/app/board/[slug]/page.tsx` (detail)
5. Add nav link
6. Pilot ship: ONE verdict (recommend v8.1.0 Crypto IS) for 30-day soak before full index goes live
7. After 30 days, evaluate — full index OR collapse to single canonical example

## Test / verification

- Redaction filter never publishes content marked `public: no`
- Per-verdict detail page renders all PROCEED/REVISE/STOP markers correctly
- No raw defect details leak from the OpenClaw audit verdicts

## Falsifier

If at 60 days post-launch (Phase 2 full-index timeline) the /board route has < 50 unique inbound visits AND no alliance partner has cited it OR if a single redaction breach occurs in the 30-day pilot → collapse to single canonical-example page or remove entirely.

## Dependencies / unblocking

- **Depends on:** Board pre-pass (above) for the substrate-governance-going-public decision. Redaction policy must be explicit before any verdict publishes.
- **Unblocks:** Trust surface for alliance partners + OSS adopters. Public proof of governance discipline.

---

**Built on SIP** — /board route spec · 2026-05-18 (W21) · substrate-adjacent · Board pre-pass GATE before implementation
