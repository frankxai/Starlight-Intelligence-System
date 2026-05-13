# Handover — 2026-05-11 — Jarvis-Grade + Naming Reconciliation

> **Companion to** `HANDOVER-2026-05-11-three-tier-fleet-build.md` (parallel session, cost-plane + v01 track-a + Council doctrine + v8.0 Forge). This handover covers a different concurrent track.

## Naming Recommendation — 2026-05-11 Codex Addendum

**Decision:** use **Starlight** as the spoken operator name and **Starlight Orchestrator** as the formal active layer name. Keep **SIS** for the whole architecture/repo/protocol-backed intelligence system.

**Why:** `SIS` is structurally correct but awkward as a live operator identity. It names the system, not the thing Frank speaks to. `SIO` and `SISO` are worse aloud and create acronym friction. `Jarvis` accurately describes the category but is not native to Arcanea/Starlight and should remain a comparison, not the brand. `Starlight` already carries the voice, myth, and substrate. It is short enough for speech and strong enough for product.

**Recommended naming stack:**

| Surface | Name | Use |
|---|---|---|
| Full system / repo / substrate-backed stack | **Starlight Intelligence System** (`SIS`) | Architecture, docs, package/repo identity |
| Active routing brain | **Starlight Orchestrator** | Formal docs, dispatcher/router layer, governance |
| Spoken operator | **Starlight** | Voice commands, cockpit UI, daily use |
| Local UI/runtime | **Local Command Center** (`LCC`) | Machine cockpit, localhost/native app surface |
| Category benchmark | **Jarvis-grade** | Aspirational quality bar, not product name |

**Usage examples:**

- “Starlight, check GitHub.”
- “Starlight, dispatch Cursor on this branch.”
- “The Starlight Orchestrator routed Dependabot to GitHub ops.”
- “SIS defines the architecture; Starlight operates it.”

**Avoid:**

- `SIO` / `SISO` as spoken names.
- “Jarvis” as a product/operator name.
- Using `SIS` as the voice identity.

## What Landed (this session's 11 SIS commits + 1 Arcanea commit)

```
5f3c117f (arcanea)  feat(arcanea-voice): B3-lite — publish voice.turn from orb's native path
7d60b06             docs(naming): reconcile 6 parallel name forks into single substrate register
300f219             fix(jarvis-wave-2.2): /openclaw-audit findings — privacy + brain hardening + attestation
21e19d4             fix(jarvis-wave-2.1): review findings — harness map + load-assert + tightened test
107d09e             docs(spec): Wave 3 design stub — ambient + multi-modal
b71fada             docs(spec): B2 dispatcher canonicalization decision (3 options A/B/C)
5fd5da2             feat(jarvis-wave-2): B1 starlight dispatch harness env injection
6fca118             feat(jarvis-wave-2): A1+A2 memory_recall + Frank DNA from CLAUDE.md
8d8cc0d             feat(jarvis-wave-1): D2 + C1 voice.turn observability
5f6cc64             feat(cockpit): v0.2 subtree + PSTypeName install fix
d234ca3             spec(jarvis-grade): 4-wave design doc
```

All on `origin/main` (SIS) + `origin/main` (Arcanea).

## What Changed This Session

**Substrate-tier:**
- `NAMING.md` (new) — 6 parallel name fork register at substrate root
- `docs/superpowers/specs/2026-05-11-jarvis-grade-design.md` — 4-wave design
- `docs/superpowers/specs/2026-05-11-dispatcher-canonicalization-decision.md` — B2 fork parked
- `docs/superpowers/specs/2026-05-11-jarvis-wave-3-design.md` — C2 + C3 stubs
- `test/v80-voice-loop-coverage.test.ts` (new) — 6-test debt-ledger pattern, EXEMPT empty
- `src/cli.ts` — `cmdDispatch()` injects `STARLIGHT_HARNESS_PROMPT` env to arco

**Cockpit:**
- `cockpit/` subtree committed (44 files, v0.2 session-manifest layer)
- 6 Task Scheduler triggers registered + verified Ready
- PSTypeName fix on `cockpit/scripts/install.ps1`
- `cockpit/mcp/` registered as user-scope MCP, ✓ Connected

**Voice-operator (private, gitignored):**
- `service/cognition/system_prompt.py` — `_load_operator_dna()` regex-slices CLAUDE.md
- `service/text_mode.py` — `_enrich_with_memory()` with namespace privacy filter + `_emit()` voice.turn on all 9 return paths
- `service/brain_publisher.py` — `make_voice_turn()` event constructor
- `tests/test_voice_recall_privacy_filter.py` (new) — 9 regression tests, all pass

**Dashboard (private):**
- `lib/brain-events.ts` — `voice.turn` event type + parser case
- `components/VoiceTurnFeed.tsx` + `VoiceTurnStats` — glanceable feed
- `app/cockpit/voices/turns/page.tsx` — dedicated route
- `app/api/brain/inject/route.ts` — proxy rejection + optional shared secret

