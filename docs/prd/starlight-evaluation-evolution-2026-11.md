# Starlight Evaluation & Evolution — Product Requirements Document

**Product name:** Starlight Evolution Lab (working public surface)  
**System capability:** Starlight Evaluation & Evolution (E&E)  
**Version:** PRD 0.1 — 5 November 2026  
**State:** DRAFT / source proposal / not a production release or approved SKU  
**Accountability:** Frank Riemer, product/architecture; canonical evaluation-method source: SIS `tools/proving-ground`; portfolio approvals: `frankxai/agentic-ops`  
**Primary implementation epic:** [SIS #545](https://github.com/frankxai/Starlight-Intelligence-System/issues/545)  
**Companion architecture:** [Frontier Intelligence Fabric, Ops #477](https://github.com/frankxai/agentic-ops/pull/477), [research-to-revenue, Ops #471](https://github.com/frankxai/agentic-ops/pull/471)  
**Revision policy:** The PRD proposes changes. No repository, company, brand or cloud provider is implicitly reconfigured by the presence of this document.

## 1. Product decision

E&E is the **learning and verification layer of Starlight's intelligence fabric**. It continuously discovers opportunities to improve the actual work of an AI-assisted founder, tests competing ways to perform that work, and offers evidence-linked, reversible upgrades.

The object of optimization is **accepted value per total human effort and total cost**, subject to hard integrity, privacy, rights, accessibility and customer ownership constraints—not model leaderboard rank or the number of autonomous agents.

The product must make four things possible:
1. **Observe:** convert permitted failures, operator edits, rejected outputs, production regressions, customer feedback and new methods into *evidence-bearing opportunities*.
2. **Challenge:** formulate a falsifiable hypothesis, a named baseline, competing mechanisms, a clean independent test set, and an experiment budget.
3. **Prove:** run side-by-side candidate configurations in reproducible environments; evaluate the delivered artifact and the process that created it; retain adverse results, failure traces and true marginal costs.
4. **Evolve:** propose to upgrade a model policy, prompt, skill, tool, context strategy, agent topology, execution harness or UX flow, then gate it through independent review, staging, canary and observed customer benefit.

The feedback loop produces **proposals and evaluation fixtures**, not unfettered self-modification in production. An agent never defines the benchmark, edits its hidden test set and certifies its own promotion.

## 2. Buyer, jobs and contexts

### Builder / independent founder (initial)
"I have one complex project and several tools. I need to know whether a new agent method will actually make my product better and cheaper before depending on it." Experience: import an existing GitHub repo / workflow, select an outcome, inspect two source-pinned alternatives, observe a bounded run, choose an upgrade with a reversible handoff.

### Creator / creative director (early expansion)
"AI can generate variations endlessly. Which workflow protects my taste, source integrity, character continuity, editing control and rights—and produces an edition I would ship?" Experience: side-by-side creative output with source/manifests, quality rubric, human blind preference, revision time, export/reopen and licensing checks. GenCreator owns the creation experience; E&E evaluates it.

### Agent engineer / product team (platform buyer)
"Will our new prompt, model, context planner or agent harness improve real task success without breaking safety or budgets?" Experience: versioned fixtures, trace waterfall, regression gates, cached baseline comparisons, reviewer challenge, benchmark/experiment API and auditable release decision.

### Agent operator / community contributor (ecosystem)
"How can I submit a useful improved skill that other founders trust?" Experience: open method, portable sample, conformance/eval suite, permission and dependency manifest, explicit limits, review status and licensed distribution. The public scoreboard cannot be gamed by optimizing only a visible test set.

**Wedge:** optimize **one real GitHub-based founder-product change** first; prove trustworthy integration and repeat adoption before making this a generalized enterprise evaluation SaaS.

## 3. North-star and measurement hierarchy

**North star:** independently accepted customer outcomes per founder/operator hour, with actual all-in cost per accepted outcome and error/safety burden presented beside it. Include all failed runs, retries, setup, reviews and support. An unmeasured value is `null`, not zero.

Leading signals: first meaningful activation, reproducibility on exact source SHA, evaluation fixture coverage, source/provenance completeness, candidate-to-baseline quality, reliability, latency p50/p95, cost/reservation reconciliation, task-level success, interruption/recovery, export/reopen fidelity, operator repair time, repeated customer use and true rejections.

Quality requires four separate lenses: (a) deterministic correctness and permission boundaries; (b) rubric-based artifact usefulness; (c) calibrated human preference or expert acceptance; (d) actual longitudinal customer outcome. Never combine them into one opaque marketing percentage. Report sample size, population, statistical uncertainty and observation window. A model-generated judge is evidence, not ground truth.

**Anti-Goodhart:** the challenge set remains separated; test task distributions rotate; material benchmark changes are versioned, recorded and justified; public metrics cannot be trusted merely because they went up. Detect contamination, answer leakage, evaluator model drift and synthetic artifacts presented as customer experience.

## 4. Core product objects and state

| Object | Minimum contract | Owner |
|---|---|---|
| Opportunity | tenant, authorized signal, objective, original observation, sensitivity, source reference and rights | E&E proposal plane |
| Capability version | owner/product ID, git SHA, harness/model/skills/context/routing versions, dependencies, support matrix | registered owning repository |
| Experiment | preregistered hypothesis, baseline/candidate, eligible fixtures, blinded/held-out partition, budgets, kill rules, evaluation protocol | SIS Proving Ground |
| Run receipt | task/capability/dataset/source hashes, actor, runtime, harness, permissions, tool calls, costs, status, failure and trace references | existing runtime / protected receipt writer |
| Outcome | rubric decisions, test results, real acceptance event, human minutes, observed limitation, provenance, sample size | independent verification |
| Promotion proposal | evidence diff, eligibility verdict, rollback plan, owner review, canary scope, release source SHA | Ops / product release authority |
| Evolution memory | supersession chain, experiment failures, reusable constraints and successful mechanisms | reviewed Starlight Memory projection |
| Program mirror | Notion status, owner, GitHub issues/PRs, milestone gate and decision links | existing Portfolio Notion project surface |

### State machine
`observed → proposed → admitted → preregistered → running → reviewed → {rejected, inconclusive, shadow_candidate} → canary_review → approved_release → monitored`.

A failure can go to `blocked`, `cancelled`, or `quarantined`, with reason and resumable evidence. **No state implies the following state**: a passing test cannot authorize a production release, a reviewed candidate cannot authorize paid spend, and a merged PR is not a verified customer outcome.

## 5. Product experiences / design direction

**Evolution Home:** beautiful, calm intelligence observatory. Lead with one currently valuable improvement opportunity and the evidence of its consequence. A compact quality/cost/reliability trend and clear "What changed?" replace walls of generic KPI cards.

**Experiment Theater:** baseline on the left, candidate on the right; show *actual* task, artifacts and effects in real time. Expand into code diff, browser recording, trace, source graph, reviewer rationale and budget, with clear interrupted/unknown states. Do not expose chain-of-thought as a requirement or imply providers expose it.

**Capability Atlas:** searchable cards for models, skills, context compilers, MCP tools, agent teams, UI patterns and inference routes; each carries supported environment, permissions, version, current evidence, quality/regression and cost. "Best" always means *for this task and under this constraint*.

**Evolution Graph:** connects observations → hypotheses → tests → candidate versions → decisions → shipped product revisions → customer outcomes; graph edges have source locators and confidence, not mystical certainty. Reveal the surprising reason an outcome improved or deteriorated.

**Operator Control:** one obvious action to hold, cancel, replay or request review. Consent, data isolation, provider billing and required approval must be legible. Accessible contrast, keyboard, mobile layouts and reduced motion; visually impressive means useful perceptual clarity, not spinning effects.

**Research Foundry adapter:** translate approved research and primary/counterevidence into an experiment suggestion. No public claim or model activation simply because research recommended it.

### Design register
Starlight: curious, lively, benevolent, precise; premium craft from reviewed Design Intelligence brand packs and Figma projection. Queen is attentive and candid, not an anthropomorphic employment claim. GenCreator stays authored and craft-driven; Arcanea original/canon-driven; FrankX founder-led and proof-driven.

## 6. Evaluation science: what makes it genuinely advanced

1. **System-level causal challenge:** distinguish model quality from context, retrieval, tool design, harness behavior and human review. Controlled ablation: same tasks × same dataset × same versioned inputs with one intervention changed at a time. Where exact isolation is impossible, mark confounds explicitly.
2. **Adaptive search over a configuration space:** model × reasoning budget × context policy × skills × tools × agent topology × sandbox/runtime × UX intervention. Intelligent proposal search can use bandits or Bayesian optimization in a later phase, but must track selection bias, sample budgets and promotion policies; never let the optimizer see held-out labels.
3. **Many evaluators, one falsification framework:** deterministic tests first; task-specific rubric; model-as-judge only when calibrated to held-out human examples; independent reviewer from a different provider/harness for consequential conclusions. Retain disagreement.
4. **Metamorphic and adversarial fixtures:** paraphrase consistency, distractor injection, unavailable source, corrupted artifact, tenant impersonation, prompt injection, rate/price change, cancelled run, partial effects and duplicate dispatch.
5. **Multiple objectives, never a single magic score:** inspect Pareto frontiers for accepted outcome, human time, cost, reliability, latency, rights, privacy and portability. A candidate improving speed but violating permissions is rejected regardless of benchmark.
6. **Drift and delayed rewards:** simulate rollout, shadow on real workload without effects, canary in a safe tenant, then monitor regression for days/weeks. Trigger rollback proposals from verified failures rather than self-directed unreviewed hot fixes.
7. **Evolution of the evaluator itself:** explicit judge version, benchmark stewardship, contamination/overfitting audits, human calibration, challenger reviewer and reversible methodology upgrades. No scorekeeper may unilaterally upgrade itself.

## 7. System placement / partners

| Plane | Existing owner / integration | Contract / adoption posture |
|---|---|---|
| Constitution + eval semantics | **frankxai/Starlight-Intelligence-System** `tools/proving-ground`, `tools/arena`, `test` | Canonical methodology, deterministic comparison, conformance and scorecard lineage |
| Public eval distribution | **Starlight-Intelligence/starlight-evals**, **frankxai/starlight-evals** | Mirrors only. Published cards currently stale; do not author doctrine here or publish fabricated fresh runs |
| Protected challenge samples | **Starlight-Intelligence/starlight-heldout** | Private guarded data owner; candidate builders cannot read labels or mutate fixtures |
| Portfolio/governance | **frankxai/agentic-ops** Registry, QUALITY.md, release program, WIP | Scope, owner, costs, independent review, customer acceptance; accepted canon only after reviewed merge |
| Queen and machine profiles | **Starlight-Intelligence/starlight-agent-config**, existing multi-machine / Cloudflare Queen | Bounded mission planning, maker/verifier identities; source personality does not activate runtime |
| Customer UX / API | Existing Starlight web platform, Nexus, Command Center, Vercel projects | Read status and experiments; authenticated owner actions; live execution after admitted scope and preview checks |
| Relational domain truth | **Supabase Starlight Platform** Postgres in EU | Reuse tenant/principal/membership, entitlements, budget ledger and existing agent_runs. Add `evolution_*` tables only through separately reviewed migration with tenancy/RLS tests |
| Memory/graph | Existing Starlight Memory, Second Brain and SIS context contracts | Source-linked temporal projection, not a new unauthorized data lake |
| Durable agent execution | **Cloudflare Agents SDK** + Durable Objects/Pi 1.5 (pilot) | Session persistence; watch/continue API, breaking Pi 1.4 format, rollback plan and costs verified before upgrade |
| Code/sandbox experience | **Vercel AI SDK 7, WorkflowAgent, SandboxSession, Eve, Vercel Sandbox** | Ephemeral or durable task execution with typed event adapter and portable artifacts; experimental HarnessAgent needs feature qualification |
| Claude layer | **Anthropic Messages API**, **Claude Agent SDK/Claude Code**, **Claude Managed Agents** | Separate direct inference, local/CLI harness and managed long-horizon adapter; each source pinned, permissioned and independently evaluated. Never resale of claude.ai consumer session |
| Other harness choices | Codex, OpenCode, Gemini, Pi, local CLIs | Same evaluation contract, not presumed equivalent tool scopes or pricing |
| Telemetry | OpenTelemetry GenAI conventions; existing Langfuse/Sentry/PostHog or one qualified backend | Trace and cost evidence, privacy filtering, source/version bindings; benchmark whether external LangSmith/Braintrust/Phoenix improves reliability without redundant analytics spend |
| Human control | Notion Portfolio Command Center, existing November project and GitHub issues/PRs | Linked human-readable PRD, reviews and commitments, not a second ledger or automatic sync without actual adapter proof |

### Critical observed Starlight data boundary (5 Nov 2026)
The existing active Starlight Platform Supabase project already has `tenants`, `principals`, `tenant_memberships`, `entitlements`, `agent_runs`, `starlight_budget_accounts`, reservations/grants/ledger/outbox and a collection of `starlight_memory_*` tables with RLS enabled. `agent_runs` captures run ID, parent, trace, environment, model, status, timing, token usage, costs, tools, artifact count and error class; it does **not by itself** establish a complete held-out experiment, comparison or customer-acceptance ledger. Future migrations should use a private isolated `evolution` schema by default, with explicit grants and service-mediated tenant checks; no direct public/anon access to private raw evaluations.

Supabase announced CLI v3's local-first behavior and hosted-change confirmations Nov 4, 2026. Pin current CLI/SDK versions and validate migrations in staging before introducing any new `evolution_*` tables. No DB changes in PRD v0.1.

### Verso reference
The user's name "Verso" did not resolve to an exact registered GitHub repository, Notion program or Vercel project in this bounded connector inspection. Treat it as an unresolved integration alias, **not** a reason to invent a new Vercel app. If later grounded, bind exact URL, owner, project/tenant, credentials and data boundary before adding it.

## 8. Competitive synthesis: adopt the strongest without rehosting everything

- **LangSmith:** curated datasets, offline/online evaluation and human feedback. Learn feedback workflows and calibration; own Starlight's cross-harness, outcome-linked adjudication and portability.
- **Braintrust:** experiment/production trace linkage, shared scorecards and prompt iteration. Evaluate as a telemetry/eval adapter if existing backend is deficient; avoid new purchase merely for another dashboard.
- **Langfuse / Phoenix / OpenTelemetry:** open traces, prompt/version and observation portability. Prefer vendor-neutral telemetry; default to reuse of existing connected capture.
- **Anthropic Managed Agents:** robust long-horizon Claude loops with session/harness/sandbox abstractions, and vendor optimized context. Adopt behind adapter for workload-specific pilots; do not make it the sole Starlight memory/eval authority.
- **Vercel AI SDK/Eve/Workflow:** production-grade UX, durable tool approval and sandbox harness interop; Starlight owns cross-provider evaluation, customer rights and optimization.
- **Cloudflare Pi Durable / Agents / Browser Run:** persistent strategy actors, resumable sessions, live inspection, browser-assisted evaluation; test Pi 1.5 irreversible schema migration path and Browser session expiry before production.
- **Promptfoo and existing SIS Arena:** fast local adversarial/model regression; keep as a lower-level engine with receipts, not a second Starlight product.
- **OpenAI/Codex:** coding-agent execution and test artifacts through explicit API and supported native adapters, not consumer account scraping.

We should compete on **cross-workflow, cross-model, user-owned, customer-outcome-driven evolution**, not on claiming every foundation library is our invention.

## 9. Canonical interfaces (API proposal; not currently live)

`POST /v1/evolution/opportunities` creates scoped observation tied to source and permission.  
`POST /v1/evolution/experiments` requires an immutable hypothesis, baseline, candidate, preregistered dataset/budget and idempotency key.  
`GET /v1/evolution/experiments/:id` reads metadata with tenant authorization; raw source may be restricted.  
`POST /v1/evolution/experiments/:id/runs` requests the already-admitted runtime, never a free-form command.  
`GET /v1/evolution/experiments/:id/evidence` returns visible receipts with links and omissions.  
`POST /v1/evolution/proposals/:id/review` requires authenticated independent reviewer and source hashes.  
`POST /v1/evolution/proposals/:id/promotion-request` builds a review bundle; never merges or deploys by itself.

These API routes are **contract candidates**, not API availability claims. Use existing platform auth and budget reservation before any dispatch. Route controls and supported components require full buyer tests and owner approval.

## 10. Algorithmic admission and promotion rules

A deterministic **offline adjudicator** is the first executable slice. It does not itself execute experiments or promote releases.

Hard gates: schema/required fields; sealed independent task set and identical dataset digest; no contamination finding; source SHA and artifact hash; checker distinct from maker **in authenticated hosting**; real sample counts and confidence; zero critical safety/rights/tenant violations; verified measured costs within reserved budget; nonnegative regression margins; no provider/rate drift obscuring costs; actual customer activation separated from synthetic test cases.

Compare sample-adjusted accepted-outcome rate and cost/accepted; do not over-interpret 20 synthetic cases as statistically significant. A candidate may become `REVIEW_ELIGIBLE` if it clears deterministic regression, source/provenance and declared relative improvement thresholds. This is not a human endorsement, certification, commercial authorization or production rollout.

Independent product and release review must re-run the exact head SHA and current policies. Post-release monitoring can demote a capability to held if real safety, cost or customer quality deteriorates.

## 11. Milestones and gates (planning targets, not promises)

| Gate | Target window | Minimum tangible result | Independent acceptance |
|---|---|---|---|
| **M0 — Canon** | Nov 5–7 | This PRD; exact owner/registry map; issue, Notion PR room and offline contract+tests | Product owner resolves duplication and security |
| **M1 — Prove** | Nov 7–12 | One reproducible baseline-vs-candidate test set, deterministic adjudicator, challenge fixture and anti-leak tests | Different checker and falsifiable improvement decision |
| **M2 — Connect** | Nov 12–18 | One real Claude/Codex/Pi or Vercel sandbox adapter receipt; OpenTelemetry trace, usage and artifact provenance | Actual API/tool versions, cost, runtime identity and recovery |
| **M3 — Experience** | Nov 18–24 | Nexus Experiment Theater on mobile/desktop: compare, inspect, hold, export and approve; non-fake Live View only when available | Human completes a real product decision with controlled permissions |
| **M4 — Controlled Beta** | Nov 24–Dec 5 | 3 external founders each complete one bounded evaluation/upgrade workflow; shadow/canary with rollback | At least 2 independently accepted reusable results, no critical boundary failure |
| **M5 — Commercial** | Dec 5–20 | One versioned free portable eval kit; eligible paid maintenance/team or hosted offer only after checkout, tax, entitlements and measured demand | 3 paying/committed organizations target, actual cost/contribution and delivery |
| **M6 — Compound** | 2027 Q1 | Cross-brand evaluations, improved routing/context/creative outputs, community methodology and skills publication | Measured repeated use, reproducible gains and customer control |

No extra paid resource or migration is implied. Protect the existing two-revenue-release WIP limit in `agentic-ops/STRATEGY.md`; the first E&E lane should share the incumbent product delivery path rather than displace it without an owner decision.

## 12. Initial demonstration that makes the category understandable

**Project:** evaluate a real GenCreator "source → editable edition → export/reopen" or Creator Launch OS kit-change workflow.  
**Baseline:** approved current method with named inputs/outputs.  
**Candidate:** new context compiler or adapted Claude/Codex harness, with the SAME source material and acceptance tests.  
**Live experience:** user watches two source-pinned agents produce artifacts (or views replayed from actual receipts); opens difference, checks trace/cost, hears verifier's specific objections, approves one draft PR with a rollback plan.  
**Measurable outcome:** task completed without permission violations, artifact editable, independently useful, lower combined cost/effort or improved accepted quality.  
**Artifact:** shareable but sanitized comparison case, source links, reproducible experiment manifest and license, optional paid supported pack.  
**Stop:** if access to hosted sandbox, model account, consent, rate or cross-tenant data is uncertain, use an honest offline-only fixture and do not imply live operation.

## 13. Business model and defensibility

**Free:** open-source Proving Ground method, one reusable scorecard template, source-to-result demo, public evidence portal, BYOK/sample path. Community adoption requires useful independent results.  
**Creator/Builder:** pay for versioned domain evaluation packs, source-linked creative/engineering test suites and continued compatibility; pricing to be validated rather than copied from the market.  
**Teams:** recurring workspace, comparison history, approvals, integrations, private datasets, audit/recovery and support.  
**Managed:** metered provider inference and durable execution only behind verified tenant entitlement, merchant-of-record/tax terms, hard budgets, refunds and customer data rights.  
**Professional:** scoped architecture audits and improvement programs with tangible deliverables; equity arrangements separate and fully documented.

Do not sell raw token arbitrage as the moat; cloud providers will compress that margin. Our lasting IP is **eval corpus quality + consented task and artifact lineage + cross-harness comparability + evidence-backed configuration intelligence + trusted creator/community distribution**.

### Initial commercialization gate
One founder must be able to bring an existing project, run a bounded source-pinned comparison, inspect evidence, export a usable result and decide whether to adopt the change. Until this genuinely works, the paid proposition is waitlist or a narrowly staffed service with an honestly named scope.

## 14. Key hazards and decisions

- **False improvement:** hidden dataset leaked, model judge uncalibrated, small n or missing human work cost. Mitigation: independent holdout, uncertainty, blind review and replay.
- **Interleaved agent ownership:** concurrent PR writers, Cloudflare and Vercel each assume durable ownership. Mitigation: exactly one mission authority and idempotent receipt/settlement protocol.
- **Sensitive data leakage:** telemetry, eval fixtures, browser recordings, traces and commercial private context. Mitigation: least privilege, per-tenant guards, redacted OTLP, retention/delete and explicit export.
- **Model/API version churn:** fast provider changes; Pin adapters and capture model/rate versions. Upgrade in parallel shadow and compare on a fixed acceptance contract.
- **Platform overbuild:** duplicate databases, eval SaaS, agent marketplace or permanent browser farms before one customer result. Mitigation: reuse SIS, Ops, Supabase and existing product surface; promote only measured work.
- **Goodhart/reputational damage:** claim "self-improving AI" while only adding synthetic scores. Mitigation: publicly distinguish proposed, fixture-tested, independently evaluated, accepted, released and customer-verified states.
- **Legal/commercial:** merchant, customer contracts, intellectual property, export and EU data obligations. Mitigation: existing finance/rights owners, no autonomous money moves.

## 15. Acceptance definition and source references

PRD v0.1 done when: current source location reviewed, exact GitHub program and Notion room cross-linked, deterministic independent/offline pilot fixture passes, no uncontrolled production/cloud/db writes, unresolved providers/Verso named explicitly, and one next experiment is staffed through existing issue/PR intake.

**Primary source links checked through Nov 5 2026:**
- [SIS canonical Proving Ground](https://github.com/frankxai/Starlight-Intelligence-System/tree/main/tools/proving-ground); [Arena](https://github.com/frankxai/Starlight-Intelligence-System/tree/main/tools/arena); [public eval mirror](https://github.com/Starlight-Intelligence/starlight-evals).
- [Vercel AI SDK 7](https://vercel.com/blog/ai-sdk-7); [Eve](https://vercel.com/blog/introducing-eve); [Vercel Sandbox](https://vercel.com/docs/vercel-sandbox).
- [Cloudflare Pi 1.5 update](https://developers.cloudflare.com/changelog/post/2026-11-03-pi-harness-pi-1-5/); [Agents tracing](https://developers.cloudflare.com/agents/runtime/observability/tracing/); [Browser Run](https://developers.cloudflare.com/agents/tools/browser/).
- [Claude Managed Agents](https://platform.claude.com/docs/en/managed-agents/overview); [Anthropic managed agent architecture](https://www.anthropic.com/research/managed-agents).
- [Supabase security/RLS](https://supabase.com/docs/guides/api/securing-your-api); [Supabase CLI breaking changes](https://supabase.com/changelog?types=breaking-change).
- [LangSmith evaluation](https://www.langchain.com/langsmith/evaluation); [existing portfolio authority](https://github.com/frankxai/agentic-ops/blob/main/QUALITY.md).
