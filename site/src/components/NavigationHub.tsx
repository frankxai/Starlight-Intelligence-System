"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Brain, 
  Layers, 
  Mic, 
  Radio, 
  Terminal, 
  Share2, 
  Music,
  ChevronRight,
  Zap
} from "lucide-react";

export interface NavigationItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  isExternal?: boolean;
  badge?: string;
}

export const NAVIGATION_SURFACES: NavigationItem[] = [
  {
    id: "constellation",
    title: "Agent Constellation",
    description: "50 governed specialists, 10 houses & prompt contracts",
    href: "/constellation",
    icon: <Sparkles className="w-4 h-4 text-violet-400" />,
    badge: "50 Agents"
  },
  {
    id: "visuals",
    title: "Visual Encyclopedia",
    description: "12 aesthetic batches, agent plates & topology studio",
    href: "/visuals",
    icon: <Layers className="w-4 h-4 text-fuchsia-400" />,
    badge: "Studio"
  },
  {
    id: "palace",
    title: "3D Memory Palace",
    description: "Living R3F WebGL visualization of 6 semantic vaults",
    href: "/palace",
    icon: <Brain className="w-4 h-4 text-purple-400" />,
    badge: "3D WebGL"
  },
  {
    id: "vaults",
    title: "Second Brain Vaults",
    description: "SQLite FTS5 + JSONL hybrid memory explorer",
    href: "/vaults",
    icon: <Layers className="w-4 h-4 text-cyan-400" />,
    badge: "Substrate"
  },
  {
    id: "command-center",
    title: "Swarm Cockpit Observatory",
    description: "Single pane system pulse, scoreboard & agent council",
    href: "http://127.0.0.1:4321/ops",
    icon: <Terminal className="w-4 h-4 text-emerald-400" />,
    isExternal: true,
    badge: "Port 4321"
  },
  {
    id: "queen-vision",
    title: "Queen Swarm Vision",
    description: "Central orchestrator & parallel intelligence visual skill",
    href: "http://127.0.0.1:8080/queen-vision.html",
    icon: <Sparkles className="w-4 h-4 text-amber-400" />,
    isExternal: true,
    badge: "HTML5 SOTA"
  },
  {
    id: "voice-operator",
    title: "Starlight Voice Operator",
    description: "Jarvis voice control console & mic-reactive surface",
    href: "http://127.0.0.1:8765/dashboard/cockpit.html",
    icon: <Mic className="w-4 h-4 text-indigo-400" />,
    isExternal: true,
    badge: "Latency <90ms"
  },
  {
    id: "social-portal",
    title: "Sovereign Social Swarm",
    description: "Interactive 2D spring-physics agent graph & comment loop",
    href: "http://127.0.0.1:8080/social-portal.html",
    icon: <Share2 className="w-4 h-4 text-pink-400" />,
    isExternal: true,
    badge: "RPA Swarm"
  },
  {
    id: "music-cockpit",
    title: "Music & Audio Studio",
    description: "Sound intelligence & Suno prompt composition hub",
    href: "http://127.0.0.1:8080/music-cockpit.html",
    icon: <Music className="w-4 h-4 text-sky-400" />,
    isExternal: true,
    badge: "Audio IS"
  }
];

export function NavigationHub() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      {/* Central Control Bar */}
      <div className="rounded-2xl border border-white/10 bg-[#0c0c14]/80 p-4 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Starlight Control Plane</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                  SYSTEM NOMINAL
                </span>
              </div>
              <p className="text-xs text-white/50">144 Swarm Agents • 6 Vaults • Multi-Engine Voice Active</p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10"
          >
            <span>{isOpen ? "Close Control Hub" : "Explore All Surfaces"}</span>
            <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
          </button>
        </div>

        {/* Surface Grid */}
        {isOpen && (
          <div className="mt-4 grid grid-cols-1 gap-3 pt-4 border-t border-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {NAVIGATION_SURFACES.map((item) => {
              const Content = (
                <div className="group relative flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3.5 transition hover:border-white/20 hover:bg-white/[0.06]">
                  <div className="rounded-lg bg-white/5 p-2 transition group-hover:scale-110">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white group-hover:text-purple-300">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-mono text-white/60">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-white/50 leading-tight">
                      {item.description}
                    </p>
                  </div>
                </div>
              );

              return item.isExternal ? (
                <a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer">
                  {Content}
                </a>
              ) : (
                <Link key={item.id} href={item.href}>
                  {Content}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
