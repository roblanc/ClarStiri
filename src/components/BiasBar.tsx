import { useEffect, useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BiasBarProps {
  left: number;
  center: number;
  right: number;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'simple' | 'labeled';  // labeled = procente direct pe bara
}

const BIAS_TOOLTIP = (left: number, center: number, right: number) =>
  `Ponderea relatărilor despre această știre: ${left}% stânga (S), ${center}% centru (C), ${right}% dreapta (D). Fiecare relatare contează după scorul editorial al publicației, iar preluările aceluiași text de agenție contează o singură dată. Clasificarea se bazează pe orientarea publicației, nu pe conținutul articolului.`;

export function BiasBar({
  left,
  center,
  right,
  showLabels = false,
  size = 'md',
  variant = 'simple'
}: BiasBarProps) {
  const heights = {
    sm: 'h-2',
    md: 'h-5',
    lg: 'h-6',
    xl: 'h-7',
  };

  // Varianta cu procente direct pe bară: eticheta apare doar dacă încape în
  // lățimea reală a segmentului (măsurată), nu după un prag procentual fix.
  if (variant === 'labeled') {
    return <LabeledBiasBar left={left} center={center} right={right} size={size} />;
  }

  // Varianta simplă (fără text pe bară)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="w-full cursor-help"
          role="region"
          aria-label={BIAS_TOOLTIP(left, center, right)}
        >
          <div className={`bias-bar ${heights[size]}`}>
            {left > 0 && (
              <div
                className="bias-segment-left transition-all duration-300"
                style={{ width: `${left}%` }}
              />
            )}
            {center > 0 && (
              <div
                className="bias-segment-center transition-all duration-300"
                style={{ width: `${center}%` }}
              />
            )}
            {right > 0 && (
              <div
                className="bias-segment-right transition-all duration-300"
                style={{ width: `${right}%` }}
              />
            )}
          </div>
          {showLabels && (
            <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
              <span className="text-bias-left font-medium">S {left}%</span>
              <span className="text-bias-center font-medium">C {center}%</span>
              <span className="text-bias-right font-medium">D {right}%</span>
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">
        {BIAS_TOOLTIP(left, center, right)}
      </TooltipContent>
    </Tooltip>
  );
}

const LABELED_HEIGHTS = { sm: 'h-2', md: 'h-5', lg: 'h-6', xl: 'h-7' } as const;
const LABELED_TEXT = { sm: 'text-[8px]', md: 'text-[10px]', lg: 'text-xs', xl: 'text-sm' } as const;
const LABELED_FONT_PX = { sm: 8, md: 10, lg: 12, xl: 14 } as const;

const SEGMENTS = [
  { key: 'left', letter: 'S', name: 'Stânga', bg: 'bg-bias-left' },
  { key: 'center', letter: 'C', name: 'Centru', bg: 'bg-bias-center' },
  { key: 'right', letter: 'D', name: 'Dreapta', bg: 'bg-bias-right' },
] as const;

// Lățimea aproximativă a unei etichete (font 500, cifre tabulare) plus padding.
const labelWidth = (text: string, fontPx: number) => text.length * fontPx * 0.62 + 8;

function LabeledBiasBar({
  left,
  center,
  right,
  size,
}: {
  left: number;
  center: number;
  right: number;
  size: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    setBarWidth(el.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => setBarWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const values = { left, center, right };
  const fontPx = LABELED_FONT_PX[size];
  const segments = SEGMENTS.filter((seg) => values[seg.key] > 0).map((seg) => {
    const value = values[seg.key];
    const full = `${seg.letter} ${value}%`;
    const short = `${value}%`;
    // Până la prima măsurare folosim vechile praguri procentuale.
    const px = barWidth > 0 ? (barWidth * value) / 100 : null;
    const label =
      px === null
        ? value >= 18 ? full : value >= 13 ? short : null
        : px >= labelWidth(full, fontPx) ? full : px >= labelWidth(short, fontPx) ? short : null;
    return { ...seg, value, label };
  });

  // Barele mari (pagina știrii) nu ascund niciodată o valoare: dacă un segment
  // e prea îngust pentru etichetă, afișăm legenda completă sub bară.
  const showLegend = (size === 'lg' || size === 'xl') && segments.some((seg) => seg.label === null);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="w-full cursor-help"
          role="region"
          aria-label={BIAS_TOOLTIP(left, center, right)}
        >
          <div
            ref={barRef}
            className={`flex ${LABELED_HEIGHTS[size]} rounded overflow-hidden ${LABELED_TEXT[size]} font-medium tabular-nums`}
          >
            {segments.map((seg) => (
              <div
                key={seg.key}
                className={`${seg.bg} flex items-center justify-center text-white transition-all duration-300 overflow-hidden`}
                style={{ width: `${seg.value}%` }}
              >
                {seg.label && <span className="truncate px-0.5">{seg.label}</span>}
              </div>
            ))}
          </div>
          {showLegend && (
            <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground" aria-hidden="true">
              {segments.map((seg) => (
                <li key={seg.key} className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${seg.bg}`} />
                  <span>{seg.name}</span>
                  <span className="font-semibold tabular-nums text-foreground">{seg.value}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">
        {BIAS_TOOLTIP(left, center, right)}
      </TooltipContent>
    </Tooltip>
  );
}
