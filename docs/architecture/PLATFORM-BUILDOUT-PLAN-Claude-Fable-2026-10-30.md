# Starlight Platform build-out plan

Author: Claude Fable 5.1 (Claude Code desktop session 81992b24). Date: 2026-10-30. Revision: 1, unreviewed.
State: PROPOSED. Every ruling below is a proposal until Frank writes RULED against it.
Sources: `starlight/TRUTH.md` §2 (ladder, stack, platform rulings of 2026-10-22), `starlight/AGENTS.md`
§4, §5, §5e, §13, the Claude memory notes of 2026-10-19..29, Vercel and Cloudflare documentation read
live on 2026-10-30, and the measurements in §1 (each names its command).

## 0. The decision

One platform, three operating agents, built in this order:

1. **Converge and activate** (this week). Land the six pieces that are already cross-reviewed and
   green, open the Cloudflare primitives the ladder needs (Workers for Platforms namespace, startup
   credits), and stop opening PRs in the four repos that are over budget.
2. **`platform.starlightintelligence.ai` v1 on Cloudflare** (week of 2026-11-02). API, MCP, OAuth
   and the tenant dispatcher. The public site, storefront and docs stay on Vercel.
3. **Three agents that run the estate** (weeks of 2026-11-02 and 2026-11-09):
   the **Software Factory** builds (eve fork, Kernel receipts, disposable cloud sandboxes);
   the **Vercel Frontman** runs the 60 Vercel projects (deploy health, releases, cost, previews);
   the **Agent Factory** observes both, writes the architecture decisions, and owns the session
   roster. It decides; it does not deploy.
4. **System 0** sits in front of every LLM call: Cloudflare's Clef family and Clairic on Workers AI,
   Typesafe's Jev through Vercel AI Gateway. Typed questions in, probabilities out. Routing, admission,
   "is this done", and field extraction stop costing reasoning tokens.
5. **The laptop is the cockpit, not the factory.** Measured today: 289 MB free RAM, interactive
   work only. Every build, test and review in this plan runs in a cloud sandbox, a cloud session or a
   Railway runner.

Why this order: the ladder (`TRUTH.md` §2) sells managed agent teams on an isolated tenant with a
Kernel receipt. The tenant runtime skeleton exists and passed review, but nothing is deployed, the
Kernel is still private, and the reviewed storefront PRs are unmerged. Converging what exists is worth
more this week than any new surface.

## 1. Where we are, measured 2026-10-30

| Fact | Value | Method |
|---|---|---|
| Cloudflare Workers on the account | 8 (`starlight-cloud-worker`, `starlight-fleet-ingress`, `starlight-execution-dev`, `starlightintelligence-vinext-pilot`, `frankxai-ci-wake`, `vis-media`, `arcanea-reader`, `wurzelwerk-api`) | `workers_list` MCP |
| Workers for Platforms dispatch namespace | none | memory note 2026-10-29, `workers_list` shows no dispatcher |
| D1 databases | 2, both 0 tables | memory note 2026-10-29 |
| Vercel projects, team Starlight Intelligence | 60 on the first page, more behind the cursor | `list_projects` MCP |
| Products graph rows | 26; price evidence "none yet" on every row | `node -e` over `graph/products.graph.json` |
| Agent-native MCP surfaces | 8 scored; 6 at 100, `arcanea-mcp` 36, `starlight-memory` 29 | `graph/agent-surfaces.graph.json` |
| Open PRs vs budget 10 | SIS 62 · starlightintelligence.ai 22 · command-center 19 · agentic-ops-hub 106 · agent-config 47 · kernel 4 · factory 2 · playbooks 2 · eve-lab 1 | `logs/digests/pr-budget.json`, generated 2026-10-29 05:30Z |
| Tenant platform skeleton | `services/starlight-tenant-platform` on `agent/claude/wfp-tenant-skeleton` @83de5b2, 24 tests, Codex PASS round 4, not deployed, no PR | memory note 2026-10-29, worktree read |
| Decision-plane client (Jev + Clef-omni, one wire shape) | `agentic-influencer-os#1` draft, 56 tests, never called live | memory note 2026-10-21 |
| Software factory fork | `Starlight-Intelligence/starlight-factory` (eve 0.67.2 fork), Railway S1 on PR #1, `docs/engineering/EXPECTATIONS.md` written | repo read |
| Website software factory registry | Grok branch `agent/grok/website-software-factory` in SIS: 7 surfaces, 6 seats, checker + tests | `git show` |
| Observatory | 40+ routes incl. `/operator`, `/constellation`, `/brain`; hosted mode staged on `agent/claude/observatory-hosted` | repo read, memory 2026-10-28 |
| Starlight Kernel | receipts, maker≠grader, Apache-2.0 prepared on `agent/claude/license-apache2`; repo still private, npm 404 | memory 2026-10-19..22 |
| Claude Max plan usage | weekly all models 61 % (resets 2026-11-01 04:00Z), Fable 2 %, extra usage off | `get_usage` |
| Machine | 289 MB free RAM, CPU 79 %, preflight ALLOW for interactive only | `pp preflight --workload interactive` |

