import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs — Starlight Intelligence",
  description: "How to deploy, configure, and connect agents to your Starlight Vault.",
};

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Documentation</h1>
      <p className="mt-2 text-sm text-slate-400">
        Everything you need to deploy your own vault and connect it to AI agents.
      </p>

      <div className="mt-12 space-y-12">
        <Section title="Quick Start">
          <ol className="list-decimal space-y-4 pl-5 text-sm text-slate-300">
            <li>
              <strong className="text-white">Fork the repo</strong>
              <Code>
                gh repo fork frankxai/Starlight-Intelligence-System --clone
              </Code>
            </li>
            <li>
              <strong className="text-white">Add your profile</strong>
              <Code>{`// public-vault/profile.json
{
  "name": "Your Name",
  "bio": "What you build",
  "avatar": "https://github.com/you.png"
}`}</Code>
            </li>
            <li>
              <strong className="text-white">Add vault entries</strong>
              <Code>{`// public-vault/strategic.jsonl
{"id":"s1","insight":"Your insight here","category":"strategy","confidence":"high","createdAt":"2026-04-08T00:00:00Z"}`}</Code>
            </li>
            <li>
              <strong className="text-white">Deploy to Vercel</strong>
              <p className="mt-1 text-slate-400">
                Click the Deploy button on the homepage, or:
              </p>
              <Code>{`cd site && pnpm install && pnpm build`}</Code>
            </li>
          </ol>
        </Section>

        <Section title="Vault Structure">
          <p className="text-sm text-slate-400">
            Each vault is a directory of JSONL files — one JSON object per line:
          </p>
          <Code>{`public-vault/
├── profile.json        # Your identity
├── strategic.jsonl     # Business & architecture insights
├── technical.jsonl     # Implementation learnings
├── creative.jsonl      # Design & aesthetic decisions
├── operational.jsonl   # Workflow & process patterns
├── wisdom.jsonl        # Deep principles & truths
└── horizon.jsonl       # Vision & aspirational goals`}</Code>
        </Section>

        <Section title="Entry Format">
          <p className="text-sm text-slate-400">
            Standard entry (strategic, technical, creative, operational, wisdom):
          </p>
          <Code>{`{
  "id": "unique-id",
  "insight": "Your learning or decision",
  "category": "sub-category",
  "confidence": "low | medium | high",
  "tags": ["tag1", "tag2"],
  "source": "session | reflection | research",
  "createdAt": "2026-04-08T00:00:00Z"
}`}</Code>
          <p className="mt-4 text-sm text-slate-400">
            Horizon entry (vision statements):
          </p>
          <Code>{`{
  "id": "unique-id",
  "wish": "Your vision for the future",
  "context": "What prompted this vision",
  "author": "Your name",
  "tags": ["vision", "future"],
  "createdAt": "2026-04-08T00:00:00Z"
}`}</Code>
        </Section>

        <Section title="Agent Integration">
          <p className="text-sm text-slate-400">
            Every public vault exposes a JSON API that agents can consume:
          </p>
          <Code>{`# List all public vaults
GET /api/vaults

# Get a specific vault's data
GET /api/vaults/frank

# Response includes all entries organized by category`}</Code>
          <p className="mt-4 text-sm text-slate-400">
            Agents can also read vault data directly from GitHub:
          </p>
          <Code>{`# Raw JSONL from GitHub
GET https://raw.githubusercontent.com/frankxai/Starlight-Intelligence-System/main/public-vault/strategic.jsonl`}</Code>
        </Section>

        <Section title="Privacy Model">
          <div className="space-y-3 text-sm text-slate-400">
            <p>
              <strong className="text-white">Public:</strong> Only files in{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-slate-300">
                public-vault/
              </code>{" "}
              are ever displayed on the site or API.
            </p>
            <p>
              <strong className="text-white">Private:</strong> Your local{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-slate-300">
                ~/.starlight/
              </code>{" "}
              vaults are never exposed. The SIS MCP server reads only from your
              local machine.
            </p>
            <p>
              <strong className="text-white">You choose:</strong> Every entry you publish
              is an explicit decision. Fork, add entries, push. Nothing is
              automatic.
            </p>
          </div>
        </Section>

        <Section title="MCP Server">
          <p className="text-sm text-slate-400">
            The Starlight Intelligence System includes an MCP server for AI tools:
          </p>
          <Code>{`# Install
npm install -g @frankx/starlight-intelligence-system

# Configure for Claude Code (settings.json)
{
  "mcpServers": {
    "starlight-sis": {
      "command": "node",
      "args": ["path/to/sis-mcp-server.mjs"]
    }
  }
}`}</Code>
          <p className="mt-3 text-sm text-slate-400">
            Available tools: <code className="text-slate-300">sis_vault_search</code>,{" "}
            <code className="text-slate-300">sis_recent_entries</code>,{" "}
            <code className="text-slate-300">sis_append_entry</code>,{" "}
            <code className="text-slate-300">sis_stats</code>
          </p>
        </Section>

        <Section title="Self-Hosting">
          <Code>{`# Clone and build
git clone https://github.com/frankxai/Starlight-Intelligence-System
cd Starlight-Intelligence-System/site
pnpm install
pnpm build
pnpm start

# Or deploy to Vercel
vercel --prod`}</Code>
          <p className="mt-3 text-sm text-slate-400">
            Optional: Set <code className="text-slate-300">GITHUB_TOKEN</code> env var
            for higher GitHub API rate limits.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 font-mono text-xs text-slate-400">
      {children}
    </pre>
  );
}
