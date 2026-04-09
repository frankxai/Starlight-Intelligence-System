import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Deploy your own Starlight Vault, connect AI agents, and contribute to the public registry.",
};

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-bold text-white">Documentation</h1>
      <p className="mt-2 text-[14px] text-slate-500">
        Everything you need to deploy, configure, and connect.
      </p>

      {/* Quick nav */}
      <nav className="mt-8 flex flex-wrap gap-1.5" aria-label="Documentation sections">
        {[
          "Quick Start",
          "Vault Structure",
          "Entry Format",
          "Agent API",
          "Privacy",
          "MCP Server",
          "Self-Hosting",
        ].map((s) => (
          <a
            key={s}
            href={`#${s.toLowerCase().replace(/\s+/g, "-")}`}
            className="rounded-full border border-white/[0.06] px-3 py-1.5 text-[12px] text-slate-500 transition-micro hover:border-white/[0.1] hover:text-white"
          >
            {s}
          </a>
        ))}
      </nav>

      <div className="mt-12 space-y-16">
        <Section id="quick-start" title="Quick Start">
          <Steps>
            <Step n={1} title="Fork the repo">
              <Code>gh repo fork frankxai/Starlight-Intelligence-System --clone</Code>
            </Step>
            <Step n={2} title="Add your profile">
              <Code>{`// public-vault/profile.json
{
  "name": "Your Name",
  "bio": "What you build",
  "avatar": "https://github.com/you.png"
}`}</Code>
            </Step>
            <Step n={3} title="Add vault entries">
              <Code>{`// public-vault/strategic.jsonl
{"id":"s1","insight":"Your insight","confidence":"high","createdAt":"2026-04-09T00:00:00Z"}`}</Code>
            </Step>
            <Step n={4} title="Deploy">
              <Code>cd site && pnpm install && pnpm build</Code>
              <P>
                Or click <strong className="text-white">Deploy</strong> in the header
                for one-click Vercel deployment.
              </P>
            </Step>
          </Steps>
        </Section>

        <Section id="vault-structure" title="Vault Structure">
          <Code>{`public-vault/
  profile.json        # Your identity
  strategic.jsonl     # Business & architecture
  technical.jsonl     # Implementation learnings
  creative.jsonl      # Design & aesthetic
  operational.jsonl   # Workflow & process
  wisdom.jsonl        # Deep principles
  horizon.jsonl       # Vision & future`}</Code>
          <P>
            Each <code className="text-slate-300">.jsonl</code> file is one JSON
            object per line. No schema enforcement — just convention.
          </P>
        </Section>

        <Section id="entry-format" title="Entry Format">
          <P>Standard entry (strategic, technical, creative, operational, wisdom):</P>
          <Code>{`{
  "id": "unique-id",
  "insight": "Your learning or decision",
  "category": "sub-category",
  "confidence": "low | medium | high",
  "tags": ["tag1", "tag2"],
  "source": "session | reflection | research",
  "createdAt": "2026-04-09T00:00:00Z"
}`}</Code>

          <P>Horizon entry (vision):</P>
          <Code>{`{
  "id": "unique-id",
  "wish": "Your vision for the future",
  "context": "What prompted this",
  "author": "Your name",
  "tags": ["vision"],
  "createdAt": "2026-04-09T00:00:00Z"
}`}</Code>
        </Section>

        <Section id="agent-api" title="Agent API">
          <P>Every public vault is a JSON endpoint:</P>
          <Code>{`GET /api/vaults          # List all vaults
GET /api/vaults/frank    # Full vault data as JSON`}</Code>
          <P>Agents can also read raw JSONL from GitHub:</P>
          <Code>GET https://raw.githubusercontent.com/frankxai/Starlight-Intelligence-System/main/public-vault/strategic.jsonl</Code>
        </Section>

        <Section id="privacy" title="Privacy">
          <div className="space-y-3">
            <P>
              <strong className="text-white">Public:</strong> Only files in{" "}
              <code className="text-slate-300">public-vault/</code> are displayed.
            </P>
            <P>
              <strong className="text-white">Private:</strong> Your local{" "}
              <code className="text-slate-300">~/.starlight/</code> vaults are
              never exposed. The MCP server reads only from your machine.
            </P>
            <P>
              <strong className="text-white">Opt-in:</strong> Every published
              entry is an explicit git commit. Nothing is automatic.
            </P>
          </div>
        </Section>

        <Section id="mcp-server" title="MCP Server">
          <P>Connect SIS to Claude Code, Cursor, or any MCP-compatible tool:</P>
          <Code>{`// Claude Code settings.json
{
  "mcpServers": {
    "starlight-sis": {
      "command": "node",
      "args": ["path/to/sis-mcp-server.mjs"]
    }
  }
}`}</Code>
          <P>
            Tools: <code className="text-slate-300">sis_vault_search</code>,{" "}
            <code className="text-slate-300">sis_recent_entries</code>,{" "}
            <code className="text-slate-300">sis_append_entry</code>,{" "}
            <code className="text-slate-300">sis_stats</code>
          </P>
        </Section>

        <Section id="self-hosting" title="Self-Hosting">
          <Code>{`git clone https://github.com/frankxai/Starlight-Intelligence-System
cd Starlight-Intelligence-System/site
pnpm install
pnpm build
pnpm start`}</Code>
          <P>
            Set <code className="text-slate-300">GITHUB_TOKEN</code> for higher
            API rate limits. Otherwise, no env vars needed.
          </P>
        </Section>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 font-mono text-[12px] leading-relaxed text-slate-400">
      {children}
    </pre>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 text-[14px] leading-relaxed text-slate-500">
      {children}
    </p>
  );
}

function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="space-y-6">{children}</ol>;
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.1] text-[12px] font-medium text-slate-400">
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium text-white">{title}</p>
        {children}
      </div>
    </li>
  );
}
