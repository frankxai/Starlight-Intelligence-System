"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { allNodes, type Node as SubstrateNode } from "@/data/substrate";

/**
 * Global ⌘K command palette.
 *
 * Navigates the REAL substrate graph (allNodes from data/substrate.ts) — no
 * synthetic entries. Selecting a node routes to /substrate?view=2d&focus=<id>;
 * the 2D graph reads ?focus and centers + rings that node.
 */

const KIND_LABEL: Record<SubstrateNode["kind"], string> = {
  core: "core",
  vault: "vault",
  vertical: "vertical",
};

function fuzzyScore(query: string, target: string): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t.includes(q)) return 100 - t.indexOf(q);
  let qi = 0;
  let score = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      score += 1;
      qi += 1;
    }
  }
  return qi === q.length ? score : -1;
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    return allNodes
      .map((n) => ({
        node: n,
        score: Math.max(
          fuzzyScore(query, n.name),
          fuzzyScore(query, n.private ? "" : n.desc),
          fuzzyScore(query, n.kind),
        ),
      }))
      .filter((r) => r.score >= 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.node);
  }, [query]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const select = useCallback(
    (node: SubstrateNode) => {
      close();
      router.push(`/substrate?view=2d&focus=${encodeURIComponent(node.id)}`);
    },
    [router, close],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  const onPanelKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => (results.length ? (a + 1) % results.length : 0));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) =>
          results.length ? (a - 1 + results.length) % results.length : 0,
        );
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const node = results[active];
        if (node) select(node);
        return;
      }
      if (e.key === "Tab") {
        // Focus trap — only the input and rows are focusable; keep focus inside.
        e.preventDefault();
      }
    },
    [results, active, select, close],
  );

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-idx="${active}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[18vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onKeyDown={onPanelKeyDown}
    >
      <button
        type="button"
        aria-label="Close command palette"
        onClick={close}
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-[6px] animate-[fade-in_180ms_var(--ease-out)]"
      />

      <div
        ref={panelRef}
        className="glass-elevated relative w-full max-w-xl overflow-hidden rounded-2xl"
        style={{
          animation: "palette-in 220ms var(--ease-spring) both",
        }}
      >
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
          <span className="font-mono text-[12px] text-[color:var(--doctrine)]">
            ⌘K
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to a vault, vertical, or the core…"
            className="w-full bg-transparent font-sans text-[15px] text-[color:var(--ink-0)] placeholder:text-[color:var(--ink-3)] focus:outline-none"
            spellCheck={false}
            autoComplete="off"
          />
          <kbd className="font-mono text-[9px] uppercase tracking-tech text-[color:var(--ink-3)]">
            esc
          </kbd>
        </div>

        <ul
          ref={listRef}
          className="max-h-[46vh] overflow-y-auto px-2 py-2"
          role="listbox"
        >
          {results.length === 0 && (
            <li className="px-3 py-6 text-center font-mono text-[11px] uppercase tracking-tech text-[color:var(--ink-3)]">
              no matching nodes
            </li>
          )}
          {results.map((node, idx) => {
            const isActive = idx === active;
            const isPrivate = node.private === true;
            return (
              <li key={node.id} data-idx={idx} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseEnter={() => setActive(idx)}
                  onClick={() => select(node)}
                  className={
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-micro " +
                    (isActive ? "bg-[color:var(--glass-volt)]" : "")
                  }
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-[13px]"
                    style={{
                      color: isPrivate ? "var(--ink-2)" : node.color,
                      background: isPrivate
                        ? "rgba(148,163,184,0.08)"
                        : `${node.color}1a`,
                      boxShadow: isPrivate ? "none" : `inset 0 0 0 1px ${node.color}33`,
                    }}
                    aria-hidden
                  >
                    {isPrivate ? "·" : node.glyph}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-sans text-[13.5px] font-medium text-[color:var(--ink-0)]">
                        {isPrivate ? "Private vertical" : node.name}
                      </span>
                      {isPrivate && (
                        <span className="font-mono text-[9px] uppercase tracking-tech text-[color:var(--ink-3)]">
                          locked
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate font-sans text-[11.5px] text-[color:var(--ink-2)]">
                      {isPrivate
                        ? "Sovereignty clause — never described publicly."
                        : node.desc}
                    </span>
                  </span>

                  <span
                    className="shrink-0 rounded-full border border-white/[0.08] px-2 py-0.5 font-mono text-[9px] uppercase tracking-tech text-[color:var(--ink-2)]"
                  >
                    {KIND_LABEL[node.kind]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-2.5 font-mono text-[9px] uppercase tracking-tech text-[color:var(--ink-3)]">
          <span>{results.length} nodes</span>
          <span className="flex gap-3">
            <span>↑↓ move</span>
            <span>↵ open</span>
            <span>esc close</span>
          </span>
        </div>
      </div>
    </div>
  );
}
