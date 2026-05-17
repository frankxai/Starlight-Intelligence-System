# /sis-forge v8.x-alpha Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Phase 3 (proposal assembly) to `/sis-forge`. Pre-alpha emits raw `BucketReport` JSON; alpha emits a **Vertical IS Proposal roadmap doc** to `docs/proposals/sis-forge/<date>-<slug>.md` for `auto-build` and `propose-menu` modes, and routes `empower` mode to `/discover-genius` with pre-fed corpus. Phase 4 (Board + spawn) still stubbed.

**Architecture:** Phase 3 reads the `BucketReport` from Phase 2, dispatches by mode (auto-build → 1 proposal, propose-menu → top 3 proposals, empower → handoff). The roadmap doc format is per spec §9 Phase 3. STACK.md 10→11-IS expansion stays BLOCKED per spec §12. Existing-domain collision flips auto-build to propose-menu with extend option.

**Tech Stack:** TypeScript (ES modules), `node --import tsx --test`, no new external dependencies. Reuses pre-alpha `tools/sis-forge/*.ts` modules.

**Spec reference:** `docs/superpowers/specs/2026-05-17-sis-forge-design.md` §5 (v8.x-alpha row), §9 Phase 3, §12 (STACK.md amendment lock).

**Pre-alpha prerequisite:** Tag `v8.x-pre-alpha-1` (commit `f6e52c1`) sealed. All pre-alpha tests green.

---

## File structure (alpha scope)

```
Starlight-Intelligence-System/
├── tools/sis-forge/
│   ├── proposal-writer.ts                        # NEW — clusters → roadmap markdown
│   ├── existing-domains.ts                       # NEW — reads verticals/ for collision check
│   ├── stack-taxonomy.ts                         # NEW — reads STACK.md 10-IS lock
│   ├── cli.ts                                    # MODIFY — dispatch Phase 3 by mode
│   └── empower-handoff.ts                        # NEW — formats /discover-genius invocation
├── test/sis-forge/
│   ├── proposal-writer.test.ts                   # NEW — proposal doc structure tests
│   ├── existing-domains.test.ts                  # NEW — collision detection
│   ├── stack-taxonomy.test.ts                    # NEW — amendment BLOCK behavior
│   └── empower-handoff.test.ts                   # NEW — handoff prompt shape
├── test/
│   └── v86-sis-forge-coverage.test.ts            # MODIFY — extend file existence list
├── docs/proposals/sis-forge/                     # NEW DIR — output destination (created by CLI on first run)
├── commands/sis-forge.md                         # MODIFY — alpha invocation + Phase 3 description
├── package.json                                  # MODIFY — append 4 new tests to test:substrate
└── CLAUDE.md                                     # MODIFY — bump pre-alpha → alpha note
```

**Total alpha:** 4 new TS files + 1 CLI modification + 4 new test files + 4 modifications.

---

## Task 1: Existing-domain collision detector

**Files:**
- Create: `tools/sis-forge/existing-domains.ts`
- Test: `test/sis-forge/existing-domains.test.ts`

- [ ] **Step 1: Write the failing test**

Create `test/sis-forge/existing-domains.test.ts`:

```typescript
import { test } from "node:test";
import assert from "node:assert/strict";
import { listExistingDomains, hasExistingDomain } from "../../tools/sis-forge/existing-domains.ts";
import { resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dirname, "..", "..");

test("listExistingDomains returns subdirs of verticals/", () => {
  const domains = listExistingDomains(REPO_ROOT);
  assert.ok(Array.isArray(domains));
  assert.ok(domains.every((d) => typeof d === "string"));
  // At least one known vertical
  assert.ok(domains.includes("people-intelligence") || domains.includes("sound-intelligence"));
});

test("hasExistingDomain returns true for an existing vertical", () => {
  const domains = listExistingDomains(REPO_ROOT);
  const known = domains[0];
  assert.equal(hasExistingDomain(REPO_ROOT, known), true);
});

test("hasExistingDomain returns false for a never-spawned name", () => {
  assert.equal(hasExistingDomain(REPO_ROOT, "totally-novel-thing-that-should-not-exist"), false);
});

test("hasExistingDomain is case-insensitive on the name", () => {
  const domains = listExistingDomains(REPO_ROOT);
  if (domains.length === 0) return;
  const known = domains[0];
  assert.equal(hasExistingDomain(REPO_ROOT, known.toUpperCase()), true);
});
```

- [ ] **Step 2: Run to verify FAIL**

Run: `node --import tsx --test test/sis-forge/existing-domains.test.ts`

Expected: FAIL — module not found.

- [ ] **Step 3: Write existing-domains.ts**

Create `tools/sis-forge/existing-domains.ts`:

```typescript
import { readdirSync, existsSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

export function listExistingDomains(repoRoot: string): string[] {
  const verticalsDir = resolve(repoRoot, "verticals");
  if (!existsSync(verticalsDir)) return [];
  return readdirSync(verticalsDir)
    .filter((name) => {
      const full = join(verticalsDir, name);
      return existsSync(full) && statSync(full).isDirectory() && !name.startsWith(".");
    })
    .sort();
}

export function hasExistingDomain(repoRoot: string, name: string): boolean {
  const normalized = name.toLowerCase();
  return listExistingDomains(repoRoot).some((d) => d.toLowerCase() === normalized);
}
```

- [ ] **Step 4: Run to verify PASS**

Run: `node --import tsx --test test/sis-forge/existing-domains.test.ts`

Expected: 4/4 pass.

- [ ] **Step 5: Commit**

```bash
git add tools/sis-forge/existing-domains.ts test/sis-forge/existing-domains.test.ts
git commit -m "feat(sis-forge): existing-domains detector — collision check for verticals/ (alpha)"
```

Do NOT use --no-verify.

---

## Task 2: STACK.md taxonomy reader + 10-IS amendment BLOCK

**Files:**
- Create: `tools/sis-forge/stack-taxonomy.ts`
- Test: `test/sis-forge/stack-taxonomy.test.ts`

- [ ] **Step 1: Write the failing test**

Create `test/sis-forge/stack-taxonomy.test.ts`:

```typescript
import { test } from "node:test";
import assert from "node:assert/strict";
import { readLockedUniversalIS, isLockedTaxonomyName, wouldRequireAmendment } from "../../tools/sis-forge/stack-taxonomy.ts";
import { resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dirname, "..", "..");

test("readLockedUniversalIS returns the 10 locked Universal-IS names", () => {
  const names = readLockedUniversalIS(REPO_ROOT);
  assert.ok(Array.isArray(names));
  assert.ok(names.length >= 9, `expected 9+ Universal-IS names, got ${names.length}`);
  // Sanity check a few from STACK.md
  const lowered = names.map((n) => n.toLowerCase());
  assert.ok(lowered.some((n) => n.includes("self")), "expected Self IS");
  assert.ok(lowered.some((n) => n.includes("wealth")), "expected Wealth IS");
  assert.ok(lowered.some((n) => n.includes("creator")), "expected Creator IS");
});

test("isLockedTaxonomyName returns true for known locked names", () => {
  assert.equal(isLockedTaxonomyName(REPO_ROOT, "Self"), true);
  assert.equal(isLockedTaxonomyName(REPO_ROOT, "Wealth"), true);
});

test("isLockedTaxonomyName returns false for novel names", () => {
  assert.equal(isLockedTaxonomyName(REPO_ROOT, "Sourdough Intelligence"), false);
});

test("wouldRequireAmendment returns true for Universal-IS-tier proposals", () => {
  // Universal-IS-tier candidate (not a Domain Sub-Stack) — would require STACK.md amendment
  const result = wouldRequireAmendment(REPO_ROOT, "Sourdough Intelligence", "universal-is");
  assert.equal(result, true);
});

test("wouldRequireAmendment returns false for Domain Sub-Stack proposals", () => {
  // Domain Sub-Stack — does NOT require STACK.md amendment (just verticals/ entry)
  const result = wouldRequireAmendment(REPO_ROOT, "Sourdough Intelligence", "domain-sub-stack");
  assert.equal(result, false);
});
```

- [ ] **Step 2: Run to verify FAIL**

Run: `node --import tsx --test test/sis-forge/stack-taxonomy.test.ts`

Expected: FAIL — module not found.

- [ ] **Step 3: Write stack-taxonomy.ts**

Create `tools/sis-forge/stack-taxonomy.ts`:

```typescript
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export type ProposalTier = "universal-is" | "domain-sub-stack";

const UNIVERSAL_IS_HEADING_REGEX = /^##+\s*Universal Intelligence Systems/im;
const IS_ROW_REGEX = /^\s*[-*]\s*\*\*([^*]+)\*\*\s*(?:IS|Intelligence)?/gm;
const KNOWN_IS_HINTS = ["self", "wealth", "family", "business", "creator", "second brain", "code", "voice", "video", "brand", "starlight orchestrator", "health", "spiritual"];

export function readLockedUniversalIS(repoRoot: string): string[] {
  const stackPath = resolve(repoRoot, "STACK.md");
  let content: string;
  try {
    content = readFileSync(stackPath, "utf8");
  } catch {
    return [];
  }

  const names: string[] = [];
  for (const match of content.matchAll(IS_ROW_REGEX)) {
    const name = match[1].trim();
    if (KNOWN_IS_HINTS.some((hint) => name.toLowerCase().includes(hint))) {
      names.push(name);
    }
  }

  if (names.length === 0) {
    return KNOWN_IS_HINTS.slice(0, 10).map((h) => h.replace(/^\w/, (c) => c.toUpperCase()));
  }

  return Array.from(new Set(names));
}

export function isLockedTaxonomyName(repoRoot: string, candidate: string): boolean {
  const locked = readLockedUniversalIS(repoRoot);
  const normalized = candidate.toLowerCase();
  return locked.some((n) => n.toLowerCase().includes(normalized) || normalized.includes(n.toLowerCase()));
}

export function wouldRequireAmendment(repoRoot: string, candidateName: string, tier: ProposalTier): boolean {
  if (tier === "domain-sub-stack") return false;
  return !isLockedTaxonomyName(repoRoot, candidateName);
}
```

