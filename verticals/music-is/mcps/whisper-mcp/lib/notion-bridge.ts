/**
 * notion-bridge — Mobile Inbox CRUD via Notion API
 *
 * NOTION_TOKEN required. NOTION_INBOX_DS = data source ID for Mobile Inbox.
 */

import fetch from 'node-fetch';

const NOTION_API = 'https://api.notion.com/v1';
const VERSION = '2022-06-28';

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
    'Notion-Version': VERSION,
    'Content-Type': 'application/json',
  };
}

export interface InboxEntry {
  id: string;
  capture_name: string;
  type: string;
  persona_hint: string | null;
  label_hint: string | null;
  audio_url: string | null;
  intent: string | null;
  status: string;
  captured_at: string;
}

export async function fetchInboxVoiceMemos(dataSourceId: string, limit: number): Promise<InboxEntry[]> {
  if (!process.env.NOTION_TOKEN) throw new Error('NOTION_TOKEN required.');

  const res = await fetch(`${NOTION_API}/databases/${dataSourceId}/query`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      filter: {
        and: [
          { property: 'Type', select: { equals: 'Voice Memo' } },
          { property: 'Status', status: { equals: 'Not started' } },
        ],
      },
      sorts: [{ property: 'Captured At', direction: 'ascending' }],
      page_size: limit,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Notion query failed: ${res.status} ${t}`);
  }

  const data: any = await res.json();
  return (data.results || []).map((page: any) => ({
    id: page.id,
    capture_name: page.properties?.Capture?.title?.[0]?.plain_text || '(untitled)',
    type: page.properties?.Type?.select?.name || 'unknown',
    persona_hint: page.properties?.['Persona Hint']?.select?.name || null,
    label_hint: page.properties?.['Label Hint']?.select?.name || null,
    audio_url: page.properties?.['Suno URL']?.url || null,  // Voice Memos use the Suno URL field for audio links in v0.1
    intent: page.properties?.Intent?.rich_text?.[0]?.plain_text || null,
    status: page.properties?.Status?.status?.name || 'Not started',
    captured_at: page.properties?.['Captured At']?.created_time || '',
  }));
}

export async function updateInboxEntry(pageId: string, updates: { Status?: string; Intent?: string }): Promise<void> {
  if (!process.env.NOTION_TOKEN) throw new Error('NOTION_TOKEN required.');

  const properties: any = {};
  if (updates.Status) properties['Status'] = { status: { name: updates.Status } };
  if (updates.Intent) properties['Intent'] = { rich_text: [{ text: { content: updates.Intent.slice(0, 1900) } }] };

  const res = await fetch(`${NOTION_API}/pages/${pageId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ properties }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Notion update failed: ${res.status} ${t}`);
  }
}
