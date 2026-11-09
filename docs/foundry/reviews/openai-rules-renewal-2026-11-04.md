# OpenAI plugin rules renewal review — 2026-11-04

Status: **proposal; staged for cross-harness review on branch `agent/antigravity/foundry-openai-rules-renewal-504`**

Delivery issue: [Starlight Intelligence System #504](https://github.com/frankxai/Starlight-Intelligence-System/issues/504)  
Prior review: `docs/foundry/reviews/openai-rules-renewal-2026-10-04.md`  
Reviewed base: `7e4ca5b29` (`origin/main`)  
Retrieval date: 2026-11-04 UTC

## Decision

Renew the docs-derived OpenAI plugin preflight ruleset (`plugin-rules.v2026-11-04.json`) after live retrieval of all four official OpenAI plugin documentation authorities on 2026-11-04 UTC, remove superseded `plugin-rules.v2026-10-04.json`, bind the new artifact and validator default path in `foundry/validators/toolchain.lock.v1.json`, and update deterministic freshness/tamper regression tests.

In addition, close the non-blocking Board follow-ups from `2026-10-04`:
1. Classify the `agents/openai.yaml` `short_description` (`25–64` chars) and MCP tool dependency `value`/`description` (`128`/`256` chars) bounds explicitly under `localConservativeChecks.skillMetadataBounds`.
2. Update `localConservativeChecks.skillsOnlyScreenshots` to cite the live submission error `screenshot_configuration_excluded` blocking `interface.screenshots` on skills-only ZIP uploads.
3. Record live HTTP 200 UTF-8 body SHA-256 digests for all four official documentation URLs.
4. Preserve top-level `toolchain.lock.v1.json` `reviewedAt` (`2026-10-04`) so non-OpenAI validator pins are not falsely marked re-reviewed.

## Source retrieval and archival digests (2026-11-04 UTC)

| Official source URL | HTTP status | UTF-8 bytes | SHA-256 digest (retrieved 2026-11-04 UTC) |
| --- | ---: | ---: | --- |
| `https://developers.openai.com/plugins/build/plugins` | 200 | 532,873 | `d5cb5bc370d7cc24d69def0d5c0fee6f280027bf5df8d85f5433b7958da0314f` |
| `https://developers.openai.com/plugins/plugin-guidelines` | 200 | 457,705 | `8d9ea7dbc7d4b73718c1109bce4ff7cb398e495a108df97feb977b32de98f713` |
| `https://developers.openai.com/plugins/deploy/submission` | 200 | 516,358 | `704cc233e00f4be4e97b5227b29e2869132812ebc9f2b9b5354d7ef2d42a8d42` |
| `https://developers.openai.com/plugins/deploy/submission-errors` | 200 | 445,232 | `326bd2eda3469c00d8658fadef2ec7f35f0cc8440d589e83c9571695787603a6` |

This review establishes only a local, docs-derived preflight ruleset. It does not establish OpenAI portal upload acceptance, automated skill safety/security scan approval, connected ChatGPT or Codex runtime behavior, directory review, or publication.

## Verified rule parity (2026-11-04 vs. 2026-10-04)

- **Manifest & package shape (`build/plugins`):** Root `plugin.json` with `extensions.com.openai` remains primary; `.codex-plugin/plugin.json` remains documented as a supported compatibility fallback (and `@plugin-creator` output). Foundry's compiler emits both.
- **Listing bounds (`deploy/submission` & `deploy/submission-errors`):** `displayName` max `30`, `shortDescription` max `30`, `longDescription` max `4000`, `developerName` max `80`, `capabilities` max `20` items / `120` chars, `defaultPrompt` max `3` items / `128` chars, listing HTTPS URLs max `1,024` (`2,048` package validation), minimum `2:1` contrast, `5 MiB` / `4096 px` square >= `48x48` branding assets, and the 13-value `interface.category` enumeration all remain unchanged.
- **Skills-only screenshot rule (`deploy/submission-errors`):** Confirmed upstream error `screenshot_configuration_excluded` (*"Skills-only ZIP uploads must not include `interface.screenshots`; screenshots require With MCP"*).
- **Skill payload (`deploy/submission-errors`):** Confirmed `skill_description_too_long` (`1,024` chars) and `64`-char combined identity bound; tighter `agents/openai.yaml` bounds (`25–64`, `128`, `256`) are explicitly documented under `localConservativeChecks.skillMetadataBounds`.

## Candidate artifacts and digest closure

- Rules artifact: `foundry/validators/openai/plugin-rules.v2026-11-04.json`
  - Rule id: `openai-plugin-directory-preflight-2026-11-04`
  - `reviewedAt`: `2026-11-04`
  - `reviewBy`: `2026-12-04` (30-day review interval)
  - SHA-256: `0681a564ea81e50db16a61b93726a27e91a6f0cbb97f4acbafe1e1058c718273`
- Validator default path update: `tools/foundry/lib/openai-preflight.mjs`
  - SHA-256: `c9e58ef02619860d349699af811d816b5d735b2ce96b2e57ac4dc6169af882a9`
- Lock refresh: `foundry/validators/toolchain.lock.v1.json`
  - SHA-256: `f0cc4fab6d454c137d83ce5ad910a3a51a6639557c19ca7e15206db5dba291bc`
- Superseded artifact removed: `foundry/validators/openai/plugin-rules.v2026-10-04.json`

## Verification

1. Baseline failure reproduced on `origin/main` (`7e4ca5b29`) at `2026-11-04 UTC`:
   - `test/v92-foundry.test.ts`: 2 failures, both `RULES_FRESHNESS`.
2. Renewed candidate verification:
   - `node --import tsx --test test/openai-rules-freshness.test.ts test/foundry-conformance.test.ts test/v92-foundry.test.ts`: 59 tests (`57 pass`, `0 fail`, `2 skipped` Windows `EPERM` symlink fixtures).
