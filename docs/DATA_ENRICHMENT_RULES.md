# BernardAI Data Enrichment Rules

## ⚠️ CRITICAL: ALL DATA MUST BE VALIDATED

**Every single data field requires validation before saving.**

Current Status (as of latest audit):
- 545 startups flagged for re-enrichment
- Only 1 properly validated (Magnific - manual)
- 520+ missing competitors
- 519+ missing founder data

## Core Principle: Accuracy Over Completeness

**It is better to have accurate data for 5 fields than inaccurate data for 20 fields.**

## Validation Requirements Per Field

Every field saved must have:
1. **Value** - The actual data
2. **Confidence** - verified/high/medium/low/unverified
3. **Sources** - List of sources where data was found
4. **Needs Review** - Boolean flag for uncertain data
5. **Validation Notes** - How the data was validated

### Confidence Levels:
- `verified` - Found in 2+ sources OR official company source
- `high` - Found in 1 reliable source (TechCrunch, Crunchbase, LinkedIn)
- `medium` - Only in Gemini training knowledge, seems accurate
- `low` - Uncertain, conflicting info, or outdated
- `unverified` - Cannot find reliable data → **DO NOT SAVE**

## Data Source Priority

### Tier 1: Primary Sources (Highest Trust)
1. **Company Website** - Official about page, press releases
2. **SEC Filings** - For public companies, IPOs
3. **Crunchbase** - Funding rounds, acquisitions (verified entries)
4. **Official Press Releases** - Revenue announcements, acquisitions

### Tier 2: News Sources (High Trust)
1. **TechCrunch** - Funding announcements, exits
2. **Forbes** - Revenue figures, valuations
3. **Bloomberg** - Financial data
4. **WSJ** - Business news

### Tier 3: Professional Data (Medium Trust)
1. **LinkedIn** - Headcount, employee growth
2. **PitchBook** - Funding data
3. **CB Insights** - Market data

### Tier 4: AI Analysis (Requires Validation)
1. **Gemini** - Knowledge base, analysis
2. Only use for cross-referencing, not primary source

## Critical Data Fields

### 1. Funding Status
- **is_bootstrapped**: Check FIRST. Many viral products never raised funding.
- **total_raised**: Sum of ALL verified rounds. 0 if bootstrapped.
- **funding_rounds**: List each round with date, amount, lead investor, SOURCE.

**Common Mistakes to Avoid:**
- ❌ Assuming all startups raised funding
- ❌ Using placeholder values ($500K, $1M) when unknown
- ❌ Not marking bootstrapped companies correctly

**Verification Steps:**
1. Search Crunchbase for funding history
2. Search TechCrunch "[company] funding"
3. Check company press page
4. If no funding found after 3 sources, mark as bootstrapped

### 2. Acquisition/Exit Status
- **was_acquired**: TRUE if company was acquired
- **acquired_by**: Acquirer name
- **acquisition_date**: When acquired
- **acquisition_amount**: Price if disclosed

**Common Mistakes to Avoid:**
- ❌ Missing recent acquisitions (check 2023-2024 news)
- ❌ Not updating company status post-acquisition

**Verification Steps:**
1. Search "[company] acquired" on Google News
2. Check TechCrunch for acquisition news
3. Check acquirer's press releases
4. Look for shutdown announcements

### 3. Competitors
- **direct_competitors**: 3-5 companies in the same category
- Include: name, funding stage, overlap percentage

**Verification Steps:**
1. Think about the product category
2. Search "[company] competitors" or "[company] alternatives"
3. Check G2, Capterra for software comparisons
4. Include both funded and bootstrapped competitors

### 4. Revenue
- **estimated_revenue**: Only include if VERIFIED
- **revenue_confidence**: 'verified' only if from official source
- **revenue_source**: Cite the source

**Common Mistakes to Avoid:**
- ❌ Making up revenue numbers
- ❌ Using formula-based estimates without marking as estimated
- ❌ Claiming "verified" without a source

**Verification Steps:**
1. Search "[company] revenue" or "[company] ARR"
2. Check for founder interviews on podcasts
3. Look for IndieHackers posts (for bootstrapped)
4. Check press releases for milestones

### 5. Team/Founders
- **founder_background**: Founder names, roles, prior experience
- **team_composition**: Headcount by department

**Verification Steps:**
1. Check company about/team page
2. Look up founders on LinkedIn
3. Search for founder interviews

## Validation Rules

### Before Saving Any Data:

1. **Funding Validation**
   - If total_raised > 0, must have at least one funding_round entry
   - If is_bootstrapped = true, total_raised must be 0

2. **Acquisition Validation**
   - If was_acquired = true, acquired_by must not be null
   - Check that company isn't still operating independently

