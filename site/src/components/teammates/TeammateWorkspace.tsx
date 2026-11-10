"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Send,
  Paperclip,
  Mic,
  Database,
  Shield,
  Layers,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Globe,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import type { Teammate, ModelTier } from "./types";
import { AgentExecutionTree } from "./AgentExecutionTree";
import { ApprovalCard } from "./ApprovalCard";

interface TeammateWorkspaceProps {
  teammate: Teammate;
  onSendMessage: (teammateId: string, content: string, tier?: ModelTier) => void;
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
  const [selectedTier, setSelectedTier] = useState<ModelTier>(teammate.modelTier);
  const [showSidecar, setShowSidecar] = useState(true);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setSelectedTier(teammate.modelTier);
  }, [teammate.id, teammate.modelTier]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [teammate.messages, teammate.status, isStreaming]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || teammate.status === "running" || isStreaming) return;
    onSendMessage(teammate.id, inputMessage.trim(), selectedTier);
    setInputMessage("");
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-[#06080e]">
      {/* Main Conversation Stream & Input */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Workspace Top Header */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-white/[0.08] bg-[#090b12]">
          <div className="flex items-center gap-3 truncate">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold">
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

          <div className="flex items-center gap-3">
            {/* Model Tier Selector */}
            <div className="hidden sm:flex items-center gap-1 rounded-lg border border-white/[0.08] bg-black/40 p-1 text-xs">
              {[
                { tier: "light" as ModelTier, label: "Light", model: "Gemini 4 Argon / Sol" },
                { tier: "standard" as ModelTier, label: "Standard", model: "Sonnet 5.5" },
                { tier: "frontier" as ModelTier, label: "Frontier", model: "Opus 5.5 / Astra" },
              ].map(({ tier, label, model }) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedTier(tier)}
                  title={`Route to ${model}`}
                  className={`rounded px-2.5 py-1 text-[11px] font-mono transition flex items-center gap-1.5 ${
                    selectedTier === tier
                      ? "bg-indigo-600 text-white font-medium shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <span>{label}</span>
                  <span className="text-[9px] opacity-75 font-sans">({model.split(" ")[0]} {model.split(" ")[1] || ""})</span>
                </button>
              ))}
            </div>

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
                  {teammate.name} executing in Firecracker microVM
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
                <span className="text-[10px] font-mono text-zinc-500">
                  Type @ for connectors &bull; Shift+Enter for new line
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
    </div>
  );
}
