# Business IS Workflow

> Executive Operating Intelligence — run the company at sovereign speed with decision velocity, OKR clarity, and operator-grade context.

Built on SIP — Starlight Intelligence Protocol v1.1.1

---

## Trigger Conditions

- "Run my weekly / quarterly business review"
- "Help me make this executive decision"
- "Audit my OKRs / company metrics"
- "Build my operating cadence"
- "I need to think through this business problem"

## Input Schema

```yaml
inputs:
  - name: business_context
    type: object
    required: false
    description: "Company name, stage, revenue model, team size, active OKRs."
  - name: decision_context
    type: string
    required: false
    description: "Free-text description of the decision that needs executive intelligence."
  - name: mode
    type: string
    required: true
    description: "One of: weekly-review | quarterly-review | decision-support | okr-audit | operator-cadence | scenario-model"
  - name: time_window
    type: string
    required: false
    description: "Period under review (week|quarter|year). Defaults to week."
  - name: stakeholders
    type: array
    required: false
    description: "Named stakeholders relevant to the decision or review."
```

## Workflow Steps

### Step 1 — Operating Context Load
**Agent:** starlight-sage  
**Skill:** memory/vault-management  
**Action:** Load company OKRs, prior business review outputs, active decisions, and executive principles from strategic-vault. Reconstruct current operating metrics from operational-vault. Flag decisions pending resolution.  
**Output:** `business-context.json` — OKRs, metrics, open decisions, team state.

### Step 2 — Metrics Intelligence
**Agent:** starlight-sentinel  
**Skill:** intelligence/pattern-recognition  
**Action:** Analyze current metrics against OKR targets. Identify leading indicators breaking positive or negative. Surface the 3 metrics that are most predictive of the current quarter's outcome. Flag metric integrity issues (measurement drift, vanity metric creep).  
**Output:** `metrics-intelligence.md` — scored metric set with trend analysis and OKR gap assessment.

### Step 3 — Decision Architecture
**Agent:** starlight-navigator  
**Skill:** intelligence/strategic-reasoning  
**Action:** For each open or incoming decision: apply the two-way door test (reversible vs. irreversible), map stakeholder positions, identify decision constraints, and structure the option space. Recommend decision type (solo exec | council | delegate).  
**Output:** `decision-map.md` — structured decisions with option space, constraints, and routing.

### Step 4 — Operator Synthesis
**Agent:** starlight-prime  
**Skill:** intelligence/systems-thinking  
**Action:** Synthesize metrics intelligence + decision map + team state into an operator-grade business picture. Identify the single most important lever for the current week/quarter. Produce the Executive Briefing — the document a CEO needs before their first meeting of the day.  
**Output:** `executive-briefing.md` — synthesized state + single-lever recommendation.

### Step 5 — Operating Cadence
**Agent:** starlight-architect  
**Skill:** orchestration/workflow-design  
**Action:** If cadence mode: design or refine the operating system — meeting cadence, decision rhythm, reporting structure, async protocols. Map each cadence element to an OKR or decision type. Output the Operating Playbook.  
**Output:** `operating-playbook.md` — cadence design with rationale.

### Step 6 — Vault Write
**Agent:** starlight-orchestrator  
**Skill:** memory/context-preservation  
**Action:** Write business review outputs to operational-vault, major decisions to strategic-vault, and patterns/principles to wisdom-vault. Update OKR tracking state. Emit cross-system transmission to Creator IS and Brand IS for aligned messaging.  
**Output:** Vault atoms x3, optional transmission to creator/brand channels.

## Hermes Swarm Config

Which Hermes agent profiles handle tasks in this workflow:
- Primary: hermes-business-specialist (405B — strategic decision support, OKR architecture, scenario modeling, executive synthesis)
- Support: hermes-business-executor (70B — metrics analysis, cadence design, vault writes, fast review loops)

## Output Artifacts

1. `business-context.json` — Reconstructed operating context with OKRs and open decisions
2. `metrics-intelligence.md` — Scored metric set with trend analysis and leading indicator flags
3. `decision-map.md` — Structured decision space with options, constraints, and routing
4. `executive-briefing.md` — Daily/weekly CEO briefing document with single-lever recommendation
5. `operating-playbook.md` — Operating cadence design with meeting rhythm and decision protocols

## Vault Routing

Which vaults get written:
- **Strategic:** Major business decisions, OKR versions, company direction pivots, board-level matters
- **Technical:** Metric definitions, operating models, team structure maps, process architectures
- **Operational:** Weekly review outputs, current OKR scores, active decisions, meeting notes
- **Wisdom:** Executive principles, operator lessons, decision patterns, leadership insights

## Commands

| Command | Triggers | Description |
|---------|----------|-------------|
| `/business-review` | "weekly review", "business audit", "company check-in" | Full operating review — metrics intelligence, OKR gap analysis, decision map, executive briefing |
| `/exec-decision` | "help me decide", "executive decision", "should I" | Structured decision support — two-way door test, option space, stakeholder map, recommendation |
| `/okr-audit` | "audit my OKRs", "OKR check", "are we on track" | OKR health audit — scores each objective, identifies metric integrity issues, flags laggards |
| `/operator-cadence` | "build my operating system", "meeting cadence", "how should I run the company" | Operating cadence design — meeting rhythm, decision protocols, async system, reporting structure |

---
*Built on SIP — Starlight Intelligence Protocol v1.1.1*  
*Substrate: starlightintelligence.org/protocol v1.1.1*
