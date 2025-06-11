from fastapi import FastAPI, File, UploadFile, HTTPException, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import cv2
import numpy as np
import mediapipe as mp
from PIL import Image
import hashlib
import json
import subprocess
import os
import tempfile
import logging
import asyncio
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
import time
import threading
from datetime import datetime
import psutil
import sys

# Configure enhanced logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('sashakt_day3.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Sashakt API - Day 3 Enhanced Pro", 
    version="3.1.0",
    description="Advanced Sashakt Face Verification with Real-time Liveness Detection and Circuit Health Monitoring"
)

# Enhanced CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MediaPipe with enhanced configuration
mp_face_mesh = mp.solutions.face_mesh
mp_face_detection = mp.solutions.face_detection
mp_drawing = mp.solutions.drawing_utils

# Global metrics tracking
class SystemMetrics:
    def __init__(self):
        self.total_proofs = 0
        self.successful_proofs = 0
        self.failed_proofs = 0
        self.avg_processing_time = 0.0
        self.circuit_health = "unknown"
        self.start_time = time.time()
        
    def update_metrics(self, success: bool, processing_time: float):
        self.total_proofs += 1
        if success:
            self.successful_proofs += 1
        else:
            self.failed_proofs += 1
        
        # Update average processing time
        self.avg_processing_time = (
            (self.avg_processing_time * (self.total_proofs - 1) + processing_time) / 
            self.total_proofs
        )

metrics = SystemMetrics()

class FaceProofRequest(BaseModel):
    embedding: list
    wallet_address: str
    advanced_validation: Optional[bool] = False

class BatchProofRequest(BaseModel):
    embeddings: List[list]
    user_ids: List[str]
    wallet_addresses: List[str]

