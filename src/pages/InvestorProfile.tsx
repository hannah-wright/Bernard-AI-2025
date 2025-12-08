/**
 * Investor Profile Page
 * 
 * Shows all deals for a specific investor/VC firm with filtering
 * by time period (current week, month, year, etc.)
 */

import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Building2, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  MapPin, 
  ExternalLink,
  ArrowLeft,
  Globe,
  Bell,
  BellRing,
  Sparkles,
  Lock,
} from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VCDeal, VCTier } from '@/types/startup';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { isPaidPlan, canAccessAlerts } from '@/config/billing';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Number of preview deals for free/trial users
const FREE_PREVIEW_LIMIT = 3;

// Time range options
const TIME_RANGES = [
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'this_year', label: 'This Year' },
  { value: 'last_year', label: 'Last Year' },
  { value: '2024', label: '2024' },
  { value: '2023', label: '2023' },
  { value: '2022', label: '2022' },
  { value: 'all', label: 'All Time' },
];

const tierColors: Record<VCTier, string> = {
  tier1: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  tier2: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  tier3: 'bg-gray-500/10 text-gray-600 border-gray-500/30',
};

const tierLabels: Record<VCTier, string> = {
  tier1: 'Top Tier',
  tier2: 'Major',
  tier3: 'Emerging',
};

