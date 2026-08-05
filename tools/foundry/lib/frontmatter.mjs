export function parseFrontmatter(markdown) {
  if (!markdown.startsWith("---\n")) return { fields: {}, body: markdown };
  const end = markdown.indexOf("\n---\n", 4);
  if (end === -1) return { fields: {}, body: markdown };
  const raw = markdown.slice(4, end);
  const fields = {};
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    fields[match[1]] = match[2].replace(/^["']|["']$/g, "").trim();
  }
  return { fields, body: markdown.slice(end + 5) };
}
