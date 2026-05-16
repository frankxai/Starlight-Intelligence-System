"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Text } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import type { Group, Mesh } from "three";
import { vaults, verticals, type VaultNode, type VerticalNode } from "@/data/substrate";
import CanvasCluster from "./CanvasCluster";

const VAULT_RING_RADIUS = 4;
const VERTICAL_RING_RADIUS = 8.5;
const VAULT_RADIUS = 0.55;
const VERTICAL_RADIUS = 0.32;

/**
 * Position items evenly around a ring on the XZ plane (y = 0).
 * Slight y-jitter could be added later for less mechanical feel.
 */
function ringPositions(count: number, radius: number, phase = 0) {
  return Array.from({ length: count }, (_, i) => {
    const theta = phase + (i / count) * Math.PI * 2;
    return [Math.cos(theta) * radius, 0, Math.sin(theta) * radius] as const;
  });
}

function CoreOrb() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.15;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.2, 1]} />
      <meshStandardMaterial
        color="#1e1b4b"
        emissive="#a78bfa"
        emissiveIntensity={1.4}
        roughness={0.25}
        metalness={0.6}
        wireframe
      />
    </mesh>
  );
}

function VaultOrb({
  vault,
  position,
}: {
  vault: VaultNode;
  position: readonly [number, number, number];
}) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    // gentle bob
    const t = state.clock.elapsedTime;
    ref.current.position.y = Math.sin(t * 0.6 + position[0]) * 0.15;
  });

  return (
    <group position={position as [number, number, number]}>
      <mesh ref={ref}>
        <sphereGeometry args={[VAULT_RADIUS, 48, 48]} />
        <meshStandardMaterial
          color={vault.color}
          emissive={vault.color}
          emissiveIntensity={1.6}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
      {/* halo */}
      <mesh>
        <sphereGeometry args={[VAULT_RADIUS * 1.45, 32, 32]} />
        <meshBasicMaterial color={vault.color} transparent opacity={0.08} />
      </mesh>
      <Text
        position={[0, VAULT_RADIUS + 0.55, 0]}
        fontSize={0.32}
        color={vault.color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#000"
      >
        {vault.name}
      </Text>
    </group>
  );
}

function VerticalNodeMesh({
  node,
  position,
}: {
  node: VerticalNode;
  position: readonly [number, number, number];
}) {
  const isPrivate = node.private === true;
  return (
    <group position={position as [number, number, number]}>
      <mesh>
        <sphereGeometry args={[VERTICAL_RADIUS, 32, 32]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={isPrivate ? 0.4 : 1.1}
          roughness={0.4}
          metalness={0.3}
          transparent
          opacity={isPrivate ? 0.55 : 1}
        />
      </mesh>
      {!isPrivate && (
        <Text
          position={[0, VERTICAL_RADIUS + 0.35, 0]}
          fontSize={0.2}
          color={node.color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.004}
          outlineColor="#000"
        >
          {node.name}
        </Text>
      )}
    </group>
  );
}

/**
 * Slow rotation of the entire orbital system — gives the scene quiet motion
 * without losing readability of labels (drei <Text> billboards face camera
 * via OrbitControls + camera up vector).
 */
function OrbitalSystem() {
  const vaultGroup = useRef<Group>(null);
  const verticalGroup = useRef<Group>(null);

  useFrame((_, delta) => {
    if (vaultGroup.current) vaultGroup.current.rotation.y += delta * 0.04;
    if (verticalGroup.current) verticalGroup.current.rotation.y -= delta * 0.02;
  });

  const vaultPositions = useMemo(
    () => ringPositions(vaults.length, VAULT_RING_RADIUS, 0),
    []
  );
  const verticalPositions = useMemo(
    () => ringPositions(verticals.length, VERTICAL_RING_RADIUS, Math.PI / 10),
    []
  );

  return (
    <>
      <group ref={vaultGroup}>
        {vaults.map((v, i) => (
          <VaultOrb key={v.id} vault={v} position={vaultPositions[i]} />
        ))}
      </group>
      <group ref={verticalGroup}>
        {verticals.map((v, i) => (
          <VerticalNodeMesh
            key={v.id}
            node={v}
            position={verticalPositions[i]}
          />
        ))}
      </group>
    </>
  );
}

export default function SubstrateScene() {
  return (
    <Canvas
      camera={{ position: [0, 5, 14], fov: 55 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: "#050509" }}
    >
      {/* lighting — keep subtle so emissive materials carry the look */}
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 0, 0]} intensity={2.5} color="#a78bfa" distance={20} />
      <pointLight position={[10, 8, 10]} intensity={0.6} color="#67e8f9" />
      <pointLight position={[-10, -4, -10]} intensity={0.5} color="#f0abfc" />

      {/* ambient starfield */}
      <Stars
        radius={80}
        depth={40}
        count={2400}
        factor={3}
        saturation={0.4}
        fade
        speed={0.4}
      />

      <CoreOrb />
      <OrbitalSystem />

      {/*
        Obsidian Canvas atlases projected onto the substrate shell.
        Each cluster wraps the substrate at a different radius so the user
        can read the layers: vaults (4) < verticals (8.5) < canvas shells (14+).
      */}
      <Suspense fallback={null}>
        <CanvasCluster name="brain-clusters" radius={14} height={5} />
        <CanvasCluster name="system-architecture-v8" radius={18} height={6} />
      </Suspense>

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={4}
        maxDistance={40}
        autoRotate={false}
      />
    </Canvas>
  );
}
