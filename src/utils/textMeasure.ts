/**
 * Text measurement utilities using @chenglou/pretext.
 *
 * prepare() + layout() avoid DOM reflow entirely:
 *   prepare() measures word widths via canvas once (~19ms / 500 texts)
 *   layout() is pure arithmetic (~0.09ms / batch)
 *
 * Note: use named fonts (e.g. "VICE Grotesk"), not "system-ui" —
 * canvas resolves system-ui to different optical variants than DOM on macOS.
 */

import { prepare, layout } from "@chenglou/pretext";

const LINE_HEIGHT_RATIO = 1.08; // matches lineHeight: 1.08 on the h3

/**
 * Returns the largest integer font size (px) in [minSize, maxSize] such that
 * `text` wraps into at most `maxLines` lines at `containerWidth` px.
 */
export function shrinkwrapFontSize(
  text: string,
  containerWidth: number,
  fontFamily: string,
  fontWeight: string | number,
  minSize: number,
  maxSize: number,
  maxLines: number
): number {
  if (containerWidth <= 0) return minSize;

  let lo = minSize;
  let hi = maxSize;
  let best = minSize;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const font = `${fontWeight} ${mid}px ${fontFamily}`;
    const prepared = prepare(text, font);
    const lineHeight = mid * LINE_HEIGHT_RATIO;
    const { lineCount } = layout(prepared, containerWidth, lineHeight);

    if (lineCount <= maxLines) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return best;
}
