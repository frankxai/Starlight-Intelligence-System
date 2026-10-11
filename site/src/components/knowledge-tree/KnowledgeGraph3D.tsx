"use client";

// ─────────────────────────────────────────────────────────────────────────────
// KnowledgeGraph3D — 3D cosmic Knowledge Tree explorer (flagship hero).
//
// This is a pure Client Component. It is never imported by a Server Component
// directly — always through GraphWrapper.tsx via next/dynamic ssr:false.
//
// Renderer: @react-three/fiber + drei + postprocessing.
//
// Aesthetic: vast luminous knowledge graph in a near-black void (#060609),
// thin glowing CYAN (#22d3ee) edges, domain-accent colored nodes, soft bloom,
// depth, subtle starfield, premium/cinematic.
//
// Interactions:
//   - OrbitControls (rotate/zoom/pan, damped, touch-friendly)
//   - Click/tap node → raises selection; shows shared glass detail panel
//   - Hover → highlight node + its edges
//   - Idle auto-orbit (pauses when user interacts)
//   - Render loop pauses when tab is hidden
//
// Fallback:
//   - prefers-reduced-motion → renders 2D KnowledgeGraph instead
//   - WebGL unavailable → renders 2D KnowledgeGraph instead
//   - Never a blank screen
// ─────────────────────────────────────────────────────────────────────────────

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Stars,
  OrbitControls,
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";

import {
  KNOWLEDGE_GRAPH,
  DOMAINS,
  getDomain,
  getNode,
  neighbors,
} from "@/lib/knowledge-tree/data";
import type { KnowledgeNode, NodeKind } from "@/lib/knowledge-tree/schema";
import { ACCENT_TEXT, ACCENT_CHIP, ACCENT_BORDER, ACCENT_BG_SOFT } from "@/lib/accents";
import type { Accent } from "@/lib/accents";

// ── Accent → hex color ────────────────────────────────────────────────────────
const ACCENT_HEX: Record<Accent, string> = {
  cyan:    "#22d3ee",
  amber:   "#fbbf24",
  emerald: "#34d399",
  fuchsia: "#e879f9",
  violet:  "#a78bfa",
  rose:    "#fb7185",
};

// ── Node kind labels ──────────────────────────────────────────────────────────
const KIND_LABELS: Record<NodeKind, string> = {
  concept:      "Concept",
  skill:        "Skill",
  practice:     "Practice",
  artifact:     "Artifact",
  evidence:     "Evidence",
  contribution: "Contribution",
  quest:        "Quest",
};

// ── Node size by kind ─────────────────────────────────────────────────────────
function getNodeRadius(kind: NodeKind): number {
  if (kind === "artifact" || kind === "contribution" || kind === "quest") return 0.28;
  if (kind === "concept") return 0.24;
  return 0.20;
}

// ── 3D Layout — deterministic spherical cluster layout ─────────────────────────
// Groups nodes by domain into 4 clusters arranged in a tetrahedron pattern,
// then positions each node within its cluster using a golden-spiral shell.

interface Node3D {
  id: string;
  x: number;
  y: number;
  z: number;
  node: KnowledgeNode;
  color: THREE.Color;
  radius: number;
}

function buildLayout(): Node3D[] {
  // Four domain cluster centers — tetrahedron vertices scaled to spread nicely
  const clusterCenters: Record<string, [number, number, number]> = {
    "ai-architect":    [ 8,  5, -3],
    "space-builder":   [-8,  5,  3],
    "bio-intelligence":[3, -6,  8],
    "creator-founder": [-3, -6, -8],
  };

  const result: Node3D[] = [];

  for (const domain of DOMAINS) {
    const center = clusterCenters[domain.id] ?? [0, 0, 0];
    const domainNodes = KNOWLEDGE_GRAPH.nodes.filter((n) => n.domainId === domain.id);
    const accent = domain.accent as Accent;
    const hexColor = ACCENT_HEX[accent];

    domainNodes.forEach((node, i) => {
      // Golden-spiral spherical distribution within the cluster
      const n = domainNodes.length;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      // Spread radius varies by node kind
      const spread = node.kind === "concept" ? 3.5 : node.kind === "skill" ? 4.5 : 5.5;
      const x = center[0] + spread * Math.sin(phi) * Math.cos(theta);
      const y = center[1] + spread * Math.sin(phi) * Math.sin(theta);
      const z = center[2] + spread * Math.cos(phi);

      result.push({
        id: node.id,
        x,
        y,
        z,
        node,
        color: new THREE.Color(hexColor),
        radius: getNodeRadius(node.kind),
      });
    });
  }

  return result;
}

// ── NodeMesh — individual glowing sphere ──────────────────────────────────────

