# Spec — Cockpit Chronicle pane (live awareness dashboard)

**Date:** 2026-05-18 (W21 Monday)
**Status:** spec — gated for implementation per sprint priority (P3/P4 in W21)
**Tier:** operational (cockpit edit; no Board needed; composes with existing :3007 surface)
**Estimated effort:** 3-4h (single longer session)

---

## Premise

The cockpit at `localhost:3007` already serves four surfaces: orb (voice), dispatch (CLI routing), brain (3D scene), packet inspector. Vellum & Voltage 3D substrate shipped 2026-05-17 with `MeshTransmissionMaterial` + 4-effect postprocess + glass HUD. The visual layer is mature.

What's missing: **live awareness of the Chronicle state.** Today the only way to check open falsifiers, current Palace Review status, gate progress, or blessings ledger is to open MD files. That works for archival; it fails for *glance-at-it* awareness.

A dedicated cockpit pane solves this. The Cross-Repo Indexer (520 atoms, 2.69s) + Memory Bus (singleton stdio MCP) are already shipped and provide the cross-repo state. The pane consumes that state and renders it as live UI.

## Frame

Add a `<ChroniclePane>` component to the cockpit dashboard. Five tiles:

| Tile | Source | Update cadence |
|---|---|---|
| **This Week's Palace Review** | `docs/chronicle/weekly/YYYY-W##-palace-review.md` | Static per week; refresh on Sunday |
| **Open Falsifiers** | Parsed from chronicle + Board + audit MD frontmatter | Polled every 5 min; countdown timers live |
| **Cadence Gate Progress** | Count of weekly Palace Reviews in `docs/chronicle/weekly/` | Computed on render |
| **Recent Blessings** | `docs/chronicle/blessings.jsonl` last 5 entries | Polled every 5 min |
| **Cross-Repo Commit Feed** | Cross-Repo Indexer queries against last 24h | Polled every 5 min via Memory Bus MCP |

The pane composes with existing Vellum & Voltage glass primitives — `glass-card-tier-1` for tiles, `MeshTransmissionMaterial` accent on the falsifier countdown timers (they earn the visual emphasis because they're load-bearing for sprint priority).

## Scope

### In-scope

- `site/src/components/cockpit/ChroniclePane.tsx` — five-tile React component
- `site/src/app/api/chronicle/falsifiers/route.ts` — API endpoint that parses MD frontmatter from `docs/chronicle/**/*.md`, `docs/boards/**/*.md`, and surfaces falsifier objects with deadlines
- `site/src/app/api/chronicle/blessings/route.ts` — API endpoint reading `docs/chronicle/blessings.jsonl`, returning last N entries
- `site/src/app/api/chronicle/cadence-progress/route.ts` — API endpoint counting weekly Palace Reviews + computing monthly-cadence-gate progress
- Cockpit layout addition: register pane in the cockpit grid
- Falsifier frontmatter convention: every Board verdict + every chronicle entry that names a falsifier MUST carry `falsifier:` frontmatter with `deadline:` ISO date + `name:` human-readable string + `pass-condition:` short text

### Out-of-scope (Phase 2+)

- Sound notifications when a falsifier crosses a threshold (3-day, 1-day, overdue)
- Auto-archive of expired falsifiers
- Push notifications to phone via PWA

## Implementation steps

1. **Falsifier frontmatter convention** — declare in `docs/falsifier-protocol.md` + retrofit existing verdicts: v8.1.0 Crypto IS proof-pass (2026-05-24), Wealth IS composition-layer (2026-06-16), v7.5 OpenClaw items, etc.
2. **API routes** — write the three endpoints with file-system parsing. ISR `revalidate = 300` (5 min cache).
3. **Component** — Vellum & Voltage glass tiles, Fraunces for tile titles, Inter for body, JetBrains for dates. Restraint over flourish.
4. **Cockpit integration** — find the existing pane grid in cockpit, register Chronicle pane in a slot. Match existing Vellum & Voltage register.
5. **Local verify** — `pnpm --filter site dev`, open `localhost:3007`, see the pane render with real falsifier data
6. **Deploy** — `vercel --prod` from site/ (cockpit is part of site; not a separate app)
7. **Document** — Update cockpit MASTER-PLAN doc with the new pane

## Test / verification

- Open `localhost:3007` cockpit, see Chronicle pane render
- Falsifier countdown timers tick live (re-fetch every 5 min)
- Adding a new blessing to `docs/chronicle/blessings.jsonl` shows up in the Recent Blessings tile within 5 min
- Cadence Gate Progress shows current week count (currently 1 of 4 needed for monthly activation)
- Cross-Repo Commit Feed shows commits from at least 3 sibling repos in 24h window

## Falsifier

If at 30 days post-launch (2026-06-17) Frank opens the cockpit and checks the Chronicle pane < 3 times per week OR if any tile becomes stale (last update > 24h) for > 1 week, the pane failed its glanceable-awareness test → remove or collapse to a single "Open Falsifiers" tile only.

## Dependencies / unblocking

- **Depends on:** existing cockpit at `localhost:3007` with Vellum & Voltage substrate; Cross-Repo Indexer v0.1 (✅ shipped); Memory Bus v0.1 (✅ shipped); falsifier frontmatter convention (NEW — first step of impl).
- **Unblocks:** the *live* awareness layer of the Chronicle. Solves the "I have 41 handovers and don't know what's urgent" problem by surfacing falsifier countdowns prominently.

## Composition with the other three awareness surfaces (sequencing)

| Surface | Composes with cockpit pane via |
|---|---|
| **DASHBOARD.md (Obsidian)** | Same data sources; DASHBOARD is the archival browse view, pane is the live glance view |
| **/chronicle route** | Pane is private + live; route is public + archival manifesto. No data overlap. |
| **/board route** | Pane shows falsifiers (verdict-derived); /board renders verdicts (public). No data conflict. |

The four surfaces compose as: Obsidian (archive) + Cockpit (live) + /chronicle (public manifesto) + /board (public verdicts). Each has a distinct register and audience.

---

**Built on SIP** — Cockpit Chronicle pane spec · 2026-05-18 (W21) · operational-tier
