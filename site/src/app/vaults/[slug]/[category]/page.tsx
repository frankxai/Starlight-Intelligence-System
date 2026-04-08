import { notFound } from "next/navigation";
import {
  getVaultData,
  getVaultRegistry,
  VAULT_CATEGORIES,
  type VaultCategory,
} from "@/lib/vault";
import { EntryCard } from "@/components/EntryCard";
import { CategoryNav } from "@/components/CategoryNav";
import type { Metadata } from "next";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string; category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, category } = await params;
  const data = await getVaultData(slug);
  if (!data) return { title: "Not Found" };
  return {
    title: `${category} — ${data.profile.name}'s Vault`,
    description: `${category} vault entries from ${data.profile.name}`,
  };
}

export async function generateStaticParams() {
  const registry = await getVaultRegistry();
  const paths: { slug: string; category: string }[] = [];
  for (const v of registry) {
    for (const cat of VAULT_CATEGORIES) {
      paths.push({ slug: v.slug, category: cat });
    }
  }
  return paths;
}

export default async function CategoryPage({ params }: Props) {
  const { slug, category } = await params;

  if (!VAULT_CATEGORIES.includes(category as VaultCategory)) {
    notFound();
  }

  const cat = category as VaultCategory;
  const data = await getVaultData(slug);
  if (!data) notFound();

  const entries = data.entries[cat];
  const counts = Object.fromEntries(
    VAULT_CATEGORIES.map((c) => [c, data.entries[c].length])
  ) as Record<VaultCategory, number>;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex items-start gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.profile.avatar}
          alt={data.profile.name}
          className="h-12 w-12 rounded-full"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">
            {data.profile.name}{" "}
            <span className="font-normal text-slate-500">/ {cat}</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {entries.length} entries
          </p>
        </div>
      </div>

      <div className="mt-6">
        <CategoryNav slug={slug} active={cat} counts={counts} />
      </div>

      <div className="mt-8 space-y-3">
        {entries.map((entry, i) => (
          <EntryCard
            key={entry.id || i}
            entry={entry}
            category={cat}
            showCategory={false}
          />
        ))}
      </div>

      {entries.length === 0 && (
        <p className="mt-8 text-center text-slate-600">
          No {cat} entries yet.
        </p>
      )}
    </div>
  );
}
