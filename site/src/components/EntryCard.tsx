import {
  type VaultEntry,
  type VaultCategory,
  getEntryText,
  getEntryCaption,
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
  const caption = getEntryCaption(entry);
  const meta = getCategoryMeta(category);
  const hasMeditation = !!entry.meditation;
  const isFeatured = entry.quoteworthy === true;

  if (compact) {
    return (
      <article className="group rounded-lg border border-white/[0.08] bg-white/[0.015] px-4 py-3 transition-std hover:border-white/[0.1] hover:bg-white/[0.03]">
        <div className="flex items-center gap-2 text-[11px]">
          {showCategory && (
            <span className={`font-medium ${meta.color}`}>
              {meta.icon} {meta.label}
            </span>
          )}
          {isFeatured && (
            <span className="text-[10px] text-violet-400/70">◆ featured</span>
          )}
          <span className="ml-auto text-slate-600">{timeAgo(entry.createdAt)}</span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-slate-300 transition-micro group-hover:text-slate-100">
          {entry.insight || entry.wish || text}
        </p>
      </article>
    );
  }

  // Featured entries (quoteworthy) get elevated styling
  if (isFeatured && hasMeditation) {
    return (
      <article className="rounded-2xl border border-violet-500/[0.2] bg-gradient-to-br from-violet-500/[0.06] via-white/[0.02] to-fuchsia-500/[0.04] p-7 transition-std hover:border-violet-500/[0.3]">
        <div className="flex items-center gap-2 text-[11px]">
          {showCategory && (
            <span className={`font-medium ${meta.color}`}>
              {meta.icon} {meta.label}
            </span>
          )}
          <span className="rounded-full border border-violet-500/[0.25] bg-violet-500/[0.08] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-violet-300">
            Featured
          </span>
          <span className="ml-auto text-slate-600">
            {timeAgo(entry.createdAt)}
          </span>
        </div>

        <blockquote className="mt-4 text-[16px] font-medium leading-[1.75] text-slate-100 md:text-[17px]">
          {text}
        </blockquote>

        {caption && (
          <p className="mt-3 text-[12px] italic text-violet-300/70">
            {caption}
          </p>
        )}

        {(entry.context || entry.implication) && (
          <div className="mt-5 space-y-3 border-t border-white/[0.06] pt-5 text-[12px] leading-relaxed">
            {entry.context && (
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                  Context
                </span>
                <p className="mt-1 text-slate-400">{entry.context}</p>
              </div>
            )}
            {entry.implication && (
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                  Implication
                </span>
                <p className="mt-1 text-slate-400">{entry.implication}</p>
              </div>
            )}
          </div>
        )}

        {entry.tags && entry.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
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

  // Standard entry with optional meditation expansion
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
        {isFeatured && (
          <span className="rounded-full border border-violet-500/[0.2] px-2 py-0.5 text-[10px] text-violet-300">
            featured
          </span>
        )}
        <span className="ml-auto text-slate-600">
          {timeAgo(entry.createdAt)}
        </span>
      </div>

      <p
        className={`mt-3 leading-[1.75] ${
          hasMeditation
            ? "text-[14px] text-slate-100"
            : "text-[14px] text-slate-200"
        }`}
      >
        {text}
      </p>

      {caption && (
        <p className="mt-2 text-[12px] italic text-slate-500">{caption}</p>
      )}

      {(entry.context || entry.implication) && (
        <div className="mt-4 space-y-2 border-t border-white/[0.08] pt-4 text-[12px] leading-relaxed">
          {entry.context && (
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                Context
              </span>
              <p className="mt-0.5 text-slate-500">{entry.context}</p>
            </div>
          )}
          {entry.implication && (
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                Implication
              </span>
              <p className="mt-0.5 text-slate-500">{entry.implication}</p>
            </div>
          )}
        </div>
      )}

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
