import * as React from "react";
import { cn } from "@/lib/cn";
import { AgentSigil } from "@/components/AgentSigil";

export interface AgentPresenceProps extends React.HTMLAttributes<HTMLDivElement> {
  agentId: string;
  name: string;
  tier?: string;
  domain?: string;
  status?: "online" | "idle" | "busy" | "offline";
  showSigil?: boolean;
  size?: "sm" | "md" | "lg";
}

const statusColors = {
  online: "bg-[var(--sl-status-ok,#77f0bf)] shadow-[0_0_8px_var(--sl-status-ok,#77f0bf)]",
  idle: "bg-[var(--sl-status-unknown,#b7a2ff)]",
  busy: "bg-[var(--sl-status-warn,#e8c36a)] animate-pulse",
  offline: "bg-slate-500",
};

export function AgentPresence({
  agentId,
  name,
  tier = "Specialist",
  domain = "Universal",
  status = "online",
  showSigil = true,
  size = "md",
  className,
  ...props
}: AgentPresenceProps) {
  const sigilSize = size === "sm" ? 24 : size === "lg" ? 48 : 32;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 rounded-lg border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)]/80 px-3 py-1.5 backdrop-blur-md",
        className
      )}
      {...props}
    >
      {showSigil && (
        <div className="relative flex items-center justify-center">
          <AgentSigil id={agentId} tier={tier} domain={domain} size={sigilSize} />
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[var(--sl-surface-1,#0d1119)]",
              statusColors[status]
            )}
            aria-hidden="true"
          />
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-xs font-medium tracking-tight text-[var(--sl-fg,#ede6d8)] leading-tight">
          {name}
        </span>
        <span className="text-[10px] font-mono text-[var(--sl-fg-muted,#8b93a1)] leading-none mt-0.5">
          {tier} · {domain}
        </span>
      </div>
    </div>
  );
}
