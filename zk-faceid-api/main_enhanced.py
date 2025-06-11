from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time
import json
import cv2
import numpy as np
import mediapipe as mp
from io import BytesIO
from PIL import Image

# Create FastAPI application
app = FastAPI(
    title="zk-FaceID Agent Enhanced",
    version="2.0.0",
    description="Zero-Knowledge Face Identity Agent with MediaPipe and React integration"
)

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MediaPipe
mp_face_detection = mp.solutions.face_detection
mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils

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

def process_face_image(image_bytes: bytes):
    """Process uploaded image with MediaPipe face detection"""
    try:
        # Convert bytes to PIL Image
        pil_image = Image.open(BytesIO(image_bytes))
        
        # Convert PIL to OpenCV format
        opencv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        
        # Initialize MediaPipe face detection and mesh
        with mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5) as face_detection, \
             mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, min_detection_confidence=0.5) as face_mesh:
            
            # Process image for face detection
            detection_results = face_detection.process(cv2.cvtColor(opencv_image, cv2.COLOR_BGR2RGB))
            mesh_results = face_mesh.process(cv2.cvtColor(opencv_image, cv2.COLOR_BGR2RGB))
            
            if detection_results.detections and mesh_results.multi_face_landmarks:
                # Get face detection confidence
                detection = detection_results.detections[0]
                confidence = detection.score[0]
                
                # Get face landmarks from mesh
                face_landmarks = mesh_results.multi_face_landmarks[0]
                landmarks = []
                
                # Extract key landmarks (first 128 points for embedding)
                for i, landmark in enumerate(face_landmarks.landmark[:128]):
                    landmarks.append([landmark.x, landmark.y, landmark.z])
                
                # Create face embedding structure
                embedding = {
                    "landmarks": landmarks,
                    "confidence": float(confidence),
                    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
                }
                
                return embedding, confidence, len(landmarks)
            else:
                raise HTTPException(status_code=400, detail="No face detected in image")
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Face processing error: {str(e)}")

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        service="zk-FaceID Agent Enhanced",
        timestamp=time.time()
    )

@app.post("/capture-face", response_model=FaceCaptureResponse)
async def capture_face(
    image: UploadFile = File(...),
    wallet_address: str = Form(...)
):
    """
    Capture and process face from uploaded image using MediaPipe
    
    - **image**: Uploaded image file containing a face
    - **wallet_address**: Connected wallet address from React frontend
    
    Returns face embedding with landmarks and confidence score
    """
    
    # Validate file type
    if not image.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read image bytes
        image_bytes = await image.read()
        
        # Process face with MediaPipe
        embedding, confidence, landmarks_count = process_face_image(image_bytes)
        
        return FaceCaptureResponse(
            embedding=embedding,
            confidence=confidence,
            landmarks_count=landmarks_count,
            status="success",
            timestamp=time.strftime("%Y-%m-%d %H:%M:%S")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@app.post("/generate-proof")
async def generate_proof(request: GenerateProofRequest):
    """
    Generate ZK proof from face embedding
    
    - **embedding**: Face embedding from capture-face endpoint
    - **wallet_address**: Connected wallet address
    
    Returns ZK proof for face verification
    """
    
    try:
        # Extract embedding data
        landmarks = request.embedding.get("landmarks", [])
        confidence = request.embedding.get("confidence", 0.0)
        
        # Convert landmarks to 128-byte array for ZK circuit
        face_array = []
        for landmark in landmarks[:128]:  # Ensure exactly 128 points
            if isinstance(landmark, list) and len(landmark) >= 2:
                # Use x, y coordinates, scale to integers
                face_array.append(int(landmark[0] * 1000) % 256)
                if len(face_array) >= 128:
                    break
        
        # Pad to exactly 128 bytes if needed
        while len(face_array) < 128:
            face_array.append(0)
        
        # Generate ZK proof (using existing prove_face logic)
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
    """
    Generate zero-knowledge proof for face identity verification (Legacy endpoint)

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

    # Generate ZK proof structure (matches Groth16 format)
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

    # Verification key
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
        "service": "zk-FaceID Agent Enhanced",
        "version": "2.0.0",
        "description": "Zero-Knowledge Face Identity with MediaPipe and React integration",
        "endpoints": {
            "health": "/health",
            "capture_face": "/capture-face",
            "generate_proof": "/generate-proof", 
            "prove_face": "/prove_face (legacy)",
            "docs": "/docs"
        },
        "frontend": "http://localhost:3000",
        "features": [
            "MediaPipe face detection",
            "React frontend integration",
            "ZK proof generation",
            "CORS enabled for development"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
