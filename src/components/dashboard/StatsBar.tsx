import { Building2, DollarSign, TrendingUp, Zap, Database, RefreshCw } from 'lucide-react';
import { stats } from '@/data/mockStartups';

const formatCurrency = (amount: number) => {
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`;
  }
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(0)}M`;
  }
  return `$${amount.toLocaleString()}`;
};

export const StatsBar = () => {
  const statItems = [
    {
      icon: Building2,
      label: 'New startups',
      value: stats.newStartups.toString(),
      change: stats.newStartupsChange,
    },
    {
      icon: DollarSign,
      label: 'Total raised',
      value: formatCurrency(stats.totalRaised),
      change: stats.totalRaisedChange,
    },
    {
      icon: Database,
      label: 'Niche data sources',
      value: 'Many',
      subtext: 'Verified daily',
    },
    {
      icon: RefreshCw,
      label: 'Updated',
      value: 'Daily',
      subtext: 'Live signals',
    },
  ];

  return (
    <div className="border-y border-border bg-surface-elevated">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          {statItems.map((stat, index) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 px-4 py-4 md:px-6 md:py-5"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <stat.icon className="h-5 w-5 text-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                <p className="text-lg font-semibold text-foreground truncate">{stat.value}</p>
                {stat.change && (
                  <p className="text-xs text-success">{stat.change}</p>
                )}
                {stat.subtext && (
                  <p className="text-xs text-muted-foreground">{stat.subtext}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
