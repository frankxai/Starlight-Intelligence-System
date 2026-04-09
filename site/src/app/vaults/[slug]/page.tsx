import Image from "next/image";
import { notFound } from "next/navigation";
import { getVaultData, getVaultRegistry, VAULT_CATEGORIES } from "@/lib/vault";
import { EntryCard } from "@/components/EntryCard";
import { CategoryNav } from "@/components/CategoryNav";
import { formatDate } from "@/lib/vault";
import type { Metadata } from "next";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getVaultData(slug);
  if (!data) return { title: "Vault Not Found" };
  return {
    title: `${data.profile.name}'s Vault`,
    description: data.profile.bio,
    openGraph: {
      title: `${data.profile.name}'s Starlight Vault`,
      description: `${data.totalEntries} insights across ${VAULT_CATEGORIES.length} categories`,
    },
  };
}

export async function generateStaticParams() {
  const registry = await getVaultRegistry();
  return registry.map((v) => ({ slug: v.slug }));
}

export default async function VaultPage({ params }: Props) {
  const { slug } = await params;
  const data = await getVaultData(slug);
  if (!data) notFound();

  const counts = Object.fromEntries(
    VAULT_CATEGORIES.map((cat) => [cat, data.entries[cat].length])
  ) as Record<(typeof VAULT_CATEGORIES)[number], number>;

  const allEntries = VAULT_CATEGORIES.flatMap((cat) =>
    data.entries[cat].map((entry) => ({ entry, category: cat }))
  ).sort(
    (a, b) =>
      new Date(b.entry.createdAt).getTime() -
      new Date(a.entry.createdAt).getTime()
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {/* Profile */}
      <div className="flex items-start gap-4">
        <Image
          src={data.profile.avatar}
          alt={`${data.profile.name}'s avatar`}
          width={56}
          height={56}
          className="rounded-full"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">
            {data.profile.name}
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">
            {data.profile.bio}
          </p>
          <div className="mt-2 flex gap-4 text-[11px] text-slate-600">
            <span>{data.totalEntries} entries</span>
            {data.lastUpdated && (
              <span>Last updated {formatDate(data.lastUpdated)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="mt-8">
        <CategoryNav slug={slug} active="all" counts={counts} />
      </div>

      {/* Entries */}
      <div className="mt-8 space-y-2">
        {allEntries.map(({ entry, category }, i) => (
          <div
            key={entry.id || i}
            className="animate-fade-up"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <EntryCard entry={entry} category={category} />
          </div>
        ))}
      </div>

      {allEntries.length === 0 && (
        <p className="mt-12 text-center text-[14px] text-slate-600">
          This vault is empty.
        </p>
      )}

      {/* Agent API hint */}
      <div className="mt-12 rounded-lg border border-white/[0.04] bg-white/[0.015] p-4">
        <code className="font-mono text-[12px] text-slate-600">
          <span className="text-emerald-400/60">GET</span>{" "}
          <span className="text-slate-500">/api/vaults/{slug}</span>
        </code>
      </div>
    </div>
  );
}
