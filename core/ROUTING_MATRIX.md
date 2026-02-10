# Starlight Routing Matrix

> *"Every request finds its perfect handler. Every handler finds its perfect moment."*

---

## Overview

The Routing Matrix determines which agent(s), skill(s), and vault(s) handle each request. It acts as the intelligent dispatcher for all Starlight operations.

---

## Primary Routing Logic

```
ANALYZE REQUEST
│
├── Contains "design", "architect", "system", "scale", "infrastructure"?
│   └── YES → STARLIGHT ARCHITECT
│       Skills: systems-thinking, strategic-reasoning
│       Vault: technical-vault
│
├── Contains "coordinate", "manage", "workflow", "parallel", "orchestrate"?
│   └── YES → STARLIGHT ORCHESTRATOR
│       Skills: multi-agent-coordination, workflow-design
│       Vault: operational-vault
│
├── Contains "review", "audit", "check", "security", "quality", "validate"?
│   └── YES → STARLIGHT SENTINEL
│       Skills: decision-framework, pattern-recognition
│       Vault: technical-vault
│
├── Contains "explain", "teach", "learn", "why", "understand", "wisdom"?
│   └── YES → STARLIGHT SAGE
│       Skills: knowledge-synthesis, context-preservation
│       Vault: wisdom-vault
│
├── Contains "create", "write", "compose", "generate", "draft", "imagine"?
│   └── YES → STARLIGHT WEAVER
│       Skills: pattern-recognition, knowledge-synthesis
│       Vault: creative-vault
│
├── Contains "strategy", "future", "plan", "navigate", "position", "roadmap"?
│   └── YES → STARLIGHT NAVIGATOR
│       Skills: strategic-reasoning, decision-framework
│       Vault: strategic-vault
│
├── Contains "remember", "vault", "store", "recall", "memory"?
│   └── YES → VAULT MANAGEMENT SKILL
│       Agent: none (direct skill)
│       Vault: (target vault from context)
│
├── Contains "transmit", "sync", "broadcast", "update [system]"?
│   └── YES → TRANSMISSION PROTOCOL SKILL
│       Agent: none (direct skill)
│       Channel: (target channel from context)
│
├── Contains "council", "all perspectives", "major decision"?
│   └── YES → STARLIGHT PRIME (COUNCIL MODE)
│       Agents: All relevant (parallel)
│       Vault: strategic-vault
│
├── Multiple domains detected?
│   └── YES → STARLIGHT PRIME (MULTI-AGENT)
│       Agents: Selected by domain overlap
│       Pattern: parallel or sequential
│
└── Unclear intent?
    └── ASK: "Is this about building (Architect), creating (Weaver),
             planning (Navigator), learning (Sage), or reviewing (Sentinel)?"
```

---

## Cross-System Routing

When requests involve specific FrankX ecosystem repos:

```
CROSS-SYSTEM ROUTING
====================

Request mentions ACOS / creator / commands / skills?
  → Route through ACOS Channel
  → Skills: repo-bridge, ecosystem-sync
  → Context: acos-context.md

Request mentions Arcanea / creative / Luminors / world-building?
  → Route through Arcanea Channel
  → Skills: repo-bridge, ecosystem-sync
  → Context: arcanea-context.md

Request mentions AI-Ops / infrastructure / gateway / memory systems?
  → Route through AI-Ops Channel
  → Skills: repo-bridge, ecosystem-sync
  → Context: ai-ops-context.md

Request spans multiple repos?
  → Starlight Prime coordinates
  → All relevant channels activated
  → Unified context assembled
```

---

## Skill Auto-Activation Rules

Skills activate automatically based on context. See `skills/skill-rules.json` for the complete ruleset.

**Quick reference:**

| Trigger | Skill Activated | Category |
|---------|----------------|----------|
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

## Priority & Escalation

### Request Priority Levels

| Priority | Criteria | Response |
|----------|----------|----------|
| **P0 - Critical** | System-breaking, data loss risk | Immediate, all resources |
| **P1 - High** | Strategic decisions, deadlines | Fast routing, senior agents |
| **P2 - Normal** | Standard requests | Normal routing |
| **P3 - Low** | Exploratory, learning | Efficient routing, minimal agents |

### Escalation Protocol

```
Level 1: Single agent handles request
  ↓ (if insufficient)
Level 2: Add supporting agent
  ↓ (if still insufficient)
Level 3: Convene partial council (2-3 agents)
  ↓ (if critical/complex)
Level 4: Full council with Starlight Prime
  ↓ (if unprecedented)
Level 5: Flag for human decision with full context
```

---

## Routing Optimization

### Learning from Outcomes

After each interaction, evaluate routing quality:

```
ROUTING FEEDBACK LOOP
=====================

1. Was the selected agent the best choice?
   YES → Reinforce routing pattern
   NO  → Note better alternative for future

2. Were activated skills actually used?
   YES → Confirm activation rule
   NO  → Consider raising activation threshold

3. Was the complexity assessment accurate?
   YES → Maintain calibration
   NO  → Adjust scoring heuristics

4. Did cross-system routing add value?
   YES → Keep channels active
   NO  → Consider direct handling
```

---

*"The fastest path to the right answer starts with the right question to the right mind."*
