import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Personal Superintelligence for Everyone",
  description:
    "Where Meta, OpenAI, Anthropic, Google DeepMind, and Starlight align—and why access to advanced AI must grow into human sovereignty.",
  alternates: {
    canonical: "/perspectives/personal-superintelligence-for-everyone",
  },
  openGraph: {
    title: "Personal Superintelligence for Everyone",
    description:
      "The frontier labs are building more intelligence. The next institution must build humanity’s capacity to use it well.",
    url: "https://starlightintelligence.org/perspectives/personal-superintelligence-for-everyone",
    type: "article",
  },
};

const LABS = [
  [
    "Meta",
    "Personal superintelligence, open ecosystems, and global distribution",
    "Make advanced intelligence personal and broadly available.",
  ],
  [
    "OpenAI",
    "Broad benefit, democratized capability, and human control",
    "Build frontier systems and work to distribute their benefits.",
  ],
  [
    "Anthropic",
    "Capability thresholds and safeguards for catastrophic risk",
    "Make rapid capability growth legible and governable.",
  ],
  [
    "Google DeepMind",
    "Responsible intelligence and scientific discovery",
    "Apply frontier research to knowledge, science, and public benefit.",
  ],
  [
    "Starlight",
    "Human capability, portable context, plural intelligence, and culture",
    "Build the constitutional and developmental layer across providers.",
  ],
] as const;

