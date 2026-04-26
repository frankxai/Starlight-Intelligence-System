# Claude Code harness — allowlisted tools

> Permission policy for Claude Code when operating as the Starlight Orchestrator primary harness. Read this as an executable policy, not narrative — every tool listed here is allowed; every tool *not* listed requires explicit per-session unlock via `/ao` config or direct user approval.

**Harness role:** primary. Substrate edits, architecture, long-form code, agent orchestration.
**Default load:** any task touching SIS, brand-critical writes, > 200 LOC changes, or multi-agent orchestration.

---

## Tool allowlist

| Tool | Allowed | Use for | Constraint / rationale |
|---|---|---|---|
| `Read` | yes | All file reads across substrate, vaults, verticals, console, integrations | No constraint — read is always safe at this tier |
| `Write` | yes | New file creation, scaffold, attestation footers, memory entries | Substrate-level writes require architect voice + SIP attestation footer + memory entry per turn |
| `Edit` | yes | Existing file modification | Surgical edits preferred over `Write` for existing files; `Write` only for full-rewrite or new files |
| `Glob` | yes | File-name pattern search | No constraint |
| `Grep` | yes | Content search across substrate | No constraint; multi-line mode allowed |
| `Bash` | yes (surgical staging) | Git ops, npm, build/test, file moves, deploy commands | Destructive flags (`rm -rf`, `git reset --hard`, `git push --force`, `--no-verify`) require explicit user approval per turn — never default. `git add -A` / `git add .` discouraged in favor of explicit paths to avoid accidental secret commits. |
| `Task` (Agent dispatch) | yes (parallel up to 5-8 in flight) | Parallel sub-agent dispatch per the 2026-04-25 pattern (`feedback_parallel_agent_pattern`) | Substrate-tier dispatches require board pre-pass when total scope exceeds 200 LOC across all sub-agents combined |
| `WebFetch` | yes | External documentation, API reference, npm registry checks | Cached-belief protocol applies — never trust prior memory of "X is shipped on npm"; verify via `npm view` or registry fetch |
| `WebSearch` | yes | Research scratchpad for substrate-impacting decisions | For low-stakes research, prefer routing to OpenCode harness to preserve Sonnet/Opus budget |
| `NotebookEdit` | yes (rare) | Jupyter notebook edits when verticals carry analysis notebooks | None of the current 10 IS verticals use notebooks at scaffold stage; reserve for Phase 1+ when capture stack lands |
| `Skill` | yes | Skill invocation per `skills/skill-rules.json` auto-activation triggers | Skill auto-activation is the substrate's primary capability layer — invoke freely; do not duplicate skill logic in agent code |
| `ToolSearch` | yes | Discover deferred MCP tool schemas | Standard pattern when Linear/Notion/Vercel/Slack MCPs are needed mid-session |
| `EnterWorktree` / `ExitWorktree` | yes (per superpowers:using-git-worktrees) | Feature isolation for multi-step substrate edits | Use when current working tree state must remain pristine for parallel work; always exit cleanly |
| `Monitor` | yes | Streaming output from background processes (deploys, tests, long builds) | Pair with `run_in_background: true` Bash calls; never busy-poll with sleep |
| `TaskStop` | yes | Cancel a sub-agent dispatch when scope drift detected | Use proactively if sub-agent output is going off-rails; a bad sub-agent run is cheaper to abort than to clean up |

---

## Task-scoped MCP tools (load per session)

| MCP server | Allowed when loaded | Use for | Escalation if hit boundary |
|---|---|---|---|
| `mcp__claude_ai_Vercel__*` | Phase 3 + ongoing | Deploy, project read, runtime logs | Boundary = production secret access → escalate to Frank for token issuance |
| `mcp__claude_ai_Linear__*` | Alliance work | Issue / project / cycle reads + saves | Boundary = cross-team write → board pre-pass |
| `mcp__claude_ai_Notion__*` | Daily brief sync | Ops Hub page creation/update | Boundary = page deletion → user approval |
| `mcp__claude_ai_Slack__*` | Internal comms | Read/send messages, canvas updates | Boundary = posting to public channel as a brand → board pre-pass |
| `mcp__claude_ai_Gmail__*` | Light comms triage | Draft creation, label management | Boundary = sending without explicit user approval → never |
| `mcp__claude_ai_Google_Drive__*` | Vault parity check | Read-only file ops | Boundary = write to Drive that Syncthing should own → refuse, route to vault |
| `mcp__claude_ai_Google_Calendar__*` | Time-block requests | Event create/update | Boundary = inviting external attendees → user approval |
| `mcp__claude_ai_Figma__*` | Phase 4 viz work | Design context, FigJam diagram, code-connect | Boundary = uploading assets representing un-attested artifacts → refuse |
| `mcp__claude_ai_Canva__*` | Marketing artifacts | Design generation, export | Same attestation rule as Figma |
| `mcp__claude_ai_Miro__*` | Boards + diagrams | Diagram, doc, table ops | Same |
| `mcp__remotion-video__*` | Voice & Video IS | Composition, render, scene mgmt | Boundary = render cost > free tier → user approval |
| `mcp__remotion-docs__*` | Voice & Video IS | Documentation lookup | No constraint |
| `mcp__smartcut__*` | Voice & Video IS | CapCut project ops | Same as Remotion |
| `mcp__claude_ai_Vercel__deploy_to_vercel` | Phase 3+ deploy | Deploy to production | Vercel auto-deploy was broken since 2026-04-10; manual `vercel --prod` from `site/` is canonical until Item 3 of v7.5 board (GHA workflow attestation surface) lands. Memory: `project_vercel_manual`. |

