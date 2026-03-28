import { useState, useEffect, useRef, RefObject } from "react";
import { shrinkwrapFontSize } from "@/utils/textMeasure";

interface TextFitOptions {
  /** CSS font-family string, e.g. "VICE Grotesk, Helvetica, sans-serif" */
  fontFamily: string;
  fontWeight?: string | number;
  minSize: number;
  maxSize: number;
  maxLines: number;
}

/**
 * Returns the optimal font size (px) for `text` to fill `containerRef`
 * without exceeding `maxLines`. Recalculates on container resize.
 *
 * Returns null until the container is measured (use a fallback size for SSR /
 * first render).
 */
export function useTextFit(
  containerRef: RefObject<HTMLElement | null>,
  text: string,
  options: TextFitOptions
): number | null {
  const [fontSize, setFontSize] = useState<number | null>(null);
  const { fontFamily, fontWeight = "bold", minSize, maxSize, maxLines } = options;

  // Stable ref so the ResizeObserver callback doesn't capture stale options
  const optsRef = useRef(options);
  optsRef.current = options;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = (width: number) => {
      const size = shrinkwrapFontSize(
        text,
        width,
        fontFamily,
        fontWeight,
        minSize,
        maxSize,
        maxLines
      );
      setFontSize(size);
    };

    // Wait for custom fonts to be ready so measurements are accurate
    const run = (width: number) => {
      if (document.fonts?.ready) {
        document.fonts.ready.then(() => measure(width));
      } else {
        measure(width);
      }
    };

    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width > 0) run(width);
    });

    ro.observe(el);
    const initialWidth = el.getBoundingClientRect().width;
    if (initialWidth > 0) run(initialWidth);

    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, fontFamily, String(fontWeight), minSize, maxSize, maxLines]);

  return fontSize;
}
