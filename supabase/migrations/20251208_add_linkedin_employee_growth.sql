-- Migration: Add LinkedIn employee growth tracking
-- This adds fields to track YoY employee growth from LinkedIn

-- Add new columns to startups table
ALTER TABLE public.startups 
ADD COLUMN IF NOT EXISTS headcount_1_year_ago INTEGER,
ADD COLUMN IF NOT EXISTS employee_growth_yoy_percent NUMERIC,
ADD COLUMN IF NOT EXISTS linkedin_company_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_last_scraped TIMESTAMPTZ;

-- Add index for LinkedIn URL to avoid duplicate scrapes
CREATE INDEX IF NOT EXISTS idx_startups_linkedin_url ON public.startups (linkedin_company_url);

-- Add index for finding startups that need LinkedIn scraping
CREATE INDEX IF NOT EXISTS idx_startups_linkedin_needs_scrape ON public.startups (linkedin_last_scraped)
WHERE linkedin_company_url IS NOT NULL;

COMMENT ON COLUMN public.startups.headcount_1_year_ago IS 'Employee count from approximately 1 year ago, from LinkedIn';
COMMENT ON COLUMN public.startups.employee_growth_yoy_percent IS 'Year-over-year employee growth percentage from LinkedIn';
COMMENT ON COLUMN public.startups.linkedin_company_url IS 'LinkedIn company page URL';
COMMENT ON COLUMN public.startups.linkedin_last_scraped IS 'Last time LinkedIn data was scraped for this startup';



