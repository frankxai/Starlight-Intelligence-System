# Agent Operations Contract — 2026-08-29

> How the agent fleet manages Frank's GitHub estate: quality gates, healing bounds,
> production paths, and the routine spine. Operational-tier (no substrate files touched).
> Companion change: `frankxai/FrankX` PR #149 (pr-steward-daily spec + registry drift check).

## Scope: tiers, not the whole estate

Blanketing all ~44 repos with automation on day one produces noise, not quality. The
fleet operates in tiers; a tier earns automation by having CI worth healing.

| Tier | Repos | Automation level |
|---|---|---|
| **1** | frankx.ai-vercel-website · FrankX · Starlight-Intelligence-System · agentic-creator-os · claude-skills-library | Full: daily PR steward, healing, auto-ready for content |
| **2** | gencreator.ai · arcanea-ai-app · ai-music-academy | Event-driven only (PR subscriptions per session) |
| **3** | Everything else | Pull-based: agents act when asked, no standing automation |

Promotion between tiers is a deliberate edit to this file, not an accident.

## The four standing decisions

**1. Orchestration home is this repo.** Starlight is already the routing/governance
substrate; ops contracts live in `docs/ops/`, routine specs live with the registry in
`FrankX/docs/ops/SCHEDULED-ROUTINES.md` (its documented source-of-truth role).

**2. Deployment is hybrid, per existing repo contracts.** Agents always work on
branches and open draft PRs. On green CI: content-only changes (`content/`, `docs/`,
`data/`, `public/`) get marked ready automatically; anything touching `app/`,
`components/`, `lib/`, `scripts/`, or config stays draft for Frank's one-click merge.
No agent merges to a production `main`. No GitHub Actions deploy jobs — Vercel's git
integration is the deployer (per frankx.ai-vercel-website CLAUDE.md).

**3. Healing is aggressive but bounded.** Auto-fix lint/format/types/failing tests and
re-push, at most 3 cycles per PR per day; after that, one comment naming the failure
with a proposed patch. Never auto-revert. Never skip, disable, or quarantine a test to
get green. Never push empty commits to kick CI.

**4. Cross-repo sync is a swept judgment call, not a webhook.** FrankX → prod syncs
port deltas surgically (prod files diverge — e.g. `ResearchShell.tsx`); that requires
reading both sides, so sync runs as agent work inside sessions and stewards, never as
blind push-triggered automation.

## Routine spine — live-state findings (2026-08-29)

Checked the account's live triggers against `FrankX/docs/ops/SCHEDULED-ROUTINES.md`:

- **Registry drift:** the registry documents 7 routines; the account holds ~21 recurring
  ones (`estate.*`, `cfo.*`, `tomi.*`, `noroshi.*` families undocumented there). Needs
  reconciliation so the fleet's "source of truth" claim stays true.
- **Health flags:** three enabled routines ended their last run ABANDONED —
  `estate.tomi.morning-brief.daily` (08-28), `frankx.noroshi.newsletter-prep.weekly`
  (08-28), `frankx.tomi.content-sweep.weekly` (08-24). If the next runs repeat this,
  their prompts/environments need inspection.
- **The acting gap:** `estate.pr-digest.daily` observes; nothing heals. The
  `pr-steward-daily` routine (spec + paste-ready prompt in FrankX PR #149) closes it.
  Agent-side creation was attempted and rolled back: this org strips MCP connectors
  from API-created routines, and a steward without GitHub tools is a void loop.
  Creation is a one-click Frank action at https://claude.ai/code/routines.

## Non-negotiables carried from repo contracts

- Hard stops stay human: force-push to production main, `/papa/` edits, irreversible
  migrations, key rotation, newsletter blasts, social auto-posting.
- Durable-output-sink law applies to every standing automation: PR, committed file,
  or Slack DM — never report-only into run history.
- Substrate-tier changes in this repo still go through `/starlight-board` before
  commit/tag; nothing in this contract weakens that gate.
