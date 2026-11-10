import * as React from "react";
import { cn } from "@/lib/cn";

export type StatusType = "ok" | "warn" | "breach" | "unknown" | "idle" | "running" | "blocked" | "complete";

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: StatusType;
  showGlyph?: boolean;
}

const statusGlyphs: Record<string, string> = {
  ok: "●",
  complete: "●",
  warn: "▲",
  breach: "■",
  blocked: "■",
  unknown: "◆",
  running: "●",
  idle: "◆",
};

const statusLabels: Record<string, string> = {
  ok: "OK",
  complete: "Complete",
  warn: "Warn",
  breach: "Breach",
  blocked: "Blocked",
  unknown: "Unknown",
  running: "Running",
  idle: "Idle",
};

export function StatusBadge({
  status = "unknown",
  showGlyph = true,
  className,
  children,
  ...props
}: StatusBadgeProps) {
  const normalized = status.toLowerCase();
  const glyph = statusGlyphs[normalized] ?? "◆";
  const label = children ?? statusLabels[normalized] ?? status;

  return (
    <span
      data-slot="status-badge"
      data-status={normalized}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide border transition-micro",
        normalized === "ok" || normalized === "complete"
          ? "text-[var(--sl-status-ok,#77f0bf)] border-[var(--sl-status-ok-border,rgba(119,240,191,0.42))] bg-[var(--sl-status-ok-tint,rgba(119,240,191,0.1))]"
          : normalized === "warn"
          ? "text-[var(--sl-status-warn,#e8c36a)] border-[var(--sl-status-warn-border,rgba(232,195,106,0.46))] bg-[var(--sl-status-warn-tint,rgba(232,195,106,0.14))]"
          : normalized === "breach" || normalized === "blocked"
          ? "text-[var(--sl-status-breach,#ff7b7b)] border-[var(--sl-status-breach-border,rgba(255,123,123,0.55))] bg-[var(--sl-status-breach-tint,rgba(255,123,123,0.16))]"
          : "text-[var(--sl-status-unknown,#b7a2ff)] border-[var(--sl-status-unknown-border,rgba(183,162,255,0.42))] bg-[var(--sl-status-unknown-tint,rgba(183,162,255,0.1))]",
        className
      )}
      {...props}
    >
      {showGlyph && (
        <span className="text-[10px] leading-none" aria-hidden="true">
          {glyph}
        </span>
      )}
      <span>{label}</span>
    </span>
  );
}
