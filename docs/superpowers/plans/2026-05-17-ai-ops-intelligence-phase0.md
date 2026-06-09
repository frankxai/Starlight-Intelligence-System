# AI Ops Intelligence — Phase 0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a 1-day vertical slice of `/ai-ops-excavate` + `/ai-ops-list` that walks Frank's file-based AI configs across 6 platforms, emits one Markdown file per assistant, and proves the schema survives contact with reality before Phases 1-9 are planned.

**Architecture:** TypeScript walker with one platform-adapter module per supported platform (Claude Code projects, Cursor, Cline, Codex, Gemini CLI, Antigravity). Schema validation via AJV. Markdown emit via simple frontmatter template. Two CLI entry points wired as Claude Code commands: `/ai-ops-excavate` (write) and `/ai-ops-list` (read). No Notion, no Obsidian, no council, no CoE — those wait for Phase 1+.

**Tech Stack:** TypeScript ≥5.4, Node ≥20, vitest for tests, AJV for schema validation, gray-matter for frontmatter, fs-extra for filesystem helpers. Existing SIS conventions: `verticals/_template/` for scaffold pattern, JetBrains Mono / Inter UI vocabulary, attestation footer "Built on SIP".

**Spec:** `docs/superpowers/specs/2026-05-16-ai-ops-intelligence-design.md` (committed at df86dcd, board PROCEED 2026-05-17 round 2).

**Phase 0 gate:** at end of plan, run excavate + list on Frank's real fleet. If schema needs ≥3 changes after seeing real data, halt — plan re-enters brainstorming for schema refit before Phase 1.

---

## Pre-flight

### Task 0.1: Worktree decision (no-code)

**Files:** none

- [ ] **Step 1: Decide isolation strategy**

Phase 0 is small (~3h work, ~6 new files, no substrate edits beyond a new vertical directory). The existing SIS pattern keeps Phase 0 in `main` since the gate decision benefits from rapid iteration. Use a worktree only if mid-flight conflict with other parallel SIS work is anticipated.

**Recommendation:** work on `main` branch. Document this decision and proceed.

- [ ] **Step 2: Verify clean working tree**

Run: `git status`
Expected: clean working tree (only Phase 0 plan untracked) or working tree with only `.superpowers/` ignored content.

If dirty: address conflicts before proceeding (commit, stash, or restore).

---

## Scaffold

### Task 0.2: Create vertical directory skeleton

**Files:**
- Create: `verticals/ai-ops-intelligence/`
- Create: `verticals/ai-ops-intelligence/schemas/`
- Create: `verticals/ai-ops-intelligence/excavation/`
- Create: `verticals/ai-ops-intelligence/excavation/adapters/`
- Create: `verticals/ai-ops-intelligence/commands/`
- Create: `verticals/ai-ops-intelligence/tests/`
- Create: `verticals/ai-ops-intelligence/tests/fixtures/`

- [ ] **Step 1: Create directories**

```bash
mkdir -p verticals/ai-ops-intelligence/{schemas,excavation/adapters,commands,tests/fixtures}
```

- [ ] **Step 2: Verify**

```bash
find verticals/ai-ops-intelligence -type d
```

Expected output: 6 directories listed.

### Task 0.3: Create SKILL.md from template

**Files:**
- Create: `verticals/ai-ops-intelligence/SKILL.md`

- [ ] **Step 1: Write SKILL.md**

```markdown
# SKILL — AI Ops Intelligence

> Substrate skill file for the AI Operations Intelligence vertical. Auto-loaded when any `/ai-ops-*` or `/ai-coe-*` command activates. Enforces voice, refusal patterns, attestation, and composition rules across the registry / council / CoE sub-systems.

## Activation rules

Loaded when:
- any `/ai-ops-*` command runs
- any `/ai-coe-*` command runs
- the `starlight-ai-ops` agent activates
- `/spawn-domain-stack` selects this vertical as a reference pattern

## Phase 0 scope (active 2026-05-17)

This SKILL is Phase 0 — operational scope limited to:
- `/ai-ops-excavate` (read filesystem → emit `memory/ai-ops/{platform}/{slug}.md`)
- `/ai-ops-list` (read registry → print table)

Council, CoE, sync, and ACOS bridge surfaces are deferred to Phase 1+ pending Phase 0 schema-vs-reality gate.

## Invariants the wrapper enforces

1. **Voice composition.** Every human-facing artifact (excavation logs, list output) runs through Frank-DNA tone — direct, technical, warm. No generic-template prose.

2. **Schema invariants.** Every assistant entry validates against `schemas/assistant.schema.json` before write. Invalid entries are rejected with a diff, never silently coerced.

3. **Attestation footer.** Every shipped artifact under this vertical carries "Built on SIP · AI Ops Intelligence". Phase 0 emit step injects this automatically.

4. **Refusal patterns.** Refuses to write entries for platforms not in the supported enum. Refuses to overwrite an existing entry without explicit confirmation.

5. **Domain sensitivity gating.** Phase 0 only reads local filesystem; no network calls, no credential access. If Phase 1+ work touches Notion / external APIs, gate-check applies (see §10 of spec).

## Composition

This vertical follows the Domain Sub-Stack pattern (sibling of People Intelligence + Sound Intelligence). Public substrate at `verticals/ai-ops-intelligence/` is MIT-licensed and forkable; private instance lives at `memory/ai-ops/`.

---

**Built on SIP** · AI Ops Intelligence v0.1 (Phase 0) · MIT
```

- [ ] **Step 2: Verify file**

```bash
head -3 verticals/ai-ops-intelligence/SKILL.md
```

Expected: heading line + blockquote + blank line.

### Task 0.4: Create SIS-instance.md

**Files:**
- Create: `verticals/ai-ops-intelligence/SIS-instance.md`

- [ ] **Step 1: Write SIS-instance.md**

```markdown
# SIS-instance — AI Ops Intelligence

**Class:** sovereign domain sub-stack (reference vertical, third after People IS + Sound IS)
**Status:** `scaffolded — v0.1 Phase 0` (excavation + list only; council + CoE deferred)
**Owner:** open reference (forkable by any sovereign practitioner)
**Primary repo:** `verticals/ai-ops-intelligence/` in `frankxai/Starlight-Intelligence-System`
**Canon:** declines defining its own canon; composes with frankx.ai/ai-coe 6-pillar framework (presentation surface; SIS is canonical per spec §5.5)
**Compounds:** every fork carries "Built on SIP · AI Ops Intelligence" attribution

## Sub-systems (planned for Phase 1+)

| Sub-system | Status | Commands |
|---|---|---|
| Registry | Phase 0 (active) | `/ai-ops-excavate`, `/ai-ops-list` |
| Council | Phase 5 | `/ai-ops-council` |
| Sync | Phase 3 | (post-commit hook) |
| CoE | Phase 6 | `/ai-coe-assess`, `/ai-coe-report`, `/ai-coe-frame` |
| Install | Phase 8 | `install.sh` |

## ICP (intended community persona)

Sovereign practitioners managing 5+ AI assistants across 2+ platforms who need a canonical registry, multi-model council review, and a CoE methodology surface.

## Open / closed boundary

- **Open (MIT):** vertical scaffold, schema, walker, prompts, commands, install scripts
- **Private (per practitioner):** `memory/ai-ops/` populated entries (each practitioner's fleet)

---

**Built on SIP** · v1 · MIT
```

- [ ] **Step 2: Verify file lines**

```bash
wc -l verticals/ai-ops-intelligence/SIS-instance.md
```

Expected: ≥25 lines.

### Task 0.5: Initialize package.json + tsconfig.json

**Files:**
- Create: `verticals/ai-ops-intelligence/package.json`
- Create: `verticals/ai-ops-intelligence/tsconfig.json`

- [ ] **Step 1: Write package.json**

```json
{
  "name": "@starlight/ai-ops-intelligence",
  "version": "0.1.0-phase0",
  "description": "AI Ops Intelligence — Domain Sub-Stack for SIS",
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "excavate": "tsx excavation/cli-excavate.ts",
    "list": "tsx commands/cli-list.ts"
  },
  "dependencies": {
    "ajv": "^8.17.1",
    "ajv-formats": "^3.0.1",
    "fs-extra": "^11.2.0",
    "gray-matter": "^4.0.3"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.4",
    "@types/node": "^20.14.0",
    "tsx": "^4.19.0",
    "typescript": "^5.5.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowImportingTsExtensions": false,
    "noEmit": true
  },
  "include": ["excavation/**/*.ts", "commands/**/*.ts", "tests/**/*.ts", "schemas/**/*.json"]
}
```

### Task 0.6: Install dependencies

**Files:** modifies `verticals/ai-ops-intelligence/package-lock.json` (or pnpm/yarn lock)

- [ ] **Step 1: Install**

```bash
cd verticals/ai-ops-intelligence && npm install
```

Expected: dependencies resolved, lockfile written, `node_modules/` populated.

- [ ] **Step 2: Verify**

```bash
cd verticals/ai-ops-intelligence && npx vitest --version && npx tsx --version
```

Expected: both versions print.

### Task 0.7: Commit scaffold

- [ ] **Step 1: Stage + commit**

