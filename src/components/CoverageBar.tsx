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
    <div className={cn("flex flex-col w-full", className)}>
      {/* Ground-News Style Bar */}
      <div className="flex h-[22px] w-full text-[10px] sm:text-[11px] font-bold tracking-tight rounded-[3px] overflow-hidden shadow-sm border border-border/20">
        {pLeft > 0 && (
          <div
            className={cn("h-full flex items-center px-1.5 overflow-hidden text-white transition-all", pLeft >= pRight && pLeft >= pCenter ? 'justify-center' : 'justify-start')}
            style={{ width: `${pLeft}%`, backgroundColor: '#1d4ed8' }} // Ground News Blue
          >
            {(pLeft > 10) && <span className="truncate">S {pLeft}%</span>}
          </div>
        )}
        {pCenter > 0 && (
          <div
            className="h-full flex items-center justify-center px-1.5 text-black overflow-hidden transition-all"
            style={{ width: `${pCenter}%`, backgroundColor: '#ffffff' }} // Ground News White
          >
            {(pCenter > 10) && <span className="truncate">C {pCenter}%</span>}
          </div>
        )}
        {pRight > 0 && (
          <div
            className={cn("h-full flex items-center px-1.5 overflow-hidden text-white transition-all", pRight >= pLeft && pRight >= pCenter ? 'justify-center' : 'justify-end')}
            style={{ width: `${pRight}%`, backgroundColor: '#7f1d1d' }} // Ground News Dark Red
          >
            {(pRight > 10) && <span className="truncate">D {pRight}%</span>}
          </div>
        )}
      </div>

      {/* Sources Count */}
      <div className="flex justify-end mt-1.5">
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
          {sourcesCount} SURSE
        </span>
      </div>
    </div>
  );
}
