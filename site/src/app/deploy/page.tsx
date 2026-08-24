import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleDot,
  Cloud,
  Code2,
  Database,
  GitBranch,
  LockKeyhole,
  Server,
} from "lucide-react";
import { GITHUB_URL } from "@/lib/nav";
import { DEPLOYMENT_CONTRACT, VERCEL_DEPLOY_URL } from "@/lib/deployment";

export const metadata: Metadata = {
  title: "Deploy Starlight Explorer",
  description:
    "Create your own public Starlight Explorer on Vercel while the sovereign intelligence runtime and private memory remain local.",
  openGraph: {
    title: "Deploy Starlight Explorer — Starlight Intelligence",
    description:
      "One repository clone, one Vercel project, and a precise boundary between the public Explorer and your local intelligence runtime.",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Deploy Starlight Explorer",
      },
    ],
  },
};

const trace = [
  { label: "Source", value: "frankxai/Starlight-Intelligence-System", icon: GitBranch },
  { label: "Build root", value: "site/", icon: Code2 },
  { label: "Runtime", value: "Next.js on Vercel", icon: Cloud },
] as const;

export default function DeployPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#060609] text-slate-100">
      <section className="relative border-b border-white/[0.06] px-6 pb-20 pt-20 md:pb-28 md:pt-28">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(124,58,237,0.16),transparent_34%),radial-gradient(circle_at_20%_70%,rgba(34,211,238,0.08),transparent_30%)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-end gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-cyan-300">
                Public interface · sovereign boundary
              </p>
              <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-white md:text-7xl">
                Give Starlight a public home.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
                Vercel creates your hosted <strong className="font-medium text-white">Starlight Explorer</strong>.
                Your private memory, agent runtime, credentials, and orchestration stay in the environment you control.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href={VERCEL_DEPLOY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#060609] transition-micro hover:bg-cyan-50"
                >
                  Deploy Starlight Explorer
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/[0.14] px-6 py-3 text-sm font-medium text-white transition-micro hover:border-white/30 hover:bg-white/[0.05]"
                >
                  Inspect the source
                  <Code2 className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <LockKeyhole className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                Zero required environment variables. Vercel shows every setting before creation.
              </p>
            </div>

            <div className="relative border border-white/[0.10] bg-[#0b0b12]/80 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-7">
              <div className="mb-6 flex items-center justify-between border-b border-white/[0.07] pb-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">Deployment trace</p>
                  <p className="mt-1 text-sm font-medium text-white">One source. Explicit boundary.</p>
                </div>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-300">
                  <CircleDot className="h-3.5 w-3.5" aria-hidden="true" /> Ready
                </span>
              </div>
              <ol className="space-y-1" aria-label="Deployment trace">
                {trace.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.label} className="grid grid-cols-[2.5rem_1fr] gap-3">
                      <div className="flex flex-col items-center" aria-hidden="true">
                        <span className="flex h-9 w-9 items-center justify-center border border-cyan-300/20 bg-cyan-300/[0.05] text-cyan-200">
                          <Icon className="h-4 w-4" />
                        </span>
                        {index < trace.length - 1 && <span className="h-8 w-px bg-white/[0.10]" />}
                      </div>
                      <div className="pt-1.5">
                        <p className="text-xs text-slate-500">{item.label}</p>
                        <p className="mt-0.5 break-words font-mono text-xs text-slate-200">{item.value}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-6 border-t border-white/[0.07] pt-5">
                <div className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  <span>Result</span>
                  <span className="text-violet-300">your-project.vercel.app</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.06] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[0.68fr_1.32fr]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate-500">01 / The boundary</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Two layers. One informed action.
              </h2>
              <p className="mt-5 max-w-md leading-7 text-slate-400">
                The public Explorer communicates the protocol and exposes public artifacts. The sovereign runtime keeps the parts that carry identity, authority, and private context close to the operator.
              </p>
            </div>

            <div className="border-l border-white/[0.10]">
              <div className="grid gap-px bg-white/[0.08] md:grid-cols-2">
                <article className="bg-[#0a0a10] p-7 md:p-8">
                  <Cloud className="h-5 w-5 text-cyan-300" aria-hidden="true" />
                  <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300">Vercel creates</p>
                  <h3 className="mt-2 text-xl font-medium text-white">The public Explorer</h3>
                  <ul className="mt-6 space-y-4">
                    {DEPLOYMENT_CONTRACT.publicSurfaces.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>

                <article className="bg-[#0a0a10] p-7 md:p-8">
                  <Database className="h-5 w-5 text-violet-300" aria-hidden="true" />
                  <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-violet-300">Your environment retains</p>
                  <h3 className="mt-2 text-xl font-medium text-white">The sovereign runtime</h3>
                  <ul className="mt-6 space-y-4">
                    {DEPLOYMENT_CONTRACT.localOnly.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
                        <LockKeyhole className="mt-1 h-4 w-4 shrink-0 text-violet-300" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.06] bg-[#08080d] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate-500">02 / What happens</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                A transparent clone flow.
              </h2>
              <ol className="mt-9 space-y-7">
                {[
                  ["01", "Clone", `Vercel copies the public repository into your selected Git provider as “${DEPLOYMENT_CONTRACT.repositoryName}”.`],
                  ["02", "Configure", `The project name is prefilled as “${DEPLOYMENT_CONTRACT.projectName}” and the build root is fixed to ${DEPLOYMENT_CONTRACT.rootDirectory}/.`],
                  ["03", "Build", "Next.js compiles the public experience from inspectable source. No database, integration, or secret is requested."],
                  ["04", "Own", "Your Git repository becomes the source of future previews and production releases."],
                ].map(([number, title, body]) => (
                  <li key={number} className="grid grid-cols-[2.75rem_1fr] gap-4">
                    <span className="font-mono text-xs text-cyan-300">{number}</span>
                    <div>
                      <h3 className="font-medium text-white">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-400">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <aside className="self-start border border-white/[0.10] bg-[#060609] p-7 md:p-9" aria-labelledby="proof-heading">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300">After deploy</p>
                  <h2 id="proof-heading" className="mt-2 text-2xl font-semibold text-white">Verify the useful surfaces.</h2>
                </div>
                <Server className="h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
              </div>
              <div className="mt-7 divide-y divide-white/[0.07] border-y border-white/[0.07]">
                {DEPLOYMENT_CONTRACT.verificationRoutes.map((route) => (
                  <div key={route} className="flex min-h-12 items-center justify-between gap-4 py-3">
                    <code className="text-sm text-slate-200">{route}</code>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">public</span>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm leading-6 text-slate-400">
                Connect a custom domain when the project is ready. Git integration creates a preview for each change before production.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 border border-white/[0.10] bg-[linear-gradient(135deg,rgba(124,58,237,0.12),rgba(34,211,238,0.05)_55%,transparent)] p-8 md:grid-cols-[1fr_auto] md:items-end md:p-12">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-violet-300">03 / Create your copy</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Make the Explorer yours.
            </h2>
            <p className="mt-5 max-w-2xl leading-7 text-slate-300">
              Start with the working public system, inspect every line, then shape the routes, identity, and research surface around the intelligence you want to share.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <a
              href={VERCEL_DEPLOY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#060609] transition-micro hover:bg-cyan-50"
            >
              Deploy on Vercel
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link
              href="/quickstart"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/[0.14] px-6 py-3 text-sm font-medium text-white transition-micro hover:border-white/30 hover:bg-white/[0.05]"
            >
              Run the local system
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-8 flex max-w-6xl items-center gap-2 text-xs text-slate-500">
          <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
          Deployment contract v{DEPLOYMENT_CONTRACT.schemaVersion} · MIT source · Built on SIP
        </div>
      </section>
    </div>
  );
}
