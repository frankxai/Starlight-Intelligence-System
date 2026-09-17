import React from 'react';
import type { VaultEntry } from '../types/cockpit';
import { soundFX } from '../audio/soundFX';

interface NodeDetailModalProps {
  entry: VaultEntry | null;
  onClose: () => void;
}

export const NodeDetailModal: React.FC<NodeDetailModalProps> = ({ entry, onClose }) => {
  if (!entry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
      <div className="w-full max-w-xl rounded-2xl bg-[#0a0a14] border border-white/15 p-6 shadow-2xl space-y-4 animate-scale-in select-text">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase font-bold">
              {entry.vault} Vault
            </span>
            <span className="text-slate-400">{entry.id}</span>
          </div>
          <button
            onClick={() => {
              soundFX.playClick(1800);
              onClose();
            }}
            className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-mono"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-white leading-relaxed">
            {entry.content}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400 pt-3 border-t border-white/5">
            <div>
              <span className="text-slate-500">Category:</span> {entry.category}
            </div>
            <div>
              <span className="text-slate-500">Confidence:</span> {entry.confidence}
            </div>
            <div>
              <span className="text-slate-500">Source:</span> {entry.source}
            </div>
            <div>
              <span className="text-slate-500">Date:</span> {entry.createdAt.substring(0, 10)}
            </div>
          </div>

          {entry.tags.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-1">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/5 text-slate-300 border border-white/5"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {entry.metadata && (
            <div className="pt-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
                Raw JSONL Record:
              </span>
              <pre className="p-2.5 rounded-lg bg-black/60 border border-white/5 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-40">
                {JSON.stringify(entry.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
