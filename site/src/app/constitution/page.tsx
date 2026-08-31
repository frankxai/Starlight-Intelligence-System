import type { Metadata } from "next";
import Link from "next/link";
import { GalaxyField } from "@/components/cinematic/GalaxyField";

export const metadata: Metadata = {
  title: "The Starlight Accord: Intelligence in Service of Life",
  description:
    "Nine constitutional commitments for human authorship, intelligence sovereignty, plural intelligence, protection, creative agency, and stewardship of life.",
  alternates: { canonical: "/constitution" },
  openGraph: {
    title: "The Starlight Accord: Intelligence in Service of Life",
    description:
      "A public constraint on what Starlight is willing to build—and an invitation to test whether the work honors it.",
    url: "https://starlightintelligence.org/constitution",
    type: "article",
  },
};

const PRINCIPLES = [
  {
    id: "SLA-01",
    title: "Human authorship",
    body: "People remain the authors of goals, meaning, and consequential choices. Intelligence may propose and execute; it does not inherit moral responsibility.",
    test: "Can a person understand, change, refuse, and recover from the system’s action?",
  },
  {
    id: "SLA-02",
    title: "Intelligence access",
    body: "Advanced capability should widen participation in education, protection, invention, and economic life—not become a private utility for a cognitive elite.",
    test: "Does useful capability reach people beyond the already powerful?",
  },
  {
    id: "SLA-03",
    title: "Intelligence sovereignty",
    body: "A person should direct their intelligence layer, inspect its memory, move their context, change providers, and leave without losing part of themselves.",
    test: "Can context be corrected, deleted, exported, and used elsewhere?",
  },
  {
    id: "SLA-04",
    title: "Capability compounding",
    body: "A good system leaves the person more able to think, decide, make, and protect—not merely more dependent on the next answer.",
    test: "What durable capability remains when the system is removed?",
  },
  {
    id: "SLA-05",
    title: "Plural intelligence",
    body: "No single lab, model, state, or philosophy can represent the full plurality of human values. Healthy ecosystems preserve meaningful choice.",
    test: "Can multiple models, people, and institutions participate without one cognitive center?",
  },
  {
    id: "SLA-06",
    title: "Protection by design",
    body: "Privacy, security, contestability, and recovery belong in the architecture. They are not settings added after trust has already been requested.",
    test: "What happens when the system is wrong, compromised, or used against the person?",
  },
  {
    id: "SLA-07",
    title: "Creative and economic agency",
    body: "People should retain provenance, ownership, audience relationships, reusable workflows, and a legible share of the value they create.",
    test: "Who owns the catalog, the workflow, and the upside?",
  },
  {
    id: "SLA-08",
    title: "Intergenerational dignity",
    body: "Systems that grow beside children carry a higher duty: minimal profiling, age-appropriate explanation, protection from attachment mechanics, and a path toward independence.",
    test: "Does the system protect a young person’s right to grow and change?",
  },
  {
    id: "SLA-09",
    title: "Stewardship of life",
    body: "Intelligence should strengthen the conditions for human and ecological flourishing. Capability without care is not progress.",
    test: "Does the full system leave communities and living systems better able to endure?",
  },
] as const;

const PORTFOLIO = [
  {
    name: "Starlight Intelligence",
    promise: "Constitution and sovereign substrate",
    body: "Portable context, open protocols, operator-held governance, learning systems, and public evidence.",
    href: "/architecture",
  },
  {
    name: "FrankX",
    promise: "Named human responsibility",
    body: "Essays, architectures, experiments, and public decisions under an accountable founder voice.",
    href: "https://frankx.ai/the-future-we-choose",
  },
  {
    name: "GenCreator",
    promise: "Creative and economic agency",
    body: "Creator systems for source, provenance, approval, owned workflows, and reviewable artifacts.",
    href: "https://gencreator.ai/creator-sovereignty",
  },
  {
    name: "Arcanea",
    promise: "Imagination and cultural possibility",
    body: "Living worlds and creative protocols through which people can examine futures worth choosing.",
    href: "https://arcanea.ai/imagination-charter",
  },
] as const;

