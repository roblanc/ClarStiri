import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetErrorReportingForTests,
  formatErrorDescription,
  installGlobalErrorHandlers,
  isChunkLoadError,
  reportError,
} from "./errorReporting";

// Vitest runs in node here, so provide the few window bits the module touches.
type Listener = (event: unknown) => void;
let listeners: Record<string, Listener>;
let gtag: ReturnType<typeof vi.fn>;

beforeEach(() => {
  __resetErrorReportingForTests();
  listeners = {};
  gtag = vi.fn();
  vi.stubGlobal("window", {
    gtag,
    location: { pathname: "/stire/abc" },
    addEventListener: (type: string, fn: Listener) => {
      listeners[type] = fn;
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("reportError", () => {
  it("sends a GA4 exception event with the message, source and path", () => {
    reportError(new TypeError("x is undefined"), { fatal: true, source: "react-boundary" });
    expect(gtag).toHaveBeenCalledWith("event", "exception", {
      description: "TypeError: x is undefined @react-boundary [/stire/abc]",
      fatal: true,
    });
  });

  it("truncates descriptions to GA4's 100 character limit", () => {
    reportError(new Error("a".repeat(300)));
    const { description } = gtag.mock.calls[0][2] as { description: string };
    expect(description.length).toBe(100);
    expect(description.endsWith("…")).toBe(true);
  });

  it("reports the same error only once and caps reports per page", () => {
    reportError(new Error("same"));
    reportError(new Error("same"));
    expect(gtag).toHaveBeenCalledTimes(1);
    for (let i = 0; i < 50; i++) reportError(new Error(`e${i}`));
    expect(gtag).toHaveBeenCalledTimes(10);
  });

  it("ignores browser noise and extension errors", () => {
    reportError(new Error("ResizeObserver loop limit exceeded"));
    reportError("Script error.");
    reportError(new Error("boom"), { filename: "chrome-extension://abc/content.js" });
    expect(gtag).not.toHaveBeenCalled();
  });

  it("falls back to dataLayer when gtag is not defined, and never throws", () => {
    const dataLayer: unknown[] = [];
    vi.stubGlobal("window", { location: { pathname: "/" }, dataLayer });
    reportError(new Error("no gtag"));
    expect(dataLayer).toHaveLength(1);
    expect(Array.from(dataLayer[0] as ArrayLike<unknown>)).toEqual([
      "event",
      "exception",
      { description: "Error: no gtag [/]", fatal: false },
    ]);

    vi.stubGlobal("window", { location: { pathname: "/" } });
    expect(() => reportError(new Error("nothing loaded"))).not.toThrow();
  });
});

describe("installGlobalErrorHandlers", () => {
  it("reports window errors and unhandled rejections", () => {
    installGlobalErrorHandlers();
    listeners.error({ message: "Uncaught ReferenceError: foo", error: new ReferenceError("foo"), filename: "https://thesite.ro/assets/index.js" });
    listeners.unhandledrejection({ reason: new Error("fetch failed") });
    expect(gtag).toHaveBeenCalledTimes(2);
    expect(gtag.mock.calls[0][2]).toMatchObject({ description: expect.stringContaining("ReferenceError: foo @window.onerror") });
    expect(gtag.mock.calls[1][2]).toMatchObject({ description: expect.stringContaining("Error: fetch failed @unhandledrejection") });
  });

  it("skips resource load errors that carry no message", () => {
    installGlobalErrorHandlers();
    listeners.error({ message: "", error: null });
    expect(gtag).not.toHaveBeenCalled();
  });
});

describe("helpers", () => {
  it("recognises stale lazy-chunk errors", () => {
    expect(isChunkLoadError(new TypeError("Failed to fetch dynamically imported module: https://thesite.ro/assets/Index-abc.js"))).toBe(true);
    expect(isChunkLoadError(new Error("Importing a module script failed."))).toBe(true);
    expect(isChunkLoadError(new Error("x is undefined"))).toBe(false);
  });

  it("describes non-Error values", () => {
    expect(formatErrorDescription({ code: 42 })).toBe('{"code":42} [/stire/abc]');
    expect(formatErrorDescription("plain")).toBe("plain [/stire/abc]");
  });
});
