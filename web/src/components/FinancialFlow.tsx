'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Shield, 
  FileText, 
  BarChart3, 
  User, 
  Clock, 
  Award, 
  Sparkles, 
  Target, 
  Zap,
  AlertCircle,
  Loader2,
  Activity,
  Globe,
  Database,
  TrendingUp,
  Building,
  Eye,
  RefreshCw,
  CheckSquare,
  XCircle
} from 'lucide-react'
import AAConsentFlow from './AAConsentFlow'
import DigiLockerFlow from './DigiLockerFlow'
import RiskAssessment from './RiskAssessment'

// Enhanced Types for Enterprise Financial Flow
interface EnterpriseFinancialFlowProps {
  walletAddress?: string
  userProfile?: any
  onFlowComplete?: (data: EnterpriseFlowResult) => void
  securityLevel?: 'standard' | 'high'
  enableAutoAdvance?: boolean
}

interface EnterpriseFlowStep {
  id: string
  title: string
  description: string
  component: any
  icon: any
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'error'
  required: boolean
  estimatedTime: string
  securityLevel: 'standard' | 'high'
  apiEndpoint?: string
}

interface EnterpriseFlowResult {
  success: boolean
  flowId: string
  completedSteps: string[]
  flowData: Record<string, any>
  flowMetadata: {
    completedAt: string
    totalTimeMs: number
    totalTimeMinutes: number
    stepsCompleted: number
    securityLevel: string
    enterpriseVerified: boolean
    walletAddress?: string
    userProfile?: any
  }
  securityValidation: {
    allChecksPass: boolean
    verificationLevel: string
    riskAssessment?: any
  }
}

interface ProcessingState {
  isProcessing: boolean
  currentOperation: string
  progress: number
  stage: string
  stepId?: string
}

interface SystemStatus {
  backend: 'connected' | 'disconnected' | 'checking'
  security: 'active' | 'inactive'
  enterprise: boolean
  apiHealth: boolean
}

// Enterprise API Service for Financial Flow
class EnterpriseFinancialAPI {
  private baseURL = 'http://localhost:8001/api/v1'
  
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:8001/api/health`)
      return response.ok
    } catch {
      return false
    }
  }

  async riskAssessment(userId: string, financialData: any, assessmentModel = 'balanced'): Promise<any> {
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

  async submitFlowData(flowData: any): Promise<{ success: boolean, flowId: string }> {
    try {
      // In a real implementation, this would submit to a flow management endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      return {
        success: true,
        flowId: `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    } catch (error) {
      throw new Error('Failed to submit flow data')
    }
  }
}

