---
name: marine-intelligence-contribute
description: Use when contributing to or reasoning over the Ocean / Marine Intelligence vertical — species pages, field missions, marine research, the Blue Life Commons. Orients to the external triad (commons + IS-engine + OS) and routes to the right authoring skill.
---

# Marine Intelligence — contribute

Ocean / Marine Intelligence is a **sovereign operated vertical that publishes a public commons** — the first Commons/IS/OS triad on SIP. This in-repo skill is the substrate pointer; the working surfaces live in external repos.

## The triad

| Layer | Repo | Use it for |
|---|---|---|
| Commons | `frankxai/blue-life-commons` (public) | The reviewed corpus + governance (`AGENTS.md`, `ETHICS.md`, `SOURCES.md`, `schema/`). Clone this to contribute. |
| IS-engine | `frankxai/marine-mcp` (public) | Review-gated MCP that serves the corpus to agents (source-attributed). Configure with `BLC_PATH`. |
| IS-engine | `frankxai/marine-agent-skills` (public) | The authoring skill pack: `/species-page`, `/field-mission`, `/ethics-check`, `/source-verify`, `/validate-artifact`, `/open-artifact-pr`. |
| OS-runtime | `frankxai/ocean-intelligence-system` (private) | Dashboard + partner gateway; consumes marine-mcp. |

## How to contribute (the pipeline)

Work from a checkout of `blue-life-commons` with `marine-agent-skills` available:

```
author (/species-page | /field-mission)
  → /source-verify   (every factual claim cited)
  → /ethics-check    (welfare; no precise locations for vulnerable taxa; no anthropomorphism)
  → /validate-artifact (schema gate) + scripts/lint_content.py (integrity gate)
  → /open-artifact-pr  (PR, not direct commit — reviewers decide truth)
```

## Non-negotiables (inherited from the commons)

- Every factual claim needs a Tier 1–2 source. No source, no claim.
- Science-sensitive content ships as `needs-expert-review`; you do not decide scientific truth.
- No precise locations for vulnerable taxa (GBIF 4-tier sensitivity model).
- No anthropomorphic claims presented as fact.

## Attestation

Artifacts carry ambient **"Built on SIP · Blue Life Commons"**. See `VERTICALS.md` § Ocean Intelligence (Marine) and `docs/boards/2026-06-15-ocean-marine-substack.md`.

> Built on SIP · Starlight Intelligence System.
