"use client";

import React, { useState } from "react";
import { ShieldAlert, GitPullRequest, DollarSign, Rocket, Check, X, Eye } from "lucide-react";
import type { ApprovalRequest } from "./types";

interface ApprovalCardProps {
  request: ApprovalRequest;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function ApprovalCard({ request, onApprove, onReject }: ApprovalCardProps) {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">(request.status);
  const [showDetails, setShowDetails] = useState(false);

  const handleApprove = () => {
    setStatus("approved");
    onApprove?.(request.id);
  };

  const handleReject = () => {
    setStatus("rejected");
    onReject?.(request.id);
  };

  const getBadge = () => {
    switch (request.type) {
      case "FINANCIAL":
        return {
          icon: <DollarSign className="h-4 w-4 text-emerald-400" />,
          label: "FINANCIAL TRANSACTION",
          border: "border-emerald-500/30",
          bg: "bg-emerald-500/10",
          text: "text-emerald-300",
        };
      case "GIT_MERGE":
        return {
          icon: <GitPullRequest className="h-4 w-4 text-indigo-400" />,
          label: "PULL REQUEST MERGE",
          border: "border-indigo-500/30",
          bg: "bg-indigo-500/10",
          text: "text-indigo-300",
        };
      case "DEPLOYMENT":
        return {
          icon: <Rocket className="h-4 w-4 text-amber-400" />,
          label: "PRODUCTION DEPLOY",
          border: "border-amber-500/30",
          bg: "bg-amber-500/10",
          text: "text-amber-300",
        };
      default:
        return {
          icon: <ShieldAlert className="h-4 w-4 text-cyan-400" />,
          label: "GOVERNANCE GATE",
          border: "border-cyan-500/30",
          bg: "bg-cyan-500/10",
          text: "text-cyan-300",
        };
    }
  };

  const badge = getBadge();

  return (
    <div
      role="region"
      aria-label={`Approval request: ${request.title}`}
      className={`my-4 rounded-xl border p-4 transition-all ${
        status === "approved"
          ? "border-emerald-500/40 bg-emerald-950/20"
          : status === "rejected"
          ? "border-rose-500/40 bg-rose-950/20"
          : "border-amber-500/30 bg-[#121524] shadow-lg shadow-black/40"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-mono font-semibold ${badge.border} ${badge.bg} ${badge.text}`}>
          {badge.icon}
          {badge.label}
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          SIP Non-Waivable Invariant §5
        </span>
      </div>

      <h4 className="text-sm font-semibold text-white mb-1.5">
        {request.title}
      </h4>

      <p className="text-xs text-zinc-300 leading-relaxed mb-3">
        {request.description}
      </p>

      <div className="rounded-lg border border-white/[0.06] bg-black/40 p-2.5 mb-4 text-xs font-mono text-zinc-400">
        <span className="text-amber-400 font-bold">Consequence: </span>
        {request.consequences}
      </div>

      {request.details && showDetails && (
        <div className="mb-4 overflow-x-auto rounded-lg border border-white/[0.06] bg-black/60 p-3 text-[11px] font-mono text-zinc-300">
          {Object.entries(request.details).map(([key, value]) => (
            <div key={key} className="flex justify-between py-0.5">
              <span className="text-zinc-500">{key}:</span>
              <span className="text-zinc-200">{value}</span>
            </div>
          ))}
        </div>
      )}

      {status === "pending" ? (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={handleApprove}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 active:scale-[0.98] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <Check className="h-3.5 w-3.5" />
            Approve &amp; Execute
          </button>

          {request.details && (
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 active:scale-[0.98] transition"
            >
              <Eye className="h-3.5 w-3.5" />
              {showDetails ? "Hide Details" : "Inspect Diff"}
            </button>
          )}

          <button
            type="button"
            onClick={handleReject}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/10 active:scale-[0.98] transition"
          >
            <X className="h-3.5 w-3.5" />
            Reject Plan
          </button>
        </div>
      ) : status === "approved" ? (
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
          <Check className="h-4 w-4" />
          Operator Approved &bull; Executing in secure Firecracker microVM
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs font-medium text-rose-400">
          <X className="h-4 w-4" />
          Plan Rejected &bull; Rollback to safe checkpoint confirmed
        </div>
      )}
    </div>
  );
}
