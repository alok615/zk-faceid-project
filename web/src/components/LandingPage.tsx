'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useCallback, useRef } from 'react'
import { ConnectButton } from './ConnectButton'
import { FaceCapture } from './FaceCapture'
import { RiskScoring } from './RiskScoring'
import FinancialFlow from './FinancialFlow'
import E2EFlowController from './E2EFlowController'
import { 
  Shield, 
  Zap, 
  Eye, 
  Lock, 
  ArrowRight, 
  Users, 
  TrendingUp, 
  Star, 
  Award, 
  Sparkles, 
  Building, 
  FileText, 
  BarChart3, 
  Target, 
  Fingerprint, 
  Wallet, 
  DollarSign, 
  Workflow,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info,
  Globe,
  Cpu,
  Database
} from 'lucide-react'

// Enhanced Types for Enterprise Platform
interface EnterpriseState {
  activeSection: 'hero' | 'identity' | 'financial' | 'completeflow'
  walletAddress: string
  userProfile: any
  scrolled: boolean
  loading: boolean
  error: string | null
  processingState: ProcessingState
  systemStatus: SystemStatus
}

interface ProcessingState {
  isProcessing: boolean
  currentOperation: string
  progress: number
  step?: string
}

interface SystemStatus {
  backend: 'connected' | 'disconnected' | 'checking'
  security: 'active' | 'inactive'
  enterprise: boolean
}

interface APIResponse {
  success: boolean
  data?: any
  errors?: string[]
  timestamp: string
  request_id: string
}

// Enterprise API Service Class
class EnterpriseAPIService {
  private baseURL = 'http://localhost:8001/api/v1'
  
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:8001/api/health`)
      return response.ok
    } catch {
      return false
    }
  }

  async biometricVerification(imageFile: File, userId: string, securityLevel = 'standard'): Promise<APIResponse> {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('user_id', userId)
    formData.append('security_level', securityLevel)

    try {
      const response = await fetch(`${this.baseURL}/biometric/verify`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Enterprise biometric verification error:', error)
      throw new Error(`Biometric verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async riskAssessment(userId: string, financialData: any, assessmentModel = 'balanced'): Promise<APIResponse> {
    try {
      const response = await fetch(`${this.baseURL}/risk/assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          financial_data: financialData,
          assessment_model: assessmentModel
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Enterprise risk assessment error:', error)
      throw new Error(`Risk assessment failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

const LandingPage = () => {
  // Enhanced state management with scroll position preservation
  const [enterpriseState, setEnterpriseState] = useState<EnterpriseState>({
    activeSection: 'hero',
    walletAddress: '',
    userProfile: null,
    scrolled: false,
    loading: false,
    error: null,
    processingState: {
      isProcessing: false,
      currentOperation: '',
      progress: 0
    },
    systemStatus: {
      backend: 'checking',
      security: 'active',
      enterprise: true
    }
  })

  // SCROLL POSITION MANAGEMENT - Prevent auto-scroll issues
  const scrollPositionRef = useRef<number>(0)
  const lastScrollTimeRef = useRef<number>(0)
  const isNavigatingRef = useRef<boolean>(false)

  const apiService = useRef(new EnterpriseAPIService())

  // ENHANCED SCROLL POSITION PRESERVATION
  useEffect(() => {
    const preserveScrollPosition = () => {
      const currentTime = Date.now()
      // Only save scroll position if it's been more than 100ms since last save (debounce)
      if (currentTime - lastScrollTimeRef.current > 100) {
        scrollPositionRef.current = window.scrollY
        lastScrollTimeRef.current = currentTime
      }
    }

    const handleScroll = () => {
      preserveScrollPosition()
      setEnterpriseState(prev => ({ ...prev, scrolled: window.scrollY > 50 }))
    }

    // Add scroll listener with passive option for better performance
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // PREVENT PULL-TO-REFRESH AND SCROLL ANCHORING
  useEffect(() => {
    // Apply CSS fixes for scroll issues
    const style = document.createElement('style')
    style.textContent = `
      /* PREVENT PULL-TO-REFRESH */
      html {
        overscroll-behavior: none;
        overscroll-behavior-y: none;
        -webkit-overflow-scrolling: touch;
      }
      
      body {
        overscroll-behavior: none;
        overscroll-behavior-y: none;
      }
      
      /* PREVENT SCROLL ANCHORING */
      * {
        overflow-anchor: none;
      }
      
      /* PREVENT BROWSER PULL-TO-REFRESH */
      .main-container {
        overscroll-behavior-y: contain;
        -webkit-overflow-scrolling: touch;
      }
      
      /* PREVENT TOUCH ACTIONS THAT CAUSE REFRESH */
      .no-pull-refresh {
        touch-action: pan-x pan-y;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
      }
    `
    document.head.appendChild(style)

    // Prevent beforeunload scroll restoration
    const preventDefaultRefresh = (e: BeforeUnloadEvent) => {
      // Don't prevent actual page unload, just prevent scroll restoration
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual'
      }
    }

    window.addEventListener('beforeunload', preventDefaultRefresh)

    // Set scroll restoration to manual
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }

    return () => {
      document.head.removeChild(style)
      window.removeEventListener('beforeunload', preventDefaultRefresh)
    }
  }, [])

  // Enhanced error handling
  const handleError = useCallback((error: string, operation?: string) => {
    console.error(`❌ Enterprise error${operation ? ` in ${operation}` : ''}:`, error)
    setEnterpriseState(prev => ({
      ...prev,
      error,
      loading: false,
      processingState: { ...prev.processingState, isProcessing: false }
    }))
  }, [])

  const clearError = useCallback(() => {
    setEnterpriseState(prev => ({ ...prev, error: null }))
  }, [])

  // System health monitoring
  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const backendStatus = await apiService.current.healthCheck()
        setEnterpriseState(prev => ({
          ...prev,
          systemStatus: {
            ...prev.systemStatus,
            backend: backendStatus ? 'connected' : 'disconnected'
          }
        }))
      } catch {
        setEnterpriseState(prev => ({
          ...prev,
          systemStatus: { ...prev.systemStatus, backend: 'disconnected' }
        }))
      }
    }

    checkSystemHealth()
    const healthInterval = setInterval(checkSystemHealth, 30000)
    
    return () => clearInterval(healthInterval)
  }, [])

