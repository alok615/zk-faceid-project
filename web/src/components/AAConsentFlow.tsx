'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Shield, CheckCircle, AlertCircle, CreditCard, Building, FileText, Clock, ArrowRight, Loader, TrendingUp, Database, Lock } from 'lucide-react'

interface AAConsentFlowProps {
  onConsentComplete?: (data: any) => void
  onRiskScoreReady?: (riskData: any) => void
  walletAddress?: string
}

interface ConsentStep {
  id: string
  title: string
  description: string
  icon: any
  required: boolean
  completed: boolean
}

export const AAConsentFlow = ({ onConsentComplete, onRiskScoreReady, walletAddress }: AAConsentFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [consentsGiven, setConsentsGiven] = useState<Set<string>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)
  const [simulatedData, setSimulatedData] = useState<any>(null)
  const [riskAssessment, setRiskAssessment] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)

  const consentSteps: ConsentStep[] = [
    {
      id: 'bank_account',
      title: 'Bank Account Access',
      description: 'Access your bank account information to analyze transaction patterns and account balance',
      icon: Building,
      required: true,
      completed: false
    },
    {
      id: 'transaction_history',
      title: 'Transaction History',
      description: 'Review your last 6 months of transaction data for financial pattern analysis',
      icon: CreditCard,
      required: true,
      completed: false
    },
    {
      id: 'account_aggregator',
      title: 'Account Aggregator Consent',
      description: 'Enable secure data sharing through RBI-approved Account Aggregator framework',
      icon: Shield,
      required: true,
      completed: false
    },
    {
      id: 'risk_analysis',
      title: 'Risk Assessment',
      description: 'Allow AI-powered financial risk analysis for personalized credit scoring',
      icon: TrendingUp,
      required: false,
      completed: false
    }
  ]

  const bankOptions = [
    { id: 'sbi', name: 'State Bank of India', logo: '🏦', users: '45M+' },
    { id: 'hdfc', name: 'HDFC Bank', logo: '🏛️', users: '38M+' },
    { id: 'icici', name: 'ICICI Bank', logo: '🏪', users: '32M+' },
    { id: 'axis', name: 'Axis Bank', logo: '🏢', users: '28M+' },
    { id: 'other', name: 'Other Banks', logo: '🏦', users: '100M+' }
  ]

  const [selectedBank, setSelectedBank] = useState('')

  const handleConsentToggle = (stepId: string) => {
    const newConsents = new Set(consentsGiven)
    if (newConsents.has(stepId)) {
      newConsents.delete(stepId)
    } else {
      newConsents.add(stepId)
    }
    setConsentsGiven(newConsents)
  }

  const simulateAADataFetch = async () => {
    setIsProcessing(true)
    
    // Simulate API calls to Account Aggregator
    const steps = [
      'Connecting to Account Aggregator...',
      'Authenticating with bank...',
      'Fetching account information...',
      'Analyzing transaction patterns...',
      'Generating risk assessment...'
    ]

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500))
      // You could add progress updates here
    }

    // Simulate fetched financial data
    const mockFinancialData = {
      accounts: [
        {
          accountNumber: '****1234',
          bankName: bankOptions.find(b => b.id === selectedBank)?.name || 'Selected Bank',
          accountType: 'Savings',
          balance: 45750.50,
          currency: 'INR'
        }
      ],
      transactions: generateMockTransactions(),
      summary: {
        monthlyIncome: 55000,
        monthlyExpenses: 38500,
        averageBalance: 42000,
        transactionCount: 156,
        lastUpdated: new Date().toISOString()
      }
    }

    setSimulatedData(mockFinancialData)

    // Call backend risk assessment
    try {
      const response = await fetch('http://localhost:8001/score_risk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: `aa_user_${Date.now()}`,
          wallet_address: walletAddress || '0x1234567890abcdef',
          consent_aa: true,
          upi_data: convertToCSV(mockFinancialData.transactions)
        }),
      })

      if (response.ok) {
        const riskData = await response.json()
        setRiskAssessment(riskData)
        onRiskScoreReady?.(riskData)
      }
    } catch (error) {
      console.error('Risk assessment error:', error)
    }

    setIsProcessing(false)
    setShowResults(true)
    onConsentComplete?.(mockFinancialData)
  }

  const generateMockTransactions = () => {
    const transactions = []
    const categories = ['SALARY', 'GROCERY', 'UTILITIES', 'TRANSPORT', 'ENTERTAINMENT', 'HEALTHCARE']
    
    for (let i = 0; i < 20; i++) {
      const isCredit = Math.random() > 0.7
      transactions.push({
        id: `TXN${i.toString().padStart(3, '0')}`,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: isCredit ? Math.floor(Math.random() * 50000) + 5000 : -(Math.floor(Math.random() * 5000) + 100),
        type: isCredit ? 'CREDIT' : 'DEBIT',
        category: categories[Math.floor(Math.random() * categories.length)],
        description: `Transaction ${i + 1}`
      })
    }

    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const convertToCSV = (transactions: any[]) => {
    const headers = 'transaction_id,date,amount,type,category,description'
    const rows = transactions.map(t => 
      `${t.id},${t.date},${t.amount},${t.type},${t.category},${t.description}`
    )
    return [headers, ...rows].join('\n')
  }

  const allRequiredConsents = consentSteps.filter(step => step.required).every(step => 
    consentsGiven.has(step.id)
  )

  if (showResults && riskAssessment) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-8"
      >
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-3xl p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-green-800 mb-2">
              Financial Assessment Complete!
            </h2>
            <p className="text-green-600">
              Your Account Aggregator data has been successfully processed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Score */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                Risk Assessment
              </h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {riskAssessment.risk_score}
                </div>
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  riskAssessment.risk_category === 'LOW' ? 'bg-green-100 text-green-800' :
                  riskAssessment.risk_category === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {riskAssessment.risk_category} RISK
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" />
                Financial Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Income</span>
                  <span className="font-semibold">₹{riskAssessment.financial_profile.monthly_income.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Expenses</span>
                  <span className="font-semibold">₹{riskAssessment.financial_profile.monthly_expenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Balance</span>
                  <span className="font-semibold">₹{riskAssessment.financial_profile.average_balance.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {riskAssessment.recommendations && riskAssessment.recommendations.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Personalized Recommendations
              </h3>
              <div className="space-y-2">
                {riskAssessment.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
          Account Aggregator Consent
        </h2>
        <p className="text-xl text-gray-300">
          Secure access to your financial data for instant credit assessment
        </p>
      </motion.div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-400">Progress</span>
          <span className="text-sm text-gray-400">
            {consentsGiven.size} of {consentSteps.length} consents
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(consentsGiven.size / consentSteps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Bank Selection */}
      {consentsGiven.size === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-semibold text-white mb-6">Select Your Bank</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankOptions.map((bank) => (
              <motion.button
                key={bank.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedBank(bank.id)}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  selectedBank === bank.id
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }`}
              >
                <div className="text-3xl mb-2">{bank.logo}</div>
                <div className="text-white font-medium">{bank.name}</div>
                <div className="text-gray-400 text-sm">{bank.users} users</div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Consent Steps */}
      {selectedBank && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 mb-8"
        >
          <h3 className="text-2xl font-semibold text-white mb-6">Grant Permissions</h3>
          {consentSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-2xl border-2 transition-all ${
                consentsGiven.has(step.id)
                  ? 'border-green-500 bg-green-500/20'
                  : 'border-gray-600 bg-gray-800/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${
                  consentsGiven.has(step.id) ? 'bg-green-500' : 'bg-gray-600'
                }`}>
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-semibold text-white">{step.title}</h4>
                    {step.required && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 mb-4">{step.description}</p>
                  
                  <button
                    onClick={() => handleConsentToggle(step.id)}
                    className={`px-6 py-2 rounded-xl font-medium transition-all ${
                      consentsGiven.has(step.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-purple-500 text-white hover:bg-purple-600'
                    }`}
                  >
                    {consentsGiven.has(step.id) ? 'Granted' : 'Grant Permission'}
                  </button>
                </div>

                {consentsGiven.has(step.id) && (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Process Data Button */}
      {allRequiredConsents && selectedBank && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={simulateAADataFetch}
            disabled={isProcessing}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-2xl flex items-center gap-3 mx-auto disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing Financial Data...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Process Account Aggregator Data
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
          
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center"
            >
              <p className="text-gray-300 mb-4">Securely processing your financial data...</p>
              <div className="flex items-center justify-center gap-2">
                <Lock className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">End-to-end encrypted</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default AAConsentFlow