**Cross-repo (Arcanea, sibling):**
- `packages/arcanea-voice/src/server.mjs` — B3-lite voice.turn publisher in orb's native path

**Memory:**
- New entry `project_jarvis_grade_wave1_2026_05_11.md` (Wave 1+2+2.1+2.2 ship record)
- MEMORY.md indexed the new entry
- Cross-Repo Indexer state: 519 → 677 atoms across session
- `feedback_ps7_first_after_rebuild.md` updated with Store-package pwsh corollary
- `project_voice_operator_bridge_off.md` cross-referenced
- `project_memory_bus_v01.md` updated with 2026-05-11 re-registration evidence

## Current Blockers

| Blocker | Impact | Next move |
|---|---|---|
| **B2 dispatcher decision** | Substrate has 2 names for one capability (arco + starlight dispatch) | Frank picks A (promote) / B (adopt) / C (vendor) |
| **B3 full executor backend** | Voice agent thinks coherently but can't ACT — tool execution lives in orb (native), not voice-operator | Build executor backend in `service/cognition/router.py` so packets execute through voice-operator |
| **Brain SSE no persistence** | voice.turn events fire but disappear when dashboard tab closes | SQLite-back the SSE stream |
| **start-cockpit.ps1 in private/** | Launcher is gitignored + load-bearing — laptop rebuild silently breaks cockpit | Move launcher to public substrate with `.env`-injected private values |
| **arc doctor 12/13** | PROFILE path detection mismatch | Reconcile install vs doctor PROFILE paths |
| **OpenRouter Tier-1 JSON parse** | Intermittent partial-JSON responses; spoken_update recovers, packet=null | Tighten JSON-only enforcement on hot-tier prompt |
| **/yolo Hive W1 track** | I never read it; parallel session shipped substantial yolo code | Read + understand interaction with Jarvis-grade |
| **MEMORY.md pre-existing drift** | Auto-memory index has accumulated changes from prior sessions | `/memory-prune` overdue |

## Recommended Next Stack

1. **Read /yolo + cost-plane parallel-session work** — 12+ commits from another track landed during this session; understand interactions before next ship. WHY: avoid duplicating effort.
2. **Decide B2** — pick A/B/C on dispatcher. WHY: substrate has two names for one capability; resolving collapses the fork.
3. **Ship B3 full** — executor backend in voice-operator cognition router. WHY: biggest remaining UX gap. Voice agent currently thinks but can't act through the substrate path.
4. **Persist brain SSE** — SQLite ring-buffer for voice.turn events. WHY: observability that disappears with the dashboard tab doesn't compound; learning from utterance patterns requires durable log.
5. **`/memory-prune`** — MEMORY.md auto-index has drift. WHY: under 200-line truncation budget, prevents auto-load loss.
6. **Ship Wave 3 C2 (ambient)** — VAD + always-on STT with privacy boundary. WHY: closes the Iron-Man gap; foundation for proactive cognition.

## Verification Evidence

| Gate | Result |
|---|---|
| TypeScript build (`npm run build`) | ✓ clean |
| Substrate npm test | ✓ 578+ pass / 7 suites (v76/v77/v78/v79/v80/v80-voice-loop-coverage/core-regressions) |
| Voice-operator pytest | ✓ 543/543 pass (skipping 2 pre-existing flaky) |
| Privacy filter regression | ✓ 9/9 pass |
| v80-voice-loop-coverage | ✓ 6/6 pass, EXEMPT_VOICE_LOOP empty (goal state) |
| Pre-commit symmetry hook | ✓ Green on every commit |
| `arc doctor` cockpit | ✓ 12/13 PASS (1 cosmetic PROFILE nit) |
| All cockpit Task Scheduler triggers | ✓ Ready (6/6) |
| Memory Bus MCP | ✓ Connected user-scope |
| Cockpit MCP | ✓ Connected user-scope (8 tools) |
| Starlight Dreaming cron | ✓ Daily 06:00, manual run exit 0 |
| Cross-Repo Indexer | ✓ 677 atoms |
| Orb live response (post-B3-lite restart) | ✓ "Done. Today's shipments noted. Arcania updates reconciled." — Frank-context-aware |
| All 11 SIS commits pushed | ✓ origin/main |
| 1 Arcanea commit pushed | ✓ origin/main (arcanea-ai-app) |

**5 pressure-test passes ran:**
- `/starlight-board` × 2 (Wave 1 + Wave 2 — both PROCEED-with-REVISE; REVISEs applied)
- code-reviewer Agent × 1 (3 findings 95/85/85% confidence — all applied)
- silent-failure-hunter Agent × 1 (2 violations: 1 CRITICAL + 1 MEDIUM — both fixed)
- `/openclaw-audit` × 1 (REVISE: 3 findings — privacy filter + brain inject hardening + attestation — all applied)

---

## Session Wisdom

### Prompts That Worked

- **"go all lead for me suggest and take action"** — single phrase collapsed the brainstorming HARD-GATE design-approval pause and let one session ship 11 commits across 3 waves. The substitution of human-approval for autonomous board+review chains was the unlock. Pattern: when stakes are bounded + verification chains exist, explicit autonomy permission outperforms gated approval.