```bash
git add verticals/ai-ops-intelligence/SKILL.md verticals/ai-ops-intelligence/SIS-instance.md verticals/ai-ops-intelligence/package.json verticals/ai-ops-intelligence/tsconfig.json verticals/ai-ops-intelligence/package-lock.json
git commit -m "feat(ai-ops): scaffold AI Ops Intelligence vertical (Phase 0 setup)

Per spec docs/superpowers/specs/2026-05-16-ai-ops-intelligence-design.md
and Phase 0 plan docs/superpowers/plans/2026-05-17-ai-ops-intelligence-phase0.md.

Scaffold only — no executable code yet. SKILL.md declares Phase 0 scope
(excavate + list); SIS-instance.md declares vertical class + ICP +
open/closed boundary.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

Expected: commit hash printed; pre-commit hook may skip symmetry tests (no substrate files touched yet).

---

## Schema

### Task 0.8: Write assistant.schema.json

**Files:**
- Create: `verticals/ai-ops-intelligence/schemas/assistant.schema.json`

- [ ] **Step 1: Write the schema**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://starlightintelligence.org/schemas/ai-ops/assistant.schema.json",
  "title": "AssistantEntry",
  "description": "Frontmatter contract for a registered AI assistant",
  "type": "object",
  "required": ["slug", "name", "platform", "owner", "purpose", "status", "system_prompt_hash", "attestation"],
  "properties": {
    "slug": {
      "type": "string",
      "pattern": "^[a-z0-9][a-z0-9-]*$",
      "minLength": 1,
      "maxLength": 80,
      "description": "kebab-case unique within platform"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "description": "human label"
    },
    "platform": {
      "type": "string",
      "enum": [
        "claude-code",
        "claude-project",
        "chatgpt-custom-gpt",
        "gemini-gem",
        "grok",
        "kimi",
        "cursor",
        "cline",
        "codex",
        "gemini-cli",
        "antigravity"
      ]
    },
    "owner": {
      "type": "string",
      "minLength": 1
    },
    "purpose": {
      "type": "string",
      "maxLength": 500,
      "description": "one-line description"
    },
    "status": {
      "type": "string",
      "enum": ["active", "dormant", "retired"]
    },
    "system_prompt_hash": {
      "type": "string",
      "pattern": "^sha256:[a-f0-9]{64}$"
    },
    "system_prompt": {
      "type": "string"
    },
    "kb_sources": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["type"],
        "properties": {
          "type": {"type": "string", "enum": ["sis-canon", "url", "file"]},
          "path": {"type": "string"},
          "url": {"type": "string", "format": "uri"}
        }
      }
    },
    "last_reviewed": {
      "type": ["string", "null"],
      "format": "date"
    },
    "last_verdict": {
      "type": "string",
      "enum": ["keep", "tighten", "rewrite", "retire", "unreviewed"],
      "default": "unreviewed"
    },
    "last_council_readout": {
      "type": ["string", "null"]
    },
    "attestation": {
      "type": "string",
      "pattern": "^built-on-sip-v[0-9]+\\.[0-9]+(\\.[0-9]+)?$"
    },
    "notion_page_id": {
      "type": ["string", "null"]
    },
    "source_path": {
      "type": "string",
      "description": "Phase 0 only: original file path the entry was excavated from (used for re-excavation)"
    }
  }
}
```

- [ ] **Step 2: Sanity-check JSON validity**

```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('verticals/ai-ops-intelligence/schemas/assistant.schema.json', 'utf8')).title)"
```

Expected output: `AssistantEntry`

### Task 0.9: Write the failing schema-validation test

**Files:**
- Create: `verticals/ai-ops-intelligence/tests/schema.test.ts`

- [ ] **Step 1: Write the test**

```typescript
import { describe, it, expect } from 'vitest';
import { validateEntry } from '../excavation/schema-validator.ts';

describe('assistant schema validation', () => {
  const validEntry = {
    slug: 'frankx-architect',
    name: 'FrankX Architect',
    platform: 'chatgpt-custom-gpt',
    owner: 'frank',
    purpose: 'Personal-brand architect voice',
    status: 'active',
    system_prompt_hash: 'sha256:' + 'a'.repeat(64),
    attestation: 'built-on-sip-v1.1.1',
  };

  it('accepts a minimal valid entry', () => {
    const result = validateEntry(validEntry);
    expect(result.valid).toBe(true);
    expect(result.errors).toBeNull();
  });

  it('rejects missing required field', () => {
    const { slug, ...missingSlug } = validEntry;
    const result = validateEntry(missingSlug);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("must have required property 'slug'");
  });

  it('rejects invalid platform enum', () => {
    const result = validateEntry({ ...validEntry, platform: 'mystery-platform' });
    expect(result.valid).toBe(false);
    expect(result.errors!.join(' ')).toMatch(/platform/);
  });

  it('rejects invalid slug pattern', () => {
    const result = validateEntry({ ...validEntry, slug: 'Has Spaces' });
    expect(result.valid).toBe(false);
    expect(result.errors!.join(' ')).toMatch(/slug/);
  });

  it('rejects invalid attestation pattern', () => {
    const result = validateEntry({ ...validEntry, attestation: 'no-attestation' });
    expect(result.valid).toBe(false);
    expect(result.errors!.join(' ')).toMatch(/attestation/);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

```bash
cd verticals/ai-ops-intelligence && npx vitest run tests/schema.test.ts
```

Expected: FAIL — `Cannot find module '../excavation/schema-validator.ts'`

### Task 0.10: Implement schema validator

**Files:**
- Create: `verticals/ai-ops-intelligence/excavation/schema-validator.ts`

- [ ] **Step 1: Write the module**

```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schema from '../schemas/assistant.schema.json' with { type: 'json' };

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validator = ajv.compile(schema);

export interface ValidationResult {
  valid: boolean;
  errors: string[] | null;
}

export function validateEntry(entry: unknown): ValidationResult {
  const valid = validator(entry);
  if (valid) return { valid: true, errors: null };
  const errors = (validator.errors ?? []).map((e) =>
    e.message ? `${e.instancePath}: ${e.message}` : JSON.stringify(e),
  );
  return { valid: false, errors };
}
```

- [ ] **Step 2: Run tests to verify pass**

```bash
cd verticals/ai-ops-intelligence && npx vitest run tests/schema.test.ts
```

Expected: 5 tests PASS.

### Task 0.11: Commit schema layer

- [ ] **Step 1: Stage + commit**

```bash
git add verticals/ai-ops-intelligence/schemas/ verticals/ai-ops-intelligence/excavation/schema-validator.ts verticals/ai-ops-intelligence/tests/schema.test.ts
git commit -m "feat(ai-ops): schema + AJV validator with 5 invariant tests

Schema enforces 11-platform enum, slug pattern, system-prompt-hash
sha256 format, attestation pattern. Per spec §5 + §5.5 (round-2 board
inlined the canonical 6-pillar rubric reference here too).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Excavation core

### Task 0.12: Write types.ts

**Files:**
- Create: `verticals/ai-ops-intelligence/excavation/types.ts`

- [ ] **Step 1: Write the types module**

```typescript
export type Platform =
  | 'claude-code'
  | 'claude-project'
  | 'chatgpt-custom-gpt'
  | 'gemini-gem'
  | 'grok'
  | 'kimi'
  | 'cursor'
  | 'cline'
  | 'codex'
  | 'gemini-cli'
  | 'antigravity';

export interface AssistantEntry {
  slug: string;
  name: string;
  platform: Platform;
  owner: string;
  purpose: string;
  status: 'active' | 'dormant' | 'retired';
  system_prompt_hash: string;
  system_prompt?: string;
  kb_sources?: Array<
    | { type: 'sis-canon'; path: string }
    | { type: 'url'; url: string }
    | { type: 'file'; path: string }
  >;
  last_reviewed?: string | null;
  last_verdict?: 'keep' | 'tighten' | 'rewrite' | 'retire' | 'unreviewed';
  last_council_readout?: string | null;
  attestation: string;
  notion_page_id?: string | null;
  source_path?: string;
}

export interface PlatformAdapter {
  readonly platform: Platform;
  scan(roots: string[]): Promise<AssistantEntry[]>;
}

export interface ScanContext {
  /** roots to scan for per-project configs (e.g., ~/, ~/Starlight-Intelligence-System, ~/FrankX) */
  roots: string[];
  /** the owner to stamp on emitted entries */
  owner: string;
}
```

### Task 0.13: Write the failing test for walker orchestrator

**Files:**
- Create: `verticals/ai-ops-intelligence/tests/walker.test.ts`
- Create: `verticals/ai-ops-intelligence/tests/fixtures/fake-platform/.claude/projects/test-proj/CLAUDE.md`

- [ ] **Step 1: Create fixture file**

```bash
mkdir -p verticals/ai-ops-intelligence/tests/fixtures/fake-home/.claude/projects/test-proj
printf '%s\n' '# Test Project CLAUDE.md' 'This is a test fixture.' > verticals/ai-ops-intelligence/tests/fixtures/fake-home/.claude/projects/test-proj/CLAUDE.md
```

