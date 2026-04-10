import Link from "next/link";
import type { Metadata } from "next";
import {
  getAllEntries,
  VAULT_CATEGORIES,
  type VaultCategory,
  getCategoryMeta,
  type AnnotatedEntry,
} from "@/lib/vault";
import { EntryCard } from "@/components/EntryCard";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Featured Meditations",
  description:
    "Every quoteworthy meditation from the Starlight public vaults — insights earned and written to breathe.",
  openGraph: {
    title: "Featured Meditations — Starlight Intelligence",
    description:
      "Every quoteworthy meditation from the Starlight public vaults.",
  },
};

export default async function FeaturedPage() {
  const all = await getAllEntries();
  const featured = all.filter((e) => e.quoteworthy && e.meditation);

  // Group by vault category
  const byVault: Record<VaultCategory, AnnotatedEntry[]> = {
    strategic: [],
    technical: [],
    creative: [],
    operational: [],
    wisdom: [],
    horizon: [],
  };
  for (const entry of featured) {
    byVault[entry.vaultCategory].push(entry);
  }

  const activeCategories = VAULT_CATEGORIES.filter(
    (cat) => byVault[cat].length > 0
  );
  const vaultCount = activeCategories.length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {/* Hero */}
      <section className="relative">
        <div
          className="pointer-events-none absolute -left-20 -top-20 h-[320px] w-[320px] rounded-full bg-violet-600/[0.07] blur-[100px]"
          aria-hidden="true"
        />
        <div className="relative">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-violet-400/80">
            Curated
          </p>
          <h1 className="mt-3 text-[36px] font-semibold leading-[1.1] tracking-tight text-white md:text-[44px]">
            Featured Meditations
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-400">
            {featured.length === 0
              ? "No featured meditations yet. Mark an entry as quoteworthy to surface it here."
              : `${featured.length} insight${featured.length === 1 ? "" : "s"} earned across ${vaultCount} vault${vaultCount === 1 ? "" : "s"} — written to breathe, preserved to compound.`}
          </p>
        </div>
      </section>

      {/* Jump nav */}
      {activeCategories.length > 0 && (
        <nav
          className="mt-10 flex flex-wrap gap-1.5"
          aria-label="Jump to vault category"
        >
          {activeCategories.map((cat) => {
            const meta = getCategoryMeta(cat);
            const count = byVault[cat].length;
            return (
              <a
                key={cat}
                href={`#${cat}`}
                className={`rounded-full border border-white/[0.06] px-3 py-1.5 text-[12px] font-medium transition-micro hover:border-white/[0.12] hover:bg-white/[0.03] ${meta.color}`}
              >
                {meta.icon} {meta.label}{" "}
                <span className="text-slate-600">({count})</span>
              </a>
            );
          })}
        </nav>
      )}

      {/* Sections per vault category */}
      {activeCategories.length > 0 ? (
        <div className="mt-16 space-y-20">
          {activeCategories.map((cat) => {
            const meta = getCategoryMeta(cat);
            const entries = byVault[cat];
            return (
              <section
                key={cat}
                id={cat}
                className="scroll-mt-20 animate-fade-up"
              >
                <header className="flex items-baseline justify-between gap-4 border-b border-white/[0.06] pb-4">
                  <h2
                    className={`text-[22px] font-semibold tracking-tight ${meta.color}`}
                  >
                    <span aria-hidden="true">{meta.icon}</span> {meta.label}
                  </h2>
                  <span className="text-[11px] uppercase tracking-wider text-slate-600">
                    {entries.length} featured
                  </span>
                </header>
                <p className="mt-3 text-[13px] text-slate-500">{meta.desc}</p>

                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                  {entries.map((entry, i) => (
                    <Link
                      key={entry.id || `${cat}-${i}`}
                      href={`/vaults/${entry.vaultSlug}`}
                      className="block transition-std hover:-translate-y-0.5"
                    >
                      <EntryCard
                        entry={entry}
                        category={entry.vaultCategory}
                        showCategory={false}
                      />
                      <p className="mt-2 px-1 text-[11px] text-slate-600">
                        from{" "}
                        <span className="text-slate-400">
                          {entry.vaultName}
                        </span>
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="mt-16 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
          <p className="text-[14px] text-slate-500">
            No featured meditations yet.
          </p>
          <p className="mt-2 text-[12px] text-slate-600">
            Add <code className="text-slate-400">quoteworthy: true</code> to any
            entry with a <code className="text-slate-400">meditation</code>{" "}
            field to surface it here.
          </p>
          <Link
            href="/docs#entry-format"
            className="mt-6 inline-block rounded-full border border-violet-500/[0.25] bg-violet-500/[0.08] px-4 py-2 text-[12px] font-medium text-violet-200 transition-micro hover:border-violet-500/[0.4]"
          >
            Read the entry format docs
          </Link>
        </div>
      )}
    </div>
  );
}
