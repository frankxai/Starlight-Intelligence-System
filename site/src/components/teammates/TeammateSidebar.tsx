"use client";

import React, { useState } from "react";
import {
  Users,
  FolderGit2,
  Search,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Plus,
  Compass,
  Cpu,
} from "lucide-react";
import type { Teammate, ProjectContext } from "./types";

interface TeammateSidebarProps {
  teammates: Teammate[];
  projects: ProjectContext[];
  selectedTeammateId: string;
  onSelectTeammate: (id: string) => void;
  onSelectProject?: (id: string) => void;
}

export function TeammateSidebar({
  teammates,
  projects,
  selectedTeammateId,
  onSelectTeammate,
}: TeammateSidebarProps) {
  const [filterQuery, setFilterQuery] = useState("");
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);

  const filteredTeammates = teammates.filter((t) =>
    t.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    t.role.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <aside
      aria-label="Teammates and Projects Navigation"
      className="flex flex-col h-full w-full md:w-64 border-r border-white/[0.08] bg-[#090b12] text-zinc-300"
    >
      {/* Header / Brand */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-white">
            Starlight Swarm
          </span>
        </div>
        <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
          SIP v8.3
        </span>
      </div>

      {/* Filter / Search input */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search teammates..."
            aria-label="Filter teammates"
            className="w-full rounded-lg border border-white/[0.06] bg-black/40 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500/50 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/50"
          />
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4">
        {/* Teammates Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5 text-[11px] font-mono tracking-wider text-zinc-500 uppercase">
            <span className="flex items-center gap-1.5">
              <Users className="h-3 w-3" />
              Teammates ({teammates.length})
            </span>
            <button
              type="button"
              title="Create new teammate"
              aria-label="Create new teammate"
              className="hover:text-white p-0.5 rounded hover:bg-white/5 transition"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-0.5">
            {filteredTeammates.map((teammate) => {
              const isSelected = teammate.id === selectedTeammateId;

              return (
                <button
                  key={teammate.id}
                  type="button"
                  onClick={() => onSelectTeammate(teammate.id)}
                  aria-current={isSelected ? "page" : undefined}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-colors ${
                    isSelected
                      ? "bg-white/[0.08] text-white font-medium border-l-2 border-indigo-400"
                      : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`relative flex h-2 w-2 rounded-full ${
                        teammate.status === "running"
                          ? "bg-emerald-400"
                          : teammate.status === "waiting_approval"
                          ? "bg-amber-400"
                          : "bg-zinc-600"
                      }`}
                    >
                      {teammate.status === "running" && (
                        <span className="absolute -inset-0.5 animate-ping rounded-full bg-emerald-400/40" />
                      )}
                    </span>
                    <span className="truncate">{teammate.name}</span>
                  </div>

                  {teammate.unreadCount > 0 && (
                    <span className="rounded-full bg-indigo-500/20 border border-indigo-500/40 px-1.5 py-0.2 text-[10px] font-mono font-semibold text-indigo-300">
                      {teammate.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Projects Section */}
        <div>
          <button
            type="button"
            onClick={() => setIsProjectsOpen(!isProjectsOpen)}
            className="w-full flex items-center justify-between px-2 mb-1.5 text-[11px] font-mono tracking-wider text-zinc-500 uppercase hover:text-zinc-300"
          >
            <span className="flex items-center gap-1.5">
              <FolderGit2 className="h-3 w-3" />
              Projects ({projects.length})
            </span>
            {isProjectsOpen ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>

          {isProjectsOpen && (
            <div className="space-y-0.5">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200 cursor-pointer"
                >
                  <span className="truncate">{project.name}</span>
                  <span className="text-[10px] font-mono text-zinc-600">
                    {project.activeBranch}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Operator Status Footer */}
      <div className="border-t border-white/[0.08] p-3 text-xs bg-black/20">
        <div className="flex items-center justify-between mb-1">
          <span className="text-zinc-400 flex items-center gap-1">
            <Cpu className="h-3 w-3 text-cyan-400" />
            Operator Mode
          </span>
          <span className="text-[10px] font-mono text-emerald-400">Autonomous</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
          <Compass className="h-3 w-3" />
          <span>6 Vaults Active &bull; The Veil On</span>
        </div>
      </div>
    </aside>
  );
}
