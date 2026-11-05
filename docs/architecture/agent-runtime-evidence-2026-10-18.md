# Agent runtime evidence

Verified 2026-10-18 against official documentation and repositories. This is documentation evidence, not an execution or deployment certification for Starlight agents.

## Compatibility matrix

| Component | Verified maturity | Contract for Starlight | Primary evidence |
| --- | --- | --- | --- |
| Eve | Public beta; latest observed release `0.80.1`, released 2026-10-16 | Native filesystem adapter; Node.js 24+, ESM; pin and test the selected release | [Eve docs](https://vercel.com/docs/eve), [0.80.1 release](https://github.com/vercel/eve/releases/tag/eve@0.80.1), [tagged package](https://github.com/vercel/eve/blob/eve@0.80.1/packages/eve/package.json) |
| AI SDK | v7 released; selected APIs remain experimental | Node.js 22+, ESM; typed runtime/tool context, approvals, timeouts and telemetry | [AI SDK 7 announcement](https://vercel.com/changelog/ai-sdk-7) |
| Workflows | Generally available | Durable state, retries and pause/resume; dynamic workflows are experimental | [GA announcement](https://vercel.com/blog/a-new-programming-model-for-durable-execution), [docs](https://vercel.com/docs/workflows) |
| Sandbox | Generally available | Isolated code execution; explicit side-effect and replay policy still required | [GA announcement](https://vercel.com/changelog/vercel-sandboxes-ga), [docs](https://vercel.com/docs/sandbox) |
| AI Gateway | Documented available service | Model/provider routing, fallbacks, attribution and budgets; server API key outside Vercel, OIDC on Vercel | [docs](https://vercel.com/docs/ai-gateway) |
| Connect | GA since 2026-08-25 | Scoped invocation credentials, project/environment links and tenant installations; MCP Events and Enterprise-Managed Authorization have separate beta status | [GA announcement](https://vercel.com/changelog/vercel-connect-ga), [docs](https://vercel.com/docs/connect) |
| Durable harnesses | Beta | Pi, fx, OpenCode and Eve documented; Claude Code and Codex experimental and Sandbox-only in this integration | [docs](https://vercel.com/docs/agent-harnesses) |
| AI SDK HarnessAgent | Introduced in v7 ecosystem | Explicit adapters for Claude Code, Codex, Deep Agents, OpenCode and Pi; maturity must be recorded independently from the durable-harness layer | [v7 harness section](https://vercel.com/changelog/ai-sdk-7) |

No core Eve private-preview access requirement was found. Public beta does not imply Starlight deployment readiness. A portable card is a specification; each runtime binding needs its own capability and evaluation evidence.

## Verified Eve imports and native files

The native helper is imported from `eve`, not an invented package or registry SDK. Root `agent/agent.ts`:

```ts
import { defineAgent } from "eve";

export default defineAgent({
  model: "openai/gpt-6-luna-fast",
});
```

This model is the default named in the currently published configuration documentation, not a Starlight product recommendation. Resolve the production model through the application's model policy.

A root needs an instructions source, normally `agent/instructions.md`. Root `agent.ts` is optional when defaults suffice; an authored file requires `model`. `AGENTS.md` remains repository working instructions and does not replace the Eve instructions slot.

Sources: [configuration reference](https://eve.dev/docs/agent-config), [getting started](https://eve.dev/docs/getting-started). The tagged [0.80.1 dependency catalog](https://github.com/vercel/eve/blob/eve@0.80.1/pnpm-workspace.yaml) declares AI SDK `^7.0.137`, Zod `4.5.4`, Sandbox `3.3.0`, Connect `2.5.2`, and Postgres World `5.0.3`. Resolve and lock actual installation versions; do not copy monorepo `catalog:` dependency syntax into an adopter's package manifest. Documentation currently contains a stale self-hosting example pointing at a Workflow beta line, so prefer the selected release's dependency compatibility over copying that example.

Declared specialist at `agent/subagents/repository-reviewer/agent.ts`:

```ts
import { defineAgent } from "eve";

export default defineAgent({
  description: "Review a repository change and return evidence-backed findings.",
  model: "openai/gpt-6-luna-fast",
});
```

`description` is compiler-required for a declared subagent. The invocation name derives from its directory. `agent` is a reserved child name. Its optional `instructions.md` supplies its own prompt. A large specialist catalog can use documented `tool: "deferred"`; explicit workflow-only children can use `tool: false`. This changes discovery, not permission.

Sources: [subagents](https://eve.dev/docs/subagents), [agent files](https://eve.dev/docs/reference/agent-files).

## Slots and isolation

| Slot | Root | Declared specialist |
| --- | --- | --- |
| Instructions, tools, connections, skills, hooks, extensions, sandbox | Authored or framework default | Its own authored slot or framework default; no inherited root-authored slot |
| Channels, schedules, instrumentation | Supported | Root-only |
| Durable state and conversation | Root session | Fresh child session; parent history must be passed explicitly |
| Evaluation fixtures | Beside `agent/` | Test the composed app and specialist outputs |

The root's built-in `agent` tool is a different mechanism: it creates copies sharing the root's sandbox, tools and configuration, with fresh state/history. Declared specialists have isolated authored capability slots. Share a procedure through an explicit extension/skill mount rather than assuming inheritance. Source files are not automatically shell-visible; seed shell-required files through `agent/sandbox/workspace/`.

Sources: [subagent isolation](https://eve.dev/docs/subagents), [file reference](https://eve.dev/docs/reference/agent-files).

## Loop controls

Verified native `defineAgent` limits are `maxInputTokensPerSession`, `maxOutputTokensPerSession`, `maxTokenCostUsdPerSession`, and `sessionTimeoutMs`, under `limits`. Token-cost limits cover reported model token cost, not infrastructure/tool charges; the crossing call finishes before the next-call check. Keep whole-run budgets and side-effect controls in the orchestration contract too.

Do not emit invented Eve fields such as `maxSteps` or `limits.maxSubagentDepth` without selected-version validation. The current subagent documentation says the latter no longer exists. Checkpoint batching `experimental.workflow.modelCallsPerStep` widens the replay unit and can repeat inline side effects; stable idempotency keys are still required. Sources: [configuration](https://eve.dev/docs/agent-config), [subagents](https://eve.dev/docs/subagents).

## Transferable architecture patterns

| Source | Adopt in canonical spec / coordination | Boundary |
| --- | --- | --- |
| [Paperclip](https://github.com/paperclipai/paperclip) | Atomic task checkout, a single execution owner, goal ancestry, event wakeups, company/agent/project budgets, responsible-user attribution, persisted task/run history | It is an organizational control plane, not a required agent framework. Reported-spend enforcement can lag in-flight work. |
| [CrewAI](https://docs.crewai.com/en/concepts/production-architecture) | Explicit flow, focused crews, minimal typed state, explicit inputs, structured handoffs, guardrails and persistence | A crew is a bounded unit of work inside the flow; freeform conversation should not become the execution contract. |
| [Microsoft Agent Framework](https://learn.microsoft.com/en-us/agent-framework/overview/) | Separate sessions, context providers, middleware, agent functions and explicit workflow paths | Runtime-specific integrations require their own adapter tests. Individual language/features have their own maturity. |
| [AutoGen](https://github.com/microsoft/autogen) | Historical reference for typed event coordination and bounded teams | Current README prominently states archived and no longer actively maintained by Microsoft; do not introduce a new production dependency. It directs users to [Agent Framework 1.0](https://devblogs.microsoft.com/agent-framework/microsoft-agent-framework-version-1-0/). |

## Starlight evidence policy (engineering recommendation)

Keep capability identity, descriptive display name, optional creative alias, prompt, graph edges and evaluation requirements canonical. Runtime bindings are separately versioned artifacts. Record `specified`, `exported`, `typechecked`, `smoke-tested`, `evaluated`, and `deployed` as evidence states, with runtime version, commit and evidence links. Generating an `agent.ts` proves only export generation.

Graph edges need types and handoff schemas: delegates, reviews, supplies-context, executes-with and owns-output. Runs need step/attempt/time/cost bounds, explicit termination, cancellation and side-effect replay policy. The [durable harness recovery rules](https://vercel.com/docs/agent-harnesses) distinguish replay-safe calls from calls that may have executed already; durable state alone does not certify exactly-once external effects.
