# Brand IS Workflow

> Reputation & Positioning Intelligence — architect a sovereign brand that compounds trust, commands premium positioning, and converts perception into opportunity.

Built on SIP — Starlight Intelligence Protocol v1.1.1

---

## Trigger Conditions

- "Audit my brand / positioning / reputation"
- "How should I position [product or person]?"
- "Build or review my brand architecture"
- "What is my brand saying to the market?"
- "Run a competitive positioning analysis"

## Input Schema

```yaml
inputs:
  - name: brand_subject
    type: string
    required: true
    description: "The brand under analysis: personal name, product name, or company name."
  - name: competitor_set
    type: array
    required: false
    description: "Named competitors or comparable brands to evaluate against."
  - name: mode
    type: string
    required: true
    description: "One of: brand-audit | positioning-design | architecture-review | competitive-analysis | reputation-track | voice-calibration"
  - name: target_audience
    type: object
    required: false
    description: "ICP definition: who the brand must resonate with (role, stage, pain, aspiration)."
  - name: channels
    type: array
    required: false
    description: "Active brand channels to include in audit (website|twitter|linkedin|youtube|podcast|email)."
```

## Workflow Steps

### Step 1 — Brand Intelligence Load
**Agent:** starlight-sage  
**Skill:** memory/vault-management  
**Action:** Load brand architecture, positioning statements, voice definition, and prior brand decisions from strategic-vault. Pull current reputation signals — engagement metrics, inbound quality, search footprint — from technical-vault. Load competitive landscape atoms from any prior research.  
**Output:** `brand-context.json` — architecture, positioning, voice, reputation signals, competitive map.

### Step 2 — Positioning Intelligence
**Agent:** starlight-navigator  
**Skill:** intelligence/strategic-reasoning  
**Action:** Evaluate current positioning against three axes: Category (what game are you playing?), Differentiation (why you vs. alternatives?), and Audience Resonance (does the right person feel seen?). Identify positioning drift, gaps, and premium opportunity. Score positioning strength on each axis.  
**Output:** `positioning-scorecard.md` — three-axis evaluation with scores and gap analysis.

### Step 3 — Competitive Analysis
**Agent:** starlight-sentinel  
**Skill:** intelligence/pattern-recognition  
**Action:** If competitor set provided: map each competitor's positioning, voice, audience, and perceived premium. Identify white space — positions they don't own. Surface the unique intersection only this brand can credibly claim. Flag commoditization risk.  
**Output:** `competitive-map.md` — competitor positioning matrix with white space analysis.

### Step 4 — Brand Architecture Design
**Agent:** starlight-architect  
**Skill:** intelligence/systems-thinking  
**Action:** Design or review the brand architecture — brand pyramid (values → personality → positioning → promise), voice attributes (with channel adaptations), visual system brief, and messaging hierarchy. Ensure consistency with Creator IS voice definition and Self IS genius profile.  
**Output:** `brand-architecture.md` — full brand pyramid, voice attributes, messaging hierarchy.

### Step 5 — Reputation Track
**Agent:** starlight-prime  
**Skill:** intelligence/strategic-reasoning  
**Action:** If reputation-track mode: synthesize reputation signals across channels into a Brand Health Score. Identify: inbound quality shift, audience sentiment direction, share of conversation, and trust compounding velocity. Flag reputation risks. Produce the Brand Intelligence Brief.  
**Output:** `brand-intelligence-brief.md` — health score, trend analysis, risk flags, trust velocity.

### Step 6 — Vault Write + Brand Sync
**Agent:** starlight-orchestrator  
**Skill:** memory/ecosystem-sync  
**Action:** Write positioning decisions to strategic-vault, architecture to technical-vault, reputation state to operational-vault. Emit transmission to Creator IS (voice alignment) and Business IS (positioning alignment for sales/BD). Attach SIP attestation.  
**Output:** Vault atoms x3, Creator IS and Business IS transmissions.

## Hermes Swarm Config

Which Hermes agent profiles handle tasks in this workflow:
- Primary: hermes-brand-specialist (405B — positioning design, brand architecture, competitive strategy, reputation intelligence)
- Support: hermes-brand-executor (70B — competitive mapping, reputation tracking, vault writes, channel audits)

## Output Artifacts

1. `brand-context.json` — Architecture, positioning, voice, reputation signals, competitive landscape
2. `positioning-scorecard.md` — Three-axis positioning evaluation with gap analysis
3. `competitive-map.md` — Competitor matrix with white space analysis and differentiation opportunities
4. `brand-architecture.md` — Full brand pyramid, voice attributes, and messaging hierarchy
5. `brand-intelligence-brief.md` — Brand health score with trust velocity and reputation risk flags

## Vault Routing

Which vaults get written:
- **Strategic:** Brand positioning decisions, architecture versions, competitive moves, reputation pivots
- **Technical:** Competitive analysis models, brand measurement frameworks, voice calibration guides
- **Operational:** Current brand health scores, active reputation signals, channel performance, risk flags
- **Wisdom:** Brand principles, positioning insights, trust-building patterns, premium positioning lessons

## Commands

| Command | Triggers | Description |
|---------|----------|-------------|
| `/brand-audit` | "audit my brand", "brand check", "how am I positioned" | Full brand audit — positioning scorecard, reputation signals, voice calibration, competitive gaps |
| `/brand-position` | "position this", "redesign my positioning", "what should I stand for" | Positioning design — category definition, differentiation architecture, audience resonance scoring |
| `/competitive-map` | "competitive analysis", "how do I compare", "what's the white space" | Competitive positioning matrix with white space identification and differentiation strategy |
| `/brand-architecture` | "build my brand", "brand pyramid", "brand system" | Full brand architecture design — values, personality, positioning, voice, messaging hierarchy |

---
*Built on SIP — Starlight Intelligence Protocol v1.1.1*  
*Substrate: starlightintelligence.org/protocol v1.1.1*
