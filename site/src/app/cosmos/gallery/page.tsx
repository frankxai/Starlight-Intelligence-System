import type { Metadata } from "next";
import Link from "next/link";
import {
  searchNasaImages,
  getFallbackGallery,
  type GalleryItem,
} from "@/lib/cosmos/nasa";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Deep Field — Galaxy & JWST Gallery",
  description:
    "Galaxies, nebulae, and the James Webb Space Telescope's deep fields — curated daily from NASA's open image library.",
  openGraph: {
    title: "Deep Field — Starlight Cosmos",
    description:
      "Galaxies, nebulae, and Webb's deep fields, curated from NASA's open image library.",
    type: "website",
  },
};

const COLLECTIONS: { key: string; title: string; sub: string; query: string }[] = [
  {
    key: "webb",
    title: "Webb's Eye",
    sub: "The James Webb Space Telescope's view — infrared light from the early universe.",
    query: "james webb space telescope deep field",
  },
  {
    key: "galaxies",
    title: "Galaxies",
    sub: "Island universes — each smudge a hundred billion suns.",
    query: "spiral galaxy hubble",
  },
  {
    key: "nebulae",
    title: "Nebulae",
    sub: "Stellar nurseries and graveyards — where the elements are forged and scattered.",
    query: "nebula stellar nursery",
  },
];

export default async function GalleryPage() {
  const results = await Promise.all(
    COLLECTIONS.map((c) => searchNasaImages(c.query, 9))
  );
  const anyLive = results.some((r) => r.length > 0);
  const fallback = getFallbackGallery();

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.04]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-mesh-1 absolute -left-24 top-0 h-[360px] w-[360px] rounded-full bg-violet-600/[0.07] blur-[100px]" />
          <div className="animate-mesh-2 absolute right-0 top-16 h-[280px] w-[280px] rounded-full bg-fuchsia-500/[0.05] blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 py-20 md:py-28">
          <Link
            href="/cosmos"
            className="text-[12px] text-slate-400 transition-micro hover:text-white"
          >
            <span aria-hidden="true">&larr;</span> Cosmos
          </Link>
          <h1 className="mt-4 font-serif text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
            Deep Field
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-[1.85] text-slate-400">
            Pulled from NASA&apos;s open image library and refreshed daily. Every
            image links to its source record — title, instrument, credit. The
            originals are free; the universe published them first.
          </p>
        </div>
      </section>

      {anyLive ? (
        COLLECTIONS.map((c, i) =>
          results[i].length > 0 ? (
            <GallerySection
              key={c.key}
              title={c.title}
              sub={c.sub}
              items={results[i]}
            />
          ) : null
        )
      ) : (
        <GallerySection
          title="Curated set"
          sub={`NASA's image API is briefly unreachable — showing the curated snapshot from ${fallback.length > 0 ? "the library" : "cache"}.`}
          items={fallback}
        />
      )}

      {/* ── Footer CTA ── */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <p className="text-[14px] leading-[1.8] text-slate-300">
              Want the story behind the images?{" "}
              <Link
                href="/cosmos/cards/jwst"
                className="text-violet-300 transition-micro hover:text-violet-200"
              >
                How Webb works
              </Link>
              {" · "}
              <Link
                href="/cosmos/cards/spectroscopy"
                className="text-violet-300 transition-micro hover:text-violet-200"
              >
                How starlight becomes data
              </Link>
              {" · "}
              <Link
                href="/cosmos/cards/supernova-nucleosynthesis"
                className="text-violet-300 transition-micro hover:text-violet-200"
              >
                Where the elements come from
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function GallerySection({
  title,
  sub,
  items,
}: {
  title: string;
  sub: string;
  items: GalleryItem[];
}) {
  return (
    <section className="border-b border-white/[0.04] px-6 py-16 md:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-serif text-[24px] font-semibold tracking-tight text-white">
          {title}
        </h2>
        <p className="mt-2 text-[13px] text-slate-400">{sub}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <a
              key={item.nasaId}
              href={`https://images.nasa.gov/details/${item.nasaId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] transition-std hover:border-white/[0.18]"
            >
              <div className="aspect-square overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumbUrl}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-dramatic group-hover:scale-[1.04]"
                />
              </div>
              <div className="p-4">
                <h3 className="line-clamp-1 text-[13px] font-medium text-white">
                  {item.title}
                </h3>
                <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">
                  {item.dateCreated} · {item.credit}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
