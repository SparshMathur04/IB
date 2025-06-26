import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  Calendar, 
  Copy, 
  ExternalLink, 
  Eye,
  CheckCircle,
  Globe
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

  const getCompanyLogo = (website?: string) => {
    if (!website) return null
    try {
      const domain = new URL(website).hostname
      return `https://logo.clearbit.com/${domain}`
    } catch {
      return null
    }
  }

  const logoUrl = getCompanyLogo(brief.website)

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
                  href={brief.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1 mt-1"
                >
                  <Globe className="w-3 h-3" />
                  {new URL(brief.website).hostname}
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
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Executive Summary</h4>
          <p className="text-gray-300 leading-relaxed line-clamp-3">{brief.summary}</p>
        </div>

        {/* Tech Stack Preview */}
        {brief.techStack && brief.techStack.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {brief.techStack.slice(0, 4).map((tech, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs"
                >
                  {tech}
                </span>
              ))}
              {brief.techStack.length > 4 && (
                <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">
                  +{brief.techStack.length - 4} more
                </span>
              )}
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
            View Brief
          </button>
        </div>
      </div>
    </motion.div>
  )
}