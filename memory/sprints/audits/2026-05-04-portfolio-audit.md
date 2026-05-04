---
name: SIS Portfolio Audit — 2026-05-04
description: 6-track parallel audit covering substrate integrity, public site health, deps+security, skill ecosystem, cockpit hardening, GitHub portfolio hygiene
type: audit-report
date: 2026-05-04
sprint: 2026-W19
methodology: 6 parallel general-purpose subagents, read-only verification, ≤800 words each
---

# Portfolio Audit — 2026-05-04

> 6-track parallel audit run after Frank's "audit first, suggest massive action, lead this for me" directive. Each track was a non-overlapping read-only scan of one risk class. This document is the synthesis of record.

## Track summary

| Track | Verdict | Top finding |
|---|---|---|
| A — Substrate integrity | **PARTIAL** | 7 of 10 universal-IS verticals are README+MEMORY stubs; conformance harness only guards the 4 Domain Sub-Stack reference verticals |
| B — Public site health | **MIXED** | 2 of 7 sites dark-deployed (gencreator.ai + vibeclubs.ai = 404); FrankX flagship + Arcanea both missing "Built on SIP" attestation |
| C — Deps + security | **NEEDS WORK** | postcss CVE-2026-41305 in 5 of 7 repos; FrankX has 6 CRITICAL CVEs; Arcanea lockfile broken (ERR_PNPM_LOCKFILE_CONFIG_MISMATCH) |
| D — Skill ecosystem deeper | **PARTIAL** | 25 of 56 SIS skills have no frontmatter; cross-repo drift is unidirectional Arcanea-only (ACOS perfectly mirrored) |
| E — Cockpit hardening | **NEEDS WORK** | 10 ship-ready patches; scheduled task still broken (bare pwsh.exe in task action) despite manual recovery succeeding |
| F — GitHub portfolio hygiene | **ACTIONABLE** | 26 PRs (12 mergeable now), 39 dead repos, 7 failing CI; nextgpt archive auto-closes 5 PRs aged 482-552d |

**Positive signals:** 529/529 substrate tests pass · 100% SIP attestation in May-2026 sample · Memory orchestrator + Cross-Repo Indexer healthy and fresh · No phantoms in skill-rules.json · v76 conformance harness 12/12 green · ACOS-substrate perfect mirror.

## Reversals from prior assumptions (important — re-anchor before action)

1. **`lucide-react@^1.8.0` is NOT a typo.** Package recently went 0.x → 1.x; v1.14.0 latest. Arcanea apps/web is correctly on new major. **frankx.ai-vercel-website + FrankX are the laggards on ^0.468.0.** Tier 1c risk inverts.
2. **AnimeLegends.ai is NOT a Node project** — no package.json, only Lighthouse JSON. Whatever shipped in 2026-05-03 motion choreography is in another framework. Sweep S4/S5 don't apply the way I framed.
3. **Substrate stub problem is 7 verticals, not 3.** Wealth, Self, Business, Creator, Second Brain, Brand are also README+MEMORY stubs alongside Code IS / Voice & Video IS / Family.
4. **Plugin count was overstated ~12x.** Yesterday's audit said 698 vercel plugin skills; reality is ~57 across 4 plugins.
5. **Cross-repo skill drift is unidirectional Arcanea-only.** ACOS is a perfect mirror; only Arcanea is stale. Manifest-based consumption architecture is over-engineering — replace with simple sync script.
6. **CI is failing across 7 repos**, including production deploy on frankx.ai-vercel-website (3-consecutive failures). New risk class I hadn't scoped.
7. **Cockpit scheduled task still broken** even though manual launch works. Earlier recovery agent over-claimed success — `~/.starlight/logs/` doesn't exist on this machine, confirming the logon trigger hasn't fired green since rebuild.

## Critical findings by class

### Security (Audit C)

| CVE / Issue | Severity | Affected repos | Fix |
|---|---|---|---|
| postcss < 8.5.10 (CVE-2026-41305 XSS) | moderate | Arcanea, frankx.ai, FrankX, SIS-site, gencreator.ai (5 of 7) | single version bump |
| basic-ftp CRLF injection (transitive via puppeteer) | **CRITICAL** | FrankX | `npm audit fix` resolves; verify puppeteer is actually used |
| @modelcontextprotocol/sdk cross-client data-leak | high | FrankX | `npm audit fix` |
| uuid < 14 (GHSA-w5hq-g745-h8pq) | moderate | Arcanea, frankx.ai, FrankX (transitive via @azure/identity) | upstream bump |
| Arcanea lockfile mismatch (`ERR_PNPM_LOCKFILE_CONFIG_MISMATCH`) | medium (CI break) | Arcanea | `pnpm install --no-frozen-lockfile` reconcile |
| AnimeLegends.ai `.env.local` at root | unknown — review | AnimeLegends.ai | confirm gitignore + check committed history |

