"use client";

import { useEffect } from "react";

const motionCapability =
  "(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)";

export function FieldNotesMotion() {
  useEffect(() => {
    const section = document.querySelector<HTMLElement>("[data-field-notes]");
    if (!section) return;

    const capability = window.matchMedia(motionCapability);
    let runId = 0;
    let active = false;
    let sectionObserver: IntersectionObserver | undefined;
    let chapterObserver: IntersectionObserver | undefined;
    let gsapInstance: (typeof import("gsap"))["gsap"] | undefined;
    let revealQueue: HTMLElement[] = [];
    let revealing = false;
    const cleanups: Array<() => void> = [];

    const resetMotion = () => {
      runId += 1;
      active = false;
      revealing = false;
      revealQueue = [];
      sectionObserver?.disconnect();
      chapterObserver?.disconnect();
      cleanups.splice(0).forEach((cleanup) => cleanup());

      if (gsapInstance) {
        const animated = section.querySelectorAll<HTMLElement>(
          "[data-field-card], [data-field-media], [data-field-image], [data-field-glow], [data-field-stars]",
        );
        gsapInstance.killTweensOf(animated);
        gsapInstance.set(animated, { clearProps: "all" });
      }

      section
        .querySelectorAll<HTMLElement>("[data-field-chapter]")
        .forEach((chapter) => delete chapter.dataset.revealQueued);
      section.dataset.motion = "static";
    };

    const activateMotion = () => {
      if (!capability.matches || active) return;
      active = true;
      section.dataset.motion = "pending";
      const activationId = ++runId;

      sectionObserver = new IntersectionObserver(
        async ([entry]) => {
          if (!entry?.isIntersecting) return;
          sectionObserver?.disconnect();

          const { gsap } = await import("gsap");
          if (activationId !== runId || !capability.matches) return;
          gsapInstance = gsap;
          section.dataset.motion = "enhanced";

          const revealNext = () => {
            const chapter = revealQueue.shift();
            if (!chapter || activationId !== runId) {
              revealing = false;
              return;
            }

            revealing = true;
            const cards = Array.from(
              chapter.querySelectorAll<HTMLElement>("[data-field-card]"),
            );
            const tween = gsap.fromTo(
              cards,
              {
                autoAlpha: 0,
                y: 64,
                z: -80,
                rotationX: 2.5,
                rotationY: (index) => (index % 2 === 0 ? -6 : 6),
                rotationZ: (index) => (index % 2 === 0 ? -0.7 : 0.7),
                scale: 0.975,
                transformPerspective: 1200,
                transformOrigin: "50% 70%",
              },
              {
                autoAlpha: 1,
                y: 0,
                z: 0,
                rotationX: 0,
                rotationY: 0,
                rotationZ: 0,
                scale: 1,
                duration: 0.82,
                stagger: 0.075,
                ease: "power3.out",
                clearProps: "transform,opacity,visibility",
                onComplete: () => {
                  if (activationId !== runId) return;
                  revealing = false;
                  revealNext();
                },
              },
            );
            cleanups.push(() => tween.kill());
          };

          chapterObserver = new IntersectionObserver(
            (entries) => {
              const arrived = entries
                .filter((chapterEntry) => chapterEntry.isIntersecting)
                .map((chapterEntry) => chapterEntry.target as HTMLElement)
                .filter((chapter) => chapter.dataset.revealQueued !== "true")
                .sort((left, right) => left.offsetTop - right.offsetTop);

              for (const chapter of arrived) {
                chapter.dataset.revealQueued = "true";
                chapterObserver?.unobserve(chapter);
                revealQueue.push(chapter);
              }
              if (!revealing) revealNext();
            },
            { rootMargin: "0px 0px -10%", threshold: 0.12 },
          );

          section
            .querySelectorAll<HTMLElement>("[data-field-chapter]")
            .forEach((chapter) => chapterObserver?.observe(chapter));

          section.querySelectorAll<HTMLElement>("[data-field-card]").forEach((card) => {
            const media = card.querySelector<HTMLElement>("[data-field-media]");
            const image = card.querySelector<HTMLElement>("[data-field-image]");
            const glow = card.querySelector<HTMLElement>("[data-field-glow]");
            const stars = card.querySelector<HTMLElement>("[data-field-stars]");
            if (!media || !image || !glow || !stars) return;

            const rotateX = gsap.quickTo(media, "rotationX", { duration: 0.42, ease: "power3.out" });
            const rotateY = gsap.quickTo(media, "rotationY", { duration: 0.42, ease: "power3.out" });
            const mediaScale = gsap.quickTo(media, "scale", { duration: 0.42, ease: "power3.out" });
            const imageScale = gsap.quickTo(image, "scale", { duration: 0.55, ease: "power3.out" });
            const glowX = gsap.quickTo(glow, "xPercent", { duration: 0.32, ease: "power2.out" });
            const glowY = gsap.quickTo(glow, "yPercent", { duration: 0.32, ease: "power2.out" });
            const starsX = gsap.quickTo(stars, "x", { duration: 0.5, ease: "power2.out" });
            const starsY = gsap.quickTo(stars, "y", { duration: 0.5, ease: "power2.out" });
            let bounds: DOMRect | undefined;
            let pointerX = 0;
            let pointerY = 0;
            let frame = 0;

            const onEnter = () => {
              bounds = card.getBoundingClientRect();
            };

            const onMove = (event: PointerEvent) => {
              if (!bounds) bounds = card.getBoundingClientRect();
              pointerX = event.clientX;
              pointerY = event.clientY;
              if (frame) return;

              frame = window.requestAnimationFrame(() => {
                frame = 0;
                if (!bounds) return;
                const x = (pointerX - bounds.left) / bounds.width - 0.5;
                const y = (pointerY - bounds.top) / bounds.height - 0.5;
                rotateX(-y * 7);
                rotateY(x * 7);
                mediaScale(1.012);
                imageScale(1.028);
                glowX(x * 28);
                glowY(y * 28);
                starsX(x * -9);
                starsY(y * -9);
              });
            };

            const onLeave = () => {
              if (frame) window.cancelAnimationFrame(frame);
              frame = 0;
              bounds = undefined;
              rotateX(0);
              rotateY(0);
              mediaScale(1);
              imageScale(1);
              glowX(0);
              glowY(0);
              starsX(0);
              starsY(0);
            };

            card.addEventListener("pointerenter", onEnter);
            card.addEventListener("pointermove", onMove);
            card.addEventListener("pointerleave", onLeave);
            cleanups.push(() => {
              if (frame) window.cancelAnimationFrame(frame);
              card.removeEventListener("pointerenter", onEnter);
              card.removeEventListener("pointermove", onMove);
              card.removeEventListener("pointerleave", onLeave);
            });
          });
        },
        { rootMargin: "260px 0px", threshold: 0.01 },
      );

      sectionObserver.observe(section);
    };

    const handleCapabilityChange = () => {
      resetMotion();
      if (capability.matches) activateMotion();
    };

    capability.addEventListener("change", handleCapabilityChange);
    if (capability.matches) activateMotion();
    else section.dataset.motion = "static";

    return () => {
      capability.removeEventListener("change", handleCapabilityChange);
      resetMotion();
    };
  }, []);

  return null;
}
