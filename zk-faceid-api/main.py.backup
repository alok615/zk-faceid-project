from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import time
import json

# Create FastAPI application
app = FastAPI(
    title="zk-FaceID Agent", 
    version="1.0.0",
    description="Zero-Knowledge Face Identity Agent for secure face verification"
)

# Request model for face proof
class FaceProofRequest(BaseModel):
    face_embedding: List[int]  # 128-byte face embedding array
    user_id: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "face_embedding": [1, 2, 3, 4, 5] + [0] * 123,  # 128 bytes total
                "user_id": "user_123"
            }
        }

# Response model for face proof
class FaceProofResponse(BaseModel):
    proof: dict
    public_signals: List[str]
    verification_key: dict
    timestamp: float
    user_id: str
    status: str

# Health check response
class HealthResponse(BaseModel):
    status: str
    service: str
    timestamp: float

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        service="zk-FaceID Agent",
        timestamp=time.time()
    )

@app.post("/prove_face", response_model=FaceProofResponse)
async def prove_face(request: FaceProofRequest):
    """
    Generate zero-knowledge proof for face identity verification
    
    - **face_embedding**: 128-byte array representing face embedding hash
    - **user_id**: Unique identifier for the user
    
    Returns a ZK proof that proves identity without revealing face data
    """
    
    # Validate face embedding size
    if len(request.face_embedding) != 128:
        raise HTTPException(
            status_code=400, 
            detail=f"Face embedding must be exactly 128 bytes, got {len(request.face_embedding)}"
        )
    
    # Generate dummy ZK proof structure (matches Groth16 format)
    dummy_proof = {
        "pi_a": [
            f"dummy_a1_{hash(str(request.face_embedding[:10]))}",
            f"dummy_a2_{hash(str(request.face_embedding[10:20]))}",
            "1"
        ],
        "pi_b": [
            [f"dummy_b1_{hash(str(request.face_embedding[20:30]))}", 
             f"dummy_b2_{hash(str(request.face_embedding[30:40]))}"],
            [f"dummy_b3_{hash(str(request.face_embedding[40:50]))}", 
             f"dummy_b4_{hash(str(request.face_embedding[50:60]))}"],
            ["1", "0"]
        ],
        "pi_c": [
            f"dummy_c1_{hash(str(request.face_embedding[60:70]))}",
            f"dummy_c2_{hash(str(request.face_embedding[70:80]))}",
            "1"
        ],
        "protocol": "groth16",
        "curve": "bn128"
    }
    
    # Dummy verification key
    verification_key = {
        "alpha": "dummy_alpha_key",
        "beta": "dummy_beta_key", 
        "gamma": "dummy_gamma_key",
        "delta": "dummy_delta_key",
        "ic": ["dummy_ic_0", "dummy_ic_1"]
    }
    
    return FaceProofResponse(
        proof=dummy_proof,
        public_signals=["1", request.user_id, str(int(time.time()))],
        verification_key=verification_key,
        timestamp=time.time(),
        user_id=request.user_id,
        status="proof_generated"
    )

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "service": "zk-FaceID Agent",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "prove_face": "/prove_face",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
