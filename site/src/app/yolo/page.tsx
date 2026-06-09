import type { Metadata } from "next";
import Link from "next/link";
import { ACCENT_TEXT, ACCENT_BORDER } from "@/lib/accents";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "/yolo Hive",
  description:
    "The Claude-led cross-repo conductor command. Session-mode top-tier slash command. Parallel council scan + Prime synthesis + aggressive autonomy gated by subagent QA + /starlight-board on substrate touch.",
  openGraph: {
    title: "/yolo Hive — Starlight Intelligence",
    description:
      "Session-mode top-tier command. Claude leads, you ship. 7 council agents scan, Prime synthesizes, you pick, conductor drives. Gated by board + QA.",
    type: "article",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "/yolo Hive — Starlight Intelligence" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "/yolo Hive — Starlight Intelligence",
    description:
      "Session-mode top-tier command for cross-repo conductor work. Claude leads.",
    images: ["/opengraph-image"],
  },
};

type Phase = {
  step: string;
  desc: string;
  accent: "violet" | "cyan" | "fuchsia" | "emerald";
};

const SESSION_PHASES: Phase[] = [
  {
    step: "open",
    desc: "Load yolo-scope.json. Apply phase-in lockout. Read prior session drift. Increment session counter.",
    accent: "violet",
  },
  {
    step: "scan",
    desc: "Parallel single-message dispatch to 7 council agents. Each runs yolo-scan through its domain lens against active repos.",
    accent: "cyan",
  },
  {
    step: "synthesize",
    desc: "Prime dedupes overlapping moves across council packets. Ranks by leverage × activity × alignment / (blast × effort). Returns top 3–5.",
    accent: "fuchsia",
  },
  {
    step: "execute",
    desc: "You pick. Conductor dispatches council-of-relevance. Subagent QA gates. Auto-/starlight-board on substrate touch with sovereign re-ack.",
    accent: "emerald",
  },
];

type Gate = {
  name: string;
  rule: string;
};

const GATES: Gate[] = [
  {
    name: "Subagent QA",
    rule: "pr-review-toolkit:code-reviewer + silent-failure-hunter run pre-merge. Critical findings block.",
  },
  {
    name: "Substrate gate",
    rule: "Touches SIP / SIS / VOICES / VERTICALS / ALLIANCE / STACK / agents/skills/commands? Auto-invoke /starlight-board.",
  },
  {
    name: "Sovereign re-ack",
    rule: "Even on board PROCEED, substrate-class merges require fresh explicit Frank-ack. Session-grant does not propagate.",
  },
  {
    name: "Phase-in lockout",
    rule: "Sessions 1–3 scope-locked to one repo (yolo-scope.json::phase_in_repo). Session 4 unlock requires Phase-In Review pass.",
  },
  {
    name: "Verification before completion",
    rule: "Every ship action captures concrete evidence: test output, CI response, deploy probe HTTP 200. No 'I think it shipped.'",
  },
  {
    name: "Alliance hard-refuse",
    rule: "Repos flagged alliance_touched: true are excluded from yolo-scope entirely. No override.",
  },
];

type Tripwire = {
  trigger: string;
  response: "ASK" | "REFUSE";
};

const TRIPWIRES: Tripwire[] = [
  { trigger: "Spend > $20/session cumulative", response: "ASK" },
  { trigger: "Spend > $5/action", response: "ASK" },
  { trigger: "Force-push any branch", response: "ASK" },
  { trigger: "Force-push main", response: "REFUSE" },
  { trigger: "rm -rf any path", response: "ASK" },
  { trigger: "Drop DB / destructive DB op", response: "REFUSE" },
  { trigger: "Secret rotation", response: "ASK" },
  { trigger: "Touch alliance/3rd-party repo", response: "REFUSE" },
  { trigger: "Web3 mainnet send", response: "REFUSE" },
];

