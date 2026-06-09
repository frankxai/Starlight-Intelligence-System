"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  MeshTransmissionMaterial,
  OrbitControls,
  Stars,
  Text,
} from "@react-three/drei";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Suspense, useMemo, useRef, useState } from "react";
import type { Group, Mesh } from "three";
import { Vector2 } from "three";
import {
  vaults,
  verticals,
  type Node as VNode,
} from "@/data/substrate";
import CanvasCluster from "./CanvasCluster";

const VAULT_RING_RADIUS = 4;
const VERTICAL_RING_RADIUS = 8.5;
const VAULT_RADIUS = 0.55;
const VERTICAL_RADIUS = 0.32;

/** Even ring positions on the XZ plane. */
function ringPositions(count: number, radius: number, phase = 0) {
  return Array.from({ length: count }, (_, i) => {
    const theta = phase + (i / count) * Math.PI * 2;
    return [Math.cos(theta) * radius, 0, Math.sin(theta) * radius] as const;
  });
}

/**
 * Core orb — black-onyx icosahedron with gold-filigree wireframe overlay
 * and a slow inner voltage pulse. The orb anchors the entire scene's
 * gravitational center.
 */
function CoreOrb() {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.12;
  });
  return (
    <group ref={ref}>
      {/* Inner solid — black crystal */}
      <mesh>
        <icosahedronGeometry args={[1.1, 2]} />
        <meshPhysicalMaterial
          color="#0a0815"
          emissive="#6e5cff"
          emissiveIntensity={0.4}
          roughness={0.15}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>
      {/* Gold filigree wireframe overlay */}
      <mesh>
        <icosahedronGeometry args={[1.16, 2]} />
        <meshBasicMaterial
          color="#e0b656"
          wireframe
          transparent
          opacity={0.45}
        />
      </mesh>
      {/* Outer voltage halo */}
      <mesh>
        <sphereGeometry args={[1.55, 32, 32]} />
        <meshBasicMaterial color="#6e5cff" transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

/**
 * VaultOrb — large vellum-tinted glass sphere wrapping a colored core.
 * Uses MeshTransmissionMaterial for real refraction. The glyph floats
 * inside the glass like an etched character. Page-load reveal scales
 * from 0 to 1 with per-orb stagger.
 */
function VaultOrb({
  vault,
  position,
  delay,
}: {
  vault: VNode;
  position: readonly [number, number, number];
  delay: number;
}) {
  const groupRef = useRef<Group>(null);
  const [scale, setScale] = useState(0);

  // Stagger entry. Use a timeout-style ref to seed the animation start.
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime - delay;
    if (t < 0) {
      groupRef.current.scale.setScalar(0);
      return;
    }
    // ease-out cubic
    const k = Math.min(1, t / 1.1);
    const eased = 1 - Math.pow(1 - k, 3);
    const breath = 1 + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.02;
    const s = eased * breath;
    groupRef.current.scale.setScalar(s);
    if (scale !== eased && eased >= 1) setScale(1);
  });

  return (
    <group ref={groupRef} position={position as [number, number, number]}>
      <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.35}>
        {/* Inner colored core — emissive nucleus visible through glass */}
        <mesh>
          <sphereGeometry args={[VAULT_RADIUS * 0.55, 32, 32]} />
          <meshStandardMaterial
            color={vault.color}
            emissive={vault.color}
            emissiveIntensity={2.4}
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>

        {/* Outer glass shell with refraction + chromatic dispersion */}
        <mesh>
          <sphereGeometry args={[VAULT_RADIUS, 48, 48]} />
          <MeshTransmissionMaterial
            backside
            samples={6}
            thickness={0.6}
            chromaticAberration={0.06}
            anisotropy={0.4}
            distortion={0.2}
            distortionScale={0.3}
            temporalDistortion={0.15}
            ior={1.5}
            transmission={1}
            roughness={0.05}
            color={tint(vault.color, 0.25)}
            attenuationColor={vault.color}
            attenuationDistance={1.5}
            background={undefined}
            resolution={256}
          />
        </mesh>

        {/* Inner glyph — etched in the vault color, "embossed" inside the glass */}
        <Text
          position={[0, 0, VAULT_RADIUS + 0.001]}
          fontSize={0.32}
          color={vault.color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.004}
          outlineColor="#000"
          fillOpacity={0.85}
        >
          {vault.glyph}
        </Text>

        {/* Label below */}
        <Text
          position={[0, -VAULT_RADIUS - 0.45, 0]}
          fontSize={0.16}
          color="#f5f0e1"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.002}
          outlineColor="#000"
          letterSpacing={-0.02}
        >
          {vault.name.toUpperCase()}
        </Text>
      </Float>
    </group>
  );
}

