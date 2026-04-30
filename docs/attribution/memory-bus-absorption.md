# Memory Bus Absorption — Attribution Reconstruction

**Absorbed:** 2026-04-29 from `C:\Users\frank\Arcanea-run-graph\packages\` (non-git snapshot)
**Targets:** `@starlight/cognitive-substrate`, `@starlight/memory-palace`
**SIS license:** MIT (per `package.json` — LICENSE file MUST be added during absorption)
**Provenance verdict:** PROVENANCE-PARTIAL

## Critical findings (must read before per-file table)

1. **`Arcanea-run-graph` is NOT a git tree.** `git status` returns *"fatal: not a git repository"*. No commit history, no author log, no diff lineage. Authorship reconstructed from in-file comments + `package.json` author fields, not a verifiable git trail. **This is the substrate-blocking finding the Luminor Board flagged.**

2. **No LICENSE file exists** in:
   - `Arcanea-run-graph/` repo root (only `README.md`, `package.json`)
   - `Arcanea-run-graph/packages/memory-system/`
   - `Arcanea-run-graph/packages/guardian-memory/`

3. **License-field conflict:** Repo root `package.json` says `"license": "SEE LICENSE IN LICENSE"` (file does not exist) and `README.md` declares **"License: Proprietary. Source is viewable for transparency; viewing does not grant usage rights."** Per-package `package.json` for memory-system and guardian-memory both declare `"license": "MIT"` with `"publishConfig": {"access": "public"}`. The two contradict. Without a LICENSE file or written authorial intent, MIT in `package.json` is asserted but not legally instantiated.

4. **All 15 files share `Apr 3 18:44` mtime** — bulk copy/checkout artifact, authentic write time gone.

5. **SIS itself has no top-level LICENSE** despite `package.json` declaring MIT. Same defect mirrored — fix during absorption.

## Per-file provenance

| # | Source path | License (asserted) | Author | Origin | MIT-compat |
|---|---|---|---|---|---|
| 1 | `memory-system/src/index.ts` | MIT (pkg.json) | FrankX | original | YES |
| 2 | `memory-system/src/types.ts` | MIT | FrankX | original | YES |
| 3 | `memory-system/src/starlight-vaults.ts` | MIT | FrankX (Frank-voice motto) | original | YES |
| 4 | `memory-system/src/vault-manager.ts` | MIT | FrankX (Guardian: Leyla stamp) | original | YES |
| 5 | `memory-system/src/horizon-ledger.ts` | MIT | FrankX (Guardian: Draconia stamp) | original | YES |
| 6 | `memory-system/src/mem0-adapter.ts` | MIT | FrankX | API-surface adapter (no copied code; mirrors mem0.ai public method shape) | YES — verify Mem0 trademark/API-surface use is fair |
| 7 | `memory-system/src/vault-classifier.ts` | MIT | FrankX | original | YES |
| 8 | `memory-system/src/memory-bridge.ts` | MIT | FrankX | original | YES |
| 9 | `memory-system/src/storage/file-backend.ts` | MIT | FrankX | original (uses ArcaneMD format) | YES |
| 10 | `memory-system/src/arcaneMD.ts` | MIT | FrankX | original; references `/docs/arcaneMD-spec.md` (not in repo, may need carry-over) | YES |
| 11 | `memory-system/src/integration.test.ts` | MIT | FrankX | original | YES |
| 12 | `guardian-memory/src/hnsw-index.ts` | MIT (assumed) | FrankX (port) + **ruvnet/claude-flow contributors (upstream)** | **EXPLICIT: "Ported from claude-flow v3"** | **CONDITIONAL** — upstream copyright restoration REQUIRED |
| 13 | `guardian-memory/src/guardian-memory.ts` | MIT | FrankX | original wrapper around ported HNSW | YES |
| 14 | `memory-system/package.json` | MIT | `"author": "FrankX <frank@frankx.ai>"` | n/a | YES |
| 15 | `guardian-memory/package.json` | MIT | no author field (DEFECT — must add) | n/a | YES |

## The claude-flow port — license-compliance gate (substrate-blocking sub-item)

`hnsw-index.ts` (28,865 bytes — by far the largest absorbed file) explicitly says **"Ported from claude-flow v3"**. claude-flow is the ruvnet project at `github.com/ruvnet/claude-flow`. Its license history at v3 must be verified at port time.

- **Common case:** claude-flow is MIT → port is MIT-compatible *if* original copyright notice preserved per MIT clause 1.
- **Current state:** copyright notice is **NOT preserved** — there is no `Copyright (c) ... ruvnet/claude-flow contributors ...` header on the file.
- **Required before absorption:**
  1. Verify claude-flow v3 was MIT (or Apache-2.0, or compatible) at port time.
  2. Add upstream copyright header to absorbed `hnsw-index.ts`.
  3. Add `NOTICE` file in absorbed package crediting the upstream.

## Required actions before any code moves into SIS

| # | Action | Owner | Status (2026-04-29) |
|---|---|---|---|
| 1 | Add `LICENSE` file to SIS root (MIT, year 2026, author FrankX) | Frank | **DRAFT READY** at `docs/drafts/LICENSE-draft.md`; awaits Frank's ack to place at root |
| 2 | Add `LICENSE` file to `Arcanea-run-graph/` root (resolve proprietary-vs-MIT contradiction) | Frank — Arcanea side | **DRAFT READY** in same file; Arcanea-side decision |
| 3 | Verify claude-flow v3 license at GitHub upstream (`github.com/ruvnet/claude-flow`) | Cockpit thread | ✅ **VERIFIED 2026-04-29 via `gh repo view ruvnet/claude-flow --json licenseInfo` → MIT confirmed.** Default branch: `main`. License key: `mit`. |
| 4 | Restore upstream copyright header on `hnsw-index.ts` | Absorption process | **DRAFT READY** at `docs/drafts/hnsw-upstream-copyright-header.md`; apply during cognitive-substrate Phase 2 Step 2.5 |
| 5 | Add `NOTICE` file to `@starlight/cognitive-substrate` (or wherever HNSW lands) | Absorption process | **DRAFT READY** in same file; apply during Phase 2 |
| 6 | Add `"author"` field to absorbed `guardian-memory/package.json` | Frank | Pending — defect in Arcanea source side |
| 7 | Add this attribution doc as `docs/attribution/memory-bus-absorption.md` | DONE (this file) | ✅ |

## Bug verification (Gate 2 paired finding)

The metadata-persistence bug claims in this audit have been **verified on disk 2026-04-29** by direct read of `C:\Users\frank\Arcanea-run-graph\packages\memory-system\src\storage\file-backend.ts`:

- **Lines 50-55** — `serializeFrontmatter()` is flat-only: `if (Array.isArray(v)) return ${k}: [${v.join(', ')}]; return ${k}: ${String(v)};`. No nested object support. CONFIRMED.
- **Lines 59-67** — `entryToMd()` spreads `id, vault, guardian, gate, frequency, tags, confidence, source, created, updated, expires`. **`metadata` field is NOT in the list.** CONFIRMED BUG.
- **Lines 69-87** — `mdToEntry()` reads `id, vault, confidence, tags, guardian, gate, source, expires`. **Never reads `metadata`.** CONFIRMED BUG.

This matches the agent-audit findings byte-for-byte. The 12-line patch outlined in `tests/__sandbox__/file-backend-metadata-persistence.test.ts` will fix both omissions via JSON-stringify escape hatch.

## Gate 1 status update — moving from PROVENANCE-PARTIAL toward PROVENANCE-CLEAR

| Sub-finding | Status |
|---|---|
| `Arcanea-run-graph` is not a git tree | Confirmed; absorption strategy uses snapshot-attest pattern |
| No LICENSE files at source | DRAFTS READY for both SIS and Arcanea-run-graph |
| License-field contradiction in source | Awaits Frank's Arcanea-side decision |
| All files share Apr 3 mtime (bulk copy artifact) | Documented; provenance reconstructed from in-file evidence |
| Per-package MIT declarations vs repo-root proprietary | Awaits Frank decision; recommendation: Arcanea-side LICENSE = MIT |
| `hnsw-index.ts` upstream copyright missing | DRAFT READY for application during Phase 2 |
| Claude-flow v3 license unverified | ✅ **VERIFIED MIT** |
| SIS itself has no LICENSE despite MIT claim | DRAFT READY |

**Verdict update: PROVENANCE-PARTIAL → PROVENANCE-PARTIAL-CLEARING.** Once Frank acks (1) the LICENSE drafts and (2) the upstream header application during absorption, Gate 1 fully GREEN.

## Required file headers (apply to every absorbed file)

```typescript
/**
 * <filename>
 * Copyright (c) 2026 FrankX <frank@frankx.ai>
 * SPDX-License-Identifier: MIT
 * Built on SIP — absorbed-from-snapshot 2026-04-29
 * Source: Arcanea-run-graph/packages/<orig-path> (non-git snapshot)
 * Provenance: docs/attribution/memory-bus-absorption.md
 */
