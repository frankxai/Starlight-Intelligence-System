# /vault desire Command

> *"Name what you actually want. Be specific."*

**Primary Agent:** Starlight Sage (writes), Voice Operator (drives)
**MCP tool:** `sis.vault.record`
**Schema:** `VaultLoopEntry` in `src/types.ts`; JSON schema at `packages/core/schemas/vault-loop-entry.schema.json`
**Stage:** `desire` (root of a new Vault Loop)

---

## Purpose

Record the root entry of a new Vault Loop. The `desire` stage names what the sovereign actually wants — specifically, in their own language, before any framing as a goal, project, or KPI. This is the structural beginning of the Desire → Gratitude → Visualization → Surrender → Intuition → Aligned Action → Evidence → Outcome → Proof sequence.

Per the Vault Doctrine in `docs/ops/prompts/starlight-v01-vision.md`: *"Private by default. Desires are not content before they are fulfilled."* The default privacy classification for a new desire is `private`.

---

## Invocation

### Interactive

```
/vault desire
```

Drops the sovereign into the `desire` stage of `/vaults/loop` in the dashboard with an empty form. The sovereign writes the desire; the system records it via `sis.vault.record` with `stage: 'desire'`, `parent_entry_id: null`, and the privacy level the sovereign selects (default `private`).

### Quick form

```
/vault desire "<text>" [--privacy private|private-shareable|public] [--vault strategic|technical|creative|operational|wisdom|horizon]
```

**Arguments:**
- `"<text>"` — the desire, in the sovereign's own words. Required.
- `--privacy` — privacy classification. Default `private`.
- `--vault` — which of the 6 existing vaults this loop lives under. Default `operational` (rolling 90d active state). Use `strategic` for decision-shaped desires, `horizon` for long-horizon aspirational entries.

**Example:**
```
/vault desire "Ship the v0.1 substrate to three sovereign partners by 2026-Q3 with no leaked private data."
/vault desire "Run a 30-minute morning ritual every weekday for 90 days." --vault operational --privacy private
```

---

## Privacy contract

The recorded entry obeys the substrate trust contract (`src/vault-loop.ts`):

- `private` — never appears in export, search, attestation, or knowledge-graph output. Local-only by structural guarantee.
- `private-shareable` — appears in scoped exports to named recipients only.
- `public` — may appear on any surface.

Per `test/v01-vault-loop-privacy.test.ts`, the contract is structural — not assertional. A leaked private desire fails the substrate trust contract.

---

## Output

```
VaultLoopEntry {
  id:               "<generated>"
  vault:            <selected>
  stage:            "desire"
  privacy:          <selected, default 'private'>
  parent_entry_id:  null
  payload:          "<text>"
  created_at:       <ISO 8601 timestamp>
  created_by:       <agent or sovereign id>
  stale_at:         <created_at + 30d>
}
```

The returned `id` is the **loop root id**. Downstream stage commands (`/vault gratitude`, `/vault visualization`, ..., `/vault proof`) reference this id via `parent_entry_id`.

---

## Processing

```
/vault desire [args]
  → Parse arguments (or open interactive form)
  → Validate payload non-empty
  → Sage writes via sis.vault.record MCP tool with stage='desire', parent_entry_id=null
  → Record stored under the selected vault under privacy classification
  → ID returned to the sovereign; loop root registered for future stage entries
  → Operational-vault audit row written
```

---

**Built on SIP** · /vault desire command · v0.1 Vault Loop · MIT
