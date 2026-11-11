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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, vault = "operational", tags = [], confidence = 0.8 } = body;
    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { success: false, error: "Content is required." },
        { status: 400 }
      );
    }

    const entry = {
      id: `sis_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      vault,
      content: content.trim(),
      tags: Array.isArray(tags) ? tags : [],
      confidence,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      entry,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

