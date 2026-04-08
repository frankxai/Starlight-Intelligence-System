import { NextResponse } from "next/server";
import { getVaultRegistry } from "@/lib/vault";

export const revalidate = 3600;

export async function GET() {
  const registry = await getVaultRegistry();
  return NextResponse.json({
    vaults: registry,
    count: registry.length,
    source: "github:frankxai/Starlight-Intelligence-System",
  });
}
