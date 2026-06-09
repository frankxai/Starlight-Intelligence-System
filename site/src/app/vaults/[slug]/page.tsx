import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getVaultData,
  getVaultRegistry,
  VAULT_CATEGORIES,
  type VaultEntry,
  type VaultCategory,
} from "@/lib/vault";
import { EntryCard } from "@/components/EntryCard";
import { CategoryNav } from "@/components/CategoryNav";
import { formatDate } from "@/lib/vault";
import type { Metadata } from "next";

export const revalidate = 3600;

type FilterKey = "meditations" | "benedictions" | "featured";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ filter?: string }>;
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

function matchesFilter(entry: VaultEntry, filter: FilterKey | null): boolean {
  if (!filter) return true;
  if (filter === "meditations") return !!entry.meditation;
  if (filter === "benedictions") return entry.benediction === true;
  if (filter === "featured") return entry.quoteworthy === true;
  return true;
}

export default async function VaultPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { filter: rawFilter } = await searchParams;
  const data = await getVaultData(slug);
  if (!data) notFound();

  const filter: FilterKey | null =
    rawFilter === "meditations" ||
    rawFilter === "benedictions" ||
    rawFilter === "featured"
      ? rawFilter
      : null;

  const counts = Object.fromEntries(
    VAULT_CATEGORIES.map((cat) => [cat, data.entries[cat].length])
  ) as Record<VaultCategory, number>;

  const allSorted = VAULT_CATEGORIES.flatMap((cat) =>
    data.entries[cat].map((entry) => ({ entry, category: cat }))
  ).sort(
    (a, b) =>
      new Date(b.entry.createdAt).getTime() -
      new Date(a.entry.createdAt).getTime()
  );

  // Filter counts for chips (global to vault, not category-specific)
  const meditationCount = allSorted.filter(({ entry }) => !!entry.meditation)
    .length;
  const benedictionCount = allSorted.filter(
    ({ entry }) => entry.benediction === true
  ).length;
  const featuredCount = allSorted.filter(
    ({ entry }) => entry.quoteworthy === true
  ).length;

  const filtered = allSorted.filter(({ entry }) => matchesFilter(entry, filter));

  const activeStyle =
    "border-violet-500/[0.25] bg-violet-500/[0.08] text-violet-200";
  const inactiveStyle =
    "border-white/[0.06] text-slate-500 hover:border-white/[0.12] hover:text-white";

  const filterChips: {
    key: FilterKey | null;
    label: string;
    count: number;
    href: string;
  }[] = [
    {
      key: null,
      label: "All",
      count: data.totalEntries,
      href: `/vaults/${slug}`,
    },
    {
      key: "meditations",
      label: "Meditations",
      count: meditationCount,
      href: `/vaults/${slug}?filter=meditations`,
    },
    {
      key: "benedictions",
      label: "Benedictions",
      count: benedictionCount,
      href: `/vaults/${slug}?filter=benedictions`,
    },
    {
      key: "featured",
      label: "Featured",
      count: featuredCount,
      href: `/vaults/${slug}?filter=featured`,
    },
  ];

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

      {/* Filter chips */}
      <div
        className="mt-4 flex flex-wrap gap-1.5"
        aria-label="Filter entries"
      >
        {filterChips.map((chip) => {
          const isActive = chip.key === filter;
          return (
            <Link
              key={chip.label}
              href={chip.href}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-micro ${
                isActive ? activeStyle : inactiveStyle
              }`}
            >
              {chip.label}{" "}
              <span
                className={
                  isActive ? "text-violet-300/70" : "text-slate-600"
                }
              >
                ({chip.count})
              </span>
            </Link>
          );
        })}
      </div>

      {/* Entries */}
      <div className="mt-8 space-y-2">
        {filtered.map(({ entry, category }, i) => (
          <div
            key={entry.id || i}
            className="animate-fade-up"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <EntryCard entry={entry} category={category} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-[14px] text-slate-600">
          {filter
            ? "No entries match this filter."
            : "This vault is empty."}
        </p>
      )}

      {/* Agent API hint */}
      <div className="mt-12 rounded-lg border border-white/[0.08] bg-white/[0.015] p-4">
        <code className="font-mono text-[12px] text-slate-600">
          <span className="text-emerald-400/60">GET</span>{" "}
          <span className="text-slate-500">/api/vaults/{slug}</span>
        </code>
      </div>
    </div>
  );
}
