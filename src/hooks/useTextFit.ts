import { useState, useLayoutEffect, RefObject } from "react";
import { shrinkwrapFontSize } from "@/utils/textMeasure";

interface TextFitOptions {
  fontFamily: string;
  fontWeight?: string | number;
  minSize: number;
  maxSize: number;
  maxLines: number;
}

/** Width available to the text: the element's content box (padding excluded). */
function contentWidth(el: HTMLElement): number {
  const style = getComputedStyle(el);
  return el.clientWidth - parseFloat(style.paddingLeft || "0") - parseFloat(style.paddingRight || "0");
}

/**
 * Returns the optimal font size (px) for `text` to fill `containerRef`
 * without exceeding `maxLines`. Recalculates on container resize.
 *
 * Measures in a layout effect, i.e. before the browser paints, so the fitted
 * size is what gets painted first (no visible jump from the CSS fallback).
 * That relies on `fontFamily` resolving to fonts that are already available
 * (system fonts): canvas measurement doesn't wait for web fonts to load.
 *
 * Returns null until measured (and while the container is display:none) —
 * use a CSS fallback for that case.
 */
export function useTextFit(
  containerRef: RefObject<HTMLElement | null>,
  text: string,
  options: TextFitOptions
): number | null {
  const [fontSize, setFontSize] = useState<number | null>(null);
  const { fontFamily, fontWeight = "bold", minSize, maxSize, maxLines } = options;

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = (width: number) => {
      if (width <= 0) return;
      setFontSize(shrinkwrapFontSize(text, width, fontFamily, fontWeight, minSize, maxSize, maxLines));
    };

    measure(contentWidth(el));

    const ro = new ResizeObserver((entries) => {
      measure(entries[0]?.contentRect.width ?? 0);
    });
    ro.observe(el);

    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, fontFamily, String(fontWeight), minSize, maxSize, maxLines]);

  return fontSize;
}
