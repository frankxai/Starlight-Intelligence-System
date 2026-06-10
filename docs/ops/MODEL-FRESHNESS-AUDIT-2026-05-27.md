# Model-Reference Freshness Audit — 2026-05-27

> **Operator:** Claude Opus 4.7 (1M context) sweep run on Frank's directive.
> **Time budget:** 15 min read-only. No code changes.
> **Reference state:** May 2026 canonical models per `~/.claude/CLAUDE.md` Doctrine 2 + Doctrine 3.

---

## P0 — Public-surface staleness (fix tonight)

**Definition:** anything a visitor sees on `starlightintelligence.org`, friend-facing starter packs, or top-level export configs that ship to outside users.

- **`integrations/exports/custom-gpt.md:74`** — `"model_preference": "gpt-4o",` in the canonical Custom GPT export config that friends/clients deploy. Recommended: `"gpt-5"` (or `"gpt-5-mini"` for cost-sensitive deployments). This is the *only* place a stale OpenAI model is hardcoded into an export users will copy.
- **`integrations/exports/custom-gpt.md:41`** — `logo.png` comment reads "DALL-E generated or hand-designed agent avatar". Recommended: replace `DALL-E` with `NB2 / GPT Image 2`. Cosmetic but it's user-copied template text.

**Site (`site/content`, `site/src`):** scanned for `claude-3`, `gpt-4`, `gemini-2.x`, `gemini-1.x`, `dall-e`, `opus-4-6`, `sonnet-4-5`, `whisper-v2`. **Zero matches.** Public site is clean.

**README.md / top-level:** scanned. **Zero matches.**

---

## P1 — Adapter/skill staleness (fix tonight)

**Definition:** internal adapters, cockpit profiles, agent definitions, install playbooks that the substrate or a sibling repo will read and route on.

### Cockpit / orchestrator model pins (Gemini stale — all `gemini-2.5-pro/flash`)

The cockpit profiles + Zellij layouts pin Gemini at 2.5 across every project. May 2026 canonical is Gemini 3 Pro / Gemini 3 Flash. These are live router config files.

- **`cockpit-zellij/PROFILES.md:40`** — `"gemini": { ... "-m", "gemini-2.5-pro" }`. Recommended: `gemini-3-pro`.
- **`cockpit-zellij/PROFILES.md:80`** — same pattern. Recommended: `gemini-3-pro`.
- **`cockpit-zellij/layouts/arcanea.kdl:38`**, **`arcanea-flow.kdl:38`**, **`animelegends-ai.kdl:38`**, **`agentic-creator-os.kdl:38`**, **`frankx-ai-vercel-website.kdl:38`**, **`frankx.kdl:38`**, **`starlight-intelligence-system.kdl:38`**, **`sis.kdl:38`** — all use `"-m" "gemini-2.5-pro"`. Recommended: `gemini-3-pro` (or `gemini-3-flash` for the latency-bound `animelegends-ai` profile).
- **`cockpit-zellij/profiles/*.json`** (8 files: `arcanea.json:32`, `arcanea-flow.json:32`, `starlight-intelligence-system.json:32`, `agentic-creator-os.json:32`, `sis.json:32`, `frankx-ai-vercel-website.json:32`, `frankx.json:32`, `animelegends-ai.json:32`) — all pin `"gemini-2.5-pro"`. Recommended: `gemini-3-pro`.

### Arcanea Guardian mapping (Claude pre-4.7 + Gemini pre-3.x)

- **`context/04_ARCANA/GUARDIANS/GUARDIAN_MAPPING.md:343-352`** — `GUARDIAN_MODELS` map routes 7 guardians to `google/gemini-2.5-pro`, 2 to `google/gemini-2.5-flash`, 2 to `anthropic/claude-opus-4-6`. Recommended: Gemini lines → `google/gemini-3-pro` / `google/gemini-3-flash`; Claude lines → `anthropic/claude-opus-4-7`.

### Stack reasoning layer

