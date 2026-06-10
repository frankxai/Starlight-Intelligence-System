# Spec — Obsidian DASHBOARD.md (Home note for the SIS vault)

**Date:** 2026-05-18 (W21 Monday)
**Status:** spec — gated for implementation this week
**Tier:** operational (no Board needed — vault navigation aid)
**Owner:** Frank
**Estimated effort:** 30-60 min (single-session shippable)

---

## Premise

41+ HANDOVER files, 12+ Board verdicts, 10+ spec/plan docs, multiple chronicle entries, a Changelog, a Map of Content, a MEMORY index, six vaults, three Domain Sub-Stacks each with 6-8 sub-systems. The MD source-of-truth is **strong**; the awareness problem is **finding the right entry point**.

Frank does not author MD by hand — the writing surfaces are Claude sessions, `/palace`, `/handover`, `/bless`, `/spawn-domain-stack`, etc. The friction is **navigate**, not **write**. Obsidian solves navigate-on-MD natively (wikilinks, graph, Canvas, Dataview). The gap is a Home note that *names where to look*.

## Frame

Open the SIS repo root as an Obsidian vault. Configure `DASHBOARD.md` at root as the Home note (Obsidian Settings → Files & Links → Default location for new notes → Same folder as current; then Files → Home file → `DASHBOARD.md`). Memory/ is already an Obsidian vault per `project_v75x_mirror_foundation`; this extends the vault scope to the whole repo.

## Scope

### In-scope

`DASHBOARD.md` at repo root containing wikilinks to:

1. **This Week** — current Palace Review, current sprint plan, open falsifiers with deadlines, current cadence gate status
2. **Substrate Doctrine** — `SIP.md`, `STACK.md`, `VOICES.md`, `VERTICALS.md`, `REGISTRY.md`, `CLAUDE.md`
3. **Active Governance** — recent Board verdicts (last 5), most recent OpenClaw audit, the Crypto IS proof-pass falsifier
4. **Living Verticals** — People IS, Sound IS, Music IS, Crypto IS (v0.1 proof), Wealth IS (composition layer first reference) — one link per vertical home page
5. **Chronicle Entry Points** — founding witness, MOC, latest weekly review, blessings ledger
6. **Genius** — `profile-frankx.md`, `freedom-path-frankx.md`
7. **Public Surfaces** — `CHANGELOG.md`, link to site `/changelog`, GitHub Releases, the explainer
8. **Recent Handovers** — last 5 by date (helps "where did we leave off")
9. **Open Substrate-Revision Queue** — MEDIUM defects from audits, falsifier-failed retrospectives, queued specs

### Out-of-scope (this round)

- Auto-generation of DASHBOARD via Dataview queries (Phase 2 — once Dataview plugin is installed and configured)
- Canvas-based spatial dashboard (already covered separately by Cockpit Chronicle pane spec)
- Per-vertical sub-dashboards (defer until a vertical has 5+ contributors who need their own entry point)

## Implementation steps

1. Write `DASHBOARD.md` at repo root with the 9 sections above as H2 headers + wikilinks
2. Test wikilinks resolve — each `[[note-name]]` must point at an actual file (Obsidian shows red links for unresolved)
3. Add `dashboard.canvas` (optional) — Obsidian Canvas file with visual zones for each section
4. Document in `README.md` (one-line addendum): "Open this folder in Obsidian; start at `DASHBOARD.md`"
5. Commit as `docs(dashboard): Obsidian Home note + canvas`

## Test / verification

Open SIS in Obsidian. Click DASHBOARD.md. Every wikilink in every section must resolve to an existing file. Graph view should show DASHBOARD at the center hub. Visual confirmation that the navigation problem is solved by single-page browse.

## Falsifier

If after 7 days of use (2026-05-25) Frank still defaults to `git log` / file-tree-browsing instead of opening Obsidian → DASHBOARD, the dashboard failed to earn its place — re-iterate or remove. The cost of an unused dashboard is dead weight, not zero.

## Dependencies / unblocking

- **Unblocks:** Reduces "where do I look?" friction across all future sessions. Composes with Cockpit Chronicle pane (which surfaces the same data live) and site `/chronicle` route (which is the public-facing version of a slice of this).
- **Depends on:** Obsidian being open. Frank already uses Obsidian per `project_v75x_mirror_foundation`.

---

**Built on SIP** — Obsidian Dashboard spec · 2026-05-18 (W21) · operational-tier