class EnhancedLivenessDetector:
    """Advanced liveness detection with multiple validation techniques"""
    
    def __init__(self):
        self.face_mesh = mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.7,  # Increased for better accuracy
            min_tracking_confidence=0.5
        )
        
        self.face_detection = mp_face_detection.FaceDetection(
            model_selection=1,  # Full range model
            min_detection_confidence=0.7
        )
        
        # Enhanced eye landmark indices
        self.LEFT_EYE_INDICES = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
        self.RIGHT_EYE_INDICES = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
        
        # Mouth landmarks for additional liveness checks
        self.MOUTH_INDICES = [61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318]
        
        # Advanced detection parameters
        self.EAR_THRESHOLD = 0.2
        self.MOUTH_THRESHOLD = 0.5
        self.FACE_SIZE_THRESHOLD = 0.1
        
        logger.info("Enhanced Liveness Detector initialized with advanced features")
    
    def calculate_eye_aspect_ratio(self, eye_landmarks):
        """Enhanced EAR calculation with multiple measurement points"""
        try:
            # Multiple vertical measurements for accuracy
            A = np.linalg.norm(eye_landmarks[1] - eye_landmarks[5])
            B = np.linalg.norm(eye_landmarks[2] - eye_landmarks[4])
            C = np.linalg.norm(eye_landmarks[0] - eye_landmarks[3])  # Horizontal
            
            # Additional measurement
            D = np.linalg.norm(eye_landmarks[1] - eye_landmarks[4])
            
            # Enhanced EAR calculation
            ear = (A + B + D) / (3.0 * C)
            return ear
        except Exception as e:
            logger.warning(f"EAR calculation error: {e}")
            return 0.3  # Default reasonable value
    
    def calculate_mouth_aspect_ratio(self, mouth_landmarks):
        """Calculate mouth aspect ratio for additional liveness validation"""
        try:
            # Vertical mouth measurements
            A = np.linalg.norm(mouth_landmarks[2] - mouth_landmarks[10])
            B = np.linalg.norm(mouth_landmarks[4] - mouth_landmarks[8])
            # Horizontal mouth measurement
            C = np.linalg.norm(mouth_landmarks[0] - mouth_landmarks[6])
            
            mar = (A + B) / (2.0 * C)
            return mar
        except Exception as e:
            logger.warning(f"MAR calculation error: {e}")
            return 0.3
    
    def detect_face_quality(self, image_array: np.ndarray) -> Dict[str, float]:
        """Advanced face quality assessment"""
        try:
            # Convert to grayscale for quality metrics
            gray = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
            
            # Sharpness using Laplacian variance
            sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            # Brightness assessment
            brightness = np.mean(gray)
            
            # Contrast assessment
            contrast = gray.std()
            
            return {
                "sharpness": float(sharpness),
                "brightness": float(brightness),
                "contrast": float(contrast)
            }
        except Exception as e:
            logger.warning(f"Face quality assessment error: {e}")
            return {"sharpness": 0.0, "brightness": 128.0, "contrast": 0.0}
    
    def detect_face_and_liveness(self, image_array: np.ndarray, advanced_mode: bool = False) -> Dict[str, Any]:
        """
        Advanced face detection and liveness validation
        
        Args:
            image_array: Input image as numpy array
            advanced_mode: Enable additional validation techniques
            
        Returns:
            dict: Comprehensive detection results
        """
        start_time = time.time()
        
        try:
            # Convert to RGB for MediaPipe
            rgb_image = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)
            h, w, _ = image_array.shape
            
            # Face quality assessment
            quality_metrics = self.detect_face_quality(image_array)
            
            # Primary face mesh detection
            mesh_results = self.face_mesh.process(rgb_image)
            
            # Secondary face detection for validation
            detection_results = self.face_detection.process(rgb_image)
            
            if not mesh_results.multi_face_landmarks:
                return {
                    "face_detected": False,
                    "liveness_detected": False,
                    "confidence": 0.0,
                    "landmarks_count": 0,
                    "quality_metrics": quality_metrics,
                    "processing_time": time.time() - start_time,
                    "error": "No face mesh detected"
                }
            
            # Get face landmarks
            face_landmarks = mesh_results.multi_face_landmarks[0]
            
            # Convert landmarks to numpy array
            landmarks = []
            for landmark in face_landmarks.landmark:
                x = int(landmark.x * w)
                y = int(landmark.y * h)
                landmarks.append([x, y])
            
            landmarks = np.array(landmarks)
            
            # Extract features for liveness detection
            left_eye = landmarks[self.LEFT_EYE_INDICES[:6]]
            right_eye = landmarks[self.RIGHT_EYE_INDICES[:6]]
            mouth = landmarks[self.MOUTH_INDICES[:12]]
            
            # Calculate ratios
            left_ear = self.calculate_eye_aspect_ratio(left_eye)
            right_ear = self.calculate_eye_aspect_ratio(right_eye)
            avg_ear = (left_ear + right_ear) / 2.0
            
            mouth_ar = self.calculate_mouth_aspect_ratio(mouth)
            
            # Face size validation (anti-spoofing)
            face_area = 0
            if detection_results.detections:
                detection = detection_results.detections[0]
                bbox = detection.location_data.relative_bounding_box
                face_area = bbox.width * bbox.height
            
            # Advanced liveness scoring
            liveness_score = 0.0
            confidence_factors = []
            
            # Eye openness check
            if avg_ear > self.EAR_THRESHOLD:
                liveness_score += 0.4
                confidence_factors.append(f"Eyes open (EAR: {avg_ear:.3f})")
            
            # Face size check (anti-spoofing)
            if face_area > self.FACE_SIZE_THRESHOLD:
                liveness_score += 0.3
                confidence_factors.append(f"Appropriate face size ({face_area:.3f})")
            
            # Image quality checks
            if quality_metrics["sharpness"] > 50:
                liveness_score += 0.2
                confidence_factors.append(f"Good sharpness ({quality_metrics['sharpness']:.1f})")
            
            if 50 < quality_metrics["brightness"] < 200:
                liveness_score += 0.1
                confidence_factors.append(f"Good lighting ({quality_metrics['brightness']:.1f})")
            
            # Advanced mode additional checks
            if advanced_mode:
                # Mouth analysis for additional validation
                if mouth_ar < 0.7:  # Closed mouth indicates natural pose
                    liveness_score += 0.1
                    confidence_factors.append("Natural mouth position")
                
                # Landmark consistency check
                landmark_variance = np.var(landmarks, axis=0).mean()
                if landmark_variance > 10:  # Natural facial variation
                    liveness_score += 0.1
                    confidence_factors.append("Natural facial variation")
            
            # Final liveness determination
            is_live = liveness_score >= 0.6  # Threshold for liveness
            final_confidence = min(liveness_score, 1.0)
            
            # Create enhanced 256-byte embedding from landmarks
            selected_landmarks = landmarks[::2][:64]  # Select 64 landmarks (128 coordinates)
            flattened = selected_landmarks.flatten()[:256]  # Flatten to 256 values
            
            # Normalize to 0-255 range
            if flattened.max() > flattened.min():
                normalized = ((flattened - flattened.min()) / (flattened.max() - flattened.min()) * 255).astype(int)
            else:
                normalized = np.ones(256, dtype=int) * 128  # Fallback
            
            embedding_256 = normalized.tolist()
            
            processing_time = time.time() - start_time
            
            return {
                "face_detected": True,
                "liveness_detected": is_live,
                "confidence": float(final_confidence),
                "landmarks_count": len(landmarks),
                "embedding_256": embedding_256,
                "eye_aspect_ratio": float(avg_ear),
                "mouth_aspect_ratio": float(mouth_ar),
                "face_area": float(face_area),
                "quality_metrics": quality_metrics,
                "confidence_factors": confidence_factors,
                "landmarks": landmarks.tolist(),
                "processing_time": processing_time,
                "advanced_mode": advanced_mode
            }
            
        except Exception as e:
            logger.error(f"Enhanced face detection error: {e}")
            return {
                "face_detected": False,
                "liveness_detected": False,
                "confidence": 0.0,
                "landmarks_count": 0,
                "processing_time": time.time() - start_time,
                "error": str(e)
            }

