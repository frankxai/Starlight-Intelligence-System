"use client";

// SpecTraceClient — the Console of the Sovereign.
//
// Aesthetic: ink-black, paper-on-ink, sharp brutalist (radius=0), mono everywhere,
// ASCII box-drawing for separators. Mobile-first responsive. Read the docs/console.md
// in the brief, not your training data.
//
// Layout:
//   ┌── list pane (mobile: full-width drawer below 768px) ────────────┐
//   │  ┌── detail pane (markdown + sidecar events) ─────────────────┐ │
//   │  │  ┌── send-to-agent (disabled Phase 2, bottom-sheet on m) ─┐│ │
//   ├── live trace strip (sticky bottom) ─────────────────────────┴┴─┤
//   └────────────────────────────────────────────────────────────────┘

import {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  useSpecTraceDaemon,
  type SpecSummary,
  type SidecarEvent,
} from "./useSpecTraceDaemon";

// -- Agent options (Phase 2 — currently disabled, visual only) --
type AgentKey = "claude" | "codex" | "opencode" | "gemini";

const AGENTS: { key: AgentKey; label: string; icon: React.ReactNode }[] = [
  {
    key: "claude",
    label: "Claude",
    icon: (
      // Anthropic-ish star-burst, abstracted.
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path
          d="M8 1 L9.6 6.4 L15 8 L9.6 9.6 L8 15 L6.4 9.6 L1 8 L6.4 6.4 Z"
          fill="#F59E0B"
        />
      </svg>
    ),
  },
  {
    key: "codex",
    label: "Codex",
    icon: (
      // Squared bracket motif.
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path
          d="M3 3 H7 V5 H5 V11 H7 V13 H3 Z M13 3 H9 V5 H11 V11 H9 V13 H13 Z"
          fill="#E8E2D5"
        />
      </svg>
    ),
  },
  {
    key: "opencode",
    label: "opencode",
    icon: (
      // Open-circle / angle.
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <circle cx="8" cy="8" r="5" stroke="#10B981" strokeWidth="1.4" fill="none" />
        <path d="M8 5 V8 H11" stroke="#10B981" strokeWidth="1.4" fill="none" />
      </svg>
    ),
  },
  {
    key: "gemini",
    label: "Gemini",
    icon: (
      // Diamond pair.
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path
          d="M8 1 L11 8 L8 15 L5 8 Z M1 8 L8 5 L15 8 L8 11 Z"
          fill="#FBBF24"
          opacity="0.9"
        />
      </svg>
    ),
  },
];

// -- Classification tag rendering --
function ClassTag({
  c,
}: {
  c: "operational" | "substrate" | "unknown";
}) {
  if (c === "substrate") {
    return (
      <span className="console-tag console-tag-warn" aria-label="substrate-class spec">
        [sb]
      </span>
    );
  }
  if (c === "operational") {
    return (
      <span className="console-tag console-tag-ok" aria-label="operational-class spec">
        [op]
      </span>
    );
  }
  return (
    <span className="console-tag" aria-label="unclassified spec">
      [??]
    </span>
  );
}

// -- Status dot for header --
function StatusDot({ status }: { status: "checking" | "online" | "offline" }) {
  const cls =
    status === "online"
      ? "bg-[#10B981]"
      : status === "offline"
        ? "bg-[#EF4444]"
        : "bg-[#FBBF24]";
  const label =
    status === "online"
      ? "Daemon online"
      : status === "offline"
        ? "Daemon offline"
        : "Daemon: checking";
  return (
    <span className="inline-flex items-center gap-2" aria-label={label}>
      <span className={`inline-block h-2 w-2 ${cls}`} aria-hidden="true" />
      <span className="console-mono-xs">
        {status === "online" ? "ONLINE" : status === "offline" ? "OFFLINE" : "CHECKING"}
      </span>
    </span>
  );
}

