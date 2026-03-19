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


  const renderSegment = (percentage: number, label: string, bgClass: string, textClass: string, subtitleClass: string) => {
    if (percentage <= 0) return null;
    return (
      <div className={`h-full ${bgClass} transition-all duration-500 flex items-center justify-center overflow-hidden`} style={{ width: `${percentage}%` }}>
        {percentage >= 18 ? (
          <div className={`flex flex-col items-center justify-center leading-none whitespace-nowrap px-1 ${textClass}`}>
            <span className={`text-[7px] sm:text-[8px] uppercase tracking-[0.1em] font-bold mb-0.5 ${subtitleClass}`}>{label}</span>
            <span className="text-[11px] sm:text-[12px] font-black tracking-tight">{percentage}%</span>
          </div>
        ) : percentage >= 8 ? (
          <span className={`text-[10px] sm:text-[11px] font-bold whitespace-nowrap ${textClass}`}>{percentage}%</span>
        ) : null}
      </div>
    );
  };

  return (
    <div className={cn("flex h-8 sm:h-9 w-full rounded-[6px] overflow-hidden shadow-sm border border-border/20", className)}>
      {renderSegment(pLeft, "Stânga", "bg-[#28508a]", "text-white", "text-white/80")}
      {renderSegment(pCenter, "Centru", "bg-white dark:bg-[#e2e8f0] border-x border-border/10", "text-[#1f2937] dark:text-[#0f172a]", "text-[#1f2937]/70 dark:text-[#0f172a]/70")}
      {renderSegment(pRight, "Dreapta", "bg-[#822727]", "text-white", "text-white/80")}
    </div>
  );
}
