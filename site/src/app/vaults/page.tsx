import { getVaultRegistry, getVaultData } from "@/lib/vault";
import { VaultCard } from "@/components/VaultCard";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Public Vaults — Starlight Intelligence",
  description: "Browse public memory vaults from creators, builders, and thinkers.",
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
      <h1 className="text-3xl font-bold text-white">Public Vaults</h1>
      <p className="mt-2 text-sm text-slate-400">
        Memory gardens from creators, builders, and thinkers. Each vault is a
        collection of insights, learnings, and vision — readable by humans and
        agents alike.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
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
        <div className="mt-16 text-center">
          <p className="text-slate-500">No public vaults yet.</p>
          <a
            href="https://github.com/frankxai/Starlight-Intelligence-System"
            className="mt-4 inline-block text-sm text-blue-400 hover:text-blue-300"
          >
            Be the first — fork the repo and add your vault
          </a>
        </div>
      )}

      <div className="mt-16 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h2 className="text-lg font-semibold text-white">Add your vault</h2>
        <p className="mt-2 text-sm text-slate-400">
          Fork the Starlight Intelligence System repo, add your entries to{" "}
          <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-slate-300">
            public-vault/
          </code>
          , and submit a PR to add yourself to the vault registry. Your
          private vaults in{" "}
          <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-slate-300">
            ~/.starlight/
          </code>{" "}
          are never exposed.
        </p>
        <a
          href="https://github.com/frankxai/Starlight-Intelligence-System/fork"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-full bg-white/[0.06] px-4 py-2 text-sm text-white hover:bg-white/[0.1]"
        >
          Fork on GitHub
        </a>
      </div>
    </div>
  );
}
