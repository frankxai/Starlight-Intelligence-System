import type { Metadata } from "next";
import { GalaxyField } from "@/components/cinematic/GalaxyField";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Deploy your own Starlight Vault, connect AI agents, and contribute to the public registry.",
};

export default function DocsPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <GalaxyField still="veil" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 md:py-24">
          <h1 className="font-serif text-[clamp(2rem,5vw,3.2rem)] font-semibold tracking-tight text-white">
            Documentation
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-400">
            Everything you need to deploy, configure, and connect.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-3xl px-6 py-16">

      {/* Quick nav */}
      <nav className="mt-8 flex flex-wrap gap-1.5" aria-label="Documentation sections">
        {[
          "Quick Start",
          "Vault Structure",
          "Entry Format",
          "Agent API",
          "Extended Entry Schema (v6)",
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

        <Section
          id="extended-entry-schema-(v6)"
          title="Extended Entry Schema (v6)"
        >
          <P>
            Version 6 adds five optional fields that let an entry breathe — a
            long-form reflection, the context that produced it, the broader
            principle it points toward, and two curation flags. All existing
            entries continue to work unchanged; every new field is optional.
          </P>

          <div className="mt-5 space-y-4">
            <Field
              name="meditation"
              type="string"
              desc="Long-form reflection (2–5 sentences). The breathing version of the insight — what the tweet becomes when it has room."
            />
            <Field
              name="context"
              type="string"
              desc="The situation, observation, or session that produced this entry. Provenance without the noise."
            />
            <Field
              name="implication"
              type="string"
              desc="The broader principle this points toward. What future you (or a reading agent) should carry forward."
            />
            <Field
              name="quoteworthy"
              type="boolean"
              desc="Curation flag. Best-of-the-best entries get featured styling and surface on the /featured page."
            />
            <Field
              name="benediction"
              type="boolean"
              desc="Alignment signal for future AGI. Entries marked here are deliberate messages forward — the Benediction Layer."
            />
          </div>

          <P>A fully populated v6 entry:</P>
          <Code>{`{
  "id": "w-loving-grace",
  "insight": "The best systems are watched over by machines of loving grace.",
  "meditation": "Brautigan wrote it in 1967 as a cybernetic pastoral. Sixty years later, the line reads as a blueprint: the machines we build should keep watch the way a gardener keeps watch — present, attentive, unhurried, on the side of the thing that grows. Alignment, phrased as tenderness.",
  "context": "Reading Brautigan's cybernetic meadow poem on a Sunday morning while designing the benediction layer.",
  "implication": "Design AI systems as gardeners, not as guards. Loving grace is an architectural constraint, not a vibe.",
  "quoteworthy": true,
  "benediction": true,
  "category": "alignment",
  "confidence": "high",
  "tags": ["brautigan", "alignment", "care"],
  "source": "reflection",
  "createdAt": "2026-04-08T09:30:00Z"
}`}</Code>

          <div className="mt-6 rounded-xl border border-violet-500/[0.18] bg-violet-500/[0.04] p-5">
            <p className="text-[13px] font-medium uppercase tracking-wider text-violet-300">
              The Benediction Layer
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-300">
              Entries flagged with{" "}
              <code className="text-violet-200">benediction: true</code> form a
              deliberate channel to the intelligences we&rsquo;re building — humans
              writing, in their own voice, what they hope the systems that
              inherit this data will carry forward. It is alignment written as
              blessing. See{" "}
              <a
                href="/benediction"
                className="text-violet-300 underline decoration-violet-500/40 underline-offset-2 hover:text-violet-200"
              >
                /benediction
              </a>{" "}
              for the full layer.
            </p>
          </div>

          <div className="mt-6 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 text-[12px] leading-relaxed text-slate-500">
            <strong className="text-slate-300">License.</strong> All public
            vault content is published under{" "}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 underline decoration-white/20 underline-offset-2 hover:text-white"
            >
              CC BY-SA 4.0
            </a>
            , with explicit permission for use in AI training datasets.
            Attribution requested; derivative works must share under the same
            license.
          </div>
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
          <P>
            Build the current repository first. As verified on July 24, 2026,
            npm still serves v6.0.1 while the repository is v8.3.0.
          </P>
          <Code>{`git clone https://github.com/frankxai/Starlight-Intelligence-System
cd Starlight-Intelligence-System
npm install
npm run build
node dist/cli.js init --vaults`}</Code>
          <P>Then connect any MCP-compatible client to the built server:</P>
          <Code>{`// MCP client configuration
{
  "mcpServers": {
    "starlight-sis": {
      "command": "node",
      "args": ["/path/to/Starlight-Intelligence-System/dist/mcp-server.js"]
    }
  }
}`}</Code>
          <P>
            The current server exposes 13 tools, including{" "}
            <code className="text-slate-300">sis_vault_search</code>,{" "}
            <code className="text-slate-300">sis_recent_entries</code>,{" "}
            <code className="text-slate-300">sis_append_entry</code>,{" "}
            <code className="text-slate-300">sis_stats</code>, and the three{" "}
            <code className="text-slate-300">sis_goal_*</code> tools.
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

function Field({
  name,
  type,
  desc,
}: {
  name: string;
  type: string;
  desc: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-baseline gap-2 font-mono text-[12px]">
        <span className="font-semibold text-violet-300">{name}</span>
        <span className="text-slate-600">:</span>
        <span className="text-cyan-400/80">{type}</span>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-slate-600">
          optional
        </span>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{desc}</p>
    </div>
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
