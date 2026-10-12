# Reality Architect — substrate pointer

> **Pointer only.** Reality Architect is a standalone public vertical built on SIP. Its open format, Studio and
> engine live in their own repository and are **not** copied into this substrate. This file makes the vertical
> discoverable from within SIS and records how it projects into the Reality Architecture kernel.

- **Repo:** https://github.com/frankxai/realityarchitect (public, MIT) · **Site:** https://www.realityarchitect.ai
- **Registry entry:** see [`VERTICALS.md`](../../VERTICALS.md) → _Reality Architect_
- **Class:** sovereign vertical (operated, public)
- **Canon:** declines. Teacher names live only in its Library data; Arcanea proper nouns stay out (register boundary).
- **Composes with, never requires:** SIS

## What it is

The open practice for architecting a life: `reality.md` and `soul.md`, a local-first Studio, an honest Library, and
a read-only engine. Two registers, meaning and mechanism, always labeled; no causal claims about thought or
"frequency"; misses counted with hits.

## How it projects into the kernel

The engine (`plugins/reality-architect/engine/` in the vertical's repo) reads a person's files and emits a typed graph:

- **IDs:** `ra:<type>:<key>`, this kernel's `idPattern`.
- **Types and relations:** registry object types (v0.1.2 adds `life_domain`, `practice`, `witness_entry`) and
  registry relations only (`owns`, `targets`, `enables`, `depends_on`, `part_of`, `derives_from`,
  `supports_claim`).
- **Labels:** every node carries an epistemic register: desired, reported, planned, done, meaning, computed. Desired
  scenes are never stored as observed fact (ADR-000).
- **Mapping:** Bridge → FutureBranch + ActualizationPlan · Atlas gap → RealityDiff · Witness entry → self-reported
  ActualizationReceipt · approved snapshot → `world_state`.

The kernel stays here as doctrine; the format and the engine stay in the vertical. A person's graph can be projected
into SIS on their consent, without either side owning the other.
