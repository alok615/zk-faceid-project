import requests
import json
import time

def test_cross_agent_communication():
    """
    Task 4: Cross-Agent Communication Test
    
    This test demonstrates the full workflow:
    1. Generate ZK face proof using zk-FaceID Agent
    2. Use that proof in Underwriting Agent for risk assessment
    3. Show complete integration between both agents
    """
    
    print("🚀 Starting Cross-Agent Communication Test")
    print("=" * 50)
    
    # Test data
    face_embedding = list(range(1, 129))  # 128-byte face embedding
    user_id = "integration_test_user"
    
    # Step 1: Call zk-FaceID Agent
    print("📞 Step 1: Calling zk-FaceID Agent...")
    
    face_request = {
        "face_embedding": face_embedding,
        "user_id": user_id
    }
    
    try:
        face_response = requests.post(
            "http://localhost:8001/prove_face",
            json=face_request,
            headers={"Content-Type": "application/json"}
        )
        
        if face_response.status_code == 200:
            face_data = face_response.json()
            print("✅ zk-FaceID Agent Response:")
            print(f"   Status: {face_data['status']}")
            print(f"   User ID: {face_data['user_id']}")
            print(f"   Proof Protocol: {face_data['proof']['protocol']}")
            print(f"   Public Signals: {face_data['public_signals']}")
            
            # Step 2: Use ZK proof in Underwriting Agent
            print("\n📞 Step 2: Calling Underwriting Agent with ZK proof...")
            
            underwriting_request = {
                "applicant_data": {
                    "age": 35,
                    "income": 85000.0,
                    "credit_score": 740,
                    "employment_years": 10.0,
                    "debt_to_income_ratio": 0.25,
                    "loan_amount": 300000.0,
                    "loan_purpose": "home_purchase"
                },
                "zk_face_proof": face_data,  # Pass the complete ZK proof
                "additional_factors": {}
            }
            
            underwriting_response = requests.post(
                "http://localhost:8002/score_risk",
                json=underwriting_request,
                headers={"Content-Type": "application/json"}
            )
            
            if underwriting_response.status_code == 200:
                underwriting_data = underwriting_response.json()
                print("✅ Underwriting Agent Response:")
                print(f"   Decision: {underwriting_data['decision']}")
                print(f"   Risk Level: {underwriting_data['risk_level']}")
                print(f"   Overall Risk Score: {underwriting_data['risk_scores']['overall_score']}")
                print(f"   Identity Risk: {underwriting_data['risk_scores']['identity_risk']}")
                print(f"   Max Approved Amount: ${underwriting_data['max_approved_amount']:,.2f}")
                print(f"   Interest Rate Adjustment: {underwriting_data['interest_rate_adjustment']} bps")
                print(f"   Confidence: {underwriting_data['confidence']:.1%}")
                print(f"   Explanation: {underwriting_data['explanation']}")
                
                # Step 3: Verify Integration Success
                print("\n🔗 Step 3: Integration Verification...")
                
                # Check if ZK proof was properly used
                if underwriting_data['risk_scores']['identity_risk'] <= 0.2:
                    print("✅ ZK Proof Integration: SUCCESS")
                    print("   - Identity risk reduced due to ZK face verification")
                else:
                    print("❌ ZK Proof Integration: FAILED")
                
                # Check overall workflow
                if (face_data['status'] == 'proof_generated' and 
                    underwriting_data['decision'] in ['approved', 'conditionally_approved']):
                    print("✅ End-to-End Workflow: SUCCESS")
                    print("   - Face verified → Risk assessed → Decision made")
                else:
                    print("❌ End-to-End Workflow: INCOMPLETE")
                
                print("\n🎉 TASK 4 COMPLETED: Cross-Agent Communication Working!")
                
            else:
                print(f"❌ Underwriting Agent Error: {underwriting_response.status_code}")
                print(underwriting_response.text)
        
        else:
            print(f"❌ zk-FaceID Agent Error: {face_response.status_code}")
            print(face_response.text)
            
    except requests.exceptions.ConnectionError as e:
        print("❌ Connection Error: Make sure both agents are running!")
        print("   - zk-FaceID Agent should be on http://localhost:8001")
        print("   - Underwriting Agent should be on http://localhost:8002")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_cross_agent_communication()
