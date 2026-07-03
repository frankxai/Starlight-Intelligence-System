import { useId } from "react";

/**
 * Starlight brand mark — a concave four-point star with soft diagonal
 * minor spikes, rendered with a pearl → violet → cyan gradient.
 */
export function StarlightMark({ size = 19 }: { size?: number }) {
  const gradientId = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ede9fe" />
          <stop offset="0.55" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#67e8f9" />
        </linearGradient>
      </defs>
      {/* Minor diagonal spikes */}
      <path
        d="M12 6.8 C12.9 9.9 14.1 11.1 17.2 12 C14.1 12.9 12.9 14.1 12 17.2 C11.1 14.1 9.9 12.9 6.8 12 C9.9 11.1 11.1 9.9 12 6.8 Z"
        fill={`url(#${gradientId})`}
        opacity="0.35"
        transform="rotate(45 12 12)"
      />
      {/* Primary four-point star */}
      <path
        d="M12 1.6 C12.9 7.6 16.4 11.1 22.4 12 C16.4 12.9 12.9 16.4 12 22.4 C11.1 16.4 7.6 12.9 1.6 12 C7.6 11.1 11.1 7.6 12 1.6 Z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}