Live platform facts read on 2026-10-30 (Vercel and Cloudflare docs):

- Cloudflare: Containers and Sandboxes GA since 2026-04-13; Sandbox SDK 1.0 (2026-09-30) is controlled from
  your own Durable Object, with snapshots; Workers OAuth Provider v1 (2026-10-01) splits authorization
  server and MCP resource server over a service binding and supports MCP 2026-07-28; Clef and Clef-flash
  (2026-10-01), Clef-omni with audio and video (2026-10-09, Clef-flash at $0.038 per M input tokens),
  Clairic extraction (2026-10-19); Workers for Platforms has dashboard namespace management and
  per-request dispatch props; Workflows can be pinned to a jurisdiction (2026-10-27); agent traces follow
  OpenTelemetry GenAI conventions and bill into Observability from 2026-12-01; vinext is the recommended
  Next.js path on Workers and is beta; MCP server portals ship Code Mode on by default.
- Vercel: eve agents deploy with `withEve` beside a Next.js frontend and expose `/eve/<name>/v1/*`; Vercel
  Connect gives eve per-user grants to MCP servers (Linear shown); Agent Runs observability has MCP tools
  (`list_agent_runs`, `get_agent_run`); `durable-harness` runs Claude Agent SDK, Pi, fx or OpenCode on
  Vercel Sandbox with a durable session log; Workflow DevKit is `'use workflow'`; AI Gateway has model
  fallbacks, session affinity, routing rules (beta), decision models via `experimental_decide` with
  `gateway.decisionModel('typesafe-ai/jev')`, and a Claude Code base URL; Rolling Releases and
  Microfrontends have CLI support.

## 2. Target architecture: six planes

```
                     starlightintelligence.ai  (Vercel, Next 16)          ← Front plane
   buyer ───────────▶ site · /playbooks · /docs · /install · previews
   buyer's agent ───▶ /.well-known/starlight.json · llms.txt
                                   │
                                   ▼
          platform.starlightintelligence.ai  (Cloudflare Worker gateway)   ← Platform plane
          /v1/*  REST (Hono) · /mcp  (McpAgent) · /oauth (OAuth Provider v1 AS)
          D1 · KV · R2 · Vectorize · Workflows(EU) · Queues
                 │                              │
                 ▼                              ▼
   <tenant>.tenants.starlightintelligence.ai     mcp.platform…  skills + playbooks + receipts MCP
   Workers for Platforms namespace               Workers OAuth resource server
   TenantAgent (Agents SDK) + TenantLedger DO
   Sandbox SDK 1.0 container per job
                                   │
   ┌───────────────────────────────┴──────────────────────────────┐
   │  System 0  (Decision plane)                                   │
   │  starlight-decide Worker → Workers AI Clef / Clef-flash /     │
   │  Clef-omni / Clairic;  Vercel side → AI Gateway Jev           │
   │  typed questions: admit? tier? needs human? done? extract{}   │
   └───────────────────────────────┬──────────────────────────────┘
                                   ▼
   Reasoning plane: one gateway per side (Vercel AI Gateway · Cloudflare AI Gateway), Gemini via Google
   Proof plane:     Starlight Kernel receipts · craft receipts · mcp-doctor 100 · pr-gate maker≠checker
   Memory plane:    one vault · starlight-atlas engine (D1 + Access) · Observatory /brain · session-brief
   Observe plane:   Observatory (hosted) ← CF agent traces (OTel GenAI) + Vercel Agent Runs + constellation
```