3. **Competitor Validation**
   - At least 3 competitors for any established company
   - Competitors should be in the same product category

4. **Revenue Validation**
   - If revenue_confidence = 'verified', revenue_source must not be null
   - Never use $500K as a default placeholder

## Data Quality Flags

Set `needs_review = true` when:
- Conflicting information between sources
- Only one source found
- Data is older than 12 months
- High-value claim without strong source

## Enrichment Process

### Step 1: Scrape Multiple Sources
```
1. Zyte scrape: TechCrunch search
2. Zyte scrape: Crunchbase profile
3. Zyte scrape: Company website
4. Zyte scrape: Google News (acquisition check)
```

### Step 2: Analyze with Gemini
```
- Provide all scraped content
- Ask for ONLY verified facts
- Require source citations
- Set low temperature (0.1) for factual accuracy
```

### Step 3: Validate Before Save
```
- Check is_bootstrapped vs total_raised consistency
- Verify was_acquired if exit news found
- Ensure competitors list is populated
- Confirm founder names exist
```

### Step 4: Track Data Quality
```
- Record sources checked
- Set confidence level
- Flag for review if needed
- Update data_verified_at timestamp
```

## Example: Correct vs Incorrect Data

### Magnific (AI Image Upscaler)

**INCORRECT (what bulk enrichment did):**
```json
{
  "total_raised": 3000000,
  "is_bootstrapped": false,
  "was_acquired": null,
  "competitors": null
}
```

**CORRECT (after proper verification):**
```json
{
  "total_raised": 0,
  "is_bootstrapped": true,
  "was_acquired": true,
  "acquired_by": "Freepik",
  "acquisition_date": "2024-06-01",
  "competitors": [
    {"name": "Topaz Labs", "overlap_pct": 90},
    {"name": "Let's Enhance", "overlap_pct": 85},
    {"name": "Upscayl", "overlap_pct": 75}
  ]
}
```

## Scheduled Enrichment (Cost-Effective 3-Tier System)

### Overview: Minimizing Zyte Costs

**Problem:** Full daily re-enrichment is expensive at scale.
**Solution:** Smart change detection + selective re-enrichment.

**Cost Breakdown:**
- Zyte request: ~$0.0045 each
- Current function: 2 requests/startup (Crunchbase + Google) = $0.009/startup
- Full re-enrichment of 1,000 startups = $9/run

### Tier 1: Real-Time Triggers (FREE)

**When:** Immediately upon detection
**Cost:** $0 (no Zyte)
**What:** Monitor free sources for changes, then Zyte-enrich only affected startups

**Free Change Detection Sources:**
1. **Google News RSS** - Funding announcements, acquisitions
2. **Crunchbase RSS** - New funding rounds (if available)
3. **GitHub API** - Repo activity changes (for dev tools)
4. **Company blog RSS** - Official announcements

**Implementation:**
```sql
-- Edge Function: change-detector (runs every 6 hours)
-- Uses Gemini to analyze RSS feeds for startup mentions
-- Flags startups for immediate re-enrichment
UPDATE startups SET needs_enrichment = true 
WHERE name IN (detected_company_names);
```

**Trigger Conditions:**
- "[Company] raises" / "[Company] funding" in news
- "[Company] acquired" / "[Company] acquisition" in news
- "[Company] IPO" / "[Company] goes public" in news
- Major product announcement
- Founder departure news

### Tier 2: Weekly Smart Scan (LOW COST)

**When:** Every Sunday at 2 AM UTC
**Cost:** ~$0 (Gemini only, no Zyte)
**What:** Gemini-only analysis to detect potentially stale data

**Implementation:**
```sql
-- Edge Function: weekly-staleness-check
-- Analyzes each startup with Gemini (no scraping)
-- Flags those likely to have changed

SELECT id, name, last_enriched_at, total_raised, was_acquired
FROM startups
WHERE last_enriched_at < NOW() - INTERVAL '7 days';

-- For each: Ask Gemini if data seems current
-- If Gemini suggests changes likely, flag for Tier 3
```

**Staleness Indicators:**
- Last enriched > 30 days ago
- High-growth sector (AI, fintech) + last enriched > 14 days
- Recently funded companies + no update in 60 days
- `needs_review = true` for > 7 days

**Output:** List of startup IDs flagged for full re-enrichment

### Tier 3: Selective Deep Enrichment (COST-CONTROLLED)

**When:** Daily at 3 AM UTC (after Tier 1 triggers collected)
**Cost:** ~$0.009 per startup (only flagged ones)
**What:** Full Zyte + Gemini enrichment for flagged startups only

