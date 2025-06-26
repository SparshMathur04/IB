import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Brief = {
  id: string
  companyName: string
  website?: string
  userIntent: string
  summary: string
  news: NewsItem[]
  techStack: string[]
  pitchAngle: string
  subjectLine: string
  whatNotToPitch: string
  signalTag: string
  createdAt: string
}

export type NewsItem = {
  title: string
  description: string
  url: string
  publishedAt: string
}

export type CreateBriefRequest = {
  companyName: string
  website?: string
  userIntent: string
}

// Database operations with proper column names
export const briefsService = {
  async getAll(): Promise<Brief[]> {
    const { data, error } = await supabase
      .from('briefs')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) throw error
    return data || []
  },

  async create(brief: Omit<Brief, 'id' | 'createdAt'>): Promise<Brief> {
    const { data, error } = await supabase
      .from('briefs')
      .insert({
        companyName: brief.companyName,
        website: brief.website,
        userIntent: brief.userIntent,
        summary: brief.summary,
        news: brief.news,
        techStack: brief.techStack,
        pitchAngle: brief.pitchAngle,
        subjectLine: brief.subjectLine,
        whatNotToPitch: brief.whatNotToPitch,
        signalTag: brief.signalTag
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}