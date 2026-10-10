# Official documentation register

Baseline checked **2026-10-09**. These are research inputs, not installed dependency versions or proof of account access. Reopen the official pages and inspect the project's lockfile before implementation. Verify prices, limits, availability, API signatures, region and security advisories for the intended deployment.

| Source | Verified capability or obligation | Decision implication |
| --- | --- | --- |
| [OpenAI agent runtimes](https://developers.openai.com/api/docs/guides/agents) | Managed Agents API, application-owned Agents SDK and direct Responses integration are distinct options | Select ownership of loop/state before selecting an SDK |
| [Agents API overview](https://developers.openai.com/api/docs/guides/agents-api/overview) | Managed Codex harness, durable sessions and configurable environments | Candidate for long tasks; verify retention and cleanup |
| [Agent workflow evaluation](https://developers.openai.com/api/docs/guides/agent-evals) | Traces support debugging; datasets/eval runs support repeatable comparison | Keep behavioral evidence separate from structural checks |
| [Sandbox security](https://developers.openai.com/api/docs/guides/agents-api/environments/security) | Generated code can access available credentials/files/network; broker third-party access outside execution | Isolation and credential boundaries need real infrastructure |
| [AI SDK 7 release](https://vercel.com/blog/ai-sdk-7) | Tool approvals, durable WorkflowAgent, timeout controls; harness abstractions are experimental | Pin and test current SDK; keep experimental paths optional |
| [LangGraph architecture](https://docs.langchain.com/oss/javascript/langgraph/thinking-in-langgraph) | Explicit nodes, persistence, interrupts and recovery | Design checkpoint boundaries and safe replay |
| [Next.js data security](https://nextjs.org/docs/app/guides/data-security) | Server/client boundary, protected data access and secret handling | Authorize server actions and minimize client data |
| [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys) | Publishable keys rely on policies/user context; secret credentials bypass RLS | Elevated server access needs its own tenant authorization |
| [MCP SDK authorization](https://ts.sdk.modelcontextprotocol.io/v2/serving/authorization) | Resource server verifies authorization-server tokens | Verify audience/scope and authorize each resource |
| [EU transparency guidelines announcement](https://digital-strategy.ec.europa.eu/en/news/commission-publishes-guidelines-transparency-obligations-providers-and-deployers-certain-ai-systems) | Article 50 transparency obligations begin applying 2 August 2026 | Screen relevant interaction and synthetic-content disclosure |
| [EU AI Act enforcement](https://digital-strategy.ec.europa.eu/en/policies/enforcement-ai-act) | Prohibited practices, GPAI and transparency obligations are distinct | Assess purpose and actor role; do not infer classification from autonomy |
| [AI literacy](https://digital-strategy.ec.europa.eu/en/policies/ai-talent-skills-and-literacy) | Providers/deployers have context-sensitive literacy obligations | Prepare role-specific operational training |

For each material choice emit: source URL, date checked, installed/pinned version if relevant, scoped claim, contrary evidence, applicability and test required. On conflicting sources prefer current normative specifications and actual source code over old blog examples. Label unverified implementations pending.