// -- Daemon-offline call-to-action --
function DaemonOfflineCTA({ onRetry, error }: { onRetry: () => void; error: string | null }) {
  return (
    <div className="console-panel" role="status" aria-live="polite">
      <div className="console-panel-head">
        <span className="console-display">DAEMON OFFLINE</span>
        <span className="console-mono-xs text-[#EF4444]">●</span>
      </div>
      <div className="px-4 py-5 console-mono-sm leading-relaxed text-[#E8E2D5]/80">
        <p className="text-[#E8E2D5]">
          The local spec-trace daemon is unreachable at{" "}
          <span className="text-[#F59E0B]">http://localhost:7777</span>.
        </p>
        <p className="mt-3 text-[#E8E2D5]/60">
          Start it from the repo root:
        </p>
        <pre className="console-pre mt-2">
{`$ python tools/spec-trace-daemon/server.py`}
        </pre>
        {error ? (
          <p className="mt-4 text-[#EF4444]">
            ─ last error: <span className="text-[#E8E2D5]/70">{error}</span>
          </p>
        ) : null}
        <p className="mt-4 text-[#E8E2D5]/50 text-[11px]">
          Browser sandboxing: this page&apos;s CSP allows{" "}
          <code className="text-[#F59E0B]">connect-src &apos;self&apos;</code> only. If you&apos;re viewing
          the deployed site, the daemon fetches will be blocked by design — run the site
          locally (<code className="text-[#F59E0B]">npm run dev</code>) or set up a tunnel.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="console-btn mt-5"
          aria-label="Retry daemon connection"
        >
          $ retry_<span className="animate-blink">_</span>
        </button>
      </div>
    </div>
  );
}

