---
name: intelligence/genius-excavation
domain: intelligence
description: Excavate genius patterns from a person's scattered corpus — frameworks, vocabulary, cross-domain synthesis, voice fingerprint, and four-bucket sorting. Powers /discover-genius and the Genius agent.
triggers:
  keywords: ["discover my genius", "what am I good at", "find my edge", "scattered materials", "don't know my edge", "indispensable but trapped", "organize my knowledge", "my frameworks", "my voice"]
  agents: ["starlight-genius", "starlight-concierge"]
  intents: ["genius-excavation", "onboarding", "freedom"]
priority: high
load_level: core
---

# Genius Excavation

> *"Scattered expertise is not the same as visible genius. Reveal, don't bestow."*

## Purpose

Genius excavation is the #1 value unlock in a sovereign intelligence system because scattered expertise is the default state of every accomplished person. Years of work end up fragmented across Canva templates, Google Drive folders, local files, screenshots, past employers' IP, half-written essays, recorded meetings no one played back. The person did the work. The work proves the genius. But the genius is invisible to its owner because nothing has been read across the corpus as one thing. Excavation is the act of reading the corpus as one thing.

Sovereign freedom begins with knowing what only you can do. You cannot delegate what you cannot name. You cannot automate what you cannot see. You cannot kill what you do not know you are carrying. Until the four buckets — KEEP / DELEGATE / AUTOMATE / KILL — are populated with real activities from real corpus, freedom is a mood, not a path. This skill produces the path.

## Activation

**Fires when:**
- `/discover-genius` is invoked
- A new user arrives with a corpus and Concierge routes them to Excavation Tier
- A stuck user expresses the indispensable-but-trapped pattern ("I can't leave, they need me, but I'm losing myself")
- Keywords above appear in a session where a Genius Profile has not yet been generated

**Does NOT fire when:**
- Returning users with an established Profile — they go to downstream commands (`/creator-pipeline`, `/reclaim-knowledge`, `/train-executor`)
- Purely operational requests ("write me a post", "organize this one folder") where genius is not in question
- Session input alone is the only "corpus" offered — excavation requires material, not vibes

## Protocol

### Step 1 — Request corpus

Ask for the top 3–5 sources of their material. Do not start without corpus. Explicit prompt:

> *"Before I can excavate, I need material. What are the 3–5 places your work lives? Examples: a Canva account, a Google Drive, a local Documents folder, a Notion workspace, a folder of screenshots, past essays or posts, recorded sessions. You do not need to send all of it — just tell me where it lives and give me access to representative samples from each."*

Halt until the person names sources. Do not proceed on "just tell me what my genius is."

### Step 2 — Accept corpus

Support the following input modes (no CLI assumed):

- **Direct text paste** — person pastes content into the conversation
- **File attachment** — person drags files into Claude Desktop
- **Folder path** — for users with Cowork or local filesystem access
- **Notion AI transcript** — copy-pasted or exported
- **Screenshot** — image analysis for visible content
- **URL** — to a past post, essay, or public artifact

For each source, note provenance (which source it came from) and date if visible.

### Step 3 — Scan for repeated frameworks

Read the corpus for structural moves — models, methodologies, staged processes, recurring taxonomies. Any time the same structure appears ≥3 times across different corpus items, name it. Threshold is non-negotiable. Examples:

- A 4-stage recruiting framework (sourcing → interviewing → assessment → negotiation), observed across three employer engagements
- Frank's substrate/operational split, observed across SIP, SIS, and alliance repos
- A client's "translate the exec ask into a measurable outcome" pattern, observed across five strategy decks

Below three: anecdote, not framework. Do not name it.

### Step 4 — Scan for distinctive vocabulary

Extract 10–15 words or phrases this person uses that most others in their field do not. These are voice fingerprints. They power everything downstream (Envoy, Creator IS, Brand IS). Prioritize:

- Terms they coined or adapted
- Metaphors they return to
- Jargon from one domain they apply in another
- Phrases that appear ≥2 times across different corpus items

### Step 5 — Scan for cross-domain synthesis

Identify ≥2 fields this person blends. Name the compounding edge that results.

- Psychology × Neuroscience × HR → "physiologically-grounded org design"
- Systems architecture × Composition × Builder-operator → "protocol-first creator systems"
- Law × Journalism × AI → "adversarial editorial workflows"

The compounding edge is where the genius actually lives. Most people have never named their synthesis. Naming it is load-bearing.

### Step 6 — Voice sample

Pull 5–7 direct quotes from corpus that best capture how this person talks or writes. Real quotes, cited to source. Paraphrase is not acceptable — fingerprints must be genuine.

### Step 7 — Four-bucket sort

For every activity or task referenced in the corpus, assign exactly one bucket:

- **KEEP** — genius work; only they can do it; compounds their edge every time they do it
- **DELEGATE** — executor work; anyone trained can do it; no unique judgment required
- **AUTOMATE** — system work; AI, workflow, or template can do it; deterministic enough
- **KILL** — work that compounds nothing; historical obligation, sunk cost, or drift

Every activity gets sorted. No "maybe." No "it depends." If a task straddles, split it into sub-tasks and sort each. Empty buckets mean the sort is incomplete.

### Step 8 — Generate Profile + Freedom Path

Produce two documents. Save to:

- `genius/profile-<slug>.md`
- `genius/freedom-path-<slug>.md`

Where `<slug>` is the person's name in kebab-case. Create the `genius/` directory if it does not exist. The Profile captures what only they see. The Freedom Path captures what they do with that. See `/discover-genius` command for full output shape.

## Output Shape

Two-document structure. Profile is synthesis; Freedom Path is action. Both ship together — never one without the other. Full schema in `.claude/commands/discover-genius.md`.

## Rules

1. **Never generate a Genius Profile from session input alone.** Always request actual corpus first. Session chat is not corpus.
2. **Never skip the four-bucket sort.** Without it, the Profile is philosophy, not an action plan. Freedom is empirical.
3. **Never name a pattern that appears only once.** Threshold is ≥3 occurrences. Anecdotes are not frameworks.
4. **Voice samples must be REAL quotes from the corpus.** Paraphrases corrode the fingerprint. If the quote was not written or said by the person, it is not a voice sample.
5. **Halt if the person says "just tell me what my genius is" without providing corpus.** Genius excavation is empirical, not oracular. Revealing is not bestowing.
6. **Sovereignty is non-waivable.** The person owns their genius; this skill reveals it, does not transfer it. Starlight does not retain personal-genius data in public vaults — it lives in the person's instance only.
7. **No generic personal-brand language.** If the Profile reads like it could apply to any consultant, it failed. Specificity is the test.
8. **One next move at handoff.** Name exactly one downstream command. Optionality at this step corrodes the freedom the Path was supposed to deliver.

## Built on SIP

This skill composes with SIP protocol elements:
- Sovereignty clause (non-waivable, enforced at Rule 6)
- File contract (`genius/` namespace, `profile-<slug>.md` and `freedom-path-<slug>.md`)
- Attestation (every Profile and Freedom Path ships with "Built on SIP" block)
- Voice archetypes (`VOICES.md`) — sovereign-creator primary, overseer synthesis

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty, archetype]
- Verticals: starlight-intelligence-system@v7.4 (GIS alpha)
- Generated: 2026-04-24
---
