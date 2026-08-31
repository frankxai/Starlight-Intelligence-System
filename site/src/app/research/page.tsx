import type { Metadata } from "next";
import Link from "next/link";
import { getResearchForIndex, type Research } from "@/lib/research";
import { GalaxyField } from "@/components/cinematic/GalaxyField";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Research",
  description:
    "Substrate-tier research artifacts informing SIS foundation decisions. Rubric-first, board-gated, sovereign-attested.",
  openGraph: {
    title: "Research — Starlight Intelligence",
    description:
      "Substrate-tier research informing SIS foundation decisions. Rubric-first. Board-gated. SIP-attested.",
    type: "article",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Starlight Intelligence — Research" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Research — Starlight Intelligence",
    description:
      "Substrate-tier research informing SIS foundation decisions. Rubric-first. Board-gated.",
    images: ["/opengraph-image"],
  },
};

const TIER_LABEL: Record<Research["tier"], string> = {
  substrate: "Substrate",
  operational: "Operational",
  reference: "Reference",
};

const STATUS_LABEL: Record<Research["status"], string> = {
  published: "Published",
  "in-progress": "In progress",
  chartered: "Chartered",
};

const ACCENT_MAP: Record<NonNullable<Research["accent"]>, { text: string; border: string; bg: string; chip: string }> = {
  violet: {
    text: "text-violet-300",
    border: "border-violet-500/[0.18]",
    bg: "bg-violet-500/[0.04]",
    chip: "border-violet-500/[0.25] bg-violet-500/[0.06] text-violet-200",
  },
  cyan: {
    text: "text-cyan-300",
    border: "border-cyan-500/[0.18]",
    bg: "bg-cyan-500/[0.04]",
    chip: "border-cyan-500/[0.25] bg-cyan-500/[0.06] text-cyan-200",
  },
  fuchsia: {
    text: "text-fuchsia-300",
    border: "border-fuchsia-500/[0.18]",
    bg: "bg-fuchsia-500/[0.04]",
    chip: "border-fuchsia-500/[0.25] bg-fuchsia-500/[0.06] text-fuchsia-200",
  },
};

