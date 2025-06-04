from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import time
import random
from enum import Enum

# Create FastAPI application
app = FastAPI(
    title="Underwriting Agent", 
    version="1.0.0",
    description="AI-powered underwriting and risk assessment agent for financial applications"
)

# Enums for better type safety
class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"

class UnderwritingDecision(str, Enum):
    APPROVED = "approved"
    CONDITIONALLY_APPROVED = "conditionally_approved"
    DECLINED = "declined"
    REQUIRES_MANUAL_REVIEW = "requires_manual_review"

# Request models
class ApplicantData(BaseModel):
    age: int = Field(ge=18, le=100, description="Applicant age")
    income: float = Field(ge=0, description="Annual income")
    credit_score: int = Field(ge=300, le=850, description="Credit score")
    employment_years: float = Field(ge=0, description="Years of employment")
    debt_to_income_ratio: float = Field(ge=0, le=1, description="Debt to income ratio")
    loan_amount: float = Field(ge=0, description="Requested loan amount")
    loan_purpose: str = Field(description="Purpose of the loan")
    
    class Config:
        json_schema_extra = {
            "example": {
                "age": 35,
                "income": 75000.0,
                "credit_score": 720,
                "employment_years": 8.5,
                "debt_to_income_ratio": 0.35,
                "loan_amount": 250000.0,
                "loan_purpose": "home_purchase"
            }
        }

class RiskAssessmentRequest(BaseModel):
    applicant_data: ApplicantData
    zk_face_proof: Optional[Dict] = Field(None, description="ZK face identity proof from zk-FaceID agent")
    additional_factors: Optional[Dict] = Field(None, description="Additional risk factors")

# Response models
class RiskScore(BaseModel):
    overall_score: float = Field(ge=0, le=1, description="Overall risk score (0=low risk, 1=high risk)")
    credit_risk: float = Field(ge=0, le=1, description="Credit risk component")
    income_risk: float = Field(ge=0, le=1, description="Income stability risk")
    debt_risk: float = Field(ge=0, le=1, description="Debt burden risk")
    identity_risk: float = Field(ge=0, le=1, description="Identity verification risk")

class UnderwritingResponse(BaseModel):
    decision: UnderwritingDecision
    risk_level: RiskLevel
    risk_scores: RiskScore
    confidence: float = Field(ge=0, le=1, description="Confidence in the decision")
    max_approved_amount: Optional[float] = Field(None, description="Maximum approved loan amount")
    interest_rate_adjustment: float = Field(description="Suggested interest rate adjustment (basis points)")
    conditions: List[str] = Field(description="Conditions for approval")
    explanation: str = Field(description="Human-readable explanation")
    processing_time_ms: float
    timestamp: float
    applicant_id: str

class HealthResponse(BaseModel):
    status: str
    service: str
    timestamp: float
    models_loaded: bool

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        service="Underwriting Agent",
        timestamp=time.time(),
        models_loaded=True
    )

@app.post("/score_risk", response_model=UnderwritingResponse)
async def score_risk(request: RiskAssessmentRequest):
    """
    Perform comprehensive risk assessment and underwriting decision
    
    - **applicant_data**: Complete applicant financial profile
    - **zk_face_proof**: Optional ZK proof for identity verification
    - **additional_factors**: Optional additional risk factors
    
    Returns comprehensive risk assessment and underwriting decision
    """
    
    start_time = time.time()
    
    # Extract applicant data
    applicant = request.applicant_data
    
    # Calculate individual risk components
    credit_risk = calculate_credit_risk(applicant.credit_score)
    income_risk = calculate_income_risk(applicant.income, applicant.employment_years)
    debt_risk = calculate_debt_risk(applicant.debt_to_income_ratio)
    identity_risk = calculate_identity_risk(request.zk_face_proof)
    
    # Calculate overall risk score (weighted average)
    overall_score = (
        credit_risk * 0.4 +
        income_risk * 0.25 +
        debt_risk * 0.25 +
        identity_risk * 0.1
    )
    
    risk_scores = RiskScore(
        overall_score=overall_score,
        credit_risk=credit_risk,
        income_risk=income_risk,
        debt_risk=debt_risk,
        identity_risk=identity_risk
    )
    
    # Determine risk level
    if overall_score <= 0.3:
        risk_level = RiskLevel.LOW
    elif overall_score <= 0.5:
        risk_level = RiskLevel.MEDIUM
    elif overall_score <= 0.7:
        risk_level = RiskLevel.HIGH
    else:
        risk_level = RiskLevel.VERY_HIGH
    
    # Make underwriting decision
    decision, max_amount, rate_adjustment, conditions = make_underwriting_decision(
        applicant, overall_score, risk_level
    )
    
    # Calculate confidence (inverse of risk with some randomness)
    confidence = min(0.95, max(0.5, 1 - overall_score + random.uniform(-0.1, 0.1)))
    
    # Generate explanation
    explanation = generate_explanation(decision, risk_scores, applicant)
    
    processing_time = (time.time() - start_time) * 1000
    
    return UnderwritingResponse(
        decision=decision,
        risk_level=risk_level,
        risk_scores=risk_scores,
        confidence=confidence,
        max_approved_amount=max_amount,
        interest_rate_adjustment=rate_adjustment,
        conditions=conditions,
        explanation=explanation,
        processing_time_ms=processing_time,
        timestamp=time.time(),
        applicant_id=f"applicant_{hash(str(applicant.dict())) % 10000}"
    )

