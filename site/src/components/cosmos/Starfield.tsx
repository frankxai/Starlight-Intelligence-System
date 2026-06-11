// Deterministic SVG starfield — seeded PRNG so SSR and client markup are
// identical (no hydration mismatch). Pure decoration; respects
// prefers-reduced-motion via the global animation kill-switch.

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Star = {
  x: number;
  y: number;
  r: number;
  opacity: number;
  color: string;
  delay: number;
  twinkle: boolean;
};

function generateStars(seed: number, count: number): Star[] {
  const rand = mulberry32(seed);
  const colors = [
    "#e2e8f0", // slate — most stars
    "#e2e8f0",
    "#e2e8f0",
    "#a78bfa", // violet accent
    "#67e8f9", // cyan
    "#fcd34d", // amber — K/M class warmth
  ];
  return Array.from({ length: count }, (_, i) => {
    const bright = rand() > 0.85;
    return {
      x: +(rand() * 100).toFixed(2),
      y: +(rand() * 100).toFixed(2),
      r: bright ? +(0.8 + rand() * 0.9).toFixed(2) : +(0.3 + rand() * 0.5).toFixed(2),
      opacity: bright ? +(0.5 + rand() * 0.5).toFixed(2) : +(0.15 + rand() * 0.35).toFixed(2),
      color: colors[Math.floor(rand() * colors.length)],
      delay: +(rand() * 9).toFixed(1),
      twinkle: i % 3 === 0,
    };
  });
}

export function Starfield({
  seed = 1969,
  count = 140,
  className = "",
}: {
  seed?: number;
  count?: number;
  className?: string;
}) {
  const stars = generateStars(seed, count);
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r * 0.18}
          fill={s.color}
          opacity={s.opacity}
          className={s.twinkle ? "animate-brain-node" : undefined}
          style={s.twinkle ? { animationDelay: `${s.delay}s` } : undefined}
        />
      ))}
    </svg>
  );
}
