interface BiasBarProps {
  left: number;
  center: number;
  right: number;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function BiasBar({ left, center, right, showLabels = false, size = 'md' }: BiasBarProps) {
  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="w-full">
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
  );
}
