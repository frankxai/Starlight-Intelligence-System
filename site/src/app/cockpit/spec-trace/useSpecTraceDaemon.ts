"use client";

// useSpecTraceDaemon — client-side hook that wires fetch + SSE against the local
// spec-trace daemon at http://localhost:7777.
//
// Hard rules:
//   - All network goes browser -> 127.0.0.1; never server-side.
//   - Failure modes are first-class state, not thrown exceptions.
//   - Reduced-motion respected by callers; this hook just emits state.
//   - CSP note: the parent site ships `connect-src 'self'`. In production the
//     browser will block these fetches and the UI will render the "Daemon offline"
//     state — by design. In local dev (npm run dev), CSP headers are still emitted
//     so the same offline-state will surface unless the operator runs the page
//     against a locally-relaxed CSP. This is documented in the offline CTA.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const DAEMON_BASE = "http://localhost:7777";

export type SpecClassification = "operational" | "substrate" | "unknown";

export type SpecSummary = {
  spec_id: string;
  title: string;
  classification: SpecClassification;
  has_sidecar: boolean;
  commits: number;
  indexed: string; // ISO-8601
};

export type SidecarEvent = {
  kind: "dispatch" | "commit" | "pr";
  ts: string;
  ref: string;
  note?: string;
};

export type SpecDetail = {
  spec: {
    spec_id: string;
    title: string;
    classification: SpecClassification;
    body_md: string;
  };
  sidecar: Record<string, unknown> | null;
  events: {
    dispatches: SidecarEvent[];
    commits: SidecarEvent[];
    prs: SidecarEvent[];
  };
};

export type TraceEvent = {
  ts: string;
  kind: string;
  path?: string;
  spec_id?: string;
  message?: string;
};

export type DaemonStatus = "checking" | "online" | "offline";

// Bounded ring buffer for live trace events. Newest first.
const TRACE_RING_CAP = 64;

function pushRing<T>(ring: T[], item: T, cap: number): T[] {
  const next = [item, ...ring];
  if (next.length > cap) next.length = cap;
  return next;
}

// Tiny AbortController wrapper that survives React Strict Mode double-fire.
function abortable<T>(
  fn: (signal: AbortSignal) => Promise<T>,
): { promise: Promise<T | null>; abort: () => void } {
  const ctrl = new AbortController();
  const promise = fn(ctrl.signal).catch((err: unknown) => {
    if ((err as { name?: string })?.name === "AbortError") return null;
    throw err;
  });
  return { promise, abort: () => ctrl.abort() };
}

