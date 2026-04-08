import { notFound } from "next/navigation";
import { getVaultData, getVaultRegistry, VAULT_CATEGORIES } from "@/lib/vault";
import { EntryCard } from "@/components/EntryCard";
import { CategoryNav } from "@/components/CategoryNav";
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
    title: `${data.profile.name}'s Vault — Starlight Intelligence`,
    description: data.profile.bio,
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
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex items-start gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.profile.avatar}
          alt={data.profile.name}
          className="h-16 w-16 rounded-full"
        />
        <div>
          <h1 className="text-3xl font-bold text-white">
            {data.profile.name}
          </h1>
          <p className="mt-1 text-sm text-slate-400">{data.profile.bio}</p>
          <div className="mt-2 flex gap-4 text-xs text-slate-600">
            <span>{data.totalEntries} entries</span>
            {data.lastUpdated && (
              <span>
                Last updated{" "}
                {new Date(data.lastUpdated).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <CategoryNav slug={slug} active="all" counts={counts} />
      </div>

      <div className="mt-8 space-y-3">
        {allEntries.map(({ entry, category }, i) => (
          <EntryCard
            key={entry.id || i}
            entry={entry}
            category={category}
          />
        ))}
      </div>

      {allEntries.length === 0 && (
        <p className="mt-8 text-center text-slate-600">
          This vault is empty.
        </p>
      )}

      {/* Agent API hint */}
      <div className="mt-12 rounded-lg border border-white/[0.04] bg-white/[0.02] p-4">
        <p className="text-xs text-slate-600">
          Agent API:{" "}
          <code className="text-slate-400">
            GET /api/vaults/{slug}
          </code>
        </p>
      </div>
    </div>
  );
}
