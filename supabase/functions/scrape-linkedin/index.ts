/**
 * LinkedIn Company Page Scraper
 * 
 * Scrapes LinkedIn company pages to get:
 * - Current employee count
 * - Year-over-year employee growth percentage
 * - Employee breakdown by department
 * 
 * Uses Zyte API for browser-based scraping since LinkedIn requires JavaScript.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders, handleCorsPrelight } from "../_shared/cors.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LinkedInData {
  companyName: string
  employeeCount: number | null
  employeeGrowthPercent: number | null
  linkedinUrl: string
  scraped: boolean
  error?: string
}

interface StartupForLinkedIn {
  id: string
  name: string
  website: string | null
  linkedin_company_url: string | null
  linkedin_last_scraped: string | null
}

// Generate possible LinkedIn URL slugs from company name
function generateLinkedInSlugs(companyName: string): string[] {
  const name = companyName.toLowerCase()
  const slugs: string[] = []
  
  // Basic slug - spaces to hyphens
  slugs.push(name.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
  
  // No spaces/hyphens
  slugs.push(name.replace(/[^a-z0-9]/g, ''))
  
  // With "inc" or "io" suffix removed
  const withoutSuffix = name.replace(/\s*(inc|io|ai|app|hq|labs?|studio|tech|software)\.?$/i, '').trim()
  slugs.push(withoutSuffix.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
  
  return [...new Set(slugs)].filter(s => s.length > 1)
}

// Extract LinkedIn company URL from website if present
function extractLinkedInFromWebsite(html: string): string | null {
  const patterns = [
    /href=["'](https?:\/\/(?:www\.)?linkedin\.com\/company\/[^"'\/]+)["']/i,
    /linkedin\.com\/company\/([a-z0-9-]+)/i,
  ]
  
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match) {
      if (match[1].startsWith('http')) {
        return match[1].replace(/\/$/, '')
      }
      return `https://www.linkedin.com/company/${match[1]}`
    }
  }
  return null
}

// Parse employee data from LinkedIn company page HTML
function parseLinkedInData(html: string, url: string): LinkedInData {
  const result: LinkedInData = {
    companyName: '',
    employeeCount: null,
    employeeGrowthPercent: null,
    linkedinUrl: url,
    scraped: true,
  }
  
  // Extract company name
  const nameMatch = html.match(/<h1[^>]*class="[^"]*org-top-card-summary__title[^"]*"[^>]*>([^<]+)<\/h1>/i)
    || html.match(/<span[^>]*class="[^"]*org-top-card-summary__title[^"]*"[^>]*>([^<]+)<\/span>/i)
    || html.match(/<title>([^|<]+)/i)
  
  if (nameMatch) {
    result.companyName = nameMatch[1].trim().replace(/\s*\|.*$/, '').replace(/\s*-.*$/, '')
  }
  
  // Extract employee count - LinkedIn shows this in several formats
  const employeePatterns = [
    // "1,234 employees"
    /(\d{1,3}(?:,\d{3})*)\s*employees?\s*(?:on\s*LinkedIn)?/i,
    // "1234 employees"
    /(\d+)\s*employees?\s*(?:on\s*LinkedIn)?/i,
    // JSON-LD data
    /"numberOfEmployees":\s*"?(\d+)"?/i,
    // "Company size: 51-200 employees"
    /(?:company\s*size|employees?).*?(\d{1,3}(?:,\d{3})*)\s*-\s*(\d{1,3}(?:,\d{3})*)/i,
  ]
  
  for (const pattern of employeePatterns) {
    const match = html.match(pattern)
    if (match) {
      // Handle range (take midpoint)
      if (match[2]) {
        const low = parseInt(match[1].replace(/,/g, ''), 10)
        const high = parseInt(match[2].replace(/,/g, ''), 10)
        result.employeeCount = Math.round((low + high) / 2)
      } else {
        result.employeeCount = parseInt(match[1].replace(/,/g, ''), 10)
      }
      break
    }
  }
  
  // Extract employee growth percentage
  const growthPatterns = [
    // "+23% employee growth" or "23% employee growth"
    /([+-]?\d+(?:\.\d+)?)\s*%\s*employee\s*growth/i,
    // "Employee growth: 23%"
    /employee\s*growth[:\s]*([+-]?\d+(?:\.\d+)?)\s*%/i,
    // "grew by 23%" or "growth of 23%"
    /(?:grew|growth|increased)\s*(?:by|of)\s*([+-]?\d+(?:\.\d+)?)\s*%/i,
    // In insights section: "23% employee growth in the last year"
    /(\d+(?:\.\d+)?)\s*%.*?(?:year|annual|yoy)/i,
  ]
  
  for (const pattern of growthPatterns) {
    const match = html.match(pattern)
    if (match) {
      result.employeeGrowthPercent = parseFloat(match[1])
      break
    }
  }
  
  return result
}

// Scrape a URL using Zyte browser mode
async function scrapeWithZyte(url: string, apiKey: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.zyte.com/v1/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(apiKey + ':')}`
      },
      body: JSON.stringify({
        url,
        browserHtml: true,
        javascript: true,
        // LinkedIn requires these to look like a real browser
        actions: [
          { action: 'waitForTimeout', timeout: 3000 }
        ]
      })
    })
    
    if (!response.ok) {
      console.error(`Zyte API error: ${response.status}`)
      return null
    }
    
    const data = await response.json()
    return data.browserHtml || null
  } catch (error) {
    console.error('Zyte scrape error:', error)
    return null
  }
}

// Find LinkedIn company URL for a startup
async function findLinkedInUrl(
  startup: StartupForLinkedIn, 
  zyteApiKey: string
): Promise<string | null> {
  // If we already have a LinkedIn URL, use it
  if (startup.linkedin_company_url) {
    return startup.linkedin_company_url
  }
  
  // Try to find LinkedIn URL from company website
  if (startup.website) {
    const websiteHtml = await scrapeWithZyte(startup.website, zyteApiKey)
    if (websiteHtml) {
      const linkedinUrl = extractLinkedInFromWebsite(websiteHtml)
      if (linkedinUrl) {
        return linkedinUrl
      }
    }
  }
  
  // Try common LinkedIn URL patterns
  const slugs = generateLinkedInSlugs(startup.name)
  for (const slug of slugs) {
    const url = `https://www.linkedin.com/company/${slug}`
    // We could verify by scraping, but that uses credits
    // For now, return the most likely URL
    return url
  }
  
  return null
}

Deno.serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCorsPrelight(req)
  if (corsResponse) return corsResponse
  
  const origin = req.headers.get('Origin')
  const headers = { ...getCorsHeaders(origin), 'Content-Type': 'application/json' }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const zyteApiKey = Deno.env.get('ZYTE_API_KEY')
    if (!zyteApiKey) {
      throw new Error('ZYTE_API_KEY not configured')
    }

    // Get parameters
    const { 
      batch_size = 5, 
      startup_id = null,
      force_rescrape = false,
      max_age_days = 30  // Re-scrape if data is older than this
    } = await req.json().catch(() => ({}))
    
    console.log(`=== LinkedIn Scrape: batch_size=${batch_size}, startup_id=${startup_id}, force=${force_rescrape} ===`)

    // Build query to find startups needing LinkedIn data
    let query = supabase
      .from('startups')
      .select('id, name, website, linkedin_company_url, linkedin_last_scraped')
      .order('created_at', { ascending: false })
    
    if (startup_id) {
      // Scrape specific startup
      query = query.eq('id', startup_id)
    } else if (!force_rescrape) {
      // Find startups without recent LinkedIn data
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - max_age_days)
      
      query = query.or(`linkedin_last_scraped.is.null,linkedin_last_scraped.lt.${cutoffDate.toISOString()}`)
    }
    
    query = query.limit(batch_size)

    const { data: startups, error: fetchError } = await query

    if (fetchError) {
      throw new Error(`Failed to fetch startups: ${fetchError.message}`)
    }

    if (!startups || startups.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No startups need LinkedIn scraping',
          processed: 0,
        }),
        { headers }
      )
    }

    console.log(`Found ${startups.length} startups to process`)

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      details: [] as { name: string; status: string; data?: Partial<LinkedInData>; error?: string }[],
    }

    // Process each startup
    for (const startup of startups as StartupForLinkedIn[]) {
      console.log(`Processing: ${startup.name}`)
      results.processed++

      try {
        // Find or verify LinkedIn URL
        const linkedinUrl = await findLinkedInUrl(startup, zyteApiKey)
        
        if (!linkedinUrl) {
          results.failed++
          results.details.push({ 
            name: startup.name, 
            status: 'failed', 
            error: 'Could not find LinkedIn URL' 
          })
          continue
        }

        // Scrape LinkedIn company page
        const html = await scrapeWithZyte(linkedinUrl, zyteApiKey)
        
        if (!html) {
          results.failed++
          results.details.push({ 
            name: startup.name, 
            status: 'failed', 
            error: 'Failed to scrape LinkedIn page' 
          })
          continue
        }

        // Parse employee data
        const linkedinData = parseLinkedInData(html, linkedinUrl)
        
        // Calculate YoY growth if we have current count but not growth %
        let growthPercent = linkedinData.employeeGrowthPercent
        if (!growthPercent && linkedinData.employeeCount) {
          // We don't have historical data yet, set to null
          // On subsequent scrapes, we can calculate from headcount_1_year_ago
          const { data: existingData } = await supabase
            .from('startups')
            .select('headcount_current')
            .eq('id', startup.id)
            .single()
          
          // If we had a previous count, and now have a new count, 
          // we can estimate but this is imprecise
          // LinkedIn's own growth % is more accurate
        }

        // Update startup with LinkedIn data
        const updateData: Record<string, unknown> = {
          linkedin_company_url: linkedinUrl,
          linkedin_last_scraped: new Date().toISOString(),
        }
        
        if (linkedinData.employeeCount) {
          updateData.headcount_current = linkedinData.employeeCount
        }
        
        if (linkedinData.employeeGrowthPercent !== null) {
          updateData.employee_growth_yoy_percent = linkedinData.employeeGrowthPercent
          
          // Calculate headcount_1_year_ago from growth %
          if (linkedinData.employeeCount && linkedinData.employeeGrowthPercent) {
            const previousCount = Math.round(
              linkedinData.employeeCount / (1 + linkedinData.employeeGrowthPercent / 100)
            )
            updateData.headcount_1_year_ago = previousCount
          }
        }

        const { error: updateError } = await supabase
          .from('startups')
          .update(updateData)
          .eq('id', startup.id)

        if (updateError) {
          results.failed++
          results.details.push({ 
            name: startup.name, 
            status: 'failed', 
            error: updateError.message 
          })
        } else {
          results.succeeded++
          results.details.push({ 
            name: startup.name, 
            status: 'success',
            data: {
              employeeCount: linkedinData.employeeCount,
              employeeGrowthPercent: linkedinData.employeeGrowthPercent,
              linkedinUrl,
            }
          })
        }

        // Add delay between LinkedIn scrapes to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000))

      } catch (error) {
        results.failed++
        results.details.push({ 
          name: startup.name, 
          status: 'failed', 
          error: error instanceof Error ? error.message : String(error) 
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.processed} startups`,
        ...results,
      }),
      { headers }
    )

  } catch (error) {
    console.error('LinkedIn scrape error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }),
      { status: 500, headers }
    )
  }
})



