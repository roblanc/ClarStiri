import { cn } from "@/lib/utils";

interface CoverageBarProps {
  bias: { left: number; center: number; right: number };
  sourcesCount: number;
  className?: string;
}

export function CoverageBar({ bias, sourcesCount, className = '' }: CoverageBarProps) {
  const total = bias.left + bias.center + bias.right || 1;
  const pLeft = Math.round((bias.left / total) * 100);
  const pCenter = Math.round((bias.center / total) * 100);
  const pRight = Math.round((bias.right / total) * 100);

  return (
    <div className={cn("flex flex-col w-full gap-2", className)}>
      {/* Elegant thin bar without interior text */}
      <div className="flex h-1.5 sm:h-2 w-full rounded-full overflow-hidden bg-secondary/50 border border-border/5">
        {pLeft > 0 && (
          <div className="h-full transition-all duration-500 ease-in-out" style={{ width: `${pLeft}%`, backgroundColor: '#3b82f6' }} />
        )}
        {pCenter > 0 && (
          <div className="h-full transition-all duration-500 ease-in-out" style={{ width: `${pCenter}%`, backgroundColor: '#9ca3af' }} />
        )}
        {pRight > 0 && (
          <div className="h-full transition-all duration-500 ease-in-out" style={{ width: `${pRight}%`, backgroundColor: '#ef4444' }} />
        )}
      </div>

      {/* Legend & Count row underneath */}
      <div className="flex items-center justify-between font-bold tracking-tight w-full mt-0.5">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] sm:text-[11px] uppercase tracking-wide">
          {pLeft > 0 && <span className="text-blue-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />Stânga {pLeft}%</span>}
          {pCenter > 0 && <span className="text-muted-foreground flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />Centru {pCenter}%</span>}
          {pRight > 0 && <span className="text-red-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Dreapta {pRight}%</span>}
        </div>
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground/60 shrink-0 ml-2 mt-auto">
          {sourcesCount} SURSE
        </span>
      </div>
    </div>
  );
}
