import { useState } from 'react';
import { Heart, ExternalLink, MapPin, Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfidenceBadge } from './ConfidenceBadge';
import { Startup } from '@/types/startup';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface StartupCardProps {
  startup: Startup;
  onFavoriteToggle?: (id: string) => void;
}

const formatCurrency = (amount: number) => {
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`;
  }
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(0)}M`;
  }
  return `$${amount.toLocaleString()}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const StartupCard = ({ startup, onFavoriteToggle }: StartupCardProps) => {
  const [isFavorite, setIsFavorite] = useState(startup.isFavorite || false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    onFavoriteToggle?.(startup.id);
  };

  const highestConfidence = startup.dataSources.reduce((highest, source) => {
    const order = { verified: 4, high: 3, medium: 2, low: 1 };
    return order[source.confidence] > order[highest] ? source.confidence : highest;
  }, 'low' as const);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group relative rounded-lg border border-border bg-card p-5 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm cursor-pointer">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <span className="text-lg font-semibold text-foreground">
                  {startup.name.charAt(0)}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground truncate">{startup.name}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">
                    {startup.location.city}, {startup.location.country}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleFavoriteClick}
              className="p-1.5 rounded-md hover:bg-secondary transition-colors"
            >
              <Heart
                className={cn(
                  'h-4 w-4 transition-colors',
                  isFavorite ? 'fill-foreground text-foreground' : 'text-muted-foreground'
                )}
              />
            </button>
          </div>

          {/* Funding Info */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="font-medium">
              {startup.fundingRound.type}
            </Badge>
            <span className="text-lg font-semibold text-foreground">
              {formatCurrency(startup.fundingRound.amount)}
            </span>
            <ConfidenceBadge level={highestConfidence} showLabel={false} />
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {startup.eli5}
          </p>

          {/* Sectors */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {startup.sector.map((s) => (
              <Badge key={s} variant="outline" className="text-xs">
                {s}
              </Badge>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(startup.fundingRound.date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-xs font-medium">{startup.metrics.buzzScore}</span>
            </div>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-secondary flex items-center justify-center">
              <span className="text-2xl font-semibold text-foreground">
                {startup.name.charAt(0)}
              </span>
            </div>
            <div>
              <DialogTitle className="text-xl">{startup.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {startup.location.city}
                  {startup.location.state && `, ${startup.location.state}`}, {startup.location.country}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Funding Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-secondary/50 p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Funding Round</span>
              </div>
              <p className="text-2xl font-semibold">{formatCurrency(startup.fundingRound.amount)}</p>
              <Badge className="mt-2">{startup.fundingRound.type}</Badge>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">Lead Investors</span>
              </div>
              <div className="space-y-1">
                {startup.fundingRound.leadInvestors.map((investor) => (
                  <p key={investor} className="text-sm font-medium">{investor}</p>
                ))}
              </div>
            </div>
          </div>

          {/* ELI5 */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">What they do (ELI5)</h4>
            <p className="text-foreground">{startup.eli5}</p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Est. Revenue</p>
              <p className="font-medium">{startup.metrics.estimatedRevenue || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Est. Size</p>
              <p className="font-medium">{startup.metrics.estimatedSize || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Buzz Score</p>
              <p className="font-medium">{startup.metrics.buzzScore}/100</p>
            </div>
          </div>

          {/* Data Sources */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Data Sources</h4>
            <div className="flex flex-wrap gap-2">
              {startup.dataSources.map((source, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5"
                >
                  <span className="text-sm">{source.name}</span>
                  <ConfidenceBadge level={source.confidence} />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button className="flex-1" asChild>
              <a href={startup.website} target="_blank" rel="noopener noreferrer">
                Visit Website
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
            <Button
              variant={isFavorite ? 'secondary' : 'outline'}
              onClick={handleFavoriteClick}
            >
              <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
              {isFavorite ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
