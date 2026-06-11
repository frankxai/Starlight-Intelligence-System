import Link from "next/link";
import {
  ACCENT_BORDER,
  ACCENT_CHIP,
  ACCENT_GLOW,
  ACCENT_BG_SOFT,
} from "@/lib/accents";
import { KIND_ACCENT, KIND_LABEL, type CosmosCard } from "@/lib/cosmos/cards";

export function CardTile({ card }: { card: CosmosCard }) {
  const accent = KIND_ACCENT[card.kind];
  return (
    <Link
      href={`/cosmos/cards/${card.slug}`}
      className={`group flex flex-col rounded-xl border ${ACCENT_BORDER[accent]} ${ACCENT_BG_SOFT[accent]} p-5 transition-std hover:border-white/[0.18] ${ACCENT_GLOW[accent]}`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest ${ACCENT_CHIP[accent]}`}
        >
          {KIND_LABEL[card.kind]}
        </span>
      </div>
      <h3 className="mt-3 text-[16px] font-semibold tracking-tight text-white transition-micro group-hover:text-white">
        {card.title}
      </h3>
      <p className="mt-2 flex-1 text-[13px] leading-[1.7] text-slate-400">
        {card.tldr}
      </p>
      <span className="mt-4 text-[12px] text-slate-500 transition-micro group-hover:text-slate-300">
        Open card <span aria-hidden="true">&rarr;</span>
      </span>
    </Link>
  );
}