  // Enhanced wallet connection
  const handleWalletConnect = useCallback((address: string) => {
    try {
      setEnterpriseState(prev => ({ 
        ...prev, 
        walletAddress: address,
        error: null 
      }))
      console.log('✅ Enterprise wallet connected:', address)
    } catch (err) {
      handleError('Failed to connect wallet', 'wallet_connection')
    }
  }, [handleError])

  // ENHANCED SECTION NAVIGATION - NO AUTO-SCROLL
  const handleSectionChange = useCallback((section: 'hero' | 'identity' | 'financial' | 'completeflow') => {
    try {
      isNavigatingRef.current = true
      
      setEnterpriseState(prev => ({ 
        ...prev, 
        loading: true, 
        error: null, 
        activeSection: section 
      }))
      
      // Only scroll to top for hero section, preserve position for others
      if (section === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        // For other sections, maintain current scroll position
        setTimeout(() => {
          if (scrollPositionRef.current > 0 && section !== 'hero') {
            window.scrollTo({ top: scrollPositionRef.current, behavior: 'auto' })
          }
        }, 100)
      }
      
      console.log(`🎯 Enterprise navigation: ${section}`)
    } catch (err) {
      handleError('Failed to change section', 'navigation')
    } finally {
      setTimeout(() => {
        setEnterpriseState(prev => ({ ...prev, loading: false }))
        isNavigatingRef.current = false
      }, 300)
    }
  }, [handleError])

