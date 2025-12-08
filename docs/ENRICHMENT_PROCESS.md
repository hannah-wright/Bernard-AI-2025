# Startup Data Enrichment Process

## Overview

BernardAI uses a multi-source data enrichment pipeline to gather accurate, verified startup information. This document describes the enrichment process, costs, and best practices.

---

## Data Sources (via Zyte API)

Each startup enrichment makes up to **6 Zyte API requests**:

| Source | Purpose | Data Extracted |
|--------|---------|----------------|
| **TechCrunch** | News & funding | Funding rounds, revenue announcements, acquisitions |
| **Crunchbase** | Company profile | Funding history, investors, employee count |
| **Company Website** | Official info | Team, about page, product details |
| **Google News** | Exit/acquisition news | Acquisitions, IPOs, shutdowns |
| **LinkedIn** | Team data | Employee count, growth rate, key people |
| **IndieHackers** | Bootstrapped revenue | Self-reported ARR, founder interviews |

---

## Costs

**Zyte API Pricing:** $0.10 per 1,000 requests

| Scale | Requests | Cost |
|-------|----------|------|
| 1 startup | 6 | $0.0006 |
| 100 startups | 600 | $0.06 |
| 500 startups | 3,000 | $0.30 |
| 1,000 startups | 6,000 | $0.60 |

**Gemini API:** Included in Google Cloud free tier for most use cases

---

## Enrichment Functions

### 1. `deep-enrich-v2` (Primary - Zyte + Gemini)

**Purpose:** Comprehensive multi-source enrichment with full validation

**When to use:**
- Initial enrichment of new startups
- Re-enrichment for data quality issues
- When accuracy is critical

**How it works:**
1. Claims startup by setting `enrichment_started_at`
2. Scrapes 6 sources via Zyte
3. Sends scraped data to Gemini for analysis
4. Validates all fields for consistency
5. Saves only verified data with confidence scores
6. Updates `enrichment_version` to 6+

**Request format:**
```json
{
  "batch_size": 10,        // Process 10 startups (recommended: 5-20)
  "force_all": false       // Only process un-enriched startups
}
```

### 2. `bulk-enrich` (Secondary - Gemini only)

**Purpose:** Quick enrichment using Gemini's training data

**When to use:**
- Fast initial population
- Score updates (unicorn score, etc.)
- When Zyte budget is limited

**Limitations:**
- Less accurate (single source)
- May have outdated information
- No real-time verification

### 3. `enrich-startup` (Single startup)

**Purpose:** Enrich one specific startup

**When to use:**
- User-triggered enrichment
- On-demand refresh

---

## Database Tracking Columns

| Column | Purpose |
|--------|---------|
| `enrichment_version` | Version of enrichment (6+ = Zyte verified) |
| `enrichment_started_at` | Timestamp when enrichment began (prevents duplicates) |
| `enrichment_attempts` | Number of enrichment attempts |
| `data_verified_at` | Last verification timestamp |
| `needs_review` | Flag for manual review needed |
| `data_verification_notes` | Notes about data quality issues |

---

## Best Practices

### DO ✅

1. **Process sequentially** - Avoid parallel batches that overlap
2. **Use small batch sizes** (5-20) - Prevents timeouts
3. **Check progress before firing batches** - Avoid duplicate work
4. **Monitor Zyte usage** - Track requests in Zyte dashboard
5. **Set `force_all: false`** - Only process un-enriched startups

### DON'T ❌

1. **Don't fire many parallel batches** - Causes duplicate processing
2. **Don't use `force_all: true` carelessly** - Re-processes everything
3. **Don't ignore `enrichment_started_at`** - It prevents duplicates
4. **Don't skip validation** - Bad data is worse than no data

---

## Running Enrichment

### Check Current Status

```sql
SELECT 
  COUNT(*) FILTER (WHERE enrichment_version >= 6) as zyte_verified,
  COUNT(*) FILTER (WHERE enrichment_version < 6) as pending,
  COUNT(*) FILTER (WHERE enrichment_started_at IS NOT NULL 
                   AND enrichment_version < 6) as in_progress,
  COUNT(*) as total
FROM startups;
```

### Run Sequential Batch (Recommended)

```sql
-- Fire ONE batch at a time, wait for completion
SELECT net.http_post(
  url := 'https://rkzscmfskerlanbsjugy.supabase.co/functions/v1/deep-enrich-v2',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}',
  body := '{"batch_size": 10}'
);
```

### Reset Stuck Enrichments

