import Image from "next/image";
import Link from "next/link";
import type { VaultRegistryEntry } from "@/lib/vault";
import { formatDateShort } from "@/lib/vault";

interface VaultCardProps {
  vault: VaultRegistryEntry;
  totalEntries?: number;
  lastUpdated?: string;
}

export function VaultCard({ vault, totalEntries, lastUpdated }: VaultCardProps) {
  return (
    <Link
      href={`/vaults/${vault.slug}`}
      className="group block rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-std hover:border-white/[0.12] hover:bg-white/[0.04]"
    >
      <div className="flex items-start gap-4">
        <Image
          src={vault.avatar}
          alt={`${vault.name}'s avatar`}
          width={48}
          height={48}
          className="rounded-full"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-white transition-micro group-hover:text-violet-400">
            {vault.name}
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-500 line-clamp-2">
            {vault.bio}
          </p>
          <div className="mt-3 flex gap-4 text-[11px] text-slate-600">
            {totalEntries !== undefined && (
              <span>{totalEntries} entries</span>
            )}
            {lastUpdated && (
              <span>Updated {formatDateShort(lastUpdated)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