// -- Send-to-agent menu (DISABLED in MVP — Phase 2 gate) --
function SendToAgentMenu({
  specId,
}: {
  specId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<AgentKey | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (
        !menuRef.current?.contains(e.target as Node) &&
        !btnRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const disabled = true; // Phase 2 gate: pending /starlight-board
  const tooltip = "Phase 2 — pending /starlight-board";

  function onMenuKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      btnRef.current?.focus();
    }
  }

  return (
    <div className="console-send-wrap">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="send-to-agent-menu"
        aria-disabled={disabled}
        title={disabled ? tooltip : undefined}
        onClick={() => {
          if (!disabled) setOpen((v) => !v);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !disabled) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={`console-send-btn ${disabled ? "console-send-btn-disabled" : ""}`}
      >
        <span aria-hidden="true">$&nbsp;</span>
        <span>
          {specId ? (
            <>
              send-to-agent <span className="text-[#F59E0B]">{specId}</span>
            </>
          ) : (
            <>send-to-agent &lt;select spec&gt;</>
          )}
        </span>
        <span className="animate-blink" aria-hidden="true">_</span>
        {disabled ? (
          <span
            className="console-send-locked"
            aria-label="Phase 2 — disabled"
          >
            [LOCKED]
          </span>
        ) : null}
      </button>

      {/* Tooltip / hint */}
      {disabled ? (
        <p className="console-mono-xs mt-2 text-[#FBBF24]/80">
          ─ {tooltip}. The visual is shipped; the dispatch is gated.
        </p>
      ) : null}

      {open && !disabled ? (
        <div
          ref={menuRef}
          id="send-to-agent-menu"
          role="menu"
          aria-label="Select target agent"
          onKeyDown={onMenuKey}
          className="console-menu"
        >
          <div className="console-menu-head">
            <span className="console-mono-xs text-[#E8E2D5]/50">
              ╭── target ──╮
            </span>
          </div>
          {AGENTS.map((a) => (
            <button
              key={a.key}
              role="menuitem"
              type="button"
              onMouseEnter={() => setHover(a.key)}
              onMouseLeave={() => setHover((h) => (h === a.key ? null : h))}
              className="console-menu-item"
            >
              <span aria-hidden="true" className="console-menu-icon">
                {a.icon}
              </span>
              <span>{a.label}</span>
              {hover === a.key ? (
                <span className="ml-auto console-mono-xs text-[#F59E0B] animate-blink">
                  &gt;
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// -- Link-commit form --
function LinkCommitForm({
  specId,
  onLink,
}: {
  specId: string | null;
  onLink: (sha: string, specId: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [sha, setSha] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!specId || !sha.trim()) return;
    setPending(true);
    setResult(null);
    const r = await onLink(sha.trim(), specId);
    setResult(r);
    setPending(false);
    if (r.ok) setSha("");
  }

  const canSubmit = !!specId && sha.trim().length >= 7 && !pending;

  return (
    <form onSubmit={onSubmit} className="console-form" aria-label="Link commit to spec">
      <label htmlFor="link-commit-sha" className="console-mono-xs text-[#E8E2D5]/60">
        ─ link commit
      </label>
      <div className="console-form-row">
        <span className="console-mono-xs text-[#F59E0B]" aria-hidden="true">
          $&nbsp;
        </span>
        <input
          id="link-commit-sha"
          name="sha"
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          placeholder={specId ? "git-sha" : "select spec first"}
          value={sha}
          onChange={(e) => setSha(e.target.value)}
          disabled={!specId}
          aria-describedby="link-commit-hint"
          className="console-input"
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className="console-btn console-btn-inline"
          aria-label={`Link commit ${sha || "(empty)"} to spec`}
        >
          {pending ? "linking…" : "link"}
        </button>
      </div>
      <p id="link-commit-hint" className="console-mono-xs mt-1 text-[#E8E2D5]/40">
        POST /api/link-commit · min 7-char sha
      </p>
      {result ? (
        result.ok ? (
          <p className="console-mono-xs mt-2 text-[#10B981]">
            ─ linked. detail refreshed.
          </p>
        ) : (
          <p className="console-mono-xs mt-2 text-[#EF4444]">
            ─ error: {result.error}
          </p>
        )
      ) : null}
    </form>
  );
}

// -- Init-spec form --
function InitSpecForm({
  onInit,
}: {
  onInit: (
    specId: string,
    title?: string,
    classification?: "operational" | "substrate",
  ) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [specId, setSpecId] = useState("");
  const [title, setTitle] = useState("");
  const [klass, setKlass] = useState<"operational" | "substrate">("operational");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!specId.trim()) return;
    setPending(true);
    setResult(null);
    const r = await onInit(specId.trim(), title.trim() || undefined, klass);
    setResult(r);
    setPending(false);
    if (r.ok) {
      setSpecId("");
      setTitle("");
    }
  }

  return (
    <form onSubmit={onSubmit} className="console-form" aria-label="Initialize new spec">
      <label className="console-mono-xs text-[#E8E2D5]/60">─ init spec</label>
      <div className="console-form-row">
        <span className="console-mono-xs text-[#F59E0B]" aria-hidden="true">
          $&nbsp;
        </span>
        <input
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="spec_id"
          value={specId}
          onChange={(e) => setSpecId(e.target.value)}
          className="console-input"
          aria-label="Spec ID"
        />
      </div>
      <div className="console-form-row mt-1">
        <span className="console-mono-xs text-[#E8E2D5]/40" aria-hidden="true">
          &nbsp;&nbsp;
        </span>
        <input
          type="text"
          placeholder="title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="console-input"
          aria-label="Spec title"
        />
      </div>
      <div className="console-form-row mt-1 items-center">
        <span className="console-mono-xs text-[#E8E2D5]/40" aria-hidden="true">
          &nbsp;&nbsp;
        </span>
        <fieldset className="flex items-center gap-3 border-0 p-0">
          <legend className="sr-only">Classification</legend>
          <label className="console-radio">
            <input
              type="radio"
              name="classification"
              value="operational"
              checked={klass === "operational"}
              onChange={() => setKlass("operational")}
            />
            <span>[op]</span>
          </label>
          <label className="console-radio">
            <input
              type="radio"
              name="classification"
              value="substrate"
              checked={klass === "substrate"}
              onChange={() => setKlass("substrate")}
            />
            <span>[sb]</span>
          </label>
        </fieldset>
        <button
          type="submit"
          disabled={!specId.trim() || pending}
          className="console-btn console-btn-inline ml-auto"
        >
          {pending ? "init…" : "init"}
        </button>
      </div>
      {result ? (
        result.ok ? (
          <p className="console-mono-xs mt-2 text-[#10B981]">─ initialized.</p>
        ) : (
          <p className="console-mono-xs mt-2 text-[#EF4444]">─ error: {result.error}</p>
        )
      ) : null}
    </form>
  );
}

// -- Spec list row --
function SpecRow({
  spec,
  selected,
  onSelect,
}: {
  spec: SpecSummary;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={() => onSelect(spec.spec_id)}
      className={`console-row ${selected ? "console-row-selected" : ""}`}
    >
      <div className="console-row-line">
        <ClassTag c={spec.classification} />
        <span className="console-mono-sm text-[#E8E2D5] truncate">{spec.spec_id}</span>
      </div>
      <div className="console-row-meta">
        <span className="truncate text-[#E8E2D5]/60">{spec.title}</span>
        <span className="ml-auto console-mono-xs text-[#E8E2D5]/40 shrink-0">
          {spec.commits} cmt · {spec.has_sidecar ? "★" : "·"}
        </span>
      </div>
    </button>
  );
}

// -- Tiny markdown renderer (lightweight, no deps) --
// We have react-markdown in deps; use it to keep accessibility/escape correct.
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function SpecBody({ md }: { md: string }) {
  return (
    <div className="console-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
    </div>
  );
}

// -- Sidecar event row --
function EventRow({ ev }: { ev: SidecarEvent }) {
  const color =
    ev.kind === "commit"
      ? "text-[#10B981]"
      : ev.kind === "pr"
        ? "text-[#F59E0B]"
        : "text-[#FBBF24]";
  return (
    <li className="console-event">
      <span className={`console-mono-xs ${color}`}>[{ev.kind}]</span>
      <span className="console-mono-xs text-[#E8E2D5]/50">{ev.ts}</span>
      <span className="console-mono-sm text-[#E8E2D5] truncate">{ev.ref}</span>
      {ev.note ? (
        <span className="console-mono-xs text-[#E8E2D5]/60 truncate">— {ev.note}</span>
      ) : null}
    </li>
  );
}

// -- Trace strip (sticky live log) --
function TraceStrip({
  events,
}: {
  events: { ts: string; kind: string; path?: string; spec_id?: string; message?: string }[];
}) {
  return (
    <div className="console-trace-strip" aria-live="polite" aria-label="Live trace stream">
      <div className="console-trace-head">
        <span className="console-display">LIVE TRACE</span>
        <span className="console-mono-xs text-[#E8E2D5]/40">
          {events.length}/64 · SSE
        </span>
      </div>
      <ol className="console-trace-list">
        {events.length === 0 ? (
          <li className="console-mono-xs text-[#E8E2D5]/40 px-3 py-2">
            ─ waiting for events…
          </li>
        ) : (
          events.map((e, idx) => (
            <li key={`${e.ts}-${idx}`} className="console-trace-row">
              <span className="console-mono-xs text-[#E8E2D5]/40">{e.ts.slice(11, 19)}</span>
              <span className="console-mono-xs text-[#F59E0B]">{e.kind}</span>
              {e.spec_id ? (
                <span className="console-mono-xs text-[#E8E2D5]">{e.spec_id}</span>
              ) : null}
              {e.path ? (
                <span className="console-mono-xs text-[#E8E2D5]/60 truncate">{e.path}</span>
              ) : null}
              {e.message ? (
                <span className="console-mono-xs text-[#E8E2D5]/60 truncate">
                  — {e.message}
                </span>
              ) : null}
            </li>
          ))
        )}
      </ol>
    </div>
  );
}

// -- Main component --
export default function SpecTraceClient() {
  const {
    status,
    lastError,
    specs,
    selectedId,
    setSelectedId,
    detail,
    detailLoading,
    trace,
    linkCommit,
    initSpec,
    reload,
  } = useSpecTraceDaemon();

  const [drawerOpen, setDrawerOpen] = useState(false);

  // When a spec gets selected on mobile, auto-close the drawer.
  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      setDrawerOpen(false);
    },
    [setSelectedId],
  );

  // Group sidecar events
  const groupedEvents = useMemo(() => {
    if (!detail) return [];
    return [
      ...detail.events.dispatches,
      ...detail.events.commits,
      ...detail.events.prs,
    ].sort((a, b) => (a.ts < b.ts ? 1 : -1));
  }, [detail]);

  return (
    <div className="console-root">
      {/* ── Toolbar ── */}
      <header className="console-toolbar">
        <div className="console-toolbar-left">
          <span className="console-display text-[#F59E0B]">SPEC-TRACE</span>
          <span className="console-mono-xs text-[#E8E2D5]/40">·</span>
          <span className="console-mono-xs text-[#E8E2D5]/60">cockpit / spec-trace</span>
        </div>
        <div className="console-toolbar-right">
          <StatusDot status={status} />
          <button
            type="button"
            onClick={reload}
            className="console-btn console-btn-inline"
            aria-label="Reload spec list"
          >
            reload
          </button>
          {/* Mobile-only drawer toggle */}
          <button
            type="button"
            className="console-btn console-btn-inline md:hidden"
            aria-expanded={drawerOpen}
            aria-controls="spec-list-drawer"
            onClick={() => setDrawerOpen((v) => !v)}
          >
            {drawerOpen ? "close" : "specs"}
          </button>
        </div>
      </header>

      {status === "offline" ? (
        <div className="console-mx">
          <DaemonOfflineCTA onRetry={reload} error={lastError} />
        </div>
      ) : null}

      <div className="console-grid">
        {/* ── Spec list (left pane / mobile drawer) ── */}
        <aside
          id="spec-list-drawer"
          aria-label="Spec list"
          className={`console-pane console-pane-list ${drawerOpen ? "console-pane-list-open" : ""}`}
        >
          <div className="console-pane-head">
            <span className="console-display">SPECS</span>
            <span className="console-mono-xs text-[#E8E2D5]/40">
              {specs.length} indexed
            </span>
          </div>
          <div className="console-pane-body" role="listbox" aria-label="Specs">
            {status === "checking" ? (
              <p className="console-mono-xs text-[#E8E2D5]/40 px-3 py-2">
                ─ connecting…
              </p>
            ) : specs.length === 0 && status === "online" ? (
              <p className="console-mono-xs text-[#E8E2D5]/40 px-3 py-2">
                ─ no specs indexed yet. Init one below.
              </p>
            ) : (
              specs.map((s) => (
                <SpecRow
                  key={s.spec_id}
                  spec={s}
                  selected={s.spec_id === selectedId}
                  onSelect={handleSelect}
                />
              ))
            )}
          </div>
          <div className="console-pane-foot">
            <InitSpecForm onInit={initSpec} />
          </div>
        </aside>

        {/* ── Detail pane ── */}
        <section
          className="console-pane console-pane-detail"
          aria-label="Spec detail"
          aria-busy={detailLoading}
        >
          {!selectedId ? (
            <div className="console-empty">
              <span className="console-display text-[#E8E2D5]/40">
                NO SPEC SELECTED
              </span>
              <p className="console-mono-sm mt-3 text-[#E8E2D5]/50 max-w-md">
                ─ pick a row on the left. Or on mobile, tap{" "}
                <span className="text-[#F59E0B]">specs</span> in the toolbar.
              </p>
              <p className="console-mono-xs mt-6 text-[#E8E2D5]/40">
                ╭───────────────────────────────────╮
                <br />│ spec-trace · console-of-the-sovereign │<br />
                ╰───────────────────────────────────╯
              </p>
            </div>
          ) : detailLoading && !detail ? (
            <p className="console-mono-sm text-[#E8E2D5]/40 px-4 py-6">
              ─ loading {selectedId}…
            </p>
          ) : detail ? (
            <>
              <div className="console-pane-head">
                <ClassTag c={detail.spec.classification} />
                <span className="console-mono-sm text-[#E8E2D5]">
                  {detail.spec.spec_id}
                </span>
                <span className="console-mono-xs text-[#E8E2D5]/40 ml-auto truncate">
                  {detail.spec.title}
                </span>
              </div>
              <div className="console-pane-body console-pane-body-scroll">
                <SpecBody md={detail.spec.body_md} />
                <hr className="console-hr" />
                <div className="console-events">
                  <h3 className="console-display console-events-head">
                    SIDECAR EVENTS
                  </h3>
                  {groupedEvents.length === 0 ? (
                    <p className="console-mono-xs text-[#E8E2D5]/40 mt-2">
                      ─ no events recorded yet.
                    </p>
                  ) : (
                    <ul className="console-events-list">
                      {groupedEvents.map((ev, i) => (
                        <EventRow key={`${ev.ts}-${i}`} ev={ev} />
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="console-pane-foot">
                <LinkCommitForm specId={selectedId} onLink={linkCommit} />
              </div>
            </>
          ) : (
            <p className="console-mono-sm text-[#EF4444] px-4 py-6">
              ─ failed to load. {lastError || "Unknown error."}
            </p>
          )}
        </section>
      </div>

      {/* ── Send-to-agent panel (desktop: floating bottom-right; mobile: full-width bottom-sheet) ── */}
      <div className="console-send-sheet" role="region" aria-label="Send to agent">
        <SendToAgentMenu specId={selectedId} />
      </div>

      {/* ── Live trace strip (sticky bottom) ── */}
      <TraceStrip events={trace} />
    </div>
  );
}