- **"how good is it all truly?"** — meta-reflective prompt produced the most honest assessment of the session. Yielded the foundation-coherence gap (parallel naming forks) that became NAMING.md. Pattern: ask the agent to grade its own work before shipping the next thing — surfaces the gaps the agent already half-knows.

- **"ensure excellence of all details wiring"** — converted "ship features" mode into "audit wiring + apply review findings" mode. Triggered the OpenClaw adversarial sweep that caught the privacy namespace leak. Pattern: name "wiring" specifically (not "quality" generically) to push agents into integration-tier thinking.

- **"go"** as terse continuation — when context is shared and trust is established, single-token continuation works better than re-explaining intent. Pattern: trust the conversation state; don't re-prompt the obvious.

### Technical Choices Validated

- **Load-from-canonical-source over duplication** — A2 originally duplicated `FRANK_DNA` text in `system_prompt.py`. Board REVISE flagged it; refactor to `_load_operator_dna()` regex-slicing `CLAUDE.md` was strictly better. Verified: single source of truth holds; module-load assertion catches drift. WHY: SIP § 5 sovereignty is *coded by architecture decisions*, not just declared in docs.

- **`EXEMPT_*` debt-ledger pattern (v77/v78/v79/v80)** — every substrate symmetry test ships with a Map for known-debt entries (reason + un-park trigger + ceiling). Wave 2's `EXEMPT_VOICE_LOOP` was added with 1 entry at Wave 1, closed naturally at Wave 2 A2 ship. Pattern works at scale. WHY: surfaces debt as code, not narrative; refactors can't silently revert a closure.

- **3-layer adversarial pressure-test stack** — board (design) + review-agents (implementation) + OpenClaw (security/privacy) each caught DIFFERENT bug classes. Board missed the regex bug; reviewer missed the namespace leak; OpenClaw missed the design choices. WHY: pressure-tests are not interchangeable; each layer probes a different surface. Run all three for high-stakes ships.

- **Cross-repo observability via shared event contract** — voice.turn event shape lives in SIS (`brain_publisher.py`) and arcanea-voice (`server.mjs`) — different language, different runtime, same contract. WHY: event-shape-as-substrate-contract beats library-as-substrate-contract for cross-repo work; payload schema is the API surface.

### Patterns Discovered

- **"Ship + review-async + fix" is faster than "ship-with-self-review"** — running `code-reviewer` + `silent-failure-hunter` as parallel background agents while doing other work surfaced 5 findings in ~2 min wall-clock. Self-review of the same code would have caught maybe 2. WHY: a second consciousness sees what the author cannot; parallel-async lets that consciousness be cheap.

- **"Built but not installed" is the highest-leverage gap class** — 3 of 11 originally-identified gaps were install/registration issues (cockpit v0.2 install, memory-bus MCP registration, dreaming-cron task). Fixing the install gap took minutes; building the feature would have taken hours. WHY: when teams keep shipping but rarely deploying, the gap between code and live state is where leverage concentrates.

- **Falsification experiments as deliverable artifacts** — when a memory entry made a contested claim (orb bridge ON vs OFF), the resolution shipped as a *single-utterance experiment Frank can run* rather than authoritative claim. Embedded in handover, vaults, and commit messages. WHY: durable verification beats authoritative claim; the experiment outlasts the agent's session.

- **Substrate-tier files encode invisible decisions** — `NAMING.md` made 6 architectural choices that previously lived only in Frank's head + commit graph archeology visible to fork users. Pattern: every substrate where a Frank-only decision exists should have a corresponding `<DOMAIN>.md` at substrate root encoding the choice + falsifier.

### What Was Built (Gratitude)

The voice agent that Frank speaks to today now knows who he is — not because it was told, but because it loads `## Frank DNA` from `CLAUDE.md` every cold start, with a runtime assertion that errors loudly if the load degrades. The dashboard sees every voice turn including failures because we wrapped all 9 return paths with `voice.turn` events, then extended the same contract across the repo boundary into Arcanea's orb when /openclaw-audit revealed the observability asymmetry. The substrate now carries a one-page register of every name fork in active use — what was previously archaeology is now legible.

The most quietly important thing built: a culture-of-pressure-testing that we executed 5 times in one session — board, board, code-reviewer, silent-failure-hunter, OpenClaw — and applied every finding before shipping. The 5th layer (OpenClaw) caught the privacy namespace leak the first 4 missed. Without that final sweep, sensitive voice captures could have resurfaced in unrelated CONTEXT blocks. The discipline of running every layer is what kept the ship clean. That discipline now lives in handover wisdom, not just in this Claude's working memory.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.1
- Layers used: [file-contract, attestation, sovereignty]
- Tier: operational (session handover artifact)
- Generated: 2026-05-11
- Companion: `HANDOVER-2026-05-11-three-tier-fleet-build.md` (parallel session)
