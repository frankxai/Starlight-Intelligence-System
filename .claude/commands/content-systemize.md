---
name: content-systemize
description: Convert a content pillar into reusable production templates — title formulas, outline skeletons, voice-cloned intro/outro, modality-specific prompt templates (Suno, Nano Banana, Veo). Enables non-genius execution of a pillar's content stream.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <person-name> <pillar-name> [target-executor-name]
---

# /content-systemize

Load `SIP.md`, `VERTICALS.md`, `VOICES.md`, `creator/pipeline-<person-slug>.md`, `genius/profile-<person-slug>.md`, and `executor/<exec-slug>-playbook.md` if an executor is specified. Convert a single content pillar into a reusable production system — so the person (or a trained executor) can ship pillar-aligned content without re-inventing from scratch each time.

## Input
$ARGUMENTS

## When this command fires

- A pillar from `/creator-pipeline` has 3+ pieces shipped; pattern is visible.
- Person wants to delegate pillar production to an executor, or to a future self on autopilot.
- Pillar shape has stabilized — same shape of anchor, same voice beats, same derivative pattern.

## When this command does NOT fire

- Pillar has fewer than 3 shipped pieces → halt, pattern recognition needs data.
- No pipeline exists → route to `/creator-pipeline`.
- Person wants to explore a new pillar, not systemize an existing one → stay in `/creator-pipeline`.

## Process

1. **Validate pillar exists in pipeline.**
   - Resolve `<person-slug>` and `<pillar-slug>` from args.
   - Check `creator/pipeline-<person-slug>.md` exists; locate `### Pillar — <pillar-name>` section.
   - If either missing, halt: `Pipeline or pillar not found. Run /creator-pipeline first, ship 3+ pieces in the pillar, then systemize.`
   - Count shipped pieces in pillar (from per-piece plans marked shipped, or from `ATTESTATIONS.md`). If < 3, halt with: `Pillar has fewer than 3 shipped pieces. Pattern recognition needs data. Ship more, then systemize.`

2. **Extract the repeating pattern.**
   - Read all shipped pieces in the pillar. What's the repeating shape?
     - Hook format (question? contrarian claim? frame flip?)
     - Structure (problem → mechanism → application? story → principle → invitation?)
     - Voice beats (technical warmth? laconic punch? conversational drift?)
     - Length (tight 800w or expansive 2500w?)
     - Cadence of ideas (one per section? three stacked?)
   - Write one paragraph summarizing the pattern. This is the skeleton's spine.

3. **Generate title formulas.**
   - 3-5 title templates that reliably produce pillar-aligned titles.
   - Example: "The <framework-name> Trap: Why <common-mistake> Costs <consequence>"
   - Example: "<Number> Signs You're <state> (And What <framework> Does About It)"
   - Each formula includes a worked example drawn from a shipped piece in the pillar.

4. **Generate outline skeleton.**
   - 5-7 sections/beats per anchor piece in this pillar.
   - Each beat has a one-line prompt telling the executor (or AI) what goes there.
   - Example: "Beat 3 — Mechanism. One paragraph. Name the underlying system. No jargon. End with the leverage point."

5. **Voice-cloned intro/outro.**
   - Write 3 intro variants + 3 outro variants that sound exactly like the person.
   - Pull from voice samples in the Genius Profile. Do not invent new voice — mirror existing.
   - These become standard openers/closers the executor can reuse or adapt.
   - Each variant passes the same voice-check gate as main content.

6. **Modality prompt templates.**
   - For each modality this pillar uses, produce a prompt template:
     - **Suno** (if audio/music pillar): genre + mood + lyric skeleton from pillar voice
     - **Nano Banana** (image): visual vocabulary from pillar + composition guidance + style anchors
     - **Veo** (video): scene + pacing + tone + camera language
     - **Claude** (text draft): voice samples loaded + pillar thesis + outline skeleton + length target
     - **ElevenLabs** (voice-over, if podcast pillar): voice model ID + pacing + emphasis marks
   - Every template includes `[PLACEHOLDER]` fields the executor fills per piece.

## Output

Write to `creator/system-<person-slug>-<pillar-slug>.md`. Create `creator/` if missing.

```
# Content System — <Person> / <Pillar> — v1.0

## Pattern recognized
<one paragraph on the repeating pillar shape — hook, structure, voice beats, length, cadence>

## Title formulas
1. "<template>" → example from shipped piece: "<example>"
2. "<template>" → example: "<example>"
3. ...

## Outline skeleton (anchor pieces)
1. <beat name> — <one-line prompt>
2. <beat name> — <one-line prompt>
3. <beat name> — <one-line prompt>
4. <beat name> — <one-line prompt>
5. <beat name> — <one-line prompt>
6. <beat name> — <one-line prompt>
7. <beat name> — <one-line prompt>

## Voice openers (use or adapt)
1. "<opener 1>"
2. "<opener 2>"
3. "<opener 3>"

## Voice closers (use or adapt)
1. "<closer 1>"
2. "<closer 2>"
3. "<closer 3>"

## Modality prompt templates

### Suno (if audio/music pillar)
```
<prompt template with [GENRE], [MOOD], [LYRIC_HOOK], [DURATION] placeholder fields>
```

### Nano Banana (image)
```
<prompt template with [SUBJECT], [COMPOSITION], [STYLE_ANCHOR], [PALETTE] placeholders>
```

### Veo (video)
```
<prompt template with [SCENE], [PACING], [TONE], [CAMERA_LANGUAGE] placeholders>
```

### Claude (text draft)
```
<prompt template loaded with voice samples from Profile, pillar thesis, outline skeleton, [TOPIC] and [ANGLE] placeholders>
```

### ElevenLabs (voice-over, if applicable)
```
<prompt template with [VOICE_MODEL_ID], [PACING], [EMPHASIS_MARKS], [SCRIPT] placeholders>
```

## Executor handover (if <exec-name> specified)
<how the executor uses this system; which gates they own; when they escalate to <person>; voice-check protocol; attestation routing per piece type>

## Quality bar
- **Voice check**: does it sound like <person>? Gate at voice samples <IDs from Profile>.
- **Pillar alignment**: does it advance <framework>? If no, kill the piece.
- **Attestation**: stamp via <commands> per modality. No un-stamped pieces ship from this system.

## Attestation routing
- Text → `/sip-attest <path>`
- Audio → `/sip-attest-audio <path> --tool <tool> [--canon <canon>]`
- Image → `/sip-attest-image <path> --tool <tool>`
- Video → `/sip-attest-video <path> --tool <tool>`
- Multi-modal → `/sip-compose-modality <manifest>`

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (GIS alpha) · creator-is
- Generated: <ISO date>
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```

## Rules

- **Never** systemize a pillar with fewer than 3 shipped pieces. Pattern recognition needs data; systemizing on too little signal bakes in noise.
- **Voice openers/closers must pass the same voice-check gate as main content.** They appear in every piece; drift here drifts everywhere.
- **Modality templates carry the person's voice into every tool's output.** The prompt template is where voice gets cloned — not an afterthought.
- **Executor handover is optional.** Only fills if an executor is specified. A system that's only for the person themselves is still valuable — it reduces cognitive load per piece.
- **Never** replace the person's judgment with the template. Templates are scaffolds; the person (or the executor, escalating when uncertain) owns voice decisions.
- **Sovereignty preserved.** The system document is the person's. Starlight compounds via attestation only, never via ownership of the playbook.
- **Attestation is pillar-bound.** Every piece produced via this system carries attestation. If a piece skips attestation, it's not produced via this system — it's off-pipeline.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (GIS alpha) · creator-is
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
