import type { Metadata } from "next";
import Link from "next/link";
import { CardTile } from "@/components/cosmos/CardTile";
import { miningCards } from "@/lib/cosmos/cards";
import { getNeoFeed } from "@/lib/cosmos/nasa";
import { GalaxyField } from "@/components/cinematic/GalaxyField";

export const revalidate = 21600;

export const metadata: Metadata = {
  title: "Asteroids — Live Close Approaches & the Mining Lens",
  description:
    "Near-Earth asteroids passing this week from NASA's NeoWs feed, plus the asteroid-mining economics lens: metals, volatiles, delta-v, and the business cases that actually pencil out.",
  openGraph: {
    title: "Asteroids — Starlight Cosmos",
    description:
      "Live near-Earth close approaches + the asteroid-mining economics lens.",
    type: "website",
  },
};

export default async function AsteroidsPage() {
  const feed = await getNeoFeed();
  const cards = miningCards();
  const shown = feed.objects.slice(0, 12);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.04]">
        <GalaxyField still="nursery" />
        <div className="relative mx-auto max-w-5xl px-6 py-24 md:py-32">
          <Link
            href="/cosmos"
            className="text-[12px] text-slate-400 transition-micro hover:text-white"
          >
            <span aria-hidden="true">&larr;</span> Cosmos
          </Link>
          <h1 className="mt-4 font-serif text-[clamp(2.2rem,6vw,4rem)] font-semibold leading-[1.02] tracking-tight text-white">
            Asteroids
          </h1>
          <p className="mt-6 max-w-2xl text-[16px] leading-[1.85] text-slate-300">
            Rubble piles, shattered planetary cores, and time capsules from the
            solar system&apos;s first morning — some passing closer than the
            Moon this week. Below: the live feed, and the economics lens that
            turns rocks into business cases.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1.5 text-[12px] ${
                feed.live
                  ? "border-emerald-500/[0.3] bg-emerald-500/[0.08] text-emerald-300"
                  : "border-amber-500/[0.3] bg-amber-500/[0.08] text-amber-300"
              }`}
            >
              {feed.live
                ? "● Live — NASA NeoWs"
                : `Snapshot ${feed.snapshotDate} — NASA NeoWs`}
            </span>
            <span className="text-[12px] text-slate-500">
              {feed.objects.length} objects · sorted by miss distance
            </span>
          </div>
        </div>
      </section>

      {/* ── Close approaches ── */}
      <section className="border-b border-white/[0.04] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Close approaches
          </h2>
          <p className="mt-3 max-w-2xl text-[13px] leading-[1.75] text-slate-400">
            Miss distance in LD — lunar distances, where 1 LD is the gap between
            Earth and the Moon (~384,400 km). Anything under ~20 LD is a
            neighbor.
          </p>
          <div className="mt-8 grid gap-3">
            {shown.map((neo) => (
              <a
                key={neo.id}
                href={neo.jplUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 transition-std hover:border-white/[0.16] sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-mono text-[14px] font-medium text-white">
                      {neo.name}
                    </h3>
                    {neo.hazardous && (
                      <span className="rounded-full border border-rose-500/[0.3] bg-rose-500/[0.08] px-2 py-0.5 text-[10px] uppercase tracking-widest text-rose-300">
                        PHA
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[12px] text-slate-500">
                    {neo.approachDate} ·{" "}
                    {neo.diameterMinM === neo.diameterMaxM
                      ? `~${neo.diameterMinM} m`
                      : `${neo.diameterMinM}–${neo.diameterMaxM} m`}{" "}
                    diameter
                    {neo.velocityKps ? ` · ${neo.velocityKps} km/s` : ""}
                  </p>
                </div>
                <div className="flex items-baseline gap-2 sm:flex-col sm:items-end sm:gap-0">
                  <span className="font-serif text-[22px] font-semibold tracking-tight text-rose-200">
                    {neo.missDistanceLunar ?? "—"}
                  </span>
                  <span className="text-[11px] uppercase tracking-widest text-slate-500">
                    LD miss
                  </span>
                </div>
              </a>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-slate-500">
            PHA = potentially hazardous asteroid (orbit within 0.05 AU and
            absolute magnitude 22.0 or brighter). Data: NASA NeoWs / JPL CNEOS.
            Each row links to the JPL small-body record.
          </p>
        </div>
      </section>

      {/* ── The mining lens ── */}
      <section className="border-b border-white/[0.04] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            The mining lens
          </h2>
          <div className="mt-6 grid gap-8 lg:grid-cols-[2fr_3fr]">
            <div>
              <h3 className="font-serif text-[26px] font-semibold leading-[1.15] tracking-tight text-white">
                Rocks are the easy part. The business case is the engineering.
              </h3>
              <div className="mt-5 space-y-4 text-[14px] leading-[1.85] text-slate-400">
                <p>
                  Three companies are actively flying toward this —{" "}
                  <span className="text-slate-200">AstroForge</span> (platinum-group
                  metals), <span className="text-slate-200">Karman+</span> (water
                  for orbital refueling), and{" "}
                  <span className="text-slate-200">TransAstra</span> (capture and
                  tug systems). Three different answers to the same question:
                  what&apos;s actually worth retrieving?
                </p>
                <p>
                  The honest math: delta-v prices the trip, not distance. Supply
                  elasticity prices the cargo — return 100 tons of platinum and
                  the price you modeled is gone. The near-term case is volatiles
                  for in-space use, not metals for Earth. The cards on the right
                  carry the full chain of reasoning.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {cards.slice(0, 4).map((card) => (
                <CardTile key={card.slug} card={card} />
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.slice(4).map((card) => (
              <CardTile key={card.slug} card={card} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Run the numbers ── */}
      <section className="border-b border-white/[0.04] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Run the numbers — prompts for builders
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              "Build a first-order asteroid mining business case: pick a real NEA from today's feed above, assume Falcon-Heavy-class launch costs (~$1,500/kg to LEO), water extraction at 1% of asteroid mass, and price the water against launch cost. Where does it break even?",
              "Model the supply-elasticity trap: estimate the price impact of returning 50, 100, and 500 tons of platinum to Earth against ~190 tons of annual mined supply. At what return volume does revenue peak?",
              "Design the depot architecture: if water can be staged at a Lagrange point, which missions become cheaper, by roughly what delta-v margin, and who pays first?",
            ].map((prompt, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5"
              >
                <p className="font-mono text-[11px] text-amber-300">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="mt-3 text-[13px] leading-[1.75] text-slate-300">
                  {prompt}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[13px] text-slate-400">
            Paste into any agent. For the full knowledge chain:{" "}
            <Link
              href="/cosmos/cards/platinum-group-metals"
              className="text-violet-300 transition-micro hover:text-violet-200"
            >
              platinum-group metals
            </Link>
            {" → "}
            <Link
              href="/cosmos/cards/water-ice"
              className="text-violet-300 transition-micro hover:text-violet-200"
            >
              water ice
            </Link>
            {" → "}
            <Link
              href="/cosmos/cards/gravity-and-orbits"
              className="text-violet-300 transition-micro hover:text-violet-200"
            >
              gravity &amp; orbits
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8">
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
              Where this is going
            </p>
            <p className="mt-3 max-w-2xl text-[14px] leading-[1.8] text-slate-300">
              A full asteroid-economics engine — JPL small-body data, modern
              launch costs, scenario sliders, exportable feasibility memos — is
              on the roadmap, built in the open and exposed as MCP tools so your
              agents can run the numbers too.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/cosmos"
                className="rounded-full border border-white/[0.12] px-4 py-2 text-[12px] font-medium text-white transition-std hover:border-white/[0.25] hover:bg-white/[0.04]"
              >
                Back to Cosmos
              </Link>
              <a
                href="https://github.com/frankxai/starlight-cosmos-engine"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-rose-500/[0.3] bg-rose-500/[0.06] px-4 py-2 text-[12px] font-medium text-rose-200 transition-std hover:border-rose-400/[0.5] hover:bg-rose-500/[0.12]"
              >
                starlight-cosmos-engine <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
