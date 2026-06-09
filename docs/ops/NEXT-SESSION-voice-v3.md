# NEXT SESSION — Starlight Voice v3 Pickup Primer

> **Purpose:** Cold-start pickup for whoever opens the next session on this work (Frank or fresh Claude tab). Read this once at session start; execute against it.
>
> **Mirrored in both repos:**
> - `C:\Users\frank\starlight-voice\docs\NEXT-SESSION.md` (voice-side mirror)
> - `C:\Users\frank\Starlight-Intelligence-System\docs\ops\NEXT-SESSION-voice-v3.md` (this file)

---

## 1. The contract (LOCKED — do not relitigate)

Decisions hardened in spec + plan + handover. Future sessions inherit these.

| Decision | Locked answer |
|---|---|
| Repo home | New sovereign repo `frankxai/starlight-voice` (extracted from SIS-Python + Arcanea-Node duplication) |
| Activation | PTT global hotkey (`Ctrl+Shift+Space`) primary + clap ambient mode opt-in. **No wake-word.** |
| Runtime | Tauri (Rust) tray shell + Python sidecar with Pipecat pipeline |
| Latency stack | Deepgram Flux STT + Cerebras Llama-4 LLM (in-process SDK) + Cartesia Sonic-2 TTS |
| Cross-repo contracts | MCP-only (no SSE bridges, no shared file mailboxes) |
| SLA | Sub-800ms full-loop hot-path P50, enforced by CI benchmark gate |
| Scope envelope | B-velocity (~6 weeks MVR + B-tier surfaces), C-outcome (excellence axes layered week 7-12) |
| Hard exclusion | On-device wake-word (Porcupine, OpenWakeWord) — Frank explicit veto |
| License + positioning | MIT, public OSS reference impl of a "Jarvis-grade personal voice operator" |
| Performance directive | Fast CLI triggering (pre-warmed pool, in-process SDKs) + browser-use first-class MCP + Tier 2.5 deliberation lane for substrate reasoning |

**Why this matters:** every future session can drop into Task N without re-deciding these. The strategic-decision crystal compounds; the implementation merely composes.

---

## 2. Where things stand (as of 2026-05-16)

**Shipped on `frankxai/Starlight-Intelligence-System`:**

| Commit | Subject |
|---|---|
| `2310024` | Spec — first-principles redesign (substrate-tier) |
| `ff0d54d` | Plan — 29-task MVR for Weeks 1-3 |
| `5a55fe8` | Plan fix: Cargo.lock convention (Task 1 review followup) |
| `d5513f2` | Plan fix: build.rs + icon.ico (Task 2 execution finding) |
| `dee3dc9` | Handover 2026-05-16 — voice-v3 genesis (4 vault entries) |

**Shipped on `frankxai/starlight-voice` (NEW repo):**

| Commit | Subject |
|---|---|
| `9c84f02` | Initial (LICENSE-only) |
| `74b2bd8` | Baseline `.gitignore` + `.env.example` |
| `d663322` | `.gitignore`: un-ignore Cargo.lock (binary, not library) |
| `fdecfe3` | Tauri scaffold (Cargo.toml × 2, tauri.conf.json, main.rs, build.rs, icon.ico, tray-idle.png) |
| `31f5084` | `Cargo.lock` committed for reproducible builds |

**Binary verified:** `target/release/starlight-voice-tauri.exe` = 10.3 MB, 1m13s incremental build, GUI subsystem (no console allocation), 2 non-blocking compiler warnings.

**Plan progress:** Tasks 1 + 2 of 29 ✅. Tasks 3-29 pending.

---

## 3. What you do in the next session — exact sequence

### 3.1 Pre-flight (5 minutes, Frank-hands)

Before any code runs, manually verify Task 2 in a real desktop:

```powershell
& "C:\Users\frank\starlight-voice\target\release\starlight-voice-tauri.exe"
```

**Expected:** tray icon appears in system tray (color: whatever placeholder was generated). **ZERO** visible windows. **ZERO** console. **ZERO** browser. If any visible window appears, that's a P0 bug — investigate `tauri.conf.json` window subsystem flag and the `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]` line in `tauri/src/main.rs` before proceeding to Task 3.

To kill: Task Manager → `starlight-voice-tauri.exe` → End task. (The tray menu with Quit option lands in Task 6.)

### 3.2 Resume execution (Tasks 3-9, Week 1 remainder)

