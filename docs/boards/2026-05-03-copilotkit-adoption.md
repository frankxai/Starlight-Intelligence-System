# Starlight Board — CopilotKit as standardized agent-UI runtime

**Date:** 2026-05-03
**Pre-pass:** `docs/superpowers/board-pre-passes/2026-05-03-copilotkit-adoption.md`
**Convened by:** Claude Opus 4.7 (1M context) on Frank's directive

---

**Sovereign:** Coupling 5+ repos to a single OSS dependency is real — if CopilotKit changes direction, cost is across the ecosystem. But the alternative is what we have today: every repo invents its own assistant UX. CopilotKit is at the same coupling tier as Next.js/React; we accept those. The wrapper package is the exit-cost mitigation.

**Seer:** In 18 months, AG-UI Protocol may be one of three competing standards. Adopting CopilotKit is a bet — reasonable (30k stars, real users, open protocol) but a bet. Hedge: the wrapper interface is what we own; underneath, swappable.

**Harmonizer:** The strong-boundary table (CopilotKit owns UI, NOT memory/canon/identity) is well-stated but historically erodes under product pressure. Real test: when a CopilotKit feature requests memory access, will we hold the line? Encode boundary in lint rules + CI checks on consuming apps — not just promised.

**Strategist:** Generative UI + shared state + human-in-the-loop is the missing primitive. Adopting unlocks the entire "agent proposes, user approves" flow that the bespoke cockpit doesn't have. Real unlock.

**Verifier:** What fails first: boundary erosion. When Arcanea Luminor sidebar wants to show "what does Vel'Tara mean", it'll try to reach into canon. Mitigation: provider-pattern. The wrapper exposes `canon-query-provider` that the app injects — UI doesn't reach into canon, app does and supplies the result.

**Overseer:** Most load-bearing concern: boundary erosion. Strongest case: bespoke cockpit stays Frank's local Jarvis (we keep), CopilotKit wins where standardization beats fit. Pilot on one app, prove boundary, then propagate.

**Recommendation:** PROCEED-WITH-REVISE
**Rationale:** Build boundary enforcement (CI lint rules + provider-pattern for canon/memory access) into the wrapper package from day one — not as follow-up.

## REVISE items captured

1. Provider-pattern is the only way the wrapper accesses memory/canon/identity. The wrapper does NOT import from those domains directly; the consuming app injects providers.
2. CI lint rules (eslint custom rule or simple grep check) flag any direct `import from "@starlight/memory"` etc. inside `packages/agent-ui-runtime/src/` as a violation.
3. `BOUNDARY.md` is a required file in the package and CI checks for its presence + non-empty.

## Ship plan post-board

1. Scaffold `packages/agent-ui-runtime/` with `BOUNDARY.md` + provider interfaces — DONE this PR.
2. CI lint rule for boundary enforcement — separate v8.x ship.
3. Golden reference impl in `apps/arcanea-command-center` — lives in `C:\Users\frank\Arcanea` repo (cross-repo distribution packet already filed at `docs/cross-repo-distributions/2026-05-03-arcanea-luminor-sidebar-copilotkit.md`).
4. Bespoke cockpit unchanged.

---

**Built on SIP** · Starlight Board verdict · 2026-05-03
