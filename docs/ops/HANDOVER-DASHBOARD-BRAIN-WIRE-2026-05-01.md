# Handover — Dashboard Brain Wire-Up + Dispatch Panel

**Date:** 2026-05-01
**Operator:** Claude Code (overnight build, autonomous mode)
**Tier:** Operational. No substrate edit. No `/luminor-board` pre-pass.
**Scope:** LCC dashboard — wire the parked brain event reaction, add a dispatch UI surface, fix dead navigation.

---

## TL;DR

The brain visualization is no longer a passive snapshot — it now *responds* to live SSE events from the cognition pipeline. When a query lands a `retrieve.topk` event, the matched nodes glow purple. When `synthesis.complete` fires, the same nodes pulse teal. When an `error` event lands with a trace, those nodes flash red. A HUD strip at top-left shows the textual stream alongside the visual reaction.

The dashboard home now also has a **Dispatch panel** — type a prompt, optionally override intent class or dispatcher, hit Cmd+Enter, see the orchestrator's classification + the chosen CLI's response inline. Same router as the `/dispatch` slash command and the orb's `POST /api/dispatch` — three surfaces, one source of truth.

Dead "(Phase 4)" link to `/brain` replaced with a real link plus `/cockpit` shortcut.

**Tests: 40/40 dashboard (18 net-new for the halo state machine) + 468/468 Python.**

---

## Real assessment of what was there before tonight

Before assuming "we need to build X," I read the actual state. Here's the honest read:

### Dashboard at `private/local-command-center/apps/dashboard/`

