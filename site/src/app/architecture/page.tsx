import type { Metadata } from "next";
import Link from "next/link";
import {
  getAllEntries,
  getVaultRegistry,
  VAULT_CATEGORIES,
  getCategoryMeta,
} from "@/lib/vault";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Architecture",
  description:
    "How Starlight Intelligence works. JSONL as truth, SQLite as index, MCP as the pipe.",
  openGraph: {
    title: "Architecture — Starlight Intelligence",
    description:
      "How Starlight Intelligence works. JSONL as truth, SQLite as index, MCP as the pipe.",
    type: "article",
  },
};

const PLATFORMS = [
  { name: "Claude Code", color: "text-violet-400", border: "border-violet-500/[0.2]" },
  { name: "Cursor", color: "text-cyan-400", border: "border-cyan-500/[0.2]" },
  { name: "Codex", color: "text-fuchsia-400", border: "border-fuchsia-500/[0.2]" },
  { name: "Gemini CLI", color: "text-amber-400", border: "border-amber-500/[0.2]" },
  { name: "OpenCode", color: "text-emerald-400", border: "border-emerald-500/[0.2]" },
];

export default async function ArchitecturePage() {
  const [entries, registry] = await Promise.all([
    getAllEntries(),
    getVaultRegistry(),
  ]);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.04]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-mesh-1 absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-violet-600/[0.05] blur-[100px]" />
          <div className="animate-mesh-2 absolute right-0 top-20 h-[300px] w-[300px] rounded-full bg-cyan-500/[0.04] blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 py-20">
          <p className="text-[11px] font-medium uppercase tracking-widest text-violet-400">
            One principle
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            JSONL is truth.
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Everything else is a rebuildable index.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-400">
            No database lock-in. No proprietary format. Your intelligence lives
            as plain files you can grep, diff, and version — and every index on
            top can be thrown away and rebuilt in seconds.
          </p>
        </div>
      </section>

      {/* ── The Flow ── */}
      <section className="border-b border-white/[0.04] px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-600">
            The flow
          </h2>
          <p className="mt-3 text-xl font-semibold text-white">
            Four layers. Each one replaceable.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            <FlowNode
              step="01"
              title="JSONL files"
              desc="One file per vault category. Append-only. Git-tracked."
              accent="violet"
            />
            <FlowNode
              step="02"
              title="SQLite index"
              desc="FTS5 full-text search + vector embeddings. Rebuildable."
              accent="cyan"
            />
            <FlowNode
              step="03"
              title="MCP server"
              desc="JSON-RPC 2.0 protocol. Standard tool calls."
              accent="fuchsia"
            />
            <FlowNode
              step="04"
              title="AI tools"
              desc="Claude, Cursor, Codex, Gemini, OpenCode — all read the same memory."
              accent="emerald"
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-[11px] uppercase tracking-widest text-slate-600">
            <span>truth</span>
            <span className="text-slate-700">&rarr;</span>
            <span>rebuildable</span>
            <span className="text-slate-700">&rarr;</span>
            <span>json-rpc 2.0</span>
            <span className="text-slate-700">&rarr;</span>
            <span>compound</span>
          </div>
        </div>
      </section>

      {/* ── The Six Vaults ── */}
      <section className="border-b border-white/[0.04] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-600">
            Six semantic vaults
          </h2>
          <p className="mt-3 max-w-md text-xl font-semibold text-white">
            Each category is its own JSONL file, indexed separately.
          </p>

          <div className="mt-10 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {VAULT_CATEGORIES.map((cat) => {
              const meta = getCategoryMeta(cat);
              const count = entries.filter(
                (e) => e.vaultCategory === cat
              ).length;
              return (
                <div
                  key={cat}
                  className={`rounded-xl border p-5 transition-std hover:border-white/[0.2] ${meta.bg}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[13px] font-semibold ${meta.color}`}>
                      {meta.icon} {meta.label}
                    </span>
                    <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-500">
                      {count}
                    </span>
                  </div>
                  <p className="mt-2 text-[12px] text-slate-600">{meta.desc}</p>
                  <code className="mt-3 block font-mono text-[11px] text-slate-500">
                    vaults/*/{cat}.jsonl
                  </code>
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-[13px] text-slate-600">
            {entries.length} entries across {registry.length} public vault
            {registry.length === 1 ? "" : "s"}. All rebuildable from raw files.
          </p>
        </div>
      </section>

      {/* ── Temporal Layer ── */}
      <section className="border-b border-white/[0.04] px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-600">
            Temporal layer
          </h2>
          <p className="mt-3 text-xl font-semibold text-white">
            Intelligence that ages gracefully.
          </p>
          <p className="mt-4 text-[14px] leading-relaxed text-slate-400">
            Every entry carries temporal metadata. Old insights fade unless
            confirmed. Stale decisions surface for review. The system knows
            what&apos;s still true.
          </p>

          <div className="mt-8 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c12]">
            <div className="border-b border-white/[0.04] px-4 py-2">
              <code className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
                strategic.jsonl
              </code>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-[1.8] text-slate-500">
              <span className="text-slate-600">{"{"}</span>
              {"\n"}
              {"  "}
              <span className="text-violet-400">&quot;insight&quot;</span>:{" "}
              <span className="text-emerald-400">
                &quot;Open core beats premature tiers&quot;
              </span>
              ,{"\n"}
              {"  "}
              <span className="text-violet-400">&quot;confidence&quot;</span>:{" "}
              <span className="text-emerald-400">&quot;high&quot;</span>,{"\n"}
              {"  "}
              <span className="text-violet-400">&quot;validFrom&quot;</span>:{" "}
              <span className="text-amber-400">&quot;2026-04-05&quot;</span>,
              {"\n"}
              {"  "}
              <span className="text-violet-400">&quot;validUntil&quot;</span>:{" "}
              <span className="text-amber-400">&quot;2026-10-05&quot;</span>,
              {"\n"}
              {"  "}
              <span className="text-violet-400">&quot;lastConfirmed&quot;</span>
              : <span className="text-amber-400">&quot;2026-04-08&quot;</span>,
              {"\n"}
              {"  "}
              <span className="text-violet-400">
                &quot;confidenceDecay&quot;
              </span>
              : <span className="text-cyan-400">0.92</span>
              {"\n"}
              <span className="text-slate-600">{"}"}</span>
            </pre>
          </div>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <TemporalField
              name="validFrom"
              desc="When the insight became true"
            />
            <TemporalField
              name="validUntil"
              desc="Auto-flagged for review after this date"
            />
            <TemporalField
              name="lastConfirmed"
              desc="Most recent time you reaffirmed it"
            />
            <TemporalField
              name="confidenceDecay"
              desc="Drops from 1.0 as time passes without confirmation"
            />
          </dl>
        </div>
      </section>

      {/* ── The Learning Loop ── */}
      <section className="border-b border-white/[0.04] px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-600">
            The learning loop
          </h2>
          <p className="mt-3 text-xl font-semibold text-white">
            Every session makes the next one sharper.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-4">
            {[
              { label: "Use", desc: "Agent pulls context from your vault" },
              { label: "Learn", desc: "New insights get appended as JSONL" },
              { label: "Improve", desc: "Indexes rebuild; confidence updates" },
              {
                label: "Use again",
                desc: "Next session starts with deeper memory",
              },
            ].map((stage, i) => (
              <div
                key={stage.label}
                className="relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-std hover:border-white/[0.12] hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-violet-400">
                    0{i + 1}
                  </span>
                  <span className="text-[13px] font-semibold text-white">
                    {stage.label}
                  </span>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
                  {stage.desc}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-[11px] uppercase tracking-widest text-slate-600">
            &rarr; the loop that learns is the loop that lives &rarr;
          </p>
        </div>
      </section>

      {/* ── Cross-tool compounding ── */}
      <section className="border-b border-white/[0.04] px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-600">
            Cross-tool compounding
          </h2>
          <p className="mt-3 max-w-md text-xl font-semibold text-white">
            One memory. Every agent. No silos.
          </p>
          <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-slate-400">
            The MCP protocol is the universal pipe. Whatever tool you&apos;re in
            today, your intelligence is already there.
          </p>

          <div className="mt-10 flex flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center gap-3">
              {PLATFORMS.map((p) => (
                <div
                  key={p.name}
                  className={`rounded-full border px-4 py-2 text-[12px] font-semibold transition-std hover:bg-white/[0.04] ${p.color} ${p.border}`}
                >
                  {p.name}
                </div>
              ))}
            </div>

            <div className="font-mono text-[11px] uppercase tracking-widest text-slate-600">
              &darr; all read &darr;
            </div>

            <div className="rounded-xl border border-violet-500/[0.2] bg-violet-500/[0.05] px-6 py-4">
              <code className="font-mono text-[13px] text-violet-300">
                starlight-sis
              </code>
              <p className="mt-1 text-[11px] uppercase tracking-widest text-slate-500">
                one shared memory
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[15px] leading-relaxed text-slate-400">
            Two minutes to install. A lifetime to compound.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/quickstart"
              className="rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#060609] transition-std hover:shadow-[0_0_30px_rgba(167,139,250,0.2)]"
            >
              Start the quickstart &rarr;
            </Link>
            <Link
              href="/vaults"
              className="rounded-full border border-white/[0.1] px-6 py-3 text-[14px] font-medium text-white transition-std hover:border-white/[0.2] hover:bg-white/[0.04]"
            >
              Explore live vaults
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FlowNode({
  step,
  title,
  desc,
  accent,
}: {
  step: string;
  title: string;
  desc: string;
  accent: "violet" | "cyan" | "fuchsia" | "emerald";
}) {
  const accents = {
    violet: "border-violet-500/[0.2] bg-violet-500/[0.05]",
    cyan: "border-cyan-500/[0.2] bg-cyan-500/[0.05]",
    fuchsia: "border-fuchsia-500/[0.2] bg-fuchsia-500/[0.05]",
    emerald: "border-emerald-500/[0.2] bg-emerald-500/[0.05]",
  };
  const stepColors = {
    violet: "text-violet-400",
    cyan: "text-cyan-400",
    fuchsia: "text-fuchsia-400",
    emerald: "text-emerald-400",
  };
  return (
    <div
      className={`rounded-xl border p-5 transition-std hover:border-white/[0.2] ${accents[accent]}`}
    >
      <span className={`font-mono text-[11px] ${stepColors[accent]}`}>
        {step}
      </span>
      <h3 className="mt-2 text-[14px] font-semibold text-white">{title}</h3>
      <p className="mt-2 text-[12px] leading-relaxed text-slate-500">{desc}</p>
    </div>
  );
}

function TemporalField({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
      <dt className="font-mono text-[12px] text-violet-300">{name}</dt>
      <dd className="mt-1 text-[12px] leading-relaxed text-slate-500">
        {desc}
      </dd>
    </div>
  );
}
