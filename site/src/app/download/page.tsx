import type { Metadata } from "next";
import Link from "next/link";
import { BrainHero } from "@/components/BrainHero";
import {
  SIP_STARTER_ASSET_BASE,
  SIP_STARTER_DOWNLOADS,
  SIP_STARTER_INCLUDED,
  SIP_STARTER_MODULE_NAME,
  SIP_STARTER_RELEASE_URL,
  SIP_STARTER_TAG,
} from "@/lib/sip-download";

export const metadata: Metadata = {
  title: "Download",
  description:
    "Download the open-core Starlight SIP Starter: a portable intelligence system module with SIP files, public vault seeds, release manifest, checksums, and validation guidance.",
  openGraph: {
    title: "Download — Starlight Intelligence",
    description:
      "Open-core SIP Starter release package for adopting Starlight Intelligence Protocol in any repo or workspace.",
    type: "article",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Starlight Intelligence — Download",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Download — Starlight Intelligence",
    description:
      "Download the open-core SIP Starter with checksums and validation guidance.",
    images: ["/opengraph-image"],
  },
};

export default function DownloadPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <BrainHero
          className="pointer-events-none absolute right-[-80px] top-8 hidden h-[440px] w-[440px] opacity-40 lg:block"
        />
        <div className="relative mx-auto grid max-w-5xl gap-10 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-violet-400">
              Open-core intelligence module
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl">
              Download the SIP Starter.
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.8] text-slate-400">
              A portable Starlight Intelligence Protocol starter for any repo
              or workspace. Start with the sovereign file contract, public
              vault seeds, release manifest, checksums, and validation guide.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`${SIP_STARTER_ASSET_BASE}/${SIP_STARTER_MODULE_NAME}.zip`}
                className="rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-[#060609] transition-std hover:shadow-[0_0_30px_rgba(167,139,250,0.2)]"
              >
                Download ZIP
              </a>
              <a
                href={SIP_STARTER_RELEASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/[0.12] px-6 py-3 text-[14px] font-medium text-white transition-std hover:border-white/[0.24] hover:bg-white/[0.04]"
              >
                GitHub Release
              </a>
            </div>
          </div>

          <div className="self-end rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
              Latest
            </p>
            <p className="mt-2 font-mono text-[22px] font-semibold text-white">
              {SIP_STARTER_MODULE_NAME}
            </p>
            <dl className="mt-5 grid gap-3 text-[12px]">
              <Row label="Conformance" value="SIP Core" />
              <Row label="Version" value={SIP_STARTER_TAG} />
              <Row label="License" value="MIT" />
              <Row label="Canonical host" value="GitHub Releases" />
            </dl>
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.08] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
                Release assets
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                Download from the source of truth.
              </h2>
            </div>
            <Link
              href="/download/latest.json"
              className="text-[13px] text-violet-300 transition-std hover:text-violet-200"
            >
              Machine-readable latest.json &rarr;
            </Link>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {SIP_STARTER_DOWNLOADS.map((download) => (
              <a
                key={download.filename}
                href={download.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-white/[0.08] bg-[#0c0c12] p-5 transition-std hover:border-violet-400/[0.35] hover:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[13px] font-semibold text-white">
                    {download.label}
                  </p>
                  <span className="text-[13px] text-violet-300 transition-micro group-hover:translate-x-0.5">
                    &rarr;
                  </span>
                </div>
                <code className="mt-3 block break-all font-mono text-[12px] text-slate-400">
                  {download.filename}
                </code>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.08] px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
              Install
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Start with files. Upgrade when ready.
            </h2>
            <p className="mt-4 text-[14px] leading-[1.8] text-slate-400">
              The starter is not the whole runtime. It gives teams the portable
              SIP contract first: memory, agents, canon, stack, attestation,
              and public vault seeds.
            </p>
          </div>
          <Terminal>
            <span className="text-emerald-400">$</span>{" "}
            <span className="text-slate-400">curl -LO</span>{" "}
            <span className="text-violet-300">
              {`${SIP_STARTER_ASSET_BASE}/${SIP_STARTER_MODULE_NAME}.tar.gz`}
            </span>
            {"\n"}
            <span className="text-emerald-400">$</span>{" "}
            <span className="text-slate-400">tar -xzf</span>{" "}
            <span className="text-violet-300">{`${SIP_STARTER_MODULE_NAME}.tar.gz`}</span>
            {"\n"}
            <span className="text-emerald-400">$</span>{" "}
            <span className="text-slate-400">sh</span>{" "}
            <span className="text-violet-300">
              {`${SIP_STARTER_MODULE_NAME}/install.sh`}
            </span>{" "}
            <span className="text-slate-400">/path/to/your/repo</span>
          </Terminal>
        </div>
      </section>

      <section className="border-b border-white/[0.08] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
            Package contents
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Everything needed for a clean SIP Core start.
          </h2>
          <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {SIP_STARTER_INCLUDED.map((item) => (
              <div
                key={item}
                className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-4 py-3"
              >
                <code className="font-mono text-[12px] text-slate-300">
                  {item}
                </code>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          <ValidationStep
            n="01"
            title="Verify checksums"
            body="Download the SHA256 file and compare it against the archive before unpacking."
          />
          <ValidationStep
            n="02"
            title="Read the manifest"
            body="Use release-manifest.json and starlight-module.json to confirm version, conformance, and included files."
          />
          <ValidationStep
            n="03"
            title="Move into runtime"
            body="When the file contract is working, install the full Starlight MCP runtime through npm."
          />
        </div>
        <div className="mx-auto mt-12 max-w-5xl rounded-xl border border-violet-500/[0.18] bg-violet-500/[0.05] p-6">
          <p className="text-[13px] leading-relaxed text-slate-300">
            Core downloads stay ungated. FrankX can offer operator guides,
            implementation reviews, and premium excellence bundles around this
            open protocol without blocking adoption.
          </p>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-white/[0.06] pt-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-mono text-slate-300">{value}</dd>
    </div>
  );
}

function Terminal({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c12]">
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/[0.06]" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/[0.06]" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/[0.06]" />
        <code className="ml-3 font-mono text-[11px] text-slate-500">
          terminal
        </code>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-[1.8] text-slate-300">
        {children}
      </pre>
    </div>
  );
}

function ValidationStep({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
      <p className="font-mono text-[11px] text-violet-300">{n}</p>
      <h3 className="mt-3 text-[16px] font-semibold text-white">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{body}</p>
    </div>
  );
}
