# Model & Agent Arena — Non-Waivable Invariants (`CANON.md`)

> These seven rules govern every number, chart, comparison, and routing verdict across the Starlight estate.

---

## 1. No Number Without a Receipt
Every first-party pass rate, latency figure, or task status displayed on `/research/model-arena` or `/llm-hub` must trace to a committed JSON receipt in `public/research/arena-receipts/*.json` (and `tools/arena/runs/*.json`).

## 2. Provenance Separation (`external` vs. `measured`)
Third-party or vendor-reported figures (`external`) and first-party harness measurements (`measured`) must never be merged into the same field or chart series. Every vendor benchmark in `data/model-registry.json` must carry an explicit `verification_scope` string.

## 3. Exact Contestant Matching (Anti-Inheritance Law)
Near-miss model names (e.g., `GPT-5` vs. `GPT-5.5`, or `Gemini 3.8 Flash` vs. `Gemini 4 Argon`) must never inherit each other's receipts via substring matching. Normalization compares exact alphanumeric tokens only (`lib/intelligence/rows.ts`).

## 4. License-Confirmed Redistribution Only
Only external sources with `license_state: "confirmed"` (such as `models.dev` under MIT) may contribute ingested numbers to `data/intelligence/external.json`. Unverified or non-commercial sources (`SWE-bench` CC BY-NC 4.0, `Artificial Analysis`, `LMArena`) remain `link_only`.

## 5. Mechanical Verification Over Vague Judges
Wherever a task can be checked by a compiler, unit test, regex, word count, or DOM assertion, mechanical verification is mandatory. When a qualitative rubric is used, the criteria and **named weakness** must be published inside the receipt.

## 6. Central CDP Hub Mandate (`:9223`)
Visual verification, screenshots, and screen recordings must connect to `http://localhost:9223/wsEndpoint` rather than spawning isolated `playwright.launch()` processes.

## 7. Single Canonical Registry, Federated Consumption
`frankx.ai/data/model-registry.json` is the single source of truth for model metadata. Sibling websites consume `/llm-hub/manifest.json` and `/research/model-arena/receipts.json` rather than maintaining duplicate hardcoded lists.

Built on SIP — Starlight Intelligence Protocol v1.1.1.
