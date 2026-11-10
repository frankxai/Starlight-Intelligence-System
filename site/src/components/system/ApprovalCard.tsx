import * as React from "react";
import { cn } from "@/lib/cn";
import { ShieldIcon, CheckIcon, CloseIcon } from "@/components/icons";

export interface ApprovalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  scope: string;
  risk?: "low" | "medium" | "high" | "critical";
  status?: "pending" | "approved" | "rejected";
  onApprove?: () => void;
  onReject?: () => void;
  children?: React.ReactNode;
}

export function ApprovalCard({
  title,
  scope,
  risk = "high",
  status = "pending",
  onApprove,
  onReject,
  children,
  className,
  ...props
}: ApprovalCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-[var(--sl-gold,#c9a15c)]/40 bg-[var(--sl-surface-1,#0d1119)] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.32)] transition-std",
        className
      )}
      {...props}
    >
      {/* Decorative gold hairline top accent */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--sl-gold,#c9a15c)] to-transparent" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--sl-gold,#c9a15c)]/30 bg-[var(--sl-gold,#c9a15c)]/10 text-[var(--sl-gold,#c9a15c)]">
            <ShieldIcon size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold tracking-tight text-[var(--sl-fg,#ede6d8)]">
                {title}
              </h4>
              <span className="rounded border border-[var(--sl-gold,#c9a15c)]/40 px-1.5 py-0.2 text-[10px] font-mono uppercase tracking-wider text-[var(--sl-gold,#c9a15c)]">
                Human Gate
              </span>
            </div>
            <p className="text-xs text-[var(--sl-fg-muted,#8b93a1)] mt-0.5">
              Scope: <span className="font-mono text-[var(--sl-fg,#ede6d8)]">{scope}</span>
            </p>
          </div>
        </div>

        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider border",
            risk === "critical"
              ? "border-red-500/50 bg-red-500/10 text-red-400"
              : risk === "high"
              ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
              : "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
          )}
        >
          {risk} risk
        </span>
      </div>

      {children && (
        <div className="mt-3.5 border-t border-[var(--sl-border,rgba(237,230,216,0.12))] pt-3 text-xs leading-relaxed text-[var(--sl-fg-muted,#8b93a1)]">
          {children}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-[var(--sl-border,rgba(237,230,216,0.12))] pt-3.5">
        <span className="text-[11px] font-mono text-[var(--sl-fg-muted,#8b93a1)]">
          Doctrine 0: Agents stage, humans execute
        </span>
        <div className="flex items-center gap-2">
          {status === "pending" ? (
            <>
              {onReject && (
                <button
                  type="button"
                  onClick={onReject}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-[var(--sl-fg,#ede6d8)] hover:bg-white/[0.08] transition-micro"
                >
                  <CloseIcon size={13} />
                  Reject
                </button>
              )}
              <button
                type="button"
                onClick={onApprove}
                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--sl-accent-fill,#c9a15c)] bg-[var(--sl-accent-fill,#c9a15c)] px-3 py-1.5 text-xs font-medium text-[var(--sl-on-accent,#070a10)] hover:opacity-90 transition-micro shadow-[0_2px_12px_rgba(201,161,92,0.3)]"
              >
                <CheckIcon size={13} />
                Sign & Authorize
              </button>
            </>
          ) : (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-mono font-medium",
                status === "approved"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-red-500/20 text-red-300 border border-red-500/30"
              )}
            >
              {status === "approved" ? "Signed & Executed" : "Rejected"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
