/** Small transport boundaries shared by the operational federation adapters. */
export function positiveInteger(value: number, name: string, maximum: number): number {
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
    throw new Error(`${name} must be an integer between 1 and ${maximum}`);
  }
  return value;
}

export function boundedText(value: unknown, name: string, maxBytes: number): string {
  if (typeof value !== "string" || Buffer.byteLength(value, "utf8") > maxBytes) {
    throw new Error(`${name} must be text within ${maxBytes} bytes`);
  }
  return value;
}

/** The caller stops waiting even when a third-party client ignores AbortSignal. */
export function withAbort<T>(work: () => Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(new Error("Execution cancelled"));
  return new Promise<T>((resolve, reject) => {
    const abort = () => reject(new Error("Execution cancelled"));
    signal.addEventListener("abort", abort, { once: true });
    Promise.resolve().then(() => {
      if (signal.aborted) throw new Error("Execution cancelled");
      return work();
    }).then(resolve, reject).finally(() => signal.removeEventListener("abort", abort));
  });
}

export function pause(ms: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) return Promise.reject(new Error("Execution cancelled"));
  return new Promise((resolve, reject) => {
    const abort = () => { clearTimeout(timer); reject(new Error("Execution cancelled")); };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, ms);
    signal.addEventListener("abort", abort, { once: true });
  });
}
