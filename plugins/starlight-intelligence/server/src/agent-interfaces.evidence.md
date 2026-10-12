# Native interface reference evidence

Documentation inspection: 2026-09-30. Review due: 2026-10-30. These are public
primary-source references, not authenticated instance probes or compatibility
tests. Re-check before choosing a worker; beta and local interfaces can change.

| Catalog ID | Primary source inspected | Observation supporting the catalog |
|---|---|---|
| chatgpt-apps | https://developers.openai.com/plugins/build/app-quickstart | MCP tools/resources and the standard MCP Apps UI bridge; reuse the existing server |
| openai-agents | https://developers.openai.com/api/docs/guides/agents-api/overview | Managed Codex harness; SDK `beta.agents.sessions.create`; beta `/v1/agents/sessions`; cloud/self-hosted environment choices |
| openai-agents-sdk | https://openai.github.io/openai-agents-python/ | Application-owned Agent/Runner loop, handoffs and tracing |
| codex | https://learn.chatgpt.com/docs/app-server | Per-connection initialization; thread/start, turn/start, progress and completion notifications |
| claude | https://code.claude.com/docs/en/claude-code-on-the-web and https://code.claude.com/docs/en/cli-reference | New cloud session through `claude --cloud`; local `-p`, JSON output and permission mode flags |
| google-adk | https://adk.dev/a2a/ | ADK remote agent integration through A2A; framework and protocol remain distinct |
| opencode | https://opencode.ai/docs/server/ and https://opencode.ai/docs/acp/ | Session HTTP API, asynchronous prompt and event stream; ACP integration |
| hermes | https://hermes-agent.nousresearch.com/docs/developer-guide/programmatic-integration | ACP, TUI gateway RPC and HTTP/SSE; responses and asynchronous run routes |
| openclaw | https://docs.openclaw.ai/gateway/openresponses-http-api | Responses HTTP endpoint is disabled by default; shared-secret bearer has full operator access |
| paperclip | https://github.com/paperclipai/paperclip/tree/94e8dec56b359f639ea7b37c577115bc347d062b | Bounded source inspection of native work/decision/run contracts and provider adapters; no full-code audit or runtime installation |

The separate real Claude GitHub review route operates in Agentic Ops through its
existing workflow. That session evidence does not establish any provider binding
inside this plugin. `get_agent_interfaces` therefore always returns
`runtime_connections: not_evaluated`.

Code review source packets, CI, preview metadata and runtime checks are separate
evidence classes. Preserve the exact revision each one actually covers.
