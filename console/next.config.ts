import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // three.js + @react-three/fiber are ESM-friendly; no transpile needed
  // for Next 16 + Turbopack. Add transpilePackages later if drei extras
  // (e.g. troika-three-text) hit interop issues.
  reactStrictMode: true,

  // Local Operator is opened via 127.0.0.1 and localhost.
  allowedDevOrigins: ["127.0.0.1", "localhost"],

  // Pin Turbopack root to this directory — multiple lockfiles higher up
  // the tree would otherwise make Next infer the wrong root.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
