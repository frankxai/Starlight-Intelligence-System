"use client";

import React, { useState } from "react";
import {
  Send,
  Paperclip,
  Mic,
  Database,
  Shield,
  CheckCircle,
  SlidersHorizontal,
  Loader2,
  Terminal,
  Cpu,
  ChevronDown,
} from "lucide-react";
import type { Teammate, ModelTier, FrontierModelId, FrontierModelDef } from "./types";
import { AgentExecutionTree } from "./AgentExecutionTree";
import { ApprovalCard } from "./ApprovalCard";
import { AutonomicHeartbeatPill } from "./AutonomicHeartbeatPill";
import { SandboxConsoleDrawer } from "./SandboxConsoleDrawer";

export const FRONTIER_MODELS: FrontierModelDef[] = [
  {
    id: "claude-sonnet-5-5",
    name: "Claude Sonnet 5.5",
    shortLabel: "Sonnet 5.5",
    provider: "Anthropic",
    tier: "standard",
    contextWindow: "200k tokens",
    description: "Balanced reasoning, agent orchestration & precision coding",
  },
  {
    id: "gemini-4-argon",
    name: "Gemini 4 Argon",
    shortLabel: "Gemini 4 Argon",
    provider: "Google",
    tier: "light",
    contextWindow: "2M tokens",
    description: "High-throughput multimodal parsing & cross-repo indexing",
  },
  {
    id: "claude-opus-5-5",
    name: "Claude Opus 5.5",
    shortLabel: "Opus 5.5",
    provider: "Anthropic",
    tier: "frontier",
    contextWindow: "200k tokens",
    description: "Maximum intelligence, architectural synthesis & complex refactoring",
  },
  {
    id: "gpt-6-1-sol",
    name: "GPT-6.1 Sol",
    shortLabel: "GPT-6.1 Sol",
    provider: "OpenAI",
    tier: "frontier",
    contextWindow: "128k tokens",
    description: "Autonomous tool execution, microVM script runner & agent synthesis",
  },
];

interface TeammateWorkspaceProps {
  teammate: Teammate;
  onSendMessage: (teammateId: string, content: string, tier?: ModelTier, modelId?: string) => void;
  onApproveAction?: (requestId: string) => void;
  onRejectAction?: (requestId: string) => void;
  isStreaming?: boolean;
}

