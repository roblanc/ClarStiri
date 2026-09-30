import { useCallback, useEffect, useRef, useState } from 'react';
import { Newspaper } from 'lucide-react';
import { getImageProxyUrl } from '@/utils/imageOptimizer';
import { PLACEHOLDER_IMAGE_WEBP } from '@/lib/constants';

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const GRADIENTS: [string, string][] = [
  ['#0f2027', '#203a43'],
  ['#1a1a2e', '#16213e'],
  ['#0d1b2a', '#1b4f72'],
  ['#1b2838', '#2a475e'],
  ['#0f3460', '#533483'],
  ['#1b4332', '#2d6a4f'],
  ['#370617', '#6a040f'],
  ['#2c3e50', '#4a6074'],
  ['#1c1c1c', '#4a4e69'],
  ['#2b2d42', '#5c6bc0'],
  ['#1a1a1a', '#374151'],
  ['#0c1a2e', '#1e3a5f'],
];

interface NewsImageProps {
  src: string;
  seed?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'auto' | 'sync';
  fetchPriority?: 'high' | 'low' | 'auto';
  srcSet?: string;
  sizes?: string;
}

/**
 * wsrv.nl is a free proxy and occasionally takes 5–8 s for a single image.
 * If an image that is on screen still hasn't loaded after this long, switch
 * to our own /api/image proxy (the same fallback used when wsrv errors).
 */
const SLOW_IMAGE_MS = 6000;

export function NewsImage({
  src,
  seed = '',
  alt = '',
  className = '',
  style,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
  width,
  height,
  srcSet,
  sizes,
}: NewsImageProps) {
  const [displaySrc, setDisplaySrc] = useState(src);
  const [failed, setFailed] = useState(!src);
  const [didTryProxyFallback, setDidTryProxyFallback] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setDisplaySrc(src);
    setFailed(!src);
    setDidTryProxyFallback(false);
  }, [src]);

  const [c1, c2] = GRADIENTS[hashCode(seed || src) % GRADIENTS.length];

  const switchToProxy = useCallback((): boolean => {
    const proxyUrl = getImageProxyUrl(displaySrc);
    if (!proxyUrl || proxyUrl === displaySrc) return false;
    setDisplaySrc(proxyUrl);
    setDidTryProxyFallback(true);
    return true;
  }, [displaySrc]);

  // Slow-image watchdog: start the clock once the image is actually visible
  // (lazy images outside the viewport, or in a display:none layout, never start).
  useEffect(() => {
    const img = imgRef.current;
    if (!img || failed || didTryProxyFallback || !displaySrc.includes('wsrv.nl')) return;
    if (typeof IntersectionObserver === 'undefined') return;

    let timer: number | undefined;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      timer = window.setTimeout(() => {
        if (!img.complete) switchToProxy();
      }, SLOW_IMAGE_MS);
    });
    observer.observe(img);

    return () => {
      observer.disconnect();
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [displaySrc, failed, didTryProxyFallback, switchToProxy]);

  if (failed) {
    return (
      <img
        src={PLACEHOLDER_IMAGE_WEBP}
        alt={alt || 'Ilustrație știre'}
        className={className}
        style={style}
      />
    );
  }

  const handleError = () => {
    if (!didTryProxyFallback && switchToProxy()) return;
    setFailed(true);
  };

  return (
    <img
      ref={imgRef}
      src={displaySrc}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      decoding={decoding}
      width={width}
      height={height}
      // The wsrv.nl renditions in srcSet would win over the proxy URL in src.
      srcSet={didTryProxyFallback ? undefined : srcSet}
      sizes={didTryProxyFallback ? undefined : sizes}
      {...(fetchPriority ? { fetchPriority } : {})}
      onError={handleError}
    />
  );
}