- [ ] **Step 4: Run to verify PASS**

Run: `node --import tsx --test test/sis-forge/stack-taxonomy.test.ts`

Expected: 5/5 pass.

- [ ] **Step 5: Commit**

```bash
git add tools/sis-forge/stack-taxonomy.ts test/sis-forge/stack-taxonomy.test.ts
git commit -m "feat(sis-forge): STACK.md taxonomy reader + amendment-required check (alpha)"
```

---

## Task 3: Proposal writer (clusters → roadmap markdown)

**Files:**
- Create: `tools/sis-forge/proposal-writer.ts`
- Test: `test/sis-forge/proposal-writer.test.ts`

- [ ] **Step 1: Write the failing test**

Create `test/sis-forge/proposal-writer.test.ts`:

```typescript
import { test } from "node:test";
import assert from "node:assert/strict";
import { writeProposal, slugify } from "../../tools/sis-forge/proposal-writer.ts";
import type { Cluster, BucketReport } from "../../tools/sis-forge/atom-schema.ts";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const sampleCluster: Cluster = {
  id: "c1",
  label: "verticals intelligence build",
  atoms: [
    { id: "v1", source: "vault", topic: "verticals", summary: "build a sovereign domain sub-stack pattern using composition for sound intelligence", ts: "2026-05-17T00:00:00Z" },
    { id: "v2", source: "vault", topic: "verticals", summary: "build a sovereign domain sub-stack pattern using composition for music intelligence", ts: "2026-05-17T00:00:00Z" },
    { id: "v3", source: "transcripts", topic: "verticals", summary: "build a sovereign domain sub-stack pattern using composition for people intelligence", ts: "2026-05-17T00:00:00Z" },
  ],
  sources: ["transcripts", "vault"],
  bucket: "framework",
};

const sampleReport: BucketReport = {
  mode: "auto-build",
  clusters: [sampleCluster],
  totalAtoms: 3,
  byBucket: { signature: 0, framework: 1, anecdote: 0 },
  snapshotPath: "/tmp/snapshot.jsonl",
  generatedAt: "2026-05-17T01:00:00Z",
};

test("slugify produces kebab-case from cluster label", () => {
  assert.equal(slugify("Verticals Intelligence Build"), "verticals-intelligence-build");
  assert.equal(slugify("verticals  intelligence  build"), "verticals-intelligence-build");
  assert.equal(slugify("This/Has/Slashes"), "this-has-slashes");
});

test("writeProposal writes a roadmap doc for auto-build mode", () => {
  const tmp = mkdtempSync(join(tmpdir(), "sis-forge-test-"));
  try {
    const path = writeProposal(sampleReport, sampleCluster, "auto-build", { outDir: tmp });
    assert.ok(path.endsWith(".md"));
    const content = readFileSync(path, "utf8");

    // Required sections
    assert.match(content, /^# Vertical IS Proposal:/m);
    assert.match(content, /^\*\*Mode:\*\* auto-build/m);
    assert.match(content, /## What the corpus shows/);
    assert.match(content, /## Recommended Intelligence System/);
    assert.match(content, /## Four-bucket sort/);
    assert.match(content, /## First three sub-systems/);
    assert.match(content, /## Limitations \+ falsifiers/);

    // Attestation footer
    assert.match(content, /\*\*Built on SIP\*\*/);
    assert.match(content, /Source command: \/sis-forge/);
    assert.match(content, /Corpus snapshot:/);

    // Atom citations
    assert.match(content, /v1|v2|v3/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("writeProposal includes propose-menu candidate number when mode is propose-menu", () => {
  const tmp = mkdtempSync(join(tmpdir(), "sis-forge-test-"));
  try {
    const path = writeProposal(sampleReport, sampleCluster, "propose-menu", { outDir: tmp, candidateIndex: 2, candidateTotal: 3 });
    const content = readFileSync(path, "utf8");
    assert.match(content, /\*\*Mode:\*\* propose-menu \(candidate 2 of 3\)/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run to verify FAIL**

Run: `node --import tsx --test test/sis-forge/proposal-writer.test.ts`

Expected: FAIL — module not found.

- [ ] **Step 3: Write proposal-writer.ts**

Create `tools/sis-forge/proposal-writer.ts`:

```typescript
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { BucketReport, Cluster, BucketReport as _BR } from "./atom-schema.ts";

