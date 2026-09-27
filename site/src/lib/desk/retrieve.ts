/**
 * Retrieval. Sources arrive with their URLs attached, because a claim without
 * a URL cannot be cited and an uncited claim never reaches the brief.
 *
 * Built on SIP — operational tier.
 */

export const TAVILY_URL = "https://api.tavily.com/search";
export const DEFAULT_TIMEOUT_MS = 20_000;
/**
 * Caps on what one source may carry into the extract prompt. They bound the
 * extract stage's input tokens (see WORST_CASE_RUN_TOKENS in cascade.ts). A
 * URL longer than the cap is dropped rather than cut, because a cut URL
 * cannot be cited.
 */
export const MAX_SOURCE_CHARS = 2400;
export const MAX_TITLE_CHARS = 200;
export const MAX_URL_CHARS = 512;

export interface Source {
  index: number;
  title: string;
  url: string;
  content: string;
}

export interface RetrieveConfig {
  apiKey: string;
  fetchImpl?: typeof fetch;
  now?: () => number;
  endpoint?: string;
  timeoutMs?: number;
}

export interface RetrieveResult {
  sources: Source[];
  latencyMs: number;
  calls: number;
}

/**
 * Search, then keep the results that carry both a URL and a body. `maxResults`
 * caps what the extraction stage has to read, and each source's text is cut to
 * MAX_SOURCE_CHARS, which together cap its token bill.
 */
export async function retrieve(question: string, maxResults: number, config: RetrieveConfig): Promise<RetrieveResult> {
  const fetchImpl = config.fetchImpl ?? fetch;
  const now = config.now ?? (() => Date.now());
  const controller = new AbortController();
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = now();

  try {
    const response = await fetchImpl(config.endpoint ?? TAVILY_URL, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({
        query: question,
        max_results: maxResults,
        search_depth: "advanced",
        include_raw_content: false,
      }),
      signal: controller.signal,
    });

    const latencyMs = Math.max(0, now() - startedAt);
    if (!response.ok) {
      throw new Error(`retrieval answered ${response.status}`);
    }

    const payload: unknown = await response.json().catch(() => null);
    return { sources: toSources(payload, maxResults), latencyMs, calls: 1 };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`retrieval did not answer within ${timeoutMs} ms`);
    }
    throw error instanceof Error ? error : new Error(String(error));
  } finally {
    clearTimeout(timer);
  }
}

function toSources(payload: unknown, maxResults: number): Source[] {
  const results = payload && typeof payload === "object" ? (payload as { results?: unknown }).results : null;
  if (!Array.isArray(results)) return [];
  const sources: Source[] = [];
  for (const entry of results) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    const url = typeof record.url === "string" ? record.url : "";
    const content = typeof record.content === "string" ? record.content : "";
    if (!url.startsWith("http") || url.length > MAX_URL_CHARS || content.trim().length === 0) continue;
    const title = typeof record.title === "string" && record.title.trim() ? record.title : url;
    sources.push({
      index: sources.length + 1,
      title: title.slice(0, MAX_TITLE_CHARS),
      url,
      content: content.slice(0, MAX_SOURCE_CHARS),
    });
    if (sources.length >= maxResults) break;
  }
  return sources;
}
