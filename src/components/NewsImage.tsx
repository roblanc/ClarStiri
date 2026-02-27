import { useState } from 'react';
import { Newspaper } from 'lucide-react';

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
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'auto' | 'sync';
  fetchPriority?: 'high' | 'low' | 'auto';
}

export function NewsImage({
  src,
  seed = '',
  alt = '',
  className = '',
  style,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
}: NewsImageProps) {
  const [failed, setFailed] = useState(!src);

  const [c1, c2] = GRADIENTS[hashCode(seed || src) % GRADIENTS.length];

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ ...style, background: `linear-gradient(135deg, ${c1}, ${c2})` }}
      >
        <Newspaper
          style={{
            width: '28%',
            height: '28%',
            maxWidth: 52,
            maxHeight: 52,
            minWidth: 18,
            minHeight: 18,
            color: 'rgba(255,255,255,0.18)',
          }}
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      decoding={decoding}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(fetchPriority ? { fetchPriority } : {})}
      onError={() => setFailed(true)}
    />
  );
}
