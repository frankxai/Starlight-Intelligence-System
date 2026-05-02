// Shared accent token system. Used by /verticals, /verticals/[slug], /cockpit,
// /architecture and the homepage so all surfaces speak the same color language.
// Tailwind 4 utility class composition; tree-shakeable.

export type Accent =
  | "violet"
  | "cyan"
  | "fuchsia"
  | "emerald"
  | "amber"
  | "rose";

export const ACCENT_TEXT: Record<Accent, string> = {
  violet: "text-violet-400",
  cyan: "text-cyan-400",
  fuchsia: "text-fuchsia-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  rose: "text-rose-400",
};

// One shade lighter for code/labels that should accent without competing
// with primary headings.
export const ACCENT_TEXT_LIGHT: Record<Accent, string> = {
  violet: "text-violet-300",
  cyan: "text-cyan-300",
  fuchsia: "text-fuchsia-300",
  emerald: "text-emerald-300",
  amber: "text-amber-300",
  rose: "text-rose-300",
};

export const ACCENT_BORDER: Record<Accent, string> = {
  violet: "border-violet-500/[0.2]",
  cyan: "border-cyan-500/[0.2]",
  fuchsia: "border-fuchsia-500/[0.2]",
  emerald: "border-emerald-500/[0.2]",
  amber: "border-amber-500/[0.2]",
  rose: "border-rose-500/[0.2]",
};

export const ACCENT_BG: Record<Accent, string> = {
  violet: "bg-violet-500/[0.05]",
  cyan: "bg-cyan-500/[0.05]",
  fuchsia: "bg-fuchsia-500/[0.05]",
  emerald: "bg-emerald-500/[0.05]",
  amber: "bg-amber-500/[0.05]",
  rose: "bg-rose-500/[0.05]",
};

export const ACCENT_BG_SOFT: Record<Accent, string> = {
  violet: "bg-violet-500/[0.04]",
  cyan: "bg-cyan-500/[0.04]",
  fuchsia: "bg-fuchsia-500/[0.04]",
  emerald: "bg-emerald-500/[0.04]",
  amber: "bg-amber-500/[0.04]",
  rose: "bg-rose-500/[0.04]",
};

export const ACCENT_CHIP: Record<Accent, string> = {
  violet: "bg-violet-500/[0.08] text-violet-300 border-violet-500/[0.2]",
  cyan: "bg-cyan-500/[0.08] text-cyan-300 border-cyan-500/[0.2]",
  fuchsia: "bg-fuchsia-500/[0.08] text-fuchsia-300 border-fuchsia-500/[0.2]",
  emerald: "bg-emerald-500/[0.08] text-emerald-300 border-emerald-500/[0.2]",
  amber: "bg-amber-500/[0.08] text-amber-300 border-amber-500/[0.2]",
  rose: "bg-rose-500/[0.08] text-rose-300 border-rose-500/[0.2]",
};

export const ACCENT_GLOW: Record<Accent, string> = {
  violet: "hover:shadow-[0_0_40px_rgba(167,139,250,0.12)]",
  cyan: "hover:shadow-[0_0_40px_rgba(34,211,238,0.12)]",
  fuchsia: "hover:shadow-[0_0_40px_rgba(232,121,249,0.12)]",
  emerald: "hover:shadow-[0_0_40px_rgba(52,211,153,0.12)]",
  amber: "hover:shadow-[0_0_40px_rgba(251,191,36,0.12)]",
  rose: "hover:shadow-[0_0_40px_rgba(251,113,133,0.12)]",
};

export const ACCENT_GRADIENT_FROM: Record<Accent, string> = {
  violet: "from-violet-400",
  cyan: "from-cyan-400",
  fuchsia: "from-fuchsia-400",
  emerald: "from-emerald-400",
  amber: "from-amber-400",
  rose: "from-rose-400",
};
