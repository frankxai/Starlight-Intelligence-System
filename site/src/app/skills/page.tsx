import type { Metadata } from "next";
import Link from "next/link";
import { getSkillRegistry, groupByDomain, type SkillRule } from "@/lib/skills";
import { ACCENT_BORDER, ACCENT_BG, ACCENT_CHIP, type Accent } from "@/lib/accents";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Skill Registry",
  description:
    "Every auto-activating Starlight skill rule — trigger keywords, priority, and domain — derived live from skills/skill-rules.json.",
  openGraph: {
    title: "Skill Registry — Starlight Intelligence",
    description:
      "Auto-activating skill rules across every domain, derived live from the repo's skill-rules.json.",
    type: "article",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Starlight Intelligence — Skill Registry" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Skill Registry — Starlight Intelligence",
    description:
      "Auto-activating skill rules across every domain, derived live from the repo.",
    images: ["/opengraph-image"],
  },
};

const ACCENT_CYCLE: Accent[] = [
  "violet",
  "cyan",
  "fuchsia",
  "emerald",
  "amber",
  "rose",
];

const PRIORITY_LABEL: Record<string, string> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
};

const PRIORITY_CLASS: Record<string, string> = {
  critical: "border-rose-500/[0.3] bg-rose-500/[0.08] text-rose-200",
  high: "border-violet-500/[0.25] bg-violet-500/[0.06] text-violet-200",
  medium: "border-cyan-500/[0.2] bg-cyan-500/[0.05] text-cyan-300",
  low: "border-white/[0.1] bg-white/[0.02] text-slate-400",
};

function priorityClass(priority: string): string {
  return PRIORITY_CLASS[priority] ?? PRIORITY_CLASS.medium;
}

export default async function SkillsPage() {
  const registry = await getSkillRegistry();
  const grouped = groupByDomain(registry.rules);

  const domains = [...grouped.keys()].sort(
    (a, b) => (grouped.get(b)?.length ?? 0) - (grouped.get(a)?.length ?? 0)
  );

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-mesh-1 absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-cyan-600/[0.05] blur-[100px]" />
          <div className="animate-mesh-2 absolute right-0 top-20 h-[300px] w-[300px] rounded-full bg-violet-500/[0.04] blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 py-20">
          <p className="text-[11px] font-medium uppercase tracking-widest text-cyan-400">
            Skill registry
          </p>
          <h1 className="mt-3 font-serif text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
            {registry.total} auto-activating rules.
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Context, not commands.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-400">
            No skill is invoked by hand. Every rule below fires from context —
            keywords, active agent, detected intent — read live from{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-cyan-300">
              skills/skill-rules.json
            </code>
            , grouped by domain across {domains.length} domains.
          </p>
        </div>
      </section>

      {/* ── Domain groups ── */}
      {domains.map((domain, i) => {
        const accent = ACCENT_CYCLE[i % ACCENT_CYCLE.length];
        const rules = grouped.get(domain) ?? [];
        return (
          <section
            key={domain}
            className="border-b border-white/[0.08] px-6 py-16"
          >
            <div className="mx-auto max-w-5xl">
              <div className="flex flex-wrap items-baseline gap-3">
                <span
                  className={`inline-block rounded-full border px-3 py-1 text-[11px] uppercase tracking-widest ${ACCENT_CHIP[accent]}`}
                >
                  {domain}
                </span>
                <span className="text-[12px] text-slate-500">
                  {rules.length} rule{rules.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {rules.map((rule) => (
                  <SkillCard key={rule.id} rule={rule} accent={accent} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {registry.total === 0 && (
        <section className="px-6 py-20">
          <div className="mx-auto max-w-3xl text-center text-slate-500">
            Skill registry unavailable at build time.
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[15px] leading-relaxed text-slate-400">
            Skills stay invisible until context calls them. That&apos;s the point.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/agents"
              className="rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#060609] transition-std hover:shadow-[0_0_30px_rgba(167,139,250,0.2)]"
            >
              See the agent registry &rarr;
            </Link>
            <a
              href="https://github.com/frankxai/Starlight-Intelligence-System/blob/main/skills/skill-rules.json"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/[0.1] px-6 py-3 text-[14px] font-medium text-white transition-std hover:border-white/[0.2] hover:bg-white/[0.04]"
            >
              Read skill-rules.json
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function SkillCard({ rule, accent }: { rule: SkillRule; accent: Accent }) {
  const keywords = rule.keywords.slice(0, 6);
  return (
    <div
      className={`rounded-xl border p-4 transition-std hover:border-white/[0.2] ${ACCENT_BORDER[accent]} ${ACCENT_BG[accent]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-mono text-[13px] font-semibold text-white">
          {rule.id}
        </h3>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${priorityClass(
            rule.priority
          )}`}
        >
          {PRIORITY_LABEL[rule.priority] ?? rule.priority}
        </span>
      </div>
      <p className="mt-1.5 truncate font-mono text-[11px] text-slate-500">
        {rule.skill}
      </p>
      {keywords.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {keywords.map((kw) => (
            <span
              key={kw}
              className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 text-[10px] text-slate-400"
            >
              {kw}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
