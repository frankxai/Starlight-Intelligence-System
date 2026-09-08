# Music Media Production OS

Version: 0.2.0
Grounded: 2026-07-11
Owner: Music IS / Agentic Music OS

This is the canonical preproduction and media-production layer for every Music
IS release. It extends the existing Agentic Music OS; it is not another plugin.

The reusable unit is a **versioned artist-and-world canon**. Prompts, images,
videos, covers, performances and social posts are derived artifacts. They may
change by format, but they must preserve the canon’s declared invariants and
record intentional exceptions.

## Non-negotiable production order

1. **Song truth** — source, verified lyrics, structure, hook windows, rights.
2. **Artist truth** — public identity, singer/performance identity, ownership or
   likeness consent, audience promise.
3. **World canon** — characters, rules, motifs, objects, locations, visual and
   camera grammar, forbidden drift.
4. **Release story** — causal premise and emotional answer grounded in the song.
5. **Format graph** — one canonical moment transformed into platform-native
   performance, narrative, creator and proof formats.
6. **Hook lab** — at least six materially different openings; change one major
   variable per experiment.
7. **Prompt plan** — model-specific prompt cards with references, settings,
   provenance, known failures and eval rubric.
8. **Production** — native performance/motion first; editing and templates
   second.
9. **QA** — continuity, identity, anatomy, story, format, technical delivery,
   rights, AI disclosure and encoded-output inspection.
10. **Telemetry** — normalize metrics by stop, hold, replay, identity,
    participation, music intent and fandom; never compare raw platform views.
11. **Learning** — promote prompt and format patterns only with attached
    generation or campaign receipts.

## Gate states

| State | Meaning |
| --- | --- |
| `draft` | Incomplete idea; no generation claim |
| `preproduction` | Canon/story/format work in progress; generation may be blocked |
| `hook-test` | Rights and identity locked; at least six openings ready for bounded test |
| `campaign-test` | Top hook candidates rendered and eligible for approved platform test |
| `flagship-candidate` | Native master and format graph pass 90/100 market gate |
| `release-ready` | Distribution, rights, assets and human release approval pass |

No status may be inferred from a successful render command.

## Prompt evidence states

| State | Evidence required |
| --- | --- |
| `draft` | Purpose, inputs and prompt body exist |
| `research-backed` | Current official model guidance and known limits cited |
| `render-tested` | Representative outputs, settings, defects and rubric scores stored |
| `campaign-proven` | Multiple releases or experiments show repeatable performance lift |
| `retired` | Model drift, regression, policy or quality failure documented |

“Proven” without receipts is forbidden.

## Canonical files

- `standards/artist-world-canon.md` — artist, singer, character and world contract.
- `standards/format-graph.md` — current platform formats and normalized metrics.
- `prompts/video-model-cards.md` — Runway, Veo, Firefly, Kling and Aleph routing.
- `prompts/PROMPT-LIFECYCLE.md` — prompt provenance, eval and promotion rules.
- `schemas/creative-production-contract.schema.json` — machine-readable contract.
- `templates/creative-production-contract.json` — starting template.
- `workflows/validate_production_contract.py` — dependency-free hard-gate validator.

## Market gate

- Scroll stop and first 1.5 seconds: 15
- Emotional specificity and meaning: 15
- Artist/persona recognizability: 15
- Native motion, performance and continuity: 15
- Editorial rhythm and ending: 10
- Platform-native participation: 10
- Variant/reuse system: 10
- Technical finish: 5
- Rights, provenance and disclosure: 5

Below 60 restarts. 60–79 is an internal prototype. 80–89 may enter a bounded
test. 90+ is a flagship candidate. A zero in artist recognition, native motion
or rights blocks flagship status.

## Model economy

- Deterministic tools extract audio facts, validate schemas and inspect files.
- Small/fast models normalize metadata, fill schemas and create first drafts.
- Senior models design prompt variants and production plans from locked canon.
- Frontier judgment is reserved for artist identity, A&R, story, canon conflict,
  rights ambiguity and final creative direction.
- Image/video models generate media; text models never “approve” an asset they
  have not inspected.

## External-action boundary

Local research, contracts, prompts, renders and packages may be automated.
Generation that consumes paid credits, likeness creation, distributor uploads,
public tests, posting and spend require the applicable credential, rights and
human approval gates.

