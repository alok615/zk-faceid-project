'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

export default function FaceCapture() {
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [proofResult, setProofResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [liveDetection, setLiveDetection] = useState<any>(null)
  const [faceapi, setFaceapi] = useState<any>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Dynamic import of face-api.js to avoid SSR issues
  useEffect(() => {
    const loadFaceAPI = async () => {
      try {
        console.log('📦 Dynamically importing face-api.js...')
        const faceapiModule = await import('face-api.js')
        setFaceapi(faceapiModule)
        console.log('✅ face-api.js imported successfully!')
        loadModels(faceapiModule)
      } catch (err) {
        console.error('❌ Failed to import face-api.js:', err)
        setError('Failed to load face detection library')
      }
    }

    loadFaceAPI()

    return () => {
      stopCamera()
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
      }
    }
  }, [])

  const loadModels = async (faceapiModule: any) => {
    try {
      console.log('📄 Loading face-api.js models...')
      
      // Use jsdelivr CDN which is more reliable
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights'
      
      await Promise.all([
        faceapiModule.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapiModule.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapiModule.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ])

      setIsModelLoaded(true)
      console.log('✅ All models loaded successfully!')
    } catch (err) {
      console.error('❌ Model loading failed:', err)
      setError(`Failed to load AI models: ${err}`)
    }
  }

  const startCamera = async () => {
    try {
      setError(null)
      console.log('📷 Starting camera...')

      if (!isModelLoaded || !faceapi) {
        setError('AI models still loading. Please wait...')
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCameraActive(true)
        console.log('✅ Camera started successfully!')

        // Wait for video to be ready before starting detection
        videoRef.current.onloadedmetadata = () => {
          console.log('🎬 Video metadata loaded')
          // Add small delay to ensure video is fully ready
          setTimeout(() => {
            console.log('🔍 Starting face detection...')
            startDetection()
          }, 1000)
        }
      }
    } catch (err) {
      console.error('❌ Camera access error:', err)
      setError('Camera access denied. Please allow camera permissions.')
    }
  }

  const stopCamera = () => {
    console.log('🛑 Stopping camera...')
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }
    setIsCameraActive(false)
    setLiveDetection(null)
    console.log('✅ Camera stopped successfully!')
  }

  const startDetection = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !faceapi) {
      console.log('❌ Detection failed: missing refs or faceapi')
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current

    // Ensure video dimensions are set
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    console.log(`📐 Canvas size: ${canvas.width}x${canvas.height}`)

    const detectFaces = async () => {
      if (!isCameraActive || !video || !faceapi) return

      try {
        console.log('🔍 Running face detection...')
        
        // Simplified detection options for better compatibility
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
            inputSize: 320, // Smaller for better performance
            scoreThreshold: 0.3 // Lower threshold for easier detection
          }))
          .withFaceLandmarks()

        console.log(`👥 Detected ${detections.length} faces`)

        const ctx = canvas.getContext('2d')
        if (ctx) {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height)

          if (detections.length > 0) {
            const detection = detections[0]
            const confidence = detection.detection.score
            
            console.log(`👤 Face detected! Confidence: ${(confidence * 100).toFixed(1)}%`)

            // Draw face detection box
            const box = detection.detection.box
            ctx.strokeStyle = '#10B981'
            ctx.lineWidth = 3
            ctx.strokeRect(box.x, box.y, box.width, box.height)

            // Draw confidence text
            ctx.fillStyle = '#10B981'
            ctx.font = '16px Arial'
            ctx.fillText(`${(confidence * 100).toFixed(1)}%`, box.x, box.y - 10)

            // Draw landmarks
            if (detection.landmarks) {
              ctx.fillStyle = '#F59E0B'
              detection.landmarks.positions.forEach((point) => {
                ctx.beginPath()
                ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI)
                ctx.fill()
              })
            }

            const detectionData = {
              confidence: confidence,
              landmarks: detection.landmarks?.positions?.length || 0,
              detector: 'Tiny Face Detector',
              box: box
            }

            setLiveDetection(detectionData)

          } else {
            setLiveDetection(null)
          }
        }
      } catch (err) {
        console.error('❌ Face detection error:', err)
        // Continue trying
      }
    }

    // Start detection with longer interval to prevent hanging
    detectionIntervalRef.current = setInterval(detectFaces, 1000) // 1 FPS
    
    // Run first detection immediately
    detectFaces()
  }, [faceapi, isCameraActive])

  const captureAndProve = async () => {
    if (!videoRef.current || !isCameraActive) {
      setError('Camera not active. Please start camera first.')
      return
    }

    if (!liveDetection) {
      setError('No face detected. Please position your face in the camera.')
      return
    }

    setIsCapturing(true)
    setError(null)
    setProofResult(null)

    try {
      const canvas = document.createElement('canvas')
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9)
        })

        const formData = new FormData()
        formData.append('image', blob, 'face-capture.jpg')
        formData.append('user_id', `user_${Date.now()}`)
        formData.append('wallet_address', '0x0000000000000000000000000000000000000000')

        let apiResponse
        try {
          apiResponse = await fetch('http://127.0.0.1:8001/prove_face', {
            method: 'POST',
            body: formData,
          })
        } catch (err) {
          apiResponse = await fetch('http://localhost:8001/prove_face', {
            method: 'POST',
            body: formData,
          })
        }

        if (!apiResponse.ok) {
          const errorData = await apiResponse.json()
          throw new Error(errorData.detail || `HTTP ${apiResponse.status}`)
        }

        const result = await apiResponse.json()
        setProofResult(result)

        if (!result.success) {
          setError(`Proof generation failed: ${result.liveness_detected ? 'Unknown error' : 'Server-side liveness detection failed'}`)
        }
      }
    } catch (err) {
      console.error('❌ Capture and prove error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate proof')
    } finally {
      setIsCapturing(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
          <p className="text-red-200">❌ {error}</p>
        </div>
      )}

      <div className="relative">
        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ display: isCameraActive ? 'block' : 'none', transform: 'scaleX(-1)' }}
          />

          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ display: isCameraActive ? 'block' : 'none', transform: 'scaleX(-1)' }}
          />

          {!isCameraActive && (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="text-6xl mb-4">🛡️</div>
                <p className="text-lg font-bold text-blue-400">Sashakt Face Verification</p>
                <p className="text-sm">Advanced Zero-Knowledge Identity System</p>
                <div className="mt-4 text-xs text-gray-500">
                  Status: {isModelLoaded ? 'Models loaded ✅' : 'Loading models...'}
                </div>
              </div>
            </div>
          )}
        </div>

        {liveDetection && (
          <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded-lg text-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Face Detected ✅</span>
            </div>
            <div className="space-y-1 text-xs">
              <div>Confidence: {(liveDetection.confidence * 100).toFixed(1)}%</div>
              <div>Landmarks: {liveDetection.landmarks}</div>
              <div>Detector: {liveDetection.detector}</div>
              <div className="text-green-400">Ready for Sashakt Proof!</div>
            </div>
          </div>
        )}

        {isCameraActive && !liveDetection && (
          <div className="absolute top-4 left-4 bg-yellow-900/70 text-yellow-200 p-3 rounded-lg text-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>Scanning for faces...</span>
            </div>
            <div className="text-xs">
              Position your face in the center
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {!isCameraActive ? (
          <button
            onClick={startCamera}
            disabled={!isModelLoaded}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isModelLoaded ? '📄 Loading Models...' : '📷 Start Camera'}
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={stopCamera}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              🛑 Stop Camera
            </button>
            <button
              onClick={captureAndProve}
              disabled={!liveDetection || isCapturing}
              className={`px-6 py-3 rounded-lg transition-colors ${
                !liveDetection || isCapturing
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isCapturing ? '🔄 Processing...' : '🛡️ Generate Sashakt Proof'}
            </button>
          </div>
        )}
      </div>

      {proofResult && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-900/30 rounded-lg">
            <h4 className="text-lg font-semibold text-blue-400 mb-2">🧠 Sashakt AI Detection</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-300">
                Face Detected: <span className="text-green-400">✅ YES</span>
              </div>
              <div className="text-gray-300">
                Landmarks: <span className="text-cyan-400">{liveDetection?.landmarks || 'N/A'}</span>
              </div>
              <div className="text-gray-300">
                Confidence: <span className="text-purple-400">{liveDetection ? (liveDetection.confidence * 100).toFixed(1) + '%' : 'N/A'}</span>
              </div>
              <div className="text-gray-300">
                Detector: <span className="text-yellow-400">{liveDetection?.detector || 'N/A'}</span>
              </div>
            </div>
          </div>

          {proofResult.success && (
            <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
              <h4 className="text-lg font-semibold text-green-400 mb-2">✅ Sashakt Proof Generated</h4>
              <div className="space-y-2 text-sm">
                <div className="text-gray-300">
                  Hash: <code className="text-cyan-400 text-xs">{proofResult.embedding_hash?.substring(0, 16)}...</code>
                </div>
                <div className="text-gray-300">
                  Public Signals: <span className="text-purple-400">{proofResult.publicSignals?.length} signals</span>
                </div>
                <div className="text-gray-300">
                  Timestamp: <span className="text-blue-400">{new Date(proofResult.timestamp * 1000).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
