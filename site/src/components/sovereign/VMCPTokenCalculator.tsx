"use client";

import { useState } from "react";

export function VMCPTokenCalculator() {
  const [agents, setAgents] = useState<number>(5);
  const [tools, setTools] = useState<number>(60);
  const [turnsPerDay, setTurnsPerDay] = useState<number>(50);

  // Constants
  const TOKENS_PER_TOOL_DEF = 420; // Average JSON Schema size per tool in standard MCP
  const VMCP_JIT_TOKENS = 180; // Compact intent-based scope synthesis
  const COST_PER_MILLION_INPUT = 3.0; // Claude 3.5 Sonnet / GPT-4o input cost

  // Calculations
  const legacyTokensPerTurn = agents * (tools * TOKENS_PER_TOOL_DEF);
  const vmcpTokensPerTurn = agents * VMCP_JIT_TOKENS;
  const tokensSavedPerTurn = legacyTokensPerTurn - vmcpTokensPerTurn;
  const percentageSaved = ((tokensSavedPerTurn / legacyTokensPerTurn) * 100).toFixed(1);

  const monthlyTokensSaved = tokensSavedPerTurn * turnsPerDay * 30;
  const monthlyCostSavings = ((monthlyTokensSaved / 1_000_000) * COST_PER_MILLION_INPUT).toFixed(2);

  return (
    <div className="rounded-2xl border border-white/[0.1] bg-[#0c0c16]/90 p-6 backdrop-blur-xl shadow-2xl">
      <div className="pb-4 border-b border-white/[0.08]">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          Virtual MCP (vMCP) Context Window Token Economics
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Legacy MCP dumps 50-100+ raw schemas into every turn, causing context exhaustion and model confusion.
          Starlight vMCP synthesizes JIT tool scopes on demand.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        <div>
          <div className="flex justify-between text-xs font-mono text-slate-300 mb-2">
            <span>Concurrent Agents</span>
            <span className="text-cyan-400 font-bold">{agents}</span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            value={agents}
            onChange={(e) => setAgents(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-white/10 rounded-lg cursor-pointer h-1.5"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono text-slate-300 mb-2">
            <span>Installed Tools in Mesh</span>
            <span className="text-cyan-400 font-bold">{tools}</span>
          </div>
          <input
            type="range"
            min={10}
            max={120}
            value={tools}
            onChange={(e) => setTools(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-white/10 rounded-lg cursor-pointer h-1.5"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono text-slate-300 mb-2">
            <span>Turns / Agent / Day</span>
            <span className="text-cyan-400 font-bold">{turnsPerDay}</span>
          </div>
          <input
            type="range"
            min={10}
            max={200}
            value={turnsPerDay}
            onChange={(e) => setTurnsPerDay(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-white/10 rounded-lg cursor-pointer h-1.5"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/[0.08]">
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4 text-center">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
            Standard MCP Overhead
          </span>
          <span className="text-xl font-bold font-mono text-red-400">
            {legacyTokensPerTurn.toLocaleString()} <span className="text-xs font-normal text-slate-400">tok/turn</span>
          </span>
        </div>

        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4 text-center">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
            Starlight vMCP JIT
          </span>
          <span className="text-xl font-bold font-mono text-cyan-400">
            {vmcpTokensPerTurn.toLocaleString()} <span className="text-xs font-normal text-slate-400">tok/turn</span>
          </span>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 text-center">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
            Context Token Reduction
          </span>
          <span className="text-xl font-bold font-mono text-emerald-400">
            -{percentageSaved}% <span className="text-xs font-normal text-slate-400">($ {monthlyCostSavings}/mo)</span>
          </span>
        </div>
      </div>
    </div>
  );
}
