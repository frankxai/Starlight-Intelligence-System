import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

type Health = "clear" | "watch" | "critical";
type WorkStatus = "backlog" | "ready" | "in_progress" | "blocked" | "done" | "cancelled";

interface Metric {
  key: string;
  label: string;
  value: number;
  unit: string;
  target?: number;
  trend?: "up" | "flat" | "down";
}

interface Objective {
  id: string;
  title: string;
  owner: string;
  status: string;
  progress: number;
  due_date?: string;
}

interface Venture {
  id: string;
  name: string;
  kind: string;
  mission: string;
  health: Health;
  status: string;
  metrics: Metric[];
  objectives: Objective[];
}

interface WorkItem {
  id: string;
  venture_id: string;
  title: string;
  owner: string;
  status: WorkStatus;
  priority: string;
  due_date?: string;
  version: number;
}

interface Decision {
  id: string;
  venture_id: string;
  title: string;
  decision: string;
  owner: string;
  status: string;
  evidence_ids: string[];
  review_date?: string;
}

interface Evidence {
  id: string;
  venture_id: string;
  title: string;
  source_type: string;
  source_url?: string;
  note?: string;
}

interface Snapshot {
  snapshot_id: string;
  generated_at: string;
  revision: number;
  workspace: { id: string; name: string; doctrine: string };
  summary: {
    ventures: number;
    active_work: number;
    blocked_work: number;
    critical_work: number;
    pending_decisions: number;
    evidence_records: number;
  };
  ventures: Venture[];
  work_items: WorkItem[];
  decisions: Decision[];
  evidence: Evidence[];
}

declare global {
  interface Window {
    openai?: {
      widgetState?: { selectedVenture?: string; tab?: string };
      setWidgetState?: (state: unknown) => void;
      toolOutput?: { snapshot?: Snapshot };
      callTool?: (name: string, args: Record<string, unknown>) => Promise<{ structuredContent?: unknown }>;
      sendFollowUpMessage?: (payload: { prompt: string }) => Promise<void>;
    };
  }
}

type JsonRpcMessage = {
  jsonrpc: "2.0";
  id?: number;
  method?: string;
  params?: Record<string, unknown>;
  result?: unknown;
  error?: { code: number; message: string };
};

class McpAppsBridge {
  private nextId = 1;
  private pending = new Map<number, { resolve: (value: unknown) => void; reject: (reason: unknown) => void; timeout: number }>();
  private observer?: ResizeObserver;
  onToolResult?: (result: { structuredContent?: unknown }) => void;

  private onMessage = (event: MessageEvent) => {
    if (event.source !== window.parent) return;
    const message = event.data as JsonRpcMessage;
    if (!message || message.jsonrpc !== "2.0") return;
    if (message.id !== undefined && this.pending.has(message.id)) {
      const pending = this.pending.get(message.id)!;
      this.pending.delete(message.id);
      window.clearTimeout(pending.timeout);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
      return;
    }
    if (message.method === "ui/notifications/tool-result") {
      this.onToolResult?.(message.params as { structuredContent?: unknown });
    }
  };

  private send(message: JsonRpcMessage) {
    window.parent.postMessage(message, "*");
  }

  private notify(method: string, params: Record<string, unknown> = {}) {
    this.send({ jsonrpc: "2.0", method, params });
  }

