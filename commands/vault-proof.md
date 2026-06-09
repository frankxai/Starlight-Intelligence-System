# /vault proof Command

> *"If sharing, what's the cleanest one-line testimony?"*

**Primary Agent:** Starlight Sage (writes), Sentinel (privacy gate)
**MCP tool:** `sis.vault.record`
**Schema:** `VaultLoopEntry` in `src/types.ts`; JSON schema at `packages/core/schemas/vault-loop-entry.schema.json`
**Stage:** `proof` (terminal — closes a Vault Loop)

---

## Purpose

Record the terminal `proof` stage of a Vault Loop. Proof is the *optional* public testimony of a fulfilled desire — the cleanest one-line statement of what landed. Recording proof closes the loop and marks it ineligible for the stale-loop nudge in the dashboard.

Per the Vault Doctrine: *"Proof can be published only after review."* The privacy gate on `/vault proof` is the most defended of any stage. By design:

- `private` proof is permitted (a closed-loop record kept for the sovereign's own evidence-base).
- `private-shareable` proof may be shared via scoped export to explicitly named recipients.
- `public` proof MUST be reviewed before recording — `/starlight-board` or `/council review` precedes the write.

The structural privacy contract from `src/vault-loop.ts` is enforced: a `private` proof never appears in any export, search, attestation, or knowledge-graph output.

---

## Invocation

### Interactive

```
/vault proof <parent-loop-root-id>
```

Drops the sovereign into the `proof` stage of `/vaults/loop` in the dashboard, pre-filled with the loop context (root desire, outcome). The sovereign writes the proof line; the system records it via `sis.vault.record` with `stage: 'proof'`, `parent_entry_id: <outcome entry id>`, and the privacy level the sovereign selects (default `private`).

### Quick form

```
/vault proof <parent-entry-id> "<one-line testimony>" [--privacy private|private-shareable|public]
```

**Arguments:**
- `<parent-entry-id>` — id of the upstream `outcome` entry this proof closes. Required.
- `"<one-line testimony>"` — the proof, ≤1 sentence. Required.
- `--privacy` — privacy classification. Default `private`. `public` requires prior `/council review` or `/starlight-board` clearance.

**Example:**
```
/vault proof entry_outcome_18 "v0.1 shipped 2026-05-15 with zero leaked private entries across the three-partner cohort."
/vault proof entry_outcome_22 "90-day morning ritual completed; baseline established for next cycle." --privacy private
```

---

## Privacy gate

For `--privacy public`, the command checks for a prior board verdict that scoped the publish:

```
/vault proof <id> "<text>" --privacy public
  → SENTINEL: search audit ledger for /council review or /starlight-board verdict
    referencing this loop root id within 7 days
  → If found and verdict ∈ {PROCEED, PROCEED-WITH-REVISE-CLOSED}: write
  → If not found: REFUSE write; prompt sovereign to run /council review first
```

This is the substrate's defense of the *"proof can be published only after review"* invariant. The gate is operational, not assertional — the test `test/v01-vault-loop-privacy.test.ts` covers the underlying filter contract; the review-before-public gate is enforced by Sentinel at command time.

---

## Output

```
VaultLoopEntry {
  id:               "<generated>"
  vault:            <inherited from parent outcome, or selected; horizon if --privacy public>
  stage:            "proof"
  privacy:          <selected>
  parent_entry_id:  <id of upstream outcome>
  payload:          "<text>"
  created_at:       <ISO 8601 timestamp>
  created_by:       <agent or sovereign id>
  stale_at:         <created_at + 30d>   (irrelevant — proof closes the loop)
}
```

After write, the loop containing this root is **closed** — the stale-loop dashboard banner no longer surfaces it (per `assessLoopStaleness` in `src/vault-loop.ts`, the closing stages are `outcome` and `proof`).

---

## Processing

```
/vault proof <parent-id> [args]
  → Parse arguments (or open interactive form pre-filled with loop context)
  → Validate parent-id exists, points to an entry with stage in {outcome, evidence}
  → If --privacy public: Sentinel checks for board-review verdict in audit ledger
  → Sage writes via sis.vault.record MCP tool with stage='proof'
  → Loop marked closed; stale-loop watch released
  → Operational-vault audit row written
  → If --privacy public: optionally trigger Horizon Vault PR draft (sovereign confirms)
```

---

**Built on SIP** · /vault proof command · v0.1 Vault Loop · MIT
