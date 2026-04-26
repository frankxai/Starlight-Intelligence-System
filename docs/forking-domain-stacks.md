# Forking Domain Stacks — the attribution-back pattern

> When a sovereign practitioner forks a reference vertical (HR Intelligence, future verticals) into their own private practice, this is the pattern they follow. Sovereignty stays with the practitioner; attestation flows back to the substrate.

---

## Why authorless reference

The reference verticals shipped at `verticals/<name>/` in this repo are **authorless**. They describe the synthesis a forking practitioner brings — but they do not name a specific person as the author of the synthesis. This is per Luminor Board v7.4.1 Item 2 (Path A): authorless-reference is the sovereignty-clean stance.

Reasons:
1. **No claim transfers.** The substrate makes no ownership claim on practitioner content; an authorless reference makes that structurally visible.
2. **Forks customize without rewriting attribution.** A practitioner forking the reference does not have to first remove someone else's identity before writing their own.
3. **Multiple forks compound the reference, not one author.** Every fork of HR Intelligence strengthens the reference vertical's pattern — not a single named author's brand.

The reference describes the *kind* of practitioner the vertical is for (e.g., "psychologist + neuroscientist + MBA + decade of in-the-room HR practice"). The fork is what becomes a specific practitioner's practice.

---

## The fork lifecycle

### Step 1 — fork

The practitioner forks the reference vertical via:
- `/sovereign-spawn <practitioner-slug>` — creates a full SIS fork in the practitioner's private repo, with the reference vertical included as a starting scaffold.
- `/spawn-domain-stack <domain-slug>` — generates a *new* domain sub-stack inside an existing SIS fork, using a reference vertical (e.g., HR Intelligence) as the architectural pattern.

The fork is the practitioner's repo, under their license terms, in their voice.

### Step 2 — claim authorship in the fork

In the fork's `verticals/<vertical>/MEMORY.md` § Identity, the practitioner fills:
```
Authored by: <practitioner-name-or-handle>
Founded: <year>
Practice URL: <https://practitioner-domain>
Source of truth: <https://github.com/practitioner/their-repo>
```

This claim is local to the fork. It does not modify the public reference.

### Step 3 — declare lineage in the fork

In `verticals/<vertical>/MEMORY.md` § Instance lineage:
```
Forked-from: frankxai/Starlight-Intelligence-System @ <commit-sha>
Forked-on: <YYYY-MM-DD>
Reference vertical: verticals/<vertical>/ at the SHA above
```

This makes the fork's debt to the reference visible and pinned. If the reference evolves, the fork can choose when to pull updates — the lineage names the version they branched from.

### Step 4 — attest forward

Every artifact the fork ships carries the SIP attestation footer with:
- **Substrate:** `starlightintelligence.org/protocol v1.1.0`
- **Reference vertical:** `<vertical>@<sha>` (so future readers can trace the lineage)
- **Practitioner identity:** the fork's own claimed authorship (only on artifacts the practitioner *intends* to publish under their name).

Attestation compounds — it does not transfer credit. A fork's attestation strengthens the reference vertical AND the practitioner's brand simultaneously.

---

## What stays open vs. what stays closed

| Asset | Open / closed | Lives where |
|---|---|---|
| **Reference vertical scaffold** (file contract, command structure, refusal-pattern grammar, attestation format) | Open · MIT | Public substrate at `frankxai/Starlight-Intelligence-System` |
| **Practitioner-specific frameworks** (the synthesis they bring, custom rubrics, productized methodology) | Closed · practitioner's IP | Practitioner's private fork |
| **Practitioner voice samples + Genius Profile** | Closed · practitioner's IP | Practitioner's private fork |
| **Client-shaped artifacts** (anonymized for any public output, fully private otherwise) | Closed · practitioner's IP | Practitioner's private fork |
| **Composition rules** (how sub-systems compose horizontally, the file contract, Luminor Board pressure-test cycle) | Open · MIT | Public substrate |

The practitioner controls what they publish under their own brand. The substrate controls only the cross-party attestation contract.

---

## When the fork should publish back upstream

A fork *can* contribute back to the reference vertical when:
1. The fork discovers a structural improvement to the file contract or command structure that benefits all forks (not just theirs).
2. The fork identifies a refusal pattern the reference missed.
3. The fork implements a sub-system the reference scaffolded but did not fill (e.g., a 7th sub-system that earns its keep in research distinctiveness).

The fork *should not* push back:
1. Practitioner-specific frameworks, voice samples, or productized methodology.
2. Client-shaped artifacts in any form.
3. Brand-specific positioning or pricing.

Upstream contributions follow normal substrate governance: PR → `/luminor-board` pressure-test → adopt or revise.

---

## Naming hygiene in forks

Forks may freely:
- Rename `<vertical>/` to a practitioner-specific slug (e.g., `verticals/hr-intelligence/` → `verticals/maria-hr-practice/`).
- Add new sub-systems, agents, commands, skills.
- Modify refusal patterns to match the practitioner's stance.
- Replace knowledge templates with practitioner-grade real examples.

Forks should **not**:
- Strip the SIP attestation footer.
- Misrepresent the lineage (claiming the substrate's MIT-licensed scaffold as proprietary work).
- Re-export under a more restrictive license without explicit consent (the substrate-aligned scaffold is MIT — practitioner content above it can be any license the practitioner chooses).

---

## Reference verticals available for forking

| Vertical | Domain | Status | Reference path |
|---|---|---|---|
| **HR Intelligence** | People-flourishing science (Hiring · Performance · Training · Culture · Talent · Org) | `scaffolded — v0.1.1` (authorless) | `verticals/hr-intelligence/` |
| **(future)** Capital Intelligence | Capital allocation, deal flow, DPI | Planned per `MASSIVE_ACTION_PLAN.md` | TBD |
| **(future)** Sound Intelligence | Music production, catalog, sync | Planned per `MASSIVE_ACTION_PLAN.md` | TBD |
| **(future)** Clinical Intelligence | Healthcare practice operations | Planned · awaiting practitioner partner | TBD |

Each new reference vertical follows the authorless pattern (Path A) by default. A practitioner who wants their fork to be co-attributed to them in public marketing can choose Path B in their fork — but the reference vertical itself stays authorless.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
- Substrate: starlightintelligence.org/protocol
- Layers used: [file-contract, attestation, sovereignty]
- Reference: forking-domain-stacks @ v7.5
- Generated: 2026-04-26
