# SIS Research Methodology

> Inherited from `frankx/research/_templates` + `_factory` pattern (2026-05-20).
> Surfaced at `starlightintelligence.org/research/`.

---

## Purpose

SIS produces substrate-tier research that informs foundation decisions. This folder is the methodology layer — templates, rubrics, charters, evaluation protocols — separated from the research itself.

```
docs/research/
├── _methodology/         # ← you are here: how SIS researches
│   ├── README.md         # this file
│   ├── memory-rubric.md  # active rubric: memory-foundation choice
│   └── templates/        # 6-file research template inherited from FrankX
│       ├── OVERVIEW.md
│       ├── KEY_CONCEPTS.md
│       ├── APPLICATIONS.md
│       ├── SOURCES.md
│       ├── TOOLS_RESOURCES.md
│       └── PUBLICATION_PLAN.md
│
├── _factory/             # in-progress research projects (working memory)
│   └── {slug}/
│       ├── CHARTER.md
│       ├── progress.md
│       └── findings.md
│
├── published/            # ratified research, source for site/app/research/[slug]
│   └── {slug}.md
│
└── *.md                  # legacy flat-format research (premium-3d-memory-palace-survey-2026-05-17.md etc.)
```

## Pattern

Three states a research project moves through:

1. **Chartered** — `_factory/{slug}/CHARTER.md` written, rubric referenced, candidates enumerated
2. **In-progress** — sub-agents run, `findings.md` accumulates, `progress.md` tracks
3. **Published** — synthesized, blessed (via `/bless`), moved to `published/`, rendered on site

## What makes SIS research different from FrankX research

| Dimension | FrankX research | SIS research |
|---|---|---|
| Audience | Creators, builders, public hub | Substrate operators, SIP downstream forks |
| Attestation | None required | **SIP attestation per artifact** |
| Cadence | Continuous (creator pipeline) | Episodic (foundation questions only) |
| Output route | frankx.ai/research/ | starlightintelligence.org/research/ |
| Approval | Editor pass | `/starlight-board` for substrate-tier |
| Methodology source | This folder inherits FROM | This folder inherits |

## Active research

See `_factory/` for in-progress projects. Currently:

- `memory-foundations/` — evaluating mem0 / Letta / Cognee / Zep / mempalace / Anthropic Memory API against `memory-rubric.md`

## Falsifiers

A research project is wrong-shape when:
- Charter has no falsifier (no statement of "what would change our recommendation?")
- Rubric was written *after* candidates were evaluated (post-hoc rationalization)
- Synthesis skips the Board pre-pass for substrate-tier outputs
- Publication route reaches the site without `/bless` ratification

---

*Built on SIP — 2026-05-20*
