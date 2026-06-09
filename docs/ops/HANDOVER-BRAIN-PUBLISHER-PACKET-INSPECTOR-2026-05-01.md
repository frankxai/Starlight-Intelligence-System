# Handover — Brain Event Publisher + Packet Inspector

**Date:** 2026-05-01 (overnight, round 2)
**Operator:** Claude Code (autonomous, lead authority)
**Tier:** Operational. No substrate edit. No `/luminor-board` pre-pass.
**Continues:** `HANDOVER-DASHBOARD-BRAIN-WIRE-2026-05-01.md` (round 1 wired the visual reaction; round 2 makes it fire on real dispatches and adds packet inspection).

---

## TL;DR

The brain visualization at `/brain` no longer relies on synthetic `POST /api/brain/inject` to glow. **Every real dispatch now publishes a lifecycle of brain events** (`retrieve.start` → `retrieve.topk` → `synthesis.complete`/`error`) which feed straight into the halo state machine shipped in round 1. Type "refactor auth" into the new dispatch panel, hit Enter, and the matching nodes light up purple, then pulse teal when the response lands.

Plus: clicking any row in the routing decisions list now opens a **packet inspector drawer** with the full packet snapshot from `logs/packets/<date>/<id>.json`, surfaced field-by-field plus raw JSON.

Type-check is also now fully clean — fixed the long-standing pre-existing `app/layout.tsx` typedRoutes errors as a bonus.

**Tests: 512/512 Python (+44 net new) + 40/40 dashboard. Type-check exit 0.**

---

## What shipped

### Block A — Brain event publisher (Python side)

**`service/brain_publisher.py`** — new file (~280 lines):

- `BrainPublisher` class with thread-pool executor for fire-and-forget HTTP POST.
- `PublisherConfig.from_env()` reads `BRAIN_PUBLISHER_URL` (default `http://127.0.0.1:3007/api/brain/inject`), `BRAIN_PUBLISHER_DISABLED`, `BRAIN_PUBLISHER_TIMEOUT_MS` (default 500ms).
- `BrainPublisher.shared()` lazy singleton; `reset_shared()` for tests.
- Event constructors that mirror `lib/brain-events.ts` exactly: `make_retrieve_start`, `make_retrieve_topk`, `make_synthesis_complete`, `make_error`, `make_privacy_gate`.
- `new_trace_id()` returns `t-<12-hex>` for lifecycle correlation.
- KG node lookup helpers:
  - `lookup_node_ids_by_files(files)` — substring-matches file basenames against KG node task strings, capped at 12 IDs.
  - `lookup_node_ids_recent()` — fallback returning the 5 most-recent nodes when no file match.

**Graceful degradation by design.** Dashboard offline → `URLError` caught, first failure logs WARNING, subsequent failures log DEBUG. Malformed events refused before HTTP attempt. Disabled flag short-circuits everything. The dispatch path NEVER fails because the publisher fails — explicit contract test for this.

### Block B — Wire `OrchestratorRouter.route()` to publish events

`service/orchestrator_router.py` updated. The dispatch lifecycle now emits:

1. **`retrieve.start`** at the top of `route()` with the task (truncated to 200 chars) as `query`.
2. **`retrieve.topk`** after classification — relevant_files mapped to KG node IDs via the publisher's lookup helpers, falling back to most-recent nodes.
3. **`synthesis.complete`** when the dispatcher returns `status="executed"`, with the response truncated to 120 chars as `summary`.
4. **`error`** when the dispatcher returns any other status, carrying the trace_id for halo coloring.

All four events share a single `trace_id` per call so the halo state machine's "synthesis pulses only matching trace nodes" rule fires correctly. The publisher is imported lazily so the orchestrator has no hard dependency.

### Block C — Packet inspector

**`app/api/packets/[date]/[id]/route.ts`** — new endpoint:

- Reads `private/voice-operator/logs/packets/<date>/<id>.json` written by `OrchestratorRouter.route()` since 2026-04-30.
- Localhost-only by default (matches `/api/brain` privacy posture).
- Path validation: regex on `date` (`YYYY-MM-DD` only), regex on `id` (alphanumeric + dashes), defense-in-depth check that resolved path stays under the packet root.
- Returns `404` with helpful message if the snapshot is missing (e.g., dispatch happened before packet-log feature shipped).

**`components/PacketInspector.tsx`** — drawer component:

- Slide-in right drawer with backdrop, Escape key closes.
- Surfaces the most-actionable fields on top: Task, Utterance (if different from Task), Target, Intent, Approval, Spoken Update.
- Full packet JSON in a scrollable preformatted block at the bottom.
- Loading + error states; error state explains what to check if the snapshot is missing.

**`components/RoutingDecisions.tsx`** — wired:

- Each routing-decision row is now a `<button>` instead of a `<div>`, with hover state, focus outline, accessible aria-label.
- Clicking opens the inspector with the packet's date (parsed from ISO timestamp) + ID.

### Block D — Type-check fully clean

**`app/layout.tsx`** — pre-existing Next 16 typedRoutes errors fixed:

- Imported `type { Route } from "next"`.
- Cast `<Link href={"/cockpit" as Route}>` and the same for `/cockpit/voices`.
- Documented in a code comment why the cast is necessary.

**Result:** `npx tsc --noEmit` now exits 0 with zero errors. First time since the typed-routes upgrade.

### Block E — Tests

