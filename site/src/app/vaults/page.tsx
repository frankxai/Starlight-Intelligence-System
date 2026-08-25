import Image from "next/image";
import Link from "next/link";
import { getVaultRegistry, getVaultData } from "@/lib/vault";
import { VaultCard } from "@/components/VaultCard";
import { VAULT_PLATES } from "@/lib/constellation-data";
import { Database, Sparkles, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Semantic Memory Vaults — Starlight Substrate",
  description:
    "Explore the six canonical semantic memory chambers (Strategic, Technical, Operational, Creative, Wisdom, Horizon) and public operator vaults.",
};

export default async function VaultsPage() {
  const registry = await getVaultRegistry();

  const vaultsWithData = await Promise.all(
    registry.map(async (reg) => {
      const data = await getVaultData(reg.slug);
      return {
        reg,
        totalEntries: data?.totalEntries ?? 0,
        lastUpdated: data?.lastUpdated ?? "",
      };
    })
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-cyan-400">
        <Database className="h-4 w-4" /> Sovereign Memory Substrate
      </div>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-5xl">
        Six Semantic Memory Vaults
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">
        Physicalized architectural chambers that give every agent the same durable memory surface.
        SQLite FTS5 + JSONL append-only event logs with 90-day temporal half-life and contradiction detection.
      </p>

      {/* Six Semantic Chambers Grid */}
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(VAULT_PLATES).map(([key, vault]) => (
          <div
            key={key}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c14] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-[#12121e]"
          >
            <div>
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-black/40 border border-white/[0.06]">
                <Image
                  src={vault.plateUrl}
                  alt={vault.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-transparent to-transparent opacity-60" />
                <div className="absolute top-2.5 left-2.5">
                  <span
                    className="rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold"
                    style={{ backgroundColor: `${vault.accent}20`, color: vault.accent, border: `1px solid ${vault.accent}40` }}
                  >
                    {vault.symbol} {vault.name.split(" ")[0]}
                  </span>
                </div>
              </div>

              <h3 className="mt-4 text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                {vault.name}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                {vault.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-slate-500">
                Category · {key}
              </span>
              <Link
                href={`/vaults/frank/${key}`}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                Explore <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Operator Public Vaults */}
      <div className="mt-16 pt-12 border-t border-white/[0.08]">
        <h2 className="text-2xl font-bold text-white">Public Operator Vaults</h2>
        <p className="mt-2 text-sm text-slate-400">
          Memory gardens from builders and thinkers. Each vault is a collection of insights readable by humans and agents.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {vaultsWithData.map(({ reg, totalEntries, lastUpdated }) => (
            <VaultCard
              key={reg.slug}
              vault={reg}
              totalEntries={totalEntries}
              lastUpdated={lastUpdated}
            />
          ))}
        </div>
      </div>

      {registry.length === 0 && (
        <div className="mt-20 text-center">
          <p className="text-slate-600">No public vaults yet.</p>
          <a
            href="https://github.com/frankxai/Starlight-Intelligence-System/fork"
            className="mt-3 inline-block text-[13px] text-violet-400 transition-micro hover:text-violet-300"
          >
            Be the first — fork the repo
          </a>
        </div>
      )}

      {/* Add your vault */}
      <div className="mt-16 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2 className="text-base font-semibold text-white">
          Add your vault
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
          Fork the repo, add entries to{" "}
          <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-slate-300">
            public-vault/
          </code>
          , and open a PR to add yourself to the registry. Your local{" "}
          <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-slate-300">
            ~/.starlight/
          </code>{" "}
          vaults are never exposed.
        </p>
        <a
          href="https://github.com/frankxai/Starlight-Intelligence-System/fork"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-full border border-white/[0.08] px-4 py-2 text-[13px] text-white transition-micro hover:bg-white/[0.04]"
        >
          Fork on GitHub
        </a>
      </div>
    </div>
  );
}
