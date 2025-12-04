-- Delete Peec AI and related data
DELETE FROM data_sources WHERE startup_id = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
DELETE FROM funding_rounds WHERE startup_id = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
DELETE FROM startups WHERE id = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

-- Insert new US-based AI/SaaS startup: Norm AI
INSERT INTO startups (id, name, description, eli5, website, sectors, city, state, country, estimated_revenue, estimated_size, buzz_score)
VALUES (
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'Norm AI',
  'AI-powered regulatory compliance platform that automates policy review and ensures organizations stay compliant with complex regulations.',
  'Uses AI to help companies follow all the rules and laws they need to.',
  'https://norm.ai',
  ARRAY['AI/ML', 'SaaS', 'Enterprise']::sector_type[],
  'New York',
  'NY',
  'United States',
  '$4M-8M',
  '50-75',
  85
);

-- Insert funding round
INSERT INTO funding_rounds (startup_id, round_type, amount, date, lead_investors)
VALUES (
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'Series A',
  27000000,
  '2025-11-18',
  ARRAY['Coatue Management', 'Index Ventures']
);

-- Insert data source
INSERT INTO data_sources (startup_id, name, confidence, url)
VALUES (
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'TechCrunch',
  'verified',
  'https://techcrunch.com/2025/11/18/norm-ai-series-a/'
);