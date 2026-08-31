import type { Metadata } from "next";
import Link from "next/link";
import { ConstellationMap } from "@/components/cosmos/ConstellationMap";
import { CardTile } from "@/components/cosmos/CardTile";
import { CONSTELLATIONS } from "@/lib/cosmos/constellations";
import { CARD_BY_SLUG } from "@/lib/cosmos/cards";
import { GalaxyField } from "@/components/cinematic/GalaxyField";

export const metadata: Metadata = {
  title: "Constellations — Starlight Cosmos",
  description:
    "Interactive star maps of Orion, the Big Dipper, the Southern Cross, and Cassiopeia — the science, the myth, and the navigation in one view. The sky as humanity's first interface.",
  openGraph: {
    title: "Constellations — Starlight Cosmos",
    description:
      "Star maps with three reading layers: what the stars physically are, what cultures drew on them, and how travelers still navigate by them.",
    type: "website",
  },
};

export default function ConstellationsPage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.04]">        <GalaxyField still="veil" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 md:py-28">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-cyan-300">
            Starlight Cosmos · Constellations
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-[clamp(2.2rem,5.5vw,3.8rem)] font-semibold leading-[1.05] tracking-tight text-white">
            The sky was our first interface.
          </h1>
          <p className="mt-6 max-w-2xl text-[16px] leading-[1.85] text-slate-300">
            A constellation is a line-of-sight illusion — stars hundreds of
            light-years apart, aligned only from Earth&apos;s vantage point —
            that humans turned into a clock, a compass, a calendar, and a
            memory palace. Each map below reads in three layers: the physics,
            the myth, and the navigation. All three are true at once.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/cosmos/cards"
              className="rounded-full bg-white px-5 py-2.5 text-[13px] font-medium text-[#060609] transition-micro hover:bg-white/90"
            >
              Browse all knowledge cards
            </Link>
            <Link
              href="/cosmos"
              className="rounded-full border border-white/[0.12] px-5 py-2.5 text-[13px] font-medium text-slate-200 transition-micro hover:border-white/[0.25]"
            >
              Back to Cosmos hub
            </Link>
          </div>
        </div>
      </section>

      {/* ── Maps ── */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2">
          {CONSTELLATIONS.map((c) => {
            const card = CARD_BY_SLUG[c.slug];
            return (
              <article
                key={c.slug}
                className="flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
              >
                <ConstellationMap constellation={c} seed={c.slug.length * 977} />
                <h2 className="mt-5 text-[19px] font-semibold tracking-tight text-white">
                  {c.name}
                </h2>
                <p className="mt-1 text-[13px] leading-[1.7] text-slate-400">
                  {c.tagline}
                </p>
                <dl className="mt-4 space-y-3 text-[13px] leading-[1.7]">
                  <div>
                    <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-amber-300">
                      Science
                    </dt>
                    <dd className="mt-1 text-slate-300">{c.science}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-300">
                      Myth
                    </dt>
                    <dd className="mt-1 text-slate-300">{c.myth}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-300">
                      Navigation
                    </dt>
                    <dd className="mt-1 text-slate-300">{c.navigation}</dd>
                  </div>
                </dl>
                {card && (
                  <Link
                    href={`/cosmos/cards/${card.slug}`}
                    className="mt-5 text-[12px] text-slate-500 transition-micro hover:text-slate-300"
                  >
                    Read the {c.name.split(" ")[0]} knowledge card →
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* ── The stars behind the patterns ── */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="font-serif text-[24px] font-semibold tracking-tight text-white">
          The stars behind the patterns
        </h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-[1.8] text-slate-400">
          Zoom past the figure and every point resolves into a physical object
          with its own story — a dying supergiant, a binary with an invisible
          companion, the quiet red dwarf next door.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {["betelgeuse", "sirius", "proxima-centauri"]
            .map((s) => CARD_BY_SLUG[s])
            .filter(Boolean)
            .map((card) => (
              <CardTile key={card.slug} card={card} />
            ))}
        </div>
      </section>
    </div>
  );
}
