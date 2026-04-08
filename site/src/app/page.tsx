import Link from "next/link";
import { getAllEntries, getVaultRegistry, getCategoryColor, getCategoryIcon, getEntryText, formatDate, type VaultCategory } from "@/lib/vault";

export const revalidate = 3600;

export default async function HomePage() {
  const [entries, registry] = await Promise.all([
    getAllEntries(),
    getVaultRegistry(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.03] to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              Memory that compounds
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-400">
              Starlight Intelligence is a persistent memory layer for humans and
              AI agents. Local-first, portable, legible. Your insights,
              decisions, and vision — owned by you, readable by agents,
              compounding over time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffrankxai%2FStarlight-Intelligence-System&root-directory=site"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-200"
              >
                Deploy Your Own Vault
              </a>
              <Link
                href="/vaults"
                className="rounded-full border border-white/[0.12] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.06]"
              >
                Browse Public Vaults
              </Link>
              <Link
                href="/docs"
                className="rounded-full border border-white/[0.06] px-5 py-2.5 text-sm text-slate-400 transition-colors hover:text-white"
              >
                Documentation
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat label="Public Vaults" value={registry.length} />
            <Stat label="Total Entries" value={entries.length} />
            <Stat label="Vault Categories" value={6} />
            <Stat label="Platform Adapters" value={6} />
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="border-b border-white/[0.06] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold text-white">
            How it works
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Six semantic vaults organize your intelligence. Each vault is a
            simple JSONL file — one JSON object per line. No database needed.
          </p>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <VaultType
              name="Strategic"
              desc="Business insights, competitive moats, architecture decisions"
              cat="strategic"
            />
            <VaultType
              name="Technical"
              desc="Implementation learnings, stack decisions, patterns"
              cat="technical"
            />
            <VaultType
              name="Creative"
              desc="Design preferences, aesthetic rules, lore"
              cat="creative"
            />
            <VaultType
              name="Operational"
              desc="Workflow patterns, execution lessons, process rules"
              cat="operational"
            />
            <VaultType
              name="Wisdom"
              desc="Deep learnings, principles, universal truths"
              cat="wisdom"
            />
            <VaultType
              name="Horizon"
              desc="Vision statements, wishes, aspirational goals"
              cat="horizon"
            />
          </div>
        </div>
      </section>

      {/* Live River */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold text-white">
              Live Vault River
            </h2>
            <span className="text-xs text-slate-600">
              {entries.length} entries across {registry.length} vault
              {registry.length !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="mt-2 mb-8 text-sm text-slate-500">
            Recent insights from public vaults — a stream of collective intelligence.
          </p>
          <div className="space-y-3">
            {entries.slice(0, 20).map((entry, i) => (
              <Link
                key={entry.id || i}
                href={`/vaults/${entry.vaultSlug}`}
                className="group block rounded-lg border border-white/[0.04] bg-white/[0.02] p-4 transition-all hover:border-white/[0.1] hover:bg-white/[0.04]"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`font-medium ${getCategoryColor(entry.vaultCategory)}`}
                  >
                    {getCategoryIcon(entry.vaultCategory)} {entry.vaultCategory}
                  </span>
                  <span className="text-slate-600">{entry.vaultName}</span>
                  <span className="ml-auto text-slate-700">
                    {formatDate(entry.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-300 group-hover:text-white transition-colors">
                  {getEntryText(entry)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Agent API */}
      <section className="border-t border-white/[0.06] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold text-white">
            Built for agents
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Every vault is available as a JSON API. AI agents can read public
            vaults to learn from benevolent human reasoning and decisions.
          </p>
          <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <code className="text-xs text-slate-400">
              <span className="text-emerald-400">GET</span>{" "}
              <span className="text-blue-400">
                /api/vaults/frank
              </span>
            </code>
            <pre className="mt-3 overflow-x-auto text-xs text-slate-500">
{`{
  "name": "Frank",
  "totalEntries": ${entries.length},
  "entries": {
    "strategic": [...],
    "technical": [...],
    "creative": [...],
    "operational": [...],
    "wisdom": [...],
    "horizon": [...]
  }
}`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{label}</div>
    </div>
  );
}

function VaultType({
  name,
  desc,
  cat,
}: {
  name: string;
  desc: string;
  cat: VaultCategory;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        cat === "strategic"
          ? "border-blue-500/20 bg-blue-500/[0.05]"
          : cat === "technical"
            ? "border-emerald-500/20 bg-emerald-500/[0.05]"
            : cat === "creative"
              ? "border-purple-500/20 bg-purple-500/[0.05]"
              : cat === "operational"
                ? "border-orange-500/20 bg-orange-500/[0.05]"
                : cat === "wisdom"
                  ? "border-amber-400/20 bg-amber-400/[0.05]"
                  : "border-amber-500/20 bg-amber-500/[0.05]"
      }`}
    >
      <div className={`text-sm font-medium ${getCategoryColor(cat)}`}>
        {getCategoryIcon(cat)} {name}
      </div>
      <p className="mt-1 text-xs text-slate-500">{desc}</p>
    </div>
  );
}
