"use client";

import { useEffect, useMemo, useState } from "react";
import { Line } from "@react-three/drei";

interface CanvasNode {
  id: string;
  type: "text" | "file" | "link" | "group";
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  label?: string;
  color?: string;
}

interface CanvasEdge {
  id: string;
  fromNode: string;
  toNode: string;
  color?: string;
}

interface CanvasData {
  nodes?: CanvasNode[];
  edges?: CanvasEdge[];
}

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

function computeBounds(nodes: CanvasNode[]): Bounds {
  const xs = nodes.flatMap((n) => [n.x, n.x + n.width]);
  const ys = nodes.flatMap((n) => [n.y, n.y + n.height]);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

/**
 * Project canvas 2D space onto a tilted 3D plane.
 * Canvas y grows downward; we invert so taller-on-canvas reads as higher in 3D.
 * The cluster floats above + behind the substrate (radius=14, y=4) so it
 * reads as the "mind palace shell" wrapping the substrate core.
 */
function project(
  node: CanvasNode,
  bounds: Bounds,
  radius: number,
  height: number,
): [number, number, number] {
  const cx = node.x + node.width / 2;
  const cy = node.y + node.height / 2;
  const u = (cx - bounds.minX) / Math.max(1, bounds.maxX - bounds.minX); // 0..1
  const v = (cy - bounds.minY) / Math.max(1, bounds.maxY - bounds.minY); // 0..1
  // u → angle around y-axis; v → height drop. Gives a saddle-like wrap.
  const theta = u * Math.PI * 2;
  const y = height - v * height * 2;
  return [Math.cos(theta) * radius, y, Math.sin(theta) * radius];
}

interface CanvasClusterProps {
  /** Atlas name (without .canvas extension). Matches `memory/atlases/{name}.canvas`. */
  name: string;
  /** Radius from origin where the cluster sits. */
  radius?: number;
  /** Vertical span: nodes fan from +height to -height. */
  height?: number;
}

export default function CanvasCluster({
  name,
  radius = 14,
  height = 5,
}: CanvasClusterProps) {
  const [data, setData] = useState<CanvasData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/canvas/${name}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: CanvasData | null) => {
        if (!cancelled && d) setData(d);
      })
      .catch(() => {
        // silent: a missing canvas should not break the scene
      });
    return () => {
      cancelled = true;
    };
  }, [name]);

  const positions = useMemo(() => {
    if (!data?.nodes?.length) return new Map<string, [number, number, number]>();
    // Exclude group nodes from positioning — they are layout hints, not data.
    const points = data.nodes.filter((n) => n.type !== "group");
    if (!points.length) return new Map();
    const bounds = computeBounds(points);
    const m = new Map<string, [number, number, number]>();
    for (const n of points) {
      m.set(n.id, project(n, bounds, radius, height));
    }
    return m;
  }, [data, radius, height]);

  if (!data?.nodes?.length) return null;

  return (
    <group>
      {Array.from(positions.entries()).map(([id, p]) => {
        const node = data.nodes!.find((n) => n.id === id);
        const color = node?.color || "#a78bfa";
        return (
          <mesh key={id} position={p}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshBasicMaterial color={color} transparent opacity={0.85} />
          </mesh>
        );
      })}
      {(data.edges ?? []).map((e) => {
        const a = positions.get(e.fromNode);
        const b = positions.get(e.toNode);
        if (!a || !b) return null;
        return (
          <Line
            key={e.id}
            points={[a, b]}
            color={e.color || "#6366f1"}
            transparent
            opacity={0.35}
            lineWidth={1}
          />
        );
      })}
    </group>
  );
}
