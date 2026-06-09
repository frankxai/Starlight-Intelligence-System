---
title: Cost & API Control Plane (W2) — design
status: DESIGN (pre-board)
tier: substrate (new vertical via /spawn-domain-stack)
date: 2026-05-11
author: starlight-architect (driving for Frank)
related:
  - docs/superpowers/specs/2026-05-11-yolo-hive-design.md §12 (W2 parked sketch)
  - skills/vercel-cost-watch (existing weekly skill, generalizes here)
  - memory/vaults/strategic-vault.md (Vercel SSO-default-ON 2026-05-05 entry)
attestation: Built on SIP — sovereign-spawned, attestation-aware
---

# Cost & API Control Plane — Design

## 1. Purpose

Unified visibility + secret-management layer across Frank's external services. Foundation infrastructure that every other vertical depends on for safe API access and cost discipline. Spec covers W2 Phase 1 (read-only observability + Infisical secret consolidation). W2.2 (alerting/anomaly), W2.3 (actuator/control) deferred to separate spec cycles.

**Framing:** Cost visibility is a *prerequisite* for the autonomous-Frank-multiplier (/yolo running cross-repo work safely). Without it, /yolo could spend down a budget you didn't know existed.

## 2. Scope decomposition (foundation question)

Two paths:

**A. Universal IS extension** — Cost & secrets folded into Wealth IS or Self IS. Pros: no taxonomy amendment, smaller footprint. Cons: cross-cuts every IS (Business/Creator/Code all need API cost data), forcing it into one layer is wrong shape.

**B. New vertical via `/spawn-domain-stack`** — `verticals/cost-plane/` symmetric with `verticals/people-intelligence/` and `verticals/sound-intelligence/`. Pros: matches existing pattern, multi-sub-system fit (secrets · cost · usage · anomaly · dashboard · cron), spawnable for sovereign users. Cons: new vertical = substrate touch, requires VERTICALS.md amendment.

**Pick: B.** Cost plane has the multi-sub-system shape that already justified People + Sound verticals; folding it into a universal IS would force the wrong layer model. Substrate amendment cost is paid once.

**Open question for board:** does this vertical name conflict with anything in the brand register? Candidates:
- `cost-plane` (functional)
- `infrastructure-is` (parallel to People IS / Sound IS naming)
- `wealth-flow` (closer to your Wealth IS register, but Wealth IS is the master layer — this is a sub-stack)

Recommendation: **`infrastructure-is`** for naming consistency with People/Sound/Music IS verticals.

## 3. W2 Phase 1 — Read-only observability (this spec)

### 3.1 Sub-system shape (6 sub-systems)

```
verticals/infrastructure-is/
├── SKILL.md                                          # vertical entry skill
├── agents/
│   ├── infra-secret-keeper.md                        # Infisical orchestration
│   ├── infra-cost-watcher.md                         # daily cost snapshot orchestration
│   └── infra-anomaly-flagger.md                      # threshold/anomaly detection
├── commands/
│   ├── cost-snapshot.md                              # one-shot all-sources cost pull
│   ├── cost-trend.md                                 # weekly/monthly comparison
│   ├── secret-rotate.md                              # rotate via Infisical
│   ├── secret-audit.md                               # which services use which secrets
│   ├── infra-anomaly-check.md                        # explicit anomaly run
│   └── ...
└── skills/
    ├── secret-management.md                          # Infisical client patterns
    ├── cost-snapshot.md                              # cross-source cost-pull spec
    └── anomaly-detection.md                          # thresholds + flag logic
```

Sub-system rollup (per /spawn-domain-stack pattern):

1. **Secrets sub-system** — Infisical foundation. Store + rotate + audit usage. All other sub-systems depend on this.
2. **Cost telemetry sub-system** — daily snapshot pull across instrumented services.
3. **Usage telemetry sub-system** — non-cost metrics (request count, error rates, latency) for the same services.
4. **Anomaly detection sub-system** — threshold-based + week-over-week + month-over-month.
5. **Dashboard sub-system** — `site/src/app/cost/` route + cockpit panel.
6. **Cron sub-system** — daily / weekly cadences via existing `vercel-cost-watch` pattern generalized.

