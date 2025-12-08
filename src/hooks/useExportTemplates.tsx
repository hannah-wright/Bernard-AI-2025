/**
 * useExportTemplates Hook
 * 
 * Manages custom export templates for CSV exports.
 * Users can save, load, update, and delete export column configurations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ExportColumn {
  key: string;
  label: string;
  category: string;
  isEstimated?: boolean; // Will add "(Est)" to label
}

export interface ExportTemplate {
  id: string;
  name: string;
  description?: string;
  columns: string[]; // Array of column keys
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
}

// All available export columns organized by category
export const EXPORT_COLUMNS: ExportColumn[] = [
  // Basic Info
  { key: 'name', label: 'Name', category: 'Basic Info' },
  { key: 'website', label: 'Website', category: 'Basic Info' },
  { key: 'description', label: 'Description', category: 'Basic Info' },
  
  // Location
  { key: 'city', label: 'City', category: 'Location' },
  { key: 'state', label: 'State', category: 'Location' },
  { key: 'country', label: 'Country', category: 'Location' },
  { key: 'region', label: 'Region', category: 'Location' },
  
  // Business
  { key: 'sectors', label: 'Sectors', category: 'Business' },
  { key: 'businessModel', label: 'Business Model', category: 'Business' },
  { key: 'companyType', label: 'Company Type', category: 'Business' },
  { key: 'targetCustomer', label: 'Target Customer', category: 'Business' },
  
  // Current Funding
  { key: 'currentRound', label: 'Current Round', category: 'Funding' },
  { key: 'roundAmount', label: 'Round Amount', category: 'Funding' },
  { key: 'roundDate', label: 'Round Date', category: 'Funding' },
  { key: 'leadInvestors', label: 'Lead Investors', category: 'Funding' },
  { key: 'allInvestors', label: 'All Investors', category: 'Funding' },
  { key: 'totalRaised', label: 'Total Raised', category: 'Funding' },
  { key: 'fundingRoundsCount', label: 'Funding Rounds Count', category: 'Funding' },
  
  // Financials (Estimated)
  { key: 'revenue', label: 'Revenue', category: 'Financials', isEstimated: true },
  { key: 'revenueConfidence', label: 'Revenue Confidence', category: 'Financials' },
  { key: 'teamSize', label: 'Team Size', category: 'Financials', isEstimated: true },
  
  // Founder & Team Signals
  { key: 'founderType', label: 'Founder Type', category: 'Founder Signals' },
  { key: 'serialFounder', label: 'Serial Founder', category: 'Founder Signals' },
  { key: 'hasFaangAlumni', label: 'Has FAANG Alumni', category: 'Founder Signals' },
  { key: 'hasPriorExit', label: 'Has Prior Exit', category: 'Founder Signals' },
  { key: 'priorExitCount', label: 'Prior Exit Count', category: 'Founder Signals' },
  { key: 'priorExitDetails', label: 'Prior Exit Details', category: 'Founder Signals' },
  { key: 'hasPriorIPO', label: 'Has Prior IPO', category: 'Founder Signals' },
  { key: 'priorIPODetails', label: 'Prior IPO Details', category: 'Founder Signals' },
  
  // Team Structure
  { key: 'teamStructure', label: 'Team Structure', category: 'Team Signals' },
  { key: 'cofoundersWorkedTogether', label: 'Cofounders Worked Together', category: 'Team Signals' },
  { key: 'foundingTeamScore', label: 'Founding Team Signal Score', category: 'Team Signals' },
  
  // Hiring & Growth (Estimated)
  { key: 'currentHeadcount', label: 'Current Headcount', category: 'Hiring & Growth', isEstimated: true },
  { key: 'headcount6moAgo', label: 'Headcount 6mo Ago', category: 'Hiring & Growth', isEstimated: true },
  { key: 'headcountGrowthRate', label: 'Headcount Growth Rate', category: 'Hiring & Growth', isEstimated: true },
  { key: 'engineeringHeadcount', label: 'Engineering Headcount', category: 'Hiring & Growth', isEstimated: true },
  { key: 'hiringVelocityScore', label: 'Hiring Velocity Score', category: 'Hiring & Growth' },
  
  // Investor Quality
  { key: 'investorTrackRecord', label: 'Investor Track Record', category: 'Investors' },
  { key: 'notableInvestors', label: 'Notable Investors', category: 'Investors' },
  { key: 'leadInvestorExitRate', label: 'Lead Investor Exit Rate', category: 'Investors' },
  { key: 'investorsWithUnicornExits', label: 'Investors With Unicorn Exits', category: 'Investors' },
  
  // ML Scores
  { key: 'unicornScore', label: 'Unicorn Likelihood Score', category: 'ML Scores' },
  { key: 'is10xBet', label: 'Is 10x Bet', category: 'ML Scores' },
  { key: 'backerQualityScore', label: 'Backer Quality Score', category: 'ML Scores' },
  { key: 'backerHotStreak', label: 'Backer Hot Streak', category: 'ML Scores' },
  { key: 'hiddenGemScore', label: 'Hidden Gem Score', category: 'ML Scores' },
  { key: 'isHiddenGem', label: 'Is Hidden Gem', category: 'ML Scores' },
  
  // Other Signals
  { key: 'accelerator', label: 'Accelerator', category: 'Other Signals' },
  { key: 'buzzScore', label: 'Buzz Score', category: 'Other Signals' },
  { key: 'hasIndiePresence', label: 'Has Indie Presence', category: 'Other Signals' },
  { key: 'recentPatentFilings', label: 'Recent Patent Filings', category: 'Other Signals' },
  { key: 'hiringStreakWeeks', label: 'Hiring Streak (weeks)', category: 'Other Signals' },
  
  // Data Quality
  { key: 'dataSourcesCount', label: 'Data Sources Count', category: 'Data Quality' },
  { key: 'primaryDataSource', label: 'Primary Data Source', category: 'Data Quality' },
];

// Get columns grouped by category
export const getColumnsByCategory = (): Record<string, ExportColumn[]> => {
  return EXPORT_COLUMNS.reduce((acc, col) => {
    if (!acc[col.category]) {
      acc[col.category] = [];
    }
    acc[col.category].push(col);
    return acc;
  }, {} as Record<string, ExportColumn[]>);
};

// Default columns for quick export
export const DEFAULT_EXPORT_COLUMNS = [
  'name', 'website', 'city', 'country', 'sectors',
  'currentRound', 'roundAmount', 'leadInvestors', 'totalRaised',
  'revenue', 'teamSize', 'hasPriorExit', 'unicornScore', 'backerQualityScore'
];

export const useExportTemplates = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all templates for the user
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['exportTemplates', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('export_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        columns: t.columns as string[],
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        isDefault: t.is_default,
      })) as ExportTemplate[];
    },
    enabled: !!user,
  });

  // Create a new template
  const createTemplate = useMutation({
    mutationFn: async ({ name, description, columns, isDefault }: {
      name: string;
      description?: string;
      columns: string[];
      isDefault?: boolean;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // If setting as default, unset other defaults first
      if (isDefault) {
        await supabase
          .from('export_templates')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('export_templates')
        .insert({
          user_id: user.id,
          name,
          description,
          columns,
          is_default: isDefault || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exportTemplates', user?.id] });
      toast.success('Export template saved');
    },
    onError: (error: Error) => {
      toast.error('Failed to save template', { description: error.message });
    },
  });

  // Update an existing template
  const updateTemplate = useMutation({
    mutationFn: async ({ id, name, description, columns, isDefault }: {
      id: string;
      name?: string;
      description?: string;
      columns?: string[];
      isDefault?: boolean;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // If setting as default, unset other defaults first
      if (isDefault) {
        await supabase
          .from('export_templates')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (columns !== undefined) updates.columns = columns;
      if (isDefault !== undefined) updates.is_default = isDefault;

      const { data, error } = await supabase
        .from('export_templates')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exportTemplates', user?.id] });
      toast.success('Export template updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update template', { description: error.message });
    },
  });

  // Delete a template
  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('export_templates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exportTemplates', user?.id] });
      toast.success('Export template deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete template', { description: error.message });
    },
  });

  // Get the default template
  const defaultTemplate = templates.find(t => t.isDefault);

  return {
    templates,
    isLoading,
    defaultTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
};



