# Phase 0 Findings — verified before edit

> Karpathy hygiene log. Each finding is a real-file / real-output read that altered (or held) execution.

---

## F1 — Cognition bridge `start-cockpit.ps1:303` was deliberately re-enabled

**ULTRAPLAN claim:** Rip cognition bridge default-on per `start-cockpit.ps1:303`.

**Actual file evidence** (lines 290-306 of `private/local-command-center/scripts/start-cockpit.ps1`):

```powershell
    # Disabled 2026-04-30 — 2026-05-06 because the bridge classified without
    # executing, so the orb produced bland chat instead of running tools.
    # That gap is closed: utterance now dispatches end-to-end through the
    # OrchestratorRouter when the packet warrants it, and falls through to
    # PacketRouter (vault writes, intake, MCP) when it doesn't.
    Start-DetachedProcess `
        -Name 'arcanea-voice-orb' `
        ...
        -EnvVars @{
            COGNITION_BRIDGE_URL = 'http://127.0.0.1:7373/api/utterance'
            ARCANEA_VOICE_ELEVEN_MODEL = 'eleven_flash_v2_5'
        }
```

**Conflict:** ULTRAPLAN was written 2026-05-12 referencing `memory/project_voice_operator_bridge_off.md`. That memory entry pre-dates the 2026-05-06 re-enable. So ULTRAPLAN is operating on stale memory; the in-code comment is current truth.

**Verification needed before action:**
- Probe `:7373/api/utterance` with a sample packet
- Check if `OrchestratorRouter` actually executes tools (or just classifies)
- Check `service/cognition/router.py` for the executor surface

**Hold decision:** Do NOT rip line 303 in this Phase 0 push. Surface to Frank with the verification probe queued.

**Falsifier:** if `:7373/api/utterance` returns a packet but executes zero tools on a "run tool X" prompt, ULTRAPLAN is right and we rip. If it executes tools and the orb is faster + smarter with bridge ON, the memory entry is stale and should be updated.

---

## F2 — `CockpitOrbFrame.tsx:21` health-probe path is already correct

**ULTRAPLAN claim:** Fix `CockpitOrbFrame.tsx:21` from `/api/health` → `/healthz`.

**Live HTTP probe (2026-05-12 this session):**

```
:7777/api/health    →  200 OK   (orb is here, native path)
:7777/healthz       →  404      (orb does NOT serve /healthz)
:7373/healthz       →  200 OK   (FastAPI cognition layer is here)
:7373/health        →  404      (FastAPI does NOT serve /health alias yet)
```

**Conflict:** CockpitOrbFrame correctly pings `:7777/api/health` (the orb's native, working endpoint). The "Orb offline" tile only fires on genuine reachability failure. Changing the path to `/healthz` would make EVERY user see "Orb offline" because that path 404s.

**Real "fragmentation" issue ULTRAPLAN was pointing at:** two services use two different conventions (`/api/health` for orb, `/healthz` for FastAPI). The right industry-standard fix is `/healthz` for both. But making BOTH speak `/healthz` requires an orb-side change (Arcanea repo, separate session) — not a CockpitOrbFrame edit.

**Hold decision:** Do NOT edit `CockpitOrbFrame.tsx:21`. Log finding; queue the upstream "add `/healthz` alias to orb" task for the Arcanea session that handles 0.4.

**Mitigation in this Phase 0:** ship the FastAPI `/health` alias (action 0.2) so cognition layer becomes dual-spelled. That collapses HALF the fragmentation. Full collapse needs orb-side work.

---

## F3 — Three parallel Claude sessions shipped 2026-05-11

**Discovered while auditing git state:**
- Morning session: `39abd18`, `6352e48`, `6e26250`, `2827006` (three-tier-fleet-build handover)
- Afternoon session: `3326605`, `962657a`, `9485f33`, `d19762d`, `a555289` (durability sprint handover)
- Jarvis-grade session: 11 commits `5f6cc64..7d60b06` (jarvis-grade-naming handover)
- Tier 5 session (this prior conversation): `c1bddd1`, `437d41a`, `4a14f3e`
- Spec-trace + predictive layer session: `31b424f`, `09903ef`, `7a448f1`, `97eab1d`, `353e8b6`, `0a44e74`, `8dc5fc5`

That's ~26 commits 2026-05-11. Substrate is real-time multi-agent. Coordination is via the v76-v80 substrate symmetry harness (pre-commit hook), not narrative reconciliation.

**Operational impact:** stage by filename + commit immediately rule (per `memory/feedback_sibling_tab_stage_immediately.md`) applies during this Phase 0 push too. Don't leave loose edits.

---

## F4 — `sis-client.ts` confirms the silent-mock-fallback pattern ULTRAPLAN flagged

**Read evidence** (`private/local-command-center/apps/dashboard/lib/sis-client.ts:78-92`):

```typescript
export async function decisionList(filter?: { risk_level?: RiskLevel }): Promise<Decision[]> {
  try {
    const res = await fetch(`/api/sis/decisions${...}`, { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { decisions: Decision[] };
      return data.decisions;
    }
  } catch {
    /* fallthrough to mock */
  }
  return mockDecisions(filter?.risk_level);
}
```

**This is EXACTLY the pattern ULTRAPLAN Gap 5 cited.** Silent fallthrough to `mockDecisions` with no visible signal to the UI that data is fake. DataSourceBadge (0.3) is the right wrapper — it needs to be aware of which call path returned (live res.ok / mock fallback / cached stale) and pass that signal up to a small badge in each page.

Pattern for 0.3: each top-level fetcher should return `{ data, source: 'live' | 'mock' | 'stale', fetched_at }` instead of bare `data`. Pages render the badge from the same return value.

---

## F5 — `:7373/healthz` works but `main.py` doesn't define it inline

**Probe:** `:7373/healthz` returns 200.
**Grep:** `service/main.py` has zero matches for `healthz|health|api/utterance` at the regex level.

**Inference:** routes are registered elsewhere — likely a sub-router import in `service/`. Action 0.2 (add `/health` alias) requires finding the actual route registration before adding the alias. ~5 extra minutes of discovery before the 5-minute edit.

---

## F6 — DataSourceBadge has zero existing infra to compose with

**Grep across dashboard `components/`:** no `DataSourceBadge`, no `data-source` token, no `live | mock | stale` pattern.

**Implication:** 0.3 is a green-field build — type + component + utility helper that wraps `fetch`. Then surgical wiring across N routes. Estimate 3h not 4 if I keep the wrapper minimal.

---

## F7 — `_brain-cache.json` and `memory/knowledge-graph/index.jsonl` need to be checked before 0.5

Not yet read in this session. ULTRAPLAN cites `node_count: 40, edge_count: 1, cluster_count: 4` vs 520-atom corpus available. Will read before deciding 0.5 path: feed atom corpus into the KG index, or fix a broken intake step in `brain_watchdog.py`.