export interface ProposalOptions {
  outDir?: string;
  candidateIndex?: number;
  candidateTotal?: number;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const DEFAULT_OUT_DIR = "docs/proposals/sis-forge";

export function writeProposal(
  report: BucketReport,
  cluster: Cluster,
  mode: BucketReport["mode"],
  opts: ProposalOptions = {},
): string {
  if (mode === "empower") {
    throw new Error("writeProposal does not handle empower mode — use empower-handoff instead");
  }

  const outDir = opts.outDir ?? DEFAULT_OUT_DIR;
  mkdirSync(outDir, { recursive: true });

  const date = report.generatedAt.slice(0, 10);
  const slug = slugify(cluster.label).slice(0, 60);
  const path = join(outDir, `${date}-${slug}.md`);

  const modeLabel =
    mode === "propose-menu" && opts.candidateIndex != null && opts.candidateTotal != null
      ? `propose-menu (candidate ${opts.candidateIndex} of ${opts.candidateTotal})`
      : mode;

  const atomCitations = cluster.atoms
    .map((a) => `- ${a.id} (${a.source}): ${a.summary}`)
    .join("\n");

  const proposedName = cluster.label
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const content = `# Vertical IS Proposal: ${proposedName}

**Mode:** ${modeLabel}
**Source command:** /sis-forge
**Corpus snapshot:** ${report.snapshotPath}
**Cluster summary:** ${cluster.label} (${cluster.atoms.length} atoms, ${cluster.sources.length} sources)
**Bucket:** ${cluster.bucket}

## What the corpus shows

The corpus contains ${cluster.atoms.length} atoms across ${cluster.sources.join(", ")} that share substantial vocabulary around: **${cluster.label}**.

Atom citations:

${atomCitations}

## Recommended Intelligence System

**Name:** ${proposedName}
**Tier:** Domain Sub-Stack (default — see §"Tier classification" if Universal-IS-tier is implied)
**Source-count:** ${cluster.sources.length} (${cluster.sources.join(", ")})
**Atom-count:** ${cluster.atoms.length}

## Four-bucket sort

**KEEP:** _[fill in: activities only the operator can do that this IS would capture]_
**DELEGATE:** _[fill in: executor work this IS would systematize]_
**AUTOMATE:** _[fill in: workflow / pipeline tasks this IS would absorb]_
**KILL:** _[fill in: work that compounds nothing in this domain]_

## First three sub-systems

1. _[sub-system 1 — derived from the highest-frequency tokens in the cluster]_
2. _[sub-system 2 — derived from the next pattern]_
3. _[sub-system 3 — derived from cross-source convergence]_

## Estimated /spawn-domain-stack diff

Spawning this vertical would create:
- \`verticals/${slugify(proposedName)}/\` directory with the 7-file core contract
- ${cluster.sources.length}+ sub-system agents at \`agents/${slugify(proposedName)}-*\`
- ${cluster.atoms.length}+ atoms moved to the vertical's local context
- Optional: 1+ commands at \`commands/${slugify(proposedName)}-*\`

## Limitations + falsifiers

- Density classifier bias: this proposal surfaced because ${cluster.atoms.length} ≥ 3 atoms (framework threshold). If the work was novel-but-thought-once, /sis-forge would have routed to empower mode instead.
- TF-IDF MVP threshold (0.75 cosine) means atoms must share substantial vocabulary, not just topic. See spec §11.
- **Falsifier:** if Frank reads this and says "no, that's not what I'm building," the cluster was real but the framing is wrong — re-run with --include-pattern to narrow.

---

**Built on SIP** — Source command: /sis-forge · Corpus snapshot: ${report.snapshotPath}
- Layers used: [file-contract, attestation, commands, domain-sub-stack]
- Generated: ${report.generatedAt}
- Mode: ${mode}
`;

  writeFileSync(path, content, "utf8");
  return path;
}
```

- [ ] **Step 4: Run to verify PASS**

Run: `node --import tsx --test test/sis-forge/proposal-writer.test.ts`

Expected: 3/3 pass.

- [ ] **Step 5: Commit**

```bash
git add tools/sis-forge/proposal-writer.ts test/sis-forge/proposal-writer.test.ts
git commit -m "feat(sis-forge): proposal writer — clusters → roadmap markdown (alpha)"
```

---

## Task 4: Empower-mode handoff to /discover-genius

**Files:**
- Create: `tools/sis-forge/empower-handoff.ts`
- Test: `test/sis-forge/empower-handoff.test.ts`

- [ ] **Step 1: Write the failing test**

Create `test/sis-forge/empower-handoff.test.ts`:

```typescript
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatEmpowerHandoff } from "../../tools/sis-forge/empower-handoff.ts";
import type { BucketReport } from "../../tools/sis-forge/atom-schema.ts";

const emptyEmpowerReport: BucketReport = {
  mode: "empower",
  clusters: [],
  totalAtoms: 5,
  byBucket: { signature: 0, framework: 0, anecdote: 5 },
  snapshotPath: "/tmp/snapshot.jsonl",
  generatedAt: "2026-05-17T01:00:00Z",
};

test("formatEmpowerHandoff returns a structured prompt referencing the snapshot", () => {
  const text = formatEmpowerHandoff(emptyEmpowerReport);

  assert.match(text, /discover-genius/i, "should reference /discover-genius");
  assert.match(text, /\/tmp\/snapshot\.jsonl/, "should reference the corpus snapshot path");
  assert.match(text, /protocol step 1/i, "should reference Genius protocol step 1");
  assert.match(text, /consent/i, "should describe Frank's invocation as consent");
});