**What it did:** 3-column home (cockpit status / live routing decisions tailing my new `routing.jsonl` / today's captures). `/brain` page with full 3D r3f scene — instanced mesh ≤10K nodes, time-warp, brand filter, search, cluster labels, manual regen, fog, lighting. SSE channel `/api/brain/events` with 6 event kinds + heartbeat + ring buffer. `/api/brain/inject` for synthetic events.

**Quality:** B+. Real polling, error handling, no-store cache, proper cleanup. Strong design system. Tests use built-in `node:test`.

**Real gaps:**
1. Brain scene's visual reaction to live SSE events was explicitly parked. `BrainScene.tsx:67-69` said: "for now we collect events and log under debug for parity testing against the SSE contract. The scene wiring lands in the next session." Tonight is that session.
2. Dead `/brain (Phase 4)` link in CockpitStatus pointing at `#`.
3. No dispatch panel — despite the dispatch infrastructure shipped 2026-04-30.
4. No packet inspector on the routing decisions list.
5. Workflow runner has 13 YAMLs but no UI surface.

I shipped fixes for items 1, 2, 3 tonight. Items 4 and 5 documented as next builds.

---

## What shipped tonight

### Block A — Brain event reaction (the headline)

**Pure halo state machine** — `private/local-command-center/apps/dashboard/lib/brain-halos.ts`:

- `applyEvent(state, event, now)` — folds a single event into halo state. Only `retrieve.topk`, `synthesis.complete`, and `error` open halos; `privacy.gate` / `retrieve.start` / `heartbeat` are HUD-only.
- `expireHalos(state, now)` — drops entries past expiry.
- `intensityMap(state, now)` — sparse `Map<nodeId, { intensity, kind }>` for the visual layer.
- Halo lifetimes: retrieve = 3000ms, synthesis = 1500ms, error = 1000ms.
- Kind priority on overlap: synthesis > error > retrieve.
- Capped at `MAX_HALOS = 200`, evicting oldest first.
- Synthesis halos only fire on nodes sharing the same `trace_id` as a prior `retrieve.topk` — i.e., the confirmation pulse hits the matched top-k, not random nodes.

Why pure: zero React, zero three.js. Testable with `node:test`. The visual layer is a thin adapter.

**React adapter** — `lib/use-brain-halos.ts`:

- Subscribes to `useBrainEvents`, folds each new event into halo state via `applyEvent`.
- Ticks every 100ms to flush expired halos and re-derive intensities.
- Returns `{ intensities, connected }`.

**r3f visual layer** — `components/BrainEventHalos.tsx`:

- Three `<HaloKindLayer>` instanced meshes (one per kind) for additive-blend glow spheres.
- Position lookup from the parent scene's nodes.
- Per-frame `useFrame` updates: scale = `1 + 2.0 * intensity`, opacity = `0.6 * peak_intensity`.
- Capped at 80 simultaneous halos per kind to keep frame work bounded.
- `frustumCulled={false}` because the halos can be anywhere in the cloud.

**HUD strip** — `components/BrainEventStrip.tsx`:

- Sits top-left of `/brain` page as overlay.
- Shows last 6 non-heartbeat events with kind-pill + summary + age.
- Live indicator (green pulse when SSE connected, dim when offline).
- Events fade linearly over 30s.
- Test override prop (`testEvents`) lets layout tests skip EventSource.

**Wiring** — `components/BrainScene.tsx`:

- Removed the "parked" comment.
- Dropped the unused direct `useBrainEvents` debug subscription.
- Added `<BrainEventHalos nodes={payload.nodes} />` inside `<Canvas>`.
- Added `<BrainEventStrip />` as overlay.

### Block B — Dispatch Panel

**Proxy** — `app/api/dispatch/route.ts`:

- Thin proxy from dashboard `/api/dispatch` → FastAPI `:7373/api/dispatch` (the orb executor backend shipped 2026-04-30).
- 600s timeout matching the dispatcher's own ceiling.
- Faithful pass-through of upstream JSON; clean fallback `{ error: "fastapi-offline" }` shape when operator process isn't running.
- 503 when upstream unreachable, 504 when timed out, 502 when upstream non-JSON.

**Component** — `components/DispatchPanel.tsx`:

- Textarea + intent select + dispatcher select + dispatch button.
- Cmd/Ctrl+Enter sends.
- "auto" option in both selects = let the classifier / routing table decide.
- Renders the decision (intent class pill + chosen dispatcher in brand color + fallback indicator + reason) and the result (status pill + response body in scrollable preformatted block + packet ID + timestamp).
- Distinct error rendering when upstream FastAPI is offline.

**Wiring** — `app/page.tsx`:

- Center column now stacks `DispatchPanel` above `RoutingDecisions`. The 3-column layout is preserved; the center is taller.

### Block C — Quality fixes

**`components/CockpitStatus.tsx`**:

- Replaced `<a href="#">→ /brain (Phase 4)</a>` with a real link and a "/cockpit" shortcut.
- Quick links section now: `/brain` / `/cockpit` / `/proxy/healthz` / `/proxy/docs (FastAPI Swagger)`.

### Block D — Tests

**`__tests__/brain-halos.test.ts`** — 18 cases covering:

- All event kinds: heartbeat / retrieve.start / privacy.gate ignored; retrieve.topk / synthesis.complete / error open halos.
- Synthesis only pulses nodes sharing `trace_id`.
- Error without trace is HUD-only (no halos).
- Eviction past expiry.
- Cap at `MAX_HALOS` keeping newest.
- `expireHalos` referential equality optimization (no churn when nothing expired).
- `intensityMap` linear decay 1.0 → 0 across lifetime.
- Kind priority: synthesis > error > retrieve.
- Multi-node parallel halos.
- `applyEvents` replay sequence.

**Test runner updates** — `__tests__/run.mjs` + `__tests__/tsconfig.json`:

- Now compiles + runs both `brain-events.test.ts` (existing 22 cases) and `brain-halos.test.ts` (new 18 cases).
- Total: **40/40 passing.**

---

## How to see it work

```bash
# Terminal 1 — voice operator (FastAPI :7373)
cd private/voice-operator
python -m service.main server

# Terminal 2 — dashboard
cd private/local-command-center/apps/dashboard
pnpm dev   # or npm run dev — port 3007

# Terminal 3 — fire a synthetic brain event to see the halo light up
curl -X POST http://localhost:3007/api/brain/inject \
  -H 'content-type: application/json' \
  -d '{"kind":"retrieve.topk","ts":"2026-05-01T00:00:00Z","trace_id":"smoke-1","node_ids":["n00000000-some-existing-id"]}'

# Then fire a synthesis event with the same trace_id to see the green pulse:
curl -X POST http://localhost:3007/api/brain/inject \
  -H 'content-type: application/json' \
  -d '{"kind":"synthesis.complete","ts":"2026-05-01T00:00:01Z","trace_id":"smoke-1","summary":"matched 3 nodes"}'
```

Or use the new dispatch panel at `http://localhost:3007/` — type a prompt, watch the routing decision land in the center panel within 2 seconds (the live tail).

---

## What's next (priorities for the next build session)

In order of leverage:

1. **Packet inspector.** Click any routing decision → drawer opens showing the full packet snapshot from `logs/packets/<date>/<id>.json`. Makes the audit trail navigable without filesystem grepping. ~1 hour.
2. **Workflow panel.** List YAMLs from `private/voice-operator/config/workflows/`, click to fire one through the FastAPI workflow runner. Surface the step-by-step result. ~2-3 hours.
3. **Cognition pipeline emits real brain events.** Right now the halos only fire from `/api/brain/inject` (synthetic). Wiring `service/cognition/router.py` to publish `retrieve.start` / `retrieve.topk` / `synthesis.complete` to the brain event bus would make every voice / text / dispatch query naturally light up the brain. ~3-4 hours.
4. **Public docs page** for multi-CLI dispatch. Currently the `commands/dispatch.md` is in the repo, the handover docs explain it, but nothing on the published `site/` advertises it. ~1 hour.
5. **Workflow runner unit-tested via `pnpm test`** for the dashboard side (currently the workflow runner has Python tests only).

---

## Caveats

1. **Pre-existing TS errors in `app/layout.tsx`** — Next 16 typed routes need the page to exist when typed routes is enabled. Two `<Link href="/cockpit">` errors. Not caused by my changes; verified via filtered grep. Worth fixing in a separate pass.
2. **Dispatch panel relies on FastAPI :7373 running.** When offline, the panel renders a clear `fastapi-offline` error with a hint to start the operator. Designed for graceful degradation.
3. **The brain visual halo only fires for nodes that exist in the current scene.** If a `retrieve.topk` event arrives with node IDs that aren't in the loaded brain cache, those halos are silently dropped at the position-lookup step (no error, just no glow). This is correct behavior — the cache regen is manual via the HUD button.
4. **`useBrainHalos` ticks at 100ms** — that's enough for visible decay smoothness without thrashing React. If you ever want sub-100ms decay precision, switch the visual layer to drive its own `useFrame` time math against halo `expiresAt` instead of the React-tick-driven intensity map.

---

## Files touched

### Net-new (5)

```
private/local-command-center/apps/dashboard/lib/brain-halos.ts
private/local-command-center/apps/dashboard/lib/use-brain-halos.ts
private/local-command-center/apps/dashboard/components/BrainEventHalos.tsx
private/local-command-center/apps/dashboard/components/BrainEventStrip.tsx
private/local-command-center/apps/dashboard/components/DispatchPanel.tsx
private/local-command-center/apps/dashboard/app/api/dispatch/route.ts
private/local-command-center/apps/dashboard/__tests__/brain-halos.test.ts
docs/ops/HANDOVER-DASHBOARD-BRAIN-WIRE-2026-05-01.md   (this file)
```

### Edited (5)

```
private/local-command-center/apps/dashboard/components/BrainScene.tsx          (+halos +strip, -parked comment)
private/local-command-center/apps/dashboard/components/CockpitStatus.tsx       (real /brain link + /cockpit)
private/local-command-center/apps/dashboard/app/page.tsx                       (DispatchPanel in center column)
private/local-command-center/apps/dashboard/__tests__/run.mjs                  (run both test files)
private/local-command-center/apps/dashboard/__tests__/tsconfig.json            (include new test + lib)
```

### Memory ledger

- `MEMORY.md` index updated.
- New entry: `project_v753_dashboard_brain_wire.md`.

---

*Operational tier. No substrate edit. Built on SIP.*
