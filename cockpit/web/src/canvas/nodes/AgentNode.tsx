import React from 'react';
import type { AgentNodeData } from '../../types/cockpit';
import { soundFX } from '../../audio/soundFX';

interface AgentNodeProps {
  data: AgentNodeData;
  onStartConnect: (portType: 'agent', agentId: string, event: React.MouseEvent) => void;
  onToggleStatus: (agentId: string) => void;
}

export const AgentNode: React.FC<AgentNodeProps> = ({
  data,
  onStartConnect,
  onToggleStatus,
}) => {
  const getStatusBadge = () => {
    switch (data.status) {
      case 'executing':
        return {
          label: 'EXECUTING',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dotClass: 'bg-emerald-400 animate-spin',
        };
      case 'deliberating':
        return {
          label: 'DELIBERATING',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dotClass: 'bg-amber-400 animate-pulse',
        };
      case 'idle':
      default:
        return {
          label: 'IDLE',
          badgeClass: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
          dotClass: 'bg-slate-400',
        };
    }
  };

  const statusInfo = getStatusBadge();

  return (
    <div
      className="relative rounded-xl border border-white/10 bg-[#0c0c16]/95 backdrop-blur-md p-4 w-[280px] shadow-2xl transition-all select-none hover:border-white/25"
      style={{
        boxShadow: `0 8px 30px -4px ${data.avatarColor}25`,
        borderColor: data.activeVaults.length > 0 ? `${data.avatarColor}80` : undefined,
      }}
    >
      {/* Top Port Handle */}
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#141424] border-2 flex items-center justify-center cursor-crosshair group hover:scale-125 transition-transform z-10"
        style={{ borderColor: data.avatarColor }}
        onMouseDown={(e) => {
          e.stopPropagation();
          soundFX.playClick(2000);
          onStartConnect('agent', data.id, e);
        }}
        title="Connect agent to Memory Vault"
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: data.avatarColor }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-md"
            style={{
              backgroundColor: `${data.avatarColor}20`,
              color: data.avatarColor,
              border: `1px solid ${data.avatarColor}40`,
            }}
          >
            {data.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide font-display">
              {data.name}
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              {data.domain}
            </span>
          </div>
        </div>

        {/* Status Pill */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            soundFX.playClick(2400);
            onToggleStatus(data.id);
          }}
          className={`px-2 py-0.5 text-[10px] font-mono rounded-full border flex items-center gap-1.5 transition-all hover:brightness-125 cursor-pointer ${statusInfo.badgeClass}`}
          title="Click to cycle status (idle / deliberating / executing)"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
          {statusInfo.label}
        </button>
      </div>

      {/* Role & Voice */}
      <div className="mt-2.5 text-xs text-slate-300 leading-snug">
        <p className="font-medium text-slate-200">{data.role}</p>
        <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Tier: {data.tier}</span>
          <span>Voice: {data.voice}</span>
        </div>
      </div>

      {/* Assigned Model Badge */}
      <div className="mt-2.5 flex items-center justify-between p-1.5 rounded bg-black/40 border border-white/5 font-mono text-[11px]">
        <span className="text-slate-400">Model:</span>
        <span className="text-cyan-300 font-semibold">{data.model}</span>
      </div>

      {/* Active Context Connections */}
      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-400">Context Links:</span>
        {data.activeVaults.length === 0 ? (
          <span className="text-slate-500">None (drag cable)</span>
        ) : (
          <div className="flex items-center gap-1">
            {data.activeVaults.map((v) => (
              <span
                key={v}
                className="px-1.5 py-0.5 rounded bg-white/10 text-white text-[10px] uppercase font-bold"
              >
                {v.substring(0, 3)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Port Handle */}
      <div
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#141424] border-2 flex items-center justify-center cursor-crosshair group hover:scale-125 transition-transform z-10"
        style={{ borderColor: data.avatarColor }}
        onMouseDown={(e) => {
          e.stopPropagation();
          soundFX.playClick(2000);
          onStartConnect('agent', data.id, e);
        }}
        title="Connect agent to Execution Gate"
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: data.avatarColor }}
        />
      </div>
    </div>
  );
};
