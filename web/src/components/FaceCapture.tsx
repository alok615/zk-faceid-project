'use client'

import { useState, useRef, useEffect } from 'react'
import { useAccount } from 'wagmi'

interface Day3ProofResult {
  success: boolean
  liveness_detected: boolean
  liveness_confidence: number
  face_metrics: {
    landmarks_count: number
    eye_aspect_ratio: number
    confidence: number
  }
  embedding_hash: string
  nullifier: number
  proof: any
  publicSignals: string[]
  timestamp: number
  protocol: string
  circuit: string
  user_id: string
  wallet_address: string
}

export function FaceCapture() {
  const { address, isConnected } = useAccount()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState<string>('Ready for Day 3 Enhanced Face Verification')
  const [isProcessing, setIsProcessing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [proofResult, setProofResult] = useState<Day3ProofResult | null>(null)

  // Start camera stream
  const startCamera = async () => {
    try {
      setStatus('Starting camera...')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setStatus('📷 Camera ready - Day 3 Enhanced MediaPipe detection active!')
      }
    } catch (error) {
      setStatus('Camera access denied. Please allow camera permissions.')
      console.error('Camera error:', error)
    }
  }

  // Stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setStatus('Camera stopped')
    setProofResult(null)
  }

  // Day 3 Enhanced: Single-call face verification with liveness detection and ZK proof
  const captureAndProve = async () => {
    if (!videoRef.current || !canvasRef.current || !isConnected) return

    setIsProcessing(true)
    setStatus('🔍 Day 3 Enhanced: Analyzing face with MediaPipe liveness detection...')

    try {
      const canvas = canvasRef.current
      const video = videoRef.current
      const ctx = canvas.getContext('2d')
      
      if (!ctx) return

      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Mirror the canvas context to match the flipped video
      ctx.save()
      ctx.scale(-1, 1)
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
      ctx.restore()

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) return

        const formData = new FormData()
        formData.append('image', blob, 'face_capture.jpg')
        formData.append('user_id', `user_${Date.now()}`)
        formData.append('wallet_address', address!)

        try {
          setStatus('🧠 MediaPipe processing: Face mesh + liveness detection...')
          
          // Day 3 Enhanced: Single call to /prove_face endpoint
          const response = await fetch('http://localhost:8001/prove_face', {
            method: 'POST',
            body: formData
          })

          if (response.ok) {
            const result: Day3ProofResult = await response.json()
            
            if (result.success) {
              setProofResult(result)
              setStatus(`✅ Day 3 Success: ${result.face_metrics.landmarks_count} landmarks detected, liveness verified!`)
            } else {
              setStatus('❌ Face verification failed - please ensure proper lighting and face visibility')
            }
          } else {
            const errorData = await response.json()
            if (errorData.error?.includes('liveness')) {
              setStatus('👁️ Liveness check failed - please look directly at camera with eyes open')
            } else if (errorData.error?.includes('No face detected')) {
              setStatus('👤 No face detected - please position your face in the center of the camera')
            } else {
              setStatus(`❌ Verification failed: ${errorData.error || 'Unknown error'}`)
            }
          }
        } catch (error) {
          setStatus('🔌 Connection error - please ensure Day 3 backend is running on port 8001')
          console.error('API Error:', error)
        }
      }, 'image/jpeg', 0.9)

    } catch (error) {
      setStatus('📷 Error capturing face')
      console.error('Capture error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  if (!isConnected) {
    return (
      <div className="text-center text-gray-400 mt-8">
        <p>Please connect your wallet to use Day 3 Enhanced Face Verification</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6 bg-gray-900 rounded-lg">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        🚀 Day 3 Enhanced: ZK Face Verification with Liveness Detection
      </h2>
      <p className="text-center text-gray-400 mb-6">
        MediaPipe Face Mesh • Eye Blink Detection • Real ZK Proofs • 478 Landmarks
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Section */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 bg-black rounded-lg object-cover border-2 border-blue-500"
              style={{ transform: 'scaleX(-1)' }}
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {stream && (
              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                📹 Day 3 Live
              </div>
            )}
            
            {stream && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                🪞 Natural View
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            {!stream ? (
              <button
                onClick={startCamera}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                📷 Start Day 3 Camera
              </button>
            ) : (
              <>
                <button
                  onClick={captureAndProve}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold"
                >
                  {isProcessing ? '🔄 Processing...' : '🔒 Verify & Prove'}
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  🛑 Stop
                </button>
              </>
            )}
          </div>
        </div>

        {/* Status Section */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 bg-gray-800 rounded-lg border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">🔍 Day 3 Status</h3>
            <p className="text-gray-300 text-sm">{status}</p>
          </div>

          {proofResult && (
            <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
              <h3 className="text-lg font-semibold text-green-400 mb-3">🧠 MediaPipe Analysis</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Liveness Detected:</span>
                  <span className="text-green-400">✅ {proofResult.liveness_detected ? 'YES' : 'NO'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Confidence:</span>
                  <span className="text-blue-400">{(proofResult.liveness_confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Landmarks:</span>
                  <span className="text-purple-400">{proofResult.face_metrics.landmarks_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Eye Ratio:</span>
                  <span className="text-yellow-400">{proofResult.face_metrics.eye_aspect_ratio.toFixed(3)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ZK Proof Results Section */}
        <div className="lg:col-span-1 space-y-4">
          {proofResult && (
            <>
              <div className="p-4 bg-purple-900/20 border border-purple-500/50 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-400 mb-3">🔐 ZK Proof Generated</h3>
                <div className="space-y-2 text-sm">
                  <div className="text-gray-300">
                    Hash: <code className="text-cyan-400 text-xs break-all">{proofResult.embedding_hash.substring(0, 16)}...</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Nullifier:</span>
                    <span className="text-orange-400">{proofResult.nullifier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Protocol:</span>
                    <span className="text-red-400">{proofResult.protocol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Public Signals:</span>
                    <span className="text-green-400">{proofResult.publicSignals.length}</span>
                  </div>
                  <div className="text-gray-300">
                    Timestamp: <span className="text-blue-400">{new Date(proofResult.timestamp * 1000).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="text-md font-semibold text-white mb-2">🎯 Day 3 Achievements</h4>
                <div className="space-y-1 text-xs text-gray-300">
                  <div>✅ Real MediaPipe face mesh detection</div>
                  <div>✅ Eye blink liveness verification</div>
                  <div>✅ 478 facial landmark analysis</div>
                  <div>✅ SHA256 embedding hash generation</div>
                  <div>✅ Groth16 ZK proof creation</div>
                  <div>✅ Complete privacy-preserving workflow</div>
                  <div>✅ Natural camera view (mirror-corrected)</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
