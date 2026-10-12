export function parseFrontmatter(markdown) {
  const normalized = markdown.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) return { fields: {}, body: markdown };
  const end = normalized.indexOf("\n---\n", 4);
  if (end === -1) return { fields: {}, body: markdown };
  const raw = normalized.slice(4, end);
  const fields = {};
  for (const line of raw.split("\n")) {
    const match = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    fields[match[1]] = match[2].replace(/^["']|["']$/g, "").trim();
  }
  return { fields, body: normalized.slice(end + 5) };
}
