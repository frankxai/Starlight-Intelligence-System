# Foundry calendar regression report

- **Attribution:** GitHub Copilot hosted coding agent, at @frankxai’s request in PR #539 comment 6628123768
- **Repository / branch:** `frankxai/Starlight-Intelligence-System` / `agent/antigravity/living-brand-lab-v3`
- **Source SHA:** `c02ab41b752c765da677d78ed2262387665db45d`
- **Date:** 2026-11-04

## Finding and repair

The two reported compiler-success tests failed at the actual current date because the docs-derived OpenAI rules snapshot has `reviewBy: 2026-11-03`. `compilePackage` uses the real default date for its final preflight. The tests now use a test-scoped Node Date mock set to their historical fixture date (`2026-09-01`); the mock is automatically restored after each test.

A deterministic negative test starts on the rules’ `reviewBy`, advances one day, and verifies that the unchanged compiler still throws `RULES_FRESHNESS` and leaves no output package. Production code, rules, lockfiles, and freshness policy are unchanged. Real OpenAI plugin compilation remains fail-closed after the rules expire; refreshing docs-derived rules requires a separate review of current official documentation.

## Verification

| Check | Result |
| --- | --- |
| Before repair: targeted two-test command | 0 passed, 2 failed; both failed with `RULES_FRESHNESS` |
| After repair: targeted three-test command | 3 passed, 0 failed, 0 skipped |
| `npm run lint` | Passed |
| `npm run test:foundry` | 56 passed, 0 failed, 0 skipped |

The Node test runner emitted its experimental MockTimers API warning. Runtime: Node `v22.23.4` (supported by the package engine range), pnpm `11.5.0`, Linux `7.0.0-1017-azure x86_64`. One Copilot attachment-proxy flag was visible, but its endpoint and underlying provider were not exposed. Tests did not exercise an OpenAI, Codex, or Claude connected host, portal review, or publication.
