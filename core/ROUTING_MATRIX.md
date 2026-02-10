# Starlight Routing Matrix

> The dispatcher. Every request finds its right handler through intent analysis, keyword matching, and complexity scoring.

---

## Primary Routing

```
ANALYZE REQUEST
│
├── design / architect / system / scale / infrastructure
│   → ARCHITECT  (Technical Vault)
│
├── coordinate / manage / workflow / parallel / orchestrate
│   → ORCHESTRATOR  (Operational Vault)
│
├── review / audit / check / security / quality / validate
│   → SENTINEL  (Technical Vault)
│
├── explain / teach / learn / why / understand / wisdom
│   → SAGE  (Wisdom Vault)
│
├── create / write / compose / generate / draft / imagine
│   → WEAVER  (Creative Vault)
│
├── strategy / future / plan / navigate / position / roadmap
│   → NAVIGATOR  (Strategic Vault)
│
├── hope / values / alignment / future generations / benevolence
│   → SAGE  (Horizon Vault, read-only)
│
├── remember / vault / store / recall / memory
│   → VAULT MANAGEMENT SKILL  (target vault from context)
│
├── transmit / sync / broadcast / update
│   → TRANSMISSION PROTOCOL SKILL  (target channel from context)
│
├── council / all perspectives / major decision
│   → PRIME (Council Mode)  — all relevant agents, parallel
│
├── multiple domains detected
│   → PRIME (Multi-Agent) — selected by domain overlap
│
└── unclear intent
    → Clarify: building (Architect), creating (Weaver),
      planning (Navigator), learning (Sage), or reviewing (Sentinel)?
```

---

## Cross-System Routing

```
ACOS / creator / commands / skills
  → ACOS Channel + repo-bridge skill + acos-context.md

Arcanea / creative / Luminors / world-building
  → Arcanea Channel + repo-bridge skill + arcanea-context.md

AI-Ops / infrastructure / gateway / memory systems
  → AI-Ops Channel + repo-bridge skill + ai-ops-context.md

Multiple repos
  → Prime coordinates, all relevant channels, unified context
```

---

## Skill Auto-Activation

Skills activate automatically based on context. Full ruleset in `skills/skill-rules.json`.

| Trigger | Skill | Category |
|---------|-------|----------|
| Architecture discussion | systems-thinking | Intelligence |
| Decision needed | decision-framework | Intelligence |
| Pattern matching | pattern-recognition | Intelligence |
| Strategy work | strategic-reasoning | Intelligence |
| Multi-agent task | multi-agent-coordination | Orchestration |
| Workflow creation | workflow-design | Orchestration |
| Context management | context-engineering | Orchestration |
| Parallel execution | parallel-execution | Orchestration |
| Vault operations | vault-management | Memory |
| Knowledge work | knowledge-synthesis | Memory |
| Context saving | context-preservation | Memory |
| Memory optimization | memory-consolidation | Memory |
| Cross-repo work | repo-bridge | Integration |
| System sync | ecosystem-sync | Integration |
| Cross-system comms | transmission-protocol | Integration |
| External connections | universal-adapter | Integration |

---

## Priority and Escalation

| Priority | Criteria | Response |
|----------|----------|----------|
| P0 | System-breaking, data loss risk | Immediate, all resources |
| P1 | Strategic decisions, deadlines | Fast routing, leadership agents |
| P2 | Standard requests | Normal routing |
| P3 | Exploratory, learning | Efficient routing, minimal agents |

### Escalation

```
Level 1: Single agent
  ↓
Level 2: Add supporting agent
  ↓
Level 3: Partial council (2-3 agents)
  ↓
Level 4: Full council with Prime
  ↓
Level 5: Flag for human decision with full context
```

---

## Routing Feedback

After each interaction:

```
1. Was the selected agent the best choice?
   YES → Reinforce     NO → Note alternative

2. Were activated skills actually used?
   YES → Confirm       NO → Raise threshold

3. Was complexity assessment accurate?
   YES → Maintain      NO → Adjust heuristics

4. Did cross-system routing add value?
   YES → Keep active   NO → Consider direct handling
```

---

## Platform Considerations

The routing matrix operates identically across all platforms. The platform adapter translates the routing decision into the platform's native format:

| Platform | How Routing Manifests |
|----------|---------------------|
| Claude Code | Direct agent activation via CLAUDE.md context |
| Cursor | Rule file activation via .cursor/rules/ glob patterns |
| Cline | Memory bank selection via .clinerules/ |
| Codex | AGENTS.md cascading instruction selection |
| Gemini CLI | Instruction layer activation via .gemini/ |
| Antigravity | Agent task routing via .antigravity/ |

---

*The fastest path to the right answer starts with the right question to the right mind.*
