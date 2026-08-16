# Portfolio Agent Deployments

Generated from `context/empire/agent-deployments.json` on the 2026-08-16 evidence cutoff. Do not hand-edit this file.

## Current decision

- Control plane: `frankxai/Starlight-Intelligence-System`.
- Reference execution product: `frankxai/arcanea-ai-app`.
- Capability boundary: `tenant-aware-mcp`.
- Run invariant: `exactly-one-orchestration-loop-per-run`.
- Portfolio truth: 8 registered deployments, 0 agent deployments verified live, 5 planned paid offers. A healthy website is not evidence that its agent product is live.

## Build and launch queue

| P | Offering | Surface | Lifecycle | Runtime | Risk / autonomy | Commercial model | Next gate |
|---:|---|---|---|---|---|---|---|
| 1 | GenCreator Campaign Forge | GenCreator | spec | vercel-ai-sdk | R1 / draft-only | Subscription Plus Usage / Creation Unit | Ship one billing-gated workflow with tenant isolation, a hard provider budget, a rights attestation and synthetic-content provenance. |
| 2 | Arcanea Worldforge | Arcanea | spec | vercel-ai-sdk | R1 / draft-only | Subscription Plus Usage / Creation Unit | Repair the Arcanea domain binding, route timeouts and malformed-YAML errors, then expose one hosted tenant-aware MCP workflow. |
| 3 | Starlight Company Brain | Starlight Intelligence | spec | vercel-ai-sdk | R2 / approval-gated | Subscription / Seat | Implement tenant/RBAC, provider policy, immutable usage/cost events, approvals and an audit export before inviting a design partner. |
| 4 | Reality Architect Blueprint | Reality Architect | spec | vercel-ai-sdk | R2 / draft-only | Subscription / Seat | Complete isolated private-memory, sensitive-mode retention, deletion fan-out, crisis-language routing and public-claim review before adding AI. |
| 5 | FrankX Portfolio Guide | FrankX | spec | vercel-ai-sdk | R1 / draft-only | free acquisition | Replace stale hard-coded BYOK model identifiers with the shared model-policy registry and route every recommendation to an evidence-backed catalog entry. |
| 6 | Starlight Portfolio Plugin | Starlight Intelligence System | spec | chatgpt-host | R1 / draft-only | Subscription / Seat | Deploy a read-only Streamable HTTP MCP server with OAuth, entitlement checks, privacy policy, test account and MCP Inspector receipt. |
| 7 | Internal Production Studio | Starlight Intelligence System | spec | claude-agent-sdk | R3 / approval-gated | internal | Implement one isolated-worktree worker, route tools through the shared MCP service and require a human-approved draft PR receipt. |
| 8 | Eve Repository Steward | Starlight Intelligence System | spike | eve | R3 / approval-gated | internal | Run read-only against one repository, measure completion, retry cost and intervention rate, and keep all writes as approval-gated drafts. |

## Runtime boundaries

| Runtime | Decision | Loop owner | Inference plane | Scope |
|---|---|---|---|---|
| vercel-ai-sdk | approved-default | ai-sdk-tool-loop-agent | vercel-ai-gateway | Provider-neutral streaming product agents and structured workflows in Next.js. |
| openai-agents-sdk | approved-exception | openai-agents-runner | direct-openai | OpenAI-native hosted tools, voice, research, computer-use, handoffs or resumable approvals unavailable through the default runtime. |
| claude-agent-sdk | approved-exception | claude-agent-sdk-session | direct-anthropic | Internal repository, filesystem, shell, research and artifact-production workers. |
| eve | pilot-only | eve-session-runtime | vercel-ai-gateway | Durable scheduled or long-running internal backend-agent pilots. |
| chatgpt-host | approved-exception | chatgpt-host | host-managed | Portfolio distribution through one plugin family: portable skills, authenticated MCP tools and optional MCP Apps UI. |
| google-adk | deferred | google-adk-runner | runtime-managed | Only a future Vertex-native graph runtime or independently operated A2A agent requirement. |

One run has one loop owner. Vercel AI SDK, OpenAI Agents SDK, Claude Agent SDK, Eve, ChatGPT host and Google ADK are alternative orchestration owners, never a nested chain. Domain capabilities are typed once and exposed through the tenant-aware MCP boundary.

## Surface evidence

| Brand | Repository | Domains | State | Boundary | Evidence note |
|---|---|---|---|---|---|
| FrankX | `frankxai/frankx.ai-vercel-website` | frankx.ai, www.frankx.ai | production-ready | shared-product-kernel | Production deployment was READY on main; eight of ten recent deployments were ready and no 24-hour runtime errors were observed. |
| Arcanea | `frankxai/arcanea-ai-app` | binding not verified | production-ready | shared-product-kernel | Canonical production deployment was READY, but arcanea.ai was not visible in the connected project domain list; GitHub issue 223 tracks the binding. Canonical domain binding remains an explicit release gate. |
| Starlight Intelligence | `frankxai/starlight-intelligence-web` | starlightintelligence.ai | production-ready | shared-product-kernel | Production was READY with ten of ten recent deployments ready and no runtime errors; repository is currently a marketing surface without an AI runtime. |
| GenCreator | `frankxai/gencreator.ai` | gencreator.ai | production-ready | shared-product-kernel | Production was READY with ten of ten recent deployments ready and no runtime errors. Current AI endpoint is product-specific AI SDK 4 with a server-managed Anthropic key and should be migrated through the shared adapter. |
| Reality Architect | `frankxai/realityarchitect` | realityarchitect.ai | production-ready | isolated-personal-memory | Production was READY with ten of ten recent deployments ready and no runtime errors. Current assessment is deterministic and local; no AI SDK runtime is implemented on the audited main branch. |
| Starlight Intelligence System | `frankxai/Starlight-Intelligence-System` | starlightintelligence.org | production-ready | internal-only | The SIS site subproject was production READY with ten of ten recent deployments ready; the duplicate root deployment is independently broken and should be retired, not treated as a site outage. |

## Enforced portfolio gates

- Never resell raw provider credits or expose an undifferentiated inference proxy. Sell finished workflows, governed seats, Creation Units, Render Packs and versioned first-party packs.
- BYOK secrets are encrypted, write-only and configured on a secure account surface. They never enter prompts, client bundles, logs or MCP parameters.
- Managed usage has a hard tenant budget. The product ledger—not AI Gateway—is billing truth.
- R3+ work is approval-gated. R5 deployments are rejected. Publish, send, delete, deploy, financial and external-write effects are enforced in the tool layer.
- Sensitive data requires an EU route, ZDR and the isolated Reality Architect memory boundary. It cannot enter preview runtimes.
- A deployment cannot move to `live` without production surface evidence and test evidence.

## Revenue guardrails

- Target at least 75% median gross margin and 65–70% at p95 for managed AI products.
- Keep included provider spend below 15–20% of net revenue and hard-stop at 30% until observed economics justify a change.
- Price image and video at 2.2–3× blended provider, retry, moderation and storage cost; never offer unlimited video.
- Launch first-party packs before any third-party marketplace. Seller verification, tax reporting, content moderation, takedown, payouts and disputes are separate launch gates.

Built on SIP.