**`tests/test_brain_publisher.py`** — 32 cases:
- PublisherConfig env knobs (defaults, custom URL, disabled flag, timeout override, invalid timeout fallback, minimum timeout floor).
- Event constructor schema fidelity (every kind, optional fields omitted, invalid privacy decision raises).
- HTTP success path (mocked urlopen).
- HTTP failure paths (URLError, TimeoutError) — all return False, never raise.
- Malformed event refused before HTTP attempt.
- POST request inspection (URL, method, headers, body shape).
- Singleton + reset behavior.
- Async publish never blocks even with unreachable endpoint.
- KG cache lookup by files (matching, no-match returns empty, missing cache, malformed cache, limit enforcement, basename-only matching).
- KG cache recent fallback (descending order, skip nodes without timestamp, missing cache).

**`tests/test_orchestrator_brain_publish.py`** — 12 integration cases:
- Success path emits all three lifecycle events.
- `retrieve.start` truncates long queries to ≤200 chars.
- `retrieve.topk` falls back to recent KG nodes when relevant_files don't match.
- All events in one route() call share the same trace_id (halo correlation contract).
- Dispatcher error → emits `error` event with trace_id, NOT `synthesis.complete`.
- Dry-run (`dispatch=False`) emits `retrieve.start` + `retrieve.topk` but NOT synthesis/error.
- **Hard contract: publisher disabled doesn't break dispatch.**
- **Hard contract: publisher raising RuntimeError doesn't break dispatch.**

Synchronous test fixture replaces `BrainPublisher.publish` with a non-executor version so contract assertions don't race against the worker thread.

---

## How to see it work

```bash
# Terminal 1
cd private/voice-operator && python -m service.main server   # FastAPI :7373

# Terminal 2
cd private/local-command-center/apps/dashboard && pnpm dev    # :3007

# Terminal 3
# Open http://localhost:3007/brain in one tab.
# Open http://localhost:3007/      in another.
# In the dispatch panel, type:
#     "explore caching options"
# Hit Cmd+Enter. The /brain tab will halo nodes purple (retrieve), then teal (synthesis).
# Click the resulting routing-decision row in the home tab to inspect the packet.
```

To verify graceful degradation:

```bash
BRAIN_PUBLISHER_DISABLED=1 python -m service.orchestrator_cli "test" --dry-run
# Dispatch works normally; zero brain events emitted.
```

---

## What's next

In leverage order for whoever picks up the next session:

1. **Workflow panel.** List YAMLs from `private/voice-operator/config/workflows/`, fire one through FastAPI workflow runner, surface step-by-step result. ~2-3h. Surfaces the existing `workflow_runner.py` (13 YAMLs already shipped).
2. **Cognition router emits brain events too.** Right now only `OrchestratorRouter.route()` (output routing) publishes. Wiring `service/cognition/router.py` (utterance → packet) to also publish would fire the brain on voice + text mode queries, not just dispatch. ~1-2h.
3. **Public docs page** for multi-CLI dispatch + brain visualization on `site/`. ~1h.
4. **Memory orchestrator integration.** When the v0.1 memory orchestrator's `Router` does retrieval, publish `retrieve.topk` with the actual top-k node IDs (not the heuristic file-name match). This makes the halos *truly* representational. ~3-4h.

---

## Caveats

1. **`BRAIN_PUBLISHER_TIMEOUT_MS` defaults to 500ms.** That's tight on cold first connection to the dashboard. If you see warnings like `dashboard unreachable at http://127.0.0.1:3007/api/brain/inject` immediately after starting the dashboard, give it a few seconds to warm up — subsequent calls are fast.
2. **The brain publisher uses a `ThreadPoolExecutor(max_workers=2)`.** That's enough for one in-flight publish per call site (orchestrator + cognition); if you add more publishers, raise the cap.
3. **Node ID matching is heuristic.** The publisher's `lookup_node_ids_by_files` does case-insensitive basename substring match against KG node tasks. False positives are fine — halos only fire on nodes that exist in the loaded brain cache, and unknown IDs are silently dropped. Future memory orchestrator integration replaces this with real top-k.
4. **The packet inspector reads from disk on every open.** Fast for ≤1MB packets; if packets grow much larger, add a small in-memory LRU on the API route.

---

## Files touched

### Net-new (5)

```
private/voice-operator/service/brain_publisher.py
private/voice-operator/tests/test_brain_publisher.py
private/voice-operator/tests/test_orchestrator_brain_publish.py
private/local-command-center/apps/dashboard/app/api/packets/[date]/[id]/route.ts
private/local-command-center/apps/dashboard/components/PacketInspector.tsx
docs/ops/HANDOVER-BRAIN-PUBLISHER-PACKET-INSPECTOR-2026-05-01.md   (this file)
```

### Edited (3)

```
private/voice-operator/service/orchestrator_router.py                            (publish lifecycle events)
private/local-command-center/apps/dashboard/components/RoutingDecisions.tsx     (clickable rows + inspector wire)
private/local-command-center/apps/dashboard/app/layout.tsx                       (Route cast for typedRoutes)
```

### Test ledger

| Suite | Before | After | Net new |
|-------|--------|-------|---------|
| Python (excl. test_brain_graph.py) | 468 | 512 | +44 |
| Dashboard (`node:test`) | 40 | 40 | 0 |
| **Total** | **508** | **552** | **+44** |

### Type-check

| | Before | After |
|---|---|---|
| `npx tsc --noEmit` exit | 1 (4 layout.tsx errors) | **0 (clean)** |

---

*Operational tier. No substrate edit. Built on SIP.*
