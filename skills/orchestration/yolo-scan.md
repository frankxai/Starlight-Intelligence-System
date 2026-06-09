---
name: yolo-scan
description: Council-shared scan skill — each council member invokes this with their domain lens to scan active repos and return structured move-proposal packets. Used inside /yolo session opens by all 7 agents in parallel.
type: orchestration
domain: orchestration
substrate-tier: true
shared-by: [starlight-architect, starlight-sentinel, starlight-sage, starlight-navigator, starlight-weaver, starlight-prime, starlight-orchestrator]
---

# yolo-scan Skill — Council Domain Scan

## Activation

Invoked by `yolo-conductor` (during /yolo session open) or directly by Frank for diagnostic. Parameterized by `domain` field — that's what makes it council-shared instead of seven separate skills.

## Inputs

```yaml
domain: <architect|sentinel|sage|navigator|weaver|prime|orchestrator>
repos: <list of repo names from private/yolo-scope.json filtered by phase-in>
signals_dir: ~/.claude/projects/*/memory/  # Cross-Repo Indexer corpus
budget_ms: 60000
```

## Domain lens (what each domain looks for)

| Domain | Looks for |
|---|---|
| architect | infra, scaling, file-contract drift, repo structure, dep gaps, build/deploy health |
| sentinel | security, vuln, secret leak, supply chain, governance gap, exposure surfaces |
| sage | memory drift, vault staleness, knowledge consolidation needs, audit-log readability |
| navigator | strategic priority, roadmap drift, trade-off windows, horizon-alignment |
| weaver | creative/narrative, brand-register drift, missed surface, voice consistency |
| prime | synthesis opportunities, conflicting decisions to reconcile, cross-domain integration |
| orchestrator | workflow gaps, automation opportunities, dispatch wins, cross-repo coordination |

## Output schema (return this structured JSON, not prose)

```json
{
  "domain": "<input domain>",
  "scanned_repos": ["repo1", "repo2", ...],
  "duration_ms": 12345,
  "moves": [
    {
      "title": "Ship Cost Control Plane Phase 1 — Infisical foundation",
      "repo": "Starlight-Intelligence-System",
      "cross_repo": [],
      "leverage_score": 9,
      "blast_radius": "med",
      "est_effort_hours": 6,
      "rationale": "Unblocks W2/W3/W4 subsystems; secrets needed everywhere; foundation-class build",
      "domain_lens": "architect"
    }
  ],
  "drift_flags": [
    "memory/vaults/operational-vault.md last touched 5d ago — pipeline observable but consolidation cron not firing"
  ],
  "idle_signals": [
    "frankx-fix-ci branch unchanged 14d — stale work?"
  ],
  "truncated": false
}
```

## Scoring guidance

- `leverage_score` 1-10: how much downstream impact this unlocks (10 = foundational; 1 = cosmetic)
- `blast_radius`: low (single file, local) / med (multi-file, repo-local) / high (cross-repo or user-facing) / substrate (touches file-contract enumeration in spec §7.3)
- `est_effort_hours`: honest engineer estimate, no padding
- `domain_lens`: which lens caught this — required for unanimity badge dedup downstream

## Scan techniques per domain

All scans use `Read`, `Glob`, `Grep`, `Bash` (for `git log` / `git status` / `git diff` on listed repos), and `mcp__memory-bus__memory_recall` for cross-session signal. Within `budget_ms`; if budget elapses, return partial packet with `truncated: true`.

**architect lens:** check `package.json` deps freshness, `tsconfig.json` strictness, `dist/` state vs `src/` mtime, recent build failures, CI workflow files.

**sentinel lens:** grep for hardcoded secrets, check `.env*` git-ignore status, audit `npm audit`-like outputs (best-effort), look for try/catch swallowed exceptions, check public-API surface drift.

**sage lens:** check `memory/vaults/*.md` mtime, scan `memory/CONSOLIDATION_LOG.md` for cron last-fire, look at audit-log buildup in `memory/_audit/`, check Memory Bus index freshness.

**navigator lens:** read `memory/vaults/strategic-vault.md` for declared horizons, check whether recent commits align with horizons, identify drift between intent and execution.

**weaver lens:** check brand-register consistency (Arcanea vs Starlight per strategic-vault), audit voice consistency in recent docs, look for missed creative surfaces (untouched site pages, stale README).

**prime lens:** look for two decisions in different files/commits that contradict each other, surface synthesis opportunities, identify cross-domain integration gaps.

**orchestrator lens:** check `cockpit-zellij/layouts/` for stale workspaces, scan command surface for redundancy, look for manual workflow that could automate via existing skills.

## Hard rules

- Return JSON only (parseable). Conductor will reject prose-mode returns.
- Honor `budget_ms` — return `truncated: true` if you ran out of time.
- Honor phase-in: if `repos` list is just one repo, scan only that one. Do NOT widen.
- Surface drift even if you have nothing else — empty `moves` is acceptable; empty `drift_flags` after a real scan is suspicious.

---

**Built on SIP** · `yolo-scan` skill · v1.0.0
