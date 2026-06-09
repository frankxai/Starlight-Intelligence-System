# Jarvis-Grade — Voice + Context + Real-Time + Automation Design

**Date:** 2026-05-11
**Tier:** substrate (touches voice-loop architecture, cognition router contract, context envelope, install layer)
**Author:** Claude Opus 4.7 (1M ctx) — autonomous lead per `feedback_lead_with_authority`
**Governance:** `/starlight-board` pre-pass required before commit per CLAUDE.md substrate gate
**Built on SIP** — operational-tier execution of substrate-tier policy moves

---

## Problem statement

The voice agent Frank interacts with via the `/cockpit` orb responds generically — it doesn't carry his context, his repos, his active work. The rich substrate underneath (voice-operator with cognition router, memory router, 4-CLI dispatch, brain publisher, mempalace) is **bypassed**. The cockpit auto-rehydration / auto-snapshot system is **built but not installed**. The cross-repo memory corpus is **8 days stale**. End-to-end latency is **unmeasured**.

This is not a "build new features" problem. It is a "wire what's built" problem — three of the eleven gaps are install/registration gaps, not engineering gaps.

## Architectural finding (the key insight)

Two voice paths exist concurrently and they don't compose:

| Path | Status | What Frank gets |
|---|---|---|
| **Cockpit ORB** (Next.js at `/cockpit`, port 3007) — native Groq + native function calls | LIVE (used 2026-05-10 voice session) | Generic responses, no memory, no Frank DNA |
| **Voice Operator service** (`private/voice-operator/service/`, 50+ Python modules — cognition router, memory router, 4-CLI dispatch, brain publisher, mempalace, system prompt composer) | BUILT, BRIDGE OFF since 2026-04-30 | Would carry full context if wired |

Bridge disabled by `COGNITION_BRIDGE_URL=off` because "voice-operator router has no tool executor backend" (memory `project_voice_operator_bridge_off`). Result: the cockpit orb runs a thin Groq wrapper while a substantial substrate sits idle.

**This finding reframes the work:** the strategic move is not building new context-loading machinery. It is **plumbing the existing substrate into the orb** (or porting the orb's tool-executor into voice-operator's router). Wave 2 (cluster B) is where this fight happens.

## Success criteria (falsifiable, from earlier scope conversation)

| # | Criterion | How to verify |
|---|---|---|
| SC1 | Voice utterance → response carries Frank DNA + project context | Voice session log shows non-generic reply that references a specific project / decision / commit |
| SC2 | Cross-Repo Indexer recall on Frank-specific query returns ≥3 hits across ≥3 repos | `python -m indexer --probe "frank repos"` returns multi-repo results |
| SC3 | CLI dispatch packet includes `frank_context` block | `core/orchestrator/audit-log.jsonl` shows the block on a fresh dispatch |
| SC4 | First-token-of-TTS audio < 1500ms from end-of-utterance | Cockpit event ring contains `voice.t_first_audio_ms` < 1500 on 3 consecutive utterances |
| SC5 | Cockpit auto-rehydrate fires on next login | Reboot → log in → Windows Terminal opens with prior cockpit session |
| SC6 | Dreaming cron observable | `memory/CONSOLIDATION_LOG.md` receives a daily receipt at 06:00 |
| SC7 | Voice-loop context-load tested in v80 symmetry harness | `npm test` shows `v80-voice-context.test.ts` green |

## Wave sequencing

### Wave 1 — Wire what's built (this session, low blast radius)

| # | Gap | Action | Verify | Time |
|---|---|---|---|---|
| 1.1 | D1 | `pwsh ./cockpit/scripts/install.ps1` — registers 6 Task Scheduler triggers, wires SessionStart/Stop hooks | `arc doctor` PASS; 6 tasks in `Get-ScheduledTask "Cockpit-*"` | 2 min |
| 1.2 | A3 | Re-run Cross-Repo Indexer to refresh corpus from 2026-05-03 → today | `mempalace atom_count` increase; recall probe returns hits dated >2026-05-03 | 5 min |
| 1.3 | D2 | Extend v80 platform-prompt symmetry harness with a **coverage-gap assertion** — fails if `voice-loop` is not in the platform list, regardless of orb location. Forces Wave 2 to land the actual system-prompt symmetry. | New `test/v80-voice-loop-coverage.test.ts` red (intentionally — surfaces the gap as a debt-ledger entry, matches v79 EXEMPT_VERTICALS pattern) | 15 min |
| 1.4 | C1 | Instrument cockpit event ring with `voice.t_first_audio_ms` + `voice.t_end_utterance` deltas | First metric appears in event ring within 3 voice utterances | 30 min |

### Wave 2 — Bridge orb to substrate (next session, substrate-touching)