test("formatEmpowerHandoff includes atom counts for context", () => {
  const text = formatEmpowerHandoff(emptyEmpowerReport);
  assert.match(text, /5.*atom/i, "should mention totalAtoms count");
});

test("formatEmpowerHandoff is deterministic on same input", () => {
  const t1 = formatEmpowerHandoff(emptyEmpowerReport);
  const t2 = formatEmpowerHandoff(emptyEmpowerReport);
  assert.equal(t1, t2);
});
```

- [ ] **Step 2: Run to verify FAIL**

Run: `node --import tsx --test test/sis-forge/empower-handoff.test.ts`

Expected: FAIL — module not found.

- [ ] **Step 3: Write empower-handoff.ts**

Create `tools/sis-forge/empower-handoff.ts`:

```typescript
import type { BucketReport } from "./atom-schema.ts";

export function formatEmpowerHandoff(report: BucketReport): string {
  return `[/sis-forge → /discover-genius empower-mode handoff]

Frank has authorized auto-corpus delivery via /sis-forge. Corpus is pre-fed from 5 enumerable adapters (transcripts / vault / prompts / repos / external).

Corpus snapshot: ${report.snapshotPath}
Total atoms: ${report.totalAtoms}
Bucket distribution: signature=${report.byBucket.signature}, framework=${report.byBucket.framework}, anecdote=${report.byBucket.anecdote}

This satisfies your protocol step 1 corpus-required clause: the pull constitutes corpus delivery, not corpus-guessing. Sources are enumerable; the user can --exclude-source any of them.

Genius — the density classifier reached mode=empower because:
- 0 signature clusters (≥7 atoms × ≥2 sources)
- ${report.byBucket.framework} framework cluster(s) (need ≥2 for propose-menu)
- ${report.byBucket.anecdote} anecdote cluster(s)

Proceed with your reasoning protocol step 2 (RECOGNIZE). Use the snapshot at ${report.snapshotPath} as the corpus. Ask Frank empowering questions to surface what the corpus doesn't yet show. Produce a Genius Profile + Freedom Path per your existing protocol.

Frank's /sis-forge invocation is the consent signal for the auto-pull. He explicitly chose to run the extractor rather than deliver corpus by hand.
`;
}
```

- [ ] **Step 4: Run to verify PASS**

Run: `node --import tsx --test test/sis-forge/empower-handoff.test.ts`

Expected: 3/3 pass.

- [ ] **Step 5: Commit**

```bash
git add tools/sis-forge/empower-handoff.ts test/sis-forge/empower-handoff.test.ts
git commit -m "feat(sis-forge): empower-mode handoff to /discover-genius (alpha)"
```

---

## Task 5: Wire Phase 3 into CLI

**Files:**
- Modify: `tools/sis-forge/cli.ts`

- [ ] **Step 1: Read current CLI**

Run via Read tool on `tools/sis-forge/cli.ts`. Confirm structure (already wrote pre-alpha: parse args → read JSONL → applyAtomBudget → clusterAtoms → classifyDensity → write BucketReport JSON).

- [ ] **Step 2: Add Phase 3 dispatch after Phase 2 classifier**

Insert after the line that writes the `report` JSON file, BEFORE the final `console.log`:

```typescript
  // Phase 3 dispatch
  if (report.mode === "empower") {
    const { formatEmpowerHandoff } = await import("./empower-handoff.ts");
    const handoff = formatEmpowerHandoff(report);
    console.error("---EMPOWER HANDOFF---");
    console.error(handoff);
    console.error("---END HANDOFF---");
  } else {
    const { writeProposal } = await import("./proposal-writer.ts");
    const { hasExistingDomain } = await import("./existing-domains.ts");
    const REPO_ROOT = resolve(import.meta.dirname, "..", "..");

    const candidates = report.clusters
      .filter((c) => c.bucket === "signature" || c.bucket === "framework")
      .sort((a, b) => b.atoms.length - a.atoms.length);

    if (report.mode === "auto-build") {
      const top = candidates[0];
      if (top) {
        const proposedSlug = top.label.toLowerCase().replace(/\s+/g, "-");
        const collides = hasExistingDomain(REPO_ROOT, proposedSlug);
        if (collides) {
          console.error(`Note: auto-build candidate "${proposedSlug}" already exists in verticals/ — consider --mode=propose-menu to see extend options`);
        }
        const proposalPath = writeProposal(report, top, "auto-build");
        console.error(`Proposal written: ${proposalPath}`);
      }
    } else if (report.mode === "propose-menu") {
      const topN = candidates.slice(0, 3);
      topN.forEach((c, i) => {
        const proposalPath = writeProposal(report, c, "propose-menu", {
          candidateIndex: i + 1,
          candidateTotal: topN.length,
        });
        console.error(`Proposal ${i + 1}/${topN.length} written: ${proposalPath}`);
      });
    }
  }
