const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CreateBriefRequest {
  companyName: string
  website?: string
  userIntent: string
}

interface NewsItem {
  title: string
  description: string
  url: string
  publishedAt: string
  source: string
  favicon?: string
}

interface JobSignal {
  title: string
  company: string
  location: string
  type: string
  posted: string
}

interface TechStackItem {
  name: string
  confidence: 'detected' | 'inferred' | 'likely'
  source: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { companyName, website, userIntent }: CreateBriefRequest = await req.json()

    // Validate input
    if (!companyName || !userIntent) {
      return new Response(
        JSON.stringify({ error: 'Company name and user intent are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`🔍 Creating strategic brief for ${companyName}...`)

    // 1. Extract domain and get company logo
    let companyDomain = ''
    let companyLogo = ''
    if (website) {
      try {
        const url = new URL(website.startsWith('http') ? website : `https://${website}`)
        companyDomain = url.hostname.replace('www.', '')
        companyLogo = `https://logo.clearbit.com/${companyDomain}`
      } catch (e) {
        console.log('Failed to extract domain from website:', e)
      }
    }

    // 2. Fetch real-time news from NewsData.io
    let newsData: NewsItem[] = []
    const newsApiKey = Deno.env.get('NEWS_API_KEY')
    if (newsApiKey) {
      try {
        console.log('📡 Fetching real-time news headlines...')
        const newsResponse = await fetch(
          `https://newsdata.io/api/1/news?apikey=${newsApiKey}&q="${companyName}"&language=en&size=10&category=business,technology`
        )
        if (newsResponse.ok) {
          const newsResult = await newsResponse.json()
          newsData = newsResult.results?.slice(0, 5).map((item: any) => ({
            title: item.title,
            description: item.description || item.content?.substring(0, 200) || '',
            url: item.link,
            publishedAt: item.pubDate,
            source: item.source_id || 'Unknown Source',
            favicon: item.source_icon || `https://www.google.com/s2/favicons?domain=${new URL(item.link).hostname}&sz=32`
          })) || []
          console.log(`📰 Found ${newsData.length} relevant news articles`)
        }
      } catch (e) {
        console.log('Failed to fetch news:', e)
      }
    }

    // 3. Fetch job signals from JSearch API
    let jobSignals: JobSignal[] = []
    const jsearchApiKey = Deno.env.get('JSEARCH_API_KEY')
    if (jsearchApiKey) {
      try {
        console.log('🔍 Searching for hiring signals...')
        const jobResponse = await fetch(
          `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(`${companyName} jobs`)}&page=1&num_pages=1&date_posted=month`,
          {
            headers: {
              'X-RapidAPI-Key': jsearchApiKey,
              'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            }
          }
        )
        if (jobResponse.ok) {
          const jobResult = await jobResponse.json()
          jobSignals = jobResult.data?.slice(0, 8).map((job: any) => ({
            title: job.job_title,
            company: job.employer_name,
            location: job.job_city ? `${job.job_city}, ${job.job_country}` : job.job_country || 'Remote',
            type: job.job_employment_type || 'Full-time',
            posted: job.job_posted_at_datetime_utc || new Date().toISOString()
          })) || []
          console.log(`💼 Found ${jobSignals.length} active job postings`)
        }
      } catch (e) {
        console.log('Failed to fetch job signals:', e)
      }
    }

    // 4. Enhanced tech stack inference
    const techStack = inferEnhancedTechStack(companyName, website, jobSignals, newsData)
    console.log(`🛠 Detected ${techStack.length} technologies`)

    // 5. Generate AI analysis using Groq with enriched context
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    let aiAnalysis = {
      summary: 'Strategic analysis in progress...',
      pitchAngle: 'Personalized recommendations being generated...',
      subjectLine: 'Crafting compelling subject line...',
      whatNotToPitch: 'Risk assessment in progress...',
      signalTag: 'Processing market signals...',
      keyInsights: [],
      confidenceNotes: 'Analysis based on real-time data'
    }

    if (groqApiKey) {
      try {
        console.log('🤖 Generating strategic insights with Groq AI...')
        
        // Prepare enriched context for AI
        const newsContext = newsData.length > 0 
          ? newsData.map(n => `"${n.title}" (${n.source}, ${new Date(n.publishedAt).toLocaleDateString()})`).join('\n')
          : 'No recent news found'
        
        const jobContext = jobSignals.length > 0
          ? jobSignals.map(j => `${j.title} in ${j.location} (${j.type})`).join('\n')
          : 'No current job postings found'
        
        const techContext = techStack.map(t => `${t.name} (${t.confidence})`).join(', ')

        const prompt = `You are an expert B2B strategist analyzing real company data. Generate a strategic brief based on ACTUAL signals, not generic assumptions.

COMPANY: ${companyName}
WEBSITE: ${website || 'Not provided'}
DOMAIN: ${companyDomain || 'Unknown'}
USER INTENT: ${userIntent}

REAL-TIME NEWS HEADLINES:
${newsContext}

HIRING SIGNALS (Current Job Postings):
${jobContext}

DETECTED TECH STACK:
${techContext}

Generate a strategic brief with these sections:

1. EXECUTIVE SUMMARY (2-3 sentences with specific "why now" timing based on actual signals)
2. KEY INSIGHTS (3-4 bullet points referencing real data from news/jobs)
3. STRATEGIC PITCH ANGLE (creative, specific to their current situation, avoid generic phrases)
4. EMAIL SUBJECT LINE (personalized, reference specific signal)
5. WHAT NOT TO PITCH (based on their actual stage/focus from signals)
6. SIGNAL TAG (descriptive label like "Scaling AI Team" or "Post-Funding Growth")

RULES:
- Reference specific news headlines, job titles, or tech signals
- Avoid generic phrases like "cutting-edge solution" or "ideal time to pitch"
- Use real market triggers and timing
- Be specific about WHY NOW based on actual data
- If no strong signals, be honest about limited data

Format as JSON with keys: summary, keyInsights, pitchAngle, subjectLine, whatNotToPitch, signalTag, confidenceNotes`

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama3-70b-8192',
            messages: [
              {
                role: 'system',
                content: 'You are an expert B2B strategist. Generate strategic insights in JSON format only, based on real data signals. Be specific and avoid generic business language.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 1500
          })
        })

        if (groqResponse.ok) {
          const groqResult = await groqResponse.json()
          const content = groqResult.choices?.[0]?.message?.content
          if (content) {
            try {
              // Try to parse JSON from the response
              const jsonMatch = content.match(/\{[\s\S]*\}/)
              if (jsonMatch) {
                const parsedAnalysis = JSON.parse(jsonMatch[0])
                aiAnalysis = { ...aiAnalysis, ...parsedAnalysis }
                console.log('✅ AI analysis generated successfully')
              }
            } catch (e) {
              console.log('Failed to parse AI response as JSON, using fallback')
            }
          }
        }
      } catch (e) {
        console.log('Failed to get AI analysis:', e)
      }
    }

    // 6. Save to database with enhanced structure
    const { data, error } = await supabaseClient
      .from('briefs')
      .insert({
        companyName,
        website,
        userIntent,
        summary: aiAnalysis.summary,
        news: newsData,
        techStack: techStack.map(t => t.name), // Keep simple array for compatibility
        pitchAngle: aiAnalysis.pitchAngle,
        subjectLine: aiAnalysis.subjectLine,
        whatNotToPitch: aiAnalysis.whatNotToPitch,
        signalTag: aiAnalysis.signalTag,
        // Enhanced fields (will be added via new migration)
        jobSignals: jobSignals,
        techStackDetail: techStack,
        keyInsights: aiAnalysis.keyInsights || [],
        confidenceNotes: aiAnalysis.confidenceNotes || 'Analysis based on available data',
        companyLogo: companyLogo,
        companyDomain: companyDomain
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to save brief to database', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Strategic brief created successfully')

    return new Response(
      JSON.stringify({ success: true, brief: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error creating brief:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function inferEnhancedTechStack(
  companyName: string, 
  website?: string, 
  jobSignals: JobSignal[] = [], 
  newsData: NewsItem[] = []
): TechStackItem[] {
  const techStack: TechStackItem[] = []
  
  // Combine all text sources for analysis
  const companyText = companyName.toLowerCase()
  const websiteText = website?.toLowerCase() || ''
  const jobText = jobSignals.map(j => `${j.title} ${j.company}`).join(' ').toLowerCase()
  const newsText = newsData.map(n => `${n.title} ${n.description}`).join(' ').toLowerCase()
  const allText = `${companyText} ${websiteText} ${jobText} ${newsText}`
  
  // Enhanced tech detection with confidence levels
  const techPatterns = {
    // Frontend Technologies
    'React': { patterns: ['react', 'reactjs', 'react.js'], confidence: 'detected' as const },
    'Vue.js': { patterns: ['vue', 'vuejs', 'vue.js'], confidence: 'detected' as const },
    'Angular': { patterns: ['angular', 'angularjs'], confidence: 'detected' as const },
    'TypeScript': { patterns: ['typescript', 'ts developer'], confidence: 'detected' as const },
    'JavaScript': { patterns: ['javascript', 'js developer', 'frontend'], confidence: 'likely' as const },
    
    // Backend Technologies
    'Node.js': { patterns: ['node', 'nodejs', 'node.js', 'express'], confidence: 'detected' as const },
    'Python': { patterns: ['python', 'django', 'flask', 'fastapi'], confidence: 'detected' as const },
    'Java': { patterns: ['java developer', 'spring boot', 'java engineer'], confidence: 'detected' as const },
    'Go': { patterns: ['golang', 'go developer', 'go engineer'], confidence: 'detected' as const },
    'Ruby': { patterns: ['ruby', 'rails', 'ruby on rails'], confidence: 'detected' as const },
    
    // Cloud & Infrastructure
    'AWS': { patterns: ['aws', 'amazon web services', 'ec2', 's3'], confidence: 'detected' as const },
    'Google Cloud': { patterns: ['gcp', 'google cloud', 'gke'], confidence: 'detected' as const },
    'Azure': { patterns: ['azure', 'microsoft azure'], confidence: 'detected' as const },
    'Docker': { patterns: ['docker', 'container', 'kubernetes', 'k8s'], confidence: 'detected' as const },
    'Terraform': { patterns: ['terraform', 'infrastructure as code'], confidence: 'detected' as const },
    
    // Databases
    'PostgreSQL': { patterns: ['postgres', 'postgresql'], confidence: 'detected' as const },
    'MongoDB': { patterns: ['mongo', 'mongodb'], confidence: 'detected' as const },
    'Redis': { patterns: ['redis', 'cache'], confidence: 'detected' as const },
    'MySQL': { patterns: ['mysql'], confidence: 'detected' as const },
    
    // AI/ML
    'TensorFlow': { patterns: ['tensorflow', 'tf'], confidence: 'detected' as const },
    'PyTorch': { patterns: ['pytorch'], confidence: 'detected' as const },
    'Machine Learning': { patterns: ['ml engineer', 'machine learning', 'data scientist'], confidence: 'likely' as const },
    
    // DevOps
    'Jenkins': { patterns: ['jenkins', 'ci/cd'], confidence: 'detected' as const },
    'GitHub Actions': { patterns: ['github actions', 'gh actions'], confidence: 'detected' as const },
  }
  
  // Detect technologies with confidence levels
  for (const [tech, config] of Object.entries(techPatterns)) {
    const found = config.patterns.some(pattern => allText.includes(pattern))
    if (found) {
      let source = 'inferred'
      if (jobText.includes(config.patterns[0])) source = 'job postings'
      else if (newsText.includes(config.patterns[0])) source = 'news analysis'
      else if (websiteText.includes(config.patterns[0])) source = 'website'
      
      techStack.push({
        name: tech,
        confidence: config.confidence,
        source
      })
    }
  }
  
  // Industry-based inference
  if (allText.includes('fintech') || allText.includes('financial')) {
    techStack.push({ name: 'Financial APIs', confidence: 'inferred', source: 'industry context' })
  }
  if (allText.includes('ecommerce') || allText.includes('e-commerce')) {
    techStack.push({ name: 'E-commerce Platform', confidence: 'inferred', source: 'industry context' })
  }
  if (allText.includes('saas') || allText.includes('software as a service')) {
    techStack.push({ name: 'SaaS Architecture', confidence: 'inferred', source: 'business model' })
  }
  
  // Default fallback with lower confidence
  if (techStack.length === 0) {
    techStack.push(
      { name: 'Web Technologies', confidence: 'inferred', source: 'default assumption' },
      { name: 'Cloud Infrastructure', confidence: 'likely', source: 'modern business assumption' }
    )
  }
  
  return techStack.slice(0, 8) // Limit to 8 items
}

// Import Supabase client
import { createClient } from 'npm:@supabase/supabase-js@2'