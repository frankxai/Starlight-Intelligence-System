import type { Metadata } from "next";
import Link from "next/link";
import { ACCENT_TEXT, ACCENT_BORDER } from "@/lib/accents";
import { GalaxyField } from "@/components/cinematic/GalaxyField";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Cockpit",
  description:
    "The local 4-surface AI cockpit. Voice → tool execution → brain visualization. 100% local-first. Forkable.",
  openGraph: {
    title: "Cockpit — Starlight Intelligence",
    description:
      "Four surfaces. One brain. Voice loop with 7 tools, live 3D thought-graph, drafts on disk. Local-first.",
    type: "article",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Starlight Intelligence — Cockpit" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cockpit — Starlight Intelligence",
    description:
      "Four surfaces. One brain. Voice loop, brain viz, drafts on disk. Local-first.",
    images: ["/opengraph-image"],
  },
};

type Surface = {
  name: string;
  port: string;
  desc: string;
  accent: "violet" | "cyan" | "fuchsia" | "emerald";
};

const SURFACES: Surface[] = [
  {
    name: "Zellij terminal cockpit",
    port: "tty",
    desc: "Multi-pane operator surface. Worker logs, cognition tail, dispatch CLI in one screen.",
    accent: "violet",
  },
  {
    name: "PowerShell launcher",
    port: "shell",
    desc: "Windows-native start-cockpit.ps1 boots the brain watchdog, voice operator, and dashboard at logon.",
    accent: "cyan",
  },
  {
    name: "LCC Dashboard",
    port: ":3007",
    desc: "Live 3D thought-graph, dispatch panel, packet inspector, brain event halos. Next.js 16 + React 19.",
    accent: "fuchsia",
  },
  {
    name: "Phone PWA",
    port: ":3008",
    desc: "Voice in, voice out, from anywhere on the LAN. Same 7-tool execution loop as the desktop orb.",
    accent: "emerald",
  },
];

type Tool = {
  name: string;
  desc: string;
};

const TOOLS: Tool[] = [
  {
    name: "shell",
    desc: "Run a command in the operator's shell (audited, optional dry-run).",
  },
  { name: "file_write", desc: "Write a draft to ~/Desktop/jarvis-drafts/." },
  {
    name: "claude_prompt",
    desc: "Synchronous one-shot to Claude with rich context envelope.",
  },
  {
    name: "claude_code_launch",
    desc: "Spawn Claude Code in a project (auto-resolves shortcut map).",
  },
  { name: "open_url", desc: "Open URL in the default browser." },
  {
    name: "linear_issue",
    desc: "Create a Linear issue with team + priority routing.",
  },
  {
    name: "workflow_run",
    desc: "Fire one of 13 named YAML workflows (morning brief, evening handover, etc.).",
  },
];

