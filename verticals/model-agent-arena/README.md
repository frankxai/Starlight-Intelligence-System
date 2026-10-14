# Model & Agent Arena Vertical (`model-agent-arena`)

> Sovereign evaluation, telemetry, visual proof, and cross-estate federation stack for frontier LLMs and autonomous agent harnesses.

---

## Purpose

The **Model & Agent Arena Vertical** turns frontier model releases (such as **Gemini 4 Argon**, **Claude Fable 5.1**, **Claude Opus 5**, **Claude Sonnet 5**, and **GPT-5.5**) into reproducible first-party receipts, Langfuse Cloud EU telemetry traces, CDP screen-recorded visual proof, and high-utility decision surfaces across all five Starlight estate websites.

## The 7-File Vertical Contract

| File | Purpose |
|------|---------|
| [`README.md`](./README.md) | Overview, architecture, and entry points |
| [`SKILL.md`](./SKILL.md) | Executable workflow for onboarding a model and running an Arena round |
| [`AGENTS.md`](./AGENTS.md) | The persistent 6-seat Multi-Agent Arena Council |
| [`MEMORY.md`](./MEMORY.md) | Cumulative findings across Proving Ground Rounds 1–6 |
| [`STACK.md`](./STACK.md) | Technical stack (SIS runner, Langfuse EU, CDP Hub `:9223`, Next.js 16 federation) |
| [`CANON.md`](./CANON.md) | Non-waivable laws of measurement honesty and provenance separation |
| [`SOUL.md`](./SOUL.md) | Voice, taste, and evaluator ethos |

## Quick Commands

```bash
# 1. Run the deterministic Round 6 Argon Proving Ground & emit receipt JSONs
npx tsx tools/arena/run-argon-eval.ts

# 2. Sync all Arena receipts to Langfuse Cloud EU
npm run experiment:arena

# 3. Validate FrankX LLM Hub & Model Arena freshness + receipt integrity
cd ../frankx.ai-vercel-website && npm run intelligence:check && npm run test:intelligence-layer
```

Built on SIP — Starlight Intelligence Protocol v1.1.1.
