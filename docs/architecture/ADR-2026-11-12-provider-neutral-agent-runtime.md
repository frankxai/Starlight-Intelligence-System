# ADR: one provider-neutral agent runtime for every agentic surface

- **Status:** Proposed (not accepted; no runtime change until this is reviewed)
- **Date:** 2026-11-12
- **Scope:** `Starlight-Intelligence-System` — new package `packages/agent-runtime`, plus `packages/core`
  contract types. No app repository is modified by this ADR.
- **Owner:** opencode lane `opencode-14696f69`
- **Registry:** follows `architecture_experience_plane`, `architecture_portability_contract`,
  `architecture_agent_credentials_and_tools`, `architecture_observability_and_cost_contract`
  (`frankxai/agentic-ops`, `registry/architecture_decisions.yaml`, reviewed `main`)
- **Prior art compared:** `@arcanea/model-runtime` (three provider adapters), `@arcanea/agent-runtime`,
  `@arcanea/mcp-client`, `@starlight-intelligence/ai-sdk`, `@starlight-intelligence/mcp`

## 1. The problem, measured

The estate runs agentic surfaces in five product repositories, and each one re-derives the same
three layers by hand. Measured across the repos on 2026-11-12:

**Model layer — no shared routing.** `gencreator.ai` hardcodes `anthropic('claude-opus-4-6')` in
`app/api/ask/route.ts` and `anthropic('claude-sonnet-4-5')` in `app/api/agents/chat/route.ts`.
`frankx.ai-vercel-website` keeps its own catalog in `lib/swarm/models.ts` with
`claude-sonnet-4-6` / `claude-opus-4-7` / `claude-haiku-4-5` and a `SWARM_MODEL_<AGENT>` env
override. `GenCreator-OS` reads `GENCREATOR_ANTHROPIC_MODEL`. `starlight-intelligence-web` is the
only repo that routes through the Gateway, and it hardcodes three ids in `lib/platform/catalog.ts`.
No repo has Gemini or Grok wired at all: `@ai-sdk/google`, `@ai-sdk/xai` and `@ai-sdk/mcp` appear in
**zero** package.json files across the eight repos scanned.

**Tool layer — the same MCP protocol reimplemented three times.** `gencreator.ai/app/api/mcp/route.ts`
(226 lines), `starlight-intelligence-web/app/mcp/route.ts` (269 lines) and
`starlight-cloud-agents/fleet-mcp/src/index.ts` (400 lines) are hand-written JSON-RPC servers.
**895 lines** of protocol work, duplicated three ways, implementing `server/discover`, the
`_meta` envelope, `Mcp-Protocol-Version` / `Mcp-Method` / `Mcp-Name` header validation and the
`-32020` header-mismatch error by hand. Meanwhile `starlight-cloud-agents` *declares*
`@modelcontextprotocol/server@^2.4.0` in its package.json and **imports it in zero source files**.

**Observability layer — the contract exists, nothing emits it.** The registry's
`architecture_observability_and_cost_contract` requires `brand_id`, `product_id`, `agent_id`,
`workflow_id`, `provider`, `model`, `input_tokens`, `output_tokens`, `estimated_cost`, `latency_ms`
and `outcome_status` on every production agent run. `packages/core/schemas/cost-record.schema.json`
and `agent-run.schema.json` exist as JSON Schema. Grepping `packages/core/src` for `CostRecord`,
`AgentRun`, `ApprovalGate`, `estimated_cost`, `latency_ms` and `outcome_status` returns **nothing**:
the schemas have no TypeScript types and no producer. No repo emits the required dimensions.

**Consequence.** Adding a model, a tool server or a cost dimension to five apps means five
edits, five provider-key wirings, and five chances to drift. The estate already decided this is
wrong — `architecture_portability_contract` says domain contracts stay provider-neutral and
"Cloudflare, Vercel, Anthropic, and OpenAI implementations are adapters around those contracts
rather than the contracts themselves." The contracts exist. The adapters do not.

## 2. What is already decided, and therefore not re-decided here

