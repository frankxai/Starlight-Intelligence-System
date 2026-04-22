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
            Six vaults orbit a luminous core. Ten verticals trace the outer ring.
            This is the Starlight substrate as a navigable 3D space — the first
            slice of v8. Future revisions add agent harness, live vault streams,
            and a canonical archetype layer.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/substrate"
              className="group rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#050509] transition-std hover:shadow-[0_0_30px_rgba(167,139,250,0.25)]"
            >
              Click to enter substrate
              <span className="ml-1 inline-block transition-micro group-hover:translate-x-0.5">
                &rarr;
              </span>
            </Link>
            <span className="text-[12px] text-slate-600">
              orbit · zoom · pan
            </span>
          </div>
        </section>

        {/* Bottom — protocol link */}
        <footer className="mt-16 border-t border-white/[0.06] pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[12px] text-slate-500">
            <span className="font-mono uppercase tracking-widest">
              starlight console v0.1
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
