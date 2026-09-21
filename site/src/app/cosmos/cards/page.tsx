import type { Metadata } from "next";
import Link from "next/link";
import { CardTile } from "@/components/cosmos/CardTile";
import { cardsByKind, COSMOS_CARDS, KIND_LABEL } from "@/lib/cosmos/cards";
import { GalaxyField } from "@/components/cinematic/GalaxyField";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Cosmos Knowledge Library",
  description:
    "Deep knowledge cards on stars, planets, asteroids, the elements they forge, and the laws they obey — each with prompts to explore with your own AI agents.",
  openGraph: {
    title: "Cosmos Knowledge Library — Starlight Cosmos",
    description:
      "Deep cards on stars, metals, fusion, and the laws of the universe, with prompts to explore.",
    type: "website",
  },
};

export default function CardsIndexPage() {
  const groups = cardsByKind();

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.04]">
        <GalaxyField still="deepField" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 md:py-28">
          <Link
            href="/cosmos"
            className="text-[12px] text-slate-400 transition-micro hover:text-white"
          >
            <span aria-hidden="true">&larr;</span> Cosmos
          </Link>
          <h1 className="mt-4 font-serif text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
            Knowledge Library
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-[1.85] text-slate-400">
            {COSMOS_CARDS.length} cards and growing — every session adds more.
            Each card holds verified facts, a deep read, and prompts designed to
            be pasted into any AI agent. Knowledge built for humans and machines
            at once.
          </p>
          <nav
            className="mt-8 flex flex-wrap gap-2"
            aria-label="Jump to category"
          >
            {groups.map((g) => (
              <a
                key={g.kind}
                href={`#${g.kind}`}
                className="rounded-full border border-white/[0.1] px-3 py-1.5 text-[12px] text-slate-300 transition-micro hover:border-white/[0.25] hover:text-white"
              >
                {KIND_LABEL[g.kind]}s ({g.cards.length})
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* ── Groups ── */}
      {groups.map((g) => (
        <section
          key={g.kind}
          id={g.kind}
          className="scroll-mt-20 border-b border-white/[0.04] px-6 py-14 md:py-16"
        >
          <div className="mx-auto max-w-5xl">
            <h2 className="font-serif text-[22px] font-semibold tracking-tight text-white">
              {KIND_LABEL[g.kind]}s
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.cards.map((card) => (
                <CardTile key={card.slug} card={card} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