| Decision (registry, accepted) | Consequence for this work |
|---|---|
| `architecture_experience_plane` — Vercel default, AI SDK for TypeScript, **AI Gateway as the default multi-provider model gateway** | The runtime routes models through AI Gateway. No new per-vendor provider packages. |
| `architecture_agent_credentials_and_tools` — MCP as the portable tool interface, not an authority layer; least-privilege delegated credentials; **Vercel Connect is the preferred delegated-credential candidate** | Tools arrive over MCP. The runtime holds no credential authority. |
| `architecture_portability_contract` — contracts provider-neutral and versioned in Git; providers are adapters | The package exposes provider-neutral contracts; Gateway strings are an adapter detail. |
| `architecture_observability_and_cost_contract` — every production agent run attributable and costed | The runtime emits the required dimensions. |
| `architecture_persistent_entity_runtime` — Cloudflare Agents + DO SQLite for long-lived addressable state | The runtime is **not** a state store. Long-lived actors stay on Cloudflare Agents. |
| `architecture_managed_agent_delegation` — managed agents are delegated workers, never canonical identity | Provider sessions stay provider-local; the runtime records its own `agent_id`. |

## 3. Why not the obvious alternatives

**`@arcanea/model-runtime`** (581 LOC, three adapters) is the closest prior art and it is the named
alternative this design must beat. It fails on three counts: it uses raw vendor SDKs rather than
AI Gateway, so it cannot route to Grok, Gemini or any model the Gateway adds later without a code
change; it has no Grok adapter at all; and it depends on `@google/generative-ai`, the superseded
Google SDK, where `@ai-sdk/google` / Gateway is the current path. It also lives in `arcanea` and
`arcanea-platform` as **byte-identical duplicates**, which the estate's own
`architecture_media_fabric_v2` invariant forbids.

**Hand-rolling the model layer per app** is what produced the drift above.

**Adopting Google ADK** as the runtime was already considered and rejected in
`docs/architecture/ADR-2026-10-30-agy-adk-a2a-control-plane-mapping.md` §"Rejected for now":
"Adopting ADK as orchestrator before a measured gap exists. The queen and work graph already cover
routing, state and receipts." Nothing measured since changes that. ADK additionally conflicts with
`architecture_persistent_entity_runtime`, which assigns the runtime role to Cloudflare Agents.

**Adopting Composio, Pipedream or the OpenAI/Anthropic agent SDKs** is out of scope for a reason
that is not preference: `registry/manifest.yaml` has **no record** for any of them, and the estate
rule is that "a technology with no registry record needs a registry pull request before use."
Composio and Pipedream are also not needed yet — MCP already is the tool interface, and the estate
holds its own MCP servers. See §7.

## 4. The design

One new package, `packages/agent-runtime`, published as `@starlight-intelligence/agent-runtime`.

```
packages/agent-runtime/
  src/
    model.ts      provider-neutral model routing -> AI Gateway
    tools.ts      MCP tools -> AI SDK tool set, with approval + drift
    attribution.ts every run -> the registry's required dimensions
    runtime.ts    the composition the apps call
```

### 4.1 `model.ts` — provider-neutral routing

The contract is a **route**, not a vendor SDK call. A route names a capability, and the runtime
resolves it to a Gateway model id.

```ts
export type AgentModelRoute =
  | { kind: 'frontier'; tier: 'reasoning-heavy' | 'balanced' | 'fast' }
  | { kind: 'explicit'; gatewayModelId: string };
```

