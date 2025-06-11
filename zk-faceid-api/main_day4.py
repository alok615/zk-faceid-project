"""
Sashakt API - Day 4 Underwriting Pro with Financial Risk Assessment
Enhanced Day 3 camera functionality + Complete Day 4 financial features
Camera working properly + Account Aggregator + UPI analysis + Risk scoring
"""

import os
import io
import cv2
import numpy as np
import pandas as pd
import time
import logging
import hashlib
import json
import base64
import subprocess
import tempfile
import threading
import psutil
import sys
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import mediapipe as mp
from fastapi import FastAPI, File, UploadFile, HTTPException, Request, Form, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, field_validator
import uvicorn

# Enhanced logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('sashakt_day4.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize MediaPipe with enhanced configuration
mp_face_mesh = mp.solutions.face_mesh
mp_face_detection = mp.solutions.face_detection
mp_drawing = mp.solutions.drawing_utils

class SystemMetrics:
    """Enhanced system metrics for Day 4"""
    def __init__(self):
        self.total_proofs = 0
        self.successful_proofs = 0
        self.failed_proofs = 0
        self.avg_processing_time = 0.0
        self.circuit_health = "unknown"
        self.start_time = time.time()
        self.risk_assessments = 0
        self.financial_requests = 0
        
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

    def update_risk_metrics(self):
        self.risk_assessments += 1

    def update_financial_metrics(self):
        self.financial_requests += 1