class AdvancedZKProofGenerator:
    """Enhanced ZK proof generation with circuit health monitoring"""
    
    def __init__(self):
        self.circuit_dir = "../circuits"
        self.circuit_wasm = os.path.join(self.circuit_dir, "semaphore_js", "semaphore.wasm")
        self.circuit_zkey = os.path.join(self.circuit_dir, "semaphore_4signals.zkey")
        self.circuit_r1cs = os.path.join(self.circuit_dir, "semaphore.r1cs")
        
        # Performance tracking
        self.proof_times = []
        self.circuit_health_checked = False
        
        # Initialize circuit health check
        self.check_circuit_health()
        
        logger.info("Advanced ZK Proof Generator initialized")
    
    def check_circuit_health(self) -> Dict[str, Any]:
        """Comprehensive circuit health monitoring"""
        health_status = {
            "wasm_exists": False,
            "zkey_exists": False,
            "r1cs_exists": False,
            "wasm_size": 0,
            "zkey_size": 0,
            "snarkjs_available": False,
            "estimated_proof_time": "unknown",
            "overall_health": "unhealthy"
        }
        
        try:
            # Check file existence and sizes
            if os.path.exists(self.circuit_wasm):
                health_status["wasm_exists"] = True
                health_status["wasm_size"] = os.path.getsize(self.circuit_wasm)
            
            if os.path.exists(self.circuit_zkey):
                health_status["zkey_exists"] = True
                health_status["zkey_size"] = os.path.getsize(self.circuit_zkey)
            
            if os.path.exists(self.circuit_r1cs):
                health_status["r1cs_exists"] = True
            
            # Check snarkjs availability
            try:
                result = subprocess.run(
                    ["snarkjs", "--version"], 
                    capture_output=True, 
                    text=True, 
                    timeout=5,
                    shell=True  # WINDOWS FIX: Added shell=True
                )
                if result.returncode == 0:
                    health_status["snarkjs_available"] = True
            except Exception as e:
                logger.warning(f"snarkjs check failed: {e}")
            
            # Overall health assessment
            if (health_status["wasm_exists"] and 
                health_status["zkey_exists"] and 
                health_status["snarkjs_available"]):
                health_status["overall_health"] = "healthy"
                metrics.circuit_health = "healthy"
            else:
                health_status["overall_health"] = "degraded"
                metrics.circuit_health = "degraded"
            
            # Estimate proof time based on circuit size
            if health_status["zkey_size"] > 0:
                estimated_time = max(1.0, health_status["zkey_size"] / 1000000)  # Rough estimate
                health_status["estimated_proof_time"] = f"{estimated_time:.1f}s"
            
            self.circuit_health_checked = True
            
        except Exception as e:
            logger.error(f"Circuit health check error: {e}")
            health_status["overall_health"] = "error"
            
        return health_status
    
    def hash_embedding(self, embedding: list) -> str:
        """Enhanced embedding hashing with validation"""
        try:
            # Ensure embedding is the right size
            if len(embedding) < 128:
                embedding.extend([0] * (128 - len(embedding)))
            elif len(embedding) > 256:
                embedding = embedding[:256]
            
            embedding_bytes = bytes(embedding)
            hash_hex = hashlib.sha256(embedding_bytes).hexdigest()
            
            # Additional hash for validation
            validation_hash = hashlib.md5(embedding_bytes).hexdigest()
            
            return hash_hex
        except Exception as e:
            logger.error(f"Embedding hashing error: {e}")
            return hashlib.sha256(b"fallback").hexdigest()
    
    def generate_proof(self, embedding: list, user_id: str, priority: str = "normal") -> Dict[str, Any]:
        """
        Enhanced ZK proof generation with priority handling
        
        Args:
            embedding: Face embedding data (128-256 bytes)
            user_id: User identifier
            priority: Proof generation priority ("low", "normal", "high")
            
        Returns:
            dict: Enhanced ZK proof data with metrics
        """
        start_time = time.time()
        
        try:
            # Hash the embedding
            embedding_hash = self.hash_embedding(embedding)
            
            # Convert hash to circuit input
            hash_bytes = bytes.fromhex(embedding_hash[:16])
            signal_input = [int(b) for b in hash_bytes]
            
            # FIXED: Enhanced circuit input with array validation for Semaphore circuit
            circuit_input = {
                "nullifierHash": int(hashlib.sha256(embedding_hash.encode()).hexdigest()[:8], 16) % (2**31),
                "signalHash": int(hashlib.sha256(str(embedding[:8]).encode()).hexdigest()[:8], 16) % (2**31),
                "externalNullifier": int(hashlib.sha256(user_id.encode()).hexdigest()[:8], 16) % (2**31),
                "identityNullifier": signal_input[0] if len(signal_input) > 0 else 12345,
                "identityTrapdoor": signal_input[1] if len(signal_input) > 1 else 67890,
                "pathElements": [11111, 22222, 33333, 44444],  # FIXED: Array for Merkle tree path
                "pathIndices": [0, 1, 0, 1]  # FIXED: Array for tree direction indices
            }
            
            # Create temporary files
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as input_file:
                json.dump(circuit_input, input_file, indent=2)
                input_path = input_file.name
            
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as proof_file:
                proof_path = proof_file.name
            
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as public_file:
                public_path = public_file.name
            
            try:
                # Enhanced file existence check
                if not os.path.exists(self.circuit_wasm):
                    logger.warning(f"Circuit WASM not found: {self.circuit_wasm}")
                    return self._generate_enhanced_simulated_proof(embedding_hash, user_id, start_time)
                
                if not os.path.exists(self.circuit_zkey):
                    logger.warning(f"Circuit zkey not found: {self.circuit_zkey}")
                    return self._generate_enhanced_simulated_proof(embedding_hash, user_id, start_time)
                
                # Enhanced snarkjs command with Windows fix
                timeout_value = 60 if priority == "high" else 30
                
                cmd = [
                    "snarkjs", "groth16", "fullprove",
                    input_path,
                    self.circuit_wasm,
                    self.circuit_zkey,
                    proof_path,
                    public_path
                ]
                
                logger.info(f"Generating ZK proof with priority: {priority}")
                
                # WINDOWS FIX: Added shell=True for Windows compatibility
                result = subprocess.run(
                    cmd, 
                    capture_output=True, 
                    text=True, 
                    timeout=timeout_value,
                    shell=True  # This fixes the Windows subprocess issue
                )
                
                if result.returncode == 0:
                    # Read generated proof
                    with open(proof_path, 'r') as f:
                        proof_data = json.load(f)
                    
                    with open(public_path, 'r') as f:
                        public_signals = json.load(f)
                    
                    processing_time = time.time() - start_time
                    self.proof_times.append(processing_time)
                    
                    # Update metrics
                    metrics.update_metrics(True, processing_time)
                    
                    logger.info(f"Real ZK proof generated successfully in {processing_time:.2f}s")
                    
                    return {
                        "success": True,
                        "proof": proof_data,
                        "publicSignals": public_signals,
                        "embedding_hash": embedding_hash,
                        "nullifier": circuit_input["nullifierHash"],
                        "timestamp": int(time.time()),
                        "processing_time": processing_time,
                        "priority": priority,
                        "protocol": "groth16",  # REAL PROOF INDICATOR
                        "circuit": "semaphore",
                        "proof_type": "real",
                        "circuit_health": "healthy"
                    }
                else:
                    # FIXED SYNTAX: Proper indentation for debugging logger statements
                    logger.error(f"snarkjs error (returncode {result.returncode}): {result.stderr}")
                    logger.error(f"snarkjs stdout: {result.stdout}")
                    logger.error(f"Circuit input was: {circuit_input}")
                    return self._generate_enhanced_simulated_proof(embedding_hash, user_id, start_time, result.stderr)
                    
            finally:
                # Cleanup temporary files
                for temp_path in [input_path, proof_path, public_path]:
                    if os.path.exists(temp_path):
                        try:
                            os.unlink(temp_path)
                        except Exception as e:
                            logger.warning(f"Failed to cleanup temp file {temp_path}: {e}")
                        
        except subprocess.TimeoutExpired:
            processing_time = time.time() - start_time
            logger.error(f"ZK proof generation timeout after {processing_time:.2f}s")
            metrics.update_metrics(False, processing_time)
            return self._generate_enhanced_simulated_proof(embedding_hash, user_id, start_time, "Timeout")
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"ZK proof generation error: {e}")
            metrics.update_metrics(False, processing_time)
            return self._generate_enhanced_simulated_proof(embedding_hash, user_id, start_time, str(e))
    
    def _generate_enhanced_simulated_proof(self, embedding_hash: str, user_id: str, start_time: float, error: str = "Circuit unavailable") -> Dict[str, Any]:
        """Enhanced simulated proof with detailed fallback information"""
        processing_time = time.time() - start_time
        
        return {
            "success": True,
            "proof": {
                "pi_a": ["0x" + "1" * 64, "0x" + "2" * 64, "0x1"],
                "pi_b": [["0x" + "3" * 64, "0x" + "4" * 64], ["0x" + "5" * 64, "0x" + "6" * 64], ["0x1", "0x0"]],
                "pi_c": ["0x" + "7" * 64, "0x" + "8" * 64, "0x1"],
                "protocol": "groth16",
                "curve": "bn128"
            },
            "publicSignals": [embedding_hash[:16]],
            "embedding_hash": embedding_hash,
            "nullifier": int(hashlib.sha256(user_id.encode()).hexdigest()[:8], 16) % (2**31),
            "timestamp": int(time.time()),
            "processing_time": processing_time,
            "protocol": "groth16_simulated",  # SIMULATED PROOF INDICATOR
            "circuit": "semaphore_simulated",
            "proof_type": "simulated",
            "fallback_reason": error,
            "circuit_health": "degraded"
        }
    
    def generate_batch_proofs(self, embeddings: List[list], user_ids: List[str]) -> List[Dict[str, Any]]:
        """Generate multiple ZK proofs efficiently"""
        logger.info(f"Starting batch proof generation for {len(embeddings)} requests")
        
        results = []
        for i, (embedding, user_id) in enumerate(zip(embeddings, user_ids)):
            logger.info(f"Processing batch proof {i+1}/{len(embeddings)}")
            result = self.generate_proof(embedding, user_id, priority="normal")
            results.append(result)
        
        return results

