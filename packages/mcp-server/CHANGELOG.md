# @starlight-intelligence/mcp

## 0.2.3

### Patch Changes

- 45b6374: Redact Supabase secret keys before recall queries reach a provider and before memory enters returned context. Mask named Supabase server-key fields in nested contexts while preserving publishable keys and explicit host sanitization options.

  Release the AI SDK adapter and MCP server with the repaired core as their minimum dependency version.
- Updated dependencies [45b6374]
  - @starlight-intelligence/core@0.2.2

## 0.2.2

### Patch Changes

- Reject malformed privacy namespace separators in gateway results before projection,
  including whitespace before the colon. Invalid privacy tags override public or
  shareable tags.

## 0.2.1

### Patch Changes

- 72dbb8f: Update the AI SDK development dependency to 7.0.133 and align Node.js development types with the supported Node 24 runtime. Include the changed package manifests in the next patch release.
- Retain recall tenant/workspace budgets and configured provider/sanitizer methods across callbacks and pending requests, preserve class-instance receivers, and stop provider egress when sanitization cancels the request. Mask provider and sanitizer diagnostics. MCP servers retain the methods selected at construction; provider state and authorization remain host responsibilities.
- Updated dependencies
  - @starlight-intelligence/core@0.2.1

## 0.2.0

### Minor Changes

- 5f3375d: Extract portable memory contracts, add scoped AI SDK memory middleware, and serve memory through the official MCP SDK.

### Patch Changes

- Updated dependencies [5f3375d]
  - @starlight-intelligence/core@0.2.0