**Implementation:**
```sql
-- Edge Function: selective-deep-enrich
-- Only processes startups flagged by Tier 1 or Tier 2

SELECT id, name FROM startups
WHERE needs_enrichment = true
  AND enrichment_started_at IS NULL
ORDER BY 
  CASE WHEN was_recently_funded THEN 0 ELSE 1 END,
  total_raised DESC NULLS LAST
LIMIT 50; -- Max 50/day = $0.45/day max
```

**Priority Order:**
1. Tier 1 triggers (news-detected changes)
2. High-value startups (by funding)
3. `needs_review = true` flags
4. Oldest `last_enriched_at`

**Daily Budget Cap:** 50 startups max = ~$0.45/day = ~$13.50/month

### Monthly Full Audit (BUDGET-CONTROLLED)

**When:** 1st of each month at 4 AM UTC
**Cost:** Budget-capped
**What:** Rotating deep refresh of database subset

**Implementation:**
```sql
-- Re-enrich 10% of database monthly (rotating)
-- At 1,000 startups: 100/month = ~$0.90/month
-- At 10,000 startups: 1,000/month = ~$9/month

SELECT id FROM startups
WHERE EXTRACT(DAY FROM created_at) % 10 = EXTRACT(DAY FROM CURRENT_DATE) % 10
  AND last_enriched_at < NOW() - INTERVAL '30 days';
```

### Cost Summary by Database Size

| Startups | Tier 1 | Tier 2 | Tier 3 (daily cap) | Monthly Audit | **Total/Month** |
|----------|--------|--------|-------------------|---------------|-----------------|
| 500 | $0 | $0 | ~$10 | ~$0.50 | **~$11** |
| 1,000 | $0 | $0 | ~$12 | ~$0.90 | **~$13** |
| 5,000 | $0 | $0 | ~$13 | ~$4.50 | **~$18** |
| 10,000 | $0 | $0 | ~$13.50 | ~$9 | **~$23** |

**Key Insight:** Costs scale sub-linearly because:
- Tier 3 has a daily cap (50 startups)
- Most startups don't change frequently
- Change detection is free

### Database Fields for Staleness Tracking

```sql
-- Required columns on startups table
last_enriched_at      TIMESTAMPTZ  -- When full enrichment last ran
needs_enrichment      BOOLEAN      -- Flag for Tier 3 processing
enrichment_priority   INTEGER      -- 1=urgent, 2=normal, 3=low
staleness_score       INTEGER      -- 0-100, calculated weekly
change_detected_at    TIMESTAMPTZ  -- When Tier 1 flagged this
```

### Cron Schedule Summary

| Job | Schedule | Function | Data Source | Purpose |
|-----|----------|----------|-------------|---------|
| **NEW STARTUPS** |
| scrape-startups-twice-daily | 4 AM, 4 PM UTC | `scrape-startups` | Zyte + Gemini | Find & add new startups |
| scrape-vc-deals-daily | 6 AM UTC | `scrape-vc-deals` | Zyte + Gemini | VC funding news |
| **EXISTING STARTUP UPDATES** |
| detect-changes | Wednesdays 5 AM | `detect-changes` | Zyte + Gemini | Check for funding/acquisition news |
| weekly-staleness | Sundays 2 AM | `weekly-staleness-check` | Database rules | Flag stale data |
| selective-enrich | Daily 3 AM | `selective-deep-enrich` | Zyte + Gemini | Re-enrich flagged startups |
| quarterly-headcount | Jan/Apr/Jul/Oct 1st | `quarterly-headcount-update` | Zyte + Gemini | LinkedIn team sizes |

### SQL to Enable Maintenance Jobs

Run this AFTER initial enrichment is complete:

