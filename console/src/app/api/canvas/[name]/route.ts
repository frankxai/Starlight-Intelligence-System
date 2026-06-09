import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { resolve, join } from "node:path";

const ATLASES_DIR = resolve(process.cwd(), "..", "memory", "atlases");
const SAFE_NAME = /^[a-z0-9][a-z0-9-]*$/i;

interface CanvasNode {
  id: string;
  type: "text" | "file" | "link" | "group";
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  label?: string;
  color?: string;
  file?: string;
  url?: string;
}

interface CanvasEdge {
  id: string;
  fromNode: string;
  toNode: string;
  fromSide?: "top" | "right" | "bottom" | "left";
  toSide?: "top" | "right" | "bottom" | "left";
  label?: string;
  color?: string;
}

interface Canvas {
  nodes?: CanvasNode[];
  edges?: CanvasEdge[];
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;

  if (!SAFE_NAME.test(name)) {
    return NextResponse.json(
      { error: "invalid canvas name" },
      { status: 400 },
    );
  }

  const path = join(ATLASES_DIR, `${name}.canvas`);
  const resolved = resolve(path);
  if (!resolved.startsWith(ATLASES_DIR)) {
    return NextResponse.json({ error: "path traversal" }, { status: 400 });
  }

  try {
    const raw = await readFile(resolved, "utf8");
    const data: Canvas = JSON.parse(raw);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=300" },
    });
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return NextResponse.json({ error: "canvas not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "canvas read failure", detail: String(err) },
      { status: 500 },
    );
  }
}
