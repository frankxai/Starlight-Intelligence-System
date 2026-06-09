---
type: decision-required
tier: 5c
sprint: 2026-W19
date: 2026-05-04
queen: SIS-tab
target: Frank
status: awaiting-decision
---

# Tier 5c — `starlight-agent-lab` decision

> Per W19 Tier 5c: "starlight-agent-lab — push to GitHub or kill (local-only since 2026-04-24, no remote) | SIS queen | 0.5h". SIS queen inspected; decision needs Frank.

## Current state

| Field | Value |
|---|---|
| Path | `C:\Users\frank\starlight-agent-lab` |
| Last commit | 2026-04-24 (10 days ago) |
| Commits total | 1 — `chore: initialize starlight-agent-lab` |
| Local branches | `main` |
| Remote | **none configured** |
| Working-tree state | 4 untracked items: `.agents/`, `.claude/`, `.continue/`, `skills-lock.json` |
| Layout (cockpit) | `cockpit-zellij/layouts/starlight-agent-lab.kdl` (auto-generated; valid) |

## Why SIS queen flagged this for Frank's call (not autonomous push)

The 4 untracked items include `.agents/`, `.claude/`, `.continue/` — these are agent / IDE config directories that may contain:

- API keys
- Personal session state
- Private agent definitions not yet ratified for substrate-public

Pushing to public GitHub without Frank's explicit ratification would violate:

1. **Sovereignty principle** (`SIP § 5` posture) — sovereign owns what gets published when
2. **Privacy framework** (`feedback_privacy_split` memory) — public substrate, private/ for instance state
3. **Karpathy hygiene** (`don't take destructive actions as shortcuts to make obstacles go away`) — pushing config dirs is not reversible once public

## Three options

### Option A — Push as private repo
- Create `frankxai/starlight-agent-lab` as **private** GitHub repo
- Push `main` (1 commit, no untracked work)
- Add `.gitignore` for `.agents/`, `.claude/`, `.continue/`, `skills-lock.json` if those should stay local-only
- Pros: backed up, accessible from another machine, version history preserved
- Cons: requires Frank to confirm that nothing in the existing single commit is private

### Option B — Push as public repo
- Same as A but public
- Pros: contributes to OSS narrative if the agent-lab work matures into substrate
- Cons: 4 untracked items WILL leak if not gitignored carefully; potential agent / IDE config exposure
- **Not recommended** until Frank reviews exact contents

### Option C — Keep local-only + add `.gitignore` to prevent future leak
- Add proper `.gitignore` so the 4 untracked items don't accidentally get committed
- Document the local-only intentionality in repo README
- Defer push decision to a future sprint
- Pros: zero blast radius, Frank's call preserved
- Cons: not backed up; if laptop fails, work is lost

## SIS queen recommendation

**Option A (private push) + Option C's `.gitignore`** as the conservative path. Specifically:

1. Frank decides whether the existing single commit (`chore: initialize starlight-agent-lab`) contains anything private. The commit is small + non-substantive (initialization), so likely fine for private push.
2. Add `.gitignore` covering `.agents/`, `.claude/`, `.continue/`, `*.lock.json` to prevent future leak
3. Create private GitHub repo, push, done

If Frank wants the substrate-tier "publicly visible labs" narrative later, the repo can be flipped to public after content review. Going private-first is reversible; going public-first is not.

## What SIS queen needs from Frank

| Decision | Default if silent |
|---|---|
| Option A / B / C? | Option C — add .gitignore, defer push to next sprint |
| If push: private or public? | private |
| Should the existing 4 untracked items be gitignored? | yes |

## Auto-action SIS queen took

**None.** This decision sits with Frank. Document filed at this path; W19 sprint doc will reference. SIS queen does NOT touch `~/starlight-agent-lab` autonomously.

## Why this matters for portfolio

`starlight-agent-lab` is one of 4 `starlight-*` repos (per audit cluster). Its push-vs-archive decision sets a precedent for other lab/experimental local-only repos in the portfolio. Establishing the conservative pattern here (private-first, gitignore-second, public-later-after-review) carries forward.

---

*Built on SIP — operational tier · decision-required artifact · 2026-05-04*
