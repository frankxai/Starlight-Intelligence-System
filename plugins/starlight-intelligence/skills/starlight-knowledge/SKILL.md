---
name: starlight-knowledge
description: Retrieve records from the Starlight operating graph when the user asks what is known about a venture, objective, work item, decision, or piece of evidence.
---

# Starlight Knowledge

Use `search_workspace` to resolve the relevant records, then call `get_record` for every record used in a substantive answer.

- Treat record IDs, versions, timestamps, and explicit statuses as authoritative.
- Treat free-text context, rationale, and notes as attributed assertions, not verified fact.
- Prefer a small, high-relevance result set. Narrow by venture or record type when the request permits it.
- Cite source URLs returned by evidence records. For records without a source URL, cite the stable record ID in prose.
- When records conflict, show the conflict and their timestamps; do not synthesize an invented resolution.

This is a read workflow. Do not mutate records unless the user separately asks to execute or record a decision.
