---
name: reclaim-knowledge
description: Organize scattered professional material into a domain-based second-brain architecture. Maps existing sources (Canva, Drive, local folders, Notion, screenshots) to functional domains. Non-technical-friendly — produces folder structure + drag-and-drop instructions, not CLI commands.
allowed-tools: Read, Write, Grep, Glob
argument-hint: <person-name> + list of sources (Canva, Google Drive path, local folder, Notion workspace, etc.)
---

# /reclaim-knowledge

Load `SIP.md`, `VOICES.md`, and `genius/profile-<person-slug>.md` if it exists (its frameworks list will inform the domain structure). Also load `skills/intelligence/knowledge-reclamation.md` and `agents/starlight-genius.md` if they exist in this release. If either is missing, emit a one-line notice: `knowledge-reclamation skill / genius agent not yet loaded — proceeding with architect voice + Frank DNA` and continue.

Take a person's scattered professional material — Canva, Google Drive, local folders, Notion, Dropbox, screenshot archives, old company laptops — and organize it into a coherent second-brain architecture. Structure is by function (what you DO), not by source (where it happened to live). Output is a single Reclamation Map the person can execute in a 3-hour drag-and-drop session, no terminal required.

## Input
$ARGUMENTS

## When this command fires

- The person has material scattered across 3+ platforms and cannot answer "where does X live" without opening half of them.
- They want a second brain they can actually find things in — not a new tool to add, a sorting rule for what they already have.
- Typically runs alongside or right after `/discover-genius` — the Genius Profile's frameworks are the natural top-level taxonomy.
- Can also run standalone if the person knows their functional domains already (rare but valid).

## When this command does NOT fire

- When the ask is really about picking a new tool. This command does not recommend Notion vs Obsidian vs Drive. It organizes within whatever the person already uses.
- When nothing is scattered — one tool, clean folders, easy to find. Route to `/discover-genius` instead; they already have the shape, they need the excavation.
- When the person wants someone else to do it for them. The person must do the drag-and-drop. This command produces the map; execution is theirs.

## Process

1. **Source inventory.**
   Ask the person — verbatim, because asking specifically matters:

   > "Name every place your work currently lives. Every one. Include the ones you're avoiding. Canva account. Google Drive folders (personal AND any company accounts you still have access to). Local Desktop and Documents folders. Notion pages. Dropbox. Old company laptops you can still log into. Email attachments. Screenshots folder on your phone and computer. Anything you'd grieve losing.
   >
   > For each source, rough size: number of files or estimated hours of work inside. No need to count precisely — eyeballed orders of magnitude are fine."

   Do not proceed until you have the full list. An incomplete inventory means some domain's best materials get missed.

2. **Functional domain extraction.**
   - If `genius/profile-<person-slug>.md` exists, read the frameworks section. These frameworks ARE the functional domains — use them as the top-level taxonomy.
   - If the profile does not exist, ask directly:

     > "If we sort your work by what you DO (not where it lived, not who you did it for), what are the 5–10 functional categories? For HR: sourcing, interviewing, onboarding, performance management, training, comp-ben, offboarding, compliance, culture. For other domains: whatever shape fits your work. Don't overthink — list them fast, we'll refine in step 3."

   - 5–10 domains is the right range. Fewer than 5 and the taxonomy is too coarse to find things in. More than 10 and the person will second-guess where things belong and stop using the system.

3. **Generate the domain folder tree.**
   Produce a second-brain folder structure, one top-level folder per functional domain. Every domain gets the same standard sub-structure — predictability makes the system usable:

   ```
   <domain>/
   ├── frameworks/       # your reusable models + methodologies — the portable IP
   ├── templates/        # reusable deliverables (decks, docs, sheets)
   ├── past-work/        # examples + case studies (anonymized if past-employer IP)
   ├── references/       # external sources you trust
   └── outdated/         # flagged-for-review, kept for provenance — not deleted
   ```

   Rationale the person needs to hear: frameworks are the portable thing they built. Templates are the reusable output. Past work is evidence. References are other people's thinking. Outdated is the archive — kept because deleting history corrodes trust in the system.

