# Suno Prompting Ground Truth — 2026

Last verified: 2026-07-11

Use this file before the older pattern library. It separates current official
platform behavior from Music IS house practice.

## Officially supported behavior

- Simple mode accepts a natural-language song description.
- Custom mode separates title, style, and lyrics; original lyrics supplied by
  the user remain the user's lyrics.
- Suno recommends genre information in Style and allows added song context in
  Lyrics. Structural vocabulary such as verse, chorus, bridge, tempo, dynamics,
  instrumentation, and production terms improves control.
- Advanced Options includes Exclude for unwanted instruments or traits.
- Reuse Prompt can revise lyrics, style, and title on another generation.
- Suno variability remains real. A prompt is a creative constraint, not a
  deterministic production specification.

Primary sources:

- https://help.suno.com/en/articles/2462273
- https://help.suno.com/en/articles/2415873
- https://help.suno.com/en/articles/5782977
- https://help.suno.com/en/articles/9010177
- https://help.suno.com/en/articles/3161921
- https://help.suno.com/en/articles/2417409

## Music IS Simple-mode contract

The following 300–400 character cap is a Frank/Music IS working budget, not a
verified Suno platform limit.

Write one dense line in this order:

`genre + tempo/groove + emotional temperature + lead instruments + vocal posture + production texture + structural arc + one avoid constraint`

Prefer concrete musical vocabulary over prose. Do not name living artists or
request imitation. Example:

> Slow nocturnal alt-R&B, 63 BPM half-time, intimate restrained lead vocal,
> warm sub-bass, muted electric piano, dry close verses opening into a wide
> emotional chorus, tactile analog grain, minor-key tension, memorable question
> hook, no belting, no glossy EDM drop.

## Music IS Custom-mode contract

Treat each field as a separate optimization problem.

### Title

- Use 1–5 memorable words.
- Prefer the emotional decision or strongest repeatable phrase.
- Search artist/title conflicts before distribution lock.

### Style

- Put sound facts here: genre, tempo, groove, harmony, instrumentation, vocal
  posture, mix texture, and dynamic arc.
- Use 20–45 load-bearing words for the first pass.
- Add one Exclude list separately; do not bury negatives in a long paragraph.

### Lyrics

- Put only singable lines and sparse structural tags here.
- Use `[Verse]`, `[Pre-Chorus]`, `[Chorus]`, `[Bridge]`, and `[Outro]` when they
  improve form. Avoid stage directions on every line.
- Keep stressed vowels singable in the hook. Prefer concrete images, internal
  tension, and conversational syntax.
- Treat line-level production directions as experiments, not guarantees.

## Iteration protocol

1. Generate two variants from one controlled prompt.
2. Change only one variable on the next pair.
3. Log prompt, model/version, strengths, failures, and selected timestamps.
4. Promote a pattern only after three successful uses; demote after two
   repeatable failures.
5. Save the winning audio and prompt before Reuse/Extend changes the lineage.

## Rights boundary

Commercial rights depend on the plan active when the song was created. Paid
plan commercial use does not guarantee copyright protection. Preserve the
subscription/date proof, human lyric drafts, prompt lineage, and contributors.

Primary sources:

- https://help.suno.com/en/articles/9601665
- https://help.suno.com/en/articles/2746945
