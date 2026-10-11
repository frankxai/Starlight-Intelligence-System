# Native agent review pilot

Operational implementation proposal, 2026-09-30. This does not change SIP, its
receipt schemas, portfolio admission, model routing, or an existing queue contract.

## Delivered surface

The existing `plugins/starlight-intelligence` MCP server gains two read-only
tools. `get_agent_interfaces` returns dated public interface references, never
connection evidence. `prepare_review_handoff` returns a 15-minute preparation
for `claude-github`, `claude-cloud`, or `claude-local`. It validates shape and
syntax, not access, source existence, policy, approval or completion. It performs
no I/O and has no credentials. The new `/connect` guide shows the same catalog
through a deterministic public projection; it never fetches private sessions.

The artifact is **not** a Queen task envelope or a signed run receipt. Store it
outside every live inbox; the current Queen consumer scans all inbox JSON files.
An admitted executor must independently check its authenticated human principal,
Registry owner, current PR base/head, expiry, provider/checkout binding, time
budget and read-only capabilities. A prompt cannot enforce these controls.
Arguments are arrays for direct process APIs; never join them into a shell string.

Cloud CLI preparation supplies `claude --cloud` with the prompt. That does not
enforce cloud permission mode: set read-only policy in the cloud runner before
starting work. Local preparation uses `claude -p` with plan mode; still isolate
the checkout and enforce the timeout outside the agent. No local CLI, laptop or
private Claude conversation becomes connected by generating this artifact.

## Existing owners and next delivery order

| Owner | Reuse | Next bounded step |
|---|---|---|
| Agentic Ops | Registry and draft Dispatch #78/#111 | Admit one worker binding and its capabilities; keep routing there |
| Starlight Agent Skills | Operator plugin PR #29 | Complete exact-head review, then update dependent source pointers after merge |
| Starlight Suite / starlight-command-center | Queen connection PR #41 | Reconcile authenticated worker events in its existing private board |
| SIS cloud plugin | Access boundary and scoped workspace store | Install/smoke the reviewed tools in a non-production deployment |
| Native Claude GitHub workflow in Agentic Ops | Existing authenticated review route | Review exact source heads through accessible source packets |
| Upstream Paperclip | Work, approval, run and adapter records | One authorized metadata collector, mapped to the existing Suite event contract |

Suite admission and the draft Dispatch dependencies remain activation gates.
Preparing code does not activate them. Preserve the existing Cloudflare placement
for persistent Queen/entity missions, Vercel for the registered public site,
Postgres for business records, and private vaults for private memory authority.
Do not create a second scheduler, decision authority, receipt issuer or website
project. Existing receipt work in SIS PRs #208–#210 remains its owner.

## Interface choices

| Layer | Choice | Boundary |
|---|---|---|
| Portable procedures | Agent Skills and host plugins | Installation does not grant tools |
| Tools and embedded host UI | MCP and MCP Apps | Use the existing authenticated server and standard UI bridge |
| Local coding control | Native App Server or ACP stdio | Protocol/session capability must be verified on the worker |
| Remote specialist delegation | A2A | Negotiate Agent Card, protocol version, auth and task lifecycle |
| Application-owned loops | OpenAI Agents SDK, Claude Agent SDK, Google ADK | Use only when a native harness is insufficient |
| Managed OpenAI execution | Agents API beta | Project/env policy and SDK compatibility before admission |
| Observability | Existing event contract; OpenTelemetry correlation | Keep trace/run IDs distinct from canonical identities and verified outcomes |

MCP, ACP and A2A solve different problems; a common endpoint spelling is not
compatible approval, cancellation, memory or session behavior. OpenClaw's shared
bearer secret grants full operator access; require a separately verified scoped
deployment profile before customer access. Keep gateway credentials server-side.
Hermes offers ACP, gateway RPC and HTTP/SSE; negotiate the actual instance.
No universal protocol or universal lab commitment is claimed.

The public catalog is the source index for primary native documentation. Verify
again before using an interface, even before its review date. A catalog date is
documentation evidence, not a live provider probe.

## Acceptance and release

Run the new pure helper boundary tests plus existing plugin validation, TypeScript
checks, unit tests, bundle and anonymous-auth smoke through plugin CI. Check the
generated public projection. Vercel must build a preview from the actual PR head;
inspect its route and interaction before calling it validated. No production
promotion, cloud worker activation or new secrets are included in this change.

Built on SIP — Starlight Intelligence Protocol v1.1.1.
