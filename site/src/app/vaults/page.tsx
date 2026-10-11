import { getVaultRegistry, getVaultData } from "@/lib/vault";
import { VaultCard } from "@/components/VaultCard";
import { GalaxyField } from "@/components/cinematic/GalaxyField";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Public Vaults",
  description:
    "Browse public memory vaults from builders, creators, and thinkers.",
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
    <div>
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <GalaxyField still="veil" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 md:py-28">
          <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] font-semibold tracking-tight text-white">
            Public Vaults
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-[1.8] text-slate-400">
            Memory gardens from builders and thinkers. Each vault is a collection
            of insights readable by humans and agents.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-5xl px-6 py-16">

      <div className="mt-10 grid gap-3 md:grid-cols-2">
        {vaultsWithData.map(({ reg, totalEntries, lastUpdated }) => (
          <VaultCard
            key={reg.slug}
            vault={reg}
            totalEntries={totalEntries}
            lastUpdated={lastUpdated}
          />
        ))}
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
    </div>
  );
}