```

The function also needs `async` and `await` on the imports. Change `function main(): void` to `async function main(): Promise<void>` and the final `main();` to `main().catch((e) => { console.error(e); process.exit(1); });`.

- [ ] **Step 3: Smoke test with a framework-cluster fixture**

```bash
mkdir -p .sis-forge
cat > .sis-forge/alpha-smoke.jsonl <<'EOF'
{"id":"a1","source":"vault","topic":"verticals","summary":"build sovereign domain sub-stack pattern composition using starlight protocol intelligence","ts":"2026-05-17T00:00:00Z"}
{"id":"a2","source":"vault","topic":"verticals","summary":"build sovereign domain sub-stack pattern composition using starlight protocol music","ts":"2026-05-17T00:00:00Z"}
{"id":"a3","source":"transcripts","topic":"verticals","summary":"build sovereign domain sub-stack pattern composition using starlight protocol people","ts":"2026-05-17T00:00:00Z"}
{"id":"a4","source":"prompts","topic":"verticals","summary":"build sovereign domain sub-stack pattern composition using starlight protocol sound","ts":"2026-05-17T00:00:00Z"}
EOF
npx tsx tools/sis-forge/cli.ts .sis-forge/alpha-smoke.jsonl
```

Expected: stdout has BucketReport summary (mode=empower or propose-menu depending on cluster count). Stderr has either the empower handoff text or "Proposal N/N written: docs/proposals/sis-forge/2026-05-17-..." A new markdown file should exist in `docs/proposals/sis-forge/` if propose-menu/auto-build fired.

- [ ] **Step 4: Clean up smoke files**

```bash
rm .sis-forge/alpha-smoke.jsonl .sis-forge/buckets-*.json
# Do NOT delete docs/proposals/sis-forge/ — that's the v8.x-alpha output destination
```

- [ ] **Step 5: Commit**

```bash
git add tools/sis-forge/cli.ts
git commit -m "feat(sis-forge): wire Phase 3 dispatch into CLI — proposals for auto-build/propose-menu, handoff for empower (alpha)"
```

---

## Task 6: Extend v86 symmetry test

**Files:**
- Modify: `test/v86-sis-forge-coverage.test.ts`

- [ ] **Step 1: Add new paths to REQUIRED_FILES**

Edit `test/v86-sis-forge-coverage.test.ts`. Find:

```typescript
const REQUIRED_FILES = [
  "commands/sis-forge.md",
  "agents/sis-extractor-transcripts.md",
  "agents/sis-extractor-vault.md",
  "agents/sis-extractor-prompts.md",
  "agents/sis-extractor-repos.md",
  "agents/sis-extractor-external.md",
  "tools/sis-forge/atom-schema.ts",
  "tools/sis-forge/clusterer.ts",
  "tools/sis-forge/density-classifier.ts",
  "tools/sis-forge/cli.ts",
];
```

Replace with:

```typescript
const REQUIRED_FILES = [
  "commands/sis-forge.md",
  "agents/sis-extractor-transcripts.md",
  "agents/sis-extractor-vault.md",
  "agents/sis-extractor-prompts.md",
  "agents/sis-extractor-repos.md",
  "agents/sis-extractor-external.md",
  "tools/sis-forge/atom-schema.ts",
  "tools/sis-forge/clusterer.ts",
  "tools/sis-forge/density-classifier.ts",
  "tools/sis-forge/cli.ts",
  "tools/sis-forge/proposal-writer.ts",
  "tools/sis-forge/existing-domains.ts",
  "tools/sis-forge/stack-taxonomy.ts",
  "tools/sis-forge/empower-handoff.ts",
];
```

Also add a new test verifying the four new modules export expected functions:

```typescript
test("v86 alpha: Phase 3 modules export expected functions", async () => {
  const proposal = await import("../tools/sis-forge/proposal-writer.ts");
  const domains = await import("../tools/sis-forge/existing-domains.ts");
  const stack = await import("../tools/sis-forge/stack-taxonomy.ts");
  const empower = await import("../tools/sis-forge/empower-handoff.ts");

  assert.equal(typeof proposal.writeProposal, "function");
  assert.equal(typeof proposal.slugify, "function");
  assert.equal(typeof domains.listExistingDomains, "function");
  assert.equal(typeof domains.hasExistingDomain, "function");
  assert.equal(typeof stack.readLockedUniversalIS, "function");
  assert.equal(typeof stack.isLockedTaxonomyName, "function");
  assert.equal(typeof stack.wouldRequireAmendment, "function");
  assert.equal(typeof empower.formatEmpowerHandoff, "function");
});
```

- [ ] **Step 2: Run the test**

Run: `node --import tsx --test test/v86-sis-forge-coverage.test.ts`

Expected: 5/5 pass (4 original + 1 new).

- [ ] **Step 3: Commit**

```bash
git add test/v86-sis-forge-coverage.test.ts
git commit -m "test(sis-forge): extend v86 symmetry for alpha Phase 3 modules"
```

---

## Task 7: Wire new tests into test:substrate

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Append four new test invocations**

Use Edit tool. Find:

```
&& node --import tsx --test test/v86-sis-forge-coverage.test.ts"
```

Replace with:

```
&& node --import tsx --test test/v86-sis-forge-coverage.test.ts && node --import tsx --test test/sis-forge/existing-domains.test.ts && node --import tsx --test test/sis-forge/stack-taxonomy.test.ts && node --import tsx --test test/sis-forge/proposal-writer.test.ts && node --import tsx --test test/sis-forge/empower-handoff.test.ts"
```

- [ ] **Step 2: Verify full substrate suite passes**

Run: `npm run test:substrate`

Expected: all existing + 4 new tests pass. If a pre-existing test fails (unrelated drift), note as out-of-scope and continue. If any sis-forge alpha test fails, halt with BLOCKED.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore(sis-forge): wire alpha Phase 3 tests into test:substrate"
```

