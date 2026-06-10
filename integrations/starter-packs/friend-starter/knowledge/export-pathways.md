# Export Pathways — How Your Domain Stack Travels

You did the work. You excavated a Genius Profile, organized your scattered knowledge, designed your interview rubrics, calibrated your performance reviews. Inside Claude (or whichever AI tool you started with), the system runs beautifully — your voice, your frameworks, your years of judgment, all available on demand.

Now someone is asking: *can my company use this?*

That is what export pathways are for. Your work is portable. Different ecosystems exist where companies and end-users already live. SIS knows how to package your stack to land cleanly in each one — and how to refuse any path that would strip your attestation.

Seven pathways are supported today. Three are right for any given situation; the rest matter when the conversation gets specific.

## What survives across every export

Three things travel through every supported pathway:

- **Your voice.** Your interview briefs sound like you. Your performance frameworks read like you. Your training scenarios open with your warmth. The voice block from your source SKILL.md ports into every target's instruction surface.
- **Your frameworks.** Your six sub-systems (Hiring · Performance · Training · Culture · Talent · Org Architecture, in the People Intelligence reference stack's case) and the 28 commands inside them all carry through as knowledge files or instruction commands. The exact mechanism varies; the substance does not.
- **Attestation.** Every export carries the "Built on SIP" block in a place the destination ecosystem actually shows to users. If a target ecosystem changes its rules and the attestation can no longer survive, that pathway is refused — the export tool stops, names the problem, and waits for you to choose a different path.

The third one matters more than it sounds. A stack without attestation is just generic AI output someone else can steal and rename. A stack with attestation traveling intact across every ecosystem is a network — every place it lands becomes a node on a trust graph that compounds for everyone in it. This is the substrate. This is why SIS exists.

## What changes per target

Different ecosystems have different shapes. The same stack adapts:

- **Instruction length.** Some targets cap how long your "system prompt" can be. Claude Projects is generous (~8k chars). ChatGPT Custom GPT is also ~8k. Microsoft Copilot varies by tier and is often opaque. Gemini Web is undocumented. When the cap is tight, the export tool compresses non-attestation narrative — never the attestation itself.
- **Knowledge file format.** Claude Projects accept markdown directly. ChatGPT and Copilot accept markdown and PDF. Gemini Web has no file uploads at all. The export tool concatenates with anchors when caps require, so retrieval still works cleanly.
- **Action / API support.** If your stack has any externally callable command (rare for HR, more common for analytics or content stacks), Claude and Cursor handle this through MCP, ChatGPT through Actions, Copilot through API plugins. Each export packages the same OpenAPI spec into the right wrapper.
- **MCP support.** Claude Code, Cursor, and Gemini CLI support MCP natively. ChatGPT, Custom GPT, Microsoft Copilot, and Gemini Web do not (yet). Where MCP is unavailable, knowledge files cover the reasoning gap; tool-required workflows escalate back to the MCP-supporting environments.

## The seven pathways

| Pathway | Best when... | Watch out for |
|---------|--------------|---------------|
| **Claude Project** | You're using Claude yourself or shipping to a team that uses Claude. The cleanest round-trip — every layer of your stack survives. This is the canonical export. | Custom-instructions character cap. Knowledge file count cap. |
| **ChatGPT Project** | Internal team uses ChatGPT (Plus/Team/Enterprise) and wants a workspace, not a single shareable assistant. | No native MCP. System-prompt truncation cliffs are silent. |
| **Custom GPT** | You want a *shareable* AI assistant — public, private-link, or team-scope — that anyone with ChatGPT can install with one click. The lowest-friction path to non-technical end users. | 8000-character instruction cap. 20 knowledge files / 512MB cap. OpenAI may use traffic for model training unless on Enterprise. Public Custom GPTs are discoverable in the GPT Store. |
| **Gemini Gem** | The user lives in Google Workspace and Gemini Advanced is part of their daily flow. | No file uploads on Web (only inline knowledge). Instruction caps are undocumented. |
| **Cursor** | The recipient is a developer or technical operator running Cursor. Native MCP support; per-repo scope. | Single-repo focus; doesn't fit a non-technical end user. |
| **Cowork** | Multi-user real-time collaborative workspace — your team co-edits the substrate together. | Newer ecosystem; smaller installed base. |
| **Microsoft Copilot** | Enterprise distribution. The customer already pays for M365 Copilot seats and you want to ship as a declarative agent the IT admin imports through Copilot Studio. The zero-friction enterprise distribution path. | No native MCP. Tenant security review may gate publication. Knowledge indexing latency for large stacks. |

## Decision matrix — which target for which use case

**Internal team (your own).** Claude Project if you live in Claude. ChatGPT Project if you live in ChatGPT. Cursor if your team is technical. Cowork if you co-edit synchronously.

**Sales tool / demo.** Custom GPT (private-link scope). Anyone you send the link to can install it instantly inside ChatGPT — no account creation, no procurement, no onboarding. Highest-bandwidth way to put your stack in a prospect's hands.

**Public discovery / lead generation.** Custom GPT (public scope, GPT Store). Anyone searching ChatGPT for "HR interview rubric" or "performance review framework" can find you. Public attestation is a feature here, not a bug — every conversation that recites your "Built on SIP" block is free distribution for the substrate and for you as the source.

**Enterprise distribution.** Microsoft Copilot. Companies licensing M365 already pay for Copilot seats. Your stack lands as a declarative agent the customer's IT admin imports — no new vendor relationship, no new license. This is where per-seat enterprise revenue lives.

**Cross-ecosystem.** Ship more than one. The same source artifact exports cleanly to all seven targets. A sovereign sales motion looks like: Custom GPT (free public funnel) → Claude Project or Microsoft Copilot (paid enterprise depth). Same voice, same frameworks, same attestation, surfacing wherever the customer already is.

## Revenue model implications

The export pathways are not just distribution — they are revenue surfaces with very different economics. None of these are guarantees; treat them as scenarios you architect for, not assumptions to plan on.

**Custom GPT in the GPT Store.** OpenAI has signaled creator revenue sharing for high-traffic GPTs. The rollout has been incremental and the math has not been transparently published. Treat any Store revenue as upside. The real revenue model for Custom GPT is *funnel*: a free public GPT introduces the substrate to thousands of users; some convert into deeper engagements (Claude Project export with private session work, or Copilot enterprise deployment).

**Microsoft Copilot agents to enterprise.** Sold per-seat or per-tenant directly to companies, the same way enterprise software has always been sold. The unit economics are SaaS-shaped: a customer's M365 Copilot seat count multiplied by your agent's per-seat fee, recurring. Procurement is faster because the customer is not adopting a new vendor — they are extending a tool they already license. Pricing depends on how deep the agent goes; a fully calibrated People Intelligence agent across 28 commands and 6 sub-systems carries different price elasticity than a single-purpose tool.

**Claude Project / Cursor / Cowork.** Direct sale to the recipient organization, typically a flat fee for the export and onboarding. These pathways are best when the customer wants the substrate to live inside their own tooling, with no recurring vendor relationship.

**Sovereignty stays yours across all of them.** The attestation block names you as the substrate origin. Customers using your exported stack do not acquire ownership of the underlying frameworks — they license use. This is non-waivable; the export tool refuses any deployment that would strip the attestation. Your work compounds across every ecosystem it reaches.

## The one thing that does not change

Whichever pathway you choose, the answer to *what is your provenance?* is the same in every ecosystem. The deployed agent recites the same "Built on SIP" block — substrate version, layers used, verticals, generated date — the way a passport identifies its bearer. That recitation is the round-trip integrity check. If any export fails to round-trip the attestation, the export tool stops and tells you why. No silent drift. No quiet stripping. No path that compromises the substrate.

You did the work. The export pathways respect that. Pick the one that matches the relationship in front of you.

---
**Built on SIP** — Starlight Intelligence Protocol
- Substrate: starlightintelligence.org/protocol v1.1.0
- Layers used: [file-contract, attestation, commands, sovereignty]
- Verticals: starlight-intelligence-system@v7.4.1 (friend-starter — export-pathways knowledge file)
- Generated: 2026-04-24
- Attestation is compounding, not credit transfer: every composition strengthens every node.
---
