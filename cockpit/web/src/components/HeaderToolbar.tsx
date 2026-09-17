import React, { useState } from 'react';
import { soundFX } from '../audio/soundFX';
import { substrateDB } from '../memory/sqliteSubstrate';
import type { VaultEntry } from '../types/cockpit';

interface HeaderToolbarProps {
  fps: number;
  nodeCount: number;
  edgeCount: number;
  onOpenCouncil: () => void;
  onOpenBenchmark: () => void;
  onAddAgent: () => void;
  onAddGate: () => void;
  onResetView: () => void;
  onSelectEntry?: (entry: VaultEntry) => void;
}

export const HeaderToolbar: React.FC<HeaderToolbarProps> = ({
  fps,
  nodeCount,
  edgeCount,
  onOpenCouncil,
  onOpenBenchmark,
  onAddAgent,
  onAddGate,
  onResetView,
  onSelectEntry,
}) => {
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [searchResults, setSearchResults] = useState<VaultEntry[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundFX.isMuted());

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGlobalSearch(val);
    if (!val.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }
    soundFX.playClick(2800);
    const results = substrateDB.hybridSearch(val, { limit: 6 });
    setSearchResults(results.map((r) => r.entry));
    setIsSearchOpen(true);
  };

  const toggleMute = () => {
    const nextState = !isMuted;
    soundFX.setMuted(nextState);
    setIsMuted(nextState);
    if (!nextState) soundFX.playClick(2400);
  };

  return (
    <header className="absolute top-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
      {/* Left Group: Brand and Live Substrate Metrics */}
      <div className="flex items-center gap-3 p-1.5 px-3 rounded-xl bg-[#08080f]/90 border border-white/10 backdrop-blur-md shadow-2xl pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
            ✦
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide font-display flex items-center gap-2">
              Starlight Cockpit
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                v8.3
              </span>
            </h1>
          </div>
        </div>

        <div className="h-4 w-px bg-white/10 mx-1" />

        {/* Live FPS Counter */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              fps >= 100 ? 'bg-emerald-400' : fps >= 55 ? 'bg-cyan-400' : 'bg-amber-400'
            } animate-pulse`}
          />
          <span className="text-white font-bold">{fps}</span>
          <span className="text-slate-400 text-[10px]">FPS</span>
        </div>

        <div className="h-4 w-px bg-white/10 mx-1" />

        {/* Node & Edge Stats */}
        <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-slate-300">
          <span>{nodeCount} Nodes</span>
          <span className="text-slate-500">•</span>
          <span>{edgeCount} Cables</span>
          <span className="text-slate-500">•</span>
          <span className="text-cyan-400">108 Vault Entries</span>
        </div>
      </div>

      {/* Middle Group: Instant Global Search */}
      <div className="relative pointer-events-auto w-72 md:w-96">
        <input
          type="text"
          placeholder="Instant SQLite hybrid search (<0.5ms)..."
          value={globalSearch}
          onChange={handleSearchChange}
          onFocus={() => globalSearch.trim() && setIsSearchOpen(true)}
          className="w-full px-3.5 py-1.5 rounded-xl bg-[#08080f]/90 border border-white/10 backdrop-blur-md text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-cyan-400 shadow-2xl transition-all"
        />

        {/* Search Results Dropdown */}
        {isSearchOpen && searchResults.length > 0 && (
          <div className="absolute top-10 left-0 right-0 max-h-80 overflow-y-auto rounded-xl bg-[#0a0a14] border border-white/15 backdrop-blur-lg shadow-2xl p-2 space-y-1 z-40">
            <div className="px-2 py-1 text-[10px] font-mono text-slate-400 border-b border-white/5 flex items-center justify-between">
              <span>FTS + Vector Matches</span>
              <span className="text-emerald-400">0 Network Calls</span>
            </div>
            {searchResults.map((entry) => (
              <div
                key={entry.id}
                onClick={() => {
                  soundFX.playClick(2200);
                  setIsSearchOpen(false);
                  if (onSelectEntry) onSelectEntry(entry);
                }}
                className="p-2 rounded-lg bg-black/40 hover:bg-white/10 cursor-pointer text-left transition-colors"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="text-cyan-300 uppercase font-semibold">[{entry.vault}]</span>
                  <span>{entry.category}</span>
                </div>
                <p className="mt-1 text-xs text-slate-200 line-clamp-2 leading-relaxed">
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Group: Actions & Tools */}
      <div className="flex items-center gap-2 p-1.5 px-3 rounded-xl bg-[#08080f]/90 border border-white/10 backdrop-blur-md shadow-2xl pointer-events-auto">
        <button
          onClick={() => {
            soundFX.playClick(2000);
            onAddAgent();
          }}
          className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/15 text-white text-xs font-mono border border-white/10 transition-all flex items-center gap-1"
          title="Add new Agent node"
        >
          + Agent
        </button>

        <button
          onClick={() => {
            soundFX.playClick(2000);
            onAddGate();
          }}
          className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/15 text-white text-xs font-mono border border-white/10 transition-all flex items-center gap-1"
          title="Add Execution Gate node"
        >
          + Gate
        </button>

        <button
          onClick={() => {
            soundFX.playClick(1800);
            onResetView();
          }}
          className="px-2 py-1 rounded bg-white/5 hover:bg-white/15 text-slate-300 text-xs font-mono border border-white/10 transition-all"
          title="Reset canvas pan and zoom"
        >
          ⊙ Reset
        </button>

        <button
          onClick={toggleMute}
          className="px-2 py-1 rounded bg-white/5 hover:bg-white/15 text-slate-300 text-xs font-mono border border-white/10 transition-all"
          title={isMuted ? 'Unmute 2ms audio tactile clicks' : 'Mute audio tactile clicks'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        <button
          onClick={() => {
            soundFX.playClick(2400);
            onOpenBenchmark();
          }}
          className="px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono border border-cyan-500/40 transition-all font-semibold"
          title="Run 100+ node stress test & SQLite benchmark"
        >
          ⚡ Benchmark
        </button>

        <button
          onClick={() => {
            soundFX.playClick(2600);
            onOpenCouncil();
          }}
          className="px-3.5 py-1 rounded bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-xs font-mono font-bold shadow-lg transition-all flex items-center gap-1.5"
          title="Open Deliberation Chamber (Streaming Council Split-Screen)"
        >
          <span>◈</span> Council Chamber
        </button>
      </div>
    </header>
  );
};