- [ ] **Step 2: Write the test**

```typescript
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { walk } from '../excavation/walker.ts';
import type { PlatformAdapter, AssistantEntry } from '../excavation/types.ts';

describe('walker orchestrator', () => {
  it('runs every adapter and aggregates results', async () => {
    const calls: string[] = [];
    const a: PlatformAdapter = {
      platform: 'cursor',
      async scan() {
        calls.push('cursor');
        return [
          {
            slug: 'fake-cursor',
            name: 'Fake',
            platform: 'cursor',
            owner: 'tester',
            purpose: 'fixture',
            status: 'active',
            system_prompt_hash: 'sha256:' + 'a'.repeat(64),
            attestation: 'built-on-sip-v1.0.0',
          } satisfies AssistantEntry,
        ];
      },
    };
    const b: PlatformAdapter = {
      platform: 'cline',
      async scan() {
        calls.push('cline');
        return [];
      },
    };
    const entries = await walk({ roots: ['unused'], owner: 'tester' }, [a, b]);
    expect(calls).toEqual(['cursor', 'cline']);
    expect(entries).toHaveLength(1);
    expect(entries[0].platform).toBe('cursor');
  });

  it('survives an adapter that throws', async () => {
    const ok: PlatformAdapter = {
      platform: 'cursor',
      async scan() {
        return [];
      },
    };
    const broken: PlatformAdapter = {
      platform: 'cline',
      async scan() {
        throw new Error('disk on fire');
      },
    };
    const entries = await walk({ roots: ['unused'], owner: 'tester' }, [ok, broken]);
    expect(entries).toEqual([]);
  });
});
```

- [ ] **Step 3: Run test to verify failure**

```bash
cd verticals/ai-ops-intelligence && npx vitest run tests/walker.test.ts
```

Expected: FAIL — `Cannot find module '../excavation/walker.ts'`

### Task 0.14: Implement walker orchestrator

**Files:**
- Create: `verticals/ai-ops-intelligence/excavation/walker.ts`

- [ ] **Step 1: Write the orchestrator**

```typescript
import type { AssistantEntry, PlatformAdapter, ScanContext } from './types.ts';

export interface WalkLogEntry {
  platform: string;
  ok: boolean;
  error?: string;
  count?: number;
}

export async function walk(
  ctx: ScanContext,
  adapters: PlatformAdapter[],
  log?: WalkLogEntry[],
): Promise<AssistantEntry[]> {
  const out: AssistantEntry[] = [];
  for (const adapter of adapters) {
    try {
      const entries = await adapter.scan(ctx.roots);
      out.push(...entries);
      log?.push({ platform: adapter.platform, ok: true, count: entries.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log?.push({ platform: adapter.platform, ok: false, error: message });
    }
  }
  return out;
}
```

- [ ] **Step 2: Run tests to verify pass**

```bash
cd verticals/ai-ops-intelligence && npx vitest run tests/walker.test.ts
```

Expected: 2 tests PASS.

### Task 0.15: Commit walker core

- [ ] **Step 1: Stage + commit**

```bash
git add verticals/ai-ops-intelligence/excavation/types.ts verticals/ai-ops-intelligence/excavation/walker.ts verticals/ai-ops-intelligence/tests/walker.test.ts verticals/ai-ops-intelligence/tests/fixtures/
git commit -m "feat(ai-ops): walker orchestrator with adapter pattern + graceful-fail

Per spec §7 error-handling boundary: adapter failures are caught and
logged, never crash the walker. Adapter contract in types.ts.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Platform adapter — Claude Code projects

### Task 0.16: Write failing test for claude-code adapter

**Files:**
- Create: `verticals/ai-ops-intelligence/tests/adapter-claude-code.test.ts`

- [ ] **Step 1: Write the test**

```typescript
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { claudeCodeAdapter } from '../excavation/adapters/claude-code.ts';

const FIXTURE_HOME = path.resolve(__dirname, 'fixtures/fake-home');