export default function ResearchIndexPage() {
  const items = getResearchForIndex();

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <GalaxyField still="veil" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 md:py-28">
          <p className="text-[11px] font-medium uppercase tracking-widest text-violet-400">
            Research
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-5xl">
            Substrate decisions
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
              earn their evidence.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-[1.8] text-slate-400">
            Rubric-first research informs every foundation choice in SIS.
            Candidates evaluated against a locked rubric. Board-gated before
            ratification. Every artifact carries SIP attestation.
          </p>
        </div>
      </section>

      {/* ── Methodology strip ── */}
      <section className="border-b border-white/[0.08] px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="grid gap-6 md:grid-cols-3">
            <Step
              n="01"
              title="Charter + rubric"
              body="Decision question + axioms + scoring dimensions written before candidates are evaluated."
            />
            <Step
              n="02"
              title="Parallel sub-agents"
              body="One agent per candidate. Sources cited inline. Findings dense, not sprawling."
            />
            <Step
              n="03"
              title="Synthesis + Board"
              body="Decision matrix → recommendation → /starlight-board pre-pass → /bless ratification."
            />
          </div>
        </div>
      </section>

      {/* ── Featured: Starlight Queen Visual Intelligence ── */}
      <section className="border-b border-white/[0.08] px-6 py-16 bg-[#050507]">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/[0.25] bg-cyan-500/[0.06] px-3 py-1 text-[10px] uppercase tracking-[2px] text-cyan-300">
                Visual Intelligence
              </div>
              <h2 className="mt-4 font-serif text-4xl tracking-[-1.5px] text-white md:text-5xl">
                Starlight Queen<br />Visual Intelligence
              </h2>
              <p className="mt-4 text-[15px] leading-[1.75] text-slate-400">
                The living heart of the system: a scroll-optimized visual narrative of the Queen v0.2 closed loop, her parallel swarms, ROUTE→MEASURE→LEARN→RATIFY→LEDGER choreography, and the first-class visual artifacts that now ledger every advance.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/queen"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-[14px] font-medium text-[#060609] transition-std hover:bg-white/90"
                >
                  Enter the Queen experience <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/research/starlight-proving-ground-2026-06"
                  className="inline-flex items-center gap-2 rounded-full border border-white/[0.15] px-5 py-2.5 text-[14px] font-medium text-white transition-std hover:border-white/[0.3] hover:bg-white/[0.03]"
                >
                  Queen in the Proving Ground
                </Link>
              </div>
              <p className="mt-4 text-[11px] text-slate-500">
                Mirrors the motion HTML · Native React scroll · SIP-attested visuals
              </p>
            </div>
            <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-white/[0.08] bg-black/60">
              <div className="absolute inset-0 bg-[radial-gradient(#c084fc_0.8px,transparent_1px)] bg-[length:6px_6px] flex items-center justify-center" style={{backgroundColor: '#050507'}}>
                <div className="text-center">
                  <div className="text-[10px] tracking-[3px] text-cyan-400/70 mb-1">L99 VISUAL</div>
                  <div className="text-xl text-white/70">Queen + Swarms (Grok Imagine)</div>
                  <a href="/queen" className="text-[10px] underline text-cyan-400/80 hover:text-cyan-400">/queen experience →</a>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#050507] via-[#050507]/70 to-transparent" />
              <div className="absolute bottom-6 left-6 text-xs uppercase tracking-[3px] text-cyan-300/90">
                THE CONTINUOUS ORCHESTRATOR
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Research cards ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Artifacts
          </h2>
          <p className="mt-3 text-xl font-semibold text-white">
            {items.filter((r) => r.status === "published").length} published ·{" "}
            {items.filter((r) => r.status !== "published").length} in flight.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {items.map((r) => {
              const a = r.accent ? ACCENT_MAP[r.accent] : ACCENT_MAP.violet;
              return (
                <article
                  key={r.slug}
                  className={`flex flex-col rounded-2xl border ${a.border} ${a.bg} p-6 transition-std hover:border-white/[0.2]`}
                >
                  <header>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest">
                      <span className={`rounded-full border px-2.5 py-1 ${a.chip}`}>
                        {TIER_LABEL[r.tier]}
                      </span>
                      <span className="rounded-full border border-white/[0.1] bg-white/[0.02] px-2.5 py-1 text-slate-400">
                        {STATUS_LABEL[r.status]}
                      </span>
                      <time
                        dateTime={r.publishedAt}
                        className="ml-auto font-mono text-slate-400"
                      >
                        {r.publishedAt}
                      </time>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-white">
                      {r.title}
                    </h3>
                  </header>

                  <p className="mt-3 flex-1 text-[14px] leading-[1.7] text-slate-400">
                    {r.tldr}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {r.tags.slice(0, 5).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 text-[10px] text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6">
                    {r.status === "published" ? (
                      <Link
                        href={`/research/${r.slug}`}
                        className="inline-flex items-center gap-1 text-[13px] font-medium text-white transition-std hover:text-violet-200"
                      >
                        Read the artifact <span aria-hidden="true">&rarr;</span>
                      </Link>
                    ) : (
                      <span className="text-[12px] italic text-slate-500">
                        Awaiting Board ratification. Charter available on
                        request.
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Why a research surface ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Why a research surface
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
            Substrate decisions compound.
          </h2>
          <p className="mt-5 text-[15px] leading-[1.85] text-slate-400">
            The wrong memory architecture, the wrong attestation surface, the
            wrong cross-model bridge — these errors don&apos;t stay contained.
            They propagate into every Intelligence System, every agent, every
            session. So substrate decisions get evidence before they get
            committed.
          </p>
          <p className="mt-4 text-[15px] leading-[1.85] text-slate-400">
            Research lives here, in the open, because forks of SIP inherit the
            decisions. The reasoning has to travel.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[15px] leading-relaxed text-slate-400">
            Methodology in the open. Decisions earned.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/protocol"
              className="rounded-full border border-white/[0.12] px-5 py-2.5 text-[14px] font-medium text-white transition-std hover:border-white/[0.25] hover:bg-white/[0.04]"
            >
              Read the protocol
            </Link>
            <a
              href="https://github.com/frankxai/Starlight-Intelligence-System/tree/main/docs/research"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/[0.12] px-5 py-2.5 text-[14px] font-medium text-white transition-std hover:border-white/[0.25] hover:bg-white/[0.04]"
            >
              Research methodology on GitHub &rarr;
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <code className="font-mono text-[11px] text-violet-300/80">{n}</code>
      <h3 className="mt-2 text-[14px] font-semibold text-white">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{body}</p>
    </div>
  );
}
