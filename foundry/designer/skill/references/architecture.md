# Architecture selection

## Choose by the job

| Shape | Use when | Boundary and test |
| --- | --- | --- |
| Deterministic program | Rules and inputs are known | Typed input; golden outputs; no model cost |
| Skill | A person invokes a repeatable procedure | Activation and non-activation examples; completed artifact |
| Temporary worker | A bounded task needs reasoning/tools | One owner; deadline; no implied persistence |
| Persistent agent | Decision rights, memory or trigger persists | Contract; scoped tools; stop/revoke; durable state |
| Bounded multi-agent system | Independent expertise or authority improves a measured outcome | Distinct owners; shared budget; bounded rounds; conflict resolution |

Default to one orchestrator and a deterministic workflow. Add a separate critic for material release decisions. Independent perspectives may reveal failures; agreement among similar models is not independent evidence.

## Candidate runtime matrix

The choices below are candidates, not universal rankings. Recheck official documentation and installed versions before implementation.

| Candidate | Suitable job | Cost or obligation |
| --- | --- | --- |
| OpenAI Agents API | Managed Codex harness for durable sessions and sandbox work | Provider-managed state; verify account access, retention, sandbox, costs and cleanup |
| OpenAI Agents SDK | Application-owned loop, tools, handoffs and integration | Own deployment, persistence, approvals and isolation |
| Responses API | Direct model/tool integration with custom control | Own more orchestration and state handling |
| Vercel AI SDK 7 | TypeScript product UI and provider-independent tool loops | Pin installed version; benchmark provider differences; verify approvals |
| AI SDK WorkflowAgent | Durable execution across restarts and delayed approvals | Verify workflow runtime compatibility and replay semantics |
| LangGraph | Explicit state graphs, branching and resumable interruptions | Own checkpointing and effect-safe replay |
| Local sovereign runtime | Sensitive knowledge, local tools and customer-controlled memory | Own isolation, availability, updates and recovery |

Keep experimental harness abstractions behind a feature flag with a stable alternative. SDK support is not proof of tenancy, compliance, uptime or secure deployment.

## Boundaries for a web product

1. **Experience:** Next.js/React/TypeScript when the existing project supports them. Use its design system; server components for privileged reads; client islands for interaction. Stream visible status, artifacts and concise decision receipts. Do not show implementation clutter as a customer journey.
2. **Control:** authenticated server routes or workers own contracts, runtime selection, policy checks and secrets. Reauthorize every action and artifact download for its tenant. Client claims are untrusted.
3. **Orchestration:** use a durable job/workflow engine for long tasks. Persist checkpoints, pending review, event IDs and budget state. Cancel propagates to workers and tools; delayed actions recheck the current mandate.
4. **Execution:** isolated environments with filesystem and network scope. MCP provides tool connectivity; the server still verifies identity, audience, scope and resource authorization. Tool descriptions and returned content are not trusted instructions.
5. **Data:** tenant-keyed rows and storage policies, purpose-bound retention, exports and deletion. Supabase/Postgres is a candidate. Elevated secret/service credentials bypass RLS; keep them in a trusted server that performs its own tenant checks. A publishable key needs correct grants, policies and authenticated user context.
6. **Knowledge:** explicit source trust, retrieval provenance, timestamps, correction and contradiction paths. Separate episodic records, reusable facts and user preferences. Sensitive personal memory does not become shared institutional doctrine.
7. **Verification:** redact traces, freeze representative cases, bind verdicts to exact revisions, and separate native artifact, factual, behavioral, security, economic and legal evidence.

Avoid stacking multiple orchestration engines, vector databases or UI kits without a measured need. Start with existing data, lexical retrieval and one runtime; add embeddings, graphs or cross-provider routing after an evaluation shows benefit.

## Model and context design

Create an eval-backed role map: inexpensive classification, capable execution, specialized multimodal work and independent review. Verify current model IDs, modalities, tools, context limits, region, retention and prices. Compare accepted outcomes rather than model prestige. Escalation is constrained by the same root budget and mandate.

Keep stable policy, tool schemas and task-specific evidence separate. Retrieve only necessary context. Compress completed work into source-addressable state while preserving uncertainties, permissions and outstanding tests. Use caches when supported and safe; do not cache tenant data across users.

## Value economics

Define value as a testable improvement in an actual human job. Measure completed useful outcomes, cycle time, correction burden, reliability and willingness to use/pay. A hypothetical pilot: 100 briefs/month saving 20 minutes each at an assumed $60/hour yields $2,000 gross time value. Subtract measured inference, tools, hosting, review, support and maintenance. Time saved is not automatically realized revenue. Test adoption and retention before scaling.

Track absolute compute/activity as well as per accepted outcome, including retries, reviewers and abandoned work. Tokens and dollars do not directly measure carbon. Report carbon estimates only with stated methods, system boundaries, region, lifecycle assumptions and uncertainty.
