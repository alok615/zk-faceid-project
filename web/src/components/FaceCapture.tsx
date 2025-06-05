'use client'

import { useState, useRef, useEffect } from 'react'
import { useAccount } from 'wagmi'

interface FaceEmbedding {
  landmarks: number[][]
  timestamp: string
  confidence: number
}

export function FaceCapture() {
  const { address, isConnected } = useAccount()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [embedding, setEmbedding] = useState<FaceEmbedding | null>(null)
  const [status, setStatus] = useState<string>('Ready to capture face')
  const [isProcessing, setIsProcessing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

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
        setStatus('Camera ready - Click capture when your face is visible')
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
  }

  // Capture face and send to MediaPipe backend
  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isConnected) return

    setIsProcessing(true)
    setStatus('Processing face embedding...')

    try {
      const canvas = canvasRef.current
      const video = videoRef.current
      const ctx = canvas.getContext('2d')
      
      if (!ctx) return

      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) return

        const formData = new FormData()
        formData.append('image', blob, 'face_capture.jpg')
        formData.append('wallet_address', address!)

        try {
          // Send to your zk-FaceID agent running on port 8001
          const response = await fetch('http://localhost:8001/capture-face', {
            method: 'POST',
            body: formData
          })

          if (response.ok) {
            const result = await response.json()
            setEmbedding(result.embedding)
            setStatus(`Face captured successfully! Confidence: ${result.confidence?.toFixed(2) || 'N/A'}`)
          } else {
            const error = await response.text()
            setStatus(`Capture failed: ${error}`)
          }
        } catch (error) {
          setStatus('Error connecting to face detection service')
          console.error('API Error:', error)
        }
      }, 'image/jpeg', 0.8)

    } catch (error) {
      setStatus('Error capturing face')
      console.error('Capture error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Generate ZK proof
  const generateProof = async () => {
    if (!embedding || !address) return

    setIsProcessing(true)
    setStatus('Generating ZK proof...')

    try {
      const response = await fetch('http://localhost:8001/generate-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embedding: embedding,
          wallet_address: address
        })
      })

      if (response.ok) {
        const result = await response.json()
        setStatus('ZK proof generated successfully!')
        console.log('Proof result:', result)
      } else {
        setStatus('Failed to generate proof')
      }
    } catch (error) {
      setStatus('Error generating proof')
      console.error('Proof error:', error)
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
        <p>Please connect your wallet to use face verification</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        ZK Face Verification
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Camera Section */}
        <div className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 bg-black rounded-lg object-cover"
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
          </div>
          
          <div className="flex gap-2">
            {!stream ? (
              <button
                onClick={startCamera}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Start Camera
              </button>
            ) : (
              <>
                <button
                  onClick={captureFrame}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? 'Processing...' : 'Capture Face'}
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Stop
                </button>
              </>
            )}
          </div>
        </div>

        {/* Status and Results Section */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Status</h3>
            <p className="text-gray-300">{status}</p>
          </div>

          {embedding && (
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Face Embedding</h3>
              <p className="text-sm text-gray-300 mb-2">
                Landmarks: {embedding.landmarks?.length || 0} points
              </p>
              <p className="text-sm text-gray-300 mb-4">
                Captured: {embedding.timestamp}
              </p>
              <button
                onClick={generateProof}
                disabled={isProcessing}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {isProcessing ? 'Generating...' : 'Generate ZK Proof'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
