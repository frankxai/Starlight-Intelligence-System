/**
 * StarlightMark — the canonical Starlight Intelligence sigil.
 *
 * A single guiding star with vertically-dominant diffraction rays (telescope
 * optics, not the generic four-point "AI sparkle") and one tilted orbit
 * carrying a companion node: the star is the human operator's north; the
 * orbit is the agent system moving around it. Pure geometry, gradient light,
 * scales from 14px favicon territory to hero size without rasterization.
 */

import { useId } from "react";

export function StarlightMark({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  // Unique gradient ids per instance (SVG defs are document-global);
  // useId stays stable across SSR and hydration.
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-ray`} x1="12" y1="0" x2="12" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#c4b5fd" />
          <stop offset="0.5" stopColor="#f8fafc" />
          <stop offset="1" stopColor="#67e8f9" />
        </linearGradient>
        <linearGradient id={`${id}-orbit`} x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#a78bfa" stopOpacity="0" />
          <stop offset="0.5" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      {/* Orbit — the agent system around the star */}
      <ellipse
        cx="12"
        cy="12"
        rx="9.6"
        ry="3.7"
        transform="rotate(-24 12 12)"
        stroke={`url(#${id}-orbit)`}
        strokeWidth="0.75"
      />
      {/* Companion node riding the orbit */}
      <circle cx="4.1" cy="15.9" r="1.05" fill="#22d3ee" />

      {/* Horizontal diffraction ray */}
      <path
        d="M4 12 C8.6 11.5 10.6 11.2 12 11.2 C13.4 11.2 15.4 11.5 20 12 C15.4 12.5 13.4 12.8 12 12.8 C10.6 12.8 8.6 12.5 4 12 Z"
        fill={`url(#${id}-ray)`}
        opacity="0.85"
      />
      {/* Vertical diffraction ray — dominant */}
      <path
        d="M12 0.6 C12.75 6.9 13.1 9.6 14.6 12 C13.1 14.4 12.75 17.1 12 23.4 C11.25 17.1 10.9 14.4 9.4 12 C10.9 9.6 11.25 6.9 12 0.6 Z"
        fill={`url(#${id}-ray)`}
      />
      {/* Core */}
      <circle cx="12" cy="12" r="1.5" fill="#f8fafc" />
    </svg>
  );
}
