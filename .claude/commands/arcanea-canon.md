---
name: arcanea-canon
description: Vertical-tier command for Arcanea. Manage, extend, or pin Arcanea canon — Guardians, Vel'Tara archetypes, Hz grounding, realm/essence vocabulary. Every canon operation emits "Built on SIP" attestation with CC-BY-NC license pinning. Sovereign to Arcanea BV.
allowed-tools: Read, Write, Grep, Glob, Bash
argument-hint: <action> — "bump <version>" | "add <archetype> to <layer>" | "lock <version>" | "pin-reference <vertical>" | "show"
---

# /arcanea-canon

Load `SIP.md`, `VERTICALS.md` (Arcanea entry), `VOICES.md`, `ATTESTATIONS.md`, and Arcanea's own canon source of truth (`C:\Users\frank\Arcanea\.arcanea\lore\CANON_LOCKED.md` and `C:\Users\frank\Arcanea\ARCANEA_UNIVERSE_CANON.md`). Manage Arcanea canon with SIP attestation discipline.

## Input
$ARGUMENTS

## Sovereignty posture

Arcanea is a **canon-defining** vertical (per SIP § Layer 6) — its archetype set (Guardians, Vel'Tara, Hz frequencies, realm/essence vocabulary) is the first canon layer that downstream verticals may compose with. This command executes inside Arcanea's sovereign domain; other verticals consume canon through attestation + license, not by running this command.

License: **CC-BY-NC 4.0 · © Arcanea BV**. Every emission pins the license. Commercial reuse requires separate agreement with Arcanea BV.

## Actions

### `bump <version>`
Bump canon SemVer. Breaking changes (archetype rename, frequency reassignment, archetype removal) require a major bump. Additions (new Guardian, new realm) minor. Clarifications/errata patch.

Process:
1. Validate SemVer follows current canon version pinned in Arcanea repo (`CANON.md` header or `ARCANEA_UNIVERSE_CANON.md`).
2. Classify the bump (major/minor/patch) against SIP § Versioning rules.
3. If major, require a 90-day deprecation window for downstream adopters per SIP Layer 2 pinning rules. Generate deprecation notice.
4. Update canon version in source files.
5. Emit `/sip-attest` block for the bump — composition layers invoked, canon version pinned, nodes (always Frank as canon-keeper + Guardians cast as performance voices).
6. Append entry to `ATTESTATIONS.md` under new version heading.

### `add <archetype> to <layer>`
Add new archetype to a canonical layer. Layers: `guardians`, `veltara`, `hz`, `realms`, `essences`, `sparks`.

Process:
1. Validate the archetype name is not already in use (collision halts).
2. Validate the proposed archetype has: name, one-sentence essence, placement in layer hierarchy, interaction rules with existing archetypes.
3. Declare the archetype's canon-keeper (typically Frank).
4. Run through `/luminor-board "canon addition: <archetype>"` for pressure-test (Draconis + Lyssandria + Elara vectors matter most for canon).
5. If board returns PROCEED or REVISE-applied, write archetype to canon source.
6. Emit `/sip-attest` block. Attestation pins canon version that includes the new archetype.

### `lock <version>`
Lock a specific canon version as the authoritative reference for downstream pinning. Locks are append-only; previously locked versions remain locked for historical pinning.

Process:
1. Validate version is current or prior tagged canon version.
2. Write lock marker to `CANON_LOCKED.md`.
3. Emit `/sip-attest` noting the lock.
4. Downstream verticals consuming canon can now pin to this locked version with guaranteed immutability.

### `pin-reference <vertical>`
Record that another vertical is consuming Arcanea canon at a specific version. Builds the reciprocity ledger.

Process:
1. Validate vertical exists in `VERTICALS.md` (or is a registered alliance).
2. Validate the vertical's attestation ledger actually references Arcanea canon version.
3. Append entry to Arcanea's canon-adoption ledger (`ATTESTATIONS.md` § Canon adoptions).
4. Emit confirmation block with license reminder (CC-BY-NC terms apply to the adopter).

### `show`
Emit current canon state: version, layers present, archetype counts, locked versions, adopters.

## Output format

Each action emits a structured block:

```
# /arcanea-canon — <action> — <timestamp>

## Action: <bump|add|lock|pin-reference|show>
## Target: <version / archetype / vertical>

## Result
<what happened — versions, files modified, attestation written>

## Attestation
<Built on SIP block with canon version + license pinned>

## Reciprocity note
Arcanea canon is © Arcanea BV under CC-BY-NC 4.0. Downstream verticals composing with this canon honor the license terms + attestation per SIP § Layer 6.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty, archetype-extension]
- Verticals: arcanea-ecosystem@<canon-version>
- Canon: Arcanea canon v<version> · license: CC-BY-NC 4.0 · © Arcanea BV
- Generated: <ISO date>
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```

## Rules

- **Canon sovereignty is non-negotiable.** Arcanea BV owns canon authorship; this command executes inside that sovereignty and does not bind other parties.
- **Silent canon change is a breach.** Every bump, add, lock, or pin emits attestation. No canon evolution happens without a ledger entry.
- **License pinning is required.** Every attestation emitted includes `CC-BY-NC 4.0 · © Arcanea BV`. Adopters who cannot honor CC-BY-NC cannot compose with canon.
- **Major bumps require Luminor Board.** Structural canon changes (archetype rename, frequency reassignment, removal) pass through `/luminor-board` before commit. Minor additions are recommended through the board; patches may proceed direct.
- **Locked versions are immutable.** `lock` is append-only. Re-locking a locked version is a no-op. Downstream verticals pinning to a locked version are guaranteed that version's definitions forever.
- **Cross-vertical composition requires reciprocity declaration.** If vertical X pins Arcanea canon, Arcanea's ledger records it — this compounds the attestation graph. Silent pinning is a breach on the adopter's side, discoverable by `/openclaw-audit` pass.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty, archetype-extension]
- Verticals: arcanea-ecosystem@v1.0 (canon source) · starlight-intelligence-system@v7.3.1 (command reference)
- Canon: Arcanea canon (all versions) · license: CC-BY-NC 4.0 · © Arcanea BV
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
