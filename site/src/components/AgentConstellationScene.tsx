"use client";

/**
 * AgentConstellationScene — the homepage hero's living system diagram.
 *
 * A luminous core (the operator's guiding star) with three tilted orbital
 * rings of agent nodes and a deep starfield shell. This is the multi-agent
 * architecture drawn literally: many named agents, distinct orbits, one
 * center of gravity. Additive-blended sprites give the bloom feel without an
 * EffectComposer pass, so the whole scene stays cheap enough for a hero.
 *
 * Deterministic (seeded PRNG) so the composition is stable across visits.
 * Loaded only on capable, motion-tolerant clients — see AgentConstellation.
 */

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Soft radial glow sprite texture, generated once on the client. */
function makeGlowTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.6)");
  g.addColorStop(0.6, "rgba(255,255,255,0.12)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

const PALETTE = ["#a78bfa", "#67e8f9", "#e879f9", "#f8fafc", "#22d3ee"];

type Ring = {
  radius: number;
  count: number;
  tiltX: number;
  tiltZ: number;
  speed: number;
};

const RINGS: Ring[] = [
  { radius: 3.9, count: 22, tiltX: -0.42, tiltZ: 0.18, speed: 0.055 },
  { radius: 5.4, count: 32, tiltX: 0.5, tiltZ: -0.3, speed: -0.038 },
  { radius: 7.1, count: 44, tiltX: -0.16, tiltZ: 0.55, speed: 0.026 },
];

function OrbitRing({ ring, index, glow }: { ring: Ring; index: number; glow: THREE.Texture }) {
  const group = useRef<THREE.Group>(null);

  const { positions, colors, line } = useMemo(() => {
    const rand = mulberry32(1969 + index * 97);
    const positions = new Float32Array(ring.count * 3);
    const colors = new Float32Array(ring.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < ring.count; i++) {
      const angle = (i / ring.count) * Math.PI * 2 + rand() * 0.22;
      const wobble = (rand() - 0.5) * 0.5;
      positions[i * 3] = Math.cos(angle) * (ring.radius + wobble * 0.4);
      positions[i * 3 + 1] = wobble;
      positions[i * 3 + 2] = Math.sin(angle) * (ring.radius + wobble * 0.4);
      c.set(PALETTE[Math.floor(rand() * PALETTE.length)]);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    // The orbit path itself — a faint closed line.
    const segments = 128;
    const line = new Float32Array((segments + 1) * 3);
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      line[i * 3] = Math.cos(angle) * ring.radius;
      line[i * 3 + 1] = 0;
      line[i * 3 + 2] = Math.sin(angle) * ring.radius;
    }
    return { positions, colors, line };
  }, [ring, index]);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * ring.speed;
  });

  return (
    <group rotation={[ring.tiltX, 0, ring.tiltZ]}>
      <group ref={group}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            <bufferAttribute attach="attributes-color" args={[colors, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.34}
            map={glow}
            vertexColors
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            sizeAttenuation
          />
        </points>
        <line>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[line, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            color="#a78bfa"
            transparent
            opacity={0.14}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </line>
      </group>
    </group>
  );
}

function StarShell({ glow }: { glow: THREE.Texture }) {
  const { positions, colors } = useMemo(() => {
    const rand = mulberry32(777);
    const count = 260;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      // Spherical shell between r=9 and r=17 so stars sit behind the rings.
      const r = 9 + rand() * 8;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      c.set(rand() > 0.82 ? PALETTE[Math.floor(rand() * PALETTE.length)] : "#e2e8f0");
      const dim = 0.35 + rand() * 0.65;
      colors[i * 3] = c.r * dim;
      colors[i * 3 + 1] = c.g * dim;
      colors[i * 3 + 2] = c.b * dim;
    }
    return { positions, colors };
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        map={glow}
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

function Core({ glow }: { glow: THREE.Texture }) {
  const sprite = useRef<THREE.Sprite>(null);
  useFrame(({ clock }) => {
    if (sprite.current) {
      const pulse = 2.5 + Math.sin(clock.elapsedTime * 0.8) * 0.18;
      sprite.current.scale.setScalar(pulse);
    }
  });
  return (
    <group>
      <sprite ref={sprite}>
        <spriteMaterial
          map={glow}
          color="#c4b5fd"
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <sprite scale={[0.9, 0.9, 0.9]}>
        <spriteMaterial
          map={glow}
          color="#ffffff"
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

function System() {
  const glow = useMemo(() => makeGlowTexture(), []);
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += delta * 0.03;
    // Gentle pointer parallax — the system leans toward attention.
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, pointer.y * -0.12, 0.02);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, pointer.x * 0.06, 0.02);
  });

  return (
    <group ref={group} rotation={[0.32, 0, -0.08]}>
      <Core glow={glow} />
      {RINGS.map((ring, i) => (
        <OrbitRing key={ring.radius} ring={ring} index={i} glow={glow} />
      ))}
      <StarShell glow={glow} />
    </group>
  );
}

export default function AgentConstellationScene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.6, 13.5], fov: 48 }}
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
      aria-hidden="true"
    >
      <System />
    </Canvas>
  );
}
