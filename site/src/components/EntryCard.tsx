import {
  type VaultEntry,
  type VaultCategory,
  getEntryText,
  getCategoryColor,
  getCategoryBg,
  getCategoryIcon,
  formatDate,
} from "@/lib/vault";

interface EntryCardProps {
  entry: VaultEntry;
  category: VaultCategory;
  showCategory?: boolean;
  showVaultName?: string;
}

export function EntryCard({
  entry,
  category,
  showCategory = true,
  showVaultName,
}: EntryCardProps) {
  const text = getEntryText(entry);
  const color = getCategoryColor(category);
  const bg = getCategoryBg(category);
  const icon = getCategoryIcon(category);

  return (
    <article
      className={`rounded-xl border p-5 transition-all hover:border-white/[0.12] ${bg}`}
    >
      <div className="mb-3 flex items-center gap-2 text-xs">
        {showCategory && (
          <span className={`font-medium ${color}`}>
            {icon} {category}
          </span>
        )}
        {entry.confidence && (
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-slate-500">
            {entry.confidence}
          </span>
        )}
        {showVaultName && (
          <span className="text-slate-600">by {showVaultName}</span>
        )}
        <span className="ml-auto text-slate-600">
          {formatDate(entry.createdAt)}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-slate-200">{text}</p>
      {entry.tags && entry.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/[0.04] px-2 py-0.5 text-xs text-slate-500"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