describe('claude-code adapter', () => {
  it('finds projects under ~/.claude/projects/ and emits one entry per CLAUDE.md', async () => {
    const adapter = claudeCodeAdapter({ home: FIXTURE_HOME, owner: 'tester' });
    const entries = await adapter.scan([]);
    expect(entries.length).toBeGreaterThan(0);
    const proj = entries.find((e) => e.slug === 'test-proj');
    expect(proj).toBeDefined();
    expect(proj!.platform).toBe('claude-code');
    expect(proj!.owner).toBe('tester');
    expect(proj!.system_prompt_hash).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(proj!.attestation).toMatch(/^built-on-sip-v/);
    expect(proj!.source_path).toContain('test-proj');
  });

  it('returns [] when projects directory does not exist', async () => {
    const adapter = claudeCodeAdapter({ home: '/no/such/path', owner: 'tester' });
    const entries = await adapter.scan([]);
    expect(entries).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

```bash
cd verticals/ai-ops-intelligence && npx vitest run tests/adapter-claude-code.test.ts
```

Expected: FAIL — `Cannot find module '../excavation/adapters/claude-code.ts'`

### Task 0.17: Implement claude-code adapter

**Files:**
- Create: `verticals/ai-ops-intelligence/excavation/adapters/claude-code.ts`

- [ ] **Step 1: Write the adapter**

```typescript
import { createHash } from 'node:crypto';
import path from 'node:path';
import fs from 'fs-extra';
import os from 'node:os';
import type { AssistantEntry, PlatformAdapter } from '../types.ts';

export interface ClaudeCodeAdapterOptions {
  home?: string;
  owner: string;
}

export function claudeCodeAdapter(opts: ClaudeCodeAdapterOptions): PlatformAdapter {
  const home = opts.home ?? os.homedir();
  return {
    platform: 'claude-code',
    async scan(): Promise<AssistantEntry[]> {
      const projectsDir = path.join(home, '.claude', 'projects');
      if (!(await fs.pathExists(projectsDir))) return [];
      const projectDirs = await fs.readdir(projectsDir, { withFileTypes: true });
      const entries: AssistantEntry[] = [];
      for (const d of projectDirs) {
        if (!d.isDirectory()) continue;
        const slug = d.name.replace(/[^a-z0-9-]/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'unknown';
        const claudeMd = path.join(projectsDir, d.name, 'CLAUDE.md');
        const systemPrompt = (await fs.pathExists(claudeMd))
          ? await fs.readFile(claudeMd, 'utf8')
          : '';
        const hash = 'sha256:' + createHash('sha256').update(systemPrompt).digest('hex');
        entries.push({
          slug,
          name: d.name,
          platform: 'claude-code',
          owner: opts.owner,
          purpose: `Claude Code project at ${d.name}`,
          status: 'active',
          system_prompt_hash: hash,
          system_prompt: systemPrompt || undefined,
          attestation: 'built-on-sip-v1.1.1',
          source_path: path.join(projectsDir, d.name),
        });
      }
      return entries;
    },
  };
}
```

- [ ] **Step 2: Run tests to verify pass**

```bash
cd verticals/ai-ops-intelligence && npx vitest run tests/adapter-claude-code.test.ts
```

Expected: 2 tests PASS.

### Task 0.18: Commit claude-code adapter

```bash
git add verticals/ai-ops-intelligence/excavation/adapters/claude-code.ts verticals/ai-ops-intelligence/tests/adapter-claude-code.test.ts
git commit -m "feat(ai-ops): claude-code adapter — scans ~/.claude/projects/

Reads each project directory; CLAUDE.md (if present) becomes the
system_prompt; slug derived from directory name with safe-char filter.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Platform adapter — Cursor

### Task 0.19: Write failing test for cursor adapter

**Files:**
- Create: `verticals/ai-ops-intelligence/tests/adapter-cursor.test.ts`
- Create: fixture file at `tests/fixtures/fake-home/repos/proj-a/.cursor/rules/main.md`

- [ ] **Step 1: Create fixture**

```bash
mkdir -p verticals/ai-ops-intelligence/tests/fixtures/fake-home/repos/proj-a/.cursor/rules
printf '%s\n' '# Cursor rule for proj-a' 'You are a code assistant for proj-a.' > verticals/ai-ops-intelligence/tests/fixtures/fake-home/repos/proj-a/.cursor/rules/main.md
```

- [ ] **Step 2: Write the test**

```typescript
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { cursorAdapter } from '../excavation/adapters/cursor.ts';

const FIXTURE_HOME = path.resolve(__dirname, 'fixtures/fake-home');
const FIXTURE_REPOS = path.join(FIXTURE_HOME, 'repos');

describe('cursor adapter', () => {
  it('finds .cursor/rules/*.md under each root and emits an entry per rule file', async () => {
    const adapter = cursorAdapter({ owner: 'tester' });
    const entries = await adapter.scan([FIXTURE_REPOS]);
    expect(entries.length).toBeGreaterThan(0);
    const main = entries.find((e) => e.slug.includes('main'));
    expect(main).toBeDefined();
    expect(main!.platform).toBe('cursor');
    expect(main!.source_path).toMatch(/main\.md$/);
  });

  it('returns [] when no .cursor/rules dirs exist', async () => {
    const adapter = cursorAdapter({ owner: 'tester' });
    const entries = await adapter.scan(['/no/such/root']);
    expect(entries).toEqual([]);
  });
});
```

- [ ] **Step 3: Run test to verify failure**

```bash
cd verticals/ai-ops-intelligence && npx vitest run tests/adapter-cursor.test.ts
```

Expected: FAIL — `Cannot find module '../excavation/adapters/cursor.ts'`

### Task 0.20: Implement cursor adapter

**Files:**
- Create: `verticals/ai-ops-intelligence/excavation/adapters/cursor.ts`

- [ ] **Step 1: Write the adapter**

```typescript
import { createHash } from 'node:crypto';
import path from 'node:path';
import fs from 'fs-extra';
import type { AssistantEntry, PlatformAdapter } from '../types.ts';

export interface CursorAdapterOptions {
  owner: string;
  /** depth limit for the directory walk; default 4 */
  maxDepth?: number;
}

export function cursorAdapter(opts: CursorAdapterOptions): PlatformAdapter {
  const maxDepth = opts.maxDepth ?? 4;
  return {
    platform: 'cursor',
    async scan(roots: string[]): Promise<AssistantEntry[]> {
      const entries: AssistantEntry[] = [];
      for (const root of roots) {
        const rulesDirs = await findDirs(root, '.cursor/rules', maxDepth);
        for (const dir of rulesDirs) {
          const files = await fs.readdir(dir);
          for (const file of files) {
            if (!file.endsWith('.md')) continue;
            const filePath = path.join(dir, file);
            const projectName = path.basename(path.dirname(path.dirname(dir)));
            const slug = `${projectName}-${path.basename(file, '.md')}`
              .toLowerCase()
              .replace(/[^a-z0-9-]/g, '-')
              .replace(/^-+|-+$/g, '');
            const systemPrompt = await fs.readFile(filePath, 'utf8');
            const hash = 'sha256:' + createHash('sha256').update(systemPrompt).digest('hex');
            entries.push({
              slug: slug || 'unknown',
              name: `${projectName} · ${file}`,
              platform: 'cursor',
              owner: opts.owner,
              purpose: `Cursor rule at ${projectName}/.cursor/rules/${file}`,
              status: 'active',
              system_prompt_hash: hash,
              system_prompt: systemPrompt,
              attestation: 'built-on-sip-v1.1.1',
              source_path: filePath,
            });
          }
        }
      }
      return entries;
    },
  };
}

async function findDirs(root: string, suffix: string, maxDepth: number): Promise<string[]> {
  const out: string[] = [];
  if (!(await fs.pathExists(root))) return out;
  await walk(root, 0);
  return out;

  async function walk(dir: string, depth: number): Promise<void> {
    if (depth > maxDepth) return;
    const candidate = path.join(dir, suffix);
    if (await fs.pathExists(candidate)) {
      const stat = await fs.stat(candidate);
      if (stat.isDirectory()) out.push(candidate);
    }
    let children: string[] = [];
    try {
      children = await fs.readdir(dir);
    } catch {
      return;
    }
    for (const child of children) {
      if (child.startsWith('.') || child === 'node_modules' || child === '_archive') continue;
      const childPath = path.join(dir, child);
      try {
        const stat = await fs.stat(childPath);
        if (stat.isDirectory()) await walk(childPath, depth + 1);
      } catch {
        continue;
      }
    }
  }
}
```

- [ ] **Step 2: Run tests to verify pass**

```bash
cd verticals/ai-ops-intelligence && npx vitest run tests/adapter-cursor.test.ts
```

Expected: 2 tests PASS.

### Task 0.21: Commit cursor adapter

```bash
git add verticals/ai-ops-intelligence/excavation/adapters/cursor.ts verticals/ai-ops-intelligence/tests/adapter-cursor.test.ts
git commit -m "feat(ai-ops): cursor adapter — scans .cursor/rules/*.md under configured roots

Recursive walk with depth limit + standard exclusions (dotdirs,
node_modules, _archive) per portfolio-audit hygiene. Slug = project +
rule-file name.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Platform adapter — Cline

### Task 0.22: Write failing test for cline adapter

**Files:**
- Create: `verticals/ai-ops-intelligence/tests/adapter-cline.test.ts`
- Create: fixture `tests/fixtures/fake-home/repos/proj-a/.clinerules/main.md`

- [ ] **Step 1: Create fixture**

```bash
mkdir -p verticals/ai-ops-intelligence/tests/fixtures/fake-home/repos/proj-a/.clinerules
printf '%s\n' '# Cline rule for proj-a' 'You are a code assistant.' > verticals/ai-ops-intelligence/tests/fixtures/fake-home/repos/proj-a/.clinerules/main.md
```

- [ ] **Step 2: Write the test**

```typescript
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { clineAdapter } from '../excavation/adapters/cline.ts';

const FIXTURE_REPOS = path.resolve(__dirname, 'fixtures/fake-home/repos');

describe('cline adapter', () => {
  it('finds .clinerules/*.md and emits entries', async () => {
    const adapter = clineAdapter({ owner: 'tester' });
    const entries = await adapter.scan([FIXTURE_REPOS]);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0].platform).toBe('cline');
  });
  it('returns [] for missing root', async () => {
    const adapter = clineAdapter({ owner: 'tester' });
    expect(await adapter.scan(['/no/such/root'])).toEqual([]);
  });
});
```

- [ ] **Step 3: Run test to verify failure**

```bash
cd verticals/ai-ops-intelligence && npx vitest run tests/adapter-cline.test.ts
```

Expected: FAIL — module not found.

### Task 0.23: Implement cline adapter

**Files:**
- Create: `verticals/ai-ops-intelligence/excavation/adapters/cline.ts`

- [ ] **Step 1: Write the adapter (mirrors cursor pattern with `.clinerules` suffix)**

```typescript
import { createHash } from 'node:crypto';
import path from 'node:path';
import fs from 'fs-extra';
import type { AssistantEntry, PlatformAdapter } from '../types.ts';

export interface ClineAdapterOptions {
  owner: string;
  maxDepth?: number;
}

export function clineAdapter(opts: ClineAdapterOptions): PlatformAdapter {
  const maxDepth = opts.maxDepth ?? 4;
  return {
    platform: 'cline',
    async scan(roots: string[]): Promise<AssistantEntry[]> {
      const entries: AssistantEntry[] = [];
      for (const root of roots) {
        const rulesDirs = await findDirs(root, '.clinerules', maxDepth);
        for (const dir of rulesDirs) {
          const files = await fs.readdir(dir);
          for (const file of files) {
            if (!file.endsWith('.md')) continue;
            const filePath = path.join(dir, file);
            const projectName = path.basename(path.dirname(dir));
            const slug = `${projectName}-${path.basename(file, '.md')}`
              .toLowerCase()
              .replace(/[^a-z0-9-]/g, '-')
              .replace(/^-+|-+$/g, '');
            const systemPrompt = await fs.readFile(filePath, 'utf8');
            const hash = 'sha256:' + createHash('sha256').update(systemPrompt).digest('hex');
            entries.push({
              slug: slug || 'unknown',
              name: `${projectName} · ${file}`,
              platform: 'cline',
              owner: opts.owner,
              purpose: `Cline rule at ${projectName}/.clinerules/${file}`,
              status: 'active',
              system_prompt_hash: hash,
              system_prompt: systemPrompt,
              attestation: 'built-on-sip-v1.1.1',
              source_path: filePath,
            });
          }
        }
      }
      return entries;
    },
  };
}

async function findDirs(root: string, suffix: string, maxDepth: number): Promise<string[]> {
  const out: string[] = [];
  if (!(await fs.pathExists(root))) return out;
  await walk(root, 0);
  return out;
  async function walk(dir: string, depth: number): Promise<void> {
    if (depth > maxDepth) return;
    const candidate = path.join(dir, suffix);
    if (await fs.pathExists(candidate)) {
      const stat = await fs.stat(candidate);
      if (stat.isDirectory()) out.push(candidate);
    }
    let children: string[] = [];
    try { children = await fs.readdir(dir); } catch { return; }
    for (const child of children) {
      if (child.startsWith('.') || child === 'node_modules' || child === '_archive') continue;
      const childPath = path.join(dir, child);
      try {
        const stat = await fs.stat(childPath);
        if (stat.isDirectory()) await walk(childPath, depth + 1);
      } catch { continue; }
    }
  }
}
```

- [ ] **Step 2: Run tests to verify pass + commit**

```bash
cd verticals/ai-ops-intelligence && npx vitest run tests/adapter-cline.test.ts
git add verticals/ai-ops-intelligence/excavation/adapters/cline.ts verticals/ai-ops-intelligence/tests/adapter-cline.test.ts verticals/ai-ops-intelligence/tests/fixtures/fake-home/repos/proj-a/.clinerules/
git commit -m "feat(ai-ops): cline adapter — same shape as cursor, .clinerules suffix"
```

Expected: 2 tests PASS, commit succeeds.

> **Note for executor:** Tasks 0.24, 0.25, 0.26 follow the IDENTICAL pattern as cline above — three more adapters (`codex.ts`, `gemini-cli.ts`, `antigravity.ts`) with directory suffixes `.codex`, `.gemini`, `.antigravity` respectively, and matching tests + fixtures. Per "no placeholders" rule, the code is repeated below.

---

## Platform adapter — Codex

### Task 0.24: Codex adapter (test + impl + commit)

**Files:**
- Create: `verticals/ai-ops-intelligence/tests/adapter-codex.test.ts`
- Create: fixture `tests/fixtures/fake-home/repos/proj-a/.codex/config.md`
- Create: `verticals/ai-ops-intelligence/excavation/adapters/codex.ts`

- [ ] **Step 1: Create fixture**

```bash
mkdir -p verticals/ai-ops-intelligence/tests/fixtures/fake-home/repos/proj-a/.codex
printf '%s\n' '# Codex config' 'You are a code assistant.' > verticals/ai-ops-intelligence/tests/fixtures/fake-home/repos/proj-a/.codex/config.md
```

- [ ] **Step 2: Write test**

```typescript
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { codexAdapter } from '../excavation/adapters/codex.ts';

const FIXTURE_REPOS = path.resolve(__dirname, 'fixtures/fake-home/repos');

describe('codex adapter', () => {
  it('finds .codex/*.md and emits entries', async () => {
    const adapter = codexAdapter({ owner: 'tester' });
    const entries = await adapter.scan([FIXTURE_REPOS]);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0].platform).toBe('codex');
  });
  it('returns [] for missing root', async () => {
    expect(await codexAdapter({ owner: 'tester' }).scan(['/nope'])).toEqual([]);
  });
});
```

- [ ] **Step 3: Write adapter (same shape as cline, suffix = `.codex`, no `rules` sub-dir)**

```typescript
import { createHash } from 'node:crypto';
import path from 'node:path';
import fs from 'fs-extra';
import type { AssistantEntry, PlatformAdapter } from '../types.ts';

export interface CodexAdapterOptions { owner: string; maxDepth?: number; }

export function codexAdapter(opts: CodexAdapterOptions): PlatformAdapter {
  const maxDepth = opts.maxDepth ?? 4;
  return {
    platform: 'codex',
    async scan(roots: string[]): Promise<AssistantEntry[]> {
      const entries: AssistantEntry[] = [];
      for (const root of roots) {
        const dirs = await findDirs(root, '.codex', maxDepth);
        for (const dir of dirs) {
          let files: string[] = [];
          try { files = await fs.readdir(dir); } catch { continue; }
          for (const file of files) {
            if (!/\.(md|json|yaml|yml)$/.test(file)) continue;
            const filePath = path.join(dir, file);
            const stat = await fs.stat(filePath);
            if (!stat.isFile()) continue;
            const projectName = path.basename(path.dirname(dir));
            const slug = `${projectName}-${path.basename(file).replace(/\.[^.]+$/, '')}`
              .toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '');
            const systemPrompt = await fs.readFile(filePath, 'utf8');
            const hash = 'sha256:' + createHash('sha256').update(systemPrompt).digest('hex');
            entries.push({
              slug: slug || 'unknown',
              name: `${projectName} · ${file}`,
              platform: 'codex',
              owner: opts.owner,
              purpose: `Codex config at ${projectName}/.codex/${file}`,
              status: 'active',
              system_prompt_hash: hash,
              system_prompt: systemPrompt,
              attestation: 'built-on-sip-v1.1.1',
              source_path: filePath,
            });
          }
        }
      }
      return entries;
    },
  };
}

async function findDirs(root: string, suffix: string, maxDepth: number): Promise<string[]> {
  const out: string[] = [];
  if (!(await fs.pathExists(root))) return out;
  await walk(root, 0);
  return out;
  async function walk(dir: string, depth: number): Promise<void> {
    if (depth > maxDepth) return;
    const candidate = path.join(dir, suffix);
    if (await fs.pathExists(candidate)) {
      const stat = await fs.stat(candidate);
      if (stat.isDirectory()) out.push(candidate);
    }
    let children: string[] = [];
    try { children = await fs.readdir(dir); } catch { return; }
    for (const child of children) {
      if (child.startsWith('.') || child === 'node_modules' || child === '_archive') continue;
      const childPath = path.join(dir, child);
      try {
        const stat = await fs.stat(childPath);
        if (stat.isDirectory()) await walk(childPath, depth + 1);
      } catch { continue; }
    }
  }
}
```

- [ ] **Step 4: Test + commit**

```bash
cd verticals/ai-ops-intelligence && npx vitest run tests/adapter-codex.test.ts
git add verticals/ai-ops-intelligence/excavation/adapters/codex.ts verticals/ai-ops-intelligence/tests/adapter-codex.test.ts verticals/ai-ops-intelligence/tests/fixtures/fake-home/repos/proj-a/.codex/
git commit -m "feat(ai-ops): codex adapter — scans .codex/* {md,json,yaml,yml}"
```

### Task 0.25: Gemini CLI adapter

**Files:**
- Create: `verticals/ai-ops-intelligence/tests/adapter-gemini-cli.test.ts`
- Create: fixture `tests/fixtures/fake-home/repos/proj-a/.gemini/config.md`
- Create: `verticals/ai-ops-intelligence/excavation/adapters/gemini-cli.ts`

- [ ] **Step 1: Create fixture**

```bash
mkdir -p verticals/ai-ops-intelligence/tests/fixtures/fake-home/repos/proj-a/.gemini
printf '%s\n' '# Gemini CLI config' 'You are an assistant.' > verticals/ai-ops-intelligence/tests/fixtures/fake-home/repos/proj-a/.gemini/config.md
```

- [ ] **Step 2: Write test**

```typescript
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { geminiCliAdapter } from '../excavation/adapters/gemini-cli.ts';

const FIXTURE_REPOS = path.resolve(__dirname, 'fixtures/fake-home/repos');

describe('gemini-cli adapter', () => {
  it('finds .gemini/*.md and emits entries', async () => {
    const adapter = geminiCliAdapter({ owner: 'tester' });
    const entries = await adapter.scan([FIXTURE_REPOS]);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0].platform).toBe('gemini-cli');
  });
  it('returns [] for missing root', async () => {
    expect(await geminiCliAdapter({ owner: 'tester' }).scan(['/nope'])).toEqual([]);
  });
});
```

- [ ] **Step 3: Write adapter**

```typescript
import { createHash } from 'node:crypto';
import path from 'node:path';
import fs from 'fs-extra';
import type { AssistantEntry, PlatformAdapter } from '../types.ts';

export interface GeminiCliAdapterOptions { owner: string; maxDepth?: number; }

export function geminiCliAdapter(opts: GeminiCliAdapterOptions): PlatformAdapter {
  const maxDepth = opts.maxDepth ?? 4;
  return {
    platform: 'gemini-cli',
    async scan(roots: string[]): Promise<AssistantEntry[]> {
      const entries: AssistantEntry[] = [];
      for (const root of roots) {
        const dirs = await findDirs(root, '.gemini', maxDepth);
        for (const dir of dirs) {
          let files: string[] = [];
          try { files = await fs.readdir(dir); } catch { continue; }
          for (const file of files) {
            if (!/\.(md|json|yaml|yml|toml)$/.test(file)) continue;
            const filePath = path.join(dir, file);
            const stat = await fs.stat(filePath);
            if (!stat.isFile()) continue;
            const projectName = path.basename(path.dirname(dir));
            const slug = `${projectName}-${path.basename(file).replace(/\.[^.]+$/, '')}`
              .toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '');
            const systemPrompt = await fs.readFile(filePath, 'utf8');
            const hash = 'sha256:' + createHash('sha256').update(systemPrompt).digest('hex');
            entries.push({
              slug: slug || 'unknown',
              name: `${projectName} · ${file}`,
              platform: 'gemini-cli',
              owner: opts.owner,
              purpose: `Gemini CLI config at ${projectName}/.gemini/${file}`,
              status: 'active',
              system_prompt_hash: hash,
              system_prompt: systemPrompt,
              attestation: 'built-on-sip-v1.1.1',
              source_path: filePath,
            });
          }
        }
      }
      return entries;
    },
  };
}

async function findDirs(root: string, suffix: string, maxDepth: number): Promise<string[]> {
  const out: string[] = [];
  if (!(await fs.pathExists(root))) return out;
  await walk(root, 0);
  return out;
  async function walk(dir: string, depth: number): Promise<void> {
    if (depth > maxDepth) return;
    const candidate = path.join(dir, suffix);
    if (await fs.pathExists(candidate)) {
      const stat = await fs.stat(candidate);
      if (stat.isDirectory()) out.push(candidate);
    }
    let children: string[] = [];
    try { children = await fs.readdir(dir); } catch { return; }
    for (const child of children) {
      if (child.startsWith('.') || child === 'node_modules' || child === '_archive') continue;
      const childPath = path.join(dir, child);
      try {
        const stat = await fs.stat(childPath);
        if (stat.isDirectory()) await walk(childPath, depth + 1);
      } catch { continue; }
    }
  }
}
```

- [ ] **Step 4: Test + commit**

```bash
cd verticals/ai-ops-intelligence && npx vitest run tests/adapter-gemini-cli.test.ts
git add verticals/ai-ops-intelligence/excavation/adapters/gemini-cli.ts verticals/ai-ops-intelligence/tests/adapter-gemini-cli.test.ts verticals/ai-ops-intelligence/tests/fixtures/fake-home/repos/proj-a/.gemini/
git commit -m "feat(ai-ops): gemini-cli adapter — scans .gemini/* {md,json,yaml,yml,toml}"
```

### Task 0.26: Antigravity adapter

**Files:**
- Create: `verticals/ai-ops-intelligence/tests/adapter-antigravity.test.ts`
- Create: fixture `tests/fixtures/fake-home/repos/proj-a/.antigravity/config.md`
- Create: `verticals/ai-ops-intelligence/excavation/adapters/antigravity.ts`

- [ ] **Step 1: Create fixture**

```bash
mkdir -p verticals/ai-ops-intelligence/tests/fixtures/fake-home/repos/proj-a/.antigravity
printf '%s\n' '# Antigravity config' 'rules ...' > verticals/ai-ops-intelligence/tests/fixtures/fake-home/repos/proj-a/.antigravity/config.md
```

- [ ] **Step 2: Write test**

```typescript
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { antigravityAdapter } from '../excavation/adapters/antigravity.ts';

const FIXTURE_REPOS = path.resolve(__dirname, 'fixtures/fake-home/repos');

describe('antigravity adapter', () => {
  it('finds .antigravity/*.md and emits entries', async () => {
    const adapter = antigravityAdapter({ owner: 'tester' });
    const entries = await adapter.scan([FIXTURE_REPOS]);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0].platform).toBe('antigravity');
  });
  it('returns [] for missing root', async () => {
    expect(await antigravityAdapter({ owner: 'tester' }).scan(['/nope'])).toEqual([]);
  });
});
```

- [ ] **Step 3: Write adapter**

```typescript
import { createHash } from 'node:crypto';
import path from 'node:path';
import fs from 'fs-extra';
import type { AssistantEntry, PlatformAdapter } from '../types.ts';

export interface AntigravityAdapterOptions { owner: string; maxDepth?: number; }

export function antigravityAdapter(opts: AntigravityAdapterOptions): PlatformAdapter {
  const maxDepth = opts.maxDepth ?? 4;
  return {
    platform: 'antigravity',
    async scan(roots: string[]): Promise<AssistantEntry[]> {
      const entries: AssistantEntry[] = [];
      for (const root of roots) {
        const dirs = await findDirs(root, '.antigravity', maxDepth);
        for (const dir of dirs) {
          let files: string[] = [];
          try { files = await fs.readdir(dir); } catch { continue; }
          for (const file of files) {
            if (!/\.(md|json|yaml|yml|toml)$/.test(file)) continue;
            const filePath = path.join(dir, file);
            const stat = await fs.stat(filePath);
            if (!stat.isFile()) continue;
            const projectName = path.basename(path.dirname(dir));
            const slug = `${projectName}-${path.basename(file).replace(/\.[^.]+$/, '')}`
              .toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '');
            const systemPrompt = await fs.readFile(filePath, 'utf8');
            const hash = 'sha256:' + createHash('sha256').update(systemPrompt).digest('hex');
            entries.push({
              slug: slug || 'unknown',
              name: `${projectName} · ${file}`,
              platform: 'antigravity',
              owner: opts.owner,
              purpose: `Antigravity config at ${projectName}/.antigravity/${file}`,
              status: 'active',
              system_prompt_hash: hash,
              system_prompt: systemPrompt,
              attestation: 'built-on-sip-v1.1.1',
              source_path: filePath,
            });
          }
        }
      }
      return entries;
    },
  };
}

async function findDirs(root: string, suffix: string, maxDepth: number): Promise<string[]> {
  const out: string[] = [];
  if (!(await fs.pathExists(root))) return out;
  await walk(root, 0);
  return out;
  async function walk(dir: string, depth: number): Promise<void> {
    if (depth > maxDepth) return;
    const candidate = path.join(dir, suffix);
    if (await fs.pathExists(candidate)) {
      const stat = await fs.stat(candidate);
      if (stat.isDirectory()) out.push(candidate);
    }
    let children: string[] = [];
    try { children = await fs.readdir(dir); } catch { return; }
    for (const child of children) {
      if (child.startsWith('.') || child === 'node_modules' || child === '_archive') continue;
      const childPath = path.join(dir, child);
      try {
        const stat = await fs.stat(childPath);
        if (stat.isDirectory()) await walk(childPath, depth + 1);
      } catch { continue; }
    }
  }
}
```

- [ ] **Step 4: Test + commit**

```bash
cd verticals/ai-ops-intelligence && npx vitest run tests/adapter-antigravity.test.ts
git add verticals/ai-ops-intelligence/excavation/adapters/antigravity.ts verticals/ai-ops-intelligence/tests/adapter-antigravity.test.ts verticals/ai-ops-intelligence/tests/fixtures/fake-home/repos/proj-a/.antigravity/
git commit -m "feat(ai-ops): antigravity adapter — completes Phase 0 adapter set (6 of 11 platforms)"
```

---

## Markdown emitter

### Task 0.27: Write failing test for emitter

**Files:**
- Create: `verticals/ai-ops-intelligence/tests/emitter.test.ts`

- [ ] **Step 1: Write the test**

```typescript
import { describe, it, expect } from 'vitest';
import { renderEntry } from '../excavation/emitter.ts';
import type { AssistantEntry } from '../excavation/types.ts';

describe('markdown emitter', () => {
  const entry: AssistantEntry = {
    slug: 'frankx-architect',
    name: 'FrankX Architect',
    platform: 'cursor',
    owner: 'frank',
    purpose: 'Architect voice for Cursor',
    status: 'active',
    system_prompt_hash: 'sha256:' + 'a'.repeat(64),
    system_prompt: 'You are an architect.',
    attestation: 'built-on-sip-v1.1.1',
    source_path: '/home/frank/repos/proj/.cursor/rules/main.md',
  };

  it('produces frontmatter + body with attestation footer', () => {
    const md = renderEntry(entry);
    expect(md).toMatch(/^---\n/);
    expect(md).toMatch(/slug: frankx-architect/);
    expect(md).toMatch(/platform: cursor/);
    expect(md).toMatch(/system_prompt_hash: sha256:/);
    expect(md).toMatch(/# FrankX Architect/);
    expect(md).toMatch(/Built on SIP/);
  });

  it('round-trips: frontmatter parses back to the same entry shape', async () => {
    const matter = await import('gray-matter');
    const md = renderEntry(entry);
    const parsed = matter.default(md);
    expect(parsed.data.slug).toBe(entry.slug);
    expect(parsed.data.platform).toBe(entry.platform);
    expect(parsed.data.attestation).toBe(entry.attestation);
  });
});
```

- [ ] **Step 2: Verify failure**

```bash
cd verticals/ai-ops-intelligence && npx vitest run tests/emitter.test.ts
```

Expected: FAIL — module not found.

### Task 0.28: Implement emitter

**Files:**
- Create: `verticals/ai-ops-intelligence/excavation/emitter.ts`

- [ ] **Step 1: Write emitter**

```typescript
import matter from 'gray-matter';
import type { AssistantEntry } from './types.ts';

export function renderEntry(entry: AssistantEntry): string {
  const body = [
    `# ${entry.name}`,
    '',
    `> Excavated by /ai-ops-excavate · Phase 0 entry.`,
    '',
    entry.system_prompt
      ? '## Captured system prompt\n\n```\n' + entry.system_prompt.replace(/```/g, '` ``') + '\n```'
      : '_(no captured system prompt)_',
    '',
    '---',
    '',
    '**Built on SIP** · AI Ops Intelligence v0.1',
    '',
  ].join('\n');

  const frontmatter: Record<string, unknown> = {
    slug: entry.slug,
    name: entry.name,
    platform: entry.platform,
    owner: entry.owner,
    purpose: entry.purpose,
    status: entry.status,
    system_prompt_hash: entry.system_prompt_hash,
    attestation: entry.attestation,
  };
  if (entry.kb_sources) frontmatter.kb_sources = entry.kb_sources;
  if (entry.last_reviewed !== undefined) frontmatter.last_reviewed = entry.last_reviewed;
  if (entry.last_verdict) frontmatter.last_verdict = entry.last_verdict;
  if (entry.last_council_readout !== undefined) frontmatter.last_council_readout = entry.last_council_readout;
  if (entry.notion_page_id !== undefined) frontmatter.notion_page_id = entry.notion_page_id;
  if (entry.source_path) frontmatter.source_path = entry.source_path;

  return matter.stringify(body, frontmatter);
}
```

- [ ] **Step 2: Run tests + commit**

```bash
cd verticals/ai-ops-intelligence && npx vitest run tests/emitter.test.ts
git add verticals/ai-ops-intelligence/excavation/emitter.ts verticals/ai-ops-intelligence/tests/emitter.test.ts
git commit -m "feat(ai-ops): markdown emitter with frontmatter + attestation footer

Round-trips via gray-matter. Ambient attestation footer per v7.4 pattern
— '/sip-attest' is not required on forward-generated entries."
```

---

## CLI: /ai-ops-excavate

### Task 0.29: Write failing test for excavate CLI

**Files:**
- Create: `verticals/ai-ops-intelligence/tests/cli-excavate.test.ts`

- [ ] **Step 1: Write the test**

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import fs from 'fs-extra';
import { runExcavate } from '../excavation/cli-excavate.ts';

const FIXTURE_HOME = path.resolve(__dirname, 'fixtures/fake-home');
const OUT_DIR = path.resolve(__dirname, 'fixtures/out/memory/ai-ops');

describe('cli-excavate', () => {
  beforeEach(async () => { await fs.remove(path.dirname(path.dirname(OUT_DIR))); });
  afterEach(async () => { await fs.remove(path.dirname(path.dirname(OUT_DIR))); });

  it('writes one .md per discovered entry, organized by platform', async () => {
    const result = await runExcavate({
      home: FIXTURE_HOME,
      roots: [path.join(FIXTURE_HOME, 'repos')],
      owner: 'tester',
      outDir: OUT_DIR,
    });
    expect(result.entries).toBeGreaterThan(0);
    expect(result.byPlatform['claude-code']).toBeGreaterThanOrEqual(1);
    expect(result.byPlatform['cursor']).toBeGreaterThanOrEqual(1);
    expect(await fs.pathExists(path.join(OUT_DIR, 'claude-code'))).toBe(true);
  });

  it('writes excavation.log with adapter results', async () => {
    await runExcavate({
      home: FIXTURE_HOME,
      roots: [path.join(FIXTURE_HOME, 'repos')],
      owner: 'tester',
      outDir: OUT_DIR,
    });
    const log = await fs.readFile(path.join(OUT_DIR, 'excavation.log'), 'utf8');
    expect(log).toMatch(/claude-code/);
    expect(log).toMatch(/cursor/);
  });
});
```

- [ ] **Step 2: Verify failure**

```bash
cd verticals/ai-ops-intelligence && npx vitest run tests/cli-excavate.test.ts
```

Expected: FAIL — module not found.

### Task 0.30: Implement excavate CLI

**Files:**
- Create: `verticals/ai-ops-intelligence/excavation/cli-excavate.ts`

- [ ] **Step 1: Write the CLI module**

```typescript
import path from 'node:path';
import fs from 'fs-extra';
import { walk, type WalkLogEntry } from './walker.ts';
import { renderEntry } from './emitter.ts';
import { validateEntry } from './schema-validator.ts';
import { claudeCodeAdapter } from './adapters/claude-code.ts';
import { cursorAdapter } from './adapters/cursor.ts';
import { clineAdapter } from './adapters/cline.ts';
import { codexAdapter } from './adapters/codex.ts';
import { geminiCliAdapter } from './adapters/gemini-cli.ts';
import { antigravityAdapter } from './adapters/antigravity.ts';
import type { Platform } from './types.ts';

export interface ExcavateOptions {
  home: string;
  roots: string[];
  owner: string;
  outDir: string;
}

export interface ExcavateResult {
  entries: number;
  byPlatform: Record<Platform | string, number>;
  log: WalkLogEntry[];
  skipped: Array<{ slug: string; reason: string }>;
}

export async function runExcavate(opts: ExcavateOptions): Promise<ExcavateResult> {
  const adapters = [
    claudeCodeAdapter({ home: opts.home, owner: opts.owner }),
    cursorAdapter({ owner: opts.owner }),
    clineAdapter({ owner: opts.owner }),
    codexAdapter({ owner: opts.owner }),
    geminiCliAdapter({ owner: opts.owner }),
    antigravityAdapter({ owner: opts.owner }),
  ];
  const log: WalkLogEntry[] = [];
  const entries = await walk({ roots: opts.roots, owner: opts.owner }, adapters, log);

  const byPlatform: Record<string, number> = {};
  const skipped: Array<{ slug: string; reason: string }> = [];

  await fs.ensureDir(opts.outDir);

  for (const entry of entries) {
    const v = validateEntry(entry);
    if (!v.valid) {
      skipped.push({ slug: entry.slug, reason: (v.errors ?? []).join('; ') });
      continue;
    }
    const platformDir = path.join(opts.outDir, entry.platform);
    await fs.ensureDir(platformDir);
    const filename = `${entry.slug}.md`;
    const filePath = path.join(platformDir, filename);
    await fs.writeFile(filePath, renderEntry(entry), 'utf8');
    byPlatform[entry.platform] = (byPlatform[entry.platform] ?? 0) + 1;
  }

  await fs.writeFile(
    path.join(opts.outDir, 'excavation.log'),
    log.map((l) => JSON.stringify(l)).join('\n') + '\n',
    'utf8',
  );

  return { entries: entries.length, byPlatform, log, skipped };
}

// CLI entry point (invoked by `npm run excavate` or directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  const os = await import('node:os');
  const home = os.homedir();
  const roots = [home];
  const result = await runExcavate({
    home,
    roots,
    owner: 'frank',
    outDir: path.resolve(process.cwd(), 'memory/ai-ops'),
  });
  console.log(JSON.stringify(result, null, 2));
}
```

- [ ] **Step 2: Run tests to verify pass**

```bash
cd verticals/ai-ops-intelligence && npx vitest run tests/cli-excavate.test.ts
```

Expected: 2 tests PASS.

### Task 0.31: Wire /ai-ops-excavate as Claude Code command

**Files:**
- Create: `.claude/commands/ai-ops-excavate.md`

- [ ] **Step 1: Write the command file**

```markdown
---
description: Excavate AI assistants from filesystem into the AI Ops Intelligence registry
---

# /ai-ops-excavate

Run the Phase 0 excavation walker over the supported file-based platforms and write `memory/ai-ops/{platform}/{slug}.md` for every discovered assistant.

## Behavior

1. Walks 6 platforms: claude-code, cursor, cline, codex, gemini-cli, antigravity
2. Validates every entry against `verticals/ai-ops-intelligence/schemas/assistant.schema.json`
3. Writes valid entries to `memory/ai-ops/{platform}/{slug}.md`
4. Writes `memory/ai-ops/excavation.log` with per-adapter results
5. Returns summary (count + by-platform breakdown + skipped)

## Usage

From the repository root:

```bash
cd verticals/ai-ops-intelligence && npm run excavate
```

Phase 0 default roots: `$HOME`. Override by editing `excavation/cli-excavate.ts` CLI entry point.

## Phase 0 scope reminder

This is the schema-vs-reality gate. After running excavate:

1. Run `/ai-ops-list` to inspect the output
2. Count how many schema fields needed real-data changes
3. If ≥3 changes → halt; return to brainstorming for schema refit per spec §3.5

---

**Built on SIP** · AI Ops Intelligence v0.1 (Phase 0)
```

- [ ] **Step 2: Commit excavate CLI + command**

```bash
git add verticals/ai-ops-intelligence/excavation/cli-excavate.ts verticals/ai-ops-intelligence/tests/cli-excavate.test.ts .claude/commands/ai-ops-excavate.md
git commit -m "feat(ai-ops): /ai-ops-excavate command + CLI runner

Wires 6 adapters into the walker, validates every entry, writes
memory/ai-ops/{platform}/{slug}.md, logs adapter results to
excavation.log. Per-spec graceful degradation: invalid entries are
skipped + reported in result.skipped, never crash."
```

---

## CLI: /ai-ops-list

### Task 0.32: Write failing test for list CLI

**Files:**
- Create: `verticals/ai-ops-intelligence/tests/cli-list.test.ts`

- [ ] **Step 1: Write the test**

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import fs from 'fs-extra';
import { runList } from '../commands/cli-list.ts';

const FIXTURE_OUT = path.resolve(__dirname, 'fixtures/listed-fleet');

describe('cli-list', () => {
  beforeEach(async () => {
    await fs.remove(FIXTURE_OUT);
    await fs.ensureDir(path.join(FIXTURE_OUT, 'cursor'));
    await fs.writeFile(
      path.join(FIXTURE_OUT, 'cursor', 'fake-rule.md'),
      `---\nslug: fake-rule\nname: Fake Rule\nplatform: cursor\nowner: tester\npurpose: test\nstatus: active\nsystem_prompt_hash: sha256:${'a'.repeat(64)}\nattestation: built-on-sip-v1.0.0\n---\n\n# Fake Rule\n`,
    );
  });
  afterEach(async () => { await fs.remove(FIXTURE_OUT); });

  it('reads registry and returns entries grouped by platform', async () => {
    const result = await runList({ registryDir: FIXTURE_OUT });
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].platform).toBe('cursor');
    expect(result.entries[0].slug).toBe('fake-rule');
    expect(result.byPlatform.cursor).toBe(1);
  });

  it('returns empty result for non-existent registry', async () => {
    const result = await runList({ registryDir: '/no/such/dir' });
    expect(result.entries).toEqual([]);
  });
});
```

- [ ] **Step 2: Verify failure**

```bash
cd verticals/ai-ops-intelligence && npx vitest run tests/cli-list.test.ts
```

Expected: FAIL — module not found.

### Task 0.33: Implement list CLI

**Files:**
- Create: `verticals/ai-ops-intelligence/commands/cli-list.ts`

- [ ] **Step 1: Write the list module**

```typescript
import path from 'node:path';
import fs from 'fs-extra';
import matter from 'gray-matter';
import type { AssistantEntry, Platform } from '../excavation/types.ts';

