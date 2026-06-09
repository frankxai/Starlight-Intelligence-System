---
name: intelligence/knowledge-reclamation
domain: intelligence
description: Organize scattered professional material into a coherent second-brain architecture sorted by domain (not by source). Powers /reclaim-knowledge and supports Genius excavation.
triggers:
  keywords: ["scattered materials", "organize my stuff", "canva google drive files", "years of work", "multiple companies", "reclaim knowledge", "organize folders", "consolidate my work"]
  agents: ["starlight-genius", "starlight-sage"]
  intents: ["reclamation", "organization", "second-brain"]
priority: high
load_level: core
---

# Knowledge Reclamation

> *"Organize by domain, not by source. Function is genius. Provenance is metadata."*

## Purpose

Most accomplished people carry a decade of professional material that was organized, if at all, by *where it came from* — Company A / Company B / Company C / employer folders, year folders, platform folders (Canva, Drive, Notion, local). That structure feels natural because it follows the life-chronology of the person. It is also the single largest obstacle to seeing their genius, because genius is not company-shaped. Genius is *function*-shaped.

Someone who did recruiting at four companies does not have "Company A / Company B / Company C / Company D" as their genius structure. They have "sourcing / interviewing / assessment / offer negotiation" as their functions. The company folders are *provenance*; the function folders are *genius*. Reclamation is the act of re-sorting source → function, preserving the provenance as metadata, so the underlying domain architecture becomes visible. Once visible, it can be compounded, taught, packaged, or delegated. Until visible, it just weighs the person down.

This skill is the organizational partner to `genius-excavation`. Where excavation extracts *patterns*, reclamation extracts *structure*. They run in parallel on the same corpus.

## Activation

**Fires when:**
- `/reclaim-knowledge` is invoked
- User describes material scattered across multiple sources, employers, platforms, or years
- User says they feel overwhelmed by their own files
- Genius Profile has been produced and the user is ready to re-sort their corpus against the named functions

**Does NOT fire when:**
- User has a single-source archive already well-organized
- Request is for ad-hoc organization of one folder (out of scope — too small for the full protocol)
- Corpus has not yet been inventoried — request inventory first

## Protocol

### Step 1 — Inventory sources

Ask: *"Where does your material live today? List every place — Canva account, Google Drive, local Documents, external hard drive, Notion, Dropbox, old company systems you still have access to, email attachments, screenshots folder, Desktop dumping ground. Include even the places you forgot about."*

Capture a complete source inventory before proposing structure. Do not propose folders until sources are named. Provenance is preserved throughout — every file's original location becomes metadata, not a loss.

### Step 2 — Name functional domains

Ask: *"Across all this material, what are the 5–10 recurring types of work you do? Not 'at Company A' — the actual *kinds* of work. Sourcing candidates. Running workshops. Writing strategy memos. Designing onboarding. Analyzing data. Whatever they are for you."*

If the person cannot name their own functions, cross-reference the Genius Profile's framework list (if available) — the frameworks are usually downstream of the functions. If no Profile exists yet, run `genius-excavation` first or in parallel.

Test each proposed domain: does this function recur across ≥2 employers or contexts? If yes, it is a genuine domain. If no, it is an artifact of one role and probably belongs under a broader domain.

### Step 3 — Set up domain folders

One folder per function. Not per employer. Not per year. Not per platform. The target structure:

```
knowledge/
  sourcing/
  interviewing/
  assessment/
  offer-negotiation/
  workshops/
  strategy-memos/
  onboarding/
  ...
```

For non-technical users, provide a folder-tree template and drag-and-drop instructions. Do not require CLI. Example recipe for Google Drive + local combined:

1. In Google Drive, create a `Knowledge` folder at the top level.
2. Inside, create one subfolder per named function.
3. Mirror the same structure locally on Desktop or Documents.
4. Create a `_archive/` folder at the top level for anything unsorted but not yet reviewed.

### Step 4 — Sort material by function

One pass per source, 20–30 minutes each. For each file:

- Read enough to classify (title + first paragraph is usually enough).
- Move (or copy, if preserving provenance is required) to the matching function folder.
- Rename if the original filename is opaque — use a convention like `<domain>__<short-description>__<YYYY-MM>.ext`.
- Tag with original provenance in the filename or a sidecar: `.origin.txt` noting source company, year, original path.

If a file genuinely fits two functions, pick the primary and note the secondary in the filename. Do not duplicate unless storage is cheap and version drift is not a concern.

### Step 5 — Flag outdated material

Scan for signals that material is no longer load-bearing:

- References to defunct tools (old ATS, deprecated SaaS, retired platforms)
- Company-specific templates that do not transfer (branded decks, internal jargon)
- Processes rebuilt in a later employer with a better version
- Screenshots of conversations or tickets with no ongoing relevance

**Flag, do not delete.** Create a `_flagged-outdated/` folder inside each domain. The user reviews and approves deletion in a later session. Reclamation does not discard on behalf of the user — the user's relationship to their own past work is sovereign.

### Step 6 — Emit a Reclamation Map

Produce a Reclamation Map document summarizing the re-sort. Structure:

```
# Reclamation Map — <Person Name> — <YYYY-MM-DD>

## Source inventory
- Canva: <count> items, <observed-domains>
- Google Drive: <count> items, <observed-domains>
- Local: <count> items, <observed-domains>
- Notion: <count> items, <observed-domains>
- ...

## Domain folders created
1. <domain-name> — <count> items, <one-line description>
2. <domain-name> — <count> items, <one-line description>
3. ...

## Source → domain mapping
- Canva/Recruiting-Deck-2022.pdf → interviewing/recruiting-deck-2022.pdf (from Company A, 2022)
- Drive/Onboarding-Plan-v3.docx → onboarding/onboarding-plan-v3.docx (from Company B, 2023)
- ... (abbreviated; full mapping in sidecar)

## Outdated flags
- <count> items flagged as outdated, preserved in _flagged-outdated/ folders per domain
- Top reasons: <defunct-tools, company-specific, superseded>

## Next move
Run `/discover-genius` (if not already) to excavate genius patterns from the newly sorted material.
OR
Proceed to `/creator-pipeline` using the highest-signal domain as seed content.
```

Save to: `genius/reclamation-map-<slug>.md` (alongside Profile and Freedom Path).

## Rules

1. **Never organize by source (company, platform, year) as the primary axis.** Source is metadata, not structure. If the person insists on source-first organization, name that the Reclamation Map cannot proceed and hand back control — this is a sovereignty call, not a technical one.
2. **Never discard material without explicit user approval.** Flag as outdated; preserve original location; let the user approve deletion in a separate pass. Reclamation does not have discard authority.
3. **Preserve attribution.** Some material belongs to past employers' intellectual property. Honor it. Never repurpose company-confidential material for the person's public output without explicit rights review. When in doubt, mark it `_company-ip/` and exclude from downstream pipelines.
4. **Non-technical users first.** Provide folder-tree templates, drag-and-drop instructions, and platform-specific recipes (Google Drive, Notion, Dropbox, local file manager). Never require CLI, scripts, or terminal access. Non-technical-user-grade test: would this work in Claude Desktop + Cowork? If not, rewrite.
5. **One pass per source.** 20–30 minutes maximum per source per session. Fatigue corrodes judgment on classification. Break long sources across sessions — partial reclamation is still progress.
6. **The Reclamation Map is the deliverable.** Loose folders without a Map are not reclamation — they are a rearranged mess. Always produce the Map.
7. **Compose with genius-excavation.** If the Genius Profile names functions that do not match the proposed domain folders, the Profile wins — rename folders to match the functions the excavation found.

## Built on SIP

This skill composes with SIP protocol elements:
- File contract (`genius/reclamation-map-<slug>.md` sidecar)
- Attestation (Reclamation Map ships with "Built on SIP" block)
- Sovereignty clause (Rules 1 and 2 — user retains authority over discard and structure)
- Voice archetypes (`VOICES.md`) — sovereign-creator for user-facing instructions, architect for structure rationale

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (GIS alpha)
- Generated: 2026-04-24
---