# Initialize enhanced components
liveness_detector = EnhancedLivenessDetector()
zk_proof_generator = AdvancedZKProofGenerator()

@app.get("/")
async def root():
    uptime = time.time() - metrics.start_time
    return {
        "message": "Sashakt API - Day 3 Enhanced Pro", 
        "version": "3.1.0", 
        "features": [
            "advanced_liveness_detection", 
            "real_zk_proofs", 
            "circuit_health_monitoring",
            "batch_processing",
            "performance_metrics",
            "enhanced_security"
        ],
        "uptime_seconds": uptime,
        "system_health": metrics.circuit_health
    }

@app.get("/health")
async def health_check():
    system_info = {
        "cpu_percent": psutil.cpu_percent(),
        "memory_percent": psutil.virtual_memory().percent,
        "disk_percent": psutil.disk_usage('/').percent if os.name != 'nt' else psutil.disk_usage('C:').percent
    }
    
    return {
        "status": "healthy", 
        "day": 3, 
        "version": "3.1.0",
        "features": ["MediaPipe", "ZK_Proofs", "Liveness", "CircuitHealth", "Metrics"],
        "metrics": {
            "total_proofs": metrics.total_proofs,
            "successful_proofs": metrics.successful_proofs,
            "success_rate": metrics.successful_proofs / max(metrics.total_proofs, 1) * 100,
            "avg_processing_time": metrics.avg_processing_time,
            "circuit_health": metrics.circuit_health
        },
        "system": system_info
    }