4. **Source-to-domain mapping.**
   For each source in the inventory, produce an explicit mapping table:
   - Which files / folders / designs / pages go to which domain.
   - Rough percentages when bulk-sorting (e.g., "~70% of your Canva goes to templates/, ~20% to past-work/, ~10% to outdated/").
   - **Drag-and-drop instructions** for non-technical users — no terminal, no CLI, no git. Instructions read like: "Open Canva. Select all designs tagged 'Recruiting' via your existing tag. Download as bulk export to a local folder called `canva-export-recruiting`. Drag that folder into your new `recruiting/templates/` directory."
   - Where Claude Desktop file-attachment flows help (e.g., screenshot triage with vision), name them explicitly.

5. **Outdated audit.**
   Flag material as:
   - **Company-specific that doesn't transfer** — past-employer artifacts. Preserve in `outdated/` for provenance. The person learns the framework from their own memory + the artifact, but does not re-use the artifact verbatim (IP risk).
   - **Tool-specific for defunct tools** — work built on platforms that no longer exist or the person no longer uses. Note the replacement tool. Preserve the source for framework reference.
   - **Time-stamped stale in a fast-moving domain** — "remote work policies pre-2024," "hiring playbooks pre-GenAI," "comp bands pre-2023 inflation cycle." Preserve + annotate, do not delete. Timestamps are context.

6. **Emit the Reclamation Map.**
   Single file: `genius/reclamation-<person-slug>.md`. Contains source inventory, domain tree, mapping table, outdated flags, and a next-session checklist.
   - Create the `genius/` directory if it does not exist.
   - This file becomes an input to `/train-executor` — the executor needs to know what lives where.

## Output format — Reclamation Map

