/**
 * Scrape VC Deals Edge Function
 * 
 * Scrapes recent VC funding announcements from multiple sources
 * and populates the vc_deals table. Runs on a schedule.
 * 
 * Sources:
 * - TechCrunch funding announcements
 * - Crunchbase news
 * - Bloomberg/Reuters tech funding
 * - VC firm announcement pages
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Top VC firms to track
const TOP_VCS = [
  { name: "Sequoia Capital", tier: "tier1" },
  { name: "Andreessen Horowitz", tier: "tier1" },
  { name: "Accel", tier: "tier1" },
  { name: "Benchmark", tier: "tier1" },
  { name: "Founders Fund", tier: "tier1" },
  { name: "Lightspeed", tier: "tier1" },
  { name: "Index Ventures", tier: "tier1" },
  { name: "Greylock", tier: "tier1" },
  { name: "General Catalyst", tier: "tier1" },
  { name: "Bessemer Venture Partners", tier: "tier1" },
  { name: "Tiger Global", tier: "tier2" },
  { name: "Coatue", tier: "tier2" },
  { name: "Insight Partners", tier: "tier2" },
  { name: "NEA", tier: "tier2" },
  { name: "Ribbit Capital", tier: "tier2" },
  { name: "IVP", tier: "tier2" },
  { name: "Thrive Capital", tier: "tier2" },
  { name: "Khosla Ventures", tier: "tier2" },
  { name: "Union Square Ventures", tier: "tier2" },
  { name: "First Round Capital", tier: "tier2" },
];

interface ScrapedDeal {
  vcFirm: string;
  vcTier: string;
  startupName: string;
  roundType: string;
  amount: number | null;
  dealDate: string;
  sector: string[];
  geography: string;
  sourceUrl: string;
  sourceName: string;
  dealType: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    const zyteApiKey = Deno.env.get("ZYTE_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { source = 'all', limit = 20 } = await req.json().catch(() => ({}));

    console.log(`Scraping VC deals from: ${source}, limit: ${limit}`);

    const scrapedDeals: ScrapedDeal[] = [];

    // Method 1: Use Gemini to extract recent deals from news
    if (geminiApiKey && (source === 'all' || source === 'gemini')) {
      console.log("Using Gemini to find recent VC deals...");
      
      const geminiDeals = await extractDealsWithGemini(geminiApiKey);
      scrapedDeals.push(...geminiDeals);
    }

    // Method 2: Scrape TechCrunch funding tag via Zyte
    if (zyteApiKey && (source === 'all' || source === 'techcrunch')) {
      console.log("Scraping TechCrunch funding news...");
      
      const tcDeals = await scrapeTechCrunch(zyteApiKey, geminiApiKey);
      scrapedDeals.push(...tcDeals);
    }

    // Deduplicate deals
    const uniqueDeals = deduplicateDeals(scrapedDeals);
    console.log(`Found ${uniqueDeals.length} unique deals after deduplication`);

    // Insert deals into database
    let inserted = 0;
    let skipped = 0;

    for (const deal of uniqueDeals.slice(0, limit)) {
      // Check if deal already exists (by startup name + round type + approximate date)
      const { data: existing } = await supabase
        .from('vc_deals')
        .select('id')
        .eq('startup_name', deal.startupName)
        .eq('round_type', deal.roundType)
        .gte('deal_date', new Date(new Date(deal.dealDate).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .maybeSingle();

      if (existing) {
        console.log(`Skipping duplicate: ${deal.startupName} ${deal.roundType}`);
        skipped++;
        continue;
      }

      // Try to find the startup in our database
      const { data: startup } = await supabase
        .from('startups')
        .select('id')
        .ilike('name', deal.startupName)
        .maybeSingle();

      // Insert the deal
      const { error: insertError } = await supabase.from('vc_deals').insert({
        vc_firm: deal.vcFirm,
        vc_tier: deal.vcTier,
        startup_name: deal.startupName,
        startup_id: startup?.id || null,
        deal_type: deal.dealType,
        round_type: deal.roundType,
        amount: deal.amount,
        deal_date: deal.dealDate,
        sector: deal.sector,
        geography: deal.geography,
        source_url: deal.sourceUrl,
        source_name: deal.sourceName,
      });

      if (insertError) {
        console.error(`Error inserting deal for ${deal.startupName}:`, insertError);
      } else {
        inserted++;
        console.log(`Inserted: ${deal.vcFirm} → ${deal.startupName} (${deal.roundType})`);
      }
    }

    // Update VC firm stats
    await updateVCFirmStats(supabase);

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          scraped: scrapedDeals.length,
          unique: uniqueDeals.length,
          inserted,
          skipped,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error scraping VC deals:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Use Gemini to extract recent VC deals from its knowledge
 * 
 * CRITICAL: Accuracy is the #1 priority. We only want verified, real deals.
 */
