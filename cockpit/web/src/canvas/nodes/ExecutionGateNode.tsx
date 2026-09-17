import React from 'react';
import type { ExecutionGateData } from '../../types/cockpit';
import { soundFX } from '../../audio/soundFX';

interface ExecutionGateNodeProps {
  data: ExecutionGateData;
  onStartConnect: (portType: 'gate', gateId: string, event: React.MouseEvent) => void;
  onEvaluateGate: (gateId: string) => void;
}

export const ExecutionGateNode: React.FC<ExecutionGateNodeProps> = ({
  data,
  onStartConnect,
  onEvaluateGate,
}) => {
  const getStatusBadge = () => {
    switch (data.status) {
      case 'ratified':
        return {
          label: 'RATIFIED',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dotClass: 'bg-emerald-400',
        };
      case 'auditing':
        return {
          label: 'AUDITING',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dotClass: 'bg-amber-400 animate-spin',
        };
      case 'rejected':
        return {
          label: 'REJECTED',
          badgeClass: 'bg-red-500/20 text-red-300 border-red-500/40',
          dotClass: 'bg-red-400',
        };
      case 'pending':
      default:
        return {
          label: 'PENDING',
          badgeClass: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
          dotClass: 'bg-slate-400',
        };
    }
  };

  const statusInfo = getStatusBadge();

  return (
    <div
      className="relative rounded-xl border border-white/10 bg-[#0d0a18]/95 backdrop-blur-md p-4 w-[300px] shadow-2xl transition-all select-none hover:border-violet-500/40"
      style={{
        boxShadow: `0 8px 30px -4px rgba(191, 149, 252, 0.25)`,
        borderColor: data.status === 'ratified' ? '#50e3c2' : '#bf95fc40',
      }}
    >
      {/* Top Port Handle */}
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#181226] border-2 border-violet-400 flex items-center justify-center cursor-crosshair group hover:scale-125 transition-transform z-10"
        onMouseDown={(e) => {
          e.stopPropagation();
          soundFX.playClick(2000);
          onStartConnect('gate', data.id, e);
        }}
        title="Connect input context to Execution Gate"
      >
        <div className="w-2 h-2 rounded-full bg-violet-400" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-300 flex items-center justify-center font-bold text-xs">
            SIP
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide font-display">
              {data.name}
            </h3>
            <span className="text-[10px] font-mono text-violet-300/80 uppercase">
              {data.gateType === 'santa-review' ? 'Santa Review Loop' : 'Consensus Gate'}
            </span>
          </div>
        </div>

        <span className={`px-2 py-0.5 text-[10px] font-mono rounded-full border flex items-center gap-1.5 ${statusInfo.badgeClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
          {statusInfo.label}
        </span>
      </div>

      {/* Audit Criteria Checklist */}
      <div className="mt-3 space-y-1.5">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
          Invariant Criteria:
        </span>
        {data.criteria.map((c, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-1.5 rounded bg-black/30 border border-white/5 text-[11px] font-mono"
          >
            <span className="text-slate-300 truncate max-w-[190px]">{c.name}</span>
            <span className={c.passed ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
              {c.passed ? '✓ PASS' : '○ PEND'}
            </span>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
        <button
          onClick={(e) => {
            e.stopPropagation();
            soundFX.playClick(2600);
            onEvaluateGate(data.id);
          }}
          disabled={data.status === 'auditing'}
          className="w-full py-1.5 px-3 rounded bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 border border-violet-500/40 text-xs font-mono font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {data.status === 'auditing' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-violet-300 animate-spin" />
              Auditing Invariants...
            </>
          ) : data.status === 'ratified' ? (
            '✓ Re-verify Gate'
          ) : (
            '▶ Execute Santa Audit'
          )}
        </button>
      </div>

      {/* Bottom Port Handle */}
      <div
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#181226] border-2 border-violet-400 flex items-center justify-center cursor-crosshair group hover:scale-125 transition-transform z-10"
        onMouseDown={(e) => {
          e.stopPropagation();
          soundFX.playClick(2000);
          onStartConnect('gate', data.id, e);
        }}
        title="Connect output to downstream node"
      >
        <div className="w-2 h-2 rounded-full bg-violet-400" />
      </div>
    </div>
  );
};