**Total CVEs:** FrankX 33 (6 critical) | frankx.ai 28 | Arcanea 9 | gencreator 6 | agentic-creator-os 4 | SIS-site 2

### Public site health (Audit B)

| Site | HTTP | Attestation | Health | Action |
|---|---|---|---|---|
| animelegends.ai | 200 | ✅ | 9/10 | add `lang="en"` (5min) |
| starlightintelligence.org | 200 | ✅ | 8/10 | ship `/robots.txt` + `/sitemap.xml` (1h) |
| frankx.ai | 200 | ❌ | 7/10 | footer SIP attestation + reduce 5 H1s → 1 (45min) |
| arcanea.ai | 200 | ❌ | 6/10 | OG tags + decide SIP cross-link policy (1h) |
| library-os | (frankx.ai/library) | inherits | 6/10 | inherits frankx.ai fix |
| **gencreator.ai** | **404** | n/a | **1/10** | **investigate ownership + ship deploy (urgent)** |
| **vibeclubs.ai** | **404** | n/a | **1/10** | **investigate ownership + ship deploy (urgent)** |

### Substrate integrity (Audit A)

- Universal-IS verticals: 7 of 10 are README+MEMORY stubs (Wealth, Self, Business, Creator, Second Brain, Brand, Family + the 3 already known: Code IS, Voice & Video IS).
- Domain Sub-Stack tier (people, sound, music-is, energy): all 4 PASS full 7-file contract.
- CLAUDE.md says "9 universal IS layers"; STACK.md locks 10. Doc drift.
- declared-loads-audit Defect 1 OPEN since v7.5.1: luminor-board.md line 10 declares non-existent `starlight/AGENTS.md`.
- v76 conformance harness 12/12 green.

### Skill ecosystem (Audit D)

- 31 of 56 SIS skills have FM (55%). 25 don't.
- People IS asymmetric: 3 of 6 skills have FM, 3 don't.
- skill-rules.json: 0 phantoms, 18 disk-orphans (intentional Anthropic-FM-native).
- 3 activation conventions coexist (Anthropic FM, custom triggers block, prose-only H2).
- Cross-repo drift: ACOS perfectly mirrored to user/.claude/skills/, Arcanea is the lone drifter (3/5 sample stale).

### Cockpit hardening (Audit E)

