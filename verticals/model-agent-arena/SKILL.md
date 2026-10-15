---
name: model-agent-arena
domain: intelligence
version: 2026-10-14
status: stable
owner_repo: SIS
---
# Skill: Model & Agent Arena End-to-End Pipeline

> Orchestrates the 6-seat Arena Council whenever a new frontier model drops or a harness capability round is commissioned.

## Trigger Conditions

- User invokes `/new-model <slug>`, `/starlight-eval`, or asks to benchmark a model/agent in the Arena.
- Weekly intelligence freshness check (`npm run intelligence:check`) flags staleness or drift.
- New Proving Ground round (`rN`) is chartered across coding, UI/UX design, technical writing, governance pushback, or multi-agent harness tasks.

## 6-Phase Execution Protocol

1. **Phase 1 — Radar & Registry Harvest (`arena-harvester`)**
   - Verify official release date, context window, max output tokens, input/output/cached pricing per 1M tokens, modalities, and license-confirmed external feeds (`models.dev`).
   - Update `frankx.ai-vercel-website/data/model-registry.json` and `data/intelligence/external.json`.
   - Tag every vendor-reported benchmark with an explicit `verification_scope` string.
2. **Phase 2 — Rubric Lock (`starlight-evaluator`)**
   - Define 4–6 concrete, real-world tasks with mechanical verification assertions (`node:test`, regex/word-cap gates, TypeScript AST/compile checks, DOM/contrast gates).
   - State the falsifier up front: what specific failure mode would expose this model's marketing claims?
3. **Phase 3 — Proving Ground Harness & Langfuse EU Sync (`arena-runner`)**
   - Execute the task suite (`tools/arena/run-argon-eval.ts` or `tools/run-experiments.ts`).
   - Emit the validated receipt JSON to both `Starlight-Intelligence-System/tools/arena/runs/` and `frankx.ai-vercel-website/public/research/arena-receipts/`.
   - Sync parent traces, contestant generation spans, and numeric task scores (`1`, `0.5`, `0`) to **Langfuse Cloud EU** (`src/telemetry/langfuse.ts`).
4. **Phase 4 — Visual & Screen-Recorded Proof (`arena-critic`)**
   - Connect to the central CDP Multiplexer Hub (`curl -s http://localhost:9223/wsEndpoint` -> `chromium.connect({ wsEndpoint })`). **Never call `playwright.launch()`.**
   - Capture high-DPI screenshots and screen recordings of the rendered Arena UI and model-generated web components.
5. **Phase 5 — Editorial, Decisions & SEO Comparisons (`arena-publisher`)**
   - Update `lib/llm-hub/editorial.ts` (`whyItMatters`, `useWhen`, `skipWhen`, `frankNote`), `lib/llm-hub/decisions.ts`, `lib/llm-hub/comparisons.ts`, `lib/llm-hub/articles.ts`, and `components/research/TaskRoutingPlayground.tsx`.
   - Write the deep-dive analysis MDX in `content/blog/<model>-analysis-2026.mdx`.
   - Run `npm run claims:audit:strict` and `npm run ai-slop:audit:strict`.
6. **Phase 6 — Multi-Site Federation (`arena-federator`)**
   - Verify `/llm-hub/manifest.json` and `/research/model-arena/receipts.json` expose the updated registry and receipts for `starlightintelligence.org`, `gencreator.ai`, `arcanea.ai`, and `starlight-command-center`.

Built on SIP — Starlight Intelligence Protocol v1.1.1.
