const GITHUB_API = "https://api.github.com";
const DEFAULT_REVALIDATE_SECONDS = 3600;
const DEFAULT_MAX_ATTEMPTS = 2;
const DEFAULT_RETRY_DELAY_MS = 125;
const DEFAULT_REQUEST_TIMEOUT_MS = 5000;

class GitHubContentFetchError extends Error {
  /**
   * @param {string} message
   * @param {{ status?: number, retryable?: boolean, cause?: unknown }} [details]
   */
  constructor(message, details = {}) {
    super(message, details.cause === undefined ? undefined : { cause: details.cause });
    this.name = "GitHubContentFetchError";
    this.status = details.status;
    this.retryable = details.retryable ?? false;
  }
}

/** @param {number} status */
function isTransientStatus(status) {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

/** @param {unknown} error */
function isRetryableError(error) {
  if (error instanceof GitHubContentFetchError) return error.retryable;

  // Native fetch rejects with TypeError for transport failures. The nested
  // cause carries the useful code on Node/undici (ETIMEDOUT, ECONNRESET, ...).
  // AbortSignal.timeout() rejects with a TimeoutError; caller-driven aborts
  // may surface as AbortError. Both are safe to retry for this idempotent GET.
  return (
    error instanceof TypeError ||
    error instanceof SyntaxError ||
    (error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError"))
  );
}

/** @param {unknown} error */
function errorReceipt(error) {
  if (!(error instanceof Error)) return { message: String(error) };

  const cause = error.cause;
  const causeReceipt =
    cause && typeof cause === "object"
      ? {
          name: "name" in cause ? String(cause.name) : undefined,
          message: "message" in cause ? String(cause.message) : undefined,
          code: "code" in cause ? String(cause.code) : undefined,
          errno: "errno" in cause ? String(cause.errno) : undefined,
          syscall: "syscall" in cause ? String(cause.syscall) : undefined,
        }
      : undefined;

  return {
    name: error.name,
    message: error.message,
    ...(error instanceof GitHubContentFetchError && error.status
      ? { status: error.status }
      : {}),
    ...(causeReceipt ? { cause: causeReceipt } : {}),
  };
}

/** @param {number} milliseconds */
function wait(milliseconds) {
  if (milliseconds <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Fetch a UTF-8 text file from the GitHub contents API.
 *
 * The request is a cacheable GET, so one bounded retry is safe. A persistent
 * transport/upstream failure is rethrown: Next ISR then retains its last good
 * render instead of accepting an empty vault as a successful regeneration.
 * Only a real 404 represents an absent optional vault file.
 *
 * @param {string} repo
 * @param {string} path
 * @param {{
 *   token?: string,
 *   revalidateSeconds?: number,
 *   maxAttempts?: number,
 *   retryDelayMs?: number,
 *   requestTimeoutMs?: number,
 *   fetchImpl?: typeof fetch,
 *   logger?: Pick<Console, "warn" | "error">
 * }} [options]
 * @returns {Promise<string | null>}
 */
export async function fetchGitHubTextFile(repo, path, options = {}) {
  const {
    token,
    revalidateSeconds = DEFAULT_REVALIDATE_SECONDS,
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
    fetchImpl = fetch,
    logger = console,
  } = options;

  const url = `${GITHUB_API}/repos/${repo}/contents/${path}`;
  const headers = {
    Accept: "application/vnd.github.v3+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        headers,
        next: { revalidate: revalidateSeconds },
        signal: AbortSignal.timeout(requestTimeoutMs),
      });

      if (response.status === 404) return null;

      if (!response.ok) {
        throw new GitHubContentFetchError(
          `GitHub contents API returned ${response.status}`,
          {
            status: response.status,
            retryable: isTransientStatus(response.status),
          },
        );
      }

      const payload = await response.json();
      if (!payload || typeof payload.content !== "string") {
        throw new GitHubContentFetchError(
          "GitHub contents API response did not contain base64 content",
        );
      }

      return Buffer.from(payload.content, "base64").toString("utf-8");
    } catch (error) {
      const willRetry = attempt < maxAttempts && isRetryableError(error);
      const receipt = {
        repo,
        path,
        attempt,
        maxAttempts,
        error: errorReceipt(error),
      };

      if (!willRetry) {
        logger.error("[vault/github] content fetch failed", receipt);
        throw error;
      }

      logger.warn("[vault/github] transient content fetch failed; retrying", receipt);
      await wait(retryDelayMs * attempt);
    }
  }

  throw new Error("unreachable");
}
