# GStack Workforce Harness

> External specialist bench for product, engineering, design, QA, security, release, and retro workflows. SIS routes to it; SIS does not vendor it.

## Role

GStack is the operating workforce layer for the Starlight Orchestrator. It turns vague intent into a staged team process:

`think -> plan -> build -> review -> test -> ship -> reflect`

The installed canonical copy lives outside this repo at `~/.agents/skills/gstack`, with agent-specific junctions such as `~/.claude/skills/gstack`, `~/.codex/skills/gstack`, and `~/.grok/skills/gstack`. This harness documents how SIS should route to that workforce.

## Default for

Use GStack when the user asks to:

- validate a business idea, feature wedge, product strategy, or launch plan
- turn a vague project into an executable spec
- review architecture, design, developer experience, security, or ship readiness
- test a website or app in a real browser
- produce release, documentation, canary, benchmark, or retro evidence
- run a repeatable end-to-end project sprint across repos

## Workforce map

| Need | GStack specialist | Route |
|---|---|---|
| Vague business idea | YC Office Hours | `/office-hours` |
| Founder-level pressure test | CEO / Founder | `/plan-ceo-review` |
| Architecture and test plan | Eng Manager | `/plan-eng-review` |
| Product/UI taste check | Senior Designer | `/plan-design-review` |
| Developer-facing onboarding or API | DX Lead | `/plan-devex-review` |
| Fully reviewed plan | Review Pipeline | `/autoplan` |
| Precise executable spec | Spec Author | `/spec` |
| Production bug risk | Staff Engineer | `/review` |
| Root cause debugging | Debugger | `/investigate` |
| Security and trust | CSO | `/cso` |
| Browser QA and fix loop | QA Lead | `/qa` |
| Read-only browser bug report | QA Reporter | `/qa-only` |
| Live visual audit | Designer Who Codes | `/design-review` |
| Performance regression | Performance Engineer | `/benchmark` |
| Release and PR | Release Engineer | `/ship` |
| Merge/deploy/prod verify | Release Engineer | `/land-and-deploy` |
| Post-deploy watch | SRE | `/canary` |
| Docs sync | Technical Writer | `/document-release` |
| Weekly operating review | Eng Manager | `/retro` |
| Durable learnings | Memory | `/learn` |

## Routing policy

1. SIS owns selection. Decide which GStack specialist should run based on intent, repo, and risk.
2. GStack owns method. Once selected, follow the skill workflow rather than improvising a one-off prompt.
3. SIS keeps canon. Feed decisions, artifacts, and learnings back into SIS memory/status; do not duplicate GStack internals.
4. ACOS applies the factory. For creator/business/product work, route through ACOS workflows that call the GStack workforce in sequence.
5. Browser truth wins. Any public-facing or visual claim needs `/browse`, `/qa`, `/qa-only`, `/design-review`, or `/benchmark` evidence.

## Standard sprint chains

### Venture validation

`/office-hours -> /plan-ceo-review -> /plan-devex-review or /plan-design-review -> /spec`

Output: one-page wedge, risks, falsifier, first customer/user test, and executable next step.

### Product build

`/office-hours -> /autoplan -> implement -> /review -> /qa -> /ship`

Output: reviewed plan, working code, browser evidence, tests, PR or release packet.

### Public launch

`/plan-ceo-review -> /plan-design-review -> /cso -> /qa-only -> /benchmark -> /document-release -> /ship -> /canary`

Output: launch readiness report with design, security, QA, performance, docs, and monitoring evidence.

### Repo rescue

`/health -> /investigate -> /review -> /cso -> /document-release -> /retro`

Output: health map, root causes, top fixes, trust risks, stale docs, and operating recommendations.

## Escalation

- Substrate-tier changes still route through Claude primary and board gates before mutation.
- Security-sensitive work routes through `/cso` and Codex adversarial review.
- Long-context multi-repo contradictions route through Gemini first, then GStack reviews the resulting plan.
- Swarm-sized execution routes through Antigravity, with GStack as the review/QA/ship spine.
- Grok can use its personal excellence layer, but GStack remains core/shared and must not be treated as grok-personal material.

## Status

- Installed locally as an external skill pack.
- Linked into Claude, Codex, and Grok skill roots.
- Browser CLI validated through `browse.exe status` after local Windows compatibility patch for `GSTACK_CHROMIUM_PATH`.
- Not vendored into SIS by design.

---

**Built on SIP** - Starlight Intelligence Protocol v1.1.1
- Substrate: starlightintelligence.org/protocol
- Layers used: [file-contract, attestation, orchestration, harness, evidence]
- Verticals: core/orchestrator
- Generated: 2026-06-04
