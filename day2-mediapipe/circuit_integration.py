import json
import requests
import time
import hashlib
from typing import List, Dict, Any, Optional
from face_embedding_capture import FaceEmbeddingCapture

class CircuitIntegration:
    """
    Day 2 Task 1 - Final Part: Circuit Integration
    
    This class integrates MediaPipe face embeddings with the Semaphore circuit
    and zk-FaceID agent for complete face verification workflow.
    """
    
    def __init__(self, zk_faceid_url: str = "http://localhost:8001"):
        self.zk_faceid_url = zk_faceid_url
        self.face_capture = FaceEmbeddingCapture()
        print("✅ Circuit Integration initialized")
    
    def load_face_embedding(self, filename: str) -> Optional[List[int]]:
        """
        Load face embedding from JSON file
        
        Args:
            filename: JSON file with face embedding data
            
        Returns:
            128-byte face embedding or None if failed
        """
        try:
            with open(filename, 'r') as f:
                data = json.load(f)
            
            byte_embedding = data.get('byte_embedding')
            if byte_embedding and len(byte_embedding) == 128:
                print(f"✅ Loaded face embedding from {filename}")
                print(f"📊 Byte range: {min(byte_embedding)} - {max(byte_embedding)}")
                return byte_embedding
            else:
                print(f"❌ Invalid embedding data in {filename}")
                return None
                
        except Exception as e:
            print(f"❌ Error loading {filename}: {e}")
            return None
    
    def hash_embedding_for_circuit(self, byte_embedding: List[int]) -> str:
        """
        Create a hash of the face embedding for additional security
        
        Args:
            byte_embedding: 128-byte face embedding
            
        Returns:
            SHA256 hash of the embedding
        """
        # Convert to bytes and hash
        embedding_bytes = bytes(byte_embedding)
        hash_hex = hashlib.sha256(embedding_bytes).hexdigest()
        print(f"🔐 Face embedding hash: {hash_hex[:16]}...")
        return hash_hex
    
    def test_with_zk_faceid_agent(self, byte_embedding: List[int], user_id: str) -> Optional[Dict[str, Any]]:
        """
        Test integration with zk-FaceID agent using real face embedding
        
        Args:
            byte_embedding: 128-byte face embedding from MediaPipe
            user_id: User identifier
            
        Returns:
            ZK proof response or None if failed
        """
        print(f"🔗 Testing integration with zk-FaceID Agent...")
        print(f"👤 User ID: {user_id}")
        print(f"📏 Embedding length: {len(byte_embedding)}")
        
        # Prepare request for zk-FaceID agent
        request_data = {
            "face_embedding": byte_embedding,
            "user_id": user_id
        }
        
        try:
            # Call zk-FaceID agent
            response = requests.post(
                f"{self.zk_faceid_url}/prove_face",
                json=request_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                proof_data = response.json()
                print("✅ ZK Proof generated successfully!")
                print(f"📋 Status: {proof_data['status']}")
                print(f"🔑 Protocol: {proof_data['proof']['protocol']}")
                print(f"📊 Public signals: {proof_data['public_signals']}")
                return proof_data
            else:
                print(f"❌ zk-FaceID Agent error: {response.status_code}")
                print(response.text)
                return None
                
        except requests.exceptions.ConnectionError:
            print("❌ Cannot connect to zk-FaceID Agent")
            print("💡 Make sure the agent is running on http://localhost:8001")
            return None
        except Exception as e:
            print(f"❌ Error: {e}")
            return None
    
    def live_face_to_zk_proof(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Complete workflow: Live face capture → ZK proof generation
        
        Args:
            user_id: User identifier
            
        Returns:
            ZK proof response or None if failed
        """
        print("🎯 Starting live face-to-ZK-proof workflow")
        print("=" * 50)
        
        # Step 1: Capture live face embedding
        print("📹 Step 1: Capturing live face embedding...")
        result = self.face_capture.capture_face_embedding(duration_seconds=8)
        
        if not result:
            print("❌ Failed to capture face embedding")
            return None
        
        byte_embedding, original_embedding = result
        
        # Step 2: Generate hash for security
        print("🔐 Step 2: Generating security hash...")
        embedding_hash = self.hash_embedding_for_circuit(byte_embedding)
        
        # Step 3: Create ZK proof
        print("🧮 Step 3: Generating ZK proof...")
        proof_data = self.test_with_zk_faceid_agent(byte_embedding, user_id)
        
        if proof_data:
            # Step 4: Save complete workflow data
            timestamp = int(time.time())
            workflow_data = {
                "timestamp": timestamp,
                "user_id": user_id,
                "face_embedding": byte_embedding,
                "embedding_hash": embedding_hash,
                "zk_proof": proof_data,
                "workflow_status": "completed"
            }
            
            filename = f"complete_workflow_{timestamp}.json"
            with open(filename, 'w') as f:
                json.dump(workflow_data, f, indent=2)
            
            print(f"💾 Complete workflow saved to: {filename}")
            print("🎉 Live face-to-ZK-proof workflow COMPLETED!")
            return proof_data
        else:
            print("❌ Failed to generate ZK proof")
            return None

def test_circuit_integration():
    """Test the complete circuit integration"""
    print("🧪 Testing Day 2 Task 1: Circuit Integration")
    print("=" * 60)
    
    # Initialize integration
    integration = CircuitIntegration()
    
    # Test Option 1: Live face capture to ZK proof
    print("\n🎯 Option 1: Live Face Capture → ZK Proof")
    print("-" * 40)
    user_id = f"live_user_{int(time.time())}"
    
    proof_result = integration.live_face_to_zk_proof(user_id)
    
    if proof_result:
        print("\n✅ DAY 2 TASK 1 COMPLETED SUCCESSFULLY!")
        print("🔗 Integration verified:")
        print(f"   ✓ MediaPipe face detection working")
        print(f"   ✓ 128-byte embedding extraction working")
        print(f"   ✓ zk-FaceID agent integration working")
        print(f"   ✓ End-to-end workflow functional")
        
        return True
    else:
        print("\n❌ Integration test failed")
        return False

if __name__ == "__main__":
    # Run the complete integration test
    success = test_circuit_integration()
    
    if success:
        print("\n🎊 DAY 2 TASK 1 ACHIEVEMENT UNLOCKED!")
        print("📋 What we accomplished:")
        print("   • Real face embedding capture with MediaPipe")
        print("   • 128-byte format conversion for Semaphore circuit")
        print("   • Integration with existing zk-FaceID agent")
        print("   • Complete live workflow demonstration")
        print("\n🚀 Ready for Day 2 Task 2: React Frontend!")
    else:
        print("\n🔧 Please ensure zk-FaceID agent is running and try again")