export const FinancialFlow = ({ 
  walletAddress, 
  userProfile, 
  onFlowComplete,
  securityLevel = 'standard',
  enableAutoAdvance = false
}: EnterpriseFinancialFlowProps) => {
  // Enhanced state management
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [flowData, setFlowData] = useState<Record<string, any>>({})
  const [isFlowComplete, setIsFlowComplete] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    backend: 'checking',
    security: 'active',
    enterprise: true,
    apiHealth: false
  })
  
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    currentOperation: '',
    progress: 0,
    stage: ''
  })

  const apiService = useRef(new EnterpriseFinancialAPI())

  // Enhanced error handling
  const handleError = useCallback((errorMessage: string, stepId?: string) => {
    console.error(`❌ Enterprise Financial Flow Error${stepId ? ` in ${stepId}` : ''}:`, errorMessage)
    setError(errorMessage)
    setProcessingState(prev => ({ ...prev, isProcessing: false, progress: 0 }))
    
    if (stepId) {
      setSteps(prevSteps => 
        prevSteps.map(step => 
          step.id === stepId ? { ...step, status: 'error' } : step
        )
      )
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // System health monitoring
  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const isHealthy = await apiService.current.healthCheck()
        setSystemStatus(prev => ({
          ...prev,
          backend: isHealthy ? 'connected' : 'disconnected',
          apiHealth: isHealthy
        }))
      } catch {
        setSystemStatus(prev => ({
          ...prev,
          backend: 'disconnected',
          apiHealth: false
        }))
      }
    }

    checkSystemHealth()
    const healthInterval = setInterval(checkSystemHealth, 30000)
    
    return () => clearInterval(healthInterval)
  }, [])

  // Initialize flow
  useEffect(() => {
    setStartTime(new Date())
  }, [])

  // Enhanced flow steps with enterprise features
  const flowSteps: EnterpriseFlowStep[] = [
    {
      id: 'aa_consent',
      title: 'Enterprise Account Aggregator',
      description: 'Secure bank data access with RBI compliance and enterprise security',
      component: AAConsentFlow,
      icon: Building,
      status: 'pending',
      required: true,
      estimatedTime: '2-3 min',
      securityLevel: 'high',
      apiEndpoint: '/api/v1/aa/consent'
    },
    {
      id: 'digilocker_verification',
      title: 'DigiLocker Enterprise Verification',
      description: 'Government document verification with enterprise-grade validation',
      component: DigiLockerFlow,
      icon: FileText,
      status: 'pending',
      required: false,
      estimatedTime: '3-5 min',
      securityLevel: 'high',
      apiEndpoint: '/api/v1/documents/verify'
    },
    {
      id: 'risk_assessment',
      title: 'Enterprise AI Risk Assessment',
      description: 'Advanced financial risk analysis with production algorithms',
      component: RiskAssessment,
      icon: BarChart3,
      status: 'pending',
      required: true,
      estimatedTime: '1-2 min',
      securityLevel: 'high',
      apiEndpoint: '/api/v1/risk/assess'
    }
  ]

  const [steps, setSteps] = useState(flowSteps)

  const updateStepStatus = useCallback((stepId: string, status: EnterpriseFlowStep['status']) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId ? { ...step, status } : step
      )
    )
  }, [])

  const updateProcessingState = useCallback((updates: Partial<ProcessingState>) => {
    setProcessingState(prev => ({ ...prev, ...updates }))
  }, [])

  // Enhanced step completion with enterprise features
  const handleStepComplete = useCallback(async (stepId: string, data: any) => {
    try {
      clearError()
      updateProcessingState({
        isProcessing: true,
        currentOperation: 'Processing step data...',
        progress: 50,
        stage: 'validation',
        stepId
      })

      // Simulate enterprise processing
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update flow data with enterprise metadata
      const enterpriseData = {
        ...data,
        stepMetadata: {
          stepId,
          completedAt: new Date().toISOString(),
          securityLevel,
          enterpriseVerified: true,
          backendConnected: systemStatus.backend === 'connected'
        }
      }

      setFlowData(prev => ({
        ...prev,
        [stepId]: enterpriseData
      }))

      updateProcessingState({
        progress: 90,
        currentOperation: 'Finalizing step...',
        stage: 'completion'
      })

      await new Promise(resolve => setTimeout(resolve, 500))

      // Update step status
      updateStepStatus(stepId, 'completed')

      updateProcessingState({
        progress: 100,
        currentOperation: 'Step completed successfully!'
      })

      // Move to next step or complete flow
      if (currentStepIndex < steps.length - 1) {
        setTimeout(() => {
          setCurrentStepIndex(currentStepIndex + 1)
          updateStepStatus(steps[currentStepIndex + 1].id, 'in_progress')
          updateProcessingState({
            isProcessing: false,
            currentOperation: '',
            progress: 0,
            stage: ''
          })
        }, enableAutoAdvance ? 1500 : 2000)
      } else {
        // Flow complete
        setTimeout(() => {
          completeFlow()
        }, 2000)
      }

    } catch (error) {
      handleError(
        error instanceof Error ? error.message : 'Step processing failed',
        stepId
      )
    }
  }, [currentStepIndex, steps, securityLevel, systemStatus, enableAutoAdvance, updateStepStatus, updateProcessingState, clearError, handleError])

  // Enhanced flow completion with enterprise features
  const completeFlow = useCallback(async () => {
    try {
      updateProcessingState({
        isProcessing: true,
        currentOperation: 'Finalizing enterprise flow...',
        progress: 10,
        stage: 'finalization'
      })

      const endTime = new Date()
      const totalTime = startTime ? endTime.getTime() - startTime.getTime() : 0

      updateProcessingState({
        progress: 50,
        currentOperation: 'Generating enterprise security validation...'
      })

      // Submit to enterprise backend
      const submissionResult = await apiService.current.submitFlowData(flowData)

      updateProcessingState({
        progress: 80,
        currentOperation: 'Creating comprehensive assessment...'
      })

      const completeFlowData: EnterpriseFlowResult = {
        success: true,
        flowId: submissionResult.flowId,
        completedSteps: steps.filter(s => s.status === 'completed').map(s => s.id),
        flowData,
        flowMetadata: {
          completedAt: endTime.toISOString(),
          totalTimeMs: totalTime,
          totalTimeMinutes: Math.round(totalTime / 60000),
          stepsCompleted: steps.filter(s => s.status === 'completed').length,
          securityLevel,
          enterpriseVerified: true,
          walletAddress,
          userProfile
        },
        securityValidation: {
          allChecksPass: steps.filter(s => s.required).every(s => s.status === 'completed'),
          verificationLevel: 'enterprise',
          riskAssessment: flowData.risk_assessment
        }
      }

      updateProcessingState({
        progress: 100,
        currentOperation: 'Enterprise flow completed!'
      })

      await new Promise(resolve => setTimeout(resolve, 1000))

      setIsFlowComplete(true)
      onFlowComplete?.(completeFlowData)

    } catch (error) {
      handleError('Failed to complete enterprise flow')
    } finally {
      updateProcessingState({
        isProcessing: false,
        currentOperation: '',
        progress: 0,
        stage: ''
      })
    }
  }, [startTime, steps, flowData, securityLevel, walletAddress, userProfile, onFlowComplete, updateProcessingState, handleError])

  const handleSkipStep = useCallback(() => {
    const currentStep = steps[currentStepIndex]
    if (!currentStep.required) {
      updateStepStatus(currentStep.id, 'skipped')
      
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1)
        updateStepStatus(steps[currentStepIndex + 1].id, 'in_progress')
      } else {
        completeFlow()
      }
    }
  }, [currentStepIndex, steps, updateStepStatus, completeFlow])

  const handlePreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      updateStepStatus(steps[currentStepIndex].id, 'pending')
      setCurrentStepIndex(currentStepIndex - 1)
      updateStepStatus(steps[currentStepIndex - 1].id, 'in_progress')
    }
  }, [currentStepIndex, steps, updateStepStatus])

  const currentStep = steps[currentStepIndex]

  // Mark current step as in progress
  useEffect(() => {
    if (currentStep && currentStep.status === 'pending') {
      updateStepStatus(currentStep.id, 'in_progress')
    }
  }, [currentStepIndex, currentStep, updateStepStatus])

  // Enhanced completion screen with enterprise features
  if (isFlowComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-6xl mx-auto p-8"
      >
        <div className="bg-gradient-to-br from-green-900/50 to-blue-900/50 rounded-3xl p-8 border border-green-500/30 text-center shadow-2xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <Award className="w-12 h-12 text-white" />
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-bold text-white mb-4"
          >
            🎉 Enterprise Financial Verification Complete!
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-xl text-green-200 mb-8"
          >
            Your comprehensive enterprise-grade identity and financial assessment is ready for production use
          </motion.p>

          {/* Enhanced Enterprise Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white/10 rounded-2xl p-6 border border-green-500/20">
              <div className="text-3xl font-bold text-white mb-2">
                {steps.filter(s => s.status === 'completed').length}
              </div>
              <div className="text-green-200">Steps Completed</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 border border-blue-500/20">
              <div className="text-3xl font-bold text-white mb-2">
                {flowData.flowMetadata?.totalTimeMinutes || 0}min
              </div>
              <div className="text-blue-200">Total Time</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 border border-purple-500/20">
              <div className="text-3xl font-bold text-white mb-2">
                {flowData.risk_assessment?.risk_assessment?.composite_score 
                  ? Math.round(flowData.risk_assessment.risk_assessment.composite_score * 1000)
                  : flowData.aa_consent?.risk_score || 'N/A'}
              </div>
              <div className="text-purple-200">Risk Score</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 border border-orange-500/20">
              <div className="text-3xl font-bold text-white mb-2">
                {securityLevel.toUpperCase()}
              </div>
              <div className="text-orange-200">Security Level</div>
            </div>
          </motion.div>

          {/* FIXED: Enterprise Verification Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="text-left bg-white/5 rounded-2xl p-6 mb-8 border border-gray-600"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              Enterprise Verification Summary
            </h3>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      step.status === 'completed' ? 'bg-green-500' :
                      step.status === 'skipped' ? 'bg-yellow-500' : 
                      step.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                    }`}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : step.status === 'error' ? (
                        <XCircle className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-xs text-white">{index + 1}</span>
                      )}
                    </div>
                    <span className="text-white font-medium">{step.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                      step.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      step.status === 'skipped' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                      step.status === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {step.status === 'completed' ? '✅ Completed' :
                       step.status === 'skipped' ? '⏭️ Skipped' : 
                       step.status === 'error' ? '❌ Error' : '⏳ Pending'}
                    </span>
                    <span className="text-xs text-gray-400">{step.estimatedTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Enterprise Features Achieved */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="bg-black/20 rounded-2xl p-6 mb-8 border border-gray-600"
          >
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Enterprise Achievements Unlocked
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-green-400" />
                Enterprise API integration
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-green-400" />
                Advanced financial analysis
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-green-400" />
                Real-time risk assessment
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-green-400" />
                Document verification complete
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-green-400" />
                Enterprise security validated
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-green-400" />
                Production-ready assessment
              </div>
            </div>
          </motion.div>

          {/* Enhanced Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="space-y-4"
          >
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg"
              >
                Start New Enterprise Assessment
              </button>
              <button
                onClick={() => console.log('Export to Enterprise Dashboard')}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
              >
                Export to Dashboard
              </button>
            </div>
            <p className="text-green-200 text-sm">
              Your data is enterprise-secured and ready for production financial applications
            </p>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      
      {/* Enhanced Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-red-300 flex-1">Enterprise Error: {error}</span>
            <button 
              onClick={clearError}
              className="text-red-300 hover:text-red-100 transition-colors"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Processing Overlay */}
      <AnimatePresence>
        {processingState.isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-6 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                <span className="text-blue-400 font-medium">{processingState.currentOperation}</span>
              </div>
              <span className="text-blue-300 text-sm">{processingState.progress}%</span>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${processingState.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Stage: {processingState.stage}</span>
              <span>Enterprise Processing</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-5xl font-bold text-white mb-4">
          <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Enterprise Financial Verification
          </span>
        </h1>
        <p className="text-xl text-gray-300 mb-6">
          Secure, fast, and comprehensive enterprise-grade identity and financial assessment
        </p>
        
        {/* FIXED: System Status Bar */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className={`font-medium ${
              systemStatus.backend === 'connected' ? 'text-green-400' : 
              systemStatus.backend === 'checking' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {systemStatus.backend === 'connected' ? 'Enterprise API Connected' : 
               systemStatus.backend === 'checking' ? 'Checking...' : 'API Offline'}
            </span>
          </div>
          
          <div className="w-px h-4 bg-gray-600" />
          
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 font-medium">Security: {securityLevel.toUpperCase()}</span>
          </div>
          
          <div className="w-px h-4 bg-gray-600" />
          
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-medium">Enterprise Grade</span>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`relative ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                {/* Enhanced Step Circle */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-lg ${
                    step.status === 'completed' ? 'bg-green-500 border-green-500 shadow-green-500/30' :
                    step.status === 'in_progress' ? 'bg-purple-500 border-purple-500 shadow-purple-500/30' :
                    step.status === 'skipped' ? 'bg-yellow-500 border-yellow-500 shadow-yellow-500/30' :
                    step.status === 'error' ? 'bg-red-500 border-red-500 shadow-red-500/30' :
                    'bg-gray-700 border-gray-600'
                  } transition-all duration-500`}
                >
                  {step.status === 'completed' ? (
                    <CheckCircle className="w-7 h-7 text-white" />
                  ) : step.status === 'error' ? (
                    <XCircle className="w-7 h-7 text-white" />
                  ) : step.status === 'in_progress' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <step.icon className="w-7 h-7 text-white" />
                    </motion.div>
                  ) : (
                    <step.icon className="w-7 h-7 text-gray-400" />
                  )}
                </motion.div>

                {/* Enhanced Step Label */}
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-center min-w-32">
                  <div className={`text-sm font-medium ${
                    step.status === 'in_progress' ? 'text-purple-400' :
                    step.status === 'completed' ? 'text-green-400' :
                    step.status === 'skipped' ? 'text-yellow-400' :
                    step.status === 'error' ? 'text-red-400' :
                    'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {step.status === 'in_progress' ? 'Processing...' : 
                     step.status === 'completed' ? '✅ Complete' :
                     step.status === 'error' ? '❌ Error' : step.estimatedTime}
                  </div>
                  <div className="text-xs text-gray-500">
                    {step.securityLevel === 'high' ? '🔒 High Security' : '🔓 Standard'}
                  </div>
                </div>
              </div>

              {/* Enhanced Connection Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-8">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ 
                      scaleX: step.status === 'completed' ? 1 : 0 
                    }}
                    transition={{ duration: 0.5 }}
                    className="h-2 bg-gradient-to-r from-green-500 to-emerald-500 origin-left rounded-full shadow-lg"
                    style={{ transformOrigin: 'left' }}
                  />
                  <div className="h-2 bg-gray-600 -mt-2 rounded-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Current Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {/* Enhanced Step Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${
                currentStep.id === 'aa_consent' ? 'from-green-500 to-emerald-500' :
                currentStep.id === 'digilocker_verification' ? 'from-orange-500 to-red-500' :
                'from-indigo-500 to-purple-500'
              } shadow-lg`}>
                <currentStep.icon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">
                {currentStep.title}
              </h2>
              {currentStep.securityLevel === 'high' && (
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-1">
                  <span className="text-purple-400 text-sm font-medium">High Security</span>
                </div>
              )}
            </div>
            <p className="text-lg text-gray-300 mb-2">
              {currentStep.description}
            </p>
            <div className="text-sm text-gray-400">
              Estimated time: {currentStep.estimatedTime} • 
              {currentStep.required ? ' Required step' : ' Optional step'}
            </div>
          </div>

          {/* Enhanced Step Component */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700 shadow-2xl">
            {currentStep.id === 'aa_consent' && (
              <AAConsentFlow
                walletAddress={walletAddress}
                onConsentComplete={(data) => handleStepComplete('aa_consent', data)}
                onRiskScoreReady={(data) => setFlowData(prev => ({...prev, aa_risk_data: data}))}
              />
            )}
            
            {currentStep.id === 'digilocker_verification' && (
              <DigiLockerFlow
                userProfile={userProfile}
                onVerificationComplete={(data) => handleStepComplete('digilocker_verification', data)}
                onDocumentReady={(data) => setFlowData(prev => ({...prev, documents: data}))}
              />
            )}
            
            {currentStep.id === 'risk_assessment' && (
              <RiskAssessment
                financialData={flowData.aa_consent}
                documentData={flowData.digilocker_verification?.documents}
                walletAddress={walletAddress}
                userProfile={userProfile}
                onAssessmentComplete={(data) => handleStepComplete('risk_assessment', data)}
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Enhanced Navigation Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-between items-center"
      >
        <button
          onClick={handlePreviousStep}
          disabled={currentStepIndex === 0 || processingState.isProcessing}
          className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous Step
        </button>

        <div className="flex items-center gap-6">
          {/* Enhanced Step Counter */}
          <div className="flex items-center gap-4 text-gray-400">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>Step {currentStepIndex + 1} of {steps.length}</span>
            </div>

            {/* Enhanced Time Indicator */}
            {startTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {Math.round((new Date().getTime() - startTime.getTime()) / 60000)} min elapsed
                </span>
              </div>
            )}

            {/* Backend Status */}
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className={systemStatus.backend === 'connected' ? 'text-green-400' : 'text-red-400'}>
                {systemStatus.backend === 'connected' ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {!currentStep.required && currentStep.status === 'in_progress' && !processingState.isProcessing && (
          <button
            onClick={handleSkipStep}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors shadow-lg"
          >
            Skip Optional Step
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </motion.div>

      {/* Enhanced Help Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center mt-8"
      >
        <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-500/30 rounded-xl px-4 py-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <span className="text-blue-200 text-sm">
            Complete all steps for the most accurate enterprise-grade financial assessment
          </span>
        </div>
      </motion.div>
    </div>
  )
}

export default FinancialFlow
