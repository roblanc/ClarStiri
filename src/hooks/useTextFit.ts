import { useState, useEffect, RefObject } from "react";
import { shrinkwrapFontSize } from "@/utils/textMeasure";

interface TextFitOptions {
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
 * Returns null on first render — use a CSS fallback until resolved.
 */
export function useTextFit(
  containerRef: RefObject<HTMLElement | null>,
  text: string,
  options: TextFitOptions
): number | null {
  const [fontSize, setFontSize] = useState<number | null>(null);
  const { fontFamily, fontWeight = "bold", minSize, maxSize, maxLines } = options;

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