// Fetch investor details
async function fetchInvestorInfo(investorName: string) {
  const { data, error } = await supabase
    .from('vc_firms')
    .select('*')
    .eq('name', investorName)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// Fetch all deals for an investor
async function fetchInvestorDeals(investorName: string): Promise<VCDeal[]> {
  const { data, error } = await supabase
    .from('vc_deals')
    .select('*')
    .eq('vc_firm', investorName)
    .order('deal_date', { ascending: false });

  if (error) throw error;
  
  return (data || []).map(d => ({
    id: d.id,
    vcFirm: d.vc_firm,
    vcTier: d.vc_tier as VCTier,
    startupName: d.startup_name,
    startupId: d.startup_id,
    dealType: d.deal_type,
    roundType: d.round_type,
    amount: d.amount,
    dealDate: d.deal_date,
    sector: d.sector,
    geography: d.geography,
    sourceUrl: d.source_url,
    sourceName: d.source_name,
  }));
}

const InvestorProfile = () => {
  const { investorName } = useParams<{ investorName: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [timeRange, setTimeRange] = useState<string>('this_year');

  const decodedName = decodeURIComponent(investorName || '');

  // Check access
  const hasFullAccess = isPaidPlan(profile?.subscription_tier);
  const canUseAlerts = canAccessAlerts(profile?.subscription_tier);

  const { data: investorInfo, isLoading: infoLoading } = useQuery({
    queryKey: ['investor-info', decodedName],
    queryFn: () => fetchInvestorInfo(decodedName),
    enabled: !!decodedName,
  });

  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['investor-deals', decodedName],
    queryFn: () => fetchInvestorDeals(decodedName),
    enabled: !!decodedName,
  });

  // Check if user has alerts enabled for this investor
  const { data: hasAlert = false } = useQuery({
    queryKey: ['investor-alert', user?.id, decodedName],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from('vc_deal_alerts')
        .select('id')
        .eq('user_id', user.id)
        .eq('firm', decodedName)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  // Toggle alert mutation
  const toggleAlert = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      if (hasAlert) {
        // Remove alert
        const { error } = await supabase
          .from('vc_deal_alerts')
          .delete()
          .eq('user_id', user.id)
          .eq('firm', decodedName);
        if (error) throw error;
        return { added: false };
      } else {
        // Add alert
        const { error } = await supabase
          .from('vc_deal_alerts')
          .insert({
            user_id: user.id,
            name: `${decodedName} Activity`,
            firm: decodedName,
            tier: 'all',
            sector: 'all',
            time_range: '30',
            email_alerts: true,
            frequency: 'daily',
          });
        if (error) throw error;
        return { added: true };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['investor-alert', user?.id, decodedName] });
      toast.success(result.added ? 'Alert enabled for this investor' : 'Alert removed');
    },
    onError: () => {
      toast.error('Failed to update alert');
    },
  });

  // Filter deals by time range
  const filteredDeals = useMemo(() => {
    const now = new Date();
    
    return deals.filter(deal => {
      const dealDate = new Date(deal.dealDate);
      
      switch (timeRange) {
        case 'this_week': {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          return dealDate >= weekStart;
        }
        case 'this_month': {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          return dealDate >= monthStart;
        }
        case 'this_year': {
          const yearStart = new Date(now.getFullYear(), 0, 1);
          return dealDate >= yearStart;
        }
        case 'last_year': {
          const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
          const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
          return dealDate >= lastYearStart && dealDate <= lastYearEnd;
        }
        case '2024':
        case '2023':
        case '2022': {
          const year = parseInt(timeRange);
          return dealDate.getFullYear() === year;
        }
        case 'all':
        default:
          return true;
      }
    });
  }, [deals, timeRange]);

  // Group deals by month/year
  const dealsByPeriod = useMemo(() => {
    const periods: Record<string, VCDeal[]> = {};
    filteredDeals.forEach(deal => {
      const date = new Date(deal.dealDate);
      const periodKey = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      if (!periods[periodKey]) periods[periodKey] = [];
      periods[periodKey].push(deal);
    });
    return periods;
  }, [filteredDeals]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalDeals = filteredDeals.length;
    const totalAmount = filteredDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
    const sectors = new Set<string>();
    filteredDeals.forEach(d => d.sector?.forEach(s => sectors.add(s)));
    const avgDealSize = totalDeals > 0 ? totalAmount / totalDeals : 0;
    
    return { totalDeals, totalAmount, sectors: sectors.size, avgDealSize };
  }, [filteredDeals]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isLoading = infoLoading || dealsLoading;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <div className="container mx-auto px-4 py-8">
          {/* Back button */}
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Investor Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-primary" />
                  {decodedName}
                  {investorInfo?.tier && (
                    <Badge className={tierColors[investorInfo.tier as VCTier]} variant="outline">
                      {tierLabels[investorInfo.tier as VCTier]}
                    </Badge>
                  )}
                </h1>
                {investorInfo?.focus_sectors && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {investorInfo.focus_sectors.map((sector: string) => (
                      <Badge key={sector} variant="secondary">{sector}</Badge>
                    ))}
                  </div>
                )}
                <p className="text-muted-foreground">
                  Investment activity and deal history
                </p>
              </div>

              {/* Alert Toggle */}
              {user && canUseAlerts && (
                <Button 
                  variant={hasAlert ? "secondary" : "outline"}
                  onClick={() => toggleAlert.mutate()}
                  disabled={toggleAlert.isPending}
                >
                  {hasAlert ? (
                    <>
                      <BellRing className="h-4 w-4 mr-2" />
                      Alerts On
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-2" />
                      Set Alert
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{stats.totalDeals}</p>
                <p className="text-sm text-muted-foreground">Deals</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
                <p className="text-sm text-muted-foreground">Total Invested</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{formatCurrency(stats.avgDealSize)}</p>
                <p className="text-sm text-muted-foreground">Avg Deal Size</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{stats.sectors}</p>
                <p className="text-sm text-muted-foreground">Sectors</p>
              </CardContent>
            </Card>
          </div>

          {/* Time Range Filter */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium">Filter by:</span>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGES.map(range => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Deals List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredDeals.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">No deals found</h3>
                <p className="text-sm text-muted-foreground">
                  No deals match the selected time period. Try a different filter.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(dealsByPeriod).map(([period, periodDeals]) => (
                <div key={period}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    {period}
                    <Badge variant="secondary">{periodDeals.length} deals</Badge>
                  </h3>
                  
                  <div className="space-y-3">
                    {(hasFullAccess ? periodDeals : periodDeals.slice(0, FREE_PREVIEW_LIMIT)).map(deal => (
                      <Card key={deal.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {deal.startupId ? (
                                  <Link 
                                    to={`/?search=${encodeURIComponent(deal.startupName)}`}
                                    className="font-semibold text-lg hover:text-primary transition-colors"
                                  >
                                    {deal.startupName}
                                  </Link>
                                ) : (
                                  <span className="font-semibold text-lg">{deal.startupName}</span>
                                )}
                                {deal.roundType && (
                                  <Badge variant="secondary">{deal.roundType}</Badge>
                                )}
                                {deal.dealType && (
                                  <Badge variant="outline" className="capitalize">
                                    {deal.dealType}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {formatDate(deal.dealDate)}
                                </div>
                                
                                {deal.sector && deal.sector.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    {deal.sector.join(', ')}
                                  </div>
                                )}
                                
                                {deal.geography && (
                                  <div className="flex items-center gap-1">
                                    <Globe className="h-3.5 w-3.5" />
                                    {deal.geography}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              {deal.amount && (
                                <div className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                                  {formatCurrency(deal.amount)}
                                </div>
                              )}
                              {deal.sourceUrl && (
                                <a 
                                  href={deal.sourceUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 justify-end mt-1"
                                >
                                  {deal.sourceName || 'Source'}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Show upgrade prompt for free users with more deals */}
                    {!hasFullAccess && periodDeals.length > FREE_PREVIEW_LIMIT && (
                      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
                        <CardContent className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Lock className="h-4 w-4 text-primary" />
                            <span className="font-medium">
                              +{periodDeals.length - FREE_PREVIEW_LIMIT} more deals
                            </span>
                          </div>
                          <Button onClick={() => navigate('/billing')} size="sm">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Upgrade to View All
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InvestorProfile;