  // Enhanced processing state handler
  const updateProcessingState = useCallback((updates: Partial<ProcessingState>) => {
    setEnterpriseState(prev => ({
      ...prev,
      processingState: { ...prev.processingState, ...updates }
    }))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden relative main-container no-pull-refresh">
      
      {/* SCROLL-FIXED: Enterprise Status Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 z-[70]">
        <motion.div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
          initial={{ width: "0%" }}
          animate={{ 
            width: enterpriseState.systemStatus.backend === 'connected' ? "100%" : "30%" 
          }}
          transition={{ duration: 2 }}
        />
      </div>

      {/* Enhanced Error Display */}
      <AnimatePresence>
        {enterpriseState.error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[60] bg-red-500/20 border border-red-500/30 rounded-xl px-6 py-3 backdrop-blur-xl shadow-lg"
          >
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Enterprise Error:</span>
              <span>{enterpriseState.error}</span>
              <button 
                onClick={clearError}
                className="ml-2 text-red-300 hover:text-red-100 transition-colors"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Processing Overlay */}
      <AnimatePresence>
        {enterpriseState.processingState.isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-gray-800/90 rounded-2xl p-8 border border-gray-600 shadow-2xl max-w-md mx-4"
            >
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {enterpriseState.processingState.currentOperation || 'Processing...'}
                </h3>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <motion.div
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${enterpriseState.processingState.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-sm text-gray-400">
                  {enterpriseState.processingState.progress}% Complete
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-orange-500/30 via-red-500/20 to-pink-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-blue-500/30 via-purple-500/20 to-cyan-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* SCROLL-FIXED: Enterprise Navigation */}
      <motion.nav 
        className={`fixed top-1 w-full z-50 transition-all duration-300 ${
          enterpriseState.scrolled 
            ? 'bg-black/80 backdrop-blur-xl border-b border-orange-500/20 shadow-lg shadow-orange-500/10' 
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Enhanced Logo */}
            <motion.div 
              className="flex items-center space-x-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => handleSectionChange('hero')}
            >
              <div className="relative">
                <motion.div
                  className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Shield className="w-6 h-6 text-white" />
                </motion.div>
                <motion.div
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                    enterpriseState.systemStatus.backend === 'connected' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                  Sashakt
                </div>
                <div className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Enterprise Platform
                </div>
              </div>
            </motion.div>
            
            {/* Enhanced Navigation Menu */}
            <div className="hidden md:flex items-center space-x-6">
              {[
                { id: 'hero', label: 'Home', icon: Target },
                { id: 'identity', label: 'Identity', icon: Fingerprint },
                { id: 'financial', label: 'Financial', icon: DollarSign },
                { id: 'completeflow', label: 'Complete Flow', icon: Workflow }
              ].map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id as any)}
                  disabled={enterpriseState.loading}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 disabled:opacity-50 ${
                    enterpriseState.activeSection === item.id
                      ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border border-orange-500/30 shadow-lg shadow-orange-500/20'
                      : 'text-gray-300 hover:text-orange-300 hover:bg-orange-500/10'
                  }`}
                  whileHover={{ scale: enterpriseState.loading ? 1 : 1.05 }}
                  whileTap={{ scale: enterpriseState.loading ? 1 : 0.95 }}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                  {item.id === 'completeflow' && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Enhanced Status & Connect Section */}
            <div className="flex items-center space-x-4">
              {/* System Status Indicator */}
              <motion.div
                className="hidden lg:flex items-center space-x-2 bg-black/30 border border-gray-600 rounded-xl px-3 py-2"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-blue-400" />
                  <span className={`text-xs font-medium ${
                    enterpriseState.systemStatus.backend === 'connected' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {enterpriseState.systemStatus.backend === 'connected' ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-600" />
                <div className="flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-purple-400" />
                  <span className="text-xs text-purple-400 font-medium">Enterprise</span>
                </div>
              </motion.div>

              {/* Wallet Display */}
              {enterpriseState.walletAddress && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl px-3 py-2"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 text-sm font-medium">
                    {enterpriseState.walletAddress.slice(0, 6)}...{enterpriseState.walletAddress.slice(-4)}
                  </span>
                </motion.div>
              )}
              
              <ConnectButton onConnect={handleWalletConnect} />
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Loading Overlay */}
      <AnimatePresence>
        {enterpriseState.loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center"
          >
            <div className="bg-gray-800/80 rounded-2xl p-6 flex items-center gap-3 border border-gray-600">
              <motion.div
                className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-white font-medium">Loading Enterprise Platform...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Hero Section */}
      {enterpriseState.activeSection === 'hero' && (
        <motion.section 
          className="relative min-h-screen flex items-center justify-center px-6 pt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="relative z-10 max-w-7xl mx-auto text-center">
            {/* Enterprise Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 border border-orange-500/30 rounded-full px-8 py-4 mb-8 backdrop-blur-sm shadow-lg shadow-orange-500/20"
            >
              <Award className="w-6 h-6 text-orange-400" />
              <span className="text-orange-200 font-semibold text-lg">Enterprise-Grade Platform Ready!</span>
              <Sparkles className="w-6 h-6 text-pink-400" />
            </motion.div>

            {/* Enhanced Title */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="mb-12"
            >
              <motion.h1 
                className="text-8xl md:text-9xl lg:text-[12rem] font-black mb-8 leading-none"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, delay: 0.6 }}
              >
                <span className="bg-gradient-to-r from-orange-400 via-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Sashakt
                </span>
              </motion.h1>
              
              {/* Enhanced Subtitle */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="flex items-center justify-center gap-6 mb-8"
              >
                <div className="h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent w-32" />
                <span className="text-3xl md:text-5xl text-white font-light tracking-wide">
                  Enterprise Identity Platform
                </span>
                <div className="h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent w-32" />
              </motion.div>

              {/* Enhanced Description */}
              <motion.p 
                className="text-xl md:text-2xl text-gray-300 max-w-6xl mx-auto mb-8 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.3 }}
              >
                Production-ready digital identity verification with{' '}
                <span className="text-orange-400 font-semibold">enterprise-grade security</span>
                {' '}and seamless blockchain integration
              </motion.p>

              {/* Enhanced Feature Pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.6 }}
                className="flex flex-wrap justify-center gap-4 mb-16"
              >
                {[
                  { text: "Enterprise Security", icon: Shield, color: "from-green-500 to-emerald-500" },
                  { text: "Real-time Processing", icon: Zap, color: "from-yellow-500 to-orange-500" },
                  { text: "Blockchain Ready", icon: Lock, color: "from-purple-500 to-pink-500" },
                  { text: "Production Grade", icon: Database, color: "from-blue-500 to-cyan-500" }
                ].map((pill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`flex items-center space-x-2 bg-gradient-to-r ${pill.color}/20 border border-current/30 rounded-full px-6 py-3 backdrop-blur-sm cursor-pointer`}
                  >
                    <pill.icon className="w-5 h-5" />
                    <span className="text-white font-medium">{pill.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Enhanced CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.9 }}
              className="flex flex-col lg:flex-row gap-6 justify-center items-center mb-20"
            >
              {/* Enterprise Primary CTA */}
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSectionChange('completeflow')}
                disabled={enterpriseState.loading}
                className="group relative px-12 py-6 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white font-bold text-lg rounded-2xl overflow-hidden shadow-lg shadow-orange-500/40 transition-all duration-300 disabled:opacity-50"
              >
                <div className="relative flex items-center gap-4">
                  <Workflow className="w-6 h-6" />
                  <span>Enterprise Complete Flow</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <ArrowRight className="w-5 h-5" />
                </div>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSectionChange('identity')}
                disabled={enterpriseState.loading}
                className="px-12 py-6 bg-black/50 border-2 border-orange-500 text-orange-400 font-bold text-lg rounded-2xl backdrop-blur-sm hover:bg-orange-500/10 transition-all duration-300 disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <Shield className="w-6 h-6" />
                  <span>Identity Verification</span>
                </div>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSectionChange('financial')}
                disabled={enterpriseState.loading}
                className="px-12 py-6 bg-black/50 border-2 border-green-500 text-green-400 font-bold text-lg rounded-2xl backdrop-blur-sm hover:bg-green-500/10 transition-all duration-300 disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <TrendingUp className="w-6 h-6" />
                  <span>Financial Assessment</span>
                </div>
              </motion.button>
            </motion.div>

            {/* Enhanced Stats */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto"
            >
              {[
                { icon: Users, value: "10M+", label: "Enterprise Users", gradient: "from-orange-400 to-red-500" },
                { icon: Shield, value: "99.99%", label: "Security SLA", gradient: "from-red-500 to-pink-500" },
                { icon: Zap, value: "<1s", label: "Response Time", gradient: "from-pink-500 to-purple-500" },
                { icon: Workflow, value: "24/7", label: "Uptime", gradient: "from-purple-500 to-blue-500" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 2.4 + index * 0.1 }}
                  whileHover={{ scale: 1.1, y: -10 }}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 hover:border-orange-500/50 rounded-3xl p-8 text-center transition-all duration-500 cursor-pointer"
                >
                  <div className={`w-16 h-16 mx-auto mb-6 p-4 rounded-2xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                    <stat.icon className="w-full h-full text-white" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Enterprise Complete Flow Section */}
      {enterpriseState.activeSection === 'completeflow' && (
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="min-h-screen pt-24"
        >
          <div className="max-w-7xl mx-auto px-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <motion.button
                onClick={() => handleSectionChange('hero')}
                className="inline-flex items-center gap-3 text-orange-400 hover:text-orange-300 mb-8 transition-colors bg-orange-500/10 border border-orange-500/30 rounded-xl px-6 py-3 backdrop-blur-sm"
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                <span className="font-medium">Back to Home</span>
              </motion.button>
              
              <motion.h2 
                className="text-5xl md:text-6xl font-bold text-white mb-4"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                  Enterprise Complete Flow
                </span>
              </motion.h2>
              <motion.p 
                className="text-lg text-gray-400 max-w-4xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Experience the enterprise-grade journey from biometric verification to blockchain-ready data with production security
              </motion.p>
            </motion.div>
          </div>

          <E2EFlowController />
        </motion.section>
      )}

      {/* SCROLL-FIXED: Enhanced Identity Verification Section - Clean Vertical Layout */}
      {enterpriseState.activeSection === 'identity' && (
        <motion.section
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="min-h-screen pt-24 px-6"
        >
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <motion.button
                onClick={() => handleSectionChange('hero')}
                className="inline-flex items-center gap-3 text-orange-400 hover:text-orange-300 mb-8 transition-colors bg-orange-500/10 border border-orange-500/30 rounded-xl px-6 py-3 backdrop-blur-sm"
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                <span className="font-medium">Back to Home</span>
              </motion.button>
              
              <motion.h2 
                className="text-5xl md:text-6xl font-bold text-white mb-6"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Enterprise Identity Verification
                </span>
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-400 max-w-4xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Advanced biometric authentication with enterprise-grade security and comprehensive risk assessment
              </motion.p>
            </motion.div>

            {/* PRIMARY: Enterprise Face Verification - Full Width, Large, Clean */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="mb-16"
            >
              <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
                {/* Header Bar */}
                <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-b border-orange-500/20 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-3.5">
                        <Eye className="w-full h-full text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Enterprise Face Verification</h3>
                        <p className="text-orange-200">Advanced biometric analysis with enterprise security</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        enterpriseState.systemStatus.backend === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                      }`} />
                      <span className={`text-sm font-medium ${
                        enterpriseState.systemStatus.backend === 'connected' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {enterpriseState.systemStatus.backend === 'connected' ? 'Enterprise API Connected' : 'Mock Mode Active'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Face Capture Content - Large and Spacious, SCROLL PRESERVED */}
                <div className="p-8 scroll-preserve">
                  <FaceCapture />
                </div>
              </div>
            </motion.div>

            {/* SECONDARY: Enterprise Risk Assessment Portal - Full Width Below, Clean Separation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mb-16"
            >
              <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
                {/* Header Bar */}
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-purple-500/20 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-3.5">
                        <BarChart3 className="w-full h-full text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Enterprise Risk Assessment Portal</h3>
                        <p className="text-purple-200">Comprehensive financial risk analysis and scoring</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-green-400" />
                      <span className="text-sm font-medium text-green-400">Enterprise Secured</span>
                    </div>
                  </div>
                </div>

                {/* Risk Scoring Content - Large and Spacious, SCROLL PRESERVED */}
                <div className="p-8 scroll-preserve">
                  <RiskScoring />
                </div>
              </div>
            </motion.div>

            {/* ENHANCED: Enterprise Features Showcase - Modern Card Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="mb-16"
            >
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-white mb-4">Enterprise Security Features</h3>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Advanced security technologies powering your enterprise identity verification
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: Eye,
                    title: "Advanced Biometrics",
                    description: "Enterprise-grade facial recognition with real-time liveness detection and advanced security validation",
                    features: ["99.9% Accuracy Rate", "< 1s Processing Time", "Liveness Detection", "Enterprise Security"],
                    gradient: "from-orange-500 to-red-500",
                    borderColor: "border-orange-500/30"
                  },
                  {
                    icon: Shield,
                    title: "Zero-Knowledge Proofs",
                    description: "Cryptographic verification ensuring complete privacy protection with production-grade security standards",
                    features: ["Cryptographic Proof", "Privacy Protected", "Zero-Knowledge", "Enterprise Grade"],
                    gradient: "from-red-500 to-pink-500",
                    borderColor: "border-red-500/30"
                  },
                  {
                    icon: BarChart3,
                    title: "AI Risk Engine",
                    description: "Advanced financial risk assessment with comprehensive scoring algorithms and personalized recommendations",
                    features: ["AI-Powered Analysis", "Real-time Scoring", "Risk Profiling", "Smart Recommendations"],
                    gradient: "from-purple-500 to-blue-500",
                    borderColor: "border-purple-500/30"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 border ${feature.borderColor} hover:border-opacity-100 rounded-2xl p-8 transition-all duration-300 group`}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl p-4 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-full h-full text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">{feature.title}</h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">{feature.description}</p>
                    
                    {/* Feature List */}
                    <div className="space-y-2">
                      {feature.features.map((feat, featIndex) => (
                        <div key={featIndex} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Enhanced Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="text-center"
            >
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-3xl p-12">
                <h3 className="text-4xl font-bold text-white mb-6">
                  <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    Ready for Complete Enterprise Experience?
                  </span>
                </h3>
                <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                  Experience the full enterprise journey from biometric verification to blockchain integration
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    onClick={() => handleSectionChange('completeflow')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-4 px-8 rounded-xl shadow-lg shadow-orange-500/30"
                  >
                    <Zap className="w-5 h-5" />
                    <span>Try Complete Enterprise Flow</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </motion.button>
                  
                  <motion.button
                    onClick={() => handleSectionChange('financial')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-3 bg-black/50 border-2 border-purple-500 text-purple-400 font-semibold py-4 px-8 rounded-xl hover:bg-purple-500/10 transition-all"
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span>Financial Assessment</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Enhanced Financial Assessment Section */}
      {enterpriseState.activeSection === 'financial' && (
        <motion.section
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="min-h-screen pt-24 px-6"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <motion.button
                onClick={() => handleSectionChange('hero')}
                className="inline-flex items-center gap-3 text-orange-400 hover:text-orange-300 mb-8 transition-colors bg-orange-500/10 border border-orange-500/30 rounded-xl px-6 py-3 backdrop-blur-sm"
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                <span className="font-medium">Back to Home</span>
              </motion.button>
              
              <motion.h2 
                className="text-6xl md:text-7xl font-bold text-white mb-6"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Enterprise Financial Assessment
                </span>
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-400 max-w-3xl mx-auto mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Comprehensive financial verification through enterprise Account Aggregator and DigiLocker integration
              </motion.p>

              {/* Enhanced Features Showcase */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                {[
                  {
                    icon: Building,
                    title: "Enterprise Account Aggregator",
                    description: "Secure bank data access with RBI compliance and enterprise security",
                    gradient: "from-green-500 to-emerald-500"
                  },
                  {
                    icon: FileText,
                    title: "DigiLocker Enterprise",
                    description: "Government document verification with enterprise-grade validation",
                    gradient: "from-blue-500 to-cyan-500"
                  },
                  {
                    icon: BarChart3,
                    title: "Enterprise AI Risk Engine",
                    description: "Advanced financial risk assessment with production algorithms",
                    gradient: "from-purple-500 to-pink-500"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700 hover:border-green-500/50 rounded-2xl p-6 transition-all duration-300 backdrop-blur-sm"
                  >
                    <div className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-2xl p-4 mb-4 mx-auto`}>
                      <feature.icon className="w-full h-full text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Enhanced Financial Flow Component */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="bg-gradient-to-br from-gray-900/40 via-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-700 rounded-3xl overflow-hidden relative shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5"></div>
              
              <div className="relative z-10">
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">Enterprise Financial Flow</h3>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        enterpriseState.systemStatus.backend === 'connected' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-xs text-gray-400">Enterprise API</span>
                    </div>
                  </div>
                </div>
                <FinancialFlow 
                  walletAddress={enterpriseState.walletAddress}
                  userProfile={enterpriseState.userProfile}
                  onFlowComplete={(data) => {
                    console.log('✅ Enterprise financial assessment complete:', data)
                    setEnterpriseState(prev => ({ ...prev, userProfile: data }))
                  }}
                />
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Enhanced Footer */}
      <footer className="py-16 px-6 border-t border-gray-800/50 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h3 className="text-4xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Ready for Enterprise Experience?
              </span>
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto mb-6">
              Experience the enterprise-grade complete flow from biometric verification to blockchain integration
            </p>
            <motion.button
              onClick={() => handleSectionChange('completeflow')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={enterpriseState.loading}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 px-8 rounded-xl shadow-lg shadow-orange-500/30 disabled:opacity-50"
            >
              <Workflow className="w-5 h-5" />
              <span>Try Enterprise Flow</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </motion.button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-gray-500 text-sm"
          >
            <p>© 2024 Sashakt Enterprise. Production-Ready Digital Identity & Financial Platform.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
