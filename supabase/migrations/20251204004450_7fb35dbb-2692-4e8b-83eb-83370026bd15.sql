-- Drop the restrictive policy and recreate as permissive
DROP POLICY IF EXISTS "Anyone can view startups" ON public.startups;
CREATE POLICY "Anyone can view startups" ON public.startups FOR SELECT USING (true);

-- Same for funding_rounds and data_sources
DROP POLICY IF EXISTS "Anyone can view funding rounds" ON public.funding_rounds;
CREATE POLICY "Anyone can view funding rounds" ON public.funding_rounds FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view data sources" ON public.data_sources;
CREATE POLICY "Anyone can view data sources" ON public.data_sources FOR SELECT USING (true);