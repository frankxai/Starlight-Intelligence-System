import { NextResponse } from "next/server";
import { allNodes, edges } from "@/data/substrate";

/**
 * Substrate graph API — returns the canonical node + edge list.
 *
 * Phase 1: serves the hardcoded data from `@/data/substrate`. A future
 * phase will swap in a live Memory Bus query so the substrate reflects
 * current vault + vertical state.
 */
export async function GET() {
  return NextResponse.json(
    { nodes: allNodes, edges },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } },
  );
}
