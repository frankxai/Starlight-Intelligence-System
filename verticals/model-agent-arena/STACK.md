# Model & Agent Arena — Technical Stack (`STACK.md`)

> End-to-end execution, telemetry, visual capture, and multi-site syndication stack.

---

## Layer 1: Execution & Telemetry (`Starlight-Intelligence-System`)
- **Harness Runner:** `tools/arena/run-argon-eval.ts` & `tools/run-experiments.ts`
- **Langfuse Cloud EU Adapter:** `src/telemetry/langfuse.ts` (`recordArenaRun`, `syncArenaReceipts`, `recordDatasetEvaluation`)
- **Experiment Suites:** `src/telemetry/experiments.ts` (`runVaultSearchEvaluation`, `syncArenaReceipts`)
- **Canonical Receipt Archive:** `tools/arena/runs/*.json`

## Layer 2: Visual & Browser Verification
- **CDP Browser Hub:** `http://localhost:9223/wsEndpoint` (central Chromium multiplexer — zero local `playwright.launch()` overhead)
- **Visual QA Gate:** WCAG AA contrast verification, responsive viewport inspection, and screen-recorded walkthroughs (`public/images/arena/`)

## Layer 3: Public Registry & Arena Authority (`frankx.ai-vercel-website`)
- **Canonical Model Registry:** `data/model-registry.json`
- **External Intelligence Snapshot:** `data/intelligence/external.json` (MIT-confirmed `models.dev` pricing & context windows)
- **First-Party Receipts Directory:** `public/research/arena-receipts/*.json`
- **Routing Verdicts Ledger:** `data/model-arena/routing-verdicts.json`
- **Data Loaders & Joiners:** `lib/intelligence/{loader,receipts,rows}.ts` and `lib/llm-hub/{registry,editorial,decisions,comparisons,articles,manifest,rows}.ts`
- **Interactive UI Surfaces:**
  - `/llm-hub` (`ModelExplorer`, `CostCalculator`, `TaskRoutingPlayground`)
  - `/llm-hub/[slug]` & `/llm-hub/compare/[slug]`
  - `/research/model-arena` (`ReceiptsBrowser`, `PassRateSmallMultiples`, `FrontierScatter`)

## Layer 4: Cross-Estate Federation Consumers
- `starlightintelligence.org/research` (`Starlight-Intelligence-System/site/src/app/research/page.tsx`)
- `gencreator.ai` (Creator Modality Arena via `https://www.frankx.ai/llm-hub/manifest.json`)
- `arcanea.ai` (Creative Studio Model Router)
- `starlight-command-center` (`:4321` Operator Telemetry Cockpit)

Built on SIP — Starlight Intelligence Protocol v1.1.1.
