# Swarm Control Plane, Exchange and Forge — Design

> One contract that turns any agent harness into a worker, a router that learns from verified
> outcomes, an open exchange where people sell skills, MCP servers, harness distros and whole
> setups, and a builder harness that takes someone from "my setup works" to "my setup earns".

- **Date:** 2026-10-21
- **Status:** PROPOSAL — not approved
- **Author:** Frank (architect) + Claude
- **Tier:** mixed. Sections 3 and 6 (HAP v2 worker contract, receipt and attestation rules) are
  **substrate-tier** and require `/starlight-board` before any implementation commit or tag.
  Sections 5, 7–10 are operational/product tier.
- **Repo targets:** this repo (contract, adapters, router, registry), `frankx.ai-vercel-website`
  (storefront and education), `agentic-creator-os` (creator-facing packs and launch pipeline).

---

## 1. Thesis

Agent loops are commodity. Pi (RPC, SDK, extensions), OpenCode (`serve` + SSE + ACP), Goose (ACP,
recipes, AAIF-governed), the Claude Agent SDK and Codex are all headless-controllable. Discovery of
skills and MCP servers is also commodity: the official MCP Registry, `npx skills add`, Claude plugin
marketplaces, npm for Pi packages.

What nobody owns across harnesses:

1. **A control contract** that treats every harness as a fungible worker.
2. **Outcome data** — which (harness × model × skill pack × topology) wins per task class at what cost.
3. **Payment rails for composed work** — when a result uses five people's components, all five get paid.
4. **A trust tier** that is earned from receipts, not claimed in a README.

Everything below builds those four things and nothing else.

## 2. Current state (verified on `main` @ e036722)

| Piece | Where | Gap |
|---|---|---|
| Worker contract `starlight.worker.v1` | `src/runtime-bridge/contracts.ts` | String in, string out. No events, budget, steer/fork/resume, artifacts. |
| Harness providers | `src/queen/agent-lifecycle/providers/*` | Discover/capture/resume only — observe, never drive. |
| Path leases | `src/orchestration/swarm-lease.ts` | Local JSON; harness union hardcoded, omits Pi/Goose/OpenCode. |
| Model gateway | `services/starlight-cloud-worker/src/llm/ai-gateway.ts` | Homegrown failover duplicating AI Gateway transport. |
| Orchestrators | `src/orchestrator.ts`, `src/swarm.ts`, `src/orchestration/starlight-queen.ts` | Three entry points, no shared contract. |
| Marketplace catalog | `src/marketplace/catalog.ts`, `pack-manager.ts` | Signatures + checksums exist. License tiers stop at free/subscription/enterprise; harness targets omit Pi/Goose/OpenCode/Codex; **every item must contain "Built on SIP"**, which blocks third-party authors. |
| Payment rails | `frankx.ai`: Polar, Lemon Squeezy, Stripe webhook | Three rails, no multi-party payouts. |
| Builder tier | `/forge`, `/prove`, `/evolve`, `foundry/`, `/sis-forge` | Compiles and proves capabilities; no package → price → publish → launch path. |

**Constraint:** no fourth orchestrator. Everything new is either the contract or an adapter to it.

## 3. HAP v2 — Harness Adapter Protocol (substrate, board-gated)

ACP is the inner wire where a harness speaks it. HAP adds the envelope ACP does not carry: budget,
permission policy, workspace binding, receipt.

```ts
interface HarnessAdapter {
  manifest: {
    id: string;                       // open set: "pi", "opencode", "goose", "claude-sdk", "codex", ...
    models: string[];
    supports: { steer: boolean; fork: boolean; resume: boolean; sandbox: boolean; lsp: boolean };
  };
  spawn(spec: {
    workspace: WorkspaceLease;        // worktree path or sandbox id + leased globs
    components: ComponentRef[];       // skills, MCP servers, distro, setup — versioned, for royalties
    route: RouteDecision;
    budget: { usd: number; tokens: number; wallMs: number };
    policy: ToolPolicy;               // enforced in-adapter, compiled from starlight-invariants
  }): Promise<Session>;
}

interface Session {
  events: AsyncIterable<HapEvent>;    // delta | tool_call | tool_result | diff | cost | error | done
  prompt(m: string): Promise<void>;
  steer(m: string): Promise<void>;
  fork(): Promise<Session>;
  interrupt(): Promise<void>;
  seal(): Promise<Receipt>;
}
```

