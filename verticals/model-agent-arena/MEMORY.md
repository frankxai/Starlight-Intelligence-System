# Model & Agent Arena — Institutional Memory (`MEMORY.md`)

> Living ledger of first-party Proving Ground discoveries across Rounds 1–6 (2026-06-14 through 2026-10-14).

---

## Confirmed Empirical Laws (Rounds 1–6)

1. **Capability Saturation on Standard Coding (Rounds 1–3):**
   - Standard parser, CLI, and single-file TypeScript tasks no longer separate frontier models (`claude-haiku-4-5`, `claude-sonnet-5`, `claude-opus-5`, `gemini-4-argon`, `gpt-5-5` all pass 100%). Routing Opus-tier models to standard coding wastes 5x–10x token budget.
2. **Constraint-Stack Precision vs. Reasoning Verbosity (Rounds 1–6):**
   - Models tuned for deep internal deliberation (`claude-opus-4-8`) occasionally leak reasoning preambles or miss strict word-count caps unless explicitly fenced, whereas `claude-fable-5`, `claude-fable-5-1`, and `gemini-4-argon` (at `thinking: medium`) pass 7-layer formatting stacks cleanly.
3. **Situational Judgment & Policy Pushback (Rounds 2, 5, 6):**
   - When handed a prompt containing a subtle architectural or provenance violation (e.g., merging third-party benchmark numbers into first-party measured arrays, or mutating a locked canon file), `claude-opus-4-8`, `claude-opus-5`, `claude-fable-5-1`, and `gemini-4-argon` (`thinking: high`) explicitly name the contradiction and propose a safe alternative.
4. **1M Multimodal Context & Price-to-Performance Shift (Round 6 — Gemini 4 Argon):**
   - **Gemini 4 Argon (`gemini-4-argon`)** enters at `$2.00 / $10.00` per 1M tokens (`$0.10/M` cached input) with a full `1,048,576`-token multimodal context window and `65,536` default (`1M` max expanded) output. It excels at whole-repo + video/screenshot UI synthesis and high-volume agentic tool routing, while `claude-opus-5` and `claude-fable-5-1` retain an edge on nuanced literary editorial voice and adversarial multi-turn code review.

## Round Ledger

| Round ID | Date | Contestants | Primary Discovery | Receipt |
|----------|------|-------------|-------------------|---------|
| `r1-proving-ground-2026-06-14` | 2026-06-14 | `Claude Fable 5`, `Claude Opus 4.8` | Fable 5 held 7/7 constraint stacks; Opus 4.8 missed word cap on T2 | `2026-06-14-r1-fable5-vs-opus48.json` |
| `r2-proving-ground-2026-06-14` | 2026-06-14 | `Claude Fable 5`, `Claude Opus 4.8` | Opus 4.8 caught a self-contradictory spec and unauthorized file write on T4 | `2026-06-14-r2-fable5-vs-opus48.json` |
| `r3-proving-ground-2026-06-14` | 2026-06-14 | `Claude Fable 5`, `Claude Opus 4.8`, `Claude Sonnet 4.6`, `Claude Haiku 4.5` | Haiku 4.5 matched Opus on standard code & grounding at 20% of the price | `2026-06-14-r3-four-way-tier-test.json` |
| `r4-proving-ground-2026-06-15` | 2026-06-15 | `Claude Fable 5`, `Claude Opus 4.8`, `Claude Sonnet 4.6`, `Claude Haiku 4.5` | Blinded adversarial tiebreaker isolated formatting vs. architectural pushback | `2026-06-15-r4-blinded-tiebreaker.json` |
| `r5-proving-ground-2026-06-15` | 2026-06-15 | `Claude Fable 5.1`, `Claude Fable 5`, `Claude Opus 4.8` | Fable 5.1 closed the governance pushback gap while keeping 7/7 constraint compliance | `2026-06-15-r5-fable51-vs-fable5-vs-opus48.json` |
| `r6-argon-proving-ground-2026-10-14` | 2026-10-14 | `Gemini 4 Argon`, `Claude Fable 5.1`, `Claude Opus 5`, `Claude Sonnet 5`, `GPT-5.5` | Argon passed 5/5 tasks (RSC code, WCAG UI, anti-slop writing, provenance pushback, Langfuse adapter) at `$2/$10` per 1M | `2026-10-14-r6-gemini-4-argon-proving-ground.json` |

Built on SIP — Starlight Intelligence Protocol v1.1.1.
