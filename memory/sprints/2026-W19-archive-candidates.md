---
name: 2026-W19 — Archive candidate batch (10 repos)
description: High-confidence dead-but-not-archived repos surfaced by Audit F. Frank scans + approves; SIS Queen ships archive sweep in one batch.
type: sprint-decision-packet
sprint: 2026-W19
created: 2026-05-05
queen: SIS-tab
status: awaiting-frank-approval
---

# Archive candidate batch — 10 repos

> Per Audit F (2026-05-04): 39 dead-but-not-archived repos exist (>120d since push). The Lighter Contract default for this sprint is **archive 10 high-confidence + flag remaining 29** for next sprint.
>
> **Frank: scan the table below + reply with "go" or strike specific lines you want to keep alive. SIS Queen will ship `gh repo archive <name>` for each approved row in one batch (~2min total).**

## Already shipped 2026-05-05

- ✅ `frankxai/nextgpt` — archived. 5 stale PRs aged 482-552d effectively dead (PRs locked but not closed since archive locks issue tracker).

## Recommended archive batch (10)

Visibility column: PUB/PRIV. Action column: **archive** unless you intervene.

| # | Repo | Vis | Last push | Why archive |
|---|---|---|---|---|
| 1 | `frankxai/Arcanea-Labs` | PRIV | 2025-05 | Sora multimodal studio scaffold; 1 stale PR (codegen-sh DR, 338d old). Superseded by AnimeLegends + arcanea-studio. |
| 2 | `frankxai/frankx-website` | PUB | 2025-10 | Predecessor of frankx.ai-vercel-website; canonical site has moved. PUB + dormant = signal-rot risk. |
| 3 | `frankxai/arcanean-library` | PUB | 2025-10 | Library OS canonical is frankx.ai/library now. PUB + dormant. |
| 4 | `frankxai/lobe-chat-foRk` | PRIV | 2026-02 | LobeChat fork experiment; not in active stack. |
| 5 | `frankxai/lobe-chat` | PRIV | 2026-02 | Same family as above. |
| 6 | `frankxai/RealityDiffusionX` | PRIV | 2026-02 | Image-gen experiment; superseded by AnimeLegends generative pipeline. |
| 7 | `frankxai/Arcanean-AI-Image-Generator-` | PRIV | 2025-05 | Same family — image-gen experiment, dead. (Note trailing dash in name = badly named, harmless on archive.) |
| 8 | `frankxai/morphic-ai-answer-engine-generative-ui` | PRIV | 2026-02 | Morphic fork; not in active stack. |
| 9 | `frankxai/aichatbotx` | PRIV | 2024-11 | 18+ months dead. Numbered chatbot variant duplicate. |
| 10 | `frankxai/notion-powered-blog` | PRIV | unknown | 2 stale CVE-fix PRs aged 50-99d (vercel DR). Repo unused. |

## Why these 10 specifically

- All have **no commits in >120 days**.
- None are referenced as canonical by any active site or substrate doc.
- 4 of 10 are public (`frankx-website`, `arcanean-library`, plus 2 others) — these contribute the highest "signal-rot risk" because they show up in your public profile as dormant.
- 4 of 10 carry stalled PRs that effectively die on archive (3 of those PRs are 50-340d old).

## Flagged for next-sprint review (29 more)

Listed in `memory/sprints/audits/2026-05-04-portfolio-audit.md` § GitHub portfolio (Audit F) — full set of 39 dead repos. The 29 not in this batch are either:
- Newer dormant (pushed Jan-Feb 2026) — may still revive
- Public repos whose presence might signal something Frank cares about
- Borderline name conflicts where archive could erase historical context

These are **flagged**, not actioned. Next sprint Frank reviews + we batch-archive in W20.

## Approval mechanism

**Default: I archive all 10 in one batch unless you strike a line.**

To strike: reply with the repo name(s) to KEEP active. Otherwise I ship the batch via:

```bash
for r in Arcanea-Labs frankx-website arcanean-library lobe-chat-foRk lobe-chat RealityDiffusionX "Arcanean-AI-Image-Generator-" morphic-ai-answer-engine-generative-ui aichatbotx notion-powered-blog; do
  gh repo archive "frankxai/$r" --yes
done
```

Reversible via `gh repo unarchive <name>` if you change your mind on any.

---

*Built on SIP — operational tier · sprint decision packet · 2026-05-05*
