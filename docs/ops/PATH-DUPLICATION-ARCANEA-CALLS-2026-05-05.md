---
type: decision-document
date: 2026-05-05
queen: SIS-tab
sprint: 2026-W19
tier: 3c.bis (path canonicalization)
status: 2 calls made, 5 deferred to Frank
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

## Calls made by SIS queen

### Call 1 — `starlight-intelligence-system` (lcase) → ARCHIVE

**CALL: Archive `~/Arcanea/starlight-intelligence-system/` (the lcase fork). Canonical is root `Starlight-Intelligence-System` (this repo).**

Reasoning:
- Root is active (0 days), 8 uncommitted (real WIP), 19 GB of substrate work
- Arcanea/ copy is 31 days stale, 0 dirty, 0 unpushed — nothing to recover
- It's a casefold artifact (Win/macOS case-insensitive filesystems made the duplicate possible; Linux would have raised it as a conflict)
- Cross-Repo Indexer is currently double-counting — archive will drop atom count ~5-10%

Action when ready (Frank approves or no contradicts):
```bash
mv ~/Arcanea/starlight-intelligence-system ~/Arcanea/_archive/starlight-intelligence-system-2026-05-05
```

Falsifier: the lcase fork has uncommitted work or a different remote that's substrate-load-bearing. Verified false: 0 dirty, 0 ahead.

### Call 2 — `arcanea-flow` → CANONICAL is `~/arcanea-flow` (root)

**CALL: Canonical = `~/arcanea-flow` (root, 32 days, 6 dirty, 0 unpushed). Archive `~/Arcanea/arcanea-flow` (67 days, 1530 dirty, 1 unpushed) AFTER recovering the +1 commit.**

Reasoning:
- Root is more recent (32 vs 67 days)
- Root has manageable dirty (6 files vs 1530)
- Arcanea/ copy has 1530 uncommitted + 1 unpushed — that's the v3 deletion mess from earlier sprint
- Per `memory/project_arcanea_flow_connect_not_absorb.md`: "Sibling repo at C:\Users\frank\arcanea-flow. SIS owns substrate; arcanea-flow owns swarm/hooks/RL execution." — root path is canonical per memory

Recovery sequence before archiving Arcanea/ copy:
1. `cd ~/Arcanea/arcanea-flow && git diff main` — review the 1530 dirty
2. If the dirty is dead deletions: `git stash; git tag archive/2026-05-05-pre-archive` then archive
3. If the +1 unpushed is substantive: cherry-pick into root, push, then archive Arcanea/

Falsifier: the +1 unpushed Arcanea/ commit is something the root doesn't have AND should ship. Worth ~10 min of `git diff` to verify before archive.

---

## Deferred to Frank (5 calls — genuinely ambiguous from audit data alone)

For each, audit data shows close-to-tied. Picking canonical needs `git log`/`git diff`/README review the audit didn't do.

### `arcanea-code`

| Field | `~/` | `~/Arcanea/` |
|---|---|---|
| Days | 42 | 32 |
| Dirty | 6 | 1 |
| Unpushed | 1 | 0 |

**Tradeoff:** Root has unpushed work (preserve); Arcanea/ is more recent. **Defer pending:** read both READMEs + recent commits to determine if same repo with drift OR semantically-different forks.

### `arcanea-onchain`

| Field | `~/` | `~/Arcanea/` |
|---|---|---|
| Days | 67 | 77 |
| Dirty | 1 | 2 |
| Unpushed | 1 | 0 |

**Tradeoff:** Root has unpushed work AND is more recent — leans canonical. But both are stale (60+ days). **Defer pending:** decide if active or archive both.

### `arcanea-opencode`

| Field | `~/` | `~/Arcanea/` |
|---|---|---|
| Days | 32 | 32 |
| Dirty | 0 | 0 |
| Unpushed | 0 | 1 |

**Tradeoff:** Both clean except Arcanea/ has 1 unpushed. **Defer pending:** verify what the unpushed Arcanea/ commit is. If substantive → Arcanea is canonical. If trivial → root is canonical.

### `arcanea-orchestrator`

| Field | `~/` | `~/Arcanea/` |
|---|---|---|
| Days | 44 | 32 |
| Dirty | 3 | 1 |
| Unpushed | 0 | 0 |

**Tradeoff:** Arcanea/ is more recent and cleaner. **Recommended canonical:** `~/Arcanea/arcanea-orchestrator`. **Defer pending:** Frank confirms; recover root's 3 dirty before archive.

### `oh-my-arcanea`

| Field | `~/` | `~/Arcanea/` |
|---|---|---|
| Days | 32 | 19 |
| Dirty | 13 | 0 |
| Unpushed | 0 | 0 |
| Remote branches | 18 | 80 |

**Tradeoff:** Arcanea/ has 80 remote branches (vs root 18) — strongly suggests Arcanea/ is the upstream-tracking canonical and root is a feature-branch worktree. **Recommended canonical:** `~/Arcanea/oh-my-arcanea`. **Defer pending:** Frank confirms; recover root's 13 dirty before archive.

---

## Net pattern

The audit lifted the curtain on 7 path-duplications. **2 are clearly resolvable** (calls made above). **5 need eyes-on `git diff` before a destructive action** — those defer to Frank. Together: ~30 min of focused work + Frank's read on 5 cases closes Tier 3c.bis.

## Composes with

- `feedback_audit_metrics_vs_cause` — every call here is grounded in audit data + a falsifier
- Tier 3c (casefold ghost) — already addressed by parallel session's commit `23133f8` (sync-arcanea-skills + casefold resolve report); this is its sibling
- `memory/project_arcanea_flow_connect_not_absorb` — names the canonical path for arcanea-flow per Frank's earlier policy

## What to do with this doc

- Frank reviews 5 deferred calls
- Each deferred call gets a "Frank approves: yes / no / different" line added to this doc
- SIS queen executes the archives in a follow-up session (single batch — safer than 7 separate ones)

---

*Built on SIP — operational tier · 2026-05-05*