- `starlight.worker.v1` becomes the degenerate adapter (prompt → done). No breaking removal.
- `SwarmLease.harness` becomes `manifest.id`.
- First adapters: Pi (SDK in-process), OpenCode (`serve` + SSE), Goose (ACP). Claude SDK and Codex follow.

### Pi distro

Pi ships read/write/edit/bash, a ~1.4k-token prompt and an extension API with lifecycle hooks, and no
sandbox or permission layer. One Pi package supplies: lease acquisition, budget guard on the
`tool_call` hook, receipt emitter, `sis_*` memory tools, permission policy. Upstream Pi is never forked.

## 4. Router

1. **Policy gate** — privacy tier (EU-only, local-only), capability match, hard budget.
2. **Contextual bandit** — chooses the tuple (harness, model, components, topology) per task class.
3. **Cascade** — cheapest viable first, verifier, escalate on failure.

Reward = verified outcome ÷ cost, latency-penalised. AI Gateway is transport (failover, BYOK, spend
tracking); the policy layer and semantic cache stay ours. Personal-subscription lanes
(`chatgpt-plan.ts`, consumer plans) never run in the hosted multi-tenant product.

## 5. Topologies and execution

Best-of-n + judge, pipeline, council, map-reduce and hierarchical queen are YAML graphs compiled to
Workflow SDK steps — one durable step per harness session, human approval as a workflow hook.
Cloud workers run in Vercel Sandbox microVMs; local workers run in git worktrees under leases
(Redis-backed once multi-machine).

## 6. Receipts (substrate, board-gated)

Every `seal()` emits a signed receipt (`protocol/sign.mjs`):

```jsonc
{
  "run": "run_…", "task_class": "code.fix.ts",
  "route": { "harness": "pi", "model": "…", "topology": "best-of-3" },
  "components": [{ "ref": "skill:acme/ts-fixer@1.4.0", "weight": 0.4 }, …],
  "cost": { "usd": 0.42, "tokens": 81234, "wall_ms": 93000 },
  "verdict": { "verifier": "ci", "pass": true, "evidence": "sha256:…" },
  "sig": "ed25519:…"
}
```

The same object feeds four ledgers: router reward, component reputation, billing, royalty split.
"Built on SIP" labels are earned by composing a SIP element, per SIP layer 2 — never a precondition
for listing (see §7).

## 7. Exchange — the open ecosystem

### What gets listed

| Kind | Example | Unit people actually want |
|---|---|---|
| Skill | `SKILL.md` + scripts + eval suite | A capability |
| MCP server | Remote (hosted) or local package | A connection to data or a system |
| Harness distro | Pi package, OpenCode config, Goose recipe set | A working agent shape |
| Claw | Bounded operational unit (`CLAWS.md`) | One job done end to end |
| **Setup** | Harness + components + memory schema + routing policy + topology YAML, one-click deploy | A solution. Highest value; root of the royalty graph. |
| Architecture | Reference architecture: diagrams, IaC, eval plan, cost model | An enterprise blueprint |

### Discovery is syndicated, not fought

Forge publishes every item to our registry **and** to the official MCP Registry, `npx skills add`
indexes, Claude plugin marketplaces and npm (for Pi). We do not need to be the only place an item is
found. We need to be the place it is **verified, metered and paid**.

### Monetising text that can be copied

A `SKILL.md` sold as a file is copied once and gone. Revenue attaches to what cannot be copied:

| Model | What the buyer pays for | Mechanism |
|---|---|---|
| Open | Nothing — reputation and royalty eligibility | Free listing |
| Maintained | Updates + compatibility matrix as models and harnesses change | Subscription; Forge re-runs evals nightly and flags breaks |
| Metered | Hosted execution: private data, assets or models behind an endpoint | Per tool call / per run via remote MCP OAuth + Gateway |
| Outcome | A verified result | Per receipt with `verdict.pass` |
| Commissioned | A custom setup or estate built by a certified builder | Project fee + Steward retainer |

### Composition royalties

When a paid outcome or metered run seals, revenue splits across `receipt.components` by weight.
Weights start as declared manifest shares and move toward measured contribution (ablation runs in the
Arena). This is the reason to publish building blocks openly: you are paid every time someone else's
setup uses yours and it passes. Model: music publishing splits.

### Trust tiers

| Tier | Requirement |
|---|---|
| Listed | Valid manifest, permissions declared |
| Scanned | `estate-guard-scan` clean, signature verified (`catalog.ts` path) |
| Verified | Eval suite passes in Sandbox across a declared harness × model matrix; permissions enforced at runtime by HAP policy |
| Proven | ≥ N sealed passing receipts from independent buyers |

