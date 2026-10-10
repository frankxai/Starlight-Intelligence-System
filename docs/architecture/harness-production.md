# Harness production decision

Owner: SIS operational runtime. Review date: 10 October 2026.
Base: `bc73db9bd3c9febdba842ecd63684c47b08e7d47` on `origin/main`.
Tracking: [memory lifecycle issue 49](https://github.com/frankxai/Starlight-Intelligence-System/issues/49).

## User outcome and decision

A developer should resume a task in a different supported coding harness with
the correct repository, revision, current checkpoint and evidence, then obtain
an independent review without losing ownership or duplicating uncertain work.
The operational runtime composes existing harnesses. A new terminal product or
Hermes/Kilo fork is deferred until a supported adapter fails a measured user job.

Native harnesses retain their tools, model configuration and authentication.
SIS owns selected context exchange, durable review state and host admission.
The existing shared memory provider remains authoritative for approved memory;
captured observations do not become canonical knowledge automatically.

## Engineering assessment

The context bridge has bounded capture, durable cursor updates, replay
deduplication, strict source decoding, private-record filtering and exact-scope
checkpoint selection. The review queue preserves unresolved execution across
restart and checks the declared provider binding before dispatch. Gateway locks
use owner tokens and never infer that another writer stopped because of age.
These are useful foundations for one host. They do not establish distributed
transactions, authenticated provider identity, verifiable command execution,
sandboxing, signed receipts, universal transcript support or customer value.

The previous integration passed 96 targeted tests and Linux/Windows CI at
`000e263791b16a74be880897dc7a12c4bae0785c`. Those results do not certify this
main-based integration or its additional Jev policy. Required review and live
acceptance remain pending. A successful Vercel status for an ignored build is
not evidence of a new deployment.

The initial architecture overestimated capabilities by combining installed
packages, changing model offers and proposed behaviors as though they were one
tested system. Claims of unmetered compute, a particular context window, model
count, signed verification or competitive superiority require fresh evidence
for the exact provider, subscription, revision and workload.

## Reuse and alternatives

| Need | Existing technology | Decision and tradeoff |
| --- | --- | --- |
| Provider routing | OpenRouter, Vercel AI Gateway | Use a supported provider adapter; avoid maintaining another provider catalog. |
| Self-hosted model proxy | LiteLLM | Consider when centralized routing and operational ownership justify another service. |
| Agent checkpoints and interrupts | LangGraph | Compare on the same interrupted task before expanding our local journal into a workflow engine. |
| Durable work across hosts | Temporal | Adopt when persistent remote execution is required; external effects still need idempotency. |
| Organization, assignments and budgets | Paperclip | Evaluate as an integration when a team needs these workflows; avoid a competing business queue. |
| Issue-to-PR worker supervision | Composio Agent Orchestrator | Compare its existing worktree and worker lifecycle before adding a new scheduler. |
| Coding interaction and tools | OpenCode, Kilo, Codex, Claude Code | Preserve native execution; use dedicated process or API adapters. |
| General agent memory | Hermes native memory plus the SIS provider | Retain native session compatibility; promote only reviewed, scoped knowledge. |
| Portable SIS/MCP packaging | SIS PR 342 | Reuse the owning slice's AI SDK adapter and packaging work; do not duplicate it. |
| SQLite recall | SIS PR 340 | Reuse the existing owner's scope and recall repair; do not introduce a parallel database. |

Primary references: [Vercel AI Gateway](https://vercel.com/docs/ai-gateway),
[LiteLLM routing](https://docs.litellm.ai/docs/proxy/load_balancing),
[LangGraph persistence](https://docs.langchain.com/oss/python/langgraph/persistence),
[Temporal evaluation](https://docs.temporal.io/evaluate),
[Paperclip](https://github.com/paperclipai/paperclip),
[Agent Orchestrator](https://github.com/ComposioHQ/agent-orchestrator),
[OpenCode providers](https://opencode.ai/docs/providers/).
These vendors cover broad routing, execution or persistence needs. Our proposed
differentiation is evidence and recovery across existing harnesses. No comparison
on identical customer tasks has established an advantage yet.

## Jev integration

Frank selected `typesafe/jev-router`. It chooses a generative route; the separate
typed Decisions API is an optional later experiment. OpenRouter's include list
can be ignored when nothing matches. Cost tiers are preferences, not price caps;
the router currently requires the global region. Routing metadata reports the
served model and any advisor. [Official Jev Router contract](https://openrouter.ai/docs/guides/routing/routers/jev-router).

`prepareJevRouterRequest` creates a non-streaming public-data request with
concrete host-approved model slugs, a pool snapshot no older than one hour,
16 KiB input and a completion token bound. `inspectJevRouterResponse` rejects
missing metadata, ignored includes, unapproved routes/advisors, truncated output,
tool calls and oversized results. It is a policy primitive, not a live provider
transport or completed harness integration. No keys, network calls, subscriptions
or background processes are enabled by registration or import.

The host must verify the pool, data classification and applicable provider/account
restrictions. A post-response check cannot prevent earlier data transmission or
undo a bill. Regex scrubbing cannot prove that arbitrary input is public. The
token bound is not a spend cap. Dynamic routing also means Jev output cannot
serve as an independent review merely because its configured route has a
different name: bind and verify the actual checker provider for the exact job.

First test OpenCode's existing OpenRouter provider in an isolated, public pilot.
Kilo and Hermes should use their documented provider/plugin interfaces after
compatibility checks. Keep Codex and Claude on their native authenticated lanes;
the host can dispatch an API worker separately without substituting their login.

Community work already explores this: [OpenCode Auto Jev](https://github.com/jorgefspereira/opencode-auto-jev)
uses a virtual routing model; [Hermes Jev](https://github.com/ourines/hermes-jev)
uses a native plugin; [Hermes decision layer](https://github.com/kennedy-f/hermes-jev-decision-layer)
uses observational shadow routing. Their public descriptions were inspected;
their source, dependency safety and exact revisions have not passed our review.
Adopt a tested pattern after a pinned audit rather than install every extension.

## Authentication and maintenance

Each user authenticates in their native supported client. Codex supports
ChatGPT or API authentication; CI should use the documented programmatic path.
[Codex authentication](https://developers.openai.com/codex/auth).

Anthropic permits applications to run the unmodified Claude Code binary under
its stated commercial conditions, with users owning credentials and billing.
It prohibits third-party applications from offering Claude.ai login or
intermediating subscription credentials.
[Claude Code terms](https://code.claude.com/docs/en/legal-and-compliance).

No supported commercial permission for an embedded Grok consumer-login broker
was verified. Use a documented API or native harness until that is resolved.
Do not copy refresh tokens between agents: concurrent holders can invalidate
rotated credentials. [Hermes credential pools](https://hermes-agent.nousresearch.com/docs/user-guide/features/credential-pools).

Maintain a small adapter surface, versioned source formats and a tested recovery
suite. One task owner and one independent checker are the default. Tournaments
need a named uncertainty and a budget; three implementations of every task
increase repair and review work. Admission must reserve RAM and respect existing
tasks. No new orchestrator or persistent watcher is introduced here.

## Acceptance, rollout and rollback

1. Verify the exact main-based revision on Linux and Windows, including current
   terminal/OpenCode adapters, continuity recovery and Jev refusal cases.
2. Obtain independent provider review at that revision; reconcile findings and
   rerun affected checks. The earlier Claude review returned a weekly quota
   refusal, not an approval. Local fanout is on hold below the machine RAM floor.
3. Demonstrate a public task: native harness A produces an artifact, stops,
   harness B resumes from the scoped checkpoint, and a pinned independent
   checker supplies verifiable command/sandbox evidence. Compare the same task
   against direct native execution with an explicit handover.
4. Exercise cancellation, source format drift, orphan reconciliation and failed
   reviews. Preserve unresolved ownership; never auto-clear a lock by age.
5. Run a bounded Jev shadow pilot against fixed-model baselines. Record actual
   served model, advisor, billed usage, latency, useful output, repair time and
   rejected routes. A shadow call is still a paid/data-transmitting call.
6. Merge the reviewed source, verify installable package exports and an external
   consumer, then enable one opt-in workflow. Broader activation follows observed
   recovery and cost results. A source merge alone does not publish npm or deploy.

Rollback disables the host's opt-in dispatch and restores the previous adapter
configuration. Keep journals and unresolved reviews as evidence. A revert must
not delete task artifacts, running-process ownership or native authentication.

## Assets and revenue hypotheses

The maintainable assets are the interoperability contract, scoped checkpoint
exchange, recovery tests, adapter conformance fixtures, review evidence and
repeatable installation. A growing roster or another dashboard is not a moat.

The first commercial hypothesis is a team using multiple coding tools that loses
time recovering context and proving completion. Offer a bounded paid pilot that
delivers a working cross-harness recovery workflow and measurable review evidence.
Measure avoided restart work, human repair time, successful resumptions and cost
per accepted artifact. Pricing and demand remain unvalidated.

Possible later revenue: supported team installations, managed evidence/recovery,
enterprise retention and access controls, and task-specific workflow packs with
measured acceptance. Each needs a buyer, maintenance owner and support economics.
Avoid reselling consumer subscription access or presenting vendor model savings
as a guaranteed margin. Candidate integration partners are OpenRouter/TypeSafe,
Vercel and the native harness maintainers; no partnership agreement is asserted.