export default function CockpitPage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <GalaxyField still="nursery" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 md:py-28">
          <p className="text-[11px] font-medium uppercase tracking-widest text-violet-400">
            Local cockpit
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-5xl">
            Four surfaces.
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              One brain. Local-first.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-[1.8] text-slate-400">
            The operator side of Starlight. A four-surface cockpit you run on
            your own machine — voice in, tool execution, live 3D thought-graph,
            drafts on disk. No cloud lock-in. Inference goes to Groq +
            ElevenLabs over HTTPS; everything else stays local.
          </p>
        </div>
      </section>

      {/* ── 4 Surfaces ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            The four surfaces
          </h2>
          <p className="mt-3 max-w-md text-xl font-semibold text-white">
            Each one is independently useful. Together they&apos;re a loop.
          </p>

          {/* SVG schematic */}
          <div className="mt-10 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c12]">
            <div className="border-b border-white/[0.08] px-4 py-3">
              <code className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                local-cockpit · schematic
              </code>
            </div>
            <div className="grid gap-px bg-white/[0.04] sm:grid-cols-2 lg:grid-cols-4">
              {SURFACES.map((s) => (
                <SurfaceCell key={s.name} surface={s} />
              ))}
            </div>
          </div>

          <p className="mt-6 text-[13px] leading-relaxed text-slate-400">
            All four surfaces share a single FastAPI router on{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-violet-300">
              :7373
            </code>
            . Same orchestrator, same packet log, same brain event bus.
          </p>
        </div>
      </section>

      {/* ── Voice loop ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Voice loop
          </h2>
          <p className="mt-3 text-xl font-semibold text-white">
            STT → LLM + 7 tools → TTS. Sub-second to first token.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
            <Stage
              n="01"
              label="STT"
              detail="Groq Whisper · ~400-800ms"
              accent="violet"
            />
            <Arrow />
            <Stage
              n="02"
              label="LLM"
              detail="Claude / Llama-4 · 600ms first token"
              accent="cyan"
            />
            <Arrow />
            <Stage
              n="03"
              label="TTS"
              detail="ElevenLabs Brian Flash · 75-1200ms"
              accent="fuchsia"
            />
          </div>

          <div className="mt-12">
            <p className="text-[11px] uppercase tracking-widest text-slate-400">
              Seven tools the loop can call
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {TOOLS.map((t) => (
                <div
                  key={t.name}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-std hover:border-white/[0.12] hover:bg-white/[0.04]"
                >
                  <code className="font-mono text-[12px] text-violet-300">
                    {t.name}
                  </code>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-slate-400">
                    {t.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Brain viz ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Brain viz
          </h2>
          <p className="mt-3 text-xl font-semibold text-white">
            Live 3D thought-graph. Halos fire on real dispatches.
          </p>
          <p className="mt-5 text-[15px] leading-[1.85] text-slate-400">
            The dashboard at{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-violet-300">
              :3007/brain
            </code>{" "}
            is not a passive snapshot. Every dispatch publishes a 4-event
            lifecycle —{" "}
            <span className="text-violet-300">retrieve.start</span> →{" "}
            <span className="text-violet-300">retrieve.topk</span> →{" "}
            <span className="text-cyan-300">synthesis.complete</span> /{" "}
            <span className="text-rose-300">error</span>. Matched nodes glow
            purple, then pulse teal when the response lands. Click any routing
            decision to inspect the full packet.
          </p>

          <ul className="mt-8 space-y-3 pl-6 text-[14px] leading-relaxed text-slate-400">
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              25+ nodes / instanced mesh ≤10K · AdaptiveDpr · time-warp scrubber
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              Per-trace halo correlation — synthesis pulses only matching
              retrieve nodes
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              Cluster labels by intent · brand filter · regen on-demand
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              Hard contract: publisher failure NEVER breaks dispatch
            </li>
          </ul>
        </div>
      </section>

      {/* ── Drafts on disk ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Drafts on disk
          </h2>
          <p className="mt-3 text-xl font-semibold text-white">
            Every file Jarvis writes lands where you can grep it.
          </p>
          <p className="mt-5 text-[15px] leading-[1.85] text-slate-400">
            The{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-violet-300">
              file_write
            </code>{" "}
            tool ships drafts to{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-violet-300">
              ~/Desktop/jarvis-drafts/
            </code>{" "}
            — visible the second they exist, owned by you, version-controllable
            on your terms. The dashboard tail-polls the directory and surfaces
            new drafts inline. No proprietary store.
          </p>
        </div>
      </section>

      {/* ── Privacy ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Privacy posture
          </h2>
          <p className="mt-3 text-xl font-semibold text-white">
            100% local. Inference over HTTPS. No cloud storage.
          </p>
          <ul className="mt-6 space-y-3 pl-6 text-[14px] leading-relaxed text-slate-400">
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              All four surfaces bind to{" "}
              <code className="font-mono text-[12px] text-violet-300">
                127.0.0.1
              </code>{" "}
              by default. LAN exposure is opt-in for the Phone PWA.
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              Groq (STT + LLM) and ElevenLabs (TTS) receive request audio /
              text only. No conversation history persisted to their account.
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              Packet log lives at{" "}
              <code className="font-mono text-[12px] text-violet-300">
                logs/packets/&lt;date&gt;/&lt;id&gt;.json
              </code>{" "}
              on your disk. Audit trail is yours.
            </li>
            <li className="relative before:absolute before:-left-5 before:top-[0.9em] before:h-px before:w-3 before:bg-violet-400/40">
              Privacy gate event kind exists in the brain bus but never
              triggers visual halos — sensitive dispatches stay HUD-only.
            </li>
          </ul>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[15px] leading-relaxed text-slate-400">
            The cockpit is reference, not product. Fork the repo, run it on
            your machine, make it yours.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="https://github.com/frankxai/Starlight-Intelligence-System"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#060609] transition-std hover:shadow-[0_0_30px_rgba(167,139,250,0.2)]"
            >
              Fork on GitHub &rarr;
            </a>
            <Link
              href="/quickstart"
              className="rounded-full border border-white/[0.1] px-6 py-3 text-[14px] font-medium text-white transition-std hover:border-white/[0.2] hover:bg-white/[0.04]"
            >
              Read the quickstart
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SurfaceCell({ surface }: { surface: Surface }) {
  return (
    <div className="bg-[#0c0c12] p-5">
      <div className="flex items-center justify-between">
        <p className={`text-[12px] font-semibold ${ACCENT_TEXT[surface.accent]}`}>
          {surface.name}
        </p>
        <code className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
          {surface.port}
        </code>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-slate-400">
        {surface.desc}
      </p>
    </div>
  );
}

function Stage({
  n,
  label,
  detail,
  accent,
}: {
  n: string;
  label: string;
  detail: string;
  accent: "violet" | "cyan" | "fuchsia";
}) {
  return (
    <div
      className={`flex-1 rounded-xl border ${ACCENT_BORDER[accent]} bg-white/[0.02] p-5 text-center`}
    >
      <p
        className={`font-mono text-[10px] uppercase tracking-widest ${ACCENT_TEXT[accent]}`}
      >
        {n} · {label}
      </p>
      <p className="mt-2 text-[12px] leading-relaxed text-slate-400">{detail}</p>
    </div>
  );
}

function Arrow() {
  return (
    <span
      className="hidden text-slate-700 sm:block"
      aria-hidden="true"
    >
      &rarr;
    </span>
  );
}
