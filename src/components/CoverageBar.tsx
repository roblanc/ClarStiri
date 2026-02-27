interface CoverageBarProps {
  bias: { left: number; center: number; right: number };
  sourcesCount: number;
  className?: string;
}

function getDominant(bias: { left: number; center: number; right: number }) {
  const max = Math.max(bias.left, bias.center, bias.right);
  if (bias.left === max) return 'left' as const;
  if (bias.right === max) return 'right' as const;
  return 'center' as const;
}

const CONFIG = {
  left:   { label: 'Stânga',  bar: '#1d4ed8', track: '#dbeafe', text: '#1d4ed8' },
  center: { label: 'Centru',  bar: '#64748b', track: '#e2e8f0', text: '#64748b' },
  right:  { label: 'Dreapta', bar: '#dc2626', track: '#fee2e2', text: '#dc2626' },
} as const;

export function CoverageBar({ bias, sourcesCount, className = '' }: CoverageBarProps) {
  const dominant = getDominant(bias);
  const { label, bar, track, text } = CONFIG[dominant];
  const pct = bias[dominant];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: track }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: bar }} />
      </div>
      <span className="text-[11px] font-semibold whitespace-nowrap" style={{ color: text }}>
        {pct}% {label}
      </span>
      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
        · {sourcesCount} surse
      </span>
    </div>
  );
}
