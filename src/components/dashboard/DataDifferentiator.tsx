/**
 * Data Differentiator Component
 * 
 * Makes it crystal clear that BernardAI provides real, verified data.
 * Shows the real value of proprietary data sourcing vs generic AI tools.
 */

import { useState } from 'react';
import {
  Database,
  Search,
  Globe,
  FileText,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DataPointProps {
  label: string;
  bernardValue: string | boolean;
  genericAIValue: string;
  isBernardExclusive?: boolean;
  sourceCount?: number;
  lastUpdated?: string;
}

/**
 * Single data point comparison
 */
export const DataPointComparison = ({
  label,
  bernardValue,
  genericAIValue,
  isBernardExclusive = false,
  sourceCount,
  lastUpdated,
}: DataPointProps) => (
  <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/50 last:border-0">
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      {isBernardExclusive && (
        <Badge variant="outline" className="text-[10px] px-1 py-0 bg-primary/10 text-primary border-primary/30">
          Exclusive
        </Badge>
      )}
    </div>
    <div className="flex items-center gap-2">
      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
      <span className="text-sm font-medium">
        {typeof bernardValue === 'boolean' ? (bernardValue ? 'Yes' : 'No') : bernardValue}
      </span>
      {sourceCount && (
        <span className="text-[10px] text-muted-foreground">({sourceCount} sources)</span>
      )}
    </div>
    <div className="flex items-center gap-2">
      <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
      <span className="text-sm text-muted-foreground">{genericAIValue}</span>
    </div>
  </div>
);

/**
 * Badge showing data is verified from multiple sources
 */
export const MultiSourceBadge = ({ 
  count, 
  className = '' 
}: { 
  count: number; 
  className?: string;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="outline" 
          className={`text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 ${className}`}
        >
          <Database className="h-3 w-3 mr-1" />
          {count} sources
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">Cross-verified from {count} independent sources</p>
        <p className="text-xs text-muted-foreground mt-1">
          AI-powered analysis of real data from hard-to-find sources
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

/**
 * Badge showing data freshness
 */
export const FreshDataBadge = ({ 
  lastUpdated,
  className = '' 
}: { 
  lastUpdated: string;
  className?: string;
}) => {
  const date = new Date(lastUpdated);
  const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  const isRecent = daysAgo <= 7;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`text-xs ${isRecent ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' : 'bg-muted text-muted-foreground'} ${className}`}
          >
            <Clock className="h-3 w-3 mr-1" />
            {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">Data updated {date.toLocaleDateString()}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Continuously refreshed from 50+ sources
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Badge showing data from hard-to-find sources
 */
export const HardToFindDataBadge = ({ className = '' }: { className?: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="outline" 
          className={`text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 ${className}`}
        >
          <Search className="h-3 w-3 mr-1" />
          Hard-to-Find
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">Real Data from Hard-to-Find Sources</p>
        <p className="text-xs text-muted-foreground mt-1">
          Aggregated from 50+ sources that identify winning startups
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// Alias for backwards compatibility
export const ExclusiveDataBadge = HardToFindDataBadge;

/**
 * Why BernardAI banner - shows key differentiators
 */
export const WhyBernardAIBanner = ({ compact = false }: { compact?: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const differentiators = [
    {
      icon: Database,
      title: "50+ Hard-to-Find Sources",
      description: "Aggregates SEC filings, LinkedIn, news, and niche databases that typical tools don't access",
      whyItMatters: "Find startups before they hit mainstream radar",
    },
    {
      icon: Clock,
      title: "Updated Daily",
      description: "Live data on funding rounds, team changes, and company milestones",
      whyItMatters: "Always current — no stale information",
    },
    {
      icon: Users,
      title: "Founder Track Records",
      description: "Verified prior exits, acquisition details, and founder histories — signals that predict success",
      whyItMatters: "4-10x higher success rate with proven founders",
    },
    {
      icon: TrendingUp,
      title: "Winning Startup Criteria",
      description: "Filter by prior exits, FAANG alumni, team signal scores, and other success predictors",
      whyItMatters: "Focus on startups that match your investment thesis",
    },
    {
      icon: Shield,
      title: "Cross-Verified Data",
      description: "Revenue and team sizes verified across multiple sources with confidence scores",
      whyItMatters: "Trust the numbers you're seeing",
    },
    {
      icon: Search,
      title: "Hidden Gem Detection",
      description: "Scans IndieHackers, ProductHunt, patents, and niche sources to surface pre-hype opportunities",
      whyItMatters: "Discover startups competitors haven't found",
    },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Database className="h-3.5 w-3.5" />
        <span>Hard-to-find sources + specific criteria for success signals that other LLMs can't provide</span>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 hover:from-primary/10 hover:to-primary/10 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Real Data That Identifies Winning Startups</p>
              <p className="text-sm text-muted-foreground">
                Hard-to-find sources + specific criteria for success signals that other LLMs can't provide
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-border bg-card animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid md:grid-cols-2 gap-4">
            {differentiators.map((item, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-primary/10 h-fit">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{item.whyItMatters}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-emerald-900 dark:text-emerald-100">
                  Why This Matters for Deal Sourcing
                </p>
                <p className="text-emerald-800/80 dark:text-emerald-200/80 mt-1">
                  A founder with a prior $50M exit + growing engineering team = 4-10x higher success rate. 
                  We surface these signals so you can filter for winners before competitors see them.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Inline comparison callout for specific data points
 */
export const DataSourceCallout = ({
  dataType,
  sourceCount,
  isVerified = true,
}: {
  dataType: string;
  sourceCount: number;
  isVerified?: boolean;
}) => (
  <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
    {isVerified ? (
      <CheckCircle2 className="h-3 w-3 text-green-500" />
    ) : (
      <Info className="h-3 w-3" />
    )}
    <span>
      {dataType} verified from {sourceCount} source{sourceCount !== 1 ? 's' : ''}
    </span>
  </div>
);

