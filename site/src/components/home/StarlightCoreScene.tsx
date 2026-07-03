"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

export type ScrollProgressRef = React.MutableRefObject<number>;

const VIOLET = new THREE.Color("#a78bfa");
const CYAN = new THREE.Color("#67e8f9");
const GOLD = new THREE.Color("#fbbf24");
const NODE_COLORS = [CYAN, VIOLET, GOLD];

const NODE_COUNT = 16;
const ORBIT_RADIUS = 2.7;

/** Fibonacci sphere distribution for evenly spread orbital nodes. */
function fibonacciSphere(count: number, radius: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    points.push(
      new THREE.Vector3(
        Math.cos(theta) * r * radius,
        y * radius,
        Math.sin(theta) * r * radius,
      ),
    );
  }
  return points;
}

function useNetworkGeometry() {
  return useMemo(() => {
    const nodes = fibonacciSphere(NODE_COUNT, ORBIT_RADIUS);

    // Spokes: every node wired to the core.
    const positions: number[] = [];
    const colors: number[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const c = NODE_COLORS[i % NODE_COLORS.length];
      positions.push(0, 0, 0, n.x, n.y, n.z);
      colors.push(
        VIOLET.r, VIOLET.g, VIOLET.b,
        c.r, c.g, c.b,
      );
    }

    // Lateral wiring: connect each node to its 2 nearest neighbours.
    for (let i = 0; i < nodes.length; i++) {
      const dists = nodes
        .map((n, j) => ({ j, d: nodes[i].distanceTo(n) }))
        .filter((e) => e.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      for (const { j } of dists) {
        if (j < i) continue; // dedupe
        const a = nodes[i];
        const b = nodes[j];
        const ca = NODE_COLORS[i % NODE_COLORS.length];
        const cb = NODE_COLORS[j % NODE_COLORS.length];
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
        colors.push(ca.r, ca.g, ca.b, cb.r, cb.g, cb.b);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return { nodes, geometry };
  }, []);
}

function StarlightNetwork({
  progressRef,
  reducedMotion,
}: {
  progressRef: ScrollProgressRef;
  reducedMotion: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const coreMat = useRef<THREE.MeshStandardMaterial>(null);
  const coreMesh = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.Mesh>(null);
  const nodesGroup = useRef<THREE.Group>(null);
  const { nodes, geometry } = useNetworkGeometry();

  useFrame((state, delta) => {
    const raw = progressRef.current; // 0..1 full page scroll
    const p = Math.min(1, raw * 3); // recede quickly once the story starts
    const t = state.clock.elapsedTime;

    if (group.current) {
      if (!reducedMotion) {
        group.current.rotation.y += delta * 0.08;
        group.current.rotation.x = THREE.MathUtils.lerp(
          group.current.rotation.x,
          state.pointer.y * 0.12 + p * 1.6,
          0.05,
        );
        group.current.rotation.z = THREE.MathUtils.lerp(
          group.current.rotation.z,
          state.pointer.x * 0.08,
          0.05,
        );
      }
      // Scroll journey: recede + drift down as the story scrolls past.
      const scale = 1 - p * 0.45;
      group.current.scale.setScalar(scale);
      group.current.position.y = -p * 2.4;
      group.current.position.z = -p * 4;
    }

    if (coreMesh.current && !reducedMotion) {
      const breath = 1 + Math.sin(t * 0.9) * 0.04;
      coreMesh.current.scale.setScalar(breath);
    }
    if (coreMat.current) {
      coreMat.current.emissiveIntensity =
        (1.1 + (reducedMotion ? 0 : Math.sin(t * 0.9) * 0.25)) * (1 - p * 0.55);
    }
    if (shell.current && !reducedMotion) {
      shell.current.rotation.y -= delta * 0.03;
      shell.current.rotation.x += delta * 0.015;
    }
    if (nodesGroup.current && !reducedMotion) {
      nodesGroup.current.children.forEach((child, i) => {
        const s = 1 + Math.sin(t * 1.4 + i * 1.7) * 0.28;
        child.scale.setScalar(s);
      });
    }
  });

  return (
    <group ref={group}>
      {/* Core */}
      <mesh ref={coreMesh}>
        <icosahedronGeometry args={[0.85, 2]} />
        <meshStandardMaterial
          ref={coreMat}
          color="#1b1030"
          emissive="#a78bfa"
          emissiveIntensity={1.6}
          roughness={0.25}
          metalness={0.4}
        />
      </mesh>
      {/* Core wireframe halo */}
      <mesh scale={1.18}>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshBasicMaterial
          color="#c4b5fd"
          wireframe
          transparent
          opacity={0.28}
        />
      </mesh>
      {/* Outer lattice shell */}
      <mesh ref={shell} scale={1}>
        <icosahedronGeometry args={[ORBIT_RADIUS + 0.55, 1]} />
        <meshBasicMaterial
          color="#67e8f9"
          wireframe
          transparent
          opacity={0.05}
        />
      </mesh>

      {/* Wiring */}
      <lineSegments geometry={geometry}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.32}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Orbital nodes */}
      <group ref={nodesGroup}>
        {nodes.map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshBasicMaterial
              color={NODE_COLORS[i % NODE_COLORS.length]}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      <pointLight color="#a78bfa" intensity={14} distance={9} />
    </group>
  );
}

function CameraRig({
  progressRef,
  reducedMotion,
}: {
  progressRef: ScrollProgressRef;
  reducedMotion: boolean;
}) {
  useFrame((state) => {
    const p = Math.min(1, progressRef.current * 3);
    const targetZ = 9.6 + p * 5;
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      targetZ,
      0.06,
    );
    if (!reducedMotion) {
      state.camera.position.x = THREE.MathUtils.lerp(
        state.camera.position.x,
        state.pointer.x * 0.4,
        0.04,
      );
      state.camera.position.y = THREE.MathUtils.lerp(
        state.camera.position.y,
        state.pointer.y * 0.25,
        0.04,
      );
    }
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function StarlightCoreScene({
  progressRef,
  reducedMotion = false,
}: {
  progressRef: ScrollProgressRef;
  reducedMotion?: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 9.6], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.15} />
      <StarlightNetwork progressRef={progressRef} reducedMotion={reducedMotion} />
      <CameraRig progressRef={progressRef} reducedMotion={reducedMotion} />
      <Stars
        radius={60}
        depth={40}
        count={2600}
        factor={3.2}
        saturation={0.4}
        fade
        speed={reducedMotion ? 0 : 0.6}
      />
      <EffectComposer>
        <Bloom
          intensity={0.65}
          luminanceThreshold={0.32}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
