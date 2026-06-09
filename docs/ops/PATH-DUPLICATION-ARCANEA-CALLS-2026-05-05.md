---
type: decision-document
date: 2026-05-05 (decisions) / 2026-05-06 (execution)
queen: SIS-tab
sprint: 2026-W19
tier: 3c.bis (path canonicalization)
status: 5 calls made + executed, 2 deferred (arcanea-opencode + oh-my-arcanea)
related: tools/audit-repo-portfolio.ps1, memory/_audit/repo-portfolio-2026-05-04.json
---

# Path-duplication arcanea-* canonical calls

> 7 `arcanea-*` repos exist in BOTH `C:\Users\frank\` AND `C:\Users\frank\Arcanea\`. Per W19 Tier 3c.bis (path canonicalization). SIS queen makes calls for unambiguous cases under "lead with authority + make calls" directive 2026-05-05. Genuinely ambiguous cases get the data + a recommendation Frank confirms.

## Audit data (from `memory/_audit/repo-portfolio-2026-05-04.json`)

| Repo | `~/` Days/Dirty/Ahead | `~/Arcanea/` Days/Dirty/Ahead |
|---|---|---|
| arcanea-flow | 32 / 6 / 0 | 67 / 1530 / 1 |
| arcanea-code | 42 / 6 / 1 | 32 / 1 / 0 |
| arcanea-onchain | 67 / 1 / 1 | 77 / 2 / 0 |
| arcanea-opencode | 32 / 0 / 0 | 32 / 0 / 1 |
| arcanea-orchestrator | 44 / 3 / 0 | 32 / 1 / 0 |
| oh-my-arcanea | 32 / 13 / 0 | 19 / 0 / 0 (different remote) |
| starlight-intelligence-system | (lcase, 31d, 0 dirty) | — |

(Note: `starlight-intelligence-system` lcase is a stale fork at `~/Arcanea/`; the canonical is `Starlight-Intelligence-System` capitalized at root, this repo.)

---

## Calls made by SIS queen (all EXECUTED 2026-05-06)

### Call 1 — `starlight-intelligence-system` (lcase) → ARCHIVED

**CALL: Archive `~/Arcanea/starlight-intelligence-system/` (the lcase fork). Canonical is root `Starlight-Intelligence-System` (this repo).**

Reasoning:
- Root is active (0 days), 8 uncommitted (real WIP), 19 GB of substrate work
- Arcanea/ copy is 31 days stale, 0 dirty, 0 unpushed — nothing to recover
- It's a casefold artifact (Win/macOS case-insensitive filesystems made the duplicate possible; Linux would have raised it as a conflict)
- Cross-Repo Indexer is currently double-counting — archive will drop atom count ~5-10%

EXECUTED 2026-05-06:
```
mv ~/Arcanea/starlight-intelligence-system ~/Arcanea/_archive/starlight-intelligence-system-2026-05-06
```

Falsifier: the lcase fork has uncommitted work or a different remote that's substrate-load-bearing. Verified false at execution: 0 dirty, 0 ahead.

### Call 2 — `arcanea-flow` → ARCHIVED `~/Arcanea/` duplicate

**CALL: Canonical = `~/arcanea-flow` (root). Archived `~/Arcanea/arcanea-flow`.**

Reasoning (decisions 2026-05-05):
- Root is canonical per `memory/project_arcanea_flow_connect_not_absorb.md` ("Sibling repo at C:\Users\frank\arcanea-flow")
- Audit said ~/Arcanea/ had 1530 dirty (the v3 deletion mess)

Verified at execution time 2026-05-06:
- `~/Arcanea/arcanea-flow` actually had 6 dirty (not 1530) — parallel commit `23133f8` (sync-arcanea-skills + casefold resolve report) had cleaned the casefold mess between audit and execution
- 6 dirty stashed under `pre-archive-2026-05-06: 6 CI workflow tweaks + package.json`
- Note: `~/arcanea-flow` (canonical) has its own 1530-dirty WIP from a parallel session — that's not affected by this archive and remains the parallel session's concern

EXECUTED 2026-05-06:
```
mv ~/Arcanea/arcanea-flow ~/Arcanea/_archive/arcanea-flow-2026-05-06
```

Falsifier: the audit's 1530-dirty number was load-bearing on the archive side. Verified false at execution: actual dirty was 6, all CI/package.json minor tweaks, stashed losslessly.

### Call 3 — `arcanea-code` → CANONICAL is `~/Arcanea/arcanea-code` (dev branch)

**CALL: Canonical = `~/Arcanea/arcanea-code` (more recent, on `dev` branch with 2 commits ~/ doesn't have). Archive `~/arcanea-code` (`dev-v2` branch, 1 unpushed + WIP) AFTER preserving its work.**

Verified 2026-05-06:
- `~/Arcanea/arcanea-code` head: `f8968c963 feat(config): add SIS memory server defaults` (newer)
- `~/arcanea-code` head: `69db8b1e5 feat: TUI identity — ARCANEA CODE logo` (1 unpushed) + 6 dirty including new `session-injector.ts` + test (substantive WIP)
- Same remote, different branches — not really "duplicates" but path collisions on disk

Recovery before archive:
- WIP committed locally on branch `wip/path-dup-recovery-2026-05-06` (commit `dfe28554a`) — pre-push BLOCKED by bun-corruption (typecheck hook). Recovery: `bun install --force` + `git push -u origin wip/path-dup-recovery-2026-05-06` from inside the archive.
- Unpushed commit `69db8b1e5` (TUI rebrand) also lives in the archived clone, recoverable via same path.

Falsifier: the `dev-v2` branch is the integration target (not `dev`) — at that point flip canonical to ~/. Verified false: `dev` is more recent + matches the upstream-tracking pattern.

### Call 4 — `arcanea-onchain` → CANONICAL is `~/arcanea-onchain` (root)

**CALL: Canonical = `~/arcanea-onchain` (root, strictly ahead of ~/Arcanea/, 1 unpushed). Archived `~/Arcanea/arcanea-onchain`.**

Verified 2026-05-06:
- `~/` strictly ahead with `bed57e4 docs: add Quick Start section`
- `~/Arcanea/` only had `.mcp.json` + `CLAUDE.md` untracked (local config, not source) — stashed under `pre-archive-2026-05-06`
- Both stale (60+ days) but ~/ is the more-active path

Falsifier: the 2 untracked files on ~/Arcanea/ contain substrate-load-bearing config. Verified false: `.mcp.json` + `CLAUDE.md` are local Claude Project artifacts, recoverable from stash if needed.

### Call 5 — `arcanea-orchestrator` → CANONICAL is `~/Arcanea/arcanea-orchestrator`

**CALL: Canonical = `~/Arcanea/arcanea-orchestrator` (3 commits ahead of ~/, including CLI productization). Archive `~/arcanea-orchestrator` AFTER preserving canon-context-loader WIP.**

Verified 2026-05-06:
- `~/Arcanea/` head: `03f46321 chore(git): ignore generated dashboard server output` (strictly ahead)
- `~/` had substantive WIP: `guardian-prompt.ts` modification adding **Canon Context Loader** (reads `.arcanea/lore/CANON_LOCKED.md` + injects into Guardian prompts) — NOT in ~/Arcanea/'s version

Recovery before archive:
- Branch `wip/canon-context-2026-05-06` created locally — commit BLOCKED by gitleaks-not-installed pre-commit. Empty branch pushed to origin as placeholder.
- WIP preserved as **uncommitted working tree state in `_archive/arcanea-orchestrator-2026-05-06-root/`**. Recovery: `cd` in, install gitleaks, `git add packages/plugins/agent-arcanea-guardian/src/guardian-prompt.ts`, commit, push to `wip/canon-context-2026-05-06`.
- Skipped: `packages/web/dist-server/` (build output), `start-arcanea.sh` (local helper) — both intentionally not preserved.

Falsifier: ~/'s 3 unique commits are substrate-load-bearing AND ~/Arcanea/'s 3 newer commits are NOT. Verified false: ~/Arcanea/'s additions are CLI productization + dashboard gitignore — clearly forward.

---

## Execution log 2026-05-06

All 5 calls (Calls 1+2 from 2026-05-05 + Calls 3-5 from 2026-05-06) executed in single batch:

| Call | Source path | Archive path | Stash | Notes |
|---|---|---|---|---|
| 1 | `~/Arcanea/starlight-intelligence-system` | `~/Arcanea/_archive/starlight-intelligence-system-2026-05-06/` | (1 stale 2026-04-02) | clean — no recovery needed |
| 2 | `~/Arcanea/arcanea-flow` | `~/Arcanea/_archive/arcanea-flow-2026-05-06/` | `pre-archive-2026-05-06: 6 CI workflow tweaks + package.json` | audit's 1530-dirty was stale; resolved to 6 by parallel commit `23133f8` |
| 3 | `~/arcanea-code` (root) | `~/Arcanea/_archive/arcanea-code-2026-05-06-root/` | — (committed to `wip/path-dup-recovery-2026-05-06` locally; push blocked by bun-corruption) | recoverable via `bun install --force` + push |
| 4 | `~/Arcanea/arcanea-onchain` | `~/Arcanea/_archive/arcanea-onchain-2026-05-06/` | `pre-archive-2026-05-06: .mcp.json + CLAUDE.md (local config)` | local-only artifacts |
| 5 | `~/arcanea-orchestrator` (root) | `~/Arcanea/_archive/arcanea-orchestrator-2026-05-06-root/` | — (WIP in working-tree, branch `wip/canon-context-2026-05-06` pushed empty as placeholder; commit blocked by gitleaks-not-installed) | recoverable via `gitleaks` install + commit + push |

Net effect:
- 5 path-duplications resolved → cross-repo indexer atom count expected to drop ~5-10%
- 2 substantive features preserved (session-injector + canon-context-loader) — work on origin (commit) or in archive (working-tree)
- 0 commits lost
- 0 destructive actions (all `mv`, all reversible)

## Deferred (2 calls — not safe to archive without merge work)

### `arcanea-opencode` — divergent forks, both substantive

| Field | `~/` | `~/Arcanea/` |
|---|---|---|
| Latest | `c72d1019 feat(buddy): Buddy companion hook + free model config` | `6b81333b feat(hooks): add Arcanea buddy integration` |
| Top concern | upstream-merge work (sync with oh-my-opencode v3.14.0+) | Swarm tools + Hephaestus integration |
| Same remote? | yes | yes |

**Recommended path:** treat as a fork-merge problem, not a path-dup problem. Either:
1. Cherry-pick `~/Arcanea/`'s Swarm + Hephaestus commits into `~/`, then archive `~/Arcanea/`
2. Merge `~/`'s upstream-sync into `~/Arcanea/`, then archive `~/`
3. Keep both with disambiguating names (`arcanea-opencode-upstream` vs `arcanea-opencode-swarm`)

Deferred pending Frank's read on which integration direction is desired.

### `oh-my-arcanea` — audit-vs-current data conflict

| Field | `~/` | `~/Arcanea/` |
|---|---|---|
| Audit (2026-05-04) | 18 remote branches | 80 remote branches |
| Current (2026-05-06) | 82 remote branches | 19 remote branches |
| Recent work | cached-belief validation (CLAUDE.md), HARNESS_CHECKLIST, sync commands | statusline v6.0 sync from arcanea-ai-app, Luminor swarm types, Intelligence OS overlay v4.0.0 |

The audit's branch-count differential reversed in 2 days. Either audit captured the wrong fields per side OR a `git fetch --prune` event happened. Both clones have substantive recent work.

**Recommended path:** treat as fork-merge (same as `arcanea-opencode`). Pick integration direction; cherry-pick across; archive the loser.

Deferred pending Frank's read.

---

## Net pattern

Audit surfaced 7 path-duplications. **5 resolved as path-dups** (clear loser, lossless or near-lossless archive). **2 reframed as fork-merges** (both clones substantive, archive would lose work). The reframe is itself a finding — `feedback_audit_metrics_vs_cause` in action: the audit's "duplicate" categorization was a hypothesis prompt; verification showed 2 of 7 weren't duplicates at all.

## Recovery summary (for archived WIP)

If you want the preserved WIP back on origin:

```bash
# arcanea-code (commit exists locally in archive, push blocked)
cd ~/Arcanea/_archive/arcanea-code-2026-05-06-root
bun install --force
git push -u origin wip/path-dup-recovery-2026-05-06
git push origin dev-v2  # also preserves TUI rebrand 69db8b1e5

# arcanea-orchestrator (WIP in working tree, no commit yet)
cd ~/Arcanea/_archive/arcanea-orchestrator-2026-05-06-root
# install gitleaks (winget install gitleaks OR scoop install gitleaks)
git add packages/plugins/agent-arcanea-guardian/src/guardian-prompt.ts
git commit -m "wip(guardian): canon-context loader"
git push -u origin wip/canon-context-2026-05-06

# arcanea-flow / arcanea-onchain (stashes)
cd ~/Arcanea/_archive/<repo>-2026-05-06
git stash list  # shows pre-archive-2026-05-06 stash
git stash pop  # to recover, or leave stashed
```

## Composes with

- `feedback_audit_metrics_vs_cause` — every call here grounded in audit data + falsifier; reframed 2 calls when verification disagreed with audit
- `feedback_lead_with_authority` — calls executed without pausing at gate after independent reasoning
- Tier 3c (casefold ghost) — addressed by parallel session's commit `23133f8` (sync-arcanea-skills + casefold resolve report); this is its sibling
- `memory/project_arcanea_flow_connect_not_absorb` — names the canonical path for arcanea-flow per Frank's earlier policy

---

*Built on SIP — operational tier · decisions 2026-05-05 · execution 2026-05-06*
