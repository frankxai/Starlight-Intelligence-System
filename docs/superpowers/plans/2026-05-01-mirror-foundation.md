# Mirror Foundation — 2026-05-01

> Substrate-tier governance: **operational only**. No SIP/SIS/ALLIANCE/STACK/VERTICALS/VOICES/REGISTRY edits. No taxonomy changes. No attestation rule changes. `/luminor-board` pre-pass not structurally required.

## Premise

Frank asked for the "Mirror of Mind" — speak to Voice Operator → see memory regions activate in `/brain` → emotional tint → spatial audio. Full vision is multi-week. **This plan delivers the foundation slice that makes the vision testable**: turns `memory/` into a valid Obsidian vault, ships a KG→Canvas exporter, and stands up the SSE retrieval-event pipeline that future activation visuals will subscribe to.

What this plan does **not** ship is named below in §Cuts. Naming the cuts is the plan.

## Success criteria (verifiable in the morning)

1. `memory/` opens cleanly in Obsidian — every `.md` has valid frontmatter, vault config present, no plugin dependency.
2. `python -m service.memory.frontmatter --check memory/` returns 0; CI-grade lint over all 8 memory MD files.
3. `python -m service.memory.canvas_export memory/knowledge-graph/_brain-cache.json memory/atlases/brain-clusters.canvas` produces a JSON Canvas that Obsidian renders as a cluster mind-map.
4. 3 starter Bases dashboards render without YAML errors when opened.
5. `GET /api/brain/events` (localhost-only) emits a heartbeat every 15s; `POST /api/brain/inject` accepts a synthetic retrieval event and the SSE channel re-emits it.
6. `/brain` page subscribes; injecting a synthetic event logs it to browser console (full visual reaction is parked — see §Cuts).
7. Contract test verifies event schema and localhost gating.
8. Existing test suite stays green (no regressions in the 46 voice-operator tests + the dashboard typecheck).

## Architecture

```
                    ┌─────────────────────────────────────────┐
                    │     memory/  (filesystem source)         │
                    │                                          │
                    │  vaults/*.md   ←── frontmatter pass     │
                    │  voice-sessions/*.md  ←── frontmatter   │
                    │  knowledge-graph/index.jsonl            │
                    │  knowledge-graph/_brain-cache.json      │
                    │  atlases/brain-clusters.canvas  ←── new │
                    │  bases/*.base  ←── new                  │
                    │  README.md     ←── new                  │
                    │  .obsidian/    ←── new (workspace only) │
                    └────────────┬─────────────────────────────┘
                                 │
                ┌────────────────┼─────────────────┐
                │                │                 │
                ▼                ▼                 ▼
       ┌──────────────┐  ┌─────────────┐  ┌──────────────┐
       │   Obsidian   │  │   /brain    │  │  service/    │
       │  (viewer)    │  │  r3f scene  │  │  memory/     │
       │              │  │   :3007     │  │  (router)    │
       │ wikilinks +  │  │             │  │              │
       │ Bases +      │  │ + new SSE   │  │ + frontmatter│
       │ Canvas       │  │   subscriber│  │ + canvas_exp │
       └──────────────┘  └──────┬──────┘  └──────────────┘
                                │
                                │ EventSource
                                ▼
                       ┌─────────────────┐
                       │ /api/brain/     │
                       │   events  (SSE) │
                       │   inject  (POST)│
                       └─────────────────┘
                       localhost-gated
                       schema-validated
```

## Frontmatter schema (what we stamp)

Two flavors. Additive only — never overwrite existing content.

**Vault entries** (`memory/vaults/*.md`):
```yaml
---
type: vault
vault: strategic | technical | creative | operational | wisdom | horizon
retention: permanent | rolling-90d | append-only
writers: [navigator, prime]   # per VAULT_ARCHITECTURE.md access matrix
readers: all
last_consolidated: 2026-05-01
---
```

**Voice sessions** (`memory/voice-sessions/YYYY-MM-DD.md`):
```yaml
---
type: voice-session
date: 2026-05-01
brand: sis | arcanea | acos | ai-ops | personal | unknown
decay_tier: hot | warm | cold
intent_class: capture | command | build | research
---
```

**Tags** (added to enable Bases filtering): `#vault/{name}`, `#brand/{name}`, `#tier/{hot|warm|cold}`.

## Deliverables (file-by-file)

### Substrate (memory layer)
- `memory/README.md` — explains dual-surface (FS truth + Obsidian view), no Obsidian Sync, Git-only, replaceable viewer
- `memory/.obsidian/app.json` — minimal config, telemetry off, Sync disabled
- `memory/.obsidian/workspace.json` — opens vault on `voice-sessions/` by default
- `memory/atlases/brain-clusters.canvas` — generated artifact (also committed for reproducibility)
- `memory/bases/voice-sessions-recent.base` — last 30 days, table view
- `memory/bases/decay-watch.base` — entries older than 90d at warm tier
- `memory/bases/brand-rollup.base` — group-by brand, count + last-touch
- 6 vault `.md` files — frontmatter prepended (no body changes)
- 2 voice-session `.md` files — frontmatter prepended (no body changes)

