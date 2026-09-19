"use client";

import { useEffect, useState } from "react";

type CopyState = "idle" | "copied" | "failed";

/**
 * Copies `value` to the clipboard. Progressive enhancement: the text it copies
 * is always rendered as selectable text next to it, so nothing depends on this
 * button, on JavaScript, or on clipboard permission.
 */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [state, setState] = useState<CopyState>("idle");

  useEffect(() => {
    if (state === "idle") return;
    const t = window.setTimeout(() => setState("idle"), 2000);
    return () => window.clearTimeout(t);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  const text = state === "copied" ? "Copied" : state === "failed" ? "Select to copy" : "Copy";
  const announcement =
    state === "copied"
      ? `${label} copied`
      : state === "failed"
        ? `Could not copy ${label}. Select the text instead.`
        : "";

  return (
    <>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label}`}
        className={`inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md border px-3 font-mono text-[11px] uppercase tracking-widest transition-micro ${
          state === "copied"
            ? "border-emerald-400/30 text-emerald-300"
            : state === "failed"
              ? "border-amber-400/30 text-amber-300"
              : "border-white/[0.1] text-slate-400 hover:border-white/[0.2] hover:text-white"
        }`}
      >
        {text}
      </button>
    </>
  );
}
