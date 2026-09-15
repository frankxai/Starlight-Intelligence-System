import type { Metadata } from "next";
import Link from "next/link";
import { BrainHero } from "@/components/BrainHero";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Starlight Intelligence is free and open source forever. Buy a lifetime supporter license to fund the work, or commission a done-for-you sovereign agent estate. Local-first. Forkable. No lock-in.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing — Starlight Intelligence",
    description:
      "Free and open source forever. Support the work with a lifetime license, go Pro for hosted features, or commission an Estate Factory build.",
    type: "article",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Starlight Intelligence — Pricing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing — Starlight Intelligence",
    description:
      "Free and open source forever. Support the work, go Pro, or commission an Estate.",
    images: ["/opengraph-image"],
  },
};

// ---------------------------------------------------------------------------
// Payment / contact wiring.
// Swap these for Stripe Payment Links, Polar.sh checkout, or GitHub Sponsors.
// They are plain URLs so the page stays a static server component (CSP-safe).
// ---------------------------------------------------------------------------
const SUPPORT_INDIVIDUAL_URL = "https://github.com/sponsors/frankxai"; // TODO: Stripe Payment Link ($29 one-time)
const SUPPORT_TEAM_URL = "https://github.com/sponsors/frankxai"; // TODO: Stripe Payment Link ($129/yr)
const PRO_WAITLIST_URL =
  "https://github.com/frankxai/Starlight-Intelligence-System/discussions"; // TODO: waitlist form
const ESTATE_CONTACT_URL = "mailto:hello@starlightintelligence.org?subject=Estate%20Factory%20commission";

function Check() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="mt-0.5 shrink-0"
    >
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <path
        d="M5 8.2 7 10.2 11 6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Tier = {
  eyebrow: string;
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: string[];
  cta: string;
  href: string;
  accentText: string;
  accentBorder: string;
  accentBg: string;
  featured?: boolean;
};

const SUPPORTER_TIERS: Tier[] = [
  {
    eyebrow: "For an individual",
    name: "Supporter",
    price: "$29",
    cadence: "one-time · lifetime",
    blurb:
      "You run Starlight every day. Pay once if it earns its place — no features are ever held hostage.",
    features: [
      "Lifetime supporter license",
      "Your name in SUPPORTERS.md",
      "Priority issue triage",
      "Every open-core feature stays MIT, always free",
      "Funds the protocol, not a paywall",
    ],
    cta: "Become a supporter",
    href: SUPPORT_INDIVIDUAL_URL,
    accentText: "text-violet-300",
    accentBorder: "border-violet-500/[0.25]",
    accentBg: "bg-violet-500/[0.05]",
    featured: true,
  },
  {
    eyebrow: "For your whole team",
    name: "Team Supporter",
    price: "$129",
    cadence: "per year",
    blurb:
      "Back the work as an org and put your logo where builders look. Cancel anytime — it stays open source either way.",
    features: [
      "Everything in Supporter",
      "Org badge + logo on the site",
      "Private support channel",
      "Early access to Pro betas",
      "Adoption guidance for SIP in your repos",
    ],
    cta: "Support as a team",
    href: SUPPORT_TEAM_URL,
    accentText: "text-cyan-300",
    accentBorder: "border-cyan-500/[0.25]",
    accentBg: "bg-cyan-500/[0.05]",
  },
];

