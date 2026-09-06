# Starlight Intelligence Cloud Plugin

Starlight is a governed venture control plane for ChatGPT and Codex. Version 0.2 runs as an authenticated remote MCP server on Cloudflare Workers and stores authoritative workspace state in the existing Starlight Platform Supabase project. Users connect to one HTTPS endpoint; no plugin download or local Codex runtime is required.

## Architecture

- Four portable skills: command center, execution, decision ledger, and knowledge retrieval.
- Ten MCP tools, including standard read-only `search` and `fetch` tools.
- A decoupled MCP Apps UI: `get_portfolio_snapshot` returns authoritative data and `render_command_center` renders the complete, model-checked snapshot.
- Stateless Cloudflare `createMcpHandler()` transport at `/mcp` using MCP SDK v2.
- Cloudflare Access JWT validation plus an explicit email allowlist on every MCP request.
- Tenant-scoped Supabase persistence with optimistic workspace and record concurrency.
- Versioned UI resources, submission evals, CI, and a controlled production deployment workflow.

The local SIS vaults are not exposed. This service owns only the cloud-safe venture workspace stored in `public.starlight_workspaces`.

## Tool surface

| Tool | Purpose | Mutation |
| --- | --- | ---: |
| `get_portfolio_snapshot` | Read a filtered authoritative portfolio snapshot | No |
| `search_workspace` | Resolve records by text, venture, and type | No |
| `get_record` | Fetch one stable record and version | No |
| `search` | Standard company-knowledge search | No |
| `fetch` | Standard company-knowledge record fetch | No |
| `create_work_item` | Create accountable venture work | Yes |
| `transition_work_item` | Move work with optimistic concurrency | Yes |
| `record_decision` | Preserve choice, tradeoffs, evidence, and owner | Yes |
| `register_evidence` | Register and link a source or observation | Yes |
| `render_command_center` | Render a complete inspected snapshot | No |

Transitions to `done` or `cancelled`, and decisions recorded as `approved` or `rejected`, require explicit user confirmation. Every mutation records the authenticated Access identity in the audit event.

## Develop and verify

Requirements: Node.js 22 or later.

```bash
npm ci
npm run validate
npm run check
npm test
npm run build
npm run smoke:worker
```

For local Worker development, copy `.dev.vars.example` to `.dev.vars`, fill the values, then run `npm run dev`. Secrets are never committed.

## One-time cloud setup

The code, migration, tests, and CI are automated. These account-bound values must be created or supplied once by an administrator:

1. Apply `supabase/migrations/20260831111500_create_starlight_workspaces.sql` to the Starlight Platform project.
2. Create the protected GitHub production environment with the seven values listed in `docs/cloud-deployment.md`, using `bootstrap-not-live` temporarily for `CF_ACCESS_AUD`, then run the workflow once. The MCP route remains fail-closed during this bootstrap.
3. Add `mcp.starlightintelligence.ai` as the Worker custom domain.
4. In Cloudflare Zero Trust, add the live MCP URL and enable Access Managed OAuth for the allowed identity. The Worker independently validates the resulting Access JWT.
5. Replace `CF_ACCESS_AUD` with the generated Access application audience and rerun the workflow. The workflow uploads all runtime secrets alongside the code.
6. In ChatGPT developer mode, connect `https://mcp.starlightintelligence.ai/mcp`, complete OAuth, scan tools, and run the cases in `evals/golden-cases.json`.

See [cloud-deployment.md](docs/cloud-deployment.md) for the exact release sequence and rollback boundary.

Built on SIP — Starlight Intelligence Protocol.
