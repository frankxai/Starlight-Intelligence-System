# SIS Creator Claw

> Convert memory into publishable assets with preserved voice.

**Status:** Phase 3 — planned. Depends on Memory Claw + Genius Claw being operational.

---

## Contract (Draft)

```yaml
name: sis-creator-claw
version: 0.0.1
purpose: Convert vault memory and Genius Profile into platform-specific publishable content — posts, essays, threads, scripts, carousels, newsletter.
phase: 3

permissions:
  filesystem: read_write
  sis_vaults: read
  shell: none
  network: optional

outputs:
  - /content/posts/
  - /content/essays/
  - /content/threads/
  - /content/scripts/
  - /content/carousels/
  - /content/newsletter/

safety:
  mutation_default: false
  private_data_export: blocked
  requires_sentinel: true
```

## Skills (Planned)

- Voice preservation (reads from VOICE_FINGERPRINT.md)
- Content repurposing
- Hook generation
- Narrative compression
- Anti-generic-AI filtering
- Platform-specific formatting (LinkedIn, X, Substack, YouTube)
- Source-backed claim hygiene

## MCP (Planned)

- `sis-memory-mcp` — reads vaults for context
- `github-mcp` — reads repo for technical content
- `notion-mcp` — optional destination
- `postiz-mcp` or `buffer-mcp` — optional publishing scheduler

---

*Built on SIP · sis-creator-claw v0.0.1 (draft) · MIT*
