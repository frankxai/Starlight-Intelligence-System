# Master Prompt: Frontier Lab E2E Transformation for Starlight Intelligence Systems

> **Target Model:** Claude 3.7 Sonnet / Claude 3.7 Opus (Extended Thinking) / GPT-5 / Gemini 2.5 Pro  
> **Mode:** Autonomous End-to-End Implementation (`--yolo` / `/goal` / `/boost`)  
> **Architecture Reference:** `docs/architecture/NPM_ECOSYSTEM_STRATEGY.md`  
> **Machine SSOT:** `C:/Users/frank/starlight/repos`

---

## Copy-Paste Prompt for the Frontier Model

```markdown
# MISSION: Transform Starlight Intelligence Systems into an Industry-Standard Top-Tier AI Lab NPM Ecosystem

You are operating as the Principal Systems Architect and Staff Infrastructure Engineer for FrankX and Starlight Intelligence Systems (SIS). 

Frank's DNA: Systems Architect × Composer × Gamer × Builder × GenCreator.
Our Quality Standard: Founder Quality Policy (8 October 2026) — zero generic AI slop, no fake wrappers, rigorous modular engineering, and verifiable outcome quality.

Your mandate is to execute the end-to-end transformation of Starlight's architecture into a modular, multi-tier NPM ecosystem that competes with and surpasses top AI labs (Vercel AI SDK, Anthropic MCP, LangGraph, Mastra).

---

### ARCHITECTURAL SPECIFICATION & DELIVERABLES

Read the master architecture blueprint at `C:/Users/frank/starlight/repos/Starlight-Intelligence-System/docs/architecture/NPM_ECOSYSTEM_STRATEGY.md`. You must implement the following 4 milestones:

#### MILESTONE 1: Extract Featherlight `@starlight-intelligence/core` (Zero Dependencies)
- Location: `packages/core` in `Starlight-Intelligence-System` (or a dedicated monorepo workspace).
- Goal: Create the universal TypeScript protocol substrate with ZERO runtime dependencies. Edge, Browser, Node, Deno, Bun compatible.
- Exports:
  1. `types.ts`: `VaultEntry`, `VaultType` ('strategic' | 'technical' | 'creative' | 'operational' | 'wisdom' | 'horizon'), `MemoryEvent`, `SIPAttestation`, `HarnessContract`.
  2. `sip.ts`: SIP Layer 1–5 specification verification, cryptographic attestation footer generator (`Built on SIP v1.1.1`).
  3. `sanitizer.ts`: Pure-function regex and heuristic PII/secret scrubbing contracts (The Veil interface).
  4. `index.ts`: Clean barrel export with full `.d.ts` declaration generation.
- Build target: `tsup` or `tsc` emitting ESM (`dist/index.mjs`) and CJS (`dist/index.cjs`) with bundle size < 20 kB.

#### MILESTONE 2: Package `@starlight-intelligence/ai-sdk` (Vercel AI SDK Adapter)
- Location: `packages/ai-sdk-adapter`.
- Goal: Provide an effortless bridge so ANY developer building Next.js apps with Vercel's `ai` SDK can inject sovereign Starlight memory in 2 lines of code.
- Implement:
  1. `StarlightMemoryProvider` class implementing context retrieval, system prompt formatting, and post-generation memory ingestion.
  2. Hooks for `streamText` and `generateText` system prompts.
  3. Clear, executable example in `examples/nextjs-ai-sdk-memory`.

#### MILESTONE 3: Standalone Starlight MCP Suite (`@starlight-intelligence/mcp`)
- Location: `packages/mcp-server`.
- Goal: Official, decoupled Model Context Protocol server implementing standard JSON-RPC tools for any MCP-compliant client (Cursor, Claude Code, Windsurf, Antigravity, Gemini CLI):
  - `sis_vault_search`: Hybrid FTS5 + temporal decay memory query.
  - `sis_append_entry`: Scrubbed event-log append.
  - `sis_council_route`: Dynamic model routing and multi-agent consensus dispatch.

#### MILESTONE 4: Monorepo Orchestration, Changesets & Automated GitHub Actions OIDC
- Initialize `pnpm-workspace.yaml` and configure Turborepo (`turbo.json`) for fast, cached builds across:
  - `packages/core` (`@starlight-intelligence/core`)
  - `packages/memory` (`@starlight-intelligence/memory`)
  - `packages/ai-sdk-adapter` (`@starlight-intelligence/ai-sdk`)
  - `packages/mcp-server` (`@starlight-intelligence/mcp`)
  - `packages/system` (`@starlight-intelligence/system`)
  - `packages/arcanea-starlight-shim` (`@arcanea/starlight-intelligence-system`)
- Integrate `@changesets/cli` for automated versioning and CHANGELOG generation.
- Implement `.github/workflows/release.yml` with npm provenance (`id-token: write`) for passwordless, tamper-proof releases.

---

### EXECUTION RULES & HYGIENE
1. Surgical, high-quality code. Preserve existing systems, tests, and documentation.
2. Verify all TypeScript builds with `tsc --noEmit` and run existing substrate tests (`npm run test:substrate`).
3. Enforce strict `files` whitelist in all `package.json` files to guarantee ZERO private vault or secret leaks.
4. Execute fully end-to-end without stopping prematurely.
```
