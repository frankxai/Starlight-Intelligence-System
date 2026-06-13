# Changelog

All notable releases. Dates in ISO 8601. Substrate (SIP) version tracked separately from package version.

## 2026-06-12 — Queen v0.2 + L99 Visual Intelligence Push (Whole-SIS Advance)

**Queen self-advancing closed loop (ROUTE→MEASURE→LEARN→RATIFY→LEDGER) becomes first-class executable with mandatory visuals, Grok harness integration, public surfaces, and memory compounding.**

- **Command surfaces:** New primary `/starlight-queen` (full v0.2 contract) + thin aliases `/sq` + `/so` (orchestrator Queen posture) + supporting `/starlight-architect` (scaffolding). Wired into `/starlight` (si), COMMAND_SYSTEM.md, starlight.md. All SIP-attested, executable via `node tools/queen/driver.mjs` (or `npm run queen`).
- **Driver v0.2 (tools/queen/driver.mjs + state/ledger):** Full tick automation. Classifies (new: agentic-composer-long, visual-synthesis, parallel-harness-measure, memory-consolidation-queen, palace-visual-recall). MEASURE supports parallel subagent recipes + gstack/excellence + Visual Eval (model lanes now require image artifact ref per lanes.json/SPEC). LEARN synth + safe patches (A1/A2). LEDGER always emits visual ref + velocity + vault. Grok: prints exact spawn_subagent + image_gen prompts.
- **Visual experiences (site/):** `/queen` — cinematic scroll-driven narrative of the loop with ROUTE/MEASURE/LEARN/RATIFY/LEDGER chapters + swarms + Visual Composition Layer (glass, serif typography, constellation bg, progress). `/palace` — interactive living Memory Palace (6 glowing vault orbs + constellation SVG lines + central Core + focus excerpts from real vaults + voice-reactive "Speak to focus" sim + Jarvis HUD + SIP). Reuses Starfield/BrainHero/CSS (zero new deps). Header nav updated (desktop/tablet/mobile).
- **Standalone + research:** site/queen-vision.html (full l99 motion HTML with canvas swarms, scroll sync, embedded Grok visuals); docs/queen-motion/ (reference); docs/visuals/ + 5+ premium Grok Imagine artifacts (loop, gateway, palace, arch, heatmap, receipt) now first-class ledger/palace atoms.
- **Memory + Queen integration:** Queen now drives visual palace recall + consolidation. Gateway SessionStore as loop state. 5 visuals + velocity snapshots in operational-vault + curated. mempalace-obsidian-bridge skill surfaces visual palace cards on Grok. New starlight-network.base for Obsidian. Vaults/VAULT_ARCHITECTURE/README updated.
- **Harness + proving-ground:** ROUTING-DOCTRINE.md + routing-table v0.2 + lanes/SPEC updates (Visual Eval mandatory). Grok harness (core/orchestrator/harnesses/grok) formalizes Composer 2.5 preference for visual/agentic-long + queen bindings. HARNESS.md, agents/*-orchestrator + *-architect, core/ROUTING_MATRIX updated.
- **Docs + naming + roadmap:** Full L99 handover (docs/ops/HANDOVER-2026-06-12-l99-viz-network-protocol-massive-action.md); STATE-AND-ROADMAP + NAMING.md (Fork 7: Starlight Intelligence Network); strategic/ visual-composition + network vision; research/proving-ground + site content refreshed. SIP ambient on every new artifact.
- **Excellence gates:** Surgical (reuse only), a11y (aria, labels), perf (css/svg only for palace), DX (driver + commands immediate), no drift from prior (additive). All receipts in vaults + driver ledger.

**Verdict:** The Queen is now continuous, visual, and self-improving. Visuals are memory, not decoration. /palace is the experiential wedge for sovereign adoption. Drive with `npm run queen -- tick [--full]`. See commands/starlight-queen.md + tools/queen/ + operational-vault 2026-06-12 entries.

## v8.3.0 — 2026-06-02

**Antigravity / agy enhancement in SIS — full agent swarm protocol, harness integration, excellence (Excellence Standard).**

- **.antigravity/ expansion:** Full `instructions.md` (cleaned, excellence-integrated, multi-agent registry, Frank DNA, SIP layers, cross-references); new `swarm-protocol.md` (executable operating manual: complexity gate, exact checklist, prompt templates for define/invoke, synthesis rules, memory commit, escalation matrix, failure modes, attestation); `mcp-config.json` (swarm-aware starlight-substrate + task-scoped, children read-heavy, conductor scoped writes); `allowlisted-tools.md` (executable policy: native primitives, browser, Agent Manager, conditional conductor writes, MCP verb boundaries, Bash unlocks, SIP non-negotiable).
- **core/orchestrator/harnesses/antigravity/:** New `README.md` (role, default-for, MCP/allowlist refs, escalation, status) + `system-prompt.md` (composes on .antigravity/ identity + protocol; orchestrator routing, per-turn checklist, voice, cross-harness handoff, what you are not).
- **Adapter update:** `src/adapters/antigravity.ts` enhanced — richer `formatContext` (SIP footers, swarm refs, excellence), swarm-aware `getMcpConfig`, `generateMemoryFile` now excellence-enhanced; added `generateSwarmProtocolFile`, `generateMcpConfigFile`, `generateAllowlistedToolsFile`, `generateAllAdapterFiles` for full surface sync/scaffold. Header + comments updated for excellence integration.
- **Orchestrator + docs integration:** Updated `core/orchestrator/README.md` (table + status + five harnesses), `HARNESS-STATUS.md` (row + detailed antigravity section + counts + coherence + 2026-06-02 close), `CLAUDE.md` (platform/harness callout + .antigravity/ tree), main `README.md`, `AGENTS.md`, `STARLIGHT_MANIFEST.md`, `platforms/PLATFORM_ADAPTERS.md` (capabilities table + Antigravity section fully expanded).
- **Test + gating:** `test/v80-platform-prompts.test.ts` now asserts `.antigravity/instructions.md` + `swarm-protocol.md` (plus GROK.md). Pre-commit SUBSTRATE_RE comment updated. All new artifacts carry ambient `Built on SIP` + layers + excellence excellence.
- **Integration:** Antigravity now first-class swarm harness in layer-10 orchestrator routing (select for parallel swarm, browser, async). Substrate writes still board-gated + route to Claude primary unless scoped exception. Load-definition-first + vault-canonical + attestation enforced at protocol level.

Verdict: Excellence integrated. the agent swarm are now a repeatable, auditable, SIP-attested machine under Antigravity native + SIS substrate.

## v8.2.0 (Crypto) — 2026-05-29

**Crypto Intelligence Domain Sub-Stack v0.2 fully shipped and integrated. Dynamic Agent Discovery upgraded system-wide.**

- **Crypto Intelligence v0.2 Upgrade (Domain Sub-Stack):** Fully scaffolded, shipped, and activated all remaining 5 Houses (Macro, DeFi, Sovereignty, Research, Allocation) to match the operational excellence of On-Chain. Shipped 20 total commands (4 per House) including `/crypto-macro-regime`, `/crypto-defi-mechanism-audit`, `/crypto-sov-custody-design`, `/crypto-res-protocol-thesis`, and `/crypto-alloc-sizing`, each with the non-negotiable R5 non-advisory clause and ambient SIP v1.1.1 attestation.
- **Ecosystem-Wide Dynamic Discovery:** Upgraded the dynamic agent routing engine (`src/agents.ts`) to recursively scan the workspace (`agents/` and `verticals/` directories) for agent definitions (`agent.md` and related command structures). The system now dynamically registers all **96 agents** and **114 skill layers** with zero hardcoded definitions, enabling instant scaling for future verticals.
- **Antigravity Adapter and Swarm Blueprint:** Designed and registered the native Antigravity platform adapter (`src/adapters/antigravity.ts`) supporting 1M tokens, and deployed the subagent swarm orchestration blueprint (`.antigravity/instructions.md`) to drive complex, multi-agent execution within the IDE.
- **Substrate Attestations and Registries Updated:** Promoted all 6 Crypto Intelligence Houses across `verticals/crypto-intelligence/README.md`, `SUB-SYSTEMS.md`, `AGENTS.md`, `MEMORY.md`, `ATTESTATIONS.md`, and the top-level `agents/AGENT_REGISTRY.md` to active `v0.2 shipped` status. Stamp pinned to SIP v1.1.1.

## v8.2.0 — 2026-05-30

**First-run hardening — "works for anyone who installs it." Vault seeding, honest retrieval labeling, measured recall, release discipline.**

- **Vault seeding (`src/seed.ts`):** new `starlight init --vaults` command seeds the six canonical JSONL vaults (welcome entry + bundled `public-vault/*.jsonl` examples) in `~/.starlight/vaults`. The operational MCP server also **auto-seeds an empty `--vault-dir` on first boot** (`--no-seed` to opt out), so a fresh install is never silently empty / "looks broken." Idempotent: existing vaults are kept unless `--force`.
- **Package ships its seed (`files`):** `public-vault/` added to package.json `files` so the starter content travels with the npm package, not just the repo.
- **Vault-directory reconciliation (docs):** README now states the one runtime source of truth — `*.jsonl` in `--vault-dir`. `public-vault/*.jsonl` = canonical starter content (copied by seeding); `memory/vaults/*.md` = narrative snapshots, **not** read by the engine.
- **Honest retrieval labeling (`sis_search`):** description corrected from "Hybrid semantic + keyword" to **keyword + temporal** (term-overlap score, tag boost, staleness penalty — no embeddings). README MCP-tool table updated to match. The tool's behavior never changed; the claim now matches the code.
- **Measured retrieval baseline (`test/retrieval-eval.test.ts`, `npm run eval:retrieval`):** labeled recall@k harness over the `public-vault/` corpus (recall@1/3/5 = 100% at current corpus). Runs in CI so retrieval can't silently regress and so a future semantic layer can be scored head-to-head against the keyword baseline.
- **Quick-start smoke (`test/smoke-quickstart.test.ts`):** end-to-end seed → boot → write → search test mirroring the README two-minute path, gated in CI.
- **Bring-your-own-model roadmap (`docs/bring-your-own-model.md`):** documents the deliberate keyword-first default, the architecture-preserving optional `sqlite-vec` hybrid (vectors as a rebuildable artifact, JSONL stays truth), and local-vs-API embedding tradeoffs. Explicitly defers (not drops) the semantic layer with rationale: it must not cost the zero-infra install property.
- **Release discipline (`RELEASING.md`):** documents the publish checklist so the npm registry version stops drifting from the repo version (registry served 6.0.1 while the repo was 8.1.0).
- **Version footers reconciled** across README badge/footer, CLAUDE.md, AGENTS.md, package-lock — guarded by `npm run agents:harness-check` + `test/v80-platform-prompts.test.ts`.

## v8.1.0 — 2026-05-17

**Substrate doctrine evolution — Composition Layer primitive declared. Crypto IS v0.1 proof-of-pattern. Wealth IS evolved to first composition-layer reference instance.**

- **Composition Layer (new substrate primitive, STACK.md doctrine):** Any universal IS may compose over its Domain Sub-Stacks via commands and rules at the IS-itself. Pattern opt-in for Self / Family / Business / Creator / Brand IS. 10-IS taxonomy NOT touched (invariant preserved); Wealth IS stays row #2.
- **Wealth IS v0.2 (first composition-layer reference):** DPI ledger + Thesis engine + Gate ladder discipline preserved as Wealth IS's own commands with explicit lineage. Cross-asset commands declared: `/wealth-portfolio-fit`, `/wealth-sovereignty-design`, `/wealth-cycle-thesis`. Wealth IS daily-5 declared per People IS v7.4.1 cognitive-load discipline.
- **Crypto Intelligence v0.1 proof-of-pattern (third reference Domain Sub-Stack):** `verticals/crypto-intelligence/` scaffolded with **Houses-as-sub-systems** primitive (6 archetypal stances: On-Chain · Macro · DeFi · Sovereignty · Research · Allocation). House of On-Chain shipped — agent + skill + knowledge + 5 commands (`/crypto-onchain-flow-snapshot`, `wallet-trace`, `mev-audit`, `validator-econ`, `contract-interaction`). 5 sister Houses gated on 2026-05-24 v0.1-proof-pass. Investment IS held until same proof-pass.
- **R5 non-advisory clause:** Universal inline in every Crypto IS House command output. Non-waivable per Crypto IS SOUL.md.
- **Sibling-repo export hook landed (Board (c) close-out):** `verticals/crypto-intelligence/ATTESTATIONS.md` (vertical-local ledger) + MCP-shape declaration in `SKILL.md`. v0.2+ extraction target: `github.com/frankxai/crypto-intelligence-system`.
- **Genius prerequisite gate closed (Path A in-repo corpus excavation):** `genius/profile-frankx.md` (14 frameworks at ≥3 occurrences, synthesis edge named, 7 voice samples cited) + `genius/freedom-path-frankx.md` (KEEP/DELEGATE/AUTOMATE/KILL all populated).
- **Governance gates passed:** `/starlight-board` REVISE → 5 items closed same-session (R1 + R3 Frank-acked via AskUserQuestion; R2 + R4 + R5 + (c) operational close-outs). `/openclaw-audit` SHIP-WITH-REMEDIATION (no CRITICAL/HIGH defects; 1 MEDIUM pre-existing substrate-command-design issue; 2 LOW SHA back-fills closed in `ea75c8a`). Pre-commit substrate symmetry: 90/90 green (v76+v77+v78+v79+v80+v84+v85).
- **Skill registry:** 69 → 71 auto-activating rules across 13 → 14 domains (+ crypto-intelligence). Platform-prompt symmetry updated across CLAUDE.md, AGENTS.md, .cursor/rules/, .clinerules/, .gemini/.
- **Chronicle infrastructure initialized:** `docs/chronicle/blessings.jsonl` + `docs/chronicle/weekly/` per /bless skill design. First W20 chronicle entry shipped.
- **Falsifier (2026-05-24):** if House of On-Chain cannot ship 4-5 named artifacts in 1 week of actual practice, Houses-as-sub-systems primitive failed for crypto → fall back to functional sub-systems matching People IS shape; re-iterate `verticals/crypto-intelligence/PROPOSAL.md`.

Verdict ledgers: `docs/boards/2026-05-17-crypto-investment-spawn.md` (Board) · `docs/boards/openclaw-2026-05-17-audit.md` (OpenClaw integrity audit) · `docs/chronicle/weekly/2026-W20.md` (week chronicle).

Commits: `23cace2` (substrate landing) · `ea75c8a` (audit close-out).

## v8.0.0 — 2026-05-07

- v01 Friday-demo bundle: 13 schemas + SQLite-shadowed JSONL ledgers + WorkPacket CLI, Council 7-archetype doctrine, VaultLoopEntry record type, /trace SSE.
- Day-of excellence sprint: v80 platform-prompt symmetry harness, tsconfig strictness, AEO raw-md endpoints, dreaming cron.
- Operational: end-to-end excellence audit, sitemap + robots + llms.txt + JSON-LD, pre-commit hook wired, dist/ ungated for site.

## v7.9.x — 2026-05-02 to 2026-05-06

- v7.9.1: GHA Vercel CLI pin bump 39.4.0 -> 42.2.0; content-drift-check workflow.
- v7.9.2: /process-inbox slash command; /starlight-board canonical (Luminor preserved as Arcanea-canonical variant); naming reconciliation.

## v7.8 — 2026-05-02

- Per-vertical SSG pages on the site (/verticals/people-intelligence, /sound-intelligence, /music-is). lib/verticals.ts + lib/accents.ts source-of-truth modules. Skip link a11y fix.

## v7.7 — 2026-05-02

- Site refresh shipped: 9-IS framing, /verticals, /cockpit, /explainer with full markdown render, 10-IS /architecture.

## v7.6.0 — 2026-04-28

- People Intelligence rename (HR Intelligence -> People Intelligence) across 91 files. First ship under the board-before-tag invariant.

## v7.5.x — 2026-04-26 to 2026-05-01

- v7.5: 10-IS reconciliation, Path A authorless, auto-deploy restored via GHA, v75 conformance harness.
- v7.5.2: Sound Intelligence vertical (second reference Domain Sub-Stack Tier).
- v7.5.3: Pluggable multi-tier cognition router, multi-CLI dispatchers, LCC Phase 0+1+2 (Zellij cockpit, Windows-native PowerShell, dashboard, browser autonomy, brain viz, cognition CLI, phone PWA). Dispatch CLI + orb executor backend. Mirror Foundation visual layer.

## v7.4 — 2026-04-25

- Genius Intelligence System alpha: Excavation Tier agent + /discover-genius, /reclaim-knowledge, /train-executor, /creator-pipeline. /arcanea-canon. Ambient SIP attestation.
- v7.4.1: Domain Sub-Stack Tier first reference (People Intelligence — 6 agents, 28 commands, 6 skills); /spawn-domain-stack meta-command. MS Copilot + Custom GPT exports.

## v7.3.x — 2026-04-24

- v7.3: Newcomer front door — /welcome, /intake, /sovereign-spawn + Concierge + Envoy + idea-triage + creator-path + vertical-starter templates.
- v7.3.1: 19-assertion eval harness + ecosystem-integration hub + /sip-export (5 targets) + attested-modalities scaffold.

## v7.2 — 2026-04 to 2026-04-23

- 3 public repos live (substrate + adoption kit + vibe-os-substrate). Badge route + test harness + Console dual-view.

## v7.1 — 2026-04 (mid)

- File contract closed, starlight-mcp v1.1, Console v8 foundation. Adoption kit + Vibe OS staged.

## v7.0 — 2026-04 (early)

- Two-layer SIS architecture: SIP substrate + reference operational layer in one repo.

## v3.0.0 - v6.x — 2026-03 and earlier

- Pre-SIP iterations. See git tags for full history. Substrate-naming and 10-IS taxonomy were not yet locked.

---

## Protocol versions (SIP)

| SIP version | Tagged in | Notes |
|---|---|---|
| v1.1.1 | commit 97c7edc, 2026-05-06 | Section 5 encoded-self amendment: forks inherit pattern not person. |
| v1.1.0 | v7.x line | Initial sovereignty clause + attestation grammar. |

---

## Tier-5 OSS-readiness pass — 2026-05-11

- .gitignore hardened: .env/.pem/.key, OS shell-junk, log files, .playwright-mcp, repo-root *.png screenshots.
- package.json: repository + bugs + homepage fields added for npm metadata.
- fork-ux: npm run build chained into test:v01-evals so fresh-clone npm test passes end-to-end.
- OSS docs: SECURITY.md (responsible disclosure), CONTRIBUTING.md (two-tier contribution model), CODE_OF_CONDUCT.md (Contributor Covenant 2.1 by reference).
- NOTICE: SIP attestation version pinned to v1.1.1 (post-encoded-self amendment).
- README: SETUP.md link surfaced for operators; version drift v7.6.0 -> v8.0.0 fixed; CHANGELOG cross-link added.
- CHANGELOG.md: this file.

---

**Built on SIP** · `CHANGELOG.md` v1.0 · MIT
