# Tier Rationale — Why These Picks

Read this before overriding any canonical pick in `assign`. Each tier collapses an option space — the reasoning matters.

## Substrate — Starlight (locked)

Non-negotiable. The substrate owns persistent memory, attestation, and the sovereignty clause. No alternative is permitted because no alternative carries the file contract.

## Reasoning surface — Claude Project as default

Claude wins as the default reasoning surface across every brand because:

1. **Reasoning quality compounds with protocol-heavy workflows.** SIP, Luminor Board, canon work — all benefit from Claude's structured reasoning.
2. **Project memory is robust.** Claude Projects hold long context without the drift that ChatGPT Projects sometimes show under continuous use.
3. **Voice consistency.** Claude maintains a more consistent voice across long sessions, which matters for canon work.

**Exception — ChatGPT Project for BV / Dutch tax / structured forms.** OpenAI's EU/NL legal corpus coverage is currently denser, and Custom GPTs hold structured form-filling better. Use ChatGPT here, Claude everywhere else.

**Exception — Gemini Gem for long-doc analysis.** When the input is a single 500K-token document (contract review, multi-PDF synthesis), Gemini's context window wins on raw capacity. Reach for it as a tool, not a primary surface.

**Exception — Grok for live sentiment.** Only when you need real-time X/Twitter signal on a launch. Not a coding agent. Not a reasoning surface for sustained work.

**Exception — Perplexity Space for research-mode reading.** When the task is "find me 20 high-signal articles on X", Perplexity Spaces outperform anything else. Use it as a research collector, never as a writing surface.

## Coding agent — Claude Code primary

Claude Code is the default coding agent everywhere because:

1. **The file contract is the substrate.** Skills, slash commands, MCPs all resolve in Claude Code first. Cursor and Codex are downstream.
2. **The agent harness is here.** Subagents, parallel dispatch, scheduled tasks — all run through Claude Code.

**Codex CLI** earns the secondary slot for overnight / parallel wave work. It's a different model with different failure modes — useful for orthogonal checks on the same problem.

**Cursor** earns a secondary slot only when the task is UI/visual loops (component dev with hot reload, design iteration). For protocol-layer work, Cursor's IDE-mode adds friction without adding signal.

**Gemini CLI** is the free pass on the Google ecosystem (Drive, Calendar, Gmail) — use it when you need MCP-less Google access.

**Antigravity** is experimental. Try it on isolated tasks. Don't bind it to a brand.

## Research browser — Arc Spaces (with caveats)

Arc with one Space per brand has been the cleanest pattern. **Caveat:** Browser Company (Arc's maker) has shifted focus to Dia (their AI browser). Arc still works but the trajectory is uncertain. Substitute Opera Workspaces if Arc dies — same ergonomic shape.

**Chrome** is reserved exclusively for Claude-in-Chrome agentic sessions. Don't pollute it with personal tabs — keep it as an agent surface.

**Comet** (Perplexity's browser) for research-mode reading only. AI-first reading, link-following with summaries. Don't try to run ops in Comet.

Cross-browser specialization beats one-browser consolidation when each browser is itself an agent surface. Resist the urge to consolidate.

## Ops MCPs — by capability, not by brand

MCPs are tools, not surfaces. They attach to whichever repo needs them. Common patterns:

- **Vercel MCP** — every repo deployed to Vercel (Arcanea, FrankX)
- **Supabase MCP** — Arcanea only (FrankX uses static deploy)
- **GitHub MCP** — every repo
- **Notion MCP** — every brand (Notion is the human authority for intent)
- **Linear MCP** — Arcanea (issue tracking) + Starlight (planning)
- **Figma MCP** — Arcanea + FrankX (design surfaces)
- **Gmail / Calendar MCP** — Business (ops cadence) + personal
- **Memory Bus MCP** — Starlight only (substrate persistence)

Anti-pattern: configuring the same MCP in multiple repos with different auth scopes. The drift check catches this.

## When to override

Override the defaults when:

1. **The repo has a unique constraint.** Onchain workspace gets a chain-RPC MCP that no other repo needs.
2. **A vendor breakage forces substitution.** Claude is down → temporary fallback to Gemini for the session. Update STACK.md to reflect the temporary state.
3. **An experiment is running.** Trying Antigravity on a repo for a week → mark it experimental in STACK.md, set a review date.

Never override because:

- "I want to try this new shiny tool." Try it in an isolated experiment repo first.
- "ChatGPT happens to be open in my browser." That's not a binding rationale.
- "Cursor has nicer autocomplete." Not relevant to which agent should own the surface.