export function TeammateWorkspace({
  teammate,
  onSendMessage,
  onApproveAction,
  onRejectAction,
  isStreaming = false,
}: TeammateWorkspaceProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [selectedModelId, setSelectedModelId] = useState<FrontierModelId>(() => {
    if (teammate.modelTier === "light") return "gemini-4-argon";
    if (teammate.modelTier === "frontier") return "claude-opus-5-5";
    return "claude-sonnet-5-5";
  });
  const [selectedTier, setSelectedTier] = useState<ModelTier>(teammate.modelTier);
  const [showSidecar, setShowSidecar] = useState(true);
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const activeModel =
    FRONTIER_MODELS.find((m) => m.id === selectedModelId) || FRONTIER_MODELS[0];

  React.useEffect(() => {
    if (teammate.modelTier === "light") {
      setSelectedModelId("gemini-4-argon");
      setSelectedTier("light");
    } else if (teammate.modelTier === "frontier") {
      setSelectedModelId("claude-opus-5-5");
      setSelectedTier("frontier");
    } else {
      setSelectedModelId("claude-sonnet-5-5");
      setSelectedTier("standard");
    }
  }, [teammate.id, teammate.modelTier]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [teammate.messages, teammate.status, isStreaming]);

  const handleModelSelect = (model: FrontierModelDef) => {
    setSelectedModelId(model.id);
    setSelectedTier(model.tier);
    setIsModelDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || teammate.status === "running" || isStreaming) return;
    onSendMessage(teammate.id, inputMessage.trim(), selectedTier, selectedModelId);
    setInputMessage("");
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-[#06080e]">
      {/* Main Conversation Stream & Input */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Workspace Top Header */}
        <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-white/[0.08] bg-[#090b12]">
          <div className="flex items-center gap-3 truncate">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold shrink-0">
              {teammate.name.charAt(0)}
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white truncate">
                  {teammate.name}
                </h2>
                {teammate.status === "running" ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-mono text-indigo-400">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500" />
                    </span>
                    executing stream
                  </span>
                ) : teammate.status === "waiting_approval" ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono text-amber-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    waiting approval
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    idle
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 truncate">{teammate.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Autonomic Heartbeat Pill in Header */}
            <AutonomicHeartbeatPill />

            {/* Model Selector (Claude Sonnet 5.5, Gemini 4 Argon, Claude Opus 5.5, GPT-6.1 Sol) */}
            <div className="hidden lg:flex items-center gap-1 rounded-lg border border-white/[0.08] bg-black/40 p-1 text-xs">
              <div className="flex items-center gap-1 px-1.5 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                <Cpu className="h-3 w-3 text-indigo-400" />
              </div>
              {FRONTIER_MODELS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleModelSelect(m)}
                  title={`${m.name} (${m.provider}) - ${m.description}`}
                  className={`rounded px-2.5 py-1 text-[11px] font-mono transition flex items-center gap-1.5 ${
                    selectedModelId === m.id
                      ? "bg-indigo-600 text-white font-medium shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <span>{m.shortLabel}</span>
                </button>
              ))}
            </div>

            {/* Compact Model Selector for Mobile / Tablet */}
            <div className="relative lg:hidden">
              <button
                type="button"
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-black/40 px-2.5 py-1 text-xs font-mono text-zinc-300 hover:text-white"
              >
                <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                <span>{activeModel.shortLabel}</span>
                <ChevronDown className="h-3 w-3 text-zinc-500" />
              </button>

              {isModelDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsModelDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 z-40 w-56 rounded-xl border border-white/[0.1] bg-[#0c0f1d] p-1.5 shadow-xl font-mono text-xs">
                    {FRONTIER_MODELS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleModelSelect(m)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg transition flex items-center justify-between ${
                          selectedModelId === m.id
                            ? "bg-indigo-600 text-white font-medium"
                            : "text-zinc-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div>
                          <div>{m.name}</div>
                          <div className="text-[10px] opacity-75 font-sans">
                            {m.provider} &bull; {m.tier}
                          </div>
                        </div>
                        {selectedModelId === m.id && (
                          <CheckCircle className="h-3.5 w-3.5" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Interactive Sandboxed Code Execution Button */}
            <button
              type="button"
              onClick={() => setIsSandboxOpen(true)}
              title="Launch Sandboxed Code Execution Console"
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-mono text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition shadow-sm active:scale-[0.98]"
            >
              <Terminal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">MicroVM Sandbox</span>
            </button>

            {/* Context Sidecar Toggle */}
            <button
              type="button"
              onClick={() => setShowSidecar(!showSidecar)}
              title="Toggle context sidecar"
              aria-label="Toggle context sidecar"
              className="p-2 rounded-lg border border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.05]"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {teammate.messages.map((message) => {
            const isUser = message.sender === "user";

            return (
              <div
                key={message.id}
                className={`flex gap-3 max-w-4xl ${
                  isUser ? "ml-auto justify-end" : "mr-auto justify-start"
                }`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold mt-1">
                    {teammate.name.charAt(0)}
                  </div>
                )}

                <div
                  className={`rounded-2xl px-5 py-4 text-xs leading-relaxed ${
                    isUser
                      ? "bg-indigo-600 text-white max-w-xl rounded-tr-sm"
                      : "bg-[#0d101a] border border-white/[0.08] text-zinc-200 w-full rounded-tl-sm"
                  }`}
                >
                  {message.content ? (
                    <div className="whitespace-pre-line font-sans">{message.content}</div>
                  ) : (
                    <div className="flex items-center gap-2 text-indigo-300 font-mono text-xs py-1">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400 shrink-0" />
                      <span>Evaluating context &amp; dispatching microVM execution...</span>
                    </div>
                  )}

                  {message.executionTree && (
                    <AgentExecutionTree steps={message.executionTree} />
                  )}

                  {message.approvalRequest && (
                    <ApprovalCard
                      request={message.approvalRequest}
                      onApprove={onApproveAction}
                      onReject={onRejectAction}
                    />
                  )}

                  <div className="mt-2 text-[10px] font-mono text-zinc-500 text-right">
                    {message.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {teammate.status === "running" && (
            <div className="flex items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-950/20 px-4 py-2.5 text-xs text-indigo-300 animate-pulse">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-400 shrink-0" />
                <span className="font-medium">
                  {teammate.name} executing in Firecracker microVM via {activeModel.name}
                </span>
              </div>
              <span className="text-[10px] font-mono text-indigo-400/80">
                SSE Step Stream Active
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Composer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#090b12]">
          <form
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto rounded-xl border border-white/[0.1] bg-[#0d101a] p-2 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50"
          >
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Instruct teammate or type @ to reference connected tools..."
              rows={2}
              className="w-full resize-none bg-transparent px-2 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] px-1 text-zinc-400">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="Attach file"
                  aria-label="Attach file"
                  className="p-1 rounded hover:bg-white/5 hover:text-white"
                >
                  <Paperclip className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Voice dictation"
                  aria-label="Voice dictation"
                  className="p-1 rounded hover:bg-white/5 hover:text-white"
                >
                  <Mic className="h-3.5 w-3.5" />
                </button>
                <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
                  Routing via <span className="text-indigo-400 font-medium">{activeModel.name}</span> ({activeModel.tier} tier)
                </span>
              </div>

              <button
                type="submit"
                disabled={!inputMessage.trim() || teammate.status === "running" || isStreaming}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-30 disabled:pointer-events-none active:scale-[0.98] transition"
              >
                {teammate.status === "running" || isStreaming ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3" />
                    <span>Dispatch</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right-Hand Context Sidecar */}
      {showSidecar && (
        <aside
          aria-label="Active Context and Vault Sidecar"
          className="hidden lg:flex flex-col w-80 border-l border-white/[0.08] bg-[#090b12] text-zinc-300"
        >
          <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-2">
              <Database className="h-3.5 w-3.5 text-indigo-400" />
              Active Intelligence Context
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Live</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
            {/* Active Model Info */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Active Model
                </span>
                <span className="rounded bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 text-[9px] font-mono uppercase">
                  {activeModel.tier}
                </span>
              </div>
              <div className="font-semibold text-white text-xs">{activeModel.name}</div>
              <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                Provider: {activeModel.provider} &bull; {activeModel.contextWindow}
              </div>
              <p className="text-[10px] text-zinc-500 mt-1.5 leading-normal">
                {activeModel.description}
              </p>
            </div>

            {/* Active Vaults */}
            <div>
              <h4 className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
                Bound Memory Vaults
              </h4>
              <div className="space-y-1.5">
                {teammate.activeVaults.map((vault) => (
                  <div
                    key={vault}
                    className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-zinc-300 font-mono text-[11px]"
                  >
                    <span className="capitalize">{vault} Vault</span>
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Connected MCP Tools */}
            <div>
              <h4 className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
                Mounted MCP Servers
              </h4>
              <div className="space-y-1.5">
                {teammate.connectedTools.map((tool) => (
                  <div
                    key={tool}
                    className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-zinc-300 font-mono text-[11px]"
                  >
                    <span>{tool}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Safe Autonomy Guardrails */}
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3">
              <div className="flex items-center gap-1.5 text-indigo-300 font-semibold mb-1">
                <Shield className="h-3.5 w-3.5" />
                <span>Fail-Closed Governance</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Financial transfers and live production deployments are physically blocked without 1-click human signature.
              </p>
            </div>
          </div>
        </aside>
      )}

      {/* Interactive Sandboxed Code Execution Drawer */}
      <SandboxConsoleDrawer
        isOpen={isSandboxOpen}
        onClose={() => setIsSandboxOpen(false)}
      />
    </div>
  );
}