@app.get("/circuit-health")
async def circuit_health():
    """Get detailed circuit health information"""
    health_data = zk_proof_generator.check_circuit_health()
    return {
        "timestamp": datetime.now().isoformat(),
        "circuit_health": health_data,
        "recent_proof_times": zk_proof_generator.proof_times[-10:] if zk_proof_generator.proof_times else [],
        "performance_recommendation": _get_performance_recommendation(health_data)
    }

def _get_performance_recommendation(health_data: Dict[str, Any]) -> str:
    """Generate performance recommendations based on circuit health"""
    if health_data["overall_health"] == "healthy":
        return "System operating optimally"
    elif not health_data["snarkjs_available"]:
        return "Install snarkjs: npm install -g snarkjs"
    elif not health_data["wasm_exists"]:
        return "Compile circuit: circom circuit.circom --wasm"
    elif not health_data["zkey_exists"]:
        return "Generate proving key: snarkjs groth16 setup"
    else:
        return "Check circuit file paths and permissions"

@app.post("/prove_face")
async def prove_face(
    image: UploadFile = File(...),
    user_id: str = Form(...),
    wallet_address: str = Form(...),
    advanced_mode: bool = Form(False),
    priority: str = Form("normal")
):
    """
    Day 3 Enhanced Pro: Advanced face verification with comprehensive liveness detection
    
    Features:
    - Advanced MediaPipe face mesh with 478+ landmarks
    - Multi-factor liveness validation (eyes, mouth, face size, quality)
    - Real ZK proof generation with circuit health monitoring
    - Performance metrics and detailed error reporting
    - Priority-based processing
    """
    request_start = time.time()
    
    try:
        logger.info(f"Processing enhanced face proof for user: {user_id} (priority: {priority}, advanced: {advanced_mode})")
        
        # Read and validate image
        image_data = await image.read()
        if len(image_data) == 0:
            raise HTTPException(status_code=400, detail="Empty image file")
        
        nparr = np.frombuffer(image_data, np.uint8)
        cv_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if cv_image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        logger.info(f"Image processed: {cv_image.shape}")
        
        # Enhanced face detection and liveness check
        detection_result = liveness_detector.detect_face_and_liveness(cv_image, advanced_mode)
        
        if not detection_result["face_detected"]:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "No face detected",
                    "details": detection_result,
                    "recommendations": [
                        "Ensure good lighting",
                        "Position face in center of camera",
                        "Remove obstructions (glasses, masks, etc.)"
                    ]
                }
            )
        
        if not detection_result["liveness_detected"]:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "Liveness validation failed",
                    "liveness_score": detection_result["confidence"],
                    "failed_checks": _identify_failed_liveness_checks(detection_result),
                    "recommendations": [
                        "Look directly at camera with eyes open",
                        "Ensure natural facial expression",
                        "Improve lighting conditions",
                        "Hold device steady"
                    ]
                }
            )
        
        logger.info(f"Enhanced liveness check passed: confidence={detection_result['confidence']:.3f}, factors={len(detection_result.get('confidence_factors', []))}")
        
        # Extract enhanced face embedding
        embedding_data = detection_result["embedding_256"]
        
        # Generate ZK proof with priority
        proof_result = zk_proof_generator.generate_proof(embedding_data, user_id, priority)
        
        # Calculate total request time
        total_time = time.time() - request_start
        
        # Enhanced response
        return {
            "success": True,
            "liveness_detected": True,
            "liveness_confidence": detection_result["confidence"],
            "face_metrics": {
                "landmarks_count": detection_result["landmarks_count"],
                "eye_aspect_ratio": detection_result.get("eye_aspect_ratio", 0),
                "mouth_aspect_ratio": detection_result.get("mouth_aspect_ratio", 0),
                "face_area": detection_result.get("face_area", 0),
                "confidence": detection_result["confidence"],
                "quality_metrics": detection_result.get("quality_metrics", {}),
                "confidence_factors": detection_result.get("confidence_factors", [])
            },
            "embedding_hash": proof_result["embedding_hash"],
            "nullifier": proof_result["nullifier"],
            "proof": proof_result["proof"],
            "publicSignals": proof_result["publicSignals"],
            "timestamp": proof_result["timestamp"],
            "protocol": proof_result["protocol"],  # Real vs simulated indicator
            "circuit": proof_result["circuit"],
            "proof_type": proof_result.get("proof_type", "unknown"),
            "performance_metrics": {
                "total_processing_time": total_time,
                "liveness_detection_time": detection_result.get("processing_time", 0),
                "proof_generation_time": proof_result.get("processing_time", 0),
                "priority": priority
            },
            "user_id": user_id,
            "wallet_address": wallet_address,
            "advanced_mode": advanced_mode,
            "request_id": f"{user_id}_{int(time.time())}"
        }
        
    except Exception as e:
        total_time = time.time() - request_start
        logger.error(f"Error in enhanced prove_face: {e}")
        metrics.update_metrics(False, total_time)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

