"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface QueenSwarmProps {
  className?: string;
  phase?: "route" | "measure" | "learn" | "ratify" | "ledger" | "conduct";
  interactive?: boolean;
}

type SwarmPhase = NonNullable<QueenSwarmProps["phase"]>;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: number;
  alpha: number;
  phaseOffset: number;
}

interface QueenRuntimeState {
  x: number;
  y: number;
  pulse: number;
  phase?: SwarmPhase;
  forcedPhase?: SwarmPhase;
  scrollIntensity?: number;
}

export function QueenSwarm({ className = "", phase = "conduct", interactive = true }: QueenSwarmProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const queenRef = useRef<QueenRuntimeState>({ x: 0, y: 0, pulse: 0 });
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const rafRef = useRef<number | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      queenRef.current.x = width * 0.5;
      queenRef.current.y = height * 0.5;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Excellence / a11y: respect reduced motion — draw elegant static state instead of RAF loop
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      const qx = width * 0.5;
      const qy = height * 0.5;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#a78bfa";
      ctx.beginPath();
      ctx.arc(qx, qy, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.arc(qx, qy, 6, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const r = 68;
        const px = qx + Math.cos(a) * r;
        const py = qy + Math.sin(a) * r * 0.82;
        ctx.fillStyle = i % 3 === 0 ? "#67e8f9" : "#a78bfa";
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      return () => { ro.disconnect(); };
    }

    // Seed elegant particles — fewer, higher quality
    const COUNT = 92;
    const particles: Particle[] = [];
    for (let i = 0; i < COUNT; i++) {
      const angle = (i / COUNT) * Math.PI * 2;
      const dist = 60 + Math.random() * (Math.min(width, height) * 0.38);
      particles.push({
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist * 0.82,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: 1.1 + Math.random() * 1.6,
        hue: 260 + Math.random() * 80, // violet -> cyan range
        alpha: 0.55 + Math.random() * 0.35,
        phaseOffset: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = particles;

    const queen = queenRef.current;
    const mouse = mouseRef.current;

    // GSAP master timeline for phase-driven behavior
    if (tlRef.current) tlRef.current.kill();
    const tl = gsap.timeline({ repeat: -1 });
    tlRef.current = tl;

    const setPhase = (p: SwarmPhase) => {
      // modulate global speed/attraction via data on queen
      queen.phase = p;
    };

    tl.call(() => setPhase("route"), [], 0)
      .to({}, { duration: 3.6 })
      .call(() => setPhase("measure"), [])
      .to({}, { duration: 4.2 })
      .call(() => setPhase("learn"), [])
      .to({}, { duration: 3.8 })
      .call(() => setPhase("ratify"), [])
      .to({}, { duration: 2.8 })
      .call(() => setPhase("ledger"), [])
      .to({}, { duration: 3.4 })
      .call(() => setPhase("conduct"), [])
      .to({}, { duration: 5.5 });

    // External phase prop sync (if controlled)
    const syncPhase = (next: SwarmPhase) => {
      queen.forcedPhase = next;
    };
    if (phase && phase !== "conduct") syncPhase(phase);

    // Premium GSAP ScrollSync: tie swarm intensity/spread to scroll progress for "conducted" feel
    const scrollTrigger = ScrollTrigger.create({
      trigger: container,
      start: "top 80%",
      end: "bottom 20%",
      scrub: 0.5,
      onUpdate: (self) => {
        queen.scrollIntensity = 0.6 + self.progress * 1.4;
      },
    });

    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const qx = queen.x;
      const qy = queen.y;
      queen.pulse = Math.sin(t * 2.2) * 0.5 + 0.5;

      // Queen core — premium luminous
      const qR = 13 + queen.pulse * 2.5;
      ctx.save();
      ctx.shadowColor = "rgba(167,139,250,0.9)";
      ctx.shadowBlur = 28;
      ctx.beginPath();
      ctx.arc(qx, qy, qR, 0, Math.PI * 2);
      ctx.fillStyle = "#a78bfa";
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(qx, qy, qR * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = "#f8fafc";
      ctx.fill();

      // Subtle conducting ring
      ctx.beginPath();
      ctx.arc(qx, qy, qR + 18 + Math.sin(t * 1.6) * 3, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(103,232,249,0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();

      const currentPhase = queen.forcedPhase || queen.phase || phase;

      // Behavior params per phase
      let attract = 0.014;
      let orbitSpeed = 0.014;
      let cohesion = 0.008;
      let spread = 1.0;

      const scrollI = queen.scrollIntensity ?? 1.0;
      spread *= scrollI;
      attract *= (0.8 + (scrollI - 1) * 0.4);

      if (currentPhase === "route") { attract = 0.028; orbitSpeed = 0.009; }
      else if (currentPhase === "measure") { attract = 0.008; orbitSpeed = 0.031; spread = 1.35; }
      else if (currentPhase === "learn") { attract = 0.022; cohesion = 0.016; }
      else if (currentPhase === "ratify") { attract = 0.006; orbitSpeed = 0.005; spread = 0.7; }
      else if (currentPhase === "ledger") { attract = 0.019; orbitSpeed = 0.012; cohesion = 0.022; }

      const mActive = interactive && mouse.active;
      const mx = mouse.x;
      const my = mouse.y;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Vector to queen
        const dx = qx - p.x;
        const dy = qy - p.y;
        const distQ = Math.max(12, Math.hypot(dx, dy));

        // Phase intelligence
        const angleBase = Math.atan2(dy, dx) + (t + p.phaseOffset) * orbitSpeed;
        const targetX = qx + Math.cos(angleBase) * (72 + Math.sin(p.phaseOffset) * 28 * spread);
        const targetY = qy + Math.sin(angleBase) * (54 + Math.cos(p.phaseOffset * 0.8) * 22 * spread);

        p.vx += (targetX - p.x) * attract;
        p.vy += (targetY - p.y) * attract * 0.92;

        // Cohesion + separation
        let cx = 0, cy = 0, sc = 0;
        for (let j = 0; j < particles.length; j += 3) {
          if (i === j) continue;
          const o = particles[j];
          const od = Math.hypot(p.x - o.x, p.y - o.y);
          if (od < 48 && od > 0.1) {
            cx += o.x; cy += o.y; sc++;
          }
        }
        if (sc > 0) {
          p.vx += ((cx / sc) - p.x) * cohesion;
          p.vy += ((cy / sc) - p.y) * cohesion * 0.7;
        }

        // Mouse influence — queen directs swarm toward curiosity
        if (mActive) {
          const dmx = mx - p.x;
          const dmy = my - p.y;
          const dm = Math.max(1, Math.hypot(dmx, dmy));
          p.vx += (dmx / dm) * 0.035;
          p.vy += (dmy / dm) * 0.035;
        }

        // Damping + integrate
        p.vx *= 0.962;
        p.vy *= 0.962;
        p.x += p.vx;
        p.y += p.vy;

        // Soft bounds
        const pad = 28;
        if (p.x < pad) p.vx = Math.abs(p.vx) * 0.6;
        if (p.x > width - pad) p.vx = -Math.abs(p.vx) * 0.6;
        if (p.y < pad) p.vy = Math.abs(p.vy) * 0.6;
        if (p.y > height - pad) p.vy = -Math.abs(p.vy) * 0.6;

        // Draw particle — elegant luminous dot + faint trail hint
        ctx.save();
        ctx.globalAlpha = p.alpha * (0.7 + Math.sin(t * 3.2 + p.phaseOffset) * 0.3);
        ctx.fillStyle = `hsl(${p.hue}, 92%, 78%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        // Connection lines to Queen — very subtle, phase aware density
        if (distQ < 210 && (i % 3 === 0 || currentPhase === "measure")) {
          ctx.strokeStyle = `hsla(${p.hue}, 88%, 82%, ${0.08 + (210 - distQ) / 1100})`;
          ctx.lineWidth = 0.75;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(qx, qy);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Queen outer conducting field (phase signature)
      ctx.save();
      ctx.strokeStyle = currentPhase === "measure" 
        ? "rgba(52,211,153,0.18)" 
        : currentPhase === "ledger" 
          ? "rgba(251,191,36,0.18)" 
          : "rgba(103,232,249,0.16)";
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.arc(qx, qy, 54 + Math.sin(t * 1.1) * 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      t += 0.014;
      rafRef.current = requestAnimationFrame(draw);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const onPointerLeave = () => { mouse.active = false; };

    if (interactive) {
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerleave", onPointerLeave);
      canvas.addEventListener("touchmove", (e) => {
        if (e.touches[0]) {
          const rect = canvas.getBoundingClientRect();
          mouse.x = e.touches[0].clientX - rect.left;
          mouse.y = e.touches[0].clientY - rect.top;
          mouse.active = true;
        }
      }, { passive: true });
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      scrollTrigger.kill();
      if (tlRef.current) tlRef.current.kill();
      if (interactive) {
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerleave", onPointerLeave);
      }
    };
  }, [phase, interactive]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#050507] ${className}`}>
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.035)_0.6px,transparent_1px)] bg-[length:3px_3px]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );
}

export default QueenSwarm;
