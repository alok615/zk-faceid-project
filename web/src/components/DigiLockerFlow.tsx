'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { FileText, Shield, CheckCircle, AlertCircle, User, CreditCard, Building, Clock, ArrowRight, Loader, Eye, Download, Lock, Smartphone, Key } from 'lucide-react'

interface DigiLockerFlowProps {
  onVerificationComplete?: (data: any) => void
  onDocumentReady?: (documents: any) => void
  userProfile?: any
}

interface Document {
  id: string
  type: string
  name: string
  issuer: string
  status: 'verified' | 'pending' | 'failed'
  icon: any
  description: string
  required: boolean
  dateIssued: string
  validUntil?: string
}

export const DigiLockerFlow = ({ onVerificationComplete, onDocumentReady, userProfile }: DigiLockerFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const [verificationResults, setVerificationResults] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [showOtpModal, setShowOtpModal] = useState(false)

  const steps = [
    'DigiLocker Authentication',
    'Document Selection',
    'Consent & Verification',
    'Results & Integration'
  ]

  const availableDocuments: Document[] = [
    {
      id: 'aadhaar',
      type: 'AADHAAR',
      name: 'Aadhaar Card',
      issuer: 'UIDAI',
      status: 'verified',
      icon: User,
      description: 'Government-issued unique identity proof',
      required: true,
      dateIssued: '2019-03-15',
      validUntil: 'Lifetime'
    },
    {
      id: 'pan',
      type: 'PAN',
      name: 'PAN Card',
      issuer: 'Income Tax Department',
      status: 'verified',
      icon: CreditCard,
      description: 'Permanent Account Number for tax identification',
      required: true,
      dateIssued: '2020-07-22',
      validUntil: 'Lifetime'
    },
    {
      id: 'driving_license',
      type: 'DRIVING_LICENSE',
      name: 'Driving License',
      issuer: 'Regional Transport Office',
      status: 'verified',
      icon: FileText,
      description: 'Government-issued driving authorization',
      required: false,
      dateIssued: '2021-01-10',
      validUntil: '2041-01-10'
    },
    {
      id: 'voter_id',
      type: 'VOTER_ID',
      name: 'Voter ID Card',
      issuer: 'Election Commission of India',
      status: 'verified',
      icon: Building,
      description: 'Electoral identity card for voting rights',
      required: false,
      dateIssued: '2018-11-05',
      validUntil: 'Lifetime'
    },
    {
      id: 'education_certificate',
      type: 'EDUCATION',
      name: 'Educational Certificate',
      issuer: 'University of Mumbai',
      status: 'verified',
      icon: FileText,
      description: 'Academic qualification certificate',
      required: false,
      dateIssued: '2022-06-30',
      validUntil: 'Lifetime'
    }
  ]

  const handleAuthentication = async () => {
    setShowOtpModal(true)
  }

  const verifyOtp = async () => {
    if (otpCode === '123456') {
      setIsProcessing(true)
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsAuthenticated(true)
      setCurrentStep(1)
      setShowOtpModal(false)
      setIsProcessing(false)
    } else {
      alert('Invalid OTP. Use 123456 for demo.')
    }
  }

  const handleDocumentToggle = (docId: string) => {
    const newSelection = new Set(selectedDocuments)
    if (newSelection.has(docId)) {
      newSelection.delete(docId)
    } else {
      newSelection.add(docId)
    }
    setSelectedDocuments(newSelection)
  }

  const processDocumentVerification = async () => {
    setIsProcessing(true)
    setCurrentStep(2)

    // Simulate document verification process
    const verificationSteps = [
      'Accessing DigiLocker vault...',
      'Retrieving selected documents...',
      'Verifying document authenticity...',
      'Cross-checking with issuer databases...',
      'Generating verification report...'
    ]

    for (let i = 0; i < verificationSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500))
      // Could add progress indicators here
    }

    // Generate verification results
    const selectedDocs = availableDocuments.filter(doc => selectedDocuments.has(doc.id))
    const verificationData = {
      verificationId: `DL_${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
      documents: selectedDocs.map(doc => ({
        ...doc,
        verificationScore: Math.floor(Math.random() * 20) + 80, // 80-100%
        lastVerified: new Date().toISOString(),
        issuerResponse: 'VERIFIED',
        biometricMatch: doc.type === 'AADHAAR' ? Math.floor(Math.random() * 10) + 90 : null
      })),
      overallScore: Math.floor(Math.random() * 15) + 85, // 85-100%
      riskFlags: [],
      recommendations: generateRecommendations(selectedDocs)
    }

    setVerificationResults(verificationData)
    setCurrentStep(3)
    setShowResults(true)
    setIsProcessing(false)

    // Notify parent components
    onVerificationComplete?.(verificationData)
    onDocumentReady?.(verificationData.documents)
  }

  const generateRecommendations = (docs: Document[]) => {
    const recommendations = []
    
    if (docs.some(d => d.type === 'AADHAAR') && docs.some(d => d.type === 'PAN')) {
      recommendations.push('Excellent: Both Aadhaar and PAN verified - highest identity confidence')
    }
    
    if (docs.some(d => d.type === 'DRIVING_LICENSE')) {
      recommendations.push('Additional verification: Driving license adds credibility to your profile')
    }
    
    if (docs.length >= 3) {
      recommendations.push('Strong verification: Multiple documents enhance trust score')
    } else {
      recommendations.push('Consider adding more documents for higher verification score')
    }

    return recommendations
  }

  const requiredDocuments = availableDocuments.filter(doc => doc.required)
  const allRequiredSelected = requiredDocuments.every(doc => selectedDocuments.has(doc.id))

  if (showResults && verificationResults) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-8"
      >
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-3xl p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-blue-800 mb-2">
              Document Verification Complete!
            </h2>
            <p className="text-blue-600">
              Your digital documents have been successfully verified through DigiLocker
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Verification Score */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Verification Score
              </h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {verificationResults.overallScore}%
                </div>
                <div className="text-sm text-gray-600">
                  Identity Confidence Level
                </div>
              </div>
            </div>

            {/* Document Count */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-500" />
                Verified Documents
              </h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {verificationResults.documents.length}
                </div>
                <div className="text-sm text-gray-600">
                  Documents Processed
                </div>
              </div>
            </div>
          </div>

          {/* Document Details */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Document Verification Details</h3>
            <div className="space-y-4">
              {verificationResults.documents.map((doc: any, index: number) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <doc.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{doc.name}</div>
                      <div className="text-sm text-gray-600">Issued by {doc.issuer}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">
                        {doc.verificationScore}% Match
                      </span>
                    </div>
                    {doc.biometricMatch && (
                      <div className="text-xs text-gray-500">
                        Biometric: {doc.biometricMatch}%
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Verification Insights
            </h3>
            <div className="space-y-2">
              {verificationResults.recommendations.map((rec: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl font-bold text-white mb-4">
          DigiLocker Verification
        </h2>
        <p className="text-xl text-gray-300">
          Secure digital document verification for enhanced identity confidence
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center ${
                index < steps.length - 1 ? 'flex-1' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-600 text-gray-300'
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`ml-2 text-sm ${
                  index <= currentStep ? 'text-blue-400' : 'text-gray-500'
                }`}
              >
                {step}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Authentication Step */}
      {!isAuthenticated && currentStep === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-3xl p-8 border border-gray-600"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              Authenticate with DigiLocker
            </h3>
            <p className="text-gray-300">
              Secure login to access your digital document vault
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <div className="bg-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Smartphone className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">Mobile Number</span>
              </div>
              <input
                type="text"
                placeholder="+91 98765 43210"
                className="w-full bg-gray-600 text-white p-3 rounded-lg"
                readOnly
              />
            </div>

            <button
              onClick={handleAuthentication}
              disabled={isProcessing}
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  Authenticating...
                </div>
              ) : (
                'Send OTP'
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Document Selection */}
      {isAuthenticated && currentStep === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h3 className="text-2xl font-semibold text-white mb-6">
            Select Documents for Verification
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableDocuments.map((doc) => (
              <motion.div
                key={doc.id}
                whileHover={{ scale: 1.02 }}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedDocuments.has(doc.id)
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }`}
                onClick={() => handleDocumentToggle(doc.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    selectedDocuments.has(doc.id) ? 'bg-blue-500' : 'bg-gray-600'
                  }`}>
                    <doc.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-white">{doc.name}</h4>
                      {doc.required && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                          Required
                        </span>
                      )}
                      {doc.status === 'verified' && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{doc.description}</p>
                    <div className="text-xs text-gray-400">
                      Issued: {doc.dateIssued} | Valid: {doc.validUntil}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {selectedDocuments.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <button
                onClick={processDocumentVerification}
                disabled={!allRequiredSelected}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-2xl flex items-center gap-3 mx-auto disabled:opacity-50"
              >
                <Shield className="w-5 h-5" />
                Verify Selected Documents ({selectedDocuments.size})
                <ArrowRight className="w-5 h-5" />
              </button>
              
              {!allRequiredSelected && (
                <p className="text-yellow-400 text-sm mt-2">
                  Please select all required documents to proceed
                </p>
              )}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Processing Step */}
      {currentStep === 2 && isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-white mb-4">
            Verifying Documents...
          </h3>
          <p className="text-gray-300 mb-6">
            Securely processing your documents through DigiLocker verification
          </p>
          <div className="flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">Encrypted & Secure</span>
          </div>
        </motion.div>
      )}

      {/* OTP Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4"
            >
              <div className="text-center mb-6">
                <Key className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Enter OTP
                </h3>
                <p className="text-gray-300 text-sm">
                  We've sent a 6-digit code to your registered mobile number
                </p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP (demo: 123456)"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg text-center text-xl tracking-widest"
                  maxLength={6}
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowOtpModal(false)}
                    className="flex-1 bg-gray-600 text-white py-3 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={verifyOtp}
                    disabled={otpCode.length !== 6 || isProcessing}
                    className="flex-1 bg-blue-500 text-white py-3 rounded-xl disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <Loader className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      'Verify'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DigiLockerFlow
