# SIS Genius Claw

> Extract the user's distinctive intelligence from scattered source material. The "holy shit, it sees me" moment.

---

## Contract

```yaml
name: sis-genius-claw
version: 0.1.0
purpose: Produce a Genius Profile, Freedom Path, Recurring Frameworks, and Voice Fingerprint from 3–5 source documents or folders.
phase: 2

permissions:
  filesystem: read
  sis_vaults: read_write
  shell: none
  network: optional

inputs:
  - local_folder (markdown, txt, PDF)
  - drive_folder (Google Drive connector, optional)
  - documents (PDF, DOCX, transcript TXT)
  - notion_export (optional)
  - canva_export (optional)
  - old_strategy_docs

outputs:
  - /genius/GENIUS_PROFILE.md
  - /genius/FREEDOM_PATH.md
  - /genius/RECURRING_FRAMEWORKS.md
  - /genius/VOICE_FINGERPRINT.md

commands:
  - /discover-genius
  - /extract-frameworks
  - /classify-activities
  - /fingerprint-voice

skills:
  requires:
    - safety/permission-gate
    - safety/private-public-split
  activates:
    - intelligence/pattern-recognition
    - intelligence/systems-thinking
    - intelligence/strategic-reasoning
    - memory/knowledge-synthesis
    - memory/vault-management

mcp:
  required:
    - filesystem-mcp
    - sis-memory-mcp
    - sentinel-mcp
  optional:
    - google-drive-mcp
    - notion-mcp
    - browser-mcp

safety:
  mutation_default: false
  private_data_export: blocked
  requires_sentinel: true

agents:
  primary: starlight-weaver
  supporting:
    - starlight-sage
    - starlight-architect
    - starlight-sentinel
```

---

## What Genius Claw Does

Genius Claw reads the user's existing body of work — documents, notes, strategy files, transcripts — and extracts the patterns of distinctive intelligence that recur across all of it. The user already knows what they think. Genius Claw makes the structure of that thinking visible.

This is Phase 2's core transformation: scattered → architecture.

---

## Extraction Protocol

### Step 1: Source Intake

```
1. Accept source inputs (local folder path, Drive folder, uploaded PDFs)
2. Scan for text-extractable content
3. Estimate total content volume (word count)
4. Report: sources found, estimated processing time
5. Require explicit confirmation before proceeding
```

### Step 2: Deep Reading

```
1. Extract full text from all sources
2. Chunk into semantically coherent segments
3. Tag each chunk with: source file, date (if detectable), topic cluster
4. Build a working corpus in memory (not written to vaults yet)
```

### Step 3: Pattern Extraction

Genius Claw applies five lenses simultaneously:

| Lens | What it finds |
|------|--------------|
| **Recurring frameworks** | The 3–7 mental models the user applies in every domain |
| **Signature vocabulary** | Words, phrases, metaphors the user reaches for consistently |
| **Value commitments** | What the user always protects, never compromises |
| **Contradiction zones** | Places where the user's stated beliefs conflict with their actions |
| **Unique synthesis moves** | The specific way the user combines ideas that no one else does |

### Step 4: Activity Classification

Classifies every activity found in the source material using Keep / Delegate / Automate / Kill:

```
KEEP     → activities that only this person can do, generate flow, or are highest leverage
DELEGATE → activities someone else could do at 80%+ quality
AUTOMATE → repeatable activities that can be systematized
KILL     → activities that drain energy, produce little value, or contradict stated priorities
```

### Step 5: Voice Fingerprinting

Builds a voice fingerprint from:
- Sentence length patterns
- Punctuation habits
- Opening move patterns (how the user starts arguments)
- Closing move patterns (how the user lands points)
- Recurring metaphor families
- Tone registers (when does the user get technical vs narrative vs personal)

### Step 6: Output Generation

Writes four files and stores core insights to SIS vaults:

```
/genius/GENIUS_PROFILE.md       → The full profile: frameworks, values, contradictions
/genius/FREEDOM_PATH.md         → What leverage looks like for this specific person
/genius/RECURRING_FRAMEWORKS.md → Named, defined frameworks ready to deploy
/genius/VOICE_FINGERPRINT.md    → Voice patterns for content generation
```

Stores summaries to vaults via Memory Claw:
- Strategic vault: Freedom Path decision factors
- Creative vault: Voice Fingerprint + recurring frameworks
- Wisdom vault: Core values and principles extracted

---

## Commands

### `/discover-genius`

Full extraction run from source material.

```
Usage: /discover-genius --sources <path or drive-url> [--depth full|summary]

Produces all four output files.
Always requires explicit confirmation before writing.
Never modifies source files.
```

### `/extract-frameworks`

Extract only the Recurring Frameworks from source material.

```
Usage: /extract-frameworks --sources <path>

Produces /genius/RECURRING_FRAMEWORKS.md only.
Useful for targeted extraction without full genius run.
```

### `/classify-activities`

Run Keep / Delegate / Automate / Kill classification against a list of activities.

```
Usage: /classify-activities --activities <path-to-list or inline>

Produces a classified activity map.
Cross-references against Genius Profile if it exists.
```

### `/fingerprint-voice`

Extract voice fingerprint only.

```
Usage: /fingerprint-voice --sources <path>

Produces /genius/VOICE_FINGERPRINT.md only.
Used when updating voice fingerprint after new writing.
```

---

## Output File Schemas

### GENIUS_PROFILE.md

```markdown
# Genius Profile — [User Name]
Generated: YYYY-MM-DD
Sources analyzed: [list]

## The Core Thesis
[One-paragraph synthesis of the user's distinctive intelligence]

## Recurring Frameworks
[Named frameworks with definitions — see RECURRING_FRAMEWORKS.md for full detail]

## Value Commitments
[What the user always protects]

## Contradiction Zones
[Where stated beliefs conflict with actions — non-judgmental, diagnostic]

## Unique Synthesis Moves
[The specific combinations that are genuinely distinctive]

## Keep / Delegate / Automate / Kill Map
[Activity classification summary]
```

### VOICE_FINGERPRINT.md

```markdown
# Voice Fingerprint — [User Name]
Generated: YYYY-MM-DD

## Sentence Architecture
[Length patterns, rhythm, structure]

## Opening Moves
[How arguments begin]

## Landing Moves
[How points close]

## Metaphor Families
[Recurring conceptual domains]

## Tone Registers
[Technical / narrative / personal contexts and transitions]

## Anti-patterns
[What this voice does NOT do — equally important]
```

---

## Safety

- Source files are **never modified** — read-only access only
- No source content is transmitted to external services without explicit user approval
- Sentinel Claw runs `private-public-split` before any vault write to prevent sensitive personal data from leaking into shared contexts
- All four output files are written locally first; vault storage is a secondary, optional step

---

*Built on SIP · sis-genius-claw v0.1.0 · MIT*
