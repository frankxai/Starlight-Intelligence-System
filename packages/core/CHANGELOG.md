# @starlight-intelligence/core

## 0.2.2

### Patch Changes

- 45b6374: Redact Supabase secret keys before recall queries reach a provider and before memory enters returned context. Mask named Supabase server-key fields in nested contexts while preserving publishable keys and explicit host sanitization options.

  Release the AI SDK adapter and MCP server with the repaired core as their minimum dependency version.

## 0.2.1

### Patch Changes

- Retain recall tenant/workspace budgets and configured provider/sanitizer methods across callbacks and pending requests, preserve class-instance receivers, and stop provider egress when sanitization cancels the request. Mask provider and sanitizer diagnostics. MCP servers retain the methods selected at construction; provider state and authorization remain host responsibilities.

## 0.2.0

### Minor Changes

- 5f3375d: Extract portable memory contracts, add scoped AI SDK memory middleware, and serve memory through the official MCP SDK.
