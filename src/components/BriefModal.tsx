import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Building2, 
  Calendar, 
  Copy, 
  ExternalLink, 
  Newspaper, 
  Code, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Mail,
  Globe
} from 'lucide-react'
import { Brief } from '../lib/supabase'

interface BriefModalProps {
  brief: Brief | null
  isOpen: boolean
  onClose: () => void
}

export function BriefModal({ brief, isOpen, onClose }: BriefModalProps) {
  const [copiedField, setCopiedField] = React.useState<string | null>(null)

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!brief) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-violet-500 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{brief.companyName}</h2>
                  {brief.website && (
                    <a 
                      href={brief.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1 mt-1"
                    >
                      <Globe className="w-3 h-3" />
                      Visit website <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    {formatDate(brief.createdAt)}
                  </div>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-primary-500/20 text-primary-300 rounded-full">
                      {brief.signalTag}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-8">
                {/* Executive Summary */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary-400" />
                    Executive Summary
                  </h3>
                  <div className="bg-gray-800/50 rounded-xl p-6">
                    <p className="text-gray-300 leading-relaxed text-lg">{brief.summary}</p>
                  </div>
                </div>

                {/* Strategic Pitch Angle */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-violet-400" />
                      Strategic Pitch Angle
                    </h3>
                    <button
                      onClick={() => copyToClipboard(brief.pitchAngle, 'pitch')}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors font-medium"
                    >
                      {copiedField === 'pitch' ? (
                        <><CheckCircle className="w-4 h-4" /> Copied!</>
                      ) : (
                        <><Copy className="w-4 h-4" /> Copy Pitch</>
                      )}
                    </button>
                  </div>
                  <div className="bg-gradient-to-r from-violet-500/10 to-primary-500/10 border border-violet-500/20 rounded-xl p-6">
                    <p className="text-gray-300 leading-relaxed text-lg">{brief.pitchAngle}</p>
                  </div>
                </div>

                {/* Subject Line */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Mail className="w-5 h-5 text-accent-400" />
                      Email Subject Line
                    </h3>
                    <button
                      onClick={() => copyToClipboard(brief.subjectLine, 'subject')}
                      className="flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-500 text-white rounded-lg transition-colors font-medium"
                    >
                      {copiedField === 'subject' ? (
                        <><CheckCircle className="w-4 h-4" /> Copied!</>
                      ) : (
                        <><Copy className="w-4 h-4" /> Copy Subject</>
                      )}
                    </button>
                  </div>
                  <div className="bg-accent-500/10 border border-accent-500/20 rounded-xl p-6">
                    <p className="text-gray-300 font-semibold text-lg">{brief.subjectLine}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* News Headlines */}
                  {brief.news && brief.news.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Newspaper className="w-5 h-5 text-green-400" />
                        Recent News
                      </h3>
                      <div className="space-y-4">
                        {brief.news.slice(0, 3).map((item, index) => (
                          <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                            <h4 className="font-medium text-white mb-2 line-clamp-2">{item.title}</h4>
                            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {new Date(item.publishedAt).toLocaleDateString()}
                              </span>
                              <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-green-400 hover:text-green-300 text-xs flex items-center gap-1 font-medium"
                              >
                                Read more <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tech Stack */}
                  {brief.techStack && brief.techStack.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Code className="w-5 h-5 text-blue-400" />
                        Tech Stack
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {brief.techStack.map((tech, index) => (
                          <span 
                            key={index}
                            className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg text-sm font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* What Not to Pitch */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    What NOT to Pitch
                  </h3>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                    <p className="text-gray-300 leading-relaxed text-lg">{brief.whatNotToPitch}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}