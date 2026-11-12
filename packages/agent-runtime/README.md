# Starlight agent runtime

One provider-neutral runtime for every agentic surface in the estate. One call gives you a model,
tools and attribution, so no app assembles the three itself.

```sh
npm install @starlight-intelligence/agent-runtime ai
```

## Why this exists

Five product repositories were each re-deriving the same three layers by hand, which is how model
ids drifted, how tool exposure grew ungoverned, and how nothing ever emitted a cost record. This
package is the shared implementation of those layers.

It follows the accepted Registry decisions: AI SDK 7 for TypeScript, AI Gateway as the default
multi-provider model gateway, MCP as the portable tool interface, and provider-neutral contracts
versioned in Git.

## Usage

```ts
import { createAgentRuntime } from '@starlight-intelligence/agent-runtime';

const runtime = await createAgentRuntime({
  route: { kind: 'frontier', tier: 'balanced' },
  scope: {
    brand_id: 'brand_starlight_intelligence',
    product_id: 'product_gencreator',
    agent_id: 'agent_studio',
    workflow_id: 'workflow_plan_week',
  },
  mcp: [{ url: 'https://tools.example.com/mcp' }],
  // A baseline is REQUIRED when MCP servers are configured: without one there is nothing to
  // compare against, so a server that changes a tool after approval could not be detected.
  // Persist `runtime.toolFingerprints` after a human approves the tools, and pass it back here.
  toolPolicy: { allowlist: ['read_doc', 'search_docs'], baseline: approvedFingerprints },
  instructions: 'Plan the week from the creator source material.',
});

const result = await runtime.agent.generate({ prompt: 'Plan next week.' });
const record = await runtime.attribution();

await runtime.close();
```

If you are bootstrapping a surface whose servers you trust and whose definitions are versioned
elsewhere, pass `allowUnreviewed: true` instead of a baseline. That is an explicit decision, and
`runtime.toolsUnreviewed` reports it so you can surface it.

## Model routing

A route names a capability, not a vendor call. It resolves through the Vercel AI Gateway, so one
key and one namespace reach every vendor.

```ts
{ kind: 'frontier', tier: 'reasoning-heavy' | 'balanced' | 'fast' }
{ kind: 'explicit', gatewayModelId: 'google/gemini-4-argon' }
```

Reachable today: `anthropic/claude-opus-5.5`, `openai/gpt-6-astra`, `google/gemini-4-argon`,
`spacexai/grok-4.7`. No vendor-specific SDK is a dependency of this package. Note that xAI's
Gateway namespace is `spacexai/`, not `xai/`.

An unknown tier, a malformed id, or a namespace the estate does not route to fails at resolution
with a named error. A well-formed id for a routed namespace that the Gateway does not serve
(`anthropic/does-not-exist`) is not checked at resolution, because the only way to know is to ask
the live catalog, and that would make route resolution fail on a network blip. It fails at call
time with the Gateway's own error.

`node scripts/verify-gateway-models.mjs` checks the four ids above against the live Gateway
catalog and exits non-zero when one is missing.

## Tools

MCP tools reach the model through the official AI SDK MCP client, which handles protocol-version
negotiation between `2026-07-28` and the legacy revisions, `Mcp-Param-*` header mirroring, and
elicitation.

Two controls are the application's responsibility, and this package supplies them:

- **Approval.** MCP annotations are untrusted, server-provided hints, and the spec defines their
  defaults to be the cautious ones: `readOnlyHint` defaults to false and `openWorldHint` defaults
  to **true**. A tool therefore runs unattended only when it says `readOnlyHint: true` AND
  `openWorldHint: false`. A destructive or open-world tool never runs unattended, whatever the
  hint claims. Everything else requires `toolApproval: 'user-approval'` with a reason that names
  the condition that actually triggered it.
- **Drift.** `fingerprintTools` and `detectToolDrift` detect a server that changed a tool's
  description or schema after a human approved it, and added a tool that was not in the baseline.
  Pass the approved fingerprints as `toolPolicy.baseline` and drifted tools are refused before
  they reach the model.

Tool exposure is bounded by an explicit allowlist. There is no implicit "allow everything".

## Attribution

Every run produces a record carrying the eleven dimensions the estate's observability contract
requires: `brand_id`, `product_id`, `agent_id`, `workflow_id`, `provider`, `model`, `input_tokens`,
`output_tokens`, `estimated_cost`, `latency_ms`, `outcome_status`.

Cost and latency come from the Gateway's own accounting for the generations, not from a local
price table. A price table goes stale the day a vendor changes pricing and then quietly reports
the wrong number, which is worse than reporting nothing. A multi-step run is costed as the **sum**
of its generations, because taking the last one alone understates the run.

`cost_known` says whether `estimated_cost` is a real figure. The Gateway ingests usage
asynchronously, so a lookup can miss a generation that did happen; such a record carries
`cost_known: false` rather than a zero that is indistinguishable from a free generation. A run
whose cost is only partly known is also `cost_known: false`, because the partial sum is a lower
bound rather than the run's cost.

Records are validated before they leave the process and passed through a credential redactor,
because they are meant to be committed or shipped to a ledger.

## Boundaries

- Not a state store. Long-lived addressable actors belong on Cloudflare Agents with Durable Objects.
- Not a credential authority. MCP is a tool interface, not an authority layer.
- Not a chat transport. Streaming stays on the AI SDK 7 UI message stream protocol.
- Not a second runtime. ADK, the OpenAI Agents SDK and the Claude Agent SDK are candidates, not
  layers under this one.

Code: MIT.