```sql
-- Reset enrichments that started > 10 min ago but didn't complete
UPDATE startups
SET enrichment_started_at = NULL
WHERE enrichment_started_at < NOW() - INTERVAL '10 minutes'
  AND enrichment_version < 6;
```

### Monitor Progress

```sql
-- See recently enriched startups
SELECT name, enrichment_version, updated_at, data_verification_notes
FROM startups
WHERE enrichment_version >= 6
ORDER BY updated_at DESC
LIMIT 10;
```

---

## Validation Rules

All data must pass these checks before saving:

### Consistency Checks
- If `is_bootstrapped = true`, then `total_raised` must be 0
- If `total_raised > 0`, must have at least one funding round
- If `was_acquired = true`, must have `acquired_by` value
- If `had_ipo = true`, should have `stock_ticker`
- Sum of funding rounds should ≈ total_raised (±20%)

### Required Sources
- Revenue: Must be from founder interview, news, or official disclosure
- Funding: Must be from Crunchbase, TechCrunch, or press release
- Team size: Must be from LinkedIn or company website
- Competitors: Must be real companies, not generic categories

### Confidence Levels
- `verified`: Found in 2+ sources OR official company source
- `high`: Found in 1 reliable source
- `medium`: From Gemini training data, seems accurate
- `low`: Uncertain or potentially outdated
- `unverified`: Cannot find reliable data (don't save)

---

## Troubleshooting

### High Zyte Usage with Low Completion

**Cause:** Parallel batches processing same startups

**Fix:**
1. Stop all batches
2. Reset stuck enrichments
3. Run ONE batch at a time

### Enrichment Not Saving

**Cause:** Validation failures

**Check:** Look at function logs in Supabase Dashboard > Edge Functions > Logs

### Duplicate Processing

**Cause:** `enrichment_started_at` not being checked

**Fix:** Ensure function checks and sets `enrichment_started_at` before processing

---

## Scheduled Enrichment

### One-Time Bulk Enrichment (Auto-Stops When Done)

For initial/bulk enrichment of all startups:

```sql
-- Runs every 12 minutes, processes 10 startups per batch
-- Auto-disables when all startups reach enrichment_version >= 6
SELECT cron.schedule(
  'sequential-enrich-v2',
  '*/12 * * * *',
  $$
    DO $do$
    DECLARE
      remaining_count int;
    BEGIN
      SELECT COUNT(*) INTO remaining_count FROM startups WHERE enrichment_version < 6;
      
      IF remaining_count = 0 THEN
        PERFORM cron.unschedule('sequential-enrich-v2');
        RAISE NOTICE 'Enrichment complete! Job disabled.';
      ELSE
        PERFORM net.http_post(
          url := 'https://YOUR_PROJECT.supabase.co/functions/v1/deep-enrich-v2',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
          body := '{"batch_size": 10}'::jsonb
        );
      END IF;
    END $do$;
  $$
);
```

**Timing rationale:**
- Each startup takes ~60 seconds (Zyte + Gemini + DB)
- Batch of 10 = ~10 minutes
- 12-minute interval = 2 minutes padding to avoid overlap

### Ongoing Daily Refresh

For keeping data fresh after initial enrichment:

```sql
-- Run daily at 2 AM UTC for stale data refresh
SELECT cron.schedule(
  'daily-enrichment-refresh',
  '0 2 * * *',
  $$
    SELECT net.http_post(
      url := 'https://YOUR_PROJECT.supabase.co/functions/v1/deep-enrich-v2',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := '{"batch_size": 20}'::jsonb
    );
  $$
);
```

---

## Cost Monitoring

Check Zyte dashboard: https://app.zyte.com/

### Current Enrichment Run

| Metric | Value |
|--------|-------|
| Total startups | 566 |
| Requests per startup | 6 |
| Total requests | ~3,400 |
| Cost at $0.10/1000 | ~$0.34 |

### Monthly Budget Recommendations

- Small scale (< 1,000 startups): $5/month
- Medium scale (1,000-10,000): $20/month
- Large scale (10,000+): $50+/month

### Monitor Progress

```sql
SELECT 
  COUNT(*) FILTER (WHERE enrichment_version >= 6) as completed,
  COUNT(*) FILTER (WHERE enrichment_started_at IS NOT NULL AND enrichment_version < 6) as in_progress,
  COUNT(*) FILTER (WHERE enrichment_version < 6 AND enrichment_started_at IS NULL) as queued
FROM startups;
```