### Service (Python — voice-operator)
- `private/voice-operator/service/memory/frontmatter.py` — validator + safe-prepender + CLI
- `private/voice-operator/service/memory/canvas_export.py` — KG→Canvas converter + CLI
- `private/voice-operator/tests/test_memory_frontmatter.py` — TDD: schema, idempotent stamping, refusal on conflict
- `private/voice-operator/tests/test_memory_canvas_export.py` — TDD: cluster→group, node positioning, JSON Canvas spec compliance
- `scripts/lint_memory_frontmatter.py` — root-level CLI shim
- `scripts/kg_to_canvas.py` — root-level CLI shim

### Dashboard (TypeScript)
- `private/local-command-center/apps/dashboard/lib/brain-events.ts` — event schema + type guards (no zod; lightweight runtime check)
- `private/local-command-center/apps/dashboard/app/api/brain/events/route.ts` — SSE endpoint, in-memory ring buffer, heartbeat
- `private/local-command-center/apps/dashboard/app/api/brain/inject/route.ts` — POST synthetic event (test/demo only)
- `private/local-command-center/apps/dashboard/components/BrainScene.tsx` — add `useBrainEvents()` hook (logs to console; visual layer parked)
- `private/local-command-center/apps/dashboard/__tests__/brain-events.test.ts` — contract test (node:test, no new dep)

### Docs + memory
- `docs/ops/HANDOVER-2026-05-01.md` — what shipped, what's parked, exact next-session start
- `memory/_handovers/2026-05-01-mirror-foundation.md` — atom for future sessions
- New auto-memory atom + MEMORY.md index entry

## Cuts (named, parked, with un-park triggers)

| Cut | Why parked | Un-park trigger |
|---|---|---|
| Sentiment classifier on capture | Adds ~500MB model dep, needs Privacy Guardian whitelist for embedding vectors, design call on tint mapping | When Frank approves model + palette |
| Bloom / postprocessing pass | Needs Frank's design eye on intensity, palette, perf budget | Live design session at /brain |
| Tone.js spatial audio | Needs Frank's ear on chord choice, drone selection, mute UX | Same session as bloom |
| Particle field idle state | Belongs with audio + bloom — they ship together as "ambient layer" | Same session |
| Click-through Obsidian deep linking from /brain | URL scheme reliability varies by OS; needs test on Frank's exact setup | After foundation lands and someone wants it |
| Phone PWA mirror | Tier C scope; foundation must prove first | After Mirror visual lands |
| Auto-Genius-Atlas from `/discover-genius` | Vertical-tier dependency on excavation pipeline | After at least one real `/discover-genius` corpus exists |

## Verification gates

1. `cd private/voice-operator && pytest tests/test_memory_frontmatter.py tests/test_memory_canvas_export.py -v` — new tests pass
2. `cd private/voice-operator && pytest -q` — full suite still green
3. `cd private/local-command-center/apps/dashboard && npx tsc --noEmit` — no new typecheck errors
4. `cd private/local-command-center/apps/dashboard && node --test __tests__/brain-events.test.ts` — contract test passes
5. `npm run dev` (dashboard) → visit `http://localhost:3007/brain` → verify scene renders, no console errors
6. `curl -X POST http://localhost:3007/api/brain/inject -d '{"kind":"retrieve.topk",...}'` → see in browser console
7. Open `memory/` as Obsidian vault → verify all .md files render, Bases work, Canvas opens

## Commit plan (two clean commits, both operational-tier)

**Commit 1** — "feat(memory): Obsidian-friendly substrate — frontmatter + Bases + canvas export"
- `memory/README.md`, `memory/.obsidian/`, `memory/bases/`, `memory/atlases/`, vault frontmatter, voice-session frontmatter
- `private/voice-operator/service/memory/frontmatter.py`, `canvas_export.py`
- `private/voice-operator/tests/test_memory_frontmatter.py`, `test_memory_canvas_export.py`
- `scripts/lint_memory_frontmatter.py`, `scripts/kg_to_canvas.py`

**Commit 2** — "feat(dashboard): SSE retrieval-event channel for /brain Mirror foundation"
- `lib/brain-events.ts`, `app/api/brain/events/route.ts`, `app/api/brain/inject/route.ts`
- `components/BrainScene.tsx` (subscriber hook only)
- `__tests__/brain-events.test.ts`

**Commit 3** (docs+memory) — "docs(ops): mirror foundation handover + memory atom"

## Risk register

- **Bash fork errors on Windows** — observed during survey ("cygheap read copy failed"). Mitigation: serialize bash calls; prefer Glob/Grep/Read over shelling out.
- **Test runner divergence** — voice-operator uses pytest; dashboard has no test runner installed. Mitigation: use `node --test` (built-in, no dep add) for dashboard contract test.
- **Frontmatter conflicts with existing content** — vault MD files may have leading H1 that conflicts with frontmatter. Mitigation: validator detects and refuses; manual review per file.
- **SSE backpressure** — none expected since injector is test-only and produces ≤1 event/click. Throttling deferred until real event source wired.
- **Localhost gate bypass** — must mirror existing `/api/brain` `BRAIN_PUBLIC=1` gate; tested in contract test.
