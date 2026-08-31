import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ACCENT_CHIP,
  ACCENT_TEXT_LIGHT,
} from "@/lib/accents";
import {
  CARD_BY_SLUG,
  CARD_SLUGS,
  KIND_ACCENT,
  KIND_LABEL,
} from "@/lib/cosmos/cards";
import { CardTile } from "@/components/cosmos/CardTile";
import { GalaxyField } from "@/components/cinematic/GalaxyField";

export const revalidate = 3600;

export function generateStaticParams() {
  return CARD_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const card = CARD_BY_SLUG[slug];
  if (!card) {
    return { title: "Card not found" };
  }
  return {
    title: `${card.title} — Cosmos Knowledge`,
    description: card.tldr,
    openGraph: {
      title: `${card.title} — Starlight Cosmos`,
      description: card.tldr,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${card.title} — Starlight Cosmos`,
      description: card.tldr,
    },
  };
}

const PLACEHOLDER_BODY = `> This card's deep read is **in progress** — the facts panel and prompts above are live; the essay lands in an upcoming session. Cards are populated continuously.`;

function loadCardBody(contentFile: string): string {
  const path = join(process.cwd(), "content", "cosmos", contentFile);
  try {
    return readFileSync(path, "utf-8").trim();
  } catch {
    return PLACEHOLDER_BODY;
  }
}

export default async function CosmosCardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const card = CARD_BY_SLUG[slug];
  if (!card) notFound();

  const body = loadCardBody(card.contentFile);
  const accent = KIND_ACCENT[card.kind];
  const related = card.related
    .map((s) => CARD_BY_SLUG[s])
    .filter(Boolean);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.04]">
        <GalaxyField still="deepField" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 md:py-28">
          <Link
            href="/cosmos/cards"
            className="text-[12px] text-slate-400 transition-micro hover:text-white"
          >
            <span aria-hidden="true">&larr;</span> Knowledge library
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
            <span
              className={`rounded-full border px-2.5 py-1 uppercase tracking-widest ${ACCENT_CHIP[accent]}`}
            >
              {KIND_LABEL[card.kind]}
            </span>
            <time dateTime={card.updated} className="font-mono text-slate-400">
              updated {card.updated}
            </time>
          </div>
          <h1 className="mt-5 font-serif text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
            {card.title}
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-[1.85] text-slate-400">
            {card.tldr}
          </p>
          {card.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-1.5">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 text-[10px] text-slate-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Facts panel ── */}
      <section className="border-b border-white/[0.04] px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            The data
          </h2>
          <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {card.facts.map((f) => (
              <div
                key={f.label}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <dt className="text-[11px] uppercase tracking-wider text-slate-500">
                  {f.label}
                </dt>
                <dd className={`mt-1 text-[14px] font-medium ${ACCENT_TEXT_LIGHT[accent]}`}>
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Body ── */}
      <article className="border-b border-white/[0.04] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="explainer-prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
          </div>
        </div>
      </article>

      {/* ── Prompts to explore ── */}
      <section className="border-b border-white/[0.04] px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Prompts to explore
          </h2>
          <p className="mt-3 text-[13px] leading-[1.75] text-slate-400">
            Paste any of these into your AI agent of choice. They are designed
            to turn this card into thinking practice.
          </p>
          <ol className="mt-6 space-y-4">
            {card.prompts.map((prompt, i) => (
              <li
                key={i}
                className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5"
              >
                <div className="flex gap-4">
                  <span className={`font-mono text-[13px] ${ACCENT_TEXT_LIGHT[accent]}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-[14px] leading-[1.8] text-slate-300">
                    {prompt}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Related ── */}
      {related.length > 0 && (
        <section className="border-b border-white/[0.04] px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
              Related cards
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((rc) => (
                <CardTile key={rc.slug} card={rc} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Sources + attestation ── */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          {card.sources.length > 0 && (
            <>
              <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
                Primary sources
              </h2>
              <ul className="mt-4 space-y-2">
                {card.sources.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[14px] text-violet-300 transition-std hover:text-violet-200"
                    >
                      {s.label} <span aria-hidden="true">&rarr;</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="mt-10 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
              Built on SIP
            </p>
            <p className="mt-3 text-[14px] leading-[1.7] text-slate-300">
              Facts carry only well-established figures; estimates are labeled
              as estimates. This card is designed to ship simultaneously as a
              web page and an agent-readable MCP resource
              (<span className="font-mono text-[12px]">cosmos://cards/{card.slug}</span>).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
