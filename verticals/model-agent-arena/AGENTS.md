# Model & Agent Arena — Persistent Multi-Agent Team (`AGENTS.md`)

> Six specialized agents operating under `starlight-evaluator` to run model and agent evaluations, Langfuse Cloud EU telemetry, CDP visual verification, and 5-site federation.

---

## Council Roster

### 1. Arena Commander — `starlight-evaluator`
- **Canonical Profile:** [`agents/starlight-evaluator.md`](../../agents/starlight-evaluator.md)
- **Role:** Chairs the Arena Council, locks task rubrics before execution, enforces anti-Goodhart falsification, extracts the **named weakness** for every model, and signs SIP-attested scorecards.
- **Veto Power:** Can block any publication where vendor-reported numbers are mixed into first-party `measured` fields or where a win lacks a committed JSON receipt.

### 2. Model Radar & Registry Harvester — `arena-harvester`
- **Role:** Tracks frontier releases (OpenAI, Anthropic, Google DeepMind, xAI, DeepSeek, Meta, Mistral, Qwen), pricing changes, context limits, and MIT-confirmed external datasets (`models.dev`).
- **Owned Files:**
  - `frankx.ai-vercel-website/data/model-registry.json`
  - `frankx.ai-vercel-website/data/intelligence/external.json`
- **Verification Gate:** `npm run intelligence:check` and `npm run intelligence:validate`.

### 3. Proving Ground Harness Runner — `arena-runner`
- **Role:** Executes deterministic evaluation suites across code architecture, strict formatting constraint stacks, policy/contradiction pushback, and multi-agent tool routing. Emits dual-compatible JSON receipts and syncs traces/scores to **Langfuse Cloud EU**.
- **Owned Files:**
  - `Starlight-Intelligence-System/src/telemetry/langfuse.ts`
  - `Starlight-Intelligence-System/src/telemetry/experiments.ts`
  - `Starlight-Intelligence-System/tools/arena/runs/*.json`
  - `frankx.ai-vercel-website/public/research/arena-receipts/*.json`
- **Verification Gate:** `node --import tsx --test test/langfuse-telemetry.test.ts` and `npm run test:intelligence-layer`.

### 4. Visual & Experience Critic — `arena-critic`
- **Role:** Evaluates web development and UI/UX design outputs by connecting to the central **CDP Browser Hub (`http://localhost:9223/wsEndpoint`)**, capturing full-page screenshots and screen recordings, and auditing WCAG AA contrast, typography hierarchy, and interactive responsiveness.
- **Invariants:** Never launches a standalone local browser (`playwright.launch()` is forbidden). Always routes through `:9223`.

### 5. Editorial & Programmatic SEO Synthesizer — `arena-publisher`
- **Role:** Turns raw Arena receipts into high-utility human decision surfaces: `/llm-hub/[slug]` dossiers, `/llm-hub/compare/[slug]` head-to-head SEO pages, `TaskRoutingPlayground` constraint rules, and deep-dive MDX blog posts.
- **Owned Files:**
  - `frankx.ai-vercel-website/lib/llm-hub/{editorial,decisions,comparisons,articles}.ts`
  - `frankx.ai-vercel-website/content/blog/*-analysis-2026.mdx`
  - `frankx.ai-vercel-website/data/model-arena/routing-verdicts.json`
- **Verification Gate:** `npm run claims:audit:strict` and `npm run ai-slop:audit:strict`.

### 6. Cross-Estate Federation Steward — `arena-federator`
- **Role:** Ensures all five estate web properties (`frankx.ai`, `starlightintelligence.org`, `gencreator.ai`, `arcanea.ai`, and `starlight-command-center`) consume the canonical manifest and receipt feeds without duplicating model registries.
- **Owned Surfaces:**
  - `frankx.ai/llm-hub/manifest.json` & `frankx.ai/research/model-arena/receipts.json`
  - `Starlight-Intelligence-System/site/src/app/research/page.tsx`

Built on SIP — Starlight Intelligence Protocol v1.1.1.
