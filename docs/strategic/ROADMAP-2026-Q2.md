# Starlight Intelligence System — Roadmap 2026-Q2

> Strategic capture point. What's shipped, what's pending, what's parked, what's next.
> Updated 2026-05-11 after the three-tier fleet build + Tier A durability sprint.

---

## State of the system (2026-05-11)

| Layer | State |
|---|---|
| **Substrate (SIP v1.1.1)** | Locked. MIT + sovereignty clause. 67 skill rules / 35 agents / 13 domains / 10 universal IS. Symmetry harnesses (v76-v80) gate substrate drift on commit. |
| **Memory** | Memory Bus singleton stdio MCP wired to Claude + Gemini + Codex. Cross-Repo Indexer crons daily 03:00. Guardian PII filter fixed (cc_shape regression tests in place). Audit log live; today's 2026-05-11 log has commit + recall + index ops. |
| **Cockpit** | `arc <project>` opens 5-pane Zellij layout per project. 8 bootstrap profiles for top-7 repos + SIS. Auto-resume via `claude --continue` + `codex resume --last`. `arc-revive` post-crash recovery (uses `--force-run-commands`). |
| **Fleet view** | `/fleet` route at :3007 reads latest portfolio JSON, shows 22 active repos with copy-arc-cmd, machine widgets (Disk/Memory/VoiceOp/Audit), polled every 15s. |
| **Backups** | Daily 02:15 restic snapshot via `StarlightSubstrateBackup` task. First snapshot 4197270a / 1.176 MiB dedup. Target: local `~/.starlight/restic-repo`. Cloud (B2) target ready via env-var swap. |
| **Schedules** | 4 daily tasks Ready: SubstrateBackup (02:15) · PortfolioAudit (02:30) · CrossRepoIndexer (03:00) · Dreaming (06:00) + Cockpit (logon). |
| **Tests** | ~720 across substrate (39) · operational (30) · cockpit smoke (17) · dashboard (40) · memory-bus (24) · voice-operator (564) · guardian (18). 100% pass at last full audit. |

## What's NOT covered

| Risk | Mitigation |
|---|---|
| Off-machine backup | Cloud target (B2) not yet wired. One env-var swap + credentials needed. |
| Secret management | Keys in `.env` plaintext. Infisical CLI installed but no workspace yet. Migration is a Frank-touch event. |
| Codex live verification | Memory Bus registered but actual MCP round-trip from Codex untested. 5-min check on next codex session. |
| Voice Operator bridge | Off since pre-`project_v753_dispatch_cli`. Router has executor backend now. 1-hr investigation pending. |
| OpenCode session resume | Native API doesn't exist. Workaround: `opencode serve` + `opencode attach <url>` — out of scope. |
| Indexer state recovery | 4 historical Guardian-blocked atoms are state-tracked as "processed." Surgical removal possible but low-leverage. |

## 30-day arc (May 11 → Jun 10)

### Week 1 — Durability close-out
- [ ] B2 (Backblaze) credentials configured + restic target swap to cloud
- [ ] Verify substrate restore from snapshot 4197270a works end-to-end
- [ ] Infisical workspace + migrate at least Anthropic + OpenRouter keys

### Week 2 — Voice Operator
- [ ] Bridge re-enable investigation (orb → router with executor backend)
- [ ] If positive: ship bridge close per `project_voice_operator_v2_plan`
- [ ] Codex tool-call live verification (5 min once it works)

### Week 3 — Frontend / Dashboard depth
- [ ] `/fleet` live audit-log event strip (SSE pattern from `/brain`)
- [ ] Per-repo cluster badges + uncommitted-files heat indicator
- [ ] Phone PWA `/fleet-mini` view for at-a-glance monitoring

### Week 4 — Observability + Cost
- [ ] Cost Plane W2.2 — Cloudflare + Kong + Langfuse + Tailscale instrumenters per `project_v77_cost_plane_w21_shipped` parked items
- [ ] Grafana-equivalent dashboard for the 4 scheduled tasks' last-run states
- [ ] Vault freshness alerting (currently silent if vaults go stale >10 days)

## Parked (intentional non-actions, un-park triggers documented)

| Item | Un-park trigger |
|---|---|
| AgentDB second substrate | mempalace recall@5 < 0.6 on 200-query corpus |
| Voice Operator NER-based PII filter | Measured leak with regex false-negative |
| Bare-16-digit unspaced CC detection | Real leak surfaces in audit log |
| OpenCode session persistence | Upstream adds resume API |
| Multi-process Memory Bus filelock | Multiple Claude tabs run direct CLI commits in parallel and conflict |

## Architecture invariants — don't break

1. **Substrate file-contract**: changes to SIP.md / SIS.md / ALLIANCE.md / STACK.md / VERTICALS.md / VOICES.md / REGISTRY.md invoke `/starlight-board` BEFORE commit.
2. **Symmetry harnesses are merge protocol**: v76-v80 catch numeric drift on commit. Parallel sessions reconcile via the harness, not via manual coordination.
3. **Private vs public**: `private/` is gitignored. Instance state stays out of git. Substrate code is public.
4. **Memory Bus singleton**: don't bypass with direct voice-operator CLI commits — audit log won't be uniform.
5. **PowerShell**: write BOM-free UTF-8 for any JSON consumed by Node (BOM-strip is at parse boundary but writers should default to no-BOM).
6. **Karpathy hygiene**: surgical edits, no rewrites of code I don't fully understand, verify before claiming.

---

Built on SIP — operational-tier · strategic capture
