import { cn } from '@/lib/utils';
import { ConfidenceLevel } from '@/types/startup';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  showLabel?: boolean;
  className?: string;
}

const confidenceConfig: Record<
  ConfidenceLevel,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  verified: {
    label: 'Verified',
    icon: CheckCircle2,
    className: 'text-success bg-success/10',
  },
  high: {
    label: 'High',
    icon: CheckCircle2,
    className: 'text-success bg-success/10',
  },
  medium: {
    label: 'Medium',
    icon: AlertCircle,
    className: 'text-warning bg-warning/10',
  },
  low: {
    label: 'Low',
    icon: HelpCircle,
    className: 'text-muted-foreground bg-muted',
  },
};

export const ConfidenceBadge = ({
  level,
  showLabel = true,
  className,
}: ConfidenceBadgeProps) => {
  const config = confidenceConfig[level];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {showLabel && config.label}
    </span>
  );
};
