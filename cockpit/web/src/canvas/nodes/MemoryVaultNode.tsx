import React, { useState, useMemo } from 'react';
import type { VaultMetadata, VaultEntry } from '../../types/cockpit';
import { substrateDB } from '../../memory/sqliteSubstrate';
import { soundFX } from '../../audio/soundFX';

interface MemoryVaultNodeProps {
  metadata: VaultMetadata;
  connectedToAgents: string[];
  onStartConnect: (portType: 'vault', vaultId: string, event: React.MouseEvent) => void;
  onSelectEntry?: (entry: VaultEntry) => void;
}

export const MemoryVaultNode: React.FC<MemoryVaultNodeProps> = ({
  metadata,
  connectedToAgents,
  onStartConnect,
  onSelectEntry,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Instant in-memory search from SQLite substrate
  const searchResults = useMemo(() => {
    return substrateDB.searchFTS(searchTerm, { vault: metadata.id, limit: 5 });
  }, [searchTerm, metadata.id]);

  const totalVaultCount = useMemo(() => {
    return substrateDB.getStats().vaultCounts[metadata.id] ?? 0;
  }, [metadata.id]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    soundFX.playClick(2800);
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playClick(2200);
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className="relative rounded-xl border border-white/10 bg-[#0a0a12]/90 backdrop-blur-md p-4 w-[340px] shadow-2xl transition-all select-none hover:border-white/20"
      style={{
        boxShadow: `0 8px 32px -4px ${metadata.glowColor}`,
        borderColor: connectedToAgents.length > 0 ? metadata.color : undefined,
      }}
    >
      {/* Top Port Handle: for incoming/outgoing context links */}
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#12121e] border-2 flex items-center justify-center cursor-crosshair group hover:scale-125 transition-transform z-10"
        style={{ borderColor: metadata.color }}
        onMouseDown={(e) => {
          e.stopPropagation();
          soundFX.playClick(2000);
          onStartConnect('vault', metadata.id, e);
        }}
        title="Drag context link to an Agent"
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: metadata.color }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shadow-inner"
            style={{ backgroundColor: `${metadata.color}20`, color: metadata.color }}
          >
            {metadata.glyph}
          </span>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide font-display">
              {metadata.name}
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              {metadata.retention}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className="px-2 py-0.5 text-[11px] font-mono rounded-full border"
            style={{
              backgroundColor: `${metadata.color}15`,
              color: metadata.color,
              borderColor: `${metadata.color}40`,
            }}
          >
            {totalVaultCount} entries
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="mt-2 text-xs text-slate-400 leading-relaxed">
        {metadata.description}
      </p>

      {/* Connected Context Links Indicator */}
      {connectedToAgents.length > 0 && (
        <div className="mt-2.5 flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          Active context link: {connectedToAgents.join(', ')}
        </div>
      )}

      {/* In-Node Live Search */}
      <div className="mt-3">
        <div className="relative">
          <input
            type="text"
            placeholder={`Search ${metadata.name.toLowerCase()}...`}
            value={searchTerm}
            onChange={handleSearchChange}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-md text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-white/30"
          />
          {searchTerm && (
            <span className="absolute right-2 top-1.5 text-[10px] font-mono text-emerald-400">
              {searchResults.length} hits (&lt;0.5ms)
            </span>
          )}
        </div>
      </div>

      {/* Vector Cluster Tags */}
      <div className="mt-2.5 flex flex-wrap gap-1">
        {metadata.tags.map((tag) => (
          <button
            key={tag}
            onClick={(e) => {
              e.stopPropagation();
              setSearchTerm(tag);
              soundFX.playClick(2400);
            }}
            className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-all"
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Preview Section */}
      <div className="mt-3 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{searchTerm ? 'Search Results' : 'Recent Entries'}</span>
          <button
            onClick={toggleExpand}
            className="hover:text-white font-mono text-[10px]"
          >
            {isExpanded ? 'Collapse ▲' : 'Expand ▼'}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {searchResults.map((res) => (
              <div
                key={res.entry.id}
                onClick={(e) => {
                  e.stopPropagation();
                  soundFX.playClick(2200);
                  if (onSelectEntry) onSelectEntry(res.entry);
                }}
                className="p-2 rounded bg-black/30 hover:bg-white/5 border border-white/5 cursor-pointer text-left transition-colors"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span className="text-cyan-400 font-semibold">{res.entry.category}</span>
                  <span>{res.entry.createdAt.substring(0, 10)}</span>
                </div>
                <p className="mt-1 text-xs text-slate-200 line-clamp-2 leading-relaxed">
                  {res.entry.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Port Handle: for incoming context queries */}
      <div
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#12121e] border-2 flex items-center justify-center cursor-crosshair group hover:scale-125 transition-transform z-10"
        style={{ borderColor: metadata.color }}
        onMouseDown={(e) => {
          e.stopPropagation();
          soundFX.playClick(2000);
          onStartConnect('vault', metadata.id, e);
        }}
        title="Connect to Agent context"
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: metadata.color }}
        />
      </div>
    </div>
  );
};
