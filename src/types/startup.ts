export type RoundType = 'Pre-Seed' | 'Seed' | 'Series A' | 'Series B' | 'Series C' | 'Series D+';

export type Sector = 
  | 'AI/ML' 
  | 'Fintech' 
  | 'Healthcare' 
  | 'SaaS' 
  | 'E-commerce' 
  | 'Biotech' 
  | 'Climate Tech'
  | 'Enterprise'
  | 'Consumer';

export type ConfidenceLevel = 'verified' | 'high' | 'medium' | 'low';

export interface DataSource {
  name: string;
  confidence: ConfidenceLevel;
  url?: string;
}

export interface Startup {
  id: string;
  name: string;
  logo?: string;
  description: string;
  eli5: string;
  website: string;
  sector: Sector[];
  location: {
    city: string;
    state?: string;
    country: string;
  };
  fundingRound: {
    type: RoundType;
    amount: number;
    date: string;
    leadInvestors: string[];
  };
  metrics: {
    estimatedRevenue?: string;
    estimatedSize?: string;
    buzzScore: number;
  };
  dataSources: DataSource[];
  isFavorite?: boolean;
  notes?: string;
}

export interface FilterState {
  dateRange: string;
  fundingMin?: number;
  fundingMax?: number;
  roundTypes: RoundType[];
  sectors: Sector[];
  location: string;
}
