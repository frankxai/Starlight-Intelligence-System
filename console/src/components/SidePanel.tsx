"use client";

import { useEffect, useState } from "react";
import { type Node as VNode } from "@/data/substrate";

interface VaultEntry {
  id: string;
  title: string;
  date: string;
  category: string;
  content: string;
}

interface SidePanelProps {
  node: VNode | null;
  onClose: () => void;
}

export default function SidePanel({ node, onClose }: SidePanelProps) {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!node || node.kind !== "vault") {
      setEntries([]);
      return;
    }

    let active = true;
    setLoading(true);
    
    fetch(`/api/vault/${node.id}`)
      .then(res => res.json())
      .then(data => {
        if (active && data.entries) {
          setEntries(data.entries);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [node]);

  if (!node) return null;

  return (
    <div className="pointer-events-auto absolute right-0 top-0 z-50 flex h-full w-[380px] flex-col border-l border-white/[0.08] bg-[#050509]/90 shadow-2xl backdrop-blur-xl transition-all duration-300">
      <div className="flex items-center justify-between border-b border-white/[0.08] p-6">
        <div className="flex items-center gap-4">
          <div 
            className="flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-bold shadow-lg"
            style={{ backgroundColor: node.color, color: "#050509" }}
          >
            {node.glyph}
          </div>
          <div>
            <h2 className="font-display text-[18px] font-medium tracking-display text-[color:var(--ink-0)]" style={{ color: node.color }}>
              {node.name}
            </h2>
            <div className="font-mono text-[10px] uppercase tracking-tech text-slate-400">
              {node.kind} node
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="rounded-full p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        <p className="mb-8 text-[14px] leading-relaxed text-slate-300">
          {node.desc}
        </p>

        {node.kind === "vault" && (
          <div>
            <h3 className="mb-4 font-mono text-[11px] uppercase tracking-tech text-[color:var(--doctrine)]">
              Recent Vault Entries
            </h3>
            
            {loading ? (
              <div className="animate-pulse text-sm text-slate-500">Loading memories...</div>
            ) : entries.length === 0 ? (
              <div className="text-sm text-slate-500">No recent entries found.</div>
            ) : (
              <div className="space-y-4">
                {entries.map(entry => (
                  <div key={entry.id} className="rounded-xl border border-white/[0.05] bg-black/40 p-4 transition-colors hover:bg-black/60">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[color:var(--voltage-bright)]">
                        {entry.category}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {entry.date}
                      </span>
                    </div>
                    <h4 className="mb-2 text-[14px] font-medium text-[color:var(--ink-1)]">
                      {entry.title}
                    </h4>
                    <p className="text-[12px] leading-relaxed text-slate-400">
                      {entry.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