async function extractDealsWithGemini(apiKey: string): Promise<ScrapedDeal[]> {
  const prompt = `You are a VC research analyst. Your job is to find REAL, VERIFIED funding announcements.

=== CRITICAL: DATA ACCURACY IS THE #1 PRIORITY ===

⚠️ ACCURACY REQUIREMENTS (MANDATORY):
1. ONLY include deals that are PUBLICLY ANNOUNCED and VERIFIABLE
2. EVERY deal MUST have been reported by a reputable source (TechCrunch, Bloomberg, company press release, SEC filing)
3. DO NOT include ANY deal you cannot verify with a real news source
4. If you're unsure about ANY detail (amount, date, investor), DO NOT include that deal
5. NEVER fabricate or hallucinate deal information
6. It is BETTER to return 5 verified deals than 20 unverified ones

List ONLY funding rounds that have been publicly announced in the last 60 days that you can VERIFY.

For each deal, provide:
- startup_name: Exact company name as reported
- round_type: Seed, Series A, Series B, Series C, Series D, Growth, etc.
- amount_usd: EXACT amount as reported (number only, no symbols) - if not disclosed, set to null
- lead_investor: Lead investor name as reported
- investor_tier: tier1 (Sequoia, a16z, Accel, Benchmark, Founders Fund, etc.) or tier2 (Tiger, Coatue, Insight, etc.)
- deal_date: EXACT announcement date (YYYY-MM-DD format)
- sector: Array of sectors
- geography: Country code (US, UK, EU, etc.)
- source: SPECIFIC source name (e.g., "TechCrunch Dec 5 2024", "Company Press Release")
- source_url: Direct URL to the announcement if known

Focus on deals from: Sequoia, a16z, Accel, Benchmark, Founders Fund, Lightspeed, Index, Greylock, General Catalyst, Bessemer, Tiger Global, Coatue, Insight Partners.

Return as JSON array:
[
  {
    "startup_name": "...",
    "round_type": "...",
    "amount_usd": 100000000,
    "lead_investor": "...",
    "investor_tier": "tier1",
    "deal_date": "2024-12-01",
    "sector": ["AI/ML"],
    "geography": "US",
    "source": "TechCrunch Dec 1 2024",
    "source_url": "https://techcrunch.com/..."
  }
]

IMPORTANT: Return an EMPTY array [] if you cannot verify any deals. Quality over quantity.
Return ONLY the JSON array, no other text.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4000,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Could not extract JSON from Gemini response");
      return [];
    }

    const deals = JSON.parse(jsonMatch[0]);
    
    return deals.map((d: any) => ({
      vcFirm: d.lead_investor,
      vcTier: d.investor_tier || 'tier2',
      startupName: d.startup_name,
      roundType: d.round_type,
      amount: d.amount_usd || null,
      dealDate: d.deal_date,
      sector: d.sector || [],
      geography: d.geography || 'US',
      sourceUrl: '',
      sourceName: d.source || 'AI Analysis',
      dealType: 'lead',
    }));
  } catch (error) {
    console.error("Error extracting deals with Gemini:", error);
    return [];
  }
}

/**
 * Scrape TechCrunch funding articles via Zyte
 */
async function scrapeTechCrunch(zyteApiKey: string, geminiApiKey?: string): Promise<ScrapedDeal[]> {
  try {
    // Scrape the TechCrunch funding tag page
    const response = await fetch("https://api.zyte.com/v1/extract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(zyteApiKey + ":")}`,
      },
      body: JSON.stringify({
        url: "https://techcrunch.com/tag/funding/",
        browserHtml: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Zyte API error: ${response.status}`);
    }

    const data = await response.json();
    const html = data.browserHtml || "";
    
    // Extract article titles and links (basic extraction)
    const articleMatches = html.matchAll(/<article[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>[\s\S]*?<\/article>/gi);
    const articles: Array<{url: string, title: string}> = [];
    
    for (const match of articleMatches) {
      if (match[1] && match[2] && match[1].includes('techcrunch.com')) {
        articles.push({ url: match[1], title: match[2] });
      }
    }

    // If we have Gemini, use it to extract deal info from titles
    if (geminiApiKey && articles.length > 0) {
      const titlesText = articles.slice(0, 20).map(a => `- ${a.title}`).join('\n');
      
      const extractPrompt = `Extract funding deal information from these TechCrunch article titles. For each title that describes a funding round, extract the deal details.

Titles:
${titlesText}

Return JSON array of deals found:
[
  {
    "startup_name": "...",
    "round_type": "Series A|Seed|etc",
    "amount_usd": 10000000,
    "lead_investor": "VC name if mentioned",
    "sector": ["AI/ML"]
  }
]

Only include clear funding announcements. Return ONLY the JSON array.`;

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: extractPrompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 2000 },
          }),
        }
      );

      if (geminiResponse.ok) {
        const geminiData = await geminiResponse.json();
        const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
          const deals = JSON.parse(jsonMatch[0]);
          return deals.map((d: any) => ({
            vcFirm: d.lead_investor || 'Unknown',
            vcTier: getVCTier(d.lead_investor),
            startupName: d.startup_name,
            roundType: d.round_type,
            amount: d.amount_usd || null,
            dealDate: new Date().toISOString().split('T')[0],
            sector: d.sector || [],
            geography: 'US',
            sourceUrl: 'https://techcrunch.com/tag/funding/',
            sourceName: 'TechCrunch',
            dealType: 'lead',
          }));
        }
      }
    }

    return [];
  } catch (error) {
    console.error("Error scraping TechCrunch:", error);
    return [];
  }
}

/**
 * Determine VC tier based on name
 */
function getVCTier(vcName: string): string {
  if (!vcName) return 'tier3';
  
  const tier1VCs = [
    'Sequoia', 'Andreessen', 'a16z', 'Accel', 'Benchmark', 'Founders Fund',
    'Lightspeed', 'Index', 'Greylock', 'General Catalyst', 'Bessemer', 'Kleiner'
  ];
  
  const tier2VCs = [
    'Tiger Global', 'Coatue', 'Insight', 'NEA', 'Ribbit', 'IVP', 'Thrive',
    'Khosla', 'Union Square', 'First Round', 'GGV', 'Norwest', 'Battery'
  ];
  
  const vcLower = vcName.toLowerCase();
  
  if (tier1VCs.some(vc => vcLower.includes(vc.toLowerCase()))) {
    return 'tier1';
  }
  if (tier2VCs.some(vc => vcLower.includes(vc.toLowerCase()))) {
    return 'tier2';
  }
  return 'tier3';
}

/**
 * Deduplicate deals based on startup name + round type
 */
function deduplicateDeals(deals: ScrapedDeal[]): ScrapedDeal[] {
  const seen = new Set<string>();
  return deals.filter(deal => {
    const key = `${deal.startupName.toLowerCase()}-${deal.roundType.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Update VC firm aggregate stats
 */
async function updateVCFirmStats(supabase: any) {
  console.log("Updating VC firm stats...");
  
  // Get deal counts and totals by firm
  const { data: stats } = await supabase
    .from('vc_deals')
    .select('vc_firm, amount')
    .order('deal_date', { ascending: false });

  if (!stats) return;

  // Aggregate by firm
  const firmStats: Record<string, { deals: number; total: number }> = {};
  for (const deal of stats) {
    if (!firmStats[deal.vc_firm]) {
      firmStats[deal.vc_firm] = { deals: 0, total: 0 };
    }
    firmStats[deal.vc_firm].deals++;
    firmStats[deal.vc_firm].total += deal.amount || 0;
  }

  // Update or create VC firm records
  for (const [name, data] of Object.entries(firmStats)) {
    const { error } = await supabase
      .from('vc_firms')
      .upsert({
        name,
        tier: getVCTier(name),
        aum_usd: data.total,
      }, {
        onConflict: 'name',
      });

    if (error) {
      console.error(`Error updating VC firm ${name}:`, error);
    }
  }
}

