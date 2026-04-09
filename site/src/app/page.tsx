import Link from "next/link";
import {
  getAllEntries,
  getVaultRegistry,
  VAULT_CATEGORIES,
  getCategoryMeta,
  getEntryText,
  timeAgo,
  type VaultCategory,
} from "@/lib/vault";
import { EntryCard } from "@/components/EntryCard";

export const revalidate = 3600;

export default async function HomePage() {
  const [entries, registry] = await Promise.all([
    getAllEntries(),
    getVaultRegistry(),
  ]);

  return (
    <div>
      {/* Hero — 3 seconds to understand */}
      <section className="relative border-b border-white/[0.04]">
        {/* Subtle gradient orb */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 bg-gradient-to-b from-violet-500/[0.04] via-transparent to-transparent" />

        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-24 md:pt-32">
          <p className="text-[13px] font-medium text-violet-400">
            Open source memory system
          </p>

          <h1 className="mt-4 max-w-lg text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.1] tracking-tight text-white">
            Your intelligence,
            <br />
            preserved forever.
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-slate-400">
            Six vaults capture what you learn, decide, and envision. Stored as
            plain files. Readable by any AI agent. Compounding across every
            tool you use.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffrankxai%2FStarlight-Intelligence-System&root-directory=site"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white px-5 py-2.5 text-[14px] font-medium text-[#060609] transition-micro hover:bg-white/90"
            >
              Deploy your vault
            </a>
            <Link
              href="/vaults"
              className="rounded-full border border-white/[0.1] px-5 py-2.5 text-[14px] font-medium text-white transition-micro hover:bg-white/[0.04]"
            >
              Explore vaults
            </Link>
          </div>
        </div>
      </section>

      {/* The Six Vaults — show the structure */}
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
              return (
                <div
                  key={cat}
                  className={`rounded-xl border p-4 transition-std hover:border-white/[0.15] ${meta.bg}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[13px] font-medium ${meta.color}`}
                    >
                      {meta.icon} {meta.label}
                    </span>
                    {count > 0 && (
                      <span className="text-[11px] text-slate-600">
                        {count}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[12px] text-slate-500">
                    {meta.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live River — the product IS the demo */}
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
              className="text-[13px] text-slate-500 transition-micro hover:text-white"
            >
              View all
            </Link>
          </div>

          <div className="mt-8 space-y-2">
            {entries.slice(0, 12).map((entry, i) => (
              <Link
                key={entry.id || i}
                href={`/vaults/${entry.vaultSlug}`}
                className="animate-fade-up block"
                style={{ animationDelay: `${i * 40}ms` }}
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

      {/* Agent API — show it working */}
      <section className="border-b border-white/[0.04] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-600">
            Agent-readable
          </h2>
          <p className="mt-3 max-w-md text-xl font-semibold text-white">
            Every vault is a JSON API. Agents learn from human reasoning.
          </p>

          <div className="mt-8 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-2 border-b border-white/[0.04] px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
              <code className="font-mono text-[12px] text-slate-400">
                <span className="text-emerald-400">GET</span>{" "}
                /api/vaults/frank
              </code>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-slate-500">
{`{
  "name": "Frank",
  "totalEntries": ${entries.length},
  "entries": {
    "strategic": [{ "insight": "...", "confidence": "high" }],
    "technical": [...],
    "horizon":   [{ "wish": "..." }]
  },
  "meta": {
    "format": "starlight-vault-v1",
    "source": "github:frankxai/Starlight-Intelligence-System"
  }
}`}</pre>
          </div>

          <p className="mt-4 text-[13px] text-slate-600">
            Agents can also read raw JSONL directly from GitHub.
            No API key needed.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-2xl font-bold text-white">
            Start your vault in two minutes
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-[14px] text-slate-400">
            Fork the repo. Add your insights. Deploy. Your memory
            compounds from day one.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <a
              href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffrankxai%2FStarlight-Intelligence-System&root-directory=site"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white px-5 py-2.5 text-[14px] font-medium text-[#060609] transition-micro hover:bg-white/90"
            >
              Deploy your vault
            </a>
            <a
              href="https://github.com/frankxai/Starlight-Intelligence-System"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/[0.1] px-5 py-2.5 text-[14px] font-medium text-white transition-micro hover:bg-white/[0.04]"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
