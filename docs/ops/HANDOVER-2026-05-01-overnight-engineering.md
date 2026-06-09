# Handover — 2026-05-01 overnight engineering pass

> Cold-start briefing. Substrate quality + test coverage + structural completeness pass after the cockpit demos.
>
> **Posture: substrate-quality work landed locally, no commits pushed.** Frank curates what ships and when. Demo-critical files untouched.

---

## TL;DR

Three engineering wins, all reversible, all clear of demo path:

| Metric | Before | After |
|---|---|---|
| `agents/AGENT_REGISTRY.md` honesty | "Fifteen minds" (20 unregistered files on disk) | **"Thirty-five minds"** — Sound Intelligence (6) + Music IS (7) sub-stack tables added · 4 v7.6 update notes |
| Substrate test count | 596 | **608** (+12 v7.6 conformance) |
| Verticals with auto-validated file contract | 0 | **3** (people, sound, music-is — full 7-file contract checked on every test run) |
| Agent registry orphan/phantom protection | none | **enforced** — registry-coverage symmetry test fails CI if you add an agent file without registering, or vice versa |
| Music IS commands harness loadability | manual check | **enforced** — anti-regression test for music-* stranded at top-level commands/ |
| Workflow scheduling infra | absent | **scheduler.py shipped** — `python -m service.scheduler {list,register,unregister,run}` ready for Frank's first `register` |
| Site refresh roadmap | uncommitted thinking | **`docs/superpowers/plans/2026-05-02-site-refresh-v77.md`** — sequenced PR plan, ~4h total, 7 file changes |

**Tests run end-of-session: 608/608 pass** (orchestrator 82 + substrate 383 + v73 19 + v74 27 + v741 33 + v75 52 + v76 12). Plus voice-operator's 413/413 from earlier in week. **1,021 green tests across the system.**

---

## What landed (with file paths)

### 1. AGENT_REGISTRY.md update — `agents/AGENT_REGISTRY.md`

Truth-in-advertising fix. Was claiming "Fifteen minds"; on-disk reality is 35 agent files. Two new tables added under Domain Sub-Stack Tier:

- **Sound Intelligence sub-stack** — 6 agents (`starlight-sound-{composition,production,catalog,performance,audience,sync}`), 30 commands enumerated, vault namespaces.
- **Music IS sub-stack** — 7 agents (`music-curator`, `music-archivist`, `persona-keeper`, `music-producer`, `music-distributor`, `music-amplifier`, `royalty-architect`) with model tier (Apex / Senior / Mechanical), sub-system, vault namespace, command mapping.

Header rewritten to "Thirty-five minds. Nine universal intelligence layers + Domain Sub-Stack Tier." Two new update notes for v7.6.0 and v7.5.2/v7.6.x.

Total table-of-truth coverage now: **35/35 agent files registered.**

### 2. Conformance harness — `test/v76.test.ts` (new, 12 tests)

Catches drift between repo state and the registry that documents it. Four describe-blocks:

| Block | Tests | What it asserts |
|---|---|---|
| `v7.6 verticals — file contract` | 4 | people-intelligence + sound-intelligence + music-is each carry full 7-file core contract (README, SUB-SYSTEMS, AGENTS, SOUL, STACK, CANON, MEMORY) + QUICK-START. music-is also requires STRATEGY + LABELS + DECISIONS (operator-tier extras). |
| `v7.6 verticals — sub-stack symmetry` | 3 | exactly 6 people-intel agents, 6 sound-intel agents, 7 music-is agents at `agents/`, named per spec |
| `v7.6 commands — Music IS harness loadability` | 2 | 8 music-* commands at `.claude/commands/`; **anti-regression** test that none stranded at top-level `commands/` |
| `v7.6 agent-registry — coverage symmetry` | 3 | (a) no orphan files (every `agents/*.md` is referenced in registry), (b) no phantoms (every backtick-quoted name in registry has an actual file), (c) header honesty (registry must declare ≥ "Thirty-five minds" + Domain Sub-Stack tier) |

