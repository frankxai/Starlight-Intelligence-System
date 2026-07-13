// Built on SIP — deterministic SVG sky map for one constellation.
// Server component, zero client JS: RA/Dec are flat-projected around the
// constellation's centroid, star size scales with apparent magnitude, and a
// seeded PRNG paints faint background stars (same technique as Starfield, so
// SSR and client markup match). Chart-precision only — not telescope-grade.

import type { Constellation } from "@/lib/cosmos/constellations";

const W = 400;
const H = 300;
const PAD = 44;

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

/** Magnitude → radius. Mag 0 ≈ 6.4px, mag 3.6 ≈ 2px. */
function starRadius(mag: number): number {
  return Math.max(2, 6.4 - mag * 1.25);
}

export function ConstellationMap({
  constellation,
  seed = 42,
}: {
  constellation: Constellation;
  seed?: number;
}) {
  const { stars, lines } = constellation;

  // Flat projection centered on the constellation's centroid. RA grows
  // eastward, which on a sky chart is to the LEFT (we look up at the sphere
  // from inside), hence the negation. cos(dec₀) corrects RA-hour spacing
  // for declination.
  const ra0 = stars.reduce((s, st) => s + st.ra, 0) / stars.length;
  const dec0 = stars.reduce((s, st) => s + st.dec, 0) / stars.length;
  const cosD = Math.cos((dec0 * Math.PI) / 180);

  const raw = stars.map((s) => ({
    ...s,
    px: -(s.ra - ra0) * 15 * cosD,
    py: -(s.dec - dec0),
  }));

  const xs = raw.map((s) => s.px);
  const ys = raw.map((s) => s.py);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  // One scale for both axes so the figure keeps its true sky proportions.
  const scale = Math.min((W - 2 * PAD) / spanX, (H - 2 * PAD) / spanY);
  const offX = (W - spanX * scale) / 2;
  const offY = (H - spanY * scale) / 2;

  const placed = raw.map((s) => ({
    ...s,
    x: offX + (s.px - minX) * scale,
    y: offY + (s.py - minY) * scale,
  }));
  const byId = Object.fromEntries(placed.map((s) => [s.id, s]));

  // Faint deterministic background stars.
  const rand = mulberry32(seed);
  const dust = Array.from({ length: 46 }, () => ({
    x: +(rand() * W).toFixed(1),
    y: +(rand() * H).toFixed(1),
    r: +(0.4 + rand() * 0.7).toFixed(2),
    o: +(0.12 + rand() * 0.22).toFixed(2),
  }));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Star map of ${constellation.name}`}
      className="h-auto w-full"
    >
      <rect width={W} height={H} rx={12} fill="#07070c" />
      {dust.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#cbd5e1" opacity={d.o} />
      ))}
      {lines.map(([a, b], i) => {
        const s1 = byId[a];
        const s2 = byId[b];
        if (!s1 || !s2) return null;
        return (
          <line
            key={i}
            x1={s1.x}
            y1={s1.y}
            x2={s2.x}
            y2={s2.y}
            stroke="#67e8f9"
            strokeOpacity={0.28}
            strokeWidth={1}
          />
        );
      })}
      {placed.map((s) => {
        const r = starRadius(s.mag);
        return (
          <g key={s.id}>
            <circle cx={s.x} cy={s.y} r={r * 2.2} fill="#e2e8f0" opacity={0.06} />
            <circle cx={s.x} cy={s.y} r={r} fill="#f1f5f9">
              <title>{`${s.name} — mag ${s.mag}${s.note ? ` · ${s.note}` : ""}`}</title>
            </circle>
            <text
              x={s.x + r + 5}
              y={s.y + 3}
              fontSize={9}
              fill="#94a3b8"
              className="select-none"
            >
              {s.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