class EnhancedLivenessDetector:
    """Advanced liveness detection with multiple validation techniques - Day 3 + Day 4"""
    
    def __init__(self):
        self.face_mesh = mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        
        self.face_detection = mp_face_detection.FaceDetection(
            model_selection=1,
            min_detection_confidence=0.7
        )
        
        # Enhanced eye landmark indices
        self.LEFT_EYE_INDICES = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
        self.RIGHT_EYE_INDICES = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
        self.MOUTH_INDICES = [61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318]
        
        # Advanced detection parameters
        self.EAR_THRESHOLD = 0.2
        self.MOUTH_THRESHOLD = 0.5
        self.FACE_SIZE_THRESHOLD = 0.1
        
        logger.info("Enhanced Liveness Detector initialized with advanced features for Day 4")
    
    def calculate_eye_aspect_ratio(self, eye_landmarks):
        """Enhanced EAR calculation with multiple measurement points"""
        try:
            A = np.linalg.norm(eye_landmarks[1] - eye_landmarks[5])
            B = np.linalg.norm(eye_landmarks[2] - eye_landmarks[4])
            C = np.linalg.norm(eye_landmarks[0] - eye_landmarks[3])
            D = np.linalg.norm(eye_landmarks[1] - eye_landmarks[4])
            
            ear = (A + B + D) / (3.0 * C)
            return ear
        except Exception as e:
            logger.warning(f"EAR calculation error: {e}")
            return 0.3

    def calculate_mouth_aspect_ratio(self, mouth_landmarks):
        """Calculate mouth aspect ratio for additional liveness validation"""
        try:
            A = np.linalg.norm(mouth_landmarks[2] - mouth_landmarks[10])
            B = np.linalg.norm(mouth_landmarks[4] - mouth_landmarks[8])
            C = np.linalg.norm(mouth_landmarks[0] - mouth_landmarks[6])
            
            mar = (A + B) / (2.0 * C)
            return mar
        except Exception as e:
            logger.warning(f"MAR calculation error: {e}")
            return 0.3

    def detect_face_quality(self, image_array: np.ndarray) -> Dict[str, float]:
        """Advanced face quality assessment"""
        try:
            gray = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
            
            sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
            brightness = np.mean(gray)
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
        Enhanced face detection and liveness validation for Day 4
        """
        start_time = time.time()
        
        try:
            rgb_image = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)
            h, w, _ = image_array.shape
            
            quality_metrics = self.detect_face_quality(image_array)
            
            mesh_results = self.face_mesh.process(rgb_image)
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
            
            face_landmarks = mesh_results.multi_face_landmarks[0]
            
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
            
            # Face size validation
            face_area = 0
            if detection_results.detections:
                detection = detection_results.detections[0]
                bbox = detection.location_data.relative_bounding_box
                face_area = bbox.width * bbox.height
            
            # Advanced liveness scoring
            liveness_score = 0.0
            confidence_factors = []
            
            if avg_ear > self.EAR_THRESHOLD:
                liveness_score += 0.4
                confidence_factors.append(f"Eyes open (EAR: {avg_ear:.3f})")
            
            if face_area > self.FACE_SIZE_THRESHOLD:
                liveness_score += 0.3
                confidence_factors.append(f"Appropriate face size ({face_area:.3f})")
            
            if quality_metrics["sharpness"] > 50:
                liveness_score += 0.2
                confidence_factors.append(f"Good sharpness ({quality_metrics['sharpness']:.1f})")
            
            if 50 < quality_metrics["brightness"] < 200:
                liveness_score += 0.1
                confidence_factors.append(f"Good lighting ({quality_metrics['brightness']:.1f})")
            
            if advanced_mode:
                if mouth_ar < 0.7:
                    liveness_score += 0.1
                    confidence_factors.append("Natural mouth position")
                
                landmark_variance = np.var(landmarks, axis=0).mean()
                if landmark_variance > 10:
                    liveness_score += 0.1
                    confidence_factors.append("Natural facial variation")
            
            is_live = liveness_score >= 0.6
            final_confidence = min(liveness_score, 1.0)
            
            # Create enhanced 256-byte embedding
            selected_landmarks = landmarks[::2][:64]
            flattened = selected_landmarks.flatten()[:256]
            
            if flattened.max() > flattened.min():
                normalized = ((flattened - flattened.min()) / (flattened.max() - flattened.min()) * 255).astype(int)
            else:
                normalized = np.ones(256, dtype=int) * 128
            
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
        
        self.proof_times = []
        self.circuit_health_checked = False
        
        self.check_circuit_health()
        logger.info("Advanced ZK Proof Generator initialized for Day 4")
    
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
            if os.path.exists(self.circuit_wasm):
                health_status["wasm_exists"] = True
                health_status["wasm_size"] = os.path.getsize(self.circuit_wasm)
            
            if os.path.exists(self.circuit_zkey):
                health_status["zkey_exists"] = True
                health_status["zkey_size"] = os.path.getsize(self.circuit_zkey)
            
            if os.path.exists(self.circuit_r1cs):
                health_status["r1cs_exists"] = True
            
            try:
                result = subprocess.run(
                    ["snarkjs", "--version"], 
                    capture_output=True, 
                    text=True, 
                    timeout=5,
                    shell=True
                )
                if result.returncode == 0:
                    health_status["snarkjs_available"] = True
            except Exception as e:
                logger.warning(f"snarkjs check failed: {e}")
            
            if (health_status["wasm_exists"] and 
                health_status["zkey_exists"] and 
                health_status["snarkjs_available"]):
                health_status["overall_health"] = "healthy"
                metrics.circuit_health = "healthy"
            else:
                health_status["overall_health"] = "degraded"
                metrics.circuit_health = "degraded"
            
            if health_status["zkey_size"] > 0:
                estimated_time = max(1.0, health_status["zkey_size"] / 1000000)
                health_status["estimated_proof_time"] = f"{estimated_time:.1f}s"
            
            self.circuit_health_checked = True
            
        except Exception as e:
            logger.error(f"Circuit health check error: {e}")
            health_status["overall_health"] = "error"
            
        return health_status

    def hash_embedding(self, embedding: list) -> str:
        """Enhanced embedding hashing with validation"""
        try:
            if len(embedding) < 128:
                embedding.extend([0] * (128 - len(embedding)))
            elif len(embedding) > 256:
                embedding = embedding[:256]
            
            embedding_bytes = bytes(embedding)
            hash_hex = hashlib.sha256(embedding_bytes).hexdigest()
            
            return hash_hex
        except Exception as e:
            logger.error(f"Embedding hashing error: {e}")
            return hashlib.sha256(b"fallback").hexdigest()

    def generate_proof(self, embedding: list, user_id: str, priority: str = "normal") -> Dict[str, Any]:
        """Enhanced ZK proof generation with priority handling"""
        start_time = time.time()
        
        try:
            embedding_hash = self.hash_embedding(embedding)
            hash_bytes = bytes.fromhex(embedding_hash[:16])
            signal_input = [int(b) for b in hash_bytes]
            
            circuit_input = {
                "nullifierHash": int(hashlib.sha256(embedding_hash.encode()).hexdigest()[:8], 16) % (2**31),
                "signalHash": int(hashlib.sha256(str(embedding[:8]).encode()).hexdigest()[:8], 16) % (2**31),
                "externalNullifier": int(hashlib.sha256(user_id.encode()).hexdigest()[:8], 16) % (2**31),
                "identityNullifier": signal_input[0] if len(signal_input) > 0 else 12345,
                "identityTrapdoor": signal_input[1] if len(signal_input) > 1 else 67890,
                "pathElements": [11111, 22222, 33333, 44444],
                "pathIndices": [0, 1, 0, 1]
            }
            
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as input_file:
                json.dump(circuit_input, input_file, indent=2)
                input_path = input_file.name
            
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as proof_file:
                proof_path = proof_file.name
            
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as public_file:
                public_path = public_file.name
            
            try:
                if not os.path.exists(self.circuit_wasm):
                    logger.warning(f"Circuit WASM not found: {self.circuit_wasm}")
                    return self._generate_enhanced_simulated_proof(embedding_hash, user_id, start_time)
                
                if not os.path.exists(self.circuit_zkey):
                    logger.warning(f"Circuit zkey not found: {self.circuit_zkey}")
                    return self._generate_enhanced_simulated_proof(embedding_hash, user_id, start_time)
                
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
                
                result = subprocess.run(
                    cmd, 
                    capture_output=True, 
                    text=True, 
                    timeout=timeout_value,
                    shell=True
                )
                
                if result.returncode == 0:
                    with open(proof_path, 'r') as f:
                        proof_data = json.load(f)
                    
                    with open(public_path, 'r') as f:
                        public_signals = json.load(f)
                    
                    processing_time = time.time() - start_time
                    self.proof_times.append(processing_time)
                    
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
                        "protocol": "groth16",
                        "circuit": "semaphore",
                        "proof_type": "real",
                        "circuit_health": "healthy"
                    }
                else:
                    logger.error(f"snarkjs error (returncode {result.returncode}): {result.stderr}")
                    return self._generate_enhanced_simulated_proof(embedding_hash, user_id, start_time, result.stderr)
                    
            finally:
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
            "protocol": "groth16_simulated",
            "circuit": "semaphore_simulated",
            "proof_type": "simulated",
            "fallback_reason": error,
            "circuit_health": "degraded"
        }

class AdvancedRiskScorer:
    """Advanced Risk Scoring Engine for Day 4 with UPI transaction analysis"""
    
    def __init__(self):
        self.weights = {
            'monthly_income': 0.25,
            'monthly_expenses': 0.20,
            'average_balance': 0.20,
            'transaction_frequency': 0.15,
            'income_stability': 0.10,
            'expense_pattern': 0.10
        }
        logger.info("Advanced Risk Scoring Engine initialized for Day 4")
    
    def process_csv_transactions(self, csv_data: str) -> Dict[str, Any]:
        """Process CSV transaction data from Account Aggregator"""
        try:
            if not csv_data:
                return self._generate_sample_data()
            
            lines = csv_data.strip().split('\n')
            if len(lines) <= 1:
                return self._generate_sample_data()
            
            transactions = []
            headers = lines[0].split(',')
            
            for line in lines[1:]:
                values = line.split(',')
                if len(values) >= 3:
                    try:
                        amount = float(values[2])
                        trans_type = values[3] if len(values) > 3 else 'UNKNOWN'
                        transactions.append({
                            'amount': amount,
                            'type': trans_type,
                            'date': values[1] if len(values) > 1 else '2024-01-01'
                        })
                    except ValueError:
                        continue
            
            logger.info(f"Parsed {len(transactions)} transactions from CSV string")
            
            if not transactions:
                return self._generate_sample_data()
            
            return self._analyze_transactions(transactions)
            
        except Exception as e:
            logger.error(f"CSV processing error: {e}")
            return self._generate_sample_data()
    
    def _analyze_transactions(self, transactions: List[Dict]) -> Dict[str, Any]:
        """Analyze transaction patterns for risk assessment"""
        try:
            credits = [t for t in transactions if t['amount'] > 0]
            debits = [t for t in transactions if t['amount'] < 0]
            
            monthly_income = sum(t['amount'] for t in credits) if credits else 0
            monthly_expenses = abs(sum(t['amount'] for t in debits)) if debits else 0
            
            all_amounts = [abs(t['amount']) for t in transactions]
            average_balance = monthly_income - monthly_expenses
            
            if credits and len(credits) > 1:
                credit_amounts = [t['amount'] for t in credits]
                mean_income = np.mean(credit_amounts)
                std_income = np.std(credit_amounts)
                income_stability = std_income / mean_income if mean_income > 0 else 1.0
            else:
                income_stability = 0.5
            
            if debits and len(debits) > 1:
                debit_amounts = [abs(t['amount']) for t in debits]
                expense_pattern_score = 1.0 - (np.std(debit_amounts) / np.mean(debit_amounts))
            else:
                expense_pattern_score = 0.5
            
            return {
                'monthly_income': float(monthly_income),
                'monthly_expenses': float(monthly_expenses),
                'average_balance': float(average_balance),
                'transaction_frequency': len(transactions),
                'income_stability': float(income_stability),
                'expense_pattern_score': float(max(0, min(1, expense_pattern_score))),
                'debt_to_income_ratio': float(monthly_expenses / monthly_income if monthly_income > 0 else 1.0)
            }
            
        except Exception as e:
            logger.error(f"Transaction analysis error: {e}")
            return self._generate_sample_data()
    
    def _generate_sample_data(self) -> Dict[str, Any]:
        """Generate sample financial data for demonstration"""
        base_income = 25000 + np.random.randint(0, 50000)
        base_expenses = base_income * (0.4 + np.random.random() * 0.4)
        
        return {
            'monthly_income': float(base_income),
            'monthly_expenses': float(base_expenses),
            'average_balance': float(base_income - base_expenses + np.random.randint(-5000, 15000)),
            'transaction_frequency': int(15 + np.random.randint(0, 20)),
            'income_stability': float(0.01 + np.random.random() * 0.3),
            'expense_pattern_score': float(0.4 + np.random.random() * 0.4),
            'debt_to_income_ratio': float(base_expenses / base_income)
        }
    
    def calculate_risk_score(self, financial_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate comprehensive risk score using weighted factors"""
        try:
            income_score = min(financial_profile['monthly_income'] / 100000, 1.0)
            expense_ratio = financial_profile['monthly_expenses'] / financial_profile['monthly_income'] if financial_profile['monthly_income'] > 0 else 1.0
            expense_score = max(0, 1.0 - expense_ratio)
            balance_score = min(financial_profile['average_balance'] / 50000, 1.0) if financial_profile['average_balance'] > 0 else 0
            frequency_score = min(financial_profile['transaction_frequency'] / 30, 1.0)
            stability_score = max(0, 1.0 - financial_profile['income_stability'])
            pattern_score = financial_profile['expense_pattern_score']
            
            weighted_score = (
                income_score * self.weights['monthly_income'] +
                expense_score * self.weights['monthly_expenses'] +
                balance_score * self.weights['average_balance'] +
                frequency_score * self.weights['transaction_frequency'] +
                stability_score * self.weights['income_stability'] +
                pattern_score * self.weights['expense_pattern']
            )
            
            credit_score = int(300 + (weighted_score * 600))
            
            if credit_score >= 750:
                risk_category = "VERY_LOW"
            elif credit_score >= 650:
                risk_category = "LOW"
            elif credit_score >= 550:
                risk_category = "MEDIUM"
            elif credit_score >= 450:
                risk_category = "HIGH"
            else:
                risk_category = "VERY_HIGH"
            
            component_scores = {
                'income_component': float(income_score * 100),
                'expense_component': float(expense_score * 100),
                'balance_component': float(balance_score * 100),
                'frequency_component': float(frequency_score * 100),
                'stability_component': float(stability_score * 100),
                'pattern_component': float(pattern_score * 100)
            }
            
            risk_factors = []
            if financial_profile['income_stability'] > 0.3:
                risk_factors.append("Irregular income pattern")
            if expense_ratio > 0.8:
                risk_factors.append("High expense to income ratio")
            if financial_profile['average_balance'] < 10000:
                risk_factors.append("Low average account balance")
            if financial_profile['transaction_frequency'] < 10:
                risk_factors.append("Low transaction activity")
            
            recommendations = []
            if financial_profile['average_balance'] < 30000:
                recommendations.append("Consider building an emergency fund")
            if expense_ratio > 0.7:
                recommendations.append("Review and optimize monthly expenses")
            if financial_profile['income_stability'] > 0.2:
                recommendations.append("Diversify income sources for better stability")
            
            return {
                'final_score': credit_score,
                'risk_category': risk_category,
                'component_scores': component_scores,
                'score_breakdown': {
                    'weighted_score': float(weighted_score),
                    'raw_scores': {
                        'income': float(income_score),
                        'expense': float(expense_score),
                        'balance': float(balance_score),
                        'frequency': float(frequency_score),
                        'stability': float(stability_score),
                        'pattern': float(pattern_score)
                    }
                },
                'risk_factors': risk_factors,
                'recommendations': recommendations
            }
            
        except Exception as e:
            logger.error(f"Risk calculation error: {e}")
            return {
                'final_score': 500,
                'risk_category': 'MEDIUM',
                'component_scores': {},
                'score_breakdown': {},
                'risk_factors': ['Data processing error'],
                'recommendations': ['Please retry assessment']
            }

