# MEMORY — Starlight Instance State (template)

Template for alliance or vertical memory. Copy to your instance's root, rename to `MEMORY.md` if adopting wholesale. Update at every cycle close or after any structural change.

This file is the **public template**. Real instance state — Notion IDs, partner names, in-flight commitments, financial detail — is held privately by each adopter (do not commit it to a public repo).

## Identity

- **Name:** `<your instance name>`
- **Type:** `<alliance | vertical | substrate>`
- **Authored by:** `<your name / entity>`
- **Founded:** `<year>`
- **SIP version:** `v1.0.0`
- **Canonical public URL:** `<your protocol URL or starlightintelligence.org/protocol>`
- **Source of truth:** `<your repo>`

## Sovereign verticals (if you operate any)

| Vertical | Owner | Status | Notes |
|----------|-------|--------|-------|
| `<name>` | `<entity>` | `active vN` | `<one-line>` |
| ... | ... | ... | ... |

## Alliances (if you participate in any)

| Alliance | Members | Your role | Status |
|----------|---------|-----------|--------|
| `<name>` | `<count nodes, names if public-OK>` | `<architect / advisor / etc.>` | `<cycle N status>` |
| ... | ... | ... | ... |

## External authorities

- **Intent authority:** `<Notion DB ID or other system>` — the "why" lives here.
- **Source of truth:** `<GitHub org/repo>` — the "what holds now" lives here.
- **Runtime state:** `<Supabase / DB / etc.>` — the "what's happening now" lives here.

(Keep IDs in your private state; substitute placeholders in any public surface of this file.)

## Active roadmap

| Milestone | Target date | Owner | Status |
|-----------|-------------|-------|--------|
| `<milestone>` | `<date>` | `<owner>` | `<status>` |
| ... | ... | ... | ... |

## Non-negotiables (substrate-level)

- "Built on SIP" attribution on every cross-vertical or cross-node artifact.
- Sovereignty clause (SIP § 5) is not waivable. Parties that cannot accept it do not adopt SIP.
- Canon license (CC-BY-NC for Arcanea canon) is enforceable.
- Open boundary (MIT) for the substrate spec is permanent — no re-licensing.

## Open forks

| Fork | Options | Owner | Decide by |
|------|---------|-------|-----------|
| `<fork>` | `<options>` | `<owner>` | `<date>` |
| ... | ... | ... | ... |

## Changelog

- `vX.Y.Z` · `<date>` · `<one-line summary>`

---

**Built on SIP** · v1 · MIT
