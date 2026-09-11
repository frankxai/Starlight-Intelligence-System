"use client";

import { useMemo, useState } from "react";
import { graphAtlas } from "@/lib/graph-atlas-data.generated";
import styles from "./graph-atlas.module.css";

type AtlasView = (typeof graphAtlas.views)[number];
type AtlasNode = AtlasView["nodes"][number];

const nodeWidth = 132;
const nodeHeight = 72;

function titleLines(title: string) {
  const lines: string[] = [];
  for (const word of title.split(' ')) {
    const last = lines.length - 1;
    if (last >= 0 && `${lines[last]} ${word}`.length <= 20) lines[last] += ` ${word}`;
    else lines.push(word);
  }
  return lines;
}

function edgePath(from: AtlasNode, to: AtlasNode, feedback = false) {
  const x1 = from.x + nodeWidth;
  const y1 = from.y + nodeHeight / 2;
  const x2 = to.x;
  const y2 = to.y + nodeHeight / 2;
  if (feedback) return `M ${x1} ${y1} C ${x1 + 90} 430, ${x2 - 90} 430, ${x2} ${y2}`;
  const bend = Math.max(34, Math.abs(x2 - x1) * 0.42);
  return `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`;
}

export function GraphAtlasClient() {
  const [viewId, setViewId] = useState<string>(graphAtlas.views[0].id);
  const [routeId, setRouteId] = useState<string>(graphAtlas.routes[0].id);
  const view = graphAtlas.views.find((candidate) => candidate.id === viewId) ?? graphAtlas.views[0];
  const route = graphAtlas.routes.find((candidate) => candidate.id === routeId) ?? graphAtlas.routes[0];
  const [selectedId, setSelectedId] = useState<string>(view.nodes[0].id);

  const selected = useMemo(
    () => view.nodes.find((node) => node.id === selectedId) ?? view.nodes[0],
    [selectedId, view],
  );
  const nodeMap = useMemo(() => new Map<string, AtlasNode>(view.nodes.map((node) => [node.id, node])), [view]);
  const routeIds = view.id === "estate" ? new Set<string>(route.nodeIds) : null;
  const [zoom, setZoom] = useState(1);
  const width = Math.max(...view.nodes.map((node) => node.x + nodeWidth)) + 32;
  const height = Math.max(480, ...view.nodes.map((node) => node.y + nodeHeight + 32));

  function selectView(id: string) {
    const next = graphAtlas.views.find((candidate) => candidate.id === id) ?? graphAtlas.views[0];
    setViewId(id);
    setSelectedId(next.nodes[0].id);
  }

  return (
    <section className={styles.atlas} aria-labelledby="atlas-title">
      <div className={styles.atlasHeading}>
        <div>
          <span className={styles.kicker}>Interactive architecture</span>
          <h2 id="atlas-title">Explore the workflow contracts.</h2>
        </div>
        <p>Seven projections, one model. Select a view, route, or node to inspect the contract.</p>
      </div>

      <div className={styles.viewTabs} role="tablist" aria-label="Graph projections">
        {graphAtlas.views.map((candidate) => (
          <button
            key={candidate.id}
            role="tab"
            id={`tab-${candidate.id}`}
            aria-controls="atlas-panel"
            tabIndex={candidate.id === view.id ? 0 : -1}
            aria-selected={candidate.id === view.id}
            className={candidate.id === view.id ? styles.activeTab : ""}
            onClick={() => selectView(candidate.id)}
            onKeyDown={(event) => {
              const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
              if (!keys.includes(event.key)) return;
              event.preventDefault();
              const index = graphAtlas.views.findIndex((item) => item.id === candidate.id);
              const next = event.key === 'Home' ? 0 : event.key === 'End' ? graphAtlas.views.length - 1 :
                (index + (event.key === 'ArrowRight' ? 1 : -1) + graphAtlas.views.length) % graphAtlas.views.length;
              const id = graphAtlas.views[next].id;
              selectView(id);
              document.getElementById(`tab-${id}`)?.focus();
            }}
          >
            {candidate.label}
          </button>
        ))}
      </div>

      <div id="atlas-panel" role="tabpanel" aria-labelledby={`tab-${view.id}`}>
      <div className={styles.graphIntro}>
        <div><span>Projection {String(graphAtlas.views.findIndex((item) => item.id === view.id) + 1).padStart(2, "0")}</span><h3>{view.title}</h3></div>
        <p>{view.description}</p>
      </div>

      {view.id === "estate" && (
        <div className={styles.routeBar} aria-label="Domain routes">
          <span>Highlight route</span>
          <div>
            {graphAtlas.routes.map((candidate) => (
              <button
                key={candidate.id}
                aria-pressed={candidate.id === route.id}
                onClick={() => setRouteId(candidate.id)}
                style={{ "--route-color": candidate.color } as React.CSSProperties}
              >
                {candidate.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.graphControls}>
        <label>Inspect node <select value={selected.id} onChange={(event) => setSelectedId(event.target.value)}>
          {view.nodes.map((node) => <option key={node.id} value={node.id}>{node.title}</option>)}
        </select></label>
        <button onClick={() => setZoom(1)} aria-pressed={zoom === 1}>Fit diagram</button>
        <button onClick={() => setZoom(2)} aria-pressed={zoom === 2}>Enlarge diagram</button>
      </div>
      <div className={styles.graphWorkspace}>
        <div className={styles.canvasScroll} tabIndex={0} aria-label={`${view.title} diagram. Use the node selector for a text alternative.`}>
          <svg className={styles.canvas} style={{ width: `${zoom * 100}%` }} viewBox={`0 0 ${width} ${height}`} role="group" aria-labelledby="graph-svg-title graph-svg-desc">
            <title id="graph-svg-title">{view.title}</title>
            <desc id="graph-svg-desc">{view.description}. Select a node button to inspect its receipt contract.</desc>
            <defs>
              <marker id="atlas-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 8 4 L 0 8 z" />
              </marker>
              <pattern id="atlas-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" />
              </pattern>
            </defs>
            <rect className={styles.gridField} x="0" y="0" width={width} height={height} fill="url(#atlas-grid)" />
            <g className={styles.edges}>
              {view.edges.map((edge, index) => {
                const from = nodeMap.get(edge.from);
                const to = nodeMap.get(edge.to);
                if (!from || !to) return null;
                const routeEdge = routeIds?.has(edge.from) && routeIds?.has(edge.to);
                const dimmed = routeIds && !routeEdge;
                return (
                  <path
                    key={`${edge.from}-${edge.to}-${index}`}
                    d={edgePath(from, to, "feedback" in edge && edge.feedback)}
                    className={`${styles.edge} ${dimmed ? styles.edgeDimmed : ""} ${edge.status === "target" ? styles.edgeTarget : ""}`}
                    style={routeEdge ? { stroke: route.color } : undefined}
                    markerEnd="url(#atlas-arrow)"
                  >
                    <title>{edge.contract}</title>
                  </path>
                );
              })}
            </g>
            <g>
              {view.nodes.map((node) => {
                const dimmed = routeIds && !routeIds.has(node.id);
                const active = selected.id === node.id;
                return (
                  <g
                    key={node.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${node.title}. ${node.detail}`}
                    aria-pressed={active}
                    transform={`translate(${node.x} ${node.y})`}
                    className={`${styles.node} ${styles[`node_${node.kind}`]} ${dimmed ? styles.nodeDimmed : ""} ${active ? styles.nodeActive : ""}`}
                    onClick={() => setSelectedId(node.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedId(node.id);
                      }
                    }}
                  >
                    <rect width={nodeWidth} height={nodeHeight} rx="2" />
                    <text className={styles.nodeTitle} x="10" y="21">{titleLines(node.title).map((line, i) => <tspan x="10" dy={i ? 14 : 0} key={i}>{line}</tspan>)}</text>
                    <text className={styles.nodeMeta} x="10" y="62">{node.layer} · {node.status}</text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        <aside className={styles.inspector} aria-live="polite">
          <div className={styles.inspectorTop}>
            <span>Selected node</span>
            <span className={styles.status}>{selected.status}</span>
          </div>
          <h3>{selected.title}</h3>
          <p>{selected.detail}</p>
          <dl>
            <div><dt>Layer</dt><dd>{selected.layer}</dd></div>
            <div><dt>Kind</dt><dd>{selected.kind}</dd></div>
            <div><dt>Receipt</dt><dd><code>{selected.receipt}</code></dd></div>
          </dl>
          <div className={styles.routeContract}>
            <span>Connected contracts</span>
            <ul>{view.edges.filter((edge) => edge.from === selected.id || edge.to === selected.id).map((edge, i) => (
              <li key={i}><button onClick={() => setSelectedId(edge.from === selected.id ? edge.to : edge.from)}>
                {edge.from === selected.id ? 'To' : 'From'} {nodeMap.get(edge.from === selected.id ? edge.to : edge.from)?.title}
              </button><br /><code>{edge.contract}</code></li>
            ))}</ul>
          </div>
          {view.id === "estate" && (
            <div className={styles.routeContract}>
              <span>{route.label} proof contract</span>
              <ul>{route.checks.map((check) => <li key={check}>{check}</li>)}</ul>
            </div>
          )}
        </aside>
      </div>

      <div className={styles.legend} aria-label="Graph legend">
        <span><i className={styles.legendCurrent} />Reference pattern</span>
        <span><i className={styles.legendPartial} />Partial</span>
        <span><i className={styles.legendTarget} />Target</span>
        <span className={styles.legendNote}>Authored architecture, not live telemetry. Contracts are available in the inspector.</span>
      </div>
      </div>
    </section>
  );
}