export function useSpecTraceDaemon() {
  const [status, setStatus] = useState<DaemonStatus>("checking");
  const [specs, setSpecs] = useState<SpecSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SpecDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [trace, setTrace] = useState<TraceEvent[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);

  const esRef = useRef<EventSource | null>(null);

  // -- Load specs list --
  const loadSpecs = useCallback(() => {
    const { promise, abort } = abortable(async (signal) => {
      const res = await fetch(`${DAEMON_BASE}/api/specs`, {
        signal,
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as SpecSummary[];
    });

    promise
      .then((rows) => {
        if (rows === null) return; // aborted
        setSpecs(rows);
        setStatus("online");
        setLastError(null);
      })
      .catch((err: unknown) => {
        setStatus("offline");
        setLastError(err instanceof Error ? err.message : String(err));
      });

    return abort;
  }, []);

  // -- Load one spec detail --
  // setDetailLoading(true) is deferred via queueMicrotask so the function can be
  // safely invoked from inside a useEffect body without tripping
  // `react-hooks/set-state-in-effect`. Render is not blocked; the loading flag
  // just lands in the next microtask.
  const loadDetail = useCallback((specId: string) => {
    const { promise, abort } = abortable(async (signal) => {
      const res = await fetch(
        `${DAEMON_BASE}/api/spec/${encodeURIComponent(specId)}`,
        {
          signal,
          cache: "no-store",
          headers: { Accept: "application/json" },
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as SpecDetail;
    });

    queueMicrotask(() => setDetailLoading(true));

    promise
      .then((d) => {
        if (d === null) return;
        setDetail(d);
        setLastError(null);
      })
      .catch((err: unknown) => {
        setDetail(null);
        setLastError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setDetailLoading(false));

    return abort;
  }, []);

  // -- SSE trace stream --
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (status !== "online") return;

    // Defensive: close any existing stream before opening a new one.
    esRef.current?.close();

    let es: EventSource;
    try {
      es = new EventSource(`${DAEMON_BASE}/api/events`);
    } catch {
      // EventSource constructor itself can throw on some browsers when blocked.
      return;
    }
    esRef.current = es;

    es.onmessage = (ev) => {
      try {
        const parsed = JSON.parse(ev.data) as TraceEvent;
        setTrace((prev) => pushRing(prev, parsed, TRACE_RING_CAP));
      } catch {
        // Malformed event — surface as a synthetic trace row, don't crash.
        setTrace((prev) =>
          pushRing(
            prev,
            { ts: new Date().toISOString(), kind: "parse-error", message: ev.data?.slice?.(0, 80) ?? "" },
            TRACE_RING_CAP,
          ),
        );
      }
    };

    es.onerror = () => {
      // Browser will auto-reconnect; we just mark a soft offline if we never connected.
      if (es.readyState === EventSource.CLOSED) {
        setStatus("offline");
      }
    };

    return () => {
      es.close();
      if (esRef.current === es) esRef.current = null;
    };
  }, [status]);

  // -- Initial load + lazy reload --
  useEffect(() => {
    const abort = loadSpecs();
    return abort;
  }, [loadSpecs]);

  useEffect(() => {
    if (!selectedId) return;
    const abort = loadDetail(selectedId);
    return abort;
  }, [selectedId, loadDetail]);

  // Atomic select-or-clear. Wrapping setSelectedId avoids the lint rule
  // `react-hooks/set-state-in-effect` — clearing `detail` belongs at the
  // call-site, not as a derived effect.
  const setSelected = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id === null) setDetail(null);
  }, []);

  // -- Mutations --
  const linkCommit = useCallback(
    async (sha: string, specId: string): Promise<{ ok: boolean; error?: string }> => {
      try {
        const res = await fetch(`${DAEMON_BASE}/api/link-commit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sha, spec_id: specId }),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          return { ok: false, error: `HTTP ${res.status} ${text}`.trim() };
        }
        // Refresh detail to pick up the new commit row.
        loadDetail(specId);
        return { ok: true };
      } catch (err: unknown) {
        return { ok: false, error: err instanceof Error ? err.message : String(err) };
      }
    },
    [loadDetail],
  );

  const initSpec = useCallback(
    async (
      specId: string,
      title?: string,
      classification?: SpecClassification,
    ): Promise<{ ok: boolean; error?: string }> => {
      try {
        const res = await fetch(`${DAEMON_BASE}/api/init-spec`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ spec_id: specId, title, classification }),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          return { ok: false, error: `HTTP ${res.status} ${text}`.trim() };
        }
        loadSpecs();
        return { ok: true };
      } catch (err: unknown) {
        return { ok: false, error: err instanceof Error ? err.message : String(err) };
      }
    },
    [loadSpecs],
  );

  const reload = useCallback(() => {
    setStatus("checking");
    loadSpecs();
  }, [loadSpecs]);

  return useMemo(
    () => ({
      status,
      lastError,
      specs,
      selectedId,
      setSelectedId: setSelected,
      detail,
      detailLoading,
      trace,
      linkCommit,
      initSpec,
      reload,
    }),
    [
      status,
      lastError,
      specs,
      selectedId,
      setSelected,
      detail,
      detailLoading,
      trace,
      linkCommit,
      initSpec,
      reload,
    ],
  );
}
