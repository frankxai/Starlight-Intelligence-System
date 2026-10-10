# Starlight memory MCP

Standalone MCP server using the official TypeScript SDK v2. It exposes scoped
memory recall without loading the SIS vault filesystem, SQLite engine, or orchestration
runtime. The executable bridges an existing operator-owned SIS HTTP gateway.

```sh
npm install @starlight-intelligence/mcp
starlight-memory-mcp --gateway http://127.0.0.1:7777 --tenant team-a
```

Set `STARLIGHT_GATEWAY_TOKEN` through the client's secret environment mechanism.
The gateway must be dedicated to that tenant. Its existing search endpoint does
not implement multi-tenant authorization; the bridge assigns the host-configured
scope to its results. `--workspace` similarly labels that dedicated gateway scope.
Use separate gateways or an independently authorized provider for multiple scopes.
The sample port is illustrative; pass the actual gateway origin.

The exported gateway reader requires request tenant/workspace to match its
host-configured scope before sending HTTP. Core forwards the host-selected
workspace in `RecallRequest.workspace_id`; providers still own access control.
Blank or oversized queries and invalid result limits are rejected before HTTP.
The MCP initialization version follows the installed package's Changesets version.

The CLI serves read-only JSON-RPC MCP over stdio. It writes no operational logs
to stdout. HTTP is permitted only for loopback origins; remote gateways require
HTTPS. Redirects, URL credentials, paths, and oversized responses are rejected.
Only public-tagged records are returned by default. `--allow-shareable` permits
unclassified gateway facts after host review. Private/secret/regulated tags and
expired entries remain excluded. Records are projected and sanitized by core.
Present expiry values must be parseable strings, and present tags must be arrays
of strings. Malformed metadata drops the record even when shareable recall is
authorized; it cannot silently remove retention or erase a private tag.

For an in-process provider:

```ts
import { createStarlightMcpServer } from '@starlight-intelligence/mcp';
import { serveStdio } from '@modelcontextprotocol/server/stdio';

serveStdio(() => createStarlightMcpServer({ memory, tenantId: 'team-a' }));
```

The host chooses scope and tools. `starlight_memory_recall` is always available.
Host sharing/write/delete grants must be booleans. Malformed grants and blank
workspace configuration are rejected before any tools are registered.
`allowWrite` plus a `remember` implementation enables sanitized fact storage with
a caller-supplied stable ID and 90-day retention metadata. `allowDelete` plus
`forget` enables tenant-scoped deletion. Workspace-scoped deletion is rejected
because the existing provider deletion contract cannot authorize it. Tool arguments
cannot change tenant or workspace. An authenticated host must approve write/delete
authority; tool annotations are hints, not authorization. Write/delete operations
use provider lifecycle semantics and have no automatic retries; providers must
implement cancellation, bounded execution, idempotency, and actual retention.

Recall has bounded waiting and cooperative cancellation. Provider failures return
fixed errors without credential-bearing exception messages. The CLI has no writes,
HTTP MCP listener, or OAuth service. Hosts may attach the factory to official SDK
transports after implementing their own authentication and lifecycle controls.

Tests exercise official client handshakes, tool calls, strict scope rejection,
redaction, optional writes, and repeated stdio connections. They use a local gateway
fixture, not a production gateway. Code: MIT.
