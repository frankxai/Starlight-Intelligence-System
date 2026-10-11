import type { Metadata } from "next";
import Link from "next/link";
import {
  searchNasaImages,
  getFallbackGallery,
  type GalleryItem,
} from "@/lib/cosmos/nasa";
import { GalaxyField } from "@/components/cinematic/GalaxyField";

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
    key: "andromeda",
    title: "Nearby giants",
    sub: "Andromeda, the Whirlpool, and other galaxies close enough to resolve.",
    query: "andromeda galaxy hubble",
  },
  {
    key: "nebulae",
    title: "Nebulae",
    sub: "Stellar nurseries and graveyards — where the elements are forged and scattered.",
    query: "carina nebula webb",
  },
];

export default async function GalleryPage() {
  const results = await Promise.all(
    COLLECTIONS.map((c) => searchNasaImages(c.query, 12)),
  );
  const anyLive = results.some((r) => r.length > 0);
  const fallback = getFallbackGallery();
  const heroItem = results.find((r) => r.length > 0)?.[0] ?? fallback[0];

  return (
    <div>
      <section className="relative min-h-[72vh] overflow-hidden border-b border-white/[0.04] md:min-h-[82vh]">
        {heroItem ? (
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroItem.imageUrl || heroItem.thumbUrl}
              alt=""
              className="galaxy-still absolute inset-0 h-full w-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#060609]/35 via-[#060609]/55 to-[#060609]" />
          </div>
        ) : (
          <GalaxyField still="deepField" />
        )}
        <div className="relative mx-auto flex min-h-[72vh] max-w-[88rem] flex-col justify-end px-6 py-20 md:min-h-[82vh] md:py-28">
          <Link
            href="/cosmos"
            className="text-[12px] text-slate-300 transition-micro hover:text-white"
          >
            <span aria-hidden="true">&larr;</span> Cosmos
          </Link>
          <h1 className="mt-4 max-w-3xl font-serif text-[clamp(2.6rem,7vw,5.4rem)] font-semibold leading-[0.98] tracking-tight text-white">
            Deep Field
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-[1.85] text-slate-200">
            Pulled from NASA&apos;s open image library and refreshed daily. Every
            image links to its source record — title, instrument, credit. The
            originals are free; the universe published them first.
          </p>
          {heroItem ? (
            <p className="mt-4 max-w-xl font-mono text-[11px] text-slate-400">
              Featured · {heroItem.title} · {heroItem.credit}
            </p>
          ) : null}
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
          ) : null,
        )
      ) : (
        <GallerySection
          title="Curated set"
          sub={`NASA's image API is briefly unreachable — showing the curated snapshot from ${fallback.length > 0 ? "the library" : "cache"}.`}
          items={fallback}
        />
      )}

      <section className="relative overflow-hidden px-6 py-16">
        <GalaxyField still="veil" className="opacity-70" />
        <div className="relative mx-auto max-w-5xl">
          <div className="rounded-xl border border-white/[0.08] bg-[#060609]/55 p-6 backdrop-blur-md">
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

function tileClass(index: number) {
  if (index === 0) return "gallery-tile gallery-tile-hero";
  if (index === 1 || index === 2) return "gallery-tile gallery-tile-wide";
  return "gallery-tile gallery-tile-std";
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
      <div className="mx-auto max-w-[88rem]">
        <h2 className="font-serif text-[clamp(1.6rem,3vw,2.2rem)] font-semibold tracking-tight text-white">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-[14px] text-slate-400">{sub}</p>
        <div className="gallery-masonry mt-8">
          {items.map((item, index) => (
            <a
              key={item.nasaId}
              href={`https://images.nasa.gov/details/${item.nasaId}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`group overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] transition-std hover:border-white/[0.18] ${tileClass(index)}`}
            >
              <div
                className={
                  index === 0
                    ? "aspect-[16/9] overflow-hidden sm:aspect-[21/9]"
                    : "aspect-[16/10] overflow-hidden"
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={index < 3 ? item.imageUrl : item.thumbUrl}
                  alt={item.title}
                  loading={index === 0 ? "eager" : "lazy"}
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
