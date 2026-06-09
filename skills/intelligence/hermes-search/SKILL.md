---
name: intelligence/hermes-search
description: Use when you need to find, retrieve, or research anything across vaults, repos, or the web — executes semantic search with full provenance, deduplicates across sources, flags contradictions, and returns ranked results sourced to the exact vault atom, file, or URL. Default skill for Starlight Hermes; callable by all agents.
type: intelligence
---

# Hermes Search

> Find exactly what you need — from vaults, repos, or the web — with full provenance.

---

## When This Skill Activates

- Keywords: "search", "find me", "where is", "look up", "retrieve", "what do we know", "source check", "provenance", "research", "what did we decide", "trace", "find pattern", "cross-vault", "multi-source"
- Commands: `/search`, `/research`, `/find-pattern`, `/audit-coverage`, `/trace-provenance`, `/find-contradiction`, `/source-check`
- Agents: `starlight-hermes` (primary), `starlight-prime`, `starlight-sage`, `starlight-genius`, `starlight-orchestrator`
- Intents: search, retrieval, research, provenance, audit

---

## What This Skill Does

Hermes Search is the retrieval engine for the SIS substrate. It routes queries to the right source, executes parallel searches, deduplicates and ranks results, flags contradictions, and returns every result with a full provenance chain.

This skill is read-only. It never writes to vaults, repos, or external systems.

---

## Procedures

### Procedure 1: Vault Search

```
1. Decompose query into search terms + intent
2. Route to relevant vaults (all 6 by default, or scoped by context)
3. Execute BM25 full-text + semantic similarity
4. Rank results by: relevance × recency × confidence
5. Deduplicate by content hash
6. Return results with: vault name, atom ID, date, confidence, contributing agent
```

### Procedure 2: Cross-Repo Search

```
1. Identify repos to search (current + linked via GitHub MCP)
2. Execute code/docs/issue search via GitHub MCP
3. Surface: file path, line number, commit date, author
4. Rank by: relevance × recency × repo authority
5. Return results with full GitHub provenance chain
```

### Procedure 3: Web Research

```
1. Only when local sources are exhausted or explicitly requested
2. Decompose query into search terms
3. Execute structured search (not raw scrape)
4. Apply credibility filter: prefer primary sources, official docs, peer-reviewed
5. Return ranked results with: URL, date, credibility signal, snippet
```

### Procedure 4: Multi-Source Synthesis

```
1. Execute vault + repo + web searches in parallel
2. Merge results from all sources
3. Deduplicate across sources (same fact from multiple sources → highest-authority wins)
4. Run contradiction check: do any results conflict?
   - If yes: flag contradiction explicitly. Do NOT silently resolve.
5. Rank merged set by: relevance × source authority × cross-corroboration count
6. Synthesize into a single answer with inline source citations
7. Preserve uncertainty: if confidence is below threshold, say so
```

### Procedure 5: Contradiction Detection

```
1. Given a set of facts (from vault search or provided by caller)
2. Compare each fact against others for direct contradiction
3. Flag: fact A says X, fact B says NOT-X — source chain for both
4. Do NOT pick a winner
5. Surface to user / requesting agent for resolution
6. Log contradiction in Operational Vault for Memory Claw review
```

### Procedure 6: Coverage Audit

```
1. Given a topic or domain
2. Search all vaults for existing coverage
3. List what exists (with sources and confidence)
4. List what is absent (known gaps)
5. Rate coverage: sparse / partial / substantial / comprehensive
6. Recommend: which agent + Claw should fill the gaps
```

---

## Privacy Boundaries

| Namespace | Default scope |
|-----------|--------------|
| Strategic, Technical, Creative, Operational, Wisdom, Horizon | ✅ Included by default |
| `second-brain/` | ❌ Excluded unless explicitly scoped |
| `health/` | ❌ Excluded unless explicitly scoped |
| `business/` | ❌ Excluded unless explicitly scoped |
| `relational/` | ❌ Excluded unless explicitly scoped |

When a search is scoped to a private namespace, Sentinel Claw is notified and the scope is logged.

---

## Integration Points

**Agents:** All agents can invoke Hermes Search as a sub-skill. Hermes agent is the primary activator but any agent can call it.

**Claws:** Genius Claw uses Hermes to mine the personal corpus. Reclamation Claw uses Hermes to detect duplicates. Attestation Claw uses Hermes to surface prior attestation records. Memory Claw uses Hermes to avoid duplicate vault writes.

**MCP:** Uses `sis-memory-mcp` for vault read, GitHub MCP for cross-repo search, browser/web MCP for research (optional).

**Vaults:** Read-only across all six substrate vaults. Write path is Memory Claw → `sis-memory-mcp`.

---

## Quality Criteria

- Every result includes a source (vault name + atom ID, or file path, or URL)
- Contradictions are flagged, not silently resolved
- Confidence is calibrated (not inflated to satisfy the query)
- Privacy boundaries are respected
- Results are ranked, not dumped raw
- The answer distinguishes between "found in vault" (high confidence) and "found on web" (lower confidence)

---

*Read-only · Provenance-first · Contradiction-surfacing · Built on SIP*