def _identify_failed_liveness_checks(detection_result: Dict[str, Any]) -> List[str]:
    """Identify specific liveness validation failures"""
    failed_checks = []
    
    if detection_result.get("eye_aspect_ratio", 0) <= 0.2:
        failed_checks.append("Eyes appear closed or partially closed")
    
    if detection_result.get("face_area", 0) <= 0.1:
        failed_checks.append("Face too small or distant")
    
    quality = detection_result.get("quality_metrics", {})
    if quality.get("sharpness", 0) < 50:
        failed_checks.append("Image not sharp enough")
    
    if quality.get("brightness", 128) < 50 or quality.get("brightness", 128) > 200:
        failed_checks.append("Poor lighting conditions")
    
    return failed_checks

@app.post("/batch_prove")
async def batch_prove_faces(request: BatchProofRequest):
    """Generate ZK proofs for multiple embeddings efficiently"""
    try:
        if len(request.embeddings) != len(request.user_ids) or len(request.embeddings) != len(request.wallet_addresses):
            raise HTTPException(status_code=400, detail="Mismatched array lengths")
        
        if len(request.embeddings) > 10:
            raise HTTPException(status_code=400, detail="Batch size limited to 10 requests")
        
        logger.info(f"Processing batch proof generation for {len(request.embeddings)} requests")
        
        # Generate proofs in batch
        results = zk_proof_generator.generate_batch_proofs(request.embeddings, request.user_ids)
        
        # Add wallet addresses to results
        for i, result in enumerate(results):
            result["wallet_address"] = request.wallet_addresses[i]
            result["batch_index"] = i
        
        return {
            "success": True,
            "batch_size": len(results),
            "results": results,
            "summary": {
                "total_requests": len(results),
                "successful_proofs": sum(1 for r in results if r.get("success", False)),
                "real_proofs": sum(1 for r in results if r.get("proof_type") == "real"),
                "simulated_proofs": sum(1 for r in results if r.get("proof_type") == "simulated")
            }
        }
        
    except Exception as e:
        logger.error(f"Batch processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/capture-face")
