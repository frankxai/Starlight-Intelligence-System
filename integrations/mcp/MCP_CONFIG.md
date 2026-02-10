# MCP Server Configuration

> *"Extend Starlight's reach through Model Context Protocol."*

---

## Overview

MCP (Model Context Protocol) servers provide Starlight with access to external tools and services. This file defines the available MCP servers and their configurations.

---

## Server Definitions

### filesystem

```json
{
  "name": "filesystem",
  "purpose": "Local file system access",
  "capabilities": ["read_file", "write_file", "list_directory", "search_files"],
  "activation": "auto",
  "starlight_usage": [
    "Reading and writing vault files",
    "Managing note files",
    "Updating transmission channels",
    "Context file operations"
  ]
}
```

### github

```json
{
  "name": "github",
  "purpose": "GitHub repository operations",
  "capabilities": ["read_repo", "create_pr", "search_code", "list_issues"],
  "activation": "on-demand",
  "starlight_usage": [
    "Cross-repo context loading from live repos",
    "Creating PRs for ecosystem updates",
    "Searching for patterns across repos",
    "Issue tracking and management"
  ]
}
```

### web-search

```json
{
  "name": "web-search",
  "purpose": "Internet search capabilities",
  "capabilities": ["search", "fetch_url"],
  "activation": "on-demand",
  "starlight_usage": [
    "Researching new patterns and technologies",
    "Finding documentation for integrations",
    "External knowledge acquisition"
  ]
}
```

### browser

```json
{
  "name": "browser",
  "purpose": "Web browsing and interaction",
  "capabilities": ["navigate", "screenshot", "interact"],
  "activation": "on-demand",
  "starlight_usage": [
    "Reading detailed documentation",
    "Interacting with web-based tools",
    "Visual verification of deployments"
  ]
}
```

### memory

```json
{
  "name": "memory",
  "purpose": "Persistent memory storage",
  "capabilities": ["store", "retrieve", "search", "delete"],
  "activation": "auto",
  "starlight_usage": [
    "Vault backend for persistent storage",
    "Semantic search across vault entries",
    "Long-term knowledge persistence"
  ]
}
```

---

## Activation Strategy

| Strategy | Description | Servers |
|----------|-------------|---------|
| **auto** | Always available, minimal overhead | filesystem, memory |
| **on-demand** | Activated only when needed | github, web-search, browser |
| **manual** | User must explicitly request | (future servers) |

---

## Adding New MCP Servers

1. Define the server configuration (name, purpose, capabilities)
2. Add to this file
3. Determine activation strategy
4. Map capabilities to Starlight skills
5. Update INTEGRATION_MAP.md
6. Test connectivity

---

*"MCP servers are Starlight's hands reaching into the world."*
