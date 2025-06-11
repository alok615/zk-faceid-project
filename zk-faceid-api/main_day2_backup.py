from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import time
import json
from PIL import Image
from io import BytesIO

# Create FastAPI application
app = FastAPI(
    title="zk-FaceID Agent Simplified",
    version="1.0.1",
    description="Simplified Zero-Knowledge Face Identity Agent for Python 3.13 without MediaPipe"
)

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

# Request model for ZK proof generation
class GenerateProofRequest(BaseModel):
    embedding: dict
    wallet_address: str

# Response model for face proof
class FaceProofResponse(BaseModel):
    proof: dict
    public_signals: List[str]
    verification_key: dict
    timestamp: float
    user_id: str
    status: str

# Response model for face capture
class FaceCaptureResponse(BaseModel):
    embedding: dict
    confidence: float
    landmarks_count: int
    status: str
    timestamp: str

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
        service="zk-FaceID Agent Simplified",
        timestamp=time.time()
    )

@app.post("/capture-face", response_model=FaceCaptureResponse)
async def capture_face(
    image: UploadFile = File(...),
    wallet_address: str = Form(...)
):
    """
    Simulate face capture and processing from uploaded image
    """
    if not image.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        image_bytes = await image.read()
        # Simulate processing by loading image with Pillow
        pil_image = Image.open(BytesIO(image_bytes))
        width, height = pil_image.size
        
        # Create dummy embedding data that simulates MediaPipe landmarks
        embedding = {
            "landmarks": [[0.1 + (i * 0.001), 0.2 + (i * 0.002), 0.0] for i in range(128)],
            "confidence": 0.95,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "image_size": f"{width}x{height}"
        }
        
        return FaceCaptureResponse(
            embedding=embedding,
            confidence=0.95,
            landmarks_count=128,
            status="success",
            timestamp=time.strftime("%Y-%m-%d %H:%M:%S")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@app.post("/generate-proof")
async def generate_proof(request: GenerateProofRequest):
    """
    Generate ZK proof from face embedding
    """
    try:
        landmarks = request.embedding.get("landmarks", [])
        confidence = request.embedding.get("confidence", 0.0)
        
        # Convert landmarks to 128-byte array for ZK circuit
        face_array = []
        for landmark in landmarks[:128]:
            if isinstance(landmark, list) and len(landmark) >= 2:
                face_array.append(int(landmark[0] * 1000) % 256)
                if len(face_array) >= 128:
                    break
        
        # Pad to exactly 128 bytes if needed
        while len(face_array) < 128:
            face_array.append(0)
        
        # Generate ZK proof structure
        dummy_proof = {
            "pi_a": [
                f"proof_a1_{hash(str(face_array[:10]))}",
                f"proof_a2_{hash(str(face_array[10:20]))}",
                "1"
            ],
            "pi_b": [
                [f"proof_b1_{hash(str(face_array[20:30]))}",
                 f"proof_b2_{hash(str(face_array[30:40]))}"],
                [f"proof_b3_{hash(str(face_array[40:50]))}",
                 f"proof_b4_{hash(str(face_array[50:60]))}"],
                ["1", "0"]
            ],
            "pi_c": [
                f"proof_c1_{hash(str(face_array[60:70]))}",
                f"proof_c2_{hash(str(face_array[70:80]))}",
                "1"
            ],
            "protocol": "groth16",
            "curve": "bn128"
        }
        
        verification_key = {
            "alpha": f"vk_alpha_{request.wallet_address[:8]}",
            "beta": f"vk_beta_{int(time.time())}",
            "gamma": "vk_gamma_face_verification",
            "delta": f"vk_delta_{confidence}",
            "ic": [f"vk_ic_0_{len(landmarks)}", "vk_ic_1_face"]
        }
        
        return {
            "proof": dummy_proof,
            "public_signals": [
                "1",  # Valid proof
                request.wallet_address,
                str(int(time.time())),
                str(int(confidence * 100))
            ],
            "verification_key": verification_key,
            "timestamp": time.time(),
            "wallet_address": request.wallet_address,
            "status": "proof_generated",
            "confidence": confidence
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proof generation error: {str(e)}")

@app.post("/prove_face", response_model=FaceProofResponse)
async def prove_face(request: FaceProofRequest):
    """Legacy endpoint for face proof generation"""
    if len(request.face_embedding) != 128:
        raise HTTPException(
            status_code=400,
            detail=f"Face embedding must be exactly 128 bytes, got {len(request.face_embedding)}"
        )

    dummy_proof = {
        "pi_a": [f"legacy_a1_{hash(str(request.face_embedding[:10]))}", f"legacy_a2_{hash(str(request.face_embedding[10:20]))}", "1"],
        "pi_b": [[f"legacy_b1_{hash(str(request.face_embedding[20:30]))}", f"legacy_b2_{hash(str(request.face_embedding[30:40]))}"], [f"legacy_b3_{hash(str(request.face_embedding[40:50]))}", f"legacy_b4_{hash(str(request.face_embedding[50:60]))}"], ["1", "0"]],
        "pi_c": [f"legacy_c1_{hash(str(request.face_embedding[60:70]))}", f"legacy_c2_{hash(str(request.face_embedding[70:80]))}", "1"],
        "protocol": "groth16",
        "curve": "bn128"
    }

    verification_key = {
        "alpha": "legacy_alpha_key",
        "beta": "legacy_beta_key", 
        "gamma": "legacy_gamma_key",
        "delta": "legacy_delta_key",
        "ic": ["legacy_ic_0", "legacy_ic_1"]
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
        "service": "zk-FaceID Agent Simplified",
        "version": "1.0.1",
        "description": "Simplified Zero-Knowledge Face Identity Agent for Python 3.13 without MediaPipe",
        "endpoints": {
            "health": "/health",
            "capture_face": "/capture-face",
            "generate_proof": "/generate-proof",
            "prove_face": "/prove_face (legacy)",
            "docs": "/docs"
        },
        "frontend": "http://localhost:3000",
        "features": [
            "Image upload processing",
            "React frontend integration", 
            "ZK proof generation",
            "CORS enabled for development",
            "Python 3.13 compatible"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
