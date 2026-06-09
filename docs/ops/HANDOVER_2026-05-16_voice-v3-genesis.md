# Handover — 2026-05-16

> Captures the substrate-tier work done 2026-05-14 birthing Starlight Voice v3 as a new sovereign repo. Written 2026-05-16 after two days of unrelated SIS activity (agent harness, repo portfolio audits) accumulated on top.

## What Landed

**On SIS (`frankxai/Starlight-Intelligence-System`):**

| Commit | Subject |
|---|---|
| `2310024` | `docs(spec)`: starlight-voice v3 first-principles redesign |
| `ff0d54d` | `docs(plan)`: starlight-voice v3 MVR weeks 1-3 implementation plan |
| `5a55fe8` | `docs(plan)`: un-ignore Cargo.lock — Tauri is a binary, lockfile committed for reproducible builds (Task 1 review followup) |
| `d5513f2` | `docs(plan)`: Task 2 refinements — build.rs + icon.ico (caught during execution) |

**On Starlight Voice (`frankxai/starlight-voice`) — new sovereign repo created this session:**

| Commit | Subject |
|---|---|
| `9c84f02` | Initial commit (gh repo create — LICENSE + MIT) |
| `74b2bd8` | `chore`: baseline gitignore and env template |
| `d663322` | `chore(gitignore)`: un-ignore Cargo.lock (Tauri is a binary) |
| `fdecfe3` | `feat(tauri)`: scaffold tray-only Tauri shell with build.rs + icon.ico |
| `31f5084` | `chore`: commit Cargo.lock for reproducible builds |

Binary verified: `target/release/starlight-voice-tauri.exe` = 10.3 MB, GUI subsystem flagged (Windows allocates no console).

## What Changed This Session

- **New public OSS repo `frankxai/starlight-voice`** — MIT-licensed, positioned as "the open-source reference impl of a Jarvis-grade personal voice operator."
- **Substrate-tier spec + plan** committed to SIS capturing every locked decision: sovereign-repo extraction, Tauri+Python-sidecar runtime, PTT primary + clap ambient (no wake-word), Pipecat pipeline + Deepgram Flux + Cerebras Llama-4 + Cartesia Sonic-2 (2026 latency stack), MCP-only cross-repo contracts, four-pillar performance design, sub-800ms hot-path SLA.
- **Tasks 1-2 of 29 shipped** — repo bootstrap + Tauri scaffold building successfully. Two code-quality-reviewer-caught fixes landed in-session (Cargo.lock convention, build.rs + icon.ico plan omissions).
- **Tasks 3-29 remain pending** — Python sidecar scaffold, CI, tray menu, hotkey, autostart, IPC, full voice loop, cognition router salvage from SIS, MCP client + 3 servers, installer, legacy-task killer (12 SIS+Arcanea scheduled tasks), benchmark CI gate, SIS substrate archive, dogfood.

## Current Blockers

