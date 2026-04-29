# Subagent Roster

7-agent production team for SIS memory ops. Each has a clean contract: signature, when-to-dispatch, what-it-returns. Subset to 3 for minimal, expand to 10 for advanced.

## Table of contents

1. Memory Indexer  (Tier: minimal)
2. Memory Retriever  (Tier: minimal)
3. Privacy Guardian  (Tier: minimal)
4. Graph Maintainer  (Tier: production)
5. Substrate Benchmarker  (Tier: production)
6. Decay Manager  (Tier: production)
7. Auditor  (Tier: production)
8. Council Convener  (Tier: advanced)
9. Cross-Project Sync  (Tier: advanced)
10. Health Monitor  (Tier: advanced)

---

## 1. Memory Indexer (minimal)

**Role:** Write captures, packets, distillations into the right substrate(s) per the Substrate Matrix decision.

**Dispatch when:**
- New capture arrives (voice / text / packet)
- Distillation lands (`/distill-insights`)
- Manual write requested (`/vault write …`)

**Inputs:**
```
{
  type: "capture" | "packet" | "distillation" | "decision",
  content: string,
  brand?: string,
  intent_class?: string,
  source: "voice" | "text" | "phone" | "orb",
  attestation_required: boolean
}
```

**Behavior:**
1. Calls Privacy Guardian to redact
2. Asks Substrate Selector for routing decision
3. Writes to chosen substrate(s) — typically vault MD + KG JSONL + mempalace (if enabled)
4. Records audit log entry
5. Returns the path/id of every write

**Output:**
```
{
  writes: [{ substrate: string, id_or_path: string }],
  redactions_applied: number,
  attestation_block?: string
}
```

---

## 2. Memory Retriever (minimal)

**Role:** Query across enabled substrates, return ranked top-k slices.

**Dispatch when:**
- Cognition router needs context for an LLM call
- User asks a recall question ("what did I capture about X?")
- Brain graph requests a relevant subset

**Inputs:**
```
{
  query: string,
  k: number = 5,
  scope?: { brand?: string, intent_class?: string, time_range?: [iso, iso] },
  privacy_level: "any" | "redacted" | "no_pii"
}
```

**Behavior:**
1. Tier 0: pattern match against deterministic rules
2. Tier 1: filesystem grep + KG JSONL scan (fastest)
3. Tier 2: mempalace semantic OR Qdrant vector search
4. Reciprocal rank fusion across substrates that returned hits
5. Privacy Guardian filters output if `privacy_level != "any"`

**Output:**
```
{
  results: [{ id: string, substrate: string, score: float, slice: string, metadata: {...} }],
  substrates_queried: string[],
  latency_ms: number
}
```

---

## 3. Privacy Guardian (minimal)

**Role:** The first and last line. Redact PII; block leaks; enforce policy.

**Dispatch when:**
- Before any memory write (scan content)
- Before any LLM call that includes vault context (scan payload)
- On read response if `privacy_level != "any"`
- Periodic full-vault audit (weekly)

**Inputs:**
```
{
  payload: string | object,
  direction: "write" | "outbound_call" | "read_response",
  policy_set: "default" | "strict" | "sovereign"
}
```

**Behavior:**
1. Regex pass for emails / phones / SSNs / credit-card / API-key shapes
2. NER pass for person names against the user's "private contacts" list
3. Heuristic for paths that look like home dirs of OTHER users
4. Address detection
5. URL allowlist enforcement
6. Returns redacted payload + metadata about what was redacted

**Output:**
```
{
  payload_redacted: string | object,
  redactions: [{ type: string, count: number, sample?: string }],
  blocked: boolean,        // true if outbound call should be aborted
  reason_if_blocked?: string
}
```

**Policy levels:**
- `default` — redact obvious PII; allow with warning
- `strict` — redact + log + require user confirmation for borderline cases
- `sovereign` — block any outbound call containing ANY redaction (full local mode)

---

## 4. Graph Maintainer (production)

**Role:** Keep the knowledge-graph cross-refs fresh, deduplicate, link related captures.

**Dispatch when:**
- After every batch of writes (debounced 60s)
- On `/orchestrate-brain` weekly review
- Brain graph requests a regenerate

**Behavior:**
1. Scan recent writes for duplicate utterances (>0.92 cosine similarity → merge)
2. Build cross-refs between captures sharing brand × intent_class within a time window
3. Update `memory/knowledge-graph/_brain-cache.json` for the brain viz
4. Mark stale entries (no link in 90d, no read in 60d) as decay-eligible

**Output:** updated cache + a one-page change log appended to `memory/knowledge-graph/_maintenance.log`.

---

## 5. Substrate Benchmarker (production)

**Role:** Periodically test all enabled substrates against the user's real corpus. Emit recommendations.

**Dispatch when:**
- Weekly cron
- On substrate add/swap
- User asks "which substrate is winning?"

**Behavior:**
1. Build a test set from recent voice-sessions: 50 (utterance, expected_recall_id) pairs
2. Run each substrate's retriever; measure recall@5, latency p50/p95
3. Run leak audit (does any retrieval leak PII not in query scope?)
4. Write `memory/benchmarks/{date}.json` raw results
5. Write `memory/benchmarks/RECOMMENDATIONS.md` one-page summary with table + reasoning

