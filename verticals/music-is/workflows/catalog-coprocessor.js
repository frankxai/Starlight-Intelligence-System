import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(__dirname, '..', 'catalog', 'master.csv');
const DRAFTS_DIR = path.join(__dirname, '..', 'catalog', 'draft');

// Ensure drafts directory exists
if (!fs.existsSync(DRAFTS_DIR)) {
  fs.mkdirSync(DRAFTS_DIR, { recursive: true });
}

// Helper: Parse a single CSV line, accounting for quotes and escaped characters
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Helper: Format cell for CSV (adds quotes if it contains commas, quotes, or newlines)
function formatCSVCell(val) {
  if (val === undefined || val === null) return '';
  let str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }
  return str;
}

// Read and parse master.csv
export function readCatalog() {
  if (!fs.existsSync(CSV_PATH)) {
    return { headers: [], rows: [] };
  }
  const content = fs.readFileSync(CSV_PATH, 'utf8');
  // Simple line split but respecting quotes (to handle newlines inside cells if any)
  const lines = [];
  let currentLine = '';
  let inQuotes = false;
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && content[i + 1] === '\n') {
        i++; // Skip \n
      }
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const parsed = parseCSVLine(lines[i]);
    if (parsed.length === 0 || (parsed.length === 1 && parsed[0] === '')) continue;
    const row = {};
    headers.forEach((header, index) => {
      row[header] = parsed[index] || '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

// Write catalog back to master.csv
export function writeCatalog(headers, rows) {
  const lines = [headers.join(',')];
  rows.forEach(row => {
    const line = headers.map(h => formatCSVCell(row[h] || '')).join(',');
    lines.push(line);
  });
  fs.writeFileSync(CSV_PATH, lines.join('\n') + '\n', 'utf8');
}

// Generate Markdown detail file for a draft song
export function writeDraftMarkdown(song) {
  const markdownPath = path.join(DRAFTS_DIR, `${song.song_id}.md`);
  const content = `---
song_id: ${song.song_id}
title: "${song.title.replace(/"/g, '\\"')}"
persona: ${song.persona}
label: ${song.label}
status: ${song.status}
engine: ${song.engine}
bpm: ${song.bpm || 80}
key: "${song.key || 'C'}"
duration_seconds: ${song.duration_seconds || 180}
created_date: ${song.created_date || new Date().toISOString().split('T')[0]}
suno_url: "${song.suno_url}"
---

# Song Details: ${song.title}

## Suno Prompt
\`\`\`
${song.suno_prompt}
\`\`\`

## Structure Tags
\`\`\`
${song.structure_tags || '[Intro]\n[Verse]\n[Chorus]\n[Outro]'}
\`\`\`

## Notes / Creative Vision
${song.notes || 'No notes added yet.'}

## Asset Checklist
- [ ] Cover Image Generated (\`cover_1x1_path\`)
- [ ] Spotify Canvas Created (\`canvas_path\`)
- [ ] 30-Second Video Hook Drafted (\`video_short_path\`)
- [ ] Uploaded to DistroKid (\`distrokid_id\`)
- [ ] Notion Board Synced

---
**Built on SIP** — Music IS Catalog Draft · Generated dynamically.
`;
  fs.writeFileSync(markdownPath, content, 'utf8');
}

// Tiny API Server for Dashboard Integration
function startServer(port = 3033) {
  const server = http.createServer((req, res) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === '/api/catalog' && req.method === 'GET') {
      try {
        const data = readCatalog();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    } else if (req.url === '/api/catalog/add' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const newSong = JSON.parse(body);
          if (!newSong.title || !newSong.persona || !newSong.label) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing required fields: title, persona, label' }));
            return;
          }

          // Generate primary key: ID
          const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
          const slug = newSong.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          newSong.song_id = `${newSong.label}_${dateStr}_${slug}`;
          newSong.status = 'draft';
          newSong.created_date = new Date().toISOString().split('T')[0];

          const { headers, rows } = readCatalog();
          
          // Verify headers match
          headers.forEach(h => {
            if (!(h in newSong)) {
              newSong[h] = '';
            }
          });

          rows.push(newSong);
          writeCatalog(headers, rows);
          writeDraftMarkdown(newSong);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, song: newSong }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    } else if (req.url === '/api/catalog/update' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const updateData = JSON.parse(body);
          if (!updateData.song_id) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing song_id for update' }));
            return;
          }

          const { headers, rows } = readCatalog();
          const index = rows.findIndex(r => r.song_id === updateData.song_id);

          if (index === -1) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Song with ID ${updateData.song_id} not found` }));
            return;
          }

          // Update fields
          Object.keys(updateData).forEach(key => {
            if (headers.includes(key)) {
              rows[index][key] = updateData[key];
            }
          });

          // Sync dates if status changes
          if (updateData.status === 'gated' && !rows[index].gated_date) {
            rows[index].gated_date = new Date().toISOString().split('T')[0];
          } else if (updateData.status === 'released' && !rows[index].released_date) {
            rows[index].released_date = new Date().toISOString().split('T')[0];
            if (!rows[index].gated_date) {
              rows[index].gated_date = new Date().toISOString().split('T')[0];
            }
          }

          writeCatalog(headers, rows);
          writeDraftMarkdown(rows[index]);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, song: rows[index] }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    } else if (req.url === '/api/catalog/council' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const councilData = JSON.parse(body);
          if (!councilData.song_id) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing song_id for A&R council' }));
            return;
          }
          const { runCouncilDebate } = await import('./music-council.js');
          const result = runCouncilDebate(councilData.song_id);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  server.listen(port, () => {
    console.log(`Music Producer Cockpit local server active at http://localhost:${port}`);
    console.log('Press Ctrl+C to terminate.');
  });
}

// CLI Routing
const args = process.argv.slice(2);
if (args[0] === 'server') {
  const customPort = parseInt(args[1], 10) || 3033;
  startServer(customPort);
} else if (args[0] === 'list') {
  const { rows } = readCatalog();
  console.log(`\n--- Music IS Catalog (${rows.length} songs) ---`);
  rows.forEach(r => {
    console.log(`[${r.status.toUpperCase()}] ${r.title} (${r.persona} / ${r.label}) - ${r.song_id}`);
  });
} else if (args[0] === 'add') {
  // Simple CLI add
  if (args.length < 4) {
    console.log('Usage: node catalog-coprocessor.js add <title> <persona> <label> [suno_url]');
    process.exit(1);
  }
  const title = args[1];
  const persona = args[2];
  const label = args[3];
  const suno_url = args[4] || '';

  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const song_id = `${label}_${dateStr}_${slug}`;

  const { headers, rows } = readCatalog();
  const newSong = {
    song_id,
    title,
    persona,
    label,
    status: 'draft',
    engine: 'suno-v5',
    suno_url,
    created_date: new Date().toISOString().split('T')[0]
  };

  headers.forEach(h => {
    if (!(h in newSong)) newSong[h] = '';
  });

  rows.push(newSong);
  writeCatalog(headers, rows);
  writeDraftMarkdown(newSong);
  console.log(`Added song: ${title} (${song_id})`);
} else {
  // Default to server mode if run programmatically or with no args
  // Check if we are running this file directly in ES module scope
  if (import.meta.url && process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
    console.log('No arguments specified. Defaulting to: server');
    startServer();
  }
}
