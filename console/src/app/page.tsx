import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/* Ambient mesh */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="animate-mesh-1 absolute -left-32 top-10 h-[480px] w-[480px] rounded-full bg-violet-600/[0.08] blur-[110px]" />
        <div className="animate-mesh-2 absolute right-0 top-40 h-[360px] w-[360px] rounded-full bg-cyan-500/[0.06] blur-[90px]" />
        <div className="animate-mesh-3 absolute left-1/3 bottom-0 h-[280px] w-[280px] rounded-full bg-fuchsia-500/[0.05] blur-[70px]" />
      </div>

      <main className="relative mx-auto flex min-h-dvh max-w-4xl flex-col justify-between px-6 py-16 md:py-24">
        {/* Top — text panel */}
        <section>
          <div className="flex items-center gap-2 text-[12px] text-violet-400/80">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400 animate-glow-pulse" />
            v0.1 — local-first preview
          </div>

          <h1 className="mt-5 max-w-2xl text-[clamp(2rem,5.5vw,3.5rem)] font-bold leading-[1.05] tracking-tight text-white">
            Starlight Console
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Substrate Visualization.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-[16px] leading-[1.7] text-slate-400">
            Six vaults, ten verticals, one core. Navigate the substrate as a
            2D force-graph (default — legible, working view) or as a 3D scene
            (signature view, one click away). One data layer. Two render forms.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/substrate"
              className="group rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#050509] transition-std hover:shadow-[0_0_30px_rgba(167,139,250,0.25)]"
            >
              Enter substrate
              <span className="ml-1 inline-block transition-micro group-hover:translate-x-0.5">
                &rarr;
              </span>
            </Link>
            <Link
              href="/substrate?view=3d"
              className="rounded-full border border-white/[0.1] bg-black/30 px-5 py-3 text-[13px] font-medium text-slate-300 backdrop-blur-md transition-micro hover:border-white/[0.25] hover:text-white"
            >
              or open 3D scene
            </Link>
          </div>
        </section>

        {/* Phase 2 — honest roadmap */}
        <section className="mt-16">
          <div className="rounded-2xl border border-white/[0.06] bg-black/30 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-amber-400/80">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 animate-glow-pulse" />
              Phase 2 — coming soon
            </div>
            <h2 className="mt-3 text-[20px] font-semibold text-white">
              Agent harness — real LLM responses, no pre-cached fakes.
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-[1.7] text-slate-400">
              v0.1 ships the data layer + dual-view substrate visualization.
              The agent harness (Phase 2) ships when it can call live LLMs
              honestly — never as pre-cached responses pretending to be real.
              Until then, every node you see is data, not theatre.
            </p>
          </div>
        </section>

        {/* Bottom — protocol link */}
        <footer className="mt-16 border-t border-white/[0.06] pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[12px] text-slate-500">
            <span className="flex items-center gap-3 font-mono uppercase tracking-widest">
              starlight console v0.1
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-black/30 px-2.5 py-1 normal-case tracking-normal backdrop-blur-sm">
                <kbd className="text-[11px] text-slate-300">⌘K</kbd>
                <span className="text-[11px] text-slate-500">jump to node</span>
              </span>
            </span>
            <a
              href="https://starlightintelligence.org/protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-micro hover:text-white"
            >
              canonical protocol &rarr; starlightintelligence.org/protocol
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
