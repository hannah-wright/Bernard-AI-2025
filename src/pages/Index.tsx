import { useState, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Hero } from '@/components/dashboard/Hero';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { FilterSidebar } from '@/components/dashboard/FilterSidebar';
import { StartupGrid } from '@/components/dashboard/StartupGrid';
import { mockStartups } from '@/data/mockStartups';
import { FilterState } from '@/types/startup';

const Index = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: '30',
    fundingMin: undefined,
    fundingMax: undefined,
    roundTypes: [],
    sectors: [],
    location: '',
  });

  const scrollToDashboard = () => {
    dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero onStartScouting={scrollToDashboard} />
        <StatsBar />
        
        <div ref={dashboardRef} className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <FilterSidebar filters={filters} onFiltersChange={setFilters} />
            <StartupGrid startups={mockStartups} filters={filters} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
