interface CoverageBarProps {
  bias: { left: number; center: number; right: number };
  sourcesCount: number;
  className?: string;
}

const COLORS = {
  left: '#1e40af', // Darker blue
  center: '#4b5563', // Darker gray
  right: '#b91c1c', // Darker red
} as const;

export function CoverageBar({ bias, sourcesCount, className = '' }: CoverageBarProps) {
  const total = bias.left + bias.center + bias.right || 1;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* Segmented bar */}
      <div className="flex h-1.5 rounded-full overflow-hidden bg-black/10">
        {bias.left > 0 && (
          <div
            className="h-full"
            style={{ width: `${(bias.left / total) * 100}%`, backgroundColor: COLORS.left }}
          />
        )}
        {bias.center > 0 && (
          <div
            className="h-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]"
            style={{ width: `${(bias.center / total) * 100}%`, backgroundColor: COLORS.center === '#4b5563' ? '#9ca3af' : COLORS.center }}
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
      <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-wide">
        <span style={{ color: COLORS.left }}>STÂNGA {bias.left}%</span>
        <span className="text-black/30">·</span>
        <span className="text-black/80">CENTRU {bias.center}%</span>
        <span className="text-black/30">·</span>
        <span style={{ color: COLORS.right }}>DREAPTA {bias.right}%</span>
        <span className="text-black/60 ml-auto">{sourcesCount} SURSE</span>
      </div>
    </div>
  );
}
