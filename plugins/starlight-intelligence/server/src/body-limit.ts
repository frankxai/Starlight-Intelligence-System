export const MAX_MCP_BODY_BYTES = 1_048_576; // 1 MiB ceiling on JSON-RPC payloads

export class PayloadTooLargeError extends Error {
  constructor() {
    super("payload_too_large");
    this.name = "PayloadTooLargeError";
  }
}

/**
 * Enforce a byte ceiling on a request body whether or not the client sends Content-Length.
 * A declared length over the limit is rejected without reading. A body without a declared
 * length (chunked or streamed) is read up to the limit and rejected as soon as it exceeds it;
 * otherwise the buffered bytes are returned in a fresh Request for downstream handlers.
 */
export async function enforceBodyLimit(
  request: Request,
  maxBytes: number = MAX_MCP_BODY_BYTES,
): Promise<Request> {
  const declared = request.headers.get("content-length");
  if (declared !== null) {
    const declaredLength = Number(declared);
    if (!Number.isFinite(declaredLength) || declaredLength < 0 || declaredLength > maxBytes) {
      throw new PayloadTooLargeError();
    }
  }
  if (!request.body) return request;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => {});
      throw new PayloadTooLargeError();
    }
    chunks.push(value);
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body,
    redirect: request.redirect,
    signal: request.signal,
  });
}
