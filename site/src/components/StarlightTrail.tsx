"use client";

/**
 * StarlightTrail — light that follows the pointer.
 *
 * A full-viewport additive canvas that emits luminous motes wherever the
 * cursor moves. Emission rate and initial velocity are proportional to
 * pointer speed, so a slow drift leaves a faint dust and a fast sweep
 * throws a comet tail. Motes inherit a fraction of pointer velocity, then
 * decelerate and fade on an eased curve.
 *
 * Restraint rules — this must never become a toy:
 *  - fine pointers only (no touch), and only above the mobile breakpoint
 *  - disabled entirely under prefers-reduced-motion
 *  - the rAF loop stops when no motes are alive and restarts on movement,
 *    so an idle page costs nothing
 *  - paused when the tab is hidden
 */

import { useEffect, useRef } from "react";

type Mote = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 1 -> 0
  decay: number;
  size: number;
  sprite: HTMLCanvasElement;
};

const PALETTE = ["#c4b5fd", "#a78bfa", "#67e8f9", "#e2e8f0", "#f0abfc"];
const MAX_MOTES = 130;

/** Pre-render one soft radial sprite per palette colour — cheaper than a
 *  per-frame createRadialGradient, and keeps the additive pass fast. */
function buildSprites(): HTMLCanvasElement[] {
  return PALETTE.map((color) => {
    const size = 32;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, color);
    g.addColorStop(0.35, `${color}66`);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return c;
  });
}

export function StarlightTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");
    const wide = window.matchMedia("(min-width: 768px)");
    if (reduced.matches || !fine.matches || !wide.matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const sprites = buildSprites();
    const motes: Mote[] = [];

    let dpr = 1;
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;

    // Pointer state — last position and smoothed speed.
    let px = 0;
    let py = 0;
    let hasPrev = false;
    let spawnDebt = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn(x: number, y: number, vx: number, vy: number) {
      if (motes.length >= MAX_MOTES) return;
      const spread = 0.9;
      motes.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        // Inherit a slice of pointer velocity, then scatter.
        vx: vx * 0.09 + (Math.random() - 0.5) * spread,
        vy: vy * 0.09 + (Math.random() - 0.5) * spread - 0.16, // slight lift
        life: 1,
        decay: 0.012 + Math.random() * 0.016,
        size: 2.5 + Math.random() * 5.5,
        sprite: sprites[Math.floor(Math.random() * sprites.length)],
      });
    }

    function tick() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "lighter";

      for (let i = motes.length - 1; i >= 0; i--) {
        const m = motes[i];
        m.life -= m.decay;
        if (m.life <= 0) {
          motes.splice(i, 1);
          continue;
        }
        m.x += m.vx;
        m.y += m.vy;
        m.vx *= 0.94;
        m.vy *= 0.94;
        m.vy -= 0.006; // gentle upward drift, like embers

        // Ease the fade so the tail lingers then vanishes cleanly.
        const alpha = m.life * m.life;
        const s = m.size * (0.6 + m.life * 0.7);
        ctx!.globalAlpha = alpha * 0.85;
        ctx!.drawImage(m.sprite, m.x - s / 2, m.y - s / 2, s, s);
      }

      ctx!.globalAlpha = 1;
      ctx!.globalCompositeOperation = "source-over";

      if (motes.length > 0) {
        frame = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    }

    function start() {
      if (running || document.hidden) return;
      running = true;
      frame = requestAnimationFrame(tick);
    }

    function onMove(e: PointerEvent) {
      if (e.pointerType !== "mouse") return;
      const x = e.clientX;
      const y = e.clientY;

      if (!hasPrev) {
        px = x;
        py = y;
        hasPrev = true;
        return;
      }

      const dx = x - px;
      const dy = y - py;
      const speed = Math.hypot(dx, dy);
      px = x;
      py = y;

      // Emission scales with speed but saturates, so a fast flick doesn't
      // dump the whole budget in one frame.
      spawnDebt += Math.min(speed * 0.22, 5);
      const n = Math.floor(spawnDebt);
      spawnDebt -= n;
      for (let i = 0; i < n; i++) {
        // Distribute along the segment travelled, not just the endpoint —
        // otherwise fast movement leaves visible gaps.
        const t = (i + 1) / n;
        spawn(px - dx * (1 - t), py - dy * (1 - t), dx, dy);
      }

      start();
    }

    function onLeave() {
      hasPrev = false;
    }

    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        running = false;
        motes.length = 0;
        ctx!.clearRect(0, 0, width, height);
      }
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60]"
    />
  );
}
