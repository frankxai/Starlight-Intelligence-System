"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface StarParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
  twinkleSpeed: number;
}

const STAR_PALETTE = [
  "#a78bfa", // violet / substrate
  "#38bdf8", // cyan / second brain
  "#f472b6", // fuchsia / orchestrator
  "#fbbf24", // amber / creator
  "#34d399", // emerald / governance
  "#ffffff", // pure star white
];

export function StarlightCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    // Accessibility check: Reduced Motion
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;

    if (prefersReducedMotion || isTouchDevice) {
      return;
    }

    const canvas = canvasRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    const label = labelRef.current;
    if (!canvas || !ring || !dot) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Coordinate & state tracking
    const mouse = { x: -100, y: -100, prevX: -100, prevY: -100, speed: 0 };
    const ringPos = { x: -100, y: -100 };
    let isVisible = false;
    let isHovering = false;
    let isPressed = false;
    let animationFrameId: number;
    let particles: StarParticle[] = [];
    let lastParticleTime = 0;

    // Pointer move listener
    const onMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;

      if (!isVisible) {
        isVisible = true;
        ringPos.x = x;
        ringPos.y = y;
        gsap.to([ring, dot], { opacity: 1, duration: 0.3 });
      }

      const dx = x - mouse.x;
      const dy = y - mouse.y;
      mouse.speed = Math.sqrt(dx * dx + dy * dy);
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
      mouse.x = x;
      mouse.y = y;

      // Position the instant lead dot
      gsap.set(dot, { x, y });

      // Spawn celestial stardust particles on movement
      const now = performance.now();
      if (now - lastParticleTime > 16 && mouse.speed > 1.5) {
        lastParticleTime = now;
        const particleCount = Math.min(Math.floor(mouse.speed / 6) + 1, 4);

        for (let i = 0; i < particleCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const spread = Math.random() * 8;
          const speed = (Math.random() * 0.8 + 0.2) * (mouse.speed * 0.05);

          particles.push({
            x: x + Math.cos(angle) * spread,
            y: y + Math.sin(angle) * spread,
            vx: -dx * 0.08 + Math.cos(angle) * speed,
            vy: -dy * 0.08 + Math.sin(angle) * speed,
            size: Math.random() * 2.2 + 0.8,
            alpha: 1,
            color: STAR_PALETTE[Math.floor(Math.random() * STAR_PALETTE.length)],
            life: 0,
            maxLife: Math.random() * 45 + 25,
            twinkleSpeed: Math.random() * 0.2 + 0.05,
          });
        }
      }
    };

    // Smooth inertia lag on the ring
    const updateRing = () => {
      const ease = isHovering ? 0.25 : 0.18;
      ringPos.x += (mouse.x - ringPos.x) * ease;
      ringPos.y += (mouse.y - ringPos.y) * ease;

      gsap.set(ring, { x: ringPos.x, y: ringPos.y });

      // Render star particles and constellation links
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (particles.length > 0) {
        // Draw constellation linkages between close particles
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (dist < 45) {
              const linkAlpha = (1 - dist / 45) * 0.25 * Math.min(p1.alpha, p2.alpha);
              ctx.strokeStyle = `rgba(167, 139, 250, ${linkAlpha})`;
              ctx.lineWidth = 0.6;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }

        // Draw individual star particles
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life++;
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.94;
          p.vy *= 0.94;

          const progress = p.life / p.maxLife;
          p.alpha = Math.max(0, 1 - progress);
          const twinkle = Math.sin(p.life * p.twinkleSpeed) * 0.3 + 0.7;

          ctx.save();
          ctx.globalAlpha = p.alpha * twinkle;
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;

          // Render diamond / 4-point star shape for larger particles
          if (p.size > 1.8) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            // Subtle cross glint
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x - p.size * 2, p.y);
            ctx.lineTo(p.x + p.size * 2, p.y);
            ctx.moveTo(p.x, p.y - p.size * 2);
            ctx.lineTo(p.x, p.y + p.size * 2);
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();

          if (p.life >= p.maxLife) {
            particles.splice(i, 1);
          }
        }
      }

      animationFrameId = requestAnimationFrame(updateRing);
    };

    // Interactive target detection (Links, Buttons, Cards)
    const onMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest(
        "a, button, [role='button'], [data-cursor-hover], .agent-card, .vault-card, summary, input, select, textarea"
      ) as HTMLElement | null;

      if (target) {
        isHovering = true;
        const cursorLabel = target.getAttribute("data-cursor-label");
        const cursorAccent = target.getAttribute("data-cursor-accent") || "#a78bfa";

        if (label && cursorLabel) {
          label.textContent = cursorLabel;
          gsap.to(label, { opacity: 1, scale: 1, duration: 0.2 });
        }

        gsap.to(ring, {
          scale: 1.8,
          borderColor: cursorAccent,
          backgroundColor: `${cursorAccent}15`,
          duration: 0.3,
          ease: "power2.out",
        });

        gsap.to(dot, {
          scale: 0.5,
          backgroundColor: cursorAccent,
          duration: 0.2,
        });
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest(
        "a, button, [role='button'], [data-cursor-hover], .agent-card, .vault-card, summary, input, select, textarea"
      );

      if (target) {
        isHovering = false;
        if (label) {
          gsap.to(label, { opacity: 0, scale: 0.8, duration: 0.2 });
        }

        gsap.to(ring, {
          scale: 1,
          borderColor: "rgba(167, 139, 250, 0.4)",
          backgroundColor: "transparent",
          duration: 0.3,
          ease: "power2.out",
        });

        gsap.to(dot, {
          scale: 1,
          backgroundColor: "#ffffff",
          duration: 0.2,
        });
      }
    };

    const onMouseDown = () => {
      isPressed = true;
      gsap.to(ring, { scale: isHovering ? 1.5 : 0.85, duration: 0.15 });
      gsap.to(dot, { scale: 1.4, duration: 0.15 });
    };

    const onMouseUp = () => {
      isPressed = false;
      gsap.to(ring, { scale: isHovering ? 1.8 : 1, duration: 0.2 });
      gsap.to(dot, { scale: isHovering ? 0.5 : 1, duration: 0.2 });
    };

    const onMouseLeave = () => {
      isVisible = false;
      gsap.to([ring, dot], { opacity: 0, duration: 0.3 });
    };

    // Event registrations
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseover", onMouseOver, { passive: true });
    document.addEventListener("mouseout", onMouseOut, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);

    animationFrameId = requestAnimationFrame(updateRing);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <>
      {/* Dynamic Stardust Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[99998] h-full w-full opacity-90"
        aria-hidden="true"
      />

      {/* Lagging Ring Follower */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[99999] -ml-4 -mt-4 flex h-8 w-8 items-center justify-center rounded-full border border-violet-400/40 opacity-0 transition-colors will-change-transform"
        aria-hidden="true"
      >
        <span
          ref={labelRef}
          className="absolute -top-7 rounded bg-black/80 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-violet-300 opacity-0 shadow-lg backdrop-blur-md"
        />
      </div>

      {/* Instant Lead Dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[99999] -ml-1 -mt-1 h-2 w-2 rounded-full bg-white opacity-0 shadow-[0_0_8px_#ffffff] will-change-transform"
        aria-hidden="true"
      />
    </>
  );
}
