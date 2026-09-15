---
type: best-practice
status: active
created: 2026-07-14
tags: [retrieval, process, second-brain]
source: Second Brain vault + Activation Sprint
---

# LLM Wiki Filing Best Practice (Adopted 2026-07-14)

**Rule**: Title every note by the **specific question it answers**, not the broad topic.

**Why** (from Second Brain review):
- High Openness + Conscientiousness profile benefits from precise atomic retrieval.
- Enables folder-less, question-driven search across Obsidian + SIS FTS5 + Smart Connections.
- Forces clarity and prevents vague MOCs.

**Examples**:
- Instead of "Arcanea Cosmology" → "What is the true antagonist in the Eldrian Empire and why does Malachar refuse to scatter?"
- Instead of "Second Brain Architecture" → "How does the three-plane model resolve fragmentation across six vaults?"

**Implementation in SIS**:
- Enforce in all agent prompts and skill rules.
- Add to new note templates in second-brain-os.
- Run one-time pass on high-value notes in the Second Brain vault.

**SIP Attestation**  
protocol: SIP / activation-orchestrator  
analyzed_at: 2026-07-14  
sources: Second Brain vault _meta/LLM-Wiki-Filing-Rule + Activation Sprint  
writes: This best-practice note only

**Related**  
[[Second-Brain-Integration-2026-07-14]] (in vault) · [[LLM-Wiki-Filing-Rule]] (vault) · verticals/secondbrain/MEMORY.md
