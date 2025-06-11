'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { CheckCircle, ArrowRight, ArrowLeft, Shield, FileText, BarChart3, User, Clock, Award, Sparkles, Target, Zap } from 'lucide-react'
import AAConsentFlow from './AAConsentFlow'
import DigiLockerFlow from './DigiLockerFlow'
import RiskAssessment from './RiskAssessment'

interface FinancialFlowProps {
  walletAddress?: string
  userProfile?: any
  onFlowComplete?: (data: any) => void
}

interface FlowStep {
  id: string
  title: string
  description: string
  component: any
  icon: any
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  required: boolean
}

export const FinancialFlow = ({ walletAddress, userProfile, onFlowComplete }: FinancialFlowProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [flowData, setFlowData] = useState<any>({})
  const [isFlowComplete, setIsFlowComplete] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)

  useEffect(() => {
    setStartTime(new Date())
  }, [])

  const flowSteps: FlowStep[] = [
    {
      id: 'aa_consent',
      title: 'Account Aggregator Consent',
      description: 'Grant secure access to your financial data for risk assessment',
      component: AAConsentFlow,
      icon: Shield,
      status: 'pending',
      required: true
    },
    {
      id: 'digilocker_verification',
      title: 'Document Verification',
      description: 'Verify your identity through DigiLocker digital documents',
      component: DigiLockerFlow,
      icon: FileText,
      status: 'pending',
      required: false
    },
    {
      id: 'risk_assessment',
      title: 'Risk Assessment',
      description: 'Generate comprehensive financial risk analysis and credit score',
      component: RiskAssessment,
      icon: BarChart3,
      status: 'pending',
      required: true
    }
  ]

  const [steps, setSteps] = useState(flowSteps)

  const updateStepStatus = (stepId: string, status: FlowStep['status']) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId ? { ...step, status } : step
      )
    )
  }

  const handleStepComplete = (stepId: string, data: any) => {
    // Update flow data
    setFlowData(prev => ({
      ...prev,
      [stepId]: data
    }))

    // Update step status
    updateStepStatus(stepId, 'completed')

    // Move to next step or complete flow
    if (currentStepIndex < steps.length - 1) {
      setTimeout(() => {
        setCurrentStepIndex(currentStepIndex + 1)
        updateStepStatus(steps[currentStepIndex + 1].id, 'in_progress')
      }, 1500)
    } else {
      // Flow complete
      setTimeout(() => {
        completeFlow()
      }, 2000)
    }
  }

  const completeFlow = () => {
    const endTime = new Date()
    const totalTime = startTime ? endTime.getTime() - startTime.getTime() : 0

    const completeFlowData = {
      ...flowData,
      flowMetadata: {
        completedAt: endTime.toISOString(),
        totalTimeMs: totalTime,
        totalTimeMinutes: Math.round(totalTime / 60000),
        stepsCompleted: steps.filter(s => s.status === 'completed').length,
        walletAddress,
        userProfile
      }
    }

    setIsFlowComplete(true)
    onFlowComplete?.(completeFlowData)
  }

  const handleSkipStep = () => {
    updateStepStatus(steps[currentStepIndex].id, 'skipped')
    
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
      updateStepStatus(steps[currentStepIndex + 1].id, 'in_progress')
    } else {
      completeFlow()
    }
  }

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      updateStepStatus(steps[currentStepIndex].id, 'pending')
      setCurrentStepIndex(currentStepIndex - 1)
      updateStepStatus(steps[currentStepIndex - 1].id, 'in_progress')
    }
  }

  const currentStep = steps[currentStepIndex]

  // Mark current step as in progress
  useEffect(() => {
    if (currentStep && currentStep.status === 'pending') {
      updateStepStatus(currentStep.id, 'in_progress')
    }
  }, [currentStepIndex])

  if (isFlowComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto p-8"
      >
        <div className="bg-gradient-to-br from-green-900/50 to-blue-900/50 rounded-3xl p-8 border border-green-500/30 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Award className="w-12 h-12 text-white" />
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Financial Verification Complete!
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-xl text-green-200 mb-8"
          >
            Your comprehensive identity and financial assessment is ready
          </motion.p>

          {/* Completion Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="text-3xl font-bold text-white mb-2">
                {steps.filter(s => s.status === 'completed').length}
              </div>
              <div className="text-green-200">Steps Completed</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="text-3xl font-bold text-white mb-2">
                {flowData.flowMetadata?.totalTimeMinutes || 0}min
              </div>
              <div className="text-green-200">Total Time</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="text-3xl font-bold text-white mb-2">
                {flowData.risk_assessment?.overallScore || flowData.aa_consent?.risk_score || 'N/A'}
              </div>
              <div className="text-green-200">Risk Score</div>
            </div>
          </motion.div>

          {/* Flow Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="text-left bg-white/5 rounded-2xl p-6 mb-8"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Verification Summary
            </h3>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step.status === 'completed' ? 'bg-green-500' :
                    step.status === 'skipped' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-xs text-white">{index + 1}</span>
                    )}
                  </div>
                  <span className="text-white">{step.title}</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    step.status === 'completed' ? 'bg-green-100 text-green-800' :
                    step.status === 'skipped' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {step.status === 'completed' ? 'Completed' :
                     step.status === 'skipped' ? 'Skipped' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="space-y-4"
          >
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              Start New Assessment
            </button>
            <p className="text-green-200 text-sm">
              Your data is securely processed and ready for financial product applications
            </p>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-5xl font-bold text-white mb-4">
          Complete Financial Verification
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Secure, fast, and comprehensive identity and financial assessment
        </p>
      </motion.div>

      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`relative ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                {/* Step Circle */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    step.status === 'completed' ? 'bg-green-500 border-green-500' :
                    step.status === 'in_progress' ? 'bg-purple-500 border-purple-500' :
                    step.status === 'skipped' ? 'bg-yellow-500 border-yellow-500' :
                    'bg-gray-700 border-gray-600'
                  } transition-all duration-500`}
                >
                  {step.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : step.status === 'in_progress' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <step.icon className="w-6 h-6 text-white" />
                    </motion.div>
                  ) : (
                    <step.icon className="w-6 h-6 text-gray-400" />
                  )}
                </motion.div>

                {/* Step Label */}
                <div className="absolute top-14 left-1/2 transform -translate-x-1/2 text-center min-w-32">
                  <div className={`text-sm font-medium ${
                    step.status === 'in_progress' ? 'text-purple-400' :
                    step.status === 'completed' ? 'text-green-400' :
                    step.status === 'skipped' ? 'text-yellow-400' :
                    'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                  {step.status === 'in_progress' && (
                    <div className="text-xs text-gray-400 mt-1">In Progress...</div>
                  )}
                </div>
              </div>

              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-8">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ 
                      scaleX: step.status === 'completed' ? 1 : 0 
                    }}
                    transition={{ duration: 0.5 }}
                    className="h-1 bg-green-500 origin-left"
                    style={{ transformOrigin: 'left' }}
                  />
                  <div className="h-1 bg-gray-600 -mt-1" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {/* Step Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <currentStep.icon className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl font-bold text-white">
                {currentStep.title}
              </h2>
            </div>
            <p className="text-lg text-gray-300">
              {currentStep.description}
            </p>
          </div>

          {/* Step Component */}
          <div className="bg-gray-900/50 rounded-3xl p-8 border border-gray-700">
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

      {/* Navigation Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-between items-center"
      >
        <button
          onClick={handlePreviousStep}
          disabled={currentStepIndex === 0}
          className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous Step
        </button>

        <div className="flex items-center gap-4">
          {/* Step Counter */}
          <div className="text-gray-400">
            Step {currentStepIndex + 1} of {steps.length}
          </div>

          {/* Time Indicator */}
          {startTime && (
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span>
                {Math.round((new Date().getTime() - startTime.getTime()) / 60000)} min
              </span>
            </div>
          )}
        </div>

        {!currentStep.required && currentStep.status === 'in_progress' && (
          <button
            onClick={handleSkipStep}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors"
          >
            Skip Step
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </motion.div>

      {/* Help Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center mt-8"
      >
        <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-500/30 rounded-xl px-4 py-2">
          <Target className="w-4 h-4 text-blue-400" />
          <span className="text-blue-200 text-sm">
            Complete all steps for the most accurate financial assessment
          </span>
        </div>
      </motion.div>
    </div>
  )
}

export default FinancialFlow