def calculate_credit_risk(credit_score: int) -> float:
    """Calculate credit risk based on credit score"""
    if credit_score >= 750:
        return 0.1
    elif credit_score >= 700:
        return 0.3
    elif credit_score >= 650:
        return 0.5
    elif credit_score >= 600:
        return 0.7
    else:
        return 0.9

def calculate_income_risk(income: float, employment_years: float) -> float:
    """Calculate income stability risk"""
    income_factor = max(0, 1 - (income / 100000))  # Lower risk for higher income
    employment_factor = max(0, 1 - (employment_years / 10))  # Lower risk for longer employment
    return (income_factor + employment_factor) / 2

def calculate_debt_risk(debt_to_income: float) -> float:
    """Calculate debt burden risk"""
    if debt_to_income <= 0.3:
        return 0.2
    elif debt_to_income <= 0.4:
        return 0.4
    elif debt_to_income <= 0.5:
        return 0.7
    else:
        return 0.9

def calculate_identity_risk(zk_proof: Optional[Dict]) -> float:
    """Calculate identity verification risk"""
    if zk_proof and zk_proof.get("status") == "proof_generated":
        return 0.1  # Very low risk with valid ZK proof
    else:
        return 0.5  # Medium risk without ZK proof

def make_underwriting_decision(applicant: ApplicantData, overall_score: float, risk_level: RiskLevel):
    """Make underwriting decision based on risk assessment"""
    loan_to_income = applicant.loan_amount / applicant.income
    
    if overall_score <= 0.3 and loan_to_income <= 4:
        return (
            UnderwritingDecision.APPROVED,
            applicant.loan_amount,
            0,  # No rate adjustment
            ["Standard terms apply"]
        )
    elif overall_score <= 0.5 and loan_to_income <= 5:
        return (
            UnderwritingDecision.CONDITIONALLY_APPROVED,
            min(applicant.loan_amount, applicant.income * 4),
            25,  # 25 basis points increase
            ["Income verification required", "Collateral assessment needed"]
        )
    elif overall_score <= 0.7:
        return (
            UnderwritingDecision.REQUIRES_MANUAL_REVIEW,
            min(applicant.loan_amount * 0.8, applicant.income * 3),
            50,  # 50 basis points increase
            ["Manual underwriter review", "Additional documentation required", "Co-signer may be needed"]
        )
    else:
        return (
            UnderwritingDecision.DECLINED,
            None,
            0,
            ["Risk level too high for automatic approval"]
        )

def generate_explanation(decision: UnderwritingDecision, risk_scores: RiskScore, applicant: ApplicantData) -> str:
    """Generate human-readable explanation"""
    explanations = []
    
    if risk_scores.credit_risk <= 0.3:
        explanations.append("Excellent credit score")
    elif risk_scores.credit_risk >= 0.7:
        explanations.append("Credit score requires attention")
    
    if risk_scores.debt_risk <= 0.3:
        explanations.append("Low debt-to-income ratio")
    elif risk_scores.debt_risk >= 0.7:
        explanations.append("High debt burden")
    
    if risk_scores.identity_risk <= 0.2:
        explanations.append("Identity verified with ZK proof")
    
    base_explanation = f"Decision: {decision.value}. "
    if explanations:
        base_explanation += "Key factors: " + ", ".join(explanations) + "."
    
    return base_explanation

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "service": "Underwriting Agent",
        "version": "1.0.0",
        "description": "AI-powered risk assessment and underwriting decisions",
        "endpoints": {
            "health": "/health",
            "score_risk": "/score_risk",
            "docs": "/docs"
        },
        "risk_levels": [level.value for level in RiskLevel],
        "decisions": [decision.value for decision in UnderwritingDecision]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
