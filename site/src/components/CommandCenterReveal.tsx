import type { ReactElement } from "react";

const TRACE_LINES = [
  { x1: 74, y1: 88, x2: 196, y2: 176, delay: "0ms" },
  { x1: 92, y1: 248, x2: 196, y2: 176, delay: "220ms" },
  { x1: 128, y1: 332, x2: 196, y2: 176, delay: "440ms" },
  { x1: 196, y1: 176, x2: 324, y2: 120, delay: "720ms" },
  { x1: 196, y1: 176, x2: 342, y2: 232, delay: "960ms" },
  { x1: 196, y1: 176, x2: 292, y2: 334, delay: "1180ms" },
];

const EVIDENCE_NODES = [
  { x: 74, y: 88, label: "CAPTURE", tone: "#a78bfa" },
  { x: 92, y: 248, label: "VAULT", tone: "#22d3ee" },
  { x: 128, y: 332, label: "RECALL", tone: "#e879f9" },
  { x: 324, y: 120, label: "ROUTE", tone: "#34d399" },
  { x: 342, y: 232, label: "VERIFY", tone: "#fbbf24" },
  { x: 292, y: 334, label: "ATTEST", tone: "#fb7185" },
];

const SIGNAL_ROWS = [
  ["capture", "12ms", "ok"],
  ["retrieve", "43ms", "ok"],
  ["route", "6 lanes", "live"],
  ["attest", "sip", "sealed"],
];

export function CommandCenterReveal(): ReactElement {
  return (
    <figure
      className="command-reveal"
      role="img"
      aria-label="Starlight command center trace showing captured context routed through vault, recall, verification, and attestation states."
    >
      <div className="command-reveal-shell" aria-hidden="true">
        <div className="command-reveal-panel command-reveal-panel-back" />
        <div className="command-reveal-panel command-reveal-panel-front">
          <svg viewBox="0 0 420 420" className="command-reveal-map">
            <defs>
              <filter id="command-reveal-glow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
              <radialGradient id="command-reveal-core" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
                <stop offset="48%" stopColor="#67e8f9" stopOpacity="0.72" />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.18" />
              </radialGradient>
            </defs>

            <circle cx="196" cy="176" r="132" fill="none" stroke="rgba(255,255,255,0.045)" />
            <circle cx="196" cy="176" r="88" fill="none" stroke="rgba(103,232,249,0.08)" />
            <circle cx="196" cy="176" r="46" fill="none" stroke="rgba(167,139,250,0.16)" />

            {TRACE_LINES.map((line, index) => (
              <line
                key={`trace-${index}`}
                className="command-trace-line"
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                style={{ animationDelay: line.delay }}
              />
            ))}

            <g className="command-core" style={{ transformOrigin: "196px 176px" }}>
              <circle cx="196" cy="176" r="31" fill="url(#command-reveal-core)" filter="url(#command-reveal-glow)" />
              <circle cx="196" cy="176" r="12" fill="#f8fafc" opacity="0.92" />
              <circle cx="196" cy="176" r="54" fill="none" stroke="rgba(103,232,249,0.16)" strokeWidth="1" />
            </g>

            {EVIDENCE_NODES.map((node, index) => (
              <g
                key={node.label}
                className="command-node"
                style={{ animationDelay: `${index * 140 + 260}ms`, transformOrigin: `${node.x}px ${node.y}px` }}
              >
                <circle cx={node.x} cy={node.y} r="15" fill={node.tone} opacity="0.18" filter="url(#command-reveal-glow)" />
                <circle cx={node.x} cy={node.y} r="5" fill={node.tone} />
                <text x={node.x + 18} y={node.y + 4} className="command-node-label">
                  {node.label}
                </text>
              </g>
            ))}
          </svg>

          <div className="command-readout">
            <div className="command-readout-head">
              <span>TRACE</span>
              <span>CONFIDENCE 0.97</span>
            </div>
            <div className="command-readout-rows">
              {SIGNAL_ROWS.map(([name, value, state], index) => (
                <div
                  key={name}
                  className="command-readout-row"
                  style={{ animationDelay: `${index * 120 + 520}ms` }}
                >
                  <span>{name}</span>
                  <span>{value}</span>
                  <span>{state}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
