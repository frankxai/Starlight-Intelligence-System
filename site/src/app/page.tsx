import Link from "next/link";
import {
  getAllEntries,
  getVaultRegistry,
  VAULT_CATEGORIES,
  getCategoryMeta,
  getEntryText,
  timeAgo,
  type VaultCategory,
  type VaultEntry,
} from "@/lib/vault";
import { EntryCard } from "@/components/EntryCard";

export const revalidate = 3600;

export default async function HomePage() {
  const [entries, registry] = await Promise.all([
    getAllEntries(),
    getVaultRegistry(),
  ]);

  // Find the horizon vision statement — the most powerful piece of content
  const horizonEntry = entries.find((e) => e.vaultCategory === "horizon");

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.04]">
        {/* Ambient gradient mesh — 3 drifting orbs */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-mesh-1 absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-violet-600/[0.06] blur-[100px]" />
          <div className="animate-mesh-2 absolute right-0 top-20 h-[300px] w-[300px] rounded-full bg-cyan-500/[0.04] blur-[80px]" />
          <div className="animate-mesh-3 absolute left-1/3 top-40 h-[200px] w-[200px] rounded-full bg-fuchsia-500/[0.03] blur-[60px]" />
        </div>

        {/* Dot grid texture */}
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />

        <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-24 md:pb-32 md:pt-36">
          <div className="flex items-center gap-2 text-[12px] text-violet-400/80">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400 animate-glow-pulse" />
            Open source memory system
          </div>

          <h1 className="mt-5 max-w-2xl text-[clamp(2.25rem,6vw,4rem)] font-bold leading-[1.05] tracking-tight text-white">
            Your intelligence,
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              preserved forever.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-[16px] leading-[1.7] text-slate-400">
            Six semantic vaults capture what you learn, decide, and envision.
            Stored as plain files on GitHub. Readable by any AI agent.
            Compounding across every tool you touch.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffrankxai%2FStarlight-Intelligence-System&root-directory=site"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#060609] transition-std hover:shadow-[0_0_30px_rgba(167,139,250,0.2)]"
            >
              Deploy your vault
              <span className="ml-1 inline-block transition-micro group-hover:translate-x-0.5">
                &rarr;
              </span>
            </a>
            <Link
              href="/vaults"
              className="rounded-full border border-white/[0.1] px-6 py-3 text-[14px] font-medium text-white transition-std hover:bg-white/[0.04] hover:border-white/[0.2]"
            >
              Explore vaults
            </Link>
          </div>

          {/* Stats bar */}
          <div className="mt-16 flex gap-8 border-t border-white/[0.04] pt-6 text-[13px]">
            <Stat n={registry.length} label="public vaults" />
            <Stat n={entries.length} label="insights" />
            <Stat n={6} label="vault types" />
          </div>
        </div>
      </section>

      {/* ── Horizon Quote — the vision ── */}
      {horizonEntry && (
        <section className="border-b border-white/[0.04] px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <blockquote className="text-[18px] font-medium leading-[1.8] text-slate-300 md:text-[20px]">
              &ldquo;{getEntryText(horizonEntry).slice(0, 280)}
              {getEntryText(horizonEntry).length > 280 ? "..." : ""}
              &rdquo;
            </blockquote>
            <p className="mt-4 text-[12px] text-slate-600">
              From the Horizon Vault &mdash; {timeAgo(horizonEntry.createdAt)}
            </p>
          </div>
        </section>
      )}

      {/* ── Six Vaults ── */}
      <section className="border-b border-white/[0.04] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-600">
            Six semantic vaults
          </h2>
          <p className="mt-3 max-w-md text-xl font-semibold text-white">
            One JSONL file per vault. No database. No lock-in.
          </p>

          <div className="mt-10 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {VAULT_CATEGORIES.map((cat) => {
              const meta = getCategoryMeta(cat);
              const count = entries.filter(
                (e) => e.vaultCategory === cat
              ).length;
              const latest = entries.find((e) => e.vaultCategory === cat);
              return (
                <div
                  key={cat}
                  className={`group rounded-xl border p-5 transition-std hover:border-white/[0.2] ${meta.bg}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[13px] font-semibold ${meta.color}`}>
                      {meta.icon} {meta.label}
                    </span>
                    {count > 0 && (
                      <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-500">
                        {count}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[12px] text-slate-600">
                    {meta.desc}
                  </p>
                  {latest && (
                    <p className="mt-3 line-clamp-2 text-[12px] leading-relaxed text-slate-400 transition-micro group-hover:text-slate-300">
                      {getEntryText(latest)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Live Stream ── */}
      <section className="border-b border-white/[0.04] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-600">
                Live vault stream
              </h2>
              <p className="mt-3 text-xl font-semibold text-white">
                Recent insights from public vaults
              </p>
            </div>
            <Link
              href="/vaults"
              className="hidden text-[13px] text-slate-500 transition-micro hover:text-white sm:block"
            >
              View all &rarr;
            </Link>
          </div>

          <div className="mt-8 space-y-2">
            {entries.slice(0, 10).map((entry, i) => (
              <Link
                key={entry.id || i}
                href={`/vaults/${entry.vaultSlug}`}
                className="animate-fade-up block"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <EntryCard
                  entry={entry}
                  category={entry.vaultCategory}
                  compact
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Agent API — live terminal feel ── */}
      <section className="border-b border-white/[0.04] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-600">
            Agent-readable
          </h2>
          <p className="mt-3 max-w-md text-xl font-semibold text-white">
            Every vault is a JSON API. Agents learn from human reasoning.
          </p>

          <div className="mt-8 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c12]">
            {/* Terminal chrome */}
            <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-white/[0.06]" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/[0.06]" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/[0.06]" />
              <code className="ml-3 font-mono text-[11px] text-slate-500">
                api/vaults/frank
              </code>
            </div>
            {/* Request */}
            <div className="border-b border-white/[0.04] px-4 py-2.5">
              <code className="font-mono text-[12px]">
                <span className="text-emerald-400">$</span>{" "}
                <span className="text-slate-400">curl</span>{" "}
                <span className="text-violet-400">starlightintelligence.org/api/vaults/frank</span>
              </code>
            </div>
            {/* Response */}
            <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-[1.8] text-slate-500">
              <span className="text-slate-600">{"{"}</span>{"\n"}
              {"  "}<span className="text-violet-400">&quot;name&quot;</span>: <span className="text-emerald-400">&quot;Frank&quot;</span>,{"\n"}
              {"  "}<span className="text-violet-400">&quot;totalEntries&quot;</span>: <span className="text-amber-400">{entries.length}</span>,{"\n"}
              {"  "}<span className="text-violet-400">&quot;entries&quot;</span>: <span className="text-slate-600">{"{"}</span>{"\n"}
              {"    "}<span className="text-violet-400">&quot;strategic&quot;</span>: [<span className="text-slate-600">{"{ \"insight\": \"...\", \"confidence\": \"high\" }"}</span>],{"\n"}
              {"    "}<span className="text-violet-400">&quot;technical&quot;</span>: [<span className="text-slate-600">...</span>],{"\n"}
              {"    "}<span className="text-violet-400">&quot;horizon&quot;</span>:   [<span className="text-slate-600">{"{ \"wish\": \"...\" }"}</span>]{"\n"}
              {"  "}<span className="text-slate-600">{"}"}</span>,{"\n"}
              {"  "}<span className="text-violet-400">&quot;meta&quot;</span>: <span className="text-slate-600">{"{ \"format\": \"starlight-vault-v1\" }"}</span>{"\n"}
              <span className="text-slate-600">{"}"}</span>
              <span className="animate-blink ml-0.5 text-violet-400">_</span>
            </pre>
          </div>

          <p className="mt-4 text-[13px] text-slate-600">
            No API key needed. Raw JSONL also available directly from GitHub.
          </p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative overflow-hidden px-6 py-32">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-mesh-2 absolute left-1/2 top-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/[0.04] blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Start your vault
          </h2>
          <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-slate-400">
            Fork. Add your insights. Deploy.
            Your memory compounds from day one.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a
              href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffrankxai%2FStarlight-Intelligence-System&root-directory=site"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#060609] transition-std hover:shadow-[0_0_40px_rgba(167,139,250,0.25)]"
            >
              Deploy your vault
              <span className="ml-1 inline-block transition-micro group-hover:translate-x-0.5">
                &rarr;
              </span>
            </a>
            <a
              href="https://github.com/frankxai/Starlight-Intelligence-System"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/[0.1] px-6 py-3 text-[14px] font-medium text-white transition-std hover:bg-white/[0.04]"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="text-slate-500">
      <span className="font-semibold text-white">{n}</span>{" "}
      <span className="text-[13px]">{label}</span>
    </div>
  );
}
