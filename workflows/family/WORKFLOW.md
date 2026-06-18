# Family IS Workflow

> Family Office Intelligence — sovereign family coordination, legacy architecture, and multi-generational wealth stewardship.

Built on SIP — Starlight Intelligence Protocol v1.1.1

---

## Trigger Conditions

- "Run a family office review / family council"
- "Help me structure our estate / legacy planning"
- "Track family commitments and obligations"
- "Coordinate family capital and shared resources"
- "Design a family governance structure"

## Input Schema

```yaml
inputs:
  - name: family_context
    type: object
    required: false
    description: "Family members, roles, ages, relationships, and known obligations."
  - name: mode
    type: string
    required: true
    description: "One of: office-review | legacy-planning | commitment-tracking | capital-coordination | governance-design"
  - name: time_horizon
    type: string
    required: false
    description: "Planning horizon (annual|decade|generational). Defaults to annual."
  - name: privacy_level
    type: string
    required: false
    description: "Data sensitivity flag (high|sovereign). Defaults to sovereign — nothing leaves local vault."
```

## Workflow Steps

### Step 1 — Family Intelligence Load
**Agent:** starlight-sage  
**Skill:** memory/vault-management  
**Action:** Load family structure, active commitments, legacy intentions, and prior governance decisions from strategic-vault. This data is sovereign-class — never transmitted, never externalized. Reconstruct current family capital picture from technical-vault.  
**Output:** `family-context.json` — structure, commitments, capital, governance state.

### Step 2 — Commitment Architecture
**Agent:** starlight-navigator  
**Skill:** intelligence/systems-thinking  
**Action:** Map all active family commitments (financial obligations, time commitments, care responsibilities) against available resources. Identify conflicts, gaps, and over-commitments. Prioritize by urgency and relational weight.  
**Output:** `commitment-map.md` — full obligation inventory with priority tiers and conflict flags.

### Step 3 — Legacy Architecture Review
**Agent:** starlight-architect  
**Skill:** intelligence/strategic-reasoning  
**Action:** Evaluate estate structure, trust vehicles, insurance architecture, and succession intentions against current family state. Flag outdated structures. Propose adjustments for life stage changes.  
**Output:** `legacy-architecture.md` — current structure assessment with gap analysis.

### Step 4 — Family Capital Coordination
**Agent:** starlight-prime  
**Skill:** business/entity-architecture  
**Action:** Synthesize family capital flows — income streams, shared expenses, investment allocations, inter-family transfers. Produce a consolidated family financial picture. Cross-reference against Wealth IS DPI ledger for personal capital vs. family capital clarity.  
**Output:** `family-capital-map.md` — consolidated capital picture with allocation recommendations.

### Step 5 — Governance Design or Review
**Agent:** starlight-weaver  
**Skill:** intelligence/strategic-reasoning  
**Action:** If governance-design mode: architect a Family Constitution skeleton — values, decision rights, conflict resolution protocols, meeting cadence, legacy mandates. If review mode: score current governance against operating quality criteria.  
**Output:** `family-constitution-draft.md` or `governance-scorecard.md`

### Step 6 — Vault Write (Sovereign)
**Agent:** starlight-orchestrator  
**Skill:** memory/context-preservation  
**Action:** Write all outputs to vaults with sovereign privacy flag. No cross-system transmission for family data. Strategic-vault for governance and legacy. Technical-vault for capital structures. Operational-vault for commitment tracking.  
**Output:** Vault atoms x3 (sovereign-flagged), no external transmission.

## Hermes Swarm Config

Which Hermes agent profiles handle tasks in this workflow:
- Primary: hermes-family-specialist (405B — legacy architecture, governance design, complex multi-generational modeling)
- Support: hermes-family-executor (70B — commitment tracking, capital math, vault writes, fast coordination tasks)

## Output Artifacts

1. `family-context.json` — Sovereign family intelligence snapshot (vault-only, never transmitted)
2. `commitment-map.md` — Full obligation inventory with priority tiers and conflict flags
3. `legacy-architecture.md` — Estate and succession structure with gap analysis
4. `family-capital-map.md` — Consolidated family capital picture and flow analysis
5. `family-constitution-draft.md` — Governance skeleton with values, decision rights, and protocols

## Vault Routing

Which vaults get written:
- **Strategic:** Family governance decisions, legacy intentions, constitution versions, succession plans
- **Technical:** Estate structures, trust architectures, capital vehicle analysis, legal entity map
- **Operational:** Active commitments, scheduled obligations, family meeting notes, coordination tasks
- **Wisdom:** Multi-generational principles, relational insights, family culture atoms

## Commands

| Command | Triggers | Description |
|---------|----------|-------------|
| `/family-council` | "family council", "run a family meeting", "family review" | Structured family office review — commitment map, capital picture, governance check |
| `/legacy-plan` | "estate planning", "legacy structure", "succession plan" | Full legacy architecture review and gap analysis across estate, trusts, and succession |
| `/family-capital` | "family finances", "coordinate family money", "shared resources" | Family capital coordination — maps flows, flags conflicts, reconciles personal vs. family capital |
| `/family-governance` | "family constitution", "decision rights", "governance design" | Designs or reviews Family Constitution — values, decision protocols, conflict resolution |

---
*Built on SIP — Starlight Intelligence Protocol v1.1.1*  
*Substrate: starlightintelligence.org/protocol v1.1.1*
