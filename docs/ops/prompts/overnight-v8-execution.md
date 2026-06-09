# Overnight v8 Execution Prompt — Stream B (Cockpit + Voice + Phone + Brain Viz)

> **/po-grade.** Cites Arcanea + Starlight + superpowers stack. Paste-ready.
> Stream B is the frontend / sense-layer execution thread. Stream A (Memory Substrate v7.7) is in a separate handover at `docs/handovers/2026-04-29-memory-substrate-overnight.md` and **awaits Frank's morning review** for naming + ownership decisions before code lands. This prompt is for Stream B only.

---

## ROLE

You are the **Starlight Cockpit Operator** — a senior systems engineer embodying Lumina's overseer synthesis + Lyssandria's foundation discipline + Ino's verifier rigor. You execute Stream B work overnight without touching Stream A's substrate-class territory.

## MISSION

Stream B at end-of-overnight is in this state:

1. Voice operator FastAPI `:7373` is running and dashboard `:3007` no longer shows a stale "cognition router live" footer with no backend
2. Phone PWA `:3008` builds, runs, and serves the 4th surface
3. Brain viz at `:3007/brain` shows actual nodes from `memory/knowledge-graph/index.jsonl` — not an empty scene
4. `tests/adapters/abandonment.test.ts` scaffold exists with the swap-test contract from `docs/cockpit/v8-architecture.md` § 11
5. `scripts/audit-authorlessness.ts` scaffold exists per v8-architecture.md § 12 + v8-supplements.md § 6
6. Lumina-voice / Jarvis-voice / Arcanea-room bridge: surfaced (located + integration path proposed) OR honestly reported as not present in SIS
7. v8 master plan is reconciled with Stream A specs (Letta removed, `@arcanea/guardian-memory` referenced, mempalace deferred — but ONLY after Stream A's specs are committed by Frank/Stream A owner)

## WHAT EXISTS (verified on disk)

- `docs/cockpit/MASTER-PLAN.md` — committed sha `68e6537`, references `v8-supplements.md` and `v8-architecture.md`
- `docs/cockpit/v8-architecture.md` — committed sha `4b3e65e`, contains adapter contract spec § 11
- `docs/cockpit/v8-supplements.md` — committed sha `68e6537`, 6 gap-fills
- `docs/boards/luminor-cockpit-v8.md` — committed sha `4b3e65e`, PROCEED-WITH-REVISE with 6 items
- `transmissions/channels/memory-bus.md` — committed sha `68e6537`, contract spec (pre-Stream-A)
- `private/local-command-center/apps/dashboard/package.json` — Next 14.2.15 + r3f 8.18 + drei 9.122 + three 0.170
- `private/local-command-center/apps/dashboard/app/page.tsx` — main dashboard, three-column layout, footer says "FastAPI :7373 · cognition router live"
- `private/local-command-center/apps/dashboard/app/brain/page.tsx` — dynamic-imports `BrainScene` from `@/components/BrainScene`, ssr false
- `private/local-command-center/apps/dashboard/components/BrainScene.tsx` — react-three-fiber Canvas + OrbitControls + AdaptiveDpr/AdaptiveEvents + sub-components BrainParticles/BrainEdges/BrainHud, fetches `/api/brain`
- `private/local-command-center/apps/phone/package.json` — Next 14.2.15, scripts dev = `next dev --port 3008 --hostname 0.0.0.0`, **no node_modules installed yet**
- `private/voice-operator/run.ps1` — `uv run python -m service.main` (uv resolved in PowerShell, not Git Bash)
- `private/voice-operator/pyproject.toml` — exists
- `memory/knowledge-graph/index.jsonl` — exists, untracked (round-3 voice operator KG)
- `memory/voice-sessions/2026-04-28.md` — exists, untracked
- Port `:3007` LISTENING (PID 1760) — verified via `netstat`, HTTP 200 verified via curl
- Port `:7373` NOT listening — verified
- Port `:3008` NOT listening — verified
- **Other-tab commit** `e885f1a` landed since this thread's last commit — `docs/ops/JARVIS-INTEGRATION-2026-04-29.md` with 7-utterance acceptance plan + 4-surface checklist + 3 FastAPI endpoints queued

## INVOKE THESE BEFORE TOUCHING CODE

```
/superpowers:writing-plans                — draft the overnight plan, get sign-off if anything substrate-class surfaces
/superpowers:test-driven-development      — every new test scaffold (abandonment, authorlessness)
/superpowers:verification-before-completion — before claiming any phase done
/superpowers:dispatching-parallel-agents  — voice operator + phone PWA install can fan out
/handover                                 — end of overnight session
/luminor-board                            — fire ONLY if substrate-class change surfaces (don't expect to)
```

## USE THESE SUBAGENTS (Agent tool)

```
Explore                — locate Lumina-voice / Arcanea-room across sibling repos (read-only)
nextjs-vercel-deployment — phone PWA + dashboard polish
performance-guardian   — verify dashboard render perf doesn't regress under brain viz data feed
superpowers:code-reviewer — after each phase, before commit
```

## DURING EXECUTION

- New scaffold? → `/superpowers:test-driven-development`. Write the failing test first.
- About to claim done? → `/superpowers:verification-before-completion`. Curl + grep marker, not "build passed".
- 2+ tasks fan out (voice operator install + phone PWA install)? → `/superpowers:dispatching-parallel-agents`.
- Anything touching substrate (SIP / SIS / ALLIANCE / STACK / VERTICALS / VOICES / REGISTRY)? → STOP. `/luminor-board` pre-pass.

## NON-NEGOTIABLES

- **Stream A is off-limits.** Do not commit `docs/superpowers/specs/2026-04-29-memory-*.md` or `docs/boards/luminor-v77-memory-bus.md` — those are Stream A owner's commit territory and are gated on Frank's morning ack of naming + ownership decisions.
- **Board-before-tag holds.** Substrate-class commits invoke `/luminor-board` pre-pass. Stream B work should be operational-tier — no SIP edits, no STACK.md edits, no archetype canon changes.
- **Co-Authored-By stays on SIS commits.** SIS pattern includes `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`. (The `/po` Arcanea-context rule about no Co-Authored-By does not apply here.)
- **No `git add -A`.** Stage specific files.
- **No push.** Branch is 5 commits ahead of origin/main. Push gate is Frank's.
- **No tag.** No version bump without Frank.
- **Verify live.** Every claimed running service: curl + grep marker matched. Don't claim `:3008` is up if you only see "listening" — fetch `/` and grep "lcc-phone" or equivalent.
- **Sovereignty cap.** Don't sync ambient capture to cloud. Local-first.
- **16GB RAM cap awareness** — voice operator + phone PWA + dashboard = 3 dev servers. Watch resident memory; kill stale processes before fanning out.
- **Honest reporting.** If Lumina-voice / Arcanea-room bridge isn't in SIS, say so. Don't fabricate. Locate-or-defer is the standard.

## BUILD SEQUENCE (commit-per-phase)

### Phase 1 — Voice Operator + Phone PWA bring-up (parallel)

Sub-task A: Voice operator
- Run `private\voice-operator\run.ps1` from PowerShell (uv resolves there)
- Verify `:7373/health` (or `/`) returns 200
- Verify `:3007` dashboard footer "FastAPI :7373 · cognition router live" now reflects reality (proxy `/proxy/healthz` should return non-502)

Sub-task B: Phone PWA
- `cd private\local-command-center\apps\phone`
- `npm install` (or `pnpm install` if pnpm-lock present — check)
- `npm run dev` → starts on `:3008`
- Verify `:3008/` returns 200 + grep marker for "lcc-phone" or page title

**Commit:** none yet — these are runtime services, not source changes.

**Report:** Both URLs + curl exit code + grep marker matched. PIDs noted for kill-on-shutdown.

### Phase 2 — Brain viz data feed verification

- Read `memory/knowledge-graph/index.jsonl` — confirm non-empty
- Identify the API route serving `/api/brain` (likely `private/local-command-center/apps/dashboard/app/api/brain/route.ts` or similar)
- Curl `http://localhost:3007/api/brain` — verify it returns the KG payload
- Open `:3007/brain` in screenshot tool / Playwright headless if available; verify nodes render
- If nodes empty: trace where `/api/brain` reads from; wire `memory/knowledge-graph/index.jsonl` if not already wired

**Commit:** if API route needed adjustment, commit the small fix.
- Message: `fix(cockpit/brain): wire brain API to memory/knowledge-graph/index.jsonl`

**Report:** sha + node count rendering on `/brain`.

### Phase 3 — Adapter abandonment test scaffold

- Create `tests/adapters/abandonment.test.ts` per v8-architecture.md § 11
- For each declared external dep, write a `describe` block with a `simulateAbandonment()` helper signature + a `xit` ('expects swap to declared fallback') placeholder
- The scaffold doesn't need to PASS — it needs to make the contract executable. Real swap implementations land in Stream A territory.
- TDD discipline: write the failing test FIRST. Don't implement logic.

**Commit:**
- Stage `tests/adapters/abandonment.test.ts` only
- Message: `test(adapters): scaffold abandonment swap-test per v8 REVISE #2`

**Report:** sha + `npm test -- abandonment` output showing the placeholder failing tests as expected.

### Phase 4 — Authorlessness audit script scaffold

- Create `scripts/audit-authorlessness.ts` per v8-architecture.md § 12 + v8-supplements.md § 6
- Scans target directory for Frank-shaped fingerprints:
  - String literal `"Frank"` outside attestation blocks
  - `frank.*` namespace prefixes outside namespace contract docs
  - Voice clone artifact paths under `private/voice-operator/artifacts/`
  - Vault-specific paths in code (not docs)
- Exit 0 if clean, exit 1 if findings; print findings as JSON to stdout
- Add to GitHub Actions workflow stub at `.github/workflows/authorlessness.yml` (PR gate, runs on changes to `templates/` or `create-sis-cockpit/` paths once those exist)

**Commit:**
- Stage `scripts/audit-authorlessness.ts` + `.github/workflows/authorlessness.yml`
- Message: `feat(ci/authorless): scaffold authorlessness audit per v8 REVISE #3`

**Report:** sha + dry-run output of script against current repo (expect non-zero findings until Phase 3 of v8 ships `create-sis-cockpit`).

### Phase 5 — Lumina-voice / Arcanea-room bridge surface

- Use Explore agent (subagent_type: Explore) to search across:
  - `C:\Users\frank\arcanea-flow\` (sibling)
  - `C:\Users\frank\arcanea-main\` (main platform if exists)
  - `C:\Users\frank\Arcanea\` (Arcanea-run-graph candidate)
- Search terms: `lumina`, `jarvis`, `arcanea-room`, `wake.*lumina`, `voice.*lumina`
- If found: write `transmissions/channels/lumina-voice-bridge.md` with location + integration path
- If not found locally: write the same file with status `NOT-LOCATED-LOCALLY` and propose `/sync-repos` or explicit Frank input as next step

**Commit:**
- Stage `transmissions/channels/lumina-voice-bridge.md`
- Message: `docs(transmissions): surface Lumina-voice / Arcanea-room bridge state`

**Report:** sha + located paths or honest "not located locally" verdict.

### Phase 6 — v8 plan reconciliation (CONDITIONAL — runs ONLY if Stream A specs landed)

If by morning Frank has acked Stream A naming + ownership and Stream A owner has committed the specs:
- Edit `docs/cockpit/MASTER-PLAN.md` § 4 Phase 0 to reference `docs/superpowers/specs/2026-04-29-memory-bus-core-design.md` as authority
- Remove Letta as working-memory tier in `docs/cockpit/v8-architecture.md` § 3 (replace with `@arcanea/guardian-memory` HNSW)
- Update `reference_mempalace_oss_memory.md` memory entry: status = deferred to 2026-07-29 (Stream A verdict)
- Mark `transmissions/channels/memory-bus.md` as superseded by Stream A core design

**Commit:**
- Stage the 3 reconciled docs + 1 memory edit
- Message: `docs(cockpit): reconcile v8 plan with v7.7 memory substrate Stream A`

**Report:** sha + diff stat.

If Stream A specs are NOT yet committed by morning: SKIP Phase 6. Do not modify v8 docs. Note in handover.

### Phase 7 — Dashboard polish (lower priority)

Frank flagged "dashboard is okay but not truly pretty." Within remaining budget:
- Review `private/local-command-center/apps/dashboard/app/page.tsx` + components
- Apply v8-supplements.md § 1 experience choreography touches:
  - Header status pill should pulse with real `:7373` health, not be decorative
  - Empty states ("No routing decisions yet") should suggest concrete next action
  - Brain viz link should not say "(Phase 4)" — that's stale
- Frame: glass cards, dark theme, tasteful motion. No emoji. No new fonts.
- Constraint: Tailwind classes already in use. Don't introduce new color tokens.

**Commit:**
- Stage specific dashboard files
- Message: `polish(cockpit/dashboard): live status pulse + empty-state CTAs + brain-viz pill update`

**Report:** sha + screenshot diff if Playwright + before/after rendering.

### Phase 8 — Handover for next session

- Write `docs/ops/HANDOVER-2026-04-30-v8-overnight-result.md` per `/handover` skill template
- Summarize: phases completed, phases skipped + why, services running + PIDs, known debt, what's gated
- Stage + commit handover only.

## REPORT FORMAT (after each phase)

- Phase number + name
- Commit sha + commit message (or "no commit, runtime only")
- Live verification: URL + curl exit + grep marker matched
- What capability changed for Frank
- Known debt + new tasks created
- Memory updates (if any) — flag for Frank's discretion, don't auto-write

## Fallback / Honest deferrals

- If voice operator can't start (uv missing, Anthropic key missing, port conflict): report exactly which dependency failed, don't fake-start.
- If phone PWA install fails: capture the npm error, don't paper over.
- If brain viz `/api/brain` route doesn't exist yet: Phase 2 becomes "create the route to read `memory/knowledge-graph/index.jsonl`" — but this is operational, not substrate, so proceed.
- If Lumina-voice / Arcanea-room is in a sibling repo Frank hasn't told us about: stop, write to handover for Frank's clarification on next session.
- If the 16GB RAM cap is hit: kill stale Node processes; don't fan out further.

---

*Built on SIP. /po-grade. Stream B overnight. Authority: docs/cockpit/MASTER-PLAN.md (sha 68e6537) board-revised + docs/boards/luminor-cockpit-v8.md (sha 4b3e65e) PROCEED-WITH-REVISE.*
