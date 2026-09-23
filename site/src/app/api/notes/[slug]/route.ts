import { NextResponse } from "next/server";
import { getPublicNote } from "@/lib/public-notes";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const note = getPublicNote(slug);
  if (!note) {
    return NextResponse.json({ error: "Public note not found" }, { status: 404 });
  }

  const download = new URL(request.url).searchParams.get("download") === "1";
  return NextResponse.json(note, {
    headers: download
      ? { "Content-Disposition": `attachment; filename="${note.slug}.json"` }
      : undefined,
  });
}
