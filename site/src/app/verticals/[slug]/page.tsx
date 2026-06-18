import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  VERTICAL_BY_SLUG,
  VERTICAL_SLUGS,
  type Vertical,
  type VerticalSlug,
} from "@/lib/verticals";
import {
  ACCENT_TEXT,
  ACCENT_TEXT_LIGHT,
  ACCENT_BORDER,
  ACCENT_BG,
  ACCENT_BG_SOFT,
  ACCENT_CHIP,
  ACCENT_GLOW,
} from "@/lib/accents";

export const revalidate = 3600;

export function generateStaticParams() {
  return VERTICAL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const v = VERTICAL_BY_SLUG[slug as VerticalSlug];
  if (!v) {
    return { title: "Vertical not found" };
  }
  const title = v.name;
  const description = v.taglineShort;
  return {
    title,
    description,
    openGraph: {
      title: `${title} — Starlight Intelligence`,
      description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Starlight Intelligence`,
      description,
    },
  };
}

export default async function VerticalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const v = VERTICAL_BY_SLUG[slug as VerticalSlug];
  if (!v) notFound();

  const a = {
    text: ACCENT_TEXT[v.accent],
    textLight: ACCENT_TEXT_LIGHT[v.accent],
    border: ACCENT_BORDER[v.accent],
    bg: ACCENT_BG[v.accent],
    bgSoft: ACCENT_BG_SOFT[v.accent],
    chip: ACCENT_CHIP[v.accent],
    glow: ACCENT_GLOW[v.accent],
  };

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.04]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-mesh-1 absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-violet-600/[0.06] blur-[100px]" />
          <div className="animate-mesh-2 absolute right-0 top-20 h-[300px] w-[300px] rounded-full bg-cyan-500/[0.04] blur-[80px]" />
          <div className="animate-mesh-3 absolute left-1/3 bottom-0 h-[280px] w-[280px] rounded-full bg-fuchsia-500/[0.05] blur-[90px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 py-20 md:py-28">
          <Link
            href="/verticals"
            className="text-[12px] text-slate-400 transition-micro hover:text-white"
          >
            <span aria-hidden="true">&larr;</span> All verticals
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
            <span
              className={`rounded-full border px-2.5 py-1 uppercase tracking-widest ${a.chip}`}
            >
              {verticalStatusLabel(v.status)}
            </span>
            <span className="font-mono text-slate-400">
              Domain Sub-Stack
            </span>
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-white md:text-5xl">
            {v.name}
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-[1.85] text-slate-400">
            {v.taglineShort}
          </p>

          <blockquote
            className={`mt-8 rounded-xl border ${a.border} ${a.bg} p-5`}
          >
            <p className="text-[16px] italic leading-[1.7] text-slate-200">
              &ldquo;{v.heroQuote}&rdquo;
            </p>
            <footer
              className={`mt-3 text-[10px] uppercase tracking-widest ${a.text}`}
            >
              {v.name} · SOUL.md
            </footer>
          </blockquote>

          <dl className="mt-8 grid grid-cols-3 gap-2 border-t border-white/[0.04] pt-6 text-center">
            <Stat label="sub-systems" value={v.counts.subSystems} />
            <Stat label="commands" value={v.counts.commands} />
            <Stat label="agents" value={v.counts.agents} />
          </dl>
        </div>
      </section>

      {/* ── Sub-systems ── */}
      <section className="border-b border-white/[0.04] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Sub-systems
          </h2>
          <p className="mt-3 max-w-md text-xl font-semibold text-white">
            {v.subSystems.length} pillars. Each a focused practice with its own
            command surface.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {v.subSystems.map((s) => (
              <article
                key={s.name}
                className={`rounded-xl border p-5 transition-std hover:border-white/[0.2] ${a.border} ${a.bgSoft}`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className={`text-[14px] font-semibold ${a.text}`}>
                    {s.name}
                  </h3>
                  <code className="font-mono text-[11px] text-slate-400">
                    {s.primaryCommand}
                  </code>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-slate-400">
                  {s.purpose}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Agents ── */}
      <section className="border-b border-white/[0.04] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Agents
          </h2>
          <p className="mt-3 max-w-md text-xl font-semibold text-white">
            {v.agents.length} named agents. One identity per pillar.
          </p>

          <div className="mt-10 grid gap-3 md:grid-cols-2">
            {v.agents.map((agent) => (
              <article
                key={agent.name}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-std hover:border-white/[0.12] hover:bg-white/[0.04]"
              >
                <code className={`font-mono text-[12px] ${a.textLight}`}>
                  {agent.name}
                </code>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
                  {agent.role}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick start ── */}
      <section className="border-b border-white/[0.04] px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Quickstart
          </h2>
          <p className="mt-3 text-xl font-semibold text-white">
            Five steps to feel the composition.
          </p>
          <ol className="mt-8 space-y-4">
            {v.quickStartSteps.map((step, i) => (
              <li
                key={step}
                className="flex gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[12px] ${a.chip}`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[14px] leading-[1.7] text-slate-300">
                  {step}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap gap-3">
            {v.downloadUrl && (
              <a
                href={v.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-emerald-300 px-5 py-2.5 text-[14px] font-semibold text-emerald-950 transition-std hover:bg-emerald-200"
              >
                Download ZIP &rarr;
              </a>
            )}
            <a
              href={`${v.githubBlobBase}/QUICK-START.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-[#060609] transition-std hover:shadow-[0_0_30px_rgba(167,139,250,0.2)]"
            >
              Full QUICK-START on GitHub &rarr;
            </a>
            <a
              href={`${v.githubBlobBase}/AGENTS.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/[0.12] px-5 py-2.5 text-[14px] font-medium text-white transition-std hover:border-white/[0.25] hover:bg-white/[0.04]"
            >
              AGENTS.md
            </a>
            <a
              href={`${v.githubBlobBase}/SUB-SYSTEMS.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/[0.12] px-5 py-2.5 text-[14px] font-medium text-white transition-std hover:border-white/[0.25] hover:bg-white/[0.04]"
            >
              SUB-SYSTEMS.md
            </a>
            {v.releaseUrl && (
              <a
                href={v.releaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/[0.12] px-5 py-2.5 text-[14px] font-medium text-white transition-std hover:border-white/[0.25] hover:bg-white/[0.04]"
              >
                GitHub Release
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── Refusals ── */}
      {v.refusals.length > 0 && (
        <section className="border-b border-white/[0.04] px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-[11px] font-medium uppercase tracking-widest text-rose-400">
              Refusals
            </h2>
            <p className="mt-3 text-xl font-semibold text-white">
              Patterns this vertical refuses to ship.
            </p>
            <p className="mt-3 max-w-xl text-[14px] leading-[1.85] text-slate-400">
              Sovereignty includes the right to say no. Each vertical names what
              it will not produce — making the refusal explicit prevents drift
              into theater.
            </p>
            <ul className="mt-8 grid gap-2 sm:grid-cols-2">
              {v.refusals.map((r) => (
                <li
                  key={r}
                  className="flex items-start gap-3 rounded-lg border border-rose-500/[0.18] bg-rose-500/[0.04] p-3"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400/80"
                  />
                  <span className="text-[13px] text-slate-300">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Closer ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[15px] leading-relaxed text-slate-400">
            The pattern generalizes. <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-violet-300">/spawn-domain-stack</code> scaffolds a 4–7 sub-system vertical from any sovereign domain.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/verticals"
              className="rounded-full border border-white/[0.12] px-5 py-2.5 text-[14px] font-medium text-white transition-std hover:border-white/[0.25] hover:bg-white/[0.04]"
            >
              All verticals &rarr;
            </Link>
            <Link
              href="/protocol"
              className="rounded-full border border-white/[0.12] px-5 py-2.5 text-[14px] font-medium text-white transition-std hover:border-white/[0.25] hover:bg-white/[0.04]"
            >
              Read the protocol
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-widest text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-[12px] text-white">{value}</dd>
    </div>
  );
}

function verticalStatusLabel(status: Vertical["status"]) {
  if (status === "live-frank-operated") return "Live · Frank-operated";
  if (status === "preclinical-prerelease") return "Preclinical prerelease";
  return "Live · Reference";
}