### 2.1 Front plane (Vercel)

`starlightintelligence.ai` stays a Next 16 app on Vercel: public pages, the playbook storefront
(waitlist until a gate PASS, then Polar checkout), docs, `/install`, previews on every PR. The repo
question is open: `frankxai/starlightintelligence.ai` (project `starlightintelligence-ai`, 22 open PRs,
checkout on a Hermes checkpoint branch) versus `frankxai/starlight-intelligence-web` (Codex just merged
foundry domain routing with a `platform/` route). Grok's website-factory registry already names both and
rules the front door "nobody may claim the host until a preview review and a human domain cutover".
Proposal: `starlightintelligence.ai` repo keeps the apex; `starlight-intelligence-web` keeps nothing
public and becomes the source of the skills+playbooks MCP that moves to Cloudflare (§2.2). Frank decides.

Microfrontends and Rolling Releases are available and not needed yet; the Frontman proposes them when a
second team ships to the same host.

### 2.2 Platform plane (Cloudflare)

`platform.starlightintelligence.ai` is one gateway Worker with three jobs:

- **REST `/v1/*`** (Hono, typed with zod v4 schemas shared with the site): `/v1/health`,
  `/v1/receipts/verify` (Kernel verify behind an API, the free rung's public proof),
  `/v1/skills`, `/v1/playbooks`, `/v1/packages/:id/install/:harness`, `/v1/tenants/*` (lifecycle,
  admin token). D1 for records, KV for install manifests, R2 for artifacts.
- **MCP `/mcp`** as an Agents SDK `McpAgent` (Streamable HTTP), tools generated from the same zod schemas,
  scored by `mcp-doctor` at 100 before it is listed in `graph/agent-surfaces.graph.json`.
- **OAuth** with `@cloudflare/workers-oauth-provider` v1 split API: the gateway is the authorization
  server; each MCP resource server (skills, receipts, a tenant's agent) validates tokens over a service
  binding. Internal agents reach every estate MCP through one Cloudflare One MCP portal with Code Mode,
  so a harness sees one `code` tool instead of forty tool schemas.

Tenants: the existing `services/starlight-tenant-platform` skeleton, unchanged in design (tenant id from
hostname only, per-tenant token hash, ledger Durable Object reserves metered cost, one script per tenant
in the `starlight-tenants` dispatch namespace, `TenantAgent` per tenant, MCP OAuth tokens in the agent's
storage). Jobs that need a shell run in a Sandbox SDK 1.0 container owned by the tenant's Durable Object,
snapshot after each run, stopped on idle. Workflows pinned to the EU jurisdiction carry long deliveries.

Cost model stays the skeleton's: $5 Workers Paid + $25 Workers for Platforms fixed; CPU overage starts near
60 tenants; a 1 vCPU / 4 GiB sandbox is about $0.11 per active hour. Model tokens are the tenant's key.

### 2.3 System 0: the decision plane

The decision-plane client in `agentic-influencer-os#1` already speaks one wire shape (`state` plus typed
`questions`: choice, score, boolean) to both Jev and Clef-omni. It becomes a Worker, `starlight-decide`,
with four standing question sets every agent turn can call:

| Question set | Model | Used by |
|---|---|---|
| `admit`: is this request in scope, which tier (Haiku / Sonnet / Opus / Codex), does it need a human | Clef-flash (cheapest, hot path) | gateway, Factory intake, Frontman triage |
| `done`: does this artifact satisfy the stated acceptance contract | Clef | Factory before it asks for review; Kernel receipt names the decision |
| `extract{}`: typed fields from a screenshot, a receipt image, a QA capture | Clairic (images; PDFs are not supported, math goes to code) | Frontman preview QA, craft receipts |
| `observe`: what happened in this demo video or voice clip | Clef-omni (audio, video; licence unstated, so not in a paid customer path yet) | Observatory operator, content QA |

Vercel-side code (eve agents, the site) calls the same questions through AI Gateway's `experimental_decide`
with Jev, so one schema serves both clouds. No decision model generates text; everything that needs prose
goes to the reasoning plane after System 0 has said which model and whether a human is needed.

### 2.4 Reasoning plane

One gateway per side, nothing direct: Vercel AI Gateway for everything deployed on Vercel (fallback
chains, session affinity per agent run, routing rules when they leave beta, the Claude Code base URL for
cloud sessions), Cloudflare AI Gateway's unified REST for Workers. Gemini comes through Google. Model ids
and prices come from `starlight/intel/INTEL-BRIEF.md`, never from this document.

### 2.5 Proof plane

Every factory PR carries a Kernel receipt bound to its acceptance contract. Every public surface carries a
craft receipt (`tools/craft-receipt.mjs`). Every MCP surface scores 100 on `mcp-doctor`. Every merge goes
through `pr-gate` with a different vendor's signoff on the exact head SHA. These are the existing gates;
the plan adds no new one and removes none.

### 2.6 Memory and knowledge plane

One vault (`starlight-memory-vault`), one engine (`starlight-atlas`, repointed at the canonical vault in
PR #3, hosted on D1 behind Cloudflare Access), one screen (Observatory `/brain`). `session-brief.mjs`
injects repo purpose, lanes and focus at session start once the hook is installed (Frank's settings
change). gbrain stays the local keyword server until Frank rules whether atlas replaces it `[OPEN]`.
Temporal frontmatter (`valid_from`, `valid_to`) replaces any graph database idea on this RAM.

### 2.7 Observe plane

Observatory hosted (Vercel, Upstash snapshot push, decided 2026-10-20) is the one pane. New feeds:
Cloudflare agent traces (OpenTelemetry GenAI span names, exported from Workers Observability) and Vercel
Agent Runs (eve) land in `/constellation` next to the four local harnesses already wired. Cost: Vercel
billing API and Cloudflare usage into `/cost`. Agent-trace ingestion bills from 2026-12-01; budget it.

## 3. Placement matrix

| Capability | Where | Primitive | Status today | Why here |
|---|---|---|---|---|
| Public site, storefront, docs, PR previews | Vercel | Next 16, React 19, Tailwind 4, shadcn | GA; 71 `vercel.json` in repos | stack ruling; previews are the review surface |
| Playbook delivery and licence keys | Polar | MoR, private-repo benefit | PR #175 default-off | ruled 2026-10-22 |
| REST API `/v1/*` | Cloudflare | Worker + Hono + D1/KV/R2 | to build | stack ruling: edge data on Cloudflare |
| MCP endpoints | Cloudflare | Agents SDK `McpAgent`, OAuth Provider v1 | skills MCP exists as a Next route; port | one OAuth AS, service-binding validation |
| Internal MCP aggregation | Cloudflare One | MCP server portal, Code Mode | not set up | one tool instead of forty schemas |
| Tenants (managed teams) | Cloudflare | Workers for Platforms + Agents SDK + ledger DO | skeleton, reviewed, not deployed | platform ruling 2026-10-22 |
| Coding and job sandboxes | Cloudflare | Sandbox SDK 1.0 from the tenant DO | GA | snapshots, credentials stay in the Worker |
| Internal agent sandboxes (eve) | Vercel | Vercel Sandbox via durable-harness / eve | GA; `starlight-marketing` runs eve live | eve needs it for repo checkout |
| Durable workflows | both | Cloudflare Workflows (EU) · Workflow DevKit | GA / GA | one primitive per side |
| Media | Cloudflare | R2 (4 buckets), VIS index | live | R2 is the media default |
| Search and vectors | Cloudflare | Vectorize, AI Search; atlas FTS5 on D1 | partly | edge data ruling |
| Decision models | Cloudflare / Vercel | Workers AI Clef family, Clairic · AI Gateway Jev | client built, never called | System 0 |
| LLM gateway | both | Vercel AI Gateway · Cloudflare AI Gateway | AI Gateway used; CF gateway not | one gateway per side |
| Agent observability | both → Observatory | CF agent traces (OTel GenAI) · Vercel Agent Runs | not wired | one pane |
| Internal operating agents (Frontman, Factory) | Vercel | eve + Vercel Connect (Vercel MCP, GitHub, Linear, Slack) | eve-lab, starlight-marketing prove eve | ruled: eve for internal agents |
| CI | Railway + GitHub Actions | Railway runners pilot (gencreator), Actions under budget | live for gencreator; Vercel CI `[OPEN]` | cost |
| Payments | Polar | prepaid credits, default-off | PR #175 | money is Frank's; x402 Monetization Gateway requires a US seller, parked |
| Next.js on Workers | Cloudflare | vinext | pilot Worker exists; beta | not for the production site this quarter |
| Greenfield console app | Cloudflare | Vite + Void + shadcn + Agents SDK React | void-lab is empty | stack ruling: new Vite/Void apps on Cloudflare |

## 4. The three operating agents

### 4.1 Software Factory

Repo `Starlight-Intelligence/starlight-factory` (eve fork, MIT upstream, Railway S1 on PR #1) plus Grok's
website-factory registry in SIS (`foundry/factories/website-surfaces.json`, six seats, host-collision
rule) which merges as the factory's surface registry. Intake is a GitHub issue carrying the `factory` label
and an acceptance contract hash pre-registered in `starlight-evals`. The run: System 0 `admit` picks the
tier; the maker works one slice on `agent/<harness>/<scope>` in a disposable sandbox (Vercel Sandbox for
eve-driven runs, Cloudflare Sandbox for Workers code); System 0 `done` is asked before review; a different
vendor reviews the head SHA; the Kernel station (S3) writes the receipt; the PR opens as a draft. The
factory never merges, never deploys production, never turns on a payment provider. Definition of done is
`docs/engineering/EXPECTATIONS.md` in that repo.

### 4.2 Vercel Frontman

An eve agent, `agents/frontman` in `Starlight-Intelligence/eve-lab` (1 open PR, room to build), deployed
with `withEve`, connected through Vercel Connect to Vercel MCP, GitHub and Slack (Slack drafts only;
every send is Frank's). Standing jobs:

- Daily deploy-health digest across every project in the team: failed builds, runtime errors (`get_runtime_errors`
  then `get_runtime_logs`), domains, certificates.
- Foreign-deploy detection: a production deployment whose source is not a merged head (the Railway
  incident of 2026-10-21 was exactly this) is flagged, never reverted by the agent.
- Cost watch: billing charges against the measured baseline ($36.45 for 2026-10-15..28), build-CPU
  outliers, projects that should be paused (`parked.json`).
- Preview QA: Clairic reads the preview screenshot into typed fields (viewport, hero present, dead CTA);
  the canary skill checks console and Web Vitals deltas for the first 90 seconds after a deploy.
- Proposals, not actions, on production: promote, rollback, rolling release, pause. Frank or `pr-gate` executes.

### 4.3 Agent Factory

The forge that already exists (`tools/agent-forge.mjs`, specs under `ops/agent-factory/specs`), the
Observatory `/constellation` and `/harnesses` views, and the exec and steward ranks. It has three outputs:
ADRs for architecture (exec-cto, exec-caio), the session roster below, and a weekly receipt that reads the
other two agents' receipts and says what to stop. It holds no deploy or merge authority by design
(`money-write-authority` and the exec rank rules in `AGENTS.md` §9).

## 5. Stack rulings proposed

| # | Ruling | Reason |
|---|---|---|
| A | Domains: `starlightintelligence.ai` (Vercel) · `platform.` (Cloudflare gateway) · `<tenant>.tenants.` (Workers for Platforms) · `mcp.platform.` (MCP resource servers) · `console.` (Vite + Void tenant console on Workers) · Observatory on its Vercel hosted project | one host per job; DNS is Frank's |
| B | One gateway per side: Vercel AI Gateway on Vercel, Cloudflare AI Gateway on Workers; no direct provider calls | cost view, fallbacks, one key per side |
| C | System 0 before every LLM call: admit, tier, needs-human, done, extract | reasoning tokens only where reasoning is needed |
| D | Proof on everything that ships: Kernel receipt (code), craft receipt (surfaces), mcp-doctor 100 (MCP), pr-gate (merges) | existing gates, now stated as the platform contract |
| E | Memory: one vault, atlas engine on D1 + Access, Observatory as the screen; gbrain's future `[OPEN]` | ruled 2026-10-29 in part |
| F | Frontend: Vercel side Next 16 / React 19 / Tailwind 4 / shadcn / AI SDK generative UI; Cloudflare side Vite + Void + shadcn + Agents SDK React hooks; TypeScript 5.x `strict` with `exactOptionalPropertyTypes`, zod v4 as the one contract for API, MCP tool inputs and forms, generated Worker binding types; TS 7 (Go) when product repos pass its checks | advanced means fewer, stricter types shared across layers, not more libraries |
| G | Off-laptop execution: every build, test and review in Cloudflare Sandbox, Vercel Sandbox, a Railway runner, a Claude cloud session or Codex cloud; the laptop runs the cockpit and reads | 289 MB free RAM today; commit charge, not RAM, is the ceiling |

## 6. Session roster

Rules that apply to every lane: one lane = one branch `agent/<harness>/<scope>` in its own worktree or
cloud clone; a brief states repo, paths, done condition, reviewer and cost cap; the reviewer is a
different vendor; no PR opens in a repo over budget (SIS, starlightintelligence.ai, command-center,
agentic-ops-hub, agent-config) until one lands or closes; every lane ends merged, closed with an archive
tag, or as a HumanGate row.

Budget fact that shapes the roster: Claude Max weekly usage is at 61 % with the estate's 75 % weekly hard
stop; it resets 2026-11-01 04:00Z. This week the Claude lanes are two, the rest runs on Codex cloud and
Antigravity, or waits for the reset or for extra usage (off today, cap €100) that only Frank enables.

### Wave 0, now to 2026-11-01: converge and activate

| Lane | Model, where | Work | Done when | Reviewer |
|---|---|---|---|---|
| W0-1 | Fable, this desktop | Triage the five over-budget repos: a dry-run list of stale drafts to close, PRs to land, PRs to fold | List in the handover; Frank says yes to the close set | none, read-only |
| W0-2 | Codex cloud | Re-review heads of `starlightintelligence.ai#172/#174/#175`, `starlight-kernel#1`, SIS `agent/claude/wfp-tenant-skeleton` @83de5b2 | `pr-gate signoff` recorded per head | Codex is the reviewer |
| W0-3 | Haiku cloud routine | Re-measure `graph/agent-surfaces.graph.json`, `vercel-projects.snapshot.json`, INTEL-BRIEF model ids | Generated blocks updated on a branch, no PR | Codex spot-check |
| Frank | | Merge the reviewed set; enable Workers for Platforms, create `starlight-tenants`, set `PLATFORM_ADMIN_TOKEN`; startup credits; DNS for `platform.`; Kernel transfer + Apache-2.0 + `npm login`; Polar onboarding; decide extra usage | | |

### Wave 1, 2026-11-02 to 11-08: platform v1 and the Frontman

| Lane | Model, where | Work | Done when | Reviewer |
|---|---|---|---|---|
| W1-A | Sonnet, Cloudflare Sandbox | `services/starlight-platform-gateway` in SIS: Hono `/v1/health`, `/v1/receipts/verify`, `/.well-known/starlight.json`, OAuth AS (Provider v1), zod schemas package | deployed to a dev route, 100 % of routes tested in workerd, mcp-doctor not applicable | Codex |
| W1-B | Sonnet, Cloudflare Sandbox | Skills + playbooks MCP as `McpAgent` on Workers, ported from the `starlight-intelligence-web` lane; resource server behind W1-A's AS | `mcp-doctor score` 100; row added to agent-surfaces graph | Codex |
| W1-C | Sonnet, Codex cloud for workerd RAM | Deploy tenant skeleton to the dev namespace; `vitest-pool-workers` two-tenant isolation run; Polar activation webhook stub, default-off | isolation test green in workerd; README "Not done yet" shrinks by three items | Codex (maker is Claude) |
| W1-D | Opus, Claude cloud | `starlight-decide` Worker: port the decision-plane client, first live Clef-flash and Clef calls, publish the four question sets as zod schemas, eval set from `agentic-influencer-os` | eval ≥ bar 0.6 live; cost per decision measured | Antigravity (Gemini) |
| W1-E | Sonnet, Vercel Sandbox | Frontman v1 in eve-lab: Vercel Connect to Vercel MCP + GitHub; daily digest as a Slack draft; foreign-deploy detector | one real digest produced from live data; zero sends | Codex |
| W1-F | Haiku | Site: swap `/install` and `/developers` to point at `platform.` endpoints once W1-A is live; llms.txt | preview green, Vercel full gate passes | Codex |

### Wave 2, 2026-11-09 to 11-15: factory, console, observe

| Lane | Model, where | Work | Done when | Reviewer |
|---|---|---|---|---|
| W2-A | Sonnet, Vercel Sandbox | starlight-factory S2 durability + S3 Kernel station; merge Grok's website-factory registry as the surface list | a factory-labelled issue produces a draft PR with a Kernel receipt, end to end | Codex |
| W2-B | Sonnet, Cloudflare Sandbox | `console.` tenant console: Vite + Void + shadcn over the dispatcher lifecycle API (signup, export, delete), standard demand capture | three flows pass a browser test in CI; mobile predicates 1–9 pass | Codex |
| W2-C | Sonnet, Codex cloud | Observatory hosted: land `agent/claude/observatory-hosted`; feed `/constellation` from Cloudflare agent traces and Vercel Agent Runs | hosted `/operator` shows live estate state; CI screenshot artifact | Codex |
| W2-D | Opus, Claude cloud | First managed-team delivery template: the Multi-agent Ops team on a tenant, with a craft receipt and a Kernel receipt; this is the thing the ladder sells | a stranger could read the delivery page and the receipt without Frank explaining | Codex, prompted as a buyer who declined |
| W2-E | Antigravity, 1M context | Estate-wide scout: duplicate MCP surfaces, dead Workers and Vercel projects, repos to park | subtraction list with commands, no edits | Claude |

### Wave 3, 2026-11-16 to 11-29: sell

Storefront `/playbooks` live (waitlist until gate PASS, then Polar); first tenant onboarding runbook;
Cloudflare co-marketing and case study (external send, Frank's); Frontman proposes Rolling Releases for
the apex once two teams ship to it.

Routing of each lane follows `AGENTS.md` §4: judgment to Fable or Opus, build to Sonnet or Codex, bulk
mechanics to Codex exec, large-context scouting to Antigravity, review always to a different provider.

## 7. Guardrails that bind every lane

Secrets env-ref only, gitleaks armed. Money paths fail closed; prices, checkout, payouts, spend are Frank's.
External sends are Frank's; Slack drafts and GitHub comments on estate repos are not. Destructive git needs
Frank. Draft-first PRs, batch commits, `[agent-wip]` on intermediate pushes. Maker ≠ checker on every merge
through `pr-gate`. No surface without a `products.graph.json` row; no checkout without a gate PASS; no
public page without a craft receipt and the mobile predicates. Admission control: read
`logs/digests/pr-budget.json` before any PR. `pp preflight` before any heavy local work; today it allows
reading only.

## 8. Decisions that are Frank's, in order

1. Usage: enable extra usage (cap €100) for the Claude lanes this week, or start Wave 1 after the
   2026-11-01 reset.
2. Merge the reviewed set: `starlightintelligence.ai#172`, `#174`, `#175`; `starlight-kernel#1`.
3. Cloudflare: enable Workers for Platforms ($25 per month), create the `starlight-tenants` namespace, set the
   admin token; apply the startup credits; put the Cloudflare engineer meeting agenda on these items plus
   Clef RL design-partner access and Sandbox quotas.
4. DNS: `platform.`, `mcp.platform.`, `tenants.`, `console.` records.
5. Kernel go-public per `docs/GO-PUBLIC.md`: transfer, licence flip, first `npm publish`.
6. Polar onboarding and the activation webhook design.
7. The stale-draft close set from W0-1 (dry-run list first).
8. The apex repo question in §2.1.
9. Ratify or edit rulings A–G in §5.

## 9. Risks and open items

- `[OPEN]` whether the apex site repo is `starlightintelligence.ai` or `starlight-intelligence-web`.
- `[OPEN]` gbrain versus atlas as the long-term engine.
- `[OPEN]` Vercel CI as a replacement for Railway runners; not evaluated.
- `[OPEN]` the cause of the Vercel bill drop in the last two weeks.
- Clef-omni licence is unstated; Jev is early access; neither sits in a paid customer path until that clears.
- vinext is beta; the production site does not move this quarter.
- Agent traces bill from 2026-12-01; the Observatory feed needs a retention budget.
- The x402 Monetization Gateway requires a US seller; parked, not planned.
- Five repos are over PR budget; the plan opens no PR in them until one lands. The tenant skeleton and the
  gateway live on pushed branches until SIS has a slot.
- RAM: anything in this plan that is run on the laptop by mistake will hang silently below the 4 GiB floor.

## 10. What this document is not

Not a product page, not a price, not a release. It is the build order and the placement of each part. Each
wave's first act is a measured re-check of §1; a number here older than two weeks is re-run, not quoted.