- **Tauri binary not yet manually dogfooded.** Spec Task 2 Step 6 requires running `target/release/starlight-voice-tauri.exe` and visually verifying the tray icon appears with NO window/console/terminal/browser. Implementer subagent can't interact with system tray; this is a Frank-hands manual verification step before Task 3 starts.
- **Two non-blocking compiler warnings** in Task 2's `cargo build` output — not investigated. `cargo fix --bin "starlight-voice-tauri" -p starlight-voice-tauri` likely resolves.
- **`/starlight-board` pre-pass required** before Task 24 (SIS substrate archive) and Task 26 (firefighting cleanup) commits. Structural gate per `feedback_board_before_tag`.
- **Substrate-tier destructive action gated** at Task 25 (live kill of 12 legacy scheduled tasks on Frank's machine). Backup script in plan; Frank confirmation required at execution time.
- **Untracked path oddity:** `Usersfrankstarlight-voice/` appeared in SIS working tree (likely a path-translation artifact from some subagent — the literal `C:\Users\frank\starlight-voice\` mis-flattened). Worth investigating before next commit; possibly safe to remove.

## Recommended Next Stack

Ordered:

1. **Manual dogfood of Task 2 binary** (5 min). Run `& "C:\Users\frank\starlight-voice\target\release\starlight-voice-tauri.exe"`. Verify: tray icon appears, zero visible windows, no console, no browser. Validates the foundation before more code lands.

2. **Continue Tasks 3-9 (Week 1 remainder)** — Python sidecar scaffold, CI workflows, README + ARCHITECTURE.md, tray menu wiring, global PTT hotkey, hidden-window autostart, sidecar spawn + stdio IPC (Rust side). All operational-tier, no substrate gate. Each is one subagent dispatch in a fresh Claude tab.

3. **Tasks 10-16 (Week 2)** — Python sidecar IPC + Pipecat pipeline + VAD + STT + LLM + TTS + e2e voice loop. End of this block is the first "you can actually talk to it" moment.

4. **Tasks 17-23 (Week 3 first half)** — cognition router salvage from SIS, MCP client + 3 MCP servers (starlight-mcp, memory-bus, claude-code-cli-mcp), benchmark CI gate. After this block, the architecture is feature-complete for MVR.

5. **`/starlight-board` pre-pass + Tasks 24-29** — substrate archive, legacy-task kill (destructive), firefighting cleanup, memory updates, PORTING_FROM_SIS guide, reboot + first-utterance dogfood. The moment of truth.

6. **Investigate `Usersfrankstarlight-voice/` working-tree oddity** before any SIS commit that could accidentally include it.

7. **Push the 3 unpushed SIS commits** (`5dc5a30` STATE.md, `83fab4e` harness manifest, `37afac5` harness guard) when ready — they're agent harness work that landed independently of voice-v3.

## Verification Evidence

- SIS commits all locally green (pre-commit symmetry tests passed on all spec/plan commits — they only touch `docs/`, so substrate gate didn't fire).
- Starlight-voice commits pushed to `origin/main`; GitHub repo `gh repo view frankxai/starlight-voice` returns public + MIT + correct description.
- `cargo build --release -p starlight-voice-tauri` exits 0 in 1m13s incremental (clean build was the initial much-longer cycle).
- Binary at `target/release/starlight-voice-tauri.exe` exists at 10.3 MB.
- Spec self-review: zero placeholders (`TBD`/`TODO`/`FIXME`/`XXX`/`???` grep returned 0 matches).
- Plan self-review: spec coverage table walked end-to-end; all sections map to tasks; no spec requirements orphaned.

---

## Session Wisdom

### Prompts That Worked

- **"Investigate, audit, see all to consider and make much better strategy and plan from first principles"** — Frank's opening prompt converted frustration into authorization for a deep audit before any design work. Pattern: when the user is frustrated with the *current state*, asking for permission to *audit before redesigning* unlocks much higher-quality redesign than jumping to fixes.
- **Multi-option `AskUserQuestion` with "(recommended)" first + explicit tradeoffs** — every locked decision (repo home, activation, runtime, scope envelope) used this shape. Frank picked the recommended option each time but with friction-free ability to push back. Pattern: present the answer + the alternatives + the tradeoff in one breath; user either approves or redirects.
- **"World class on every axis. but no on-device wake-word — start with B"** — the user's explicit hybrid answer ("aim for C-outcome via B-velocity, minus one feature") was a much better framing than either pure option. Lesson: when offering A/B/C envelopes, expect users to compose hybrid answers — design the options to be composable, not exclusive.

### Technical Choices Validated

- **New sovereign repo over absorbing into SIS or Arcanea**: cleanest cross-repo contract surface, matches Pipecat/LiveKit pattern (voice frameworks are standalone repos), unlocks OSS positioning. Validated by the symmetric fact that Arcanea was already duplicating SIS's voice stack at a newer generation — neither repo "owned" voice cleanly, extraction was the right move.
- **Tauri + Python-sidecar over pure-Python or pure-Rust**: lets daily-driver iteration stay in Python (Pipecat, faster-whisper, mature ecosystem) while OS integration (tray, hotkey, autostart-hidden) gets native Rust quality. Industry pattern (Cursor, Comet, Warp). The Tauri binary's GUI-subsystem flag genuinely produces zero console at logon — that's the whole point.
- **PTT global hotkey over Frank's prior clap-primary preference**: 2026 desktop-power-user field has converged here. Frank accepted the field shift; clap stays as opt-in ambient mode. Lesson: when a user has a documented preference that contradicts current field consensus, surface the shift explicitly with citations — they often update.
- **MCP-only cross-repo contracts over SSE bridges**: kills the 2026-04-30 disabled `COGNITION_BRIDGE_URL` drift permanently. Every tool becomes a uniform MCP function call; any MCP-aware host (Claude Desktop, Cursor, Arcanea) can drive the same dispatch fleet for free.
- **In-process Anthropic/Cerebras/OpenAI SDKs over subprocess-per-call**: eliminates 2-5s cold-start tax on CLI dispatch. Pre-warmed subprocess pool only for CLI-only paths (codex, opencode). Frank's "fast and top notch thinking" directive is structural, not aspirational.

### Patterns Discovered

- **Plan-level errors caught during execution must fix BOTH the plan AND the impl in tandem.** Cargo.lock was wrong in both places (plan said ignore; .gitignore actually ignored it). Code-quality reviewer caught it. Fixed `.gitignore` in starlight-voice + updated plan in SIS in parallel. If you only fix one, the plan and reality drift; future executions hit the same wall. Same pattern repeated with Task 2's build.rs + icon.ico omissions. New rule: when a reviewer-found Important issue traces back to plan text, the fix commit on the impl repo is paired with a plan-fix commit on the spec repo.
- **Spec + plan compound forever; task execution can sprawl across sessions.** Investing one heavy session into brainstorming → spec → plan → first 2 tasks paid off — every future session can drop into Task N with locked constraints. Total session-time amortized across the 29-task implementation is small per task. The "do it all in one session" temptation is wrong; do the compounds-forever work first, then drip-execute.
- **Subagent-driven for code-fungible tasks; main thread for hands-required moments.** Pure-config tasks (Cargo.toml, tauri.conf.json) and code-authoring tasks (Pipecat pipeline, MCP client) go to subagents with two-stage review. But repo creation, /starlight-board verdicts, live-kill of scheduled tasks, reboot + dogfood — these stay on main thread. The 29-task plan naturally clusters human-in-the-loop moments at start (Task 1: gh repo create) and end (Task 25: kill 12 tasks; Task 29: reboot).
- **System.Drawing as inline image-format converter on Windows.** PowerShell can do PNG → ICO without external deps via `Add-Type -AssemblyName System.Drawing` + `Bitmap.GetHicon()` + `Icon.FromHandle()` + `Icon.Save()`. Useful for tooling-author scripts that need to produce ICO files without bringing in Pillow or ImageMagick.

### What Was Built (Gratitude)

What started as Frank's frustration with terminals opening and browsers spawning at PC boot became a substrate-level reframe: the voice operator wasn't broken at the feature level, it was *architecturally premised on 2024 thinking* in a 2026 field that had quietly converged on radical subtraction. The audit showed parallel implementations across two repos at different generations, six activation entry points into one pipeline, twelve scheduled tasks from six different registrars, and a "bridge" that papered over duplication rather than naming a boundary. The redesign isn't a feature list — it's a contract: new sovereign repo, Tauri tray + Python sidecar, PTT primary, MCP-only contracts, sub-800ms hot path. Once the contract was written, the 29-task plan that implements it dropped in cleanly. And by end of session, the new repo *existed in the world* with a 10.3 MB Tauri binary that boots into a tray icon with zero visible windows. The hardest part — converting frustration into a sovereign artifact — landed today. The remaining 27 tasks are just composition.