  request(method: string, params: Record<string, unknown>): Promise<unknown> {
    const id = this.nextId++;
    this.send({ jsonrpc: "2.0", id, method, params });
    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Host request timed out: ${method}`));
      }, 30_000);
      this.pending.set(id, { resolve, reject, timeout });
    });
  }

  async connect(): Promise<void> {
    window.addEventListener("message", this.onMessage, { passive: true });
    await this.request("ui/initialize", {
      appInfo: { name: "starlight-command-center", version: "0.1.0" },
      appCapabilities: { availableDisplayModes: ["inline", "fullscreen"] },
      protocolVersion: "2026-01-26",
    });
    this.notify("ui/notifications/initialized");
    let lastWidth = 0;
    let lastHeight = 0;
    this.observer = new ResizeObserver(() => {
      const width = Math.ceil(document.documentElement.getBoundingClientRect().width);
      const height = Math.ceil(document.documentElement.getBoundingClientRect().height);
      if (width !== lastWidth || height !== lastHeight) {
        lastWidth = width;
        lastHeight = height;
        this.notify("ui/notifications/size-changed", { width, height });
      }
    });
    this.observer.observe(document.documentElement);
  }

  async close(): Promise<void> {
    this.observer?.disconnect();
    window.removeEventListener("message", this.onMessage);
    for (const pending of this.pending.values()) {
      window.clearTimeout(pending.timeout);
      pending.reject(new Error("Bridge closed"));
    }
    this.pending.clear();
  }

  callServerTool(name: string, args: Record<string, unknown>) {
    return this.request("tools/call", { name, arguments: args }) as Promise<{ structuredContent?: unknown }>;
  }

  updateModelContext(content: string, structuredContent?: Record<string, unknown>) {
    return this.request("ui/update-model-context", {
      content: [{ type: "text", text: content }],
      structuredContent,
    });
  }

  sendMessage(prompt: string) {
    return this.request("ui/message", { role: "user", content: [{ type: "text", text: prompt }] });
  }
}

const css = `
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  html, body, #root { margin: 0; min-height: 100%; }
  body {
    font-family: var(--font-sans, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
    background: transparent;
    color: #f5f2ff;
  }
  button, a { font: inherit; }
  button { color: inherit; }
  .shell {
    --violet: #8f7dff;
    --violet-2: #5a43f2;
    --cyan: #66e8ff;
    --gold: #f7c66a;
    --rose: #ff7895;
    position: relative;
    overflow: hidden;
    min-height: 690px;
    padding: clamp(18px, 4vw, 36px);
    border: 1px solid rgba(183, 169, 255, 0.18);
    border-radius: 24px;
    background:
      radial-gradient(circle at 8% 0%, rgba(104, 75, 255, 0.27), transparent 34%),
      radial-gradient(circle at 92% 4%, rgba(42, 190, 228, 0.16), transparent 31%),
      linear-gradient(145deg, #0c0b18 0%, #121027 55%, #0a101c 100%);
    box-shadow: 0 28px 80px rgba(3, 2, 14, 0.35);
  }
  .shell::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: .42;
    background-image:
      linear-gradient(rgba(255,255,255,.024) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.024) 1px, transparent 1px);
    background-size: 42px 42px;
    mask-image: linear-gradient(to bottom, black, transparent 70%);
  }
  .topline, .hero, .kpis, .ventures, .panel, .footer { position: relative; z-index: 1; }
  .topline { display: flex; justify-content: space-between; gap: 18px; align-items: center; margin-bottom: 30px; }
  .brand { display: flex; align-items: center; gap: 11px; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: #d7d0ff; }
  .mark { width: 28px; height: 28px; display: grid; place-items: center; border: 1px solid rgba(167,149,255,.55); border-radius: 50%; box-shadow: 0 0 28px rgba(128,101,255,.38); }
  .mark::before { content: "✦"; color: #eae5ff; font-size: 13px; }
  .revision { display: flex; gap: 8px; align-items: center; font: 11px var(--font-mono, ui-monospace, monospace); color: #9490aa; }
  .live { width: 7px; height: 7px; border-radius: 50%; background: #76f0c2; box-shadow: 0 0 12px #76f0c2; }
  .hero { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(220px, .8fr); gap: 30px; align-items: end; margin-bottom: 28px; }
  .eyebrow { color: #9a91c0; font-size: 11px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; margin-bottom: 10px; }
  h1 { margin: 0; max-width: 720px; font-size: clamp(32px, 7vw, 64px); line-height: .95; letter-spacing: -.055em; font-weight: 630; }
  h1 span { color: transparent; background: linear-gradient(100deg, #c6baff 5%, #72e8ff 95%); background-clip: text; }
  .doctrine { margin: 0; padding-left: 18px; border-left: 2px solid rgba(143,125,255,.7); color: #aaa6bc; font-size: 13px; line-height: 1.55; }
  .kpis { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 9px; margin-bottom: 26px; }
  .kpi { min-height: 88px; padding: 15px; border: 1px solid rgba(255,255,255,.075); border-radius: 14px; background: rgba(255,255,255,.035); backdrop-filter: blur(12px); }
  .kpi-value { font-size: 28px; line-height: 1; letter-spacing: -.04em; margin-bottom: 9px; }
  .kpi-label { font-size: 10px; line-height: 1.35; color: #8f8aa3; text-transform: uppercase; letter-spacing: .09em; }
  .kpi.alert .kpi-value { color: var(--rose); }
  .kpi.attention .kpi-value { color: var(--gold); }
  .ventures { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 26px; }
  .venture { text-align: left; width: 100%; padding: 17px; border: 1px solid rgba(255,255,255,.07); border-radius: 16px; background: rgba(7,8,22,.55); cursor: pointer; transition: transform .18s ease, border-color .18s ease, background .18s ease; }
  .venture:hover { transform: translateY(-2px); border-color: rgba(153,134,255,.35); }
  .venture.selected { border-color: rgba(151,132,255,.75); background: linear-gradient(145deg, rgba(101,76,221,.22), rgba(21,24,49,.76)); box-shadow: inset 0 0 0 1px rgba(151,132,255,.15), 0 14px 40px rgba(23,12,75,.22); }
  .venture-head { display: flex; justify-content: space-between; gap: 12px; align-items: start; }
  .venture-name { font-size: 16px; font-weight: 650; letter-spacing: -.02em; }
  .venture-kind { margin-top: 4px; color: #88839c; font-size: 11px; }
  .health { width: 8px; height: 8px; margin-top: 5px; border-radius: 50%; }
  .health.clear { background: #70ebbc; box-shadow: 0 0 10px rgba(112,235,188,.7); }
  .health.watch { background: var(--gold); box-shadow: 0 0 10px rgba(247,198,106,.6); }
  .health.critical { background: var(--rose); box-shadow: 0 0 10px rgba(255,120,149,.6); }
  .venture-mission { min-height: 48px; margin: 13px 0; color: #aaa6ba; font-size: 12px; line-height: 1.45; }
  .mini-metrics { display: flex; gap: 15px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.06); }
  .mini-value { font-size: 15px; font-weight: 620; }
  .mini-label { color: #7c778e; font-size: 9px; text-transform: uppercase; letter-spacing: .07em; }
  .panel { border: 1px solid rgba(255,255,255,.075); border-radius: 18px; background: rgba(7,8,18,.55); overflow: hidden; }
  .tabs { display: flex; align-items: center; gap: 3px; padding: 9px; border-bottom: 1px solid rgba(255,255,255,.06); }
  .tab { appearance: none; border: 0; border-radius: 9px; padding: 9px 13px; background: transparent; color: #858095; font-size: 11px; font-weight: 650; letter-spacing: .04em; cursor: pointer; }
  .tab.active { color: #f1edff; background: rgba(126,102,255,.17); }
  .panel-content { padding: 18px; }
  .section-grid { display: grid; grid-template-columns: 1.2fr .8fr; gap: 18px; }
  .section-title { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 13px; }
  .section-title h2 { margin: 0; font-size: 13px; letter-spacing: .02em; }
  .section-title span { color: #777287; font-size: 10px; }
  .objective, .decision, .evidence, .work-card { border: 1px solid rgba(255,255,255,.06); background: rgba(255,255,255,.025); border-radius: 12px; }
  .objective { padding: 13px; margin-bottom: 9px; }
  .objective-top { display: flex; justify-content: space-between; gap: 15px; margin-bottom: 10px; font-size: 12px; }
  .objective-meta { color: #888296; font-size: 10px; }
  .bar { height: 4px; background: rgba(255,255,255,.075); border-radius: 99px; overflow: hidden; }
  .bar > i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--violet-2), var(--cyan)); }
  .metric-list { display: grid; gap: 8px; }
  .metric { padding: 11px 12px; border-bottom: 1px solid rgba(255,255,255,.055); }
  .metric:last-child { border-bottom: 0; }
  .metric-line { display: flex; justify-content: space-between; gap: 15px; font-size: 11px; }
  .metric-line span:first-child { color: #9a95aa; }
  .metric-line strong { font-weight: 620; }
  .work-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
  .lane { min-width: 0; }
  .lane-title { display: flex; justify-content: space-between; color: #8c8799; font-size: 10px; text-transform: uppercase; letter-spacing: .1em; margin: 3px 3px 10px; }
  .work-card { padding: 12px; margin-bottom: 8px; cursor: pointer; }
  .work-card:hover { border-color: rgba(143,125,255,.34); }
  .work-card h3 { margin: 0 0 10px; font-size: 12px; line-height: 1.35; font-weight: 600; }
  .work-meta { display: flex; flex-wrap: wrap; gap: 5px; color: #858093; font-size: 9px; }
  .pill { padding: 3px 6px; border: 1px solid rgba(255,255,255,.07); border-radius: 99px; }
  .pill.critical, .pill.blocked { color: #ff8da5; border-color: rgba(255,120,149,.2); }
  .decision-grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: 13px; }
  .decision, .evidence { padding: 13px; margin-bottom: 8px; }
  .decision h3, .evidence h3 { margin: 0 0 7px; font-size: 12px; line-height: 1.35; }
  .decision p, .evidence p { margin: 0; color: #928da0; font-size: 10px; line-height: 1.45; }
  .record-meta { display: flex; gap: 7px; align-items: center; margin-top: 10px; color: #777285; font-size: 9px; }
  .record-status { color: #bdb3ff; text-transform: uppercase; letter-spacing: .08em; }
  .evidence a { color: #75dff4; text-decoration: none; }
  .footer { display: flex; justify-content: space-between; gap: 14px; align-items: center; margin-top: 16px; color: #716c80; font-size: 9px; }
  .actions { display: flex; gap: 8px; }
  .action { border: 1px solid rgba(255,255,255,.09); border-radius: 9px; padding: 8px 10px; background: rgba(255,255,255,.04); cursor: pointer; font-size: 10px; }
  .action.primary { color: #f6f2ff; border-color: rgba(143,125,255,.4); background: rgba(110,86,240,.18); }
  .empty { min-height: 100px; display: grid; place-items: center; color: #716d7d; font-size: 11px; }
  .loading { min-height: 420px; display: grid; place-items: center; text-align: center; }
  .loading-orbit { width: 54px; height: 54px; margin: 0 auto 18px; border: 1px solid rgba(151,132,255,.2); border-top-color: #9d8aff; border-radius: 50%; animation: orbit 1.1s linear infinite; }
  .loading p { color: #918ba1; font-size: 12px; }
  @keyframes orbit { to { transform: rotate(360deg); } }
  @media (max-width: 820px) {
    .hero { grid-template-columns: 1fr; }
    .kpis { grid-template-columns: repeat(3, 1fr); }
    .ventures { grid-template-columns: 1fr; }
    .section-grid, .decision-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 560px) {
    .shell { padding: 18px; border-radius: 18px; }
    .topline { align-items: start; }
    .revision { text-align: right; }
    .kpis { grid-template-columns: repeat(2, 1fr); }
    .work-grid { grid-template-columns: 1fr; }
    .tabs { overflow-x: auto; }
    .footer { align-items: flex-start; flex-direction: column; }
  }
`;

function formatMetric(metric: Metric): string {
  const locale = document.documentElement.lang || "en-US";
  const value = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(metric.value);
  return metric.unit === "%" ? `${value}%` : `${value} ${metric.unit}`;
}

function shortDate(value?: string): string {
  if (!value) return "No date";
  const locale = document.documentElement.lang || "en-US";
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(new Date(value));
}

function useStarlightApp() {
  const appRef = useRef<McpAppsBridge | null>(null);
  const [connected, setConnected] = useState(false);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(() => window.openai?.toolOutput?.snapshot ?? null);

  useEffect(() => {
    let active = true;
    const app = new McpAppsBridge();
    app.onToolResult = (result) => {
      const next = (result.structuredContent as { snapshot?: Snapshot } | undefined)?.snapshot;
      if (next && active) setSnapshot(next);
    };
    appRef.current = app;
    void app.connect().then(
      () => active && setConnected(true),
      () => active && setConnected(false),
    );
    return () => {
      active = false;
      appRef.current = null;
      void app.close();
    };
  }, []);

  async function callTool(name: string, args: Record<string, unknown>) {
    if (connected && appRef.current) return appRef.current.callServerTool(name, args);
    if (window.openai?.callTool) return window.openai.callTool(name, args);
    throw new Error("The host tool bridge is not available.");
  }

  async function updateContext(content: string, structuredContent?: Record<string, unknown>) {
    if (connected && appRef.current) {
      await appRef.current.updateModelContext(content, structuredContent);
    }
  }

  async function ask(prompt: string) {
    if (connected && appRef.current) {
      await appRef.current.sendMessage(prompt);
      return;
    }
    await window.openai?.sendFollowUpMessage?.({ prompt });
  }

  return { snapshot, setSnapshot, callTool, updateContext, ask };
}

function Kpi({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className={`kpi ${tone ?? ""}`}>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}

function Overview({ venture }: { venture: Venture }) {
  return (
    <div className="section-grid">
      <section>
        <div className="section-title"><h2>Objectives</h2><span>{venture.objectives.length} operating commitments</span></div>
        {venture.objectives.length ? venture.objectives.map((objective) => (
          <article className="objective" key={objective.id}>
            <div className="objective-top">
              <span>{objective.title}</span>
              <strong>{objective.progress}%</strong>
            </div>
            <div className="bar"><i style={{ width: `${Math.max(0, Math.min(100, objective.progress))}%` }} /></div>
            <div className="objective-meta">{objective.owner} · {objective.status.replaceAll("_", " ")} · {shortDate(objective.due_date)}</div>
          </article>
        )) : <div className="empty">No objectives in this snapshot.</div>}
      </section>
      <section>
        <div className="section-title"><h2>Signals</h2><span>current / target</span></div>
        <div className="metric-list">
          {venture.metrics.map((metric) => (
            <div className="metric" key={metric.key}>
              <div className="metric-line">
                <span>{metric.label}</span>
                <strong>{formatMetric(metric)}{metric.target !== undefined ? ` / ${metric.target}` : ""}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const lanes: Array<{ key: WorkStatus; label: string }> = [
  { key: "ready", label: "Ready" },
  { key: "in_progress", label: "In motion" },
  { key: "blocked", label: "Blocked" },
];

function WorkBoard({ work, onInspect }: { work: WorkItem[]; onInspect: (item: WorkItem) => void }) {
  return (
    <div className="work-grid">
      {lanes.map((lane) => {
        const records = work.filter((item) => item.status === lane.key);
        return (
          <section className="lane" key={lane.key}>
            <div className="lane-title"><span>{lane.label}</span><span>{records.length}</span></div>
            {records.map((item) => (
              <article className="work-card" key={item.id} onClick={() => onInspect(item)}>
                <h3>{item.title}</h3>
                <div className="work-meta">
                  <span className={`pill ${item.priority}`}>{item.priority}</span>
                  <span className="pill">{item.owner}</span>
                  <span className="pill">v{item.version}</span>
                  {item.due_date && <span className="pill">{shortDate(item.due_date)}</span>}
                </div>
              </article>
            ))}
            {!records.length && <div className="empty">Clear</div>}
          </section>
        );
      })}
    </div>
  );
}

function DecisionLedger({ decisions, evidence }: { decisions: Decision[]; evidence: Evidence[] }) {
  return (
    <div className="decision-grid">
      <section>
        <div className="section-title"><h2>Decision ledger</h2><span>{decisions.length} records</span></div>
        {decisions.map((record) => (
          <article className="decision" key={record.id}>
            <h3>{record.title}</h3>
            <p>{record.decision}</p>
            <div className="record-meta">
              <span className="record-status">{record.status}</span>
              <span>{record.owner}</span>
              {record.review_date && <span>Review {shortDate(record.review_date)}</span>}
              <span>{record.evidence_ids.length} sources</span>
            </div>
          </article>
        ))}
        {!decisions.length && <div className="empty">No recorded decisions.</div>}
      </section>
      <section>
        <div className="section-title"><h2>Evidence</h2><span>{evidence.length} sources</span></div>
        {evidence.map((record) => (
          <article className="evidence" key={record.id}>
            <h3>{record.source_url ? <a href={record.source_url} target="_blank" rel="noreferrer">{record.title}</a> : record.title}</h3>
            <p>{record.note ?? record.source_type}</p>
            <div className="record-meta"><span className="record-status">{record.source_type}</span><span>{record.id}</span></div>
          </article>
        ))}
        {!evidence.length && <div className="empty">No evidence registered.</div>}
      </section>
    </div>
  );
}

function CommandCenter() {
  const { snapshot, setSnapshot, callTool, updateContext, ask } = useStarlightApp();
  const initialState = window.openai?.widgetState ?? {};
  const [selectedVenture, setSelectedVenture] = useState(initialState.selectedVenture ?? "");
  const [tab, setTab] = useState<"overview" | "work" | "decisions">(
    initialState.tab === "work" || initialState.tab === "decisions" ? initialState.tab : "overview",
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!snapshot?.ventures.length) return;
    if (!selectedVenture || !snapshot.ventures.some((venture) => venture.id === selectedVenture)) {
      setSelectedVenture(snapshot.ventures[0].id);
    }
  }, [snapshot, selectedVenture]);

  const venture = snapshot?.ventures.find((candidate) => candidate.id === selectedVenture) ?? snapshot?.ventures[0];
  const ventureWork = useMemo(
    () => snapshot?.work_items.filter((item) => item.venture_id === venture?.id) ?? [],
    [snapshot, venture?.id],
  );
  const ventureDecisions = useMemo(
    () => snapshot?.decisions.filter((item) => item.venture_id === venture?.id) ?? [],
    [snapshot, venture?.id],
  );
  const ventureEvidence = useMemo(
    () => snapshot?.evidence.filter((item) => item.venture_id === venture?.id) ?? [],
    [snapshot, venture?.id],
  );

  function persist(nextVenture: string, nextTab: string) {
    window.openai?.setWidgetState?.({ selectedVenture: nextVenture, tab: nextTab });
  }

  async function selectVenture(id: string) {
    setSelectedVenture(id);
    persist(id, tab);
    const selected = snapshot?.ventures.find((candidate) => candidate.id === id);
    if (selected) {
      await updateContext(`The user selected venture ${selected.name} (${selected.id}) in the Starlight command center.`, {
        selected_venture_id: selected.id,
        selected_venture_name: selected.name,
      });
    }
  }

  function selectTab(next: "overview" | "work" | "decisions") {
    setTab(next);
    persist(venture?.id ?? selectedVenture, next);
  }

  async function refresh() {
    setRefreshing(true);
    try {
      const result = await callTool("get_portfolio_snapshot", { include_closed: false });
      const next = (result.structuredContent as { snapshot?: Snapshot } | undefined)?.snapshot;
      if (next) setSnapshot(next);
    } finally {
      setRefreshing(false);
    }
  }

  if (!snapshot || !venture) {
    return (
      <main className="shell loading">
        <div><div className="loading-orbit" /><strong>Starlight is resolving the operating graph</strong><p>Waiting for an authoritative portfolio snapshot.</p></div>
      </main>
    );
  }

  return (
    <main className="shell">
      <div className="topline">
        <div className="brand"><span className="mark" />Starlight Intelligence</div>
        <div className="revision"><span className="live" />REV {snapshot.revision} · {new Date(snapshot.generated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
      </div>

      <header className="hero">
        <div><div className="eyebrow">Venture control plane</div><h1>Portfolio <span>posture.</span></h1></div>
        <p className="doctrine">{snapshot.workspace.doctrine}</p>
      </header>

      <section className="kpis" aria-label="Portfolio summary">
        <Kpi label="Ventures" value={snapshot.summary.ventures} />
        <Kpi label="Active work" value={snapshot.summary.active_work} />
        <Kpi label="Blocked" value={snapshot.summary.blocked_work} tone={snapshot.summary.blocked_work ? "alert" : ""} />
        <Kpi label="Critical" value={snapshot.summary.critical_work} tone={snapshot.summary.critical_work ? "attention" : ""} />
        <Kpi label="Pending decisions" value={snapshot.summary.pending_decisions} />
        <Kpi label="Evidence records" value={snapshot.summary.evidence_records} />
      </section>

      <section className="ventures" aria-label="Ventures">
        {snapshot.ventures.map((item) => (
          <button className={`venture ${item.id === venture.id ? "selected" : ""}`} key={item.id} onClick={() => void selectVenture(item.id)}>
            <div className="venture-head"><div><div className="venture-name">{item.name}</div><div className="venture-kind">{item.kind}</div></div><span className={`health ${item.health}`} /></div>
            <p className="venture-mission">{item.mission}</p>
            <div className="mini-metrics">
              {item.metrics.slice(0, 2).map((metric) => <div key={metric.key}><div className="mini-value">{formatMetric(metric)}</div><div className="mini-label">{metric.label}</div></div>)}
            </div>
          </button>
        ))}
      </section>

      <section className="panel">
        <nav className="tabs" aria-label="Command center views">
          {(["overview", "work", "decisions"] as const).map((item) => <button className={`tab ${tab === item ? "active" : ""}`} key={item} onClick={() => selectTab(item)}>{item === "work" ? "Execution" : item === "decisions" ? "Decisions + evidence" : "Venture posture"}</button>)}
        </nav>
        <div className="panel-content">
          {tab === "overview" && <Overview venture={venture} />}
          {tab === "work" && <WorkBoard work={ventureWork} onInspect={(item) => void ask(`Inspect Starlight work item ${item.id}. Explain its current state, dependencies, and the highest-leverage next move without changing it.`)} />}
          {tab === "decisions" && <DecisionLedger decisions={ventureDecisions} evidence={ventureEvidence} />}
        </div>
      </section>

      <footer className="footer">
        <span>{snapshot.workspace.name} · snapshot {snapshot.snapshot_id}</span>
        <div className="actions">
          <button className="action" onClick={() => void refresh()} disabled={refreshing}>{refreshing ? "Refreshing…" : "Refresh state"}</button>
          <button className="action primary" onClick={() => void ask(`Analyze ${venture.name} from the current Starlight snapshot. Name the binding constraint, the evidence gap, and the next decision that requires my responsibility.`)}>Interrogate posture</button>
        </div>
      </footer>
    </main>
  );
}

const style = document.createElement("style");
style.textContent = css;
document.head.appendChild(style);

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root mount point");
createRoot(root).render(<CommandCenter />);
