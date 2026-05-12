# Phase 0 Progress — live tracker

> Updated as work ships. Each entry: timestamp · action · result · evidence ref.

## 2026-05-12 — Session start

- [x] Read ULTRAPLAN-2026-05-12.md (388 lines) — full plan absorbed
- [x] Read 3 companion handovers (jarvis-grade-naming · three-tier-fleet-build · durability-sprint-addendum)
- [x] Verify 7 Phase 0 file targets exist on disk
- [x] Live HTTP probe :7777 / :7373 / :3007 — endpoint truth captured in `findings.md` F2
- [x] Read `start-cockpit.ps1:290-313` — captured F1 evidence for 0.1 hold
- [x] Read `BrainScene.tsx:195-220` — verified autoRotate at line 207
- [x] Read `CockpitOrbFrame.tsx:1-82` — verified F2 (correct as-is)
- [x] Read `sis-client.ts:1-300, 500-end` — verified F4 mock-fallback pattern + mapped all 8 call sites + test suite usage
- [x] Adopt 4 ULTRAPLAN owner-decisions per doc recommendations
- [x] Build planning scaffold (task_plan.md · findings.md · this file)

## Phase 0 actions — SHIPPED

### 0.6 — autoRotate removed ✅
**File:** `private/local-command-center/apps/dashboard/components/BrainScene.tsx`
**Change:** Removed `autoRotate` + `autoRotateSpeed={0.4}` props from `<OrbitControls>` (was lines 207-208).
**Effect:** Eye can lock onto nodes; selection + hover behaviour becomes useful instead of fighting drift.
**Verification:** typecheck clean; live page picks up on dev-server hot-reload.

### 0.2 — `/health` alias added ✅
**File:** `private/voice-operator/service/server.py`
**Change:** Added `@app.get("/health")` route returning `{"status": "ok"}` adjacent to existing `/healthz`. Comment cites ULTRAPLAN Phase 0 action 0.2.
**Effect:** Probes targeting either spelling get 200. Resolves HALF the health-check fragmentation (Gap 3); orb-side `/healthz` alias is the other half and lives in Arcanea.
**Verification:** `:7373/health` returns 404 today (pre-restart); will return 200 after FastAPI restart. Edit verified file-side.

### 0.5 — KG indexer investigation, properly scoped ✅
**Files examined:** `memory/knowledge-graph/index.jsonl` (40 lines) · `memory/knowledge-graph/_brain-cache.json` (40/1/4 confirmed) · `private/voice-operator/service/brain_watchdog.py` (watches `index.jsonl`, debounces, regen).
**Finding:** `index.jsonl` contains voice-turn captures only. The 520 cross-repo atoms live in Memory Bus (`memory/_audit/`) — a separate substrate that was never wired to feed the KG index. ULTRAPLAN-as-written treats this as Phase 0 (2h fix); reality is Phase 2.1-2.3 (wire indexer → KG index + classifier daemon + embedder).
**Decision:** scope this to Phase 2. No Phase 0 patch viable; the right architecture is bigger than this slice.
**Recorded:** `findings.md` F7 expanded with concrete substrate paths.

### 0.3 — DataSourceBadge + WithSource pattern + 5 pages wired ✅
**Files created:**
- `private/local-command-center/apps/dashboard/lib/data-source.ts` — `Sourced<T>` envelope, `SourceStatus` union, helpers (`sourcedLive` / `sourcedMock` / `sourcedError` / `sourcedStale`, `ageOut`, `relativeAge`)
- `private/local-command-center/apps/dashboard/components/DataSourceBadge.tsx` — `<DataSourceBadge>` + `<DataSourceBadgeFromEnvelope>` components with pulse-on-live, OKLCH-aligned tone palette (verified · doctrine · whisper · halt)