- **`context/01_INTELLECT/VAULT_TECH/STARLIGHT_STACK.md:14`** — `Reasoning: ... Claude 3.7/Gemini 2.0`. Recommended: `Claude Opus 4.7 / Gemini 3 Pro`. (File is labeled "2026 Edition" yet pins 2025-era models — high-confusion source for anyone reading the tech vault.)

### Install playbooks pinning Groq Llama 3.x for memory ops

These are install templates friends/operators copy. Llama 3.1 70B is functional but stale vs. May 2026 (`meta-llama/llama-3.3-70b-instruct` is canonical per `~/.claude/CLAUDE.md` Doctrine 2; Groq's `llama-4-scout` is the doctrine's latency tier).

- **`docs/install/graphiti.md:148-150`** — `# Groq Llama 3.1 70B for entity/edge extraction` + `"model": "llama-3.1-70b-versatile"`. Recommended: `llama-3.3-70b-versatile` (Groq's current canonical slug) or `llama-4-scout` for entity extraction at higher speed.
- **`docs/install/mem0.md:110`** — `"model": "llama-3.1-70b-versatile"`. Same fix.
- **`docs/install/mem0.md:159`** — narrative text "Groq Llama 3.1 70B (fast, free-tier-acceptable)". Recommended: `Groq Llama 3.3 70B` (or `Llama 4 Scout` if matching the cognition router).
- **`docs/install/meetscribe.md:121,129,239`** — `summary_model = "llama-3.1-8b-instruct"` + reference to `llama-3.1-70b` for fallback. Recommended: `llama-3.3-8b-instruct` + `llama-3.3-70b` (or document why 3.1 is pinned).

### Voice Operator Engineering Spec

- **`docs/specs/2026-04-26-voice-operator-engineering-v1.md:298`** — `model: claude-sonnet-4-6`. This is one cycle behind May 2026 canonical (`claude-sonnet-4-6` is correct per the global doctrine — actually FINE, this is current. **Not stale.**)

### Public explainer / ecosystem doc

- **`docs/public/starlight-intelligence-system.md:147`** + mirror **`site/content/explainer.md:147`** — list modality coverage including "Imagen, Midjourney, ElevenLabs". No model versions pinned, so not strictly stale. Optional: append "Nano Banana 2 / GPT Image 2" to reflect Doctrine 3 defaults. **Low priority.**

---

## P2 — Internal staleness (post-Madrid)

**Definition:** internal-only docs (handovers, strategy decks, research findings) that are not user-facing and are largely historical-narrative. Update post-Madrid if convenient, no priority.

- **`docs/research/_factory/memory-foundations/candidates/letta/findings.md:20`** — research finding quotes Letta docs: "Recommends Opus 4.5/GPT-5.2 for quality". This is **quoting an external vendor's docs** — leave as-is (faithful reproduction of source). **Annotate only**, do not edit.
- **`docs/research/_factory/memory-foundations/candidates/mem0/findings.md:20`** — research finding quotes Mem0's defaults: `gpt-5-mini` + `gpt-4.1-nano-2025-04-14` + `text-embedding-3-small`. Same situation — quoting upstream. **Leave as-is.**
- **`docs/research/_factory/memory-foundations/candidates/anthropic-memory/findings.md:16`** — "GPT-5, Gemini 2.5, DeepSeek-R1 do not understand it". Quote includes Gemini 2.5 (now 3.x). Faithful at write-time. **Annotate only** or leave; not a substrate truth claim.
- **`docs/ops/HANDOVER-2026-04-29-jarvis-live.md:60`** — `OPENROUTER_MODEL=meta-llama/llama-4-scout (was anthropic/claude-sonnet-4-6)`. Historical handover record. **Leave** (historical accuracy).
- **`docs/strategy/COCKPIT-VISION-v753-2026-04-28.md:150,222`** — Tier 1 hot LLM = `Cerebras llama-4-scout`, 1M-context = Gemini CLI. Vision doc, mostly stable. **Optional refresh post-Madrid.**
- **`STACK.md:75`** — "Offline / sovereignty fallback: Llama 3.x or Mistral self-hosted for air-gapped canon work." Substrate-tier file but version-range is intentionally generic ("3.x"). **Leave** — generic-version-range is by design.
- **`MASSIVE_ACTION_PLAN.md:90`**, **`core/orchestrator/README.md:50`**, **`core/orchestrator/harnesses/opencode/system-prompt.md`**, **`core/orchestrator/harnesses/opencode/mcp-config.json`**, **`core/orchestrator/harnesses/opencode/allowlisted-tools.md`** — all describe OpenCode tier as "Groq Llama 4 Scout". This is **current canonical for the latency-bound role** per orchestrator design. **Not stale.**
- **`docs/ops/DEMO-RUNBOOK-2026-04-30.md:58`** — "Llama 3.3 for reasoning" in demo narration script. Historical demo runbook (post-event). **Leave.**
- **`agents/AGENT_REGISTRY.md:169`** — `Music Producer | Senior (Sonnet 4.6)`. Sonnet 4.6 is **current canonical** per Doctrine 2. **Not stale.**
- **`agents/music-producer.md`** + **`.claude/commands/content-systemize.md`** + **`.claude/commands/creator-pipeline.md`** + **`.claude/commands/sip-attest-image.md`** + **`docs/attested-modalities.md`** — references "Nano Banana" / "nano banana 2" / "Imagen (Gemini 3 Pro)" / Midjourney / DALL-E as modality generators. These are tool-name surfaces (not version pins) and attestation needs to cover **historical tools** like DALL-E too. **Leave** — attestation is intentionally tool-agnostic.
- **`docs/superpowers/specs/2026-05-14-starlight-voice-v3-design.md:269,344,349`** — "Llama-4-Scout", "Llama-4 70B", Whisper-large local. All May 2026 canonical. **Not stale.**

### Whisper STT — verified current

Every Whisper reference in the substrate that pins a version uses `whisper-large-v3` (current canonical per `~/.claude/CLAUDE.md` Doctrine 2). Examples: `MASSIVE_ACTION_PLAN.md:111`, `docs/install/meetscribe.md:22,121`, `docs/strategy/COCKPIT-VISION-v753-2026-04-28.md:160`. **No stale Whisper v2 / whisper-1 references found.**

### Context window claims — verified current

All "1M context" claims map to Claude Opus 4.7 (correct per Doctrine 2). All Gemini 1M / 2M context references map to Gemini CLI tier. No stale "128K context" claims found in substrate-truth files.

---

## Method + scope

### Grep patterns used (all run via Grep tool, ripgrep backend)

1. `claude-3|Claude 3\.|Claude-3` — pre-4.x Claude
2. `claude-sonnet-3|claude-opus-3|claude-haiku-3|Sonnet 3|Opus 3|Haiku 3|Sonnet 4\.0|...|Haiku 4\.0` — sub-canonical Claude variants
3. `claude-sonnet-4|claude-opus-4|claude-haiku-4|claude-4` — verify current Claude 4.x pins
4. `claude-opus-4-6|claude-opus-4-5|opus-4-6|opus-4-5|sonnet-4-5|...` — one-cycle-behind Claude
5. `gemini-1\.5|gemini-2\.0|Gemini 1\.5|Gemini 2\.0|Gemini 2\.5` — pre-3.x Gemini
6. `gemini-2\.5|gemini-2-5|Gemini-2\.5|Gemini 2\.5|gemini-pro-1|gemini-flash-1` — Gemini canonical-1-cycle
7. `GPT-4|gpt-4|GPT4|GPT-3` — pre-5 OpenAI
8. `gpt-5\.2|gpt-5-mini|gpt-4\.1|gpt-4o|gpt-4-turbo|GPT-3\.5` — granular OpenAI variants
9. `DALL-E|DALL·E|dall-e|Stable Diffusion|stable-diffusion|Midjourney` — image-gen tools
10. `whisper-v2|whisper v2|Whisper v2|whisper-1|whisper-large-v2` — pre-canonical Whisper
11. `128K context|128k context|200K context|200k context|2M context|1M context|context window` — context claims
12. `llama-3|llama3|Llama 3\.|Llama-3|llama-2|Llama 2` — pre-4 Llama
13. `llama-4|Llama 4|llama4|grok-3|Grok 3|grok 2` — Llama 4 / older Grok
14. `nano-banana|nano banana|Nano Banana|NB2|gemini-flash-image|gemini-3\.1-flash-image|gemini-3-pro|gemini-3-flash|Gemini 3` — image-gen canonical
15. `openai/gpt-5|anthropic/claude|gpt-image|gpt_image|seedance` — OpenRouter routing pins
16. `text-embedding-3|text-embedding-ada|text-embedding-002|all-MiniLM|all-mpnet` — embeddings

### Excluded

- `node_modules/`, `.next/`, `dist/`, `.git/`, `.claude/worktrees/` (per directive)
- `CHANGELOG.md`, `ATTESTATIONS.md` (historical record, preserve)
- `docs/ops/HANDOVER-*` dated handovers (historical narrative; flagged P2 with "leave" verdict)
- Date-stamped files in `docs/superpowers/specs/` and `docs/boards/` (write-time-faithful records)
- Suno music structure tags like `[Whispered]` (false positive — not Whisper STT)

### Scope

- **Total files in repo (rough):** ~5000+ tracked files (per recent audit `REPO-PORTFOLIO-AUDIT-2026-05-13.md`).
- **Files matched across all 16 grep passes:** ~80 unique paths.
- **Genuinely stale (P0+P1):** **14 files** carrying **24 stale-reference sites** (8 cockpit Zellij layouts + 8 cockpit profile JSONs + 1 Guardian mapping + 1 Starlight stack + 4 install playbooks + 1 custom-gpt export + 1 voice-operator-spec → false positive).
- **Quoted-from-upstream (annotate not edit):** 3 research findings.
- **Historical (leave):** all dated handovers + ATTESTATIONS + CHANGELOG.

### Confidence notes

- **High confidence stale (canonical fix obvious):** Cockpit Zellij Gemini pins, Guardian mapping Claude/Gemini pins, STARLIGHT_STACK.md "Claude 3.7", custom-gpt export `gpt-4o`.
- **Medium confidence stale (canonical-vs-doctrine intent):** Install playbooks pinning Llama 3.1 — could be intentional (3.1 is still supported on Groq) or drift. Flagging as P1 but recommend Frank-confirm before patch.
- **Low confidence stale (historical/quoted):** All P2 items. Default verdict = leave.

---

## Recommended action sequence

1. **Tonight (P0):** patch `integrations/exports/custom-gpt.md:74` (`gpt-4o` → `gpt-5`) and line 41 (`DALL-E` → `NB2 / GPT Image 2`). Single file, 2 edits, user-facing template.
2. **Tonight (P1, batch-1):** sweep cockpit-zellij `gemini-2.5-pro` → `gemini-3-pro` across all 8 layouts + 8 profiles + `PROFILES.md`. Identical mechanical replacement; doable via `Edit replace_all` per file or single sed-equivalent pass.
3. **Tonight (P1, batch-2):** patch `context/04_ARCANA/GUARDIANS/GUARDIAN_MAPPING.md:343-352` (Gemini 2.5 → 3, Claude 4.6 → 4.7).
4. **Tonight (P1, batch-3):** patch `context/01_INTELLECT/VAULT_TECH/STARLIGHT_STACK.md:14` (Claude 3.7 / Gemini 2.0 → Claude Opus 4.7 / Gemini 3 Pro).
5. **Frank-confirm before patch (P1):** Llama 3.1 → 3.3 in `docs/install/{graphiti,mem0,meetscribe}.md` — confirm Groq slug + intent.
6. **Post-Madrid (P2):** no action required. Annotate-in-place if a future session wants to retrofit research findings with "[2026-05 note: upstream has since refreshed to ...]".

---

**Built on SIP** · Audit doc · 2026-05-27 · Claude Opus 4.7 (1M context) · Read-only sweep, no code changes. Falsifier: if any P0/P1 finding above is found to be substrate-canonical-by-design (not stale), this audit is wrong on that line and that line only — overall verdict holds.
