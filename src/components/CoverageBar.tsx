interface CoverageBarProps {
  bias: { left: number; center: number; right: number };
  sourcesCount: number;
  className?: string;
}

const COLORS = {
  left: '#1d4ed8',
  center: '#64748b',
  right: '#dc2626',
} as const;

export function CoverageBar({ bias, sourcesCount, className = '' }: CoverageBarProps) {
  const total = bias.left + bias.center + bias.right || 1;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* Segmented bar */}
      <div className="flex h-1.5 rounded-full overflow-hidden bg-muted">
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
      <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide">
        <span style={{ color: COLORS.left }}>{bias.left}% Stânga</span>
        <span className="text-muted-foreground">·</span>
        <span style={{ color: COLORS.center }}>{bias.center}% Centru</span>
        <span className="text-muted-foreground">·</span>
        <span style={{ color: COLORS.right }}>{bias.right}% Dreapta</span>
        <span className="text-muted-foreground ml-auto">{sourcesCount} surse</span>
      </div>
    </div>
  );
}
