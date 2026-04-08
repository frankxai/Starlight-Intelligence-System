import { NextResponse } from "next/server";
import { getVaultData } from "@/lib/vault";

export const revalidate = 3600;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const data = await getVaultData(slug);

  if (!data) {
    return NextResponse.json({ error: "Vault not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: data.profile.name,
    slug,
    bio: data.profile.bio,
    avatar: data.profile.avatar,
    lastUpdated: data.lastUpdated,
    totalEntries: data.totalEntries,
    entries: data.entries,
    meta: {
      source: `github:frankxai/Starlight-Intelligence-System`,
      format: "starlight-vault-v1",
      api: "https://starlightintelligence.org/api/vaults/" + slug,
    },
  });
}
