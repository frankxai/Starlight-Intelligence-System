import type { Metadata } from "next";
import Link from "next/link";
import { SOCIAL_KITS } from "@/lib/queen-visuals";

export const metadata: Metadata = {
  title: "Social Kits",
  description: "Dynamic framing for social media.",
};

export default function SocialKitsPage() {
  return (
    <div className="bg-[#0a0a0f] text-zinc-200 min-h-screen">
      <header className="border-b border-white/[0.08] px-8 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/5 px-4 py-1 text-xs tracking-[3px] text-violet-400 mb-6">
            SOCIAL STRATEGY • KITS
          </div>
          <h1 className="font-serif text-[64px] leading-none tracking-[-3px] text-white">
            Social Kits
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-zinc-400">
            Pre-configured dynamic framing for Starlight social media outputs.
          </p>
          <div className="mt-8 flex gap-4">
             <Link href="/visuals" className="text-sm tracking-widest text-zinc-400 hover:text-white transition-colors">
              ← Back to Visuals
            </Link>
          </div>
        </div>
      </header>

      <main className="px-8 py-16">
        <div className="mx-auto max-w-5xl space-y-24">
          <section>
            <h2 className="text-[11px] font-medium uppercase tracking-widest text-slate-400 mb-8">
              Available Kits
            </h2>
            <div className="grid gap-12 md:grid-cols-2">
              {SOCIAL_KITS.map((id) => (
                <div key={id} className="group relative">
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                    <img 
                      src={`/assets/visuals/queen-premium/${id}.jpg`} 
                      alt={`Social Kit ${id}`}
                      className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold text-white">
                      {id === 147 && "Social Queen's Edict"}
                      {id === 148 && "Social Swarm Heart"}
                    </h3>
                    <p className="mt-2 text-sm text-zinc-400">
                      QUEEN-PREMIUM/{id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
