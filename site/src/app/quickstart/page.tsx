import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quickstart",
  description:
    "Install Starlight Intelligence in 2 minutes. Pick your AI tool and copy the config.",
  openGraph: {
    title: "Quickstart — Starlight Intelligence",
    description:
      "Install Starlight Intelligence in 2 minutes. Pick your AI tool and copy the config.",
    type: "article",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Starlight Intelligence — Quickstart" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quickstart — Starlight Intelligence",
    description:
      "Install in 2 minutes. Pick your AI tool, copy the config.",
    images: ["/opengraph-image"],
  },
};

type Platform = {
  name: string;
  labelColor: string;
  labelBg: string;
  labelBorder: string;
  context: string;
  memoryFile: string;
  configPath: string;
  reason: string;
  json: string;
};

const PLATFORMS: Platform[] = [
  {
    name: "Claude Code",
    labelColor: "text-violet-400",
    labelBg: "bg-violet-500/[0.07]",
    labelBorder: "border-violet-500/[0.18]",
    context: "200k tokens",
    memoryFile: "CLAUDE.md",
    configPath: "~/.claude/mcp.json",
    reason: "Best for deep work — persistent sessions and rich tool access.",
    json: `{
  "mcpServers": {
    "starlight-sis": {
      "command": "node",
      "args": ["node_modules/@frankx/starlight-intelligence-system/dist/mcp-server.js"]
    }
  }
}`,
  },
  {
    name: "Cursor",
    labelColor: "text-cyan-400",
    labelBg: "bg-cyan-500/[0.07]",
    labelBorder: "border-cyan-500/[0.18]",
    context: "200k tokens",
    memoryFile: ".cursorrules",
    configPath: ".cursor/mcp.json",
    reason: "Best for IDE-native editing with memory-aware completions.",
    json: `{
  "mcpServers": {
    "starlight-sis": {
      "command": "node",
      "args": ["node_modules/@frankx/starlight-intelligence-system/dist/mcp-server.js"]
    }
  }
}`,
  },
  {
    name: "Codex",
    labelColor: "text-fuchsia-400",
    labelBg: "bg-fuchsia-500/[0.07]",
    labelBorder: "border-fuchsia-500/[0.18]",
    context: "128k tokens",
    memoryFile: "AGENTS.md",
    configPath: "~/.codex/mcp.json",
    reason: "Best for terminal-first workflows with OpenAI reasoning.",
    json: `{
  "mcpServers": {
    "starlight-sis": {
      "command": "node",
      "args": ["node_modules/@frankx/starlight-intelligence-system/dist/mcp-server.js"]
    }
  }
}`,
  },
  {
    name: "Gemini CLI",
    labelColor: "text-amber-400",
    labelBg: "bg-amber-500/[0.07]",
    labelBorder: "border-amber-500/[0.18]",
    context: "1M tokens",
    memoryFile: "GEMINI.md",
    configPath: "~/.gemini/settings.json",
    reason: "Best for massive context — feed your whole vault in one shot.",
    json: `{
  "mcpServers": {
    "starlight-sis": {
      "command": "node",
      "args": ["node_modules/@frankx/starlight-intelligence-system/dist/mcp-server.js"]
    }
  }
}`,
  },
  {
    name: "OpenCode",
    labelColor: "text-emerald-400",
    labelBg: "bg-emerald-500/[0.07]",
    labelBorder: "border-emerald-500/[0.18]",
    context: "model-dependent",
    memoryFile: "AGENTS.md",
    configPath: "~/.config/opencode/config.json",
    reason: "Best for multi-model routing — swap models without losing memory.",
    json: `{
  "mcp": {
    "starlight-sis": {
      "type": "local",
      "command": ["node", "node_modules/@frankx/starlight-intelligence-system/dist/mcp-server.js"]
    }
  }
}`,
  },
];

