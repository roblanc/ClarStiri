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
      {/* Aesthetic Spaced Full Labels Row ABOVE the bar */}
      <div className="flex justify-between items-end w-full mb-1 sm:mb-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-tight">
        <div className="flex-1 flex justify-start">
          {pLeft > 0 && <span className="text-[#1d4ed8]">Stânga {pLeft}%</span>}
        </div>
        <div className="flex-1 flex justify-center">
          {pCenter > 0 && <span className="text-gray-500">Centru {pCenter}%</span>}
        </div>
        <div className="flex-1 flex justify-end">
          {pRight > 0 && <span className="text-[#7f1d1d]">Dreapta {pRight}%</span>}
        </div>
      </div>

      {/* Ground-News Solid Clean Bar */}
      <div className="flex h-2.5 sm:h-3 w-full rounded-[3px] overflow-hidden shadow-sm border border-border/20">
        {pLeft > 0 && <div className="h-full bg-[#1d4ed8] transition-all duration-500" style={{ width: `${pLeft}%` }} />}
        {pCenter > 0 && <div className="h-full bg-white dark:bg-[#e2e8f0] transition-all duration-500" style={{ width: `${pCenter}%` }} />}
        {pRight > 0 && <div className="h-full bg-[#7f1d1d] transition-all duration-500" style={{ width: `${pRight}%` }} />}
      </div>

      {/* Information Row (Sources Count) */}
      <div className="flex justify-end mt-1.5 w-full">
        <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/60">
          {sourcesCount} SURSE
        </span>
      </div>
    </div>
  );
}
