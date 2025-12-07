/**
 * Value Dashboard Component
 * 
 * Displays the value BernardAI has created for the user.
 * Designed to demonstrate ROI and reinforce the value of paid plans.
 */

import { useState, useEffect, useMemo } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Clock,
  Target,
  TrendingUp,
  Sparkles,
  DollarSign,
  Eye,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface UserStats {
  startupsViewed: number;
  listsCreated: number;
  savedFilters: number;
  alertsSet: number;
  daysActive: number;
}

// Average time an analyst spends researching one startup manually
const MINUTES_PER_MANUAL_RESEARCH = 45;
// Average analyst hourly rate
const ANALYST_HOURLY_RATE = 75;
// Average potential deal value for VC
const AVG_DEAL_VALUE = 2000000;

export const ValueDashboard = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [stats, setStats] = useState<UserStats>({
    startupsViewed: 0,
    listsCreated: 0,
    savedFilters: 0,
    alertsSet: 0,
    daysActive: 1,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Get credit transactions to count startups viewed
        const { data: transactions } = await supabase
          .from('credit_transactions')
          .select('created_at')
          .eq('user_id', user.id)
          .eq('type', 'usage');

        // Get lists created
        const { count: listsCount } = await supabase
          .from('startup_lists')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Get saved filters
        const { count: filtersCount } = await supabase
          .from('user_thesis_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Get alerts
        const { count: alertsCount } = await supabase
          .from('user_alerts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Calculate days active
        const createdAt = profile?.created_at ? new Date(profile.created_at) : new Date();
        const daysActive = Math.max(1, Math.ceil((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));

        setStats({
          startupsViewed: transactions?.length || 0,
          listsCreated: listsCount || 0,
          savedFilters: filtersCount || 0,
          alertsSet: alertsCount || 0,
          daysActive,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user, profile]);

  // Calculate value metrics
  const valueMetrics = useMemo(() => {
    const timeSavedMinutes = stats.startupsViewed * MINUTES_PER_MANUAL_RESEARCH;
    const timeSavedHours = Math.round(timeSavedMinutes / 60);
    const moneySaved = Math.round((timeSavedMinutes / 60) * ANALYST_HOURLY_RATE);
    const dailyRate = stats.daysActive > 0 ? Math.round(stats.startupsViewed / stats.daysActive) : 0;
    
    // Estimate potential deal discovery value (very rough estimate for motivation)
    // Assume 1 in 50 viewed startups could become a deal
    const potentialDeals = Math.max(1, Math.round(stats.startupsViewed / 50));
    const potentialValue = potentialDeals * AVG_DEAL_VALUE;

    return {
      timeSavedHours,
      moneySaved,
      dailyRate,
      potentialDeals,
      potentialValue,
    };
  }, [stats]);

  if (!user || isLoading) return null;

  // Don't show if no activity yet
  if (stats.startupsViewed === 0 && stats.listsCreated === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Collapsed view - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full"
      >
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Your BernardAI Impact</p>
                  <p className="text-lg font-bold text-foreground">
                    {valueMetrics.timeSavedHours}+ hours saved
                  </p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-6 border-l border-border pl-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{stats.startupsViewed}</span>
                        <span className="text-sm text-muted-foreground">startups analyzed</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Detailed startup profiles viewed with AI intelligence</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          ${valueMetrics.moneySaved.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">analyst cost saved</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Based on ${ANALYST_HOURLY_RATE}/hr analyst rate × {MINUTES_PER_MANUAL_RESEARCH} min per startup</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:flex bg-primary/5 text-primary border-primary/30">
                {valueMetrics.dailyRate} startups/day avg
              </Badge>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Expanded view */}
      {isExpanded && (
        <div className="mt-2 bg-card border rounded-xl p-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Time Saved */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Time Saved</span>
              </div>
              <p className="text-3xl font-bold">{valueMetrics.timeSavedHours}h</p>
              <p className="text-xs text-muted-foreground">
                vs. manual research
              </p>
            </div>

            {/* Money Saved */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Cost Saved</span>
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                ${valueMetrics.moneySaved.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                analyst equivalent
              </p>
            </div>

            {/* Deal Pipeline */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">Pipeline Built</span>
              </div>
              <p className="text-3xl font-bold">{stats.startupsViewed}</p>
              <p className="text-xs text-muted-foreground">
                startups in your funnel
              </p>
            </div>

            {/* AI Insights */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">AI Insights</span>
              </div>
              <p className="text-3xl font-bold">{stats.startupsViewed * 15}+</p>
              <p className="text-xs text-muted-foreground">
                data points enriched
              </p>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>{stats.listsCreated}</strong> lists created
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>{stats.savedFilters}</strong> saved filters
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>{stats.alertsSet}</strong> active alerts
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>{stats.daysActive}</strong> days active
                </span>
              </div>
            </div>
          </div>

          {/* Potential Value Callout */}
          {valueMetrics.potentialDeals >= 1 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-100">
                    Potential deal flow value: ${(valueMetrics.potentialValue / 1000000).toFixed(1)}M+
                  </p>
                  <p className="text-sm text-amber-800/80 dark:text-amber-200/80 mt-1">
                    Based on {stats.startupsViewed} startups reviewed, statistically ~{valueMetrics.potentialDeals} could become 
                    investment opportunities. One successful deal can return 10-100x your BernardAI subscription.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