Open a fresh Claude Code tab in `C:\Users\frank\starlight-voice\`. Say:

> Continue Starlight Voice MVR from Task 3 per `docs/PLAN.md`. Use `superpowers:subagent-driven-development`. Each task: implementer subagent + spec review + code-quality review. Reach out to me only for BLOCKED tasks, substrate gates, or destructive actions.

Tasks 3-9 are all operational-tier (no substrate gate), fully Claude-fungible code authoring:

- **Task 3** — Python sidecar scaffold (uv + Pipecat deps)
- **Task 4** — GitHub Actions CI (Rust + Python workflows)
- **Task 5** — README.md + ARCHITECTURE.md
- **Task 6** — Tauri tray menu (Pause/Resume/Quit/etc.)
- **Task 7** — Global PTT hotkey registration
- **Task 8** — Hidden-window autostart wiring
- **Task 9** — Sidecar spawn + stdio JSON-RPC (Rust side)

End of Week 1 milestone: foundation complete; nothing functional yet but the bones are in place.

### 3.3 Week 2 — Voice loop comes alive (Tasks 10-16)

End of this block is the **first "you can actually talk to it" moment**. Adapter tasks (Tasks 13-15) are mechanical — fast subagent throughput.

### 3.4 Week 3 — Cognition + MCP + Boot discipline (Tasks 17-29)

Five gates require human attention:

| Task | Why it pauses |
|---|---|
| **24** | SIS substrate change (`mv private/voice-operator → archive`) — `/starlight-board` pre-pass **required** per `feedback_board_before_tag` |
| **25** | Destructively removes 11+ legacy scheduled tasks from your live machine — confirmation prompt + backup script in plan |
| **26** | Delete firefighting tools in SIS (`tools/fix-hide-task-windows.ps1` et al.) — substrate-adjacent |
| **27** | Memory updates — `project_starlight_voice_v3_mvr.md` template in plan |
| **29** | Reboot + first-utterance dogfood — **moment of truth** for the whole MVR |

---

## 4. Other in-flight work (other agent — covenant-era)

A peer agent landed three commits in SIS on 2026-05-14+ that complement this work:

| Commit | Status | Subject |
|---|---|---|
| `5dc5a30` | Locally committed, **NOT pushed** | `docs(context): Phase 0 STATE.md — covenant-era self-inventory` |
| `83fab4e` | Locally committed, **NOT pushed** | `chore: add agent harness manifest` |
| `37afac5` | Locally committed, **NOT pushed** | `chore: add sis agent harness guard` |

`STATE.md` is a **diagnostic** snapshot for a covenant-era PLAN.md (which is gated on COVENANT.md not yet existing). It explicitly catalogues starlight-voice:

> `starlight-voice` | `C:/Users/frank/starlight-voice/` | `scaffolding — v3 MVR weeks 1-3 plan committed 2026-05-14 (ff0d54d)` (Tauri/Rust) | **Voice cockpit primitive.** Out-of-scope for starlightintelligence.org but a **Console-candidate engine.**

**Interpretation:** voice-v3 composes cleanly into the covenant-era architecture. starlightintelligence.org is being positioned as a "steward's record" (civic-infrastructure register, Linux Foundation-style); voice-v3 belongs in the **Console paid surface**, not the steward's site. Voice-v3 work and covenant-era work are non-conflicting.

**Action for Frank when you pick up:** decide whether to push the 3 covenant-era commits to origin/main on SIS. They were left locally by another agent and may be intentionally unpushed (e.g., awaiting Frank's review of STATE.md before public commit). The voice-v3 spec/plan/handover are all already pushed.

---

## 5. Cross-repo file inventory

**SIS (`frankxai/Starlight-Intelligence-System`):**

| Path | What |
|---|---|
| `docs/superpowers/specs/2026-05-14-starlight-voice-v3-design.md` | Substrate spec (canonical) |
| `docs/superpowers/plans/2026-05-14-starlight-voice-v3-mvr.md` | 29-task MVR plan (canonical) |
| `docs/ops/HANDOVER_2026-05-16_voice-v3-genesis.md` | Session handover (canonical) |
| `docs/ops/NEXT-SESSION-voice-v3.md` | This file |
| `context/STATE.md` | Other-agent's covenant-era diagnostic |

**Starlight Voice (`frankxai/starlight-voice`):**

| Path | What |
|---|---|
| `docs/SPEC.md` | Mirror of canonical spec |
| `docs/PLAN.md` | Mirror of canonical plan (latest with all reviewer-found fixes) |
| `docs/HANDOVER-2026-05-16.md` | Mirror of session handover |
| `docs/NEXT-SESSION.md` | Mirror of this file |
| `target/release/starlight-voice-tauri.exe` | Working Tauri binary (10.3 MB, gitignored) |
| `tauri/`, `Cargo.toml`, `Cargo.lock` | Tauri scaffold (Tasks 1-2 output) |

**Memory entries (auto-loaded in Claude Code SIS sessions):**

- Look for `[starlight-voice v3 MVR]` link in `~/.claude/projects/.../memory/MEMORY.md` (added in Task 27 of plan, not yet executed — Frank can add it now using the template at plan §Task 27 if desired)

**Vault entries (compoundable cross-session insights):**

- `~/.starlight/vaults/technical.jsonl` → `TECH_20260516_1` (Tauri build.rs + icon.ico requirements)
- `~/.starlight/vaults/strategic.jsonl` → `STRAT_20260516_1` (2026 voice-agent field converged on subtraction)
- `~/.starlight/vaults/operational.jsonl` → `OPS_20260516_1` (spec+plan compound, drip-execute pattern), `OPS_20260516_2` (plan-vs-impl drift fix in tandem)

---

## 6. Reading order if you walk in completely cold

If you (or a fresh Claude session) opens this work without context, read in this order:

1. **This file (NEXT-SESSION.md / NEXT-SESSION-voice-v3.md)** — 5 min, full pickup context.
2. **The spec** (`docs/superpowers/specs/2026-05-14-starlight-voice-v3-design.md` or `docs/SPEC.md` in voice repo) — 15 min, full architecture and constraints. Skip §19 audit appendix unless investigating root cause.
3. **The plan Task 3 onwards** (`docs/superpowers/plans/2026-05-14-starlight-voice-v3-mvr.md` or `docs/PLAN.md`) — 10 min, the next ~7 tasks to execute. Skim Tasks 1-2 since they're done.
4. **(Optional) The handover** — 5 min, session wisdom + prompts-that-worked patterns. Useful if you want to understand *how* the spec/plan came to be.

**Skip:** the full session transcript. The spec + plan + handover + this file capture everything load-bearing.

---

## 7. Anti-patterns to avoid in next session

Caught during execution; codified here so we don't repeat:

- **Don't re-decide the locked contract.** If a task seems to challenge one of §1's locked answers, that's an escalation, not a permission to drift. Either the plan needs amending (with explicit reasoning + commit message naming the override) or the task interpretation is wrong.
- **Don't push the unpushed SIS commits without Frank's explicit say-so.** The 3 covenant-era commits (§4) are intentionally local. Don't auto-push them.
- **Don't skip the manual binary dogfood (§3.1)** before Task 3. The whole point of the v3 redesign is "no visible windows at logon" — confirm that *empirically* before adding more code.
- **Don't bypass `/starlight-board` on Tasks 24 + 26.** Substrate gate is structural-not-discretionary per `feedback_board_before_tag`.
- **Don't dispatch parallel subagents for code tasks.** One implementer at a time on the same repo — the skill is explicit about conflict risk.
- **Don't accept "tests pass" as code-quality approval.** Two-stage review (spec compliance, then code quality) is the discipline; reviewer issues = fix + re-review.
- **Don't fix plan-level errors only in the impl repo.** When a reviewer finding traces to plan text, fix BOTH (impl commit + plan commit) in the same review cycle. Drift between plan and reality recurs.

---

## 8. When you actually have working voice — success criteria

These are the falsifiable wins. Plan §18 has the full list; key checkpoints:

- **End of Week 1:** Tray icon present at logon, zero visible windows. PTT hotkey fires globally. (Tasks 3-9 done.)
- **End of Week 2:** You can press the hotkey, say "hello", and hear a Cartesia voice reply. (Tasks 10-16 done.)
- **End of Week 3:** Full mic-close → first audio P50 <800ms over 50 utterances; the 11+ legacy scheduled tasks removed; legacy `private/voice-operator/` archived in SIS; first OSS-ready binary signed. (Tasks 17-29 done.)

If any of those slip, that's a real signal — escalate rather than push through.

---

## Final note

The hardest part — converting Frank's frustration into a sovereign artifact — is **already done**. Tasks 3-29 are composition, not invention. Drop into the next session and just execute the plan.

Voice operator v3 starts existing today. Make it speak next week.