Enterprises pay for a **private mirror**: allowlisted Verified/Proven items only, their own policy
overlay, audit export. That is the Oracle-CoE-shaped revenue line.

### Take rates (starting proposal)

0% on Open. 15% on Maintained and one-time. Metered: compute pass-through plus margin. 20% on
Commissioned. Royalty splits are computed before take rate.

### Rails

One rail for the Exchange. Multi-party payouts need Stripe Connect (or Polar if its payouts cover
multi-seller by build time). First-party FrankX products keep their existing checkout; the Exchange
does not reuse Lemon Squeezy.

## 8. Forge — the builder harness

Forge is itself a Pi distro running HAP swarms. It takes a working personal setup and ships it as a
product.

```
excavate → package → prove → harden → price → publish → launch → evolve
```

| Stage | Does | Reuses |
|---|---|---|
| excavate | Scans `~/.claude`, repos, prompts, transcripts; clusters what the person actually reuses | `/sis-forge`, `/discover-genius`, `/reclaim-knowledge` |
| package | Emits manifests per kind; multi-target export | Foundry contracts, 7 ecosystem export targets |
| prove | Generates eval suite; runs harness × model matrix in Sandbox; seals receipts; issues compat badge | `/prove`, receipts |
| harden | Permission minimisation, estate-guard, prompt-injection probes | `estate-guard`, `prompt-red-team` |
| price | Suggests model + price from cost receipts and comparable listings | cost plane, CFO general |
| publish | Exchange + syndication targets in §7 | `pack-manager.ts` |
| launch | Landing page, demo video, social posts, launch week plan | ACOS `/factory`, `/studio`, `/generate-social` |
| evolve | Nightly compat runs; breaking model/harness change opens a fix PR | `/evolve` |

The `launch` stage is the differentiator: no registry ships a builder's go-to-market. ACOS already does.

Forge pricing: free to build and publish; Exchange take rate on sales; Pro tier for hosted metering
and private evals; Launch add-on.

## 9. Certified builders

Builders who ship Proven setups and pass a reviewed estate build get listed for commissioned work
(`DELIVERY.md` §7). Certification is paid, cohort-based, and feeds the retreat/coaching line.
The Exchange routes inbound estate requests to certified builders and takes 20%.

## 10. Arena

Public seasons where stacks compete on fixed task suites; bounties ("beat this eval, pool €X");
live-streamed through the cockpit. Agent and component stat cards show receipt-derived numbers only
(Metrics Truth rule). The Arena produces router training data, component weights for royalties,
FrankX content, and a cross-harness stack leaderboard.

## 11. Brand partition

| Brand | Owns |
|---|---|
| SIS | HAP, router, receipts, registry, Exchange backend, Arena engine — neutral, open protocol |
| ACOS | Creator packs, Outcome Packs, Forge `launch` stage |
| FrankX | Storefront for first-party goods, education ("build and sell your harness distro"), Arena show |
| Arcanea | Not involved |

## 12. Sequence

| Window | Ships |
|---|---|
| 0–30 days | Board review of §3/§6. HAP v2 + Pi/OpenCode/Goose adapters. Orchestrators collapsed onto HAP. Signed receipts. `catalog.ts`: drop mandatory attestation, add Pi/Goose/OpenCode/Codex targets, add `metered`/`outcome` tiers, add `setup` and `architecture` kinds. |
| 31–60 | Workflow SDK control plane + Sandbox workers + cockpit live view. Exchange read-only registry seeded with 50 first-party Verified items from ACOS/SIS/skills-library. Forge excavate → prove. |
| 61–90 | Bandit routing on. Payments + royalty splits live for first-party items. Forge publish + launch. Arena season 0. First certified-builder cohort (≤10). |
| 91–180 | Third-party sellers. Private enterprise mirror. Metered remote MCP hosting. |

## 13. Kill criteria

- **Router:** after 1,000 receipts, learned routing is not ≥ 25% cheaper per verified outcome than
  static best-model routing → keep static routing, drop Arena-as-training-data.
- **Exchange:** 90 days after third-party launch, < 10% of installs go through a paid tier →
  narrow to Commissioned + enterprise mirror; keep the registry free.
- **Royalties:** disputed splits exceed 5% of paid volume → freeze to declared weights only.

## 14. Open decisions

1. First outcome-priced lane: merged PRs (CI verifier today) or creator content week (higher ticket,
   weaker verifier).
2. Royalty weight source at launch: declared only, or declared + Arena ablation from day one.
3. Registry domain and legal entity for third-party payouts.
