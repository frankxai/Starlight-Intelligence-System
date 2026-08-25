"use client";

import { useState } from "react";
import Image from "next/image";
import { ALL_AGENTS, type PublicAgent } from "@/lib/constellation-data";
import { Users, Shield, Zap, Check, Plus, Trash2, Download, Copy } from "lucide-react";

export function SwarmBuilder() {
  const [selectedAgents, setSelectedAgents] = useState<PublicAgent[]>([
    ALL_AGENTS.find((a) => a.id === "cassian-orchestration-lead") || ALL_AGENTS[0],
    ALL_AGENTS.find((a) => a.id === "quill-source-analyst") || ALL_AGENTS[1],
    ALL_AGENTS.find((a) => a.id === "bastion-governance-sentinel") || ALL_AGENTS[2],
  ].filter(Boolean) as PublicAgent[]);

  const [copied, setCopied] = useState(false);

  const toggleAgent = (agent: PublicAgent) => {
    if (selectedAgents.some((a) => a.id === agent.id)) {
      if (selectedAgents.length > 1) {
        setSelectedAgents(selectedAgents.filter((a) => a.id !== agent.id));
      }
    } else {
      if (selectedAgents.length < 5) {
        setSelectedAgents([...selectedAgents, agent]);
      }
    }
  };

  const exportBlueprintJson = () => {
    const blueprint = {
      schema: "starlight.governed_council.v1",
      council_name: "Custom Governed Starlight Council",
      agent_count: selectedAgents.length,
      conductors: selectedAgents.filter((a) => a.role_kind === "conductor").map((a) => a.id),
      specialists: selectedAgents.filter((a) => a.role_kind === "specialist").map((a) => a.id),
      shared_stop_conditions: Array.from(new Set(selectedAgents.flatMap((a) => a.stop_conditions))),
      roster: selectedAgents.map((a) => ({
        id: a.id,
        name: a.display_name,
        role: a.role_title,
        authority: a.prompt_contract.authority_statement,
        capabilities: a.capabilities,
      })),
      governance: {
        human_override_required: true,
        irreversible_actions_gated: true,
        receipts_format: "starlight.run_receipt.json",
      },
    };

    const text = JSON.stringify(blueprint, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl border border-white/[0.1] bg-[#0c0c16] p-6 shadow-2xl md:p-8">
      <div className="flex flex-col justify-between gap-4 border-b border-white/[0.08] pb-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-violet-400">
            <Users className="h-4 w-4" /> Council Sizing Protocol
          </div>
          <h3 className="mt-1 text-xl font-bold text-white md:text-2xl">
            Compose a Governed Council (3–5 Agents)
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Rule of 7: Limit active consensus loops to 3–5 specialized agents to prevent token latency and coordinate deadlocks.
          </p>
        </div>

        <button
          onClick={exportBlueprintJson}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_0_20px_rgba(167,139,250,0.3)] transition hover:bg-violet-500"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Blueprint Copied!" : "Export Council Blueprint"}
        </button>
      </div>

      {/* Selected Swarm Roster */}
      <div className="mt-6">
        <h4 className="font-mono text-xs uppercase tracking-wider text-slate-400">
          Active Council Roster ({selectedAgents.length}/5 seats)
        </h4>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {selectedAgents.map((agent) => (
            <div
              key={agent.id}
              className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-violet-500/30 bg-violet-950/20 p-4"
            >
              <div>
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black/40">
                  <Image
                    src={agent.visual_asset.href || "/assets/constellation/constellation-lineup.webp"}
                    alt={agent.display_name}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => toggleAgent(agent)}
                    className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-slate-400 hover:text-rose-400 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <h5 className="mt-3 text-sm font-bold text-white">{agent.display_name}</h5>
                <p className="font-mono text-[10px] text-violet-400">{agent.role_title}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-white/[0.06]">
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">
                  {agent.role_kind}
                </span>
              </div>
            </div>
          ))}

          {selectedAgents.length < 5 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.01] p-6 text-center">
              <Plus className="h-6 w-6 text-slate-500" />
              <p className="mt-2 text-xs font-medium text-slate-400">Add up to {5 - selectedAgents.length} more</p>
              <p className="text-[10px] text-slate-500">Pick from candidate roster below</p>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Selector Drawer */}
      <div className="mt-8 pt-6 border-t border-white/[0.08]">
        <h4 className="font-mono text-xs uppercase tracking-wider text-slate-400">
          Candidate Agents ({ALL_AGENTS.length} Available)
        </h4>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-2">
          {ALL_AGENTS.map((agent) => {
            const isSelected = selectedAgents.some((a) => a.id === agent.id);
            return (
              <button
                key={agent.id}
                onClick={() => toggleAgent(agent)}
                className={`flex-shrink-0 flex items-center gap-2 rounded-xl border p-2 text-left transition ${
                  isSelected
                    ? "border-violet-400/60 bg-violet-500/20 text-white"
                    : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-200"
                }`}
              >
                <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-black/40">
                  <Image
                    src={agent.visual_asset.href || "/assets/constellation/constellation-lineup.webp"}
                    alt={agent.display_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold">{agent.display_name}</div>
                  <div className="font-mono text-[9px] text-slate-500">{agent.role_title}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