**Files updated:**
- `private/local-command-center/apps/dashboard/lib/sis-client.ts` — added 5 parallel `*WithSource()` fetchers (agentListWithSource · decisionListWithSource · packListWithSource · councilPendingWithSource · vaultLoopListWithSource). Distinguish HTTP 4xx/5xx (→ `mock`) from network failure (→ `error`). Legacy bare fetchers unchanged; tests + 8 existing call sites untouched.
- `private/local-command-center/apps/dashboard/app/agents/page.tsx` — badge wired top-right
- `private/local-command-center/apps/dashboard/app/decisions/page.tsx` — badge wired top-right
- `private/local-command-center/apps/dashboard/app/council/page.tsx` — badge wired top-right
- `private/local-command-center/apps/dashboard/app/packs/page.tsx` — badge wired top-right
- `private/local-command-center/apps/dashboard/app/mission-control/page.tsx` — 3 source badges in one ribbon (agents · decisions · packs) since this page aggregates

**Verification:** 204/204 dashboard tests pass (`npm test` in `apps/dashboard/`). `tsc --noEmit` clean for everything I touched. The ONLY remaining typecheck error is pre-existing in `BrainEventStrip.tsx` (`prediction.error` event handler missing — landed via sibling-tab commit `97eab1d`, not mine, not Phase 0 scope).

**Acceptance:** 5 of the 10 dashboard routes ULTRAPLAN cited now show real-vs-mock signal. Pattern is established and additive — remaining 5 (vault-loop, fleet/health, agent-events SSE, captures, drafts) can adopt the same shape incrementally without touching tests or breaking callers.

## Phase 0 actions — HELD / DEFERRED with evidence

### 0.1 — Cognition bridge default-on — HOLD ⚠
See `findings.md` F1. Bridge was deliberately re-enabled 2026-05-06 per `start-cockpit.ps1:290-296` in-code comment ("That gap is closed: utterance now dispatches end-to-end through the OrchestratorRouter"). ULTRAPLAN cites a stale memory entry; rip-without-verify would regress voice. Falsifier proposed: probe `:7373/api/utterance` with a "run tool X" packet and check executor actually executes (not just classifies).

### 0.7 — CockpitOrbFrame `/api/health` → `/healthz` — WRONG-DIRECTION ⚠
See `findings.md` F2. CockpitOrbFrame correctly probes `:7777/api/health` (orb's working endpoint, 200). Changing it to `/healthz` would BREAK the orb-offline indicator since `:7777/healthz` returns 404. Right fix is upstream: add `/healthz` alias on the orb in the Arcanea repo. Filed as cross-repo follow-on alongside 0.4.

### 0.4 — Replace `spawnSync('curl')` with `fetch` in STT — DEFER ⏸
Cross-repo (lives in `C:\Users\frank\Arcanea\packages\arcanea-voice\src\transcribe.mjs`). Outside this Phase 0 SIS-tracked push. Queued for the Arcanea session that handles 0.7 upstream too.

## Commit landmarks

- TODO: planning artifacts (this dir) — committing after this update

## Remaining dashboard surfaces (follow-on, additive)

The `*WithSource()` pattern can extend to the remaining 5 routes the same way:

1. `vaultLoopListWithSource` is ALREADY added to sis-client.ts; needs `/vaults/loop` page wiring
2. `/fleet/health` — has its own API route at `app/api/fleet/health/route.ts`; needs `Sourced<>` envelope
3. `agent-events` SSE — different shape (streaming); needs a `useSourcedSSE` hook
4. `/captures` + `/drafts` — same pattern as the 4 already done

None block Phase 1 or Phase 2. None substrate-touching.

## Open follow-ups (cross-cutting)

- Verify `:7373/api/utterance` executor lands tools, not just classifies (resolves F1 hold)
- Add `/healthz` alias to orb in Arcanea repo (resolves F2 hold properly + collapses Gap 3 fully)
- Fix pre-existing `BrainEventStrip.tsx` `prediction.error` type gap (sibling-tab leftover from `97eab1d`)
- 5 remaining dashboard routes can be wired with `*WithSource()` + `<DataSourceBadge>` incrementally
- Frank-side: re-read ULTRAPLAN-2026-05-12.md and confirm Phase 0 holds are valid before further phases
