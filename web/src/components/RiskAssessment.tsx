'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Shield, AlertTriangle, CheckCircle, XCircle, BarChart3, PieChart, DollarSign, Calendar, User, FileText, Target, Award, Zap, ArrowUp, ArrowDown } from 'lucide-react'

interface RiskAssessmentProps {
  financialData?: any
  documentData?: any
  walletAddress?: string
  userProfile?: any
  onAssessmentComplete?: (assessment: any) => void
}

interface RiskFactor {
  category: string
  score: number
  weight: number
  description: string
  status: 'excellent' | 'good' | 'fair' | 'poor'
  icon: any
}

export const RiskAssessment = ({ 
  financialData, 
  documentData, 
  walletAddress, 
  userProfile,
  onAssessmentComplete 
}: RiskAssessmentProps) => {
  const [assessment, setAssessment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentView, setCurrentView] = useState<'overview' | 'detailed' | 'recommendations'>('overview')
  const [animateCounters, setAnimateCounters] = useState(false)

  useEffect(() => {
    if (financialData || documentData) {
      generateComprehensiveAssessment()
    }
  }, [financialData, documentData])

  const generateComprehensiveAssessment = async () => {
    setIsLoading(true)
    
    try {
      // Combine financial and document data for comprehensive assessment
      const combinedData = {
        financial: financialData,
        documents: documentData,
        wallet: walletAddress,
        timestamp: new Date().toISOString()
      }

      // Call backend for financial risk scoring
      let backendAssessment = null
      if (financialData?.summary) {
        try {
          const response = await fetch('http://localhost:8001/score_risk', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: `risk_user_${Date.now()}`,
              wallet_address: walletAddress || '0x1234567890abcdef',
              consent_aa: true,
              upi_data: convertFinancialDataToCSV(financialData)
            }),
          })

          if (response.ok) {
            backendAssessment = await response.json()
          }
        } catch (error) {
          console.error('Backend assessment error:', error)
        }
      }

      // Generate comprehensive assessment
      const comprehensiveAssessment = generateDetailedAssessment(
        combinedData, 
        backendAssessment
      )

      setAssessment(comprehensiveAssessment)
      setAnimateCounters(true)
      onAssessmentComplete?.(comprehensiveAssessment)
      
    } catch (error) {
      console.error('Assessment generation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const convertFinancialDataToCSV = (data: any) => {
    if (!data?.transactions) return null
    
    const headers = 'transaction_id,date,amount,type,category,description'
    const rows = data.transactions.map((t: any) => 
      `${t.id},${t.date},${t.amount},${t.type},${t.category || 'OTHER'},${t.description || 'Transaction'}`
    )
    return [headers, ...rows].join('\n')
  }

  const generateDetailedAssessment = (combinedData: any, backendData: any) => {
    // Calculate risk factors
    const riskFactors: RiskFactor[] = [
      {
        category: 'Financial Stability',
        score: calculateFinancialScore(combinedData.financial),
        weight: 0.35,
        description: 'Income consistency and expense management',
        status: getScoreStatus(calculateFinancialScore(combinedData.financial)),
        icon: DollarSign
      },
      {
        category: 'Identity Verification',
        score: calculateIdentityScore(combinedData.documents),
        weight: 0.25,
        description: 'Document authenticity and completeness',
        status: getScoreStatus(calculateIdentityScore(combinedData.documents)),
        icon: Shield
      },
      {
        category: 'Transaction Behavior',
        score: calculateTransactionScore(combinedData.financial),
        weight: 0.20,
        description: 'Spending patterns and transaction frequency',
        status: getScoreStatus(calculateTransactionScore(combinedData.financial)),
        icon: BarChart3
      },
      {
        category: 'Digital Footprint',
        score: calculateDigitalScore(combinedData.wallet),
        weight: 0.20,
        description: 'Web3 activity and digital engagement',
        status: getScoreStatus(calculateDigitalScore(combinedData.wallet)),
        icon: Zap
      }
    ]

    // Calculate overall score
    const overallScore = riskFactors.reduce((acc, factor) => 
      acc + (factor.score * factor.weight), 0
    )

    // Use backend score if available, otherwise use calculated score
    const finalScore = backendData?.risk_score || Math.round(overallScore * 10)
    const riskCategory = backendData?.risk_category || getRiskCategory(finalScore)

    return {
      overallScore: finalScore,
      riskCategory,
      riskFactors,
      backendData,
      insights: generateInsights(riskFactors, finalScore),
      recommendations: generateRecommendations(riskFactors, riskCategory),
      financialMetrics: extractFinancialMetrics(combinedData.financial, backendData),
      identityMetrics: extractIdentityMetrics(combinedData.documents),
      timestamp: new Date().toISOString(),
      assessmentId: `RISK_${Date.now()}`
    }
  }

  const calculateFinancialScore = (financial: any) => {
    if (!financial?.summary) return 50

    const { monthlyIncome, monthlyExpenses, averageBalance } = financial.summary
    const savingsRate = (monthlyIncome - monthlyExpenses) / monthlyIncome
    const balanceScore = Math.min(averageBalance / 50000, 1) * 100
    const savingsScore = Math.max(0, savingsRate * 100)
    
    return Math.round((balanceScore * 0.6 + savingsScore * 0.4))
  }

  const calculateIdentityScore = (documents: any) => {
    if (!documents || !Array.isArray(documents)) return 60

    const totalDocs = documents.length
    const verifiedDocs = documents.filter((d: any) => d.status === 'verified').length
    const hasRequiredDocs = documents.some((d: any) => d.type === 'AADHAAR') && 
                           documents.some((d: any) => d.type === 'PAN')
    
    const baseScore = (verifiedDocs / Math.max(totalDocs, 1)) * 80
    const bonusScore = hasRequiredDocs ? 20 : 0
    
    return Math.round(baseScore + bonusScore)
  }

  const calculateTransactionScore = (financial: any) => {
    if (!financial?.transactions) return 55

    const transactions = financial.transactions
    const frequency = transactions.length
    const avgAmount = transactions.reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0) / frequency
    
    const frequencyScore = Math.min(frequency / 20, 1) * 50
    const amountScore = Math.min(avgAmount / 5000, 1) * 50
    
    return Math.round(frequencyScore + amountScore)
  }

  const calculateDigitalScore = (wallet: any) => {
    // Simulate web3 activity scoring
    return wallet ? 75 : 50
  }

  const getScoreStatus = (score: number): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (score >= 80) return 'excellent'
    if (score >= 65) return 'good'
    if (score >= 50) return 'fair'
    return 'poor'
  }

  const getRiskCategory = (score: number): string => {
    if (score >= 750) return 'VERY_LOW'
    if (score >= 650) return 'LOW'
    if (score >= 550) return 'MEDIUM'
    if (score >= 450) return 'HIGH'
    return 'VERY_HIGH'
  }

  const generateInsights = (factors: RiskFactor[], score: number) => {
    const insights = []
    
    const topFactor = factors.reduce((max, factor) => 
      factor.score > max.score ? factor : max
    )
    const weakestFactor = factors.reduce((min, factor) => 
      factor.score < min.score ? factor : min
    )

    insights.push(`Strongest area: ${topFactor.category} (${topFactor.score}/100)`)
    insights.push(`Area for improvement: ${weakestFactor.category} (${weakestFactor.score}/100)`)
    
    if (score >= 700) {
      insights.push('Excellent creditworthiness - qualify for premium financial products')
    } else if (score >= 600) {
      insights.push('Good financial profile with room for optimization')
    } else {
      insights.push('Focus on building financial stability and improving key metrics')
    }

    return insights
  }

  const generateRecommendations = (factors: RiskFactor[], category: string) => {
    const recommendations = []
    
    factors.forEach(factor => {
      if (factor.status === 'poor' || factor.status === 'fair') {
        switch (factor.category) {
          case 'Financial Stability':
            recommendations.push('Build emergency fund with 3-6 months of expenses')
            recommendations.push('Optimize monthly expenses and increase savings rate')
            break
          case 'Identity Verification':
            recommendations.push('Complete additional document verification')
            recommendations.push('Ensure all identity documents are current and verified')
            break
          case 'Transaction Behavior':
            recommendations.push('Maintain consistent transaction patterns')
            recommendations.push('Use digital payments more frequently')
            break
          case 'Digital Footprint':
            recommendations.push('Increase digital financial activity')
            recommendations.push('Consider exploring DeFi and Web3 opportunities')
            break
        }
      }
    })

    if (category === 'VERY_LOW' || category === 'LOW') {
      recommendations.push('Consider applying for premium credit products')
      recommendations.push('Explore investment opportunities to grow wealth')
    }

    return recommendations.length > 0 ? recommendations : ['Continue maintaining excellent financial habits']
  }

  const extractFinancialMetrics = (financial: any, backend: any) => {
    if (backend?.financial_profile) {
      return {
        monthlyIncome: backend.financial_profile.monthly_income,
        monthlyExpenses: backend.financial_profile.monthly_expenses,
        averageBalance: backend.financial_profile.average_balance,
        transactionFrequency: backend.financial_profile.transaction_frequency,
        incomeStability: backend.financial_profile.income_stability,
        debtToIncome: backend.financial_profile.debt_to_income_ratio
      }
    }

    return financial?.summary || {}
  }

  const extractIdentityMetrics = (documents: any) => {
    if (!documents) return {}

    return {
      documentsCount: documents.length,
      verifiedCount: documents.filter((d: any) => d.status === 'verified').length,
      verificationScore: documents.length > 0 ? 
        (documents.filter((d: any) => d.status === 'verified').length / documents.length) * 100 : 0
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 700) return 'text-green-600'
    if (score >= 600) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRiskCategoryColor = (category: string) => {
    switch (category) {
      case 'VERY_LOW':
      case 'LOW':
        return 'bg-green-100 text-green-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'HIGH':
      case 'VERY_HIGH':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-2xl font-semibold text-white mb-4">
            Generating Risk Assessment...
          </h3>
          <p className="text-gray-300">
            Analyzing your financial data and document verification results
          </p>
        </motion.div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Ready for Risk Assessment
          </h3>
          <p className="text-gray-300">
            Complete Account Aggregator consent and document verification to generate your risk assessment
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-4xl font-bold text-white mb-4">
          Comprehensive Risk Assessment
        </h2>
        <p className="text-xl text-gray-300">
          AI-powered financial analysis combining multiple data sources
        </p>
      </motion.div>

      {/* Navigation */}
      <div className="flex gap-4 mb-8">
        {(['overview', 'detailed', 'recommendations'] as const).map((view) => (
          <button
            key={view}
            onClick={() => setCurrentView(view)}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              currentView === view
                ? 'bg-purple-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {currentView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            {/* Overall Score */}
            <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-3xl p-8 border border-purple-500/30">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="text-8xl font-bold mb-4"
                >
                  <span className={getScoreColor(assessment.overallScore)}>
                    {animateCounters ? assessment.overallScore : 0}
                  </span>
                </motion.div>
                <div className={`inline-flex px-6 py-3 rounded-full text-lg font-semibold ${getRiskCategoryColor(assessment.riskCategory)}`}>
                  {assessment.riskCategory.replace('_', ' ')} RISK
                </div>
                <p className="text-gray-300 mt-4 text-lg">
                  Credit Score Range: 300-900
                </p>
              </div>
            </div>

            {/* Risk Factors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {assessment.riskFactors.map((factor: RiskFactor, index: number) => (
                <motion.div
                  key={factor.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 rounded-2xl p-6 border border-gray-600"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${
                      factor.status === 'excellent' ? 'bg-green-500' :
                      factor.status === 'good' ? 'bg-blue-500' :
                      factor.status === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      <factor.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-white">{factor.category}</h3>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-2xl font-bold text-white">{factor.score}</span>
                      <span className="text-sm text-gray-400">/ 100</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${factor.score}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                        className={`h-2 rounded-full ${
                          factor.status === 'excellent' ? 'bg-green-500' :
                          factor.status === 'good' ? 'bg-blue-500' :
                          factor.status === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm">{factor.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Key Insights */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-600">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" />
                Key Insights
              </h3>
              <div className="space-y-3">
                {assessment.insights.map((insight: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{insight}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {currentView === 'detailed' && (
          <motion.div
            key="detailed"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            {/* Financial Metrics */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-600">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Financial Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500 mb-2">
                    ₹{assessment.financialMetrics.monthlyIncome?.toLocaleString() || '0'}
                  </div>
                  <div className="text-gray-400">Monthly Income</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500 mb-2">
                    ₹{assessment.financialMetrics.monthlyExpenses?.toLocaleString() || '0'}
                  </div>
                  <div className="text-gray-400">Monthly Expenses</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500 mb-2">
                    ₹{assessment.financialMetrics.averageBalance?.toLocaleString() || '0'}
                  </div>
                  <div className="text-gray-400">Average Balance</div>
                </div>
              </div>
            </div>

            {/* Identity Metrics */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-600">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Identity Verification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500 mb-2">
                    {assessment.identityMetrics.verifiedCount || 0}
                  </div>
                  <div className="text-gray-400">Verified Documents</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-500 mb-2">
                    {assessment.identityMetrics.documentsCount || 0}
                  </div>
                  <div className="text-gray-400">Total Documents</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500 mb-2">
                    {Math.round(assessment.identityMetrics.verificationScore || 0)}%
                  </div>
                  <div className="text-gray-400">Verification Score</div>
                </div>
              </div>
            </div>

            {/* Backend Assessment Details */}
            {assessment.backendData && (
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-600">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  Advanced Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-3">Processing Metrics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Processing Time</span>
                        <span className="text-white">
                          {(assessment.backendData.processing_metrics?.processing_time || 0).toFixed(2)}s
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Transactions Analyzed</span>
                        <span className="text-white">
                          {assessment.backendData.processing_metrics?.transactions_analyzed || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Data Source</span>
                        <span className="text-white">
                          {assessment.backendData.processing_metrics?.data_source || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-3">Agent Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Algorithm</span>
                        <span className="text-white">
                          {assessment.backendData.agent_info?.algorithm || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Version</span>
                        <span className="text-white">
                          {assessment.backendData.agent_info?.version || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Compliance</span>
                        <span className="text-white">
                          {assessment.backendData.agent_info?.compliance || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {currentView === 'recommendations' && (
          <motion.div
            key="recommendations"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-600">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Personalized Recommendations
              </h3>
              <div className="space-y-4">
                {assessment.recommendations.map((rec: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-gray-700/50 rounded-xl"
                  >
                    <div className="p-2 bg-purple-500 rounded-lg flex-shrink-0">
                      <ArrowUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">Improvement Action</p>
                      <p className="text-gray-300">{rec}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Risk Factors Improvement */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-600">
              <h3 className="text-xl font-semibold text-white mb-6">
                Focus Areas for Score Improvement
              </h3>
              <div className="space-y-4">
                {assessment.riskFactors
                  .filter((factor: RiskFactor) => factor.status === 'fair' || factor.status === 'poor')
                  .map((factor: RiskFactor, index: number) => (
                    <div key={factor.category} className="p-4 bg-gray-700/50 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <factor.icon className="w-5 h-5 text-yellow-500" />
                        <h4 className="font-semibold text-white">{factor.category}</h4>
                        <span className="text-sm text-gray-400">Score: {factor.score}/100</span>
                      </div>
                      <p className="text-gray-300">{factor.description}</p>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RiskAssessment
