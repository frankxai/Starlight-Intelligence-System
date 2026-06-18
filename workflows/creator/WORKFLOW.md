# Creator IS Workflow

> Media & Influence Intelligence — pipeline content from frameworks through production to distribution with compounding leverage.

Built on SIP — Starlight Intelligence Protocol v1.1.1

---

## Trigger Conditions

- "Build my content pipeline / editorial calendar"
- "Turn this idea into content"
- "Run my creator review — what's performing?"
- "Script / outline / produce this piece"
- "Grow my audience on [platform]"

## Input Schema

```yaml
inputs:
  - name: content_seed
    type: string
    required: false
    description: "Raw idea, framework, or topic to develop into content."
  - name: platform_targets
    type: array
    required: false
    description: "Target platforms (youtube|twitter|linkedin|podcast|newsletter|substack)."
  - name: mode
    type: string
    required: true
    description: "One of: pipeline-build | idea-to-content | performance-review | audience-growth | brand-voice-audit"
  - name: existing_frameworks
    type: object
    required: false
    description: "Named frameworks from the genius profile to draw from in content."
  - name: output_format
    type: string
    required: false
    description: "Desired output type (script|outline|tweet-thread|newsletter|video-brief). Defaults to outline."
```

## Workflow Steps

### Step 1 — Creator Context Load
**Agent:** starlight-sage  
**Skill:** memory/vault-management  
**Action:** Load active content pillars, editorial calendar, top-performing content patterns, brand voice definition, and audience intelligence from creative-vault and strategic-vault. Pull genius frameworks from Self IS strategic-vault. Reconstruct pipeline state from operational-vault.  
**Output:** `creator-context.json` — pillars, voice, pipeline state, performance baselines.

### Step 2 — Idea Architecture
**Agent:** starlight-weaver  
**Skill:** intelligence/pattern-recognition  
**Action:** If content seed provided: map to the strongest content pillar, identify the core tension (the thing that makes the idea worth reading), and determine the best narrative arc. Apply Frank DNA voice test — direct, technical, warm, playful. Score idea for platform-content fit.  
**Output:** `idea-architecture.md` — pillar mapping, core tension, narrative arc, platform routing.

### Step 3 — Content Production
**Agent:** starlight-weaver  
**Skill:** intelligence/strategic-reasoning  
**Action:** Execute the /creator-pipeline protocol — produce the output format requested. For scripts: hook → value delivery → call to action structure. For threads: 1 insight per tweet, rising value curve. For newsletters: lede, body, synthesis, one ask. For video briefs: visual treatment + b-roll notes.  
**Output:** `content-draft.md` — full content piece in requested format, brand-voice compliant.

### Step 4 — Performance Intelligence
**Agent:** starlight-sentinel  
**Skill:** intelligence/pattern-recognition  
**Action:** If performance-review mode: analyze prior content performance data against platform benchmarks. Identify top-performing hooks, formats, and topics. Surface the content pattern that compound attention most efficiently for this creator profile.  
**Output:** `performance-intelligence.md` — content audit with pattern analysis and compound-attention model.

### Step 5 — Distribution Architecture
**Agent:** starlight-navigator  
**Skill:** orchestration/workflow-design  
**Action:** Design distribution sequence for the content piece or the full editorial calendar. Map primary publish to atomic repurposing: long-form -> clips -> tweets -> newsletter callout -> community post. Assign platform cadence and cross-link strategy.  
**Output:** `distribution-plan.md` — publish sequence with repurposing tree and timing.

### Step 6 — Vault Write + ACOS Transmission
**Agent:** starlight-orchestrator  
**Skill:** memory/ecosystem-sync  
**Action:** Write content piece to creative-vault, performance intelligence to technical-vault, distribution plan to operational-vault. Emit transmission to ACOS channel for creator productivity sync. Attach SIP attestation to all content artifacts.  
**Output:** Vault atoms x3, ACOS transmission.

## Hermes Swarm Config

Which Hermes agent profiles handle tasks in this workflow:
- Primary: hermes-creator-specialist (405B — idea architecture, long-form content production, brand voice, audience strategy)
- Support: hermes-creator-executor (70B — repurposing, distribution planning, performance scoring, vault writes)

## Output Artifacts

1. `idea-architecture.md` — Pillar mapping, core tension, narrative arc, platform routing
2. `content-draft.md` — Full content piece (script|outline|thread|newsletter) brand-voice compliant
3. `performance-intelligence.md` — Content audit with compound-attention pattern analysis
4. `distribution-plan.md` — Publish sequence with atomic repurposing tree and timing
5. `editorial-calendar.md` — 4-week forward content plan across all platforms and pillars

## Vault Routing

Which vaults get written:
- **Creative:** Content drafts, idea bank, brand voice atoms, successful hooks, narrative frameworks
- **Strategic:** Content pillar definitions, audience intelligence, growth strategy decisions
- **Technical:** Performance data models, platform algorithm patterns, repurposing templates
- **Operational:** Editorial calendar, publish queue, distribution tasks, performance tracking

## Commands

| Command | Triggers | Description |
|---------|----------|-------------|
| `/creator-pipeline` | "content pipeline", "produce this piece", "turn idea into content" | End-to-end content production from seed idea to platform-ready draft with distribution plan |
| `/creator-review` | "creator review", "what's performing", "content audit" | Performance intelligence review — top patterns, compound-attention analysis, format recommendations |
| `/editorial-calendar` | "plan my content", "editorial calendar", "content schedule" | 4-week editorial calendar across all platforms anchored to content pillars and genius frameworks |
| `/audience-grow` | "grow my audience", "platform strategy", "reach more people" | Audience growth strategy — platform-specific tactics, community playbook, compound distribution |

---
*Built on SIP — Starlight Intelligence Protocol v1.1.1*  
*Substrate: starlightintelligence.org/protocol v1.1.1*
