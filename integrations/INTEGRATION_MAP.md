# Starlight Integration Map

> *"Connected systems are exponentially more powerful than isolated ones."*

---

## Overview

This document maps all integration points between Starlight and external systems, including MCP servers, APIs, and the FrankX ecosystem repos.

---

## Ecosystem Integrations

### FrankX Repos

| Repo | Integration Type | Channel | Context File |
|------|-----------------|---------|--------------|
| agentic-creator-os | Bidirectional Transmission | acos-channel.md | acos-context.md |
| arcanea | Bidirectional Transmission | arcanea-channel.md | arcanea-context.md |
| ai-ops | Bidirectional Transmission | ai-ops-channel.md | ai-ops-context.md |

### Integration Flow
```
Starlight ←→ Transmissions ←→ Repo Channels ←→ Repos
Starlight ←→ Context Engine ←→ Repo Context Files ←→ Repos
```

---

## MCP Server Integrations

MCP (Model Context Protocol) servers extend Starlight's capabilities by connecting to external services.

### Available MCP Servers

| MCP Server | Purpose | When to Activate |
|-----------|---------|-----------------|
| `filesystem` | Read/write local files | Vault operations, note management |
| `github` | Repository operations | Cross-repo context loading, PR creation |
| `web-search` | Internet search | Research tasks, external context |
| `browser` | Web browsing | Documentation lookup, external resources |
| `memory` | Persistent memory | Vault backend, long-term storage |

### MCP Activation Strategy

```
LAZY LOADING: Only activate MCP servers when needed.

1. Task arrives
2. Routing Matrix determines required capabilities
3. IF capability requires external system → activate relevant MCP
4. Use MCP for operation
5. Deactivate when no longer needed

REASON: MCP servers consume context window space.
         Only load what you need.
```

---

## Infrastructure Integrations (via AI-Ops)

When deployed with the AI-Ops infrastructure stack:

| Service | Purpose | Starlight Usage |
|---------|---------|-----------------|
| LiteLLM | Unified LLM gateway | Route to any AI provider |
| Langfuse | Observability | Track agent performance, skill usage |
| Qdrant | Vector search | Semantic vault queries |
| PostgreSQL | Relational storage | Structured vault data |
| Neo4j/FalkorDB | Knowledge graphs | Cross-reference mapping |
| n8n | Workflow orchestration | Automated workflows |

### Infrastructure Integration Notes

- These integrations are **optional** - Starlight works without them
- When available, they enhance capabilities (vector search, observability, etc.)
- AI-Ops channel carries infrastructure state updates
- Starlight can operate in **standalone mode** (markdown files only) or **enhanced mode** (with infrastructure)

---

## Integration Patterns

### Pattern 1: Transmission-Based
```
Starlight Agent → Transmission Skill → Channel File → Target System
```
Asynchronous, file-based. Works everywhere.

### Pattern 2: MCP-Based
```
Starlight Agent → Universal Adapter Skill → MCP Server → External API
```
Synchronous, real-time. Requires MCP server availability.

### Pattern 3: Context-Based
```
Target System → Context File → Context Engine → Starlight Agent
```
Read-only, snapshot-based. Updated periodically or on-demand.

---

## Adding New Integrations

1. Determine the integration pattern (Transmission, MCP, or Context)
2. Create the integration configuration:
   - Transmission → Add channel file in `transmissions/channels/`
   - MCP → Add configuration in `integrations/mcp/`
   - Context → Add context file in `context/repo-contexts/`
3. Update this Integration Map
4. Add activation rules to appropriate skill or hook
5. Test the integration
6. Send announcement via Broadcast Channel

---

*"Every new integration multiplies the system's intelligence."*
