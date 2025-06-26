import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  Calendar, 
  Copy, 
  ExternalLink, 
  Eye,
  CheckCircle,
  Globe,
  Briefcase,
  Code,
  TrendingUp,
  Shield,
  Clock,
  Users
} from 'lucide-react'
import { Brief } from '../lib/supabase'

interface BriefCardProps {
  brief: Brief
  onViewDetails: (brief: Brief) => void
}

export function BriefCard({ brief, onViewDetails }: BriefCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getConfidenceBadgeColor = (confidence: string) => {
    switch (confidence) {
      case 'detected': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'likely': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'inferred': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const logoUrl = brief.companyLogo || (brief.companyDomain ? `https://logo.clearbit.com/${brief.companyDomain}` : null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-gray-700 rounded-2xl overflow-hidden transition-all duration-200"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={`${brief.companyName} logo`}
                  className="w-12 h-12 rounded-lg object-cover bg-gray-800"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
              <div className={`w-12 h-12 bg-gradient-to-r from-primary-500 to-violet-500 rounded-lg flex items-center justify-center ${logoUrl ? 'hidden' : ''}`}>
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{brief.companyName}</h3>
              {brief.website && (
                <a 
                  href={brief.website.startsWith('http') ? brief.website : `https://${brief.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1 mt-1"
                >
                  <Globe className="w-3 h-3" />
                  {brief.companyDomain || new URL(brief.website.startsWith('http') ? brief.website : `https://${brief.website}`).hostname}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Calendar className="w-4 h-4" />
              {formatDate(brief.createdAt)}
            </div>
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-primary-500/20 text-primary-300 rounded-full">
              {brief.signalTag}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Executive Summary */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Strategic Summary
          </h4>
          <p className="text-gray-300 leading-relaxed line-clamp-3">{brief.summary}</p>
        </div>

        {/* Key Insights */}
        {brief.keyInsights && brief.keyInsights.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Key Intelligence
            </h4>
            <div className="space-y-2">
              {brief.keyInsights.slice(0, 2).map((insight, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-300">{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent News */}
        {brief.news && brief.news.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Latest News
            </h4>
            <div className="space-y-2">
              {brief.news.slice(0, 2).map((item, index) => (
                <div key={index} className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
                  <div className="flex items-start gap-3">
                    {item.favicon && (
                      <img 
                        src={item.favicon} 
                        alt={item.source} 
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-white line-clamp-2 mb-1">{item.title}</h5>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{item.source || 'News Source'}</span>
                        <span>•</span>
                        <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-400 hover:text-primary-300 ml-auto flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Job Signals */}
        {brief.jobSignals && brief.jobSignals.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Hiring Signals ({brief.jobSignals.length} active)
            </h4>
            <div className="flex flex-wrap gap-2">
              {brief.jobSignals.slice(0, 3).map((job, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium border border-green-500/30"
                  title={`${job.title} in ${job.location}`}
                >
                  {job.title}
                </span>
              ))}
              {brief.jobSignals.length > 3 && (
                <span className="px-3 py-1 bg-gray-700 text-gray-400 rounded-full text-xs">
                  +{brief.jobSignals.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tech Stack with Confidence */}
        {brief.techStackDetail && brief.techStackDetail.length > 0 ? (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <Code className="w-4 h-4" />
              Tech Stack Analysis
            </h4>
            <div className="flex flex-wrap gap-2">
              {brief.techStackDetail.slice(0, 4).map((tech, index) => (
                <span 
                  key={index}
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getConfidenceBadgeColor(tech.confidence)}`}
                  title={`${tech.confidence} from ${tech.source}`}
                >
                  {tech.name}
                  <span className="ml-1 opacity-60">({tech.confidence})</span>
                </span>
              ))}
              {brief.techStackDetail.length > 4 && (
                <span className="px-3 py-1 bg-gray-700 text-gray-400 rounded-full text-xs">
                  +{brief.techStackDetail.length - 4} more
                </span>
              )}
            </div>
          </div>
        ) : brief.techStack && brief.techStack.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <Code className="w-4 h-4" />
              Tech Stack
            </h4>
            <div className="flex flex-wrap gap-2">
              {brief.techStack.slice(0, 4).map((tech, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium border border-blue-500/30"
                >
                  {tech}
                </span>
              ))}
              {brief.techStack.length > 4 && (
                <span className="px-3 py-1 bg-gray-700 text-gray-400 rounded-full text-xs">
                  +{brief.techStack.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Data Confidence */}
        {brief.confidenceNotes && (
          <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-blue-300 text-xs">
              <Shield className="w-3 h-3" />
              <span className="font-medium">Data Sources:</span>
              <span>{brief.confidenceNotes}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => copyToClipboard(brief.pitchAngle, 'pitch')}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors font-medium text-sm flex-1"
          >
            {copiedField === 'pitch' ? (
              <><CheckCircle className="w-4 h-4" /> Copied!</>
            ) : (
              <><Copy className="w-4 h-4" /> Copy Pitch</>
            )}
          </button>
          <button
            onClick={() => onViewDetails(brief)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors font-medium text-sm"
          >
            <Eye className="w-4 h-4" />
            Full Brief
          </button>
        </div>
      </div>
    </motion.div>
  )
}