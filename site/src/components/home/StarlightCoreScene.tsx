"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

export type ScrollProgressRef = React.MutableRefObject<number>;

const VIOLET = new THREE.Color("#a78bfa");
const CYAN = new THREE.Color("#7dd3fc");
const PEARL = new THREE.Color("#e9e4ff");
const NODE_COLORS = [PEARL, VIOLET, CYAN, VIOLET];

const NODE_COUNT = 14;
const ORBIT_RADIUS = 2.55;

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

/* ------------------------------------------------------------------ */
/* Fresnel energy core                                                  */
/* ------------------------------------------------------------------ */

const CORE_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const CORE_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float fres = pow(1.0 - abs(dot(vNormal, vView)), 2.2);
    float pulse = 0.92 + 0.08 * sin(uTime * 0.8);
    vec3 deep  = vec3(0.055, 0.03, 0.12);   // near-black violet body
    vec3 rim   = vec3(0.72, 0.6, 1.0);      // violet rim light
    vec3 hot   = vec3(0.95, 0.93, 1.0);     // pearl edge highlight
    vec3 color = mix(deep, rim, fres * pulse);
    color = mix(color, hot, pow(fres, 4.0) * pulse);
    gl_FragColor = vec4(color * uIntensity, 1.0);
  }
`;

function useCoreMaterial() {
  return useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: CORE_VERTEX,
        fragmentShader: CORE_FRAGMENT,
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: 1.35 },
        },
      }),
    [],
  );
}

/* ------------------------------------------------------------------ */
/* Curved light filaments                                               */
/* ------------------------------------------------------------------ */

function useFilamentGeometry(nodes: THREE.Vector3[]) {
  return useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const SAMPLES = 22;

    const pushCurve = (
      a: THREE.Vector3,
      b: THREE.Vector3,
      ca: THREE.Color,
      cb: THREE.Color,
      bulge: number,
    ) => {
      const mid = a.clone().add(b).multiplyScalar(0.5);
      // Push the control point outward from the origin for a graceful arc.
      const dir = mid.lengthSq() > 0.0001 ? mid.clone().normalize() : new THREE.Vector3(0, 1, 0);
      const ctrl = mid.add(dir.multiplyScalar(bulge));
      const curve = new THREE.QuadraticBezierCurve3(a, ctrl, b);
      const pts = curve.getPoints(SAMPLES);
      for (let s = 0; s < pts.length - 1; s++) {
        const t0 = s / (pts.length - 1);
        const t1 = (s + 1) / (pts.length - 1);
        const c0 = ca.clone().lerp(cb, t0);
        const c1 = ca.clone().lerp(cb, t1);
        positions.push(pts[s].x, pts[s].y, pts[s].z, pts[s + 1].x, pts[s + 1].y, pts[s + 1].z);
        colors.push(c0.r, c0.g, c0.b, c1.r, c1.g, c1.b);
      }
    };

    // Spokes: core to node, gently bowed.
    const origin = new THREE.Vector3(0.92, 0, 0); // start just outside the core surface
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const start = n.clone().normalize().multiplyScalar(0.95);
      pushCurve(start, n, VIOLET, NODE_COLORS[i % NODE_COLORS.length], 0.28);
    }
    void origin;

    // Lateral arcs: each node to its 2 nearest neighbours.
    for (let i = 0; i < nodes.length; i++) {
      const dists = nodes
        .map((n, j) => ({ j, d: nodes[i].distanceTo(n) }))
        .filter((e) => e.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      for (const { j } of dists) {
        if (j < i) continue;
        pushCurve(
          nodes[i],
          nodes[j],
          NODE_COLORS[i % NODE_COLORS.length],
          NODE_COLORS[j % NODE_COLORS.length],
          0.42,
        );
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }, [nodes]);
}

/* ------------------------------------------------------------------ */
/* Stardust                                                             */
/* ------------------------------------------------------------------ */

function useStardust(count = 260) {
  return useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Shell distribution between core and orbit.
      const r = 1.2 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [count]);
}

/* ------------------------------------------------------------------ */
/* Orrery rings                                                         */
/* ------------------------------------------------------------------ */

const RINGS = [
  { radius: 1.55, tilt: [Math.PI / 2.35, 0, 0.4], speed: 0.1, opacity: 0.5, color: "#c4b5fd" },
  { radius: 2.05, tilt: [Math.PI / 1.75, 0.5, -0.3], speed: -0.065, opacity: 0.34, color: "#a78bfa" },
  { radius: 2.62, tilt: [Math.PI / 2.9, -0.4, 0.9], speed: 0.04, opacity: 0.22, color: "#7dd3fc" },
] as const;

function OrreryRings({ reducedMotion }: { reducedMotion: boolean }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    refs.current.forEach((mesh, i) => {
      if (mesh) mesh.rotation.z += delta * RINGS[i].speed;
    });
  });

  return (
    <>
      {RINGS.map((ring, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          rotation={ring.tilt as unknown as [number, number, number]}
        >
          <torusGeometry args={[ring.radius, 0.0045, 8, 220]} />
          <meshBasicMaterial
            color={ring.color}
            transparent
            opacity={ring.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Network                                                              */
/* ------------------------------------------------------------------ */

function StarlightNetwork({
  progressRef,
  reducedMotion,
}: {
  progressRef: ScrollProgressRef;
  reducedMotion: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const coreMesh = useRef<THREE.Mesh>(null);
  const haloMesh = useRef<THREE.Mesh>(null);
  const nodesGroup = useRef<THREE.Group>(null);
  const dustRef = useRef<THREE.Points>(null);

  const nodes = useMemo(() => fibonacciSphere(NODE_COUNT, ORBIT_RADIUS), []);
  const filaments = useFilamentGeometry(nodes);
  const dust = useStardust();
  const coreMaterial = useCoreMaterial();

  useFrame((state, delta) => {
    const raw = progressRef.current;
    const p = Math.min(1, raw * 3);
    const t = state.clock.elapsedTime;

    coreMaterial.uniforms.uTime.value = t;
    coreMaterial.uniforms.uIntensity.value = 1.35 * (1 - p * 0.5);

    if (group.current) {
      if (!reducedMotion) {
        group.current.rotation.y += delta * 0.055;
        group.current.rotation.x = THREE.MathUtils.lerp(
          group.current.rotation.x,
          state.pointer.y * 0.1 + p * 1.4,
          0.045,
        );
        group.current.rotation.z = THREE.MathUtils.lerp(
          group.current.rotation.z,
          state.pointer.x * 0.06,
          0.045,
        );
      }
      const scale = 1 - p * 0.45;
      group.current.scale.setScalar(scale);
      group.current.position.y = -p * 2.4;
      group.current.position.z = -p * 4;
    }

    if (coreMesh.current && !reducedMotion) {
      const breath = 1 + Math.sin(t * 0.8) * 0.025;
      coreMesh.current.scale.setScalar(breath);
    }
    if (haloMesh.current) {
      const m = haloMesh.current.material as THREE.MeshBasicMaterial;
      m.opacity = (0.1 + (reducedMotion ? 0 : Math.sin(t * 0.8) * 0.03)) * (1 - p * 0.6);
      if (!reducedMotion) {
        haloMesh.current.rotation.y -= delta * 0.02;
        haloMesh.current.rotation.x += delta * 0.008;
      }
    }
    if (nodesGroup.current && !reducedMotion) {
      nodesGroup.current.children.forEach((child, i) => {
        const s = 1 + Math.sin(t * 1.1 + i * 1.7) * 0.18;
        child.scale.setScalar(s);
      });
    }
    if (dustRef.current && !reducedMotion) {
      dustRef.current.rotation.y += delta * 0.012;
    }
  });

  return (
    <group ref={group}>
      {/* Energy core */}
      <mesh ref={coreMesh} material={coreMaterial}>
        <sphereGeometry args={[0.88, 64, 64]} />
      </mesh>

      {/* Faint atmospheric halo */}
      <mesh ref={haloMesh} scale={1.35}>
        <sphereGeometry args={[0.88, 32, 32]} />
        <meshBasicMaterial
          color="#a78bfa"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Orrery rings */}
      <OrreryRings reducedMotion={reducedMotion} />

      {/* Curved light filaments */}
      <lineSegments geometry={filaments}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.24}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>

      {/* Orbital nodes */}
      <group ref={nodesGroup}>
        {nodes.map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.048, 16, 16]} />
            <meshBasicMaterial
              color={NODE_COLORS[i % NODE_COLORS.length]}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {/* Interior stardust */}
      <points ref={dustRef} geometry={dust}>
        <pointsMaterial
          color="#c4b5fd"
          size={0.014}
          sizeAttenuation
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      <pointLight color="#a78bfa" intensity={10} distance={9} />
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
        state.pointer.x * 0.35,
        0.04,
      );
      state.camera.position.y = THREE.MathUtils.lerp(
        state.camera.position.y,
        state.pointer.y * 0.22,
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
      <ambientLight intensity={0.12} />
      <StarlightNetwork progressRef={progressRef} reducedMotion={reducedMotion} />
      <CameraRig progressRef={progressRef} reducedMotion={reducedMotion} />
      <Stars
        radius={60}
        depth={40}
        count={2200}
        factor={2.8}
        saturation={0.3}
        fade
        speed={reducedMotion ? 0 : 0.5}
      />
      <EffectComposer>
        <Bloom
          intensity={0.85}
          luminanceThreshold={0.24}
          luminanceSmoothing={0.92}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.18} darkness={0.78} />
      </EffectComposer>
    </Canvas>
  );
}
