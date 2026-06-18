# Second Brain IS Workflow

> Private Knowledge Intelligence — capture, route, distill, and retrieve sovereign knowledge across all vaults and connected repos.

Built on SIP — Starlight Intelligence Protocol v1.1.1

---

## Trigger Conditions

- "Capture this / save this to my brain"
- "What do I know about [topic]?"
- "Run a weekly review / knowledge consolidation"
- "Build a brain atlas for [domain]"
- "Find the connection between [X] and [Y]"

## Input Schema

```yaml
inputs:
  - name: capture_content
    type: string
    required: false
    description: "Raw content to capture — idea, quote, insight, link, transcript excerpt, or observation."
  - name: retrieval_query
    type: string
    required: false
    description: "Natural language query for knowledge retrieval across all vaults."
  - name: mode
    type: string
    required: true
    description: "One of: capture | retrieve | weekly-review | consolidate | atlas-build | connection-find"
  - name: vault_hint
    type: string
    required: false
    description: "Suggested destination vault (strategic|technical|creative|operational|wisdom|horizon). Routes to best vault if omitted."
  - name: obsidian_sync
    type: boolean
    required: false
    description: "Whether to write the output to Obsidian vault as a wikilinked note. Defaults to false."
```

## Workflow Steps

### Step 1 — Capture Triage
**Agent:** starlight-sage  
**Skill:** memory/vault-management  
**Action:** If capture mode: classify the incoming content by type (insight|reference|decision|pattern|question|evidence). Route to the correct vault based on the Capture Discipline rules. Tag with IS context, date, and source. Check for duplicate or near-duplicate vault atoms before writing.  
**Output:** `capture-receipt.json` — classified content with vault routing decision and tags.

### Step 2 — Knowledge Retrieval
**Agent:** starlight-sage  
**Skill:** memory/knowledge-synthesis  
**Action:** If retrieve mode: execute semantic search across all six vaults plus cross-repo context (ACOS, Arcanea, AI-Ops). Return ranked results with provenance. Surface implicit connections the query didn't ask for. Apply confidence scoring — distinguish remembered vs. inferred.  
**Output:** `retrieval-results.md` — ranked results with provenance, confidence scores, and implicit connections.

### Step 3 — Connection Mapping
**Agent:** starlight-prime  
**Skill:** intelligence/pattern-recognition  
**Action:** If connection-find mode: trace the semantic thread between the two named concepts across all vault atoms. Identify bridging concepts, shared patterns, and emergent insights from the intersection. Produce a connection graph (text representation).  
**Output:** `connection-map.md` — semantic thread with bridging concepts and emergent insights.

### Step 4 — Weekly Review / Consolidation
**Agent:** starlight-sage  
**Skill:** memory/memory-consolidation  
**Action:** If weekly-review or consolidate mode: scan all vault atoms written in the review period. Identify: (a) duplicates to merge, (b) patterns appearing 3+ times to promote to named framework, (c) stale atoms to archive, (d) cross-references to strengthen. Produce consolidation report.  
**Output:** `consolidation-report.md` — merge candidates, promoted frameworks, archive list, new cross-references.

### Step 5 — Atlas Build
**Agent:** starlight-architect  
**Skill:** intelligence/systems-thinking  
**Action:** If atlas-build mode: construct a Brain Atlas for the named domain — a structured map of everything the Second Brain knows about the topic. Includes: key concepts, open questions, evidence base, named frameworks, connection threads, and knowledge gaps.  
**Output:** `brain-atlas-{domain}.md` — structured knowledge map with gap analysis.

### Step 6 — Obsidian Sync + Vault Write
**Agent:** starlight-orchestrator  
**Skill:** memory/context-preservation  
**Action:** Write capture/retrieval/atlas outputs to appropriate vault. If obsidian_sync true: invoke /curate-recall to emit wikilinked Obsidian notes from results. Update vault-registry.json with any new vault categories or promoted frameworks.  
**Output:** Vault atoms, optional Obsidian notes, vault-registry update.

## Hermes Swarm Config

Which Hermes agent profiles handle tasks in this workflow:
- Primary: hermes-secondbrain-specialist (405B — semantic retrieval, connection mapping, atlas construction, framework promotion)
- Support: hermes-secondbrain-executor (70B — capture triage, consolidation passes, vault writes, Obsidian sync)

## Output Artifacts

1. `capture-receipt.json` — Classified capture with vault routing and tags
2. `retrieval-results.md` — Ranked knowledge retrieval with provenance and implicit connections
3. `connection-map.md` — Semantic thread between concepts with bridging insights
4. `consolidation-report.md` — Weekly vault health with merges, promotions, and archives
5. `brain-atlas-{domain}.md` — Structured knowledge map with gap analysis for named domain

## Vault Routing

Which vaults get written:
- **Strategic:** Promoted frameworks, named patterns, major knowledge decisions
- **Technical:** Reference material, methodology captures, system documentation atoms
- **Creative:** Idea captures, inspiration atoms, aesthetic observations, creative connections
- **Operational:** Capture queue, pending consolidation tasks, atlas build status
- **Wisdom:** Distilled principles promoted from 3+ occurrence patterns, timeless insights
- **Horizon:** Future-oriented captures — hopes, long-arc intentions, AGI alignment observations

## Commands

| Command | Triggers | Description |
|---------|----------|-------------|
| `/capture` | "save this", "capture this", "add to my brain" | Classify and route any content to the correct vault with proper tagging and dedup check |
| `/recall` | "what do I know about", "find in my brain", "search my vault" | Semantic retrieval across all vaults with provenance, confidence, and implicit connections |
| `/curate-recall` | "make Obsidian notes", "wikilinked recall", "mirror to vault" | Retrieval with Obsidian wikilinked output — Mirror Foundation protocol |
| `/brain-consolidate` | "weekly review", "consolidate knowledge", "clean up my brain" | Full consolidation pass — merges, promotes, archives, strengthens cross-references |

---
*Built on SIP — Starlight Intelligence Protocol v1.1.1*  
*Substrate: starlightintelligence.org/protocol v1.1.1*
