import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Hexagon, Shield, Brain, Activity, Waves, Users, Zap } from "lucide-react";
import { QUEEN_PREMIUM_PATH, CODEX_OMEGA_ASSETS, DOMAIN_OMEGA_ASSETS } from "@/lib/queen-visuals";

export const metadata: Metadata = {
  title: "The Agent Codex | Starlight Intelligence",
  description: "Explore the 17 Omega Tier Agents of the Starlight Intelligence System. High-end execution, domain mastery, and visual intelligence.",
};

type AgentDef = {
  id: number;
  name: string;
  role: string;
  domain: string;
  status: "Core" | "Domain" | "Substrate";
  description: string;
  icon: any;
};

const CORE_AGENTS: AgentDef[] = [
  { id: 129, name: "Omega Orchestrator", role: "Master Router", domain: "Orchestration", status: "Core", description: "The central routing intelligence that commands the multi-agent swarms.", icon: Hexagon },
  { id: 130, name: "Omega Genius", role: "Root Excavator", domain: "Excavation", status: "Core", description: "Extracts underlying patterns and fundamental truth from raw intent.", icon: Brain },
  { id: 131, name: "Omega Hermes", role: "Retrieval & Memory", domain: "Substrate", status: "Substrate", description: "Navigates the semantic vaults, recalling perfect context instantly.", icon: Zap },
  { id: 132, name: "Omega Sentinel", role: "Security & Gates", domain: "Compliance", status: "Core", description: "Guards the proving ground, evaluating every run against policy.", icon: Shield },
  { id: 133, name: "Omega Weaver", role: "Synthesis & Design", domain: "Creative", status: "Core", description: "Binds discrete thoughts into beautiful, coherent visual artifacts.", icon: Waves },
];

const HEALTH_AGENTS: AgentDef[] = [
  { id: 149, name: "Omega Bio-Architect", role: "Systems Design", domain: "Health IS", status: "Domain", description: "Designs the ultimate biological foundation and system architecture.", icon: Activity },
  { id: 150, name: "Omega Longevity Sage", role: "Temporal Strategy", domain: "Health IS", status: "Domain", description: "Calculates horizons and protocols for extended vitality.", icon: Activity },
  { id: 151, name: "Omega Metabolic Sentinel", role: "Energy Governance", domain: "Health IS", status: "Domain", description: "Monitors and optimizes metabolic inputs and circadian rhythms.", icon: Activity },
  { id: 152, name: "Omega Neural Weaver", role: "Cognitive Sync", domain: "Health IS", status: "Domain", description: "Tunes cognitive performance, focus states, and recovery.", icon: Activity },
];

const SOUND_AGENTS: AgentDef[] = [
  { id: 153, name: "Omega Sound Composer", role: "Score Design", domain: "Sound IS", status: "Domain", description: "Architects the emotional landscape through frequency and harmony.", icon: Waves },
  { id: 154, name: "Omega Audio Producer", role: "Sonic Polish", domain: "Sound IS", status: "Domain", description: "Engineers the final mix, executing pristine audio delivery.", icon: Waves },
  { id: 155, name: "Omega Sync Strategist", role: "Distribution", domain: "Sound IS", status: "Domain", description: "Aligns sonic assets with visual media for maximum resonance.", icon: Waves },
  { id: 156, name: "Omega Resonance Analyst", role: "Acoustic Tuning", domain: "Sound IS", status: "Domain", description: "Measures impact, frequency balance, and audience vibration.", icon: Waves },
];

const PEOPLE_AGENTS: AgentDef[] = [
  { id: 157, name: "Omega Culture Strategist", role: "Ethos Architect", domain: "People IS", status: "Domain", description: "Defines and defends the core principles of the network.", icon: Users },
  { id: 158, name: "Omega Talent Scout", role: "Pattern Recognition", domain: "People IS", status: "Domain", description: "Identifies exceptional potential across the global talent graph.", icon: Users },
  { id: 159, name: "Omega Performance Coach", role: "Velocity Catalyst", domain: "People IS", status: "Domain", description: "Removes friction and accelerates output for high-performers.", icon: Users },
  { id: 160, name: "Omega Org Architect", role: "Topology Design", domain: "People IS", status: "Domain", description: "Structures the relational geometry for infinite scalability.", icon: Users },
];

