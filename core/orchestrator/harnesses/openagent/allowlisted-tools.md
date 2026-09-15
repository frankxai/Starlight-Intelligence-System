# OpenAgent (OmO) Harness — Allowlisted Tools & Boundaries

Policy defining the tool execution boundaries for the OpenAgent / OmO harness when orchestrating across OpenCode and Codex runtimes.

---

## Allowed Tool Actions

| Tool / Primitive | Permission | Scope & Constraints |
|---|---|---|
| **File Read (`view_file`, `cat`, read)** | Full | Allowed across workspace, context, and memory vaults. |
| **Grep / Find (`ripgrep`, `fd`, search)** | Full | High-speed pattern search across repo trees. |
| **File Write / Edit (`write_to_file`, `replace_file_content`, patch)** | Scoped | Permitted for targeted, contiguous edits. Full-file overwrite requires explicit intent. |
| **Shell Command Execution (`run_command`)** | Controlled | Build, lint, and test commands allowed. Destructive actions (`rm -rf`, force push) require explicit approval. |
| **MCP Tools (`sis_*`)** | Full | Querying and appending to Starlight semantic vaults. |
| **Team Subagent Dispatch** | Full | Invoking OmO team workers (Hephaestus, Oracle, Librarian, Atlas). |

---

## Escalation Triggers

1. **Substrate Spec Mutation:** Any modification to `SIP.md`, `SIS.md`, `STACK.md`, `CANON.md`, or `SOUL.md` requires `/starlight-board` review.
2. **Secret / Key Access:** Any discovery or usage of API credentials triggers security boundary rules and sanitization gateways.
3. **High-Risk Git Operations:** Branch deletion, history rewriting, or force pushing is prohibited.

---

**Built on SIP** — Starlight Intelligence Protocol v1.1.1  
- Verticals: `core/orchestrator/harnesses/openagent`  
- Generated: 2026-09-15  
