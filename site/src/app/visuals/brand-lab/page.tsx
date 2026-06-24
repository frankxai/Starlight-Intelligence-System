import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Image as ImageIcon, ScanLine } from "lucide-react";

export const metadata: Metadata = {
  title: "Visual Brand Lab",
  description:
    "Generated Starlight visual studies kept separate from the operational product homepage for inspection, QA, and brand-system iteration.",
};

const OPERATIONAL_STUDIES = [
  {
    src: "/assets/visuals/08-readme-hero.jpg",
    title: "Readme hero study",
    note: "Public identity frame",
  },
  {
    src: "/assets/visuals/09-six-vaults.jpg",
    title: "Six vaults",
    note: "Memory architecture illustration",
  },
  {
    src: "/assets/visuals/11-mcp-tools.jpg",
    title: "MCP tools",
    note: "Adapter surface study",
  },
  {
    src: "/assets/visuals/16-architecture-flow.jpg",
    title: "Architecture flow",
    note: "System map study",
  },
  {
    src: "/assets/visuals/17-attestation-everywhere.jpg",
    title: "Attestation",
    note: "Proof layer study",
  },
  {
    src: "/assets/visuals/14-recall-screenshot.jpg",
    title: "Recall",
    note: "Memory retrieval study",
  },
];

const BRAND_STUDIES = [11, 12, 18, 19, 20, 21, 23, 26, 47, 48, 50, 52];

export default function BrandLabPage() {
  return (
    <div className="bg-[#060609] text-white">
      <section className="border-b border-white/[0.08] px-5 py-16 sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-md border border-white/[0.10] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300">
            <ImageIcon size={15} aria-hidden="true" />
            Visual brand lab
          </div>
          <div className="mt-5 grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-end">
            <div>
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                Generated studies live here, not in the product hero.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                This route preserves the useful Starlight visual exploration as
                an inspectable brand lab. Production pages should use these only
                after crop, artifact, accessibility, and surface-fit checks.
              </p>
            </div>
            <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] p-5">
              <div className="flex items-start gap-3">
                <ScanLine size={20} className="mt-0.5 text-cyan-200" aria-hidden="true" />
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Asset gate
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Approve generated visuals only when they score 26/30 or
                    better, contain no fake text, and improve the exact surface.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.08] px-5 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Operational studies
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                These frames are retained as visual research. Exact UI, labels,
                diagrams, and proof surfaces should still be coded directly.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/[0.12] px-4 py-2.5 text-sm font-semibold text-white transition-micro hover:bg-white/[0.06]"
            >
              Back to product homepage
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {OPERATIONAL_STUDIES.map((study) => (
              <VisualCard
                key={study.src}
                src={study.src}
                title={study.title}
                note={study.note}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold text-white">
            Brand character studies
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            These are exploratory and belong to the visual system, not the first
            viewport of the operational product.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BRAND_STUDIES.map((id) => (
              <VisualCard
                key={id}
                src={`/assets/visuals/queen-premium/${id}.jpg`}
                title={`Brand study ${id}`}
                note="Generated visual draft"
                square
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function VisualCard({
  src,
  title,
  note,
  square = false,
}: {
  src: string;
  title: string;
  note: string;
  square?: boolean;
}) {
  return (
    <figure className="overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.035]">
      <div className={`relative ${square ? "aspect-square" : "aspect-[16/10]"}`}>
        <Image
          src={src}
          alt={title}
          fill
          sizes={square ? "(max-width: 1024px) 50vw, 25vw" : "(max-width: 1024px) 100vw, 33vw"}
          className="object-cover"
        />
      </div>
      <figcaption className="border-t border-white/[0.08] p-4">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{note}</p>
      </figcaption>
    </figure>
  );
}
