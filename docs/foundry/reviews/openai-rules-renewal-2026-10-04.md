# OpenAI plugin rules renewal review — 2026-10-04

Status: **proposal; not merged, approved, published, or deployed**

Delivery issue: [Starlight Intelligence System #268](https://github.com/frankxai/Starlight-Intelligence-System/issues/268)  
Architecture parent: [agentic-ops #10](https://github.com/frankxai/agentic-ops/issues/10)  
Reviewed base: `12d794a389959a2360bd4c920689510f0949f02b`  
Retrieval date: 2026-10-04 UTC

## Decision

Renew the docs-derived rule artifact after source review, bind the new artifact and validator path to refreshed lock digests, and add deterministic freshness/tamper regression coverage. Do not inject an old date into compilation and do not relax `rules-freshness` or `rules-lock`.

The production compiler calls `validateOpenAIPluginPackage()` without an evaluation-date override. That is correct: a production compile must use the current UTC date and fail after `reviewBy`. Passing a historical date from the compiler would make an expired review appear current and would weaken the production boundary. Explicit dates remain appropriate in tests because the validator already exposes them for deterministic evaluation.

## Source retrieval and authority

| Rules source on the 2026-09-01 artifact | 2026-10-04 result | Reviewed official source |
| --- | --- | --- |
| `https://developers.openai.com/plugins/build/plugins` | Available | Same URL |
| `https://developers.openai.com/plugins/app-guidelines` | Unavailable through the documentation reader | Replaced by `https://developers.openai.com/plugins/plugin-guidelines`, linked as “Plugin guidelines” in the current official plugin navigation |
| `https://developers.openai.com/plugins/deploy/submission` | Available | Same URL |
| `https://developers.openai.com/plugins/deploy/submission-errors` | Available | Same URL |

The environment's direct `curl` path was blocked by its outbound proxy (`CONNECT tunnel failed, response 403`). The official OpenAI documentation reader retrieved the four available or replacement pages on 2026-10-04. The candidate records canonical official URLs rather than a cache URL.

This review establishes only a local, docs-derived preflight candidate. It does not establish OpenAI upload acceptance, safety/security scan success, connected ChatGPT or Codex behavior, directory approval, publication, or endorsement.

## Rule-to-source mapping

### Package and manifest shape

Current package documentation says a portable package has root `plugin.json`, optional `skills/`, optional root `mcp.json`, and optional `.codex-plugin/plugin.json` as a compatibility fallback. OpenAI settings belong under `extensions.com.openai` in the portable manifest or at the root of the compatibility manifest.

The compiler already emits a portable root manifest plus the compatibility manifest. The validator's requirement for `.codex-plugin/plugin.json` is therefore a check of the compiler's declared OpenAI compatibility projection, not a claim that the overlay is the only current format. The skills-only exclusions for `.app.json`, `.mcp.json`, `apps`, and `mcpServers` remain locally conservative: this compiler lane declares no MCP component. They must not be generalized to MCP-backed plugins.

Source: `https://developers.openai.com/plugins/build/plugins`.

### Listing fields and limits

The submission guide and submission-error reference support these candidate values:

| Local rule | Candidate value | Current support |
| --- | ---: | --- |
| `displayNameMaxLength` | 30 | Final directory submission maximum |
| `shortDescriptionMaxLength` | 30 | Final directory submission maximum |
| `longDescriptionMaxLength` | 4000 | Submission maximum |
| `developerNameMaxLength` | 80 | Submission maximum |
| `capabilitiesMaxItems` | 20 | Submission maximum |
| `capabilityMaxLength` | 120 | Per-item maximum |
| `defaultPromptMaxItems` | 3 | Starter-prompt maximum |
| `defaultPromptMaxLength` | 128 | Per-prompt maximum |
| `urlMaxLength` | 1024 | Final directory URL maximum |
| `packageUrlMaxLength` | 2048 | Package-validation URL maximum |
| `brandColorMinimumContrast` | 2 | Minimum 2:1 contrast |
| `assetMaxBytes` | 5,242,880 | 5 MiB maximum |
| `rasterAssetMaxDimension` | 4096 | 4,096 px maximum |
| `assetExtensions` | JPEG/JPG/PNG/SVG/WebP | Current supported image types |

The documented listing requires display name, short description, long description, developer name, and category. Capabilities are required for the Codex compatibility format. Website, support, privacy, and terms URLs are required for MCP review but optional for skills-only ZIP uploads. Starter prompts must be unique and omit plugin mentions. Logos and composer icons are required for the Codex format and must be square; the error reference also requires at least 48×48 dimensions.

The current submission-error reference supplies the exact category enumeration retained in the candidate.

Sources: `https://developers.openai.com/plugins/deploy/submission` and `https://developers.openai.com/plugins/deploy/submission-errors`.

### Skills and `agents/openai.yaml`

The submission-error reference supports typed skill metadata in `skills/<skill>/agents/openai.yaml`: interface display name, short description, optional icon paths, optional six-digit brand color, optional default prompt, policy fields, and `dependencies.tools`. The portable plugin and skill documentation support the existing package identity and skill layout checks.

The current error reference explicitly supports the 1,024-character skill-description maximum and 64-character combined plugin-and-skill identity maximum. More restrictive short-description and dependency-field bounds remain local conservative checks rather than claims about OpenAI's unpublished portal implementation.

Sources: `https://developers.openai.com/plugins/deploy/submission-errors` and `https://developers.openai.com/plugins/build/plugins`.

### Policy and claims

The replacement plugin guidelines apply to skills-only and MCP-backed plugins. They require clear purpose, accurate metadata, reliable behavior, compliance with safety and privacy requirements, and no implication of OpenAI authorship or endorsement. Skills are automatically scanned, and a skills-only plugin must still meet metadata and listing requirements.

The current guidelines say directory screenshots are no longer shown and direct builders to example prompts, while the submission metadata table still permits optional screenshots. The candidate keeps the Foundry skills-only screenshot rejection as an explicitly named local conservative check; it does not represent that rejection as an OpenAI package-schema requirement.

Source: `https://developers.openai.com/plugins/plugin-guidelines`.

## Meaningful drift since the prior artifact

1. `app-guidelines` is no longer a retrievable authority URL; `plugin-guidelines` is the current official replacement.
2. Current packaging guidance leads with root `plugin.json` and `extensions.com.openai`; `.codex-plugin/plugin.json` is a compatibility fallback. The existing compiler already emits both, so renewal does not require a compiler-time bypass.
3. Current docs describe root `mcp.json` for portable MCP packages and legacy `.app.json` or compatibility wiring in some plugin-creator flows. The current Foundry check is valid only for its declared skills-only lane.
4. Screenshots remain optional package metadata but are no longer shown in the directory according to the guidelines. The existing rejection must be labeled local policy, not an upstream prohibition.
5. The four listing URLs have conditional requirements: optional for skills-only ZIP uploads and required for remote MCP review.

## Candidate artifacts and digest closure

Proposed rules artifact: `foundry/validators/openai/plugin-rules.v2026-10-04.json`

- Rule id: `openai-plugin-directory-preflight-2026-10-04`
- `reviewedAt`: `2026-10-04`
- `reviewBy`: `2026-11-03` (30-day review interval)
- SHA-256: `fbed653bd422a710b234c9f2ee0a9abb4f49841583bc5b278fb516404ff1322a`

Proposed validator change: update only the default rules filename.

- `tools/foundry/lib/openai-preflight.mjs` SHA-256: `088627eafaafa3ae21aaaf37914579cd1729f8e868bfc9d68649982f06eda212`

Proposed lock refresh:

- `foundry/validators/toolchain.lock.v1.json` SHA-256: `aafd63d4a5d23262ea86aa8a27a31a1c106a152960ae64687a8e351f24b567f2`
- The lock binds the new rule id, rules digest, `reviewBy`, validator implementation digest, and validator source-closure digest.
- All other package, schema, dependency, loader, and source-closure pins are unchanged.

No change is proposed to `tools/foundry/lib/compile.mjs`. Its use of the validator's real current date is the production safety property, not the defect.

## Verification

Base behavior:

```text
node --import tsx --test test/v92-foundry.test.ts
33 tests: 31 pass, 2 fail
Both failures: RULES_FRESHNESS
Exit: 1
```

Isolated candidate behavior, using the actual validator and a hard-linked temporary checkout with only the proposed candidate files replaced:

```text
node --import tsx --test test/v92-foundry.test.ts test/openai-rules-freshness.test.ts
37 tests: 37 pass, 0 fail
Exit: 0
```

The regression proves:

- fresh date `2026-10-04`: pass;
- expiry boundary `2026-11-03`: pass;
- expired date `2026-11-04`: `RULES_FRESHNESS` failure while `RULES_LOCK` still passes;
- modified rules with a current evaluation date: `RULES_LOCK` failure;
- modified lock with unchanged rules: `RULES_LOCK` failure.

## Acceptance gaps

- Required Starlight Board review has not occurred.
- Independent provider review has not occurred.
- Independent review should confirm that retained short-description and dependency-field limits are correctly classified as local conservative checks.
- Direct HTTP archival hashes were unavailable because the environment proxy rejected `curl`; the review used the official documentation reader.
- Windows validation, OpenAI upload, automated scan, connected runtime checks, directory review, publication, package publication, merge, and deployment have not occurred.

## Proposed integration step

The Codex lead should apply the candidate as one reviewable change set, verify every stated digest after application, run the two focused test files on Linux and Windows, and then submit the source mapping and local-conservative classifications to the required independent provider and Starlight Board review before any merge or publication decision.
