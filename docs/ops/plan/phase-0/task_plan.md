# Phase 0 Task Plan — ULTRAPLAN 2026-05-12 emergency fixes

> **Source plan:** `docs/ops/ULTRAPLAN-2026-05-12.md` (Phase 0, lines 180-194)
> **Tracker:** This file + `progress.md` + `findings.md` in same dir
> **Authorization:** Frank "do it all for me" 2026-05-12
> **Adopted decisions (per ULTRAPLAN recommendations):** Pipecat cascade · Deepgram + faster-whisper fallback · Browser Use deferred to Phase 4 · time budget = Phase 0 then 1 OR 2
> **Karpathy hygiene:** every action verified against live HTTP probe + file:line read BEFORE edit. See `findings.md` for two items where ULTRAPLAN-as-written is stale/wrong-direction.

---

## Action table

| # | Action | Target | Effort | Status | Notes |
|---|---|---|---|---|---|
| 0.1 | Rip cognition bridge default-on | `private/local-command-center/scripts/start-cockpit.ps1:303` | 1 min | **HOLD** | Karpathy flag — bridge was re-enabled 2026-05-06 deliberately; in-code comment says executor now wires through. See finding F1. |
| 0.2 | Add `/health` alias to FastAPI :7373 | `private/voice-operator/service/main.py` (route reg) | 5 min | Pending | Verified `:7373/health` = 404 today. Mirror of `/healthz`. |
| 0.3 | DataSourceBadge + wire to 10 dashboard routes | `private/local-command-center/apps/dashboard/components/DataSourceBadge.tsx` + 10 surfaces | 2-4h | Pending | Honest "live | mock | stale" indicator. Biggest perceived-quality win. |
| 0.4 | Replace `spawnSync('curl')` with `fetch` in STT | `C:\Users\frank\Arcanea\packages\arcanea-voice\src\transcribe.mjs:33-39` | 1h | **DEFER** | Cross-repo. Outside SIS push scope; queued for Arcanea session. |
| 0.5 | Investigate KG indexer 520-atom corpus not feeding `_brain-cache.json` | `private/voice-operator/service/brain_watchdog.py` + indexer scripts | 2h | Pending | Brain shows 40/520. Unblocks Phase 2 craft pass. |
| 0.6 | Remove `autoRotate` on `/brain` | `private/local-command-center/apps/dashboard/components/BrainScene.tsx:207` | 5 min | Pending | Verified at L207. Easy + risk-free. |
| 0.7 | Fix `CockpitOrbFrame` health path | `private/local-command-center/apps/dashboard/components/CockpitOrbFrame.tsx:21` | 10 min | **HOLD** | Karpathy flag — file is CORRECT against current orb (`:7777/api/health` = 200). ULTRAPLAN's proposed change would BREAK it. See finding F2. Right fix is upstream (add `/healthz` alias to orb in Arcanea), not in this file. |

---

## Acceptance criteria (per ULTRAPLAN Phase 0)

- Voice feels measurably snappier (touched by 0.1 + 0.4)
- Brain shows real cluster structure (touched by 0.5 + 0.6)
- Every page tells the truth about its data (touched by 0.3)

## Build sequence (executed in this order)

1. ✅ Verify all 7 file targets exist (done before this file existed)
2. ✅ Live-probe :7777 / :7373 / :3007 endpoints (done; findings captured)
3. 0.6 — Remove autoRotate (5 min, fully verified)
4. 0.2 — Add /health alias (5 min, fully verified)
5. 0.5 — KG indexer investigation (2h, may unblock Phase 2)
6. 0.3 — DataSourceBadge build (2-4h, biggest impact)
7. Findings document for 0.1 + 0.7 (Karpathy holds)
8. Final report + push planning artifacts to origin/main

## What is OUT of scope

- 0.4 (Arcanea cross-repo) — deferred to Arcanea session
- Any substrate-touching changes (would need `/starlight-board` pre-pass)
- Phases 1-5 (voice streaming, brain depth, dashboard, agent runtime, council voice)
