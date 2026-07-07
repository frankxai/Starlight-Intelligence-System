"use client";

import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Sphere, Line, Stars } from "@react-three/drei";
import * as THREE from "three";

// Types
type VaultKey = "strategic" | "technical" | "creative" | "operational" | "wisdom" | "horizon";

interface VaultOrb {
  key: VaultKey;
  label: string;
  accent: string;
  angle: number;
  excerpt: string;
  confidence: string;
}

const VAULTS: VaultOrb[] = [
  { key: "strategic", label: "Strategic", accent: "#a78bfa", angle: 0, excerpt: "Claws architecture decision + yolo Hive...", confidence: "0.95" },
  { key: "technical", label: "Technical", accent: "#67e8f9", angle: 60, excerpt: "Configuration-first. Skill auto-activation...", confidence: "0.95" },
  { key: "creative", label: "Creative", accent: "#f0abfc", angle: 120, excerpt: "Luminor wisdom integration...", confidence: "0.95" },
  { key: "operational", label: "Operational", accent: "#4ade80", angle: 180, excerpt: "Overnight deep ships, v0.1 event spine...", confidence: "1.0" },
  { key: "wisdom", label: "Wisdom", accent: "#fcd34d", angle: 240, excerpt: "Memory is Power. Systems over Tools.", confidence: "0.95" },
  { key: "horizon", label: "Horizon", accent: "#fb7185", angle: 300, excerpt: "Letters to the future. Human hopes...", confidence: "1.0" },
];

const CORE_ACCENT = "#c084fc";

function VaultNode({
  vault,
  position,
  isFocused,
  onClick,
}: {
  vault: VaultOrb;
  position: [number, number, number];
  isFocused: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;
    }
    if (glowRef.current) {
      const scale = isFocused ? 1.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1 : 1.2;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Glow */}
      <Sphere ref={glowRef} args={[1.2, 32, 32]}>
        <meshBasicMaterial color={vault.accent} transparent opacity={isFocused ? 0.4 : 0.1} blending={THREE.AdditiveBlending} />
      </Sphere>
      
      {/* Core Node */}
      <Sphere ref={meshRef} args={[0.8, 32, 32]}>
        <meshStandardMaterial 
          color={vault.accent} 
          emissive={vault.accent} 
          emissiveIntensity={isFocused ? 1.5 : 0.5} 
          roughness={0.2} 
          metalness={0.8} 
        />
      </Sphere>

      {/* Label */}
      <Text
        position={[0, -2, 0]}
        fontSize={0.5}
        color={isFocused ? "#ffffff" : vault.accent}
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Medium.woff"
      >
        {vault.label.toUpperCase()}
      </Text>
    </group>
  );
}

function ConstellationLines({ vaults, radius }: { vaults: VaultOrb[]; radius: number }) {
  const points = useMemo(() => {
    const pts = vaults.map((v) => {
      const rad = (v.angle * Math.PI) / 180;
      return new THREE.Vector3(Math.cos(rad) * radius, Math.sin(rad) * radius, 0);
    });
    // Close the loop
    pts.push(pts[0]);
    return pts;
  }, [vaults, radius]);

  return (
    <Line
      points={points}
      color="#ffffff"
      opacity={0.1}
      transparent
      lineWidth={1}
    />
  );
}

function CameraRig({ focused }: { focused: VaultKey | null }) {
  const { camera } = useThree();
  
  useFrame(() => {
    // Smoothly transition camera if we wanted to zoom to node
    // For now we keep it simple
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export function MemoryPalace3D() {
  const [focused, setFocused] = useState<VaultKey | null>(null);
  const [voiceActive, setVoiceActive] = useState(false);
  
  const radius = 6;
  const current = focused ? VAULTS.find((v) => v.key === focused)! : null;

  const handleOrbClick = (key: VaultKey) => {
    setFocused((prev) => (prev === key ? null : key));
    setVoiceActive(false);
  };

  const handleSpeak = () => {
    setVoiceActive(true);
    const order: VaultKey[] = ["wisdom", "strategic", "operational", "technical", "creative", "horizon"];
    let i = 0;
    const interval = setInterval(() => {
      setFocused(order[i]);
      i = (i + 1) % order.length;
      if (i === 0) {
        clearInterval(interval);
        setVoiceActive(false);
      }
    }, 420);
  };

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      {/* Palace container */}
      <div className="relative rounded-3xl border border-white/[0.08] bg-[#060609]/80 p-8 pb-10 backdrop-blur-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[3px] text-white/50">3D REACT THREE FIBER SUBSTRATE</div>
            <div className="text-3xl font-semibold tracking-tighter text-white">Starlight Memory Palace 3D</div>
          </div>
          <button
            onClick={() => { setFocused(null); setVoiceActive(false); }}
            className="rounded-full border border-white/10 px-4 py-1 text-xs text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            Reset focus
          </button>
        </div>

        {/* 3D Canvas */}
        <div className="relative mx-auto mb-8 aspect-square w-full max-w-[620px] rounded-2xl overflow-hidden border border-white/10">
          <Canvas camera={{ position: [0, -5, 12], fov: 60 }}>
            <color attach="background" args={["#060609"]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            
            <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

            <CameraRig focused={focused} />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate={!focused} autoRotateSpeed={0.5} />

            {/* Core */}
            <Sphere args={[1.5, 32, 32]}>
              <meshStandardMaterial color={CORE_ACCENT} emissive={CORE_ACCENT} emissiveIntensity={focused ? 0.8 : 0.3} wireframe />
            </Sphere>

            {/* Nodes */}
            {VAULTS.map((vault) => {
              const rad = (vault.angle * Math.PI) / 180;
              const position: [number, number, number] = [
                Math.cos(rad) * radius,
                Math.sin(rad) * radius,
                Math.sin(rad * 3) * 1.5 // slight z-offset for 3D feel
              ];
              
              return (
                <VaultNode
                  key={vault.key}
                  vault={vault}
                  position={position}
                  isFocused={focused === vault.key || (voiceActive && focused === vault.key)}
                  onClick={() => handleOrbClick(vault.key)}
                />
              );
            })}
            
            {/* Constellation */}
            <ConstellationLines vaults={VAULTS} radius={radius} />
          </Canvas>
        </div>

        {/* Interactive HUD */}
        <div className="mx-auto max-w-[620px] rounded-2xl border border-white/[0.08] bg-black/40 p-5 text-sm backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[2px] text-white/50">
              <div>SIP v1.1.1</div>
              <div className="h-px w-3 bg-white/20" />
              <div>R3F ENGINE</div>
              <div className="h-px w-3 bg-white/20" />
              <div>GRAPHITI SYNC</div>
            </div>

            <button
              onClick={handleSpeak}
              disabled={voiceActive}
              className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-1 text-xs text-white/80 transition hover:bg-white/5 disabled:opacity-60"
            >
              {voiceActive ? "LISTENING..." : "SPEAK TO FOCUS"}
              <span aria-hidden>⟐</span>
            </button>
          </div>

          <div className="mt-4 min-h-[92px] rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 text-[13px] leading-relaxed text-white/85">
            {current ? (
              <>
                <div className="mb-1 text-[10px] uppercase tracking-[2px]" style={{ color: current.accent }}>
                  {current.label} VAULT — {current.confidence} CONFIDENCE
                </div>
                <div>{current.excerpt}</div>
              </>
            ) : (
              <div className="text-white/50">
                Tap any 3D node to surface memory. Or speak an intention. The 3D constellation responds.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