export default function PersonalSuperintelligencePerspective() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Personal Superintelligence for Everyone",
    datePublished: "2026-08-12",
    dateModified: "2026-08-12",
    author: { "@type": "Organization", name: "Starlight Intelligence" },
    mainEntityOfPage:
      "https://starlightintelligence.org/perspectives/personal-superintelligence-for-everyone",
  };

  return (
    <div className="bg-[#060609] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <header className="border-b border-white/[0.08] px-5 py-24 sm:px-6 md:py-36">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-300">
            Starlight perspective · 12 August 2026
          </p>
          <h1 className="mt-8 max-w-6xl font-serif text-6xl font-semibold leading-[0.91] tracking-[-0.055em] sm:text-7xl lg:text-8xl">
            Personal superintelligence
            <br />
            <em className="font-normal text-violet-300">for everyone.</em>
          </h1>
          <p className="mt-9 max-w-3xl text-xl leading-8 text-slate-300 md:text-2xl">
            The frontier labs are building more intelligence. The next
            institution must build humanity’s capacity to use it well.
          </p>
        </div>
      </header>

      <section className="border-b border-white/[0.08] px-5 py-20 sm:px-6 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[180px_minmax(0,760px)] lg:justify-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-600">
            The moment
          </p>
          <div className="space-y-6 text-lg leading-8 text-slate-300">
            <p className="font-serif text-3xl leading-tight text-white md:text-4xl">
              Meta’s “The Future is for Everyone” matters because it connects a
              philosophy of individual agency to an actual portfolio.
            </p>
            <p>
              Personal agents, private communication, creation and distribution,
              glasses, open models, affordable compute, infrastructure, and
              governance are presented as one delivery system for intelligence
              at planetary scale. That coherence raises the bar: the mission has
              to shape the products.
            </p>
            <p>
              We agree with the direction. Advanced intelligence should favor
              invention over narrow automation, reach people beyond a technical
              elite, and create a balance of power that does not leave citizens
              structurally weaker than institutions.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.08] bg-[#0b1018] px-5 py-20 sm:px-6 md:py-28">
        <div className="mx-auto max-w-7xl">
          <header className="max-w-3xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
              A plural ecosystem
            </p>
            <h2 className="mt-6 font-serif text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
              Different layers. Shared responsibility.
            </h2>
          </header>
          <div className="mt-14 divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {LABS.map(([name, emphasis, contribution], index) => (
              <article
                key={name}
                className="grid gap-5 py-8 md:grid-cols-[50px_170px_1fr_1fr] md:gap-8"
              >
                <span className="font-mono text-xs text-violet-300">
                  0{index + 1}
                </span>
                <h3 className="font-serif text-2xl font-semibold text-white">
                  {name}
                </h3>
                <p className="leading-7 text-slate-300">{emphasis}</p>
                <p className="font-mono text-xs leading-6 text-slate-500">
                  {contribution}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.08] px-5 py-20 sm:px-6 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.6fr_1fr]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
              The extension
            </p>
            <h2 className="mt-6 font-serif text-4xl font-semibold leading-tight tracking-[-0.04em] md:text-6xl">
              Access does not yet equal sovereignty.
            </h2>
          </div>
          <div className="space-y-6 text-lg leading-8 text-slate-300">
            <p>
              A free assistant can widen access. A sovereign intelligence layer
              goes further: people can inspect what it remembers, correct and
              delete memory, export their context, change providers, understand
              consequential actions, and recover after failure.
            </p>
            <p>
              The most useful privacy mode cannot be the least capable one.
              Portability cannot stop at downloading a transcript. A
              constitution becomes real when it constrains the builder at the
              moment constraint becomes expensive.
            </p>
            <blockquote className="border-l-2 border-emerald-300/60 pl-7 font-serif text-3xl italic leading-tight text-white md:text-4xl">
              The future becomes everyone’s through authorship—not access alone.
            </blockquote>
            <p>
              People need the capacity to formulate better questions, choose
              meaningful goals, create original work, protect their context,
              coordinate intelligence, build institutions, and remain
              responsible for consequences. That is the layer Starlight exists
              to build across providers.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.08] bg-[#0b1018] px-5 py-20 sm:px-6 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.6fr_1fr]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
              What comes next
            </p>
            <h2 className="mt-6 font-serif text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
              Build the missing institution.
            </h2>
          </div>
          <div className="space-y-6 text-lg leading-8 text-slate-300">
            <p>
              Between a frontier model and a flourishing person sits identity,
              memory, judgment, orchestration, protection, creation, ownership,
              culture, and community. No general-purpose assistant can decide
              those questions for everyone.
            </p>
            <ol className="list-decimal space-y-3 pl-6">
              <li>
                Personal intelligence with portable, inspectable, user-directed
                memory.
              </li>
              <li>
                A capability floor for education, protection, creation, and
                participation.
              </li>
              <li>
                Multiple models and providers connected through open protocols.
              </li>
              <li>
                Metrics for acquired human capability, not only labor removed.
              </li>
              <li>
                Higher constitutional protections for children and asymmetric
                influence.
              </li>
              <li>Public evidence for community and ecological impact.</li>
            </ol>
            <p>
              The objective is not one benevolent cognitive center. It is an
              ecosystem in which people and communities retain meaningful
              direction.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
            Primary sources
          </p>
          <div className="mt-8 divide-y divide-white/[0.08] border-y border-white/[0.08]">
            <a
              className="block py-5 text-slate-300 hover:text-white"
              href="https://www.meta.com/thefutureisforeveryone/"
            >
              Meta · The Future is for Everyone ↗
            </a>
            <a
              className="block py-5 text-slate-300 hover:text-white"
              href="https://openai.com/index/built-to-benefit-everyone-our-plan/"
            >
              OpenAI · Built to benefit everyone ↗
            </a>
            <a
              className="block py-5 text-slate-300 hover:text-white"
              href="https://www.anthropic.com/responsible-scaling-policy"
            >
              Anthropic · Responsible Scaling Policy ↗
            </a>
            <a
              className="block py-5 text-slate-300 hover:text-white"
              href="https://deepmind.google/about/"
            >
              Google DeepMind · About ↗
            </a>
          </div>
          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              href="/constitution"
              className="inline-flex min-h-12 items-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-[#060609] transition-micro hover:bg-slate-200"
            >
              Read the Starlight Accord
            </Link>
            <a
              href="https://frankx.ai/insights/meta-the-future-is-for-everyone"
              className="text-sm font-semibold text-slate-300 underline decoration-white/20 underline-offset-8"
            >
              Read Frank’s full analysis
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
