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

  // flex-grow proporțional cu procentul, dar garantăm minWidth
  // pentru ca label-ul + procentul să fie mereu lizibile
  const seg = (pct: number): React.CSSProperties => ({
    flexGrow: pct,
    flexShrink: 0,
    minWidth: pct > 0 ? '2.6rem' : 0,
  });

  return (
    <div className={cn("flex flex-col w-full rounded-[6px] overflow-hidden shadow-sm border border-border/20", className)}>

      {/* Bara proporțională — fără text, doar culori */}
      <div className="flex w-full h-[5px]">
        {pLeft   > 0 && <div className="h-full bg-[#28508a] transition-all duration-500" style={{ flex: pLeft }} />}
        {pCenter > 0 && <div className="h-full bg-white dark:bg-[#e2e8f0] border-x border-border/10 transition-all duration-500" style={{ flex: pCenter }} />}
        {pRight  > 0 && <div className="h-full bg-[#822727] transition-all duration-500" style={{ flex: pRight }} />}
      </div>

      {/* Rând label-uri — mereu vizibil indiferent de lățimea segmentului */}
      <div className="flex w-full">
        {pLeft > 0 && (
          <div
            className="flex flex-col items-center justify-center py-[5px] bg-[#28508a] text-white"
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
            className="flex flex-col items-center justify-center py-[5px] bg-white dark:bg-[#e2e8f0] text-[#1f2937] dark:text-[#0f172a]"
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
            className="flex flex-col items-center justify-center py-[5px] bg-[#822727] text-white"
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

    </div>
  );
}