Resolution goes through `gateway()` from `ai`, which 7.0.133 already bundles via
`@ai-sdk/gateway` (4.0.108 in this repo's store). One namespace covers every vendor the estate
wants, all verified present in the Gateway catalog on 2026-11-12:

| Vendor | Gateway id | Verified in catalog |
|---|---|---|
| Anthropic | `anthropic/claude-opus-5.5`, `anthropic/claude-sonnet-5.5` | yes, 1M context |
| OpenAI | `openai/gpt-6-astra`, `openai/gpt-6.1-sol` | yes |
| Google | `google/gemini-4-argon`, `google/gemini-3.8-flash` | yes |
| xAI | `spacexai/grok-4.7` | yes — note the `spacexai/` prefix, not `xai/` |

That single table answers the "Anthropic, Grok, OpenAI, Gemini" requirement with **zero new vendor
dependencies**. The `spacexai/grok-4.7` id is the one that a from-memory implementation would get
wrong; it is written down here so it is not rediscovered.

Tier defaults are resolved from a small, explicit, versioned table in the package — not from a
hardcoded string at each call site. An explicit route wins over a tier. A malformed id, or a
namespace the estate does not route to, is rejected at resolution time rather than at call time. A
well-formed id for a routed namespace that the Gateway does not serve is not checked at
resolution: the only way to know is to ask the live catalog, which would make route resolution
fail on a network blip. It fails at call time with the Gateway's own error.
`packages/agent-runtime/scripts/verify-gateway-models.mjs` checks the estate's ids against that
catalog out of band.

### 4.2 `tools.ts` — MCP tools into the AI SDK

MCP tools reach the model through `@ai-sdk/mcp` (2.0.97), the official AI SDK MCP client, which
already handles what the three hand-rolled servers re-implement: protocol-version negotiation
between `2026-07-28` and the legacy revisions (`2025-11-25`, `2025-06-18`, `2025-03-26`),
`Mcp-Param-*` header mirroring, and elicitation.

Three things the official client leaves to the application, and which the estate must supply:

1. **Approval policy.** MCP annotations are untrusted, server-provided hints, and the MCP spec
   defines their defaults to be the cautious ones: `readOnlyHint` defaults to false and
   `openWorldHint` defaults to **true**. A tool therefore runs unattended only when it declares
   `readOnlyHint: true` AND `openWorldHint: false`; a destructive or open-world tool never runs
   unattended, whatever the hint claims. Everything else requires `toolApproval: 'user-approval'`
   with a reason that names the condition that actually triggered it. Approval lives on
   `toolApproval` in AI SDK 7; `needsApproval` on the tool definition is deprecated.
2. **Tool-definition drift.** `fingerprintTools` and `detectToolDrift` (both exported from `ai`
   7.0.133) detect a server mutating a tool's description or schema after approval, or adding a
   tool that was not in the baseline. The runtime requires a baseline — a forgotten baseline is
   refused rather than silently skipping the guard — and refuses to pass drifted tools to the
   model. `allowUnreviewed: true` is the explicit opt-out for trusted servers.
3. **Bounded exposure.** A tool allowlist per surface. The estate measured the cost of the
   alternative: the shared tool plane exposes 38 tools, and an earlier audit found 6 duplicated MCP
   trees holding 556 MB.

### 4.3 `attribution.ts` — the contract nobody emits

This is the layer with a written requirement and zero implementations. The runtime emits, per run,
exactly the dimensions `architecture_observability_and_cost_contract` names.

`packages/core` gains the portable attribution record carrying `brand_id`, `product_id`,
`agent_id`, `workflow_id`, `provider`, `model`, `input_tokens`, `output_tokens`, `estimated_cost`,
`latency_ms`, `outcome_status`, plus `cost_known` so a generation the Gateway could not price is
never read as a free one.

Note on the existing schemas: `packages/core/schemas/cost-record.schema.json` and
`agent-run.schema.json` describe **different** shapes — a ledger entry (`id`, `kind`, `amount`,
`currencyOrUnit`, `timestamp`) and a work-packet run (`id`, `workPacketId`, `agentId`,
`startedAt`, `status`). They are not the observability record the registry asks for, and this
change does not declare types for them. The attribution record is its own contract, validated by
`validateAttribution` in `packages/core/src/attribution.ts`.

`packages/core` stays **zero-dependency**. The release audit enforces this
(`scripts/verify-npm-ecosystem.mjs`: "Core must have zero dependencies", and a 20 kB runtime
budget). So the attribution types live in `core` and the AI SDK binding lives in `agent-runtime`.

Cost comes from the Gateway, not from a hand-rolled price table: `gateway.getGenerationInfo({ id })`
returns `totalCost`, `generationTime`, `latency` (time to first token), `promptTokens`,
`completionTokens`, `finishReason` and `providerName`. The generation id is available from
`providerMetadata.gateway.generationId`, and `onLanguageModelCallEnd` fires before client-side
tools execute, so a generation that is later aborted is still attributable.
`usage.inputTokenDetails.cacheReadTokens` and `usage.outputTokenDetails.reasoningTokens` supply
the cache and reasoning splits.

A multi-step run has one generation per model call, and the run's cost is the SUM of their costs:
taking the last one alone understates the run. Because the Gateway ingests usage asynchronously, a
lookup can miss a generation that did happen, so a record carries `cost_known` — a generation that
could not be priced is never reported as a free one, and a partly priced run is a lower bound
rather than the run's cost.

### 4.4 `runtime.ts` — the composition

One call that gives an app a model, tools and attribution, so that no app assembles the three
itself:

```ts
const runtime = await createAgentRuntime({
  route: { kind: 'frontier', tier: 'balanced' },
  scope: {
    brand_id: 'brand_starlight_intelligence',
    product_id: 'product_gencreator',
    agent_id: 'agent_studio',
    workflow_id: 'workflow_plan_week',
  },
  mcp: [{ url: 'https://tools.example.com/mcp' }],
  toolPolicy: { allowlist: ['read_doc', 'search_docs'], baseline: approvedFingerprints },
});
```

The runtime returns an AI SDK 7 `ToolLoopAgent` with `stopWhen: isStepCount(n)`, the resolved
tools, and an `attribution()` accessor that returns the record for the run that just happened.

Run state belongs to a **run**, not to the runtime: `onStart` fires exactly once per run and
starts a fresh accumulator, so a second run cannot inherit the first run's tokens or its failure
state. One runtime serves one run at a time; two overlapping runs cannot be attributed
correctly, and the runtime says so rather than reporting a blended number.

## 5. What this deliberately does not do

- **No new state store.** Long-lived addressable actors stay on Cloudflare Agents + Durable
  Objects (`architecture_persistent_entity_runtime`). This package is a request/response runtime.
- **No credential authority.** MCP is a tool interface, not an authority layer. Delegated
  credentials stay with Vercel Connect.
- **No new repo, no new npm scope.** The package lives inside the canonical substrate repo, which
  the registry already owns (`repo_starlight_intelligence_system`, `authority.intelligence_canon:
  canonical`), and reuses the existing `@starlight-intelligence/*` scope.
- **No vendor SDKs.** No `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/google` or `@ai-sdk/xai`
  dependency. The Gateway is the adapter.
- **No second chat transport.** Streaming stays on the AI SDK 7 UI message stream protocol
  (`createUIMessageStreamResponse` / `toUIMessageStream`), which the apps already partly use.
- **No framework adoption.** ADK, the OpenAI Agents SDK and the Claude Agent SDK stay out. They are
  candidate runtimes, and `architecture_managed_agent_delegation` already classifies managed
  agents as delegated workers rather than runtime substrate.

## 6. Acceptance criteria

1. `packages/agent-runtime` builds with `tsc` under the repo's `strict` config, with
   `noUnusedLocals` and `noUnusedParameters` on.
2. `packages/core` still has **zero** dependencies and stays under the 20 kB runtime budget that
   `scripts/verify-npm-ecosystem.mjs` enforces. The new types are type-only where possible.
3. A tier route resolves to a Gateway id that exists in the live Gateway catalog, and a malformed
   id or an unrouted namespace throws at resolution with a named error, not at call time. The
   estate's ids are checked against the live catalog by
   `packages/agent-runtime/scripts/verify-gateway-models.mjs`.
4. The vendor table is asserted by a test against the Gateway's own catalog:
   `anthropic/*`, `openai/*`, `google/*` and `spacexai/grok-4.7` each resolve through `gateway()`
   with no vendor-specific import anywhere in the package.
5. An MCP tool runs unattended only when it declares `readOnlyHint: true` AND
   `openWorldHint: false`; anything else requires approval, with a reason that names the
   condition that triggered it. A server that mutates a tool's description or adds a tool after
   the baseline is captured is refused by `detectToolDrift` before the tools reach the model, and
   a missing baseline is refused rather than silently skipping the guard.
6. A completed run produces a record carrying all eleven dimensions named by
   `architecture_observability_and_cost_contract`, and the record validates against the
   `packages/core` schema for the shape it claims. A failed run produces a record too, with
   `outcome_status: 'failed'`.
7. Cost and latency come from the Gateway generation info, not from a locally maintained price
   table. A multi-step run is costed as the SUM of its generations. A record carries
   `cost_known`, so a generation the Gateway could not price is never confused with a free one.
8. No secret, bearer token or credential value appears in an attribution record.
9. `pnpm run build:packages` and `pnpm run test:packages` pass, including the existing
   `ai-sdk-generation-and-streaming` and `official-mcp-client-and-stdio` consumer checks.
10. `packages/agent-runtime` is added to `pnpm-workspace.yaml` and to the release audit's
    `targets`, with its own consumer check in `scripts/test-npm-consumer.mjs`, so it is publishable
    through the existing OIDC workflow rather than by a new mechanism.
11. No app repository is modified. Adoption is a separate, per-app change.

## 7. The three technologies the request named, and what happens to each

| Named | Decision | Why |
|---|---|---|
| **Google ADK** | **Not adopted. Proposal recorded.** | ADK 2.x is a capable agent *framework* (graph workflows, managed context compaction, native A2A via `@a2a-js/sdk`, `google-adk` 2.14.0 / `@google/adk` 2.4.0). It competes with AI SDK for the same loop role, it has no registry record, and the estate already rejected it as orchestrator in the 2026-10-30 ADR. A registry proposal records it as a **candidate** so it can be re-decided against a measured gap rather than silently re-discussed. |
| **Composio** | **Proposal recorded as a candidate; not adopted.** | Real capability: its session pattern returns a handful of meta-tools instead of flooding context with 1,400+ toolkits, which is the exact problem the estate's own 38-tool plane has. Pricing is sane ($29/mo Pro, 100k calls). But the estate already holds its own MCP servers and has no registry record. It becomes admissible as a **tool source** through MCP, without a new runtime. |
| **Pipedream** | **Proposal recorded as a candidate; not adopted.** | 3,000+ APIs and 10,000+ tools with per-app slug scoping. Against Composio on price it loses for this estate: Pipedream's free tier is development-only and production starts at $150/mo, while Composio Pro is $29/mo. The two MCP endpoints are not interchangeable (`mcp.pipedream.net/v2` for end users, `remote.mcp.pipedream.net/v3` for agents, with mandatory `x-pd-*` headers). |
| **Anthropic / OpenAI / Gemini / Grok** | **Adopted, via AI Gateway.** | All four are reachable in one namespace today, with no per-vendor dependency and one key. |

The registry proposal for the three candidates lives in `agentic-ops/registry/proposals/` and is a
**proposal only**. Registry mutations go through a reviewed pull request; nothing here changes a
canonical record.

## 8. Slices

| Slice | Scope | Done when |
|---|---|---|
| R1 | `packages/core` attribution + run types, zero-dep | criteria 2, 6 (types) |
| R2 | `packages/agent-runtime/src/model.ts` | criteria 3, 4, 7 |
| R3 | `packages/agent-runtime/src/tools.ts` | criterion 5 |
| R4 | `packages/agent-runtime/src/attribution.ts` + `runtime.ts` | criteria 1, 6, 8 |
| R5 | workspace + release-audit + consumer-check wiring | criteria 9, 10 |

R1 + R2 are the release. R3 and R4 follow in the same minor. R5 lands with the first adoption,
because a package that is not wired into the release path cannot be published through it.

## 9. Open questions for the reviewer

1. **Tier defaults.** The tier → model-id table needs owner sign-off on which model is "balanced"
   today. The table is deliberately small and versioned in Git so a wrong default is a one-line
   diff, not a hunt.
2. **Adoption order.** `gencreator.ai` is the flagship and has the most hand-rolled surface, but it
   is also under a draft-PR gate and a private alpha with its own release rules. `familiar` is
   small and self-contained. Which goes first is the owner's call.
3. **Does `packages/core` need the types at all**, or should attribution types live entirely in
   `agent-runtime`? Putting them in `core` makes them shareable with the non-AI-SDK surfaces, at
   the cost of `core`'s 20 kB budget. The budget headroom is not yet measured, so this is a
   deliberate open question rather than a silent choice.
