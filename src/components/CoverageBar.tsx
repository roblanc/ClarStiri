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
      <div className="flex h-7 sm:h-8 w-full rounded-[4px] overflow-hidden shadow-sm border border-border/20 text-[10px] sm:text-[11px] font-bold tracking-wide">
        {pLeft > 0 && (
          <div className="h-full bg-[#28508a] transition-all duration-500 flex items-center justify-center overflow-hidden" style={{ width: `${pLeft}%` }}>
            {pLeft >= 12 && <span className="text-white whitespace-nowrap pl-1">S {pLeft}%</span>}
          </div>
        )}
        {pCenter > 0 && (
          <div className="h-full bg-white dark:bg-[#e2e8f0] transition-all duration-500 flex items-center justify-center overflow-hidden" style={{ width: `${pCenter}%` }}>
            {pCenter >= 12 && <span className="text-[#1f2937] whitespace-nowrap px-1">C {pCenter}%</span>}
          </div>
        )}
        {pRight > 0 && (
          <div className="h-full bg-[#822727] transition-all duration-500 flex items-center justify-center overflow-hidden" style={{ width: `${pRight}%` }}>
            {pRight >= 12 && <span className="text-white whitespace-nowrap pr-1">D {pRight}%</span>}
          </div>
        )}
      </div>
    </div>
  );
}
