# tests/__sandbox__/ — pre-absorption gating tests

Tests that **must fail** until a planned absorption / patch lands. They are not picked up by `npm test` (the runner enumerates files explicitly in `package.json`); they live here so the failing assertions become the gate, not the wishful thinking.

| File | Gates | Status |
|---|---|---|
| `file-backend-metadata-persistence.test.ts` | Memory Bus REVISE Item 2 (Luminor Board v77, 2026-04-29). `VaultEntry.metadata` round-trip in `@arcanea/memory-system` `file-backend.ts`. | **BLOCKING — must fail on current source.** Patch outline in test file header. Promote to `packages/cognitive-substrate/tests/` after absorption + patch. |

## How to run a sandbox test

```bash
node --test tests/__sandbox__/<test-file>.test.ts
```

This is the only way these tests run. `npm test` skips this directory by design.

## Promotion path

When a sandbox test starts passing on a deliberate code change (the absorption / patch the test gates on lands), move it out of `__sandbox__/` to its permanent home and add it to `package.json` `test` script.

Until then: **do not delete**, **do not silence**, **do not "fix" by changing the test**. The failing assertion is the contract.