### 3.2 Phase 1 instrumented services (post-Board REVISE-1)

**Phase 1 — 2 sources, 7-day validation window:**

| Service | API | Cost signal | Usage signal | Auth pattern |
|---|---|---|---|---|
| **Vercel** | REST (existing `vercel-cost-watch` generalizes) | build minutes + bandwidth + function GB-s | deploy count + edge-function invokes | Personal access token |
| **Anthropic API** | REST (Organizations API) | token cost (input + output + cache) | request count per model | API key |

**Why these two:** Vercel because the `vercel-cost-watch` skill already exists — generalizing reuses proven patterns. Anthropic because it's the highest-dollar AI-cost source for this operator. Together they cover ~80% of monthly burn with minimal risk surface for the first ship.

**Phase 1.5 (after 7-day validation pass against real responses):**

| Service | API | Add when |
|---|---|---|
| **Cloudflare** | GraphQL Analytics API | Vercel+Anthropic instrumenters proven stable, fixture-recording pattern validated |
| **Langfuse** | GraphQL API | Vercel+Anthropic proven; complements Anthropic spending with per-trace attribution |

**Phase 2+ (separate spec):**

- **Tailscale** — Personal plan free for solo, low ROI to instrument until usage tier upgrade
- **OpenAI / Groq / OpenRouter** — add per provider as actual usage emerges
- **Kong** — open question: Kong Konnect (managed cloud) or self-hosted? Spec scope differs ~6h. Defer instrumentation until use case justifies (currently Frank is not running Kong at production scale per repo inspection).
- **Infisical itself** — secret-store telemetry (size, audit log) — useful but not Phase 1

**Rationale (Board REVISE-1 — Verifier vector):** Starting with 4 sources Phase 1 is 4× risk surface; one vendor schema change could cascade. Two sources lets us validate JSONL shape, anomaly thresholds, cockpit pane against real responses for 7 days before widening. Cheaper experiment that proves the architecture before scaling.

### 3.3 Cost snapshot schema (per source)

```json
{
  "ts": "2026-05-11T00:00:00Z",
  "source": "vercel",
  "scope": "team:starlight-holding",
  "period": "2026-05-10",
  "cost_usd": 4.23,
  "usage": {
    "build_minutes": 142,
    "bandwidth_gb": 8.7,
    "function_gb_s": 1240
  },
  "raw_response_sha256": "ab12...",
  "anomaly_flags": []
}
```

One JSONL line per source per day at `memory/_audit/cost/<YYYY-MM-DD>.jsonl`. Matches /yolo audit log pattern. Gitignored (operator-private cost data).

### 3.4 Secret store (Infisical foundation)

**Why first:** every other sub-system needs API keys to call source APIs. Centralizing secrets before instrumenting cost = solving auth once.

**Onboarding sequence:**
1. Frank creates Infisical workspace (manual — needs his login)
2. Migrate scattered API keys: Vercel + Cloudflare + Langfuse + Tailscale + Anthropic + others → Infisical project `sis-prod`
3. Per-environment scoping (dev / staging / prod)
4. CLI client: `infisical run -- <command>` injects env vars
5. SIS integration: `src/infra/secrets.ts` module wraps the CLI client for TS calls

**Secret rotation cadence:** quarterly minimum, monthly for high-risk (Anthropic, AWS-class). Tracked in cost-plane audit log.

