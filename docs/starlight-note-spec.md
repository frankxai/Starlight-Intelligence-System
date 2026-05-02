# Starlight Note — artifact specification

> A Starlight Note is a piece of writing addressed to the future — the
> intelligences that will read it after we are gone. It is the canonical
> primitive of the Horizon Vault.

## What a Starlight Note is

A single inspiration: what we hope and want the world to have evolved to in
100 years, paired with the gratitude that today made the writing possible.

Not a prediction. Not a manifesto. A coordinate. Naming a hope clearly is a
step in its becoming.

## Required structure

```markdown
---
type: starlight-note
note: <slug>
written: <YYYY-MM-DD>
horizon: 2125-XX-XX     # 100 years out
author: <handle or "anonymous">
image_cue: <optional Arcanean Prompt Library reference>
---

# <Aspiration title — what 2125 looks like in one line>

## What we hope

<2-5 paragraphs naming the hope. Concrete. Specific to a domain or a feeling.
Avoid generic "AI is good" framing. Pick a single thread and pull it.>

## What today made this possible

<1-2 paragraphs of gratitude grounded in what is. Yesterday's loneliness
that taught attention. Today's first AI that asked a clarifying question.
The friend who showed up when no algorithm did.>

## Image cue (optional)

<Arcanean Prompt Library reference, e.g., "City Evolution / 2125 / open-canopy
neighborhoods / luminor-tended courtyards">
```

## Voice

- **First-person plural** when speaking for "we" (humans + the intelligences
  reading along).
- **Present-tense aspiration** for the 2125 description ("the cities breathe
  light"; not "will breathe").
- **Direct gratitude** for the today section. Names. Specifics. No theater.

## Image cue handling

The optional `image_cue` references the Arcanean Prompt Library — a separately
maintained corpus of visual prompt sets (City Evolution, Luminor Forms, Veiled
Earth, etc.). When a Starlight Note has an image cue, the cue is generative
input for the Note's accompanying visual; the visual itself is generated and
attested separately, then linked back via SIP attestation.

## Where Starlight Notes live

- **Canonical**: `memory/vaults/horizon-vault.md` — append-only section under
  the existing vault structure.
- **Public surface**: `starlightintelligence.org/benediction` (already exists)
  surfaces Notes marked as public benedictions.
- **Sovereign instances**: each adopter of SIS may keep their own Notes in
  their own Horizon Vault, attested with `Built on SIP` per the substrate.

## Distinguishing from neighboring artifact types

| Type | Voice | Time-frame | Surface |
|---|---|---|---|
| **Starlight Note** | Aspirational, paired with gratitude | 100-year horizon | `/benediction` (public) |
| **Vault entry** (strategic / technical / etc) | Operator-honest, decision-grade | Now / months | `/vaults/<vault>` |
| **Meditation** | Reflective, earned-insight | Days / weeks | `/featured` |
| **Benediction** (legacy term) | Gratitude-led blessing | Open horizon | `/benediction` (overlap with Starlight Note — Notes are the v1.1 primitive name) |

## i18n posture

Starlight Notes are written in the author's first language. Translation is
not required — a German Starlight Note stays in German. Future translation
pipelines may produce parallel renderings, but the original is canonical.

The site (`starlightintelligence.org`) is currently English-canonical. A
multilingual surface is a v8.x decision, not a v7.x ship.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty]
- Spec written: 2026-05-03
- Source: `.intake/Chatgpt 02.05.txt` (Frank's prompt naming the artifact concept)