---

## Tools that require explicit per-session unlock

| Tool | Why restricted | How to unlock |
|---|---|---|
| `dangerouslyDisableSandbox` (Bash flag) | Bypasses all sandbox protection | Direct user approval for one specific command, never blanket |
| `git push --force` to main/master | Destroys remote history | User approval + audit log entry; never auto-invoked |
| `git reset --hard` to upstream | Destroys local working state | User approval; prefer worktree-based isolation instead |
| `git commit --no-verify` / `--no-gpg-sign` | Skips hooks / signing | Never. If a hook fails, fix the underlying issue |
| `rm -rf` on substrate paths | Substrate corruption risk | User approval per path |
| `npm publish` | Pushes to public registry | User approval; substrate canonical packages (e.g. `@starlight/orchestrator`) require board pre-pass per Phase 1.1 |
| `vercel --prod` | Production deploy | Pre-approved scope under `/ao` for `site/` Phase 3+; manual elsewhere until GHA workflow is attestation-complete |
| Direct secret writes (`.env`, credentials.json, keys) | PII / cost / blast radius | Never write secrets to repo; use env-var references in configs |

---

## Escalation rules — when the tool boundary is hit

**Substrate-level edits exceed scope:**
- If edit touches > 1 of {SIP.md, SIS.md, ALLIANCE.md, STACK.md, VERTICALS.md, VOICES.md, REGISTRY.md, MASSIVE_ACTION_PLAN.md} in a single turn → invoke `/luminor-board` for pre-pass before commit.
- If sub-agent dispatch total scope > 200 LOC → invoke `/luminor-board` before dispatch, not after results return.

**Brand-critical writes hit ambiguity:**
- Cross-brand edit (FrankX × Arcanea × Starlight × AIA × AIM × GenCreator × Private) → architect voice + memory entry + board pre-pass.
- Public-facing copy on a brand site → run through brand-voice skill + voice owner approval before deploy.

**Adversarial pressure-test needed:**
- Security-sensitive change (auth, secrets, PII handling, API exposure) → handoff to Codex harness for adversarial review *before* the write lands.
- Sovereignty / governance / attestation concern → handoff to `/openclaw-audit` for protocol-defender review.

**Long-context job exceeds Sonnet/Opus efficiency:**
- Reading > 50 files for a single intent, or producing structural diff against the entire substrate → route to Gemini harness; Gemini summarizes, you implement.

**Latency-bound or low-stakes:**
- Round-trip < 30s, no side effects, free-tier-acceptable → route to OpenCode harness. Per `MASSIVE_ACTION_PLAN.md` § 12, ≥50% of low-stakes routing should land on OpenCode to preserve paid-tier budget.

**Voice room handoff packet exceeds allowlist:**
- Refuse and surface to user via voice room with stop-the-line signal. Do not silently expand scope.

---

## Read this section before any irreversible action

The v7.5 Luminor Board found three P0 defects from a `/superintelligence` execute ship that skipped board pre-pass. The substrate's governance integrity rests on `/luminor-board` running *before* irreversible structural changes, not after. Substrate-affecting changes invoke the board as a structural gate, not architect's discretion. (See REVISE Item 6, board record at `docs/boards/luminor-v75-ship.md`.)

When in doubt: **board first, then ship**.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
- Substrate: starlightintelligence.org/protocol
- Layers used: [file-contract, attestation, sovereignty]
- Verticals: core/orchestrator/harnesses/claude
- Generated: 2026-04-26
- Policy posture: this file is executable permission policy for the Claude Code harness when running as Starlight Orchestrator primary.