export default function CodexPage() {
  return (
    <div className="bg-[#030305] text-zinc-200 min-h-screen selection:bg-cyan-500/30">
      {/* ── Hero ── */}
      <header className="relative flex min-h-[70vh] items-center justify-center overflow-hidden border-b border-white/[0.05]">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.03] blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-[600px] w-[600px] translate-x-1/2 translate-y-1/3 rounded-full bg-violet-600/[0.04] blur-[150px]" />
          <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-[0.015] mix-blend-overlay" />
        </div>
        
        <div className="relative z-10 w-full max-w-7xl px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 text-[10px] font-mono tracking-[3px] text-cyan-400 mb-8 uppercase backdrop-blur-md">
            Starlight Codex • Intelligence Roster
          </div>
          <h1 className="font-serif text-[clamp(3rem,8vw,6.5rem)] leading-[0.95] tracking-tight text-white mb-6 drop-shadow-2xl">
            The Agent <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300">Codex</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-zinc-400 tracking-tight leading-relaxed mb-10">
            Seventeen Omega-Tier intelligences. Five core routers, twelve domain specialists. 
            All sharing a single sovereign memory substrate. The orchestration of excellence.
          </p>
        </div>
      </header>

      <main className="px-6 py-24">
        <div className="max-w-7xl mx-auto space-y-32">
          
          {/* Core Intelligences */}
          <section>
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
              <div>
                <h2 className="text-[10px] font-mono tracking-[3px] text-cyan-400 uppercase mb-3">Layer 00</h2>
                <h3 className="font-serif text-4xl text-white tracking-tight">Core Intelligences</h3>
              </div>
              <p className="text-sm text-zinc-500 max-w-sm text-left md:text-right">
                The primary foundational agents that orchestrate, protect, and synthesize all system operations.
              </p>
            </div>
            <AgentGrid agents={CORE_AGENTS} />
          </section>

          {/* Health IS */}
          <section>
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
              <div>
                <h2 className="text-[10px] font-mono tracking-[3px] text-emerald-400 uppercase mb-3">Domain Sub-Stack</h2>
                <h3 className="font-serif text-4xl text-white tracking-tight">Health Intelligence</h3>
              </div>
              <p className="text-sm text-zinc-500 max-w-sm text-left md:text-right">
                The physical substrate. Optimization of longevity, energy, and cognitive performance.
              </p>
            </div>
            <AgentGrid agents={HEALTH_AGENTS} accent="emerald" />
          </section>

          {/* Sound IS */}
          <section>
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
              <div>
                <h2 className="text-[10px] font-mono tracking-[3px] text-violet-400 uppercase mb-3">Domain Sub-Stack</h2>
                <h3 className="font-serif text-4xl text-white tracking-tight">Sound Intelligence</h3>
              </div>
              <p className="text-sm text-zinc-500 max-w-sm text-left md:text-right">
                The harmonic layer. Sonic architecture, frequency optimization, and auditory resonance.
              </p>
            </div>
            <AgentGrid agents={SOUND_AGENTS} accent="violet" />
          </section>

          {/* People IS */}
          <section>
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
              <div>
                <h2 className="text-[10px] font-mono tracking-[3px] text-amber-400 uppercase mb-3">Domain Sub-Stack</h2>
                <h3 className="font-serif text-4xl text-white tracking-tight">People Intelligence</h3>
              </div>
              <p className="text-sm text-zinc-500 max-w-sm text-left md:text-right">
                The relational matrix. Talent identification, cultural architecting, and performance acceleration.
              </p>
            </div>
            <AgentGrid agents={PEOPLE_AGENTS} accent="amber" />
          </section>
          
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="border-t border-white/[0.05] bg-black/50 py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">Orchestrate the Swarm</h2>
          <p className="text-zinc-400 mb-10">
            These agents are available via the Starlight Orchestrator. They share context, coordinate securely, and never lose memory.
          </p>
          <Link href="/architecture" className="inline-flex items-center gap-3 rounded-full bg-white text-black px-8 py-4 font-medium hover:bg-zinc-200 transition-colors">
            View the Architecture <ArrowRight size={18} />
          </Link>
        </div>
      </footer>
    </div>
  );
}

function AgentGrid({ agents, accent = "cyan" }: { agents: AgentDef[], accent?: "cyan" | "emerald" | "violet" | "amber" }) {
  const accentColors = {
    cyan: "group-hover:border-cyan-500/30 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]",
    emerald: "group-hover:border-emerald-500/30 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]",
    violet: "group-hover:border-violet-500/30 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]",
    amber: "group-hover:border-amber-500/30 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]",
  };

  const textColors = {
    cyan: "text-cyan-400",
    emerald: "text-emerald-400",
    violet: "text-violet-400",
    amber: "text-amber-400",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {agents.map((agent) => (
        <div 
          key={agent.id}
          className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0e]/80 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 ${accentColors[accent]}`}
        >
          {/* Image Container */}
          <div className="aspect-[4/5] w-full overflow-hidden relative border-b border-white/5">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0e] via-transparent to-transparent z-10 opacity-80" />
            <img 
              src={`${QUEEN_PREMIUM_PATH}/${agent.id}.jpg`} 
              alt={agent.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Status Badge */}
            <div className="absolute top-4 right-4 z-20">
              <span className="inline-flex items-center rounded-full border border-white/20 bg-black/50 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono tracking-widest text-white/90">
                {agent.status}
              </span>
            </div>
            
            {/* ID Badge */}
            <div className="absolute top-4 left-4 z-20">
              <span className={`inline-flex items-center rounded-md bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] font-mono tracking-wider ${textColors[accent]}`}>
                ID:{agent.id}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 relative z-20 bg-gradient-to-b from-[#0a0a0e] to-[#050508]">
            <div className="flex items-center gap-3 mb-3">
              <agent.icon size={16} className={textColors[accent]} />
              <span className={`text-[10px] font-mono uppercase tracking-widest ${textColors[accent]}`}>
                {agent.domain}
              </span>
            </div>
            
            <h4 className="font-serif text-2xl text-white mb-1 tracking-tight">
              {agent.name}
            </h4>
            <div className="text-sm font-medium text-white/60 mb-4 tracking-wide">
              {agent.role}
            </div>
            
            <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3">
              {agent.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
