/**
 * Predictive AI Tab Content for Startup Detail Dialog
 */

import { Trophy } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { methodologyText, DataLabel } from '../DataMethodologyTooltips';
import { ConfidenceBadge } from '../ConfidenceBadge';
import { SectionTitle, ScoreBadge } from './shared';
import type { StartupDetailTabProps } from './types';
import type { ConfidenceLevel } from '@/types/startup';

export const PredictiveTab = ({ startup }: StartupDetailTabProps) => {
  // Calculate highest confidence from data sources
  const highestConfidence = startup.dataSources.reduce((highest, source) => {
    const order: Record<ConfidenceLevel, number> = { verified: 4, high: 3, medium: 2, low: 1 };
    return order[source.confidence] > order[highest] ? source.confidence : highest;
  }, 'low' as ConfidenceLevel);

  const hasAiScores = startup.unicornProbability || startup.teamQualityScore || 
                       startup.productMarketFitScore || startup.investmentReadinessScore;

  return (
    <div className="space-y-6 mt-4">
      {/* AI Scores */}
      {hasAiScores && (
        <div>
          <SectionTitle tooltip="AI-generated scores based on analysis of public data. These are predictive estimates, not guarantees.">
            AI Scores
          </SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ScoreBadge 
              score={startup.unicornProbability} 
              label="Unicorn Prob." 
              tooltip={methodologyText.unicornProbability.detail} 
            />
            <ScoreBadge 
              score={startup.teamQualityScore} 
              label="Team Quality" 
              tooltip={methodologyText.teamQuality.detail} 
            />
            <ScoreBadge 
              score={startup.productMarketFitScore} 
              label="PMF Score" 
              tooltip={methodologyText.pmfScore.detail} 
            />
            <ScoreBadge 
              score={startup.investmentReadinessScore} 
              label="Investment Ready" 
              tooltip={methodologyText.investmentReadiness.detail} 
            />
          </div>
        </div>
      )}

      {/* Prior Exit Badge */}
      {startup.hasPriorExit && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-500">Founder with Successful Exit</span>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div>
        <SectionTitle tooltip="Metrics derived from public sources and AI analysis. Actual figures may vary.">
          Key Metrics
        </SectionTitle>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-secondary/30 p-3">
            <DataLabel 
              label="Revenue" 
              isEstimated={startup.metrics.revenueConfidence !== 'verified'} 
              tooltip={
                startup.metrics.revenueConfidence === 'verified'
                  ? `Verified: ${startup.metrics.revenueSource || 'Public disclosure'}`
                  : methodologyText.estimatedRevenue
              } 
            />
            <p className="font-medium text-foreground/80">
              {startup.metrics.estimatedRevenue || 'N/A'}
              {startup.metrics.revenueConfidence === 'verified' && (
                <span className="ml-1.5 text-xs text-green-600 dark:text-green-400">✓ Verified</span>
              )}
            </p>
          </div>
          <div className="rounded-lg bg-secondary/30 p-3">
            <DataLabel label="Team Size" isEstimated tooltip={methodologyText.estimatedSize} />
            <p className="font-medium text-foreground/80">{startup.metrics.estimatedSize || 'N/A'}</p>
          </div>
          <div className="rounded-lg bg-secondary/30 p-3">
            <DataLabel label="Buzz Score" isEstimated tooltip={methodologyText.buzzScore} />
            <p className="font-medium text-foreground/80">{startup.metrics.buzzScore}/100</p>
          </div>
        </div>
      </div>

      {/* Data Verification - Real Data from Hard-to-Find Sources */}
      <div>
        <SectionTitle>Real Data from Hard-to-Find Sources</SectionTitle>
        <div className="rounded-lg bg-gradient-to-br from-emerald-500/5 to-blue-500/5 border border-emerald-500/20 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <ConfidenceBadge level={highestConfidence} />
            <span className="text-sm font-medium">
              Cross-verified from {startup.dataSources.length} source{startup.dataSources.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Updated daily</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>50+ hard-to-find sources</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Founder success signals</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Filter by winning patterns</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground italic pt-2 border-t border-border/50">
            Real data that identifies winning startups — prior exits, team signals, and growth patterns that predict success.
          </p>
        </div>
      </div>
    </div>
  );
};

