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

    console.log(`Creating brief for ${companyName}...`)

    // 1. Fetch company logo/metadata from Clearbit
    let companyLogo = ''
    if (website) {
      try {
        const domain = new URL(website).hostname
        companyLogo = `https://logo.clearbit.com/${domain}`
      } catch (e) {
        console.log('Failed to extract domain from website:', e)
      }
    }

    // 2. Fetch news from NewsData.io
    let newsData: NewsItem[] = []
    const newsApiKey = Deno.env.get('NEWSDATA_API_KEY')
    if (newsApiKey) {
      try {
        const newsResponse = await fetch(
          `https://newsdata.io/api/1/news?apikey=${newsApiKey}&q="${companyName}"&language=en&size=5`
        )
        if (newsResponse.ok) {
          const newsResult = await newsResponse.json()
          newsData = newsResult.results?.slice(0, 3).map((item: any) => ({
            title: item.title,
            description: item.description || '',
            url: item.link,
            publishedAt: item.pubDate
          })) || []
        }
      } catch (e) {
        console.log('Failed to fetch news:', e)
      }
    }

    // 3. Fetch job signals from JSearch
    let jobSignals: string[] = []
    const jsearchApiKey = Deno.env.get('JSEARCH_API_KEY')
    if (jsearchApiKey) {
      try {
        const jobResponse = await fetch(
          `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(companyName + ' jobs')}&page=1&num_pages=1`,
          {
            headers: {
              'X-RapidAPI-Key': jsearchApiKey,
              'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            }
          }
        )
        if (jobResponse.ok) {
          const jobResult = await jobResponse.json()
          jobSignals = jobResult.data?.slice(0, 5).map((job: any) => job.job_title) || []
        }
      } catch (e) {
        console.log('Failed to fetch job signals:', e)
      }
    }

    // 4. Infer tech stack (simplified approach)
    const techStack = inferTechStack(companyName, website, jobSignals)

    // 5. Generate AI analysis using Groq
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    let aiAnalysis = {
      summary: 'Company analysis in progress...',
      pitchAngle: 'Strategic recommendations being generated...',
      subjectLine: 'Subject line suggestion pending...',
      whatNotToPitch: 'Risk analysis in progress...',
      signalTag: 'Processing signals...'
    }

    if (groqApiKey) {
      try {
        const prompt = `
Company: ${companyName}
Website: ${website || 'Not provided'}
User Intent: ${userIntent}
Recent News: ${newsData.length > 0 ? newsData.map(n => n.title).join('; ') : 'No recent news found'}
Tech Stack: ${techStack.join(', ')}
Hiring Signals: ${jobSignals.join(', ')}

Generate a strategic brief with:
1. Executive Summary (2-3 sentences with "why now" insight)
2. Personalized pitch angle based on the user intent
3. Suggested email subject line
4. What NOT to pitch (based on company stage/industry)
5. Signal tag (e.g., "Hiring AI engineers", "Just raised Series A")

Format as JSON with keys: summary, pitchAngle, subjectLine, whatNotToPitch, signalTag
`

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
                content: 'You are an expert B2B strategist. Generate strategic insights in JSON format only.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 1000
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

    // 6. Save to database with correct column names
    const { data, error } = await supabaseClient
      .from('briefs')
      .insert({
        companyName,
        website,
        userIntent,
        summary: aiAnalysis.summary,
        news: newsData,
        techStack,
        pitchAngle: aiAnalysis.pitchAngle,
        subjectLine: aiAnalysis.subjectLine,
        whatNotToPitch: aiAnalysis.whatNotToPitch,
        signalTag: aiAnalysis.signalTag
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

function inferTechStack(companyName: string, website?: string, jobSignals: string[] = []): string[] {
  const techStack: string[] = []
  
  // Simple tech stack inference based on company name and job signals
  const allText = `${companyName} ${website || ''} ${jobSignals.join(' ')}`.toLowerCase()
  
  // Popular tech stacks
  const techKeywords = {
    'React': ['react', 'frontend', 'javascript', 'js'],
    'Node.js': ['node', 'nodejs', 'backend', 'server'],
    'Python': ['python', 'django', 'flask', 'data'],
    'AWS': ['aws', 'cloud', 'devops'],
    'TypeScript': ['typescript', 'ts'],
    'Docker': ['docker', 'container', 'kubernetes'],
    'PostgreSQL': ['postgres', 'postgresql', 'database'],
    'MongoDB': ['mongo', 'mongodb', 'nosql'],
    'Redis': ['redis', 'cache'],
    'GraphQL': ['graphql', 'api'],
  }
  
  for (const [tech, keywords] of Object.entries(techKeywords)) {
    if (keywords.some(keyword => allText.includes(keyword))) {
      techStack.push(tech)
    }
  }
  
  // Default fallback
  if (techStack.length === 0) {
    techStack.push('JavaScript', 'Cloud Infrastructure', 'Modern Web Stack')
  }
  
  return techStack.slice(0, 6) // Limit to 6 items
}

// Import Supabase client
import { createClient } from 'npm:@supabase/supabase-js@2'