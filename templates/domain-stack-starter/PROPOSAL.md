# <DOMAIN> — Domain Sub-Stack Architecture Proposal

> Output format for `/spawn-domain-stack` step 4 (Architecture Proposal). Template below is the canonical shape. The command writes this file into `verticals/<vertical-slug>/PROPOSAL.md` on each run, appending version blocks on iteration.

---

## Sovereign: `<person-name>`
## Generated: `<ISO date>` — SIP v1.1.0

---

## Domain anchor

<ONE sentence. What this domain is in the sovereign's hands — not the textbook definition. Example: "People Intelligence in this practitioner's hands is psychologist + neuroscientist + MBA + ten years of HR-room practice — not generic people-ops.">

---

## Cross-domain synthesis edge (load-bearing — must be named)

<ONE sentence. The unique combination that justifies productization. If this cannot be named, the command halts in step 2.>

---

## Frameworks-in-domain (from Genius Profile)

- `<framework 1>` — cited verbatim from Profile
- `<framework 2>`
- `<framework 3>`
- `<...>`
- `<framework N>`

---

## KEEP-bucket overlap (from Freedom Path)

- `<KEEP item 1>` — only-this-sovereign-owns work that lives in this domain
- `<KEEP item 2>`
- `<...>`

---

## Proposed sub-systems (`<n>` — must be 4-7)

### Sub-system 1 — `<Name>`

| Field | Content |
|---|---|
| **Slug** | `<slug>` (≤10 chars) |
| **Scope** | `<one paragraph — what this sub-system owns, what it refuses>` |
| **Commands (4-5)** | `/<slug>-<v1>` · `/<slug>-<v2>` · `/<slug>-<v3>` · `/<slug>-<v4>` [· `/<slug>-<v5>`] |
| **Research grounding** | `<field lit + how the synthesis edge contributes>` |
| **Composes with** | `<sister sub-systems + how>` |
| **Synthesis edge presence** | `<load-bearing | supporting | absent>` — must be load-bearing in ≥3 sub-systems total |

### Sub-system 2 — `<Name>`

| Field | Content |
|---|---|
| **Slug** | `<slug>` |
| **Scope** | `<...>` |
| **Commands (4-5)** | `<...>` |
| **Research grounding** | `<...>` |
| **Composes with** | `<...>` |
| **Synthesis edge presence** | `<load-bearing | supporting | absent>` |

### Sub-system 3 — `<Name>`

`<repeat shape>`

### Sub-system 4 — `<Name>`

`<repeat shape>`

### Sub-system 5 — `<Name>`

`<repeat shape>`

### Sub-system 6 — `<Name>` (optional)

`<repeat shape>`

### Sub-system 7 — `<Name>` (optional — halt at 8+)

`<repeat shape>`

---

## Synthesis edge across sub-systems

| Sub-system | Synthesis edge load-bearing? |
|---|---|
| `<Sub-system 1>` | `<yes | supporting | no>` |
| `<Sub-system 2>` | `<...>` |
| `<Sub-system 3>` | `<...>` |
| `<Sub-system 4>` | `<...>` |
| `<Sub-system 5>` | `<...>` |

**Synthesis-edge presence check:** `<n>` sub-systems carry the synthesis edge load-bearingly. Must be ≥3. If <3, halt and re-decompose.

---

## Cross-domain synthesis statement

<One paragraph. Name explicitly how the synthesis edge shows up differently across sub-systems — what it sees, what it refuses, what it produces. This paragraph is the vertical's unique contribution to the ecosystem. Commodity content would not produce this paragraph; only the sovereign's lived synthesis does.>

---

## Composition rules across sub-systems

Name the horizontal composition rules — which sub-system gates another, which imports from another, which runs in parallel. Reference shape: `verticals/people-intelligence/SUB-SYSTEMS.md` composition-rules section.

1. **`<Sub-system X>` must define before `<Sub-system Y>` runs.** `<reason>`
2. **`<Sub-system X>` runs upstream of `<Sub-system Y>`.** `<reason>`
3. **`<Sub-system X>` runs in parallel with `<Sub-system Y>`.** `<reason>`
4. `<...>`

Aim for 3-5 composition rules. More = over-coupled. Fewer = sub-systems aren't actually composing, they're sitting in a list.

---

## Stack totals

- Sub-systems: `<n>`
- Total commands: `<n>` (target: 20-35)
- Total agents: `<n>` (= sub-system count)
- Total skills: `<n>` (= sub-system count, typically 1:1)

---

## Daily-5 starter set (for fresh forkers)

Name 5 commands across the stack that a fresh forker uses first — spread across sub-systems to minimize onboarding paralysis. Rest of the stack remains "available when needed."

1. `/<sub-1-slug>-<verb>` — `<one-line>`
2. `/<sub-2-slug>-<verb>` — `<one-line>`
3. `/<sub-3-slug>-<verb>` — `<one-line>`
4. `/<sub-4-slug>-<verb>` — `<one-line>`
5. `/<sub-5-slug>-<verb>` — `<one-line>`

Reference shape: `verticals/people-intelligence/SUB-SYSTEMS.md` "Daily-5 across the stack" section (when added).

---

## Iteration notes

This proposal is iterable. Reply with:
- "rename `<X>` to `<Y>`"
- "merge `<X>` and `<Y>`"
- "split `<X>` into `<Y>` and `<Z>`"
- "add command `<name>` to `<sub-system>`"
- "remove `<sub-system>`"
- "approve" — proceed to scaffold

Iterate up to 3 times before requiring a full re-run.

---

## Version history

- `v1` · `<ISO date>` · Initial proposal generated.
- `<v2 entry after first iteration>`
- `<v3 entry>`

---

**Built on SIP** — domain-stack-starter PROPOSAL.md template · v7.4.1 · SIP v1.1.0
