import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { resolve, join } from "node:path";

const VAULTS_DIR = resolve(process.cwd(), "..", "memory", "vaults");
const SAFE_NAME = /^[a-z0-9][a-z0-9-]*$/i;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!SAFE_NAME.test(id)) {
    return NextResponse.json(
      { error: "invalid vault id" },
      { status: 400 },
    );
  }

  const path = join(VAULTS_DIR, `${id}-vault.md`);
  const resolved = resolve(path);
  if (!resolved.startsWith(VAULTS_DIR)) {
    return NextResponse.json({ error: "path traversal" }, { status: 400 });
  }

  try {
    const raw = await readFile(resolved, "utf8");
    
    // Naive parsing: extract everything under "## Entries"
    const entriesSectionIndex = raw.indexOf("## Entries");
    if (entriesSectionIndex === -1) {
      return NextResponse.json({ entries: [] });
    }

    const entriesContent = raw.slice(entriesSectionIndex + "## Entries".length);
    
    // Split by "### "
    const entryBlocks = entriesContent.split("### ").filter(b => b.trim().length > 0);
    
    const entries = entryBlocks.map(block => {
      const lines = block.split('\n');
      const title = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();
      
      let category = "general";
      const catMatch = content.match(/\*\*Category:\*\*\s*(.+)/i);
      if (catMatch) category = catMatch[1].trim();
      
      let date = "";
      const dateMatch = title.match(/^\[(.*?)\]/);
      if (dateMatch) date = dateMatch[1];
      
      return {
        id: title, // Use title as ID for now
        title: title.replace(/^\[.*?\]\s*/, ''),
        date,
        category,
        content: content.slice(0, 300) + (content.length > 300 ? "..." : "") // truncated for overview
      };
    });

    return NextResponse.json({ entries: entries.reverse() }, {
      headers: { "Cache-Control": "public, max-age=10, s-maxage=30" },
    });
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return NextResponse.json({ entries: [] }); // Empty array if vault file not found
    }
    return NextResponse.json(
      { error: "vault read failure", detail: String(err) },
      { status: 500 },
    );
  }
}