```sql
-- Tier 1: Weekly change detector (Wednesdays 5 AM UTC) - Zyte + Gemini
SELECT cron.schedule(
  'tier1-detect-changes',
  '0 5 * * 3',
  $$
  SELECT net.http_post(
    url := 'https://rkzscmfskerlanbsjugy.supabase.co/functions/v1/detect-changes',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrenNjbWZza2VybGFuYnNqdWd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTI0NjcwOCwiZXhwIjoyMDYwODIyNzA4fQ.nN7JjOaZ8ynKPsD7ORkFtgDN4g9LLJZtTRk7qcGg8Ek"}'::jsonb,
    body := '{"batch_size": 100}'::jsonb
  );
  $$
);

-- Tier 2: Weekly staleness check (Sundays 2 AM UTC) - Database rules only (FREE)
SELECT cron.schedule(
  'tier2-weekly-staleness',
  '0 2 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://rkzscmfskerlanbsjugy.supabase.co/functions/v1/weekly-staleness-check',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrenNjbWZza2VybGFuYnNqdWd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTI0NjcwOCwiZXhwIjoyMDYwODIyNzA4fQ.nN7JjOaZ8ynKPsD7ORkFtgDN4g9LLJZtTRk7qcGg8Ek"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Tier 3: Daily selective enrich (3 AM UTC) - CAPPED at 50/day
SELECT cron.schedule(
  'tier3-selective-enrich',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://rkzscmfskerlanbsjugy.supabase.co/functions/v1/selective-deep-enrich',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrenNjbWZza2VybGFuYnNqdWd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTI0NjcwOCwiZXhwIjoyMDYwODIyNzA4fQ.nN7JjOaZ8ynKPsD7ORkFtgDN4g9LLJZtTRk7qcGg8Ek"}'::jsonb,
    body := '{"batch_size": 50}'::jsonb
  );
  $$
);

-- Quarterly headcount (1st of Jan, Apr, Jul, Oct at 4 AM UTC)
SELECT cron.schedule(
  'quarterly-headcount',
  '0 4 1 1,4,7,10 *',
  $$
  SELECT net.http_post(
    url := 'https://rkzscmfskerlanbsjugy.supabase.co/functions/v1/quarterly-headcount-update',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrenNjbWZza2VybGFuYnNqdWd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTI0NjcwOCwiZXhwIjoyMDYwODIyNzA4fQ.nN7JjOaZ8ynKPsD7ORkFtgDN4g9LLJZtTRk7qcGg8Ek"}'::jsonb,
    body := '{"batch_size": 25}'::jsonb
  );
  $$
);
```

### Deployed Edge Functions

| Function | Purpose | Cost |
|----------|---------|------|
| `detect-changes` | Tier 1 - Gemini news monitoring | FREE |
| `weekly-staleness-check` | Tier 2 - Database staleness analysis | FREE |
| `selective-deep-enrich` | Tier 3 - Zyte enrichment for flagged only | ~$0.009/startup |
| `deep-enrich-v2` | Full enrichment (initial/bulk) | ~$0.009/startup |
| `quarterly-headcount-update` | LinkedIn headcount scraping | ~$0.0045/startup |

---

## Quarterly Headcount Updates (LinkedIn)

### Purpose
Track team growth over time via LinkedIn company pages.

### Schedule
Runs quarterly (every 90 days) to capture headcount snapshots.

### Data Stored

```sql
-- headcount_history JSONB column stores snapshots:
[
  {"date": "2024-01-15", "count": 50},
  {"date": "2024-04-15", "count": 65},
  {"date": "2024-07-15", "count": 82},
  {"date": "2024-10-15", "count": 95}
]
-- Keeps last 8 quarters (2 years of history)
```

### Cost Estimate

| Startups | Quarterly Cost | Annual Cost |
|----------|----------------|-------------|
| 500 | $2.25 | $9.00 |
| 1,000 | $4.50 | $18.00 |
| 5,000 | $22.50 | $90.00 |
| 10,000 | $45.00 | $180.00 |

### SQL to Enable Quarterly Schedule

```sql
-- Quarterly headcount update (1st of Jan, Apr, Jul, Oct at 4 AM UTC)
SELECT cron.schedule(
  'quarterly-headcount-update',
  '0 4 1 1,4,7,10 *',
  $$
  DO $do$
  DECLARE
    batch_count int := 0;
    total_startups int;
  BEGIN
    SELECT COUNT(*) INTO total_startups FROM startups;
    
    -- Process in batches of 25 (LinkedIn rate limiting)
    WHILE batch_count * 25 < total_startups LOOP
      PERFORM net.http_post(
        url := 'https://rkzscmfskerlanbsjugy.supabase.co/functions/v1/quarterly-headcount-update',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrenNjbWZza2VybGFuYnNqdWd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTI0NjcwOCwiZXhwIjoyMDYwODIyNzA4fQ.nN7JjOaZ8ynKPsD7ORkFtgDN4g9LLJZtTRk7qcGg8Ek"}'::jsonb,
        body := '{"batch_size": 25}'::jsonb
      );
      batch_count := batch_count + 1;
      -- Wait 5 minutes between batches
      PERFORM pg_sleep(300);
    END LOOP;
  END $do$;
  $$
);
```

### Growth Rate Calculation

The UI can calculate growth rate from history:

```typescript
function calculateGrowthRate(history: {date: string, count: number}[]): number {
  if (history.length < 2) return 0;
  const latest = history[history.length - 1].count;
  const previous = history[history.length - 2].count;
  return ((latest - previous) / previous) * 100;
}
```

### Manual Override

For immediate re-enrichment of specific startups:
```sql
UPDATE startups 
SET needs_enrichment = true, enrichment_priority = 1
WHERE name = 'CompanyName';
```

### Monitoring & Alerts

Track these metrics weekly:
- Total Zyte spend (should be < $25/month at scale)
- % of database enriched in last 30 days (target: >90%)
- Average staleness score (target: <20)
- Tier 1 triggers detected (indicates system is working)