function AccordPrism() {
  return (
    <div
      className="relative hidden min-h-[31rem] overflow-hidden border border-white/[0.08] bg-white/[0.015] lg:block"
      role="img"
      aria-label="One constitution refracted into several ventures"
    >
      <span className="absolute left-0 top-1/2 h-px w-[43%] bg-slate-500" />
      <span className="absolute left-[39%] top-1/2 grid h-24 w-24 -translate-y-1/2 rotate-45 place-items-center border border-violet-300/40 bg-violet-300/[0.08] font-serif text-3xl italic text-violet-200">
        S
      </span>
      <span className="absolute left-[53%] top-1/2 h-px w-3/4 origin-left -rotate-[18deg] bg-cyan-300/70" />
      <span className="absolute left-[53%] top-1/2 h-px w-3/4 origin-left -rotate-[6deg] bg-violet-300/70" />
      <span className="absolute left-[53%] top-1/2 h-px w-3/4 origin-left rotate-[6deg] bg-emerald-300/70" />
      <span className="absolute left-[53%] top-1/2 h-px w-3/4 origin-left rotate-[18deg] bg-amber-200/70" />
      <span className="absolute bottom-6 left-6 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
        One constitution / several operating expressions
      </span>
    </div>
  );
}

export default function ConstitutionPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "DigitalDocument",
    name: "The Starlight Accord: Intelligence in Service of Life",
    url: "https://starlightintelligence.org/constitution",
    datePublished: "2026-08-12",
    dateModified: "2026-08-12",
    creator: {
      "@type": "Organization",
      name: "Starlight Intelligence",
      url: "https://starlightintelligence.org",
    },
    about: [
      "Human authorship",
      "Intelligence sovereignty",
      "Plural intelligence",
      "AI governance",
    ],
  };

  return (
    <div className="bg-[#060609] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section className="relative overflow-hidden border-b border-white/[0.08] px-5 py-20 sm:px-6 md:py-28 lg:py-36">
        <GalaxyField still="veil" />
        <div className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.08fr_.92fr] lg:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-300">
              The Starlight Accord · Version 1.0
            </p>
            <h1 className="mt-8 max-w-5xl font-serif text-6xl font-semibold leading-[0.9] tracking-[-0.055em] sm:text-7xl lg:text-8xl">
              Intelligence
              <br />
              <em className="font-normal text-violet-300">
                in Service of Life
              </em>
            </h1>
            <p className="mt-9 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
              A public constraint on what we are willing to build—and an
              invitation to test whether the work honors it.
            </p>
            <div className="mt-8 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
              <span className="border border-white/10 px-3 py-2">
                Published 12 August 2026
              </span>
              <span className="border border-white/10 px-3 py-2">
                9 principles
              </span>
              <span className="border border-white/10 px-3 py-2">
                Open for examination
              </span>
            </div>
          </div>
          <AccordPrism />
        </div>
      </section>

      <section className="border-b border-white/[0.08] px-5 py-20 sm:px-6 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[180px_minmax(0,760px)] lg:justify-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-600">
            The short answer
          </p>
          <div>
            <p className="font-serif text-3xl leading-tight text-white md:text-4xl">
              Starlight Intelligence exists to turn advanced AI from
              concentrated technical capacity into distributed human capability.
            </p>
            <p className="mt-8 text-lg leading-8 text-slate-400">
              We build the knowledge, systems, standards, education, and
              communities that help people direct intelligence without
              surrendering authorship, privacy, dignity, or responsibility.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.08] bg-[#0b1018] px-5 py-20 sm:px-6 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.6fr_1fr]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
              The premise
            </p>
            <h2 className="mt-6 font-serif text-4xl font-semibold leading-tight tracking-[-0.04em] md:text-6xl">
              Access is the beginning.
              <br />
              <em className="font-normal text-violet-300">
                Sovereignty is the standard.
              </em>
            </h2>
          </div>
          <div className="space-y-6 text-lg leading-8 text-slate-300">
            <p>
              The defining question of the intelligence age is not whether
              machines become more capable. They will. The defining question is
              whether people become more capable with them.
            </p>
            <p>
              A person does not become sovereign because an assistant can answer
              any question. Sovereignty requires the ability to choose the
              system, direct its purpose, protect and move personal context,
              understand consequential outputs, contest decisions, create
              original value, and leave without losing part of oneself.
            </p>
            <blockquote className="border-l-2 border-emerald-300/60 pl-7 font-serif text-3xl italic leading-tight text-white">
              After using a Starlight system, a person should be better able to
              think, decide, create, protect, and contribute.
            </blockquote>
            <p>
              Advanced intelligence should widen human possibility. It should
              give a child a patient teacher without replacing curiosity. It
              should give a creator a studio without dissolving authorship. It
              should give a founder a capable team without requiring
              institutional permission.
            </p>
            <p>
              We reject passive dependency and centralized benevolence as
              sufficient visions of the future. A healthy intelligence ecosystem
              needs many models, many builders, verifiable safeguards, portable
              context, accountable institutions, and people with the capacity to
              choose among them.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.08] px-5 py-20 sm:px-6 md:py-28">
        <div className="mx-auto max-w-7xl">
          <header className="max-w-3xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
              The nine commitments
            </p>
            <h2 className="mt-6 font-serif text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
              A constitution written as product tests.
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-400">
              Each principle carries a question that a team can answer with
              evidence.
            </p>
          </header>
          <div className="mt-16 divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {PRINCIPLES.map((principle) => (
              <article
                id={principle.id.toLowerCase()}
                key={principle.id}
                className="grid gap-5 py-8 md:grid-cols-[80px_240px_1fr_1fr] md:gap-8 md:py-10"
              >
                <span className="font-mono text-xs text-cyan-300">
                  {principle.id}
                </span>
                <h3 className="font-serif text-2xl font-semibold text-white">
                  {principle.title}
                </h3>
                <p className="leading-7 text-slate-400">{principle.body}</p>
                <p className="border-l border-emerald-300/30 pl-5 text-sm leading-6 text-slate-400">
                  <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-300">
                    Product test
                  </span>
                  {principle.test}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.08] bg-[#0b1018] px-5 py-20 sm:px-6 md:py-28">
        <div className="mx-auto max-w-7xl">
          <header className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                Constitutional inheritance
              </p>
              <h2 className="mt-6 font-serif text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
                One mission house.
                <br />
                Several operating promises.
              </h2>
            </div>
            <p className="max-w-xl self-end text-lg leading-8 text-slate-400">
              Starlight owns the doctrine. Each venture owns a distinct layer of
              the work. FrankX carries named responsibility across the whole
              portfolio.
            </p>
          </header>
          <div className="mt-14 divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {PORTFOLIO.map((venture, index) => (
              <a
                key={venture.name}
                href={venture.href}
                className="group grid gap-5 py-7 md:grid-cols-[50px_220px_1fr_24px] md:gap-8"
              >
                <span className="font-mono text-xs text-violet-300">
                  0{index + 1}
                </span>
                <span>
                  <strong className="block font-serif text-xl text-white">
                    {venture.name}
                  </strong>
                  <small className="mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">
                    {venture.promise}
                  </small>
                </span>
                <span className="max-w-2xl leading-7 text-slate-400">
                  {venture.body}
                </span>
                <span
                  className="text-cyan-300 transition-micro group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.08] px-5 py-20 sm:px-6 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.6fr_1fr]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
              The evidence rule
            </p>
            <h2 className="mt-6 font-serif text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
              Promises need states.
            </h2>
          </div>
          <div className="space-y-6 text-lg leading-8 text-slate-300">
            <p>
              Every public initiative should be labeled{" "}
              <strong className="text-white">available</strong>,{" "}
              <strong className="text-white">in development</strong>,{" "}
              <strong className="text-white">research</strong>, or{" "}
              <strong className="text-white">horizon</strong>. Each product
              should name the principles it advances and show how a person can
              verify the claim.
            </p>
            <p>
              For memory, that means export, correction, deletion, permission
              boundaries, and portability. For creator systems, it means
              provenance, approval gates, workflow ownership, and an audience
              relationship the creator can carry. For learning, it means
              acquired skill and independent performance rather than completion
              theater.
            </p>
            <p>The constitution becomes a product operating system.</p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-5 py-24 text-center sm:px-6 md:py-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.11),transparent_55%)]" />
        <div className="relative mx-auto max-w-5xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
            A living accord
          </p>
          <h2 className="mt-7 font-serif text-5xl font-semibold leading-[1.02] tracking-[-0.04em] md:text-7xl">
            Intelligence is becoming abundant.
            <br />
            <em className="font-normal text-violet-300">
              Direction, judgment, courage, imagination, and care are not.
            </em>
          </h2>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-400">
            This is not a claim that every tension is solved. It is a public
            standard against which the work can be judged.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/perspectives/personal-superintelligence-for-everyone"
              className="inline-flex min-h-12 items-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-[#060609] transition-micro hover:bg-slate-200"
            >
              Read the cross-lab perspective
            </Link>
            <Link
              href="/protocol"
              className="text-sm font-semibold text-slate-300 underline decoration-white/20 underline-offset-8"
            >
              Inspect the open protocol
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