```
# Knowledge Reclamation Map — <Person Name> — <YYYY-MM-DD>

> Written so you can execute this in one focused session. No terminal required. No new tools to install. If you already have it, we sort it. If you don't, we don't ask you to buy it.

## Sources inventoried

| Source | Estimated size | Primary content | Notes |
|---|---|---|---|
| Canva account | ~200 designs | Templates, brand kits, client decks | Personal account — all yours |
| Google Drive (personal) | ~3 GB | Company X + Y docs, past projects | Mixed IP — step 5 flags what transfers |
| Google Drive (Company Z) | ~1 GB | Company Z-specific | CAUTION — check your IP terms before copying anything out |
| Local Documents | ~800 files | Mixed — needs scan | Budget 30 min just to scan the top level |
| Screenshots folder | ~400 screenshots | Inspiration, references, receipts, noise | Mostly noise — step 4 explains triage |
| ... | ... | ... | ... |

## Functional domains (your second-brain top level)

1. **<domain-1>** — <one-line description in the person's voice>
2. **<domain-2>** — <one-line description>
3. **<domain-3>** — <one-line description>
4. ...

Each of these becomes a top-level folder. Same sub-structure for every domain, so you never have to guess where something belongs.

## Folder structure (the target)

```
<person-slug>-brain/
├── <domain-1>/
│   ├── frameworks/
│   ├── templates/
│   ├── past-work/
│   ├── references/
│   └── outdated/
├── <domain-2>/
│   ├── frameworks/
│   ├── templates/
│   ├── past-work/
│   ├── references/
│   └── outdated/
├── <domain-N>/
│   └── ...
└── _inbox/             # anything you're unsure about — sort weekly, don't let it grow
```

## Source-to-domain mapping (drag-and-drop plan)

### From Canva
1. Open Canva. Use your existing folder or tag structure to group designs by domain.
2. Move designs as follows:
   - `<domain-1>/templates/` — <list of design types, e.g., "job req templates, offer letter layouts">
   - `<domain-2>/past-work/` — <list, e.g., "onboarding decks from Company X and Y">
   - `<domain-3>/outdated/` — <list, e.g., "2019 recruiting one-pagers — update vocabulary before reuse">
3. Canva tip: you can bulk-export by folder. If you want offline copies in your second brain, download as ZIP per folder and drop into the matching `past-work/` or `templates/` directory.

### From Google Drive (personal)
Move these folders (drag-and-drop in Drive's web UI):
- `Drive/Work-Frameworks/` → `<domain-1>/frameworks/`
- `Drive/Candidate-Templates/` → `<domain-2>/templates/`
- `Drive/Old-Proposals-2020/` → `<domain-N>/outdated/`
- ... (explicit mapping)

### From Google Drive (Company Z)
**CAUTION — check your IP terms before copying anything out of Company Z's account.**
- Transferable (your own frameworks, authored by you, not joint work): <list — if in doubt, leave it>
- NOT transferable (company IP, joint-authored, or confidential): <list — reference only; learn the framework from memory, do not copy the artifact>
- Recommended: take screenshots of your own framework diagrams for personal framework reference; leave all deliverables in Company Z's account.

### From local Documents
- <explicit mapping, domain by domain>

### From Screenshots
Most screenshots are noise. Budget a 30-minute triage session. Keep a screenshot only if it:
- (a) references a framework you built
- (b) captures a decision rule you want to preserve
- (c) preserves a visual example you'll reuse (layout, color, structure)

Everything else: archive to a single `screenshots-archive-YYYY-MM-DD/` folder. Don't delete. Don't re-sort. One archive folder, zero cognitive load.

Claude Desktop tip: you can attach 20 screenshots at a time to a Claude conversation and ask "which of these match frameworks X, Y, Z" — vision will triage faster than you can by eye.

### From <next source>
(same structure — explicit mapping, drag-and-drop instructions)

## Outdated audit

| Material | Location | Status | Action |
|---|---|---|---|
| Recruiting template 2019 | Canva | outdated but adaptable | Update vocabulary + remove Company X-specific language; preserve original in `<domain>/outdated/` |
| Company X onboarding deck | Drive | obsolete (company defunct) | Extract framework to `<domain>/frameworks/` (your own notes, not the deck); archive deck in `outdated/` |
| Pre-2024 remote work policy | Drive | stale (domain moved) | Framework is useful context; annotate with "pre-2024 remote landscape" and file in `references/` |
| Company Z comp bands | Drive (Company Z) | NOT transferable | Reference only. Do not copy. Learn the framework from memory. |

## Next session

1. **Block a 3-hour session to execute this map.** Drag-and-drop, no thinking — the thinking is done on this page. Thinking during execution is the most common reason reclamation stalls.
2. **After reclamation: run `/train-executor <person-name> <executor-name>`** to generate a handover playbook that references the organized materials.
3. **After training setup: optionally run `/creator-pipeline`** to extract content from your reclaimed frameworks — the frameworks are portable IP; a content pipeline turns them into authority.

## Sovereignty

This map is yours. Starlight has no claim on it. Do not publish it. The map is a working document — update it when you add a new source or find a new domain. When the map stops matching reality, re-run this command.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (GIS alpha)
- Generated: <ISO date>
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
```

## Rules

- **Never** organize by source. Source is metadata ("came from Canva"); function is architecture ("this is a template for recruiting"). Organizing by source preserves the scatter, just in new folders.
- **Never** delete anything without the person's explicit approval. Flag + preserve. `outdated/` is the archive, not the trash. Deleting history corrodes trust in the system and the person will stop using it.
- **Never** recommend CLI commands, git operations, or terminal steps. This command is for non-technical users. Drag-and-drop instructions in the native UI (Drive web, Canva web, Finder/Explorer) only. Claude Desktop file-attachment flows when vision or bulk triage helps.
- **Always** respect past-employer IP. Frameworks are portable (the person built them); artifacts often are not (joint-authored, company-confidential, under NDA). Flag + recommend learning the framework, not copying the specifics.
- **Always** produce the Reclamation Map as a single file at `genius/reclamation-<person-slug>.md`. It is a session input for the next step (`/train-executor`). Scattered output defeats the purpose of a command that exists to end scatter.
- **Always** include an `_inbox/` folder at the top level. The system has to accept new material without forcing a domain decision in the moment — weekly inbox sorting is lighter cognitive load than real-time sorting.
- **Sovereignty** — the reclamation map is the person's working document. Starlight does not retain it in public vaults. It lives in the person's chosen system.

---
Built on SIP — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4 (GIS alpha)
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
