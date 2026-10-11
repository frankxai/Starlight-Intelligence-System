"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import styles from "./StarlightCursor.module.css";

// Same interaction contract across Starlight's three independently deployed sites.
// A fixed SVG pool: no canvas, per-frame React state, or replacement native cursor.
export function StarlightTrail() {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let disposed = false;
    let cleanup = () => {};

    async function mount() {
      try {
        const { gsap } = await import("gsap");
        if (disposed || !element) return;
        const media = gsap.matchMedia();
        media.add("(pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference) and (forced-colors: none)", () => {
          const stars = Array.from(element.children) as HTMLElement[];
          const positions = stars.map((star, index) => ({
            x: gsap.quickTo(star, "x", { duration: 0.18 + index * 0.075, ease: "power3.out" }),
            y: gsap.quickTo(star, "y", { duration: 0.18 + index * 0.075, ease: "power3.out" }),
          }));
          const opacityTo = gsap.quickTo(element, "opacity", { duration: 0.2, ease: "power2.out" });
          const shape = stars[0].querySelector("svg")!;
          gsap.set(shape, { scale: 1, rotation: 0, transformOrigin: "50% 50%" });
          const scaleTo = gsap.quickTo(shape, "scale", { duration: 0.24, ease: "power3.out" });
          const turnTo = gsap.quickTo(shape, "rotation", { duration: 0.38, ease: "power3.out" });
          let visible = false;
          let interactive = false;
          const hide = () => {
            visible = false;
            opacityTo(0);
          };
          const idle = gsap.delayedCall(1.1, hide).pause();
          const reset = () => {
            idle.pause();
            if (!visible && !opacityTo.tween.isActive()) return;
            visible = false;
            opacityTo.tween.pause();
            gsap.set(element, { opacity: 0 });
          };
          const move = (event: PointerEvent) => {
            const target = event.target;
            if (event.pointerType !== "mouse" || event.buttons !== 0 || document.hidden ||
                !(target instanceof Element) ||
                target.closest("input, textarea, select, dialog, [contenteditable]:not([contenteditable='false']), [data-starlight-quiet], [role='dialog']") ||
                window.getSelection()?.isCollapsed === false) {
              reset();
              return;
            }
            const nextInteractive = Boolean(target.closest("a[href], button:not(:disabled), summary, [role='button']"));
            if (nextInteractive !== interactive) {
              interactive = nextInteractive;
              element.dataset.interactive = String(interactive);
              scaleTo(interactive ? 0.8 : 1);
              turnTo(interactive ? 45 : 0);
            }
            if (!visible) {
              positions.forEach((position, index) => {
                const x = event.clientX + 18 + index * 5;
                const y = event.clientY + 20 + index * 4;
                // Explicit starts avoid a sweep from the last route or screen corner.
                position.x(x, x);
                position.y(y, y);
              });
              visible = true;
              opacityTo(0.85, Number(gsap.getProperty(element, "opacity")));
            } else {
              positions.forEach((position, index) => {
                position.x(event.clientX + 18 + index * 5);
                position.y(event.clientY + 20 + index * 4);
              });
            }
            idle.restart(true);
          };
          const key = (event: KeyboardEvent) => { if (!event.metaKey && !event.ctrlKey && !event.altKey) reset(); };
          const leave = (event: PointerEvent) => { if (!event.relatedTarget) reset(); };
          document.addEventListener("pointermove", move, { passive: true });
          document.addEventListener("pointerdown", reset, { passive: true });
          document.addEventListener("pointerout", leave);
          document.addEventListener("visibilitychange", reset);
          document.addEventListener("keydown", key);
          window.addEventListener("blur", reset);
          window.addEventListener("scroll", reset, { passive: true });
          return () => {
            document.removeEventListener("pointermove", move);
            document.removeEventListener("pointerdown", reset);
            document.removeEventListener("pointerout", leave);
            document.removeEventListener("visibilitychange", reset);
            document.removeEventListener("keydown", key);
            window.removeEventListener("blur", reset);
            window.removeEventListener("scroll", reset);
            idle.kill();
            positions.forEach(position => { position.x.tween.kill(); position.y.tween.kill(); });
            opacityTo.tween.kill();
            scaleTo.tween.kill();
            turnTo.tween.kill();
            shape.style.removeProperty("transform");
            delete element.dataset.interactive;
            element.style.opacity = "0";
          };
        });
        cleanup = () => media.revert();
      } catch {
        // Optional decoration. Navigation and reading never depend on GSAP.
      }
    }
    void mount();
    return () => { disposed = true; cleanup(); };
  }, [pathname]);

  return (
    <div ref={root} className={styles.field} data-starlight-cursor="" aria-hidden="true">
      {[0, 1, 2, 3].map(index => (
        <span className={styles.star} key={index}>
          {index === 0 && <i className={styles.orbit} />}
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C13.1 8.2 15.8 10.9 24 12C15.8 13.1 13.1 15.8 12 24C10.9 15.8 8.2 13.1 0 12C8.2 10.9 10.9 8.2 12 0Z" />
          </svg>
        </span>
      ))}
    </div>
  );
}
