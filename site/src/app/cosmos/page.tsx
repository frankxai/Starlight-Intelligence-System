import type { Metadata } from "next";
import Link from "next/link";
import { CardTile } from "@/components/cosmos/CardTile";
import { COSMOS_CARDS, featuredCards } from "@/lib/cosmos/cards";
import { getApod, getUpcomingLaunches } from "@/lib/cosmos/nasa";
import { GalaxyField } from "@/components/cinematic/GalaxyField";
import { CINEMATIC_STILLS, type CinematicStill } from "@/lib/cinematic";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Starlight Cosmos — Explore the Universe as a Thinking Substrate",
  description:
    "Live NASA data, JWST imagery, asteroid close approaches, and deep knowledge cards on stars, elements, and the laws of the universe — each with prompts to explore with your own AI agents.",
  openGraph: {
    title: "Starlight Cosmos",
    description:
      "The cosmos as a thinking substrate — live space data, deep knowledge cards, and prompts to explore.",
    type: "website",
  },
};

export default async function CosmosPage() {
  const [apod, launches] = await Promise.all([
    getApod(),
    getUpcomingLaunches(5),
  ]);
  const featured = featuredCards();

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.04]">
        <GalaxyField still="spiral" />
        <div className="relative mx-auto max-w-5xl px-6 py-24 md:py-36">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-violet-300">
            Starlight Cosmos
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-[clamp(2.4rem,6vw,4.2rem)] font-semibold leading-[1.02] tracking-tight text-white">
            The universe, readable.
          </h1>
          <p className="mt-6 max-w-2xl text-[16px] leading-[1.85] text-slate-300">
            Live NASA data, Webb&apos;s deep fields, asteroids passing closer than
            the Moon — wired to knowledge cards on the stars, the elements they
            forge, and the laws they obey. Every card ships with prompts to
            explore, so the cosmos becomes something you think with, not just
            look at.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/cosmos/gallery"
              className="rounded-full bg-white px-5 py-2.5 text-[13px] font-medium text-[#060609] transition-micro hover:bg-white/90"
            >
              Open the gallery
            </Link>
            <Link
              href="/asteroids"
              className="rounded-full border border-rose-500/[0.3] bg-rose-500/[0.06] px-5 py-2.5 text-[13px] font-medium text-rose-200 transition-std hover:border-rose-400/[0.5] hover:bg-rose-500/[0.12]"
            >
              Asteroids, live
            </Link>
            <Link
              href="/cosmos/cards"
              className="rounded-full border border-white/[0.12] px-5 py-2.5 text-[13px] font-medium text-white transition-std hover:border-white/[0.25] hover:bg-white/[0.04]"
            >
              Knowledge library ({COSMOS_CARDS.length})
            </Link>
          </div>
        </div>
      </section>

      {/* ── Four views, one entry ── */}
      <section className="border-b border-white/[0.04] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            One entry, four views
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ViewTile
              href="/cosmos/gallery"
              title="Deep Field"
              still="deepField"
              accent="text-violet-300"
              border="border-violet-500/[0.2]"
              body="Galaxies, nebulae, and Webb's first images — pulled from NASA's open image library, refreshed daily."
            />
            <ViewTile
              href="/asteroids"
              title="Close Approach"
              still="nursery"
              accent="text-rose-300"
              border="border-rose-500/[0.2]"
              body="Near-Earth asteroids passing this week, with the mining-economics lens nobody else gives you."
            />
            <ViewTile
              href="/cosmos/constellations"
              title="Star Maps"
              still="veil"
              accent="text-amber-300"
              border="border-amber-500/[0.2]"
              body="Orion, the Dipper, the Southern Cross — science, myth, and navigation on one chart."
            />
            <ViewTile
              href="/cosmos/cards"
              title="Knowledge"
              still="spiral"
              accent="text-cyan-300"
              border="border-cyan-500/[0.2]"
              body="Deep cards on stars, metals, fusion, and the laws of the universe — each with prompts to explore."
            />
          </div>
        </div>
      </section>

      {/* ── APOD ── */}
      {apod && (
        <section className="border-b border-white/[0.04] px-6 py-16 md:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
              Astronomy picture of the day
              <span className="ml-2 font-mono normal-case tracking-normal text-slate-500">
                {apod.date}
              </span>
            </h2>
            <div className="mt-6 grid gap-8 lg:grid-cols-[3fr_2fr]">
              <a
                href={apod.hdurl ?? apod.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-xl border border-white/[0.08]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={apod.url}
                  alt={apod.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-dramatic group-hover:scale-[1.02]"
                />
              </a>
              <div>
                <h3 className="font-serif text-[22px] font-semibold tracking-tight text-white">
                  {apod.title}
                </h3>
                <p className="mt-3 text-[14px] leading-[1.8] text-slate-400">
                  {apod.explanation.length > 480
                    ? `${apod.explanation.slice(0, 480)}…`
                    : apod.explanation}
                </p>
                <p className="mt-4 text-[11px] text-slate-500">
                  {apod.copyright ? `© ${apod.copyright} · ` : ""}NASA APOD
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Featured cards ── */}
      <section className="border-b border-white/[0.04] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
              From the knowledge library
            </h2>
            <Link
              href="/cosmos/cards"
              className="text-[12px] text-slate-400 transition-micro hover:text-white"
            >
              All {COSMOS_CARDS.length} cards <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((card) => (
              <CardTile key={card.slug} card={card} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Prompts to explore ── */}
      <section className="border-b border-white/[0.04] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Prompts to explore
          </h2>
          <p className="mt-3 max-w-2xl text-[14px] leading-[1.8] text-slate-400">
            Every card carries prompts designed to be pasted into any AI agent —
            Claude, ChatGPT, Gemini. The cosmos as training ground for systems
            thinking.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                from: "Gravity & Orbits",
                slug: "gravity-and-orbits",
                prompt:
                  "Delta-v, not distance, prices a space mission — some asteroids are cheaper to reach than the Moon's surface. What's the delta-v analog in your business: the real cost metric hiding behind the intuitive one?",
              },
              {
                from: "Spectroscopy",
                slug: "spectroscopy",
                prompt:
                  "Spectroscopy turned starlight from scenery into a queryable database. What stream of data are you currently treating as scenery?",
              },
              {
                from: "Platinum-Group Metals",
                slug: "platinum-group-metals",
                prompt:
                  "Run the supply-elasticity trap: returning 100 tons of platinum would move the price how much? Build the demand curve before believing any trillion-dollar asteroid headline.",
              },
            ].map((p) => (
              <Link
                key={p.slug}
                href={`/cosmos/cards/${p.slug}`}
                className="group rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 transition-std hover:border-violet-500/[0.3] hover:bg-violet-500/[0.04]"
              >
                <p className="font-mono text-[11px] uppercase tracking-widest text-violet-300">
                  {p.from}
                </p>
                <p className="mt-3 text-[13px] leading-[1.75] text-slate-300">
                  &ldquo;{p.prompt}&rdquo;
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upcoming launches ── */}
      {launches.length > 0 && (
        <section className="border-b border-white/[0.04] px-6 py-16 md:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
              Next launches
              <span className="ml-2 normal-case tracking-normal text-slate-500">
                via Launch Library 2
              </span>
            </h2>
            <ul className="mt-6 divide-y divide-white/[0.05] rounded-xl border border-white/[0.08] bg-white/[0.02]">
              {launches.map((l) => (
                <li
                  key={l.id}
                  className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-[14px] font-medium text-white">{l.name}</p>
                    {l.agency && (
                      <p className="text-[12px] text-slate-500">{l.agency}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-emerald-500/[0.2] bg-emerald-500/[0.06] px-2.5 py-0.5 text-[11px] text-emerald-300">
                      {l.status}
                    </span>
                    <time
                      dateTime={l.net}
                      className="font-mono text-[12px] text-slate-400"
                    >
                      {l.net.slice(0, 16).replace("T", " ")} UTC
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Ecosystem ── */}
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8">
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
              Built in the open
            </p>
            <p className="mt-3 max-w-2xl text-[14px] leading-[1.8] text-slate-300">
              Starlight Cosmos is the experience layer of an open system: a
              production engine with agents and MCP servers for space data, a
              curated directory of cosmos AI resources, and a knowledge graph.
              Every card here is designed to become an agent-readable MCP
              resource.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <EcoLink href="https://github.com/frankxai/starlight-cosmos-engine" label="starlight-cosmos-engine" />
              <EcoLink href="https://github.com/frankxai/awesome-cosmos-ai-agents" label="awesome-cosmos-ai-agents" />
              <EcoLink href="https://github.com/frankxai/starlight-knowledge-tree" label="starlight-knowledge-tree" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ViewTile({
  href,
  title,
  body,
  accent,
  border,
  still,
}: {
  href: string;
  title: string;
  body: string;
  accent: string;
  border: string;
  still: CinematicStill;
}) {
  return (
    <Link
      href={href}
      className={`group overflow-hidden rounded-xl border ${border} bg-white/[0.02] transition-std hover:bg-white/[0.04]`}
    >
      <div className="relative h-28 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={CINEMATIC_STILLS[still]}
          alt=""
          className="h-full w-full object-cover transition-dramatic group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060609] to-transparent" />
      </div>
      <div className="p-6">
        <h3 className={`font-serif text-[20px] font-semibold tracking-tight ${accent}`}>
          {title}
        </h3>
        <p className="mt-3 text-[13px] leading-[1.75] text-slate-400">{body}</p>
        <span className="mt-4 inline-block text-[12px] text-slate-500 transition-micro group-hover:text-slate-300">
          Enter <span aria-hidden="true">&rarr;</span>
        </span>
      </div>
    </Link>
  );
}

function EcoLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-full border border-white/[0.12] px-4 py-2 font-mono text-[12px] text-slate-300 transition-std hover:border-white/[0.25] hover:bg-white/[0.04]"
    >
      {label} <span aria-hidden="true">&rarr;</span>
    </a>
  );
}
