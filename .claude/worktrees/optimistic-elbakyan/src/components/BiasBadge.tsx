import { cn } from "@/lib/utils";

type BiasType = 'left' | 'center' | 'right';

interface BiasBadgeProps {
  type: BiasType;
  label?: string;
  className?: string;
}

const biasConfig = {
  left: {
    label: 'Punct Orbit Stânga',
    className: 'bg-badge-left text-badge-left-foreground',
  },
  center: {
    label: 'Centru',
    className: 'bg-badge-center text-badge-center-foreground',
  },
  right: {
    label: 'Punct Orbit Dreapta',
    className: 'bg-badge-right text-badge-right-foreground',
  },
};

export function BiasBadge({ type, label, className }: BiasBadgeProps) {
  const config = biasConfig[type];
  
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
      config.className,
      className
    )}>
      {label || config.label}
    </span>
  );
}
