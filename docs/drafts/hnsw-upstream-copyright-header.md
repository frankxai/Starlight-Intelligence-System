# DRAFT — hnsw-index.ts upstream copyright header

**Status:** DRAFT for application during cognitive-substrate Phase 2 absorption.

**Purpose:** Resolves Gate 1 action item #4 (Luminor Board v7.7 REVISE). The absorbed `hnsw-index.ts` from `Arcanea-run-graph/packages/guardian-memory/src/hnsw-index.ts` explicitly says "Ported from claude-flow v3" but does NOT preserve the upstream copyright notice. MIT clause 1 requires "The above copyright notice ... shall be included in all copies or substantial portions of the Software."

**Verification on disk 2026-04-29:**
- claude-flow upstream license: **MIT** (verified via `gh repo view ruvnet/claude-flow --json licenseInfo`)
- Default branch: `main`
- Repo: `github.com/ruvnet/claude-flow`
- Port-into-SIS path target: `packages/cognitive-substrate/src/storage/HNSWBackend.ts`

---

## Header to apply at top of absorbed `hnsw-index.ts`

```typescript
/**
 * HNSWBackend — Hierarchical Navigable Small World vector index
 *
 * Originally derived from claude-flow v3 (https://github.com/ruvnet/claude-flow)
 * Copyright (c) ruvnet/claude-flow contributors
 * Original license: MIT (verified 2026-04-29 via gh repo view)
 *
 * Adapted for Guardian-namespaced memory by FrankX, 2026, in
 * @arcanea/guardian-memory (Arcanea-run-graph snapshot, not git-tracked).
 *
 * Subsequently absorbed into @starlight/cognitive-substrate by FrankX, 2026,
 * with tenant-id generalization replacing hardcoded Guardian names per
 * Luminor Board v7.7 REVISE.
 *
 * Copyright (c) 2026 FrankX <frank@frankx.ai>
 * SPDX-License-Identifier: MIT
 *
 * Built on SIP — absorbed-from-snapshot 2026-04-29
 * Provenance: docs/attribution/memory-bus-absorption.md
 * Upstream MIT verification: 2026-04-29
 */
```

## Companion `NOTICE` file for `@starlight/cognitive-substrate`

Save as `packages/cognitive-substrate/NOTICE` on absorption:

```
@starlight/cognitive-substrate
==============================

This package contains code derived from the following upstream sources:

1. ruvnet/claude-flow (https://github.com/ruvnet/claude-flow)
   License: MIT
   Verified: 2026-04-29
   Files derived: src/storage/HNSWBackend.ts (originally hnsw-index.ts in
   claude-flow v3, ported via @arcanea/guardian-memory snapshot 2026-04-29)

2. @arcanea/memory-system (Arcanea-run-graph snapshot, non-git-tracked)
   License: MIT (per package.json declaration; no LICENSE file in source)
   Author: FrankX <frank@frankx.ai>
   Absorbed: 2026-04-29

The above upstream copyright notices and permissions are hereby preserved
per MIT clause 1.

Built on SIP. See docs/attribution/memory-bus-absorption.md for full
provenance reconstruction.
```

## When to apply

During cognitive-substrate Phase 2 source absorption:
- Step 2.5 (absorb `hnsw-index.ts`) → apply the header above to the destination file
- Same step → create the `NOTICE` file in the absorbed package root

## Verification before commit

After header application:
- `grep -n "ruvnet/claude-flow" packages/cognitive-substrate/src/storage/HNSWBackend.ts` should return at least one match
- `cat packages/cognitive-substrate/NOTICE | head -5` should show the package name and notice
- `pnpm test` passes (header is comment-only, no functional change)

This closes Gate 1 action items #3 (license verification) and #4 (upstream copyright header).
