# STACK — <VERTICAL-NAME>

> Stack choices for this vertical. Defaults inherit from Starlight's `STACK.md` (L0–L6); override only where domain demands it.

## Inheritance

- **Starlight STACK:** `inherited from starlightintelligence.org` unless noted below
- **Override scope:** `<"none" | list of layers this vertical customizes>`

## Layers

| Layer | Purpose | This vertical uses | Reason if override |
|-------|---------|-------------------|---------------------|
| L0 — OS / shell | Workstation substrate | `<inherited \| override>` | `<...>` |
| L1 — Source control | Repo + commits | `<inherited \| override>` | `<...>` |
| L2 — AI tooling | Primary assistants, MCPs | `<inherited \| override>` | `<...>` |
| L3 — Language + runtime | Code layer | `<inherited \| override>` | `<...>` |
| L4 — Data + state | Persistence, vaults | `<inherited \| override>` | `<...>` |
| L5 — Distribution | Surface (site, API, feed) | `<inherited \| override>` | `<...>` |
| L6 — Community + feedback | Audience loop | `<inherited \| override>` | `<...>` |

## MCP servers used

| MCP | Purpose | `mcp.json` declaration |
|-----|---------|------------------------|
| starlight-mcp | Substrate memory + attestation | <version pin> |
| <vertical-mcp> | <vertical-specific tools> | <version pin> |

## Sovereign note

This vertical's stack choices are advisory within the Starlight ecosystem, not mandates. Each adopter may diverge per SIP § 5 (sovereignty). Attribution compounds regardless of stack divergence — the protocol is stack-neutral.

---

**Built on SIP** — vertical STACK.md template · v7.3
