# MEMORY — `<Vertical Name>`

> Per-vertical memory file. Records declared identity, ICP, open/closed boundary, instance lineage, and changelog. Forking practitioners overwrite the placeholder values with their own; the structure stays.

---

## Pre-publish checklist *(do not push a fork until every box is checked)*

Per OpenClaw v7.5 HIGH-6: a fork pushed with placeholders intact ships a SIP-attested artifact carrying placeholder content (e.g., literal `<name>` in MEMORY.md). Substrate-attestation is ambient — the artifact will carry "Built on SIP" alongside the placeholder text, which is decorative-attestation drift.

Before any fork pushes its first public commit:

- [ ] `<name>` replaced with the practitioner's real vertical name.
- [ ] `<slug>` replaced with the practitioner's chosen URL-safe slug.
- [ ] `<YYYY-MM-DD>` (spawn date) replaced with the actual fork date.
- [ ] `<command-or-author>` replaced with the spawn command (`/spawn-domain-stack` or equivalent) or named author.
- [ ] `<your handle / org>` replaced with the practitioner's identifier.
- [ ] `<commit-sha>` replaced with the actual SHA the practitioner forked from.
- [ ] `<list>` replaced with actual composition map (Universal IS layers + Sister verticals + Canon imports).
- [ ] `<one-sentence summary>` replaced with the actual domain declaration.
- [ ] All `<>`-bracketed fields elsewhere in the file resolved.

Substrate enforcement: `test/v75.test.ts` Block 5 (or v7.5.1+ equivalent) asserts that any vertical's `MEMORY.md` whose path is **not** `verticals/_template/MEMORY.md` does not contain the literal strings `<name>`, `<slug>`, or `<commit-sha>`. The template is the only place those literals are allowed.

---

## Declared identity

- **Vertical name:** `<name>`
- **Slug:** `<slug>`
- **Tier:** sovereign vertical | domain sub-stack | IS layer
- **Spawned:** `<YYYY-MM-DD>` via `<command-or-author>`
- **Reference repo:** `verticals/<slug>/` in `frankxai/Starlight-Intelligence-System` (until forked into private practice repo)

---

## Domain & ICP

- **Declared domain:** `<one-sentence summary>`
- **ICP (ideal customer / user):** `<who this vertical is for; practitioner forks narrow this further>`
- **Open boundary:** MIT for substrate-aligned reference patterns (file contract, command structure, attestation format).
- **Closed boundary:** the practitioner's frameworks, voice, research synthesis, and client-shaped artifacts remain the practitioner's IP.

---

## Composition map

- **Universal IS layers composed with:** `<list>`
- **Sister verticals composed with:** `<list>`
- **Canon imports:** `<list or "none">`

---

## Instance lineage (for forks)

When a practitioner forks this reference, they record their lineage here:
- Forked-from: `frankxai/Starlight-Intelligence-System` @ `<commit-sha>`
- Forked-on: `<YYYY-MM-DD>`
- Practitioner identifier: `<their handle / org>`
- Attestation back: how this fork credits the reference (typically via "Built on SIP" footer + reference-vertical SHA pin).

---

## Reference lineage SHAs

When a material event lands in this vertical (rewrite, sub-system addition, board verdict, sovereignty-affecting change), record the commit SHA here so future forks can verify the lineage they branched from:

- `<event>` · `<YYYY-MM-DD>` · `<commit-sha>` · `<one-sentence what-happened>`

The HR Intelligence vertical models this pattern at `verticals/hr-intelligence/MEMORY.md` § Changelog.

---

## Changelog

- `v0.1` · `<YYYY-MM-DD>` · Spawned. File contract scaffolded. No instance content yet.

---

**Built on SIP** — `<vertical-name>` MEMORY.md · v0.1 · SIP v1.1.0