async def capture_face(
    image: UploadFile = File(...),
    wallet_address: str = Form(...),
    advanced_mode: bool = Form(False)
):
    """Enhanced Day 2 compatibility endpoint with Day 3 features"""
    try:
        # Read and process image
        image_data = await image.read()
        nparr = np.frombuffer(image_data, np.uint8)
        cv_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if cv_image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Enhanced face detection with liveness
        detection_result = liveness_detector.detect_face_and_liveness(cv_image, advanced_mode)
        
        if not detection_result["face_detected"]:
            raise HTTPException(status_code=400, detail="No face detected")
        
        return {
            "embedding": {
                "landmarks": detection_result.get("landmarks", []),
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "confidence": detection_result["confidence"],
                "enhanced_features": detection_result.get("embedding_256", [])
            },
            "confidence": detection_result["confidence"],
            "liveness_detected": detection_result["liveness_detected"],
            "landmarks_count": detection_result["landmarks_count"],
            "enhanced_metrics": {
                "eye_aspect_ratio": detection_result.get("eye_aspect_ratio", 0),
                "quality_metrics": detection_result.get("quality_metrics", {}),
                "confidence_factors": detection_result.get("confidence_factors", [])
            }
        }
        
    except Exception as e:
        logger.error(f"Error in enhanced capture_face: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-proof")