10 ship-ready patches with exact line numbers. Highest leverage:
1. `Resolve-Tool` preflight in start-cockpit.ps1:28 (catches PS7/python/node/npm/workdir absence)
2. `cockpit-launch.cmd` shim with `where pwsh ‖ powershell.exe` fallback (closes today's failure mode)
3. Task Scheduler XML: battery=false + absolute pwsh path + RestartOnFailure 2→5
4. `.env` precedence: `~/.starlight/.env` (base) → project `.env` (override)
5. Port-owner verification (don't bind if foreign process owns the port)

Hidden landmine: fnm-shimmed node likely next silent failure once #2 lands.

### GitHub portfolio (Audit F)

- **26 open PRs** across portfolio. 12 mergeable now (mostly dependabot in arcanea-ai-app + SIS).
- **39 dead repos** not archived (>120d since push).
- **7 repos with failing CI**, including frankx.ai-vercel-website production deploy.
- **FrankX has 17 open issues**, 16 >90d old, all unlabeled.
- **3 public repos missing essential metadata** (SIS LICENSE, vibe-os-substrate LICENSE, frankx.ai-vercel-website description).
- Sprint footer adoption: 2/10 (only SIS so far — sibling tabs haven't opened yet).

## Ranked massive-action plan (8 sweeps, ~85-105h distributed)

### Tier 0 — Ship today (~3-4h, no board, no risk)

| # | Action | Where | Time |
|---|---|---|---|
| 0.1 | Cockpit task re-registration with absolute `pwsh.exe` path + `cockpit-launch.cmd` shim | E patches #5+#6 | 30m |
| 0.2 | CLAUDE.md "9 IS" → "10 IS" | 1-line fix | 2m |
| 0.3 | declared-loads-audit Defect 1: luminor-board.md path | 1-line fix | 2m |
| 0.4 | Add LICENSE to SIS (MIT) + vibe-os-substrate (MIT) | 2 files | 10m |
| 0.5 | Add description to frankx.ai-vercel-website + sis | 2 metadata edits | 10m |
| 0.6 | Archive `nextgpt` (auto-closes 5 stalled PRs aged 482-552d) | gh CLI | 2m |
| 0.7 | Merge SIS PR #4 (gha-actions group, 1d) | gh CLI | 5m |
| 0.8 | Close arcanea-ai-app PR #33 (superseded `feat/pnpm-v6`) | gh CLI | 2m |
| 0.9 | postcss bump across 5 affected repos (CVE-2026-41305) | per-repo `npm/pnpm update postcss` | 1h |
| 0.10 | Approve `luminor-v77-memory-bus` board (revisions applied) | Frank-only, frontmatter edit | 5m |

### Sweep S1 — Substrate v8.0 Authoring (revised)

**Recommended:** **Lighter Contract Pivot** for universal-IS verticals — declare README + MEMORY core as canonical for universal-IS layer, document at `verticals/_template/`, extend v76 test to enforce. Stop claiming "live" on stubs that aren't full contract. ~6-8h.

Authoring full 7-file contract for all 7 stub universal-IS verticals would be 50-60h and displaces higher-leverage work. Defer to organic demand.

**Energy IS 7 agents** stays on the schedule (board-passed 2026-05-03, unblocks PV-Lager): 8-12h.
**SIP § 5 sovereignty clause amendment** stays: 2h drafting + board pre-pass.

### Sweep S2 — Skill Ecosystem Reset (revised)

| Action | Time |
|---|---|
| Decide canonical FM schema (recommend: keep both, require `description:` everywhere) | 30m |
| Backfill FM on 25 legacy SKILL.md files (`description: "Use when..."` minimum) | 3-4h |
| Backfill FM on 3 asymmetric People IS skills | 30m |
| Extend v76 test to assert FM presence on every skill | 1h |
| Document 18 intentional disk-orphans (music-is, sound-is) as accepted convention | 30m |
| Sync Arcanea-repo skills from upstream (one-shot script, not manifest) | 2h |
| Resolve `arcanea` vs `Arcanea` casefold ghost | 2h |

**Total: ~10-11h.** Manifest-based consumption deferred (over-engineering given drift is 1-way only).

### Sweep S3 — arcanea-ai-app Branch Reset

**Owned by Arcanea-tab via existing handover packet.** Updated scope:
- Lockfile reconciliation FIRST (`pnpm install --no-frozen-lockfile`) before merging dependabot
- Then 5 dependabot PRs merge (#50/#52/#53/#54/#74) — 15min
- Then i18n PR
- Then prod-deps #75 (now lower-risk after lockfile fix)
- Voice-branch decision gate (Frank)
- multi-luminor-sprint rebase

**Total: 12-14h** (lockfile fix shaves ~2h off original estimate).

### Sweep S4 — Public Site Excellence Pass (revised)

| Site | Action | Time |
|---|---|---|
| animelegends.ai | add `lang="en"` | 5m |
| starlightintelligence.org | ship `/robots.txt` + `/sitemap.xml` | 1h |
| frankx.ai | footer SIP attestation + reduce 5→1 H1s + investigate 3-cycle CI failure | 90m |
| arcanea.ai | OG tags + SIP cross-link decision (your call) | 1h |
| library-os | inherits frankx.ai | 0 |
| gencreator.ai | investigate dark deploy + ship | 1-3h |
| vibeclubs.ai | investigate dark deploy + ship | 1-3h |

**Total: 6-12h** (gencreator + vibeclubs depth depends on what you find).

### Sweep S5 — Dependency + Security Reset

| Action | Time |
|---|---|
| postcss CVE bump cross-portfolio (Tier 0.9 above) | 1h |
| FrankX `npm audit fix` (resolves most of 33 vulns including 6 critical) | 1h |
| FrankX puppeteer dead-code check (basic-ftp comes via puppeteer transitive) | 30m |
| frankx.ai `npm audit fix` (28 vulns, no --force needed) | 30m |
| React 18→19 cutover for FrankX + frankx.ai (defer to W20 — risky) | DEFER |
| TS 5→6 portfolio cutover (defer to W20 — accumulating, not critical) | DEFER |
| Arcanea lockfile reconciliation (Tier 0 + S3 prerequisite) | 30m |
| `.nvmrc` parity to Node 22 across all repos | 30m |
| AnimeLegends.ai `.env.local` security audit (review gitignore + git log for leaks) | 30m |

**Total: 4-5h shippable now.** React 19 + TS 6 majors deferred.

### Sweep S6 — GitHub Portfolio Triage

Quick-win list from Audit F (~3h):
- 5-PR dependabot merge cluster in arcanea-ai-app (after S3 lockfile fix)
- nextgpt archive (Tier 0)
- 10-repo archive batch (Arcanea-Labs, frankx-website, arcanean-library, lobe-chat-foRk, claude-code-mcp, 5 numbered nextjs duplicates)
- FrankX 17-issue triage
- Branch deletion sweep in SIS (13 → 3 branches)
- LICENSE + description metadata fixes (Tier 0.4 + 0.5)

**Total: 3-4h.**

### Sweep S6.5 — CI Failure Cluster (NEW)

7 repos with failing CI:
- frankx.ai-vercel-website (CI 3-consecutive — **production deploy blocker**) — investigate + fix: 2h
- arcanea-ai-app (Quality Gate + Lighthouse, gates PR #78) — 1h
- AnimeLegends (CI 3+) — 1h
- arcanea (Cross-Repository Synchronization scheduled) — 30m
- FrankX (Video Inbox Sync scheduled) — 30m
- dpi (CI + Release Artifacts) — 30m
- SIS (Vercel deploy — known: pin/secrets) — defer to next deploy

**Total: 4-6h.**

### Sweep S7 — Cockpit Operational Hardening

10 ship-ready patches from Audit E. Highest leverage 9 (defer #10 supervisor to v7.5.4):

**Total: ~2.5h.**

### Sweep S8 — Cross-Repo Distribution Resolution

5 filed packets:
- 3 board-gated: copilotkit (PASS 2026-05-03 — ready to dispatch), calculator-pattern (PASS 2026-05-03 — ready), pv-lager (gated on Energy IS authoring — S1)
- 2 manual: FrankX-pricing-and-sprint-landings, ACOS-productization

**Total: 4-6h** (mostly distributed across sibling tabs via handover packets).

## Total massive-action effort

| Sweep | Hours | Who | Gate |
|---|---|---|---|
| Tier 0 (ship today) | 3-4 | SIS Queen | none |
| S1 (substrate v8.0 — Lighter Contract Pivot) | 12-15 | SIS Queen | board pre-pass × 2 |
| S2 (skill ecosystem reset) | 10-11 | SIS Queen | none |
| S3 (arcanea-ai-app branch reset) | 12-14 | Arcanea-tab | none |
| S4 (public site excellence) | 6-12 | distributed | none |
| S5 (deps + security reset) | 4-5 | distributed | none |
| S6 (GitHub portfolio triage) | 3-4 | SIS Queen + tabs | none |
| S6.5 (CI failure cluster) | 4-6 | distributed | none |
| S7 (cockpit hardening) | 2.5 | SIS Queen | none |
| S8 (cross-repo distribution) | 4-6 | distributed | board pre-pass × 1 |

**Total: 60-89.5h.** Down from original 97-130h estimate after audit-informed scope reduction. Distributed across SIS Queen + 8 sibling tabs over 5-7 calendar days = 8-15h/day per active tab. Realistic for the week.

## Forks for Frank

1. **S1 posture: Lighter Contract Pivot vs Full Authoring Sprint?** Recommend Pivot (6-8h vs 50-60h, doesn't displace higher leverage work).
2. **S5 React 19 / TS 6 cutover scope this week?** Recommend defer both to W20 (risky majors, no critical CVE driver).
3. **S6 archive sweep aggressiveness?** Recommend 10 this week (high-confidence dead), flag remaining 29 for your review.
4. **GitHub Projects board creation now?** Recommend yes — 5min UI step, sweep mirror lights up live for the rest of the week.
5. **gencreator.ai + vibeclubs.ai dark-deploy:** investigate + ship, OR retire the domains? Recommend investigate first — both have active local repos that just didn't reach DNS.

## Definition of done for the week

- [ ] All Tier 0 items shipped
- [ ] 3 boards pre-passed (S1 Energy IS deploy + S1 SIP § 5 + S8 distribution)
- [ ] Sweeps S2/S3/S4/S5/S6/S6.5/S7 each have at least one shipped commit by Friday
- [ ] arcanea-ai-app branch count 19 → ≤5
- [ ] Zero public sites returning 404
- [ ] Zero CRITICAL CVEs portfolio-wide
- [ ] All 7 currently-failing CI workflows either green or explicitly parked with un-park trigger
- [ ] Friday `/weekly-recap` written

---

*Built on SIP — operational tier · audit-of-record · 2026-05-04 · all 6 tracks read-only*