export default function YoloPage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="animate-mesh-1 absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-violet-600/[0.07] blur-[100px]" />
          <div className="animate-mesh-2 absolute right-0 top-20 h-[320px] w-[320px] rounded-full bg-cyan-500/[0.05] blur-[80px]" />
          <div className="animate-mesh-3 absolute left-1/2 bottom-0 h-[260px] w-[260px] rounded-full bg-emerald-500/[0.04] blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 py-20 md:py-28">
          <p className="text-[11px] font-medium uppercase tracking-widest text-violet-400">
            Top-tier session-mode command
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-5xl">
            /yolo
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Hive conductor for cross-repo work.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-[1.8] text-slate-400">
            You type <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-violet-300">/yolo</code>{" "}
            once. Seven council agents scan your sovereign repos in parallel. Prime synthesizes 3–5 ranked moves. You pick one. The
            conductor drives it end-to-end — commits, PRs, merges, deploys — gated by subagent QA, automatic{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-cyan-300">/starlight-board</code> on substrate
            touch, and a sovereign re-ack on substrate merges (Board REVISE-1).
          </p>
          <p className="mt-4 max-w-xl text-[13px] leading-[1.7] text-slate-500">
            Shipped 2026-05-11 under Approach C (Hive). Substrate-tier. Phase-in locked to single repo for sessions 1–3. See{" "}
            <Link
              href="https://github.com/frankxai/Starlight-Intelligence-System/blob/main/docs/superpowers/specs/2026-05-11-yolo-hive-design.md"
              className="text-violet-300 underline-offset-2 hover:underline"
            >
              design spec
            </Link>{" "}
            and{" "}
            <Link
              href="https://github.com/frankxai/Starlight-Intelligence-System/blob/main/docs/superpowers/plans/2026-05-11-yolo-hive-w1.md"
              className="text-violet-300 underline-offset-2 hover:underline"
            >
              W1 plan
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ── Session phases ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Session lifecycle
          </h2>
          <p className="mt-3 max-w-md text-xl font-semibold text-white">
            Open → scan → synthesize → execute → loop or exit.
          </p>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] sm:grid-cols-2 lg:grid-cols-4">
            {SESSION_PHASES.map((p) => (
              <div key={p.step} className="bg-[#0c0c12] p-6">
                <p className={`font-mono text-[11px] uppercase tracking-widest ${ACCENT_TEXT[p.accent]}`}>
                  {p.step}
                </p>
                <p className="mt-3 text-[14px] leading-[1.7] text-slate-400">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Structural gates ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Gates (structural, non-negotiable)
          </h2>
          <p className="mt-3 max-w-xl text-xl font-semibold text-white">
            Aggressive autonomy works because the gates are real.
          </p>
          <div className="mt-10 space-y-4">
            {GATES.map((g) => (
              <div
                key={g.name}
                className={`rounded-xl border ${ACCENT_BORDER.violet} bg-[#0c0c12] p-6`}
              >
                <p className="font-mono text-[11px] uppercase tracking-widest text-violet-300">
                  {g.name}
                </p>
                <p className="mt-2 text-[14px] leading-[1.7] text-slate-300">{g.rule}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tripwires ── */}
      <section className="border-b border-white/[0.08] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Tripwires
          </h2>
          <p className="mt-3 max-w-md text-xl font-semibold text-white">
            What pauses the conductor.
          </p>
          <div className="mt-10 overflow-hidden rounded-2xl border border-white/[0.08]">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-white/[0.04]">
                <tr>
                  <th className="px-6 py-3 font-mono text-[11px] uppercase tracking-widest text-slate-400">
                    Trigger
                  </th>
                  <th className="px-6 py-3 font-mono text-[11px] uppercase tracking-widest text-slate-400">
                    Response
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {TRIPWIRES.map((t) => (
                  <tr key={t.trigger} className="bg-[#0c0c12]">
                    <td className="px-6 py-3 text-slate-300">{t.trigger}</td>
                    <td className="px-6 py-3">
                      <span
                        className={
                          t.response === "REFUSE"
                            ? "rounded bg-red-500/10 px-2 py-0.5 font-mono text-[11px] uppercase tracking-widest text-red-300"
                            : "rounded bg-amber-500/10 px-2 py-0.5 font-mono text-[11px] uppercase tracking-widest text-amber-300"
                        }
                      >
                        {t.response}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Architecture link ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Architecture
          </h2>
          <p className="mt-3 text-xl font-semibold text-white">
            Hive (Approach C) — 0 new agents, 2 new skills, 3 new commands.
          </p>
          <p className="mt-4 text-[14px] leading-[1.7] text-slate-400">
            Conductor role lives on the existing <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px]">starlight-orchestrator</code>{" "}
            agent. Synthesizer role on <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px]">starlight-prime</code>. Council scan
            shared across all 7 council members via one parameterized{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px]">yolo-scan</code> skill (one skill, 7 invocation profiles).
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/architecture"
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-5 py-2.5 text-[14px] text-slate-300 hover:bg-white/[0.06]"
            >
              10-IS architecture
            </Link>
            <Link
              href="/cockpit"
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-5 py-2.5 text-[14px] text-slate-300 hover:bg-white/[0.06]"
            >
              Cockpit
            </Link>
            <Link
              href="https://github.com/frankxai/Starlight-Intelligence-System"
              className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-5 py-2.5 text-[14px] text-violet-200 hover:bg-violet-500/20"
            >
              Repo on GitHub
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