export interface ListOptions {
  registryDir: string;
  platformFilter?: Platform;
  staleAfterDays?: number;
}

export interface ListResult {
  entries: AssistantEntry[];
  byPlatform: Record<string, number>;
  staleCount: number;
}

export async function runList(opts: ListOptions): Promise<ListResult> {
  if (!(await fs.pathExists(opts.registryDir))) {
    return { entries: [], byPlatform: {}, staleCount: 0 };
  }
  const platformDirs = await fs.readdir(opts.registryDir, { withFileTypes: true });
  const entries: AssistantEntry[] = [];
  for (const d of platformDirs) {
    if (!d.isDirectory()) continue;
    if (opts.platformFilter && d.name !== opts.platformFilter) continue;
    const dirPath = path.join(opts.registryDir, d.name);
    const files = await fs.readdir(dirPath);
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      const filePath = path.join(dirPath, file);
      const raw = await fs.readFile(filePath, 'utf8');
      const parsed = matter(raw);
      entries.push(parsed.data as AssistantEntry);
    }
  }
  const byPlatform: Record<string, number> = {};
  for (const e of entries) byPlatform[e.platform] = (byPlatform[e.platform] ?? 0) + 1;
  const cutoff =
    opts.staleAfterDays !== undefined
      ? Date.now() - opts.staleAfterDays * 24 * 60 * 60 * 1000
      : null;
  const staleCount = cutoff === null
    ? 0
    : entries.filter((e) => !e.last_reviewed || new Date(e.last_reviewed).getTime() < cutoff).length;
  return { entries, byPlatform, staleCount };
}