/**
 * VerticalNodeMesh — smaller satellite orbs on the outer ring. Lighter
 * material (meshPhysicalMaterial with transmission) for performance,
 * since there are more of them and they're further from the camera.
 */
function VerticalNodeMesh({
  node,
  position,
  delay,
}: {
  node: VNode;
  position: readonly [number, number, number];
  delay: number;
}) {
  const groupRef = useRef<Group>(null);
  const isPrivate = node.private === true;

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime - delay;
    if (t < 0) {
      groupRef.current.scale.setScalar(0);
      return;
    }
    const k = Math.min(1, t / 1.1);
    const eased = 1 - Math.pow(1 - k, 3);
    groupRef.current.scale.setScalar(eased);
  });

  return (
    <group ref={groupRef} position={position as [number, number, number]}>
      <Float speed={2.2} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh>
          <sphereGeometry args={[VERTICAL_RADIUS, 32, 32]} />
          <meshPhysicalMaterial
            color={node.color}
            emissive={node.color}
            emissiveIntensity={isPrivate ? 0.4 : 1.4}
            roughness={0.25}
            metalness={0.2}
            transmission={isPrivate ? 0 : 0.4}
            thickness={0.4}
            transparent
            opacity={isPrivate ? 0.45 : 1}
            clearcoat={0.8}
            clearcoatRoughness={0.15}
          />
        </mesh>
        {!isPrivate && (
          <Text
            position={[0, VERTICAL_RADIUS + 0.32, 0]}
            fontSize={0.13}
            color="#c4c0b0"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.002}
            outlineColor="#000"
            letterSpacing={-0.015}
          >
            {node.name}
          </Text>
        )}
      </Float>
    </group>
  );
}

/**
 * Membership lines — faint voltage threads from each vault/vertical to the core.
 * Rendered as thin emissive cylinders so they pick up bloom.
 */
