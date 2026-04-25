# STACK — <DOMAIN>

> Stack choices for this Domain Sub-Stack. Defaults inherit from Starlight's `STACK.md` (L0–L6); override only where the domain demands it.

---

## Inheritance

- **Starlight STACK:** `inherited from starlightintelligence.org` unless noted below
- **Override scope:** `<"none" | list of layers this vertical customizes>`

---

## Layers

| Layer | Purpose | This vertical uses | Override source | Reason if override |
|---|---|---|---|---|
| L0 — OS / shell | Workstation substrate | `<inherited | override>` | `<your source>` | `<reason>` |
| L1 — Source control | Repo + commits | `<inherited | override>` | `<your source>` | `<reason>` |
| L2 — AI tooling | Primary assistants, MCPs | `<inherited | override>` | `<your source>` | `<reason>` |
| L3 — Language + runtime | Code layer | `<inherited | override>` | `<your source>` | `<reason>` |
| L4 — Data + state | Persistence, vaults | `<inherited | override>` | `<your source>` | `<reason>` |
| L5 — Distribution | Surface (site, API, feed) | `<inherited | override>` | `<your source>` | `<reason>` |
| L6 — Community + feedback | Audience loop | `<inherited | override>` | `<your source>` | `<reason>` |

---

## MCP servers used

| MCP | Purpose | `mcp.json` declaration | Scope |
|---|---|---|---|
| starlight-mcp | Substrate memory + attestation | `<version pin>` | universal |
| `<vertical-mcp>` | `<vertical-specific tools — e.g., ATS integration, LMS bridge, stay-interview runner>` | `<version pin>` | vertical-scoped |

Only declare vertical-scoped MCPs that are genuinely vertical-specific. Most capability belongs in substrate-level MCPs shared across verticals.

---

## Sub-system-level overrides

Sub-systems generally inherit vertical-level stack choices. If a specific sub-system requires an override (e.g., a clinical-grade instrument requires a specific EMR-adjacent bridge), declare it here:

| Sub-system | Layer | Override | Reason |
|---|---|---|---|
| `<sub-system>` | `<L0-L6>` | `<tooling>` | `<reason>` |

Absence of entries = all sub-systems inherit cleanly. This is the default and preferred state.

---

## Sovereign note

This vertical's stack choices are advisory within the Starlight ecosystem, not mandates. Each adopter may diverge per SIP § 5 (sovereignty). Attribution compounds regardless of stack divergence — the protocol is stack-neutral.

A Domain Sub-Stack typically runs lighter on stack customization than a wholly novel vertical. The sub-systems are the value; the stack is the delivery substrate. If you find yourself overriding many layers, revisit whether the real work is a stack-level vertical (`/vertical-spawn`) rather than a Domain Sub-Stack.

---

**Built on SIP** — domain-stack-starter STACK.md template · v7.4.1 · SIP v1.1.0