export function formatTable(entries: AssistantEntry[]): string {
  if (entries.length === 0) return '(no registered assistants — run /ai-ops-excavate)';
  const header = ['PLATFORM', 'SLUG', 'NAME', 'STATUS', 'LAST_REVIEWED'];
  const rows = entries.map((e) => [
    e.platform,
    e.slug,
    e.name.slice(0, 40),
    e.status,
    e.last_reviewed ?? 'unreviewed',
  ]);
  const widths = header.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => r[i].length)),
  );
  const fmt = (row: string[]) =>
    row.map((c, i) => c.padEnd(widths[i])).join('  ');
  return [fmt(header), fmt(widths.map((w) => '-'.repeat(w))), ...rows.map(fmt)].join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const registryDir = path.resolve(process.cwd(), 'memory/ai-ops');
  const result = await runList({ registryDir });
  console.log(formatTable(result.entries));
  console.log('');
  console.log(`Total: ${result.entries.length} · By platform: ${JSON.stringify(result.byPlatform)}`);
}
```

- [ ] **Step 2: Verify tests pass**

```bash
cd verticals/ai-ops-intelligence && npx vitest run tests/cli-list.test.ts
```

Expected: 2 tests PASS.

### Task 0.34: Wire /ai-ops-list as Claude Code command

**Files:**
- Create: `.claude/commands/ai-ops-list.md`

- [ ] **Step 1: Write the command file**

```markdown
---
description: List the AI Ops Intelligence registry as a table
---

