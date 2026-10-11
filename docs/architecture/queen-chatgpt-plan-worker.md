# Queen ChatGPT plan worker

Status: implemented transport with synthetic checks; sign-in integration and live inference remain open. Exact-revision independent review is tracked in [PR358](https://github.com/frankxai/Starlight-Intelligence-System/pull/358). This is operational SIS code. It changes no SIP governance, canonical identity, credential authority or deployment policy.

The creator job is to connect an eligible ChatGPT account, choose a current model, and let an existing Starlight team produce an editable artifact with a visible review and recovery record. The worker here supplies text inference to the existing runtime bridge. It does not yet deliver that complete creator journey.

## Integration decision

OpenAI documents optional ChatGPT plan usage for eligible Plus and Pro accounts in participating open-source and local applications. Commercial website sign-in remains a selected-partner integration. Identity consent and plan usage permission are separate. Neither opens the user's ChatGPT conversations. [Sign in with ChatGPT quickstart](https://developers.openai.com/siwc/quickstart).

The host owns browser authorization, PKCE, state, nonce, ID-token verification, granted scopes, refresh, revocation and OS-backed credential storage. It supplies a private `resolveConnection` function at runtime bootstrap. A worker envelope cannot supply credentials, change the account, choose another model or replace the transport. The host must verify identity before resolving a connection; this adapter does not validate an OAuth ID token itself.

No DevKit code was copied or installed. The inspected official DevKit at `0a36fefeb913055c8c7a1a29b63d82b96b2e841a` has a noncommercial license that excludes business product development without separate written permission. This independently authored HTTP adapter has no DevKit dependency. Product eligibility and service terms still need their own verification. [DevKit license](https://github.com/openai/sign-in-with-chatgpt-devkit/blob/0a36fefeb913055c8c7a1a29b63d82b96b2e841a/LICENSE).

## Implemented behavior

`createChatGptPlanRuntime` implements the existing `WorkerRuntime` interface and exposes account model discovery. It binds one account and host-selected model, requires unexpired credentials with direct plan scopes, and obtains the model catalog with the same token used for inference. Catalog listing is an observation; completed inference establishes access for that request. No default model or paid fallback is inferred. [Models and inference](https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference).

Requests go to public `/v1/responses` with an input array, `store: false` and `stream: true`. The worker sends explicit user text and optional host instructions. Request context stays in the host. The adapter supports text output and sends no tools. Streaming completion is checked against final text; partial text, incomplete events and usage-limit failures cannot become completed artifacts. UTF-8, frame sizes and output bytes are bounded. [Preview limitations](https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations).

An optional `onUsage` callback reports provider token counts, response ID and actual returned model to the host. Missing counts and monetary cost remain unknown. A local byte ceiling is not a provider token or spending cap; this route does not support `max_output_tokens`. Persistent campaign spending and token admission belong to the existing host authority.

Authentication, permission and usage failures return safe failure codes. Usage unavailability calls for a later, explicitly admitted retry; exhausted app usage calls for the usage settings. No retry, billing switch or reconsent loop runs inside the adapter. Transport loss, malformed completion, output-limit interruption and failed usage recording throw. The existing bridge preserves these as unknown execution, pauses that runtime and retains capacity for reconciliation. [Errors and recovery](https://developers.openai.com/siwc/token-sharing-open-source/errors-and-recovery).

This implementation is process-local. Credential rotation detected between catalog discovery and dispatch rejects that attempt. The host must cancel in-flight calls when accounts change and externally enforce revocation; an account check before dispatch cannot guarantee operation-time revocation afterward.

## Host usage

```ts
import { RuntimeBridge, createChatGptPlanRuntime } from
  "@arcanea/starlight-intelligence-system/runtime-bridge";

// credentialBroker is the application's private, verified OAuth/secret-store service.
// selectedModel comes from that account's current catalog, never a bundled default.
const worker = createChatGptPlanRuntime({
  id: "queen-draft-worker",
  accountId: selectedAccountId,
  model: selectedModel,
  resolveConnection: signal => credentialBroker.resolve(selectedAccountId, signal),
  instructions: approvedTeamInstructions,
  onUsage: usage => hostAudit.appendUsage(usage),
});
const bridge = new RuntimeBridge({
  runtimes: [worker],
  routes: { writer: worker.id },
  maxConcurrency: 1,
  maxRuns: 3,
  timeoutMs: 90_000,
});
```

The broker and audit service in the example are host integration points, not newly implemented services. Never expose `resolveConnection` to a renderer, MCP request, skill document, worker JSON or shared vault. This module is a Node runtime component. A website requires its own approved sign-in and tenant boundary; a browser must not receive provider tokens.

## Framework roles and serious alternative

Use the existing SIS bridge for provider-neutral worker submission. AI SDK remains the estate's TypeScript application integration standard; its ordinary Responses options must not leak unsupported fields into this subscription route. ADK can supply a Google worker when a measured workload justifies it. Apps SDK/plugin MCP supplies experiences inside ChatGPT and separately authenticated Starlight tools; it does not turn ChatGPT identity into arbitrary provider credit.

Vercel Eve is a candidate for an app-owned agent with Workflow durability, channel adapters and sandbox execution. Those provider capabilities do not authorize an estate deployment or replace Queen grants and canonical memory. The historical Temporal recommendation in the installed factory skill is superseded by the reviewed Cloudflare/Vercel ownership decision. [Vercel Eve introduction](https://vercel.com/blog/introducing-eve). Registry source inspected: `frankxai/agentic-ops` at `b4b82e3d1430846d62707973a66584de4f2e4776`, particularly `architecture_durable_execution_boundary`, `architecture_managed_agent_delegation` and `architecture_agent_credentials_and_tools`.

The serious alternative for coding is official Codex app-server with a separately authorized plan token. It retains local threads and supports local shell/MCP function calls. Its bundled `model/list` alone is not account entitlement evidence. Compare it with this worker on the same creator brief, artifact repair, elapsed time, measured token use and interrupted-run recovery before making a performance or value claim. This adapter's fixtures verify transport and recovery only; they do not establish superiority, demand or customer success. [Codex app-server integration](https://developers.openai.com/siwc/token-sharing-open-source/codex-app-server).

## Full programme acceptance remains open

The source task asks for the Queen across every harness and product surface. This transport cannot close that objective. Keep these requirements in the owning programme and its existing authority boundaries:

| Requirement | Current evidence | Required proof |
| --- | --- | --- |
| ChatGPT sign-in and plan usage | Official protocol inspected; authenticated text transport implemented | Independent OAuth security review, real browser consent/decline, encrypted storage, refresh, revoke and account-switch runs |
| Current models | Account-specific discovery and unavailable-model tests | Real selected-account catalog plus completed inference; report limits and unsupported capabilities |
| Terminal and CLI | Existing runtime bridge; this additional worker | Installed CLI from cold environment, durable task history, export and restart recovery |
| Desktop and web | Host boundary described; no new UI | Inspected, accessible surfaces with real account/session separation and useful editable output |
| Managed Eve offering | Provider capability documentation and estate routing inspected | Approved product-owned integration, tenant controls, quota/cost evidence, live restart and cancellation |
| Cross-harness Queen | Existing adapter and runtime surfaces | Capability discovery, operation-time grants, admitted handoffs and artifact acceptance across actual harnesses |
| Specialist teams and switchable profiles | Existing source catalogs and packs | Skills/tools resolved at execution, exclusive write lanes, tested team switching and accepted domain artifacts |
| Web development, content, editing and books | Requested domain profiles retained | Separate substantial real briefs with specialist output, editing/export, independent review and user acceptance |
| Planned goals and token use | Bridge submission/timeout limits; provider usage callback | Durable campaign budget and quota reservations across retries, compaction and recovery; attributed cost per accepted artifact |
| Spec-driven development and founder review | Existing skill/factory process inspected | Executed spec, challenge/review, observable acceptance and exact-revision evidence for each consequential change |
| Cosmos and organization management | Existing canon/control boundaries retained | Source-backed organizational records and policy, with domain canon scoped to its owning vertical |
| Learning across harnesses and repositories | Existing memory surfaces | Licensed, pinned source ingestion; provenance, evaluation and human-visible promotion; no assumption that ranked repositories are quality |
| Top 10,000 GitHub repository study | No new ingestion or clone | Bounded corpus manifest, licenses, evaluation against incumbent methods and selected useful improvements |
| Hermes learning, healing and dreaming | Native memory doctrine and SIS vault references inspected | Real recovery and consolidation tests; evidence-backed promotion, rollback and forgetting |
| Different memory for Queen, generals, workers and Genius | Private host context excluded from this transport | Explicit task/team/user namespaces, tenant isolation, least-necessary recall, retention/export/forget controls and cited retrieval |
| Autonomous creator value | Synthetic worker/bridge checks | Named useful artifact, repeated bounded creator runs, independent review and comparison with the manual/Codex workflow |

## Verification and release boundary

Run `test/chatgpt-plan-runtime.test.ts` with the existing runtime bridge tests. CI runs both in the existing npm ecosystem job. Test consent/expiry/account denial, token replacement, no fallback or context upload, fragmented streams, failures after partial text, incomplete/missing terminal events, tool output denial, byte limits, malformed usage, deduplication and unknown capacity retention.

No live OAuth exchange, provider inference, managed deployment, standing schedule, new MCP activation, memory sync, paid run or public release is proven by those tests. Exact-revision independent provider review and live creator acceptance remain required before promotion.

Built on SIP.