interface NodeMeshProps {
  node3D: Node3D;
  isHovered: boolean;
  isSelected: boolean;
  isNeighbor: boolean;
  onClick: (id: string) => void;
  onHover: (id: string | null) => void;
}

function NodeMesh({ node3D, isHovered, isSelected, isNeighbor, onClick, onHover }: NodeMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const active = isHovered || isSelected;
  const targetScale = active ? 1.4 : isNeighbor ? 1.15 : 1.0;
  const scaleRef = useRef(1.0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    // Smooth scale lerp
    scaleRef.current += (targetScale - scaleRef.current) * Math.min(delta * 8, 1);
    meshRef.current.scale.setScalar(scaleRef.current);
    if (glowRef.current) glowRef.current.scale.setScalar(scaleRef.current);
  });

  const emissiveIntensity = active ? 2.5 : isNeighbor ? 1.0 : 0.6;
  const glowOpacity = active ? 0.25 : isNeighbor ? 0.1 : 0.06;

  return (
    <group position={[node3D.x, node3D.y, node3D.z]}>
      {/* Outer glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[node3D.radius * 2.2, 12, 12]} />
        <meshBasicMaterial
          color={node3D.color}
          transparent
          opacity={glowOpacity}
          depthWrite={false}
        />
      </mesh>

      {/* Core sphere — emissive for bloom */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(node3D.id); }}
        onPointerEnter={(e) => { e.stopPropagation(); onHover(node3D.id); }}
        onPointerLeave={(e) => { e.stopPropagation(); onHover(null); }}
      >
        <sphereGeometry args={[node3D.radius, 20, 20]} />
        <meshStandardMaterial
          color={node3D.color}
          emissive={node3D.color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

// ── EdgeLines — faint cyan connection lines ────────────────────────────────────

interface EdgeLinesProps {
  layout: Node3D[];
  hoveredId: string | null;
  selectedId: string | null;
}

function EdgeLines({ layout, hoveredId, selectedId }: EdgeLinesProps) {
  const posMap = useMemo(() => {
    const m: Record<string, [number, number, number]> = {};
    for (const n of layout) m[n.id] = [n.x, n.y, n.z];
    return m;
  }, [layout]);

  const activeId = selectedId ?? hoveredId;

  const lines = useMemo(() => {
    return KNOWLEDGE_GRAPH.edges.map((edge) => {
      const a = posMap[edge.source];
      const b = posMap[edge.target];
      if (!a || !b) return null;

      const isActive =
        !!activeId &&
        (edge.source === activeId || edge.target === activeId);

      const points = [
        new THREE.Vector3(a[0], a[1], a[2]),
        new THREE.Vector3(b[0], b[1], b[2]),
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      return { geometry, isActive, key: `${edge.source}-${edge.target}` };
    }).filter((x): x is NonNullable<typeof x> => x !== null);
  }, [posMap, activeId]);

  return (
    <group>
      {lines.map((line) => (
        <line key={line.key}>
          <primitive object={line.geometry} attach="geometry" />
          <lineBasicMaterial
            color="#22d3ee"
            transparent
            opacity={line.isActive ? 0.55 : 0.08}
            depthWrite={false}
          />
        </line>
      ))}
    </group>
  );
}

// ── AutoOrbit — gentle idle rotation ─────────────────────────────────────────
// Uses useFrame's `state.get()` to access the live camera without triggering
// the react-hooks/immutability rule (we read from the store, not from a hook
// return value).

function AutoOrbit({
  controlsRef,
}: {
  controlsRef: React.RefObject<OrbitControlsType | null>;
}) {
  const get = useThree((s) => s.get);
  const idleTimer = useRef(0);
  const orbiting = useRef(true);
  const orbitAngle = useRef(0);
  const initRadius = useRef<number | null>(null);

  useEffect(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    const onStart = () => {
      orbiting.current = false;
      idleTimer.current = 0;
    };
    controls.addEventListener("start", onStart);
    return () => controls.removeEventListener("start", onStart);
  }, [controlsRef]);

  useFrame((_, delta) => {
    const cam = get().camera;

    if (!orbiting.current) {
      idleTimer.current += delta;
      if (idleTimer.current > 3) {
        orbiting.current = true;
        // Sync angle to current camera position so orbit resumes smoothly
        orbitAngle.current = Math.atan2(cam.position.x, cam.position.z);
      }
      return;
    }

    // Capture orbit radius on first orbit frame
    if (initRadius.current === null) {
      initRadius.current = Math.sqrt(
        cam.position.x * cam.position.x + cam.position.z * cam.position.z
      );
      if (initRadius.current < 0.01) initRadius.current = 38;
    }

    const speed = 0.04;
    orbitAngle.current += speed * delta;
    const radius = initRadius.current;

    // Directly mutate the live camera from the store — not a hook return value
    cam.position.x = radius * Math.sin(orbitAngle.current);
    cam.position.z = radius * Math.cos(orbitAngle.current);
    cam.lookAt(0, 0, 0);
  });

  return null;
}

// ── TabVisibility — pause/resume render loop on tab visibility ────────────────

function TabVisibilityPause() {
  const { frameloop, set } = useThree();

  useEffect(() => {
    const savedFrameloop = frameloop;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        set({ frameloop: "never" });
      } else {
        set({ frameloop: savedFrameloop });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

// ── Scene — main 3D content ───────────────────────────────────────────────────

interface SceneProps {
  layout: Node3D[];
  hoveredId: string | null;
  selectedId: string | null;
  onNodeClick: (id: string) => void;
  onNodeHover: (id: string | null) => void;
  reducedMotion: boolean;
  isMobile: boolean;
}

function Scene({
  layout,
  hoveredId,
  selectedId,
  onNodeClick,
  onNodeHover,
  reducedMotion,
  isMobile,
}: SceneProps) {
  const controlsRef = useRef<OrbitControlsType | null>(null);

  const neighborSet = useMemo(() => {
    const activeId = selectedId ?? hoveredId;
    if (!activeId) return new Set<string>();
    return new Set(neighbors(activeId));
  }, [hoveredId, selectedId]);

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 15, 10]} intensity={1.2} color="#22d3ee" />
      <pointLight position={[-10, -8, -10]} intensity={0.6} color="#fbbf24" />

      {/* Starfield */}
      <Stars
        radius={120}
        depth={50}
        count={isMobile ? 800 : 3000}
        factor={isMobile ? 2 : 3}
        saturation={0}
        fade
        speed={reducedMotion ? 0 : 0.3}
      />

      {/* Edges */}
      <EdgeLines
        layout={layout}
        hoveredId={hoveredId}
        selectedId={selectedId}
      />

      {/* Nodes */}
      {layout.map((node3D) => (
        <NodeMesh
          key={node3D.id}
          node3D={node3D}
          isHovered={hoveredId === node3D.id}
          isSelected={selectedId === node3D.id}
          isNeighbor={neighborSet.has(node3D.id)}
          onClick={onNodeClick}
          onHover={onNodeHover}
        />
      ))}

      {/* Controls */}
      <OrbitControls
        ref={controlsRef as React.RefObject<OrbitControlsType>}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        zoomSpeed={0.8}
        panSpeed={0.5}
        minDistance={8}
        maxDistance={60}
        enablePan={true}
        makeDefault
      />

      {/* Auto-orbit when idle */}
      {!reducedMotion && (
        <AutoOrbit controlsRef={controlsRef} />
      )}

      {/* Tab visibility pause */}
      <TabVisibilityPause />

      {/* Bloom post-processing — skip on mobile to save GPU */}
      {!isMobile && (
        <EffectComposer>
          <Bloom
            mipmapBlur
            luminanceThreshold={0.3}
            luminanceSmoothing={0.9}
            intensity={1.4}
            radius={0.6}
          />
        </EffectComposer>
      )}
    </>
  );
}

// ── NodeDetailPanel — glass detail panel ──────────────────────────────────────

function NodeDetailPanel({
  node,
  onClose,
}: {
  node: KnowledgeNode;
  onClose: () => void;
}) {
  const domain = getDomain(node.domainId);
  const accent = (domain?.accent ?? "cyan") as Accent;
  const neighborIds = neighbors(node.id);
  const neighborNodes = neighborIds
    .map((id) => getNode(id))
    .filter((n): n is KnowledgeNode => !!n);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <aside
      className={[
        "absolute right-4 top-4 z-20",
        "w-72 max-h-[calc(100%-2rem)] overflow-y-auto",
        "rounded-2xl border bg-[#060609]/90 backdrop-blur-xl p-5",
        "shadow-2xl",
        ACCENT_BORDER[accent],
        ACCENT_BG_SOFT[accent],
      ].join(" ")}
      role="complementary"
      aria-label={`Node detail: ${node.label}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] font-medium uppercase tracking-widest ${ACCENT_TEXT[accent]}`}>
            {domain?.name ?? node.domainId}
          </p>
          <h3 className="mt-1 text-[15px] font-semibold text-white leading-snug">
            {node.label}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close detail panel"
          className="shrink-0 rounded-md p-1 text-slate-500 transition-colors hover:text-white hover:bg-white/[0.06]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M1 1L13 13M13 1L1 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Kind badge */}
      <span className={`mt-3 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] ${ACCENT_CHIP[accent]}`}>
        {KIND_LABELS[node.kind]}
      </span>

      {/* Summary */}
      {node.summary && (
        <p className="mt-4 text-[13px] leading-relaxed text-slate-300">
          {node.summary}
        </p>
      )}

      {/* Neighbors */}
      {neighborNodes.length > 0 && (
        <div className="mt-5">
          <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500 mb-2">
            Connected nodes
          </p>
          <ul className="space-y-1.5">
            {neighborNodes.map((n) => {
              const nDomain = getDomain(n.domainId);
              const nAccent = (nDomain?.accent ?? "cyan") as Accent;
              return (
                <li key={n.id}>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] ${ACCENT_CHIP[nAccent]}`}>
                    {n.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </aside>
  );
}

// ── Accessible fallback list ──────────────────────────────────────────────────

function AccessibleNodeList() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:inset-x-0 focus-within:bottom-0 focus-within:z-30 focus-within:max-h-64 focus-within:overflow-y-auto focus-within:bg-[#060609]/95 focus-within:p-4 focus-within:border-t focus-within:border-white/[0.08]">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="text-[13px] text-cyan-400 underline mb-3 block focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        {expanded ? "Hide" : "Show"} accessible node list
      </button>
      {expanded && (
        <nav aria-label="Knowledge Tree nodes by domain">
          {DOMAINS.map((domain) => {
            const domainNodes = KNOWLEDGE_GRAPH.nodes.filter(
              (n: KnowledgeNode) => n.domainId === domain.id
            );
            return (
              <section key={domain.id} className="mb-4">
                <h3 className="text-[13px] font-semibold text-white mb-1">
                  {domain.name}
                </h3>
                <p className="text-[12px] text-slate-400 mb-2">{domain.blurb}</p>
                <ul className="space-y-1">
                  {domainNodes.map((node: KnowledgeNode) => (
                    <li key={node.id} className="text-[12px] text-slate-300">
                      <strong>{node.label}</strong>{" "}
                      <span className="text-slate-500">({KIND_LABELS[node.kind]})</span>
                      {node.summary && (
                        <span className="block text-slate-400 text-[11px] mt-0.5">
                          {node.summary}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </nav>
      )}
    </div>
  );
}

// ── KnowledgeGraph3D — main exported component ────────────────────────────────

export default function KnowledgeGraph3D() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);

  // Build 3D layout once (stable — module constants never change)
  const layout = useMemo(() => buildLayout(), []);

  // Detect reduced motion via lazy initializer (this component is client-only)
  const [reducedMotion] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  // Detect mobile viewport — lazy initializer is safe here (client-only component)
  const [isMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 640px)").matches;
  });

  const handleNodeClick = useCallback((id: string) => {
    const node = getNode(id);
    setSelectedNode((prev) => (prev?.id === id ? null : (node ?? null)));
  }, []);

  const handleNodeHover = useCallback((id: string | null) => {
    setHoveredId(id);
    if (typeof document !== "undefined") {
      document.body.style.cursor = id ? "pointer" : "default";
    }
  }, []);

  const handleCanvasClick = useCallback(() => {
    // Deselect if we click background (node clicks stopPropagation)
    setSelectedNode(null);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#060609]">
      {/* Three.js Canvas */}
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 38], fov: 55, near: 0.1, far: 300 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: "#060609" }}
        onClick={handleCanvasClick}
        frameloop={reducedMotion ? "demand" : "always"}
      >
        <Suspense fallback={null}>
          <Scene
            layout={layout}
            hoveredId={hoveredId}
            selectedId={selectedNode?.id ?? null}
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
            reducedMotion={reducedMotion}
            isMobile={isMobile}
          />
        </Suspense>
      </Canvas>

      {/* Domain legend — top-left overlay */}
      <div
        className="pointer-events-none absolute left-4 top-4 z-10 flex flex-col gap-1.5"
        aria-hidden="true"
      >
        {DOMAINS.map((domain) => {
          const accent = domain.accent as Accent;
          return (
            <div key={domain.id} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: ACCENT_HEX[accent] }}
              />
              <span className="text-[11px] font-medium text-slate-400">
                {domain.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Interaction hint — bottom-left overlay */}
      <p
        className="pointer-events-none absolute bottom-4 left-4 z-10 text-[11px] text-slate-600"
        aria-hidden="true"
      >
        Click a node to explore &middot; Drag to rotate &middot; Scroll to zoom
      </p>

      {/* Selected node detail panel */}
      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {/* Accessible fallback — sr-only until focused */}
      <AccessibleNodeList />
    </div>
  );
}