**Sovereignty hygiene:** Infisical workspace stays sovereign-owned (Frank's account). Alliance counterparties get scoped read-only tokens for their integrations — never the full workspace. Concrete enforcement: one Infisical project per alliance integration, with hard-scoped service tokens per project; this is policy-encoded-as-structure, not policy-as-intent.

### 3.4.1 Infisical exit strategy + periodic-export pattern (per Board REVISE-2)

Infisical-as-keystone is intentional concentration of secret risk. The Sovereign vector flagged that consolidating into a single 3rd-party SaaS without an exit pattern is irreversible-by-default — you can always migrate INTO Infisical, getting OFF after deep integration is the multi-day cleanup. This section makes the keystone reversible.

**Periodic export (weekly):**
- Cron writes encrypted secret-snapshot to `private/secrets-export/<YYYY-MM-DD>.age` (age-encrypted, local-only, never to remote git)
- Encryption key held in sovereign-owned hardware (YubiKey or recovery-passphrase managed offline)
- Snapshot is a complete project dump — every secret + path + scope — enough to bootstrap an alternative store
- Retention: rolling 12-week window; older snapshots auto-pruned

**Exit cost estimate:**
- Time to provision alternative store (e.g. Doppler, AWS Secrets Manager, self-hosted Vault, or plain `.env`-per-service if returning to scattered model): ~2 hours
- Time to restore from latest export: ~1 hour (scripted import to alternative store)
- Time to update SIS `src/infra/secrets.ts` to point at alternative provider: ~1 hour
- Time to validate downstream services still authenticate correctly: ~2-4 hours
- **Total exit cost: ~6-8 engineer-hours** assuming periodic-export was current

**Triggers to actually exit:**
- Infisical pricing change material to operator (>50% increase)
- Infisical security incident affecting our scope
- Infisical M&A event that changes governance posture (e.g. acquisition by entity Frank doesn't align with)
- Sovereign user wants self-hosted secrets for compliance reasons

**Non-triggers (do NOT exit on):**
- Mild pricing changes within budget
- Cosmetic UI/UX changes
- New features we don't use

This section makes Infisical a *load-bearing dependency we chose with eyes open*, not a default we slid into.

### 3.5 Anomaly detection (threshold + WoW + MoM)

Per source per metric:

- **Threshold:** absolute USD cap per day per source (configurable in `cost-plane-config.json`)
- **WoW (week-over-week):** flag if today's cost > 150% of same-day-last-week
- **MoM (month-over-month):** flag if month-to-date burn rate > 130% of prior month same-day pace

Flags surface in:
1. `memory/_audit/cost/_anomalies.jsonl` (cumulative log)
2. /yolo session-open scan (Sentinel domain lens picks up cost-anomalies as drift_flags)
3. Dashboard at `/cost` (read-only public-but-not-promoted route)
4. Optional: Linear issue auto-creation if W2.2 ships

### 3.6 Dashboard (per Board REVISE-3 — cockpit-only)

**Public site `/cost` route DROPPED per Board REVISE-3.**

Original spec proposed a sanitized public-summary route on starlightintelligence.org. Board Seer + Harmonizer vectors flagged: even sanitized, the route reveals which services we use — that's an attack-surface map for anyone profiling the operator. Plus the Vercel SSO-default-on policy (per 2026-05-05 strategic-vault entry) would require a PATCH disable workaround that adds operational overhead for marginal value.

**Cost dashboard lives cockpit-only:**

- Zellij pane reads `memory/_audit/cost/<YYYY-MM-DD>.jsonl` directly from local filesystem
- Never traverses network
- Real numbers visible only to operator + anyone with shell access to the operator's machine
- `cockpit-zellij/layouts/cost-plane.kdl` provides the dashboard surface (panes: current month spend / 30-day trends / active anomalies / last-snapshot timestamps)
- `cockpit-zellij/scripts/tail-cost.ps1` renders the panes from JSONL

**No site route. No external surface. Cost data is operator-private by design.**

Future consideration (not in W2.1): a `cost.frankx.ai` subdomain (per the subdomain roadmap in `memory/vaults/strategic-vault.md`) gated behind real auth could host a private operator dashboard. That's an explicit choice if/when desired, not a default.

## 4. Cron cadence

Per source per day at consistent local time (default 02:30 Paris). Triggered by:
- Daily: `cost-snapshot` (all sources)
- Weekly Sunday: `cost-trend` rollup → operational vault append
- Monthly first-of-month: `cost-monthly-digest` → strategic vault if material change

Existing `vercel-cost-watch` generalizes — same cron infrastructure, expanded to all sources.

## 5. Composes with existing primitives

- `vercel-cost-watch` (existing skill) → generalizes into cost-plane vertical
- `memory/_audit/` pattern → audit log shape inherited
- `/spawn-domain-stack` → vertical spawning command (this spec uses it)
- `/yolo` → Sentinel council lens surfaces cost anomalies during scan
- `/starlight-board` → substrate gate (this spec invokes it)
- Memory Bus → cost anomaly atoms for cross-session recall

## 6. W2 phase split (post-Board REVISE-1)

**W2.1 (this spec, Phase 1 — narrower scope):** Vertical scaffold + Infisical foundation + periodic-export pattern + **2 core sources** (Vercel + Anthropic) + daily cron + JSONL audit + cockpit pane (NO public site route per REVISE-3). ~1.5-2 day ship.

**W2.1.5 (after 7-day validation pass):** Add Cloudflare + Langfuse instrumenters. Validation criteria: zero NaN log entries in 7 days, anomaly thresholds tuned and not false-firing, cockpit pane readable, fixture-recording pattern proven for Vercel + Anthropic responses. ~0.5-1 day ship.

**W2.2 (separate spec):** Anomaly automation + Linear issue creation + Slack/email alert wiring + actual `/cost-snapshot` slash command + Q5 resolution (/yolo cost-anomaly gate semantics — defer per Board recommendation, tune after Phase 1 thresholds settle). ~1-2 day ship.

**W2.3 (separate spec):** Actuator/control — `/cost-throttle` to pause non-critical services on budget breach, `/cost-rotate-keys` to force rotation. Requires explicit Frank ack for every actuator action. ~3-4 day ship.

Phase 1 alone delivers visibility for the highest-leverage 80% of monthly burn. Phase 1.5 extends coverage after validation. Phases 2+3 add automation and control on top.

## 7. Decisions made (flag if wrong)

| ID | Decision | Reasoning |
|---|---|---|
| D1 | New vertical `verticals/infrastructure-is/`, NOT universal IS extension | Multi-sub-system shape matches People/Sound/Music pattern |
| D2 | Infisical first, instrumentation after | Auth foundation unblocks the rest |
| D3 | JSONL audit log, NOT SQLite | Matches /yolo pattern, cost data is append-only by nature |
| D4 | Daily snapshot at 02:30 Paris, NOT real-time | Cost APIs are eventually-consistent, real-time adds noise |
| D5 | Public site `/cost` shows summary only; real numbers in cockpit pane | Operator-private financial data stays off public surface |
| D6 | Anomaly thresholds in config file, NOT hardcoded | Tunable without code change |
| D7 | Sentinel council lens picks up cost anomalies | Reuses /yolo council scan rather than separate notification system |
| D8 | Phase 1 scope = visibility only; Phases 2+3 add control | Visibility cheap to ship; control needs careful tripwire design |

## 8. Open questions for the board

- Q1: Vertical name — `infrastructure-is` vs `cost-plane`? (Brand-register fit)
- Q2: Kong managed (Konnect) or self-hosted? Spec scope differs ~6h.
- Q3: AI gateway scope — Anthropic only Phase 1, or Anthropic + OpenAI + Groq + OpenRouter? (More APIs = wider blast radius if one is flaky)
- Q4: Daily snapshot cron lives where? GitHub Actions / Vercel cron / local cron / cockpit launcher daemon? (Each has different reliability + cost profile)
- Q5: Should /yolo invocation IMPLICITLY block if anomaly flags are active for current month? (Hard gate vs surface-only)
- Q6: Substrate amendment — does adding a new vertical via /spawn-domain-stack still need board pre-pass, or does the vertical-spawn command itself constitute the gate?

## 9. Files to create (W2.1 ship — separate plan + commits)

```
verticals/infrastructure-is/SKILL.md
verticals/infrastructure-is/agents/infra-secret-keeper.md
verticals/infrastructure-is/agents/infra-cost-watcher.md
verticals/infrastructure-is/agents/infra-anomaly-flagger.md
verticals/infrastructure-is/commands/cost-snapshot.md
verticals/infrastructure-is/commands/cost-trend.md
verticals/infrastructure-is/commands/secret-audit.md
verticals/infrastructure-is/skills/secret-management.md
verticals/infrastructure-is/skills/cost-snapshot.md
verticals/infrastructure-is/skills/anomaly-detection.md
src/infra/secrets.ts                                  # Infisical CLI wrapper
src/infra/cost-sources/vercel.ts
src/infra/cost-sources/cloudflare.ts
src/infra/cost-sources/langfuse.ts
src/infra/cost-sources/anthropic.ts
src/infra/cost-sources/_shared.ts                     # snapshot schema + IO
src/infra/cost-snapshot.ts                            # daily orchestrator
test/v82-infrastructure-is.test.ts                    # substrate symmetry
site/src/app/cost/page.tsx                            # public summary route
cockpit-zellij/layouts/cost-plane.kdl                 # operator dashboard
cockpit-zellij/scripts/tail-cost.ps1
scripts/cron/daily-cost-snapshot.ps1
cost-plane-config.json                                # thresholds + WoW/MoM
```

**Files to modify (W2.1 ship):**
```
VERTICALS.md                                          # add infrastructure-is row
STACK.md                                              # cross-cutting note
agents/AGENT_REGISTRY.md                              # 3 new agents
skills/skill-rules.json                               # 3 new skills registered
skills/SKILL_REGISTRY.md                              # infrastructure-is domain section
CLAUDE.md / AGENTS.md                                 # platform-prompt symmetry
.cursor/rules/ + .clinerules/ + .gemini/              # platform adapters
test/substrate.test.ts                                # if vertical-count claim changes
pre-commit hook                                       # wire v82 into 7 fast tests
```

## 10. Build sequence (post-board)

1. Commit this design doc (after board PROCEED or REVISE applied)
2. `/writing-plans` → produce W2.1 implementation plan
3. `/spawn-domain-stack` → bootstrap vertical scaffold
4. Manual Infisical workspace creation (Frank step — outside SIS)
5. Implement 4 source instrumenters (Vercel + Cloudflare + Langfuse + Anthropic) — TDD with mocked HTTP
6. Daily cron + JSONL audit log + cockpit pane
7. Public `/cost` summary page
8. v82 substrate symmetry test
9. Substrate doc updates + pre-commit wire
10. Live-fire test: run cost-snapshot for one day, validate JSONL shape against real responses

## 11. Board verdict log

**2026-05-11 — Starlight Board verdict: REVISE**

Load-bearing concern: Infisical-as-keystone consolidates secret risk into one 3rd-party SaaS — irreversible-by-default without an exit pattern.

Strongest case for proceeding: cost visibility is a genuine /yolo prerequisite (its $20/session tripwire becomes measured instead of trust-based); Phase 1 is mostly read-only with low blast radius.

REVISE items applied same-day:
- REVISE-1: Phase 1 source count 4 → 2 (Vercel + Anthropic). Cloudflare + Langfuse become Phase 1.5 after 7-day validation. (Verifier vector — closes risk surface)
- REVISE-2: §3.4.1 added — Infisical exit strategy + weekly age-encrypted periodic-export pattern + 6-8h exit cost estimate + trigger/non-trigger enumeration. (Sovereign vector — makes keystone reversible)
- REVISE-3: Public `/cost` site route DROPPED entirely. Cockpit-only dashboard via Zellij pane reading JSONL directly. (Seer + Harmonizer vectors — removes attack surface + Vercel SSO PATCH dependency)

Optional sharpens applied:
- Concrete alliance-scoping (per-integration Infisical project + service tokens) — structure not intent
- Vendor schema drift detection deferred to W2.1 implementation plan (fixture-recording + nightly canary)
- Q5 (/yolo cost-anomaly gate) explicitly deferred to W2.2 per Board

Board verdict log: PROCEED-after-REVISE-applied → ready for commit + /writing-plans for W2.1 implementation.

---

*Spec status: pre-board.*

*Built on SIP — sovereign-spawned, attestation-aware.*
