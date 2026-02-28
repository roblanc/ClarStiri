interface CoverageBarProps {
  bias: { left: number; center: number; right: number };
  sourcesCount: number;
  className?: string;
}

const COLORS = {
  left: '#3b82f6', // Brighter blue for dark background
  center: '#9ca3af', // Brighter gray
  right: '#ef4444', // Brighter red
} as const;

export function CoverageBar({ bias, sourcesCount, className = '' }: CoverageBarProps) {
  const total = bias.left + bias.center + bias.right || 1;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* Segmented bar */}
      <div className="flex h-1.5 rounded-full overflow-hidden bg-white/10">
        {bias.left > 0 && (
          <div
            className="h-full"
            style={{ width: `${(bias.left / total) * 100}%`, backgroundColor: COLORS.left }}
          />
        )}
        {bias.center > 0 && (
          <div
            className="h-full"
            style={{ width: `${(bias.center / total) * 100}%`, backgroundColor: COLORS.center }}
          />
        )}
        {bias.right > 0 && (
          <div
            className="h-full"
            style={{ width: `${(bias.right / total) * 100}%`, backgroundColor: COLORS.right }}
          />
        )}
      </div>

      {/* Labels row */}
      <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wide">
        <span style={{ color: COLORS.left }}>Stânga {bias.left}%</span>
        <span className="text-white/20">·</span>
        <span className="text-white/80">Centru {bias.center}%</span>
        <span className="text-white/20">·</span>
        <span style={{ color: COLORS.right }}>Dreapta {bias.right}%</span>
        <span className="text-white/40 ml-auto">{sourcesCount} surse</span>
      </div>
    </div>
  );
}
