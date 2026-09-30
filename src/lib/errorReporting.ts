/**
 * Minimal client-side error reporting through the existing GA4 tag (index.html loads
 * gtag for G-1MYVRJ60EY). Errors show up in GA4 as `exception` events
 * (Reports > Engagement > Events > exception; add `description` as a custom dimension
 * to see the messages). No extra services or endpoints.
 */

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: Gtag;
    dataLayer?: unknown[];
  }
}

// GA4 truncates event parameter values at 100 characters.
const MAX_DESCRIPTION = 100;
// Cap per page load so one error in a render loop can't flood analytics.
const MAX_REPORTS_PER_PAGE = 10;

const IGNORED_MESSAGES = [
  /ResizeObserver loop/i,
  /^Script error\.?$/i, // cross-origin script without CORS: no useful info
  /Non-Error promise rejection captured/i,
  /AbortError/i,
];

const reported = new Set<string>();

function describe(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error) ?? String(error);
  } catch {
    return String(error);
  }
}

function sendToAnalytics(...args: unknown[]): void {
  if (typeof window.gtag === "function") {
    window.gtag(...args);
  } else if (Array.isArray(window.dataLayer)) {
    // Same shape gtag() pushes (an arguments object), for when the inline stub is missing.
    (function push(..._: unknown[]) {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    })(...args);
  }
}

export function formatErrorDescription(error: unknown, source?: string): string {
  const where = source ? ` @${source}` : "";
  const path = typeof window !== "undefined" ? ` [${window.location.pathname}]` : "";
  const text = `${describe(error)}${where}${path}`.replace(/\s+/g, " ").trim();
  return text.length > MAX_DESCRIPTION ? `${text.slice(0, MAX_DESCRIPTION - 1)}…` : text;
}

export function shouldIgnoreError(error: unknown, filename?: string): boolean {
  if (filename && /^(chrome|moz|safari|safari-web)-extension:/.test(filename)) return true;
  const message = describe(error);
  return IGNORED_MESSAGES.some((re) => re.test(message));
}

/** Report an error as a GA4 `exception` event. Safe to call anywhere; never throws. */
export function reportError(error: unknown, options: { fatal?: boolean; source?: string; filename?: string } = {}): void {
  try {
    if (typeof window === "undefined" || shouldIgnoreError(error, options.filename)) return;
    const description = formatErrorDescription(error, options.source);
    if (reported.has(description) || reported.size >= MAX_REPORTS_PER_PAGE) return;
    reported.add(description);
    sendToAnalytics("event", "exception", { description, fatal: options.fatal ?? false });
  } catch {
    // Reporting must never break the page.
  }
}

/** True for the error a lazy route throws when its chunk is gone after a new deploy. */
export function isChunkLoadError(error: unknown): boolean {
  const message = describe(error);
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError/i.test(
    message,
  );
}

let installed = false;

/** Hook window.onerror and unhandled promise rejections. Call once at startup. */
export function installGlobalErrorHandlers(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event: ErrorEvent) => {
    // Resource load failures (img/script tags) also fire "error" but without a message.
    if (!event.message && !event.error) return;
    reportError(event.error ?? event.message, { source: "window.onerror", filename: event.filename });
  });

  window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    reportError(event.reason, { source: "unhandledrejection" });
  });
}

/** Test hook. */
export function __resetErrorReportingForTests(): void {
  reported.clear();
  installed = false;
}
