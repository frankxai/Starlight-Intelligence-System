# AUTOMATION HEALTH — portfolio automation layer audit

> Synthesized 2026-08-14 from three parallel audits (agentic-ops-hub fleet audit, FrankX
> scheduled-routines doctrine audit, GitHub Actions CI sweep across 5 key repos) plus
> first-hand incidents lived by this session. Companion to `UPGRADE_ROADMAP.md`; the
> doctrine source of truth for cloud routines remains `FrankX/docs/ops/SCHEDULED-ROUTINES.md`.
>
> Ordering principle: the failure modes that hide other failures come first.

---

## The structural finding

Almost every liveness monitor in the fleet is **self-referential**: topology-health-pulse,
host-watchdog, and the Telegram pulses all run ON C940; event-driven CI stops running
when pushes stop; cloud routines have no heartbeat consumer. When a machine or lane goes
dark, the alarms go dark with it — **silence reads as health**. Every major incident in
this audit (newsletter-friday's six green-but-void weeks, model-arena's unactioned STOP,
arcanea's daily sync cron dying silently on 2026-07-27, the C940 exact-head publisher
stalling PR #460 for 3+ days) is an instance of the same pattern.

The fix pattern is the inverse: schedule checks OFF the machine they watch, and make the
*absence* of a signal cause an alert. First instance shipped this session:
**agentic-ops-hub#42** (`scripts/fleet_watch.py` + 6-hourly GitHub Actions cron) — checks
heartbeats (24h), ops-ledger sweep (72h), and queue TTLs, and upserts a durable GitHub
issue on failure. Its first dry-run correctly flagged three real stale signals (c940
heartbeat 2026-08-07, yoga-book 2026-08-06, ledger sweep >72h).

---

## Findings by system (ranked by severity)

### 1. FrankX cloud routines (7 CCR routines)

| Finding | Evidence | State |
|---|---|---|
| `model-arena-daily` is a confirmed void loop still firing | STOP verdict 2026-07-08, never actioned; ~100k tok/day (~3M/mo) with no output sink and duplicating the hand-curated public Model Arena | 🔴 **Frank-only** — agents cannot disable web-created routines ("Agents can only update routines they created") |
| No watchdog/heartbeat on the routine fleet | newsletter-friday ran green for 6 weeks writing an unparseable draft (fixed upstream 2026-08-05); nothing notices a failed or silent run | 🔴 gap — trajectory JSONL substrate for a meta-watch already exists (`TRAJECTORY-MEMORY.md`, shipped) |
| Sinks asserted, not schema-verified | Durable-output-sink law checks output *lands*, not that a consumer *can read it* — exactly how newsletter passed the letter while failing the spirit; only the newsletter has a validator now | 🟡 extend `validate.mjs` pattern to fanout drafts + dependency-audit |
| C940 / exact-head review lane documented **nowhere** | `grep -rn "C940\|exact-head"` across FrankX docs/.claude = zero hits; violates the repo's own registry principle ("a routine not in the table is invisible to the fleet") | 🔴 gap — same failure mode that hid Vercel Cost Watch for 2 months |
| Adaptive scheduling designed, unbuilt | `ADAPTIVE-SCHEDULING.md` v0.4 plan (nextRun emission + hourly dispatcher) unshipped; contradicts SCHEDULED-ROUTINES.md on research-pulse cadence | 🟡 resolve the contradiction before building |
| Registry freshness = discipline, not mechanism | Nothing diffs `list_triggers` against the table; drift caught only by human audits | 🟡 trivial mechanical check possible |

### 2. agentic-ops-hub fleet bus

Dead-man's-switch gap **closed by #42** (draft, this session): off-machine liveness watch
+ TTL enforcement on active queue items (fail-closed `item_is_expired`, `require_ttl`
in CI). Residual: the flagged stale heartbeats/ledger themselves need C940 back online
to refresh — Frank-side.

### 3. GitHub Actions CI (5-repo sweep, runs through 2026-08-13)

**Healthy:** agentic-ops-hub (87 runs, effectively all green), frankx.ai-vercel-website
CI proper, SIS main (two dead guards noted below), agenticincome.

**arcanea is the problem repo:**
- `Cross-Repository Synchronization` (daily cron) failed 100% of its visible history,
  then **stopped firing entirely after 2026-07-27** — broken *and* silently dead.
- `Arcanea Test Suite` red on main since ~Feb 2026; `Deploy Arcanea Applications` last
  green 2026-02-22; `Arcanea MVP CI/CD` red — three perma-red checks on every PR train
  everyone to ignore CI red (alarm-fatigue: a real regression would look identical).
- `claude.yml` fires on every issue comment then skips — the 30 most recent main-branch
  runs are all skipped noise (1,219 main runs, mostly this).
- Dormant/broken: Publish Packages (red 2026-05-31), Packages CI (red 2026-06-23),
  Sync Canonical Lore (silent 5.5 months).

**Other repos:**
- SIS: `sip-starter-release.yml` has **0 runs ever** (release tags never pushed);
  `content-drift-check` failed both of its only runs and was never reconciled.
- agenticincome: monthly `knowledge-freshness` cron failed its only firing (2026-08-01,
  stale files → exit 1) and sits unactioned; Sept 1 will fail again.
- frankx.ai-vercel-website: Dependabot fails 3–5×/day with `security_update_not_possible`
  on 6 pinned packages (hono, @hono/node-server, nanoid, dompurify, adm-zip, js-yaml) —
  known vulns unpatched + red-noise on main.

### 4. Session-infrastructure defects (first-hand, this session)

- **send_later loss/lag:** one trigger fired (`run_once_fired`) but the message never
  arrived; others arrived 6+ min late. Compensation now standard: single-active-loop
  rule embedded in every check-in prompt (older prompts = no-op, never double-arm).
- **C940 exact-head publisher stall:** frankx.ai#460 fully green and review-hardened,
  blocked ≥3 days solely on the external "Command Center / exact-head review" status
  that only C940 can post. No SLA, no watchdog, no documented lane (see §1).
- **Vercel sprawl:** duplicate SIS project `starlight-intelligence-system`
  (`prj_KWkVbpOpyrQUAU7Q4Bl333yB04UE`) is 20/20 ERROR including "production" — pure
  noise; real project is `site`. Team has 50 projects with heavy scratch sprawl.

---

## Self-healing playbook (ranked; agent-doable unless marked)

1. ☑ **Off-machine dead-man's switch for the ops-hub fleet** — shipped as ops-hub#42.
   The template: scheduled Actions cron + read-only checks over git-versioned state +
   durable-issue sink. Reuse for any future lane.
2. ☐ **Routine-fleet meta-watch** (FrankX): a CCR routine created *by an agent* (so
   agents can maintain it) reading `data/workflow-trajectories.jsonl` for missed/failed
   runs → Slack DM. Substrate already shipped; this closes doctrine gap #1.
3. ☐ **Schema-verified sinks**: extend the `scripts/newsletter/validate.mjs` pattern to
   research-fanout drafts and dependency-audit output; name dependency-audit's sink in
   the routines table (the only unnamed row).
4. ☐ **Registry drift check**: mechanical diff of `list_triggers` output vs the
   SCHEDULED-ROUTINES.md table; fail loudly on any live trigger missing a row.
5. ☐ **Document the C940 exact-head lane** in SCHEDULED-ROUTINES.md (owner, cadence,
   stall behavior, what to do after N hours of silence) — or formally record that the
   lane is manual-only so its stalls stop being surprises.
6. ☐ **arcanea CI triage**: delete-or-fix decision per perma-red pipeline (Test Suite,
   Deploy, MVP CI/CD, Cross-Repo Sync), add workflow-level `if` filter to `claude.yml`'s
   comment trigger. Until then arcanea CI certifies nothing.
7. ☐ **Actioned-audit rule**: any cron that is itself an audit (knowledge-freshness,
   content-drift-check) must have a named owner-loop that consumes its failures;
   an audit nobody reads is a void loop with extra steps.

## Frank-only levers (agents structurally cannot do these)

1. **Disable `model-arena-daily`** at https://claude.ai/code/routines — web-created
   routines are only updatable by their creator. ~18–36M output tokens/year of waste.
2. **Delete the duplicate Vercel project** `starlight-intelligence-system`
   (prj_KWkVbpOpyrQUAU7Q4Bl333yB04UE, 20/20 ERROR) and cull scratch projects
   (deleting projects is destructive → human gate).
3. **Restart/repair the C940 publisher + heartbeats** — c940 and yoga-book heartbeats
   stale since 2026-08-07/06; frankx.ai#460 is merge-ready the moment the exact-head
   review posts.
4. **Dependabot pins** on frankx.ai-vercel-website: 6 packages need lockfile-major
   decisions (or explicit dependabot ignores) to clear daily red-noise + real vulns.
5. Standing from earlier waves: LEMON_SQUEEZY_* / POLAR_* env vars, catalog flips,
   exclusivity/privatization decisions, Wave 3 URL/SEO approvals.

**Built on SIP — Starlight Intelligence Protocol**