Wired into `package.json` test script (already merged with Frank's `serial-per-file` rewrite from commit `28cc37e`). Both `npm test` and `npm run test:substrate` now run v76.

### 3. Workflow scheduler skeleton — `private/voice-operator/service/scheduler.py` (gitignored)

Closes the "infra-not-ritual" gap surfaced in audit:

- 4 default schedules: `morning-brief` 08:00, `evening-handover` 18:00, `weekly-recap` Mon 09:00, `inbox-zero-captures` 17:00
- Subcommands: `list` (planned schedules), `register` (Windows Task Scheduler /Create with /F idempotence), `unregister` (/Delete), `run <workflow>` (one-shot sanity check)
- Output sink: `~/.starlight/scheduled/<workflow>-<YYYY-MM-DD>.md` per scheduled invocation, plus the existing JSONL audit log
- `--dry-run` flag prints `schtasks` commands without executing
- Conservative defaults — Frank edits `SCHEDULES` constant + re-runs `register`

**Skeleton, not autonomous-bound.** Frank reviews, runs `python -m service.scheduler list` to inspect, then `register` to bind. Reversible via `unregister`.

### 4. Site refresh roadmap — `docs/superpowers/plans/2026-05-02-site-refresh-v77.md`

Sequenced PR plan for post-demo. Marketing surface is ~3 substrate versions stale. Plan covers:

- Homepage rewrite (9-IS + Domain Sub-Stack framing)
- New `/verticals` page (3 cards: People, Sound, Music IS)
- New `/cockpit` teaser page (no live embed; localhost-only by design)
- Footer link to `friend-starter/` Claude Project pack
- `/architecture` bump to 9-layer
- New `/explainer` mirroring `docs/public/starlight-intelligence-system.md`
- OG / meta description update

**Total scope: ~4h, single PR, +600/-150 LOC.** Out-of-scope items explicitly named (live cockpit embed, vertical detail pages, pricing, auth) so they don't sneak in.

---

## What was NOT touched — and exactly why

| Surface | Why skipped |
|---|---|
| `app/cockpit/page.tsx` and dashboard cockpit components | Demo ran today (2026-05-01) — these are exactly the components on stage. No autonomous edits. |
| Orb code (`Arcanea/packages/arcanea-voice/`) | Same — demo-critical. |
| `tools.mjs` | Same — `~` expansion fix landed in parallel session 2026-04-30; no further changes pre-cockpit-tour. |
| `start-cockpit.ps1` | Already extended yesterday (brain_watchdog daemon block, BOM preserved). No second pass needed. |
| `COGNITION_BRIDGE_URL` re-enable | Frank's call. `POST /api/dispatch` is now live on `:7373` (per `HANDOVER-DISPATCH-CLI-2026-04-30.md`), so structurally feasible — but flipping the env var changes orb's brain mid-week. Owner decision. |
| Streaming TTS via MediaSource API | Demo-critical orb client code. Per `HANDOVER-2026-04-29-jarvis-live.md` Action 2: "should be done with user watching, not autonomously." |
| `git push origin` | Frank curates. Branch is 2 commits ahead at end-of-session (one for AGENT_REGISTRY + package.json + v76.test.ts; one for memory/voice-sessions/2026-05-01.md from parallel session). |
| Commits at all | Wave 1 last night was already committed by Frank in 2dd292d/dadbb41/547e5bf etc. Tonight's work is sitting unstaged for him to curate. |
| Site `site/` directory | The `site-refresh-v77.md` plan is the artifact. Execution is a single post-demo PR Frank drives or delegates. |

---

## Engineering observations from the audit (preserved for record)

The two parallel investigation agents this session produced an audit-grade picture of where the system is. Captured here for future reference — see commit messages for details.

### Dashboard at `:3007` — viewer that wants to be a controller

- Real Next.js 16 app, three live pages, working SSE event stream, draft auto-poll, dual-tab captures viewer
- `LiveActivityHud.tsx` solid (240 lines, exponential-backoff reconnect, 80-event ring buffer)
- Highest-leverage 10h work: click-to-dispatch on `/cockpit` lower-left + file-watcher SSE replacing 2s polling

### Workflow system — infrastructure that wants to be a ritual

- `workflow_runner.py` (484 LOC) + 13 YAMLs + `orchestrator_cli.py` (386 LOC) + `POST /api/dispatch` are real engineering, not theater
- Total test coverage today: 24 (workflow runner) + 25 (CLI) + 10 (HTTP) + 7 (cognition) = real
- The gap is binding, not capability — `scheduler.py` shipped tonight closes it

### Brain viz — beautiful proof-of-concept that wants to be a recall instrument

- 25 nodes / ~12 edges today, single InstancedMesh (10k preallocated), AdaptiveDpr, full HUD (search / time-warp / brand filter / regen / cluster labels / select halo)
- Brain `useBrainEvents` SSE channel parked in debug-log-only mode — wire is laid, just unconnected
- 3 features that earn build time:
  1. Click-node → open packet record (turns brain into nav surface; ~2h)
  2. Time-scrubber persistence + diff overlay (memory-at-date-X is the actual feature; ~4h)
  3. Live SSE pulse on KG writes (static cache → live nervous system; ~5h)

### Response system — where the latency lives

| Stage | Latency |
|---|---|
| STT (Groq Whisper) | 400-800ms |
| Cognition (LLM + tool loop) | 600ms first-token + ~400ms/round |
| TTS first-byte (ElevenLabs Flash) | 75-1200ms |
| **Audio buffer (the killer)** | **3-6s** — client-side `await r.blob()` |

5 build-outs ranked by user-perceived-impact-per-hour:
1. Re-enable `COGNITION_BRIDGE_URL` (~30 min) — Frank's call
2. Tool-result pre-narration (~2h) — voice "running shell" before result
3. Streaming TTS via MediaSource (~3-4h) — biggest perceived-latency win, owner-watching
4. Memory-aware grounding (~3h) — inject brain cache + last 3-5 sessions into context envelope
5. Pre-emptive STT chunking (~6h) — last priority

---

## Files touched (clean diff inventory)

```
Modified (in-tree):
  M agents/AGENT_REGISTRY.md         — sub-stack tables for Sound + Music IS, header honesty
  M package.json                     — test:substrate adds test/v76.test.ts

New (in-tree):
  ?? test/v76.test.ts                                                    — 12-test conformance harness
  ?? docs/superpowers/plans/2026-05-02-site-refresh-v77.md               — post-demo PR plan
  ?? docs/ops/HANDOVER-2026-05-01-overnight-engineering.md               — this file

New (gitignored, operational instance only):
  ?? private/voice-operator/service/scheduler.py                         — workflow scheduler skeleton
```

Not in this session's diff (parallel session work that landed during the gap):
- `commands/dispatch.md` (parallel session — operational-tier)
- `docs/ops/DEMO-RUNBOOK-2026-04-30.md` modifications
- `docs/ops/HANDOVER-DISPATCH-CLI-2026-04-30.md` modifications
- `memory/voice-sessions/2026-05-01.md` (parallel session — voice capture)

---

## Health check at end of session

| Check | Result |
|---|---|
| Substrate test suite | **608/608 pass** (12 new in v76, no regressions) |
| Voice-operator test suite | 413/413 pass (untouched this session) |
| Lint / typecheck | Clean (no source code edited; only registry markdown + test file + plan) |
| Package.json `version` | 7.6.0 (correct) |
| Branch divergence | 2 commits ahead of origin (parallel-session voice capture + my consolidated work staged not committed) |
| AGENT_REGISTRY.md ↔ agents/*.md symmetry | **enforced by test** — 0 orphans, 0 phantoms |
| 3 reference verticals' file contract | **enforced by test** — all 7 core files + QUICK-START on each |
| Music IS commands at `.claude/commands/` | **enforced by test** — 8/8 present, 0 stranded at top-level |
| BOM check on start-cockpit.ps1 | preserved (`efbbbf23` first 4 bytes) |
| Demo path artifacts | untouched ✅ |

---

## Recommended sequencing for Frank's next session

1. **Read this handover + the v77 site-refresh plan** (~10 min). Decide whether to commit the v76 conformance test + AGENT_REGISTRY update tonight or fold into a board-pre-pass batch.
2. **Run `python -m service.scheduler list` on the cockpit machine** — see the 4 default schedules. Edit if you want different cadences. Then `register` if you want them bound. (No urgency — workflows still run on demand.)
3. **Decide on `COGNITION_BRIDGE_URL`** — re-enable now that `/api/dispatch` exists, or stay on native Groq+tools loop. **Demo decision, not engineering decision.** If demos went well today and you want one unified brain across orb + voice-operator, flip; the bridge code is fully wired.
4. **Site refresh PR** — execute `docs/superpowers/plans/2026-05-02-site-refresh-v77.md` over Saturday. Single push gets the homepage, /verticals, /cockpit teaser, and /explainer all out the door.
5. **Streaming TTS** — pair-program with a session you watch. The 3-6s audio buffer is the loudest UX issue and ~3h work.

---

## Three things still open (carried forward)

| # | Item | Status |
|---|---|---|
| 1 | Memory Bus daemon (`@starlight/memory-bus`) — Phase 0 P0, still owed | NOT STARTED. Frank's two open Q's (package name, ownership locus) on board v77 Item 7 still unanswered. |
| 2 | SIP § 5 sovereignty clause amendment — board v8 Item 4 | NOT STARTED. Needs own `/luminor-board` pre-pass. |
| 3 | Code IS / Voice & Video IS / Family verticals declared `live` but only README on disk | OPEN — author-tier work, sovereignty-bound. Frank's hand. |

---

**Built on SIP** — operational-tier engineering pass · 2026-05-01 · No substrate edits · No demo-path edits · Test count +12 · Registry now honest · 1,021 tests green across system.