const COMMERCIAL: Tier[] = [
  {
    eyebrow: "Open-core · self-serve",
    name: "Pro",
    price: "$25",
    cadence: "per seat / month",
    blurb:
      "For teams that want the substrate hosted. Gates only the multiplayer + marginal-cost features — never your local memory.",
    features: [
      "Hosted shared-vault sync across the team",
      "Managed Hermes runners (governed execution)",
      "SSO + team governance",
      "Semantic search (sqlite-vec) as it ships",
      "Export everything, always — zero lock-in",
    ],
    cta: "Join the Pro waitlist",
    href: PRO_WAITLIST_URL,
    accentText: "text-fuchsia-300",
    accentBorder: "border-fuchsia-500/[0.22]",
    accentBg: "bg-fuchsia-500/[0.04]",
  },
  {
    eyebrow: "Done-for-you · high-touch",
    name: "Estate Factory",
    price: "from $25k",
    cadence: "commission + steward retainer",
    blurb:
      "We commission your sovereign agent estate end-to-end — governed, attested, and yours. The Trinity-grade build.",
    features: [
      "Genius excavation + 4-layer blueprint",
      "Full estate build, Pilot → Standing",
      "Governed, verify-gated delivery (no executor touches main)",
      "Ongoing steward retainer",
      "80% template reuse — your edge, not boilerplate",
    ],
    cta: "Book a commission",
    href: ESTATE_CONTACT_URL,
    accentText: "text-emerald-300",
    accentBorder: "border-emerald-500/[0.22]",
    accentBg: "bg-emerald-500/[0.04]",
  },
];

