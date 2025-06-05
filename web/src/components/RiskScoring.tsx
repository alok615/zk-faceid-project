'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

interface RiskScoreData {
  overall_score: number
  risk_level: string
  factors: {
    credit_score: number
    income_stability: number
    debt_ratio: number
    employment_history: number
  }
  recommendation: string
  timestamp: string
}

interface UserData {
  age: string
  income: string
  creditScore: string
  employmentYears: string
  debtAmount: string
  loanAmount: string
}

export function RiskScoring() {
  const { address, isConnected } = useAccount()
  const [userData, setUserData] = useState<UserData>({
    age: '',
    income: '',
    creditScore: '',
    employmentYears: '',
    debtAmount: '',
    loanAmount: ''
  })
  const [riskScore, setRiskScore] = useState<RiskScoreData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<string>('Ready to assess risk')

  const handleInputChange = (field: keyof UserData, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const submitRiskAssessment = async () => {
    if (!isConnected || !address) {
      setStatus('Please connect your wallet first')
      return
    }

    // Validate required fields
    const requiredFields = ['age', 'income', 'creditScore', 'employmentYears']
    const missingFields = requiredFields.filter(field => !userData[field as keyof UserData])
    
    if (missingFields.length > 0) {
      setStatus(`Please fill in: ${missingFields.join(', ')}`)
      return
    }

    setIsProcessing(true)
    setStatus('Assessing risk profile...')

    try {
      // Prepare risk assessment data
      const assessmentData = {
        user_id: address,
        wallet_address: address,
        consented_data: {
          age: parseInt(userData.age),
          annual_income: parseInt(userData.income),
          credit_score: parseInt(userData.creditScore),
          employment_years: parseInt(userData.employmentYears),
          existing_debt: parseInt(userData.debtAmount || '0'),
          requested_loan: parseInt(userData.loanAmount || '50000')
        },
        timestamp: new Date().toISOString()
      }

      // Call the underwriting agent on port 8002
      const response = await fetch('http://localhost:8002/score_risk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData)
      })

      if (response.ok) {
        const result = await response.json()
        setRiskScore(result)
        setStatus('Risk assessment completed successfully!')
      } else {
        const error = await response.text()
        setStatus(`Assessment failed: ${error}`)
      }
    } catch (error) {
      setStatus('Error connecting to risk assessment service')
      console.error('Risk assessment error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForm = () => {
    setUserData({
      age: '',
      income: '',
      creditScore: '',
      employmentYears: '',
      debtAmount: '',
      loanAmount: ''
    })
    setRiskScore(null)
    setStatus('Ready to assess risk')
  }

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  if (!isConnected) {
    return (
      <div className="text-center text-gray-400 mt-8">
        <p>Please connect your wallet to access risk assessment</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Risk Assessment Portal
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Form Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Age</label>
              <input
                type="number"
                value={userData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Enter your age"
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Annual Income ($)</label>
              <input
                type="number"
                value={userData.income}
                onChange={(e) => handleInputChange('income', e.target.value)}
                placeholder="Enter annual income"
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Credit Score</label>
              <input
                type="number"
                value={userData.creditScore}
                onChange={(e) => handleInputChange('creditScore', e.target.value)}
                placeholder="Enter credit score (300-850)"
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Employment Years</label>
              <input
                type="number"
                value={userData.employmentYears}
                onChange={(e) => handleInputChange('employmentYears', e.target.value)}
                placeholder="Years of employment"
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Existing Debt ($)</label>
              <input
                type="number"
                value={userData.debtAmount}
                onChange={(e) => handleInputChange('debtAmount', e.target.value)}
                placeholder="Total existing debt"
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Loan Amount ($)</label>
              <input
                type="number"
                value={userData.loanAmount}
                onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                placeholder="Requested loan amount"
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={submitRiskAssessment}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? 'Assessing...' : 'Assess Risk'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Assessment Status</h3>
            <p className="text-gray-300">{status}</p>
          </div>

          {riskScore && (
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Risk Assessment Results</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Overall Score:</span>
                  <span className="text-white font-bold text-xl">{riskScore.overall_score}/100</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Risk Level:</span>
                  <span className={`font-bold ${getRiskLevelColor(riskScore.risk_level)}`}>
                    {riskScore.risk_level.toUpperCase()}
                  </span>
                </div>

                <div className="border-t border-gray-700 pt-3 mt-3">
                  <h4 className="text-sm font-semibold text-white mb-2">Risk Factors:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Credit Score:</span>
                      <span className="text-white">{riskScore.factors.credit_score}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Income Stability:</span>
                      <span className="text-white">{riskScore.factors.income_stability}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Debt Ratio:</span>
                      <span className="text-white">{riskScore.factors.debt_ratio}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Employment History:</span>
                      <span className="text-white">{riskScore.factors.employment_history}/100</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-3 mt-3">
                  <h4 className="text-sm font-semibold text-white mb-2">Recommendation:</h4>
                  <p className="text-gray-300 text-sm">{riskScore.recommendation}</p>
                </div>

                <div className="text-xs text-gray-500 mt-3">
                  Assessed: {riskScore.timestamp}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