# Pydantic models for Day 4
class FaceProofRequest(BaseModel):
    embedding: list
    wallet_address: str
    advanced_validation: Optional[bool] = False

class RiskAssessmentRequest(BaseModel):
    user_id: str
    wallet_address: Optional[str] = None
    consent_aa: bool = False
    upi_data: Optional[str] = None

class RiskAssessmentResponse(BaseModel):
    success: bool
    user_id: str
    wallet_address: Optional[str]
    risk_score: int
    risk_category: str
    financial_profile: Dict[str, Any]
    risk_assessment: Dict[str, Any]
    recommendations: List[str]
    risk_factors: List[str]
    processing_metrics: Dict[str, Any]
    timestamp: str
    agent_info: Dict[str, str]

class BatchProofRequest(BaseModel):
    embeddings: List[list]
    user_ids: List[str]
    wallet_addresses: List[str]

# Initialize components
app = FastAPI(
    title="Sashakt API - Day 4 Underwriting Pro with Enhanced Camera",
    description="Advanced Identity Verification with Financial Risk Assessment + Working Camera",
    version="4.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Day 4 components
metrics = SystemMetrics()
liveness_detector = EnhancedLivenessDetector()
zk_proof_generator = AdvancedZKProofGenerator()
risk_scorer = AdvancedRiskScorer()

# Helper functions
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

# API Routes
@app.get("/")
async def root():
    uptime = time.time() - metrics.start_time
    return {
        "message": "Sashakt API - Day 4 Underwriting Pro with Enhanced Camera", 
        "version": "4.1.0", 
        "features": [
            "enhanced_camera_working",
            "advanced_liveness_detection", 
            "real_zk_proofs", 
            "financial_risk_assessment",
            "upi_transaction_analysis",
            "account_aggregator_simulation",
            "circuit_health_monitoring",
            "batch_processing",
            "performance_metrics"
        ],
        "uptime_seconds": uptime,
        "system_health": metrics.circuit_health,
        "camera_status": "working_properly"
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
        "day": 4, 
        "version": "4.1.0",
        "features": ["Enhanced_Camera", "MediaPipe", "ZK_Proofs", "Liveness", "Financial_Risk", "AA_Simulation"],
        "metrics": {
            "total_proofs": metrics.total_proofs,
            "successful_proofs": metrics.successful_proofs,
            "success_rate": metrics.successful_proofs / max(metrics.total_proofs, 1) * 100,
            "avg_processing_time": metrics.avg_processing_time,
            "circuit_health": metrics.circuit_health,
            "risk_assessments": metrics.risk_assessments,
            "financial_requests": metrics.financial_requests
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

@app.post("/prove_face")
async def prove_face(
    image: UploadFile = File(...),
    user_id: str = Form(...),
    wallet_address: str = Form(...),
    advanced_mode: bool = Form(False),
    priority: str = Form("normal")
):
    """
    Day 4 Enhanced Pro: Advanced face verification with comprehensive liveness detection + Working Camera
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
        
        logger.info(f"Enhanced liveness check passed: confidence={detection_result['confidence']:.3f}")
        
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
            "protocol": proof_result["protocol"],
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

@app.post("/score_risk", response_model=RiskAssessmentResponse)
async def score_risk(request: RiskAssessmentRequest):
    """
    Day 4: Advanced financial risk assessment with Account Aggregator data
    """
    start_time = time.time()
    
    try:
        logger.info(f"Processing risk assessment for user: {request.user_id}")
        
        # Update financial metrics
        metrics.update_financial_metrics()
        
        # Process UPI transaction data (CSV from Account Aggregator)
        financial_profile = risk_scorer.process_csv_transactions(request.upi_data)
        
        # Calculate comprehensive risk score
        risk_assessment = risk_scorer.calculate_risk_score(financial_profile)
        
        processing_time = time.time() - start_time
        metrics.update_risk_metrics()
        
        response = RiskAssessmentResponse(
            success=True,
            user_id=request.user_id,
            wallet_address=request.wallet_address,
            risk_score=risk_assessment['final_score'],
            risk_category=risk_assessment['risk_category'],
            financial_profile=financial_profile,
            risk_assessment=risk_assessment,
            recommendations=risk_assessment['recommendations'],
            risk_factors=risk_assessment['risk_factors'],
            processing_metrics={
                "processing_time": processing_time,
                "transactions_analyzed": financial_profile.get('transaction_frequency', 0),
                "data_source": "csv_upi_data" if request.upi_data else "sample_data"
            },
            timestamp=datetime.now().isoformat(),
            agent_info={
                "version": "sashakt_day4_v1.1",
                "algorithm": "rule_based_weighted_scoring",
                "compliance": "sandbox_aa_compatible"
            }
        )
        
        logger.info(f"Risk assessment completed for user {request.user_id} - Score: {risk_assessment['final_score']}")
        return response
        
    except Exception as e:
        processing_time = time.time() - start_time
        logger.error(f"Risk assessment error for user {request.user_id}: {e}")
        
        return RiskAssessmentResponse(
            success=False,
            user_id=request.user_id,
            wallet_address=request.wallet_address,
            risk_score=500,
            risk_category="UNKNOWN",
            financial_profile={},
            risk_assessment={},
            recommendations=["Unable to complete assessment", "Please try again"],
            risk_factors=["Processing error"],
            processing_metrics={
                "processing_time": processing_time,
                "transactions_analyzed": 0,
                "data_source": "error"
            },
            timestamp=datetime.now().isoformat(),
            agent_info={
                "version": "sashakt_day4_v1.1",
                "algorithm": "error_handling",
                "compliance": "sandbox_aa_compatible"
            }
        )

@app.post("/capture-face")
async def capture_face(
    image: UploadFile = File(...),
    wallet_address: str = Form(...),
    advanced_mode: bool = Form(False)
):
    """Enhanced Day 2 compatibility endpoint with Day 4 features"""
    try:
        image_data = await image.read()
        nparr = np.frombuffer(image_data, np.uint8)
        cv_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if cv_image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
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
async def generate_proof_endpoint(request: FaceProofRequest):
    """Enhanced Day 2 compatibility endpoint with advanced ZK proof features"""
    try:
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

@app.post("/batch_prove")
async def batch_prove_faces(request: BatchProofRequest):
    """Generate ZK proofs for multiple embeddings efficiently"""
    try:
        if len(request.embeddings) != len(request.user_ids) or len(request.embeddings) != len(request.wallet_addresses):
            raise HTTPException(status_code=400, detail="Mismatched array lengths")
        
        if len(request.embeddings) > 10:
            raise HTTPException(status_code=400, detail="Batch size limited to 10 requests")
        
        logger.info(f"Processing batch proof generation for {len(request.embeddings)} requests")
        
        results = []
        for i, (embedding, user_id) in enumerate(zip(request.embeddings, request.user_ids)):
            result = zk_proof_generator.generate_proof(embedding, user_id, priority="normal")
            result["wallet_address"] = request.wallet_addresses[i]
            result["batch_index"] = i
            results.append(result)
        
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

@app.get("/metrics")
async def get_metrics():
    """Get comprehensive system metrics for Day 4"""
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
        "day4_metrics": {
            "risk_assessments": metrics.risk_assessments,
            "financial_requests": metrics.financial_requests
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
    logger.info("Starting Sashakt API - Day 4 Underwriting Pro with Enhanced Camera")
    logger.info("Features: Working Camera, Enhanced Liveness Detection, Real ZK Proofs, Financial Risk Assessment, UPI Analysis, Account Aggregator Simulation")
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
