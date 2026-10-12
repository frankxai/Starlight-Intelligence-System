# @starlight-intelligence/core

## 0.2.1

### Patch Changes

- Retain recall tenant/workspace budgets and configured provider/sanitizer methods across callbacks and pending requests, preserve class-instance receivers, and stop provider egress when sanitization cancels the request. Mask provider and sanitizer diagnostics. MCP servers retain the methods selected at construction; provider state and authorization remain host responsibilities.

## 0.2.0

### Minor Changes

- 5f3375d: Extract portable memory contracts, add scoped AI SDK memory middleware, and serve memory through the official MCP SDK.
