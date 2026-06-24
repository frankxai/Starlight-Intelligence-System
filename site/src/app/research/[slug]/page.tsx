import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  RESEARCH_PUBLIC_SLUGS,
  resolveResearchSlug,
} from "@/lib/research";

export const revalidate = 3600;

export function generateStaticParams() {
  return RESEARCH_PUBLIC_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = resolveResearchSlug(slug);
  if (!r) {
    return { title: "Research not found" };
  }
  return {
    title: r.title,
    description: r.tldr,
    openGraph: {
      title: `${r.title} — Starlight Intelligence`,
      description: r.tldr,
      type: "article",
      publishedTime: r.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: `${r.title} — Starlight Intelligence`,
      description: r.tldr,
    },
  };
}

const TIER_LABEL = {
  substrate: "Substrate",
  operational: "Operational",
  reference: "Reference",
} as const;

const STATUS_LABEL = {
  published: "Published",
  "in-progress": "In progress",
  chartered: "Chartered",
} as const;

const PLACEHOLDER_BODY = `> This research is **chartered** — the rubric is locked, sub-agents are working, and the artifact will land here once the synthesis pass clears the \`/starlight-board\` pre-pass.

The charter for this research is committed to the repo:

- \`docs/research/_factory/<slug>/CHARTER.md\` — what the research must answer
- \`docs/research/_methodology/memory-rubric.md\` (for memory-foundations) — the locked rubric
- \`docs/ops/\` — drift-resolution decisions that fed the charter

Substrate-tier research is published only after Board ratification. This page will refresh when that happens.`;

function loadResearchBody(contentFile: string): string {
  const path = join(process.cwd(), "content", "research", contentFile);
  try {
    const raw = readFileSync(path, "utf-8");
    return raw.trim();
  } catch {
    return PLACEHOLDER_BODY;
  }
}

export default async function ResearchDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = resolveResearchSlug(slug);
  if (!r) notFound();

  const body = loadResearchBody(r.contentFile);
  const accentChip =
    r.accent === "cyan"
      ? "border-cyan-500/[0.25] bg-cyan-500/[0.06] text-cyan-200"
      : r.accent === "fuchsia"
        ? "border-fuchsia-500/[0.25] bg-fuchsia-500/[0.06] text-fuchsia-200"
        : "border-violet-500/[0.25] bg-violet-500/[0.06] text-violet-200";

  return (
    <div>
      {/* ── Hero — premium 3D Queen image header with correct blog dimensions: generous margins, padding, image sizing (contained, aspect respected, mb for spacing) — */}
      <section className="research-hero relative overflow-hidden border-b border-white/[0.04]">
        <div className="absolute inset-0">
          <img className="w-full h-full object-cover" src={`/assets/visuals/queen-premium/${slug.includes('memory-foundations') ? '84' : slug.includes('proving-ground') ? '75' : slug.includes('model-arena') ? '64' : '61'}.jpg`} alt="Research header" style={{ margin: 0, padding: 0 }} />
        </div>
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-mesh-1 absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-violet-600/[0.06] blur-[100px]" />
          <div className="animate-mesh-2 absolute right-0 top-20 h-[300px] w-[300px] rounded-full bg-cyan-500/[0.04] blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 py-20 md:py-28" style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
          <Link
            href="/research"
            className="text-[12px] text-slate-400 transition-micro hover:text-white"
          >
            <span aria-hidden="true">&larr;</span> All research
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
            <span
              className={`rounded-full border px-2.5 py-1 uppercase tracking-widest ${accentChip}`}
            >
              {TIER_LABEL[r.tier]}
            </span>
            <span className="rounded-full border border-white/[0.1] bg-white/[0.02] px-2.5 py-1 uppercase tracking-widest text-slate-400">
              {STATUS_LABEL[r.status]}
            </span>
            <time
              dateTime={r.publishedAt}
              className="font-mono text-slate-400"
            >
              {r.publishedAt}
            </time>
          </div>
          <h1 className="mt-5 font-serif text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
            {r.title}
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-[1.85] text-slate-400">
            {r.tldr}
          </p>

          {r.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-1.5">
              {r.tags.map((tag) => (
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

      {/* ── Body ── */}
      <article className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        <div className="research-prose explainer-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
        </div>
      </article>

      {/* ── Primary sources ── */}
      {r.primarySources && r.primarySources.length > 0 && (
        <section className="border-b border-white/[0.04] px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
              Primary sources
            </h2>
            <ul className="mt-4 space-y-2">
              {r.primarySources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] text-violet-300 transition-std hover:text-violet-200"
                  >
                    {s.label} &rarr;
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Attestation footer ── */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
              Attestation
            </p>
            <p className="mt-3 text-[14px] leading-[1.7] text-slate-300">
              Built on SIP. Rubric authored before candidates evaluated. Board
              pre-pass required for substrate-tier publication. Falsifier
              section present below the recommendation. Forks of SIP inherit
              this artifact under MIT for code + spec, CC-BY for editorial.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/research"
                className="rounded-full border border-white/[0.12] px-4 py-2 text-[12px] font-medium text-white transition-std hover:border-white/[0.25] hover:bg-white/[0.04]"
              >
                All research
              </Link>
              <Link
                href="/protocol"
                className="rounded-full border border-white/[0.12] px-4 py-2 text-[12px] font-medium text-white transition-std hover:border-white/[0.25] hover:bg-white/[0.04]"
              >
                Read the protocol
              </Link>
              {(slug.includes("arena") || slug.includes("proving-ground")) && (
                <a
                  href="https://github.com/frankxai/starlight-evals"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-violet-500/[0.3] bg-violet-500/[0.08] px-4 py-2 text-[12px] font-medium text-violet-200 transition-std hover:border-violet-400/[0.5] hover:bg-violet-500/[0.14]"
                >
                  Fork the eval harness &rarr;
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
