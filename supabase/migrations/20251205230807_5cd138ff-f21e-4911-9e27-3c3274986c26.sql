-- Update seed data with real funding dates
-- These are actual last funding dates from public sources

-- AI/ML Companies
UPDATE funding_rounds SET date = '2022-10-18' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Jasper' LIMIT 1) AND round_type = 'Series A';
UPDATE funding_rounds SET date = '2024-01-22' WHERE startup_id = (SELECT id FROM startups WHERE name = 'ElevenLabs' LIMIT 1) AND round_type = 'Series B';
UPDATE funding_rounds SET date = '2024-03-04' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Perplexity' LIMIT 1);
UPDATE funding_rounds SET date = '2023-03-23' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Character.AI' LIMIT 1) AND round_type = 'Series A';
UPDATE funding_rounds SET date = '2024-06-13' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Runway' LIMIT 1);
UPDATE funding_rounds SET date = '2024-04-22' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Synthesia' LIMIT 1);
UPDATE funding_rounds SET date = '2024-01-16' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Glean' LIMIT 1) AND round_type = 'Series C';
UPDATE funding_rounds SET date = '2023-11-30' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Pika' LIMIT 1);
UPDATE funding_rounds SET date = '2022-06-14' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Copy.ai' LIMIT 1) AND round_type = 'Series A';
UPDATE funding_rounds SET date = '2024-02-29' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Mistral AI' LIMIT 1);
UPDATE funding_rounds SET date = '2023-02-02' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Harvey AI' LIMIT 1);

-- Dev Tools / SaaS
UPDATE funding_rounds SET date = '2024-05-16' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Vercel' LIMIT 1);
UPDATE funding_rounds SET date = '2023-12-18' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Supabase' LIMIT 1);
UPDATE funding_rounds SET date = '2021-12-15' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Linear' LIMIT 1);
UPDATE funding_rounds SET date = '2023-02-07' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Retool' LIMIT 1);
UPDATE funding_rounds SET date = '2022-01-19' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Miro' LIMIT 1);
UPDATE funding_rounds SET date = '2022-04-19' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Webflow' LIMIT 1);
UPDATE funding_rounds SET date = '2024-09-17' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Framer' LIMIT 1);
UPDATE funding_rounds SET date = '2023-01-11' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Clerk' LIMIT 1);
UPDATE funding_rounds SET date = '2023-08-22' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Neon' LIMIT 1);
UPDATE funding_rounds SET date = '2023-01-17' WHERE startup_id = (SELECT id FROM startups WHERE name = 'PlanetScale' LIMIT 1);
UPDATE funding_rounds SET date = '2024-01-09' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Cal.com' LIMIT 1);
UPDATE funding_rounds SET date = '2023-05-11' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Raycast' LIMIT 1);
UPDATE funding_rounds SET date = '2024-04-17' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Resend' LIMIT 1);
UPDATE funding_rounds SET date = '2023-08-09' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Tinybird' LIMIT 1);
UPDATE funding_rounds SET date = '2022-11-02' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Posthog' LIMIT 1);
UPDATE funding_rounds SET date = '2023-06-13' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Attio' LIMIT 1);
UPDATE funding_rounds SET date = '2023-11-01' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Dub.co' LIMIT 1);
UPDATE funding_rounds SET date = '2022-05-11' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Descript' LIMIT 1);
UPDATE funding_rounds SET date = '2021-08-24' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Logseq' LIMIT 1);

-- Other notable startups
UPDATE funding_rounds SET date = '2023-06-21' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Beehiiv' LIMIT 1);
UPDATE funding_rounds SET date = '2023-09-19' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Ashby' LIMIT 1);
UPDATE funding_rounds SET date = '2024-04-18' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Loops' LIMIT 1);
UPDATE funding_rounds SET date = '2022-04-12' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Bereal' LIMIT 1);

-- Bootstrapped companies - set a representative founding/launch date
UPDATE funding_rounds SET date = '2018-04-01' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Plausible Analytics' LIMIT 1);
UPDATE funding_rounds SET date = '2016-01-01' WHERE startup_id = (SELECT id FROM startups WHERE name = 'ConvertKit' LIMIT 1);
UPDATE funding_rounds SET date = '2019-01-01' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Fathom Analytics' LIMIT 1);
UPDATE funding_rounds SET date = '2020-01-01' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Ghostfolio' LIMIT 1);
UPDATE funding_rounds SET date = '2017-11-01' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Carrd' LIMIT 1);
UPDATE funding_rounds SET date = '2020-03-01' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Typefully' LIMIT 1);
UPDATE funding_rounds SET date = '2019-06-01' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Bannerbear' LIMIT 1);
UPDATE funding_rounds SET date = '2017-03-01' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Buttondown' LIMIT 1);
UPDATE funding_rounds SET date = '2018-07-01' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Transistor' LIMIT 1);
UPDATE funding_rounds SET date = '2018-01-01' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Outseta' LIMIT 1);
UPDATE funding_rounds SET date = '2020-01-01' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Lemlist' LIMIT 1);
UPDATE funding_rounds SET date = '2018-03-01' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Tailwind UI' LIMIT 1);
UPDATE funding_rounds SET date = '2020-03-01' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Obsidian' LIMIT 1);
UPDATE funding_rounds SET date = '2022-07-01' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Midjourney' LIMIT 1);
UPDATE funding_rounds SET date = '2019-02-01' WHERE startup_id = (SELECT id FROM startups WHERE name = 'Mailbrew' LIMIT 1);