# /ai-ops-list

Read `memory/ai-ops/{platform}/{slug}.md` files and print a table grouped by platform.

## Usage

From the repository root:

```bash
cd verticals/ai-ops-intelligence && npm run list
```

## Output

```
PLATFORM       SLUG                  NAME                  STATUS    LAST_REVIEWED
-------------  --------------------  --------------------  --------  -------------
cursor         frankx-architect      FrankX Architect      active    unreviewed
claude-code    starlight-intel       Starlight Intel       active    unreviewed
...

Total: N · By platform: { "cursor": X, "claude-code": Y, ... }
```

## Phase 0 scope reminder

If the list is empty after running /ai-ops-excavate, check `memory/ai-ops/excavation.log` for adapter errors.

---

**Built on SIP** · AI Ops Intelligence v0.1 (Phase 0)
```

- [ ] **Step 2: Commit list CLI + command**

```bash
git add verticals/ai-ops-intelligence/commands/cli-list.ts verticals/ai-ops-intelligence/tests/cli-list.test.ts .claude/commands/ai-ops-list.md
git commit -m "feat(ai-ops): /ai-ops-list command + table formatter

Reads memory/ai-ops/{platform}/{slug}.md via gray-matter; prints
plain-text table grouped by platform. Phase 0 minimal — no filters
beyond --platform / --stale come later."
```

---

## Phase 0 gate — schema-vs-reality

### Task 0.35: Run /ai-ops-excavate on real fleet

- [ ] **Step 1: Execute**

```bash
cd verticals/ai-ops-intelligence && npm run excavate
```

Expected: JSON summary printed. `result.entries` > 0. `result.byPlatform` populated with at least 2-3 platforms.

- [ ] **Step 2: Inspect output**

```bash
ls -la memory/ai-ops/
find memory/ai-ops -name '*.md' -type f | head -20
cat memory/ai-ops/excavation.log
```

Expected: directories per platform; .md files inside; log JSON lines per adapter.

### Task 0.36: Run /ai-ops-list

- [ ] **Step 1: Execute**

```bash
cd verticals/ai-ops-intelligence && npm run list
```

Expected: table printed. Count matches `excavate` result.

### Task 0.37: Schema-vs-reality reflection (manual, ~10 min)

- [ ] **Step 1: Examine a sample of emitted .md files**

```bash
find memory/ai-ops -name '*.md' -type f | shuf -n 5 | xargs -I{} sh -c 'echo "=== {} ===" && head -25 {}'
```

- [ ] **Step 2: Ask each diagnostic question and write notes inline in this plan**

For each question, write notes here:

1. **Was every emitted entry's frontmatter useful?** (i.e., do all 8 required fields make sense for every real assistant, or do some feel wrong/missing?)
   - notes: _____

2. **Were there platforms where the slug derivation produced collisions or garbage?**
   - notes: _____

3. **Was the system_prompt field meaningfully populated, or empty for most?** (Empty for most → may need a different shape; e.g., `config_files` array instead of a single prompt.)
   - notes: _____

4. **Were there real assistants the adapters MISSED?** (e.g., per-project Claude Code configs that aren't in `~/.claude/projects/`)
   - notes: _____

5. **Were there false positives?** (e.g., `.cursor/rules/` directories that aren't really AI assistants but build configuration)
   - notes: _____

6. **Did any schema field have to be NULL/empty for >50% of entries?** (Suggests it should be optional, or the schema should split into base + platform-specific extensions)
   - notes: _____

### Task 0.38: Gate decision (no-code)

- [ ] **Step 1: Count required schema changes**

Based on Task 0.37 reflection, list every concrete schema change required:

Count: _____

- [ ] **Step 2: Apply gate per spec §3.5**

- If count ≤ 2 → **PASS** → proceed to write Phase 1-9 plan
- If count ≥ 3 → **FAIL** → halt; spec §3.5 falsifier triggered; return to brainstorming

- [ ] **Step 3: Document the decision**

Write a one-paragraph gate-decision note inline in this plan, including:

- Count of schema changes needed
- Decision (PASS / FAIL)
- If PASS: any non-blocking changes to roll into Phase 1
- If FAIL: list of schema issues for brainstorming

- [ ] **Step 4: Commit the gate decision**

```bash
git add docs/superpowers/plans/2026-05-17-ai-ops-intelligence-phase0.md memory/ai-ops/
git commit -m "feat(ai-ops): Phase 0 gate decision — {PASS|FAIL}

