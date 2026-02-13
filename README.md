# Starlight Intelligence System v2.0

> **Universal Context Standard for AI-Augmented Creator Workflows**

A portable cognitive architecture that generates optimized context injections for any AI tool — Claude Code, Cursor, Windsurf, or direct API usage. Built on the ACOS v8 curated intelligence philosophy.

## What It Does

**Problem:** Every AI tool needs context about who you are, how you work, and what you've learned. Maintaining separate configurations for Claude Code (`CLAUDE.md`), Cursor (`.cursorrules`), and Windsurf (`.windsurfrules`) leads to drift and duplication.

**Solution:** Define your identity, knowledge, and strategies once. SIS generates tool-specific context from a single source of truth.

## Architecture

```
src/
  index.ts          Main orchestrator (StarlightIntelligence)
  context.ts        Context Engine — generates AI tool prompts
  memory.ts         Memory Manager — persistent cross-session knowledge
  agents.ts         Agent Router — task routing (ACOS v8 aligned)
  types.ts          Type definitions

context/            Markdown context files (human-readable layer)
  00_IDENTITY/      Who you are and what you value
  01_INTELLECT/     Tech stack and domain knowledge
  02_PROTOCOL/      Reasoning strategies and decision frameworks
  03_AGENCY/        Specialist agent definitions
  04_ARCANA/        Creative lore and inspiration
```

## Quick Start

```typescript
import { StarlightIntelligence } from "@frankx/starlight-intelligence-system";

const sis = new StarlightIntelligence();
sis.initialize();

// Generate context for Claude Code
const context = sis.generateContext({
  target: "claude-code",
  layers: ["identity", "knowledge", "strategy", "agents"],
});
console.log(context.content);

// Route a task to the best specialist
const agents = sis.routeTask("write a blog post about AI music production");
// → [{ agent: "Content Architect", score: 20, reason: "Matched: write, blog, content" }]

// Store a learning that persists across sessions
sis.remember({
  content: "TypeScript icon maps: use Record<string, React.ComponentType> not React.ElementType",
  category: "pattern",
  tags: ["typescript", "react", "icons"],
  confidence: 0.95,
});
```

## Core Capabilities

### 1. Context Engine
Generates optimized system prompts with selectable layers:
- **Identity** — Name, title, voice guidelines, values
- **Knowledge** — Tech stack, brand system, typography
- **Strategy** — Reasoning patterns (First Principles, Pre-Action Checklist, Systems Thinking)
- **Agents** — 8 specialist agents with skill sets and triggers
- **Memory** — Relevant past learnings injected into context

### 2. Memory Manager
File-based persistent memory (no database required):
- Add entries with category, tags, and confidence score
- Word-indexed search across all memories
- Categories: `pattern`, `decision`, `insight`, `error`, `preference`
- Auto-saves to `.starlight/memory.json`

### 3. Agent Router
ACOS v8-aligned task routing:
- 8 specialist agents: Content Architect, Frontend Engineer, AI Systems Architect, Music Producer, Product Engineer, DevOps Engineer, Research Analyst, Starlight Orchestrator
- Routes by keyword matching and file pattern analysis
- Returns scored recommendations with explanations

## Design Principles

1. **Curated Excellence** — Every component earns its place. No bloat.
2. **Portability** — Works with any AI tool. No vendor lock-in.
3. **File-Based** — No database required. Git-friendly. Deployable anywhere.
4. **ACOS Alignment** — Shares skill taxonomy and agent definitions with ACOS v8.
5. **Production-Grade** — TypeScript strict mode. Real types. Testable.

## Context Layers

| Layer | Target: Claude Code | Target: Cursor | Target: Generic |
|-------|--------------------|-----------------|-----------------|
| Identity | CLAUDE.md section | .cursorrules section | Markdown |
| Knowledge | Stack + brand rules | Stack constraints | Markdown |
| Strategy | Decision framework | Reasoning rules | Markdown |
| Agents | Agent definitions | Agent hints | Markdown |
| Memory | Recent learnings | Pattern hints | Markdown |

## Relationship to ACOS

```
ACOS v8 (Claude Code)           SIS v2 (Universal)
  21 curated skills               Context generation
  8 specialist agents    <──>     Agent routing
  Hook-first routing              Cross-tool portability
  Status bar metrics              Memory persistence
  Session-specific                Identity + knowledge
```

ACOS handles Claude Code skill activation and session management.
SIS handles the deeper layer: who you are, what you know, how you think, and what you've learned — portable across any AI tool.

---

Built with the ACOS v8 philosophy: curated excellence over accumulated quantity.