| # | Gap | Action | Verify |
|---|---|---|---|
| 2.1 | B3 | Build tool-executor backend in voice-operator router. Port the orb's native function-call surface into `service/cognition/router.py` tool-exec hook. Re-enable `COGNITION_BRIDGE_URL` | Voice utterance routed through voice-operator returns coherent response |
| 2.2 | A1 | Voice operator's pipeline calls `memory_recall` (top-k=5) and injects into system prompt before cognition dispatch | Voice session log shows recalled-atom references |
| 2.3 | A2 | `service/cognition/system_prompt.py` composes from Frank DNA + Brand Kit + last 3 voice sessions + active project | System prompt diff shows the composition |
| 2.4 | B1 | `starlight dispatch` loads per-harness `system-prompt.md` + `mcp-config.json` + `allowlisted-tools.md` into target CLI invocation | Codex/Gemini/OpenCode dispatches in audit-log carry harness policy |
| 2.5 | B2 | **USER-DECISION** — promote `arco` → `@starlight/orchestrator` OR formally adopt arco as the canonical SIS dispatcher dependency. Both are valid; the call is brand-level (does Starlight own the dispatcher name or does it compose Arcanea's?). Defer to Frank in Wave 2 kickoff | One canonical dispatcher named in `core/orchestrator/STATUS.md`; no second |

### Wave 3 — Real-time presence (separate ship, biggest engineering)

| # | Gap | Action | Verify |
|---|---|---|---|
| 3.1 | C2 | Ambient listening — always-on STT with VAD gate; clap-activation becomes "explicit-mode" trigger, not the only one | Microphone stream active in background; utterances captured without clap |
| 3.2 | C3 | Multi-modal context envelope — screen capture (active window title + URL only, NOT pixels), recent commits, calendar (Google Cal MCP), open files | Voice agent reply references "I see you're in `<file>`" or "your 10am with X" |

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| Wave 1 cockpit install modifies `~/.claude/settings.json` | `install.ps1` backs up the file first per HANDOVER doc; `uninstall.ps1` exists |
| Indexer refresh writes 100s of atoms — could slow recall during run | Idempotent via sidecar state; runs in <5s for full corpus per memory `project_cross_repo_indexer_v01` |
| Wave 2 bridge work could break orb if voice-operator router misbehaves | Keep `COGNITION_BRIDGE_URL` toggleable; ship feature-flagged with default OFF until 3 consecutive clean utterances |
| Multi-modal context (C3) raises privacy surface | Screen state = window title + URL only, never pixels or transcript content (matches cockpit privacy invariant) |
| Promoting arco to `@starlight/orchestrator` requires npm publish + cross-repo update | Defer Wave 2 decision; document adoption-instead-of-promotion as a valid option |

## Why this design and not alternatives

**Alternative considered: "Build new orb in voice-operator and replace cockpit orb."**
Rejected: cockpit orb works today and Frank uses it. Replacing it doubles the work and risks regression. Bridging the existing orb into the substrate keeps the live path live.

**Alternative considered: "Wave 1 = A only (skip D)."**
Rejected: D1 is a single command that activates 6 dormant Task Scheduler triggers. Skipping it means continuing to operate without the autoinstall safety net. Leverage-per-minute too high to defer.

**Alternative considered: "Run /starlight-board BEFORE writing design."**
Rejected: board pressure-tests proposals; without a written proposal there is nothing to test. Board runs after this doc is committed, before any substrate code lands.

## Substrate-impact summary (for board pre-pass)

| Substrate surface touched | Direction | Reversibility |
|---|---|---|
| Voice & Video IS (layer 7 in STACK.md) | Wave 2 wires the dormant substrate path; no taxonomy change | Fully reversible via `COGNITION_BRIDGE_URL=off` |
| Cognition router contract | Wave 2 adds tool-executor hook to backend interface | Additive, reversible |
| Context envelope shape | Wave 2 adds `frank_context` block to dispatch packets | Additive, reversible |
| Install layer (~/.claude/settings.json) | Wave 1 modifies via cockpit `install.ps1` | Reversible via `uninstall.ps1` |
| 10-IS taxonomy | NOT TOUCHED | n/a |
| Sovereignty clause / SIP § 5 | NOT TOUCHED | n/a |

**Substrate gate verdict prediction:** PROCEED with notes — no taxonomy changes, no sovereignty changes, no canon changes. Pure operational plumbing of existing substrate.

## File touch list (Wave 1 only — what this session writes)

| File | Change | Why |
|---|---|---|
| `~/.claude/settings.json` | Modified by `cockpit/install.ps1` (backed up first) | D1 — wire cockpit hooks |
| 6 new Task Scheduler entries (`Cockpit-*`) | Created by `cockpit/install.ps1` | D1 — auto-everything |
| `~/.memory-bus-indexer-state.json` | Updated by indexer run | A3 — refresh corpus |
| `memory/mempalace_upstream/` | New atoms appended | A3 — Frank's recent work indexed |
| `test/v80-voice-context.test.ts` (new) | Symmetry assertion that voice agent system prompt includes Frank DNA marker | D2 — guard rail |
| `cockpit/orb/instrument.mjs` or similar (TBD after orb location) | Add `t_first_audio_ms` measurement | C1 — observable latency |
| `memory/MEMORY.md` + `memory/project_jarvis_grade_wave1_2026_05_11.md` (new) | Record ship | Future sessions inherit context |

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.1
- Layers used: [file-contract, attestation, sovereignty, orchestration]
- Verticals: voice-and-video, cognition-router, install-layer
- Generated: 2026-05-11
- Spec status: pre-board, ready for `/starlight-board` pressure-test