```

## Special additional header for `hnsw-index.ts`

```typescript
/**
 * Originally derived from claude-flow v3 (github.com/ruvnet/claude-flow)
 * Copyright (c) ruvnet/claude-flow contributors — see upstream LICENSE
 * Adapted for Guardian-namespaced memory by FrankX, 2026
 *
 * UPSTREAM LICENSE: <verified-on-2026-MM-DD-as-MIT-or-similar>
 */
```

## Aggregate attestation

```
Built on SIP — absorbed-from-snapshot 2026-04-29
Provenance: reconstructed from source-comment + per-package package.json
            (no git trail; no upstream LICENSE files in source repo)
Audit: docs/attribution/memory-bus-absorption.md
Verdict: PROVENANCE-PARTIAL
Required-actions-before-absorption: 6 items, see action table above
```

## Verdict

**PROVENANCE-PARTIAL** — 12 of 15 files trace cleanly to FrankX as original author with MIT `package.json` declaration; the largest single file (`hnsw-index.ts`) is an explicit claude-flow v3 port with the upstream copyright notice missing AND the source repo is not a git tree, so absorption requires:

(a) verifying claude-flow v3 license at port time
(b) restoring upstream copyright header
(c) adding LICENSE files to both source packages and SIS root
(d) action items in table above

before any code copy.

## Status of Luminor Board Gate 1

**Gate 1 (Provenance Reconstruction): NOT YET PASSED.**

Pass criteria:
- All actions in the table above completed
- Frank's explicit ack on the attribution doc
- claude-flow v3 license verified

Until then, no source from `Arcanea-run-graph/packages/` enters `@starlight/cognitive-substrate` or `@starlight/memory-palace`.

---

*Built on SIP. Substrate-tier provenance audit. Phase 0 Gate 1.*
