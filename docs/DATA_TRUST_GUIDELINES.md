# BernardAI Data Trust Guidelines

## Core Principles

**Data accuracy and trust are the foundation of BernardAI.** Every data point displayed to users must be:

1. **Verifiable** - Has a clear source attribution
2. **Cross-checked** - Verified by multiple sources when possible
3. **Transparent** - Users can see where data came from
4. **Honest** - If data is estimated, it's clearly marked as such

## Data Sources

### Primary Sources (High Confidence)
- **Crunchbase** - Funding rounds, valuations, investors
- **Company Websites** - Team size, about info, product details
- **Press Releases** - Official announcements, revenue milestones
- **SEC Filings** - IPO data, financial disclosures

### Secondary Sources (Medium Confidence)
- **TechCrunch** - News articles, funding announcements
- **LinkedIn** - Employee count, growth metrics
- **Product Hunt** - Launch dates, descriptions
- **IndieHackers** - Revenue for bootstrapped startups

### Tertiary Sources (Low Confidence)
- **AI Analysis** - Predictions, estimates, scores
- **Social Media** - Sentiment, buzz signals

## Data Display Rules

### Revenue
- **Verified**: Only show green checkmark if found in:
  - Official press release
  - Founder public statement (tweet, interview)
  - News article with direct quote
- **Estimated**: Must show "(Est.)" suffix and methodology tooltip

### Funding Rounds
- Each round must have:
  - Source attribution (e.g., "Crunchbase")
  - Date (at least year)
  - Amount
- Multiple rounds should be displayed chronologically

### Data Sources Count
- Show ACTUAL number of sources that provided data
- Never fabricate or inflate source counts
- "Verified by X sources" must be accurate

## Enrichment Process

### Multi-Source Verification
1. Scrape primary source (Crunchbase)
2. Cross-check with news articles
3. Verify with company website if possible
4. Only store data that passes verification

### Revenue Accuracy
1. Search TechCrunch for "[Company] ARR" or "[Company] revenue"
2. Check IndieHackers for founder-disclosed revenue
3. Check company blog for milestone announcements
4. If no verified source, mark as "estimated"

### Funding Accuracy
1. Pull all rounds from Crunchbase
2. Cross-reference with funding news articles
3. Calculate total_raised as sum of all rounds
4. Store lead investors when available

## What NOT to Do

❌ Fabricate data sources  
❌ Inflate source counts  
❌ Mark estimated data as verified  
❌ Show single funding round when multiple exist  
❌ Display inaccurate revenue figures  

## Quality Assurance

- Regular audits of high-profile startups
- Compare our data vs Crunchbase/PitchBook
- User feedback mechanism for corrections
- Automated alerts for data anomalies

