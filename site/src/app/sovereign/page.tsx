import type { Metadata } from "next";
import Link from "next/link";
import { MerkleProofExplorer } from "@/components/sovereign/MerkleProofExplorer";

export const metadata: Metadata = {
  title: "Sovereign Substrate — Starlight Intelligence",
  description:
    "What the sovereign substrate in the open Starlight repository does today: append-only vaults on your disk, Merkle snapshot receipts, client-side envelope encryption and fail-closed gates. Remote anchoring and robotics are experimental and unproven.",
  alternates: { canonical: "/sovereign" },
};

export default function SovereignPage() {
  return (
    <main className="min-h-screen bg-[#060609] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/[0.06] py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-black to-black opacity-70 pointer-events-none" />
        <div className="mx-auto max-w-5xl px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1 text-xs font-mono text-violet-300 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-ping" />
            Built on SIP · Sovereign Substrate v8.3
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
            One Person. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-violet-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              One Attested Fleet.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed mb-10">
            The local-first layer under the agents one person runs: append-only vaults on your own disk,
            snapshot receipts you can check, and gates that fail closed. Open source under MIT.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="#interactive"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#060609] hover:bg-slate-200 transition-all shadow-lg shadow-white/10"
            >
              Check a proof in your browser
            </Link>
            <Link
              href="/protocol"
              className="rounded-full border border-white/20 bg-white/[0.04] px-6 py-3 text-sm font-medium text-white hover:bg-white/[0.08] transition-all"
            >
              Read the protocol
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Explorer Section */}
      <section id="interactive" className="py-20 border-b border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
              Check an inclusion proof
            </h2>
            <p className="text-sm text-slate-400">
              The hashing runs locally with Web Crypto. Nothing on this page is sent anywhere.
            </p>
          </div>

          <MerkleProofExplorer />
        </div>
      </section>

      {/* 4 Pillars Architecture */}
      <section className="py-20 border-b border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
              Four layers, and how far each one has been proven
            </h2>
            <p className="text-sm text-slate-400">
              Each card says what the open repository does today and what is still experimental.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pillar 1 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#090910] p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-mono font-bold">
                  01
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Storage and snapshot receipts</h3>
                  <span className="text-xs font-mono text-slate-400">Local first · remote anchors experimental</span>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Vaults are append-only JSONL files on your disk. A snapshot produces a deterministic SHA-256 Merkle
                root and a receipt you can re-verify against the items. Transports for Arweave (via Irys) and IPFS
                (via Pinata) are written, but no public anchor has been published; without provider keys they
                return a local receipt only.
              </p>
              <ul className="text-xs font-mono text-slate-400 space-y-2">
                <li className="flex items-center gap-2 text-violet-300">
                  <span>✓</span> Inclusion proofs in O(log N) hashes
                </li>
                <li className="flex items-center gap-2 text-violet-300">
                  <span>✓</span> Client-side AES-256-GCM envelope encryption
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <span>○</span> Remote anchoring: code and tests only
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#090910] p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-mono font-bold">
                  02
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Robotics continuity kernel</h3>
                  <span className="text-xs font-mono text-slate-400">Experimental · simulated actuators only</span>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                A research module that models hazard zones, velocity limits and heartbeat timeouts for actuators,
                and formats ROS2/Zenoh-style messages. It has been tested against simulated actuators and a mock
                Zenoh router. No physical robot has run it.
              </p>
              <ul className="text-xs font-mono text-slate-400 space-y-2">
                <li className="flex items-center gap-2 text-cyan-300">
                  <span>✓</span> Fail-closed stop in simulated hazard tests
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <span>○</span> Hardware: not tested
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#090910] p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono font-bold">
                  03
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Starlight Queen Autonomic Engine</h3>
                  <span className="text-xs font-mono text-slate-400">Single-Operator · Risk Tiers · Gates</span>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Handles what the single operator is not actively thinking about. Sweeps memory dreaming, validates
                code health, and queues prioritized actions with fail-closed human escalation gates for high-risk operations.
              </p>
              <ul className="text-xs font-mono text-slate-400 space-y-2">
                <li className="flex items-center gap-2 text-emerald-300">
                  <span>✓</span> Money & irreversible migrations strictly fail closed
                </li>
                <li className="flex items-center gap-2 text-emerald-300">
                  <span>✓</span> Operator liveness heartbeat monitoring
                </li>
              </ul>
            </div>

            {/* Pillar 4 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#090910] p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-mono font-bold">
                  04
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Sovereign Marketplace & Packs</h3>
                  <span className="text-xs font-mono text-slate-400">Attested Skills · Curated Modules</span>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Free open-core MIT foundation with curated modular packs. Automatic capability and permission auditing
                flags elevated capabilities before any third-party module touches your machine.
              </p>
              <ul className="text-xs font-mono text-slate-400 space-y-2">
                <li className="flex items-center gap-2 text-amber-300">
                  <span>✓</span> Non-waivable &apos;Built on SIP&apos; cryptographic attestation
                </li>
                <li className="flex items-center gap-2 text-amber-300">
                  <span>✓</span> CLI pack manager with sandboxed installation
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Run it yourself */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl border border-white/[0.1] bg-gradient-to-b from-white/[0.04] to-transparent p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              Run the tests yourself
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto mb-8 text-sm sm:text-base">
              The snapshot, encryption and robotics modules live in <code className="font-mono text-slate-200">src/durability</code> and{" "}
              <code className="font-mono text-slate-200">src/robotics</code>, with their tests beside them. Clone the
              repository and check every claim on this page against the code.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="https://github.com/frankxai/Starlight-Intelligence-System"
                target="_blank"
                className="w-full sm:w-auto rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[#060609] hover:bg-slate-200 transition-all"
              >
                Inspect the source on GitHub
              </Link>
              <Link
                href="/download"
                className="w-full sm:w-auto rounded-full border border-white/20 bg-white/[0.04] px-8 py-3.5 text-sm font-medium text-white hover:bg-white/[0.08] transition-all"
              >
                Install Starlight
              </Link>
            </div>
          </div>

          <div className="text-center text-xs font-mono text-slate-500 pt-16">
            Built on the sovereign substrate of the Starlight Intelligence Protocol (SIP v1.1.1)
          </div>
        </div>
      </section>
    </main>
  );
}
