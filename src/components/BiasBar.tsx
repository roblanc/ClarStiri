interface BiasBarProps {
  left: number;
  center: number;
  right: number;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'simple' | 'labeled';  // labeled = procente direct pe bara
}

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

  const textSizes = {
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  // Varianta cu procente direct pe bară
  if (variant === 'labeled') {
    return (
      <div className="w-full">
        <div className={`flex ${heights[size]} rounded overflow-hidden ${textSizes[size]} font-medium`}>
          {left > 0 && (
            <div
              className="bg-bias-left flex items-center justify-center text-white transition-all duration-300"
              style={{ width: `${left}%` }}
            >
              {left >= 15 && `S ${left}%`}
            </div>
          )}
          {center > 0 && (
            <div
              className="bg-bias-center flex items-center justify-center text-white transition-all duration-300"
              style={{ width: `${center}%` }}
            >
              {center >= 15 && `C ${center}%`}
            </div>
          )}
          {right > 0 && (
            <div
              className="bg-bias-right flex items-center justify-center text-white transition-all duration-300"
              style={{ width: `${right}%` }}
            >
              {right >= 15 && `D ${right}%`}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Varianta simplă (fără text pe bară)
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
