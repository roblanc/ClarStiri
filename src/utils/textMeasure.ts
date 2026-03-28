/**
 * Canvas-based text measurement utilities.
 * Zero DOM layout thrashing — all arithmetic on an offscreen canvas.
 */

let _ctx: CanvasRenderingContext2D | null = null;

function ctx(): CanvasRenderingContext2D {
  if (!_ctx) {
    _ctx = document.createElement("canvas").getContext("2d")!;
  }
  return _ctx;
}

function lineCount(
  text: string,
  containerWidth: number,
  font: string
): number {
  const c = ctx();
  c.font = font;
  const words = text.split(" ");
  let lines = 1;
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (c.measureText(candidate).width > containerWidth && current !== "") {
      lines++;
      current = word;
    } else {
      current = candidate;
    }
  }
  return lines;
}

/**
 * Returns the largest integer font size (px) in [minSize, maxSize] such that
 * `text` wraps into at most `maxLines` lines at `containerWidth` px.
 *
 * Falls back to minSize if even minSize exceeds maxLines (pathological case).
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
    if (lineCount(text, containerWidth, font) <= maxLines) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return best;
}
