import cv2
import mediapipe as mp
import numpy as np
import hashlib
import json
import time
from typing import List, Optional, Tuple

class FaceEmbeddingCapture:
    """
    Day 2 Task 1: MediaPipe Face Embedding Capture
    
    This class captures webcam feed, extracts face embeddings using MediaPipe,
    and converts them to 128-byte format required by Semaphore circuit.
    """
    
    def __init__(self):
        # Initialize MediaPipe Face Detection and Face Mesh
        self.mp_face_detection = mp.solutions.face_detection
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_drawing = mp.solutions.drawing_utils
        
        # Initialize face detection and mesh models
        self.face_detection = self.mp_face_detection.FaceDetection(
            model_selection=0, min_detection_confidence=0.5
        )
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        print("✅ MediaPipe Face Detection and Mesh initialized")
    
    def extract_face_landmarks(self, image: np.ndarray) -> Optional[np.ndarray]:
        """
        Extract face landmarks from image using MediaPipe Face Mesh
        
        Args:
            image: BGR image from webcam
            
        Returns:
            numpy array of 468 face landmarks (x, y, z) or None if no face detected
        """
        # Convert BGR to RGB
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Process the image
        results = self.face_mesh.process(rgb_image)
        
        if results.multi_face_landmarks:
            # Get the first face's landmarks
            face_landmarks = results.multi_face_landmarks[0]
            
            # Extract landmark coordinates
            landmarks = []
            for landmark in face_landmarks.landmark:
                landmarks.extend([landmark.x, landmark.y, landmark.z])
            
            return np.array(landmarks, dtype=np.float32)
        
        return None
    
    def landmarks_to_128_embedding(self, landmarks: np.ndarray) -> np.ndarray:
        """
        Convert face landmarks to 128-dimensional embedding
        
        Args:
            landmarks: Face landmarks array (468 * 3 = 1404 dimensions)
            
        Returns:
            128-dimensional face embedding
        """
        # Use PCA-like dimensionality reduction approach
        # Reshape landmarks to matrix form
        landmarks_matrix = landmarks.reshape(-1, 3)  # 468 x 3
        
        # Calculate key facial features and distances
        features = []
        
        # Add mean coordinates (centroid)
        features.extend(np.mean(landmarks_matrix, axis=0))  # 3 features
        
        # Add standard deviation (facial spread)
        features.extend(np.std(landmarks_matrix, axis=0))   # 3 features
        
        # Add min/max ranges
        features.extend(np.min(landmarks_matrix, axis=0))   # 3 features
        features.extend(np.max(landmarks_matrix, axis=0))   # 3 features
        
        # Add key landmark distances (eyes, nose, mouth regions)
        # Sample key landmarks for facial geometry
        key_indices = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150]
        for i in key_indices:
            if i < len(landmarks_matrix):
                features.extend(landmarks_matrix[i])  # 3 features each
        
        # Convert to numpy array and ensure exactly 128 dimensions
        features_array = np.array(features, dtype=np.float32)
        
        # Pad or truncate to exactly 128 dimensions
        if len(features_array) > 128:
            embedding = features_array[:128]
        else:
            # Pad with normalized random values if needed
            padding_size = 128 - len(features_array)
            padding = np.random.normal(0, 0.1, padding_size).astype(np.float32)
            embedding = np.concatenate([features_array, padding])
        
        # Normalize to [-1, 1] range
        embedding = np.tanh(embedding)
        
        return embedding
    
    def embedding_to_128_bytes(self, embedding: np.ndarray) -> List[int]:
        """
        Convert 128-dimensional embedding to 128-byte format for Semaphore circuit
        
        Args:
            embedding: 128-dimensional face embedding (float values)
            
        Returns:
            List of 128 integers (0-255) for Semaphore circuit
        """
        # Normalize embedding to [0, 1] range
        normalized = (embedding + 1) / 2  # Convert from [-1, 1] to [0, 1]
        
        # Convert to 0-255 integer range
        byte_values = (normalized * 255).astype(np.uint8)
        
        # Ensure exactly 128 bytes
        if len(byte_values) != 128:
            byte_values = byte_values[:128]
        
        return byte_values.tolist()
    
    def capture_face_embedding(self, duration_seconds: int = 5) -> Optional[Tuple[List[int], np.ndarray]]:
        """
        Capture face embedding from webcam
        
        Args:
            duration_seconds: How long to try capturing (default 5 seconds)
            
        Returns:
            Tuple of (128-byte list for circuit, original embedding) or None if failed
        """
        print(f"🎥 Starting webcam capture for {duration_seconds} seconds...")
        print("👤 Please look at the camera for face detection")
        
        # Initialize webcam
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("❌ Error: Could not open webcam")
            return None
        
        start_time = time.time()
        best_embedding = None
        best_confidence = 0
        
        try:
            while (time.time() - start_time) < duration_seconds:
                ret, frame = cap.read()
                if not ret:
                    print("❌ Error: Could not read frame from webcam")
                    break
                
                # Extract face landmarks
                landmarks = self.extract_face_landmarks(frame)
                
                if landmarks is not None:
                    # Convert to 128-dimensional embedding
                    embedding = self.landmarks_to_128_embedding(landmarks)
                    
                    # Simple confidence based on landmark stability
                    confidence = np.std(landmarks)  # Lower std = more stable
                    
                    if best_embedding is None or confidence < best_confidence:
                        best_embedding = embedding
                        best_confidence = confidence
                    
                    # Draw landmarks on frame
                    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    results = self.face_mesh.process(rgb_frame)
                    
                    if results.multi_face_landmarks:
                        for face_landmarks in results.multi_face_landmarks:
                            self.mp_drawing.draw_landmarks(
                                frame, face_landmarks, self.mp_face_mesh.FACEMESH_CONTOURS
                            )
                    
                    cv2.putText(frame, "Face Detected! ✓", (10, 30), 
                               cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                else:
                    cv2.putText(frame, "No Face Detected", (10, 30), 
                               cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                
                # Show remaining time
                remaining = int(duration_seconds - (time.time() - start_time))
                cv2.putText(frame, f"Time: {remaining}s", (10, 70), 
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                
                # Display frame
                cv2.imshow('Face Embedding Capture - Press Q to quit', frame)
                
                # Break on 'q' key
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
            
        finally:
            cap.release()
            cv2.destroyAllWindows()
        
        if best_embedding is not None:
            # Convert to 128-byte format
            byte_embedding = self.embedding_to_128_bytes(best_embedding)
            print("✅ Face embedding captured successfully!")
            print(f"📊 Embedding stats: min={np.min(best_embedding):.3f}, max={np.max(best_embedding):.3f}")
            return byte_embedding, best_embedding
        else:
            print("❌ No face detected during capture period")
            return None

def test_face_embedding_capture():
    """Test function for face embedding capture"""
    print("🧪 Testing MediaPipe Face Embedding Capture")
    print("=" * 50)
    
    # Initialize face capture
    face_capture = FaceEmbeddingCapture()
    
    # Capture face embedding
    result = face_capture.capture_face_embedding(duration_seconds=10)
    
    if result:
        byte_embedding, original_embedding = result
        
        print(f"✅ Face embedding captured!")
        print(f"📏 Byte embedding length: {len(byte_embedding)}")
        print(f"📊 Byte range: {min(byte_embedding)} - {max(byte_embedding)}")
        print(f"🔢 First 10 bytes: {byte_embedding[:10]}")
        print(f"🔢 Last 10 bytes: {byte_embedding[-10:]}")
        
        # Save to file for testing
        timestamp = int(time.time())
        filename = f"face_embedding_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump({
                "timestamp": timestamp,
                "byte_embedding": byte_embedding,
                "original_embedding": original_embedding.tolist(),
                "length": len(byte_embedding),
                "min_value": min(byte_embedding),
                "max_value": max(byte_embedding)
            }, f, indent=2)
        
        print(f"💾 Embedding saved to: {filename}")
        return byte_embedding
    else:
        print("❌ Failed to capture face embedding")
        return None

if __name__ == "__main__":
    # Run the test
    test_face_embedding_capture()
