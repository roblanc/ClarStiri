import { cn } from "@/lib/utils";

interface CoverageBarProps {
  bias: { left: number; center: number; right: number };
  sourcesCount: number;
  className?: string;
}

export function CoverageBar({ bias, sourcesCount, className = '' }: CoverageBarProps) {
  const total = bias.left + bias.center + bias.right || 1;
  const pLeft   = Math.round((bias.left   / total) * 100);
  const pCenter = Math.round((bias.center / total) * 100);
  const pRight  = Math.round((bias.right  / total) * 100);

  // flex proporțional, dar niciun segment vizibil nu coboară sub 2.6rem
  // astfel încât label + procent să fie mereu lizibile
  const seg = (pct: number): React.CSSProperties => ({
    flexGrow: pct,
    flexShrink: 0,
    minWidth: '2.6rem',
  });

  return (
    <div className={cn("flex h-8 sm:h-9 w-full rounded-[6px] shadow-sm border border-border/20", className)}>

      {pLeft > 0 && (
        <div
          className="flex flex-col items-center justify-center bg-[#28508a] text-white overflow-hidden"
          style={seg(pLeft)}
        >
          <span className="text-[7px] sm:text-[8px] uppercase tracking-[0.08em] font-bold text-white/80 leading-none mb-[2px] whitespace-nowrap">
            Stânga
          </span>
          <span className="text-[10px] sm:text-[11px] font-black leading-none whitespace-nowrap">
            {pLeft}%
          </span>
        </div>
      )}

      {pCenter > 0 && (
        <div
          className="flex flex-col items-center justify-center bg-white dark:bg-[#e2e8f0] text-[#1f2937] dark:text-[#0f172a] border-x border-border/10 overflow-hidden"
          style={seg(pCenter)}
        >
          <span className="text-[7px] sm:text-[8px] uppercase tracking-[0.08em] font-bold text-[#1f2937]/60 dark:text-[#0f172a]/60 leading-none mb-[2px] whitespace-nowrap">
            Centru
          </span>
          <span className="text-[10px] sm:text-[11px] font-black leading-none whitespace-nowrap">
            {pCenter}%
          </span>
        </div>
      )}

      {pRight > 0 && (
        <div
          className="flex flex-col items-center justify-center bg-[#822727] text-white overflow-hidden"
          style={seg(pRight)}
        >
          <span className="text-[7px] sm:text-[8px] uppercase tracking-[0.08em] font-bold text-white/80 leading-none mb-[2px] whitespace-nowrap">
            Dreapta
          </span>
          <span className="text-[10px] sm:text-[11px] font-black leading-none whitespace-nowrap">
            {pRight}%
          </span>
        </div>
      )}

    </div>
  );
}