function TierCard({ tier }: { tier: Tier }) {
  const external = tier.href.startsWith("http") || tier.href.startsWith("mailto:");
  return (
    <div
      className={`relative flex flex-col rounded-2xl border ${tier.accentBorder} ${tier.accentBg} p-7 transition-std`}
    >
      {tier.featured && (
        <span className="absolute -top-3 left-7 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#060609]">
          Most chosen
        </span>
      )}
      <p
        className={`text-[10px] font-semibold uppercase tracking-widest ${tier.accentText}`}
      >
        {tier.eyebrow}
      </p>
      <h3 className="mt-2 text-[20px] font-semibold text-white">{tier.name}</h3>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-[40px] font-semibold leading-none text-white">
          {tier.price}
        </span>
        <span className="text-[13px] text-slate-400">{tier.cadence}</span>
      </div>
      <p className="mt-4 text-[13px] leading-relaxed text-slate-400">{tier.blurb}</p>
      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {tier.features.map((f) => (
          <li
            key={f}
            className={`flex items-start gap-2.5 text-[13px] leading-snug text-slate-300`}
          >
            <span className={tier.accentText}>
              <Check />
            </span>
            {f}
          </li>
        ))}
      </ul>
      <a
        href={tier.href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="mt-7 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#060609] transition-std hover:shadow-[0_0_30px_rgba(167,139,250,0.25)]"
      >
        {tier.cta}
      </a>
    </div>
  );
}

const FAQ: { q: string; a: string }[] = [
  {
    q: "Is Starlight really free?",
    a: "Yes. The core is MIT-licensed and forkable, and it always will be. The supporter license is voluntary — it funds the work, it does not unlock it. Nothing you rely on is held behind a paywall.",
  },
  {
    q: "Then why would I pay?",
    a: "Because sustainable open source needs funding to stay healthy. If Starlight saves you time and you can afford it, a one-time $29 keeps the protocol independent, maintained, and not beholden to a VC exit. Pay it forward.",
  },
  {
    q: "What is the difference between Supporter and Pro?",
    a: "Supporter is a voluntary thank-you for the free, local-first software you already run. Pro is a real product: hosted vault sync, managed governed runners, SSO — the multiplayer and marginal-cost features that only make sense as a service. Pro never gates your local memory.",
  },
  {
    q: "Do I get locked in if I go Pro or commission an Estate?",
    a: "No. Sovereignty is a protocol-level guarantee (SIP §5.6 Exit). Vaults are plain, human-readable JSONL on your disk. You can export everything and walk away at any tier — that clause is non-negotiable, even for us.",
  },
  {
    q: "What is the Estate Factory?",
    a: "A done-for-you engagement where we design and build your sovereign agent estate end-to-end — governed, attested, and fully yours — then support it on a steward retainer. It is bespoke forward-deployed delivery, not a SaaS plan.",
  },
];

export default function PricingPage() {
  return (
    <div className="overflow-x-clip">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div
          className="dot-grid pointer-events-none absolute inset-0 opacity-40"
          aria-hidden="true"
        />
        <BrainHero className="pointer-events-none absolute right-[-80px] top-8 hidden h-[440px] w-[440px] opacity-40 lg:block" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 md:py-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-300">
            Support the work
          </p>
          <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-fraunces)] text-[40px] font-semibold leading-[1.05] text-white md:text-[56px]">
            Free forever.
            <br />
            Pay if it earns its place.
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-slate-300 md:text-[17px]">
            Starlight Intelligence is open source and local-first — one governed,
            sovereign brain for every CLI you run. There is no paywall on the
            software you depend on. If it earns a place in your stack, a
            supporter license keeps the protocol independent and maintained.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={SUPPORT_INDIVIDUAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#060609] transition-std hover:shadow-[0_0_30px_rgba(167,139,250,0.25)]"
            >
              Become a supporter &rarr;
            </a>
            <Link
              href="/download"
              className="rounded-full border border-white/[0.12] px-6 py-3 text-[14px] font-medium text-slate-200 transition-std hover:border-white/[0.2] hover:bg-white/[0.04]"
            >
              Just get it free
            </Link>
          </div>
        </div>
      </section>

      {/* Supporter tiers */}
      <section className="relative border-b border-white/[0.08]">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <div className="grid gap-6 md:grid-cols-2">
            {SUPPORTER_TIERS.map((t) => (
              <TierCard key={t.name} tier={t} />
            ))}
          </div>
          <p className="mt-6 text-center text-[12px] text-slate-500">
            Voluntary. No feature gating. Modeled conversion is ~1–5% of active
            users — every license genuinely funds the work.
          </p>
        </div>
      </section>

      {/* Commercial / bigger */}
      <section className="relative border-b border-white/[0.08]">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <div className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-300">
              Building something bigger?
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-fraunces)] text-[28px] font-semibold text-white md:text-[34px]">
              Host it, or have us build it.
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-slate-400">
              The supporter license keeps the lights on. These are the
              commercial layers — for teams that want the substrate managed, or
              principals who want a sovereign estate commissioned end-to-end.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {COMMERCIAL.map((t) => (
              <TierCard key={t.name} tier={t} />
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="relative border-b border-white/[0.08]">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-fraunces)] text-[26px] font-semibold text-white md:text-[32px]">
            Why charge for open source at all?
          </h2>
          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-slate-300">
            <p>
              Building Starlight takes real, sustained effort. Our mission is for
              open-source software and ethical business to become a durable
              income source for the people who maintain it — so the protocol
              stays independent, sovereign, and accountable to its users instead
              of to an exit.
            </p>
            <p>
              Every funded competitor in agent memory is racing to make your
              context their hosted product. Starlight bets the other way: your
              memory is plain files on your disk, the protocol is open, and you
              can export and leave at any moment. Paying is how you keep that bet
              alive.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-fraunces)] text-[26px] font-semibold text-white md:text-[32px]">
            Questions
          </h2>
          <div className="mt-8 divide-y divide-white/[0.06]">
            {FAQ.map((item) => (
              <div key={item.q} className="py-5">
                <h3 className="text-[15px] font-semibold text-white">{item.q}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-slate-400">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-2xl border border-violet-500/[0.2] bg-violet-500/[0.05] p-8 text-center">
            <h3 className="font-[family-name:var(--font-fraunces)] text-[22px] font-semibold text-white">
              One governed brain for every agent you run.
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-slate-400">
              Start free in minutes. Support it when it earns its place.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/download"
                className="rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#060609] transition-std hover:shadow-[0_0_30px_rgba(167,139,250,0.25)]"
              >
                Get Starlight free
              </Link>
              <a
                href={SUPPORT_INDIVIDUAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/[0.12] px-6 py-3 text-[14px] font-medium text-slate-200 transition-std hover:border-white/[0.2] hover:bg-white/[0.04]"
              >
                Become a supporter
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
