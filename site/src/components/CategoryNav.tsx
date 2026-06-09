import Link from "next/link";
import { VAULT_CATEGORIES, type VaultCategory, getCategoryMeta } from "@/lib/vault";

interface CategoryNavProps {
  slug: string;
  active?: VaultCategory | "all";
  counts?: Record<VaultCategory, number>;
}

export function CategoryNav({ slug, active = "all", counts }: CategoryNavProps) {
  const total = counts
    ? Object.values(counts).reduce((a, b) => a + b, 0)
    : undefined;

  return (
    <nav className="flex flex-wrap gap-1.5" aria-label="Vault categories">
      <Pill
        href={`/vaults/${slug}`}
        active={active === "all"}
        label={`All${total !== undefined ? ` (${total})` : ""}`}
      />
      {VAULT_CATEGORIES.map((cat) => {
        const count = counts?.[cat] ?? 0;
        if (counts && count === 0) return null;
        const meta = getCategoryMeta(cat);
        return (
          <Pill
            key={cat}
            href={`/vaults/${slug}/${cat}`}
            active={active === cat}
            label={`${meta.icon} ${meta.label}${counts ? ` (${count})` : ""}`}
            color={active === cat ? meta.color : undefined}
          />
        );
      })}
    </nav>
  );
}

function Pill({
  href,
  active,
  label,
  color,
}: {
  href: string;
  active: boolean;
  label: string;
  color?: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-micro ${
        active
          ? `border-white/[0.15] bg-white/[0.08] ${color || "text-white"}`
          : "border-white/[0.08] text-slate-500 hover:border-white/[0.1] hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}
