import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Newspaper, Code, TrendingUp, Brain, CheckCircle, Zap, Briefcase, Globe } from 'lucide-react'
import { LoadingStepIndicator } from './LoadingStepIndicator'

interface AnalyzingScreenProps {
  companyName: string
  website?: string
}

const analysisSteps = [
  {
    id: 'scanning',
    icon: Search,
    message: '🔍 Scanning company profile and extracting domain...',
    duration: 1500
  },
  {
    id: 'news',
    icon: Newspaper,
    message: '📡 Fetching real-time headlines from NewsData API...',
    duration: 3000
  },
  {
    id: 'jobs',
    icon: Briefcase,
    message: '💼 Searching for hiring signals via JSearch API...',
    duration: 2500
  },
  {
    id: 'tech',
    icon: Code,
    message: '🛠 Parsing tech signals from job postings and metadata...',
    duration: 2000
  },
  {
    id: 'ai',
    icon: Brain,
    message: '🤖 Asking Groq AI to generate personalized strategy...',
    duration: 4000
  }
]

export function AnalyzingScreen({ companyName, website }: AnalyzingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < analysisSteps.length - 1) {
        setCompletedSteps(prev => new Set([...prev, currentStep]))
        setCurrentStep(prev => prev + 1)
      } else {
        setCompletedSteps(prev => new Set([...prev, currentStep]))
      }
    }, analysisSteps[currentStep].duration)

    return () => clearTimeout(timer)
  }, [currentStep])

  const steps = analysisSteps.map((step, index) => ({
    ...step,
    isActive: index === currentStep,
    isCompleted: completedSteps.has(index)
  }))

  const currentProgress = ((completedSteps.size + (currentStep < analysisSteps.length - 1 ? 0.5 : 1)) / analysisSteps.length) * 100

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-950/95 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div className="max-w-2xl w-full mx-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-900/90 backdrop-blur border border-gray-800 rounded-2xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-20 h-20 bg-gradient-to-r from-primary-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-500/25"
            >
              <Zap className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h3 
              className="text-2xl font-bold text-white mb-2"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Analyzing {companyName}
            </motion.h3>
            
            <p className="text-gray-400">
              {website ? (
                <span className="flex items-center justify-center gap-2">
                  <Globe className="w-4 h-4" />
                  Investigating {new URL(website.startsWith('http') ? website : `https://${website}`).hostname}
                </span>
              ) : 'Gathering intelligence from multiple real-time sources'}
            </p>
            
            <motion.div
              className="flex items-center justify-center gap-2 mt-4 text-sm text-primary-400"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Brain className="w-4 h-4" />
              <span>Powered by Real APIs + Groq AI</span>
            </motion.div>
          </div>

          {/* Loading Steps */}
          <LoadingStepIndicator steps={steps} currentProgress={currentProgress} />

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Fetching live data from NewsData, JSearch, and Clearbit APIs
            </p>
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Real-time data
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                AI analysis
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
                Strategic insights
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}