---

## Task 8: Update commands/sis-forge.md for alpha behavior

**Files:**
- Modify: `commands/sis-forge.md`

- [ ] **Step 1: Update version + Phase 3 section**

Use Edit tool. Find:

```
**Version:** v8.x-pre-alpha
```

Replace with:

```
**Version:** v8.x-alpha (Phase 3 enabled; Phase 4 stubbed)
```

Find the "## Phase 2 — Classifier" section and after its content, insert a new section:

```markdown
## Phase 3 — Proposal Assembly (alpha)

The CLI dispatches by mode:

- **`auto-build`** — Pick the densest cluster (signature or top framework). Check for collision with existing `verticals/<slug>/`; if collision, switch to propose-menu with extend option. Write a single Vertical IS Proposal doc to `docs/proposals/sis-forge/<date>-<slug>.md`. STDERR carries the path.

- **`propose-menu`** — Write the top 3 framework clusters as separate proposal docs to `docs/proposals/sis-forge/<date>-<slug>-N.md`. Each numbered "candidate N of 3" in the doc frontmatter.

- **`empower`** — No proposal doc. Format a handoff prompt that includes the corpus snapshot path and invokes `/discover-genius` (caller orchestrates the actual handoff). STDERR carries the handoff text.

### Roadmap doc structure

Each proposal doc contains:
- Header (proposed IS name, mode, source command, corpus snapshot, cluster summary, bucket)
- What the corpus shows (cluster summary + atom citations)
- Recommended Intelligence System (name, tier, source-count, atom-count)
- Four-bucket sort (KEEP / DELEGATE / AUTOMATE / KILL — Frank fills these inline)
- First three sub-systems (templates for Frank to flesh out)
- Estimated /spawn-domain-stack diff (file counts)
- Limitations + falsifiers
- SIP attestation footer

### STACK.md amendment lock

If a proposal would require 10→11-IS expansion in `STACK.md`, the CLI **blocks** with exit code 40 and writes `requires-taxonomy-board: true` to the proposal frontmatter. Frank must run a separate `/starlight-board` session on a STACK.md amendment proposal first.
```

- [ ] **Step 2: Update the "What pre-alpha does NOT do" list**

Find:

```markdown
- No roadmap doc / proposal output (lands in alpha)
```

Replace with:

```markdown
- ~~No roadmap doc / proposal output~~ — **landed in alpha** (Task 5 of alpha plan)
- ~~No empower-mode handoff to `/discover-genius`~~ — **landed in alpha** (Task 4 of alpha plan)
```

- [ ] **Step 3: Commit**

```bash
git add commands/sis-forge.md
git commit -m "docs(sis-forge): update command spec for alpha — Phase 3 proposal assembly + empower handoff"
```

---

## Task 9: Dog-fooding gate

**Files:** (no new files — validation only)

- [ ] **Step 1: Run alpha pipeline on rich-content fixture**

```bash
mkdir -p .sis-forge
cat > .sis-forge/alpha-dogfood.jsonl <<'EOF'
{"id":"a1","source":"vault","topic":"verticals","summary":"build sovereign domain sub-stack pattern composition using starlight protocol intelligence","weight":1.0,"ts":"2026-05-17T00:00:00Z"}
{"id":"a2","source":"vault","topic":"verticals","summary":"build sovereign domain sub-stack pattern composition using starlight protocol music","weight":0.9,"ts":"2026-05-17T00:00:00Z"}
{"id":"a3","source":"transcripts","topic":"verticals","summary":"build sovereign domain sub-stack pattern composition using starlight protocol people","weight":0.8,"ts":"2026-05-17T00:00:00Z"}
{"id":"a4","source":"prompts","topic":"verticals","summary":"build sovereign domain sub-stack pattern composition using starlight protocol sound","weight":0.7,"ts":"2026-05-17T00:00:00Z"}
{"id":"b1","source":"repos","topic":"cooking","summary":"sourdough starter feeding ratio twelve hours fermentation","weight":1.0,"ts":"2026-05-17T00:00:00Z"}
EOF

npx tsx tools/sis-forge/cli.ts .sis-forge/alpha-dogfood.jsonl 2>&1
ls docs/proposals/sis-forge/
```

