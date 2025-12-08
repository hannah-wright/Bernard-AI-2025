/**
 * Employee Growth Chart Component
 * 
 * Displays a line graph showing employee headcount trend
 * between last year and this year.
 */

import { TrendingUp, TrendingDown, Minus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EmployeeGrowthChartProps {
  currentCount: number;
  previousCount?: number;
  growthPercent?: number;
  linkedinUrl?: string;
  linkedinLastScraped?: string;
  className?: string;
}

export const EmployeeGrowthChart = ({
  currentCount,
  previousCount,
  growthPercent,
  linkedinLastScraped,
  className,
}: EmployeeGrowthChartProps) => {
  // Calculate growth if not provided but we have previous count
  const calculatedGrowth = growthPercent !== undefined 
    ? growthPercent 
    : previousCount 
      ? ((currentCount - previousCount) / previousCount) * 100 
      : undefined;

  // Calculate previous from growth if not provided
  const calculatedPrevious = previousCount 
    ? previousCount 
    : growthPercent !== undefined && growthPercent !== 0
      ? Math.round(currentCount / (1 + growthPercent / 100))
      : undefined;

  // Determine growth status
  const isGrowing = calculatedGrowth !== undefined && calculatedGrowth > 0;
  const isDecreasing = calculatedGrowth !== undefined && calculatedGrowth < 0;
  const isStable = calculatedGrowth !== undefined && calculatedGrowth === 0;
  
  // Line color based on growth
  const lineColor = isGrowing 
    ? '#10b981' // emerald-500
    : isDecreasing 
      ? '#ef4444' // red-500
      : '#94a3b8'; // slate-400

  // Format the last scraped date
  const lastScrapedText = linkedinLastScraped 
    ? new Date(linkedinLastScraped).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    : undefined;

  // Chart dimensions
  const chartWidth = 280;
  const chartHeight = 100;
  const padding = { top: 20, right: 40, bottom: 30, left: 50 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Data points for line
  const prevYear = new Date().getFullYear() - 1;
  const currYear = new Date().getFullYear();
  const prevCount = calculatedPrevious ?? currentCount;
  
  // Scale calculations
  const minCount = Math.min(prevCount, currentCount) * 0.9;
  const maxCount = Math.max(prevCount, currentCount) * 1.1;
  const range = maxCount - minCount || 1;
  
  const scaleY = (value: number) => 
    padding.top + innerHeight - ((value - minCount) / range) * innerHeight;
  
  const x1 = padding.left;
  const x2 = padding.left + innerWidth;
  const y1 = scaleY(prevCount);
  const y2 = scaleY(currentCount);

  // Create gradient fill area
  const areaPath = `
    M ${x1} ${y1}
    L ${x2} ${y2}
    L ${x2} ${padding.top + innerHeight}
    L ${x1} ${padding.top + innerHeight}
    Z
  `;

  return (
    <TooltipProvider>
      <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Employee Growth (YoY)</span>
          </div>
          
          {/* Growth Badge */}
          {calculatedGrowth !== undefined && (
            <Badge 
              variant="secondary" 
              className={cn(
                "flex items-center gap-1 font-semibold",
                isGrowing && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                isDecreasing && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                isStable && "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              )}
            >
              {isGrowing && <TrendingUp className="h-3 w-3" />}
              {isDecreasing && <TrendingDown className="h-3 w-3" />}
              {isStable && <Minus className="h-3 w-3" />}
              {isGrowing && '+'}
              {calculatedGrowth.toFixed(0)}%
            </Badge>
          )}
        </div>

        {/* Line Chart */}
        <div className="flex justify-center">
          <svg width={chartWidth} height={chartHeight} className="overflow-visible">
            {/* Gradient definition */}
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={lineColor} stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line 
              x1={padding.left} 
              y1={padding.top + innerHeight} 
              x2={padding.left + innerWidth} 
              y2={padding.top + innerHeight} 
              stroke="currentColor" 
              strokeOpacity="0.1"
            />
            <line 
              x1={padding.left} 
              y1={padding.top + innerHeight / 2} 
              x2={padding.left + innerWidth} 
              y2={padding.top + innerHeight / 2} 
              stroke="currentColor" 
              strokeOpacity="0.1"
              strokeDasharray="4,4"
            />

            {/* Area fill */}
            {calculatedPrevious !== undefined && (
              <path d={areaPath} fill="url(#areaGradient)" />
            )}

            {/* Line */}
            {calculatedPrevious !== undefined && (
              <line 
                x1={x1} 
                y1={y1} 
                x2={x2} 
                y2={y2} 
                stroke={lineColor}
                strokeWidth="3"
                strokeLinecap="round"
              />
            )}

            {/* Data points */}
            {calculatedPrevious !== undefined && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <circle 
                      cx={x1} 
                      cy={y1} 
                      r="6" 
                      fill="white" 
                      stroke={lineColor} 
                      strokeWidth="2"
                      className="cursor-pointer hover:r-8 transition-all"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{prevCount} employees</p>
                    <p className="text-xs text-muted-foreground">{prevYear}</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <circle 
                  cx={x2} 
                  cy={y2} 
                  r="6" 
                  fill={lineColor}
                  stroke="white" 
                  strokeWidth="2"
                  className="cursor-pointer hover:r-8 transition-all"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{currentCount} employees</p>
                <p className="text-xs text-muted-foreground">{currYear} (current)</p>
              </TooltipContent>
            </Tooltip>

            {/* X-axis labels */}
            <text 
              x={x1} 
              y={padding.top + innerHeight + 20} 
              textAnchor="middle" 
              className="fill-muted-foreground text-xs"
            >
              {prevYear}
            </text>
            <text 
              x={x2} 
              y={padding.top + innerHeight + 20} 
              textAnchor="middle" 
              className="fill-muted-foreground text-xs"
            >
              {currYear}
            </text>

            {/* Y-axis labels */}
            <text 
              x={padding.left - 8} 
              y={y1 + 4} 
              textAnchor="end" 
              className="fill-muted-foreground text-xs"
            >
              {prevCount}
            </text>
            <text 
              x={padding.left + innerWidth + 8} 
              y={y2 + 4} 
              textAnchor="start" 
              className="fill-foreground text-xs font-semibold"
            >
              {currentCount}
            </text>
          </svg>
        </div>

        {/* Footer with source */}
        <div className="flex items-center justify-between border-t border-border pt-3 mt-2">
          <span className="text-xs text-muted-foreground">
            Source: Company data
          </span>
          
          {lastScrapedText && (
            <span className="text-xs text-muted-foreground">
              Updated {lastScrapedText}
            </span>
          )}
        </div>

        {/* Growth context message */}
        {calculatedGrowth !== undefined && (
          <div className={cn("mt-3 text-xs rounded-md p-2", 
            isGrowing && "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300",
            isDecreasing && "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300",
            isStable && "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          )}>
            {calculatedGrowth >= 50 && "🚀 Extreme employee growth - hiring velocity signals strong momentum"}
            {calculatedGrowth >= 25 && calculatedGrowth < 50 && "📈 Strong employee growth - team scaling well"}
            {calculatedGrowth >= 10 && calculatedGrowth < 25 && "✅ Healthy employee growth - steady expansion"}
            {calculatedGrowth >= 0 && calculatedGrowth < 10 && "➡️ Stable headcount - focused team"}
            {calculatedGrowth < 0 && calculatedGrowth > -20 && "⚠️ Slight headcount contraction - possible restructuring"}
            {calculatedGrowth <= -20 && "🔻 Significant headcount contraction - due diligence recommended"}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

// Compact inline version for cards
export const EmployeeGrowthBadge = ({
  currentCount,
  growthPercent,
}: Pick<EmployeeGrowthChartProps, 'currentCount' | 'growthPercent'>) => {
  const isGrowing = growthPercent !== undefined && growthPercent > 0;
  const isDecreasing = growthPercent !== undefined && growthPercent < 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1.5 text-sm">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">{currentCount}</span>
            {growthPercent !== undefined && (
              <span className={cn(
                "text-xs font-semibold",
                isGrowing && "text-emerald-600 dark:text-emerald-400",
                isDecreasing && "text-red-600 dark:text-red-400"
              )}>
                ({isGrowing && '+'}{growthPercent.toFixed(0)}% YoY)
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {currentCount} employees
            {growthPercent !== undefined && ` (${isGrowing ? '+' : ''}${growthPercent.toFixed(0)}% YoY)`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
