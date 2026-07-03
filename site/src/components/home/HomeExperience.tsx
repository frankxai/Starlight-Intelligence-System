"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  ArrowUpRight,
  Database,
  FileCheck2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";
import { EcosystemConstellation } from "./EcosystemConstellation";

const StarlightCoreScene = dynamic(() => import("./StarlightCoreScene"), {
  ssr: false,
});

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const PILLARS = [
  {
    n: "01",
    title: "Persistent memory",
    desc: "Six semantic vaults give every agent — Claude Code, Cursor, Codex, Gemini, OpenCode — the same durable memory surface. No drift. No lost decisions.",
    icon: Database,
    accent: "#67e8f9",
  },
  {
    n: "02",
    title: "Attested knowledge",
    desc: "Every serious run leaves a proof trail: traces, evals, confidence notes, and SIP attestation another agent can inspect and cite.",
    icon: FileCheck2,
    accent: "#a78bfa",
  },
  {
    n: "03",
    title: "Sovereign control",
    desc: "Local-first vaults, operator-held gates, and human review before critical moves. Your substrate, your rules, forkable by design.",
    icon: ShieldCheck,
    accent: "#fbbf24",
  },
] as const;

const LOOP_STEPS = [
  { title: "Capture", desc: "Intent and constraints enter the substrate." },
  { title: "Recall", desc: "Vaults retrieve the relevant memory." },
  { title: "Evaluate", desc: "Policy and provenance gates score the run." },
  { title: "Route", desc: "The right agent path receives the work." },
  { title: "Attest", desc: "The result leaves an inspectable proof trail." },
] as const;

const VAULTS = [
  { name: "Genius", desc: "Identity, edge, operator patterns.", accent: "#a78bfa" },
  { name: "Second Brain", desc: "Capture and recall across sessions.", accent: "#67e8f9" },
  { name: "Brand", desc: "Voice, proof, durable public memory.", accent: "#f0abfc" },
  { name: "Business", desc: "Offers, revenue, operating rhythm.", accent: "#34d399" },
  { name: "Creator", desc: "Frameworks, pipelines, release packets.", accent: "#fbbf24" },
  { name: "Wealth", desc: "Thesis, ledgers, asymmetric tracking.", accent: "#fb7185" },
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ */
/* Shared building blocks                                              */
/* ------------------------------------------------------------------ */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-violet-300/90">
      {children}
    </p>
  );
}

function SectionHeading({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <motion.div
      className="mx-auto max-w-2xl text-center"
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-balance text-3xl font-semibold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {desc && (
        <p className="mt-5 text-pretty text-[15px] leading-7 text-slate-400">
          {desc}
        </p>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero() {
  const scope = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-hero-reveal]",
        { y: 42, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          stagger: 0.12,
          ease: "power4.out",
          delay: 0.15,
        },
      );
      gsap.to("[data-hero-fade]", {
        opacity: 0,
        y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: scope.current,
          start: "top top",
          end: "85% top",
          scrub: true,
        },
      });
    }, scope);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={scope}
      className="relative flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center px-5 text-center"
    >
      {/* Legibility scrim over the 3D core */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[64rem] max-w-[100vw] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(6,6,9,0.78)_0%,rgba(6,6,9,0.35)_45%,transparent_72%)]"
        aria-hidden="true"
      />

      <div data-hero-fade className="relative flex max-w-4xl flex-col items-center">
        <div data-hero-reveal className="glass-panel inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2">
          <Sparkles size={13} className="text-violet-300" aria-hidden="true" />
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-slate-300">
            SIP v1.1.1 · Substrate v8.3
          </span>
        </div>

        <h1
          data-hero-reveal
          className="mt-7 text-balance text-[2.6rem] font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          One shared brain for your{" "}
          <span className="bg-gradient-to-r from-violet-300 via-cyan-200 to-amber-200 bg-clip-text text-transparent">
            entire AI fleet
          </span>
        </h1>

        <p
          data-hero-reveal
          className="mt-6 max-w-xl text-pretty text-base leading-8 text-slate-400 sm:text-lg"
        >
          Persistent memory. Attested knowledge. Sovereign control. Every agent
          in every tool reads from the same six semantic vaults — with full
          provenance.
        </p>

        <div
          data-hero-reveal
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link
            href="/download"
            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#060609] transition-std hover:bg-violet-100 hover:shadow-[0_0_40px_rgba(167,139,250,0.35)]"
          >
            Download starter
            <ArrowRight
              size={15}
              className="transition-micro group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
          <a
            href="https://github.com/frankxai/Starlight-Intelligence-System"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-panel inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white transition-std hover:border-white/[0.18] hover:bg-white/[0.06]"
          >
            View on GitHub
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        data-hero-fade
        className="absolute bottom-8 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        aria-hidden="true"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
          Scroll
        </span>
        <motion.span
          className="block h-9 w-px bg-gradient-to-b from-violet-400/70 to-transparent"
          animate={reduced ? undefined : { scaleY: [0.3, 1, 0.3] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "top" }}
        />
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Substrate pillars                                                   */
/* ------------------------------------------------------------------ */

function SubstrateSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-28 sm:px-6 md:py-36">
      <SectionHeading
        eyebrow="The Substrate"
        title="Built for agents that need proof, not another forgetful chat surface."
        desc="Starlight is a working control plane: memory in, governance over the run, evidence out — and a path back to the exact source state."
      />

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {PILLARS.map((pillar, i) => {
          const Icon = pillar.icon;
          return (
            <motion.div
              key={pillar.n}
              className="glass-panel group relative overflow-hidden rounded-2xl p-7"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12%" }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: EASE }}
            >
              <div
                className="pointer-events-none absolute -top-16 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full opacity-0 blur-3xl transition-dramatic group-hover:opacity-25"
                style={{ background: pillar.accent }}
                aria-hidden="true"
              />
              <div className="flex items-center justify-between">
                <Icon size={21} style={{ color: pillar.accent }} aria-hidden="true" />
                <span className="font-mono text-xs text-slate-600">{pillar.n}</span>
              </div>
              <h3 className="mt-8 text-lg font-semibold text-white">
                {pillar.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                {pillar.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Operating loop                                                      */
/* ------------------------------------------------------------------ */

function LoopSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-28 sm:px-6 md:py-36">
      <SectionHeading
        eyebrow="Operating Loop"
        title="Every serious run becomes durable intelligence."
      />

      <div className="relative mt-16">
        {/* Connecting wire */}
        <motion.div
          className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-violet-400/60 via-cyan-300/40 to-amber-300/40 lg:left-0 lg:top-4 lg:h-px lg:w-full lg:bg-gradient-to-r"
          initial={{ scaleY: 0, scaleX: 0 }}
          whileInView={{ scaleY: 1, scaleX: 1 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1.4, ease: EASE }}
          style={{ transformOrigin: "left top" }}
          aria-hidden="true"
        />
        <ol className="grid gap-10 pl-12 lg:grid-cols-5 lg:gap-4 lg:pl-0 lg:pt-12">
          {LOOP_STEPS.map((step, i) => (
            <motion.li
              key={step.title}
              className="relative"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12%" }}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.12, ease: EASE }}
            >
              <span
                className="absolute -left-12 top-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-violet-300/40 bg-[#0b0b12] font-mono text-[11px] text-violet-200 shadow-[0_0_18px_rgba(167,139,250,0.25)] lg:-top-12 lg:left-0"
                aria-hidden="true"
              >
                0{i + 1}
              </span>
              <h3 className="text-[15px] font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-slate-400">
                {step.desc}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Vaults                                                              */
/* ------------------------------------------------------------------ */

function VaultsSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-28 sm:px-6 md:py-36">
      <SectionHeading
        eyebrow="Six Semantic Vaults"
        title="One memory surface, six domains of intelligence."
        desc="Agents read the same substrate and still specialize — by domain, tool, or decision context."
      />

      <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {VAULTS.map((vault, i) => (
          <motion.div
            key={vault.name}
            className="glass-panel flex items-start gap-4 rounded-xl p-5 transition-std hover:border-white/[0.15]"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.55, delay: i * 0.07, ease: EASE }}
          >
            <span
              className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ background: vault.accent, boxShadow: `0 0 10px ${vault.accent}` }}
              aria-hidden="true"
            />
            <div>
              <h3 className="text-[15px] font-semibold text-white">{vault.name}</h3>
              <p className="mt-1.5 text-[13px] leading-6 text-slate-400">
                {vault.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-10 flex justify-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Link
          href="/vaults"
          className="glass-panel inline-flex min-h-11 items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-std hover:border-white/[0.18] hover:bg-white/[0.06]"
        >
          Explore public vaults
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Ecosystem                                                           */
/* ------------------------------------------------------------------ */

function EcosystemSection() {
  const scope = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-deep-field]",
        { yPercent: -12, scale: 1.12 },
        {
          yPercent: 12,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: scope.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }, scope);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={scope} className="relative overflow-hidden py-28 md:py-40">
      {/* JWST-style deep field backdrop with parallax */}
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          data-deep-field
          src="/images/home/deep-field.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060609] via-[#060609]/55 to-[#060609]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          eyebrow="The Constellation"
          title="An ecosystem wired around one substrate."
          desc="Roughly fifteen repositories orbit the Starlight hub — execution layers, creative universes, and satellites that all read the same attested memory."
        />

        <div className="mt-16">
          <EcosystemConstellation />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Final CTA                                                           */
/* ------------------------------------------------------------------ */

function CtaSection() {
  return (
    <section className="relative mx-auto max-w-4xl px-5 pb-32 pt-16 sm:px-6 md:pb-40">
      <motion.div
        className="glass-panel relative overflow-hidden rounded-3xl p-8 text-center sm:p-14"
        initial={{ opacity: 0, y: 34 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12%" }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-violet-500/15 blur-3xl"
          aria-hidden="true"
        />
        <Eyebrow>60-second start</Eyebrow>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Give every agent the same memory.
        </h2>

        <div className="mx-auto mt-8 max-w-xl rounded-xl border border-white/[0.1] bg-[#08080e]/90 p-4 text-left">
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
            <Terminal size={13} className="text-slate-500" aria-hidden="true" />
            <span className="font-mono text-[11px] text-slate-500">terminal</span>
          </div>
          <code className="mt-3 block overflow-x-auto whitespace-nowrap font-mono text-[13px] leading-7 text-cyan-200">
            <span className="text-slate-600">$ </span>
            npx -p @arcanea/starlight-intelligence-system starlight init --vaults
          </code>
        </div>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/quickstart"
            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#060609] transition-std hover:bg-violet-100 hover:shadow-[0_0_40px_rgba(167,139,250,0.35)]"
          >
            Quickstart
            <ArrowRight
              size={15}
              className="transition-micro group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/protocol"
            className="glass-panel inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white transition-std hover:border-white/[0.18] hover:bg-white/[0.06]"
          >
            <LockKeyhole size={14} aria-hidden="true" />
            Read the protocol
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Experience shell                                                    */
/* ------------------------------------------------------------------ */

export function HomeExperience() {
  const progressRef = useRef(0);
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll();

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressRef.current = v;
  });

  // Dim the cosmic stage once the narrative sections take over.
  const stageDim = useTransform(
    scrollYProgress,
    [0, 0.14, 0.5, 0.85, 0.97],
    [0, 0.55, 0.68, 0.72, 0.96],
  );

  return (
    <div className="relative bg-[#060609]">
      {/* Fixed cosmic stage — 3D core + nebula ambience */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <Image
          src="/images/home/nebula-veil.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <StarlightCoreScene progressRef={progressRef} reducedMotion={reduced} />
        <motion.div
          className="absolute inset-0 bg-[#060609]"
          style={{ opacity: stageDim }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#060609] to-transparent" />
      </div>

      {/* Scrolling narrative */}
      <div className="relative z-10">
        <Hero />
        <SubstrateSection />
        <LoopSection />
        <VaultsSection />
        <EcosystemSection />
        <CtaSection />
      </div>
    </div>
  );
}
