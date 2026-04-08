import Link from "next/link";
import type { VaultRegistryEntry } from "@/lib/vault";

interface VaultCardProps {
  vault: VaultRegistryEntry;
  totalEntries?: number;
  lastUpdated?: string;
}

export function VaultCard({ vault, totalEntries, lastUpdated }: VaultCardProps) {
  return (
    <Link
      href={`/vaults/${vault.slug}`}
      className="group block rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
    >
      <div className="flex items-start gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={vault.avatar}
          alt={vault.name}
          className="h-12 w-12 rounded-full"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
            {vault.name}
          </h3>
          <p className="mt-1 text-sm text-slate-400">{vault.bio}</p>
          <div className="mt-3 flex gap-4 text-xs text-slate-600">
            {totalEntries !== undefined && (
              <span>{totalEntries} entries</span>
            )}
            {lastUpdated && (
              <span>
                Updated{" "}
                {new Date(lastUpdated).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
