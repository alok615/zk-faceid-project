'use client'

import { useState, useRef, useEffect } from 'react'
import * as faceapi from 'face-api.js'

export default function FaceCapture() {
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [proofResult, setProofResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [liveDetection, setLiveDetection] = useState<any>(null)
  const [modelError, setModelError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadModels()
    return () => {
      stopCamera()
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
      }
    }
  }, [])

  const loadModels = async () => {
    try {
      console.log('📄 Loading face-api.js models from CDN...')
      setModelError(null)

      // Use CDN models as fallback since local models failed
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model'
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ])

      setIsModelLoaded(true)
      console.log('✅ All models loaded successfully from CDN!')
    } catch (err) {
      console.error('❌ Error loading face-api.js models:', err)
      setModelError(`Failed to load AI models: ${err}`)
      
      // Try local models as fallback
      try {
        console.log('🔄 Trying local models as fallback...')
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ])
        setIsModelLoaded(true)
        setModelError(null)
        console.log('✅ Local models loaded successfully!')
      } catch (localErr) {
        console.error('❌ Local models also failed:', localErr)
        setError('Failed to load AI models from both CDN and local sources.')
      }
    }
  }

  const startCamera = async () => {
    try {
      setError(null)
      console.log('📷 Starting camera...')

      if (!isModelLoaded) {
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

        videoRef.current.addEventListener('loadedmetadata', () => {
          console.log('🎬 Video metadata loaded, starting detection...')
          startDetection()
        })
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

  const startDetection = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const detectFaces = async () => {
      if (!isCameraActive) return

      try {
        // Use TinyFaceDetector instead of SsdMobilenetv1 (more stable)
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
            inputSize: 416,
            scoreThreshold: 0.5
          }))
          .withFaceLandmarks()
          .withFaceExpressions()

        console.log(`🔍 Tiny Face Detector found ${detections.length} faces`)

        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)

          if (detections.length > 0) {
            const detection = detections[0]
            console.log(`👤 Face detected! Confidence: ${(detection.detection.score * 100).toFixed(1)}%`)

            // Draw face detection box
            ctx.strokeStyle = '#10B981'
            ctx.lineWidth = 3
            ctx.strokeRect(
              detection.detection.box.x,
              detection.detection.box.y,
              detection.detection.box.width,
              detection.detection.box.height
            )

            // Draw landmarks
            const landmarks = detection.landmarks
            ctx.fillStyle = '#F59E0B'
            landmarks.positions.forEach((point) => {
              ctx.beginPath()
              ctx.arc(point.x, point.y, 1.5, 0, 2 * Math.PI)
              ctx.fill()
            })

            const detectionData = {
              confidence: detection.detection.score,
              expressions: detection.expressions,
              landmarks: landmarks.positions.length,
              detector: 'Tiny Face Detector'
            }

            setLiveDetection(detectionData)

          } else {
            if (liveDetection) {
              setLiveDetection(null)
            }
          }
        }
      } catch (err) {
        console.error('❌ Face detection error:', err)
        // Don't spam errors, just continue
      }
    }

    // Use interval instead of recursive setTimeout (prevents hanging)
    detectionIntervalRef.current = setInterval(detectFaces, 500) // Slower: 2 FPS instead of 10 FPS
  }

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
      {modelError && (
        <div className="p-4 bg-yellow-900/50 border border-yellow-500/50 rounded-lg">
          <p className="text-yellow-200">⚠️ {modelError}</p>
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
            style={{ display: isCameraActive ? 'block' : 'none' }}
          />

          {!isCameraActive && (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="text-6xl mb-4">📷</div>
                <p className="text-lg">Real-Time Face Verification</p>
                <p className="text-sm">Tiny Face Detector + CDN Models</p>
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
              <div className="text-green-400">Ready for ZK Proof!</div>
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
              {isCapturing ? '📄 Processing...' : '🔒 Generate ZK Proof'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
          <p className="text-red-200">❌ {error}</p>
        </div>
      )}

      {proofResult && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-900/30 rounded-lg">
            <h4 className="text-lg font-semibold text-blue-400 mb-2">🧠 Browser AI Detection</h4>
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
              <h4 className="text-lg font-semibold text-green-400 mb-2">✅ ZK Proof Generated</h4>
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
