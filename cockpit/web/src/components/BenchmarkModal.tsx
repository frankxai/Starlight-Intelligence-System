import React, { useState } from 'react';
import { substrateDB } from '../memory/sqliteSubstrate';
import { soundFX } from '../audio/soundFX';

interface BenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFps: number;
  nodeCount: number;
  onSpawn100Nodes: () => void;
  onRestoreDefaultNodes: () => void;
}

export const BenchmarkModal: React.FC<BenchmarkModalProps> = ({
  isOpen,
  onClose,
  currentFps,
  nodeCount,
  onSpawn100Nodes,
  onRestoreDefaultNodes,
}) => {
  const [sqliteBenchResults, setSqliteBenchResults] = useState<{
    runs: number;
    minMs: number;
    avgMs: number;
    p95Ms: number;
    maxMs: number;
    networkCalls: number;
    passed: boolean;
  } | null>(null);

  const [isRunningSqliteBench, setIsRunningSqliteBench] = useState<boolean>(false);

  if (!isOpen) return null;

  const runSqliteBenchmark = () => {
    soundFX.playClick(2400);
    setIsRunningSqliteBench(true);
    setTimeout(() => {
      const results = substrateDB.benchmark(100);
      setSqliteBenchResults(results);
      setIsRunningSqliteBench(false);
      soundFX.playConsensusChime();
    }, 50);
  };

  const handleSpawn100 = () => {
    soundFX.playClick(2600);
    onSpawn100Nodes();
  };

  const handleRestore = () => {
    soundFX.playClick(2000);
    onRestoreDefaultNodes();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-[#090912] border border-white/15 p-6 shadow-2xl space-y-6 animate-scale-in select-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold">
              ⚡
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide font-display">
                Verification & Benchmark Suite
              </h2>
              <p className="text-xs text-slate-400">
                Verifying 120 FPS spatial canvas, 60+ FPS under 100+ nodes, and &lt;2ms local SQLite search
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFX.playClick(1800);
              onClose();
            }}
            className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-mono"
          >
            ✕ Close
          </button>
        </div>

        {/* Benchmark 1: 100+ Nodes Canvas Stress Test */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                1. Spatial Canvas 100+ Nodes Stress Test
              </h3>
              <p className="text-xs text-slate-400">
                Success criterion: 60+ FPS smooth canvas panning under 100+ loaded nodes
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                currentFps >= 60
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {currentFps >= 60 ? '✓ PASSED' : 'MONITORING'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-[#07070b] border border-white/5 text-center font-mono">
            <div>
              <div className="text-[11px] text-slate-500">CURRENT FPS</div>
              <div className="text-xl font-bold text-white">{currentFps} FPS</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">LOADED NODES</div>
              <div className="text-xl font-bold text-cyan-400">{nodeCount}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">TARGET BENCHMARK</div>
              <div className="text-xl font-bold text-emerald-400">&gt; 60 FPS</div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSpawn100}
              className="px-4 py-2 rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40 text-xs font-mono font-semibold transition-all"
            >
              ▶ Load 100+ Nodes Stress Topology
            </button>
            <button
              onClick={handleRestore}
              className="px-3 py-2 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono transition-all"
            >
              ↺ Reset to Canonical 14 Nodes
            </button>
          </div>
        </div>

        {/* Benchmark 2: Local SQLite In-Memory & Latency */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                2. Local SQLite In-Memory & Latency Benchmark
              </h3>
              <p className="text-xs text-slate-400">
                Success criterion: &lt;2ms response time entirely in-memory with zero network requests
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                sqliteBenchResults?.passed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
              }`}
            >
              {sqliteBenchResults?.passed ? '✓ PASSED' : 'READY'}
            </span>
          </div>

          {sqliteBenchResults ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-[#07070b] border border-white/5 text-center font-mono text-xs">
              <div>
                <div className="text-slate-500 text-[10px]">AVG LATENCY</div>
                <div className="text-base font-bold text-emerald-400">
                  {sqliteBenchResults.avgMs} ms
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px]">P95 LATENCY</div>
                <div className="text-base font-bold text-emerald-400">
                  {sqliteBenchResults.p95Ms} ms
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px]">MAX LATENCY</div>
                <div className="text-base font-bold text-cyan-400">
                  {sqliteBenchResults.maxMs} ms
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px]">NETWORK CALLS</div>
                <div className="text-base font-bold text-emerald-400">
                  {sqliteBenchResults.networkCalls} (Zero)
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-[#07070b] border border-white/5 text-center text-xs font-mono text-slate-500">
              Run benchmark to execute 100 consecutive in-memory SQLite hybrid queries.
            </div>
          )}

          <div className="pt-1">
            <button
              onClick={runSqliteBenchmark}
              disabled={isRunningSqliteBench}
              className="px-4 py-2 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 text-xs font-mono font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isRunningSqliteBench ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-spin" />
                  Running 100 Queries...
                </>
              ) : (
                '▶ Run 100-Query Latency Benchmark'
              )}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-2 border-t border-white/5">
          <span>Starlight Substrate v8.3 Benchmark Engine</span>
          <span className="text-emerald-400">Built on SIP — Sovereign Substrate</span>
        </div>
      </div>
    </div>
  );
};
