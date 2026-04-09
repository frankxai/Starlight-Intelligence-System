import {
  type VaultEntry,
  type VaultCategory,
  getEntryText,
  getCategoryMeta,
  timeAgo,
} from "@/lib/vault";

interface EntryCardProps {
  entry: VaultEntry;
  category: VaultCategory;
  showCategory?: boolean;
  compact?: boolean;
}

export function EntryCard({
  entry,
  category,
  showCategory = true,
  compact = false,
}: EntryCardProps) {
  const text = getEntryText(entry);
  const meta = getCategoryMeta(category);

  if (compact) {
    return (
      <article className="group rounded-lg border border-white/[0.04] bg-white/[0.015] px-4 py-3 transition-std hover:border-white/[0.1] hover:bg-white/[0.03]">
        <div className="flex items-center gap-2 text-[11px]">
          {showCategory && (
            <span className={`font-medium ${meta.color}`}>
              {meta.icon} {meta.label}
            </span>
          )}
          <span className="ml-auto text-slate-600">{timeAgo(entry.createdAt)}</span>
        </div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-300 transition-micro group-hover:text-slate-100">
          {text}
        </p>
      </article>
    );
  }

  return (
    <article
      className={`rounded-xl border p-5 transition-std hover:border-white/[0.15] ${meta.bg}`}
    >
      <div className="flex items-center gap-2 text-[11px]">
        {showCategory && (
          <span className={`font-medium ${meta.color}`}>
            {meta.icon} {meta.label}
          </span>
        )}
        {entry.confidence && (
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-slate-500">
            {entry.confidence}
          </span>
        )}
        <span className="ml-auto text-slate-600">
          {timeAgo(entry.createdAt)}
        </span>
      </div>
      <p className="mt-3 text-[14px] leading-[1.7] text-slate-200">{text}</p>
      {entry.tags && entry.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-slate-500"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
