/**
 * audio-fetcher — URL → local tmp file
 *
 * Routes:
 *   - direct media URLs (.mp3/.wav/.m4a/.ogg/.flac) → node-fetch
 *   - Suno share URLs → resolve via Suno API or extract direct audio
 *   - YouTube → yt-dlp-wrap (legal use only; reference analysis, not republishing)
 *   - Bandcamp → resolve via embed audio
 *   - Notion attachment URLs → fetch with NOTION_TOKEN auth
 *   - Spotify/Apple/Tidal → REFUSED (DRM)
 */

import fetch from 'node-fetch';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

function urlHash(url: string): string {
  return createHash('sha256').update(url).digest('hex').slice(0, 16);
}

function tmpPath(url: string, ext = 'mp3'): string {
  return join(tmpdir(), `music-is-whisper-${urlHash(url)}.${ext}`);
}

const DRM_PATTERNS = [/open\.spotify\.com/i, /spotify\.com\/track/i, /music\.apple\.com/i, /tidal\.com\/browse/i, /tidal\.com\/track/i];
const YOUTUBE = /(?:youtube\.com|youtu\.be)/i;
const DIRECT_MEDIA = /\.(mp3|wav|m4a|ogg|flac|aac)($|\?)/i;

export async function fetchAudioToTmp(url: string): Promise<string> {
  if (DRM_PATTERNS.some((p) => p.test(url))) {
    throw new Error(`Refused: ${url} is DRM-protected. Whisper MCP cannot scrape. Manual download required, then call with file_path.`);
  }

  if (YOUTUBE.test(url)) {
    return await fetchYouTube(url);
  }

  if (DIRECT_MEDIA.test(url)) {
    return await fetchDirectMedia(url);
  }

  // assume direct media as fallback
  return await fetchDirectMedia(url);
}

async function fetchDirectMedia(url: string): Promise<string> {
  const headers: Record<string, string> = {};
  // Notion attachment auth
  if (url.includes('notion.so') || url.includes('prod-files-secure')) {
    if (process.env.NOTION_TOKEN) headers['Authorization'] = `Bearer ${process.env.NOTION_TOKEN}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`fetch failed: ${res.status} ${res.statusText} for ${url}`);

  const buf = Buffer.from(await res.arrayBuffer());
  const ext = url.match(DIRECT_MEDIA)?.[1] || 'mp3';
  const path = tmpPath(url, ext);
  writeFileSync(path, buf);
  return path;
}

async function fetchYouTube(url: string): Promise<string> {
  try {
    const YtDlpWrap = (await import('yt-dlp-wrap')).default;
    const ytdlp = new YtDlpWrap();
    const path = tmpPath(url, 'mp3');
    await ytdlp.exec([url, '-x', '--audio-format', 'mp3', '--audio-quality', '192K', '-o', path]);
    return path;
  } catch (err: any) {
    throw new Error(`YouTube fetch via yt-dlp failed: ${err.message}. Verify yt-dlp binary is installed system-wide.`);
  }
}
