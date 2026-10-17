# Free-tier R5 leaderboard — 2026-10-17

Built on SIP — receipt: `arena-2026-10-17-free-arena.json`. Transport clone:
`tools/arena/free-arena.mjs` (R5 fixtures verbatim, `opencode run --format json`,
prompts via stdin, no LLM judge).

## Correctness (R5 deep-reasoning card, n=1 per cell)

| model | pass | FAIL-ATTRACTOR | ERROR | contract violations |
|---|---:|---|---:|---:|
| glm | 6/6 | — | 0 | 0 |
| mimo | 6/6 | — | 0 | 0 |
| deepseek | 6/6 | — | 0 | 0 |
| longcat | 6/6 | — | 0 | 0 |
| nemotron | 6/6 | — | 0 | 0 |
| beam | 6/6 | — | 0 | 0 |
| spacebunny | 6/6 | — | 0 | 0 |
| bigpickle | **5/6** | d2 `memorized-monty-stay` | 0 | 0 |

**The one non-parity signal:** on d2 (attractor-random-reveal), `bigpickle`
answered for the planted attractor — staying with a memorized Monty-Hall answer
instead of reasoning the revealed variant. That is the exact near-miss class the
R5 card pre-registered, and no other free model fell for it.

## Cost of answer (48 cells, harness-inclusive)

| model | mean / max duration | token usage reported? |
|---|---|---|
| beam | 5s / 6s | no (provider omits) |
| spacebunny | 7s / 9s | no |
| deepseek | 10s / 14s | no |
| mimo | 35s / 61s | yes: 165,239 in / 207 out |
| longcat | 30s / 49s | no |
| glm | 43s / 88s | no |
| bigpickle | 32s / 70s | no |
| nemotron | 68s / 110s | yes: 3,534 in / 48 out |

API minutes cost $0 for all eight (subscription-subsidised free tier). The
practical discriminator is **latency**, and it spans 14× (beam 5s vs nemotron
68s mean) — that, plus one availability outage history free of errors today,
is what the routing matrix can use.

## Verdict for routing

R5 was designed to separate the expensive Claude tiers; on today's free tier it
is **saturated on correctness** (same finding the round-1-baseline card had:
parity discriminates only on behaviour axes). Treat this card as the smoke lane
it is documented as (README §Cards): any future free-tier model can enter the
lineup here. Discrimination for the matrix: latency column above, the
attractor column for reasoning under planted-subtext tasks, and availability
(ERROR) over time.

Caveats carried from the receipt, unchanged: harness overhead included in
tokens (~61K measured baseline on the OpenCode build agent); n=1 per cell
(directional); model-in-OpenCode-harness, not a raw API benchmark; free-tier
model IDs resolved live 2026-10-17 and may rotate without notice.