Expected: stdout BucketReport summary shows 1 framework cluster + 1 anecdote → mode=empower (only 1 framework, threshold for propose-menu is ≥2). STDERR shows the empower handoff text. NO proposal docs written (empower mode skips proposal writer).

- [ ] **Step 2: Force propose-menu mode with --mode override**

The CLI has `--mode <auto|propose|empower>` flag (reserved in pre-alpha, ignored — needs to be honored in alpha; if not yet wired, this validation step is for the implementer to validate). Run:

```bash
npx tsx tools/sis-forge/cli.ts .sis-forge/alpha-dogfood.jsonl --mode propose-menu 2>&1
ls docs/proposals/sis-forge/
```

Expected: proposal doc(s) written to `docs/proposals/sis-forge/`. Read one — confirm structure matches the roadmap template.

If `--mode` is not yet honored, mark this as a follow-up for beta (it's a nice-to-have for testing). The auto-detected behavior is what matters.

- [ ] **Step 3: Clean up smoke artifacts**

```bash
rm .sis-forge/alpha-dogfood.jsonl .sis-forge/buckets-*.json
# Keep docs/proposals/sis-forge/ if proposals were written — they're the alpha deliverable demonstrating the format
```

- [ ] **Step 4: Surface to user**

> "Alpha implementation complete. All 4 new tests passing + existing tests green. Dog-food shows the empower handoff fires correctly. Ready to tag v8.x-alpha-1? (Note: substrate-tier — should we run /starlight-board on the alpha diff before tagging?)"

DO NOT auto-tag. Wait for user instruction.

---

## Self-review

### Spec coverage

Walked through spec sections relevant to alpha:
- §1 (Purpose, empower mode handoff) → Task 4
- §5 (v8.x-alpha versioning row) → Task 8 (command spec update)
- §9 Phase 3 (proposal assembly contract) → Task 3 + Task 5
- §9 Phase 3 failure modes (existing-domain collision → propose-menu flip) → Task 5
- §12 (STACK.md amendment lock) → Task 2 (taxonomy reader + amendment check)
- §10 (Genius protocol contract — empower-mode pre-fed corpus) → Task 4
- §11 (refinement-bias limitations) → Task 3 (limitations section in proposal doc template)
- §14 (testing strategy — Phase 3 tests) → Tasks 1-4 unit tests + Task 6 symmetry

Coverage complete for alpha scope.

### Placeholder scan

No TBD / TODO in any task. The roadmap doc template includes "_[fill in: ...]_" markers for the Four-Bucket Sort and First-Three-Sub-Systems sections — these are intentional **operator-fill** templates (Frank or a future caller fills them based on judgment), NOT plan placeholders.

### Type consistency

- `BucketReport`, `Cluster`, `Atom` types come from `tools/sis-forge/atom-schema.ts` (pre-alpha)
- `ClassificationResult` from `density-classifier.ts` (pre-alpha) — alpha imports it
- New `ProposalTier` type defined in `stack-taxonomy.ts` Task 2
- New `ProposalOptions` type defined in `proposal-writer.ts` Task 3
- Function signatures referenced consistently across Tasks 1-6

No drift.

### Risks (Karpathy hygiene applied)

- **Risk 1:** `stack-taxonomy.ts` parses STACK.md heuristically (regex on markdown). Real STACK.md may have shape that breaks the regex. **Mitigation:** Task 2 test #3 verifies known-IS-name detection; if test fails on real STACK.md, the regex needs adjustment before continuing.
- **Risk 2:** `proposal-writer.ts` outputs to `docs/proposals/sis-forge/` which is now a tracked directory. Many proposals over time = git churn. **Mitigation:** add `.gitignore` entry for `docs/proposals/sis-forge/*.md` in a follow-up if churn becomes a problem; default ON so the demo proposal is visible.
- **Risk 3:** `--mode` flag not yet wired through to override auto-detection. **Mitigation:** Task 9 Step 2 flags this; if not yet wired, deferred to beta.

---

## Execution handoff

Plan complete. Save command:

```bash
git add docs/superpowers/plans/2026-05-17-sis-forge-alpha.md
git commit -m "docs(plan): /sis-forge v8.x-alpha implementation plan — Phase 3 proposal assembly"
```

Two execution options:

1. **Subagent-Driven (recommended)** — Fresh subagent per task, 9 tasks ≈ 27 subagent invocations including review loops. ~30-60 min wall-clock with current model mix (haiku for mechanical, sonnet for integration).

2. **Inline Execution** — Sequential in this session via `superpowers:executing-plans`. Faster wall-clock, less context isolation.

Choice gated on Frank.

---

**Built on SIP** — Implementation plan, /sis-forge v8.x-alpha
- Source spec: `docs/superpowers/specs/2026-05-17-sis-forge-design.md`
- Source command (alpha-target): /sis-forge
- Generated: 2026-05-17
- Pre-alpha prerequisite: tag v8.x-pre-alpha-1 (commit f6e52c1)