function MembershipThreads() {
  const items = useMemo(() => {
    const vaultPos = ringPositions(vaults.length, VAULT_RING_RADIUS, 0);
    const vertPos = ringPositions(
      verticals.length,
      VERTICAL_RING_RADIUS,
      Math.PI / 10,
    );
    return [
      ...vaults.map((v, i) => ({ pos: vaultPos[i], color: v.color, w: 0.012 })),
      ...verticals.map((v, i) => ({
        pos: vertPos[i],
        color: v.private ? "#4d4a3f" : "#6e5cff",
        w: 0.008,
      })),
    ];
  }, []);

  return (
    <group>
      {items.map((it, i) => {
        const [x, _y, z] = it.pos;
        const len = Math.sqrt(x * x + z * z);
        const angle = Math.atan2(z, x);
        return (
          <mesh
            key={i}
            position={[x / 2, 0, z / 2]}
            rotation={[0, -angle, Math.PI / 2]}
          >
            <cylinderGeometry args={[it.w, it.w, len, 6]} />
            <meshBasicMaterial
              color={it.color}
              transparent
              opacity={0.18}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function OrbitalSystem() {
  const vaultGroup = useRef<Group>(null);
  const verticalGroup = useRef<Group>(null);

  useFrame((_, delta) => {
    if (vaultGroup.current) vaultGroup.current.rotation.y += delta * 0.035;
    if (verticalGroup.current) verticalGroup.current.rotation.y -= delta * 0.018;
  });

  const vaultPositions = useMemo(
    () => ringPositions(vaults.length, VAULT_RING_RADIUS, 0),
    [],
  );
  const verticalPositions = useMemo(
    () => ringPositions(verticals.length, VERTICAL_RING_RADIUS, Math.PI / 10),
    [],
  );

  return (
    <>
      <group ref={vaultGroup}>
        {vaults.map((v, i) => (
          <VaultOrb
            key={v.id}
            vault={v}
            position={vaultPositions[i]}
            delay={0.2 + i * 0.09}
          />
        ))}
      </group>
      <group ref={verticalGroup}>
        {verticals.map((v, i) => (
          <VerticalNodeMesh
            key={v.id}
            node={v}
            position={verticalPositions[i]}
            delay={0.75 + i * 0.06}
          />
        ))}
      </group>
    </>
  );
}

export default function SubstrateScene() {
  return (
    <Canvas
      camera={{ position: [0, 4.5, 15], fov: 50 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      style={{ background: "#0a0a14" }}
      dpr={[1, 2]}
    >
      {/* IBL environment for realistic glass reflections (background off — we keep our own gradient). */}
      <Environment preset="city" background={false} environmentIntensity={0.45} />

      {/* Key + fill + rim lights tuned for Vellum & Voltage palette. */}
      <ambientLight intensity={0.18} color="#fef6d8" />
      <pointLight
        position={[0, 0, 0]}
        intensity={4.5}
        color="#6e5cff"
        distance={22}
        decay={1.5}
      />
      <pointLight
        position={[12, 8, 10]}
        intensity={0.8}
        color="#e0b656"
        distance={30}
      />
      <pointLight
        position={[-12, -4, -10]}
        intensity={0.5}
        color="#67e8f9"
        distance={28}
      />

      {/* Star bed — sparse, warm, deep. */}
      <Stars
        radius={90}
        depth={50}
        count={1800}
        factor={2.2}
        saturation={0.6}
        fade
        speed={0.25}
      />

      <CoreOrb />
      <MembershipThreads />
      <OrbitalSystem />

      {/* Canvas atlases as outer shells. */}
      <Suspense fallback={null}>
        <CanvasCluster name="brain-clusters" radius={14} height={5} />
        <CanvasCluster name="system-architecture-v8" radius={18} height={6} />
      </Suspense>

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={4}
        maxDistance={42}
        autoRotate={false}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.6}
      />

      {/* Postprocessing — the Vellum & Voltage cinematic stack. */}
      <EffectComposer multisampling={0}>
        <Bloom
          mipmapBlur
          intensity={0.85}
          luminanceThreshold={0.22}
          luminanceSmoothing={0.4}
          radius={0.7}
        />
        <ChromaticAberration
          offset={new Vector2(0.0006, 0.0006)}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette eskil={false} offset={0.18} darkness={0.55} />
        <Noise
          opacity={0.025}
          premultiply
          blendFunction={BlendFunction.SOFT_LIGHT}
        />
      </EffectComposer>
    </Canvas>
  );
}

/**
 * Mix a hex color toward vellum-cream by `amount` (0..1).
 * Used to tint glass shells slightly warm so they read as "manuscript"
 * rather than cold lab glass.
 */
function tint(hex: string, amount: number): string {
  const m = hex.match(/^#?([0-9a-f]{6})$/i);
  if (!m) return hex;
  const r = parseInt(m[1].slice(0, 2), 16);
  const g = parseInt(m[1].slice(2, 4), 16);
  const b = parseInt(m[1].slice(4, 6), 16);
  // Vellum cream target: 245, 240, 225
  const tr = Math.round(r + (245 - r) * amount);
  const tg = Math.round(g + (240 - g) * amount);
  const tb = Math.round(b + (225 - b) * amount);
  return `#${[tr, tg, tb].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
