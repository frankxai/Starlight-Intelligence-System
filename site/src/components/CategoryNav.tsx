import Link from "next/link";
import {
  VAULT_CATEGORIES,
  type VaultCategory,
  getCategoryColor,
  getCategoryIcon,
} from "@/lib/vault";

interface CategoryNavProps {
  slug: string;
  active?: VaultCategory | "all";
  counts?: Record<VaultCategory, number>;
}

export function CategoryNav({
  slug,
  active = "all",
  counts,
}: CategoryNavProps) {
  return (
    <nav className="flex flex-wrap gap-2">
      <Link
        href={`/vaults/${slug}`}
        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
          active === "all"
            ? "border-white/20 bg-white/10 text-white"
            : "border-white/[0.06] text-slate-500 hover:text-white"
        }`}
      >
        All{counts ? ` (${Object.values(counts).reduce((a, b) => a + b, 0)})` : ""}
      </Link>
      {VAULT_CATEGORIES.map((cat) => {
        const count = counts?.[cat] ?? 0;
        if (counts && count === 0) return null;
        return (
          <Link
            key={cat}
            href={`/vaults/${slug}/${cat}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              active === cat
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/[0.06] text-slate-500 hover:text-white"
            }`}
          >
            <span className={getCategoryColor(cat)}>
              {getCategoryIcon(cat)}
            </span>{" "}
            {cat}
            {counts ? ` (${count})` : ""}
          </Link>
        );
      })}
    </nav>
  );
}
