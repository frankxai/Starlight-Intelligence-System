import type { Cluster, BucketReport } from "./atom-schema.ts";

export interface ClassificationResult {
  mode: BucketReport["mode"];
  byBucket: BucketReport["byBucket"];
}

export function classifyDensity(clusters: Cluster[]): ClassificationResult {
  const byBucket = {
    signature: clusters.filter((c) => c.bucket === "signature").length,
    framework: clusters.filter((c) => c.bucket === "framework").length,
    anecdote: clusters.filter((c) => c.bucket === "anecdote").length,
  };

  let mode: BucketReport["mode"];
  if (byBucket.signature >= 1) {
    mode = "auto-build";
  } else if (byBucket.framework >= 2) {
    mode = "propose-menu";
  } else {
    mode = "empower";
  }

  return { mode, byBucket };
}
