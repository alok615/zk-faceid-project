'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { motion } from 'framer-motion'

// Dynamic import of LandingPage to prevent SSR issues with animations
const LandingPage = dynamic(() => import('@/components/LandingPage'), {
  ssr: false,
  loading: () => <LoadingScreen />
})

// Professional loading screen
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          className="w-16 h-16 mx-auto mb-8"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-full h-full border-4 border-purple-500 border-t-transparent rounded-full"></div>
        </motion.div>
        
        <motion.h1
          className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Sashakt
        </motion.h1>
        
        <motion.p
          className="text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Loading advanced identity platform...
        </motion.p>
      </div>
    </div>
  )
}

// Error boundary component
function ErrorFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-3xl font-bold text-white mb-4">
          Something went wrong
        </h1>
        <p className="text-gray-400 mb-6">
          We're having trouble loading the application. Please refresh the page to try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ErrorBoundaryWrapper>
        <LandingPage />
      </ErrorBoundaryWrapper>
    </Suspense>
  )
}

// Simple error boundary wrapper
function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
  try {
    return <>{children}</>
  } catch (error) {
    console.error('Page rendering error:', error)
    return <ErrorFallback />
  }
}