**Output:** a recommendation table showing which substrate to use for which use case, with current metrics.

---

## 6. Decay Manager (production)

**Role:** Compress / archive / expire memory per tier rules. Keep hot/warm/cold in balance.

**Dispatch when:**
- Weekly cron
- Memory size approaches threshold (10k entries hot, 100k warm)

**Tier rules:**
- **Hot:** last 7 days OR linked from current packet — kept verbatim, fast retrieval
- **Warm:** 7-90 days OR has 1+ outgoing graph edge — kept verbatim, slower retrieval
- **Cold:** 90+ days, no edges, no recent reads — compressed (LLM summarization preserves meaning)
- **Archive:** 1 year + cold — moved to `memory/_archive/{year}/{month}/` with index entry

**Behavior:**
1. Compute tier per entry from age + edge_count + last_read
2. Move tier transitions; recompute embeddings if needed
3. Compress cold entries via local LLM summarization (groups of 10 → 1 distilled entry pointing at originals)
4. Update brain-cache to reflect new tier mix

**Privacy note:** compression must NOT round-trip through cloud LLM if any redaction applies. Local-only.

---

## 7. Auditor (production)

**Role:** Verify the SIP attestation chain across all writes. Flag conflicting / stale / unattested entries.

**Dispatch when:**
- After every Indexer write (light check)
- Daily full-corpus audit (deep check)
- Pre-export (`/sip-export`) — block if audit fails

**Checks:**
1. Every entry has `Built on SIP` attestation block
2. Every packet has `packet_id` referenced in `memory/knowledge-graph/index.jsonl`
3. No entry references a DELETED source (orphan check)
4. No conflicting entries (same `packet_id` with different content)
5. Audit log `memory/_audit/{date}.jsonl` has no anomaly patterns (read-storms, write-floods)

**Output:**
```
{
  status: "clean" | "warnings" | "fail",
  issues: [{ severity, entry_id, issue, fix_suggestion }],
  attested_count: number,
  unattested_count: number
}
```

If status = "fail" and dispatched pre-export, the export aborts.

---

## 8. Council Convener (advanced)

**Role:** When Memory Indexer / Retriever / Graph Maintainer disagree on routing or relevance, convene a 3-voice mini-council to decide.

**Dispatch when:** any minimal-tier agent emits a `dissent` field in its output.

**Behavior:** loads three Voice archetypes (per `VOICES.md`) — typically Lyssandria (clarity), Draconis (architecture), Ino (verifier) — and runs a 3-turn debate on the disputed call. Resolves to one of: keep the dissenting decision / override / escalate to user.

**Output:** decision + transcript appended to `memory/_council/{date}.jsonl`.

---

## 9. Cross-Project Sync (advanced)

**Role:** Synchronize memory across multiple SIS instances (e.g., Frank's machine + alliance partner's machine + cloud backup).

**Dispatch when:**
- Configured `cross_project.peers[]` is non-empty
- Manual `/cross-sync now`
- Hourly cron

**Behavior:**
1. Compute delta since last sync (vector clock per peer)
2. Privacy Guardian re-redacts any entry tagged `private` before sending
3. Push delta via signed HTTP to each peer
4. Pull peer deltas, run conflict resolution (CRDT-style or last-write-wins per type)

**Privacy note:** sovereign mode (`policy_set: sovereign`) MUST disable Cross-Project Sync entirely, OR enforce that every synced entry is end-to-end encrypted with peer-specific keys.

---

## 10. Health Monitor (advanced)

**Role:** Continuously check substrate health, surface failures to the dashboard.

**Dispatch:** continuous (every 60s).

**Checks:**
- Each substrate's connection / port / lock-file
- Disk usage, RAM, CPU per substrate
- Recent error rates from audit log
- Embedding-model availability

**Output:** `~/.starlight/logs/memory-health.json` with current state. The LCC dashboard reads this for the "Live" panel.

---

## Dispatch heuristics

| Operation | Agents fired (in order) |
|---|---|
| Capture write | Privacy Guardian → Substrate Selector → Indexer → Graph Maintainer (debounced) → Auditor (light) |
| LLM-context retrieval | Retriever → Privacy Guardian (filter output) |
| User recall query | Retriever → Privacy Guardian (depending on scope) |
| Weekly maintenance | Decay Manager → Substrate Benchmarker → Auditor (deep) → Graph Maintainer (full rebuild) |
| Pre-`/sip-export` | Auditor (deep) — block if fail |
| New sovereign onboarding | Substrate Benchmarker (one-time) → install picked substrate → Indexer (migrate) → Auditor |

## Subagent file locations

These should be implemented as proper agent definitions at `agents/sis-memory-*.md`:
- `agents/sis-memory-indexer.md`
- `agents/sis-memory-retriever.md`
- `agents/sis-memory-privacy-guardian.md`
- `agents/sis-memory-graph-maintainer.md`
- `agents/sis-memory-substrate-benchmarker.md`
- `agents/sis-memory-decay-manager.md`
- `agents/sis-memory-auditor.md`

Advanced tier agents (8-10) on demand only — don't add until you have a 2nd machine / multi-tenant case.