export default function QuickstartPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* Hero */}
      <p className="text-[11px] font-medium uppercase tracking-widest text-violet-400">
        Two minutes to compound intelligence
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
        Quickstart
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-400">
        Pick your tool. Copy the config. Your next AI session remembers
        everything.
      </p>

      {/* Step 1 — Install */}
      <section className="mt-16">
        <StepLabel n={1} label="Install the package" />
        <p className="mt-3 text-[14px] leading-relaxed text-slate-400">
          Install once from npm. Works with any MCP-compatible client.
        </p>
        <Terminal>
          <span className="text-emerald-400">$</span>{" "}
          <span className="text-slate-400">npm install</span>{" "}
          <span className="text-violet-400">
            @frankx/starlight-intelligence-system
          </span>
        </Terminal>
      </section>

      {/* Step 2 — Platform configs */}
      <section className="mt-16">
        <StepLabel n={2} label="Configure your tool" />
        <p className="mt-3 text-[14px] leading-relaxed text-slate-400">
          Every adapter speaks the same MCP protocol. Pick yours and paste.
        </p>

        <div className="mt-8 space-y-6">
          {PLATFORMS.map((p) => (
            <div
              key={p.name}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-std hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider ${p.labelColor} ${p.labelBg} ${p.labelBorder}`}
                >
                  {p.name}
                </span>
                <span className="text-[11px] uppercase tracking-widest text-slate-600">
                  {p.context}
                </span>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-slate-400">
                {p.reason}
              </p>

              <dl className="mt-4 grid gap-2 text-[12px] sm:grid-cols-2">
                <div className="flex gap-2">
                  <dt className="text-slate-600">memory:</dt>
                  <dd className="font-mono text-slate-300">{p.memoryFile}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-slate-600">config:</dt>
                  <dd className="font-mono text-slate-300">{p.configPath}</dd>
                </div>
              </dl>

              <CodeBlock>{p.json}</CodeBlock>
            </div>
          ))}
        </div>
      </section>

      {/* Step 3 — Verify */}
      <section className="mt-16">
        <StepLabel n={3} label="Verify it works" />
        <p className="mt-3 text-[14px] leading-relaxed text-slate-400">
          Run the MCP server directly to confirm it starts and lists its tools.
        </p>
        <Terminal>
          <span className="text-emerald-400">$</span>{" "}
          <span className="text-slate-400">npx</span>{" "}
          <span className="text-violet-400">@frankx/starlight-intelligence-system</span>{" "}
          <span className="text-slate-400">--list-tools</span>
          {"\n"}
          <span className="text-slate-600">{"→ sis_append_entry"}</span>
          {"\n"}
          <span className="text-slate-600">{"→ sis_recent_entries"}</span>
          {"\n"}
          <span className="text-slate-600">{"→ sis_vault_search"}</span>
          {"\n"}
          <span className="text-slate-600">{"→ sis_stats"}</span>
        </Terminal>
      </section>

      {/* Step 4 — First entry */}
      <section className="mt-16">
        <StepLabel n={4} label="Add your first entry" />
        <p className="mt-3 text-[14px] leading-relaxed text-slate-400">
          In any configured tool, just tell the agent to remember something.
          Under the hood it calls{" "}
          <code className="rounded bg-white/[0.04] px-1.5 py-0.5 font-mono text-[12px] text-violet-300">
            sis_append_entry
          </code>
          .
        </p>
        <Terminal>
          <span className="text-slate-500">{"// in Claude Code, just ask:"}</span>
          {"\n"}
          <span className="text-slate-300">
            {'"Remember that we chose Next.js 16 for the App Router streaming work."'}
          </span>
          {"\n\n"}
          <span className="text-slate-500">{"// or call the tool directly:"}</span>
          {"\n"}
          <span className="text-violet-400">sis_append_entry</span>
          <span className="text-slate-400">(</span>
          {"\n"}
          {"  "}
          <span className="text-violet-400">vault</span>
          <span className="text-slate-400">:</span>{" "}
          <span className="text-emerald-400">&quot;technical&quot;</span>
          <span className="text-slate-400">,</span>
          {"\n"}
          {"  "}
          <span className="text-violet-400">insight</span>
          <span className="text-slate-400">:</span>{" "}
          <span className="text-emerald-400">
            &quot;Chose Next.js 16 for App Router streaming&quot;
          </span>
          <span className="text-slate-400">,</span>
          {"\n"}
          {"  "}
          <span className="text-violet-400">confidence</span>
          <span className="text-slate-400">:</span>{" "}
          <span className="text-emerald-400">&quot;high&quot;</span>
          {"\n"}
          <span className="text-slate-400">)</span>
        </Terminal>

        <div className="mt-8 rounded-xl border border-violet-500/[0.15] bg-violet-500/[0.05] p-5">
          <p className="text-[13px] leading-relaxed text-slate-300">
            That entry is now a plain JSONL line in{" "}
            <code className="font-mono text-[12px] text-violet-300">
              vaults/frank/technical.jsonl
            </code>
            . Every tool with the MCP configured can read it. Your memory
            compounds across every session.
          </p>
        </div>
      </section>

      {/* Next steps */}
      <section className="mt-20 border-t border-white/[0.08] pt-10">
        <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-600">
          Next
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/architecture"
            className="rounded-full border border-white/[0.1] px-5 py-2.5 text-[13px] font-medium text-white transition-std hover:border-white/[0.2] hover:bg-white/[0.04]"
          >
            See the architecture &rarr;
          </Link>
          <Link
            href="/vaults"
            className="rounded-full border border-white/[0.1] px-5 py-2.5 text-[13px] font-medium text-white transition-std hover:border-white/[0.2] hover:bg-white/[0.04]"
          >
            Explore live vaults &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}

function StepLabel({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-violet-500/[0.25] bg-violet-500/[0.08] font-mono text-[11px] text-violet-300">
        {n}
      </span>
      <h2 className="text-xl font-semibold text-white">{label}</h2>
    </div>
  );
}

function Terminal({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c12]">
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/[0.06]" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/[0.06]" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/[0.06]" />
        <code className="ml-3 font-mono text-[11px] text-slate-500">
          terminal
        </code>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-[1.8] text-slate-300">
        {children}
      </pre>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-white/[0.06] bg-[#0c0c12]">
      <div className="border-b border-white/[0.08] px-4 py-2">
        <code className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
          mcp config
        </code>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-[1.7] text-slate-300">
        {children}
      </pre>
    </div>
  );
}
