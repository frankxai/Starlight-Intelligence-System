import * as React from "react";
import { cn } from "@/lib/cn";

export interface EvidenceDisclosureProps
  extends Omit<React.HTMLAttributes<HTMLDetailsElement>, "title"> {
  summary: React.ReactNode;
  open?: boolean;
}

export function EvidenceDisclosure({
  summary,
  children,
  className,
  ...props
}: EvidenceDisclosureProps) {
  return (
    <details
      data-slot="evidence-disclosure"
      className={cn(
        "group border-t border-b border-[var(--sl-border,rgba(237,230,216,0.12))] text-xs font-mono text-[var(--sl-fg-muted,#8b93a1)]",
        className
      )}
      {...props}
    >
      <summary className="flex items-center justify-between gap-4 py-3 cursor-pointer list-none select-none font-medium text-[var(--sl-fg,#ede6d8)] hover:text-white transition-micro [&::-webkit-details-marker]:none">
        <span className="flex items-center gap-2">{summary}</span>
        <span
          className="text-base font-normal transition-transform duration-150 group-open:rotate-45"
          aria-hidden="true"
        >
          +
        </span>
      </summary>
      <div className="pb-4 pt-1 leading-relaxed break-all text-[var(--sl-fg-muted,#8b93a1)]">
        {children}
      </div>
    </details>
  );
}