{One-paragraph explanation. If PASS: schema survived contact with
real data; Phase 1-9 plan unblocked. If FAIL: list schema issues
forcing brainstorming refit per spec §3.5 falsifier.}

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## End of Phase 0

If gate PASSED: announce to user, then invoke writing-plans skill again to produce the Phase 1-9 plan (council, CoE, sync, global install, ACOS bridge — covering the spec §13 steps 1-15 minus what Phase 0 already shipped).

If gate FAILED: announce to user, halt implementation, return to brainstorming skill to refit the schema based on what Phase 0 revealed.

---

## Self-review checklist (run before announcing plan complete)

- [ ] **Spec coverage:** every Phase 0 spec requirement (§3.5 gate, schema §5, walker §4.1, error handling §7) has at least one task above. ✓ verified
- [ ] **Placeholder scan:** no "TBD", "implement later", "add appropriate error handling", or "similar to Task N (without repeating code)". ✓ all adapter code repeated despite similarity
- [ ] **Type consistency:** `Platform`, `AssistantEntry`, `PlatformAdapter`, `ScanContext`, `walk()`, `validateEntry()`, `renderEntry()`, `runExcavate()`, `runList()` named consistently across all tasks. ✓
- [ ] **Real code:** every TDD task has full test code + full impl code + exact run command + expected output. ✓

---

**Built on SIP** · AI Ops Intelligence v0.1 (Phase 0) · MIT