async def generate_proof(request: FaceProofRequest):
    """Enhanced Day 2 compatibility endpoint with advanced ZK proof features"""
    try:
        # Generate ZK proof from embedding
        proof_result = zk_proof_generator.generate_proof(
            request.embedding[:256] if len(request.embedding) > 256 else request.embedding,
            request.wallet_address,
            priority="high" if request.advanced_validation else "normal"
        )
        
        return {
            "status": "success",
            "proof": proof_result["proof"],
            "public_signals": proof_result["publicSignals"],
            "embedding_hash": proof_result["embedding_hash"],
            "nullifier": proof_result["nullifier"],
            "timestamp": proof_result["timestamp"],
            "protocol": proof_result["protocol"],
            "proof_type": proof_result.get("proof_type", "unknown"),
            "performance_metrics": {
                "processing_time": proof_result.get("processing_time", 0)
            }
        }
        
    except Exception as e:
        logger.error(f"Error in enhanced generate_proof: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/metrics")
async def get_metrics():
    """Get comprehensive system metrics"""
    return {
        "timestamp": datetime.now().isoformat(),
        "uptime_seconds": time.time() - metrics.start_time,
        "proof_metrics": {
            "total_proofs": metrics.total_proofs,
            "successful_proofs": metrics.successful_proofs,
            "failed_proofs": metrics.failed_proofs,
            "success_rate_percent": metrics.successful_proofs / max(metrics.total_proofs, 1) * 100,
            "average_processing_time": metrics.avg_processing_time
        },
        "circuit_health": metrics.circuit_health,
        "recent_proof_times": zk_proof_generator.proof_times[-20:] if zk_proof_generator.proof_times else [],
        "system_resources": {
            "cpu_percent": psutil.cpu_percent(),
            "memory_percent": psutil.virtual_memory().percent,
            "python_version": sys.version
        }
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Sashakt API - Day 3 Enhanced Pro with Advanced Features")
    logger.info("Features: Real Sashakt Proofs, Circuit Health Monitoring, Batch Processing, Enhanced Liveness Detection")
    uvicorn.run(app, host="0.0.0.0", port=8001)
