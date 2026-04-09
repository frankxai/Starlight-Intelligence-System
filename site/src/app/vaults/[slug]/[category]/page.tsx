import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getVaultData,
  getVaultRegistry,
  VAULT_CATEGORIES,
  getCategoryMeta,
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
  const meta = getCategoryMeta(category as VaultCategory);
  return {
    title: `${meta?.label || category} — ${data.profile.name}`,
    description: `${meta?.desc || category} vault entries from ${data.profile.name}`,
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
  const meta = getCategoryMeta(cat);
  const counts = Object.fromEntries(
    VAULT_CATEGORIES.map((c) => [c, data.entries[c].length])
  ) as Record<VaultCategory, number>;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {/* Profile header */}
      <div className="flex items-center gap-3">
        <Image
          src={data.profile.avatar}
          alt={`${data.profile.name}'s avatar`}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <h1 className="text-xl font-bold text-white">
            {data.profile.name}
            <span className="ml-2 font-normal text-slate-500">
              / {meta.icon} {meta.label}
            </span>
          </h1>
          <p className="text-[12px] text-slate-600">
            {entries.length} entries
          </p>
        </div>
      </div>

      <div className="mt-6">
        <CategoryNav slug={slug} active={cat} counts={counts} />
      </div>

      <div className="mt-8 space-y-2">
        {entries.map((entry, i) => (
          <div
            key={entry.id || i}
            className="animate-fade-up"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <EntryCard entry={entry} category={cat} showCategory={false} />
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <p className="mt-12 text-center text-[14px] text-slate-600">
          No {meta.label.toLowerCase()} entries yet.
        </p>
      )}
    </div>
  );
}
