import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // three.js + @react-three/fiber are ESM-friendly; no transpile needed
  // for Next 16 + Turbopack. Add transpilePackages later if drei extras
  // (e.g. troika-three-text) hit interop issues.
  reactStrictMode: true,

  // Pin Turbopack root to this directory — there are multiple lockfiles
  // higher up the tree (parent repo + sibling site/) and Next would
  // otherwise infer the wrong root.
  turbopack: {
    root: path.resolve("."),
  },
};

export default nextConfig;
