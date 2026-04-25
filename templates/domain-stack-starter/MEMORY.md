# MEMORY — <DOMAIN> Instance State

> Durable state for this Domain Sub-Stack. Updated at every cycle close, after any structural change, and after each sub-system fill cycle.
>
> Public template. Real instance state (client names, in-flight commitments with private parties, candidate / patient / participant data) stays in `private/` — do not commit to public repos.

---

## Identity

- **Name:** `<vertical-name>`
- **Type:** `domain-sub-stack`
- **Sovereign owner:** `<person-name>`
- **Founded:** `<YYYY-MM-DD>`
- **SIP version pinned:** `v1.1.0`
- **Canonical public URL:** `<your URL or "private">`
- **Source of truth:** `<your repo path>`
- **Substrate reference:** `starlightintelligence.org/protocol`

---

## Domain declaration

- **Declared domain:** `<one-line — e.g., "HR Intelligence: structured hiring → performance → training → culture → talent → org">`
- **Cross-domain synthesis edge (load-bearing):** `<one-line from SOUL.md>`
- **ICP (who this serves):** `<the specific practitioner this is for>`
- **Open boundary:** `<what's MIT / public>`
- **Closed boundary:** `<what's proprietary / private to your practice>`

---

## Sub-system roadmap

The canonical composition. See `SUB-SYSTEMS.md` for the full map if present; this table is the instance-state view.

| # | Sub-system | Slug | Agent | Skill | Commands | Fill status |
|---|---|---|---|---|---|---|
| 1 | `<Sub-system 1>` | `<slug>` | `<slug>/agent.md` | `<slug>/skill.md` | `<n>` | `<scaffolded | drafted | calibrated | shipped>` |
| 2 | `<Sub-system 2>` | `<slug>` | `<slug>/agent.md` | `<slug>/skill.md` | `<n>` | `<status>` |
| 3 | `<Sub-system 3>` | `<slug>` | `<slug>/agent.md` | `<slug>/skill.md` | `<n>` | `<status>` |
| 4 | `<Sub-system 4>` | `<slug>` | `<slug>/agent.md` | `<slug>/skill.md` | `<n>` | `<status>` |
| 5 | `<Sub-system 5>` | `<slug>` | `<slug>/agent.md` | `<slug>/skill.md` | `<n>` | `<status>` |
| 6 | `<Sub-system 6 — optional>` | `<slug>` | `<slug>/agent.md` | `<slug>/skill.md` | `<n>` | `<status>` |
| 7 | `<Sub-system 7 — optional>` | `<slug>` | `<slug>/agent.md` | `<slug>/skill.md` | `<n>` | `<status>` |

**Totals:** `<n>` sub-systems · `<n>` agents · `<n>` skills · `<n>` commands

---

## Fill order (highest leverage first)

The sub-system whose KEEP-bucket overlap is densest AND whose synthesis edge is most load-bearing. Fill one sub-system fully (agent + skill + knowledge + 4-5 commands) before starting the next. Compounding happens at the sub-system level, not at the breadth level.

1. **First to fill:** `<sub-system-name>` — `<reason: highest KEEP-density × synthesis-edge load>`
2. **Second:** `<sub-system-name>` — `<reason>`
3. **Third:** `<sub-system-name>` — `<reason>`
4. `<...>`

---

## Active commitments

| Commitment | Artifact | Sub-system | Date | Owner |
|---|---|---|---|---|
| `<commitment>` | `<artifact path>` | `<sub-system>` | `<YYYY-MM-DD>` | `<owner>` |
| `<...>` | | | | |

---

## Open forks

| Fork | Options | Owner (decision rights) | Decide by |
|---|---|---|---|
| `<fork description>` | `<option A / option B>` | `<owner>` | `<YYYY-MM-DD>` |
| `<...>` | | | |

---

## Canon dependencies

- **Canon adopted:** `<e.g., "none", "Arcanea canon (CC-BY-NC)", custom>`
- **License terms accepted:** `<yes / n/a>`
- **Canon composition mode:** `<decline | adopt-whole | extend>`

Default for Domain Sub-Stacks: **decline**. Most domain sub-stacks are research-grounded instruments, not narrative-canon extensions. Adopt only where narrative composition is load-bearing to the domain.

---

## External authorities

- **Intent authority:** `<Notion / DB ID / pinned doc>` — why this vertical exists
- **Source of truth:** `<GitHub repo>` — what holds now
- **Runtime state:** `<Supabase / custom / none>` — what's happening now

---

## Non-negotiables (inherited from substrate)

- "Built on SIP" attribution on every cross-party artifact.
- Sovereignty clause (SIP § 5) non-waivable.
- Canon license (if adopted) enforceable.
- Silent composition is a breach.

---

## Vertical-specific non-negotiables

<List additional invariants this vertical commits to. Examples:>

- `<e.g., "Every hiring artifact carries the legal-sensitivity disclaimer">`
- `<e.g., "Every clinical-adjacent artifact names the referral pathway when active clinical signal detected">`
- `<e.g., "Research citation required where claims are made — direction, not invented numbers">`

---

## Changelog

- `v0.1` · `<YYYY-MM-DD>` · Spawned from `/spawn-domain-stack` under SIP v1.1.0. Proposal approved, scaffold generated, `<n>` sub-systems declared.

---

**Built on SIP** — domain-stack-starter MEMORY.md template · v7.4.1 · SIP v1.1.0
